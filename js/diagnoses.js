//All diagnosing functions for both analyzeLog.js's diagnoses and insights variables. Only use insights.js if there needs to be a version of a function unique to the insights variable


//NonESL Plugins Count Warning
function checkForTooManyNonEslPlugins(crashLogSection) {
    const countInfo = Utils.countNonEslPlugins(crashLogSection);
    let diagnosis = '';

    if (countInfo.nonEslPluginsCount > 254) {
        diagnosis += `<li>🎯 <b>Exceeded Maximum ESMs+ESPs Plugins Limit!</b> Your load order has <code>${countInfo.nonEslPluginsCount}</code> non-ESL-ed plugins, which is too many. Skyrim can only handle up to 254 non-ESL-ed plugins. 255 or more will cause game instability and crashes. For more information and a screenshot from Mod Organizer 2 (MO2), refer to this <a href="https://www.reddit.com/r/Nolvus/comments/1b041m9/reference_keep_your_active_esmsesps_count_to_254/">post</a>.
        <ul>
            <li>Note: this number excludes <code>.esp</code> plugins that have been <i>flagged</i> as ESL, and are thus are displayed in the log with extra digits in their hex number (example: the uncounted <code>[FE 000]</code> versus the counted <code>[FF]</code>).</li>
            <li><a href = "${Utils.isSkyrimPage ? 'https://www.nexusmods.com/skyrimspecialedition/mods/21618' : 'https://docs.google.com/spreadsheets/d/10p_ZFCTxXg5ntdsQipOGLcMAnoYDOC4qBEIt5ZAOo-o/'}">Information on safely squeezing in more mods.</a></li>
        </ul></li>`;
    }

    return diagnosis;
}

/* Example usage:
const crashLogSection = `... your crash log content ...`;
const diagnosisResult = checkForNonEslPluginCount(crashLogSection);
console.log(diagnosisResult);
*/



// Object Reference None Detection
// Base game files that don't need investigation as they're part of Skyrim itself
const neverDisplay = [
    'Skyrim.esm',
    'Update.esm',
    'Dawnguard.esm',
    'HearthFires.esm',
    'Dragonborn.esm'
];

