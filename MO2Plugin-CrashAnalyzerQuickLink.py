import mobase
import os
import glob
import gzip
import subprocess
import urllib.request
import urllib.error
import json
import ctypes
import ctypes.wintypes
from typing import List
from PyQt6.QtCore import qInfo
from PyQt6.QtGui import QIcon
from PyQt6.QtWidgets import QApplication, QMessageBox


# ─────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────

WORKER_VERSION = "2.0.0"

CLIENT_ANTI_INDICATORS = [
    "Fallout4.exe",
    "Cyberpunk2077.exe",
    "UnityPlayer.dll",
    "RobloxPlayer.exe",
    "chrome.exe",
    "python.exe",
]

# Compressed size limit — mirrors the Worker's MAX_FILE_GZIP_BYTES.
# We gzip client-side purely to estimate the compressed size; the raw
# (uncompressed) text is what actually gets uploaded. A small conservative
# margin (1.9 MB vs 2.0 MB) accounts for minor gzip implementation variance
# between Python and the Cloudflare Worker's CompressionStream.
MAX_COMPRESSED_SIZE = int(1.9 * 1024 * 1024)  # 1.9 MB (worker hard limit is 2 MB)

UPLOAD_TIMEOUT = 30  # seconds


# ─────────────────────────────────────────────────────────────
# Plugin class
# ─────────────────────────────────────────────────────────────

