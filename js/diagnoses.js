//All diagnosing functions for both analyzeLog.js's diagnoses and insights variables. Only use insights.js if there needs to be a version of a function unique to the insights variable

// --- Shared Constants ---
const verifyWindowsPageFileListItem = `💾 Verify your <a href="https://www.nolvus.net/appendix/pagefile">Windows Pagefile is properly configured</a> (nolvus.net link, but broadly applicable). The most common stability-focused recommendation is setting the Pagefile's minimum and maximum to 40GB. ⚠️NOTE: some sources say Skyrim's engine was programmed to require high Pagefile usage even when there is more than enough RAM available. To be on the safe side, ensure your Pagefile settings even if you somehow have a terrabyte of RAM.`;

const reinstallEngineFixes = `
    <!--<ul>-->
        <li>WARNING: <a href="https://www.nexusmods.com/skyrimspecialedition/mods/17230">SSE Engine Fixes</a> is <strong>frequently misinstalled</strong>, so be careful to follow instructions on its Nexus page to install BOTH parts:
            <ul>
                <li>Part 1: The SKSE plugin. Be sure to download the current and correct version of Engine Fixes, for your version of Skyrim, and install with your mod manager</li>
                <li>Part 2: DLL files are manually placed into Skyrim folder</li>
            </ul>
        </li>
        <li>Configure <code>EngineFixes.toml</code> with:
            <ul>
                <li>Option 1 (Recommended): Download the <a href="https://www.nexusmods.com/skyrimspecialedition/mods/108069">pre-configured TOML file</a></li>
                <li>Option 2: Manually configure following this <a href="https://www.reddit.com/r/skyrimmods/comments/tpmf8x/crash_on_load_and_save_corruption_finally_solved/">settings guide</a>. Verify/Edit these settings in <code>EngineFixes.toml</code> :
                    <ul>
                        <li><code>SaveGameMaxSize = true</code></li>
                        <li><code>MaxStdio = 8192</code></li>
                    </ul>
                </li>
            </ul>
        </li>
    <!--</ul>-->`;


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



// Object Reference None Detection (for Crash Logger SSE logs)
// Baseform: Null Detection (same thing, but for NSF logs)
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
        <li>Check for other high-priority issues in this report first, as they might potentially be causing this problem.</li>
        <li>The primary file to investigate is: <code>${mostLikelyFile}</code>. As a quick fix, consider disabling the mod. Or, towards deeper troubleshooting:
            <ul>
                <li>Consider temporarily disabling it (and all its dependencies) to isolate the issue.</li>
                <li>Verify it's the correct version for your Skyrim, and your other mods</li>
                <li>Check for missing required files, or recommended patches</li>
                <li>Verify its in the correct load order (check mod author's recommendation)</li>
                <li>Check any configurations or configuration files (or for some mod types it may need to be regenerated)</li>
                <li>Consider re-downloading (and carefully reinstalling) in case the first download was corrupted</li>
            </ul>
        </li>`;
    
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
    let incompatibleDllsDiagnoses = '';
    let diagnosesCount = 0;
    let emoji = '❓';
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
        for (const dll of incompatibleDlls) {
            const versionKeys = Object.keys(dllCompatibleSkyrimVersionsMap[dll.dllName])
                .sort((a, b) => Utils.compareVersions(b, a));
            const dllMostRecentVersion = versionKeys[0]; // Get the latest version
            const compatData = dllCompatibleSkyrimVersionsMap[dll.dllName][dllMostRecentVersion];

            let outputVersion = dll.dllVersionFromLog;
            if (dll.dllVersionFromLog == "0.0.0.1") {
                outputVersion = '(unspecified)';
            }
            
            if (sections.topQuarter.toLowerCase().includes(dll.dllName.toLowerCase())) emoji = '❗'; //NOTE: upgrades heading if ANY of the listed mods are listed in topQuarter

            let footnote = '';
            if (compatData.note) footnote = `<ul><li>${compatData.note}</li></ul>`

            incompatibleDllsDiagnoses += `<li><code>${dll.dllName}</code> v${outputVersion}: 
                        Recommend update to <b>${compatData.modName}</b> v${compatData.recommendedVersion} or later. 
                        <a href="${compatData.url}" target="_blank">Download here</a> ${footnote}</li>`;
            diagnosesCount++;
        }

        incompatibleDllsDiagnoses = `<li>${emoji} <b>Version Compatibility Notice:</b> The following DLLs are not fully compatible with your Skyrim version ${skyrimVersion} and many may cause crashes, although please note that, for a few mods, version detection isn't always accurate:<ul>`
            + incompatibleDllsDiagnoses
            + '</ul></li>';
    }

    Utils.debuggingLog(['checkDllCompatibility', 'analyzeLog.js'], `Ending DLL version check. Found ${incompatibleDlls.length} incompatible DLLs.`);
    Utils.debuggingLog(['checkDllCompatibility', 'analyzeLog.js'], `incompatibleDllsDiagnoses: ${incompatibleDllsDiagnoses}`);
    return {incompatibleDllsDiagnoses, diagnosesCount};
}



//D6DDDA Crash (short an long versions)
function checkForD6dddaEasyVersion(sections) {
    let diagnosis = '';
    if (sections.firstLine.includes('D6DDDA')) {
        diagnosis += `<li>❗ <b>D6DDDA Crash Detected:</b> This error typically occurs due to one of these common causes:
            <ol>
                <li>Corrupt Texture (.dds) or Mesh (.nif) Files:
                    <ol>
                        <li>Compare multiple crash logs if possible. If subsequent crashes list the same texture or mesh files (see "Advanced Users" section below), you likely have a corrupt texture file or, less commonly, a corrupt mesh. Once you've identified the problematic mod, try downloading it again before reinstalling, as the corruption may have occurred during the initial download. For more details, see the Texture Issues and Mesh Issues sections in this report (in the Advanced Users section, below).</li>
                    </ol>
                </li>
                <li>System Memory Management:
                    <ol>
                        <li>Close unnecessary background applications that may be consuming memory.</li>
                        <li>${verifyWindowsPageFileListItem}<li>
                        <li>Return any overclocked hardware (including RAM using XMP or AMD EXPO) to stock speeds, as unstable overclocks are known for causing crashes that can look like memory issues in crash logs.</li>
                        <li>Maintain <a href="https://computercity.com/hardware/storage/how-much-space-should-i-leave-on-my-ssd">at least 10-20% free space</a> on your SSD for optimal performance.</li>
                        <li>Review your modlist's (or individual mods') recommended hardware requirements to verify you aren't overly below their system recommendations.</li>
                        <li>Hardware Diagnostics: If crashes persist, run Windows Memory Diagnostic or <a href="https://www.memtest86.com/">MemTest86</a> to check for faulty RAM. While rare, recurring D6DDDA crashes can sometimes indicate hardware issues.</li>
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
                        <li>Compare multiple crash logs if possible. If subsequent crashes list the same texture or mesh files (see their own sections in "Advanced Users"), you likely have a corrupt texture file or, less commonly, a corrupt mesh. Once you've identified the problematic mod, try downloading it again before reinstalling, as the corruption may have occurred during the initial download.</li>
                        <li>If the source mod has a corrupted image file, you can try using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/23316">Cathedral Assets Optimizer (CAO)</a> to repair potentially damaged texture/mesh/animation files. This tool can fix formatting issues and also optimize file sizes while maintaining visual quality.</li>
                        <li>If you identify a specific problematic image file in a source mod, contact the mod author for assistance or potential fixes.</li>
                    </ol>
                </li>
                <li>System Memory Management:
                    <ol>
                        <li>Close unnecessary background applications that may be consuming memory.</li>
                        <li>${verifyWindowsPageFileListItem}</li>
                        <li>Return any overclocked hardware (including RAM using XMP or AMD EXPO) to stock speeds, as unstable overclocks are known for causing crashes that can look like memory issues in crash logs.</li>
                        <li>Maintain <a href="https://computercity.com/hardware/storage/how-much-space-should-i-leave-on-my-ssd">at least 10-20% free space</a> on your SSD for optimal performance.</li>
                        <li>🚀 For systems with less than 12GB VRAM (or more for ultrawide/high-resolution displays) (<a href="https://www.lifewire.com/how-to-check-vram-5235783">check your VRAM here</a>), consider using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/90557">VRAMr</a>. This tool automatically compresses texture files across your load order, reducing VRAM usage while maintaining visual fidelity and improving stability.</li>
                        <li>Review your modlist's (or individual mods') recommended hardware requirements to verify you aren't overly below their system recommendations.</li>
                        <li>Hardware Diagnostics: If crashes persist, run Windows Memory Diagnostic or <a href="https://www.memtest86.com/">MemTest86</a> to check for faulty RAM. While rare, recurring D6DDDA crashes can sometimes indicate hardware issues.</li>
                    </ol>
                </li>
            </ol>
        </li>`;
    }
    return diagnosis;
}


//❗ Critical Memory Usage Detected
function checkForHighMemoryUsage(sections) {
    let diagnosis = '';

    // Determine warning level and icon
    const warningIcon = (sections.criticalRam || sections.criticalVram) ? '❗' : '❓';
    const warningLevel = (sections.criticalRam || sections.criticalVram) ? 'Suspiciously High' : 'High';
    
    if (sections.lowRam || sections.lowVram) {
        diagnosis += `<li>${warningIcon}<b> ${warningLevel} Memory Usage Detected:</b> High memory usage may lead to instability. Note that excess memory usage can often be <i>caused</i> by other issues in this report. Key steps for early consideration (especially if this issue comes up frequently, and without other causes): <a href="#" class="toggleButton">⤵️ show more</a>
            <ul class="extraInfo" style="display:none">
                <li>Close unnecessary background applications</li>
                <li>${verifyWindowsPageFileListItem}</li>
                <li>Consider these optimization strategies:
                    <ul>
                        <li>Switch texture mods to 1K or 2K variants</li>
                        <li>🚀 Or optionally use <a href="https://www.nexusmods.com/skyrimspecialedition/mods/90557">VRAMr</a> to automatically optimize (almost) all of your load order's textures</li>
                        <li>Use lower-memory mesh variants for mods</li>
                        <li>Minimize mods that add to the density of occurrences of 3D objects (e.g., some tree mods can overpopulate landscapes)</li>
                    </ul>
                </li>
                <li>Consider using a tool like <a href="https://game.intel.com/us/intel-presentmon/">Intel PresentMon</a> to accurately monitor usage and bottlenecks of VRAM, RAM, GPU and CPU while troubleshooting.</li>
                <li><b>Workaround:</b> If you're experiencing crashes in a specific location, you can use the in game <b>console command</b> <code>pcb</code> (Purge Cell Buffer) to free up memory. This may help prevent some crashes by clearing cached cells, though it will cause those recently visited areas to have to reload completely when re-entered. Reportedly best used while in interior cells.</li>
                <li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a>
                    <ul class="extraInfo" style="display:none">`
                        if(sections.lowRam) { 
                            diagnosis += `<li><code>${sections.physicalMemoryMatch}</code></li>`;
                        }
                        if(sections.lowVram) { 
                            diagnosis += `<li><code>${sections.gpuMemoryMatch}</code></li>`;
                        }
                    diagnosis += `</ul>
            </ul>
        </li>`;
    }
    return diagnosis;
}



//❗ Potential Missing Masters Detected:
function checkForMissingMasters(sections) {
    // Change the calling code to:
    const modCounts = Utils.modCounts(sections);
    const hasBeesInstalled = sections.fullLogFileLowerCase.includes('BackportedESLSupport.dll'.toLowerCase());
    Utils.debuggingLog(['checkForMissingMasters'], 'modCounts:', modCounts);
    let hasLoadedGamePlugins = Utils.hasGamePluginsLoaded(modCounts, sections.gamePlugins);
    Utils.debuggingLog(['Utils.hasGamePluginsLoaded', 'checkForMissingMasters'], 'hasLoadedGamePlugins:', hasLoadedGamePlugins);
    let diagnoses = '';

    if (sections.logType === "Trainwreck") {
        hasLoadedGamePlugins = true;
        // NOTES:
        // - Trainwreck logs never list Plugins (.esm, .esp, .esl)
        // - can't use modCounts.gamePlugins as an effective indicator with Trainwreck logs
        // - other Missing Masters indicators still apply
    }

    if ((sections.hasSkyrimAE && sections.firstLine.includes('0198090')) ||
        (!sections.hasSkyrimAE && (sections.firstLine.includes('5E1F22'))) ||
        sections.topHalf.includes('SettingT<INISettingCollection>*') ||
        !hasLoadedGamePlugins
        ) {
        
        // Check if hasLoadedGamePlugins is the only trigger
        const onlyNoPlugins = !hasLoadedGamePlugins && 
            !(sections.hasSkyrimAE && sections.firstLine.includes('0198090')) &&
            !(!sections.hasSkyrimAE && (sections.firstLine.includes('5E1F22'))) &&
            !sections.topHalf.includes('SettingT<INISettingCollection>*');

        // Use different icon based on condition
        diagnoses += `<li>${onlyNoPlugins ? '❓' : '❗'} <b>Potential Missing Masters/Dependency Detected:</b> `;
        
        // Special message for no plugins only case
        if (onlyNoPlugins) {
            diagnoses += 'Few or no game plugins were detected in your log. If your modlist is intentionally designed to have few or zero plugins (rare), you can ignore this warning. Otherwise, this indicates a potential problem with your load order that needs investigation. ';
        }
        
        diagnoses += 'Your load order might be missing required master files or other dependency, which can lead to instability and crashes. NOTE: Review other high-likelihood diagnoses first, as some of them can cause (or appear to cause) this issue. Here are some possible causes and solutions:<ul>';

        if (!Utils.isSkyrimPage) {
            diagnoses += '<li><b>Automated Nolvus Installers:</b> Try using the Nolvus Dashboard\'s "Apply Order" feature. This often resolves load order issues. For more information, see: <a href="https://www.reddit.com/r/Nolvus/comments/1kp1lrw/guide_using_the_apply_order_button_in_nolvus/">How To: Use the "Apply Order" Button</a>. If you have added additional mods, you wil then need to re-enable and reposition them in your load order.</li>';
        }

        if (!sections.hasNewEslSupport && !hasBeesInstalled) {
            diagnoses += '<li>🐝 <b>New Mod Incompatibility:</b> Recently added mods may be causing conflicts. If you are using a version of Skyrim before 1.6.1130, but have added a mod designed with the newest type of ESL files, we suggest installing <a href="https://www.nexusmods.com/skyrimspecialedition/mods/106441">Backported Extended ESL Support (BEES)</a>, though this doesn\'t always resolve all incompatibilities.</li>';
        }

        diagnoses += `<li><b>Creations Menu Conflicts:</b> Never use the in-game Creations menu (accessed from the main menu) while using an external mod manager like MO2 or Vortex. The Creations menu acts as its own mod manager and can conflict with your external one, causing missing masters and other issues. Always manage all mods exclusively through your chosen mod manager.</li>`;

        


        if (Utils.isSkyrimPage && sections.hasNewEslSupport && (sections.bottomHalf.toLowerCase().includes('EngineFixes.dll'.toLowerCase()) || sections.bottomHalf.toLowerCase().includes('EngineFixesVR.dll'.toLowerCase()) )) {
            diagnoses += `
            <li><b>Consider reinstalling:</b> <b>SSE Engine Fixes</b> <a href="#" class="toggleButton">⤵️ show more</a>
                <ul class="extraInfo" style="display:none">
                    ${reinstallEngineFixes}
                </ul>
            </li>`;
        }

        diagnoses +=
            '<li><b>Identifying Missing Masters:</b> Mod Organizer 2 (MO2) typically displays warning icons (yellow triangle with exclamation mark) for plugins with missing masters. <a href="https://imgur.com/izlF0GO">View Screenshot</a>. Or alternately, check the <b>🔎 Files/Elements</b> section of this report and look at mods higher up the list, which could help isolate which mod might be missing something. Review the mod on Nexus and consider reinstalling any likely causal mods to see if you missed a patch or requirement.</li>' +

            '<li><b>Missing Dependency:</b> If you\'ve recently removed, disabled, or forgot to install a required mod, others may still depend on it. You might need to either install the missing dependency or remove its master requirement from dependent plugins. See this guide on <a href="https://github.com/LivelyDismay/Learn-To-Mod/blob/main/lessons/Remove%20a%20Master.md">Removing a Master Requirement</a>.</li>' +

            '<li><b>Version Mismatch:</b> Ensure all your mods are compatible with your Skyrim version (SE or AE). Always check the mod\'s description page for version compatibility.</li>' +
            
            Utils.LootListItemIfSkyrim;
        
        diagnoses += `<li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a>
            <ul class="extraInfo" style="display:none">`;
    
            // Add each detected indicator
            if (sections.hasSkyrimAE && sections.firstLine.includes('0198090')) {
                diagnoses += `<li><code>0198090</code> - AE version indicator found in first error line</li>`;
            }
            if (!sections.hasSkyrimAE && sections.firstLine.includes('5E1F22')) {
                diagnoses += `<li><code>5E1F22</code> - SE version indicator found in first error line</li>`;
            }
            if (sections.topHalf.includes('SettingT<INISettingCollection>*')) {
                diagnoses += `<li><code>SettingT&lt;INISettingCollection&gt;*</code> - INI setting collection error detected</li>`;
            }
            if (!hasLoadedGamePlugins) {
                diagnoses += `<li><code>No plugins</code> - plugins appear to have not fully loaded?</li>`;
            }

        diagnoses += '</ul></ul></li>';
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
        message += `<li>⚠️ <b>Trainwreck Log Detected:</b> While Trainwreck provides partial crash information, it frequently lacks indicators provided by other logging options. In many situations, relying on Trainwreck can prevent a helpful diagnosis.
        <ul>`;

        if (sections.hasSkyrimAE) {
            message += `
                <li>For Skyrim AE (version 1.6+), we strongly recommend using <a href='https://www.nexusmods.com/skyrimspecialedition/mods/59818'>Crash Logger SSE</a> (newest version) instead. It provides more detailed crash information, aiding in better diagnosis.</li>
                <li><b>Additional Information when switching to Crash Logger SSE:</b>
                    <ul>
                        <li>You don't need the old version of Crash Logger to run it. For simplicity's sake, we recommend not even downloading the old version or at least disabling it.</li>
                        <li>Be sure to <b>disable Trainwreck</b> and any other crash logging mods. Only have Crash Logger SSE enabled.</li>
                        <li>Trainwreck logs show up here: <code>[Your Documents]/My Games/Skyrim Special Edition/SKSE/Crashlogs</code></li>
                        <li>But Crash Logger SSE logs usually show up <b>one directory higher</b>. Note: It's often a long directory, so sort the files by <b>Date Modified</b> to have the most recent files at the top: <code>[Your Documents]/My Games/Skyrim Special Edition/SKSE/</code></li>
                    </ul>
                </li>`;
        } else {
            message += `<li>For Skyrim SE (version 1.5), we strongly recommend using <a href='https://www.nexusmods.com/skyrimspecialedition/mods/21294'>.NET Script Framework</a> instead. It offers more detailed crash information, which is crucial for accurate diagnosis.</li>`;
        }

        message += `
            <li>Remember to only have one logging mod enabled at a time.</li>
            <li>🚨 <b>Trainwreck as Backup:</b> Trainwreck remains the best backup option when other logging mods won't output a crash log for specific, rarer crash types. But unless you've already tried a better logging mod for this specific reoccurring crash, we highly recommend using an alternative instead of Trainwreck.</li>
        </ul>
        </li>`;
    }

    return message;
}






