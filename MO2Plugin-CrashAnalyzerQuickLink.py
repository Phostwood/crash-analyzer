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
        return "Uploads the users most recent crash log to Pastebin and opens Phostwood's Crash Log Analyzer"
    
    def version(self) -> mobase.VersionInfo:
        return mobase.VersionInfo(1, 0, 0, mobase.ReleaseType.CANDIDATE)
    
    def tooltip(self) -> str:
        return "Uploads the users most recent crash log to Pastebin and opens Phostwood's Crash Log Analyzer"
    
    def isActive(self) -> str:
        return self._organizer.managedGame().feature(mobase.GamePlugins)
    
    def settings(self) -> List[mobase.PluginSetting]:
        return [
            mobase.PluginSetting("enabled", "enable this plugin", True),
            mobase.PluginSetting("pastebin_api_key", "Pastebin API Developer Key (required)", ""),
            mobase.PluginSetting("paste_expiration", "Paste expiration (N=Never, 1D=1 Day, 1W=1 Week, 1M=1 Month, 1Y=1 Year)", "1W")
        ]
    

    def displayName(self) -> str:
        return "Upload Crash Log to Pastebin and Open Analyzer"
    
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
                            return crash_log_contents
                    except Exception as e:
                        qInfo(f"Error reading crash log: {e}")
                        return None
                return None
        else:
            return None

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
        # Check if API key is set
        api_key = self._organizer.pluginSetting(self.name(), "pastebin_api_key")
        if not api_key or not api_key.strip():
            QMessageBox.information(
                None, 
                "API Key Required", 
                "Please configure your Pastebin API Developer Key in the plugin settings.\n\n"
                "HOW TO CONFIGURE:\n"
                "1. Go to https://pastebin.com and create a free account (or log in)\n"
                "2. Visit https://pastebin.com/doc_api to get your API key\n"
                "3. In Mod Organizer 2, go to: Settings → Plugins → Crash Log Analyzer Quick Link\n"
                "4. Paste your API key in the 'Pastebin API Developer Key' field\n"
                "5. (Optional) Change 'Paste expiration' setting (default: 1W = 1 week)\n\n"
                "Click OK to open the Pastebin API page in your browser."
            )
            # Open the API page for convenience
            self.open_website("https://pastebin.com/doc_api")
            return False
        
        # Get crash log content
        crash_log_content = self.get_crash_log_content()
        
        if not crash_log_content:
            QMessageBox.warning(
                None, 
                "Failure", 
                "Could not find crash log. It's possible the current game is not supported or no crash logs exist!"
            )
            return False
        
        # Upload to Pastebin
        pastebin_url, error_message = self.upload_to_pastebin(crash_log_content)
        
        if not pastebin_url:
            error_detail = f"\n\nError details:\n{error_message}" if error_message else ""
            QMessageBox.warning(
                None, 
                "Upload Failed", 
                f"Failed to upload crash log to Pastebin.{error_detail}\n\n"
                "Possible issues:\n"
                "- Invalid API key (check it was copied correctly)\n"
                "- No internet connection\n"
                "- Pastebin service is down\n"
                "- Firewall blocking the connection\n\n"
                "Check the MO2 log for more details."
            )
            return False
        
        # Build the analyzer URL with the Pastebin URL as a query parameter
        analyzer_url = f"https://phostwood.github.io/crash-analyzer/skyrim.html?log={urllib.parse.quote(pastebin_url)}"
        
        # Open the analyzer with the log URL
        self.open_website(analyzer_url)
        
        # Also copy to clipboard as backup
        QApplication.clipboard().setText(pastebin_url)
        
        QMessageBox.information(
            None, 
            "Success", 
            f"Crash log uploaded to Pastebin!\n\n"
            f"URL: {pastebin_url}\n\n"
            f"The URL has been copied to your clipboard and sent to the analyzer."
        )
        
        return True


def createPlugin() -> mobase.IPlugin:
    return CrashLogQuickLink()