class CrashLogQuickLink(mobase.IPluginTool):
    _organizer: mobase.IOrganizer

    def __init__(self):
        super().__init__()

    def init(self, organizer: mobase.IOrganizer) -> bool:
        self._organizer = organizer
        return True

    # ── IPlugin interface ──────────────────────────────────────

    def name(self) -> str:
        return "Crash Log Analyzer Quick Link"

    def author(self) -> str:
        return "Kyler, Phostwood"

    def icon(self) -> QIcon:
        return QIcon()

    def description(self) -> str:
        return (
            "Uploads the most recent Skyrim SE/AE crash log to a secure cloud "
            "Worker and opens Phostwood's Crash Log Analyzer in your browser."
        )

    def version(self) -> mobase.VersionInfo:
        return mobase.VersionInfo(2, 0, 0, mobase.ReleaseType.FINAL)

    def tooltip(self) -> str:
        return "Upload the most recent Skyrim SE/AE crash log and open the Crash Log Analyzer."

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
                    "Leave empty to auto-detect from My Documents "
                    "(e.g. ...\\My Games\\Skyrim Special Edition\\SKSE)"
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
        ]

    # ── IPluginTool interface ──────────────────────────────────

    def displayName(self) -> str:
        return "Upload Crash Log and Open Analyzer"

    def display(self) -> bool:
        # 1. Check that the managed game is Skyrim SE/AE
        try:
            game_name = self._organizer.managedGame().gameName()
        except Exception:
            game_name = ""

        if game_name != "Skyrim Special Edition":
            self._show_message(
                "Unsupported Game",
                "Only Skyrim Special Edition / Anniversary Edition is supported by this plugin.",
            )
            return False

        # 2. Find the most recent crash log
        crash_log_path = self._find_latest_crash_log()
        if not crash_log_path:
            self._show_message(
                "No Crash Log Found",
                (
                    "Could not find a valid Skyrim SE/AE crash log.\n\n"
                    "Possible reasons:\n"
                    "• No crashes have occurred yet\n"
                    "• A supported crash logger (CrashLoggerSSE, NetScriptFramework, "
                    "or Trainwreck) is not installed\n"
                    "• The game has not been run through MO2"
                ),
            )
            return False

        # 3. Read file as bytes, then decode
        try:
            with open(crash_log_path, "rb") as f:
                raw_bytes = f.read()
        except Exception as e:
            qInfo(f"[CrashLogQuickLink] Failed to read crash log: {e}")
            self._show_message("Read Error", f"Failed to read crash log:\n{e}")
            return False

        text = raw_bytes.decode("utf-8", errors="replace")

        # 4. Lightweight client-side validation

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
                        "This file doesn't appear to be a Skyrim SE/AE crash log.\n\n"
                        "Could not find a valid Skyrim SE/AE crash log.\n"
                        "Possible reasons: no crash logs yet, unsupported game, "
                        "or crash logger not installed."
                    ),
                )
                return False

        local_only = bool(self._organizer.pluginSetting(self.name(), "local_only_mode"))

        if local_only:
            # 5 (local). Copy raw crash log text to clipboard and open bare analyzer URL.
            qInfo("[CrashLogQuickLink] Local-only mode: skipping upload, copying text to clipboard.")
            analyzer_url = self._organizer.pluginSetting(self.name(), "analyzer_url")
            self._open_in_browser(analyzer_url)
            QApplication.clipboard().setText(text)
            self._show_message(
                "Crash Log Copied",
                (
                    "The Crash Log Analyzer has been opened in your browser.\n\n"
                    "Your crash log text has been copied to your clipboard — "
                    "just paste it into the analyzer and click \"Analyze\" to see your results.\n\n"
                    "Tip: To generate a shareable link instead, disable "
                    "\"Local Only Mode\" in this plugin's settings."
                ),
            )
            return True

        # 5. Gzip pre-check — estimate compressed size before uploading.
        #    We compress client-side purely to measure; the raw text is uploaded.
        #    This avoids sending large files the server will reject anyway.
        compressed_preview = gzip.compress(raw_bytes, compresslevel=6)
        compressed_size = len(compressed_preview)
        qInfo(
            f"[CrashLogQuickLink] Raw size: {len(raw_bytes):,} bytes | "
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

        # 6. Upload to Worker
        worker_url = self._organizer.pluginSetting(self.name(), "worker_url")
        uuid = self._upload_to_worker(worker_url, text, crash_log_path)
        if not uuid:
            # Upload failed — error-specific dialog already shown by _upload_to_worker.
            # Fall back to clipboard so the user isn't left stranded.
            qInfo("[CrashLogQuickLink] Upload failed; falling back to clipboard copy.")
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

        # 7. Build full analyzer URL and open in browser
        analyzer_url = self._organizer.pluginSetting(self.name(), "analyzer_url")
        full_url = f"{analyzer_url}?UUID={uuid}"
        self._open_in_browser(full_url)

        # 8. Success dialog
        self._show_message_copy_link(
            "Upload Successful",
            f"Crash log uploaded successfully.\n\nThe Crash Log Analyzer has been opened in your browser.\n\nURL:\n{full_url}",
            full_url,
        )
        return True

    # ── Private helpers ────────────────────────────────────────

    def _find_latest_crash_log(self) -> str | None:
        """
        Return the path to the most recently modified crash log, or None.
        Respects the crash_log_dir and crash_log_globs plugin settings.
        """
        # ── Resolve directory ──────────────────────────────────
        crash_log_dir = str(self._organizer.pluginSetting(self.name(), "crash_log_dir")).strip()

        if not crash_log_dir:
            # Auto-detect from My Documents via Windows Shell API
            try:
                CSIDL_PERSONAL = 5
                SHGFP_TYPE_CURRENT = 0
                buf = ctypes.create_unicode_buffer(ctypes.wintypes.MAX_PATH)
                ctypes.windll.shell32.SHGetFolderPathW(
                    None, CSIDL_PERSONAL, None, SHGFP_TYPE_CURRENT, buf
                )
                my_documents = buf.value
                qInfo(f"[CrashLogQuickLink] My Documents (auto-detected): {my_documents}")
            except Exception as e:
                qInfo(f"[CrashLogQuickLink] Could not resolve My Documents: {e}")
                return None

            crash_log_dir = os.path.join(
                my_documents, "My Games", "Skyrim Special Edition", "SKSE"
            )

        qInfo(f"[CrashLogQuickLink] Searching for crash logs in: {crash_log_dir}")

        # ── Resolve glob patterns ──────────────────────────────
        globs_setting = str(self._organizer.pluginSetting(self.name(), "crash_log_globs")).strip()
        patterns = [p.strip() for p in globs_setting.split(",") if p.strip()]

        if not patterns:
            # Fallback in case the setting was cleared entirely
            patterns = ["crash-*.log", "Crash_*.txt"]
            qInfo("[CrashLogQuickLink] crash_log_globs was empty; using default patterns.")

        # ── Collect all candidates across all patterns ─────────
        candidates = []
        for pattern in patterns:
            matched = glob.glob(os.path.join(crash_log_dir, pattern))
            qInfo(f"[CrashLogQuickLink] Pattern '{pattern}' matched {len(matched)} file(s).")
            candidates.extend(matched)

        if not candidates:
            qInfo(f"[CrashLogQuickLink] No crash logs found in: {crash_log_dir}")
            return None

        # Pick the single most recently modified file across all patterns
        latest = max(candidates, key=os.path.getmtime)
        qInfo(f"[CrashLogQuickLink] Most recent crash log: {latest}")
        return latest

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
                body = resp.read().decode("utf-8", errors="replace")

            if status == 200:
                try:
                    data = json.loads(body)
                    uuid = data.get("uuid", "").strip()
                    if uuid:
                        qInfo(f"[CrashLogQuickLink] Upload succeeded. UUID: {uuid}")
                        return uuid
                except json.JSONDecodeError:
                    pass
                self._show_message(
                    "Upload Error",
                    "The server returned an unexpected response. Please try again later.",
                )
                return None

            # Non-200 from a successful HTTP exchange
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

        except urllib.error.URLError as e:
            qInfo(f"[CrashLogQuickLink] URLError: {e}")
            self._show_message(
                "Upload Failed",
                "Upload failed. Check your internet connection and try again.",
            )
            return None

        except TimeoutError:
            qInfo("[CrashLogQuickLink] Upload timed out.")
            self._show_message(
                "Upload Timed Out",
                "The upload timed out. Check your connection and try again.",
            )
            return None

    def _handle_http_error(self, status: int, body: str, crash_log_path: str = "") -> None:
        """Show an appropriate error dialog for a given HTTP status code."""
        qInfo(f"[CrashLogQuickLink] HTTP error {status}. Body: {body[:200]}")

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
            file_info = ""
            if crash_log_path:
                file_info = f"\n\nPath: {crash_log_path}"
            self._show_message(
                "Upload Rejected",
                (
                    "The server rejected this file. It doesn't look like a valid "
                    f"Skyrim SE/AE crash log.{file_info}\n\n"
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
        qInfo(f"[CrashLogQuickLink] Opening URL: {url}")
        try:
            if os.name == "nt":
                os.startfile(url)
            elif os.name == "posix":
                subprocess.run(["xdg-open", url], check=True)
            else:
                qInfo(f"[CrashLogQuickLink] Unsupported OS: {os.name}")
        except Exception as e:
            qInfo(f"[CrashLogQuickLink] Failed to open browser: {e}")

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


# ─────────────────────────────────────────────────────────────
# MO2 entry point
# ─────────────────────────────────────────────────────────────

def createPlugin() -> mobase.IPlugin:
    return CrashLogQuickLink()