//❗ Probable Memory Issue Detected: 
function analyzeMemoryIssues(sections) {
    let memoryInsights = '';
    const physicalMemoryPercent = sections.systemPhysicalMemoryPercentUsed;
    const gpuMemoryPercent = sections.systemGpuMemoryPercentUsed;
    
    // Thresholds that typically indicate potential stability issues in modded Skyrim
    const RAM_WARNING_THRESHOLD = 85.0;  // % RAM usage
    const VRAM_WARNING_THRESHOLD = 85.0; // % VRAM usage

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
        return crashIndicators.memoryIssues.codes
            .filter(({ code }) => 
                sections.topHalf.toLowerCase().includes(code.toLowerCase()) ||
                (sections.firstLine && sections.firstLine.toLowerCase().includes(code.toLowerCase()))
            )
            .map(issue => ({
                ...issue,
                ...(sections.firstLine && sections.firstLine.toLowerCase().includes(issue.code.toLowerCase()) 
                    ? { description: `First Line Error: ${issue.description}` } 
                    : {})
            }));
    }

    function getMemoryUsageStatus(sections) {
        const diagnosticInfo = [];
        let hasWarnings = false;
        let hasMemoryInfo = false;
        let hasCriticalRam = false;
    
        // Check RAM usage
        if (sections.systemPhysicalMemory !== undefined && sections.systemPhysicalMemoryMax !== undefined) {
            const usedRam = sections.systemPhysicalMemory;
            const ramStatus = sections.criticalRam ? '❗ Critical' : (sections.lowRam ? '❗ High' : 'Normal');
            diagnosticInfo.push(`<li>RAM Usage: ${ramStatus} (${usedRam.toFixed(1)} / ${sections.systemPhysicalMemoryMax.toFixed(1)} GB)</li>`);
            
            if (sections.lowRam || sections.criticalRam) {
                hasWarnings = true;
            }
            if (sections.criticalRam) {
                hasCriticalRam = true;
            }
            if (usedRam > 0) { hasMemoryInfo = true; }
        }
    
        // Check VRAM usage
        if (sections.systemGpuMemory !== undefined && sections.systemGpuMemoryMax !== undefined) {
            const usedVram = sections.systemGpuMemory;
            const vramStatus = sections.criticalVram ? '❗ Very High' : (sections.lowVram ? '❗ High' : 'Normal');
            diagnosticInfo.push(`<li>VRAM Usage: ${vramStatus} (${usedVram.toFixed(1)} / ${sections.systemGpuMemoryMax.toFixed(1)} GB)</li>`);
            
            if (sections.lowVram || sections.criticalVram) {
                hasWarnings = true;
            }
            if (usedVram > 0) { hasMemoryInfo = true; }
        }
    
        return { diagnosticInfo, hasWarnings, hasMemoryInfo, hasCriticalRam };
    }

    const hexCodeIssue = findMemoryHexCodeIssue(sections);
    const memoryCodeIssues = findMemoryCodeIssues(sections);
    const priorityIssue = (hexCodeIssue || sections.firstLine.includes('tbbmalloc.dll') );
    let hasCriticalRam = false;
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
            <li>${verifyWindowsPageFileListItem}</li>
            <li>Return any overclocked hardware (including RAM using XMP or AMD EXPO) to stock speeds, as unstable overclocks are known for causing crashes that can look like memory issues in crash logs.</li>
            <li>Maintain <a href="https://computercity.com/hardware/storage/how-much-space-should-i-leave-on-my-ssd">at least 10-20% free space</a> on your SSD for optimal performance.</li>
            <li>Review your modlist's (or individual mods') recommended hardware requirements to verify you aren't overly below their system recommendations.</li>
            <li>Consider running memory diagnostic tools (Windows Memory Diagnostic or <a href="https://www.memtest86.com/">MemTest86</a>)</li>
            <li>If you frequently encounter memory issues, consider upgrading your system with more RAM as a relatively cost-effective upgrade. 32GB is often considered a baseline for high-end Skyrim modding.</li>
            </ul>
        </li>

        <li><b>Texture and Resource Optimization:</b>
            <ul>
            <li><strong>Corrupted textures and/or meshes</strong> can sometimes cause memory issues. The probability of this being the cause is much higher if specific files are listed elsewhere in this report ... especially when the same image file is found across multiple crash logs. In some cases simply re-downloading and reinstalling the mod with a bad mesh or texture, may fix the corrupted file and resolve the issue. See related <strong>Mesh Issue</strong>, and/or <strong>Texture Issue</strong> sections of this report for additional troubleshooting advice.
            <li>Consider switching to <strong>lower resolution texture mods</strong> (1K/2K instead of 4K). Image files that are too large can strain both VRAM and RAM resources.<ul>
                <li>Or use <a href="https://www.nexusmods.com/skyrimspecialedition/mods/23316">Cathedral Assets Optimizer (CAO)</a> to optimize textures in individual mods that don't offer lower resolution options.</li>
                <li>🚀 Alternately, use <a href="https://www.nexusmods.com/skyrimspecialedition/mods/90557">VRAMr</a> to automatically create a custom textures-only mod with optimized texture files that override for your entire load order (minus some problematic exceptions which are automatically excluded).</li>
                <li> NOTE: Texture and/or mesh optimization speeds up transfers and reduces storage space for RAM, VRAM, and SSD. Smaller texture files can be especially helpful in minimizing FPS stutters that are especially prone in outdoor combat and other visually busy situations. Usually, the lowering of image quality is unnoticeable during normal gameplay, especially at 2k, but largely even at 1K unless you walk up close and stare at a large object in game.</li>
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


        const { diagnosticInfo, hasWarnings, hasMemoryInfo, hasCriticalRam } = getMemoryUsageStatus(sections);
        Utils.debuggingLog(['analyzeMemoryIssues', 'analyzeLog.js'], 'diagnosticInfo:', diagnosticInfo);
        Utils.debuggingLog(['analyzeMemoryIssues', 'analyzeLog.js'], 'hasWarnings:', hasWarnings);
        Utils.debuggingLog(['analyzeMemoryIssues', 'analyzeLog.js'], 'hasMemoryInfo:', hasMemoryInfo);
        Utils.debuggingLog(['analyzeMemoryIssues', 'analyzeLog.js'], 'hasCriticalRam:', hasCriticalRam);
        if (diagnosticInfo.length > 0 && hasMemoryInfo) {
            memoryInsights += `<li>System Memory Status ${hasWarnings ? '❗' : ''}: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">`;
            memoryInsights += diagnosticInfo.join('');
            if (hasWarnings) {
                memoryInsights += `<li>⚠️ High memory usage detected. While this could be caused by another listed issue, consider following the optimization steps above to reduce memory pressure.</li>`;
            }
            memoryInsights += '</ul></li>';
        }


        if (hexCodeIssue || memoryCodeIssues.length > 0) {
            memoryInsights += `<li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">`;
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

    return (memoryInsights, hasCriticalRam);
}


//❗ Dragon's Eye Minimap Issue Detected:
function analyzeDragonsEyeMinimapIssue(sections) {
    let insights = '';
    const dllFileName = 'DragonsEyeMinimap.dll';
    const dllFileNameTopSection = sections.probableCallstack.toLowerCase().includes(dllFileName.toLowerCase());

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
            if (matchingDragonEyeCodes.length >= 1 || dllFileNameTopSection) {
                insights += `
                <li>❗ <b>Dragon's Eye Minimap Issue Detected:</b> Indicators in this log are often linked to the Dragon's Eye Minimap causing crashes.
                    <ol>
                        <li>Toggle off Dragon's Eye Minimap with the hotkey (defaults to "L" key) and progress until you leave the current Cell.</li>
                        <li>If this issue frequently occurs in future crash logs, consider checking for an updated version or disabling the mod. NOTE: issue still exists as of version 1.1</li>
                        <li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a>
                            <ul class="extraInfo" style="display:none">
                                <li><code>${dllFileName}</code> - mod version <code>${dllVersion}</code> is installed and enabled ${dllFileNameTopSection ? 'and listed in "Probable Call Stack"' : ''}</li>`;
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


//❗ DynDOLOD v3.0.34 Crash Issue Detected:
function analyzeDynDOLODv3034Issue(sections) {
    let insights = '';
    const dllFileName = 'DynDOLOD.DLL';
    const targetVersion = '3.0.34';
    
    // Check if bottomHalf contains DynDOLOD.DLL and version 3.0.34 on the same line
    const bottomHalfLines = sections.bottomHalf.split('\n');
    const hasDllAndVersion = bottomHalfLines.some(line => 
        line.toLowerCase().includes(dllFileName.toLowerCase()) && 
        line.includes(targetVersion)
    );
    
    // NEW: Check if topHalf contains "DynDOLOD::LargeREFRFix" (fallback trigger)
    const topHalfLower = sections.topHalf.toLowerCase();
    const hasLargeREFRFix = sections.fullLogFileLowerCase.includes('dyndolod::largerefrfix'); //TODO: fix sections.stack regex so sections.topHalf can be used instead
    //NOTE: this bug produces "{:08X}" int he stack which breaks the sections.stack regex. Should probably be fixed, but is a bug for another day.
    
    Utils.debuggingLog(['analyzeDynDOLODv3034Issue', 'diagnoses.js'], 'sections.stack:', sections.stack);
    Utils.debuggingLog(['analyzeDynDOLODv3034Issue', 'diagnoses.js'], 'hasLargeREFRFix:', hasLargeREFRFix);
    
    // Trigger the test if either condition is met
    if (hasDllAndVersion || hasLargeREFRFix) {
        // Check if topHalf contains both DynDOLOD.DLL.NG and DynDOLOD.esm
        const hasDllNG = topHalfLower.includes('dyndolod.dll.ng');
        const hasEsm = topHalfLower.includes('dyndolod.esm');
        Utils.debuggingLog(['analyzeDynDOLODv3034Issue', 'diagnoses.js'], 'hasDllNG:', hasDllNG);
        Utils.debuggingLog(['analyzeDynDOLODv3034Issue', 'diagnoses.js'], 'hasEsm:', hasEsm);
        
        if (hasDllNG && hasEsm) {
            // Build dynamic indicators list
            let indicatorsList = '';
            if (hasDllAndVersion) {
                indicatorsList += `<li><code>DynDOLOD.DLL</code> - version <code>3.0.34</code> detected in crash log</li>`;
            }
            if (hasLargeREFRFix) {
                indicatorsList += `<li><code>DynDOLOD::LargeREFRFix</code> - found in crash log</li>`;
            }
            if (hasDllNG) {
                indicatorsList += `<li><code>DynDOLOD.DLL.NG</code> - found in top section of crash log</li>`;
            }
            if (hasEsm) {
                indicatorsList += `<li><code>DynDOLOD.esm</code> - found in top section of crash log</li>`;
            }
            
             insights += `
            <li>❗ <b>DynDOLOD v3.0.34 Crash Issue Detected:</b> This version of DynDOLOD is suspected to have stability issues.
                <ol>
                    <li>If this crash repeats frequently, the only "fix" seems to be downgrading to the more stable version of DynDOLOD, <b>version 33</b> from <a href="https://www.nexusmods.com/skyrimspecialedition/mods/97720?tab=files" target="_blank">this page on NexusMods.com</a>. UPDATE: <b>version 36</b> also seems to address this issue without rerunning DynDOLOD or needing to change configs.</li>
                    <li><b>For Vortex Users:</b> After installing the old v33 (or new v36) version, then remove the current v34 to prevent conflicts. Then prioritize <code>DynDOLOD DLL NG and Scripts 3.00 (vAlpha-33)</code> to load <i>AFTER</i> its <code>DynDOLOD Resources SE 3.00 (vAlpha-56)</code> mod.</ii>
                    <li><b>For Advanced Users:</b> They're investigating this issue on <a href="https://stepmodifications.org/forum/topic/21092-crash/" target="_blank">this official thread</a>. There's also a test DLL there. If you want to contribute to that thread, please send the crashlog there along with other DynDOLOD logs: <a href="https://dyndolod.info/Official-DynDOLOD-Support-Forum#Post-Logs" target="_blank">Official DynDOLOD Support Forum</a></li>
                    <li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a>
                        <ul class="extraInfo" style="display:none">
                            ${indicatorsList}
                        </ul>
                    </li>
                </ol>
            </li>`;
        }
    }
    
    return insights;
}


//❗ Possible Visual C++ Runtime DLL Issues Detected:
function analyzeVCRuntimeIssue(sections) {
    let insights = '';
    
    // Validate input
    if (!sections?.firstLine) {
        console.warn('analyzeVCRuntimeIssue received invalid sections parameter: missing firstLine');
        return insights;
    }

    // Store toLowerCase() results for performance
    const firstLineLower = sections.firstLine.toLowerCase();
    const topHalfLower = sections.topHalf?.toLowerCase() || '';
    
    // Get matching VC Runtime indicators from first line
    const matchingVCCodes = crashIndicators.vcRuntimeIssues.codes.filter(
        ({ code }) => firstLineLower.includes(code.toLowerCase())
    );

    // Check for KERNELBASE.dll in first line and VC Runtime indicators in top half
    const hasKernelBase = firstLineLower.includes('kernelbase.dll');
    Utils.debuggingLog(['analyzeVCRuntimeIssue', 'diagnoses.js'], 'hasKernelBase:', hasKernelBase);

    const topHalfVCCodes = hasKernelBase ? crashIndicators.vcRuntimeIssues.codes.filter(
        ({ code }) => topHalfLower.includes(code.toLowerCase())
    ) : [];
    Utils.debuggingLog(['analyzeVCRuntimeIssue', 'diagnoses.js'], 'topHalfVCCodes:', topHalfVCCodes);

    // Proceed if we have either direct VC++ matches or KERNELBASE + VC++ combination
    if (matchingVCCodes.length >= 1 || (hasKernelBase && topHalfVCCodes.length >= 1)) {
        insights += `
        <li>❗ <b>Possible Visual C++ Runtime DLL Issue${(matchingVCCodes.length + topHalfVCCodes.length) > 1 ? 's' : ''} Detected:</b>
            <ol>
                <li>Consider reinstalling/updating your Visual C++ Redistributable
                    <ul>
                        <li>To prevent crashes caused by outdated or corrupted components, download and install the latest, compatible version of Visual C++ Redistributable (x64)package from <a href="https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist?view=msvc-170">Microsoft's official website</a>.</li>
                        <li>After installation, restart your system before launching the application again.</li>
                    </ul>
                <li>Try disabling, updating, and/or redownloading and reinstalling mods ${!Utils.isSkyrimPage ? 'you may have added to Nolvus' : ''} that appear in the 🔎<b>Files/Elements</b> section, especially SKSE plugins:
                    <ul>
                        <li><b>Start with SKSE plugins</b> (those ending in <code>.dll</code>) - these plugins rely on Visual C++ Runtime components, so while related crashes can sometimes be fixed by updating Visual C++ Redistributables, many issues may require checking the plugins themselves. They can usually be safely disabled in gradually-shrinking groups starting with 5-10 towards isolating issues (except for Engine Fixes, which should stay enabled)</li>
                        <li>Other ${!Utils.isSkyrimPage ? 'added ' : ''}<b>suspect mods</b> (and their dependencies) can also be temporarily disabled to test if they're causing the crash.</li>
                        <li>Generally either test with a new character, and/or avoid keeping saves made while testing with an existing character.</li>
                        <li><b>CAUTION:</b> When downloading and reinstalling mods, only use versions compatible with your Skyrim version and other mods.</li>
                        <li>After you've disabled and tested the mods that were found in the 🔎<b>Files/Elements</b> section, consider testing your other mods${!Utils.isSkyrimPage ? ' you have added to Nolvus.' : '.'}</li>
                    </ul>
                </li>
                <li>Mentioned indicator${(matchingVCCodes.length + (hasKernelBase ? 1 : 0)) > 1 ? 's' : ''} in the <b>first error line</b> of crash log${topHalfVCCodes.length ? ' and related DLLs found in the log' : ''}: <a href="#" class="toggleButton">⤵️ show more</a>
                    <ul class="extraInfo" style="display:none">`;
        
        // Add first line indicators
        if (hasKernelBase) {
            insights += `<li><code>KERNELBASE.dll</code> - Windows Kernel Base DLL</li>`;
        }
        matchingVCCodes.forEach(({ code, description }) => {
            insights += `<li><code>${code}</code> - ${description}</li>`;
        });
        
        // Add top half indicators if we found KERNELBASE
        if (hasKernelBase && topHalfVCCodes.length > 0) {
            topHalfVCCodes.forEach(({ code, description }) => {
                if (!matchingVCCodes.some(vc => vc.code === code)) { // Avoid duplicates
                    insights += `<li><code>${code}</code> - ${description} (found in crash log)</li>`;
                }
            });
        }
        
        insights += `
                    </ul>
                </li>
            </ol>
        </li>`;
    }

    return insights;
}




//❗ Probable Mesh Issue Detected:
// (seven related tests merged together)
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

        meshInsights += `Try comparing multiple crash logs, but if you see this message again with any of the same "Mentioned mesh files" (bottom bullet point) then investigate using these steps:
        <ol>
        <li>Identify problematic meshes/mods:
            <ul>
                <li>Check the list of mentioned meshes below and do a Windows file search in your mods folder for clues as to their source mod(s).</li>
                <li>Or try using one of these tools that can scan through all your mesh files and report issues:
                    <ul>
                        <li><a href="https://www.nexusmods.com/skyrim/mods/75916/">NifScan</a> which is a command line tool.</li>
                        <li><a href="https://www.nexusmods.com/newvegas/mods/67829">S'Lanter's NIF Helper Tool (SNIFF)</a> which is listed in Nexus under Fallout, but reportedly also works great for Skyrim, and has a graphical user interface, (GUI), so it's easier to use!</li>
                    </ul>
                </li>
            </ul>
        </li>
        <li>Fix mesh issues:
            <ul>
            <li>In some cases simply re-downloading and reinstalling the mod with a bad mesh, may fix the corrupted file and resolve the issue.</li>
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
                            <li>Check for version incompatibilities and conflicts between mods modifying NPCs or facial features.</li>
                        </ul>
                    </li>`;
                }
            if (hasSkeletonIssue) {
                meshInsights += `<li>For skeleton-related issues (involving <code>NiNode</code>), ensure a compatible skeleton mod is installed and not overwritten.</li>`;
            }
            meshInsights += `</ul>
            </li>`;
        }

        if (meshCodeIssues.length > 0) {
            meshInsights += `<li>Detected indicators  (more indicators often increases likelihood of causation): <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">`;
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
        
        meshInsights += '</li></ol>';
    }

    return meshInsights; //TODO: also return isHighPriority
}


