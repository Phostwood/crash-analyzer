/**
 * Phostwood's QLP — Vortex Extension
 *
 * Port of the MO2 Python plugin (v2.2.0) to Vortex plain JavaScript.
 *
 * Features:
 *   - fs.watch() auto-trigger: detects new crash logs instantly while Vortex is open
 *   - Toolbar button for manual triggering
 *   - Full settings section in Vortex's Settings tab
 *   - Gzip pre-check before upload
 *   - Worker upload to Sovnkrasch with clipboard fallback on failure
 *   - Local-only mode (clipboard instead of upload)
 *   - Four-button auto-trigger prompt (Analyze Now / Always Analyze / Not Now / Never Ask Again)
 *   - Copy Link button on success dialog
 *
 * Authors: Phostwood (Vortex port), Kyler45 (original MO2 concept)
 * Version: 2.2.0
 */

'use strict';

const fs            = require('fs');
const path          = require('path');
const zlib          = require('zlib');
const { execSync }  = require('child_process');
const { clipboard, shell } = require('electron');

// ─────────────────────────────────────────────────────────────
// Constants (kept identical to MO2 plugin where possible)
// ─────────────────────────────────────────────────────────────

const PLUGIN_ID    = 'phostwood-qlp';
const LOG_PREFIX   = '[PhostwoodQLP]';

const CLIENT_ANTI_INDICATORS = [
    'Fallout4.exe',
    'Cyberpunk2077.exe',
    'UnityPlayer.dll',
    'RobloxPlayer.exe',
    'chrome.exe',
    'python.exe',
];

// 1.9 MB client threshold — conservative margin below the 2 MB worker hard limit
const MAX_COMPRESSED_SIZE = Math.floor(1.9 * 1024 * 1024);
const UPLOAD_TIMEOUT_MS   = 30000;
const SUPPORTED_GAME_IDS  = ['skyrimse', 'skyrimvr'];

// Debounce for fs.watch() — prevents double-firing on some systems
// (Windows sometimes fires two events for a single file write)
const WATCH_DEBOUNCE_MS = 2000;

// ─────────────────────────────────────────────────────────────
// Default settings (mirrors MO2 plugin settings() exactly)
// ─────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
    enabled:                 true,
    analyzer_url:            'https://phostwood.github.io/crash-analyzer/skyrim.html',
    worker_url:              'https://skyrim-crashlog-worker.phostwood.workers.dev/upload',
    local_only_mode:         false,
    crash_log_dir:           '',
    crash_log_globs:         'crash-*.log, Crash_*.txt',
    on_game_exit_behavior:   'prompt',   // 'prompt' | 'auto' | 'disabled'
    last_processed_log_time: '',         // ISO 8601 or ''
};

// ─────────────────────────────────────────────────────────────
// Settings helpers
// ─────────────────────────────────────────────────────────────

function getSetting(api, key) {
    // Used outside React components (e.g. checkForNewCrashLogs, display())
    const state = api.getState();
    const slice = state && state.settings && state.settings[PLUGIN_ID];
    const val = slice && slice[key];
    return val !== undefined ? val : DEFAULT_SETTINGS[key];
}

function setSetting(api, key, value) {
    api.store.dispatch({
        type: 'SET_QLP_SETTING',
        payload: { key, value },
    });
}

// ─────────────────────────────────────────────────────────────
// My Documents path resolution
// Mirrors MO2's ctypes SHGetFolderPathW via PowerShell
// ─────────────────────────────────────────────────────────────

function getMyDocuments() {
    try {
        return execSync(
            'powershell -Command "[Environment]::GetFolderPath(\'MyDocuments\')"',
            { encoding: 'utf8' }
        ).trim();
    } catch (e) {
        log('warn', LOG_PREFIX, `Could not resolve My Documents: ${e}`);
        return null;
    }
}

// ─────────────────────────────────────────────────────────────
// Crash log discovery
// Mirrors MO2's _find_latest_crash_log() exactly
// ─────────────────────────────────────────────────────────────