function checkForObjectReferenceNone(sections) {
    /* Log Examples:

        --- Relevant portion of an example CL log: ---

        RSI 0x2326C9C1AE0      (TESObjectREFR*)
            Object Reference: None
            ParentCell: ---
                File: "SDA DX Crimson Blood Patch.esp"
                Modified by: Skyrim.esm -> Dawnguard.esm -> Unofficial Skyrim Special Edition Patch.esp -> LegacyoftheDragonborn.esm -> YurianaWench.esp -> Crimson Blood Armor.esp -> SDA DX Crimson Blood Patch.esp
                Flags: 0x00040009 
                Name: "Bloodlet Throne"
                EditorID: "BloodletThrone01"
                FormID: 0x00016EA1
                FormType: Cell (60)
            File: "SDA DX Crimson Blood Patch.esp"
            Modified by: Crimson Blood Armor.esp -> SDA DX Crimson Blood Patch.esp
            Flags: 0x00400408 kInitialized
            FormID: 0x2C08C78A
            FormType: Reference (61)

        --- Relevant portion of an example NSF log: --- 

            [   1]    TESObjectREFR(FormId: E308C78A, File: SDA DX Crimson Blood Patch.esp <- Crimson Blood Armor.esp, BaseForm: null)

    */
    let diagnoses = '';
    let crashTitle = 'Object Reference: None'; //Defaults to Crash Logger SSE's title
    if (sections.logType === "CrashLogger") {
        // Regular expression to match "Object Reference: None" patterns (case-insensitive)
        const objectRefNoneRegex = /object reference:\s*none/i;
        
        // Function to extract the relevant section
        function extractRelevantSection(lines, startIndex) {
            let section = [];
            let i = startIndex;
            
            // Go backwards to find the start of the section (line with one tab)
            while (i >= 0 && lines[i].startsWith('\t\t')) {
                i--;
            }
            let sectionStart = i;
            
            // Go forwards to find the end of the section (last line with two or more tabs)
            i = startIndex;
            while (i < lines.length && lines[i].startsWith('\t\t')) {
                section.push(lines[i]);
                i++;
            }
            
            return section;
        }
        
        // Function to extract file information
        function extractFileInfo(section) {
            let files = section.filter(line => line.toLowerCase().includes('file:'));
            let otherFiles = files.length > 0 ? files[0].split(':')[1].trim() : '';
            let mostLikelyFile = files.length > 0 ? files[files.length - 1].split(':')[1].trim() : '';
            return { otherFiles, mostLikelyFile };
        }
        
        // Find all instances of "Object Reference: None"
        const lines = sections.topHalf.split('\n');
        const instances = lines.reduce((acc, line, index) => {
            if (objectRefNoneRegex.test(line)) {
                acc.push(index);
            }
            return acc;
        }, []);
        
        // Set to store unique instances
        const uniqueInstances = new Set();
        
        // Process each instance
        instances.forEach((instanceIndex) => {
            const relevantSection = extractRelevantSection(lines, instanceIndex);
            const { otherFiles, mostLikelyFile } = extractFileInfo(relevantSection);
            
            // Create a unique key for this instance
            const instanceKey = `${otherFiles}|${mostLikelyFile}`;
            
            // Only process if this is a new unique instance
            if (!uniqueInstances.has(instanceKey)) {
                uniqueInstances.add(instanceKey);
                
                if (otherFiles || mostLikelyFile) {
                    diagnoses += generateDiagnosis(crashTitle, otherFiles, mostLikelyFile);
                }
            }
        });
    } else if (sections.logType === "NetScriptFramework") {
        // Regular expression for NSF null BaseForm references
        const nsfNullBaseFormRegex = /\(FormId.+BaseForm:\s*null/;  //OLD VERSION didn't catch enough: /TESObjectREFR.*BaseForm:\s*null/ 
        
        // Function to extract file information from NSF format
        function extractNSFFileInfo(line) {
            const fileMatch = line.match(/File:\s*`([^`]+)`/);
            if (fileMatch) {
                const files = fileMatch[1].split(' <- ').map(f => f.trim());
                
                // Filter out neverDisplay files from the otherFiles list
                const relevantOtherFiles = files.slice(1).filter(file => !neverDisplay.includes(file));
                
                return {
                    mostLikelyFile: files[0],
                    otherFiles: files.length === 1 ? files[0] : 
                               relevantOtherFiles.length > 0 ? relevantOtherFiles.join(' <- ') : ''
                };
            }
            return { otherFiles: '', mostLikelyFile: '' };
        }
        
        // Find all instances of null BaseForm references
        const lines = sections.topHalf.split('\n');
        const uniqueInstances = new Set();
        
        lines.forEach(line => {
            if (nsfNullBaseFormRegex.test(line)) {
                const { otherFiles, mostLikelyFile } = extractNSFFileInfo(line);
                
                // Create a unique key for this instance
                const instanceKey = `${otherFiles}|${mostLikelyFile}`;
                
                // Only process if this is a new unique instance
                if (!uniqueInstances.has(instanceKey) && (otherFiles || mostLikelyFile)) {
                    uniqueInstances.add(instanceKey);
                    crashTitle = 'BaseForm: null';
                    diagnoses += generateDiagnosis(crashTitle, otherFiles, mostLikelyFile);
                }
            }
        });
    }
    
    return diagnoses;
}

// Helper function to generate consistent diagnosis text
function generateDiagnosis(crashTitle, otherFiles, mostLikelyFile) {
    if (neverDisplay.includes(mostLikelyFile)) {
        return '';
    }

    let diagnosis = `<li>🎯 <b>"${crashTitle}" Detected:</b> This suggests a mod is attempting to reference a non-existent object. This can happen due to mod conflicts, incompatible versions, or load order issues. Here's what you need to know:<ul>`;
    
    diagnosis += `<li><b>Troubleshooting Steps:</b><ol>
        <li>Check for other high-priority issues in this report first, as they might be causing this problem.</li>
        <li>The primary file to investigate is: <code>${mostLikelyFile}</code>. As a quick fix, consider disabling the mod. Or, towards deeper troubleshooting:<ul>
            <li>Verify it's the correct version for your Skyrim, and your other mods</li>
            <li>Check for missing required files, or recommended patches</li>
            <li>Verify its in the correct load order (check mod author's recommendation)</li>
            <li>Check any configurations or configuration files (or for some mod types it may need to be regenerated)</li>
            <li>Consider re-downloading in case the first download was corrupted</li>
            </ul>Try reinstalling it carefully, or temporarily disable it and its dependencies to isolate the issue.</li>`;
    
    if (otherFiles && mostLikelyFile && (mostLikelyFile !== otherFiles)) {
        diagnosis += `<li>This issue also involves: <code>${otherFiles}</code>. Check for:<ul>
            <li>Known conflicts between the primary file (further above) and relevant related mod(s)</li>
            <li>Missing compatibility patches</li>
            <li>Correct load order</li>
            </ul></li>
        <li>For thorough testing:<ul>
            <li>Disable both mods and their dependencies</li>
            <li>Start with a clean save</li>
            <li>Re-enable them one at a time, testing between each</li>
            <li>Pay attention to the installation order</li>
            </ul></li>`;
    }
    
    diagnosis += `<li>Additional steps:<ul>
        <li>Review each mod's pages and forum for any known conflicts and compatibility requirements</li>
        <li>Search for other users reporting similar issues with these mods</li>
        ${Utils.LootListItemIfSkyrim}
        </ul></li>
        </ol></li></ul></li>`;
    
    return diagnosis;
}






 // Functions to check DLL compatibility for New-ESL-capable versions of Skyrim
 function hasCompatibleDll(dllName, dllVersionFromLog, skyrimVersion) {
    if (!dllCompatibleSkyrimVersionsMap[dllName]) {
        console.warn('No data found for DLL:', dllName);
        return true; // Assume compatible if no data for this DLL
    }
    
    const dllVersionKeys = Object.keys(dllCompatibleSkyrimVersionsMap[dllName])
        .sort((a, b) => Utils.compareVersions(b, a)); // If more than one version in Map, take the most recent version of the mod
        // NOTE: none of the listed versions are compatible with the most recent version of Skyrim
        // NOTE: So, if version in log is even older, then it will also not be compatible with the most recent version of Skyrim
    const dllMostRecentVersion = dllVersionKeys[0]; // Get the latest version
    const compatData = dllCompatibleSkyrimVersionsMap[dllName][dllMostRecentVersion];
    Utils.debuggingLog(['hasCompatibleDll', 'analyzeLog.js'], `dllName: ${dllName}, dllVersionFromLog: ${dllVersionFromLog}, skyrimVersion: ${skyrimVersion}, compatData: ${compatData}`);

    
    //IF log's DLL version is newer than Map version, then assume compatibility
    Utils.debuggingLog(['hasCompatibleDll', 'analyzeLog.js'], `dllVersionFromLog: ${dllVersionFromLog}, dllMostRecentVersion: ${dllMostRecentVersion}`);

    if (Utils.compareVersions(dllVersionFromLog, dllMostRecentVersion) > 0) {
        Utils.debuggingLog(['hasCompatibleDll', 'analyzeLog.js'], `TRUE: ${dllName} v${dllVersionFromLog} is newer than this app's information, and thus assumed compatible with Skyrim ${skyrimVersion}`);
        return true;
    } else {
        const dllsMaxSupportedSkyrim = compatData.maxSkyrim;
        // Check if the Skyrim version is compatible
        if (dllsMaxSupportedSkyrim) {
            if (Utils.compareVersions(skyrimVersion, dllsMaxSupportedSkyrim) > 0) {
                Utils.debuggingLog(['hasCompatibleDll', 'analyzeLog.js'], `FALSE: ${dllName} v${dllVersionFromLog} is not compatible with Skyrim ${skyrimVersion}. Max supported Skyrim version is ${dllsMaxSupportedSkyrim}`);
                return false;
            } else {
                Utils.debuggingLog(['hasCompatibleDll', 'analyzeLog.js'], `TRUE: ${dllName} v${dllVersionFromLog} is compatible with Skyrim ${skyrimVersion}. Max supported Skyrim version is ${dllsMaxSupportedSkyrim}`);
                return true;
            }
        } else {
            //If dllsMaxSupportedSkyrim is falsey ... then assume compatibility
            Utils.debuggingLog(['hasCompatibleDll', 'analyzeLog.js'], `TRUE: unknown dllsMaxSupportedSkyrim for ${dllName} is not defined, and thus assumed compatible with Skyrim ${skyrimVersion}`);
            return true;
        }
    }
}


// Function to check DLL compatibility and generate error messages
function checkDllCompatibility(sections) {
    let incompatibleDlls = [];
    let diagnoses = '';
    let diagnosesCount = 0;
    const skyrimVersion = Utils.getSkyrimVersion(sections.header);

    // Get all DLL names from dllCompatibleSkyrimVersionsMap
    const dllNames = Object.keys(dllCompatibleSkyrimVersionsMap);

    Utils.debuggingLog(['checkDllCompatibility', 'analyzeLog.js'], `Starting DLL version check`);

    // Check each DLL
    for (const dllName of dllNames) {
        Utils.debuggingLog(['checkDllCompatibility', 'analyzeLog.js'], `Checking ${dllName}`);
        const dllVersionFromLog = Utils.getDllVersionFromLog(sections, dllName);
        if (dllVersionFromLog) {
            if (!hasCompatibleDll(dllName, dllVersionFromLog, skyrimVersion)) {
                Utils.debuggingLog(['checkDllCompatibility', 'analyzeLog.js'], `Incompatible: ${dllName} v${dllVersionFromLog} doesn't work with Skyrim ${skyrimVersion}`);
                incompatibleDlls.push({dllName, dllVersionFromLog});
            } else {
                Utils.debuggingLog(['checkDllCompatibility', 'analyzeLog.js'], `Compatible: ${dllName} v${dllVersionFromLog} works with Skyrim ${skyrimVersion}`);
            }
        } else {
            Utils.debuggingLog(['checkDllCompatibility', 'analyzeLog.js'], `No version found for ${dllName} in crash log.`);
        }
    }

    if (incompatibleDlls.length > 0) {
        diagnoses += `<li>❗ <b>Version Compatibility Notice:</b> The following DLLs are not fully compatible with your Skyrim version ${skyrimVersion} and many may cause crashes, although please note that, for a few mods, version detection isn't always accurate:<ul>`;
        for (const dll of incompatibleDlls) {
            const versionKeys = Object.keys(dllCompatibleSkyrimVersionsMap[dll.dllName])
                .sort((a, b) => Utils.compareVersions(b, a));
            const dllMostRecentVersion = versionKeys[0]; // Get the latest version
            const compatData = dllCompatibleSkyrimVersionsMap[dll.dllName][dllMostRecentVersion];

            let outputVersion = dll.dllVersionFromLog;
            if (dll.dllVersionFromLog == "0.0.0.1") {
                outputVersion = '(unspecified)';
            }
            
            diagnoses += `<li><code>${dll.dllName}</code> v${outputVersion}: 
                        Recommend update to <b>${compatData.modName}</b> v${compatData.recommendedVersion} or later. 
                        <a href="${compatData.url}" target="_blank">Download here</a></li>`;
            diagnosesCount++;
        }
        diagnoses += '</ul></li>';
    }

    Utils.debuggingLog(['checkDllCompatibility', 'analyzeLog.js'], `Ending DLL version check. Found ${incompatibleDlls.length} incompatible DLLs.`);
    Utils.debuggingLog(['checkDllCompatibility', 'analyzeLog.js'], `Diagnoses: ${diagnoses}`);
    return {diagnoses, diagnosesCount};
}



//D6DDDA Crash (short an long versions)
function checkForD6dddaEasyVersion(sections) {
    let diagnosis = '';
    if (sections.firstLine.includes('D6DDDA')) {
        diagnosis += `<li>❗ <b>D6DDDA Crash Detected:</b> This error typically occurs due to one of these common causes:
            <ol>
                <li>Corrupt Texture (.dds) or Mesh (.nif) Files:
                    <ol>
                        <li>Compare multiple crash logs if possible. If subsequent crashes list the same texture or mesh files (see "Advanced Users" section below), you likely have a corrupt texture file or, less commonly, a corrupt mesh. Once you've identified the problematic mod, try downloading it again before reinstalling, as the corruption may have occurred during the initial download.</li>
                    </ol>
                </li>
                <li>System Memory Management:
                    <ol>
                        <li>Close unnecessary background applications that may be consuming memory.</li>
                        <li>Ensure your <a href="https://www.nolvus.net/appendix/pagefile">Windows Pagefile Size is properly configured</a>.</li>
                        <li>Return any overclocked hardware to stock speeds, as unstable overclocks are known for causing crashes that can look like memory issues in crash logs.</li>
                        <li>Maintain <a href="https://computercity.com/hardware/storage/how-much-space-should-i-leave-on-my-ssd">at least 10-20% free space</a> on your SSD for optimal performance.</li>
                        <li>Hardware Diagnostics: If crashes persist, run Windows Memory Diagnostic or MemTest86 to check for faulty RAM. While rare, recurring D6DDDA crashes can sometimes indicate hardware issues.</li>
                    </ol>
                </li>
            </ol>
        </li>`;
    }
    return diagnosis;
}

function checkForD6dddaAdvancedVersion(sections) {
    let diagnosis = '';
    if (sections.firstLine.includes('D6DDDA')) {
        diagnosis += `<li>❗ <b>D6DDDA Crash Detected:</b> This error typically occurs due to one of these common causes:
            <ol>
                <li>Corrupt Texture (.dds) or Mesh (.nif) Files:
                    <ol>
                        <li>Compare multiple crash logs if possible. If subsequent crashes list the same texture or mesh files (see "Advanced Users" section below), you likely have a corrupt texture file or, less commonly, a corrupt mesh. Once you've identified the problematic mod, try downloading it again before reinstalling, as the corruption may have occurred during the initial download.</li>
                        <li>If the source mod has a corrupted image file, you can try using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/23316">Cathedral Assets Optimizer (CAO)</a> to repair potentially damaged texture/mesh/animation files. This tool can fix formatting issues and also optimize file sizes while maintaining visual quality.</li>
                        <li>If you identify a specific problematic image file in a source mod, contact the mod author for assistance or potential fixes.</li>
                    </ol>
                </li>
                <li>System Memory Management:
                    <ol>
                        <li>Close unnecessary background applications that may be consuming memory.</li>
                        <li>Ensure your <a href="https://www.nolvus.net/appendix/pagefile">Windows Pagefile Size is properly configured</a>.</li>
                        <li>Return any overclocked hardware to stock speeds, as unstable overclocks are known for causing crashes that can look like memory issues in crash logs.</li>
                        <li>Maintain <a href="https://computercity.com/hardware/storage/how-much-space-should-i-leave-on-my-ssd">at least 10-20% free space</a> on your SSD for optimal performance.</li>
                        <li>For systems with less than 12GB VRAM (or more for ultrawide/high-resolution displays) (<a href="https://www.lifewire.com/how-to-check-vram-5235783">check your VRAM here</a>), consider using <a href="https://www.reddit.com/r/Nolvus/comments/1doakj1/psa_use_vramr_if_you_have_12gb_of_vram/">VRAMr</a>. This tool automatically compresses texture files across your load order, reducing VRAM usage while maintaining visual fidelity and improving stability.</li>
                        <li>Hardware Diagnostics: If crashes persist, run Windows Memory Diagnostic or MemTest86 to check for faulty RAM. While rare, recurring D6DDDA crashes can sometimes indicate hardware issues.</li>
                    </ol>
                </li>
            </ol>
        </li>`;
    }
    return diagnosis;
}


//Missing Master 2.1
function checkForMissingMasters(sections) {
    let diagnoses = '';

    if ((sections.hasSkyrimAE && sections.firstLine.includes('0198090')) ||
        (!sections.hasSkyrimAE && (sections.firstLine.includes('5E1F22'))) ||
        sections.topHalf.includes('SettingT<INISettingCollection>*')) {
        
        diagnoses += '<li>❗ <b>Potential Missing Masters Detected:</b> Your load order might be missing required master files or other dependency, which can lead to instability and crashes. NOTE: Review other high-likelihood diagnoses first, as some of them can cause (or appear to cause) this issue. Here are some possible causes and solutions:<ul>';

        if (!Utils.isSkyrimPage) {
            diagnoses += '<li><b>Automated Nolvus Installers:</b> Try using the Nolvus Dashboard\'s "Apply Order" feature. This often resolves load order issues. For more information, see: <a href="https://www.reddit.com/r/Nolvus/comments/1chuod0/how_to_apply_order_button_usage_in_the_nolvus/">How To: Use the "Apply Order" Button</a>. If you have added additional mods, you wil then need to re-enable and reposition them in your load order.</li>';
        }

        if (!sections.hasNewEslSupport) {
            diagnoses += '<li><b>New Mod Incompatibility:</b> Recently added mods may be causing conflicts. If you are using a version of Skyrim before 1.6.1130, but have added a mod designed with the newest type of ESL files, we suggest installing <a href="https://www.nexusmods.com/skyrimspecialedition/mods/106441">Backported Extended ESL Support (BEES)</a>, though this doesn\'t always resolve all incompatibilities.</li>';
        }

        diagnoses +=
            '<li><b>Identifying Missing Masters:</b> Mod Organizer 2 (MO2) typically displays warning icons (yellow triangle with exclamation mark) for plugins with missing masters. <a href="https://imgur.com/izlF0GO">View Screenshot</a>.</br>Or alternately, check the <b>🔎 Files/Elements</b> section of this report and look at mods higher up the list, which could help isolate which mod might be missing something. Review the mod on Nexus and consider reinstalling any likely causal mods to see if you missed a patch or requirement.</li>' +

            '<li><b>Missing Dependency:</b> If you\'ve recently removed, disabled, or forgot to install a required mod, others may still depend on it. You might need to either install the missing dependency or remove its master requirement from dependent plugins. See this guide on <a href="https://github.com/LivelyDismay/Learn-To-Mod/blob/main/lessons/Remove%20a%20Master.md">Removing a Master Requirement</a>.</li>' +

            '<li><b>Version Mismatch:</b> Ensure all your mods are compatible with your Skyrim version (SE or AE). Always check the mod\'s description page for version compatibility.</li>' +
            
            Utils.LootListItemIfSkyrim;

            diagnoses += '</ul></li>';

        diagnoses += '</ul></li>';
    }

    return diagnoses;
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
            
            if (nolvusPercentage >= 50) {
                let nolvusMessage = '';
                if (nolvusPercentage >= 90) {
                    nolvusMessage = 'It appears you are using a full or nearly full Nolvus installation.';
                } else if (nolvusPercentage >= 70) {
                    nolvusMessage = 'It appears you are using a modlist based on or heavily inspired by Nolvus.';
                } else {
                    nolvusMessage = 'It appears you are using many Nolvus-shared plugins or a modlist partially based on Nolvus.';
                }
    
                Utils.debuggingLog(['checkForNolvusModlist'], 'Nolvus message:', nolvusMessage);
    
                diagnoses += `<li>⚠️ <b>Nolvus Detected:</b> ${nolvusMessage} For enhanced analysis with Nolvus-specific features and Nolvus-specific advice, we recommend using the original <a href="index.html?Advanced">index.html version</a> of this crash analyzer. It provides additional insights tailored to Nolvus installations.</li>`;
            }
        }
    }

    Utils.debuggingLog(['checkForNolvusModlist'], 'Finished Nolvus modlist check');
    return diagnoses;
}