//🎯 Dawnguard Horse Issue Detected: 
function analyzeDawnguardHorseIssue(sections) {
    let diagnosis = '';
    const dawnguardHorseIssue = sections.topHalf.includes("Skyrim Immersive Creatures") && sections.topHalf.includes("Dawnguard Horse")
        && (sections.topHalf.includes("Isran") || sections.topHalf.includes("Celann") );
    if (dawnguardHorseIssue) {
        diagnosis +=  `
        <li>🎯 <b>Dawnguard Horse Issue Detected:</b> This is a specific variant of NavMesh/Pathing Issues (see below). The Dawnguard Horse from Skyrim Immersive Creatures is a common example. You can fix the issue with the following steps:
        <ol>
            <li>Download and install <a href="https://www.nexusmods.com/skyrimspecialedition/mods/164" target="_blank">SSEEdit (xEdit)</a>.</li>
            <li>Open SSEEdit, enable "Skyrim Immersive Creatures" mod, and click "Open Plugins Selected."</li>
            <li>Once finished loading, search for Editor ID: <code>SIC_WERoad07</code> and delete this whole form ID.</li>
            <li>Save changes and close SSEEdit.</li>
            <li>Open an earlier save from before the NPCs spawned and play to verify no crashes.</li>
        </ol></li>`;
    }
    return diagnosis;
}


//❗ Probable NavMesh/Pathing Issue Detected:
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
                        <li>Some issues can be fixed by quitting to desktop, relaunching Skyrim and then loading an <b>older save</b></li>
                        <li>Sometimes asking <b>followers</b> to wait behind can get you past a NavMesh Pathing glitch. Some follower mods and/or follower frameworks will allow you to teleport your follower to you afterwards to rejoin your party.</li>
                        <li>If using a <b>horse</b> or mount, command mount to wait before fast traveling</li>
                        <li>If using a horse/mount and a <b>follower framework</b> (like Nether's Follower Framework), try disabling horse followers in its Mod Configuration Menu (MCM)</li>
                        ${!sections.hasNolvusV6 ? '<li>Consider trying the <a href="https://www.nexusmods.com/skyrimspecialedition/mods/52641">Navigator - Navmesh Fixes</a> mod (be sure to read notes on where to insert it in your load order)</li> ' : ''}
                    </ul>
                </li> 
                <li>Advanced Troubleshooting:
                    <ul>
                        <li>For persistent issues with specific NPCs or creatures unable to find a path, consider removing the problematic entity from your save file. Review the 🔎<b>Files/Elements</b> section of this report to identify relevant NPCs or creatures, then search for their occurrences in the crash log to find their FormIDs. FormIDs starting with either "0xFF" or "FF" indicate dynamically generated entities—these are safer to remove because they are created during gameplay rather than being permanent game assets.  While removing these entities can provide a temporary solution to allow your save file to load, be aware that the underlying issue may recur if the root cause isn't addressed. Such entities can be removed using <a href="https://www.nexusmods.com/skyrim/mods/76776">FallrimTools ReSaver</a> with minimal risk since the game should be able to regenerate them if needed. Always create a backup of your save file first.
                            <ul>
                                <li>After loading your save in ReSaver, use the search bar to locate the specific FF FormID you found in the crash log. Delete the corresponding entry, then save your game under a new filename. This should allow the problematic save to load, hopefully giving you an opportunity to bypass the issue, and/or investigate and address the underlying conflict</li>
                            </ul>
                        </li>
                        <li>Consider disabling relevant location-modifying mods to identify conflicts. Also consider disabling mods that show up in the "Files/Elements" outline (higher up in this report).</li>
                        <li>Consider using <a href = "https://www.nexusmods.com/skyrimspecialedition/mods/136456">Debug Menu - In-Game Navmesh Viewer and More</a> to isolate issues and request fixes/patches from mod author(s)</li>
                        <li>Additional advanced ideas and information are included in <a href="https://www.reddit.com/r/skyrimmods/comments/1d0r0f0/reading_crash_logs/##:~:text=These%20are%20Navmesh%20errors">Krispyroll's Reading Crash Logs Guide</a></li> 
                    </ul>
                </li>`;
                
        pathingInsights += `<li>Detected indicators (more indicators often increases likelihood of causation): <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">`;
        pathingIssueIndicators.forEach(({ code, description }) => {
            pathingInsights += `<li><code>${code}</code> - ${description}</li>`;
        });
        
        pathingInsights += '</ul></li></ol></li>';
    }
    return pathingInsights; // TODO: also return isHighPriority
}



//❗ Probable Animation Issue Detected:
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
            <li>For more detailed analysis, use tools like <a href="https://www.nexusmods.com/skyrimspecialedition/mods/164">SSEEdit (xEdit)</a> to examine animation-related records in your mods.</li>
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
            animationInsights += `<li>Detected indicators  (more indicators often increases likelihood of causation): <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">`;
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


//❓ Possible Texture Issue Indicators Found:
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
            <li><b>Compare multiple crash logs:</b>, If you see this message again with any of the same "Mentioned texture files" then continue investigating using the steps below...
            <li>Search for assents in MO2, or do a Windows file search in your mods folder for clues as to their source mod(s).</li>
            <li>Temporarily disable suspect texture mods (or temporarily hide or remove their suspected texture files) one at a time to isolate the problem.</li>
            <li>Pay special attention to mods affecting the area where the crash occurred.</li>
            </ul>
        </li>

        <li>Fix identified issues:
            <ul>
            <li>Once you've identified the problematic mod, try re-downloading the newest version and reinstalling.</li>
            <li>If re-downloading and reinstalling doesn't help, try using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/23316">Cathedral Assets Optimizer (CAO)</a> to repair any damaged textures.</li>
            <li>Check your mod load order to prevent texture conflicts. Ensure texture mods load after any mods altering the same textures.</li>
            ${Utils.LootListItemIfSkyrim}
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
            textureInsights += `<li>Detected indicators  (more indicators often increases likelihood of causation): <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">`;
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

        textureInsights += '</li></ol></li>';
    }

    return textureInsights; //TODO: also return isHighPriority
}





//❗ Probable Hair Mod Issue Detected: 
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



//❓ BGSSaveLoadManager Issue Detected: 
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
            <li>💾 Consider using save cleaning tools to remove orphaned scripts and other potential corruption. <a href="https://www.nexusmods.com/skyrim/mods/76776">FallrimTools ReSaver</a> can sometimes fix corrupted save files. See also these <a href="https://www.reddit.com/r/skyrimmods/s/fbMRv343vm">instructions by Krispyroll</a> and more information in <a href="https://www.reddit.com/r/skyrimmods/comments/1d0r0f0/reading_crash_logs/##:~:text=Resaver">Krispyroll's Reading Crash Logs Guide</a>. NOTE: Always keep backups of your saves before attempting fixes or using cleaning tools.</li>
            <li><b>Advanced Users</b> can try using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/164">SSEEdit (xEdit)</a> and <a href="https://www.nexusmods.com/skyrimspecialedition/mods/68889">Find dangerous ESLs - xEdit script</a> for isolating ESL plugins that may potentially corrupt game saves and cause crashes.</a>
            <li>🛡️ Consider following <b>Jerilith's 2025 Skyrim Safe-Save-Guide [sexy free edition]</b> (quoted below). Not adhering to these guidelines over time may contribute to broken save files. Note: The necessity of some of these rules has been debated; however, many believe these rules can help prevent issues when other causes are unknown, especially with large modlists and 500+ hour playthroughs.
            <ol>
                <li>Do not Save in combat.</li>
                <li>Do not use <i>Load</i> - Do not let the game auto-load on death -> Exit the whole game (not just to main menu), and relaunch.</li>
                <li>Do not use Auto Saves</li>
                <li>Be Cautious when Adding Mods, and more so when Removing Mods.</li>
                <li>When entering a new area, wait several seconds before saving to allow scripts and information to load completely.</li>
                <li>Maintain and Manage your save files, keep several and or revolving saves of <i>at least</i> 5-10.</li>
                <li>Source: Details and related resource links available at <a href="https://www.reddit.com/r/Nolvus/comments/1ka74em/jeriliths_2025_skyrim_safesaveguide_sexy_free/">this reposting</a></li>
            </ol></li>
            <li>Regarding the Safe Save Guide (above), there are a few <b>mods you can add</b> to minimize risk if you prefer not to always quit to the desktop after dying (or before reloading): <a href="https://www.nexusmods.com/skyrimspecialedition/mods/88219">Clean Save Auto Reloader</a>, <a href="https://www.nexusmods.com/skyrimspecialedition/mods/85565">SaveUnbaker</a>, and an alternate death mod. See Orionis' <a href="https://docs.google.com/document/d/1RSCzBUyE0vqZRAtjd4YL2hHrKzf4Q1rgCH0zrjEr-qY/mobilebasic#heading=h.u2ukim1kti09">Safe Save Helpers - a Nolvus Guide</a>. Although this guide's original context is Nolvus, most of the information should be broadly applicable.</li>
            ${!Utils.isSkyrimPage ? checkSaveFileSize : ''}
        </ol></li>`;
    }
    return insights;
}


//🎯 DLAA Incompatibility + Windows 24H2 KERNELBASE Crash Detected:
function analyzeWin24H2UpscalerCrash(sections) {
    let insights = '';
    
    if (sections.firstLine.toLowerCase().includes('KERNELBASE.dll'.toLowerCase()) && 
        sections.probableCallstack.includes('SkyrimUpscaler.dll')) {
        
            insights += `<li>🎯 <b>DLAA Incompatibility + Windows 24H2 KERNELBASE Crash Detected:</b> Windows version 24H2 has made certain DLAA mods incompatible. <b>Puredark</b>, the author of some popular Upscaler mods (both free and paid versions), has reportedly fixed the issue in his newest, paid versions. This issue affects most users of his older versions, but not all (likely depending on your GPU). Here are the available solutions:

            <ol>
                <li><strong>Solution 1: Try Alternative Mods</strong>
                    <ol>
                        <li><b>Recommended:</b> For competitive image quality (and often regarded as better image quality than TAA), switch to this newer and easier-to-configure DLAA mod from <b>doodlum</b>: <a href="https://www.nexusmods.com/skyrimspecialedition/mods/130669">ENB Anti-Aliasing - AMD FSR 3.1 - NVIDIA DLAA</a>.</li>
                        <li>Or alternatively, try Puredark's newer versions: either his latest paid versions (which include the fix) or experiment with different free versions from <a href="https://www.nexusmods.com/skyrimspecialedition/mods/80343">Skyrim Upscaler - DLSS FSR2 XeSS</a>.</li>
                    </ol>
                </li>
                <li><strong>Solution 2: Disable DLAA and Use TAA Instead</strong>
                    <ol>
                        <li>In <strong>Mod Organizer 2</strong> (MO2), towards the top find section "1.1 SKSE PLUGINS" (or whatever location you may have installed your Upscaler mod(s) into).</li>
                        <li>Open the section, and towards the bottom find <code>Upscaler Base Plugin</code> and <code>Skyrim Upscaler</code>. Disable them both. NOTE: paid versions may converge both plugins into one.</li>
                        <li>Then in the top navigation pane of MO2 click on the puzzle icon.</li>
                        <li>Select "INI Editor".</li>
                        <li>Click on <code>skyrimprefs.ini</code> and click inside of the text box.</li>
                        <li>On your keyboard, press <strong>CTRL+F</strong></li>
                        <li>Search for <code>bUseTAA</code> and change the value to match <code>bUseTAA=1</code></li>
                        <li><a href="https://phostwood.github.io/crash-analyzer/images/DLAA-Win24H2-Fix.webp">View step-by-step screenshot guide</a>.</li>
                    </ol>
                </li>
            </ol>
        </li>`;
    }
    
    return insights;
}

//🎯 JContainers Crash Detected
function analyzeJContainersCrash(sections) {
    if (sections.firstLine.toLowerCase().includes('JContainers64.dll'.toLowerCase())
            || (sections.firstLine.toLowerCase().includes('KERNELBASE.dll'.toLowerCase())
                && (sections.probableCallstack.toLowerCase().includes('JContainers64.dll'.toLowerCase())
                    || sections.probableCallstack.toLowerCase().includes('CustomSkills.dll'.toLowerCase())
                    //ANY OTHER INDICATORS or LOCATIONS?
                )
            )
        ) {
        
        let nolvusSpecificContent = '';
        
        if (sections.hasNolvusV6 || sections.hasNolvusV5) {
            nolvusSpecificContent = `<li><b>For Nolvus players</b>: JContainers may need patched. Go to <a href="https://www.nexusmods.com/skyrimspecialedition/mods/108591?tab=files&file_id=458596">Discrepancy's patch settings hub</a> and add the <b>JContainers Crash Workaround</b> mod (from the "Files" section) into Mod Organizer 2 (MO2). If you would like guidance on modding/patching Nolvus, please watch this <a href="https://youtu.be/YOvug9KP5L4">brief tutorial video</a> for step-by-step instructions.</li>`;
        }
        
        let customSkillsMenuContent = '';
        if (sections.hasNolvusV6) {
            customSkillsMenuContent = `<li><b>For Nolvus v6 players</b>: A new mod has been released that updates compatibility: <a href="https://www.nexusmods.com/skyrimspecialedition/mods/140833">Custom Skills Menu - JContainers Crash Workaround</a>. In MO2, load this after Discrepancy's fix (see abvove)</li>`;
        } else if (!sections.hasNolvusV5){
            customSkillsMenuContent = `<li>For users of the <b>Custom Skills Menu</b> mod: A new mod has been released specifically for this issue: <a href="https://www.nexusmods.com/skyrimspecialedition/mods/140833">Custom Skills Menu - JContainers Crash Workaround</a>. Be sure to read instructions on usage.</li>`;
        }
        
        return `<li>🎯 <b>JContainers Crash Detected:</b> Usually, this issue stems from one of these causes:<ol>
            ${nolvusSpecificContent}
            ${customSkillsMenuContent}
            <li>Windows <b>permissions</b> may have become overly restrictive and are blocking access to necessary mod storage. The usual solution is to reset your file permissions. See <a href="https://www.thewindowsclub.com/how-to-reset-file-folder-permissions-to-default-in-windows-10">How to reset all User Permissions to default in Windows 11/10</a>, or seek assistance from the ${Utils.NolvusOrSkyrimText} community. Or, an easier <b>workaround</b> for this issue is to <a href = "https://support.microsoft.com/en-us/windows/create-a-local-user-or-administrator-account-in-windows-20de74e0-ac7f-3502-a866-32915af2a34d#WindowsVersion=Windows_11">create a new Windows User</a> and create a new ${Utils.NolvusOrSkyrimText} save (playthrough) from the new user.</li>
            <li>Storage files (JContainer's .json files) may have become <b>corrupted/broken.</b> These files often reside in your \`..\\Documents\\My Games\\Skyrim Special Edition\\JCUser\` folder, but can be located in mod-specific locations. This issue is especially common if you have manually edited a .json file. After identifying the specific file, either manually repair it, revert the file to a backup, or delete it, allowing the accessing mod(s) to create a new one. Other mods mentioned in the crash log may help to identify the specific storage file, or seek assistance from the ${Utils.NolvusOrSkyrimText} community.</li>
            </ol></li>`;
    }
    return null;
}