function findLatestCrashLog(api) {
    // ── Resolve directory ──────────────────────────────────────
    let crashLogDir = getSetting(api, 'crash_log_dir').trim();

    if (!crashLogDir) {
        const myDocs = getMyDocuments();
        if (!myDocs) return null;
        crashLogDir = path.join(myDocs, 'My Games', 'Skyrim Special Edition', 'SKSE');
    }

    log('info', LOG_PREFIX, `Searching for crash logs in: ${crashLogDir}`);

    if (!fs.existsSync(crashLogDir)) {
        log('info', LOG_PREFIX, `Crash log directory does not exist: ${crashLogDir}`);
        return null;
    }

    // ── Resolve glob patterns ──────────────────────────────────
    const globsSetting = getSetting(api, 'crash_log_globs').trim();
    let patterns = globsSetting
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);

    if (patterns.length === 0) {
        patterns = ['crash-*.log', 'Crash_*.txt'];
        log('info', LOG_PREFIX, 'crash_log_globs was empty; using default patterns.');
    }

    // ── Collect all candidates across all patterns ─────────────
    let dirEntries;
    try {
        dirEntries = fs.readdirSync(crashLogDir);
    } catch (e) {
        log('warn', LOG_PREFIX, `Could not read crash log directory: ${e}`);
        return null;
    }

    let candidates = [];
    for (const pattern of patterns) {
        const regexStr = '^' + pattern
            .replace(/[.+^${}()|[\]\\]/g, '\\$&')
            .replace(/\*/g, '.*') + '$';
        const regex = new RegExp(regexStr, 'i');
        const matched = dirEntries
            .filter(name => regex.test(name))
            .map(name => path.join(crashLogDir, name));
        log('info', LOG_PREFIX, `Pattern '${pattern}' matched ${matched.length} file(s).`);
        candidates = candidates.concat(matched);
    }

    if (candidates.length === 0) {
        log('info', LOG_PREFIX, `No crash logs found in: ${crashLogDir}`);
        return null;
    }

    // Pick the most recently modified file across all patterns
    const latest = candidates.reduce((best, cur) => {
        const bestMtime = fs.statSync(best).mtimeMs;
        const curMtime  = fs.statSync(cur).mtimeMs;
        return curMtime > bestMtime ? cur : best;
    });

    log('info', LOG_PREFIX, `Most recent crash log: ${latest}`);
    return latest;
}

// ─────────────────────────────────────────────────────────────
// Dialog helpers
// ─────────────────────────────────────────────────────────────

async function showMessage(api, title, message) {
    await api.showDialog('info', title, { message }, [{ label: 'OK' }]);
}

async function showMessageCopyLink(api, title, message, link) {
    const result = await api.showDialog('info', title, { message }, [
        { label: 'Copy Link' },
        { label: 'OK' },
    ]);
    if (result.action === 'Copy Link') {
        clipboard.writeText(link);
    }
}

// ─────────────────────────────────────────────────────────────
// Browser opener
// ─────────────────────────────────────────────────────────────

function openInBrowser(url) {
    log('info', LOG_PREFIX, `Opening URL: ${url}`);
    shell.openExternal(url);
}

// ─────────────────────────────────────────────────────────────
// HTTP error handler
// Mirrors MO2's _handle_http_error()
// ─────────────────────────────────────────────────────────────

async function handleHttpError(api, status, body, crashLogPath) {
    log('info', LOG_PREFIX, `HTTP error ${status}. Body: ${body.slice(0, 200)}`);

    if (status === 503) {
        try {
            const data = JSON.parse(body);
            if (data && data.error === 'storage_full') {
                await showMessage(api, 'Storage Full',
                    'The crash-log server is temporarily full. ' +
                    'Try again later, or share your log manually via ' +
                    '0x0.st or Google Drive.'
                );
                return;
            }
        } catch (e) { /* not JSON */ }

        const fileInfo = crashLogPath ? `\n\nPath: ${crashLogPath}` : '';
        await showMessage(api, 'Upload Rejected',
            'The server rejected this file. It doesn\'t look like a valid ' +
            `Skyrim SE/AE crash log.${fileInfo}\n\n` +
            'Try using 0x0.st or Google Drive to share it manually.'
        );
    } else if (status === 403) {
        await showMessage(api, 'Upload Refused',
            'The server refused the upload (403 Forbidden). ' +
            'This may be a Cloudflare WAF or Access rule blocking the request. ' +
            'Check the Worker\'s Security settings in the Cloudflare dashboard.'
        );
    } else if (status === 429) {
        await showMessage(api, 'Too Many Requests',
            'You\'re sending crash logs too quickly. Please wait a minute and try again.'
        );
    } else if (status === 500) {
        await showMessage(api, 'Server Error',
            'The server encountered an error. Please try again later.'
        );
    } else {
        await showMessage(api, 'Upload Failed',
            `Upload failed with status ${status}. Check your connection and try again.`
        );
    }
}