function checkLogTypeAndProvideRecommendations(logType, sections) {
    let message = '';

    if (logType === "Trainwreck") {
        message += "<li>⚠️ <b>Trainwreck Log Detected:</b> While Trainwreck provides some crash information, it's generally not as comprehensive as other logging options. ";

        if (sections.hasSkyrimAE) {
            message += "For Skyrim AE (version 1.6+), we strongly recommend using <a href='https://www.nexusmods.com/skyrimspecialedition/mods/59818'>Crash Logger SSE</a> (newest version) instead. It provides more detailed crash information, aiding in better diagnosis. ";
        } else {
            message += "For Skyrim SE (version 1.5), we strongly recommend using <a href='https://www.nexusmods.com/skyrimspecialedition/mods/21294'>.NET Script Framework</a> instead. It offers more detailed crash information, which is crucial for accurate diagnosis. ";
        }

        message += "Remember to only have one logging mod enabled at a time.</li>";
    }

    /* DISABLING since I no longer recommend NSF over CrashLogger
    if (logType === "CrashLogger" && !sections.hasSkyrimAE) {
        message += "<li>⚠️ <b>CrashLogger Log Detected:</b> For Skyrim SE (version 1.5), we recommend using <a href='https://www.nexusmods.com/skyrimspecialedition/mods/21294'>.NET Script Framework</a> instead. It generally offers more detailed crash information, which can be helpful towards the best diagnosis. Remember to only have one logging mod enabled at a time.</li>";

    }
    */

    return message;
}





function analyzeMemoryIssues(sections) {
    let memoryInsights = '';

    function findMemoryHexCodeIssue(sections) {
        if (!sections.firstLine || typeof sections.firstLine !== 'string') {
            return null;
        }

        for (const { hexCode, description } of crashIndicators.memoryIssues.hexCodes) {
            if (sections.firstLine.includes(hexCode)) {
                return { hexCode, description };
            }
        }

        return null;
    }

    function findMemoryCodeIssues(sections) {
        return crashIndicators.memoryIssues.codes.filter(({ code }) =>
            sections.topHalf.toLowerCase().includes(code.toLowerCase())
        );
    }

    const hexCodeIssue = findMemoryHexCodeIssue(sections);
    const memoryCodeIssues = findMemoryCodeIssues(sections);
    const priorityIssue = (hexCodeIssue || sections.firstLine.includes('tbbmalloc.dll') );
    Utils.debuggingLog(['analyzeMemoryIssues', 'analyzeLog.js'], 'hexCodeIssue:', hexCodeIssue);
    Utils.debuggingLog(['analyzeMemoryIssues', 'analyzeLog.js'], 'memoryCodeIssues:', memoryCodeIssues);

    if (hexCodeIssue || memoryCodeIssues.length > 0) {
        memoryInsights += `<li>${priorityIssue ? '❗' : '❓'} <b>${priorityIssue ? 'Probable' : 'Potential'} Memory Issue ${priorityIssue ? 'Detected' : 'Indicators Found'}:</b> `;

        if (hexCodeIssue) {
            memoryInsights += `Code <code>${hexCodeIssue.hexCode}</code> indicates a ${hexCodeIssue.description}. `;
        }

        memoryInsights += `
        <ol>
        <li><b>System Resource Management:</b>
            <ul>
            <li>Reboot PC and close any unnecessary applications to maximize available RAM for Skyrim.</li>
            <li>Verify your <a href="https://www.nolvus.net/appendix/pagefile">Windows Pagefile Size</a> settings</li>
            <li>Return any overclocked hardware to stock speeds, as unstable overclocks are known for causing crashes that can look like memory issues in crash logs.</li>
            <li>Maintain <a href="https://computercity.com/hardware/storage/how-much-space-should-i-leave-on-my-ssd">at least 10-20% free space</a> on your SSD for optimal performance.</li>
            <li>Consider running memory diagnostic tools (Windows Memory Diagnostic or MemTest86)</li>
            <li>If you frequently encounter memory issues, consider upgrading your system with more RAM as relatively cost-effective upgrade. 32GB is often considered a baseline for high-end Skyrim modding.</li>
            </ul>
        </li>

        <li><b>Texture and Resource Optimization:</b>
            <ul>
            <li><strong>Corrupted textures and/or meshes</strong> can exacerbate memory issues. The probability of this being causal is much higher if specific files are listed elsewhere in this report ... especially when the same image file is found across multiple crash logs. In some cases simply re-downloading and reinstalling the mod with a bad mesh or texture, may fix the corrupted file and resolve the issue. See related <strong>Mesh Issue</strong>, and/or <strong>Texture Issue</strong> sections of this report for additional troubleshooting advice.
            <li>Consider switching to <strong>lower resolution texture mods</strong> (1K/2K instead of 4K). Image files that are too large can strain both VRAM and RAM resources.<ul>
                <li>Or use <a href="https://www.nexusmods.com/skyrimspecialedition/mods/23316">Cathedral Assets Optimizer (CAO)</a> to optimize textures in individual mods that don't offer lower resolution options.</li>
                <li>Alternately, use <a href="https://www.reddit.com/r/Nolvus/comments/1doakj1/psa_use_vramr_if_you_have_12gb_of_vram/">VRAMr</a> to automatically create a custom textures-only mod with optimized texture files that override for your entire load order (minus some problematic exceptions which are automatically excluded).</li>
                <li> NOTE: Texture and/or mesh optimization reduces RAM, VRAM, and SSD usage, plus smaller files also load faster. Smaller texture files can be especially helpful in minimizing FPS stutters that are especially prone in outdoor combat and other visually busy situations. Usually, the lowering of image quality is unnoticeable during normal gameplay, especially at 2k, but largely even at 1K unless you walk up close and stare at a large object in game.</li>
            </ul></li>
            <li><strong>Limit usage of object-adding mods</strong> which increase the number of 3D objects in any one view by adding additional objects/npcs/grass/trees/etc to already dense locations of Skyrim. Common examples include exterior city mods, and mods which add many extra trees. Each object has a 3D mesh and a texture file wrapped over it. Adding too many objects can tax any PC.</li>
            </ul>
        </li>

        <li><b>Mod Management:</b>
            <ul>
            <li>Review mod conflicts and load order</li>
            <li>Update all mods to their latest (cross-compatible) versions</li>
            ${Utils.LootListItemIfSkyrim}
            <li>If issues persist:
                <ul>
                <li>Disable resource-intensive mods</li>
                <li>Isolate by disabling/testing progressively smaller mod groups</li>
                <li>Monitor system resources while testing</li>
                </ul>
            </li>
            </ul>
        </li>`;

        if (hexCodeIssue || memoryCodeIssues.length > 0) {
            memoryInsights += `<li>Detected memory issue indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">`;
            if(hexCodeIssue) {
                memoryInsights += `<li><code>${hexCodeIssue.hexCode}</code> - ${hexCodeIssue.description}</li>`;
            };
            memoryCodeIssues.forEach(({ code, description }) => {
                memoryInsights += `<li><code>${code}</code> - ${description}</li>`;
            });
            memoryInsights += '</ul></li>';
        }

        /* DISABLED AS UNHELPFUL? const memoryFiles = Utils.extractMemoryRelatedFiles(sections.topHalf);
        if (memoryFiles && memoryFiles.length > 0) {
            memoryInsights += `<li>Referenced memory-related files: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">`;
            memoryInsights += memoryFiles;
            memoryInsights += '</ul></li>';
        } */

        // Add system diagnostic information if available
        if (sections.logType == "TODO (not really going to find this)") { //if = Trainwreck or CrashLogger
            //TODO: write Utils to identify log types, and extract out RAM usage and pagefile or VRAM usage from crash log header, (depending on log type)
            memoryInsights += `<li>System diagnostic information: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">`;
            memoryInsights += Utils.extractDiagnosticInfo(sections.diagnosticInfo);
            memoryInsights += '</ul></li>';
        }

        memoryInsights += '</ol></li>';
    }

    return memoryInsights;
}