// Check for KERNELBASE Crash EXCLUDING JContainers and JSON parse error
function checkKernelbaseCrash(sections, Utils, jContainersCrash, win24H2UpscalerCrash, isDiagnosesSection = false) {
    let diagnoses = '';

    // Check for KERNELBASE Crash excluding JContainers and JSON parse error
    if (sections.firstLine.toLowerCase().includes('KERNELBASE.dll'.toLowerCase()) && 
        !jContainersCrash && 
        !win24H2UpscalerCrash &&
        !sections.topHalf.includes('json.exception.parse_error')) {
    
        if (!Utils.isSkyrimPage && isDiagnosesSection) { // SHORT VERSION - Only for Nolvus in diagnoses section
            diagnoses += `
                <li>❗ <b>KERNELBASE Crash Detected:</b> This rare issue could be related to a specific added mod, or to hardware or a system-wide issue. Here are some steps you can try:
                    <ol>
                        <li><b>First</b>, try to reproduce the crash after rebooting your PC and playing the game again. If this was a one-time occurrence, you probably don't need to follow the more intensive troubleshooting steps below.</li>
                        <li>Review the rest of the advice in this report (above and below), and see if there are strong indications of any better-isolated isolated issue. Sometimes other mods/issues can cause a "KERNELBASE Crash".</li>
                        <li>${verifyWindowsPageFileListItem}</li>
                        <li>Check with the <b>Nolvus community</b> to see if others are encountering this issue due to a new Windows update or the like.</li>
                        <li>You can restore the original sorting of all vanilla Nolvus mods using the <b>Apply Order</b> button in the Nolvus Dashboard. For more information and a screenshot, see this r/Nolvus post <a href="https://www.reddit.com/r/Nolvus/comments/1kp1lrw/guide_using_the_apply_order_button_in_nolvus/">How To: "Apply Order" button usage in the Nolvus Dashboard</a>.</li>
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
                        <li><b>First</b>, try to reproduce the crash after rebooting your PC and playing the game again. If this was a one-time occurrence, you probably don't need to follow the more intensive troubleshooting steps below.</li>
                        <li>Review the rest of the advice in this report (above and below), and see if there are strong indications of any better-isolated isolated issue. Sometimes other mods/issues can cause a "KERNELBASE Crash".</li>

                        <li>${verifyWindowsPageFileListItem}</li>

                        <li>Check with the <b>${!Utils.isSkyrimPage ? 'Nolvus community' : 'Skyrim modding community'}</b> to see if others are encountering this issue due to a new Windows update or the like.</li>

                        ${!Utils.isSkyrimPage ? `
                        <li>You can restore the original sorting of all vanilla Nolvus mods using the <b>Apply Order</b> button in the Nolvus Dashboard. For more information and a screenshot, see this r/Nolvus post <a href="https://www.reddit.com/r/Nolvus/comments/1kp1lrw/guide_using_the_apply_order_button_in_nolvus/">How To: "Apply Order" button usage in the Nolvus Dashboard</a>.</li>
                        ` : ''}
                        
                        ${!Utils.isSkyrimPage ? `
                        <li><b>Reinstall Nolvus</b> to ensure the installation is not corrupted. Make sure to back up any important data before doing this. For detailed instructions, see this <a href="https://docs.google.com/document/d/1R_AVeneeCiqs0XGYzggXx34v3Ufq5eUHNoCHo3QE-G8/edit">guide</a>.</li>
                        ` : ''}


                        <li>Try disabling, updating, or redownloading and reinstalling mods ${!Utils.isSkyrimPage ? 'you may have added to Nolvus' : ''} that appear in the 🔎<b>Files/Elements</b> section, especially SKSE plugins:
                            <ul>
                                <li><b>Start with SKSE plugins</b> (those ending in <code>.dll</code>) as they're particularly sensitive to Windows updates and system changes. They can be usually be safely disabled in groups of 5-10 to identify issues (except for Engine Fixes, which should stay enabled).</li>
                                <li>Other ${!Utils.isSkyrimPage ? 'added ' : ''}<b>suspect mods</b> (and their dependencies) can also be temporarily disabled to test if they're causing the crash.</li>
                                <li><b>CAUTION:</b> When downloading and reinstalling mods, only use versions compatible with your Skyrim version and other mods.</li>
                                <li>If you see <code>VCRUNTIME140.dll</code> in the report, download and install the latest version for your hardware from <a href="https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist?view=msvc-170">Microsoft Visual C++ Redistributable (x64)</a>.</li>
                            </ul>
                        </li>


                        <li><b>Run DISM and SFC scans:</b> Run built-in Windows command line "tools that can repair corrupted or missing system files and restore the health of your computer." See instructions and screenshots in step 1 of <a href="Kernelbase.dll: What It Is & How To Fix Errors">Kernelbase.dll: What It Is & How To Fix Errors</a>.
                            <ul>
                                <li>As administrator, run these commands:
                                    <ol>
                                        <li><code>dism /online /cleanup-image /restorehealth</code>
                                            <ul>
                                                <li>CAUTION: in some cases it is best to have all important files backed up before running this command</li>
                                            </ul>
                                        </li>
                                        <li><code>sfc /scannow</code></li>
                                    </ol>
                                </li>
                                <li>Reboot your PC and play. If it crashes again, check your new crash log.</li>
                            </ul>
                        </li>

                        <li>Check the <b>Windows Event Log</b> for any related issues. You can do this by opening the <b>Event Viewer</b> (search for it in the Start Menu), then navigate to Windows Logs > Application. Look for any recent errors that might be related to your issue. For detailed instructions, see this <a href="https://support.microsoft.com/en-us/windows/open-event-viewer-17d427d2-43d6-5e01-8535-1fc570ea8a14">Microsoft guide</a>.</li>
                        
                        <li>Ensure your <b>Windows is up to date</b>, as well as any drivers and applicable BIOS updates. You can check for Microsoft updates by going to Settings > Update & Security > Windows Update. Many motherboards (or PC manufacturers) will also have important <b>BIOS</b> firmware updates at their websites, and/or accesible from their own update application.</li>
                        
                        <li>Run a full system <b>scan for any viruses</b> or malware. We generally recommend using the built-in Windows Security for this.</li>
                        
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



//❗Missing SSE Engine Fixes:
function analyzeEngineFixes(sections) {
    let insights = '';
    const hasMods = sections.bottomHalf.split('\n').filter(line => line.trim() !== '').length > 10;
    const hasWheelerAndIs1170 = (sections.hasSkyrimAE1170 && sections.bottomHalf.toLowerCase().includes('wheeler.dll'.toLowerCase()));
    
    // Check if Engine Fixes is missing
    if (hasMods && !sections.bottomHalf.toLowerCase().includes('EngineFixes.dll'.toLowerCase()) && !sections.bottomHalf.toLowerCase().includes('EngineFixesVR.dll'.toLowerCase())) {
        insights += `
        <li>${hasWheelerAndIs1170 ? '🎯' : '❗'} <b>Missing SSE Engine Fixes:</b> This foundational mod is usually essential for a stable modded game.
            <ol>
                <li><strong>⚠️ Warnings:</strong>
                    <ul>
                        <li>Your save file could become permanently unplayable without SSE Engine Fixes installed</li>
                        <li>SSE Engine Fixes is a foundational mod required by over 100+ other mods on Nexus</li>
                        <li>It is also considered an <a href="https://www.reddit.com/r/skyrimmods/wiki/essential_mods/#wiki_essential_bugfixes">Essential Bugfix</a> by r/SkyrimMods wiki authors</li>
                    </ul>
                </li>
                
                <li><strong>Required Steps:</strong>
                    <ul>
                        ${reinstallEngineFixes}
                    </ul>
                </li>

                <li><strong>Important Notes:</strong>
                    <ul>
                        <li>SSE Engine Fixes is essential for most Skyrim modlists</li>
                        <li>This mod fixes numerous engine-level bugs and is often important for game stability</li>
                        ${hasWheelerAndIs1170 ? 
                            `<li>🎯<strong>Wheeler.dll Detected:</strong> Wheeler.dll v1 specifically has been confirmed to crash without SSE Engine Fixes on Skyrim 1.6.1170</li>` : 
                            ''}
                        <li>If you experience crashes with <code>tbb.dll</code>, reinstall SSE Engine Fixes completely</li>
                    </ul>
                </li>
            </ol>
        </li>`;
    }
    
    return insights;
}



//❗Critical First-Line Error Detected:
function analyzeFirstLine(sections) {
    let insights = '';
    const ignoreFiles = ['Dawnguard.esm', 'Dragonborn.esm', 'null', 'null)', 'SkyrimSE.exe', 'skyrim.esm', 'SkyrimVR.exe'];
    
    // Extract filename from sections.firstLine (actual location can vary between log types) if it exists
    const firstLine = sections.firstLine || '';
    const fileMatch = firstLine.match(/\b([^\/\\\s]+\.(?:esm|exe|esp|esl|dll|pex|skse|skse64))\b/i);
    const detectedFile = fileMatch ? fileMatch[1] : null;
    
    if (detectedFile && !ignoreFiles.includes(detectedFile)) {
        insights += `
        <li>❗ <b>Critical First-Line Error Detected:</b> <code>${detectedFile}</code>
            <ol>
                <li>Skim other sections of this report (above and below) for any more-specific information about <code>${detectedFile}</code>. (Scroll down to the bottom of the page to ensure you've reviewed everything.)</li>
                <li>Make sure the mod that contains <code>${detectedFile}</code> is enabled (Vortex especially sometimes disables them). If already enabled, consider redownloading and carefully reinstalling the mod, as this may be a quickest fix.</li>
                <li><strong>What This Means:</strong>
                    <ul>
                        <li>The file <code>${detectedFile}</code> is directly involved in the crash sequence</li>
                        <li>While this file is related to the crash, it may not be the root cause</li>
                        <li>This type of error often indicates missing dependencies, version mismatches, or incompatible files</li>
                    </ul>
                </li>
                
                <li><strong>SKSE Plugin Baseline Requirements:</strong>
                    <ul>
                        <li>Ensure you have the correct <a href="https://www.nexusmods.com/skyrimspecialedition/mods/30379">Skyrim Script Extender (SKSE64)</a> version for your game version, and are launching through SKSE</li>
                        <li>Ensure you have the correct <a href="https://www.nexusmods.com/skyrimspecialedition/mods/32444">Address Library for SKSE Plugins</a> version matching your game version</li>
                        <li>Ensure you have installed <a href="https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist?view=msvc-170">Microsoft Visual C++ Redistributable package (x64)</a> - this is frequently missed but critical</li>
                    </ul>
                </li>
                
                <li><strong>Recommended Troubleshooting Steps:</strong>
                    <ol>
                        <li>As a quick optional test, consider disabling the mod and any mods that depend on it. NOTE: this may require creating a new character for a successful test.</li>
                        <li>Confirm the mod is compatible with your Skyrim version</li>
                        <li>Refer to the plugin's mod page, FAQ, or Bug Report section to see if the crash is a known issue</li>
                        <li>Check if a mod update is available</li>
                        <li>Verify all listed required dependencies are installed and enabled</li>
                        <li>Check version requirements of other mods that interact with it</li>
                        <li>Carefully review the installation instructions for the mod that contains <code>${detectedFile}</code>, and try a clean reinstall of the plugin with default settings - improper installation or modified settings can cause crashes</li>
                        <li>Check if the problem involves interaction between a DLL and other mods - examine the first 4-5 error lines of the crash log to identify potential mod conflicts. Also review any <code>.dll</code> files in the 🔎 <b>Files/Elements</b> of this report (below)</li>
                        <li>Ask the Skyrim Modding Community about known compatibility issues</li>
                        <li>Some first-line errors can be resolved by verifying game files through Steam</li>
                    </ol>
                </li>
                        
                <li><strong>Additional Considerations:</strong>
                    <ul>
                        <li>For SKSE plugins (<code>.dll</code> files), mod organizers won't show conflicts or requirements - you must rely on the mod author's documentation</li>
                        <li>Note that many (most?) SKSE plugins will show an error popup (white box from Address Library) before the game starts if they're for the wrong version</li>
                        <li>First-line errors are usually reproducible and not random</li>
                        <li>The error might be caused by an interaction between mods rather than a single file</li>
                    </ul>
                </li>
            </ol>
        </li>`;
    }
    
    return insights;
}


//🎯.STRINGS Crash Detected:
//OLD METHOD: if (R14StringsRegex.test(sections.topHalf)) {
function analyzeStringsCrash(sections) {
    let insights = '';
    let hasPrimaryIndicator = sections.topThird.toLowerCase().includes('.STRINGS'.toLowerCase());
    let hasSecondaryIndicators = sections.topQuarter.toLowerCase().includes('BGSStoryManagerBranchNode'.toLowerCase())
        && sections.topQuarter.toLowerCase().includes('PlayerCharacter'.toLowerCase());
    if (hasPrimaryIndicator && hasSecondaryIndicators) {
        insights += `<li>🎯 <b>.STRINGS Crash Detected:</b> This error typically occurs when there is a unique or non-standard character in the <code>sLanguage</code> line of your <b>skyrim.ini</b> file. To resolve this issue:<ol>
            <li>Locate your <b>skyrim.ini</b> file.</li>
            <li>Optionally, make a quick backup copy of this file and store it outside your ${Utils.SkyrimOrNolvusText} installation.</li>
            <li>Open the original file for editing, and locate the line that reads <code>sLanguage=ENGLISH</code>.</li>
            <li>Ensure that there are no unique characters or typos in this line. It should only contain standard text.</li>
            <li>Save the changes and restart ${Utils.SkyrimOrNolvusText} to see if the issue has been resolved.</li>
            <li>See <a href="https://raw.githubusercontent.com/Phostwood/crash-analyzer/refs/heads/main/images/corruptstringsfixtutorial.png">screenshot tutorial</a> by Discrepancy using Mod Organizer 2 (MO2).
            <li>More information and troubleshooting tips under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-1">.STRINGS Crash</a/>.</li>
            <li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a>
                <ul class="extraInfo" style="display:none">
                    <li><code>.STRINGS</code> - detected in top third of the log (<i>above</i> the Stack section)</li>
                    <li><code>'BGSStoryManagerBranchNode'</code> - detected in top quarter of the log  (<i>above</i> the Registers section)</li>
                    <li><code>'PlayerCharacter'</code> - detected in top quarter of the log (<i>above</i> the Registers section)</li>
                </ul>
            </li>
            </ol></li>`;
    }
    return insights;
}




//❓No highest-confidence crash indicators detected.
function generateNoCrashDetectedMessage() {
    let diagnoses = '<li>❓ <b>No highest-confidence crash indicators detected.</b><ul>';

    if (Utils.isSkyrimPage) {
        diagnoses += `
        <li>❗ <b>⬇️ SCROLL DOWN ⬇️</b> and review the <b>Advanced Users</b> section of this report for more crash indications that may still be relevant. Tip: many indicators in the Advanced Users section become more significant when they show up in multiple crash logs.</li>
        <li><b>General recommendations</b> which can help solve/prevent many crash types: <a href="#" class="toggleButton">⤵️ show more</a>
            <ol  class="extraInfoOL" style="display:none">
                <li>💡Easy steps:
                    <ul>
                        <li>Always try the classic computer solution - <b>restart your PC</b>: This clears memory and resolves many system-level issues, especially after extended gaming sessions. It's surprising how many issues this old IT tip still fixes...</li>
                        <li>If one save won't load, quit to the desktop, relaunch Skyrim and try to <b>load an older save</b>.</li>
                        <li>Sometimes it can help to <b>separate from your followers</b> to get past a crash point. Ask NPC and pet and horse followers to "wait" at a safe location, away from the crash-prone loading area (cell). This reduces script load and rendering complexities in crash-prone areas. This can be especially helpful during visually busy scenes like combat, and also with crashes that occur when loading into a new area. Afterwards, return to collect your followers once you're past the problematic spot. Alternatively, many follower frameworks will also allow teleporting companions back once you are past the crash-prone segment.</li> 
                        <li>${verifyWindowsPageFileListItem}</li>
                        <li>Maintain <a href="https://computercity.com/hardware/storage/how-much-space-should-i-leave-on-my-ssd">at least 10-20% free space</a> on your SSD for optimal performance.</li>
                        <li>Return any <b>overclocked hardware</b> (including RAM using XMP or AMD EXPO) to stock speeds.</li>
                    </ul>
                </li>
                <li>🔧Verify that you have already correctly installed and configured <b>SSE Engine Fixes</b>: <a href="#" class="toggleButton">⤵️ show more</a>
                    <ul class="extraInfo" style="display:none">
                        ${reinstallEngineFixes}
                    </ul>
                </li>
                <li>Towards isolating the cause, try individually disabling any mods listed in the "🔎 <b>Files/Elements</b>" section of this report (see below). Be mindful of any dependencies when doing so. Generally either test with a new character, and/or avoid saving while testing with an existing character.</li>
                <li>Also, review and install any missing <a href="https://www.reddit.com/r/skyrimmods/wiki/essential_mods/#wiki_essential_bugfixes">Essential Bugfixes</a> applicable to your modlist</li>
                <li>Check your <b>load order</b> against <a href="https://www.reddit.com/r/skyrimmods/wiki/begin2/">r/SkyrimMod's Beginner's Guide</a> guidelines</li>
                <li>${Utils.LootIfSkyrim}</li>
                <li><b>If you haven't already</b>, share your logs with <a href="https://www.reddit.com/r/skyrimmods/">r/SkyrimMods</a>. Share multiple logs (using <a href="http://www.pastebin.com">www.pastebin.com</a>) when possible and mention in your post that you've already used Phostwood's analyzer and followed its recommendations. The manual crash log reading gurus there can catch some things that automated analyzers will never be able to. This tool only aims to help with 70 to 90% of human-solvable crash logs...</li>
                <li><b>As a last resort:</b> Try disabling groups of mods at a time (being mindful of masters and dependencies) until the crash stops. While tedious, this can help isolate almost any problematic mod combinations.</li>
            </ul></li>`;
    } else {
        //NOLVUS version:
        diagnoses += `
                <li>❗ <b>But first</b>, there's a lot more to this report than just this top section! <b>⬇️ SCROLL DOWN ⬇️</b> and review the <b>Advanced Users</b> section of this report for more crash indications that might apply. NOTE: If you have added or subtracted any mods to/from Nolvus, then you need to consider yourself an "Advanced User". Tip: many indicators in the Advanced Users section become more significant when they show up in multiple crash logs.</li>
                <li><b>General recommendations</b> which can help solve/prevent many crash types:<a href="#" class="toggleButton">⤵️ show more</a>
                    <ol  class="extraInfoOL" style="display:none">
                        <li>💡Easy steps:
                            <ul>
                                <li>Always try the classic computer solution - <b>restart your PC</b>: This clears memory and resolves many system-level issues, especially after extended gaming sessions. It's surprising how many issues this old IT tip still fixes...</li>
                                <li>If one save won't load, quit to the desktop, relaunch Skyrim and try to <b>load an older save</b>.</li>
                                <li>Sometimes it can help to <b>separate from your followers</b> to get past a crash point. Ask NPC and pet and horse followers to "wait" at a safe location, away from the crash-prone loading area (cell). This reduces script load and rendering complexities in crash-prone areas. This can be especially helpful during visually busy scenes like combat, and also with crashes that occur when loading into a new area. Afterwards, return to collect your followers once you're past the problematic spot. Alternatively, many follower frameworks will also allow teleporting companions back once you are past the crash-prone segment.</li> 
                                <li>${verifyWindowsPageFileListItem}</li>
                                <li>Maintain <a href="https://computercity.com/hardware/storage/how-much-space-should-i-leave-on-my-ssd">at least 10-20% free space</a> on your SSD for optimal performance.</li>
                                <li>Return any <b>overclocked hardware</b> (including RAM using XMP or AMD EXPO) to stock speeds.</li>
                                <li>Review saving guidelines at <a href="https://www.reddit.com/r/Nolvus/comments/1ka74em/jeriliths_2025_skyrim_safesaveguide_sexy_free/">Jerilith's 2025 Skyrim Safe-Save-Guide [sexy free edition]</a></li> as following these guidelines may help minimize late-game issues with loading save files.</li>
                            </ul>
                        </li>
                        <li>If using custom mods, check the <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-7">Load Order Crash</a> guide</li>
                        <li><b>If you've customized Nolvus:</b> Towards isolating the cause, try individually disabling any <b>mods that you have added to Nolvus</b>, starting with ones listed in the "🔎 Files/Elements" section of this report (see Advanced Users portion). Then try disabling a few of these mods a few at a time (being mindful of masters and dependencies) until the crash stops. While tedious, this can help isolate problematic mod combinations</li>
                    </ol>
                </li>
                <li>If issues persist, seek help at:
                    <ul>
                        <li><a href="https://www.reddit.com/r/Nolvus/">r/Nolvus</a></li>
                        <li><a href="https://discord.gg/Zkh5PwD">Nolvus Discord</a></li>
                    </ul>
                </li>`;        
    }

    diagnoses += '</ul></li>';
    return diagnoses;
}



//Overlays Issue/Warning
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









//❓Animation Loader/Behavior Engine Issue Detected
function analyzeAnimationLoaderIssues(sections) {
    let loaderInsights = '';

    function findLoaderCodeIssues(sections) {
        return crashIndicators.animationLoaderIssues.codes.filter(({ code }) =>
            sections.topHalf.toLowerCase().includes(code.toLowerCase())
        );
    }

    const loaderCodeIssues = findLoaderCodeIssues(sections);
    Utils.debuggingLog(['analyzeAnimationLoaderIssues', 'analyzeLog.js'], 'loaderCodeIssues:', loaderCodeIssues);

    if (loaderCodeIssues.length > 0) {
        loaderInsights += `<li>❓ <b>Possible Animation Loader/Behavior Engine Issue Detected:</b> To fix this, please follow these steps:
        <ol>
        <li>Regenerate/patch your animations using your behavior engine:
            <ul>
                <li>General requirements for behavior engines:
                    <ul>
                        <li>Clear the behavior engine's cache before regenerating</li>
                        <li>Check/enable all relevant boxes/options to generate the correct files for your installed mods</li>
                    </ul>
                </li>
                <li>If using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/3038">FNIS</a>: Run GenerateFNISforUsers.exe</li>
                <li>If using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/60033">Nemesis</a>: Run Nemesis Unlimited Behavior Engine
                    <ul>
                        <li>reference: <a href="https://www.reddit.com/r/skyrimmods/comments/t2rk34/nemesis_pro_tip/">guide to clearing Nemesis cache</a></li>
                        <li>reference: <a href="https://www.nolvus.net/guide/asc/output/nemesis">example instructions from Nolvus</a> (with numerous screenshots)</li>
                    </ul>
                </li>
                <li>If using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/133232">Pandora</a>: Run Pandora Behavior Engine</li>
            </ul>
        </li>
        
        <li>If regeneration fails:
            <ul>
            <li>Consider running the behavior engine as Administrator</li>
            <li>Check if any animation mods were recently added or updated</li>
            <li>When disabling animation mods for testing, remember to run your behavior engine after each change to properly update animations (otherwise you may see T-posing or other animation issues)</li>
            <li>Verify your animation frameworks (DAR/OAR) is installed and up to date</li>
            <li>Ensure your skeleton mod matches your animation requirements</li>
            </ul>
        </li>

        <li>Common issues to check:
            <ul>
            <li>If it was generated, ensure the <code>FNIS.esp</code> file is enabled. It is only generated by Nemesis when needed, and is a dummy plugin necessary for some mods. Without it being enabled when it needs to be, you can get a <b>Missing Master</b> error. <a href="https://www.reddit.com/r/skyrimmods/comments/olvygb/fnisesp_and_nemesis/">More information</a>.</li>
            <li>Incompatible animation mods between different behavior engines</li>
            <li>Incorrect load order for animation frameworks</li>
            <li>Corrupted behavior files from incomplete downloads or updates</li>
            <li>Incorrect versions of related patches</li>
            </ul>
            <li>Incorrect configuration of your Animation Loader/Behavior Engine</li>
            </ul>
        </li>`;

        // Add mention of potential overlap with animation issues
        loaderInsights += `<li>Note: These issues may overlap with general animation issues. If animation regeneration doesn't solve the problem, check for an "Animation Issue" section directly above for additional troubleshooting ideas.</li>`;

        if (loaderCodeIssues.length > 0) {
            loaderInsights += `<li>Detected indicators  (more indicators often increases likelihood of causation): <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">`;
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
    };
}




//❗SSE Fixes Compatibility Issue Detected
function analyzeSSEFixesIssues(sections) {
    let fixesInsights = '';
    let isHighPriority = false;

    function findSSEFixesIssues(sections) {
        // Check for impact effect indicators
        const impactEffectsFound = crashIndicators.sseFixesIssues.impactEffects.filter(({ name }) =>
            sections.topHalf.includes(name)
        );
        
        // Check for SSE Fixes dll
        const filesFound = crashIndicators.sseFixesIssues.files.filter(({ name }) =>
            sections.bottomHalf.toLowerCase().includes(name.toLowerCase())
        );

        return {
            impactEffects: impactEffectsFound,
            files: filesFound
        };
    }

    const issuesFound = findSSEFixesIssues(sections);
    Utils.debuggingLog(['analyzeSSEFixesIssues', 'analyzeLog.js'], 'issues:', issuesFound);

    if (issuesFound.impactEffects.length > 0 && issuesFound.files.length > 0 && sections.hasSkyrimAE) {
        isHighPriority = true;
        fixesInsights += `
            <li>❗ <b>SSE Fixes Compatibility Issue Detected:</b> 
                <ol>
                    <li>Recommendation:
                        <ul>
                            <li><b>Remove SSE Fixes mod</b> (the one containing FpsFixPlugin.dll - <a href="https://www.nexusmods.com/skyrimspecialedition/mods/10547">this mod</a>)</li>
                            <li>Note: This is <i>not</i> the same as the essential <a href="https://www.nexusmods.com/skyrimspecialedition/mods/17230">SSE Engine Fixes</a> mod</li>
                            <li>Note: If you specifically need SSE Fixes' mutex locking feature on newer Skyrim versions, consider either:
                                <ul>
                                    <li>Disabling all other tweaks in the SSE Fixes config, or</li>
                                    <li>Finding an alternative mod for mutex locking</li>
                                </ul>
                            </li>
                        </ul>
                    </li>

                    <li>Why this happens:
                        <ul>
                            <li>SSE Fixes is only compatible with Skyrim version 1.5.97</li>
                            <li>Using it with newer versions can cause crashes, especially during combat</li>
                            <li>These crashes often manifest as blood spray or impact effect issues</li>
                        </ul>
                    </li>

                    <li>Additional notes:
                        <ul>
                            <li>This issue is particularly common when both SSE Fixes and Precision are installed</li>
                        </ul>
                    </li>`;

        if (issuesFound.impactEffects.length > 0 || issuesFound.files.length > 0) {
            fixesInsights += `<li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">`;
            issuesFound.files.forEach(({ name, description }) => {
                fixesInsights += `<li><code>${name}</code> - ${description}</li>`;
            });
            issuesFound.impactEffects.forEach(({ name, description }) => {
                fixesInsights += `<li><code>${name}</code> - ${description}</li>`;
            });
            fixesInsights += '</ul></li>';
        }

        fixesInsights += '</ol></li>';
    }

    return {
        insights: fixesInsights,
        isHighPriority: isHighPriority
    };
}




//🎯Quest Journal UI Crash Detected:
function analyzeQuestJournalCrash(sections) {
    let insights = '';

    const foundIndicators = crashIndicators.questJournalIssues.indicators.filter(({ name }) =>
        sections.topThird.toLowerCase().includes(name.toLowerCase())
    );

    if (foundIndicators.length > 0) {
        insights += `<li>🎯 <b>Likely Journal Crash Detected:</b> This is a known SkyUI interface issue. Here's how to resolve it:<ol>
            <li>Recommended fix - install one of these mods:
                <ul>
                <li>Be sure to first disable your previous Journal mod.</li>
                <li><a href="https://www.nexusmods.com/skyrimspecialedition/mods/60837">Dear Diary Dark Mode - SkyUI Menus Replacer SE</a> (or its variant <a href="https://www.nexusmods.com/skyrimspecialedition/mods/23010">Dear Diary - Paper SkyUI Menus Replacer SE</a>)
                    <ul>
                    <li>Make sure to select the journal option during FOMOD installation</li>
                    <li>If menus appear squished, also install <a href="https://www.nexusmods.com/skyrimspecialedition/mods/136793">Widescreen Scale Removed for 1-6-1130 and higher</a></li>
                    </ul>
                </li>
                </ul>
            </li>
            <li>Alternative fix (less reliable):
                <ul>
                <li>Try installing <a href="https://www.nexusmods.com/skyrimspecialedition/mods/108618">Quest Journal Fix for SkyUI</a></li>
                </ul>
            </li>
            <li>Detected indicators in top third of crash log: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">`;

        foundIndicators.forEach(({ name, description }) => {
            insights += `<li><code>${name}</code> - ${description}</li>`;
        });

        insights += `</ul></li>
            </ol></li>`;
    }

    return insights;
}


//❓ Potential Journal Menu Crash Detected:
function analyzeJournalMenuCrash(sections) {
    let insights = '';

    const foundIndicators = crashIndicators.questJournalIssues.indicators.filter(({ name }) =>
        sections.stack.toLowerCase().includes(name.toLowerCase())
    );

    if (foundIndicators.length > 0) {
        insights += `<li>❓ <b>Potential Journal Crash Detected:</b> It is possible your journal is broken:<ol>
            <li>Potential fix - install one of these recommended journal mods:
                <ul>
                <li>Be sure to first disable your previous Journal mod.</li>
                <li><a href="https://www.nexusmods.com/skyrimspecialedition/mods/60837">Dear Diary Dark Mode - SkyUI Menus Replacer SE</a> (or its variant <a href="https://www.nexusmods.com/skyrimspecialedition/mods/23010">Dear Diary - Paper SkyUI Menus Replacer SE</a>)
                    <ul>
                    <li>Make sure to select the journal option during FOMOD installation</li>
                    <li>If menus appear squished, also install <a href="https://www.nexusmods.com/skyrimspecialedition/mods/136793">Widescreen Scale Removed for 1-6-1130 and higher</a></li>
                    </ul>
                </li>
                </ul>
            </li>
            <li>Detected indicators in <code>Stack</code> portion of crash log: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">`;

        foundIndicators.forEach(({ name, description }) => {
            insights += `<li><code>${name}</code> - ${description}</li>`;
        });
        insights += `</ul></li>
            </ol></li>`;
    }

    return insights;
}



//🎯Gamepad Compatibility Issue Detected:
function analyzeGamepadCrash(sections) {
    let insights = '';

    const foundIndicators = crashIndicators.gamepadIssues.indicators.filter(({ name }) =>
        sections.topHalf.includes(name)
    );

    if (foundIndicators.length > 0) {
        insights += `<li>🎯 <b>Gamepad Compatibility Issue Detected:</b> A gamepad/controller is likely causing crashes with your Skyrim version. To resolve this:<ol>
            <li>Choose one of these options:
                <ul>
                <li>Update (Recommended): Install any compatible controllmap, for example: <a href="https://www.nexusmods.com/skyrimspecialedition/mods/89649">Modern Controlmap (Gamepad and Keyboard)</a></li>
                <li>Workaround: Temporarily disconnect your gamepad/controller if you don't use it</li>
                </ul>
            </li>
            ${sections.hasNewEslSupport ? `<li>This issue frequently affects newer Skyrim versions that need an updated controlmap for gamepad support</li>` : ''}
            <li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">`;

        foundIndicators.forEach(({ name, description }) => {
            insights += `<li><code>${name}</code> - ${description}</li>`;
        });

        insights += `</ul></li>
            </ol></li>`;
    }

    return insights;
}





//❓ Keyboard Input Issue Detected: 
function analyzeKeyboardCrash(sections) {
    let insights = '';

    const foundIndicators = crashIndicators.keyboardIssues.indicators.filter(({ name }) =>
        sections.topHalf.toLowerCase().includes(name.toLowerCase())
    );

    if (foundIndicators.length > 0) {
        insights += `<li>❓ <b>Keyboard Input Issue Detected:</b> This indicates a problem with the game's keyboard input system. To resolve this:<ol>
            <li>First steps:
                <ul>
                <li>Restart your computer to refresh the system</li>
                <li>🔀 <b>Alt+Tab considerations:</b> Somtimes Alt+tabbing can cause this indicator to show up in crash logs. Avoid Alt+Tabbing, especially playing full screen, or while loading/saving, or any intensive scenes. If you must, switch applications during periods of inactivity and after pausing Skyrim with the [\`] key (entering the command line menu).</li>

                <li>Check for and install any keyboard driver updates</li>
                </ul>
            </li>
            <li>If issue persists:
                <ul>
                <li>Install or update your controlmap to any suitable mod, for example: <a href="https://www.nexusmods.com/skyrimspecialedition/mods/89649">Modern Controlmap (Gamepad and Keyboard)</a>
                    <ul>
                        <li>Read to verify compatibility with your version of Skyrim</li>
                        <li>Note: remove any old controlmap mod first</li>
                    </ul>
                </li>
                <li>Verify any keyboard input or hotkey mods are compatible</li>
                </ul>
            </li>
            <li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">`;
            
        foundIndicators.forEach(({ name, description }) => {
            insights += `<li><code>${name}</code> - ${description}</li>`;
        });

        insights += `</ul></li>
            </ol></li>`;
    }

    return insights;
}




//🎯 Antivirus Issue Detected:
// or ⚠️ Antivirus Warning:
function analyzeAntivirusIssues(sections) {
    let diagnoses = '';
    
    // Find which antivirus is present in the log
    let foundAntivirus = '';
    for (const [antivirus, dlls] of Object.entries(antivirusSignatures)) {
        if (dlls.some(dll => sections.fullLogFileLowerCase.includes(dll))) {
            foundAntivirus = antivirus;
            break;
        }
    }

    // Check for USVFS in different sections to determine severity
    const usvfsInTopQuarter = sections.topQuarter.toLowerCase().includes('usvfs_x64.dll');
    const usvfsInTopHalf = sections.topHalf.toLowerCase().includes('usvfs_x64.dll');
    
    // Special check for Windows Security in topHalf if no other antivirus found
    const windowsDefenderInTopHalf = !foundAntivirus && ['mpsvc.dll', 'mpclient.dll'].some(dll => 
        sections.topHalf.toLowerCase().includes(dll)
    );

    const hasBitdefender = foundAntivirus === 'Bitdefender';

    // If we have any antivirus indicators, USVFS issues, or Windows Security in top half
    if (foundAntivirus || usvfsInTopQuarter || windowsDefenderInTopHalf) {
        diagnoses += `<li>${(usvfsInTopQuarter && foundAntivirus) ? '🎯 <b>Antivirus Issue Detected:</b>' : '⚠️ <b>Antivirus Warning:</b>'} `;
        
        // Build main description based on findings
        diagnoses += '<ol>';
        
        if (foundAntivirus) {
            diagnoses += `<li><b>${foundAntivirus} detected</b> - Third-party antivirus software frequently contributes to crashes in heavily-modded Skyrim. Consider switching to Windows Security for better compatibility.</li>`;
        } else if (windowsDefenderInTopHalf) {
            diagnoses += '<li><b>Windows Security detected</b> in crash log - While usually not problematic, you may need to add exclusions if issues persist.</li>';
        }

        if (usvfsInTopHalf || usvfsInTopQuarter) {
            diagnoses += `<li><b>MO2 file system interference detected</b> - Your antivirus may be blocking Mod Organizer 2's virtual file system (USVFS)${(usvfsInTopQuarter && foundAntivirus) ? ' - this appears to be a direct cause of the crash' : ''}.</li>`;
        }

        diagnoses += `<li>${((usvfsInTopQuarter && foundAntivirus) || hasBitdefender) ? 'Recommended actions:' : 'Suggestions:' }
            <ul>
            <li>Create antivirus exclusions for your entire ${Utils.NolvusOrSkyrimText} directory</li>`;
            
        if (hasBitdefender) {
            diagnoses += `<li><b>For Bitdefender:</b> Follow this <a href="https://www.reddit.com/r/skyrimmods/comments/1hwp5ki/crashing_to_desktop_ctd_only_on_any_type_of/">guide with screenshots</a> for setting up proper exclusions</li>`;
        }

        diagnoses += `<li>Alternatively, consider switching to the built-in Windows Security. Originally rudimentary, Windows Security (previously known as Windows Defender) has evolved considerably, and when using it there is usually no need to set up any exclusions for Skyrim - helping to ensure Skyrim mods continue to be monitored for malicious activity.</li>
            </ul>
        </li>`;

        // Add technical details in expandable section
        diagnoses += '<li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">';

        if (foundAntivirus) {
            diagnoses += `<li><code>${foundAntivirus}</code> indicators found:`;
            diagnoses += '<ul>';
            antivirusSignatures[foundAntivirus].forEach(dll => {
                if (sections.fullLogFileLowerCase.includes(dll)) {
                    diagnoses += `<li><code>${dll}</code></li>`;
                }
            });
            diagnoses += '</ul></li>';
        }
        if (usvfsInTopQuarter) {
            diagnoses += '<li><code>usvfs_x64.dll</code> found in top quarter sections of crash log - increases likelihood of antivirus interference</li>';
        } else if (usvfsInTopHalf) {
            diagnoses += '<li><code>usvfs_x64.dll</code> found in top half of log - possible antivirus interference</li>';
        }
        if (windowsDefenderInTopHalf) {
            diagnoses += '<li><code>Windows Security</code> signatures found in top half of log:';
            diagnoses += '<ul>';
            ['mpsvc.dll', 'mpclient.dll'].forEach(dll => {
                if (sections.topHalf.toLowerCase().includes(dll)) {
                    diagnoses += `<li><code>${dll}</code></li>`;
                }
            });
            diagnoses += '</ul></li>';
        }
        
        diagnoses += '</ol></li>';
    }

    return {
        diagnoses: diagnoses,
        isHighPriority: (usvfsInTopQuarter && foundAntivirus) // true if it's an "Issue Detected", false if just a "Warning"
    };
}



//❗ Simplicity of Snow + JK's Skyrim Patch Missing:
function checkSimplicityOfSnowJKSkyrimPatch(sections) {
    let insights = '';

    // Check for mod presence
    const hasJKsSkyrim = sections.fullLogFileLowerCase.includes('jks skyrim.esp');
    const hasSimplicityOfSnow = sections.fullLogFileLowerCase.includes('simplicity of snow.esp');
    const hasPatch = sections.fullLogFileLowerCase.includes('jks skyrim tree fix.esp');

    // Condition for potential issue
    if (hasJKsSkyrim && hasSimplicityOfSnow && !hasPatch && !sections.hasNolvusV6) {
        insights += `<li>❗ <b>Simplicity of Snow + JK's Skyrim Patch Missing:</b> 
            Your load order includes both JK's Skyrim and Simplicity of Snow, but the required patch appears to be missing?
            <ul>
                <li>To resolve this:
                    <ol>
                        <li>Reinstall Simplicity of Snow's FOMOD. During installation, it should automatically detect JK's Skyrim and offer the appropriate patch(es).</li>
                        <li>Ensure you select the JK's Skyrim compatibility patch during the FOMOD installation process.</li>
                        <li>After reinstalling, verify that the <code>JKs Skyrim Tree Fix.esp</code> is present in your load order.</li>
                    </ol>
                </li>
                <li>Notes:
                    <ul>
                        <li>Without this patch, you may experience potential crashes.</li>
                        <li>Sometimes this issue can appear as a false-positive due to the <code>simplicity of snow.esp</code> file apparently not always showing up in the crash log.</li>
                        <li>For more detailed information, see this <a href="https://www.reddit.com/r/skyrimmods/comments/17tqxig/comment/k9184j5/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button">r/SkyrimMods thread</a>.</li>
                    </ul>
                </li>
            </ul>
        </li>`;
    }

    return insights;
}


//❗ Incompatible Snow Mods Detected:
function checkSnowModsCompatibility(logFile) {
    let insights = '';

    // Check for mod presence (case insensitive)
    const hasBetterDynamicSnow = logFile.toLowerCase().includes('better dynamic snow se.esp');
    const hasSimplicityOfSnow = logFile.toLowerCase().includes('simplicity of snow.esp');

    // Condition for potential issue
    if (hasBetterDynamicSnow && hasSimplicityOfSnow) {
        insights += `<li>❗ <b>Incompatible Snow Mods Detected:</b> 
            Your load order includes both <a href="https://www.nexusmods.com/skyrimspecialedition/mods/56235">Simplicity of Snow</a> and <a href="https://www.nexusmods.com/skyrimspecialedition/mods/9121">Better Dynamic Snow SE</a>, which are incompatible with each other.
            <ul>
                <li>To resolve this, you must uninstall (or at least disable) one of the two mods (and any mods that depend upon it).</li>
                <li>Notes:
                    <ul>
                        <li>These mods conflict because they both modify snow-related mechanics and textures.</li>
                        <li>As stated by Simplicity of Snow's mod author, these mods are not compatible in the same load order.</li>
                        <li>Using both simultaneously will usually lead to crashes.</li>
                        <li>Simplicity of Snow is the more-recently-updated mod and seems often preferred by the community</li>
                    </ul>
                </li>
            </ul>
        </li>`;
    }

    return insights;
}




function checkLotdKaragasTowerDoorCrash(sections) {
    let insights = '';
    
    // Helper function to find matches in the top half of the log
    function findIndicators(sections) {
        return crashIndicators.lotdKaragasTowerDoorCrashIssues.codes.filter(({ code }) =>
            sections.topHalf.toLowerCase().includes(code.toLowerCase())
        );
    }

    // Check for hex code in first line
    const hasHexCode = sections.firstLine.toLowerCase().includes(
        crashIndicators.lotdKaragasTowerDoorCrashIssues.hexCodes[0].hexCode.toLowerCase()
    );
    
    // Find other indicators in top half
    const foundIndicators = findIndicators(sections);
    const indicatorCount = foundIndicators.length;

    // Test conditions:
    // 1. Hex code + any other indicator
    // 2. Four or more indicators even without hex code
    const isPositive = (hasHexCode && indicatorCount > 0) || (indicatorCount >= 4);

    if (isPositive) {
        insights += `<li>❗ <b>Legacy of the Dragonborn - Karagas' Tower Door Crash Detected:</b>
            You've encountered a known crash related to NPC pathfinding through a specific door in Karagas' Tower.
            <ul>
                <li>To resolve this:
                    <ol>
                        <li>Load a save from before entering Karagas' Maze</li>
                        <li>Dismiss all followers and pet followers (including mod-added ones like Inigo, Meeko, etc.)</li>
                        <li>Complete the dungeon without followers</li>
                        <li>You can safely resume followers once inside the tower</li>
                    </ol>
                </li>
                <li>Technical details:
                    <ul>
                        <li>This is a known issue in Legacy of the Dragonborn where the door (FormID: 0x6597B) has a broken navmesh link</li>
                        <li>The crash occurs when NPCs (including followers) attempt to path through this specific door</li>
                        <li>While you can get through the door alone, NPCs will crash the game when attempting to follow</li>
                    </ul>
                </li>`;

        if (foundIndicators.length > 0) {
            insights += `<li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">`;
            foundIndicators.forEach(({ code, description }) => {
                insights += `<li><code>${code}</code> - ${description}</li>`;
            });
            insights += '</ul></li>';
        }

        insights += '</ul></li>';
    }

    return insights;
}



//❓ XPMSE Issue Detected:
function analyzeXPMSECrash(sections) {
    let insights = '';

    if (sections.topHalf.toLowerCase().includes('XPMSE'.toLowerCase())) {
        insights += `<li>❓ <b>XPMSE Issue Detected:</b> Indicators for this are usually false positives. However, if you see this issue frequently and without better crash explanations above, then the mention of 'XPMSE' in the crash log may indicate a potential conflict or issue with the XP32 Maximum Skeleton Extended mod or its dependencies. This mod is for animation support and is often required by other mods that add or modify character animations. To address this issue, consider the following steps:<ol>
            <li>Ensure that XPMSE is installed correctly and is loaded at the correct point in your mod load order.</li>
            <li>Verify that all mods requiring XPMSE as a dependency are compatible with the version you have installed.</li>
            <li>Update XPMSE and any related mods to their latest cross-compatible versions which are compatible with your version of Skyrim.</li>
            <li>If you have recently added or removed mods, check for any that might affect skeleton or animation files and adjust accordingly.</li>
        </ol></li>`;
    }

    return insights;
}


//❓ HUD Issue Detected:
function analyzeHUDCrash(sections) {
    let insights = '';
    const hudRelatedRegex = /HUD|menus|maps/ig;
    var hudRelatedMatches = sections.topHalf.match(hudRelatedRegex) || [];
    if (hudRelatedMatches.length > 0) {
        insights += `<li>❓ <b>HUD Issue Detected:</b> When a crash log's top half includes indicators with <code>HUD</code>, <code>menus</code> and/or <code>maps</code> they may suggests a conflict with your "Heads-Up Displays" user interface (HUD/UI). Common examples of HUDs include health/stamina/magic bars, compass, active effets, etc. To troubleshoot this issue, consider the following steps:<ol>
            <li>Check for any mods that alter the HUD or user interface. Disable or adjust these mods to see if the issue persists.</li>
            <li>Ensure that you have the latest version of SkyUI installed. Sometimes outdated versions can cause HUD-related problems.</li>
            <li>Verify that your SKSE (Skyrim Script Extender) is up-to-date, as it's essential for many mods, including SkyUI.</li>
            <li>If you're using other HUD-related mods, ensure they are compatible and load them in the correct order.</li>
        </ol></li>`;
    }

    return insights;
}



//❗ Wheeler Issue Detected:
function analyzeWheelerCrash(sections, logFile) {
    let insights = '';

    if (sections.topQuarter.toLowerCase().includes('wheeler.dll'.toLowerCase()) && logFile.toLowerCase().includes('EngineFixes.dll'.toLowerCase())) {
        insights += `<li>❗ <b>Wheeler Issue Detected:</b><ol>
            <li><b>First,</b> install the <a href="https://www.nexusmods.com/skyrimspecialedition/mods/132074">Wheeler CTD-Fix mod</a> to potentially resolve crashes associated with the Wheeler mod.</li>
            <li><b>However,</b> if the Wheeler CTD-Fix mod is already installed but you are still seeing this crash, <b>Consider reinstalling:</b> <a href="https://www.nexusmods.com/skyrimspecialedition/mods/17230">SSE Engine Fixes</a>
                ${reinstallEngineFixes}
                <li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">
                    <li><code>wheeler.dll</code> - detected in top quarter sections of crash log</li>
                    <li><code>EngineFixes.dll</code> - already installed</li>
                </ul></li>
            </li>
        </ol></li>
        `;
    }

    return insights;
}



// 🎯 A0D789 Crash Detected:
function analyzeA0D789Crash(sections) {
    let diagnoses = '';
    if (sections.firstLine.includes('A0D789')) {
        if(!Utils.isSkyrimPage) {
            //NOLVUS version:
            diagnoses += '<li>🎯 <b>A0D789 Crash Detected:</b> Reload game and continue playing, or alternatively, for added stability, add the <a href="https://www.patreon.com/posts/se-ae-69951525">[SE/AE]A0D789patch</a> patch by kingeric1992 into Mod Organizer (MO2). If you would like guidance on modding/patching Nolvus, please watch this <a href="https://youtu.be/YOvug9KP5L4">brief tutorial video</a> for step-by-step instructions. NOTE: this specific patch does NOT have a plugin that shows up in the right side of MO2. More information and troubleshooting tips under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-10">A0D789 Crash</a/>.<ul>';
        } else {
            //Skyrim version:
            diagnoses += '<li>🎯 <b>A0D789 Crash Detected:</b> For added stability, add the <a href="https://www.patreon.com/posts/se-ae-69951525">[SE/AE]A0D789patch</a> patch by kingeric1992. More information under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-10">A0D789 Crash</a/>.<ul>';
        }

        diagnoses += `<li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">
                <li><code>A0D789</code> - detected in first error line of crash log</li>
            </ul></li>
        </ul></li>`;
    }

    return diagnoses;
}


// ❗ BFCO and MCO Compatibility Issue:
function analyzeMcoBfcoCompatibility(logFile) {
    let insights = '';

    const logFileLowerCase = logFile.toLowerCase();
    const hasMCO = logFileLowerCase.includes('mco.dll');
    const hasBFCO = logFileLowerCase.includes('bfco.dll');

    // If both DLLs are present, provide compatibility warning
    if (hasMCO && hasBFCO) {
        insights += `<li>❗ <b>BFCO and MCO Compatibility Issue:</b> 
            Your load order includes both <a href="https://www.nexusmods.com/skyrimspecialedition/mods/85491">Modern Combat Overhaul (MCO)</a> and <a href="https://www.nexusmods.com/skyrimspecialedition/mods/117052">Behavior Framework Combat Overhaul (BFCO)</a>. These mods are not designed to work together as they perform similar functions.
            <ol>
                <li>Choose either MCO or BFCO - you should not use both simultaneously
                    <ul>
                        <li>BFCO is the newer mod and is often preferred by the community</li>
                    </ul>
                </li>
                <li>If you prefer BFCO (usually recommended), you can convert your MCO animations:
                    <ul>
                        <li>Use the <a href="https://www.nexusmods.com/skyrimspecialedition/mods/119926">MCO to BFCO Converter</a> to convert your existing MCO animations to work with BFCO</li>
                    </ul>
                </li>
                <li>Uninstall the mod you're not planning to use</li>
                <li>After uninstalling, regenerate/patch your animations using your behavior engine:
                    <ul>
                        <li>General requirements for behavior engines:
                            <ul>
                                <li>Clear the behavior engine's cache before regenerating</li>
                                <li>Check/enable all relevant boxes/options to generate the correct files for your installed mods</li>
                            </ul>
                        </li>
                        <li>If using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/3038">FNIS</a>: Run GenerateFNISforUsers.exe</li>
                        <li>If using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/60033">Nemesis</a>: Run Nemesis Unlimited Behavior Engine
                            <ul>
                                <li>reference: <a href="https://www.reddit.com/r/skyrimmods/comments/t2rk34/nemesis_pro_tip/">guide to clearing Nemesis cache</a></li>
                                <li>reference: <a href="https://www.nolvus.net/guide/asc/output/nemesis">example instructions from Nolvus</a> (with numerous screenshots)</li>
                            </ul>
                        </li>
                        <li>If using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/133232">Pandora</a>: Run Pandora Behavior Engine</li>
                    </ul>
                </li>
                <li>Additional Notes:
                    <ul>
                        <li>While this combination doesn't always cause immediate crashes, it can lead to unexpected behavior and potential stability issues</li>
                        <li>BFCO specifically lists MCO as incompatible on its mod page</li>
                        <li>The conversion tool makes it easy to keep your favorite MCO animations while switching to BFCO</li>
                    </ul>
                </li>
            </ol>
        </li>`;
    }

    return insights;
}


// 🎯 DbSkseFunctions.dll Crash Detected:
function analyzeDbSkseFunctionsCrash(sections) {
    let diagnoses = '';
    let emoji = '';
    let detectionLocation = 'top third of crash log';
    
    // Check if it's in the first line - if so, use target emoji and update location text
    if (sections.firstLine.includes('DbSkseFunctions.dll')) {
        emoji = '🎯 <b>';
        detectionLocation = 'first error line of crash log';
        crashString = 'crash is usually related';
    }
    // Otherwise check if it's in the top third
    else if (sections.topThird.includes('DbSkseFunctions.dll')) {
        emoji = '❗ <b>Possible';
        detectionLocation = 'top third of crash log';
        crashString = 'potential crash cause is often related';
    }
    
    if (emoji) {  // If we found it in either location
        diagnoses += `
            <li>${emoji} DbSkseFunctions.dll Crash Detected:</b> This ${crashString} to the DbSkseFunctions mod's projectile tracking feature. The issue seems to be more common during combat/spellcasting with mod-added projectiles.
            <ul>
                <li>Try the following fix: Open <code>Data/SKSE/plugins/DbSkseFunctions.ini</code> and set <code>iMaxArrowsSavedPerReference=0</code>. This disables the projectile impact hook which is commonly the source of these crashes.
                <li>What this does: This setting disables the mod's arrow/projectile tracking system, which can sometimes cause issues during combat or when processing certain spells.  While this reduces some functionality, it typically resolves the crashes.</li>
                
                <li>If the issue persists: Try disabling DbSkseFunctions and any mods that require it, then gradually reintroduce them while testing for stability.</li>
                
                <li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a>
                    <ul class="extraInfo" style="display:none">
                        <li><code>DbSkseFunctions.dll</code> - detected in ${detectionLocation}</li>
                    </ul>
                </li>
            </ul>
            </li>`;
    }
    return diagnoses;
}



//❓ Possible Shader/Lighting Issue:
function analyzeENBShaderLightingIssues(sections) {
    let shaderInsights = '';

    function findShaderCodeIssues(sections) {
        return crashIndicators.enbShaderLightingIssues.codes.filter(({ code }) =>
            sections.topHalf.toLowerCase().includes(code.toLowerCase())
        );
    }

    const shaderCodeIssues = findShaderCodeIssues(sections);
    Utils.debuggingLog(['analyzeENBShaderLightingIssues', 'analyzeLog.js'], 'shaderCodeIssues:', shaderCodeIssues);

    if (shaderCodeIssues.length > 0) {
        shaderInsights += `<li>❓ <b>Possible Shader/Lighting Issue:</b> While this crash includes indications of lighting/shadows/shader/enb systems, the root cause often lies elsewhere. Follow these steps:
        <ol>
        <li>Check for Cell and Record Conflicts:
            <ul>
                <li>Look for mods that modify the same interior/exterior spaces</li>
                <li>Review recently added mods that add or modify locations</li>
                <li>Check for patches between lighting mods and relevant or new location mods</li>
                <li>Advanced Users: Use xEdit to check for cell conflicts in the area where crashes occur</li>
            </ul>
        </li>

        <li>Examine Texture and Mesh Issues:
            <ul>
                <li>Check for missing or corrupted textures, especially:
                    <ul>
                        <li>Character tintmasks and facegen data</li>
                        <li>Environmental textures in the crash location</li>
                        <li>Recently added texture mods</li>
                    </ul>
                </li>
                <li>Verify compatibility of mesh-containing mods with your lighting setup</li>
                <li>For additional information, including potentially-suspect texture/mesh files, review related sections that may be included above, in this report: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">
                    <li>❓ Possible Texture Issue Indicators Found</li>
                    <li>❓ Possible Mesh Issue Detected</li>
                    <li>❗ Critical Memory Usage Detected</li>
                </ul></li>
            </ul>
        </li>
                
        <li>If issues continue:
            <ul>
            ${Utils.LootListItemIfSkyrim}
            <li>Review compatibility between character overhauls and lighting systems. Some character overhauls modify rendering processes which can cause conflicts. Check for compatibility patches.</li>
            <li>Check for ENB preset compatibility with your weather mod</li>
            <li>Look for conflicts between graphical mods (enb, lighting, shadows, shaders, weather, parallax, meshes, textures, new cells/locations, character overhauls etc.)</li>
            <li>Consider testing without ENB by temporarily renaming <code>d3d11.dll</code> to <code>d3d11.dll.backup</code></li>
            <li>Review GPU driver version compatibility</li>
            <li>Check Windows display settings for HDR conflicts</li>
            </ul>
        </li>
   
        <li>Technical Context: When shader/lighting codes appear in crash logs, they often indicate where the crash manifested rather than the root cause. The actual issue frequently involves cell conflicts, texture problems, or memory limitations that surface through the lighting system.</li>
        
        <li>Performance Note: These graphical components can significantly impact performance. If you're experiencing FPS drops (stutters), prioritize testing performance-heavy effects first. Consider using a tool like <a href="https://game.intel.com/us/intel-presentmon/">Intel PresentMon</a> to accurately monitor usage of VRAM, RAM, GPU and CPU while troubleshooting.</li>`;

        if (shaderCodeIssues.length > 0) {
            shaderInsights += `<li>Detected indicators (more indicators often increases likelihood of causation): <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">`;
            shaderCodeIssues.forEach(({ code, description }) => {
                shaderInsights += `<li><code>${code}</code> - ${description}</li>`;
            });
            shaderInsights += '</ul></li>';
        }

        shaderInsights += '</ol></li>';
    }

    return shaderInsights;
}



// ❓ Analyze potential dxgi.dll conflicts
function analyzeDXGIIssues(sections) {
    let insights = '';
    
    if (sections.topHalf.includes('dxgi.dll')) {
        insights += `<li>❓ <b>Possible dxgi.dll Compatibility Notice:</b> The presence of <code>dxgi.dll</code> in the log's top half may indicate a potential interaction between ReShade and the PureDark Upscaler. Here are some possible solutions to consider:<ol>
            <li><b>ReShade Version:</b> If you use, and have recently updated ReShade (such as to version 6.11 for the Cabbage release), there might be compatibility concerns with PureDark's customized <code>dxgi.dll</code>. See below for ReShade restoration options.</li>
            <li><b>PureDark Upscaler:</b> If you use Puredark's upscaler, for users with newer PureDark upscaler versions (particularly with 40xx cards), you may need to obtain a specialized <code>dxgi.dll</code> from their Discord to ensure ReShade compatibility.</li>
            <li><b>Missing dxgi.dll:</b> To restore the prior <code>dxgi.dll</code> after using PureDark, you can locate it in your archived mods or reinstall ReShade by following the <a href="https://www.nolvus.net/guide/natl/enb">11.3 Reshade Binaries</a> guide.</li>
            <li><b>Quick Solution:</b> As a temporary isolating measure, you can toggle ReShade using the DEL key.</li>
            </ol></li>`;
    }
    
    return insights;
}

// ❓ Analyze potential upscaler-related issues
function analyzeUpscalerIssues(sections) {
    let insights = '';
    
    if (sections.topThird.toLowerCase().includes('upscaler.dll') || sections.topThird.toLowerCase().includes('pdperfplugin.dll')) {
        insights += `<li>❓ <b>Potential Upscaler Issue Detected:</b> The error involving <code>Upscaler.dll</code> or <code>PDPerfPlugin.dll</code> suggests a problem with the Upscaler mod, which is designed to improve the game's graphics by increasing the resolution of textures. If you are using Puredark's paid Upscaler, consider the following troubleshooting steps:<ol>
            <li>Ensure you are using the correct version of the upscaler that is compatible with your GPU.</li>
            <li>Review the <a href="https://docs.google.com/document/d/1YVFKcJN2xuvhln9B6vablzOzQu-iKC4EDcbjOW-SEsA/edit?usp=sharing">Nolvus DLSS Upscaler Installation Guide</a> to confirm that you have followed all the installation steps correctly.</li>
            <li>Review the <b>SkyrimUpscaler.log</b> file for more detailed information about the error.</li>
            <li>Temporarily disable the Upscaler mod to determine if it is the source of the crash.</li>
            <li>Ensure that your system meets the hardware requirements for running the mod, as upscaling can be resource-intensive.</li>
            <li>Check for updates to the Upscaler mod that may address known issues.</li>
            <li>If the problem persists, report it to the mod's support page, providing details from the log file to assist with troubleshooting.</li>
            </ol></li>`;
    }
    
    return insights;
}


// ❗ First-Line Engine Fixes Issue:
function analyzeFirstLineEngineFixesCrash(sections) {
    let diagnoses = '';
    
    if (sections.firstLine.toLowerCase().includes('EngineFixes.dll'.toLowerCase())) {  // If we found it in either location
        diagnoses += `
            <li>❗ <b>First-Line Engine Fixes Issue:</b> Engine Fixes in the first error line of the crash log may indicate an improperly installed Engine Fixes mod, or that a mod which uses it may have an incompatibility.
                ${reinstallEngineFixes}
                <ul>
                    <li>If confident Engine Fixes is correctly installed, but issue reoccurs, attempt to isolate conflicting mod by temporarily disabling mods (one-by-one, or in shrinking groups) which show up in the <b>🔎 Files/Elements</b> section of this report</li>
                </ul>
            </li>`;
    }
    return diagnoses;
}



//📊 Mod Prominence Analysis:
function analyzeModProminence() {
    let modInsights = '';
    
    // Get sorted data from FilenamesTracker
    const sortedData = Utils.FilenamesTracker.getModsSorted();
    const entries = Object.entries(sortedData);
    
    if (entries.length > 0) {
        modInsights += `<li>📊 <b>Mod Prominence Analysis:</b> The following mods appear frequently and/or with detailed information in the crash log. While this can indicate relevance to the crash cause, these mods might simply be more verbose in their logging and/or happened to be more active in the time leading up to the crash.
            <ol>
                <li>This indicator is less likely to be causal unless it repeats across multiple related crash logs</li>
                <li>If this report doesn't contain better indications (above or below), consider temporarily disabling the top-listed mod and any dependent mods, and attempt to reproduce the crash<ul>
                    <li>NOTE: If tested from an old game save, many mods may cause different crashes from being removed. So, this test might need to be conducted from a new character.</li>
                </ul></li>
                <li>If the crash stops, investigate that mod's documentation and forum for any updates, known issues and/or patches, as well as its requirements, recommended load order and any incompatibilities. Also consider any recent changes to your load order which might have affected this mod.</li>
                <li>If the crash continues (or if disabling this mod was infeasible), re-enable and try the next mod</li>
                ${Utils.LootListItemIfSkyrim}

                <li>Mods listed by prominence <code><span style="color:darkorange">(appearances : details)</span></code>: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">
                    ${!window.location.href.toLowerCase().endsWith('?tryformids') ? '<li>NOTE: results may be more accurate with the "experimental Files/Elements upgrade" (see checkbox at top of page)</li>' : ''}`;
                // Add sorted mods to the list
                entries.forEach(([filename, stats]) => {
                    modInsights += `
                        <li><code><span style="color:darkorange">(${stats.count} : ${stats.sectionsCount})</span> ${filename}</code>
                            <!-- <ul>
                                <li>Appearances in log: ${stats.count}</li>
                                <li>Entry details: ${stats.sectionsCount}</li>
                            </ul> -->  
                        </li>`;
                        //Shortened out:  <ul>
                        //Shortened out:      <li>Appearances in log: ${stats.count}</li>
                        //Shortened out:          <li>Entry details: ${stats.sectionsCount}</li>
                        //Shortened out:  </ul>
                        //Shortened out:  <li>Prominence score: ${stats.sortWeight}</li>
                        //UNUSED but considered this abbreviated version: (with <code>${stats.sectionsCount}</code> details in <code>${stats.count}</code> listings)
        });

        modInsights += `
                    </ul>
                </li>
            </ol>
        </li>`;
    }

    return modInsights;
}




// ❓Possible Shadow Scene Node Crash Detected:
function analyzeShadowSceneIssues(sections) {
    let insights = '';
    
    if (sections.probableCallstack.toLowerCase().includes('BSCullingProcess::unk_D51280+78'.toLowerCase()) && sections.firstLine.includes('(SkyrimSE.exe+12FDD00)')) {
        insights += `<li>❓ <b>Possible Shadow Scene Node Crash Detected:</b> Try loading an earlier save and avoid the crash area for a few in-game days. Then return to the area and verify the issue doesn't repeat. This will help the area to reset itself and hopefully avoid the Shadow Scene issue. If the problem persists, please review the rest of this report (scroll all the way down) for additional possible causes of this crash. More information on this crash and troubleshooting tips are available under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-3">Shadow Scene Node crash</a>.</li>`;
    }
    
    return insights;
}



// ❓ Possible Shadowrend Issue:
function analyzeShadowrend(sections) {
    let insights = '';
    // NOTE: a second instance of this issue shows up in the Advanced Users section for non-Nolvus users as well
    if (sections.topQuarter.toLowerCase().includes('ccbgssse018-shadowrend.esl')) {
        insights += `<li>❓ <b>Possible Shadowrend Issue:</b> The presence of <code>ccbgssse018-shadowrend.esl</code> in the crash log suggests that this simple in-game process may address this issue:<ol>
        <li>Load an earlier save in a different area from the crash.</li>
        <li>Play for 72 in-game hours away from the area where Shadowrend is involved. Waiting or sleeping doesn't count towards the 72 hours. This should allow the area to reset and hopefully the issue will resolve itself.</li>
        <li><b>Be cautious</b> when loading a save that previously experienced the Shadowrend crash. Continuing to play from such a save might compound the issue, leading to more frequent crashes.</li>
        <li>Note that while Shadowrend often appears in crash logs, it may not be the direct cause of the crash. Other factors, such as load order conflicts, can also contribute.</li>
        ${Utils.LootListItemIfSkyrim}
        </ol></li>`;
    }
    return insights;
}

function analyzeShadowrendNolvus(sections) {
    let insights = '';
    // NOTE: a second instance of this issue shows up in the Advanced Users section for non-Nolvus users as well
    if (sections.topQuarter.toLowerCase().includes('ccbgssse018-shadowrend.esl')) {
       //Nolvus-specific version for Diagnoses area:
        insights += `<li>❓ <b>Possible Shadowrend Issue:</b> Try loading an earlier save and avoid the crash area for a few in-game days. <b>Be cautious</b> when loading a save that previously experienced the Shadowrend crash. Continuing to play on such a save might compound the issue, leading to more frequent crashes. For custom mods, verify your load order. Shadowrend is frequently NOT the crash culprit when other issues are present. Also, please review the rest of this report (scroll all the way down) for additional possible causes of this crash. More information and troubleshooting tips are available under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-6">Shadowrend Crash</a> and <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-7">Load Order Crash</a>.</li>`;
    }
    return insights;
}


//❓ skee64.dll Issue Detected:
function analyzeSkee64Issue(sections, forFirstLine = false) {
    let insights = '';

    let emoji = '❓';
    if (sections.topHalf.toLowerCase().includes('skee64.dll')) emoji = '❗'

    let logPortionText = 'top half';
    if (forFirstLine) logPortionText = 'first-line error';

    if ((!forFirstLine && !sections.firstLine.toLowerCase().includes('skee64.dll') && sections.topHalf.toLowerCase().includes('skee64.dll') )
        || (forFirstLine && sections.firstLine.toLowerCase().includes('skee64.dll'))
        ) {
        insights += `
        <li>${emoji} <b>skee64.dll Issue Detected:</b> The presence of <code>skee64.dll</code> in the ${logPortionText} of a crash log can indicate issues with the <b>RaceMenu</b> mod and/or incompatibility issues with mods that affect character models or body or face meshes. To troubleshoot this issue:<ol>
            <li>✨ As a potential easy fix, consider trying <a href="https://www.nexusmods.com/skyrimspecialedition/mods/138586">RaceMenu OverlayFix and Various Mod Fixes</a>.</li>
            <li>Frequently, this error has recently been associated with the <b>loading of presets</b> (either downloaded or made personally). The cause of the preset issue is currently unknown. If it is this preset issue, it can often show up many hours into gameplay, for causes unknown. The only lasting fix seems to be to create a new character, without loading any character presets.<ul>
                <li>Or alternately, try using Pan's steps (modified from Klaufen's) for fixing (often temporarily) many delayed preset-caused crashes:<ol>
                    <li>Load a save that works, doesn't matter how far back you are in the playthrough</li>
                    <li>Type <code>showracemenu</code> in console and save your character preset (note: if you already have your character preset saved, you can skip these first 2 steps)</li>
                    <li>Hide the <code>skee64.dll</code> using MO2 (or find and temporarily move this file to your desktop)<ul>
                        <li>For MO2 users: To hide a mod or file in MO2, right-click on the mod in the left pane, select "Information...", go to the "Filetree" tab, right-click on the file you want to hide (e.g., <code>skee64.dll</code>), and select "Hide". See <a href="./images/MO2-hide-file-instructions.png">screenshot instructions</a></li>
                    </ul></li>
                    <li>Boot up the game, now your latest save should load</li>
                    <li>Chill in the game for 30-60s for everything to load, then make a new save</li>
                    <li>Repeat step 3, but unhide <code>skee64.dll</code> (or return it from your desktop to its original location)</li>
                    <li>Load into the save you just made, repeat step 2 and load your saved preset</li>
                    <li>NOTE: This will hopefully fix the issue for at least some additional hours, but if the issue later reoccurs, these same steps may need to be repeated.</li>
                </ol></li>
            </ul></li>
            <li>Another common cause for these crashes is "overlays" - wearable tattoos, piercings, or other cosmetic character modifications. If you're using such overlays:<ul>
                <li><b>IMPORTANT:</b> If the overlay item is removable, remove it in-game before disabling the problematic mod to avoid corrupting your save.</li>
            </ul></li>
            <li>Otherwise, check for any recent mod installations or updates that may have altered character models or body meshes.</li>
            <li>Ensure that RaceMenu and all related mods are up to date and compatible with your version of Skyrim and SKSE.</li>
            <li>Read the descriptions of related mods and ensure their correct load order, and verify that there are no conflicts between mods that modify the same assets. ${Utils.LootWarningForNolvus}</li>
            ${Utils.LootListItemIfSkyrim} 
            <li>If the problem persists, consider disabling mods one by one to isolate the conflicting mod.</li>
            <li>Mentioned meshes (NOTE: <code>.bsa</code> files may or may not contain compressed mesh files): <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">
            ${Utils.extractNifPathsToListItems(sections.topHalf, forFirstLine)}
        </ol></li>`;
    }
    return insights;
}


//❗ Redundant BEES Installation Detected:
function checkForRedundantBEES(sections) {
    let diagnoses = '';

    if (sections.hasNewEslSupport) {
        const hasBeesInstalled = sections.fullLogFileLowerCase.includes('BackportedESLSupport.dll'.toLowerCase());
        
        if (hasBeesInstalled) {
            diagnoses += `
            <li>❗ <b>Redundant BEES Installation Detected:</b> 
                Backported Extended ESL Support (BEES) is installed but unnecessary for your Skyrim version <code>${Utils.getSkyrimVersion(sections.header)}</code>. 
                Some have reported that this redundancy can potentially contribute towards crashes.
                <ul>
                    <li><b>Recommendation:</b> Uninstall BEES, as the expanded ESL functionality is already built into your game version.</li>
                    <li><b>Background:</b> BEES adds support for the extended ESL range (4096 records vs 2048) to older Skyrim versions, but this functionality is already included in game version 1.6.1130 and later.</li>
                    <li><b>Next Steps:</b> If crashes continue after removing BEES, please submit a new crash log for further analysis.</li>
                </ul>
            </li>`;
        }
    }
    return diagnoses;
}



//❗ Climates Of Tamriel Divide By Zero Crash:
function analyzeCoTDivideByZeroCrash(sections) {
    let insights = '';

    if (sections.firstLine.toLowerCase().includes('EXCEPTION_INT_DIVIDE_BY_ZERO'.toLowerCase()) && 
        sections.topHalf.toLowerCase().includes('ClimatesOfTamriel.esm'.toLowerCase())) {
        insights += `<li>❗ <b>Climates Of Tamriel Divide By Zero Crash Detected:</b> This is a known issue with Climates of Tamriel causing a divide by zero error. Here's how to resolve it:<ol>
            <li>For existing saves (advanced users only):
                <ul>
                <li>Try using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/5031">ReSaver</a> and <a href="https://www.nexusmods.com/skyrimspecialedition/mods/164">SSEEdit (xEdit)</a> to remove the associated FormID</li>
                </ul>
            </li>
            <li>Recommended fix for newer Skyrim versions:
                <ul>
                <li>Replace Climates Of Tamriel with another weather mod</li>
                <li>Start a new character/save</li>
                </ul>
            </li>
            <li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">
                <li><code>EXCEPTION_INT_DIVIDE_BY_ZERO</code> - Divide by zero exception as first-line error in crash log</li>
                <li><code>ClimatesOfTamriel.esm</code> - Specific weather mod known to cause this crash type</li>
            </ul></li>
            </ol></li>`;
    }

    return insights;
}



// ❗ Probable WIDeadBodyCleanupCell Crash Detected:
function checkWIDeadBodyCleanupCell(sections) {
    let insights = '';

    // Check for WIDeadBodyCleanupCell crash indicators in the log
    const hasWIDeadBodyCleanupCrash = sections.topHalf.toLowerCase().includes('WIDeadBodyCleanupCell'.toLowerCase());

    // Condition for potential issue
    if (hasWIDeadBodyCleanupCrash) {
        insights += `<li>❗ <b>Probable WIDeadBodyCleanupCell Crash Detected:</b> 
            Your crash appears related to Skyrim's WIDeadBodyCleanupScript which handles the cleanup of important named NPCs after death.
            <ul>
                <li>This crash typically occurs when the game tries to transfer a dead NPC's inventory to their coffin/urn in the Hall of the Dead.</li>
                <li>The issue affects only important named NPCs, not random generic characters.</li>
                <li>To fix this issue, try one of these two mods:</li>
                <ul>
                    <li><a href="https://www.nexusmods.com/skyrimspecialedition/mods/124724">Yet Another WIDeadBodyCleanupScript Crash Fix</a> - Requires additional support mods but might work better for some users</li>
                    <li><a href="https://www.nexusmods.com/skyrimspecialedition/mods/62413">WIDeadBodyCleanupScript Crash Fix</a> - Requires fewer additional mods</li>
                </ul>
                <li>Notes:
                    <ul>
                        <li>This crash typically happens 12 in-game hours after killing an important NPC.</li>
                        <li>The vanilla "RemoveAllItems" function used in this process is believed to be buggy in certain situations.</li>
                        <li>Heavy mod loads may increase the likelihood of this crash.</li>
                    </ul>
                </li>
                <li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">
                    <li><code>WIDeadBodyCleanupCell</code> - probable issue transfering named-NPC inventory to Hall of the Dead</li>
                </ul></li>
            </ul>
        </li>`;
    }

    return insights;
}



function check2A690DCrash(sections) {
    let insights = '';

    // Check for 2A690D crash pattern in first line
    const has2A690DCrash = sections.firstLine.toLowerCase().includes('2a690d');

    // Condition for potential NavMesh-related crash
    if (has2A690DCrash && sections.hasNolvusV6) {
        insights += `<li>❗ <b>Probable 2A690D NavMesh/Pathing Crash Detected:</b>
            This appears to be the "2A690D crash" we're recently seeing a lot of with Nolvus v6.0.7 Beta.
            <ul>
                <li>Most common indicators:
                    <ul>
                        <li>Strongest indications (besides the first line "2A690D") are for NavMesh/Pathing Issues
                        <li>Typically associated with dragon activity (possibly when emerging from mounds)</li>
                    </ul>
                </li>
                <li>Recommended actions, if you are good at modding:
                    <ul>
                        <li>If you are using a un-cusomized, vanilla Nolvus v6 install, please consider sharing your related crash log(s) at my <a href="https://discord.com/channels/740569699900719145/1353915595711578162">2A690D NavMesh/Pathing Crash Log Collection Post</a> on the Nolvus Discord.</li>
                        <li>Try to verify crash reproducibility from a save directly before the crash.</li>
                        <li>Temporarily disable mentioned dragon-related mods (check 🔎 <i>Files/Elements</i> section below)</li>
                        <li>If you are able to isolate which mod(s) seemed to be causing this crash, <b>please let us know</b> in the Nolvus Discord!</li>
                    </ul>
                </li>
                <li>Technical notes:
                    <ul>
                        <li>May be related to invalid memory access during AI pathing calculations</li>
                        <li>May be triggered by dragon mound activation sequences</li>
                    </ul>
                </li>
                <li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">
                    <li><code>${sections.firstLine.trim()}</code> - matches 2A690D crash signature</li>
                </ul></li>
            </ul>
        </li>`;
    }

    return insights;
}



//❗ Possible Security-Related Crash Detected
function checkWintrustCrash(sections) {
    let insights = '';

    // Check for wintrust.dll mention in top half
    const hasWintrustCrash = sections.topHalf.toLowerCase().includes('wintrust.dll');

    if (hasWintrustCrash) {
        insights += `<li>❗ <b>Possible Security-Related Crash Detected:</b>
            Security mechanisms are potentially interfering with game or mod files. The indicator file, <code>wintrust.dll</code>, is part of the Microsoft Windows Operating System. Sometimes (rarely) it shows up in modded Skyrim crash logs. 
            <ul>
                <li>Potential Causes:
                    <ul>
                        <li>Antivirus blocking access to necessary files</li>
                        <li>Corrupted or invalid digital signatures</li>
                        <li>Overly restrictive or corrupted file permissions</li>
                        <li>Conflicting security software</li>
                    </ul>
                </li>
                <li>Troubleshooting:
                    <ul>
                        <li>Consider switching from 3rd party to built in Windows Security antivirus sofware</li>
                        <li>Or, set up exclusions in 3rd party antivirus software</li>
                        <li>Scan suspicious mods with <a href="https://www.virustotal.com">VirusTotal</a></li>
                        <li>Re-download and perform clean reinstall of problematic mods</li>
                        <li>Advanced: Inspect related folder and file permissions to ensure Skyrim's accessbility</li>
                        <li>Advanced: Check Windows Event Viewer for security-related errors</li>
                        <li>Advanced: Use Process Monitor to trace file access issues</li>
                        <li>Advanced: Check Windows Security Center for blocking events</li>
                    </ul>
                </li>
                <li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">
                    <li><code>wintrust.dll</code> reference in crash context</li>
                </ul></li>
            </ul>
        </li>`;
    }

    return insights;
}



function analyzeXAudioIssue(sections) {
    let insights = '';

    if (sections.topHalf.toLowerCase().includes('XAudio'.toLowerCase())) {
        insights += `<li>❓ <b>XAudio Issue Detected:</b> The 'XAudio' error may indicate a problem with the game's audio processing components. XAudio is a part of the Windows audio infrastructure, separate from DirectX. To resolve audio issues, follow these steps:<ol>
            <li>Ensure your sound card drivers are up to date. Visit the manufacturer's website for the latest driver software.</li>
            <li>Check the game's audio settings and adjust them if necessary.</li>
            <li>If you're using audio mods, verify their compatibility with your version of Skyrim and other installed mods.</li>
            <li>Sometimes, changing the audioformat, and/or sample rate of the audio file(s) can resolve issues.</li>
            <li>Consult the Skyrim modding community forums for specific solutions to XAudio-related errors.</li>
            </ol></li>`;
    }

    return insights;
}


function analyzeNewGameCrash(sections) {
    let diagnoses = '';
    
    // Check for all four required indicators
    const logContent = (sections.topHalf + ' ' + sections.bottomHalf).toLowerCase();
    
    const hasPlayerCharacter = logContent.includes('playercharacter');
    const hasQueuedPlayer = logContent.includes('queuedplayer');
    const hasBSFadeNode = logContent.includes('bsfadenode');
    const hasSkeletonNif = logContent.includes('skeleton.nif');
    
    // Only trigger if ALL four indicators are present
    if (hasPlayerCharacter && hasQueuedPlayer && hasBSFadeNode && hasSkeletonNif) {
        diagnoses += `<li>❗ <b>Probable New Game Crash (Missing INI Files) Detected:</b> This crash pattern typically occurs when starting a new game and indicates missing or incomplete default .ini configuration files. The combination of <code>PlayerCharacter</code>, <code>QueuedPlayer</code>, <code>BSFadeNode</code>, and <code>skeleton.nif</code> indicators suggests the game cannot properly initialize due to missing vanilla launcher-generated settings. To resolve this issue:<ol>
            <li>Open the Skyrim Launcher from Steam (not through your mod manager) to create the default ini files.</li>
            <li>Click on the "Options" menu in the launcher to ensure all default settings are generated.</li>
            <li>Close the launcher completely after the ini files are created.</li>
            <li>Launch the game through MO2 or Vortex (your preferred mod manager as usual).</li>
            <li>If the issue persists, check that your Skyrim.ini and SkyrimPrefs.ini files contain the appropriate entries that are generated by the vanilla launcher.</li>
            <li>Ensure you're not overriding critical vanilla settings that the game needs for basic functionality.</li>
            </ol></li>`;
            // More info from DOGGO323: "IIRC the ini entry is sResourceArchiveList= and sResourceArchiveList2= ... Those list all the default .bsa archives the game ships with."
    }
    
    return diagnoses;
}




// 🤖 For Users of Auto-Installing Modlists:
// Streamlined function for modlist/collection users with automated installers
function checkCommonModlistIssues(sections, hasUnlikelyErrorForAutoInstallerModlist, hasSaveLoadIssues, hasKeyboardIssue, hasPagefileIndicator) {
       
    // DECIDED TO ALWAYS show this at the top. It's collapsed anyway, and pretty much any issue in an auto-installing modlist could easily be caused by these issues. Also, support functions were centralized into analyzeLog.js so that such diagnositics are centralized into one piece of code. Also, troubleshooting instructions were centralized into the main text block, with some minor conditionals inserted.
    // Main diagnosis section
    let diagnoses = `
        <li>${(hasUnlikelyErrorForAutoInstallerModlist || hasSaveLoadIssues || hasKeyboardIssue ||  hasPagefileIndicator) ? '👉 ' : ''}<span class="important-emoji">🤖</span> <b>Best Practices for Auto-Installing Modlist Users:</b> Since most well-crafted auto-installing modlists are generally  stable, these guidelines should help <b>resolve most common issues</b> that may arise, and custom modders may also find them useful. (NOTE: this section is currently being developed) <a href="#" class="toggleButton">⤵️ show more</a>
            <ul class="extraInfo" style="display:none">
                ${(hasUnlikelyErrorForAutoInstallerModlist || hasSaveLoadIssues || hasKeyboardIssue ||  hasPagefileIndicator) ? '<li>Any suggestions noted with "👉" below have inidicators of <b>possible relevancy</b> in your provided crash log.</li>' : ''}
                <li>1️⃣ Initial Setup: if you haven't already, <b>launch Skyrim once from Steam</b> (not through your mod manager) and click "Options" to generate default ini files and download any AE content. Close the launcher completely, then launch through your mod manager as usual. <a href="https://gatetosovngarde.wiki.gg/wiki/Installation_Guide#A_Clean_And_Proper_Skyrim." target="_blank">More info</a> (GTS reference, but this section is broadly applicable)</li>

                <li>🖥️ Verify your hardware/OS settings:
                    <ul>
                        <li>Always try the classic computer solution - <b>restart your PC</b>: This clears memory and resolves many system-level issues, especially after extended gaming sessions. It's surprising how many issues this old IT tip still fixes...</li>
                        <li>Consider quitting out of all other applications before launching your modlist, especially if you have less than 32GB of RAM.</li>
                        <li>${hasPagefileIndicator ? '👉' : ''}${verifyWindowsPageFileListItem}</li>
                        <li>Maintain <a href="https://computercity.com/hardware/storage/how-much-space-should-i-leave-on-my-ssd">at least 10-20% free space</a> on your SSD for optimal performance.</li>
                        <li>Return any <b>overclocked hardware</b> (including RAM using XMP or AMD EXPO) to stock speeds.</li>
                    </ul>
                </li>
                
                <li>${hasUnlikelyErrorForAutoInstallerModlist ? '👉' : ''}Use installer to ensure your modlist/collection downloaded and installed completely without errors:
                    <ul>
                        <li>🪛 <b>Nolvus Users:</b> <a href="#" class="toggleButton">⤵️ show more</a>
                            <ul class="extraInfo" style="display:none">
                                <li>Use the "Apply Order" button in Nolvus Dashboard. <a href="https://www.reddit.com/r/Nolvus/comments/1kp1lrw/guide_using_the_apply_order_button_in_nolvus/"  target="_blank">See guide</a>. If you've added custom mods, re-enable and reposition them afterward.</li>
                            </ul>
                        </li>

                        <li>🪛 <b>Wabbajack Users:</b> <a href="#" class="toggleButton">⤵️ show more</a>
                            <ul class="extraInfo" style="display:none">
                                <li><b>Problem:</b> Wabbajack 4.0 removed the verify button (extremely useful for ensuring proper installation).</li>
                                <li><b>Solution:</b> Use Wabbajack 3.7.5.3 for verification:
                                    <ol>
                                        <li>Download from: <a href="https://github.com/wabbajack-tools/wabbajack/releases/tag/3.7.5.3" target="_blank">https://github.com/wabbajack-tools/wabbajack/releases/tag/3.7.5.3</a></li>
                                        <li>Create folder <code>3.7.5.3</code> in your Wabbajack directory</li>
                                        <li>Extract downloaded zip into that folder</li>
                                        <li>Run <code>wabbajack.exe</code> from the 3.7.5.3 folder</li>
                                        <li>Repeat installation steps until download phase</li>
                                        <li><b>Check "overwrite" option</b> only if you intend to use 3.7.5.3 as the installer (not needed for verification only)</li>
                                        <li>Complete verification process</li>
                                    </ol>
                                </li>
                                <li><b>Note:</b> This method also works for verifying existing installations.</li>
                            </ul>
                        </li>
                        
                        <li>🪛 <b>Vortex Collections Users:</b> <a href="#" class="toggleButton">⤵️ show more</a>
                            <ul class="extraInfo" style="display:none">
                                <li>More often than not, crashes shared in forums can be fixed by following these Vortex-specific steps:</li>
                                <li>1️⃣ Initial Steps: These two steps alone fix many crashes. (⚠️ Wait for spinners to stop after each step!)
                                    <ol>
                                        <li><b>Enable All Plugins:</b> In the Plugins tab, check that ALL of the collection's plugins that are expected to be enabled. <i>Tip: Select a single plugin, then use CTRL+A to select all mods at once, and click "Enable".</i></li>
                                        <li><b>Sort Plugins:</b> Use "Sort now" in the Plugins tab. NOTE: Do to a suspected Vortex bug, <b>you may need to repeat this step 2-3 times</b> for it to fully sort.</li>
                                    </ol>
                                </li>
                                <li>2️⃣ <b>If Issues Persist try this</b> (⚠️ Wait for spinners to stop after each step!)
                                    <ol>
                                        <li>In Vortex, go to "Mods" tab</li>
                                        <li>Purge mods</li>
                                        <li>Re-enable all mods</li>
                                        <li>Deploy mods</li>
                                        <li>Sort plugins again</li>
                                    </ol>
                                </li>
                                <li>3️⃣ <b>Check Notifications:</b> Click the notification bell in Vortex (top right) and resolve any warnings.
                                    <ul>
                                        <li>Go to Vortex's "Settings", click "Reset Suppressed Notifications" and restart Vortex.</li>
                                        <li>If you see "<b>Cycles in sorting rules</b>":
                                            <ul>
                                                <li>Search for your collection name in the Mods tab</li>
                                                <li>Right-click the collection → "Apply Collection Rules"</li>
                                                <li><a href="https://gatetosovngarde.wiki.gg/wiki/Resolving_Cycles"  target="_blank">Screenshots and more info</a> (Made for GTS, but should be applicable to other Vortex users.)</li>
                                            </ul>
                                        </li>
                                        <li>If you see an "<b>Unparsed</b>" error, they can usually be dealt with by re-installing the issue mod.</li>
                                        <li>Attempt to also address any/all other notifications, by web searching for troubleshooting steps and/or asking for help as needed.</li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </li>
    
                <li>${hasSaveLoadIssues ? '👉' : ''}<b>Save/Load Issues:</b> Problems saving or loading game files:
                    <ul>
                        <li>Try loading from your last working save</li>
                        <li>If crashes occur only while saving, this may be related to missing masters (addressed above)</li>
                        <li>💾 Advanced: Use <a href="https://www.nexusmods.com/skyrim/mods/76776"  target="_blank">FallrimTools ReSaver</a> for save cleaning (backup first!)</li>
                    </ul>
                </li>

                <li>🦉 <b>Best Practices</b> for playing a stable heavily-modded Skyrim: (Experienced modders have differing opinions, and some of these recommendations are considered <a href="https://www.reddit.com/r/skyrimmods/comments/1ls2j8b/best_practices_for_playing_a_stable_modded_skyrim/"  target="_blank">controversial</a>, but according to three top modlist communities, breaking these may cause crashes even with a stable modlist)
                    <ul>
                        <li>🔄 <b>Consult before updating any mods:</b> Check with the collection's community before updating individual mods, as collections often include compatibility patches dependent on specific mod versions. Bulk updates frequently break functionality and cause crashes.</li>
                        <li><b>Avoid using the in-game Creations menu</b> while using external mod managers - it may conflict with MO2/Vortex</li>

                        <li>${hasKeyboardIssue ? '👉' : ''}🔀 <b>Alt+Tab considerations:</b> Avoid Alt+Tabbing, especially playing full screen, or while loading/saving, or any intensive scenes. If you must, switch applications during periods of inactivity and after pausing Skyrim with the [\`] key (entering the command line menu).</li>

                        <li>If one save won't load, quit to the desktop, relaunch Skyrim and try to <b>load an older save</b>.</li>

                        <li>Sometimes it can help to <b>separate from your followers</b> to get past a crash point. Ask followers/pets/steeds to "wait" at a safe location, away from the crash-prone loading area (cell) ... and then collect them again later after getting past the crashing area.</li> 

                        <li><b>Normal crash frequency:</b> Crashing less than every 4 hours usually isn't a large concern for any heavily modded Skyrim, especially if the modlist is straining the limits of your hardware. Even un-modded Skyrim crashes.
                        </li>

                        <li><b>Significance:</b> Don't try to fix what might not be broken. If indications of the same issue don't repeat across multiple crash logs, they probably aren't significant.</li>

                        <li>${hasSaveLoadIssues ? '👉' : ''}🚫 <b>Avoid Mid-game loading:</b> Skyrim is believed to be most stable with just the first loading per launch. Subsequent save-file loads without quitting to desktop first may cause random crashes. <b>Make it easier</b> to avoid this by adding any of these mods/collections (if your modlist doesn't already include them or equivalents):
                            <ul>
                                <li><a href="https://www.nexusmods.com/skyrimspecialedition/mods/88219"  target="_blank">Clean Save Auto-reloader</a> automatically re-launches Skyrim (from desktop) with each reload.</li>
                                <li><a href="https://www.nexusmods.com/games/skyrimspecialedition/collections/4o4jxh/mods" target="_blank">Safe Save Helpers</a> mod collection provides users an automated and more thorough approach.</li>
                                <li>An <b>alternate death mod</b> can be fun, and aid in game stability by continuing the game after dying, without need to quit to desktop. Popular examples: 
                                    <ul>
                                        <li><a href="https://www.nexusmods.com/skyrimspecialedition/mods/65136"  target="_blank">Shadow of Skyrim - Nemesis and Alternative Death System</a>. Currently used by <b>Nolvus 6 beta</b>. WARNINGS: quests that expect you trapped could break when you are teleported. Also, you may need configs and/or patches to prevent issues.</li>
                                        <li><a href="https://www.nexusmods.com/skyrimspecialedition/mods/69267" target="_blank">Respawn - Soulslike Edition</a>. Currently used by <b>Lorerim</b>. WARNINGS: quests that expect you trapped could break when you are teleported. Also, you may need configs and/or patches to prevent issues.</li>
                                        <li><a href="https://www.nexusmods.com/skyrimspecialedition/mods/136825"  target="_blank">Shades of Mortality - Death Alternative SKSE</a> Instead of dying, you go ethereal and take configurable penalties. Often recommended for adding to <b>Gate to Sovngarde</b>. Broadly compatible with other mods.</li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                        <li>${hasSaveLoadIssues ? '👉' : ''}💾 <b>Safe saving practices:</b> <a href="https://www.nexusmods.com/skyrimspecialedition/mods/81502">Disable autosaves</a>. Save only during downtime when nothing is going on, wait 20-ish seconds before saving in newly-loaded areas (allows scripts to settle).</li>
                        <li><b>References</b> on safe saving and safe loading practices:
                            <ul>
                                <li><a href="https://gatetosovngarde.wiki.gg/wiki/Safe_Saving"  target="_blank">Gate to Sovngarde's "Safe Saving" wiki page</a></li>
                                <li><a href="https://www.reddit.com/r/Nolvus/comments/1ka74em/jeriliths_2025_skyrim_safesaveguide_sexy_free/"  target="_blank">Jerilith's 2025 Skyrim Safe-Save-Guide [sexy free edition]</a> for Nolvus (and any modlist)</li>
                                <li><a href="https://lorerim.com/support/saves/"  target="_blank">Lorerim's "Safe Saving & Loading" wiki page</a></li>
                            </ul>
                        </li>
                    </ul>
                </li>
                <li>🧩 <b>Best Practices</b> for modding on top of an auto-installing modlist:
                    <ul>
                        <li><b>Warning!</b> Usually this <b>voids full support</b> from modlist Discords. Some will still help you (potentially in a separate channel dedicated to customizers), but they will usually expect more effort from you in return.</li>
                        <li>Be patient and expect to do some work (see below) ... or consider leaving your modlist as the auto-installed installation.</li>
                        <li>Review your <b>modlist's Discord</b> for mods recommended by others, as well as for any other mods you'd like to add. You can often save time by learning from others' experiences.</li>
                        <li>Choose your mods carefully, <b>read</b> all of a mod's documentation beforehand, including at least skimming its forum/Discord.</li>
                        <li>Only add one mod (or two) at a time, and usually start a new character for each round of testing. Test thoroughly before adding more mods. <b>EXCEPTION:</b> Sometimes a small group of mods can be added at once if they are known to work with your modlist (and with each other).</li>
                        <li>Check for <b>patches</b> for making your mods cross-compatible with each other. Or, learn to use <a href="https://www.nexusmods.com/skyrimspecialedition/mods/164" target="_blank">SSEEdit (xEdit)</a> to make your own patches.</li>
                        <li><b>Finalize your modlist</b> before starting a new character for a real playthrough. Test thoroughly beforehand, because many mods are not safe to remove without starting a new character.</li>
                        <li><b>Load order</b> can be very important. Either read up on this, or consult your modlist's Discord for advice on how to place/prioritize your added mods.</li>
                    </ul>
                </li>
            </ul>
        </li>`;

    return diagnoses;
};


// ❗ Core Impact Framework Corruption Bug Detected:
function checkCoreImpactCorruptionCrash(sections) {
    let insights = '';
    // Check for 1AD5B40 crash pattern in the first-line error of the crash log
    const firstLineLower = sections.firstLine.toLowerCase();
    const hasFirstLineHexCode = firstLineLower.includes('1AD5B40'.toLowerCase());  // NOTE: this alone is fairly rare, but not unheard of for completely different issues
    const hasTruncatedCrashLogLength = sections.fullLogFileLowerCase.length < 5000; //NOTE: a bit over double the longest known cutoff
    const hasAffectedCoreImpactFrameworkVersion = Utils.getDllVersionFromLog(sections, `CoreImpactFramework.dll`) == '1.1.1';
    const hasAffectedDismemberingFrameworkVersion = Utils.getDllVersionFromLog(sections, `DismemberingFramework.dll`) == '1.1.2';

    /* console.log("Hex code detected?", hasFirstLineHexCode);
    console.log("Crash log truncated?", hasTruncatedCrashLogLength);
    console.log("Core Impact version affected?", hasAffectedCoreImpactFrameworkVersion);
    console.log("Dismembering version affected?", hasAffectedDismemberingFrameworkVersion); */

    /* NOTE ON ISOLATING THIS ISSUE: below is a collection of related first-line hexcodes for logs affected by this issue, turns out the first one in each line is not unique, and the last one is very rare, but not unique to this issue:
        0x7FF7633A5B40 SkyrimSE.exe+1AD5B40
        0x7FF6BAD75B40 SkyrimSE.exe+1AD5B40
        0x7FF628DC5B40 SkyrimSE.exe+1AD5B40
        0x7FF628DC5B40 SkyrimSE.exe+1AD5B40
        0x000141AD5B40 SkyrimSE.exe+1AD5B40
        0x7FF673125B40 SkyrimSE.exe+1AD5B40
        0x7FF7BCCB5B40 SkyrimSE.exe+1AD5B40
        0x7FF685605B40 SkyrimSE.exe+1AD5B40
        0x7FF6D3CD5B40 SkyrimSE.exe+1AD5B40
        0x7FF783605B40 SkyrimSE.exe+1AD5B40
        0x7FF7D3715B40 SkyrimSE.exe+1AD5B40
        0x7FF65ED95B40 SkyrimSE.exe+1AD5B40
        0x7FF7FB0F5B40 SkyrimSE.exe+1AD5B40
        0x7FF6ADF05B40 SkyrimSE.exe+1AD5B40
        0x7FF628DC5B40 SkyrimSE.exe+1AD5B40
        0x7FF6BAD75B40 SkyrimSE.exe+1AD5B40
        0x7FF7633A5B40 SkyrimSE.exe+1AD5B40
        0x7FF7633A5B40 SkyrimSE.exe+1AD5B40
        0x1AD5B40 SkyrimSE.exe+1AD5B40
    */

    
    if (hasFirstLineHexCode 
        && (hasTruncatedCrashLogLength
                || hasAffectedCoreImpactFrameworkVersion
                || hasAffectedDismemberingFrameworkVersion) ) {
        
        // Build detected indicators list
        let detectedIndicators = '';
        if (hasFirstLineHexCode) {
            detectedIndicators += `<li><code>SkyrimSE.exe+1AD5B40</code> - Core Impact Framework corruption hex code signature found in first error line. May occur with other non-related issues, but appears to be very rare. This issue is not flagged from this indicator alone.</li>`;
        }
        if (hasTruncatedCrashLogLength) {
            detectedIndicators += `<li>Very short, truncated crash log (${sections.fullLogFileLowerCase.length} characters) - usually ending in the <code>PROBABLE CALL STACK:</code> section</li>`;
        }
        if (hasAffectedCoreImpactFrameworkVersion) {
            detectedIndicators += `<li>Core Impact Framework version 1.1.1 detected - known affected version</li>`;
        }
        if (hasAffectedDismemberingFrameworkVersion) {
            detectedIndicators += `<li>Dismembering Framework version 1.1.2 detected - known affected version</li>`;
        }
        
        insights += `<li>❗ <b>Probable Core Impact Framework Corruption Bug Detected:</b>
            This appears to be the "1AD5B40 crash" caused by mod interaction between Core Impact Framework and Dismembering Framework.
            <ul>
                <li><b>Gate to Sovngarde (GTS)</b> modlist users:
                    <ul>
                        <li>This is a known issue with GTS v84 that has been resolved in later versions</li>
                        <li>Recommended fix: If you're using GTS version 84, <b>upgrade</b> to version 89 (or version 90 or newer if available and still compatible with your save files)</li>
                    </ul>
                </li>
                <li>Recommended fix for everyone else:
                    <ul>
                        <li><b>Upgrade both mods:</b> Update "Core Impact Framework" AND "Dismembering Framework" to their newest stable versions</li>
                        <li>Both mods should be updated together to resolve the interaction issue</li>
                    </ul>
                </li>
                <li>Technical notes:
                    <ul>
                        <li>This is reportedly a rare bug outside of Gate to Sovngarde modlist</li>
                        <li>The corruption occurs due to specific interaction between older versions of the two framework mods</li>
                    </ul>
                </li>
                <li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">
                    ${detectedIndicators}
                </ul></li>
            </ul>
        </li>`;
    }
    return insights;
}