// ─────────────────────────────────────────────────────────────
// Worker upload
// Mirrors MO2's _upload_to_worker()
// ─────────────────────────────────────────────────────────────

async function uploadToWorker(api, workerUrl, text, crashLogPath) {
    const body = Buffer.from(text, 'utf8');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

    try {
        const resp = await fetch(workerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'X-MO2-Plugin': 'SkyrimCrashUploader',
                'User-Agent':   'MO2-CrashLogUploader/2.0.0',
            },
            body,
            signal: controller.signal,
        });

        clearTimeout(timer);
        const respText = await resp.text();

        if (resp.status === 200) {
            try {
                const data = JSON.parse(respText);
                const uuid = (data && data.uuid ? data.uuid : '').trim();
                if (uuid) {
                    log('info', LOG_PREFIX, `Upload succeeded. UUID: ${uuid}`);
                    return uuid;
                }
            } catch (e) { /* not JSON */ }

            await showMessage(api, 'Upload Error',
                'The server returned an unexpected response. Please try again later.'
            );
            return null;
        }

        await handleHttpError(api, resp.status, respText, crashLogPath);
        return null;

    } catch (e) {
        clearTimeout(timer);
        if (e && e.name === 'AbortError') {
            log('info', LOG_PREFIX, 'Upload timed out.');
            await showMessage(api, 'Upload Timed Out',
                'The upload timed out. Check your connection and try again.'
            );
        } else {
            log('warn', LOG_PREFIX, `Upload failed: ${e}`);
            await showMessage(api, 'Upload Failed',
                'Upload failed. Check your internet connection and try again.'
            );
        }
        return null;
    }
}

// ─────────────────────────────────────────────────────────────
// Gzip helper (promisified)
// ─────────────────────────────────────────────────────────────