function analyzeDragonsEyeMinimapIssue(sections) {
    let insights = '';
    const dllFileName = 'DragonsEyeMinimap.dll';

    if (sections.bottomHalf.toLowerCase().includes(dllFileName.toLowerCase())) {
        const dllVersion = Utils.getDllVersionFromLog(sections, dllFileName);
        //FUTURE CODE: if (Utils.compareVersions(dllVersion, '1.1') < 1) {
            //NOTE: above code is already supported, but in case new versions don't fix this bug, I decided to not automatically remove this test's message.
            //IF installed version of DragonsEyeMinimap.dll is equal to or less than version 1.1, then continue
            
            // Get matching dragon's eye indicators
            const matchingDragonEyeCodes = crashIndicators.dragonsEyeMinimapIssues.codes.filter(
                ({ code }) => sections.topHalf.toLowerCase().includes(code.toLowerCase())
            );

            // Check if we have 2 or more matching dragon's eye indicators
            if (matchingDragonEyeCodes.length >= 1) {
                insights += `
                <li>❗ <b>Dragon's Eye Minimap Issue Detected:</b> Indicators in this log are often linked to the Dragon's Eye Minimap causing crashes.
                    <ol>
                        <li>Toggle off Dragon's Eye Minimap with the hotkey (defaults to "L" key) and progress until you leave the current Cell.</li>
                        <li>If this issue frequently occurs in future crash logs, consider checking for an updated version or disabling the mod. NOTE: issue still exists as of version 1.1</li>
                        <li>Mentioned indicators: <a href="#" class="toggleButton">⤵️ show more</a>
                            <ul class="extraInfo" style="display:none">
                                <li><code>${dllFileName}</code> - mod version <code>${dllVersion}</code> is installed and enabled</li>`;
                                matchingDragonEyeCodes.forEach(({ code, description }) => {
                                    insights += `<li><code>${code}</code> - ${description}</li>`;
                                });
                        insights += `
                            </ul>
                        </li>
                    </ol>
                </li>`;
            }
        //FUTURE CODE: }
    }
    
    return insights;
}







//General mesh issues (seven related tests merged together)
function analyzeMeshIssues(sections) {
    let meshInsights = '';
    let isHighPriority = false;

    function findMeshHexCodeIssue(sections) {
        if (!sections.firstLine || typeof sections.firstLine !== 'string') {
            return null;
        }

        for (const { hexCode, description } of crashIndicators.meshIssues.hexCodes) {
            if (sections.firstLine.includes(hexCode)) {
                return { hexCode, description };
            }
        }

        return null;
    }

    function findMeshCodeIssues(sections) {
        return crashIndicators.meshIssues.codes.filter(({ code }) =>
            sections.topHalf.toLowerCase().includes(code.toLowerCase())
        );
    }

    const hexCodeIssue = findMeshHexCodeIssue(sections);
    const meshCodeIssues = findMeshCodeIssues(sections);
    Utils.debuggingLog(['analyzeMeshIssues', 'analyzeLog.js'], 'hexCodeIssue:', hexCodeIssue);
    Utils.debuggingLog(['analyzeMeshIssues', 'analyzeLog.js'], 'meshCodeIssues:', meshCodeIssues);

    if (hexCodeIssue || meshCodeIssues.length > 0) {
        meshInsights += `<li>${hexCodeIssue ? '❗' : '❓'} <b>${hexCodeIssue ? 'Probable' : 'Possible'} Mesh Issue ${hexCodeIssue ? 'Detected' : 'Indicators Found'}:</b> `;

        if (hexCodeIssue) {
            meshInsights += `Code <code>${hexCodeIssue.hexCode}</code> indicates a ${hexCodeIssue.description}. `;
            isHighPriority = true;
        }

        meshInsights += `Investigate using these steps:
        <ol>
        <li>Identify problematic meshes/mods:
            <ul>
            <li>Use <a href="https://www.nexusmods.com/skyrim/mods/75916/">NifScan</a> to check all meshes and identify issues and source mods.</li>
            <li>Or, check the list of mentioned meshes below and search the crash log for clues as to their source mod(s).</li>
            </ul>
        </li>
        <li>Fix mesh issues:
            <ul>
            <li>Check for updates or compatibility patches for mods providing these mesh files. Or, use <a href="https://www.nexusmods.com/skyrimspecialedition/mods/4089">SSE NIF Optimizer</a> or <a href="https://www.nexusmods.com/skyrimspecialedition/mods/23316">Cathedral Assets Optimizer (CAO)</a> to attempt fixes.</li>
            <li>Ensure correct load order, especially for mods affecting meshes and skeletons.</li>
            ${Utils.LootListItemIfSkyrim}
            </ul>
        </li>`;

        const hasHeadMeshIssue = hexCodeIssue && hexCodeIssue.hexCode === '132BEF';
        const hasSkeletonIssue = sections.topHalf.toLowerCase().includes('ninode');
        if (hasHeadMeshIssue || hasSkeletonIssue) {
            meshInsights += `<li>Handle specific issues:
                <ul>`;
                if (hasHeadMeshIssue) {
                    meshInsights += `<li>For head mesh issues (code <code>132BEF</code>):
                        <ul>
                            <li>Review NPCs mentioned in the top section of your log file (labeled "Possible relevant objects" or "PROBABLE CALL STACK").</li>
                            <li>For suspect NPCs: reinstall/update their mod, or regenerate facegen data in Creation Kit.</li>
                            <li>Check for version incompatibilies and conflicts between mods modifying NPCs or facial features.</li>
                        </ul>
                    </li>`;
                }
            if (hasSkeletonIssue) {
                meshInsights += `<li>For skeleton-related issues (involving <code>NiNode</code>), ensure a compatible skeleton mod is installed and not overwritten.</li>`;
            }
            meshInsights += `</ul>
            </li>`;
        }

        meshInsights += `<li>Test and isolate:
            <ul>
            <li>If you've identified a specific problematic mod, try disabling it.</li>
            <li>If issues persist, consider removing or replacing problematic mods.</li>
            </ul>
        </li>`;

        if (meshCodeIssues.length > 0) {
            meshInsights += `<li>Mentioned mesh indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">`;
            meshCodeIssues.forEach(({ code, description }) => {
                meshInsights += `<li><code>${code}</code> - ${description}</li>`;
            });
            meshInsights += '</ul></li>';
        }

        const meshResults = Utils.addMentionedFilesListItems(sections, 'mesh');
        const foundMeshFiles = meshResults.foundFiles;
        if (foundMeshFiles) {
            isHighPriority = true;
       }
       
        meshInsights += meshResults.parentListItem;
        
        meshInsights += '</ul></li></ol>';
    }

    return meshInsights; //TODO: also return isHighPriority
}



function analyzeDawnguardHorseIssue(sections) {
    let diagnosis = '';
    const dawnguardHorseIssueKeywords = ["Skyrim Immersive Creatures", "Horse", "Celann", "Isran"];
    const dawnguardHorseIssue = dawnguardHorseIssueKeywords.every(keyword => sections.topHalf.includes(keyword));
    if (dawnguardHorseIssue) {
        diagnosis +=  `
        <li>🎯 <b>Dawnguard Horse Issue Detected:</b> This is a specific variant of NavMesh/Pathing Issues (see below). The Dawnguard Horse from Skyrim Immersive Creatures is a common example. You can fix the issue with the following steps:
        <ol>
            <li>Download and install <a href="https://www.nexusmods.com/skyrimspecialedition/mods/164" target="_blank">SSEEdit</a>.</li>
            <li>Open SSEEdit, enable "Skyrim Immersive Creatures" mod, and click "Open Plugins Selected."</li>
            <li>Once finished loading, search for Editor ID: <code>SIC_WERoad07</code> and delete this whole form ID.</li>
            <li>Save changes and close SSEEdit.</li>
            <li>Open an earlier save from before the NPCs spawned and play to verify no crashes.</li>
        </ol></li>`;
    }
    return diagnosis;
}



function analyzePathingIssues(sections) {
    let pathingInsights = '';
    let isHighPriority = false;
    function findPathingAndNavMeshIssues(sections) {
        return crashIndicators.pathingAndNavMeshIssues.codes.filter(({ code }) =>
            sections.topHalf.toLowerCase().includes(code.toLowerCase())
        );
    }
    const pathingIssueIndicators = findPathingAndNavMeshIssues(sections);
    Utils.debuggingLog(['analyzePathingIssues', 'diagnoses.js'], 'pathingIssueIndicators:', pathingIssueIndicators);

    function highPriorityIndicators(sections) {
        return crashIndicators.pathingAndNavMeshIssues.codes.filter(({ code }) =>
            sections.topThird.toLowerCase().includes(code.toLowerCase()) //NOTE: could adjust to topQuarter?
        );
    }
    isHighPriority = highPriorityIndicators(sections).length > 0;
    Utils.debuggingLog(['analyzePathingIssues', 'diagnoses.js'], 'highPriorityIndicators:', highPriorityIndicators);
    Utils.debuggingLog(['analyzePathingIssues', 'diagnoses.js'], 'isHighPriority:', isHighPriority);

    if (pathingIssueIndicators.length > 0) {
        pathingInsights += `<li>${isHighPriority ? '❗' : '❓'} <b>${isHighPriority ? 'Probable' : 'Possible'} NavMesh/Pathing ${isHighPriority ? 'Issue Detected' : 'Indicators Found'}:</b> 
            <ol>
                <li>Potential easy fixes:
                    <ul>
                        <li>Some issues can be fixed by reloading an <b>older save</b></li>
                        <li>Sometimes asking <b>followers</b> to wait behind can get you past a NavMesh Pathing glitch. Some follower mods and/or follower frameworks will allow you to teleport your follower to you afterwards to rejoin your party.</li>
                        <li>If using a <b>horse</b> or mount, command mount to wait before fast traveling</li>
                        <li>If using a a horse/mount and a <b>follower framework</b> (like Nether's Follower Framework), try disabling horse followers in its Mod Configuration Menu (MCM)</li>
                    </ul>
                </li> 
                <li>Advanced Troubleshooting:
                    <ul>
                        <li>Consider trying the <a href="https://www.nexusmods.com/skyrimspecialedition/mods/52641">Navigator - Navmesh Fixes</a> mod (be sure to read notes on where to insert it in your load order)</li>
                        <li>Consider disabling relevant location-modifying mods to identify conflicts. Also consider disabling mods that show up in the "Files/Elements" outline (higher up in this report).</li>
                        <li>Additional advanced ideas and information are included in <a href="https://www.reddit.com/r/skyrimmods/comments/1d0r0f0/reading_crash_logs/##:~:text=These%20are%20Navmesh%20errors">Krispyroll's Reading Crash Logs Guide</a></li>
                    </ul>
                </li>`;
                
        pathingInsights += `<li>Detected NavMesh/Pathing Issue indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">`;
        pathingIssueIndicators.forEach(({ code, description }) => {
            pathingInsights += `<li><code>${code}</code> - ${description}</li>`;
        });
        
        pathingInsights += '</ul></li></ol></li>';
    }
    return pathingInsights; // TODO: also return isHighPriority
}



