import mobase
import os
from PyQt6.QtCore import qInfo
from typing import List
from PyQt6.QtGui import QIcon
import subprocess
import glob
from PyQt6.QtWidgets import QApplication
from PyQt6.QtWidgets import QMessageBox
import urllib.request
import urllib.parse
import gzip
import base64
import re

class CrashLogQuickLink(mobase.IPluginTool):
    _organizer: mobase.IOrganizer
    _modList: mobase.IModList
    _pluginList: mobase.IPluginList

    def __init__(self):
        super().__init__()

    def init(self, organizer: mobase.IOrganizer):
        self._organizer = organizer
        self._modList = organizer.modList()
        self._pluginList = organizer.pluginList()
        return True

    # Basic info
    def name(self) -> str:
        return "Crash Log Analyzer Quick Link"

    def author(self) -> str:
        return "Kyler, Phostwood"

    def icon(self):
        return QIcon()

    def description(self) -> str:
        return "Uploads the users most recent crash log to Pastebin or paste.rs and opens Phostwood's Crash Log Analyzer"
    
    def version(self) -> mobase.VersionInfo:
        return mobase.VersionInfo(1, 2, 0, mobase.ReleaseType.CANDIDATE)
    
    def tooltip(self) -> str:
        return "Uploads the users most recent crash log to Pastebin or paste.rs and opens Phostwood's Crash Log Analyzer"
    
    def isActive(self) -> str:
        return self._organizer.managedGame().feature(mobase.GamePlugins)
    
    def settings(self) -> List[mobase.PluginSetting]:
        return [
            mobase.PluginSetting("enabled", "enable this plugin", True),
            mobase.PluginSetting("pastebin_api_key", "Pastebin API Developer Key (optional - leave blank to use paste.rs)", ""),
            mobase.PluginSetting("paste_expiration", "Paste expiration (N=Never, 1D=1 Day, 1W=1 Week, 1M=1 Month, 1Y=1 Year)", "1W"),
            mobase.PluginSetting("always_copy_to_clipboard", "Always copy crash log to clipboard", True),
            mobase.PluginSetting("analyzer_url", "Crash Analyzer URL", "https://phostwood.github.io/crash-analyzer/skyrim.html")
        ]
    
    def get_analyzer_url(self):
        """Get the configured analyzer URL"""
        url = self._organizer.pluginSetting(self.name(), "analyzer_url")
        if not url or not url.strip():
            # Default if not set
            return "https://phostwood.github.io/crash-analyzer/skyrim.html"
        return url.strip()

    def displayName(self) -> str:
        return "Upload Crash Log and Open Analyzer"
    
    def redact_sensitive_info(self, content):
        """Redact sensitive information from crash log content"""
        qInfo("Redacting sensitive information from crash log...")
        
        # Redact drive letters (C:\, D:\, etc.) - don't require word boundary
        content = re.sub(r'([A-Z]):\\', r'[redacted]:\\', content)
        
        # Redact usernames in Windows paths (Users\USERNAME\)
        content = re.sub(r'\\Users\\([^\\]+)\\', r'\\Users\\[redacted]\\', content, flags=re.IGNORECASE)
        
        # Redact computer/machine names in UNC paths (\\COMPUTERNAME\)
        content = re.sub(r'\\\\([^\\]+)\\', r'\\\\[redacted]\\', content)
        
        # Redact email addresses
        content = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', r'[redacted]@[redacted]', content)
        
        # Redact IP addresses (IPv4)
        content = re.sub(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', r'[redacted IP]', content)
        
        qInfo("Sensitive information redacted")
        return content
    
    def get_crash_log_content(self):
        """Get the content of the most recent crash log"""
        if self._organizer.managedGame().gameName() == "Skyrim Special Edition":
            # Get users my_documents Path
            try:
                import ctypes.wintypes
                CSIDL_PERSONAL = 5 
                SHGFP_TYPE_CURRENT = 0
                buf = ctypes.create_unicode_buffer(ctypes.wintypes.MAX_PATH)
                ctypes.windll.shell32.SHGetFolderPathW(None, CSIDL_PERSONAL, None, SHGFP_TYPE_CURRENT, buf)
                my_documents = buf.value
                qInfo(f"My Documents folder: {my_documents}")
            except Exception:
                # User is probably using linux
                my_documents = "N/A"
                qInfo(f"My Documents folder: {my_documents}")
                qInfo("Failed to get My Documents folder path, likely running on non-Windows OS.")
                return None
            
            if my_documents != "N/A":
                crash_log_dir = os.path.join(my_documents, "My Games", "Skyrim Special Edition", "SKSE")
                # Grab the most recent crash log
                recent_crash_log = sorted(
                    glob.glob(os.path.join(crash_log_dir, "crash-*.log")),
                    key=os.path.getmtime,
                    reverse=True
                )[:1]
                
                if recent_crash_log:
                    crash_log_path = recent_crash_log[0]
                    # Read the crash log contents
                    try:
                        with open(crash_log_path, "r", encoding="utf-8") as f:
                            crash_log_contents = f.read()
                            # Redact sensitive information before returning
                            return self.redact_sensitive_info(crash_log_contents)
                    except Exception as e:
                        qInfo(f"Error reading crash log: {e}")
                        return None
                return None
        else:
            return None

    def prepare_content_for_upload(self, content, compress):
        """Prepare content for upload, compressing if requested"""
        content_bytes = content.encode('utf-8')
        content_size = len(content_bytes)
        
        qInfo(f"Original content size: {content_size} bytes ({content_size / 1024:.2f} KB)")
        
        if compress:
            qInfo("Compressing with gzip...")
            compressed = gzip.compress(content_bytes)
            # Encode as base64 so it can be transmitted as text
            encoded = base64.b64encode(compressed).decode('ascii')
            # Wrap in XML tags
            prepared_content = f"<gzip>{encoded}</gzip>"
            compressed_size = len(prepared_content.encode('utf-8'))
            qInfo(f"Compressed size: {compressed_size} bytes ({compressed_size / 1024:.2f} KB)")
            return prepared_content, compressed_size
        else:
            return content, content_size

    def upload_to_pastebin(self, content):
        """Upload content to Pastebin and return the URL"""
        # Get API key from settings
        api_key = self._organizer.pluginSetting(self.name(), "pastebin_api_key")
        expiration = self._organizer.pluginSetting(self.name(), "paste_expiration")
        
        if not api_key or not api_key.strip():
            qInfo("Pastebin API key not set in plugin settings")
            return None, "API key not configured"
        
        # Validate expiration value
        valid_expirations = ['N', '10M', '1H', '1D', '1W', '2W', '1M', '6M', '1Y']
        if expiration not in valid_expirations:
            qInfo(f"Invalid expiration '{expiration}', using default '1W'")
            expiration = '1W'
        
        qInfo(f"Uploading to Pastebin with expiration: {expiration}")
        qInfo(f"Content length: {len(content)} bytes")
        
        # Prepare the POST data
        data = {
            'api_option': 'paste',
            'api_dev_key': api_key.strip(),
            'api_paste_code': content,
            'api_paste_name': 'Skyrim SE Crash Log',
            'api_paste_format': 'text',
            'api_paste_private': '1',  # 0=public, 1=unlisted, 2=private
            'api_paste_expire_date': expiration
        }
        
        # Encode the data
        encoded_data = urllib.parse.urlencode(data).encode('utf-8')
        
        try:
            # Make the POST request to Pastebin API with proper headers
            req = urllib.request.Request('https://pastebin.com/api/api_post.php', data=encoded_data)
            # Add User-Agent header to avoid being blocked as a bot
            req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
            req.add_header('Content-Type', 'application/x-www-form-urlencoded')
            
            with urllib.request.urlopen(req, timeout=30) as response:
                pastebin_response = response.read().decode('utf-8').strip()
                qInfo(f"Pastebin response: {pastebin_response}")
                
                # Check if the response is a valid URL
                if pastebin_response.startswith('https://pastebin.com/'):
                    qInfo(f"Successfully uploaded to Pastebin: {pastebin_response}")
                    return pastebin_response, None
                else:
                    # Return the actual error message from Pastebin
                    qInfo(f"Pastebin API error: {pastebin_response}")
                    return None, pastebin_response
        except urllib.error.HTTPError as e:
            error_msg = f"HTTP Error {e.code}: {e.reason}"
            qInfo(f"HTTP Error uploading to Pastebin: {error_msg}")
            try:
                error_body = e.read().decode('utf-8')
                qInfo(f"Error body: {error_body}")
                return None, error_body
            except:
                return None, error_msg
        except urllib.error.URLError as e:
            error_msg = f"URL Error: {e.reason}"
            qInfo(f"URL Error uploading to Pastebin: {error_msg}")
            return None, error_msg
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            qInfo(f"Error uploading to Pastebin: {error_msg}")
            return None, error_msg

    def upload_to_paste_rs(self, content):
        """Upload content to paste.rs and return the URL"""
        qInfo("Uploading to paste.rs...")
        qInfo(f"Content length: {len(content)} bytes")
        
        try:
            req = urllib.request.Request('https://paste.rs/', data=content.encode('utf-8'))
            req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
            req.add_header('Content-Type', 'text/plain')
            
            with urllib.request.urlopen(req, timeout=30) as response:
                paste_url = response.read().decode('utf-8').strip()
                
                # Check response code
                if response.status == 201:  # Full upload successful
                    qInfo(f"Successfully uploaded to paste.rs: {paste_url}")
                    return paste_url, None
                elif response.status == 206:  # Partial upload - file too large
                    qInfo(f"Partial upload to paste.rs (file exceeded size limit): {paste_url}")
                    return None, "File exceeded paste.rs size limit (partial upload)"
                else:
                    qInfo(f"Unexpected paste.rs response code: {response.status}")
                    return None, f"Unexpected response code: {response.status}"
                    
        except urllib.error.HTTPError as e:
            error_msg = f"HTTP Error {e.code}: {e.reason}"
            qInfo(f"HTTP Error uploading to paste.rs: {error_msg}")
            return None, error_msg
        except urllib.error.URLError as e:
            error_msg = f"URL Error: {e.reason}"
            qInfo(f"URL Error uploading to paste.rs: {error_msg}")
            return None, error_msg
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            qInfo(f"Error uploading to paste.rs: {error_msg}")
            return None, error_msg

    def open_website(self, url):
        '''
            Opens a website URL in the default web browser.
            Makes a best effort to do so across different operating systems.
        '''
        if os.name == "nt":
            os.startfile(url)
        elif os.name == "posix":
            qInfo(f"Opening URL: {url}")
            subprocess.run(["xdg-open", url], check=True)
        else:
            qInfo(f"Cannot open URL on unsupported OS: {os.name}")

    # Plugin Logic
    def display(self) -> bool:
        # Get crash log content
        crash_log_content = self.get_crash_log_content()
        
        if not crash_log_content:
            QMessageBox.warning(
                None, 
                "No Crash Log Found", 
                "Could not find crash log.\n\n"
                "Possible reasons:\n"
                "- No crash logs exist yet\n"
                "- Current game is not supported (only Skyrim SE is supported)\n"
                "- SKSE crash logger is not installed\n\n"
                "💡 TIP: You can configure plugin settings in:\n"
                "Settings → Plugins → Crash Log Analyzer Quick Link"
            )
            return False
        
        # Get settings
        api_key = self._organizer.pluginSetting(self.name(), "pastebin_api_key")
        always_copy = self._organizer.pluginSetting(self.name(), "always_copy_to_clipboard")
        analyzer_url = self.get_analyzer_url()
        has_pastebin_key = api_key and api_key.strip()
        
        qInfo(f"Using analyzer URL: {analyzer_url}")
        
        # Check original size
        original_size = len(crash_log_content.encode('utf-8'))
        original_size_kb = original_size / 1024
        
        qInfo(f"Original size: {original_size} bytes ({original_size_kb:.2f} KB)")
        
        # Smart routing based on size and API key availability
        if has_pastebin_key:
            # User has Pastebin API key
            if original_size <= 512 * 1024:
                # ≤ 512KB: Send uncompressed to Pastebin
                qInfo("Route: Pastebin (uncompressed, ≤512KB)")
                prepared_content, final_size = self.prepare_content_for_upload(crash_log_content, compress=False)
                service_name = "Pastebin"
                was_compressed = False
                paste_url, error_message = self.upload_to_pastebin(prepared_content)
            else:
                # > 512KB: Send compressed to Pastebin
                qInfo("Route: Pastebin (compressed, >512KB)")
                prepared_content, final_size = self.prepare_content_for_upload(crash_log_content, compress=True)
                service_name = "Pastebin"
                was_compressed = True
                paste_url, error_message = self.upload_to_pastebin(prepared_content)
        else:
            # No Pastebin API key
            if original_size <= 512 * 1024:
                # ≤ 512KB: Send uncompressed to paste.rs
                qInfo("Route: paste.rs (uncompressed, ≤512KB)")
                prepared_content, final_size = self.prepare_content_for_upload(crash_log_content, compress=False)
                service_name = "paste.rs"
                was_compressed = False
                paste_url, error_message = self.upload_to_paste_rs(prepared_content)
            else:
                # > 512KB: Clipboard only (but show what compressed size would be)
                qInfo("Route: Clipboard only (>512KB, no API key)")
                # Calculate what the compressed size would be to show the user
                compressed_content, compressed_size = self.prepare_content_for_upload(crash_log_content, compress=True)
                compressed_size_kb = compressed_size / 1024
                
                QApplication.clipboard().setText(crash_log_content)
                self.open_website(analyzer_url)
                
                QMessageBox.information(
                    None,
                    "Crash Log Too Large - API Key Recommended",
                    f"Your crash log is too large for paste.rs ({original_size_kb:.2f} KB).\n\n"
                    f"ℹ️ With compression, this would be {compressed_size_kb:.2f} KB\n\n"
                    f"📋 WHAT WE DID:\n"
                    f"✓ Copied crash log to your clipboard\n"
                    f"✓ Opened the analyzer in your browser\n\n"
                    f"📝 NEXT STEPS:\n"
                    f"1. Click in the text area and paste (Ctrl+V)\n"
                    f"2. Click 'Analyze' to see the results\n\n"
                    f"💡 TIP: Get a FREE Pastebin API key for larger uploads!\n"
                    f"• Takes only 30 seconds to sign up at pastebin.com\n"
                    f"• Supports files up to 512MB with compression\n"
                    f"• Your {original_size_kb:.2f} KB file would compress to {compressed_size_kb:.2f} KB\n\n"
                    f"⚙️ Plugin Settings: Settings → Plugins → Crash Log Analyzer Quick Link"
                )
                return True
        
        final_size_kb = final_size / 1024
        
        if not paste_url:
            # Upload failed - use clipboard
            QApplication.clipboard().setText(crash_log_content)
            self.open_website(analyzer_url)
            
            error_detail = f"\nError: {error_message}" if error_message else ""
            
            QMessageBox.warning(
                None,
                f"Upload to {service_name} Failed",
                f"Failed to upload to {service_name}.{error_detail}\n\n"
                f"📋 WHAT WE DID:\n"
                f"✓ Copied crash log to your clipboard as fallback\n"
                f"✓ Opened the analyzer in your browser\n\n"
                f"📝 NEXT STEPS:\n"
                f"1. Click in the text area and paste (Ctrl+V)\n"
                f"2. Click 'Analyze' to see the results\n\n"
                f"💡 TIP: If this keeps failing:\n"
                f"• Check your internet connection\n"
                f"• Try adding a Pastebin API key (free, takes 30 seconds)\n\n"
                f"⚙️ Plugin Settings: Settings → Plugins → Crash Log Analyzer Quick Link"
            )
            return False
        
        # Upload succeeded
        if always_copy:
            QApplication.clipboard().setText(paste_url)
            clipboard_status = "✓ Paste URL copied to clipboard"
        else:
            clipboard_status = "ℹ Clipboard not used (disabled in settings)"
        
        analyzer_url_with_log = f"{analyzer_url}?log={urllib.parse.quote(paste_url)}"
        self.open_website(analyzer_url_with_log)
        
        # Build compression message
        if was_compressed:
            compression_msg = f" (compressed from {original_size_kb:.2f} KB)"
        else:
            compression_msg = ""
        
        QMessageBox.information(
            None,
            "Upload Successful",
            f"📋 WHAT WE DID:\n"
            f"✓ Uploaded to {service_name} ({final_size_kb:.2f} KB{compression_msg})\n"
            f"✓ Opened the analyzer in your browser\n"
            f"{clipboard_status}\n\n"
            f"📝 NEXT STEPS:\n"
            f"The analyzer should load your crash log automatically.\n\n"
            f"🔗 Paste URL: {paste_url}\n\n"
            f"⚙️ Plugin Settings: Settings → Plugins → Crash Log Analyzer Quick Link"
        )
        return True


def createPlugin() -> mobase.IPlugin:
    return CrashLogQuickLink()