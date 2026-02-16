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
            mobase.PluginSetting("pastebin_api_key", "Pastebin API Developer Key", "")
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
        
        if not api_key or api_key == "":
            qInfo("Pastebin API key not set in plugin settings")
            return None
        
        # Prepare the POST data
        data = {
            'api_option': 'paste',
            'api_dev_key': api_key,
            'api_paste_code': content,
            'api_paste_name': 'Skyrim SE Crash Log',
            'api_paste_format': 'text',
            'api_paste_private': '1',  # 0=public, 1=unlisted, 2=private
            'api_paste_expire_date': '1W'  # Expire after 1 week
        }
        
        # Encode the data
        encoded_data = urllib.parse.urlencode(data).encode('utf-8')
        
        try:
            # Make the POST request to Pastebin API
            req = urllib.request.Request('https://pastebin.com/api/api_post.php', data=encoded_data)
            with urllib.request.urlopen(req) as response:
                pastebin_url = response.read().decode('utf-8')
                
                # Check if the response is a valid URL
                if pastebin_url.startswith('https://pastebin.com/'):
                    qInfo(f"Successfully uploaded to Pastebin: {pastebin_url}")
                    return pastebin_url
                else:
                    qInfo(f"Pastebin API error: {pastebin_url}")
                    return None
        except Exception as e:
            qInfo(f"Error uploading to Pastebin: {e}")
            return None

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
        if not api_key or api_key == "":
            QMessageBox.warning(
                None, 
                "API Key Required", 
                "Please set your Pastebin API Developer Key in the plugin settings.\n\n"
                "You can get your API key from: https://pastebin.com/doc_api\n"
                "(You need to be logged into Pastebin)"
            )
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
        pastebin_url = self.upload_to_pastebin(crash_log_content)
        
        if not pastebin_url:
            QMessageBox.warning(
                None, 
                "Upload Failed", 
                "Failed to upload crash log to Pastebin. Please check your API key and try again."
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