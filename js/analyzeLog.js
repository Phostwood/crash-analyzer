let attempts = 0;
function checkUtilsReady() {
  if (Utils.isReady) {
    Utils.debuggingLog(['checkUtilsReady', 'analyzeLog.js'], 'Utils is ready, initializing analyzeLog.js');
  } else {
    attempts++;
    if (attempts > 2) {
      console.warn(`Utils not ready yet. Attempt ${attempts}. Retrying in 500ms...`);
    }
    setTimeout(checkUtilsReady, 500);
  }
}
checkUtilsReady();


// - - - Main Function - - - 
async function analyzeLog() {
    Utils.debuggingLog(['analyzeLog', 'analyzeLog.js'], 'Entering analyzeLog');
    let logFile = document.getElementById('crashLog').value;
    Utils.debuggingLog(['analyzeLog', 'analyzeLog.js'], 'logFile length:', logFile.length);
    Utils.debuggingLog(['analyzeLog', 'analyzeLog.js'], 'logFile type:', typeof logFile);
    Utils.debuggingLog(['analyzeLog', 'analyzeLog.js'], 'First 100 characters of logFile:', logFile.substring(0, 100));

    clearResult();
    const { sections, sectionsMap } = Utils.getLogSectionsMap(logFile);
    if (Object.keys(sections).length === 0) {
        console.error('ERROR: Unable to process log sections. Skipping analysis.');
        return { insights: 'Unable to process log file. Unknown log type detected.', insightsCount: 0 };
    }
    Utils.debuggingLog(['analyzeLog', 'analyzeLog.js'], 'Log file length:', logFile.length);
    Utils.debuggingLog(['analyzeLog', 'analyzeLog.js'], 'Sections:', Object.keys(sections));
    Utils.debuggingLog(['analyzeLog', 'analyzeLog.js'], 'SectionsMap size:', sectionsMap.size);
    
    let diagnoses = '';
    let diagnosesCount = 0;
    let insights = '';
    let insightsCount = 0;

    Utils.splitLogIntoLines(logFile);

    //DISABLE UNLESS NEEDED: NolvusUtils.compareLogToVanillaNolvusPluginsLines(logFile);	
    //DISABLE UNLESS NEEDED: NolvusUtils.compareLogToVanillaNolvusModulesLines(logFile);	
    
    // Split topHalf into lines
    const topHalfLines = sections.topHalf.split('\n');


    // Verify NetScriptFramework
    if (sections.logType === 'Unknown') {

        diagnoses += '<li>❌ <b>Incompatible Log File:</b> Unfortunately, this analyzer can only process logs from NetScriptFramework. If you are not using Nolvus, you will need to install the <a href="https://www.nexusmods.com/skyrimspecialedition/mods/21294">.NET Script Framework mod</a> to obtain compatible crash logs. If you\'re using Nolvus, you can find your compatible crash logs at <code>[YOUR_DRIVE]\\Nolvus\\Instances\\Nolvus Ascension\\MODS\\overwrite\\NetScriptFramework\\Crash</code></li>';
        diagnosesCount++;
    }

    // Verify NOT IOException type of crash log
    if (sections.firstLine.includes('Unhandled managed exception (IOException)')) {
        diagnoses += '<li>❌ <b>Incompatible IOException Log File:</b> Unfortunately, this analyzer cannot process crash logs that start with "Unhandled managed exception (IOException)". These types of logs are rare and currently unsupported.Please reach out to the Nolvus/Skyrim community for additional assistance.</li>';
        diagnosesCount++;
    }

    // Check for .STRINGS crash
    var R14StringsRegex = /R14.*\.STRINGS/; // Regular expression to match "R14" and ".STRINGS" on the same line
    if (R14StringsRegex.test(sections.topHalf)) {
        diagnoses += '<li>🎯 <b>.STRINGS Crash Detected:</b> Remove any unique character in your <b>skyrim.ini</b> file\'s <code>sLanguage=ENGLISH</code> line.  More information and troubleshooting tips under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-1">.STRINGS Crash</a/>.</li>';
        diagnosesCount++;
    }

    // Check for VRAMr Gorehowl crash (specific variant of D6DDDA crash)
    if (sections.firstLine.includes('D6DDDA') && sections.relevantObjects.includes('Gorehowl')) {
        diagnoses += '<li>🎯 <b>VRAMr Gorehowl Crash Detected:</b> If you are using VRAMr, try temporarily disabling VRAMr\'s output mod to get past the "Night at the Museum" quest, and then re-enable afterwards. Alternately, delete the "clgorehowl" textures .dds image files. Or, just hide their VRAMr overrides in MO2. <code>NOTE: the VRAMr mod author fixed this issue in his April 19, 2024 version.</code></li>';
        diagnosesCount++;
    }

    // Check for JContainers crash
    if (sections.firstLine.includes('JContainers64.dll+10AE45')) {
        diagnoses += '<li>🎯 <b>JContainers Crash Detected:</b> Go to <a href="https://www.nexusmods.com/skyrimspecialedition/mods/108591?tab=files&file_id=458596">Discrepancy\'s patch settings hub</a> and add the <b>JContainers Crash Workaround</b> mod (from the "Files" section) into Mod Organizer 2 (MO2). If you would like guidance on modding/patching Nolvus, please watch this <a href="https://youtu.be/YOvug9KP5L4">brief tutorial video</a> for step-by-step instructions. More information and troubleshooting tips under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-4">JContainers Crash</a/>.</li>';
        diagnosesCount++;
    }

    // Check for Mihail Sithis crash
    if (sections.topHalf.includes('Wraith of Sithis') && sections.topHalf.includes('mihailmmasithis.esp')) {
        diagnoses += '<li>🎯 <b>Gravelord / "Wraith of Sithis" Crash Detected:</b> This crash is usually associated with MihailMods\' "Wraith of Sithis" conflicting with Odin - Skyrim Magic Overhaul, and may occur shortly after an encounter where a character or NPC summons a Wraith of Sithis. Despite the name, it is not directly related to Gravelords. To resolve this issue:</li>' +
            '<ul>' +
            '<li>Go to <a href="https://www.nexusmods.com/skyrimspecialedition/mods/108591">Discrepancy\'s patch settings hub</a> and download the <b>Odin and Gravelords Compatibility Patch</b>.</li>' +
            '<li>During installation for Nolvus Ascension version 5, select the option for the Gravelords Standalone version (mihailmmasithis.esp).</li>' +
            '<li>This patch can be safely installed mid-game.</li>' +
            '<li>Ensure the plugin is positioned above FNIS.esp. For a guide on modding/patching Nolvus, view this <a href="https://youtu.be/YOvug9KP5L4">tutorial video</a>.</li>' +
            '<li>Find more information and troubleshooting tips under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-8">Mihail Sithis Crash</a>.</li>' +
            '</ul>';
        diagnosesCount++; // Increment the count of diagnoses detected
    }


    // Check for A0D789 crash
    if (sections.firstLine.includes('(SkyrimSE.exe+A0D789)')) {
        diagnoses += '<li>🎯 <b>A0D789 Crash Detected:</b> Reload game and continue playing, or alternatively, add the <a href="https://www.patreon.com/posts/se-ae-69951525">[SE/AE]A0D789patch</a> patch by kingeric1992 into Mod Organizer (MO2). If you would like guidance on modding/patching Nolvus, please watch this <a href="https://youtu.be/YOvug9KP5L4">brief tutorial video</a> for step-by-step instructions. NOTE: this specific patch does NOT have a plugin that shows up in the right side of MO2. More information and troubleshooting tips under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-10">A0D789 Crash</a/>.</li>';
        diagnosesCount++;
    }

    // Check for USVFS crash
    if (sections.probableCallstack.toLowerCase().includes('usvfs_x64.dll')) {
        diagnoses += '<li>🎯 <b>USVFS Crash Detected:</b> An antivirus (most frequently, Webroot or Bitdefender) is blocking the MO2 file system. Either change your antivirus, or disable your antivirus, and/or create an exception for the entire Nolvus directory. More information and troubleshooting tips under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-12">USVFS Crash</a/>.</li>';
        diagnosesCount++;
    }
    // Check for Alphabetized Load Order crash
    var percentAlphabetized = Utils.getPercentAlphabetized(logFile);
    if (percentAlphabetized > 70) {
        diagnoses += '<li>🎯 <b>Alphabetized Load Order Detected:</b> This log file\'s .esp mods are ' + percentAlphabetized + '% alphabetized in their load order. Open the Nolvus Dashboard, click on "Manage" then "Instance". Once loaded, click on <b>"Apply Order"</b>. For more information and a screenshot, see this r/Nolvus post <a href="https://www.reddit.com/r/Nolvus/comments/1chuod0/how_to_apply_order_button_usage_in_the_nolvus/">How To: "Apply Order" button usage in the Nolvus Dashboard</a>. Also, if you have customized Nolvus with additional mods, review information on the <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-7">Load Order Crash</a>. ⚠️NOTE: Any added mods will be disabled and moved to the bottom of your list, so you\'ll have to manually re-order and re-enable those, but your vanilla Nolvus mods will be returned to their intended order.</li>';
        diagnosesCount++;
    }

    // Check for 12F4797 Physics crash
    if (sections.firstLine.toLowerCase().includes('12F4797'.toLowerCase()) && sections.relevantObjects.toLowerCase().includes("NiCamera(Name: `WorldRoot Camera`)".toLowerCase()) && sections.relevantObjects.toLowerCase().includes("BSMultiBoundRoom(Name: null)".toLowerCase())) {
        diagnoses += '<li>🎯 <b>12F4797 Physics Crash Detected:</b> This issue is commonly encountered in Ancestor Glade (or possibly from a recent save made from Ancestor Glade) and may be linked to having a large number of physics-enabled objects active at once, such as the player\'s own armor and hair. The <b>workaround</b> is to swap out these items for non-physics counterparts. Also, if your character or follower has physics enabled hair, you should wear a non-physics helmet to cover it up.</li>';
        diagnosesCount++;
    }

    // Check for Medal streaming software
    if (logFile.includes('medal-hook64.dll')) {
        diagnoses += '<li>🎯 <b>Medal Streaming Software Detected:</b> Medal streaming software has been frequently reported to cause issues with Nolvus, particularly severe graphical darkness/distortions and crashes to desktop (CTDs). These problems have reportedly been escalating with recent updates to Medal. To prevent these issues, we recommend the following actions: <ul><li>Disable Medal via its settings before running Nolvus.</li><li>If disabling does not work, terminate the Medal process using Windows Task Manager.</li><li>As a last resort, consider uninstalling Medal completely from your system.</li></ul></li>';
        diagnosesCount++; // Increment the count of diagnoses detected
    }

    //NVIDIA graphics driver
    if (sections.firstLine.toLowerCase().includes('nvwgf2umx.dll') || sections.firstLine.toLowerCase().includes('nvlddmkm.sys') || sections.firstLine.toLowerCase().includes('nvoglv32.dll') || sections.firstLine.toLowerCase().includes('nvoglv64.dll') || sections.firstLine.toLowerCase().includes('nvwgf2um.dll') || sections.firstLine.toLowerCase().includes('nvapi64.dll')) {
        diagnoses += '<li>🎯 <b>NVIDIA Driver Issue Detected:</b> The appearance of NVIDIA driver .dll files in the first line of your crash log is often associated with NVIDIA graphics driver issues. To resolve this, try the following steps:<ol>' +
            '<li><b>Update your NVIDIA drivers</b> to the latest version. You can download the latest drivers from the <a href="https://www.nvidia.com/Download/index.aspx">NVIDIA website</a>.</li>' +
            '<li>Check for any GPU overclocking settings that may be causing instability and reset them to default if necessary.</li>' +
            '<li>If the above does not resolve the issue, try performing a clean installation of the drivers using a tool like Display Driver Uninstaller (DDU) to remove all traces of the previous drivers before installing the new ones.</li>' +
            '</ol></li>';
        diagnosesCount++;
    }


    //SkyrimUpscaler crash
    // Files names from Puredark's Upscalers:
    // All three: SkyrimUpscaler.dll, nvngx_dlss.dll, PDPerfPlugin.dll
    // Free version: (nothing else added besides those shared by all three (see above))
    // V11 adds: XeFX_Loader.dll, ffx_fsr2_api_dx12_x64.dll, ffx_fsr2_api_x64.dll, igxess.dll, libxess.dll, XeFX.dll
    // V12 adds: ffx_fsr2_api_x64.dll, ffx_fsr2_api_dx11_x64.dll, libxess.dll
    // FSR3 version for RTX 40xx series has:  nvngx_dlssg.dll, nvngx_dlss.dll, ("All three" above?), (more ???)
    // NOTE: apparently not all of the above show up in crash logs, but I'm listing them here for reference
    if (sections.firstLine.toLowerCase().includes('nvngx_dlss.dll') || sections.firstLine.toLowerCase().includes('PDPerfPlugin.dll'.toLowerCase()) || sections.firstLine.toLowerCase().includes('SkyrimUpscaler.dll'.toLowerCase())) {
        diagnoses += '<li>🎯 <b>Upscaler Issue Detected:</b> The appearance of ‘SkyrimUpscaler.dll,’ ‘PDPerfPlugin.dll,’ or ‘nvngx_dlss.dll’ in the first line of your crash log is often associated with NVIDIA graphics drivers and/or Puredark’s upscalers. To resolve this, try the following steps:<ol>' +
            '<li><b>Update your NVIDIA drivers</b> to the latest version. You can download the latest drivers from the <a href="https://www.nvidia.com/Download/index.aspx">NVIDIA website</a>.</li>' +
            '<li>If you are using one of Puredark\'s <a href="https://www.patreon.com/collection/50002?view=expanded">paid FSR2 or FSR3 Upscalers</a> (rather than his free FSR2 version included with Nolvus): <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            '<li><b>Check hardware compatibility:</b> This issue may also arise due to incompatible hardware (e.g., AMD instead of NVIDIA, GTX instead of RTX, RTX non-40xx instead of RTX 40xx).</li>' +
            '<li><b>Review settings:</b> Ensure that you follow the recommended settings in the <a href="https://docs.google.com/document/d/1YVFKcJN2xuvhln9B6vablzOzQu-iKC4EDcbjOW-SEsA/edit?usp=sharing">Nolvus DLSS Upscaler Installation Guide</a>. Confirm that you have the correct version and settings for your graphics card.</li>' +
            '</ul></li>' +
            '<li>Check for any GPU overclocking settings that may be causing instability and reset them to default if necessary.</li>' +
            '<li>If the above does not resolve the issue, optionally try performing a clean installation of the drivers using a tool like Display Driver Uninstaller (DDU) to remove all traces of the previous drivers before installing the new ones.</li>' +
            '<li>Alternatively, disable the upscaler and opt for TAA (Temporal Anti-Aliasing), as demonstrated on the website under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-11">PDPerfPlugin Crash</a/>.</li>' +
            '<li>If issue persists, share your crash logs with <a href="https://www.reddit.com/r/Nolvus/">r/Nolvus</a> and/or the <a href="https://discord.gg/Zkh5PwD">Nolvus Discord</a></li>' +
            '</ol></li>';
        diagnosesCount++;
    }

    //Paid FSR3 Upscaler
    if (sections.firstLine.toLowerCase().includes('nvngx_dlssg.dll')) {
        diagnoses += '<li>🎯 <b>Paid FSR3 Upscaler Issue Detected:</b> Having the "nvngx_dlssg.dll" error showing up in the first line of your crash log is frequently linked to NVIDIA graphics drivers and/or Puredark\'s paid upsclaler (FG Build Alpha 03 and later). To resolve this, try the following steps:<ol>' +
            '<li><b>Update your NVIDIA drivers</b> to the latest version. You can download the latest drivers from the <a href="https://www.nvidia.com/Download/index.aspx">NVIDIA website</a>.</li>' +
            '<li><b>Incompatible settings in the upscaler:</b> Choosing a bad upscale type or other setting can cause this issue. Review and verify the recommended settings in <a href="https://docs.google.com/document/d/1YVFKcJN2xuvhln9B6vablzOzQu-iKC4EDcbjOW-SEsA/edit?usp=sharing">Nolvus DLSS Upscaler Installation Guide</a>.</li>' +
            '<li><b>Incompatible hardware:</b> This issue can also be caused by incompatible hardware (AMD instead of NVIDIA, GTX instead of RTX, RTX non-40xx intead of  RTX 40xx, and so on).</li>' +
            '<li>Check for any GPU overclocking settings that may be causing instability and reset them to default if necessary.</li>' +
            '<li>If the above does not resolve the issue, try performing a clean installation of the drivers using a tool like Display Driver Uninstaller (DDU) to remove all traces of the previous drivers before installing the new ones.</li>' +
            '</ol></li>';
        diagnosesCount++;
    }

    // Check for KERNELBASE JSON Crash
    if (sections.firstLine.toLowerCase().includes('KERNELBASE.dll'.toLowerCase()) && sections.topHalf.includes('json.exception.parse_error')) {
        diagnoses += '<li>🎯<b>KERNELBASE JSON Crash Detected:</b> Usually, this issue stems from one of three causes:<ol>' +
            '<li>Overwriting or reinstalling <b>SSE Engine Fixes</b> can cause the <code>MaxStdio</code> value to be set too low, which can lead to crashes in Nolvus. For example, an individual who reinstalled papermaps found that it reset their SSE Engine Fixes values. To fix this:<ol>' +
            '<li>Open Mod Organizer 2 (MO2).</li>' +
            '<li>In the "1.2 BUG FIXES & TWEAKS" section, right-click on "SSE Engine Fixes" and select "Information...".</li>' +
            '<li>Click on the "Textfiles" tab.</li>' +
            '<li>Find and open the file <code>EngineFixes.toml</code>.</li>' +
            '<li>Locate the line <code>MaxStdio =</code> and restore the value to:  <code>MaxStdio = 8192</code>.</li>' +
            '<li>Click "Close" and "Yes" to save the changes.</li>' +
            '</ol></li>' +
            '<li>Storage files (.json files) have become <b>corrupted/broken.</b> This is especially common if you have manually edited a .json file. After identifying the specific file, either manually repair it, revert the file to a backup, or delete it, allowing the accessing mod(s) to create a new one. Other mods mentioned in the crash log may help to identify the specific storage file, or seek assistance from the Nolvus community.' +
            '<li>Windows <b>permissions</b> have become overly restrictive and are blocking access to necessary mod storage. The usual solution is to reset your file permissions. See <a href="https://www.thewindowsclub.com/how-to-reset-file-folder-permissions-to-default-in-windows-10">How to reset all User Permissions to default in Windows 11/10</a>, or seek assistance from the Nolvus community.' +
            '</ol>' +
            'For the last two issues, an easy <b>workaround</b> is to <a href = "https://support.microsoft.com/en-us/windows/create-a-local-user-or-administrator-account-in-windows-20de74e0-ac7f-3502-a866-32915af2a34d#WindowsVersion=Windows_11">create a new Windows User</a> and create a new Nolvus save (playthrough) from the new user.</li>';
        diagnosesCount++;
    }

    // Check for KERNELBASE JContainers Crash
    if (sections.firstLine.toLowerCase().includes('KERNELBASE.dll'.toLowerCase()) && sections.probableCallstack.includes('JContainers64.dll')) {
        diagnoses += '<li>🎯<b>KERNELBASE JContainers Crash Detected:</b> Usually, this issue stems from one of three causes:<ol>' +
            '<li>JContainers may need patched. Go to <a href="https://www.nexusmods.com/skyrimspecialedition/mods/108591?tab=files&file_id=458596">Discrepancy\'s patch settings hub</a> and add the <b>JContainers Crash Workaround</b> mod (from the "Files" section) into Mod Organizer 2 (MO2). If you would like guidance on modding/patching Nolvus, please watch this <a href="https://youtu.be/YOvug9KP5L4">brief tutorial video</a> for step-by-step instructions.</li>' +
            '<li>Windows <b>permissions</b> may have become overly restrictive and are blocking access to necessary mod storage. The usual solution is to reset your file permissions. See <a href="https://www.thewindowsclub.com/how-to-reset-file-folder-permissions-to-default-in-windows-10">How to reset all User Permissions to default in Windows 11/10</a>, or seek assistance from the Nolvus community.</li>' +
            '<li>Storage files (JContainer\'s .json files) may have become <b>corrupted/broken.</b> These files often reside in your `..\\Documents\\My Games\\Skyrim Special Edition\\JCUser` folder, but can be located in mod-specific locations. This issue is especially common if you have manually edited a .json file. After identifying the specific file, either manually repair it, revert the file to a backup, or delete it, allowing the accessing mod(s) to create a new one. Other mods mentioned in the crash log may help to identify the specific storage file, or seek assistance from the Nolvus community.</li>' +
            '</ol>' +
            'Also, for some of these issues, an easy <b>workaround</b> is to <a href = "https://support.microsoft.com/en-us/windows/create-a-local-user-or-administrator-account-in-windows-20de74e0-ac7f-3502-a866-32915af2a34d#WindowsVersion=Windows_11">create a new Windows User</a> and create a new Nolvus save (playthrough) from the new user.</li>';
        diagnosesCount++;
    }

    // Check for KERNELBASE Crash excluding JContainers and JSON parse error
    if (sections.firstLine.toLowerCase().includes('KERNELBASE.dll'.toLowerCase()) && !sections.probableCallstack.includes('JContainers64.dll') && !sections.topHalf.includes('json.exception.parse_error')) {
        diagnoses += '<li>❗<b>KERNELBASE Crash Detected:</b> This rare issue could be related to a specific added mod, or to hardware or a system-wide issue. Here are some steps you can take:<ol>' +
            '<li>Check the <b>Windows Event Log</b> for any related issues. You can do this by opening the Event Viewer (search for it in the Start Menu), then navigate to Windows Logs > Application. Look for any recent errors that might be related to your issue. For detailed instructions, see this <a href="https://support.microsoft.com/en-us/windows/open-event-viewer-17d427d2-43d6-5e01-8535-1fc570ea8a14">Microsoft guide</a>.</li>' +
            '<li>If the issue persists, consider reaching out to the <b>Nolvus Discord</b> for additional help.</li>' +
            '</ol></li>';
        diagnosesCount++;
    }


    // Check for D6DDDA crash
    if (sections.firstLine.toLowerCase().includes('D6DDDA'.toLowerCase())) {
        diagnoses += '<li>❗<b>D6DDDA Crash Detected:</b> This may occur when either RAM or VRAM has been exceeded, or due to broken/corrupt meshes (.nif) or textures (.dds). Here are some steps to address this:<ul>' +
            '<li>Close any unnecessary applications to free up memory.</li>' +
            '<li>Verify that you have correctly <a href="https://www.nolvus.net/appendix/pagefile">set your Windows Pagefile Size</a>.</li>' +
            '<li>If your PC has less than 12GB of VRAM (more for wide screen and/or monitors more than 2K) (<a href="https://www.lifewire.com/how-to-check-vram-5235783">how to check how much VRAM you have</a>), consider running your load order through <a href="https://www.reddit.com/r/Nolvus/comments/1doakj1/psa_use_vramr_if_you_have_12gb_of_vram/">VRAMr</a>.</li>' +
            '<li>If you are playing vanilla Nolvus and this issue persists, it could (rarely) indicate hardware issues.</li>' +
            '</ul>' +
            'For more information and troubleshooting tips, see the <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-2">D6DDDA Crash</a> section and the second instance of this test in the "Advanced Users" section of this analyzer.</li>';
        diagnosesCount++;
    }

    //Missing Master 2.1
    function checkForMissingMasters(sections) {
        let diagnoses = '';
    
        if ((sections.hasSkyrimAE && sections.firstLine.includes('0198090')) ||
            (!sections.hasSkyrimAE && (sections.firstLine.includes('5E1F22'))) ||
            sections.topHalf.includes('SettingT<INISettingCollection>*')) {
            
            diagnoses += '<li>❗<b>Potential Missing Masters Detected:</b> Your load order may be missing required master files. This can cause instability and crashes. Here are some possible causes and solutions:<ul>';
    
            if (!Utils.isSkyrimPage) {
                diagnoses += '<li><b>Standard Nolvus Install:</b> If you haven\'t added/updated or removed any mods, try using the Nolvus Dashboard\'s "Apply Order" feature. This often resolves load order issues. For more information, see: <a href="https://www.reddit.com/r/Nolvus/comments/1chuod0/how_to_apply_order_button_usage_in_the_nolvus/">How To: Use the "Apply Order" Button</a>. You can safely ignore the rest of the steps here.</li>';
            }
    
            if (!sections.hasNewEslSupport) {
                diagnoses += '<li><b>New Mod Incompatibility:</b> Recently added mods may be causing conflicts. If you are using a version of Skyrim before 1.6.1130, but have added a mod designed with the newest type of ESL files, we suggest installing <a href="https://www.nexusmods.com/skyrimspecialedition/mods/106441">Backported Extended ESL Support (BEES)</a>, though this doesn\'t always resolve all incompatibilities.</li>';
            }
    
            diagnoses +=
                '<li><b>Identifying Missing Masters:</b> Mod Organizer 2 (MO2) typically displays warning icons (yellow triangle with exclamation mark) for plugins with missing masters. <a href="https://imgur.com/izlF0GO">View Screenshot</a>.</li>' +
    
                '<li><b>Missing Dependency:</b> If you\'ve recently removed, disabled, or forgot to install a required mod, others may still depend on it. You might need to either install the missing dependency or remove its master requirement from dependent plugins. See this guide on <a href="https://github.com/LivelyDismay/Learn-To-Mod/blob/main/lessons/Remove%20a%20Master.md">Removing a Master Requirement</a>.</li>' +
    
                '<li><b>Version Mismatch:</b> Ensure all your mods are compatible with your Skyrim version (SE or AE). Always check the mod\'s description page for version compatibility.</li>';
            
            if (Utils.isSkyrimPage) {
                diagnoses += `
                <li><b>Using LOOT for diagnostics:</b>
                    <a href="https://loot.github.io/">LOOT</a> can be a valuable diagnostic tool, but use it with ⚠️CAUTION:
                    <ul>
                        <li>LOOT can be effective for identifying missing masters, version incompatibilities, and other issues.</li>
                        <li>However, it's generally not recommended to use LOOT for reorganizing your entire load order.</li>
                        <li>LOOT may misplace about 5-10% of mods when sorting, which can be problematic, especially with large mod lists.</li>
                        <li>For best results, use LOOT as a diagnostic tool only, and avoid letting it automatically rearrange a large, carefully curated load order.</li>
                    </ul>
                </li>`;
            }
    
            diagnoses += '</ul></li>';
        }
    
        return diagnoses;
    }
    const missingMastersDiagnosis = checkForMissingMasters(sections);
    Utils.debuggingLog(['missingMastersDiagnosis', 'analyzeLog.js'], `missingMastersDiagnosis for diagnostic section:'`, missingMastersDiagnosis);
    Utils.debuggingLog(['missingMastersDiagnosis', 'analyzeLog.js'], `Utils.isSkyrimPage for diagnostic section:'`, Utils.isSkyrimPage);
    if (Utils.isSkyrimPage && missingMastersDiagnosis) {
        diagnoses += missingMastersDiagnosis;
        diagnosesCount++;
        //NOTE: for Nolvus users, this result will still show up in the Advanced User's insights, below
    }


    // Check for Shadow Scene Node crash
    if (sections.probableCallstack.toLowerCase().includes('BSCullingProcess::unk_D51280+78'.toLowerCase()) && sections.firstLine.includes('(SkyrimSE.exe+12FDD00)')) {
        diagnoses += '<li>❗<b>Shadow Scene Node Crash Detected:</b> Load an earlier save, traveling to a different cell from the original crash, and play for a few days in game away from the area. This avoids the Shadow Scene, and hopefully allows the issue to resolve itself. More information and troubleshooting tips under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-3">Shadow Scene Node crash</a/>.</li>';
        diagnosesCount++;
    }

    //TODO: Custom mod found in Probable Callstack:  In customized you’ll likely find that there will be many direct mod related crashes which will list themselves. Most of the time it’s as simple as disabling or adjusting the load order of referenced mod

    // Check for Skeleton crash
    var skeletonRegex = /NPC L UpperarmTwist|NPC R UpperarmTwist|skeleton\.nif|skeleton_female\.nif|NPC L Forearm|NPC R Forearm|bisection|NPC SpineX|NPC L Heel|NPC R Heel|NPC L Foot|NPC R Foot|SaddleBone|NPC L Hand|NPC R Hand|NPC L Finger|NPC R Finger/g;
    var skeletonMatches = sections.relevantObjects.match(skeletonRegex) || [];
    if (skeletonMatches.length > 0) {
        diagnoses += '<li>❓<b>Possible Skeleton Issue:</b> Detected <code>' + skeletonMatches.length + '</code> potential indicators(s). Multiple indicators are more likely to be the cause than just one. Restarting may help if you\'re using vanilla Nolvus. For custom mods, verify your load order. Skeleton Issues are frequently NOT the crash culprit when other issues are present. More information and troubleshooting tips under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-9">Skeleton Crash</a/> and <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-7">Load Order Crash</a>.</li>';
        diagnosesCount++;
    }

    // Check for Shadowrend crash
    if (sections.relevantObjects.toLowerCase().includes('ccbgssse018-shadowrend.esl')) {
        diagnoses += '<li>❓<b>Possible Shadowrend Issue:</b> Try loading an earlier save and avoid the crash area for a few days. <b>Be cautious</b> when loading a save that previously experienced the Shadowrend crash. Continuing to play on such a save might compound the issue, leading to more frequent crashes. For custom mods, verify your load order. Shadowrend is frequently NOT the crash culprit when other issues are present. More information and troubleshooting tips under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-6">Shadowrend Crash</a/> and <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-7">Load Order Crash</a>.</li>';
        diagnosesCount++;
    }

    // Antivirus Warning
    let foundAntivirus = '';
    for (const [antivirus, dlls] of Object.entries(antivirusSignatures)) {
        if (dlls.some(dll => logFile.toLowerCase().includes(dll))) {
            foundAntivirus = antivirus;
            break;
        }
    }

    if (foundAntivirus) {
        diagnoses += `<li>⚠️<b>Antivirus Warning:</b> <code>${foundAntivirus}</code> antivirus detected. Third-party antivirus software is a frequent contributor to crashes in heavily-modded Skyrim. Consider adding Nolvus/Skyrim to your antivirus exclusions and/or switching to the built-in Windows Defender for better compatibility.</li>`;
        diagnosesCount++;
    } else {
        // Check for Windows Defender in sections.topHalf if no other antivirus found
        const windowsDefenderDlls = ['mpsvc.dll', 'mpclient.dll'];
        if (windowsDefenderDlls.some(dll => sections.topHalf.toLowerCase().includes(dll))) {
            diagnoses += `<li>⚠️<b>Antivirus Info:</b> Windows Defender detected in the top half of your crash log (above the Modules section). Windows Defender is typically not a problem for Skyrim, but if you're experiencing issues, you might consider adding exclusions for Nolvus/Skyrim.</li>`;
            diagnosesCount++;
        }
    }

    //Overlays Warning
    let overlayFiles = [];
    let overlayInTopHalf = false;
    let simplifiedOverlayRegex = /\b\w*overlay\w*\.dll\b/gi;
    let matches = sections.topHalf.match(simplifiedOverlayRegex) || [];

    for (const match of matches) {
        overlayInTopHalf = true;
        let found = false;
        for (const [overlay, files] of Object.entries(window.overlaySignatures)) {
            if (files.some(file => file.toLowerCase() === match.toLowerCase())) {
                if (!overlayFiles.includes(overlay)) {
                    overlayFiles.push(overlay);
                }
                found = true;
                break;
            }
        }
        if (!found) {
            overlayFiles.push(match);
        }
    }

    for (const [overlay, files] of Object.entries(window.overlaySignatures)) {
        if (files.some(file => logFile.toLowerCase().includes(file.toLowerCase()))) {
            if (!overlayFiles.includes(overlay)) {
                overlayFiles.push(overlay);
            }
            if (overlay !== 'Steam' && files.some(file => sections.topHalf.toLowerCase().includes(file.toLowerCase()))) {
                overlayInTopHalf = true;
            }
        }
    }

    // Special case for Steam as it checks only sections.topHalf
    if (sections.topHalf.toLowerCase().includes('gameoverlayrenderer64.dll')) {
        if (!overlayFiles.includes('Steam')) {
            overlayFiles.push('Steam');
        }
    }

    // Remove explicit mention of gameoverlayrenderer64.dll
    overlayFiles = overlayFiles.filter(file => file.toLowerCase() !== 'gameoverlayrenderer64.dll');

    if (overlayFiles.length > 0) {
        const hasSteam = overlayFiles.some(file => file.toLowerCase().includes('steam'));
        let warningMessage = '⚠️<b>Overlay Warning:</b> Overlays detected. While some are generally considered safe, others may cause issues in heavily-modded Skyrim.';
        if ((!hasSteam && overlayFiles.length == 1) || overlayFiles.length > 1) {
            //If warning is something than other than just Steam ... then upgrade it, and count it as a diagnosis
            warningMessage = '❓<b>Possible Overlay Issue:</b> Overlays detected in the top half of your crash log, suggesting they may have contributed towards the crash.';
            diagnosesCount++;
        }
    
        let steamNote = hasSteam
            ? ' (Note: Steam may show up even if it is disabled, but it might be worth double-checking.)'
            : '';
    
        diagnoses += `<li>${warningMessage} It's best to try disabling all overlays temporarily to ensure they aren't contributing to your crash.<ul>` +
            `<li>List of detected overlays: <a href="#" class="toggleButton">⤴️ hide</a> <ul class="extraInfo">` +
            overlayFiles.map(file => `<li>${file}</li>`).join('') +
            `<li>${steamNote}</li>` + 
            '</ul></li></ul></li>';
    }


    async function checkForNolvusModlist(logFile) {
        Utils.debuggingLog(['checkForNolvusModlist'], 'Starting Nolvus modlist check');
    
        let diagnoses = '';
    
        // Fetch and process the Nolvus plugin list
        let nolvusPlugins = [];
        if (Utils.isSkyrimPage) {
            try {
                const response = await fetch('https://raw.githubusercontent.com/Phostwood/crash-analyzer/main/vanillaNolvusPlugin-WithStableLocation.txt');
                const text = await response.text();
                nolvusPlugins = text.split('\n').map(line => line.trim().toLowerCase()).filter(Boolean);
                Utils.debuggingLog(['checkForNolvusModlist'], 'Fetched Nolvus plugins:', nolvusPlugins.length);
            } catch (error) {
                console.error('Error fetching Nolvus plugin list:', error);
                Utils.debuggingLog(['checkForNolvusModlist'], 'Error fetching Nolvus plugin list:', error);
            }
        }
    
        // Check for Nolvus or Nolvus-like modlist
        if (Utils.isSkyrimPage && nolvusPlugins.length > 0) {
            let nolvusPluginsDetected = 0;
            const logFilePlugins = logFile.toLowerCase().split('\n');
    
            for (const plugin of nolvusPlugins) {
                if (logFilePlugins.some(line => line.includes(plugin))) {
                    nolvusPluginsDetected++;
                }
            }
    
            Utils.debuggingLog(['checkForNolvusModlist'], 'Nolvus plugins detected:', nolvusPluginsDetected);
    
            if (nolvusPluginsDetected > 0) {
                const nolvusPercentage = (nolvusPluginsDetected / nolvusPlugins.length) * 100;
                Utils.debuggingLog(['checkForNolvusModlist'], 'Nolvus percentage:', nolvusPercentage);
                
                if (nolvusPercentage >= 20) {
                    let nolvusMessage = '';
                    if (nolvusPercentage >= 80) {
                        nolvusMessage = 'It appears you are using a full or nearly full Nolvus installation.';
                    } else if (nolvusPercentage >= 40) {
                        nolvusMessage = 'It appears you are using a modlist based on or heavily inspired by Nolvus.';
                    } else if (nolvusPercentage >= 20) {
                        nolvusMessage = 'It appears you are using some Nolvus plugins or a modlist partially based on Nolvus.';
                    }
        
                    Utils.debuggingLog(['checkForNolvusModlist'], 'Nolvus message:', nolvusMessage);
        
                    diagnoses += `<li>⚠️<b>Nolvus Detected:</b> ${nolvusMessage} For enhanced analysis with Nolvus-specific features, we recommend using the original <a href="index.html?Advanced">index.html version</a> of this crash analyzer. It provides additional insights tailored to Nolvus installations.</li>`;
                }
            }
        }
    
        Utils.debuggingLog(['checkForNolvusModlist'], 'Finished Nolvus modlist check');
        return diagnoses;
    }
    Utils.debuggingLog(['checkForNolvusModlist'], 'sections.gamePlugins:', sections.gamePlugins);
    const nolvusDiagnosis = await checkForNolvusModlist(sections.gamePlugins);
    diagnoses += nolvusDiagnosis;
    //EXCLUDED: diagnosesCount++;

    function checkLogTypeAndProvideRecommendations(logType) {
        let message = '';
    
        if (logType === "Trainwreck") {
            message += "<li>⚠️<b>Trainwreck Log Detected:</b> While Trainwreck provides some crash information, it's generally not as comprehensive as other logging options. ";
    
            if (sections.hasSkyrimAE) {
                message += "For Skyrim AE (version 1.6+), we strongly recommend using <a href='https://www.nexusmods.com/skyrimspecialedition/mods/59818'>Crash Logger</a> instead. It provides more detailed crash information, aiding in better diagnosis. ";
            } else {
                message += "For Skyrim SE (version 1.5), we strongly recommend using <a href='https://www.nexusmods.com/skyrimspecialedition/mods/21294'>.NET Script Framework</a> instead. It offers more detailed crash information, which is crucial for accurate diagnosis. ";
            }
    
            message += "Remember to only have one logging mod enabled at a time.</li>";
        }

        if (logType === "CrashLogger" && !sections.hasSkyrimAE) {
            message += "<li>⚠️ <b>CrashLogger Log Detected:</b> For Skyrim SE (version 1.5), we recommend using <a href='https://www.nexusmods.com/skyrimspecialedition/mods/21294'>.NET Script Framework</a> instead. It generally offers more detailed crash information, which can be helpful towards the best diagnosis. Remember to only have one logging mod enabled at a time.</li>";

        }

        return message;
    }

    const logType = sections.logType;
    const logRecommendations = checkLogTypeAndProvideRecommendations(logType);
    if (logRecommendations) {
        diagnoses += logRecommendations;
        //EXCLUDED: diagnosesCount++;
    }



    // Default to unknown crash
    if (diagnosesCount < 1) {
        diagnoses += '<li>❓<b>No recognized crash pattern detected.</b> If you aren\'t aware of (and diligently following) <b>Jerilith\'s Safe Save Guide</b>, review it at <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-5">Save Bloat Crash</a/>. Also, if you have customized Nolvus with additional mods, review information on the <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-7">Load Order Crash</a>. Also, this crash analyzer\'s <b>Advanced Users</b> section contains additional crash types and insights that may help isolate this issue. If the problem persists, share your crash logs with <a href="https://www.reddit.com/r/Nolvus/">r/Nolvus</a> and/or the <a href="https://discord.gg/Zkh5PwD">Nolvus Discord</a>.</li>';
        //DON'T COUNT: diagnosesCount++;
    }

    Utils.debuggingLog(['analyzeLog', 'analyzeLog.js'], 'Diagnoses:', diagnosesCount);


    // - - - Speculative Insights - - -
    // Rechecks of some of the above crash tests, just include mostly-AI-generated descriptions
    //(some tests weren't rechecked if they had an easy defitive solution, or if the AI didn't generate a good alternative description.
    // Some checks were inspired by work from sea (no code was used nor were any descriptions directly copied)
    // Acknowledgment:
    // Special thanks to "sea" for the diligent collection of crash identifiers and descriptions that were very helpful in the development of these speculative insights.
    // Created: 2023.04.22 by Sephrajin aka sri-arjuna aka (sea)
    // Licence: GPLv2
    // Source code: https://github.com/sri-arjuna/SSE-CLA
    // Nexus Mod page: https://www.nexusmods.com/skyrimspecialedition/mods/89860


    let nolvusListsResult = null;
    let isVanillaNolvus = false;
    let hasBadlyOrganizedNolvusPlugins = false;
    let hasNonNolvusPluginsAtBottom = false;
    let badlyOrderedVanillaPlugins = [];
    let nonNolvusPluginsBelowSynthesis = [];

    if (!Utils.isSkyrimPage) {
        Utils.debuggingLog(['analyzeLog', 'analyzeLog.js'], 'Generating Nolvus Lists')
        nolvusListsResult = await NolvusLists.generateNolvusLists(logFile);
        insights += nolvusListsResult.insights;
        insightsCount += nolvusListsResult.insightsCount;
        isVanillaNolvus = nolvusListsResult.isVanillaNolvus;
        hasBadlyOrganizedNolvusPlugins = nolvusListsResult.hasBadlyOrganizedNolvusPlugins;
        hasNonNolvusPluginsAtBottom = nolvusListsResult.hasNonNolvusPluginsAtBottom;
        badlyOrderedVanillaPlugins = nolvusListsResult.badlyOrderedVanillaPlugins;
        nonNolvusPluginsBelowSynthesis = nolvusListsResult.nonNolvusPluginsBelowSynthesis;
    }
    Utils.debuggingLog(['analyzeLog', 'nolvusLists', 'analyzeLog.js'], 'Nolvus Lists Results', {
        isVanillaNolvus,
        hasBadlyOrganizedNolvusPlugins,
        hasNonNolvusPluginsAtBottom,
        badlyOrderedVanillaPlugins,
        nolvusListsResult
    });

    // Generate log summary
    Utils.debuggingLog(['analyzeLog', 'analyzeLog.js'], 'sections.topHalf length:', sections.topHalf.length);
    Utils.debuggingLog(['analyzeLog', 'analyzeLog.js'], 'sectionsMap size:', sectionsMap.size);
    const logSummaryResult = LogSummary.generateLogSummary(logFile, sections, sectionsMap, isVanillaNolvus);
    Utils.debuggingLog(['analyzeLog', 'analyzeLog.js'], 'logSummaryResult.namedElementMatches length:', logSummaryResult.namedElementMatches.length);
    insights += logSummaryResult.insights;
    insightsCount += logSummaryResult.insightsCount;

    insights += '</ul><h5>Higher-Confidence Test Results:</h5><ul>';

    //VRAMr Gorehowl
    if (sections.firstLine.includes('D6DDDA') && sections.relevantObjects.includes('Gorehowl')) {
        insights += '<li>🎯 <b>VRAMr Gorehowl Crash Detected:</b> The \'D6DDDA\' error, combined with references to the weapon "Gorehowl," indicates a specific issue related to VRAMr and the "Night at the Museum" quest. To address this issue:<ol>' +
            '<li>If you are using VRAMr, temporarily disable VRAMr\'s output mod.</li>' +
            '<li>After completing the quest, re-enable VRAMr\'s output mod.</li>' +
            '<li>Alternatively, you can delete the "clgorehowl" .dds texture files associated with the quest.</li>' +
            '<li>Or, consider hiding their overrides in MO2 to prevent conflicts.</li>' +
            '<li>NOTE: the VRAMr mod author fixed this issue in his April 19, 2024 version.</li>' +
            '</ol></li>';
        insightsCount++;
    }
    //Strings
    if (R14StringsRegex.test(sections.topHalf)) {
        insights += '<li>🎯 <b>.STRINGS Crash Detected:</b> This error typically occurs when there is a unique or non-standard character in the <code>sLanguage</code> line of your <b>skyrim.ini</b> file. To resolve this issue:<ol>' +
            '<li>Open your <b>skyrim.ini</b> file located in the Documents/My Games/Skyrim folder.</li>' +
            '<li>Locate the line that reads <code>sLanguage=ENGLISH</code>.</li>' +
            '<li>Ensure that there are no unique characters or typos in this line. It should only contain standard text.</li>' +
            '<li>Save the changes and restart Skyrim to see if the issue has been resolved.</li>' +
            '<li>More information and troubleshooting tips under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-1">.STRINGS Crash</a/>.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //USVFS (Antivirus)
    if (sections.probableCallstack.includes('usvfs_x64.dll')) {
        insights += '<li>🎯 <b>USVFS Crash Detected:</b> The presence of \'usvfs_x64.dll\' in the crash log indicates an issue related to the MO2 (Mod Organizer 2) file system. This crash is often caused by <b>antivirus software</b>, particularly Webroot or Bitdefender, blocking MO2\'s file operations. To resolve this issue:<ol>' +
            '<li>Check if you have Webroot or Bitdefender antivirus installed.</li>' +
            '<li>Temporarily disable your antivirus or create an exception for the entire Nolvus directory within your antivirus settings.</li>' +
            '<li>Ensure that MO2 has the necessary permissions to access and modify files without interference from the antivirus.</li>' +
            '<li>For detailed troubleshooting tips, refer to the <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-12">USVFS Crash section</a> on the Nolvus support page.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //ENB issue (long, but collapsable version)
    if (sections.firstLine.includes('d3d11.dll')) {
        insights += '<li>❗ <b>ENB Issue Detected:</b> The presence of <code>d3d11.dll</code> in the first line of a crash log indicates a graphics-related crash. If you have recently installed an ENB or Reshader, ensure it is the correct version and consider reinstalling it. Follow the appropriate steps based on your installation method:<ol>' +
            '<li>❗ <b>For Manual Installers/Modders:</b> If you manually installed an ENB or similar:<a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            '<li>For manual installations of standard Nolvus options, refer to the <a href="https://www.nolvus.net/guide/natl/enb">Guide on ENB & RESHADE Installation</a>.</li>' +
            '<li>For information on the new Cabbage ENB and Kauz ENB, see the <a href="https://www.reddit.com/r/Nolvus/comments/1clurux/nolvus_enb_install_guides_and_info/">Nolvus ENB Installation Guides and Information</a>.</li>' +
            '</ul></li>' +
            '<li>❗ <b>For Autoinstallers:</b> Consider the following steps for fixing your ENB-related issue:<a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            '<li>For a potential <b>quick fix,</b> standard Nolvus players can try manually reinstalling the <code>d3d11.dll</code> file by following the instructions in the <a href="https://www.nolvus.net/guide/natl/enb">Guide on ENB & RESHADE Installation</a>. If this does not resolve the issue, proceed with the steps below.</li>' +
            '<li><b>Reinstalling Nolvus</b> may seem daunting, but <b>as long as you archived</b> during installation, the process is straightforward and <b>far faster.</b></li>' +
            '<li><b>⚠️ CAUTION:</b> Reinstalling Nolvus will delete your save games, character presets, and screenshots. Please <b>back them up</b> first if you wish to keep them! <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            '<li>Game saves (.ess and .skse files) are located in <code>\\Nolvus\\Instances\\Nolvus Ascension\\MODS\\profiles\\Nolvus Ascension\\saves</code></li>' +
            '<li>Screenshots are saved in <code>\\Nolvus\\Instances\\Nolvus Ascension\\SHOTS</code></li>' +
            '<li>Character presets are located in <code>\\Nolvus\\Instances\\Nolvus Ascension\\MODS\\overwrite\\SKSE\\Plugins\\Chargen\\Presets</code></li>' +
            '<li>Character head sculpts are located in <code>\\Nolvus\\Instances\\Nolvus Ascension\\MODS\\overwrite\\SKSE\\Plugins\\Chargen</code></li>' +
            '</ul></li>' +
            '<li>Close Mod Organizer 2 (MO2) if it is currently open.</li>' +
            '<li>Open the Nolvus Dashboard.</li>' +
            '<li>Click the Manage button and select Delete Instance (see <a href="https://www.nolvus.net/appendix/installer/faq?acc=accordion-1-23">How to Delete an Instance</a>). NOTE: This will NOT delete your archives if you have enabled archiving.</li>' +
            '<li>Wait for the process to complete - this takes about 2 minutes depending on your system.</li>' +
            '<li>Once the process is complete, follow the prompts to install a new instance with your preferred settings. Please note that your game saves from another instance will not be compatible unless you choose the same settings.</li>' +
            '<li>If you previously enabled archiving, make sure the dashboard points to the correct Archive folder to prevent unnecessary re-downloads.</li>' +
            '</ul></li>' +
            '</ol></li>';
        insightsCount++;
    }

    // Apply Order
    if (hasBadlyOrganizedNolvusPlugins) {
        let badlyOrderedVanillaPluginsList = Utils.replaceWithExplainers(badlyOrderedVanillaPlugins);
        let badlyOrderedVanillaPluginsListItems = badlyOrderedVanillaPluginsList
            .map(plugin => `<li><code>${plugin}</code></li>`)
            .join('');
        insights += '<li>❗<b>Potential Misorganization of Vanilla Nolvus Plugins:</b>  <code>' + badlyOrderedVanillaPlugins.length + '</code> standard plugins appear to be out of their usual sequence (relative to each other). A few mods will move around with different configurations of Nolvus, but others can cause problems if they are out of their typical loading order. If you\'re having load order issues, you can use the <b>Apply Order</b> button in the Nolvus Dashboard to restore the original order of all vanilla Nolvus mods. Follow these steps:<ol>' +
            '<li>Open the dashboard and click on <b>Manage</b>, then <b>Instance</b>.</li>' +
            '<li>Once loaded, click on <b>Apply Order</b>.</li>' +
            '<li>Any disabled vanilla mods will be re-enabled.</li>' +
            '<li>All vanilla Nolvus mods will be returned to their original order (load order).</li>' +
            '<li>⚠️All non-vanilla mods will be disabled and moved to the end of your load order.</li>' +
            '<li>Optionally, manually re-enable and reposition your added non-vanilla mods, or start a new game with them disabled.</li>' +
            '<li>This is helpful if you\'re troubleshooting a load order and want to revert to a vanilla Nolvus state without reinstalling, if you\'ve accidentally rearranged one or more mods in Mod Organizer 2 (MO2), or if your load order has become corrupted.</li>' +
            '<li>For additional information and a screenshot, refer to this r/Nolvus post <a href="https://www.reddit.com/r/Nolvus/comments/1chuod0/how_to_apply_order_button_usage_in_the_nolvus/">How To: Use the "Apply Order" Button in the Nolvus Dashboard</a>.</li>' +
            '<li>List of potentially, badly-organized vanilla Nolvus plugins: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            badlyOrderedVanillaPluginsListItems +
            '</ul></ol></li>';

        insightsCount++;
    }


    Utils.debuggingLog(['analyzeLog', 'analyzeLog.js'], 'Non-Nolvus Plugins Below Synthesis:', {
        hasNonNolvusPluginsAtBottom,
        nonNolvusPluginsBelowSynthesisLength: nonNolvusPluginsBelowSynthesis.length,
        nonNolvusPluginsBelowSynthesis
    });

    // Test for Non-Nolvus Plugins at Bottom
    if (hasNonNolvusPluginsAtBottom) {
        var nonNolvusPluginsAtBottomListItems = '';
        var nonNolvusPluginsAtBottom = nonNolvusPluginsBelowSynthesis;
        const nonNolvusPluginsAtBottomList = Utils.replaceWithExplainers(nonNolvusPluginsAtBottom);
        for (let plugin of nonNolvusPluginsAtBottomList) {
            nonNolvusPluginsAtBottomListItems += '<li><code>' + plugin + '</code></li>';
        }
        insights += '<li>❗<b>Non-Nolvus Plugins Detected at Bottom:</b> <code>' + nonNolvusPluginsAtBottom.length + '</code> Non-Nolvus plugins have been detected at the bottom of your load order (below <code>synthesis.esp</code>). This could potentially cause issues with your game. Here is how to address this:<ol>' +
            '<li>Open Mod Organizer 2 (MO2).</li>' +
            '<li>In both the left and right-side panes, identify the non-Nolvus plugins at the bottom of your load order.</li>' +
            '<li>Move these plugins to their correct positions in the load order. Typically, non-Nolvus plugins should be placed above <code>FNIS.esp</code>. If you would like guidance on modding/patching Nolvus, please watch this <a href="https://youtu.be/YOvug9KP5L4">brief tutorial video</a> for step-by-step instructions.</li>' +
            '<li>Review information on the <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-7">Load Order Crash</a>. If this issue persists, share your crash logs with <a href="https://www.reddit.com/r/Nolvus/">r/Nolvus</a> and/or the <a href="https://discord.gg/Zkh5PwD">Nolvus Discord</a>.</li>' +
            '<li>List of non-Nolvus plugins at bottom: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            nonNolvusPluginsAtBottomListItems +
            '</ul></ol></li>';

        insightsCount++;
    }


    //D6DDDA
    if (sections.firstLine.includes('D6DDDA')) {
        insights += '<li>❗<b>D6DDDA Crash Detected:</b> The \'D6DDDA\' error may occur due to one of the following reasons:<ol>' +
            '<li>Exceeded RAM or VRAM: Ensure that your system has sufficient memory resources:<ol>' +
            '<li>Check if other applications are consuming excessive memory. Consider closing other applications.</li>' +
            '<li>If your PC has less than 12GB of VRAM (more for wide screen and/or monitors more than 2K) (<a href="https://www.lifewire.com/how-to-check-vram-5235783">how to check how much VRAM you have</a>),  consider running your load order through <a href="https://www.reddit.com/r/Nolvus/comments/1doakj1/psa_use_vramr_if_you_have_12gb_of_vram/">VRAMr</a> to conserve both VRAM and RAM by compressing all/most of your load order\'s texture files in an automated fashion. This will reduce your load order\'s images to a smaller resolution (file size) without a noticeable decrease in image quality, and typically leads to fewer low-point FPS stutters and fewer memory-related crashes.</li>' +
            '</ol></li>' +
            '<li>Broken/Corrupt Meshes (.nif) or Textures (.dds): Verify the integrity of your installed mods. Corrupted files can lead to crashes:<ol>' +
            '<li><a href="https://www.nexusmods.com/skyrimspecialedition/mods/23316">Cathedral Assets Optimizer (CAO)</a> can often be used to repair damaged image files. CAO ensures that textures are properly formatted and can also reduce their resolution (file size) without noticeably reducing visual quality.</li>' +
            '<li>Additionally, consider reaching out to the mod author if a specific mesh is identified as causing issues.</li>' +
            '</ol></li>' +
            '<li>Windows Pagefile Size: Verify that you have correctly <a href="https://www.nolvus.net/appendix/pagefile">set your Windows Pagefile Size</a>.</li>' +
            '<li>Hardware Issues (Rare): While uncommon, persistent D6DDDA crashes could indicate underlying hardware problems. Run a memory diagnostic tool to check for faulty RAM. Windows Memory Diagnostic or MemTest86 can be used for this purpose. Monitor your system for other signs of instability.</li>' +
            '</ol>For more detailed information and troubleshooting tips, refer to the <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-2">D6DDDA Crash section</a> on the Nolvus support page.</li>';
        insightsCount++;
    }

    //NVIDIA graphics driver
    if (sections.topThirdNoHeading.toLowerCase().includes('nvwgf2umx.dll') || sections.topThirdNoHeading.toLowerCase().includes('nvlddmkm.sys') || sections.topThirdNoHeading.toLowerCase().includes('nvoglv32.dll') || sections.topThirdNoHeading.toLowerCase().includes('nvoglv64.dll') || sections.topThirdNoHeading.toLowerCase().includes('nvwgf2um.dll') || sections.topThirdNoHeading.toLowerCase().includes('nvapi64.dll')) {
        insights += '<li>❗<b>Potential NVIDIA Driver Issue Detected:</b> NVIDIA driver .dll files showing up in the top few sections of a crash log may be linked to NVIDIA graphics driver issues. To resolve this, try the following steps:<ol>' +
            '<li><b>Update your NVIDIA drivers</b> to the latest version. You can download the latest drivers from the <a href="https://www.nvidia.com/Download/index.aspx">NVIDIA website</a>.</li>' +
            '<li>If updating does not resolve the issue, perform a clean installation of the drivers using a tool like Display Driver Uninstaller (DDU) to remove all traces of the previous drivers before installing the new ones.</li>' +
            '<li>Check for any GPU overclocking settings that may be causing instability and reset them to default if necessary.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //Memory issue (Missing Masters)
    // Check thought up by AI (MS Bing Copilot):
    if (sections.topHalf.includes('0xC0000005')) {
        insights += '<li>❗<b>Memory Access Violation Detected:</b> Error code 0xc0000005 points to memory-related issues, such as invalid memory access operations. Common causes and resolutions include:<ol>' +
            '<li><b>Missing Master Files:</b> Incompatibilities from a new mod may sometimes be resolved by installing <a href="https://www.nexusmods.com/skyrimspecialedition/mods/106441">Backported Extended ESL Support (BEES)</a>. If a mod was removed while others are still depending on it, see <a href="https://github.com/LivelyDismay/Learn-To-Mod/blob/main/lessons/Remove%20a%20Master.md">How To Remove a Master Requirement From a Plugin</a>.</li>' +
            '<li><b>Incompatible Mods:</b> Review your mod list for conflicts that could affect memory allocation or access.</li>' +
            '<li><b>File Format Versions:</b> Ensure all mods are compatible with your game version to prevent crashes from format mismatches.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    // Missing Masters Diagnosis
    //NOTE: for Skyrim page users, this result shows up in the diagnostic section (above)
    Utils.debuggingLog(['missingMastersDiagnosis', 'analyzeLog.js'], `missingMastersDiagnosis for Advanced Users section:'`, missingMastersDiagnosis);
    Utils.debuggingLog(['missingMastersDiagnosis', 'analyzeLog.js'], `Utils.isSkyrimPage for Advanced Users section:'`, Utils.isSkyrimPage);
    if (!Utils.isSkyrimPage && missingMastersDiagnosis) {
        insights += missingMastersDiagnosis;
        insightsCount++;
    }

    // ConsoleUtilSSE version check
    if (Utils.isSkyrimPage &&
        (sections.topQuarter.includes('ConsoleUtilSSE.dll') ||
            (sections.sksePlugins.includes('ConsoleUtilSSE.dll               v1.4.0') && sections.hasSkyrimAE)
        )
    ) {
        let consoleUtilMessage = '';

        insights += `<li>❗<b>Possibly Incompatible ConsoleUtilSSE Version:</b> Your crash log suggests an issue with ConsoleUtilSSE.dll, likely due to version incompatibility. Download and install <a href="https://www.nexusmods.com/skyrimspecialedition/mods/76649?tab=files">ConsoleUtilSSE NG v1.5.1 or later</a> to potentially resolve this issue.</li>`;
        insightsCount++;

        Utils.debuggingLog(['ConsoleUtilSSE check'], 'Skyrim AE:', sections.hasSkyrimAE);
        Utils.debuggingLog(['ConsoleUtilSSE check'], 'Message:', consoleUtilMessage);
    }

    // Simplicity of Snow + Traverse the Ulvenwald + JK's Skyrim Patch requirement
    //NOTE: currently, I don't think this can be detected in a Trainwreck log?
    const hasJKsSkyrim = sections.fullLogFileLowerCase.includes('jks skyrim.esp');
    const hasSimplicityOfSnow = sections.fullLogFileLowerCase.includes('simplicity of snow.esp');
    const hasUlvenwald = sections.fullLogFileLowerCase.includes('ulvenwald.esp');
    const hasPatch = sections.fullLogFileLowerCase.includes('jks skyrim tree fix.esp');

    //if (hasJKsSkyrim && hasSimplicityOfSnow && hasUlvenwald && !hasPatch) {
    if (hasJKsSkyrim && hasSimplicityOfSnow && !hasPatch) {
        insights += '<li>❗ <b>Simplicity of Snow + JK\'s Skyrim Patch Missing:</b> ' +
            'Your load order includes both JK\'s Skyrim and Simplicity of Snow, but the required patch is missing. To resolve this:<ol>' +
            '<li>Reinstall Simplicity of Snow\'s FOMOD. During installation, it should automatically detect JK\'s Skyrim and offer the appropriate patch(es).</li>' +
            '<li>Ensure you select the JK\'s Skyrim compatibility patch during the FOMOD installation process.</li>' +
            '<li>After reinstalling, verify that the "JKs Skyrim Tree Fix.esp" is present in your load order.</li>' +
            '</ol>' +
            'Without this patch, you may experience potential crashes. For more information, see this <a href="https://www.reddit.com/r/skyrimmods/comments/17tqxig/comment/k9184j5/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button">r/SkyrimMods thread</a>.</li>';
        insightsCount++;
    }


    // dxgi.dll issue (ReShade and PureDark Upscaler)
    if (sections.topHalf.includes('dxgi.dll')) {
        insights += '<li>❗<b>dxgi.dll Issue Detected:</b> The presence of dxgi.dll in the log\'s top half indicates a potential issue between ReShade and the PureDark Upscaler. Common causes and resolutions include:<ol>' +
            '<li><b>ReShade Version:</b> If you have upgraded your ReShade to a newer version (e.g., 6.11 for the latest Cabbage release), the older and customized dxgi.dll from PureDark might cause issues. See below if you wish to revert to the original Reshade.</li>' +
            '<li><b>PureDark Upscaler:</b> If you are using newer versions of the PureDark upscaler (specifically for 40xx cards), you need to download a customized version of dxgi.dll from their Discord for compatibility with ReShade.</li>' +
            '<li><b>Missing dxgi.dll:</b> If you want to revert back from PureDark and don\'t have the original dxgi.dll, you can find it in your archived mods installed from Nolvus. Alternatively, reinstall ReShade following the <a href="https://www.nolvus.net/guide/natl/enb">11.3 Reshade Binaries</a> instructions on the Nolvus site.</li>' +
            '<li><b>Workaround:</b> Alternatively, you can disable ReShade by pressing the DEL key to turn it on or off.' +
            '</ol></li>';
        insightsCount++;
    }
    //Upscaler
    if (sections.topThird.toLowerCase().includes('upscaler.dll') || sections.topThird.toLowerCase().includes('pdperfplugin.dll')) {
        insights += '<li>❗<b>Potential Upscaler Issue Detected:</b> The error involving \'Upscaler.dll\' or \'PDPerfPlugin.dll\'suggests a problem with the Upscaler mod, which is designed to improve the game\'s graphics by increasing the resolution of textures. If you are using Puredark\'s paid Upscaler, consider the following troubleshooting steps:<ol>' +
            '<li>Ensure you are using the correct version of the upscaler that is compatible with your GPU.</li>' +
            '<li>Review the <a href="https://docs.google.com/document/d/1YVFKcJN2xuvhln9B6vablzOzQu-iKC4EDcbjOW-SEsA/edit?usp=sharing">Nolvus DLSS Upscaler Installation Guide</a> to confirm that you have followed all the installation steps correctly.</li>' +
            '<li>Review the <b>SkyrimUpscaler.log</b> file for more detailed information about the error.</li>' +
            '<li>Temporarily disable the Upscaler mod to determine if it is the source of the crash.</li>' +
            '<li>Ensure that your system meets the hardware requirements for running the mod, as upscaling can be resource-intensive.</li>' +
            '<li>Check for updates to the Upscaler mod that may address known issues.</li>' +
            '<li>If the problem persists, report it to the mod\'s support page, providing details from the log file to assist with troubleshooting.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    // Check for KERNELBASE Crash excluding JContainers and JSON parse error
    if (sections.firstLine.toLowerCase().includes('KERNELBASE.dll'.toLowerCase()) && !sections.probableCallstack.includes('JContainers64.dll') && !sections.topHalf.includes('json.exception.parse_error')) {
        insights += '<li>❗<b>KERNELBASE Crash Detected:</b> This rare issue could be related to a specific added mod, or to hardware or a system-wide issue such as virus, malware, drive corruption, corrupted Nolvus install, or corrupted file permissions. Here are some steps you can take, ordered from easiest to hardest:<ol>' +
            '<li>You can restore the original sorting of all vanilla Nolvus mods using the <b>Apply Order</b> button in the Nolvus Dashboard.<ul>' +

                '<li>Here is how to do it: <a href="#" class="toggleButton">⤴️ hide</a><ol class="extraInfo">' +
                    '<li>Open the dashboard, click on <b>Manage</b> and then <b>Instance</b>.</li>' +
                    '<li>When loaded, click on <b>Apply Order</b>.</li>' +
                    '<li>All non-vanilla mods will be disabled and moved to the bottom of your load order.</li>' +
                    '<li>Any disabled vanilla mods will again be enabled.</li>' +
                    '<li>All vanilla Nolvus mods will be restored to their original sorting (load order).</li>' +
                    '<li>This is useful if you are troubleshooting a load order and wish to start from a vanilla Nolvus state without reinstalling, if you accidentally moved one or more mods in Mod Organizer 2 (MO2), or if your load order somehow got corrupted.</li>' +
                    '<li>For more information and a screenshot, see this r/Nolvus post <a href="https://www.reddit.com/r/Nolvus/comments/1chuod0/how_to_apply_order_button_usage_in_the_nolvus/">How To: "Apply Order" button usage in the Nolvus Dashboard</a>.</li>' +
                '</ol></ul></li>' +
            '<li>Check the Windows Event Log for any related issues. You can do this by opening the <b>Event Viewer</b> (search for it in the Start Menu), then navigate to Windows Logs > Application. Look for any recent errors that might be related to your issue. For detailed instructions, see this <a href="https://support.microsoft.com/en-us/windows/open-event-viewer-17d427d2-43d6-5e01-8535-1fc570ea8a14">Microsoft guide</a>.</li>' +
            '<li>Reinstall Nolvus to ensure the installation is not corrupted. Make sure to back up any important data before doing this. For detailed instructions, see this <a href="https://docs.google.com/document/d/1R_AVeneeCiqs0XGYzggXx34v3Ufq5eUHNoCHo3QE-G8/edit">guide</a>.</li>' +
            '<li>Ensure your Windows is up to date, as well as any drivers. You can check for updates by going to Settings > Update & Security > Windows Update.</li>' +
            '<li>Run a full system scan for any viruses or malware. We generally recommend using the built-in Windows Defender for this.</li>' +
            '<li>Try disabling mods you have added one-by-one to see if the issue persists. This can help identify if a specific mod is causing the problem.</li>' +
            '<li>Reset your file permissions. See <a href="https://www.thewindowsclub.com/how-to-reset-file-folder-permissions-to-default-in-windows-10">How to reset all User Permissions to default in Windows 11/10</a>, or seek assistance from the Nolvus community.</li>' +
            '<li>Alternatively to resetting permissions, an an easy <b>workaround</b> is to <a href = "https://support.microsoft.com/en-us/windows/create-a-local-user-or-administrator-account-in-windows-20de74e0-ac7f-3502-a866-32915af2a34d#WindowsVersion=Windows_11">create a new Windows User</a> and create a new Nolvus save (playthrough) from the new user.</li>' +
            '<li>Check your hard drive for any corruption. You can do this by opening the Command Prompt as an administrator and running the command <code>chkdsk /f</code>. Note that you might need to restart your computer for the scan to run. Be aware that frequent use of `chkdsk` on SSDs can potentially shorten their lifespan due to the write operations it performs.</li>' +
            '<li>Perform a Repair Upgrade using the Windows 11 or Windows 10 ISO file. For detailed instructions, see this <a href="https://answers.microsoft.com/en-us/windows/forum/all/how-to-perform-a-repair-upgrade-using-the-windows/35160fbe-9352-4e70-9887-f40096ec3085">guide</a>.</li>' +
            '</ol></li>';
        insightsCount++;
    }


    insights += '</ul><h5>Memory and Image-related Issues:</h5><ul>';

    //Out of RAM
    if (sections.topHalf.toLowerCase().includes('bad_alloc')) {
        insights += '<li>❓ <b>bad_alloc Issue Detected:</b> The \'bad_alloc\' error typically indicates that the game has run <b>out of RAM</b> memory. To address this issue, follow these steps:<ol>' +
            '<li>Close unnecessary applications to free up RAM.</li>' +
            '<li>Consider upgrading your system with more RAM if you frequently encounter memory issues.</li>' +
            '<li>Verify that you have correctly <a href="https://www.nolvus.net/appendix/pagefile">set your Windows Pagefile Size</a>.</li>' +
            '<li>Ensure that your mods are efficiently using memory and not exceeding your system\'s limits.</li>' +
            '<li>Consider switching to texture packs with lower resolutions (e.g., 1K or 2K instead of 4K) to reduce memory usage. Texture mods that are too large can strain both VRAM and RAM resources.</li>' +
            '<li>Consider conserving both VRAM and RAM by compressing all/most of your load order\'s texture (image) files in an automated fashion with <a href="https://www.reddit.com/r/Nolvus/comments/1doakj1/psa_use_vramr_if_you_have_12gb_of_vram/">VRAMr</a> reducing their size without a noticeable decrease in image quality. This can lead to smoother performance and fewer memory-related issues.</li>' +
            '</ol></li>';
        insightsCount++;
    }


    //Memory allocation failure
    if (sections.topHalf.toLowerCase().includes('no_alloc')) {
        insights += '<li>❓ <b>no_alloc Issue Detected:</b> The \'no_alloc\' error suggests a <b>memory allocation</b> failure, often due to mod conflicts or system limitations. To troubleshoot this issue, follow these steps:<ol>' +
            '<li>Run a memory diagnostic tool to check for faulty RAM. Windows Memory Diagnostic or MemTest86 can be used for this purpose.</li>' +
            '<li>Review your mod list to ensure there are no conflicts.</li>' +
            '<li>Reduce the number of mods installed, particularly if you have many large, resource-intensive mods.</li>' +
            '<li>Keep your mods updated, including any patches that improve memory management.</li>' +
            '<li>If the issue persists, disable mods one by one to isolate the problematic mod. Re-enable them gradually to maintain system stability.</li>' +
            '<li>Consider switching to texture packs with lower resolutions (e.g., 1K or 2K instead of 4K) to reduce memory usage. Texture mods that are too large can strain both VRAM and RAM resources.</li>' +
            '<li>Consider conserving both VRAM and RAM by compressing all/most of your load order\'s texture (image) files in an automated fashion with <a href="https://www.reddit.com/r/Nolvus/comments/1doakj1/psa_use_vramr_if_you_have_12gb_of_vram/">VRAMr</a> reducing their size without a noticeable decrease in image quality. This can lead to smoother performance and fewer memory-related issues.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //tbbmalloc memory allocation issues
    if (sections.topHalf.toLowerCase().includes('tbbmalloc.dll')) {
        insights += '<li>❓ <b>tbbmalloc.dll Issue Detected:</b> This indicator is associated with <b>memory allocation</b>. Its presence in the crash log suggests potential mod conflicts or the need for mod updates. Consider the following:<ol>' +
            '<li>Check for mod compatibility issues, especially with those that modify memory allocation.</li>' +
            '<li>Ensure all mods, particularly those related to memory management, are up to date.</li>' +
            '<li>Verify that you have correctly <a href="https://www.nolvus.net/appendix/pagefile">set your Windows Pagefile Size</a>.</li>' +
            '<li>Seek advice from the modding community if crashes persist after taking these steps.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //Skeleton
    if (skeletonMatches.length > 0) {
        insights += '<li>❓ <b>Possible Skeleton Crash Detected:</b> The crash log suggests <code>' + skeletonMatches.length + '</code> potential skeleton integrity issues. Skeleton Issues are frequently NOT the crash culprit when other issues are present. However, skeleton files are crucial for character and creature animations in Skyrim, and a corrupted or incompatible skeleton file can lead to game instability. To address this:<ol>' +
            '<li>Verify the integrity of skeleton-related mods. Ensure that mods like XPMSSE are properly installed and not overwritten by other mods.</li>' +
            '<li>Check the load order for mods affecting skeletons. Use a mod manager to resolve conflicts and ensure proper priority.</li>' +
            '<li>Utilize tools such as FNIS or Nemesis to rebuild animations, particularly if you have mods that modify character or creature animations. Follow these instructions for <a href="https://www.nolvus.net/guide/asc/output/nemesis">regenerating Nemesis for Nolvus</a>.</li>' +
            '<li>Inspect other mods that may alter skeleton structures. Disable them sequentially to pinpoint the issue.</li>' +
            '<li>If identifiable, using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/23316">Cathedral Asset Optimizer (CAO)</a> may help fix the problematic NIF file(s)</li>' +
            '</ol>For detailed steps and more troubleshooting advice, visit the <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-9">Skeleton Crash</a> and <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-7">Load Order Crash</a> sections on Nolvus.</li>';
        insightsCount++;
    }

    //Corrupted NIF
    if (sections.firstLine.includes('12FDD00')) {
        insights += '<li>❓ <b>12FDD00 Detected:</b> This code often indicates a crash due to a <b>corrupt NIF file</b>. It\'s recommended to check for any recently installed mods that might have altered or added NIF files and ensure they are uncorrupted. If identifiable, using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/23316">Cathedral Asset Optimizer (CAO)</a> may help fix the problematic NIF file(s). Additionally, consider reaching out to the mod author if a specific mesh is identified as causing issues.<ul>' +
            '<li>List of mentioned meshes: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            Utils.extractNifPathsToListItems (sections.topHalf) +
            '</ul></ul></li>';
        insightsCount++;
    }

    //NIF
    if (sections.topHalf.toLowerCase().includes('trishape')) {
        insights += '<li>❓ <b>Trishape Issue Detected:</b> Trishapes are components of NIF files that define the shape of 3D objects in the game. An issue here is likely due to a mod providing a corrupt or incompatible mesh. To resolve this:<ol>' +
            '<li>Identify the mod responsible for the bad mesh by reviewing the list of mentioned meshes below.</li>' +
            '<li>Check for updates or patches for the mod that may address the issue.</li>' +
            '<li>If no updates are available, consider removing the mod and replacing it with an alternative or updated version.</li>' +
            '<li>If identifiable, using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/23316">Cathedral Asset Optimizer (CAO)</a> may help fix the problematic NIF file(s).</li>' +

            '<li>List of mentioned meshes: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            Utils.extractNifPathsToListItems (sections.topHalf) +
            '</ul></ol></li>';

        insightsCount++;
    }

    //Mesh (NIF, right?)
    if (sections.topHalf.toLowerCase().includes('mesh')) {
        insights += '<li>❓ <b>Possible Mesh Issue Detected:</b> This error indicates a generic mesh problem, which could be due to corrupt or incompatible mesh files. To address this issue:<ol>' +
            '<li>Review the list of mentioned meshes below to identify any recently added or updated mods that may include these files.</li>' +
            '<li>Check for updates or compatibility patches for the mods that provide these mesh files.</li>' +
            '<li>If identifiable, using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/23316">Cathedral Asset Optimizer (CAO)</a> may help fix the problematic NIF file(s).</li>' +
            '<li>If issues persist, consider removing or replacing the problematic mod with an alternative.</li>' +
            '<li>List of mentioned meshes: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            Utils.extractNifPathsToListItems (sections.topHalf) +
            '</ul></ol></li>';
        insightsCount++;
    }

    // Check thought up by AI (MS Bing Copilot):
    //Mesh Issue
    const meshIssueRegex = /Name: "([^"]+\.nif)"/i;
    var meshIssueMatch = sections.topHalf.match(meshIssueRegex);
    if (meshIssueMatch) {
        const meshName = meshIssueMatch[1];
        insights += '<li><b>Possible NIF Issue Detected:</b> The mesh file <b>' + meshName + '</b> may be causing the crash. Check for corrupt or incompatible mesh files.</li>';
        insightsCount++;
    }

    //NiNode
    if (sections.topHalf.toLowerCase().includes('NiNode'.toLowerCase())) {
        insights += '<li>❓ <b>NiNode Issue Detected:</b> NiNodes are related to the skeletal structure of characters and creatures in Skyrim. This error could indicate an incompatible skeleton or a bad mesh. To troubleshoot this issue:<ol>' +
            '<li>Read the descriptions of related mods and ensure the correct load order for skeleton-based mods. ⚠️Note: Avoid using tools like LOOT with Nolvus.</li>' +
            '<li>Make sure you have a compatible skeleton mod installed, such as XPMSSE, and that it is not being overwritten by another mod in your mod manager.</li>' +
            '<li>Run FNIS or Nemesis to regenerate animations, especially if you are using mods that alter character animations.  Follow these instructions for <a href="https://www.nolvus.net/guide/asc/output/nemesis">regenerating Nemesis for Nolvus</a>.</li>' +
            '<li>Check for any other mods that affect skeletons, not just humanoid but creatures too, and test by disabling them.</li>' +
            '<li>If identifiable, using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/23316">Cathedral Asset Optimizer (CAO)</a> may help fix the problematic NIF file(s).</li>' +
            '<li>List of mentioned meshes: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            Utils.extractNifPathsToListItems (sections.topHalf) +
            '</ul></ol></li>';
        insightsCount++;
    }

    //Head Mesh
    if (sections.firstLine.includes('132BEF')) {
        insights += '<li>❓ <b>132BEF Detected:</b> This error is often linked to a <b>head mesh</b> issue. To troubleshoot, follow these steps:<ol>' +
            '<li>Check the log for the last NPC loaded before the crash; this NPC\'s head mesh might be the source of the problem.</li>' +
            '<li>Verify that all head meshes are compatible with the current version of Skyrim and any installed body mods.</li>' +
            '<li>If a particular mod is identified, consider reinstalling it or checking for updates that address compatibility issues.</li>' +
            '<li>Regenerate facegen data for the NPC using Creation Kit or other specialized tools if the issue persists.</li>' +
            '<li>List of mentioned meshes: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            Utils.extractNifPathsToListItems (sections.topHalf) +
            '</ul></ol></li>';
        insightsCount++;
    }

    //Face Gen
    if (sections.firstLine.includes('12F5590')) {
        insights += '<li>❓ <b>12F5590 Detected:</b> This error is often associated with a <b>face generation</b> issue for NPCs. To troubleshoot, follow these steps:<ol>' +
            '<li>Check the log for the last NPC loaded before the crash; this NPC is likely the source of the problem.</li>' +
            '<li>If a particular mod is identified, consider reinstalling it or checking for updates that address compatibility issues.</li>' +
            '<li>For persistent problems, regenerate facegen data for the NPC using Creation Kit or other specialized tools.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //RaceMenu
    if (sections.topHalf.toLowerCase().includes('skee64.dll')) {
        insights += '<li>❓ <b>skee64.dll Issue Detected:</b> This file is typically associated with <b>RaceMenu</b> and can indicate incompatibility issues with mods that affect character models or body meshes. To troubleshoot this issue:<ol>' +
            '<li>Check for any recent mod installations or updates that may have altered character models or body meshes.</li>' +
            '<li>Ensure that RaceMenu and all related mods are up to date and compatible with your version of Skyrim and SKSE.</li>' +
            '<li>Read the descriptions of related mods and ensure the correct load order, and verify that there are no conflicts between mods that modify the same assets. ⚠️Note: Avoid using tools like LOOT with Nolvus.</li>' +
            '<li>If the problem persists, consider disabling mods one by one to isolate the conflicting mod.</li>' +
            '<li>List of mentioned meshes: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            Utils.extractNifPathsToListItems (sections.topHalf) +
            '</ul></ol></li>';
        insightsCount++;
    }

    //Bad texture
    if (sections.topHalf.toLowerCase().includes('CompressedArchiveStream'.toLowerCase())) {
        insights += '<li>❓ <b>CompressedArchiveStream Issue Detected:</b> This error typically points to a <b>corrupted texture</b> file, which can occur when a mod improperly overwrites textures from the game or its DLCs. To resolve this issue, follow these steps:<ol>' +
            '<li>Identify if a DLC texture is being overwritten by checking the load order and mod descriptions.</li>' +
            '<li>If no specific texture name is mentioned, extract the "*.BSA" archives linked with any "*.esp" or "*.esm" files, excluding those from official DLCs, to pinpoint the corrupted file.</li>' +
            '<li>Temporarily disable texture mods that are associated with the crash location to see if the issue is resolved.</li>' +
            '<li>Use tools like BSA Browser to safely extract and inspect the contents of "*.BSA" files.</li>' +
            '<li>Consult mod forums and communities for known issues with specific texture files and recommended solutions.</li>' +
            '<li>List of mentioned textures: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            Utils.extractSkyrimTexturePathsToListItems (sections.topHalf) +
            '</ul></ol></li>';
        insightsCount++;
    }

    //Textures
    if (sections.topHalf.toLowerCase().includes('texture')) {
        insights += '<li>❓ <b>Texture Issue Detected:</b> The mention of \'texture\' in the crash log may indicate a potential problem related to texture files. Textures play a crucial role in the visual quality of Skyrim, affecting everything from character models to landscapes and objects. To address texture-related issues, consider the following steps:<ol>' +
            '<li><a href="https://www.nexusmods.com/skyrimspecialedition/mods/23316">Cathedral Assets Optimizer (CAO)</a> can often be used to repair damaged image files. CAO ensures that textures are properly formatted and can also reduce their resolution (file size) without noticeably reducing visual quality.</li>' +
            '<li>Check your mod load order to prevent texture conflicts. Ensure that texture mods are loaded after any mods that alter the same textures.</li>' +
            '<li>Inspect the list of textures mentioned in the crash log. These textures may be associated with specific mods or locations.</li>' +
            '<li>Consider using lower resolution texture packs (e.g., 2K textures) if you experience performance or stability issues. High-resolution textures (e.g., 4K) can strain both your system\'s RAM and VRAM.</li>' +
            '<li>Temporarily disable texture mods associated with the crash location to see if the issue is resolved.</li>' +
            '<li>Consult Skyrim modding forums and communities for specific advice related to texture troubleshooting.</li>' +
            '<li>List of mentioned textures: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            Utils.extractSkyrimTexturePathsToListItems (sections.topHalf) +
            '</ul></ol></li>';
        insightsCount++;
    }




    insights += '</ul><h5>Mod-specific Issues:</h5><ul>';

    //Monster Mod
    if (sections.firstLine.includes('5999C7') || sections.firstLine.includes('D02C2C')) {
        insights += '<li>❓ <b>5999C7 or D02C2C Detected:</b> These errors are often related to <b>"Monster Mod.esp"</b>. This mod is commonly thought to cause numerous errors and crashes to desktop (CTD), even with unofficial patches and the latest updates. If you prefer to keep the mod, consider the following steps:<ol>' +
            '<li>Ensure you have the latest version of the mod installed.</li>' +
            '<li>Apply any available unofficial patches that may address known issues.</li>' +
            '<li>Check for compatibility with other mods and load order. ⚠️Note: Avoid using tools like LOOT with Nolvus.</li>' +
            '<li>If crashes persist, consider removing the mod and cleaning your save file with a tool like FallrimTools.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //Lanterns Of Skyrim II
    if (sections.topHalf.toLowerCase().includes('lanterns\\lantern.dds') || sections.topHalf.toLowerCase().includes('Lanterns Of Skyrim II.esm'.toLowerCase())) {
        insights += '<li>❓ <b>Possible Lanterns Of Skyrim II Issue Detected:</b> If you\'re using both the mods "Lanterns of Skyrim II" (LoS II) and "JK Skyrim," exercise caution when installing the "No Lights Patch." The LoS II patch is specifically designed to be used without the "No Lights Patch." Installing both may lead to conflicts or unexpected behavior related to lantern textures and lighting in your game. To avoid issues, follow these steps:<ol>' +
            '<li>Check the mod descriptions and compatibility notes for both "Lanterns of Skyrim II" and "JK Skyrim."</li>' +
            '<li>If you intend to use the "No Lights Patch," ensure that it is compatible with both mods.</li>' +
            '<li>If conflicts persist, consider using alternative patches or adjusting your mod load order.</li>' +
            '<li>Note: "Lanterns of Skyrim II" mod is not present in vanilla Nolvus.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //ImprovedCameraSE
    if (sections.topHalf.toLowerCase().includes('ImprovedCameraSE.dll'.toLowerCase())) {
        insights += '<li>❓ <b>ImprovedCameraSE.dll+ Issue Detected:</b> The presence of \'ImprovedCameraSE.dll+\' in the crash log indicates an error related to the **Improved Camera SE** mod. This mod enhances the in-game camera functionality, allowing for more dynamic and immersive views. However, pinpointing the exact cause of this error can be challenging. Here are some potential solutions to consider:<ol>' +
            '<li>Add \'-forcesteamloader\' to your SKSE (Skyrim Script Extender) launch arguments. This flag ensures that SKSE uses the Steam loader, which can resolve compatibility issues with certain mods.</li>' +
            '<li>Modify ReShade\'s INI file: Look for the \'MenuMode\' setting and change it to \'0\'. This adjustment might prevent conflicts between ReShade and Improved Camera SE.</li>' +
            '<li>If issues persist, seek assistance on the mod\'s support page or community forums. Other users may have encountered similar problems and can provide specific advice.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    // HairMaleNord01
    function checkHairModCompatibility(sections) {
        const hairModStrings = [
            'HairMaleNord', // These would usualy apear with a number at the end. Example: HairMaleNord01
            'HairFemaleNord',
            'HairMaleImperial',
            'HairFemaleImperial',
            'HairMaleBreton',
            'HairFemaleBreton',
            'HairMaleRedguard',
            'HairFemaleRedguard',
            'HairMaleElf',
            'HairFemaleElf',
            'HairMaleKhajiit',
            'HairFemaleKhajiit',
            'HairMaleOrc',
            'HairFemaleOrc',
            'Hairdo', // a generic catch all
            //'Hair', // overly generic, matches on "crosshair"
            'KS Hairdos.esp', 
            'ApachiiSkyHair.esm',
            'SGHairPackAIO.esp',
            'Dint999HairPack.esp',
            'SaltAndWind.esp',
            'StraightHairRetexture.esp',
            'BedHead.esp',
            'KaliliesBrows.esp',
            'HHairstyles.esp',
            'LovelyHairstyles.esp',
            'SuperiorLoreFriendlyHair.esp',
            'HallgarthsAdditionalHair.esp',
            'HG Hairdos 2.esp',
        ];
        
        const physicsModStrings = [
            'HDT-SMP',
            'hdtSMP',
            'CBPC',
            'Physics', // a generic catch-all for any physics mod
        ];
    
        const foundHairMods = hairModStrings.filter(str => 
            sections.topHalf.toLowerCase().includes(str.toLowerCase())
        );
    
        const foundPhysicsMods = physicsModStrings.filter(str => 
            logFile.toLowerCase().includes(str.toLowerCase())
        );

        Utils.debuggingLog(['checkHairModCompatibility', 'analyzeLog.js'], 'Found hair mods: ' + foundHairMods.join(', '));
        Utils.debuggingLog(['checkHairModCompatibility', 'analyzeLog.js'], 'Found physics mods: ' + foundPhysicsMods.join(', '));
    
        if (foundHairMods.length > 0) {
            let insights = '<li>❓ <b>Possible Hair Mod Issue Detected:</b> The following hair-related indicators were found: ' +
                '<code>' + foundHairMods.join('</code>, <code>') + '</code>. To troubleshoot this issue:<ol>';
    
            if (sections.topHalf.includes('NiRTTI_BSDynamicTriShape')) {
                insights += '<li>The presence of NiRTTI_BSDynamicTriShape suggests a potential issue with dynamic hair meshes. Ensure your hair physics mods are compatible and properly installed.</li>';
            }
    
            insights += '<li>Ensure that all hair mods are up to date and compatible with your version of Skyrim and SKSE.</li>';
    
            if (foundPhysicsMods.length > 0) {
                insights += '<li>Check that installed physics mods are compatible with your hair mods and Skyrim version.</li>';
            }
    
            insights += '<li>Check hair mod pages for known compatibility issues and required patches.</li>';
    
            if (Utils.isSkyrimPage) {
                insights += '<li>Try using <a href="https://loot.github.io/">LOOT</a> as a diagnostic tool. ⚠️Caution: LOOT can safely be used as a diagnostic tool, but for load order reorganizing, it is widely thought to misplace 5 to 10% of mods ... which can be especially problematic with large mod lists.</li>';
            }
    
            insights +=
                '<li>If the problem persists, try disabling hair mods one by one to isolate the conflict.</li>' +
                '<li>Consider running your mods directory through <a href="https://www.nexusmods.com/skyrim/mods/75916/">NifScan</a></li><ul><li>especially if any hair indicators show up in this list of mentioned mesh files: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
                    Utils.extractNifPathsToListItems(sections.topHalf) +
                '</li></ul></ul></ol></li>';
    
            return {
                insights: insights,
                insightsCount: 1
            };
        }
    
        return {
            insights: '',
            insightsCount: 0
        };
    }
    const hairResult = checkHairModCompatibility(sections);
    insights += hairResult.insights;
    insightsCount += hairResult.insightsCount;


    /* 	DISABLED: as (1) is well tested as part of vanilla Nolvus, (2) doesn't have a specific fix, and (3) is not a common issue (if at all?)
        //Skyrim Unbound
        if (sections.topHalf.includes('Skyrim unbound')) {
            insights += '<li><b>Skyrim Unbound Issue Detected:</b> The mention of \'Skyrim Unbound\' in the crash log indicates a potential issue related to this mod. If you\'re experiencing problems, consider installing one of the available fixes specifically designed for Skyrim Unbound. These fixes address common issues and enhance compatibility with other mods.</li>';
            insightsCount++;
        }
    */


    //SimplestHorses.esp
    if (sections.relevantObjects.toLowerCase().includes('SimplestHorses.esp'.toLowerCase())) {
        insights += '<li>❓ <b>Potential Conflict with Simplest Horses:</b> Crashes may occur due to conflicts between Simplest Horses and other mods, especially when custom lists are involved. To address this, you can: <ul><li>Command your horse to wait at a location before fast traveling. Press the "H" hotkey while not targeting your horse to make it wait.</li><li>Disable horse followers in the Mod Configuration Menu (MCM) of your follower framework (e.g., Nether\'s Follower Framework in Nolvus).</li><li>If the issue still persists, consider disabling recently added mods or the following mods: <ol><li>Simplest Horses</li><li>Simplest Horses - Animated Whistling Patch</li></ol></li></ul></li>';
        insightsCount++;
    }

    //Animated Ice Floes.esp
    if (sections.relevantObjects.toLowerCase().includes('Animated Ice Floes.esp'.toLowerCase())) {
        insights += '<li>❓ <b>Potential Conflict with Animated Ice Floes:</b> This crash occurs on customized lists and is speculated to be the result of a conflict between Animated Ice Floes and certain additional mods. If issue persists try disabling either your recently added mod(s), or the Animated Ice Floes mod.</li>';
        insightsCount++;
    }


    insights += '</ul><h5>Miscellaneous Issues:</h5><ul>';

    //Shadowrend
    if (sections.relevantObjects.toLowerCase().includes('ccbgssse018-shadowrend.esl')) {
        insights += '<li>❓ <b>Possible Shadowrend Crash Detected:</b> The presence of \'ccbgssse018-shadowrend.esl\' in the crash log suggests an issue related to the Shadowrend weapon. To address this issue:<ol>' +
            '<li>Load an earlier save that predates the crash.</li>' +
            '<li>Travel to a different cell (area) from where the original crash occurred.</li>' +
            '<li>Play for a few in-game days away from the area where Shadowrend is involved. This may allow the issue to resolve itself.</li>' +
            '<li><b>Be cautious</b> when loading a save that previously experienced the Shadowrend crash. Continuing to play on such a save might compound the issue, leading to more frequent crashes.</li>' +
            '<li>Note that while Shadowrend often appears in crash logs, it may not always be the direct cause of the crash. Other factors, such as load order conflicts, can also contribute.</li>' +
            '</ol>For more detailed information and troubleshooting tips, refer to the <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-6">Shadowrend Crash section</a> on the Nolvus support page.</li>';
        insightsCount++;
    }

    //Forced Termination
    if (sections.firstLine.includes('0CB748E')) {
        insights += '<li>❓ <b>0CB748E Detected:</b>This type of crash is often not indicative of a problem within the game itself but rather the result of the game\'s process being <b>forcibly terminated</b>. When Skyrim is closed in this manner, it doesn\’t go through the normal shutdown sequence, which can result in incomplete or corrupted data being written to the crash log.</li>';
        insightsCount++;
    }

    //Animation Issue
    if (sections.firstLine.includes('67B88B')) {
        insights += '<li>❓ <b>67B88B Detected:</b> This error is often linked to issues with the <b>"AnimationGraphManagerHolder"</b> callstack, which can occur when there are conflicts between animation mods or when an animation mod fails to overwrite vanilla animations properly. To resolve this:<ol>' +
            '<li>Regenerate animations using FNIS (Fores New Idles in Skyrim) or Nemesis (as is used by vanilla Nolvus).  Follow these instructions for <a href="https://www.nolvus.net/guide/asc/output/nemesis">regenerating Nemesis for Nolvus</a>.</li>' +
            '<li>Ensure that the FNIS.esp file is not deleted, as it is generated by FNIS/Nemesis and is necessary for the animations to work correctly.</li>' +
            '<li>Check for updates or patches for your animation mods, especially if you have recently installed or updated other mods that may affect animations.</li>' +
            '<li>If the issue persists, consider disabling recent animation mods one by one to identify the culprit.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //SSE Engine Fixes and Equipment Durability System
    if (sections.firstLine.includes('7428B1')) {
        insights += '<li>❓ <b>7428B1 Detected:</b> This error is often connected to issues with the <b>"SSE Engine Fixes"</b> mod. To troubleshoot, consider the following steps:<ol>' +
            '<li>Check if you are using the <b>"Equipment Durability System"</b> mod, which can cause issues when an enchanted weapon breaks.</li>' +
            '<li>Look for conflicts with other mods that modify characters while they are holding a weapon. This includes mods that alter animations, equipment, or character models.</li>' +
            '<li>Ensure that "SSE Engine Fixes" is properly installed and configured according to the latest instructions provided by the mod author.</li>' +
            '<li>If the problem persists, try disabling the "Equipment Durability System" mod and any other recently added mods one by one to identify the conflict.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //SSE Engine Fixes and SSE Display Tweaks
    if (sections.firstLine.includes('8BDA97')) {
        insights += '<li>❓ <b>8BDA97 Detected:</b> This error may be due to a conflict between <b>"SSE Engine Fixes" and "SSE Display Tweaks"</b> mods. To address this issue:<ol>' +
            '<li>Review the settings in both mods and ensure they are not set to override each other.</li>' +
            '<li>Consult the documentation for each mod to understand the recommended settings for compatibility.</li>' +
            '<li>Check for any updates or patches that might resolve known conflicts between these mods.</li>' +
            '<li>If the issue persists, consider using one mod at a time to identify which settings are causing the conflict.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //Hotkeys
    if (sections.firstLine.includes('C1315C')) {
        insights += '<li>❓ <b>C1315C Detected:</b> This error is often related to modifications in the "controlmap.txt" file, which can be altered by mods that utilize <b>hotkeys</b>. To troubleshoot this issue:<ol>' +
            '<li>Identify any mods that have been recently installed or updated, which may modify the "controlmap.txt" file.</li>' +
            '<li>Check the mod descriptions and documentation for any known issues or specific instructions regarding the "controlmap.txt" file.</li>' +
            '<li>Consider reverting "controlmap.txt" to its original state or using a backup if available.</li>' +
            '<li>If the problem persists, disable the suspected mods one by one to identify the culprit.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //Save game issues
    if (sections.firstLine.includes('D2B923')) {
        insights += '<li>❓ <b>D2B923 Detected:</b> This error is often linked to <b>save game issues</b>. It may be associated with mods that alter the save system, such as "Save System Overhaul (SSO)" or "Alternate Start - Live Another Life (LAL)". A potential fix for users experiencing flashing savegame entries with SkyUI SE is the "SkyUI SE - Flashing Savegames Fix". If you\'re using a version of Skyrim SE or AE before v1.6.1130, this fix should work. For later versions, the "SkyUI SE - Difficulty Persistence Fix" is recommended, which includes the flashing savegames fix. Also, if you aren\'t aware of (and diligently following) <b>Jerilith\'s Safe Save Guide</b>, review it at <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-5">Save Bloat Crash</a/>.</li>';
        insightsCount++;
    }

    //Save game issue 2
    if (sections.topHalf.toLowerCase().includes('BGSSaveLoadManager'.toLowerCase())) {
        insights += '<li>❓ <b>BGSSaveLoadManager Issue Detected:</b> This error is associated with problems in the <b>save game</b> system. If you aren\'t aware of (and diligently following) <b>Jerilith\'s Safe Save Guide</b>, review it at <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-5">Save Bloat Crash</a/>. Issue may manifest as corrupted saves or issues when loading games. To potentially resolve this, you can try the following after loading the last working save:<ol>' +
            '<li>Open the console in-game by pressing the tilde (~) key.</li>' +
            '<li>Type the command "player.kill" and press Enter. This will kill your character and force the game to reload.</li>' +
            '<li>After the game reloads, check if the issue with saving or loading persists.</li>' +
            '<li>If problems continue, consider reverting to an earlier save or using save cleaning tools to remove orphaned scripts and other potential corruptions.</li>' +
            '<li>Always keep backups of your saves before attempting fixes or using cleaning tools.</li>' +
            '</ol>Note: This method is experimental and may not work for all users. It is recommended to seek further assistance from the Skyrim modding community if save game issues are persistent.</li>';
        insightsCount++;
    }

    //SKSE
    if (sections.topHalf.toLowerCase().includes('skse64_loader.exe')) {
        insights += '<li>❓ <b>skse64_loader.exe Issue Detected:</b> This entry suggests that there may be an issue with <b>SKSE (Skyrim Script Extender)</b> or a mod that utilizes it. Common troubleshooting steps include:<ol>' +
            '<li>Ensuring that SKSE is properly installed and that you are launching Skyrim through the SKSE launcher.</li>' +
            '<li>Checking that your version of SKSE matches your version of Skyrim SE/AE.</li>' +
            '<li>Verifying that all mods dependent on SKSE are up to date and compatible with your current game version.</li>' +
            '<li>Running Skyrim as an administrator, which can sometimes resolve permission issues with SKSE.</li>' +
            '<li>Adding exceptions for SKSE and your mod manager in your security software to prevent interference.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //HDT-SMP (Skinned Mesh Physics)
    if (sections.topHalf.toLowerCase().includes('hdtSMP64.dll'.toLowerCase())) {
        insights += '<li>❓ <b>hdtSMP64.dll Issue Detected:</b> Frequent occurrences of this error might suggest a configuration issue or indicate <b>physics</b> issues with NPCs wearing <b>HDT/SMP</b> enabled armor/clothing/hair. To troubleshoot this issue:<ol>' +
            '<li>Ensure that \'hdtSMP64.dll\' is compatible with your installed versions of SkyrimSE.exe and SKSE. Incompatible DLLs can lead to crashes.</li>' +
            '<li>Check for any recent updates or patches for the mod associated with \'hdtSMP64.dll\'.</li>' +
            '<li>Review your mod configuration settings, especially those related to HDT/SMP, to ensure they are set up correctly.</li>' +
            '<li><b>Workaround:</b> Sometimes, wearing all non-physics armor/clothing/wigs/equipment can alleviate problems with physics. Also, if you or a follower has physics-enabled hair, try wearing a non-physics helmet to cover it up.</li>' +
            '<li><b>Alternatively,</b> reinstall Nolvus without Advanced Physics to prevent any such future issues.</li>' +
            '<li>If the issue persists, consider disabling mods that use HDT/SMP one by one to identify the source of the problem.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //cbp.dll Issue
    if (sections.topHalf.toLowerCase().includes('cbp.dll')) {
        insights += '<li>❓ <b>cbp.dll Issue Detected:</b> Frequent appearances of this error might suggest a configuration issue or indicate <b>physics</b> issues with NPCs are wearing <b>SMP/CBP</b> enabled clothing. To troubleshoot this issue:<ol>' +
            '<li>Ensure that \'cbp.dll\' is compatible with your installed versions of SkyrimSE.exe and SKSE. Incompatible DLLs can lead to crashes.</li>' +
            '<li>Check for any recent updates or patches for the mod associated with \'cbp.dll\'.</li>' +
            '<li>Review your mod configuration settings, especially those related to CBP, to ensure they are set up correctly.</li>' +
            '<li><b>Workaround:</b> Sometimes, wearing all non-physics armor/clothing/wigs/equipment can alleviate problems with physics. Also, if you or a follower has physics-enabled hair, try wearing a non-physics helmet to cover it up</li>' +
            '<li><b>Alternatively,</b> reinstall Nolvus without Advanced Physics to prevent any such future issues.</li>' +
            '<li>If the issue persists, consider disabling mods that use CBP one by one to identify the source of the problem.</li>' +
            '<li>Some users have reported success by restarting their PC, renaming \'cbp.dll\' to something else to force a different load order, or verifying the integrity of game files on Steam if there\'s a suspicion of file corruption.</li>' +
            '</ol></li>';
        insightsCount++;
    }


    //0x0 on thread (Lighting or Shadows)
    if (sections.topHalf.toLowerCase().includes('0x0 on thread')) {
        insights += '<li>❓ <b>0x0 on thread Issue Detected:</b> This rare engine issue is often related to face lighting or shadow problems. To mitigate this issue, follow these steps:<ol>' +
            '<li>Ensure you have the latest version of <a href="https://www.nexusmods.com/skyrimspecialedition/mods/17230">SSE Engine Fixes</a> installed. Engine Fixes addresses various bugs and patches issues in Skyrim Special Edition.</li>' +
            '<li>Check for any conflicting mods that may affect lighting or shadows. Disable or adjust mods related to lighting, weather, or visual enhancements.</li>' +
            '<li>Verify that your graphics drivers are up-to-date, as outdated drivers can sometimes cause graphical glitches.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //HUD
    //Merged with test thought up by AI (MS Bing Copilot):
    const hudRelatedRegex = /HUD|menus|maps/ig;
    var hudRelatedMatches = sections.topHalf.match(hudRelatedRegex) || [];
    if (hudRelatedMatches.length > 0) {
        insights += '<li>❓ <b>HUD Issue Detected:</b> The error suggests a conflict with your HUD/UI. To troubleshoot this issue, consider the following steps:<ol>' +
            '<li>Check for any mods that alter the HUD or user interface. Disable or adjust these mods to see if the issue persists.</li>' +
            '<li>Ensure that you have the latest version of SkyUI installed. Sometimes outdated versions can cause HUD-related problems.</li>' +
            '<li>Verify that your SKSE (Skyrim Script Extender) is up-to-date, as it\'s essential for many mods, including SkyUI.</li>' +
            '<li>If you\'re using other HUD-related mods, ensure they are compatible and load them in the correct order.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //XPMSE
    if (sections.topHalf.toLowerCase().includes('XPMSE'.toLowerCase())) {
        insights += '<li>❓ <b>XPMSE Issue Detected:</b> The mention of \'XPMSE\' in the crash log suggests a potential conflict or issue with the XP32 Maximum Skeleton Extended mod or its dependencies. This mod is crucial for animation support and is often required by other mods that add or modify character animations. To address this issue, consider the following steps:<ol>' +
            '<li>Ensure that XPMSE is installed correctly and is loaded at the correct point in your mod load order.</li>' +
            '<li>Verify that all mods requiring XPMSE as a dependency are compatible with the version you have installed.</li>' +
            '<li>Update XPMSE and any related mods to their latest versions.</li>' +
            '<li>If you have recently added or removed mods, check for any that might affect skeleton or animation files and adjust accordingly.</li>' +
            '<li>Consult the mod descriptions and community forums for specific troubleshooting steps related to XPMSE.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //XAudio
    if (sections.topHalf.toLowerCase().includes('XAudio'.toLowerCase())) {
        insights += '<li>❓ <b>XAudio Issue Detected:</b> The \'XAudio\' error indicates a problem with the game\'s audio processing components. XAudio is a part of the Windows audio infrastructure, separate from DirectX. To resolve audio issues, follow these steps:<ol>' +
            '<li>Download and install the latest version of the XAudio redistributable that is compatible with your operating system.</li>' +
            '<li>Ensure your sound card drivers are up to date. Visit the manufacturer\'s website for the latest driver software.</li>' +
            '<li>If you\'re using audio mods, verify their compatibility with your version of Skyrim and other installed mods.</li>' +
            '<li>Check the game\'s audio settings and adjust them if necessary. Sometimes, changing the audio format can resolve issues.</li>' +
            '<li>Consult the Skyrim modding community forums for specific solutions to XAudio-related errors.</li>' +
            '</ol></li>';
        insightsCount++;
    }


    //keyboard
    if (sections.topHalf.toLowerCase().includes('bswin32keyboarddevice')) {
        insights += '<li>❓ <b>bswin32keyboarddevice Issue Detected:</b> The error related to \'bswin32keyboarddevice\' typically indicates a problem with the keyboard input system within the game. While this issue can sometimes be resolved with a simple computer restart, there are additional steps you can take if the problem persists:<ol>' +
            '<li>Restart your computer to refresh the system and potentially resolve any temporary conflicts.</li>' +
            '<li>Check for update	s to your keyboard drivers and install them if available.</li>' +
            '<li>Ensure that Skyrim and any related mods are up to date.</li>' +
            '<li>If you are using mods that affect keyboard inputs or hotkeys, verify their compatibility and settings.</li>' +
            '<li>Consult the modding community forums for any known issues with \'bswin32keyboarddevice\' and potential fixes.</li>' +
            '</ol></li>';
        insightsCount++;
    }


    //DynDOLOD
    if (sections.topHalf.toLowerCase().includes('DynDOLOD.esm'.toLowerCase())) {
        insights += '<li>❓ <b>DynDOLOD.esm Issue Detected:</b> The \'DynDOLOD.esm\' error is known to cause crashes to desktop (CTDs) when transitioning between locations, especially when autosave occurs concurrently with script execution. This can be due to the mod making extensive changes to the game\'s LOD (Level of Detail) which can be resource-intensive. To mitigate this issue:<ol>' +
            '<li>Disable autosave in the game settings, particularly when changing locations or fast traveling.</li>' +
            '<li>Manually save your game at regular intervals to avoid losing progress.</li>' +
            '<li>Ensure that \'DynDOLOD.esm\' is properly installed and that you have the latest version.</li>' +
            '<li>Check for any updates or patches that may address known issues with this mod.</li>' +
            '<li>Consider <a href="https://www.nolvus.net/guide/asc/output/dyndolod">regenning DynDOLOD</a>?</li>' +
            '<li>If the problem persists, seek assistance on the mod\'s official support forum. Provide detailed information about your issue and any relevant crash logs for further investigation.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    // Check thought up by AI (MS Bing Copilot):
    //ObjectReference Issues
    const objectReferenceRegex = /kDeleted|TESLevItem/ig;
    var objectReferenceMatches = sections.topHalf.match(objectReferenceRegex) || [];
    if (objectReferenceMatches.length > 0) {
        insights += '<li>❓ <b>ObjectReference Issues Detected:</b> The presence of ' + objectReferenceMatches.length + ' ObjectReference keyword(s) suggests crashes related to specific objects or records. To troubleshoot this:<ol>' +
            '<li>Search the crash log for keywords like <b>"kDeleted"</b> or <b>"TESLevItem"</b> which indicate missing or corrupted game objects.</li>' +
            '<li>Review the involved plugins (mods) and their load order to ensure there are no conflicts or missing dependencies.</li>' +
            '<li>Use mod management tools to verify the integrity of the mods and resolve any conflicts.</li>' +
            '<li>If a particular object or record is consistently involved in crashes, consider removing or replacing the mod that contains it.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    // Horse Follower Pathing Issue
    if (sections.topHalf.includes('Pathing') &&
        (sections.relevantObjects.toLowerCase().includes('horse') ||
            sections.relevantObjects.toLowerCase().includes('pony') ||
            sections.relevantObjects.toLowerCase().includes('mount'))) {
        insights += '<li>❓ <b>Horse Follower Pathing Issue:</b> This crash may occur when horse or pony followers encounter pathfinding issues to reach the player character. To mitigate this, consider the following steps: <ul>' +
            '<li>Disable horse followers in the Mod Configuration Menu (MCM) of your follower framework (e.g., Nether\'s Follower Framework in Nolvus).</li>' + 
            '<li>OR, always command your horse to wait at a location before initiating fast travel.</li>' + 
            '</ul></li>';
        insightsCount++; // Increment the count of insights detected
    }

    /*DISABLED UNTIL I CAN FIND EXAMPLES SO I CAN LIST THE MISSING/CORRUPTED OBJECTS:
          // Check thought up by AI (MS Bing Copilot):
        //ObjectReference Issues 2
        if (objectReferenceMatches.length > 0) {
            const missingOrCorruptedObjects = objectReferenceMatches.map(match => match === 'kDeleted' ? 'missing' : 'corrupted');
            const uniqueObjects = [...new Set(missingOrCorruptedObjects)];
	
            insights += '<li><b>ObjectReference Issues Detected:</b> The presence of ' + objectReferenceMatches.length + ' ObjectReference keyword(s) suggests crashes related to specific objects or records. To troubleshoot this:<ol>' +
                '<li>Search the crash log for keywords like <b>"kDeleted"</b> or <b>"TESLevItem"</b> which indicate ' + (uniqueObjects.length === 1 ? 'the following issue:' : 'the following issues:') + '</li>' +
                '<li><ul>';
	
            if (uniqueObjects.includes('missing')) {
                insights += '<li><b>Missing Objects:</b> These "missing" objects are referenced but not found in the game. Check if any required mods or assets are missing or disabled.</li>';
            }
	
            if (uniqueObjects.includes('corrupted')) {
                insights += '<li><b>Corrupted Objects:</b> These "corrupted" objects may be damaged or incorrectly modified. Investigate the involved plugins (mods) and their load order.</li>';
            }
	
            insights += '</ul></li>' +
                '<li>Use mod management tools to verify the integrity of the mods and resolve any conflicts.</li>' +
                '<li>If a particular object or record is consistently involved in crashes, consider removing or replacing the mod that contains it.</li>' +
                '</ol></li>';
            insightsCount++;
        } */


    /* 	DISABLED TEST ... AI thought it up, and I can't even get it to throw even on a mockup test.log and even with AI's help
        //WILL THIS ONE EVER ACTUALLY FIND ANYTHING?
        // Check thought up by AI (MS Bing Copilot):
        //File Format Version Mismatch
        const frameworkVersionRegex = /ApplicationVersion: (\\d+\\.\\d+\\.\\d+\\.\\d+)/;
        var frameworkVersionMatch = sections.topHalf.match(frameworkVersionRegex);
        var gameVersion = frameworkVersionMatch ? frameworkVersionMatch[1] : 'unknown'; // Fallback to 'unknown' if not found
	
        const fileFormatVersionMismatchRegex = /File Format Version: (\\d+\\.\\d+)/g;
        var fileFormatVersionMatches = sections.topHalf.match(fileFormatVersionMismatchRegex) || [];
	
        if (fileFormatVersionMatches.length > 0 && gameVersion !== 'unknown') {
            var mismatchedFiles = fileFormatVersionMatches.filter(match => !match.includes(gameVersion));
            insights += '<li><b>File Format Version Mismatch Detected:</b> Incompatible file format versions can lead to crashes. To troubleshoot:<ol>' +
                '<li>Check the file format versions listed in the crash log against your game version (' + gameVersion + ').</li>' +
                '<li>If mismatches are found, consider updating the files or mods to ensure compatibility.</li>' +
                '<li>Installing <a href=\\"https://www.nexusmods.com/skyrimspecialedition/mods/21146\\">Backported Extended ESL Support (BEES)</a> may help load older files safely.</li>' +
                '</ol>' +
                (mismatchedFiles.length > 0 ? '<p>The following file(s) have mismatched versions:</p><ul>' + mismatchedFiles.map(file => '<li>' + file + '</li>').join('') + '</ul>' : '') +
                '</li>';
            insightsCount++;
        } END DISABLED TEST */




    var outputHtml = '<ul>' + diagnoses + '</ul>';
    document.getElementById('result').innerHTML = outputHtml;

    if (Utils.logType === 'CrashLogger' || document.getElementById('speculativeInsights').checked) {
        if (insights.trim() !== '') {
            outputHtml = '<h4>For Advanced Users:</h4>⚠️<b>CAUTION:</b> some of the instructions below (and a few of their tests) were generated by an AI system ... so they could potentially be giving bad advice. If you aren\'t confident in what you are doing, please consult with the Nolvus modding community before making any significant changes to mods added by vanilla Nolvus.' + insights + '</ul>';
            showH4();
            document.getElementById('speculation').innerHTML = outputHtml;
        }
    }

    Utils.debuggingLog(['analyzeLog', 'analyzeLog.js'], 'diagnosesCount:', diagnosesCount);
    Utils.debuggingLog(['analyzeLog', 'analyzeLog.js'], 'insightsCount:', insightsCount);
    Utils.debuggingLog(['analyzeLog', 'analyzeLog.js'], 'insightsCount - diagnosesCount =', insightsCount - diagnosesCount);

    showCopyDiagnosesButton();
    addEmojiClickEvent();

    Utils.setLogType(Utils.getLogType(Utils.logLines));

    Utils.debuggingLog(['analyzeLog', 'analyzeLog.js'], 'analyzeLog completed');
    return { 
        //Currently UNUSED, but AI offered them up, so I thought I'd put them here just in case
        insights, 
        insightsCount, 
        diagnoses, 
        diagnosesCount, 
        isVanillaNolvus, 
        hasBadlyOrganizedNolvusPlugins,
        hasNonNolvusPluginsAtBottom,
        badlyOrderedVanillaPlugins
    };
}