//General Animation issues
function analyzeAnimationIssues(sections) {
    let animationInsights = '';
    let isHighPriority = false;

    function findAnimationHexCodeIssue(sections) {
        if (!sections.firstLine || typeof sections.firstLine !== 'string') {
            return null;
        }

        for (const { hexCode, description } of crashIndicators.animationIssues.hexCodes) {
            if (sections.firstLine.includes(hexCode)) {
                return { hexCode, description };
            }
        }

        return null;
    }

    function findAnimationCodeIssues(sections) {
        return crashIndicators.animationIssues.codes.filter(({ code }) =>
            sections.topHalf.toLowerCase().includes(code.toLowerCase())
        );
    }

    const hexCodeIssue = findAnimationHexCodeIssue(sections);
    const animationCodeIssues = findAnimationCodeIssues(sections);
    Utils.debuggingLog(['analyzeAnimationIssues', 'analyzeLog.js'], 'hexCodeIssue:', hexCodeIssue);
    Utils.debuggingLog(['analyzeAnimationIssues', 'analyzeLog.js'], 'animationCodeIssues:', animationCodeIssues);

    if (hexCodeIssue || animationCodeIssues.length > 0) {
        animationInsights += `<li>${hexCodeIssue ? '❗' : '❓'} <b>${hexCodeIssue ? 'Probable' : 'Possible'} Animation Issue ${hexCodeIssue ? 'Detected' : 'Indicators Found'}:</b> `;

        if (hexCodeIssue) {
            animationInsights += `Code <code>${hexCodeIssue.hexCode}</code> indicates a ${hexCodeIssue.description}. `;
            isHighPriority = true;
        }

        animationInsights += `To fix this, please follow these steps:
        <ol>
        <li>First steps:
            <ul>`;

            if (Utils.isSkyrimPage) {
                animationInsights += `
                <li>Consider regenerating animation files using your behavior engine: <a href="https://www.nexusmods.com/skyrimspecialedition/mods/3038">FNIS</a> or <a href="https://www.nexusmods.com/skyrimspecialedition/mods/60033">Nemesis</a> or <a href="https://www.nexusmods.com/skyrimspecialedition/mods/133232">Pandora</a>.</li>`;
            } else {
                animationInsights += `
                <li>Consider regenerating animation files using Nemesis (as used by vanilla Nolvus). Follow these <a href="https://www.nolvus.net/guide/asc/output/nemesis">instructions for regenerating Nemesis for Nolvus</a>.</li>`;
            }

            animationInsights += `<li>Start disabling your animation mods one by one, testing the game after each disable, until you find the problematic mod(s).</li>
            <li>Check for updates or compatibility patches for your animation mods.</li>
            </ul>
        </li>
        
        <li>System checks:
            <ul>
            <li>Ensure correct load order, especially for mods affecting animations and skeletons.</li>
            ${Utils.LootListItemIfSkyrim}`;

        animationInsights += `
            <li>If you are using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/33746">Dynamic Animation Replacer</a> as your animation framework, consider upgrading to its drop-in replacement mod, <a href="https://www.nexusmods.com/skyrimspecialedition/mods/92109">Open Animation Replacer</a>.</li>
            <li>For more detailed analysis, use tools like <a href="https://www.nexusmods.com/skyrimspecialedition/mods/164">SSEEdit</a> to examine animation-related records in your mods.</li>
            </ul>
        </li>

        <li>Specific issues to check:
            <ul>
            <li>Ensure that the <code>FNIS.esp</code> file is not deleted, as it is generated by FNIS/Nemesis and is necessary for the animations to work correctly.</li>
            <li>Animation graph conflicts between mods modifying the same animations.</li>
            <li>Incompatible <code>.hkx</code> files (ensure they match your game version: LE vs SE).</li>
            </ul>
        </li>

        <li>If issues persist:
            <ul>
            <li>Consider removing or replacing problematic animation mods. NOTE: When disabling animation mods for testing, remember to run your behavior engine after each change to properly update animations (otherwise you may see T-posing or other animation issues).</li>
            <li>Seek help on modding forums, providing your full mod list and load order.</li>
            </ul>
        </li>`;

        if (animationCodeIssues.length > 0) {
            animationInsights += `<li>Detected animation issue indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">`;
            animationCodeIssues.forEach(({ code, description }) => {
                animationInsights += `<li><code>${code}</code> - ${description}</li>`;
            });
            animationInsights += '</ul></li>';
        }

        const animationResults = Utils.addMentionedFilesListItems(sections, 'animation');
        const foundAnimationFiles = animationResults.foundFiles;
        if (foundAnimationFiles) {
            isHighPriority = true;
        }

        animationInsights += animationResults.parentListItem;

        animationInsights += '</ol></li>';
    }

    return animationInsights; //TODO: also return isHighPriority
}


function analyzeTextureIssues(sections) {
    let textureInsights = '';
    let isHighPriority = false;

    function findTextureHexCodeIssue(sections) {
        if (!sections.firstLine || typeof sections.firstLine !== 'string') { //TODO: WHAT IS THIS? DELETE?
            return null;
        }

        for (const { hexCode, description } of crashIndicators.textureIssues.hexCodes) {
            if (sections.firstLine.includes(hexCode)) {
                return { hexCode, description };
            }
        }

        return null;
    }

    function findTextureCodeIssues(sections) {
        return crashIndicators.textureIssues.codes.filter(({ code }) =>
            sections.topHalf.toLowerCase().includes(code.toLowerCase())
        );
    }

    const hexCodeIssue = findTextureHexCodeIssue(sections);
    const textureCodeIssues = findTextureCodeIssues(sections);
    const hasTextureKeyword = sections.topHalf.toLowerCase().includes('texture');
    Utils.debuggingLog(['analyzeTextureIssues', 'analyzeLog.js'], 'hexCodeIssue:', hexCodeIssue);
    Utils.debuggingLog(['analyzeTextureIssues', 'analyzeLog.js'], 'textureCodeIssues:', textureCodeIssues);

    if (hexCodeIssue || textureCodeIssues.length > 0 || hasTextureKeyword) {
        textureInsights += `<li>${hexCodeIssue ? '❗' : '❓'} <b>${hexCodeIssue ? 'Probable' : 'Possible'} Texture Issue ${hexCodeIssue ? 'Detected' : 'Indicators Found'}:</b> `;

        if (hexCodeIssue) {
            textureInsights += `Code <code>${hexCodeIssue.hexCode}</code> indicates a ${hexCodeIssue.description}. `;
            isHighPriority = true;
        }

        textureInsights += `
        <ol>
        <li>Identify problem textures:
            <ul>
            <li>Check the list of mentioned textures below to identify which mod(s) might be causing issues.</li>
            <li>Temporarily disable suspect texture mods (or temporarily remove their suspected texture files) one at a time to isolate the problem.</li>
            <li>Pay special attention to mods affecting the area where the crash occurred.</li>
            </ul>
        </li>

        <li>Fix identified issues:
            <ul>
            <li>Once you've identified the problematic mod, try re-downloading the newest version and reinstalling.</li>
            <li>If reinstalling doesn't help, try using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/23316">Cathedral Assets Optimizer (CAO)</a> to repair any damaged textures.</li>
            <li>Check your mod load order to prevent texture conflicts. Ensure texture mods load after any mods altering the same textures.</li>
            </ul>
        </li>

        <li>System optimization:
            <ul>
            <li>Consider using lower resolution texture packs (e.g., 1K or 2K textures) if experiencing general performance or stability issues, especially if noted in a "Memory Issue" section of this report.</li>
            <li>High-resolution textures (e.g., 4K) can strain both system RAM and VRAM - ensure your system meets requirements.</li>
            <li>For persistent issues, consult Skyrim modding forums with your full mod list and system specs.</li>
            </ul>
        </li>`;

        if (textureCodeIssues.length > 0) {
            textureInsights += `<li>Detected texture issue indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">`;
            textureCodeIssues.forEach(({ code, description }) => {
                textureInsights += `<li><code>${code}</code> - ${description}</li>`;
            });
            textureInsights += '</ul></li>';
        }

        const textureResults = Utils.addMentionedFilesListItems(sections, 'texture');
        const foundTextureFiles = textureResults.foundFiles;
        if (foundTextureFiles) {
            isHighPriority = true;
        }

        textureInsights += textureResults.parentListItem;

        textureInsights += '</ul></li></ol></li>';
    }

    return textureInsights; //TODO: also return isHighPriority
}





