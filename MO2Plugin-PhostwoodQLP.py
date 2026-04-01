# Phostwood's QLP — MO2 Plugin
# Version: 2.3.1
# Authors: Kyler, Phostwood

import mobase
import os
import glob
import gzip
import subprocess
import urllib.request
import urllib.error
import http.client
import ssl
import json
import ctypes
import ctypes.wintypes
from typing import List
from PyQt6.QtCore import qInfo
from PyQt6.QtGui import QIcon
from PyQt6.QtWidgets import QApplication, QMessageBox


# -------------------------------------------------------------
# Constants
# -------------------------------------------------------------

WORKER_VERSION = "2.0.0"

CLIENT_ANTI_INDICATORS = [
    "Fallout4.exe",
    "Cyberpunk2077.exe",
    "UnityPlayer.dll",
    "RobloxPlayer.exe",
    "chrome.exe",
    "python.exe",
]

# Compressed size limit -- mirrors the Worker's MAX_FILE_GZIP_BYTES.
# We gzip client-side purely to estimate the compressed size; the raw
# (uncompressed) text is what actually gets uploaded. A small conservative
# margin (1.9 MB vs 2.0 MB) accounts for minor gzip implementation variance
# between Python and the Cloudflare Worker's CompressionStream.
MAX_COMPRESSED_SIZE = int(1.9 * 1024 * 1024)  # 1.9 MB (worker hard limit is 2 MB)

UPLOAD_TIMEOUT = 30  # seconds

URL_LOG_SUBFOLDER = "Phostwood"
URL_LOG_FILENAME  = "Shareable URLs.log"
URL_LOG_HEADER = (
    "# Phostwood's QLP -- Crash Log Analyzer History\n"
    "# Shareable URLs for your Skyrim SE/AE/VR crash log analyses\n"
    "#\n"
    "# Timestamp            | Crash Log Filename | Analyzer URL\n"
)


# -------------------------------------------------------------
# Plugin class
# -------------------------------------------------------------