function gzipAsync(buffer) {
    return new Promise((resolve, reject) => {
        zlib.gzip(buffer, { level: 6 }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

// ─────────────────────────────────────────────────────────────
// Main display() flow
// Mirrors MO2's display() exactly
// ─────────────────────────────────────────────────────────────

async function display(api) {
    // 1. Check that the active game is Skyrim SE/AE
    const state     = api.getState();
    const profileId = (state.settings && state.settings.profiles && state.settings.profiles.activeProfileId) || (state.settings && state.settings.gameMode && state.settings.gameMode.lastActiveProfile);
    const profile   = profileId && state.persistent && state.persistent.profiles && state.persistent.profiles[profileId];
    const gameId    = profile ? profile.gameId : null;

    if (!SUPPORTED_GAME_IDS.includes(gameId)) {
        await showMessage(api, 'Unsupported Game',
            'Only Skyrim Special Edition / Anniversary Edition / VR is supported by this extension.'
        );
        return;
    }
    // 2. Check enabled
    if (!getSetting(api, 'enabled')) return;

    // 3. Find the most recent crash log
    const crashLogPath = findLatestCrashLog(api);
    if (!crashLogPath) {
        await showMessage(api, 'No Crash Log Found',
            'Could not find a valid Skyrim SE/AE crash log.\n\n' +
            'Possible reasons:\n' +
            '• No crashes have occurred yet\n' +
            '• A supported crash logger (CrashLoggerSSE, NetScriptFramework, ' +
            'or Trainwreck) is not installed\n' +
            '• The game has not been run through Vortex'
        );
        return;
    }

    // 4. Read file as bytes, then decode
    let rawBytes, text;
    try {
        rawBytes = fs.readFileSync(crashLogPath);
        text = rawBytes.toString('utf8');
    } catch (e) {
        log('warn', LOG_PREFIX, `Failed to read crash log: ${e}`);
        await showMessage(api, 'Read Error', `Failed to read crash log:\n${e}`);
        return;
    }

    // 5. Lightweight client-side validation
    if (rawBytes.length === 0) {
        await showMessage(api, 'Empty File',
            'The most recent crash log is empty. It may still be written by the game.'
        );
        return;
    }

    for (const indicator of CLIENT_ANTI_INDICATORS) {
        if (text.includes(indicator)) {
            await showMessage(api, 'Not a Skyrim Crash Log',
                'This file doesn\'t appear to be a Skyrim SE/AE crash log.\n\n' +
                'Could not find a valid Skyrim SE/AE crash log.\n' +
                'Possible reasons: no crash logs yet, unsupported game, ' +
                'or crash logger not installed.'
            );
            return;
        }
    }

    // Stamp last_processed_log_time now — validation passed, we are committing
    // to processing this log regardless of what happens next (local-only,
    // upload success, upload failure/fallback). This ensures the Settings tab
    // always reflects the most recently touched log.
    try {
        const logMtime = fs.statSync(crashLogPath).mtimeMs;
        const logTimeIso = new Date(logMtime).toISOString().replace(/\.\d{3}Z$/, '');
        updateLastProcessed(api, logTimeIso);
        log('info', LOG_PREFIX, `Stamped last_processed_log_time: ${logTimeIso}`);
    } catch (e) {
        log('warn', LOG_PREFIX, `Could not stamp last_processed_log_time: ${e}`);
    }

    const localOnly = getSetting(api, 'local_only_mode');

    if (localOnly) {
        // 6 (local). Copy raw crash log text to clipboard and open bare analyzer URL.
        log('info', LOG_PREFIX, 'Local-only mode: skipping upload, copying text to clipboard.');
        const analyzerUrl = getSetting(api, 'analyzer_url');
        openInBrowser(analyzerUrl);
        clipboard.writeText(text);
        await showMessage(api, 'Crash Log Copied',
            'The Crash Log Analyzer has been opened in your browser.\n\n' +
            'Your crash log text has been copied to your clipboard — ' +
            'just paste it into the analyzer and click "Analyze" to see your results.\n\n' +
            'Tip: To generate a shareable link instead, set ' +
            '"Local Only Mode" to off in this extension\'s settings.'
        );
        return;
    }

    // 6. Gzip pre-check — estimate compressed size before uploading
    let compressedSize = 0;
    try {
        const compressed = await gzipAsync(rawBytes);
        compressedSize = compressed.length;
    } catch (e) {
        log('warn', LOG_PREFIX, `Gzip pre-check failed: ${e}`);
    }

    log('info', LOG_PREFIX,
        `Raw size: ${rawBytes.length.toLocaleString()} bytes | ` +
        `Compressed estimate: ${compressedSize.toLocaleString()} bytes`
    );

    if (compressedSize > MAX_COMPRESSED_SIZE) {
        await showMessage(api, 'File Too Large',
            `This crash log is too large to upload even after compression ` +
            `(${(compressedSize / 1024 / 1024).toFixed(1)} MB compressed, limit is 2 MB).\n\n` +
            'Try sharing it manually via 0x0.st or Google Drive.'
        );
        return;
    }

    // 7. Upload to Worker
    const workerUrl = getSetting(api, 'worker_url');
    const uuid = await uploadToWorker(api, workerUrl, text, crashLogPath);

    if (!uuid) {
        // Upload failed — fall back to clipboard
        log('info', LOG_PREFIX, 'Upload failed; falling back to clipboard copy.');
        const analyzerUrl = getSetting(api, 'analyzer_url');
        openInBrowser(analyzerUrl);
        clipboard.writeText(text);
        await showMessage(api, 'Crash Log Copied as Fallback',
            'As a fallback, your crash log has been copied to your clipboard ' +
            'and the Crash Log Analyzer has been opened in your browser.\n\n' +
            'Just paste your crash log into the analyzer and click "Analyze" to see your results.'
        );
        return;
    }

    // 8. Build full analyzer URL and open in browser
    const analyzerUrl = getSetting(api, 'analyzer_url');
    const fullUrl = `${analyzerUrl}?UUID=${uuid}`;
    openInBrowser(fullUrl);

    // 9. Success dialog with Copy Link button
    await showMessageCopyLink(api, 'Upload Successful',
        `Crash log uploaded successfully.\n\n` +
        `The Crash Log Analyzer has been opened in your browser.\n\n` +
        `URL:\n${fullUrl}`,
        fullUrl
    );

    // 10. Update last processed timestamp so this log isn't re-prompted
    try {
        const logMtime = fs.statSync(crashLogPath).mtimeMs;
        const logTimeIso = new Date(logMtime).toISOString().replace(/\.\d{3}Z$/, '');
        updateLastProcessed(api, logTimeIso);
    } catch (e) {
        log('warn', LOG_PREFIX, `Could not update last processed timestamp: ${e}`);
    }
}

// ─────────────────────────────────────────────────────────────
// Last-processed timestamp helpers
// Mirrors MO2's _update_last_processed()
// ─────────────────────────────────────────────────────────────

function updateLastProcessed(api, logTimeIso) {
    setSetting(api, 'last_processed_log_time', logTimeIso);
}

// ─────────────────────────────────────────────────────────────
// Auto-trigger prompt
// Mirrors MO2's _show_auto_trigger_prompt()
// Four buttons: Analyze Now · Always Analyze · Not Now · Never Ask Again
// ─────────────────────────────────────────────────────────────

async function showAutoTriggerPrompt(api, crashLogPath, logTimeIso) {
    const localOnly = getSetting(api, 'local_only_mode');
    const actionDescription = localOnly
        ? 'copy it to your clipboard and open the Crash Log Analyzer'
        : 'upload it to Sovnkrasch and open the Crash Log Analyzer';

    const basename = path.basename(crashLogPath);

    const result = await api.showDialog('question',
        "Phostwood's QLP — Analyze Crash Log",
        {
            message:
                `A new Skyrim crash log was detected:\n${basename}\n\n` +
                `Would you like to ${actionDescription}?\n\n` +
                `Your choice can be changed at any time in Vortex's Settings tab.`,
        },
        [
            { label: 'Analyze Now',     tooltip: 'Analyze this crash log now. You will be asked again after future crashes.' },
            { label: 'Always Analyze',  tooltip: 'Analyze now and automatically analyze all future crash logs without asking. You can change this in plugin settings at any time.' },
            { label: 'Not Now',         tooltip: 'Skip this crash log. You will be asked again after the next crash.' },
            { label: 'Never Ask Again', tooltip: "Skip this crash log and disable automatic analysis entirely. Phostwood's QLP will still be available via the Dashboard button. You can re-enable this in plugin settings at any time." },
        ]
    );

    if (result.action === 'Analyze Now') {
        updateLastProcessed(api, logTimeIso);
        await display(api);

    } else if (result.action === 'Always Analyze') {
        updateLastProcessed(api, logTimeIso);
        setSetting(api, 'on_game_exit_behavior', 'auto');
        await display(api);

    } else if (result.action === 'Not Now') {
        updateLastProcessed(api, logTimeIso);

    } else if (result.action === 'Never Ask Again') {
        updateLastProcessed(api, logTimeIso);
        setSetting(api, 'on_game_exit_behavior', 'disabled');
    }
}

// ─────────────────────────────────────────────────────────────
// Check for new crash logs
// Called by fs.watch() when a new file appears in the crash log dir
// ─────────────────────────────────────────────────────────────

let lastCheckTime = 0;

function checkForNewCrashLogs(api) {
    // Debounce — Windows sometimes fires two events for one file write
    const now = Date.now();
    if (now - lastCheckTime < WATCH_DEBOUNCE_MS) return;
    lastCheckTime = now;

    const behavior = getSetting(api, 'on_game_exit_behavior').trim();
    if (behavior === 'disabled') return;
    if (!getSetting(api, 'enabled')) return;

    // Only trigger for supported games
    const state = api.getState();
    const profileId = state.settings && state.settings.profiles && state.settings.profiles.activeProfileId;
    const profile = profileId && state.persistent && state.persistent.profiles && state.persistent.profiles[profileId];
    const gameId = profile ? profile.gameId : null;
    if (!SUPPORTED_GAME_IDS.includes(gameId)) return;

    const crashLogPath = findLatestCrashLog(api);
    if (!crashLogPath) return;

    // Check if this log is newer than the last one we processed
    let logMtime;
    try {
        logMtime = fs.statSync(crashLogPath).mtimeMs;
    } catch (e) {
        log('warn', LOG_PREFIX, `Could not stat crash log: ${e}`);
        return;
    }

    // ISO 8601 to seconds precision — matches MO2 format
    const logTimeIso = new Date(logMtime).toISOString().replace(/\.\d{3}Z$/, '');

    const lastProcessed = getSetting(api, 'last_processed_log_time').trim();

    if (lastProcessed) {
        try {
            const lastDt = new Date(lastProcessed).getTime();
            const logDt  = new Date(logTimeIso).getTime();
            if (!isNaN(lastDt) && !isNaN(logDt) && logDt <= lastDt) {
                return; // Already processed this log
            }
        } catch (e) {
            // Malformed timestamp — treat as no prior record, fall through
        }
    }

    // New crash log found
    if (behavior === 'auto') {
        updateLastProcessed(api, logTimeIso);
        display(api).catch(e => log('warn', LOG_PREFIX, `display() error: ${e}`));
    } else if (behavior === 'prompt') {
        showAutoTriggerPrompt(api, crashLogPath, logTimeIso)
            .catch(e => log('warn', LOG_PREFIX, `showAutoTriggerPrompt() error: ${e}`));
    } else {
        // Unrecognised value — fail safe: treat as 'disabled' (spec §16.9)
        log('warn', LOG_PREFIX, `Unrecognised on_game_exit_behavior '${behavior}' — treating as disabled.`);
    }
}

// ─────────────────────────────────────────────────────────────
// File watcher setup
// Watches the crash log directory for new crash log files
// ─────────────────────────────────────────────────────────────

function startFileWatcher(api) {
    let watchDir = getSetting(api, 'crash_log_dir').trim();

    if (!watchDir) {
        const myDocs = getMyDocuments();
        if (!myDocs) {
            log('warn', LOG_PREFIX, 'Could not resolve My Documents — file watcher not started.');
            return null;
        }
        watchDir = path.join(myDocs, 'My Games', 'Skyrim Special Edition', 'SKSE');
    }

    if (!fs.existsSync(watchDir)) {
        log('info', LOG_PREFIX, `Watch directory does not exist yet: ${watchDir} — watcher not started.`);
        return null;
    }

    // Parse the glob patterns once so we can filter events efficiently
    const globsSetting = getSetting(api, 'crash_log_globs').trim();
    let patterns = globsSetting.split(',').map(p => p.trim()).filter(p => p.length > 0);
    if (patterns.length === 0) patterns = ['crash-*.log', 'Crash_*.txt'];

    const regexes = patterns.map(pattern => new RegExp(
        '^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$',
        'i'
    ));

    try {
        const watcher = fs.watch(watchDir, { persistent: false }, (eventType, filename) => {
            if (!filename) return;
            if (eventType !== 'rename') return; // 'rename' fires on new files; 'change' on edits
            const isCrashLog = regexes.some(r => r.test(filename));
            if (!isCrashLog) return;
            log('info', LOG_PREFIX, `fs.watch() detected: ${filename} (${eventType})`);
            checkForNewCrashLogs(api);
        });

        log('info', LOG_PREFIX, `File watcher started on: ${watchDir}`);
        return watcher;
    } catch (e) {
        log('warn', LOG_PREFIX, `Failed to start file watcher: ${e}`);
        return null;
    }
}

// ─────────────────────────────────────────────────────────────
// Settings UI
// Registers a "Phostwood's QLP" section in Vortex's Settings tab
// ─────────────────────────────────────────────────────────────

function registerSettingsPage(context) {
    const React = require('react');

    function QLPSettings({ api }) {
        const { useSelector } = require('react-redux');

        const enabled       = useSelector(state => {
            const v = state.settings[PLUGIN_ID] && state.settings[PLUGIN_ID]['enabled'];
            return v !== undefined ? v : DEFAULT_SETTINGS['enabled'];
        });
        const localOnly     = useSelector(state => {
            const v = state.settings[PLUGIN_ID] && state.settings[PLUGIN_ID]['local_only_mode'];
            return v !== undefined ? v : DEFAULT_SETTINGS['local_only_mode'];
        });
        const behavior      = useSelector(state => {
            const v = state.settings[PLUGIN_ID] && state.settings[PLUGIN_ID]['on_game_exit_behavior'];
            return v !== undefined ? v : DEFAULT_SETTINGS['on_game_exit_behavior'];
        });
        const analyzerUrl   = useSelector(state => {
            const v = state.settings[PLUGIN_ID] && state.settings[PLUGIN_ID]['analyzer_url'];
            return v !== undefined ? v : DEFAULT_SETTINGS['analyzer_url'];
        });
        const workerUrl     = useSelector(state => {
            const v = state.settings[PLUGIN_ID] && state.settings[PLUGIN_ID]['worker_url'];
            return v !== undefined ? v : DEFAULT_SETTINGS['worker_url'];
        });
        const crashLogDir   = useSelector(state => {
            const v = state.settings[PLUGIN_ID] && state.settings[PLUGIN_ID]['crash_log_dir'];
            return v !== undefined ? v : DEFAULT_SETTINGS['crash_log_dir'];
        });
        const crashLogGlobs = useSelector(state => {
            const v = state.settings[PLUGIN_ID] && state.settings[PLUGIN_ID]['crash_log_globs'];
            return v !== undefined ? v : DEFAULT_SETTINGS['crash_log_globs'];
        });
        const lastProcessed = useSelector(state => {
            const v = state.settings[PLUGIN_ID] && state.settings[PLUGIN_ID]['last_processed_log_time'];
            return v !== undefined ? v : DEFAULT_SETTINGS['last_processed_log_time'];
        });

        const rowStyle    = { display: 'flex', alignItems: 'center', marginBottom: '12px' };
        const labelStyle  = { minWidth: '220px', color: '#ddd' };
        const inputStyle  = { flex: 1, background: '#1a1c1e', color: '#ddd', border: '1px solid #444', borderRadius: '3px', padding: '4px 8px' };
        const selectStyle = { ...inputStyle };

        return React.createElement('div', { style: { padding: '1em', maxWidth: '700px' } },

            React.createElement('h3', { style: { color: '#ddd', marginBottom: '1em' } }, "Phostwood's QLP Settings"),

            // enabled
            React.createElement('div', { style: rowStyle },
                React.createElement('label', { style: labelStyle }, 'Enable plugin'),
                React.createElement('input', {
                    type: 'checkbox',
                    checked: enabled,
                    onChange: e => setSetting(api, 'enabled', e.target.checked),
                })
            ),

            // local_only_mode
            React.createElement('div', { style: rowStyle },
                React.createElement('label', { style: { ...labelStyle, cursor: 'default' } },
                    'Local Only Mode',
                    React.createElement('div', { style: { fontSize: '11px', color: '#aaa', fontWeight: 'normal' } },
                        'Skip upload; copy to clipboard instead'
                    )
                ),
                React.createElement('input', {
                    type: 'checkbox',
                    checked: localOnly,
                    onChange: e => setSetting(api, 'local_only_mode', e.target.checked),
                })
            ),

            // on_game_exit_behavior
            React.createElement('div', { style: rowStyle },
                React.createElement('label', { style: { ...labelStyle, cursor: 'default' } },
                    'Auto-trigger behavior',
                    React.createElement('div', { style: { fontSize: '11px', color: '#aaa', fontWeight: 'normal' } },
                        'When a new crash log is detected'
                    )
                ),
                React.createElement('select', {
                    value: behavior,
                    onChange: e => setSetting(api, 'on_game_exit_behavior', e.target.value),
                    style: selectStyle,
                },
                    React.createElement('option', { value: 'prompt'   }, 'prompt — ask each time (default)'),
                    React.createElement('option', { value: 'auto'     }, 'auto — always analyze without asking'),
                    React.createElement('option', { value: 'disabled' }, 'disabled — manual toolbar button only'),
                )
            ),

            // analyzer_url
            React.createElement('div', { style: rowStyle },
                React.createElement('label', { style: labelStyle }, 'Crash Analyzer URL'),
                React.createElement('input', {
                    type: 'text', value: analyzerUrl,
                    onChange: e => setSetting(api, 'analyzer_url', e.target.value),
                    style: inputStyle,
                })
            ),

            // worker_url
            React.createElement('div', { style: rowStyle },
                React.createElement('label', { style: labelStyle }, 'Cloudflare Worker URL'),
                React.createElement('input', {
                    type: 'text', value: workerUrl,
                    onChange: e => setSetting(api, 'worker_url', e.target.value),
                    style: inputStyle,
                })
            ),

            // crash_log_dir
            React.createElement('div', { style: rowStyle },
                React.createElement('label', { style: { ...labelStyle, cursor: 'default' } },
                    'Crash Log Directory',
                    React.createElement('div', { style: { fontSize: '11px', color: '#aaa', fontWeight: 'normal' } },
                        'Leave empty to auto-detect'
                    )
                ),
                React.createElement('input', {
                    type: 'text', value: crashLogDir,
                    onChange: e => setSetting(api, 'crash_log_dir', e.target.value),
                    placeholder: '(auto-detect from My Documents)',
                    style: inputStyle,
                })
            ),

            // crash_log_globs
            React.createElement('div', { style: rowStyle },
                React.createElement('label', { style: { ...labelStyle, cursor: 'default' } },
                    'Crash Log Filename Patterns',
                    React.createElement('div', { style: { fontSize: '11px', color: '#aaa', fontWeight: 'normal' } },
                        'Comma-separated glob patterns'
                    )
                ),
                React.createElement('input', {
                    type: 'text', value: crashLogGlobs,
                    onChange: e => setSetting(api, 'crash_log_globs', e.target.value),
                    style: inputStyle,
                })
            ),

            // last_processed_log_time
            React.createElement('div', { style: rowStyle },
                React.createElement('label', { style: { ...labelStyle, cursor: 'default' } },
                    'Last Processed Log Time',
                    React.createElement('div', { style: { fontSize: '11px', color: '#aaa', fontWeight: 'normal' } },
                        'Clear to force re-trigger on next detection'
                    )
                ),
                React.createElement('input', {
                    type: 'text', value: lastProcessed,
                    onChange: e => setSetting(api, 'last_processed_log_time', e.target.value),
                    placeholder: '(ISO 8601)',
                    style: inputStyle,
                })
            ),
        );
    }

    // Wrap in a HOC that passes api as a prop
    context.registerSettings(
        "Phostwood's QLP",
        () => React.createElement(QLPSettings, { api: context.api }),
        undefined,
        undefined,
        100,
    );
}

// ─────────────────────────────────────────────────────────────
// Extension entry point
// ─────────────────────────────────────────────────────────────

function main(context) {

    // Register Redux reducer for settings persistence
    context.registerReducer(
        ['settings', PLUGIN_ID],
        {
            defaultState: Object.assign({}, DEFAULT_SETTINGS),
            reducers: {
                ['SET_QLP_SETTING']: (state, payload) => {
                    return Object.assign({}, state, { [payload.key]: payload.value });
                },
            },
        }
    );

    // Register settings page in Vortex's Settings tab
    registerSettingsPage(context);

    // ── Dashboard widget ────────────────────────────────────────
    // registerDashlet already provides the card/header chrome — do NOT
    // wrap content in a <Dashlet> component or the button gets pushed
    // below the fold by a duplicate header.
    const React = require('react');
    const api = context.api;

    function QLPDashlet() {
        const [status, setStatus] = React.useState('');

        const btnStyle = {
            display:      'block',
            width:        '100%',
            padding:      '8px 12px',
            marginTop:    '8px',
            background:   '#d98c00',
            color:        '#fff',
            border:       'none',
            borderRadius: '3px',
            cursor:       'pointer',
            fontSize:     '13px',
            fontWeight:   'bold',
            textAlign:    'center',
        };

        const statusStyle = {
            marginTop: '6px',
            fontSize:  '11px',
            color:     '#aaa',
            minHeight: '16px',
        };

        function handleClick() {
            setStatus('Running…');
            display(api)
                .then(() => setStatus('Done.'))
                .catch(e => {
                    log('warn', LOG_PREFIX, `display() error: ${e}`);
                    setStatus('Error — check Vortex log.');
                });
        }

        return React.createElement('div', { style: { padding: '8px' } },
            React.createElement('div', { style: { color: '#ccc', fontSize: '12px' } },
                'Upload the most recent Skyrim SE/AE crash log and open Phostwood\'s Skyrim Crash Log Analyzer.'
            ),
            React.createElement('button', { style: btnStyle, onClick: handleClick },
                '🐛  Analyze Crash Log'
            ),
            React.createElement('div', { style: statusStyle }, status)
        );
    }

    context.registerDashlet(
        "Phostwood's QLP",                // title shown in dashlet header
        1,                                 // width  (1 = narrow column)
        1,                                 // height (1 = short)
        10,                                // low position = appears near top by default
        QLPDashlet,                        // React component
        () => true,                        // isVisible
        () => ({}),                        // props — empty; api is closed over above
        { fixed: false, closable: true }   // user can close/reposition
    );

    // ── ⋮ menu fallback (global-icons only) ────────────────────
    // game-discovered-buttons and game-managed-buttons were causing
    // broken "?" icons in the game banner — removed.
    // global-icons reliably appears in the ⋮ overflow menu as a fallback.
    context.registerAction(
        'global-icons',
        150,
        'bug',
        {},
        "QLP: Analyze Crash Log",
        () => { display(api).catch(e => log('warn', LOG_PREFIX, `display() error: ${e}`)); },
        () => true
    );

    // Start file watcher and hook visibilitychange after Vortex is fully loaded
    context.once(() => {
        log('info', LOG_PREFIX, `Extension loaded. Version: 2.2.0`);
        startFileWatcher(api);
    });

    return true;
}

// Vortex-required log function wrapper
function log(level, prefix, message) {
    try {
        const { log: vortexLog } = require('vortex-api');
        vortexLog(level, `${prefix} ${message}`);
    } catch (e) {
        console.log(`[${level}] ${prefix} ${message}`);
    }
}

exports.default = main;