// HairMaleNord01
function checkHairModCompatibility(sections, logFile) {
    const hairModStrings = [
        'HairMaleNord', // These would ussualy appear with a number at the end. Example: HairMaleNord01
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
        'HairFemale', // a generic catch all for other versions of the above
        'HairMale', // a generic catch all
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
        'Hairdo' // a generic catch all for some of above
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
        let insights = '<li>❗ <b>Probable Hair Mod Issue Detected:</b> The following hair-related indicators were found: ' +
            '<code>' + foundHairMods.join('</code>, <code>') + '</code>. To troubleshoot this issue:<ol>';

        if (sections.topHalf.includes('NiRTTI_BSDynamicTriShape')) {
            insights += '<li>The presence of NiRTTI_BSDynamicTriShape suggests a potential issue with dynamic hair meshes. Ensure your hair physics mods are compatible and properly installed.</li>';
        }

        insights += '<li>NOTE: as of its version 1.0.2 or 1.0.3, <a href="https://www.nexusmods.com/skyrimspecialedition/mods/63979">Vanilla Hair Remake</a> is reportedly a common cause of this issue.</li>' +
        '<li>Ensure that all hair mods are up to date and compatible with your version of Skyrim and SKSE.</li>';

        if (foundPhysicsMods.length > 0) {
            insights += '<li>Check that installed physics mods are compatible with your hair mods and Skyrim version.</li>' +
            '<li>Consider trying the <a href="https://www.nexusmods.com/skyrimspecialedition/mods/91616">SMP-NPC crash fix</a> mod, which fixes a random crash when loading NPCs with SMP hair.</li>';
        }

        insights += '<li>Check hair mod pages for known compatibility issues and required patches.</li>';

        insights += Utils.LootListItemIfSkyrim;

        insights +=
            '<li>If the problem persists, try disabling hair mods one by one to isolate the conflict.</li>' +
            '<li>Consider running your mods directory through <a href="https://www.nexusmods.com/skyrim/mods/75916/">NifScan</a></li><ul><li>especially if any hair indicators show up in this list of mentioned mesh files  (NOTE: <code>.bsa</code> files may or may not contain compressed mesh files): <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
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



//BGSSaveLoadManager
function analyzeBGSSaveLoadManagerIssue(sections) {
    let insights = '';
    if (sections.topHalf.toLowerCase().includes('BGSSaveLoadManager'.toLowerCase())) {
        const checkSaveFileSize = `
        <li>Try <a href="https://www.reddit.com/r/skyrimmods/comments/tpmf8x/crash_on_load_and_save_corruption_finally_solved/">expanding your save file size</a>. Then open the last save that works and play on from there, and hopefully, there will not be any more crashes. Requires the <b>HIGHLY RECOMMENDED</b> foundational mod <a href="https://www.nexusmods.com/skyrimspecialedition/mods/17230">SSE Engine Fixes</a>. Be sure to carefully install the correct versions of both Parts 1 and 2.
            <ul>
                <li>Verify these settings in <code>EngineFixes.toml</code></li>
                <ul>
                    <li><code>SaveGameMaxSize = true</code></li>
                    <li><code>MaxStdio = 8192</code></li>
                </ul>
            </ul>
        </li>`;

        insights += `
        <li>❓ <b>BGSSaveLoadManager Issue Detected:</b> This error is associated with problems either saving and/or loading game save files.
        <ol>
            <li>If the crash <b>only occurs while <i>saving</i></b>, you may have a Missing Masters. You will likely see separate troubleshooting steps for that higher up in this report, and if not, you can find them by using this analyzer's "use the Test Log" link at the top.</li>
            ${Utils.isSkyrimPage ? checkSaveFileSize : ''}
            <li>If crash is repetitive, try loading from your <b>last working save</b>. If possible, identify this file, and load this last save game that worked and try to play from there.</li>
            <li>Consider using save cleaning tools to remove orphaned scripts and other potential corruption. <a href="https://www.nexusmods.com/skyrim/mods/76776">FallrimTools ReSaver</a> can sometimes fix corrupted save files. See also these <a href="https://www.reddit.com/r/skyrimmods/s/fbMRv343vm">instructions by Krispyroll</a> and more information in <a href="https://www.reddit.com/r/skyrimmods/comments/1d0r0f0/reading_crash_logs/##:~:text=Resaver">Krispyroll's Reading Crash Logs Guide</a>. NOTE: Always keep backups of your saves before attempting fixes or using cleaning tools.</li>
            <li>Consider following <b>Jerilith’s Safe Save Guide</b> (quoted below). Not adhering to these guidelines over time may contribute to broken save files. NOTE: The effectiveness of some of these rules is <a href="https://www.reddit.com/r/skyrimmods/comments/1hntsnl/thoughts_on_jeriliths_safe_save_guide/">debated</a> and often considered overemphasized. Additionally, I have provided a clarification at the end. However, many believe these rules can help prevent issues when other causes are unknown.
            <ol>
                <li>Never, ever save in combat.</li>
                <li>When you die, EXIT the whole game, go to dashboard, start Skyrim again, wait for the load, continue that way.</li>
                <li>Don't ever enable and or use autosaves.</li>
                <li>Do not remove mods mid-game*</li>
                <li>Do not add mods mid-game*</li>
                <li>Wait 30s after sleeping or entering a new zone before saving.</li>
                <li>Never save more than once per minute.</li>
                <li>(* = exceptions apply when a mod author states otherwise, or when a specific mod is known to be safe)</li>
            </ol></li>
            <li>Regarding the Safe Save Guide (above), there are a few <b>mods you can add</b> to minimize risk if you prefer not to always quit to the desktop after dying: <a href="https://www.nexusmods.com/skyrimspecialedition/mods/88219">Clean Save Auto Reloader</a>, <a href="https://www.nexusmods.com/skyrimspecialedition/mods/85565">SaveUnbaker</a>, and an alternate death mod. See Orionis' <a href="https://docs.google.com/document/d/1RSCzBUyE0vqZRAtjd4YL2hHrKzf4Q1rgCH0zrjEr-qY/mobilebasic#heading=h.u2ukim1kti09">Safe Save Helpers - a Nolvus Guide</a>. Although this guide's original context is Nolvus, most of the information should be broadly applicable.</li>
            ${!Utils.isSkyrimPage ? checkSaveFileSize : ''}
        </ol></li>`;
    }
    return insights;
}

function analyzeWin24H2UpscalerCrash(sections) {
    let insights = '';
    
    if (sections.firstLine.toLowerCase().includes('KERNELBASE.dll'.toLowerCase()) && 
        sections.probableCallstack.includes('SkyrimUpscaler.dll')) {
        
        insights += `<li>🎯 <b>DLAA Incompatibility KERNELBASE Crash Detected:</b> Windows version 24H2 has made a popular DLAA mod incompatible. Puredark, the author of the Upscaler mods (both free and paid versions), is aware of the issue but not sure how to resolve it at this time. Confusingly, this issue occurs for most such users but seemingly not all. Currently there are several possible solutions:

            <ol>
                <li><strong>Solution 1: Disable DLAA and Switch to TAA</strong>
                    <ol>
                        <li>In <strong>Mod Organizer 2</strong> (MO2), towards the top find section "1.1 SKSE PLUGINS" (or whatever location you may have installed your Upscaler mod(s) into).</li>
                        <li>Open the section, and towards the bottom find <code>Upscaler Base Plugin</code> and <code>Skyrim Upscaler</code>. Disable them both. NOTE: paid versions may converge both plugins into one.</li>
                        <li>Then in the top navigation pane of MO2 click on the puzzle icon.</li>
                        <li>Select "INI Editor".</li>
                        <li>Click on <code>skyrimprefs.ini</code> and click inside of the text box.</li>
                        <li>On your keyboard, press <strong>CTRL+F</strong></li>
                        <li>Search for <code>bUseTAA</code> and change the value to match <code>bUseTAA=1</code></li>
                        <li><a href="https://phostwood.github.io/crash-analyzer/images/DLAA-Win24H2-Fix.webp">Click for screenshot.</a></li>
                    </ol>
                </li>

                <li><strong>Solution 2: Try Alternative Mods</strong>
                    <ol>
                        <li>Some users report success by switching to a different version of Puredark's mod(s): <a href="https://www.nexusmods.com/skyrimspecialedition/mods/80343">Skyrim Upscaler - DLSS FSR2 XeSS</a>.</li>
                        <li>Others have reported success switching to a newer alternative mod: <a href="https://www.nexusmods.com/skyrimspecialedition/mods/130669">ENB Anti-Aliasing - AMD FSR 3.1 - NVIDIA DLAA</a>.</li>
                    </ol>
                </li>
            </ol>
        </li>`;
    }
    
    return insights;
}



// Check for KERNELBASE Crash excluding JContainers and JSON parse error
function checkKernelbaseCrash(sections, Utils, win24H2UpscalerCrash, isDiagnosesSection = false) {
    let diagnoses = '';

    // Check for KERNELBASE Crash excluding JContainers and JSON parse error
    if (sections.firstLine.toLowerCase().includes('KERNELBASE.dll'.toLowerCase()) && 
        !sections.probableCallstack.includes('JContainers64.dll') && 
        !sections.topHalf.includes('json.exception.parse_error') && 
        !win24H2UpscalerCrash) {
        
        if (!Utils.isSkyrimPage && isDiagnosesSection) { // SHORT VERSION - Only for Nolvus in diagnoses section
            diagnoses += `
                <li>❗ <b>KERNELBASE Crash Detected:</b> This rare issue could be related to a specific added mod, or to hardware or a system-wide issue. Here are some steps you can try:
                    <ol>
                        <li><b>First</b>, try to reproduce the crash by playing the game again. If this was a one-time occurrence, you probably don't need to follow the more intensive troubleshooting steps below.</li>
                        <li>Check with the <b>Nolvus community</b> to see if others are encountering this issue due to a new Windows update or the like.</li>
                        <li>You can restore the original sorting of all vanilla Nolvus mods using the <b>Apply Order</b> button in the Nolvus Dashboard. For more information and a screenshot, see this r/Nolvus post <a href="https://www.reddit.com/r/Nolvus/comments/1chuod0/how_to_apply_order_button_usage_in_the_nolvus/">How To: "Apply Order" button usage in the Nolvus Dashboard</a>.</li>
                        <li><b>Reinstall Nolvus</b> to ensure the installation is not corrupted. Make sure to back up any important data before doing this. For detailed instructions, see this <a href="https://docs.google.com/document/d/1R_AVeneeCiqs0XGYzggXx34v3Ufq5eUHNoCHo3QE-G8/edit">guide</a>.</li>
                        <li>Check the <b>Windows Event Log</b> for any related issues. You can do this by opening the Event Viewer (search for it in the Start Menu), then navigate to Windows Logs > Application. Look for any recent errors that might be related to your issue. For detailed instructions, see this <a href="https://support.microsoft.com/en-us/windows/open-event-viewer-17d427d2-43d6-5e01-8535-1fc570ea8a14">Microsoft guide</a>.</li>
                        <li>If the issue persists, consider reaching out to the <b>Nolvus Discord</b> for additional help.</li>
                        <li>NOTE: Many more details for this issue are available in the "Advanced Users" section of this report.</li>
                    </ol>
                </li>`;
        } else if ((Utils.isSkyrimPage && isDiagnosesSection) || (!Utils.isSkyrimPage && !isDiagnosesSection) ) { // LONG VERSION - For non-Nolvus or when not in diagnoses section
            diagnoses += `
                <li>❗ <b>KERNELBASE Crash Detected:</b> This issue can be caused by many different factors: a specific mod, hardware problems, or system-wide issues like Windows Updates, malware, drive corruption, or corrupted file permissions. Here are troubleshooting steps to try, ordered from easiest to most difficult (and most likely to help):
                    <ol>
                        <li><b>First</b>, try to reproduce the crash by playing the game again. If this was a one-time occurrence, you probably don't need to follow the more intensive troubleshooting steps below.</li>

                        <li>Check with the <b>${!Utils.isSkyrimPage ? 'Nolvus community' : 'Skyrim modding community'}</b> to see if others are encountering this issue due to a new Windows update or the like.</li>

                        ${!Utils.isSkyrimPage ? `
                        <li>You can restore the original sorting of all vanilla Nolvus mods using the <b>Apply Order</b> button in the Nolvus Dashboard. For more information and a screenshot, see this r/Nolvus post <a href="https://www.reddit.com/r/Nolvus/comments/1chuod0/how_to_apply_order_button_usage_in_the_nolvus/">How To: "Apply Order" button usage in the Nolvus Dashboard</a>.</li>
                        ` : ''}
                        
                        ${!Utils.isSkyrimPage ? `
                        <li><b>Reinstall Nolvus</b> to ensure the installation is not corrupted. Make sure to back up any important data before doing this. For detailed instructions, see this <a href="https://docs.google.com/document/d/1R_AVeneeCiqs0XGYzggXx34v3Ufq5eUHNoCHo3QE-G8/edit">guide</a>.</li>
                        ` : ''}


                        <li>Try disabling, updating, or redownloading and reinstalling mods ${!Utils.isSkyrimPage ? 'you may have added to Nolvus' : ''} that appear in the 🔎<b>Files/Elements</b> section, especially SKSE plugins:
                            <ul>
                                <li><b>Start with SKSE plugins</b> (those ending in <code>.dll</code>) as they're particularly sensitive to Windows updates and system changes. They can be usually be safely disabled in groups of 5-10 to identify issues (except for Engine Fixes, which should stay enabled).</li>
                                <li>Other ${!Utils.isSkyrimPage ? 'added ' : ''}<b>suspect mods</b> (and their dependencies) can also be temporarily disabled to test if they're causing the crash.</li>
                                <li><b>CAUTION:</b> When downloading and reinstalling mods, only use versions compatible with your Skyrim version and other mods.</li>
                                <li>If you see <code>VCRUNTIME140.dll</code> in the report, download and install the latest version for your hardware from <a href="https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist?view=msvc-170">Microsoft Visual C++ Redistributable</a>.</li>
                            </ul>
                        </li>


                        <li><b>Run DISM and SFC scans:</b> Run built-in Windows command line "tools that can repair corrupted or missing system files and restore the health of your computer." See instructions and screenshots in step 1 of <a href="Kernelbase.dll: What It Is & How To Fix Errors">Kernelbase.dll: What It Is & How To Fix Errors</a>.
                            <ul>
                                <li>As administrator, run these commands:
                                    <ol>
                                        <li><code>dism /online /cleanup-image /restorehealth</code></li>
                                        <li><code>sfc /scannow</code></li>
                                    </ol>
                                </li>
                                <li>Reboot your PC and play. If it crashes again, check your new crash log.</li>
                            </ul>
                        </li>

                        <li>Check the <b>Windows Event Log</b> for any related issues. You can do this by opening the <b>Event Viewer</b> (search for it in the Start Menu), then navigate to Windows Logs > Application. Look for any recent errors that might be related to your issue. For detailed instructions, see this <a href="https://support.microsoft.com/en-us/windows/open-event-viewer-17d427d2-43d6-5e01-8535-1fc570ea8a14">Microsoft guide</a>.</li>
                        
                        <li>Ensure your <b>Windows is up to date</b>, as well as any drivers and applicable BIOS updates. You can check for Microsoft updates by going to Settings > Update & Security > Windows Update. Many motherboards (or PC manufacturers) will also have important <b>BIOS</b> firmware updates at their websites, and/or accesible from their own update application.</li>
                        
                        <li>Run a full system <b>scan for any viruses</b> or malware. We generally recommend using the built-in Windows Defender for this.</li>
                        
                        <li>Try <b>disabling mods</b> ${!Utils.isSkyrimPage ? 'you may have added to Nolvus' : ''} in large, gradually smaller and more isolating groups to see if the issue persists. <b>Start with SKSE plugins</b> (those ending in <code>.dll</code>) as they're particularly sensitive to Windows updates and system changes. They can be usually be safely disabled in groups of 5-10 to identify issues (except for Engine Fixes, which should stay enabled). If you didn't already above, consider starting with mods that show up in the 🔎<b>Files/Elements</b> section of this report. This can help identify if a specific mod is causing the problem.</li>
                        
                        <li>Reset your <b>file permissions</b>. See <a href="https://www.thewindowsclub.com/how-to-reset-file-folder-permissions-to-default-in-windows-10">How to reset all User Permissions to default in Windows 11/10</a>, or seek assistance from the ${Utils.SkyrimOrNolvusText} community. Alternatively, an easy <b>workaround</b> is to <a href = "https://support.microsoft.com/en-us/windows/create-a-local-user-or-administrator-account-in-windows-20de74e0-ac7f-3502-a866-32915af2a34d#WindowsVersion=Windows_11">create a new Windows User</a> and create a new ${Utils.SkyrimOrNolvusText} save (playthrough) from the new user.</li>
                        
                        <li><b>Use CHKDSK</b> to scan your hard drive for any corruption. You can do this by opening the Command Prompt as an administrator and running the command <code>chkdsk /f</code>. Note that you might need to restart your computer for the scan to run. Be aware that frequent use of <code>chkdsk</code> on SSDs can potentially shorten its lifespan due to the intensive write operations it performs.</li>
                        
                        ${Utils.isSkyrimPage ? `
                        <li>If you are using an auto-installed modlist (like a Wabbajack) <b>consider reinstalling</b> it to ensure your current installation is not corrupted. Make certain to backup any important data before doing this.</li>
                        ` : ''}
                        
                        <li>Perform a <b>Repair Upgrade</b> using the Windows 11 or Windows 10 ISO file. For detailed instructions, see this <a href="https://answers.microsoft.com/en-us/windows/forum/all/how-to-perform-a-repair-upgrade-using-the-windows/35160fbe-9352-4e70-9887-f40096ec3085">guide</a>.</li>

                        <li>If you are still encountering this issue (and after also consulting with the ${!Utils.isSkyrimPage ? 'Nolvus community' : 'Skyrim modding community'}), review the remaining ideas in <a href="https://malwaretips.com/blogs/kernelbase-dll-what-it-is-how-to-fix-errors/">Kernelbase.dll: What It Is & How To Fix Errors</a>. ⚠️CAUTION: it is probably best to avoid doing a full Sytem Restore or Resetting your PC unless you know what you are doing, and you are encountering kernel errors with additional software besides just Skyrim.</li>
                    </ol>
                </li>`;
        }
    }

    return diagnoses;
}




function analyzeEngineFixes(sections) {
    let insights = '';
    const hasMods = sections.bottomHalf.split('\n').filter(line => line.trim() !== '').length > 10;
    
    // Check if Engine Fixes is missing
    if (hasMods && !sections.bottomHalf.toLowerCase().includes('EngineFixes.dll'.toLowerCase())) {
        insights += `<li>🎯 <b>Missing SSE Engine Fixes:</b> This foundational mod is usually essential for a stable modded game.
            <ol>
                <li><strong>⚠️ Warnings:</strong>
                    <ul>
                        <li>Your save file could become permanently unplayable without SSE Engine Fixes installed</li>
                        <li>SSE Engine Fixes is a foundational mod required by over 100+ other mods on Nexus</li>
                        <li>It is also considered an <a href="https://www.reddit.com/r/skyrimmods/wiki/essential_mods/#wiki_essential_bugfixes">Essential Bugfix</a> by r/SkyrimMods wiki authors</li>
                    </ul>
                </li>
                
                <li><strong>Required Steps:</strong>
                    <ol>
                        <li>Install <a href="https://www.nexusmods.com/skyrimspecialedition/mods/17230">SSE Engine Fixes</a>
                            <ul>
                                <li>WARNING: This mod is <strong>frequently misinstalled</strong>, so be careful to follow instructions on Nexus page to install the correct versions of BOTH parts:
                                    <ul>
                                        <li>Part 1: The SKSE plugin (install via mod manager)</li>
                                        <li>Part 2: The DLL files (must be manually placed in Skyrim root folder)</li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                        
                        <li>Configure SSE Engine Fixes properly:
                            <ul>
                                <li>Option 1 (Recommended): Download the <a href="https://www.nexusmods.com/skyrimspecialedition/mods/108069">pre-configured TOML file</a></li>
                                <li>Option 2: Manually configure following this <a href="https://www.reddit.com/r/skyrimmods/comments/tpmf8x/crash_on_load_and_save_corruption_finally_solved/">settings guide</a>
                                    <ul>
                                        <li>Verify these settings in <code>EngineFixes.toml</code></li>
                                        <ul>
                                            <li><code>SaveGameMaxSize = true</code></li>
                                            <li><code>MaxStdio = 8192</code></li>
                                        </ul>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                    </ol>
                </li>

                <li><strong>Important Notes:</strong>
                    <ul>
                        <li>SSE Engine Fixes is essential for most Skyrim modlists</li>
                        <li>This mod fixes numerous engine-level bugs and is often important for game stability</li>
                        ${sections.bottomHalf.toLowerCase().includes('wheeler.dll'.toLowerCase()) ? 
                            `<li><strong>Wheeler.dll Detected:</strong> Wheeler.dll v1 specifically has been confirmed to crash without SSE Engine Fixes on 1.6.1170</li>` : 
                            ''}
                        <li>If you experience crashes with <code>tbb.dll</code>, reinstall SSE Engine Fixes completely</li>
                    </ul>
                </li>
            </ol>
        </li>`;
    }
    
    return insights;
}


function analyzeFirstLine(sections) {
    let insights = '';
    const ignoreFiles = ['Dawnguard.esm', 'Dragonborn.esm', 'null', 'null)', 'SkyrimSE.exe', 'skyrim.esm'];
    
    // Extract filename from sections.firstLine (actual location can vary between log types) if it exists
    const firstLine = sections.firstLine || '';
    const fileMatch = firstLine.match(/\b([^\/\\\s]+\.(?:esm|exe|esp|esl|dll|pex|skse|skse64))\b/i);
    const detectedFile = fileMatch ? fileMatch[1] : null;
    
    if (detectedFile && !ignoreFiles.includes(detectedFile)) {
        insights += `<li>❗ <b>Critical First-Line Error Detected:</b>  <span style='color:red'>${detectedFile}</span>
            <ol>
                <li><strong>What This Means:</strong>
                    <ul>
                        <li>First-line errors often indicate a serious compatibility or installation issue</li>
                        <li>The file "${detectedFile}" is directly involved in the crash sequence</li>
                        <li>While this file is related to the crash, it may not be the root cause</li>
                        <li>This type of error often indicates missing masters, incorrect load order, or version mismatches</li>
                    </ul>
                </li>
                
                <li><strong>Recommended Troubleshooting Steps:</strong>
                    <ol>
                        <li>First Steps:
                            <ul>
                                <li>Review other sections of this report to see if a more specific first-line error shows up with its own recommended troubleshooting steps</li>
                                <li>As a potentially easy fix, consider disabling the mod (and any and all mods that depend upon it)</li>
                                <li>Carefully review the associated mod's installation instructions</li>
                                <li>Check if a mod update is available on Nexus</li>
                                <li>Verify you have installed all of the mod's dependencies, and that they are all enabled</li>
                                <li>Verify you have all required patches installed for compatibility with other mods you are using</li>
                            </ul>
                        </li>
                        
                        <li>Version Verification:
                            <ul>
                                <li>Confirm the mod is compatible with your Skyrim version</li>
                                <li>Check version requirements of other mods that interact with it</li>
                                <li>Verify your SKSE version matches your Skyrim version</li>
                            </ul>
                        </li>
                        
                        <li>Advanced Troubleshooting:
                            <ul>
                                <li>Check the mod author's bug reports section and/or forum</li>
                                <li>Google the mod and/or ask the Skyrim Modding Community to confirm the mod is generaly considered stable with your version of Skyrim and your other mods</li>
                                <li>Try a clean reinstall of the mod</li>
                                <li>Identifying Missing Masters: Mod Organizer 2 (MO2) typically displays warning icons (yellow triangle with exclamation mark) for plugins with missing masters. <a href="https://imgur.com/izlF0GO">View Screenshot</a>.</li>
                                <li>Use xEdit to check for missing masters or conflicts</li>
                               ${Utils.LootListItemIfSkyrim}
                            </ul>
                        </li>
                    </ol>
                </li>

                <li><strong>Additional Considerations:</strong>
                    <ul>
                        <li>First-line errors are usually reproducible and not random</li>
                        <li>The error might be caused by a dependency rather than the named file</li>
                        <li>Some first-line errors can be resolved by verifying game files through Steam</li>
                    </ul>
                </li>
            </ol>
        </li>`;
    }
    
    return insights;
}


//Strings
//OLD METHOD: if (R14StringsRegex.test(sections.topHalf)) {
function analyzeStringsCrash(sections) {
    let insights = '';
    if (sections.topThird.includes('.STRINGS')) {
        insights += `<li>🎯 <b>.STRINGS Crash Detected:</b> This error typically occurs when there is a unique or non-standard character in the <code>sLanguage</code> line of your <b>skyrim.ini</b> file. To resolve this issue:<ol>
            <li>Locate your <b>skyrim.ini</b> file.</li>
            <li>Optionally, make a quick backup copy of this file and store it outside your ${Utils.SkyrimOrNolvusText} installation.</li>
            <li>Open the original file for editing, and locate the line that reads <code>sLanguage=ENGLISH</code>.</li>
            <li>Ensure that there are no unique characters or typos in this line. It should only contain standard text.</li>
            <li>Save the changes and restart ${Utils.SkyrimOrNolvusText} to see if the issue has been resolved.</li>
            <li>More information and troubleshooting tips under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-1">.STRINGS Crash</a/>.</li>
            </ol></li>`;
    }
    return insights;
}





function generateNoCrashDetectedMessage() {
    let diagnoses = '<li>❓ <b>No highest-confidence crash indicators detected.</b><ul>';

    if (Utils.isSkyrimPage) {
        diagnoses += `<li>Recommended steps:
            <ul>
                <li>First, review the <b>Advanced Users</b> section below for potential crash indicators that might apply to your situation</li>
                <li>Second, verify that you have already correctly installed and configured <b>SSE Engine Fixes</b>:
                    <ul>
                        <li>Install <a href="https://www.nexusmods.com/skyrimspecialedition/mods/17230">SSE Engine Fixes</a> (both parts):
                            <ul>
                                <li>Part 1: SKSE plugin via mod manager</li>
                                <li>Part 2: DLL files manually into Skyrim folder</li>
                            </ul>
                        </li>
                        <li>Configure <code>EngineFixes.toml</code> with:
                            <ul>
                                <li><code>SaveGameMaxSize = true</code></li>
                                <li><code>MaxStdio = 8192</code></li>
                            </ul>
                        </li>
                        <li>For easier setup, use this <a href="https://www.nexusmods.com/skyrimspecialedition/mods/108069">pre-configured TOML file</a></li>
                    </ul>
                </li>
                <li>Review and install any missing <a href="https://www.reddit.com/r/skyrimmods/wiki/essential_mods/#wiki_essential_bugfixes">Essential Bugfixes</a> applicable to your modlist</li>
                <li>Check your load order against <a href="https://www.reddit.com/r/skyrimmods/wiki/begin2/">r/SkyrimMod's Beginner's Guide</a> guidelines</li>
                <li>${Utils.LootIfSkyrim}</li>
                <li>If issues persist, share your logs with <a href="https://www.reddit.com/r/skyrimmods/">r/Skyrim</a></li>
                <li><b>As a last resort:</b> Try disabling groups of mods at a time (being mindful of masters and dependencies) until the crash stops. While tedious, this can help isolate problematic mod combinations</li>
            </ul></li>`;
    } else {
        diagnoses += `<li>Recommended steps:
            <ul>
                <li>First, if comfortable, check the <b>Advanced Users</b> box above, and review that section below for potential crash indicators that might apply to your situation</li>
                <li>Review <b>Jerilith's Safe Save Guide</b> at <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-5">Save Bloat Crash</a></li>
                <li>If using custom mods, check the <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-7">Load Order Crash</a> guide</li>
                <li>If issues persist, seek help at:
                    <ul>
                        <li><a href="https://www.reddit.com/r/Nolvus/">r/Nolvus</a></li>
                        <li><a href="https://discord.gg/Zkh5PwD">Nolvus Discord</a></li>
                    </ul>
                </li>
                <li><b> As a last resort:</b>  Try disabling any <b>mods that you have added to Nolvus</b>, a few at a time (being mindful of masters and dependencies) until the crash stops. While tedious, this can help isolate problematic mod combinations</li>
            </ul></li>`;
    }

    diagnoses += '</ul></li>';
    return diagnoses;
}




function analyzeOverlayIssues(sections, logFile) {
    let diagnosis = '';
    let overlayFiles = [];
    let overlayInTopHalf = false;
    
    // Helper function to add unique overlay to list
    function addUniqueOverlay(overlay) {
        if (!overlayFiles.includes(overlay)) {
            overlayFiles.push(overlay);
        }
    }

    // Check for overlay DLLs in top half
    const simplifiedOverlayRegex = /\b\w*overlay\w*\.dll\b/gi;
    const matches = sections.topHalf.match(simplifiedOverlayRegex) || [];

    // Process regex matches
    for (const match of matches) {
        overlayInTopHalf = true;
        let found = false;
        for (const [overlay, files] of Object.entries(window.overlaySignatures)) {
            if (files.some(file => file.toLowerCase() === match.toLowerCase())) {
                addUniqueOverlay(overlay);
                found = true;
                break;
            }
        }
        if (!found) {
            addUniqueOverlay(match);
        }
    }

    // Check known overlay signatures
    for (const [overlay, files] of Object.entries(window.overlaySignatures)) {
        if (files.some(file => logFile.toLowerCase().includes(file.toLowerCase()))) {
            addUniqueOverlay(overlay);
            if (overlay !== 'Steam' && files.some(file => sections.topHalf.toLowerCase().includes(file.toLowerCase()))) {
                overlayInTopHalf = true;
            }
        }
    }

    // Special case for Steam
    if (sections.topHalf.toLowerCase().includes('gameoverlayrenderer64.dll')) {
        addUniqueOverlay('Steam');
    }

    // Remove explicit mention of gameoverlayrenderer64.dll
    overlayFiles = overlayFiles.filter(file => file.toLowerCase() !== 'gameoverlayrenderer64.dll');

    if (overlayFiles.length > 0) {
        const hasSteamOverlay = overlayFiles.some(file => file.toLowerCase().includes('steam'));
        const remainingOverlays = overlayFiles.filter(file => 
            !file.toLowerCase().includes('steam') && 
            !file.toLowerCase().includes('discord')
        );

        if (remainingOverlays.length > 0) {
            let warningMessage = '⚠️ <b>Overlay Warning:</b> Overlays detected. While some are generally considered safe, others may cause issues in heavily-modded Skyrim.';
            
            if ((!hasSteamOverlay && overlayFiles.length == 1) || overlayFiles.length > 1) {
                warningMessage = '❓ <b>Possible Overlay Issue:</b> Overlays detected in the top half of your crash log, suggesting they may have contributed towards the crash.';
            }

            const steamNote = hasSteamOverlay
                ? '<li>(Note: <code>Steam</code> frequently shows up even when disabled, but it might be worth double-checking.)</li>'
                : '';

            diagnosis = `<li>${warningMessage} It's best to try disabling all overlays temporarily to ensure they aren't contributing to your crash.<ul>` +
                `<li>List of detected overlays: <a href="#" class="toggleButton">⤴️ hide</a> <ul class="extraInfo">` +
                overlayFiles.map(file => `<li><code>${file}</code></li>`).join('') +
                steamNote + 
                '</ul></li></ul></li>';
        }
    }

    return diagnosis;
}









// Add new indicators for animation loader issues

function analyzeAnimationLoaderIssues(sections) {
    let loaderInsights = '';
    let isHighPriority = false;

    function findLoaderCodeIssues(sections) {
        return crashIndicators.animationLoaderIssues.codes.filter(({ code }) =>
            sections.topHalf.toLowerCase().includes(code.toLowerCase())
        );
    }

    const loaderCodeIssues = findLoaderCodeIssues(sections);
    Utils.debuggingLog(['analyzeAnimationLoaderIssues', 'analyzeLog.js'], 'loaderCodeIssues:', loaderCodeIssues);

    if (loaderCodeIssues.length > 0) {
        isHighPriority = true;
        loaderInsights += `<li>❗ <b>Animation Loader/Behavior Engine Issue Detected:</b> To fix this, please follow these steps:
        <ol>
        <li>First steps:
            <ul>
            <li>Regenerate/patch your animations using your behavior engine:
                <ul>
                <li>If using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/3038">FNIS</a>: Run GenerateFNISforUsers.exe</li>
                <li>If using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/60033">Nemesis</a>: Run Nemesis Unlimited Behavior Engine
                    <ul>
                        <li>reference: <a href="https://www.reddit.com/r/skyrimmods/comments/t2rk34/nemesis_pro_tip/">guide to clearing Nemesis cache</a></li>
                        <li>reference: <a href="https://www.nolvus.net/guide/asc/output/nemesis">example instructions from Nolvus</a> (with numerous screenshots)</li>
                    </ul>
                <li>If using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/133232">Pandora</a>: Run Pandora Behavior Engine</li>
                </ul>
            </li>
            <li>Ensure you're running the behavior engine as Administrator</li>
            <li>Clear the behavior engine's cache before regenerating</li>
            <li>Remember to check/enable all relevant boxes/options in your behavior engine's interface (FNIS/Nemesis/Pandora) to generate all the correct files for your installed mods.</li>
            </ul>
        </li>
        
        <li>If regeneration fails:
            <ul>
            <li>Check if any animation mods were recently added or updated</li>
            <li>When disabling animation mods for testing, remember to run your behavior engine after each change to properly update animations (otherwise you may see T-posing or other animation issues)</li>
            <li>Verify your animation frameworks (DAR/OAR) is installed and up to date</li>
            <li>Ensure your skeleton mod matches your animation requirements</li>
            </ul>
        </li>

        <li>Common issues to check:
            <ul>
            <li>Incompatible animation mods between different behavior engines</li>
            <li>Incorrect load order for animation frameworks</li>
            <li>Corrupted behavior files from incomplete downloads or updates</li>
            </ul>
        </li>`;

        // Add mention of potential overlap with animation issues
        loaderInsights += `<li>Note: These issues may overlap with general animation issues. If animation regeneration doesn't solve the problem, check for an "Animation Issue" section directly above for additional troubleshooting ideas.</li>`;

        if (loaderCodeIssues.length > 0) {
            loaderInsights += `<li>Detected animation loader indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">`;
            loaderCodeIssues.forEach(({ code, description }) => {
                loaderInsights += `<li><code>${code}</code> - ${description}</li>`;
            });
            loaderInsights += '</ul></li>';
        }

        //NOTE: thought about adding addMentionedFilesListItems() for it, but I don't think this an issue where we need to isolate any mods ... just regen/rerun the engine

        loaderInsights += '</ol></li>';
    }

    return {
        insights: loaderInsights,
        isHighPriority: isHighPriority
    };
}