class PhostwoodQLP(mobase.IPluginTool):
    _organizer: mobase.IOrganizer

    def __init__(self):
        super().__init__()
        self._default_crash_log_dir = ""
        self._default_url_log_path  = ""

    def init(self, organizer: mobase.IOrganizer) -> bool:
        self._organizer = organizer

        # -- Resolve default crash log directory ---------------
        # SHGetFolderPathW is safe here but we resolve it in init()
        # so we can write the result back to the setting immediately.
        try:
            CSIDL_PERSONAL = 5
            SHGFP_TYPE_CURRENT = 0
            buf = ctypes.create_unicode_buffer(ctypes.wintypes.MAX_PATH)
            ctypes.windll.shell32.SHGetFolderPathW(
                None, CSIDL_PERSONAL, None, SHGFP_TYPE_CURRENT, buf
            )
            my_documents = buf.value
            self._default_crash_log_dir = os.path.normpath(os.path.join(
                my_documents, "My Games", "Skyrim Special Edition", "SKSE"
            ))
            qInfo(f"[PhostwoodQLP] Default crash log dir: {self._default_crash_log_dir}")
        except Exception as e:
            qInfo(f"[PhostwoodQLP] Could not resolve My Documents: {e}")

        # -- Resolve default URL log path ----------------------
        try:
            data_dir = organizer.pluginDataPath()
            self._default_url_log_path = os.path.normpath(os.path.join(
                data_dir, URL_LOG_SUBFOLDER, URL_LOG_FILENAME
            ))
            qInfo(f"[PhostwoodQLP] Default URL log path: {self._default_url_log_path}")
        except Exception as e:
            qInfo(f"[PhostwoodQLP] Could not resolve pluginDataPath(): {e}")

        # -- Restore any blank settings to their defaults ------
        self._restore_blank_settings()

        organizer.onFinishedRun(self._on_game_exit)
        return True

    # -- IPlugin interface -------------------------------------

    def name(self) -> str:
        return "Phostwood's QLP"

    def author(self) -> str:
        return "Kyler, Phostwood"

    def icon(self) -> QIcon:
        return QIcon()

    def description(self) -> str:
        return (
            "Phostwood's QLP -- uploads the most recent Skyrim SE/AE/VR crash log to Sovnkrasch "
            "and opens the Crash Log Analyzer in your browser. "
            "Tip: clear any setting and restart MO2 to reset it to its default value."
    )

    def version(self) -> mobase.VersionInfo:
        return mobase.VersionInfo(2, 3, 1, mobase.ReleaseType.FINAL)

    def tooltip(self) -> str:
        return "Phostwood's QLP: Upload your most recent Skyrim SE/AE/VR crash log and open the Crash Log Analyzer."

    def isActive(self) -> bool:
        return bool(self._organizer.pluginSetting(self.name(), "enabled"))

    def settings(self) -> List[mobase.PluginSetting]:
        return [
            mobase.PluginSetting("enabled", "Enable this plugin", True),
            mobase.PluginSetting(
                "analyzer_url",
                "Crash Analyzer URL",
                "https://phostwood.github.io/crash-analyzer/skyrim.html",
            ),
            mobase.PluginSetting(
                "worker_url",
                "Cloudflare Worker URL",
                "https://skyrim-crashlog-worker.phostwood.workers.dev/upload",
            ),
            mobase.PluginSetting(
                "local_only_mode",
                "Local Only Mode: skip upload and copy crash log text to clipboard instead (disable to restore cloud sharing)",
                False,
            ),
            mobase.PluginSetting(
                "crash_log_dir",
                (
                    "Crash Log Directory: full path to the folder containing crash logs. "
                    "This is auto-detected from your My Documents folder on first run."
                ),
                "",
            ),
            mobase.PluginSetting(
                "crash_log_globs",
                (
                    "Crash Log Filename Patterns: comma-separated glob patterns used to find crash logs. "
                    "The most recently modified match across all patterns is used. "
                    "Examples: 'crash-*.log' (CrashLoggerSSE), 'Crash_*.txt' (NetScriptFramework)"
                ),
                "crash-*.log, Crash_*.txt",
            ),
            mobase.PluginSetting(
                "on_game_exit_behavior",
                (
                    "Auto-trigger behavior when a new crash log is detected after the game exits. "
                    "Values: 'prompt' (ask each time, default), "
                    "'auto' (always analyze without asking), "
                    "'disabled' (never auto-trigger; manual Tools menu only)"
                ),
                "prompt",
            ),
            mobase.PluginSetting(
                "last_processed_log_time",
                (
                    "Timestamp of the most recently processed crash log (ISO 8601). "
                    "Used to detect new crash logs after game exit. "
                    "Clear this value to force a re-trigger prompt on next game exit."
                ),
                "",
            ),
            mobase.PluginSetting(
                "url_log_path",
                (
                    "Shareable URL Log: full path to your crash log analyzer URL history file. "
                    "A record of all shareable links is appended here after each successful upload. "
                    "This is auto-detected from your MO2 data folder on first run."
                ),
                "",
            ),
        ]

    # -- IPluginTool interface ----------------------------------

    def displayName(self) -> str:
        return "Phostwood's QLP: Upload Crash Log and Open Analyzer"

    def display(self) -> bool:
        # 1. Find the most recent crash log
        crash_log_path = self._find_latest_crash_log()
        if not crash_log_path:
            self._show_message(
                "No Crash Log Found",
                (
                    "Could not find a valid Skyrim SE/AE/VR crash log.\n\n"
                    "Possible reasons:\n"
                    "* No crashes have occurred yet\n"
                    "* A supported crash logger (CrashLoggerSSE, NetScriptFramework, "
                    "or Trainwreck) is not installed\n"
                    "* The game has not been run through MO2"
                ),
            )
            return False

        # 2. Read file as bytes, then decode
        try:
            with open(crash_log_path, "rb") as f:
                raw_bytes = f.read()
        except Exception as e:
            qInfo(f"[PhostwoodQLP] Failed to read crash log: {e}")
            self._show_message("Read Error", f"Failed to read crash log:\n{e}")
            return False

        text = raw_bytes.decode("utf-8", errors="replace")

        # 3. Lightweight client-side validation
        if len(raw_bytes) == 0:
            self._show_message(
                "Empty File",
                "The most recent crash log is empty. It may still be written by the game.",
            )
            return False

        for indicator in CLIENT_ANTI_INDICATORS:
            if indicator in text:
                self._show_message(
                    "Not a Skyrim Crash Log",
                    (
                        "This file doesn't appear to be a Skyrim SE/AE/VR crash log.\n\n"
                        "Could not find a valid Skyrim SE/AE/VR crash log.\n"
                        "Possible reasons: no crash logs yet, unsupported game, "
                        "or crash logger not installed."
                    ),
                )
                return False

        local_only = bool(self._organizer.pluginSetting(self.name(), "local_only_mode"))

        if local_only:
            # 4 (local). Copy raw crash log text to clipboard and open bare analyzer URL.
            qInfo("[PhostwoodQLP] Local-only mode: skipping upload, copying text to clipboard.")
            analyzer_url = self._organizer.pluginSetting(self.name(), "analyzer_url")
            self._open_in_browser(analyzer_url)
            QApplication.clipboard().setText(text)
            self._show_message(
                "Crash Log Copied",
                (
                    "The Crash Log Analyzer has been opened in your browser.\n\n"
                    "Your crash log text has been copied to your clipboard -- "
                    "just paste it into the analyzer and click \"Analyze\" to see your results.\n\n"
                    "Tip: To generate a shareable link instead, set "
                    "\"local_only_mode\" to \"false\" in this plugin's settings."
                ),
            )
            return True

        # 4. Gzip pre-check -- estimate compressed size before uploading.
        #    We compress client-side purely to measure; the raw text is uploaded.
        #    This avoids sending large files the server will reject anyway.
        compressed_preview = gzip.compress(raw_bytes, compresslevel=6)
        compressed_size = len(compressed_preview)
        qInfo(
            f"[PhostwoodQLP] Raw size: {len(raw_bytes):,} bytes | "
            f"Compressed estimate: {compressed_size:,} bytes"
        )

        if compressed_size > MAX_COMPRESSED_SIZE:
            self._show_message(
                "File Too Large",
                (
                    f"This crash log is too large to upload even after compression "
                    f"({compressed_size / 1024 / 1024:.1f} MB compressed, limit is 2 MB).\n\n"
                    "Try sharing it manually via 0x0.st or Google Drive."
                ),
            )
            return False

        # 5. Upload to Worker
        worker_url = self._organizer.pluginSetting(self.name(), "worker_url")
        uuid = self._upload_to_worker(worker_url, text, crash_log_path)
        if not uuid:
            # Upload failed -- fall back to clipboard so the user isn't left stranded.
            qInfo("[PhostwoodQLP] Upload failed; falling back to clipboard copy.")
            analyzer_url = self._organizer.pluginSetting(self.name(), "analyzer_url")
            self._open_in_browser(analyzer_url)
            QApplication.clipboard().setText(text)
            self._show_message(
                "Crash Log Copied as Fallback",
                (
                    "As a fallback, your crash log has been copied to your clipboard "
                    "and the Crash Log Analyzer has been opened in your browser.\n\n"
                    "Just paste your crash log into the analyzer and click \"Analyze\" to see your results."
                ),
            )
            return False

        # 6. Build full analyzer URL and open in browser
        analyzer_url = self._organizer.pluginSetting(self.name(), "analyzer_url")
        full_url = f"{analyzer_url}?UUID={uuid}"
        self._open_in_browser(full_url)

        # 7. Record the shareable URL to the history log
        self._append_url_log(crash_log_path, full_url)

        # 8. Success dialog — suppressed in auto mode unless local-only
        #    (local-only always shows because the user needs to paste from clipboard)
        behavior = str(self._organizer.pluginSetting(self.name(), "on_game_exit_behavior")).strip()
        if behavior != "auto" or local_only:
            self._show_message_copy_link(
                "Upload Successful",
                (
                    f"Crash log uploaded successfully.\n\n"
                    f"The Crash Log Analyzer has been opened in your browser.\n\n"
                    f"URL:\n{full_url}"
                ),
                full_url,
            )
        return True

    # -- Private helpers ---------------------------------------

    def _restore_blank_settings(self) -> None:
        """
        Check all settings that must never be blank and restore their
        defaults if the user has cleared them. Called from init() on
        every startup, so Settings always shows a populated value.
        Skips last_processed_log_time -- blank is valid there by design.
        """
        defaults = {
            "analyzer_url":          "https://phostwood.github.io/crash-analyzer/skyrim.html",
            "worker_url":            "https://skyrim-crashlog-worker.phostwood.workers.dev/upload",
            "crash_log_globs":       "crash-*.log, Crash_*.txt",
            "on_game_exit_behavior": "prompt",
            "crash_log_dir":         self._default_crash_log_dir,
            "url_log_path":          self._default_url_log_path,
        }

        for key, default in defaults.items():
            if not default:
                continue  # Skip if default itself could not be resolved (e.g. path failure)
            current = str(self._organizer.pluginSetting(self.name(), key)).strip()
            if not current:
                self._organizer.setPluginSetting(self.name(), key, default)
                qInfo(f"[PhostwoodQLP] '{key}' was blank; restored to default: {default}")

    def _find_latest_crash_log(self) -> str | None:
        """
        Return the path to the most recently modified crash log, or None.
        Respects the crash_log_dir and crash_log_globs plugin settings.
        """
        crash_log_dir = str(self._organizer.pluginSetting(self.name(), "crash_log_dir")).strip()
        if not crash_log_dir:
            crash_log_dir = self._default_crash_log_dir
        if not crash_log_dir:
            qInfo("[PhostwoodQLP] No crash log directory available.")
            return None

        qInfo(f"[PhostwoodQLP] Searching for crash logs in: {crash_log_dir}")

        # -- Resolve glob patterns -----------------------------
        globs_setting = str(self._organizer.pluginSetting(self.name(), "crash_log_globs")).strip()
        patterns = [p.strip() for p in globs_setting.split(",") if p.strip()]

        if not patterns:
            patterns = ["crash-*.log", "Crash_*.txt"]
            qInfo("[PhostwoodQLP] crash_log_globs was empty; using default patterns.")

        # -- Collect all candidates across all patterns --------
        candidates = []
        for pattern in patterns:
            matched = glob.glob(os.path.join(crash_log_dir, pattern))
            qInfo(f"[PhostwoodQLP] Pattern '{pattern}' matched {len(matched)} file(s).")
            candidates.extend(matched)

        if not candidates:
            qInfo(f"[PhostwoodQLP] No crash logs found in: {crash_log_dir}")
            return None

        latest = max(candidates, key=os.path.getmtime)
        qInfo(f"[PhostwoodQLP] Most recent crash log: {latest}")
        return latest

    def _resolve_url_log_path(self) -> str | None:
        """
        Return the full path to the shareable URL history log file.
        Respects the url_log_path plugin setting; falls back to the
        pre-calculated default. Returns None if neither is available.
        """
        custom_path = str(self._organizer.pluginSetting(self.name(), "url_log_path")).strip()
        if custom_path:
            return custom_path
        if self._default_url_log_path:
            return self._default_url_log_path
        qInfo("[PhostwoodQLP] No URL log path available.")
        return None

    def _append_url_log(self, crash_log_path: str, full_url: str) -> None:
        """
        Append a single entry to the shareable URL history log.
        Creates the file (with header) if it does not yet exist.
        """
        import datetime

        log_path = self._resolve_url_log_path()
        if not log_path:
            qInfo("[PhostwoodQLP] URL log path could not be resolved; skipping URL log.")
            return

        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        filename  = os.path.basename(crash_log_path)
        entry     = f"{timestamp} | {filename} | {full_url}\n"

        try:
            log_dir = os.path.dirname(log_path)
            if log_dir and not os.path.exists(log_dir):
                os.makedirs(log_dir, exist_ok=True)
                qInfo(f"[PhostwoodQLP] Created URL log directory: {log_dir}")

            file_exists = os.path.isfile(log_path)
            with open(log_path, "a", encoding="utf-8") as f:
                if not file_exists:
                    f.write(URL_LOG_HEADER)
                    qInfo(f"[PhostwoodQLP] Created URL log at: {log_path}")
                f.write(entry)
            qInfo(f"[PhostwoodQLP] URL log entry written: {entry.strip()}")
        except Exception as e:
            qInfo(f"[PhostwoodQLP] Failed to write URL log: {e}")

    def _upload_to_worker(self, worker_url: str, text: str, crash_log_path: str = "") -> str | None:
        """
        POST the decoded crash log text to the Worker.
        Returns the UUID string on success, or None on failure
        (after showing an appropriate error dialog).
        """
        encoded = text.encode("utf-8")
        req = urllib.request.Request(
            worker_url,
            data=encoded,
            method="POST",
            headers={
                "Content-Type": "text/plain; charset=utf-8",
                "X-MO2-Plugin": "SkyrimCrashUploader",
                "User-Agent": "MO2-CrashLogUploader/2.0.0",
            },
        )

        try:
            with urllib.request.urlopen(req, timeout=UPLOAD_TIMEOUT) as resp:
                status = resp.status
                body   = resp.read().decode("utf-8", errors="replace")

            if status == 200:
                try:
                    data = json.loads(body)
                    uuid = data.get("uuid", "").strip()
                    if uuid:
                        qInfo(f"[PhostwoodQLP] Upload succeeded. UUID: {uuid}")
                        return uuid
                except json.JSONDecodeError:
                    pass
                self._show_message(
                    "Upload Error",
                    "The server returned an unexpected response. Please try again later.",
                )
                return None

            self._handle_http_error(status, body, crash_log_path)
            return None

        except urllib.error.HTTPError as e:
            body = ""
            try:
                body = e.read().decode("utf-8", errors="replace")
            except Exception:
                pass
            self._handle_http_error(e.code, body, crash_log_path)
            return None

        except (
            http.client.RemoteDisconnected,
            http.client.IncompleteRead,
            ConnectionResetError,
            ConnectionRefusedError,
            ConnectionAbortedError,
            BrokenPipeError,
            ssl.SSLError,
            ssl.CertificateError,
        ) as e:
            qInfo(f"[PhostwoodQLP] Connection error during upload: {e}")
            self._show_message(
                "Connection Dropped",
                (
                    "The connection to the upload server was dropped before a response was received.\n\n"
                    "This may be caused by your region, ISP, or a temporary network issue.\n\n"
                    "As a fallback, your crash log has been copied to your clipboard and "
                    "the Crash Log Analyzer has been opened in your browser -- "
                    "just paste it in and click \"Analyze\" to see your results."
                ),
            )
            return None

        except urllib.error.URLError as e:
            qInfo(f"[PhostwoodQLP] URLError: {e}")
            self._show_message(
                "Upload Failed",
                "Upload failed. Check your internet connection and try again.",
            )
            return None

        except TimeoutError:
            qInfo("[PhostwoodQLP] Upload timed out.")
            self._show_message(
                "Upload Timed Out",
                "The upload timed out. Check your connection and try again.",
            )
            return None

    def _handle_http_error(self, status: int, body: str, crash_log_path: str = "") -> None:
        """Show an appropriate error dialog for a given HTTP status code."""
        qInfo(f"[PhostwoodQLP] HTTP error {status}. Body: {body[:200]}")

        if status == 503:
            try:
                data = json.loads(body)
                if data.get("error") == "storage_full":
                    self._show_message(
                        "Storage Full",
                        (
                            "The crash-log server is temporarily full. "
                            "Try again later, or share your log manually via "
                            "0x0.st or Google Drive."
                        ),
                    )
                    return
            except json.JSONDecodeError:
                pass
            file_info = f"\n\nPath: {crash_log_path}" if crash_log_path else ""
            self._show_message(
                "Upload Rejected",
                (
                    "The server rejected this file. It doesn't look like a valid "
                    f"Skyrim SE/AE/VR crash log.{file_info}\n\n"
                    "Try using 0x0.st or Google Drive to share it manually."
                ),
            )
        elif status == 403:
            self._show_message(
                "Upload Refused",
                (
                    "The server refused the upload (403 Forbidden). "
                    "This may be a Cloudflare WAF or Access rule blocking the request. "
                    "Check the Worker's Security settings in the Cloudflare dashboard."
                ),
            )
        elif status == 429:
            self._show_message(
                "Too Many Requests",
                "You're sending crash logs too quickly. Please wait a minute and try again.",
            )
        elif status == 500:
            self._show_message(
                "Server Error",
                "The server encountered an error. Please try again later.",
            )
        else:
            self._show_message(
                "Upload Failed",
                f"Upload failed with status {status}. Check your connection and try again.",
            )

    def _open_in_browser(self, url: str) -> None:
        """Open a URL in the system's default browser."""
        qInfo(f"[PhostwoodQLP] Opening URL: {url}")
        try:
            if os.name == "nt":
                os.startfile(url)
            elif os.name == "posix":
                subprocess.run(["xdg-open", url], check=True)
            else:
                qInfo(f"[PhostwoodQLP] Unsupported OS: {os.name}")
        except Exception as e:
            qInfo(f"[PhostwoodQLP] Failed to open browser: {e}")

    def _show_message(self, title: str, message: str) -> None:
        """Display a modal information dialog."""
        msg_box = QMessageBox()
        msg_box.setWindowTitle(title)
        msg_box.setText(message)
        msg_box.setIcon(QMessageBox.Icon.Information)
        msg_box.exec()

    def _show_message_copy_link(self, title: str, message: str, link: str) -> None:
        """Display a modal information dialog with a conditional copy link button."""
        msg_box = QMessageBox()
        msg_box.setWindowTitle(title)
        msg_box.setText(message)
        msg_box.setIcon(QMessageBox.Icon.Information)
        copy_button = msg_box.addButton("Copy Link", QMessageBox.ButtonRole.AcceptRole)
        msg_box.addButton("OK", QMessageBox.ButtonRole.RejectRole)
        msg_box.exec()
        if msg_box.clickedButton() == copy_button:
            QApplication.clipboard().setText(link)

    # -- Auto-trigger on game exit -----------------------------

    def _on_game_exit(self, app_path: str, exit_code: int) -> None:
        """Called by MO2 when the game process exits. Checks for new crash logs."""
        import datetime

        behavior = str(self._organizer.pluginSetting(self.name(), "on_game_exit_behavior")).strip()
        if behavior == "disabled":
            return

        crash_log_path = self._find_latest_crash_log()
        if not crash_log_path:
            return

        log_mtime    = os.path.getmtime(crash_log_path)
        log_time_iso = datetime.datetime.fromtimestamp(log_mtime).isoformat(timespec="seconds")

        last_processed = str(self._organizer.pluginSetting(
            self.name(), "last_processed_log_time"
        )).strip()

        if last_processed:
            try:
                last_dt = datetime.datetime.fromisoformat(last_processed)
                log_dt  = datetime.datetime.fromisoformat(log_time_iso)
                if log_dt <= last_dt:
                    return  # Not a new log -- already processed
            except ValueError:
                pass  # Malformed timestamp -- treat as no prior record, fall through

        if behavior == "auto":
            self._update_last_processed(log_time_iso)
            self.display()
        else:
            # "prompt" or any unrecognised value (but "disabled" is caught above)
            self._show_auto_trigger_prompt(crash_log_path, log_time_iso)

    def _update_last_processed(self, log_time_iso: str) -> None:
        """Save the timestamp of the most recently processed crash log."""
        self._organizer.setPluginSetting(self.name(), "last_processed_log_time", log_time_iso)

    def _show_auto_trigger_prompt(self, crash_log_path: str, log_time_iso: str) -> None:
        """
        Show the auto-trigger confirmation dialog with four options.
        Button order: Analyze Now / Always Analyze / Not Now / Never Ask Again.
        """
        msg_box = QMessageBox()
        msg_box.setWindowTitle("Phostwood's QLP -- Analyze Crash Log")
        msg_box.setIcon(QMessageBox.Icon.Question)

        local_only = bool(self._organizer.pluginSetting(self.name(), "local_only_mode"))
        if local_only:
            action_description = "copy it to your clipboard and open the Crash Log Analyzer"
        else:
            action_description = "upload it to Sovnkrasch and open the Crash Log Analyzer"

        msg_box.setText(
            f"A new Skyrim crash log was detected:\n"
            f"{os.path.basename(crash_log_path)}\n\n"
            f"Would you like to {action_description}?\n\n"
            f"Your choice can be changed at any time in MO2's plugin settings."
        )

        analyze_now_btn = msg_box.addButton("Analyze Now",      QMessageBox.ButtonRole.AcceptRole)
        always_btn      = msg_box.addButton("Always Analyze",   QMessageBox.ButtonRole.AcceptRole)
        not_now_btn     = msg_box.addButton("Not Now",          QMessageBox.ButtonRole.RejectRole)
        never_btn       = msg_box.addButton("Never Ask Again",  QMessageBox.ButtonRole.RejectRole)

        analyze_now_btn.setToolTip(
            "Analyze this crash log now. You will be asked again after future crashes."
        )
        always_btn.setToolTip(
            "Analyze now and automatically analyze all future crash logs without asking. "
            "No popup will appear in future -- analysis starts immediately after each new crash. "
            "You can change this in plugin settings at any time."
        )
        not_now_btn.setToolTip(
            "Skip this crash log. You will be asked again after the next crash."
        )
        never_btn.setToolTip(
            "Skip this crash log and disable automatic analysis entirely. "
            "No popup will appear in future, and crash logs will not be analyzed automatically. "
            "Phostwood's QLP will still be available via MO2's Tools menu. "
            "You can re-enable this in plugin settings at any time."
        )

        msg_box.exec()
        clicked = msg_box.clickedButton()

        if clicked == analyze_now_btn:
            self._update_last_processed(log_time_iso)
            self.display()

        elif clicked == always_btn:
            self._update_last_processed(log_time_iso)
            self._organizer.setPluginSetting(self.name(), "on_game_exit_behavior", "auto")
            self.display()

        elif clicked == not_now_btn:
            self._update_last_processed(log_time_iso)

        elif clicked == never_btn:
            self._update_last_processed(log_time_iso)
            self._organizer.setPluginSetting(self.name(), "on_game_exit_behavior", "disabled")


# -------------------------------------------------------------
# MO2 entry point
# -------------------------------------------------------------

def createPlugin() -> mobase.IPlugin:
    return PhostwoodQLP()