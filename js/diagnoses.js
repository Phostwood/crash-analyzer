//All diagnosing functions for both analyzeLog.js's diagnoses and insights variables. Only use insights.js if there needs to be a version of a function unique to the insights variable

// --- Shared Constants ---
const verifyWindowsPageFileListItem = `💾 Verify your <a href="https://www.nolvus.net/appendix/pagefile">Windows Pagefile is properly configured</a> (nolvus.net link, but broadly applicable). For heavily-modded Skyrim, the most common recommendation is setting both the minimum and maximum Pagefile size to <b>40,000 MB (≈40 GB)</b>, particularly if you have 16GB of RAM or less. <b>NOTE:</b> If you are following a specific modlist like Nolvus or Lorerim, use their recommended pagefile settings. <a href="#" class="toggleButton">⤵️ show more</a>
<ul class="extraInfo" style="display:none">
    <li><b>Why 40GB?</b> This fixed size prevents the pagefile from needing to expand during gameplay, which some users report can cause crashes during memory usage spikes. The 40GB recommendation is widely adopted across major modlists (<a href="https://www.nolvus.net/appendix/pagefile">Nolvus</a>, <a href="https://www.lorerim.com/read-me">Lorerim</a>).</li>
    <li><b>Alternative view:</b> Some technical experts question whether fixed pagefiles provide measurable stability benefits, noting that modern Windows handles automatic pagefile expansion efficiently. They suggest using system-managed pagefiles to avoid dedicating 40GB of SSD space.</li>
    <li><b>RAM-based guidance:</b>
        <ul>
            <li>16GB RAM or less: 40GB fixed pagefile is commonly recommended, though some still prefer system-managed</li>
            <li>24-32GB RAM: 40GB fixed pagefile recommended, or system-managed if preferred</li>
            <li>64GB RAM or more: System-managed pagefile is usually sufficient</li>
        </ul>
    </li>
    <li><b>Microsoft's general formula when manually configuring pagefile size:</b> Minimum = 1.5x your RAM, Maximum = 3-4x your RAM (<a href="https://www.thewindowsclub.com/best-page-file-size-for-64-bit-versions-of-windows">source</a>). For 16GB systems, 40GB falls within this range (24-64GB). Your maximum should be at least your total RAM plus several hundred MB for memory crash dumps.</li>
    <li><b>For very heavy modlists:</b> Some users increase beyond 40GB, but 40GB is a safe baseline for most heavily-modded setups.</li>
</ul>`;


function reinstallEngineFixesInstructions (sections) {

    const reinstallEngineFixes = `
        <!--<ul>-->
            <li>WARNING: <a href="https://www.nexusmods.com/skyrimspecialedition/mods/17230">SSE Engine Fixes</a> is <strong>frequently misinstalled</strong>, so be careful to follow <a href="https://www.nexusmods.com/skyrimspecialedition/mods/17230?tab=posts">installation instructions</a> found in the top sticky posts in the mod's forum, to install BOTH parts:
                <ul>
                    <li>Part 1: The SKSE plugin. Be sure to download the current and correct version of Engine Fixes, for your version of Skyrim, and install with your mod manager</li>
                    <li>Part 2: DLL files are manually placed into Skyrim folder</li>
                </ul>
            </li>
            ${sections.hasEngineFixesPre7 ? `
                <li><b>For Engine Fixes prior to version 7:</b> Configure <code>EngineFixes.toml</code> with:
                    <ul>
                        ${sections.hasSkyrimAE1170 || sections.hasSkyrimSE1597 ? `
                            <li><b>Option 1 (Recommended):</b> <a href="https://www.nexusmods.com/skyrimspecialedition/mods/17230">Upgrade to latest version 7</a> of Engine Fixes for more bug fixes and better stability.</li>
                        ` : ''}
                        <li><b>Option ${sections.hasSkyrimAE1170 || sections.hasSkyrimSE1597 ? '2' : '1'}:</b> Download the <a href="https://www.nexusmods.com/skyrimspecialedition/mods/108069">pre-configured TOML file</a></li>
                        <li><b>Option ${sections.hasSkyrimAE1170 || sections.hasSkyrimSE1597 ? '3' : '2'}:</b> Manually configure following this <a href="https://www.reddit.com/r/skyrimmods/comments/tpmf8x/crash_on_load_and_save_corruption_finally_solved/">settings guide</a>. Verify/Edit these settings in <code>EngineFixes.toml</code> :
                            <ul>
                                <li><code>SaveGameMaxSize = true</code></li>
                                <li><code>MaxStdio = 8192</code></li>
                            </ul>
                        </li>
                    </ul>
                </li>
            ` : ''}
        <!--</ul>-->
    `;

    return reinstallEngineFixes;
}



//NonESL Plugins Count Warning
function checkForTooManyNonEslPlugins(crashLogSection) {
    const countInfo = Utils.countNonEslPlugins(crashLogSection);
    let diagnosis = '';

    if (countInfo.nonEslPluginsCount > 254) {
        diagnosis += `<li>🎯 <b>Exceeded Maximum ESMs+ESPs Plugins Limit!</b> Your load order has <code>${countInfo.nonEslPluginsCount}</code> non-ESL-ed plugins, which is too many. Skyrim can only handle up to 254 non-ESL-ed plugins. 255 or more will cause game instability and crashes. For more information and a screenshot from Mod Organizer 2 (MO2), refer to this <a href="https://www.reddit.com/r/Nolvus/comments/1b041m9/reference_keep_your_active_esmsesps_count_to_254/">post</a>.
        <ul>
            <li>Note: this number excludes <code>.esp</code> plugins that have been <i>flagged</i> as ESL, and are thus are displayed in the log with extra digits in their hex number (example: the uncounted <code>[FE 000]</code> versus the counted <code>[FF]</code>).</li>
            <li><a href = "${Utils.isSkyrimPage ? 'https://www.nexusmods.com/skyrimspecialedition/mods/21618' : 'https://docs.google.com/spreadsheets/d/10p_ZFCTxXg5ntdsQipOGLcMAnoYDOC4qBEIt5ZAOo-o/'}"> Information on safely squeezing in more mods.</a></li>
            <li><a href="https://www.nexusmods.com/skyrimspecialedition/mods/145168">ESLifier</a> - A tool to find ESL flaggable mods, compact form IDs, and patch ALL dependent plugins/files automatically.</li>
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
                <li>Verify its in the correct load order (check mod author's recommendation). NOTE: this is a very common issue when installing or updating Vortex Collections, but usually easily fixable by enabling all mods, and clicking "Sort Now" several times. See details in above "🤖 Best Practices for Auto-Installing Modlist Users" section.</li>
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
    Utils.debuggingLog(['hasCompatibleDll', 'analyzeLog.js'], `dllName: ${dllName}, dllVersionFromLog: ${dllVersionFromLog}, skyrimVersion: ${skyrimVersion}, compatData: ${JSON.stringify(compatData)}`);

    // NEW: If log's DLL version is below ignoreVersionsBelow, then assume compatible and skip
    if (compatData.ignoreVersionsBelow &&
        Utils.compareVersions(dllVersionFromLog, compatData.ignoreVersionsBelow) < 0) {
        Utils.debuggingLog(['hasCompatibleDll', 'analyzeLog.js'], 
            `TRUE: ${dllName} v${dllVersionFromLog} is below ignoreVersionsBelow (${compatData.ignoreVersionsBelow}), ignoring`);
        return true;
    }

    
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
                        <li>If you haven't already, upgrade your <a href="https://www.nexusmods.com/skyrimspecialedition/mods/17230">SSE Engine Fixes</a> to Version 7.0.18 or greater, as it includes a fix to prevent many of these crashes. NOTE: Skyrim version 1.6.140 (and possibly others?) appears to not be supported yet.</li>
                        <li>Compare multiple crash logs if possible. If subsequent crashes list the same texture or mesh files (see "Advanced Users" section below), you likely have a corrupt texture file or, less commonly, a corrupt mesh. Once you've identified the problematic mod, try downloading it again before reinstalling, as the corruption may have occurred during the initial download. For more details, see the Texture Issues and Mesh Issues sections in this report (in the Advanced Users section, below).</li>
                    </ol>
                </li>
                <li>System Memory Management:
                    <ol>
                        <li>Close unnecessary background applications that may be consuming memory.</li>
                        <li>${verifyWindowsPageFileListItem}</li>
                        <li>Return any overclocked hardware (<i>usually</i> <b>excluding</b> RAM using XMP or AMD EXPO) to stock speeds, as unstable overclocks are known for causing crashes that can look like memory issues in crash logs.</li>
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
                        <li>If you haven't already, upgrade your <a href="https://www.nexusmods.com/skyrimspecialedition/mods/17230">SSE Engine Fixes</a> to version Version 7.0.18 or greater, as it includes a fix to prevent many of these crashes.</li>
                        <li>Compare multiple crash logs if possible. If subsequent crashes list the same texture or mesh files (see their own sections in "Advanced Users"), you likely have a corrupt texture file or, less commonly, a corrupt mesh. Once you've identified the problematic mod, try downloading it again before reinstalling, as the corruption may have occurred during the initial download.</li>
                        <li>If the source mod has a corrupted image file, you can try using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/23316">Cathedral Assets Optimizer (CAO)</a> to repair potentially damaged texture/mesh/animation files. This tool can fix formatting issues and also optimize file sizes while maintaining visual quality.</li>
                        <li>If you identify a specific problematic image file in a source mod, contact the mod author for assistance or potential fixes.</li>
                    </ol>
                </li>
                <li>System Memory Management:
                    <ol>
                        <li>Close unnecessary background applications that may be consuming memory.</li>
                        <li>${verifyWindowsPageFileListItem}</li>
                        <li>Return any overclocked hardware (<i>usually</i> <b>excluding</b> RAM using XMP or AMD EXPO) to stock speeds, as unstable overclocks are known for causing crashes that can look like memory issues in crash logs.</li>
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

        if (sections.hasSkyrimAE) {
            diagnoses += '<li><b>Missing Expected Creation Club Content:</b> Some mods may require Creation Club content, and sometimes this step has been forgotten, or the downloading of CC content may have been incomplete. Look for more information in the related section directly below this one.</li>';
        }

        if (Utils.isSkyrimPage && sections.hasNewEslSupport && (sections.bottomHalf.toLowerCase().includes('EngineFixes.dll'.toLowerCase()) || sections.bottomHalf.toLowerCase().includes('EngineFixesVR.dll'.toLowerCase()) )) {
            diagnoses += `
            <li><b>Consider reinstalling:</b> <b>SSE Engine Fixes</b> <a href="#" class="toggleButton">⤵️ show more</a>
                <ul class="extraInfo" style="display:none">
                    ${reinstallEngineFixesInstructions(sections)}
                </ul>
            </li>`;
        }

        diagnoses +=
            `<li><b>Identifying Missing Masters:</b> Mod Organizer 2 (MO2) typically displays warning icons (yellow triangle with exclamation mark) for plugins with missing masters. <a href="https://imgur.com/izlF0GO">View Screenshot</a>. Or alternately, check the <b>🔎 Files/Elements</b> section of this report and look at mods higher up the list, which could help isolate which mod might be missing something. Review the mod on Nexus and consider reinstalling any likely causal mods to see if you missed a patch or requirement.</li>

            <li><b>Load Order Dependency Issue:</b> Even if all required masters are installed and enabled, a plugin can still fail if its dependencies are loaded <i>after</i> it in your load order. In this case, the dependent mod tries to access data that isn't yet available, leading to errors or crashes. Consult documentation for related mods, and use your mod manager's sorting tools to ensure masters and required plugins always load before the mods that depend on them. NOTE: this is a very common issue when installing or updating Vortex Collections, but usually easily fixable by enabling all mods, and clicking "Sort Now" several times. See details in above "🤖 Best Practices for Auto-Installing Modlist Users" section.</li>

            <li><b>Advanced Users</b> can use <a href="https://www.nexusmods.com/skyrimspecialedition/mods/164">SSEEdit (xEdit)</a> to isolate missing dependencies.</li>

            <li><b>Missing Dependency:</b> If you\'ve recently removed, disabled, or forgot to install a required mod, others may still depend on it. You might need to either install the missing dependency or remove its master requirement from dependent plugins. See this guide on <a href="https://github.com/LivelyDismay/Learn-To-Mod/blob/main/lessons/Remove%20a%20Master.md">Removing a Master Requirement</a>.</li>

            <li><b>Version Mismatch:</b> Ensure all your mods are compatible with your Skyrim version (SE or AE). Always check the mod\'s description page for version compatibility.</li>` +
            
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
        <ul>
            <li>For Skyrim AE (version 1.6+) down to Skyrim SE (version 1.5), we strongly recommend using <a href='https://www.nexusmods.com/skyrimspecialedition/mods/59818'>Crash Logger SSE</a> (newest version) instead. It provides more detailed crash information, aiding in better diagnosis.</li>
            <li><b>Additional Information when switching to Crash Logger SSE:</b>
                <ul>
                    <li>You don't need the old version of Crash Logger to run it. For simplicity's sake, we recommend not even downloading the old version or at least disabling it.</li>
                    <li>Be sure to <b>disable Trainwreck</b> and any other crash logging mods. Only have Crash Logger SSE enabled.</li>
                    <li>Trainwreck logs show up here: <code>[Your Documents]/My Games/Skyrim Special Edition/SKSE/Crashlogs</code></li>
                    <li>But Crash Logger SSE logs usually show up <b>one directory higher</b>. Note: It's often a long directory, so sort the files by <b>Date Modified</b> to have the most recent files at the top: <code>[Your Documents]/My Games/Skyrim Special Edition/SKSE/</code></li>
                </ul>
            </li>
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
            <li>Return any overclocked hardware (<i>usually</i> <b>excluding</b> RAM using XMP or AMD EXPO) to stock speeds, as unstable overclocks are known for causing crashes that can look like memory issues in crash logs.</li>
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


//🎯 NVIDIA Driver Issue Detected:
function analyzeNVIDIADriverIssue(sections, diagnosisOrInsight='diagnosis') {
    let insights = '';
    
    // Check if any NVIDIA DLL appears in first line
    const nvidiaFileInFirstLine = crashIndicators.nvidiaDriverIssues.codes.some(
        ({ code }) => sections.firstLine.toLowerCase().includes(code.toLowerCase())
    );
    
    // Get matching NVIDIA indicators
    const matchingNVIDIACodes = crashIndicators.nvidiaDriverIssues.codes.filter(
        ({ code }) => sections.topHalf.toLowerCase().includes(code.toLowerCase())        
    );

    if (nvidiaFileInFirstLine &&  diagnosisOrInsight !== 'diagnosis') {
        return '';
    }

    if (matchingNVIDIACodes.length >= 1 && (nvidiaFileInFirstLine || diagnosisOrInsight !== 'diagnosis')) {
        let detectionMessage = '';
        let detectedIndicators = '';
        const emoji = nvidiaFileInFirstLine ? '🎯' : '❗ Potential';
        
        if (nvidiaFileInFirstLine) {
            // Find which DLL file was detected in the first line
            const detectedDll = crashIndicators.nvidiaDriverIssues.codes.find(
                ({ code }) => sections.firstLine.toLowerCase().includes(code.toLowerCase())
            );
            
            // Remove duplicates: exclude the first-line DLL from the later list
            const filteredMatches = matchingNVIDIACodes.filter(
                ({ code }) => code.toLowerCase() !== detectedDll.code.toLowerCase()
            );
            
            detectionMessage = 'The appearance of NVIDIA driver files in the first line of your crash log is often associated with NVIDIA graphics driver issues.';
            detectedIndicators = `<li><code>${detectedDll.code}</code> - ${detectedDll.description} detected in first line</li>`;
            filteredMatches.forEach(({ code, description }) => {
                detectedIndicators += `<li><code>${code}</code> - ${description}</li>`;
            });
        } else {
            detectionMessage = 'NVIDIA driver files were found in your crash log, which may indicate graphics driver issues.';
            matchingNVIDIACodes.forEach(({ code, description }) => {
                detectedIndicators += `<li><code>${code}</code> - ${description}</li>`;
            });
        }
        
        insights += `
        <li>${emoji} <b>NVIDIA Driver Issue Detected:</b> ${detectionMessage}
            <ol>
                <li><b>Update your NVIDIA drivers</b> to the latest version. You can download the latest drivers from the <a href="https://www.nvidia.com/Download/index.aspx">NVIDIA website</a>.</li>
                <li>Check for any GPU overclocking settings that may be causing instability and reset them to stock speeds.</li>
                <li>Check if any graphics mods like ENB or Upscaler or Reshade, etc. are hooking into the graphics driver by overriding the detected file(s) (see "Detected indicators" below). If so, experiment with disabling, reinstalling, reconfiguring and/or checking for related conflicts.</li>
                <li>If the above does not resolve the issue, try performing a clean installation of the drivers using a tool like Display Driver Uninstaller (DDU) to remove all traces of the previous drivers before installing the new ones.</li>
                <li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a>
                    <ul class="extraInfo" style="display:none">
                        ${detectedIndicators}
                    </ul>
                </li>
            </ol>
        </li>`;
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
    const dawnguardHorseIssue = sections.topHalfFullLog.includes("Skyrim Immersive Creatures") && sections.topHalfFullLog.includes("Dawnguard Horse")
        && (sections.topHalfFullLog.includes("Isran") || sections.topHalfFullLog.includes("Celann") );
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


//❗ Probable NavMesh or AI Pathing Issue Detected:
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
        pathingInsights += `<li>${isHighPriority ? '❗' : '❓'} <b>${isHighPriority ? 'Probable' : 'Possible'} NavMesh or AI Pathing ${isHighPriority ? 'Issue Detected' : 'Indicators Found'}:</b> 
            <p>An NPC or creature appears to be blocked from their expected navigation path. This can occur when an obstacle (such as a tree, rock, or clutter object) has been added by a mod that conflicts with the navigation mesh. AI pathing mods may also be incompatible or malfunctioning. Troubleshooting options are below:</p>
            <ol>
                <li>Potential easy fixes:
                    <ul>
                        <li>Some issues can be fixed by quitting to desktop, relaunching Skyrim and then loading an <b>older save</b></li>
                        <li>Sometimes asking <b>followers</b> to wait behind can get you past a NavMesh Pathing glitch. Some follower mods and/or follower frameworks will allow you to teleport your follower to you afterwards to rejoin your party.</li>
                        <li>If using a <b>horse</b> or mount, command mount to wait before fast traveling</li>
                        <li>If using a horse/mount and a <b>follower framework</b> (like Nether's Follower Framework), try disabling horse followers in its Mod Configuration Menu (MCM)</li>
                        ${!sections.hasNolvusV6 ? '<li>Consider trying the <a href="https://www.nexusmods.com/skyrimspecialedition/mods/52641">Navigator - Navmesh Fixes</a> mod (be sure to read notes on where to insert it in your load order)</li> ' : ''}
                        <li>Try toggling all <b>NPC's AI movement off</b> temporarily using the <a href="https://skyrimcommands.com/command/tai">tai</a> and/or <a href="https://skyrimcommands.com/command/tcai">tcai</a> Skyrim <a href="https://en.uesp.net/wiki/Skyrim:Console">console commands</a>. This can be used to help verify a navmesh/pathing related issue and/or to potentially get you past a crash point as a workaround. Simply use the same command(s) again afterwards to toggle NPC movement back on.</li>
                    </ul>
                </li> 
                <li>Advanced Troubleshooting:
                    <ul>
                        <li>If you have any <b>AI pathing or behavior mods</b> installed (such as NPC AI overhauls, movement mods, or follower AI enhancements), try temporarily disabling them to test for potential incompatibilities or malfunctions. Re-enable one at a time to identify which specific mod may be causing the issue.</li>
                        <li>For persistent issues with specific NPCs or creatures unable to find a path, consider removing the problematic entity from your save file. Review the 🔎<b>Files/Elements</b> section of this report to identify relevant NPCs or creatures, then search for their occurrences in the crash log to find their FormIDs. FormIDs starting with either "0xFF" or "FF" indicate dynamically generated entities—these are safer to remove because they are created during gameplay rather than being permanent game assets.  While removing these entities can provide a temporary solution to allow your save file to load, be aware that the underlying issue may recur if the root cause isn't addressed. Such entities can be removed using <a href="https://www.nexusmods.com/skyrim/mods/76776">FallrimTools ReSaver</a> with minimal risk since the game should be able to regenerate them if needed. Always create a backup of your save file first.
                            <ul>
                                <li>After loading your save in ReSaver, use the search bar to locate the specific FF FormID you found in the crash log. Delete the corresponding entry, then save your game under a new filename. This should allow the problematic save to load, hopefully giving you an opportunity to bypass the issue, and/or investigate and address the underlying conflict</li>
                            </ul>
                        </li>
                        <li>Consider disabling relevant location-modifying mods to identify conflicts. Also consider disabling mods that show up in the "Files/Elements" outline (higher up in this report).</li>
                        <li>Consider using <a href = "https://www.nexusmods.com/skyrimspecialedition/mods/136456">Debug Menu - In-Game Navmesh Viewer and More</a> to isolate issues and request fixes/patches from mod author(s)</li>
                        <li>Additional references for advanced users: 
                            <ol>
                                <li><a href="https://www.nexusmods.com/skyrimspecialedition/mods/119872">Kojaks NavMesh Hub</a></li>
                                <li><a href="https://www.reddit.com/r/skyrimmods/comments/18s65sy/comment/kf7qpg1/?context=3&share_id=RfGnt0VSng-ABoIF5tgRk&utm_content=1&utm_medium=ios_app&utm_name=ioscss&utm_source=share&utm_term=1">bachmanis' throughts on troubleshooting navmesh issues</a> (see specific replies)</li>
                                <li><a href="https://www.reddit.com/r/skyrimmods/comments/1d0r0f0/reading_crash_logs/##:~:text=These%20are%20Navmesh%20errors">Krispyroll's Reading Crash Logs Guide</a> (see specific section)</li>
                            </ol>
                        </li>
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
        <li>Try <a href="https://www.reddit.com/r/skyrimmods/comments/tpmf8x/crash_on_load_and_save_corruption_finally_solved/">expanding your save file size</a>. Then open the last save that works and play on from there, and hopefully, there will not be any more crashes. Requires the <b>HIGHLY RECOMMENDED</b> foundational mod <a href="https://www.nexusmods.com/skyrimspecialedition/mods/17230">SSE Engine Fixes</a>. Be sure to carefully follow <a href="https://www.nexusmods.com/skyrimspecialedition/mods/17230?tab=posts">installation instructions</a> found in the top sticky posts in the mod's forum, for the correct versions of both Parts 1 and 2.
            ${sections.hasEngineFixesPre7 ? `
                <ul>
                    <li><b>For Engine Fixes prior to version 7:</b> Verify these settings in <code>EngineFixes.toml</code></li>
                    <ul>
                        <li><code>SaveGameMaxSize = true</code></li>
                        <li><code>MaxStdio = 8192</code></li>
                    </ul>
                    ${sections.hasSkyrimAE1170 || sections.hasSkyrimSE1597 ? `
                        <li><b>Or alternately,</b> (recommended) <a href="https://www.nexusmods.com/skyrimspecialedition/mods/17230">upgrade to latest version 7</a> of Engine Fixes for more bug fixes and better stability.</li>
                    ` : ''}
                </ul>
            ` : ''}
        </li>`;

        insights += `
        <li>❓ <b>BGSSaveLoadManager Issue Detected:</b> This indicator is often associated with problems either saving and/or loading game save files.
        <ol>
            <li>If the crash <b>only occurs while <i>saving</i></b>, you may have a Missing Masters. You will likely see separate troubleshooting steps for that higher up in this report, and if not, you can find them by using this analyzer's "use the Test Log" link at the top.</li>
            ${sections.hasEngineFixesPre7 && Utils.isSkyrimPage ? checkSaveFileSize : ''}
            <li>If crash is repetitive, try loading from your <b>last working save</b>. If possible, identify this file, and load this last save game that worked and try to play from there.</li>
            <li>💾 Consider using save cleaning tools to remove orphaned scripts and other potential corruption. <a href="https://www.nexusmods.com/skyrim/mods/76776">FallrimTools ReSaver</a> can often identify and sometimes successfully fix corrupted save files. See also these <a href="https://www.reddit.com/r/skyrimmods/s/fbMRv343vm">instructions by Krispyroll</a> and more information in <a href="https://www.reddit.com/r/skyrimmods/comments/1d0r0f0/reading_crash_logs/##:~:text=Resaver">Krispyroll's Reading Crash Logs Guide</a>. NOTE: Always keep backups of your saves before attempting fixes or using cleaning tools. ⚠️ <strong>CAUTION:</strong> Fixing/editing save files has inherent risks and should be avoided when possible. If you can instead revert to an acceptable older save file, that is often preferable in the long run.</li>
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

    // Check for KERNELBASE Crash EXCLUDING JContainers and JSON parse error
    if (sections.firstLine.toLowerCase().includes('KERNELBASE.dll'.toLowerCase()) && 
        !jContainersCrash && 
        !win24H2UpscalerCrash &&
        !sections.topHalf.includes('json.exception.parse_error')) {
        
        /* //Top Section Version NO LONGER USED, deemed too misleading for the top section
        
        if (!Utils.isSkyrimPage && isDiagnosesSection) { // SHORT VERSION - Only for Nolvus in diagnoses section
            
            diagnoses += `
                <li>❗ <b>KERNELBASE Crash Detected:</b> This rare issue could be related to a specific added mod, or to hardware or a system-wide issue. Here are some steps you can try:
                    <ol>
                        <li><b>First</b>, try to reproduce the crash after rebooting your PC and playing the game again. If this was a one-time occurrence, you probably don't need to follow the more intensive troubleshooting steps below.</li>
                        <li>Review the rest of the advice in this report (from the top of this page to the bottom), and see if there are strong indications of any better-isolated issue. Many times other mods/issues can cause a "KERNELBASE Crash".</li>
                        <li>${verifyWindowsPageFileListItem}</li>
                        <li>Check with the <b>Nolvus community</b> to see if others are encountering this issue due to a new Windows update or the like.</li>
                        <li>You can restore the original sorting of all vanilla Nolvus v5 mods using the <b>Apply Order</b> button in the Nolvus Dashboard. For more information and a screenshot, see this r/Nolvus post <a href="https://www.reddit.com/r/Nolvus/comments/1kp1lrw/guide_using_the_apply_order_button_in_nolvus/">How To: "Apply Order" button usage in the Nolvus Dashboard</a>.</li>
                        <li><b>Reinstall Nolvus</b> to ensure the installation is not corrupted. Make sure to back up any important data before doing this. For detailed instructions, see this <a href="https://docs.google.com/document/d/1R_AVeneeCiqs0XGYzggXx34v3Ufq5eUHNoCHo3QE-G8/edit">guide</a>.</li>
                        <li>Check the <b>Windows Event Log</b> for any related issues. You can do this by opening the Event Viewer (search for it in the Start Menu), then navigate to Windows Logs > Application. Look for any recent errors that might be related to your issue. For detailed instructions, see this <a href="https://support.microsoft.com/en-us/windows/open-event-viewer-17d427d2-43d6-5e01-8535-1fc570ea8a14">Microsoft guide</a>.</li>
                        <li>If the issue persists, consider reaching out to the <b>Nolvus Discord</b> for additional help.</li>
                        <li>NOTE: Many more details for this issue are available in the "Advanced Users" section of this report.</li>
                    </ol>
                </li>`;
        } else if ((Utils.isSkyrimPage && isDiagnosesSection) || (!Utils.isSkyrimPage && !isDiagnosesSection) ) { // LONG VERSION - For non-Nolvus or when not in diagnoses section
        */
        
        diagnoses += `
            <li>❓ <b>KERNELBASE Crash Detected:</b> This issue can be caused by many different factors: usually by a specific mod, but sometimes by a hardware problem, or system-wide issues like Windows Updates, malware, drive corruption, or corrupted file permissions. Here are troubleshooting steps to consider, ordered from easiest to most difficult:
                <ol>
                    <li><b>First</b>, try to reproduce the crash after rebooting your PC and playing the game again. If this was a one-time occurrence, you probably don't need to follow the more intensive troubleshooting steps below.</li>
                    <li>Review the rest of the advice in this report (from the top of this page to the very bottom), and see if there are strong indications of any better-isolated isolated issue. Most often other mods/issues will be the cause a "KERNELBASE Crash".</li>

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
                    
                    <li>Try <b>disabling mods</b> ${!Utils.isSkyrimPage ? 'you may have added to Nolvus' : ''} in large, gradually shrinking and more isolating groups to see if the issue persists. <b>Start with SKSE plugins</b> (those ending in <code>.dll</code>) as they're particularly sensitive to Windows updates and system changes. They can be usually be safely disabled in groups of 5-10 to identify issues (except for Engine Fixes, which should stay enabled). If you didn't already above, consider starting with mods that show up in the 🔎<b>Files/Elements</b> section of this report. This can help identify if a specific mod is causing the problem.</li>
                    
                    <li>Reset your <b>file permissions</b>. ⚠️CAUTION: Make certain to <b>backup</b> any important data before doing this. See <a href="https://www.thewindowsclub.com/how-to-reset-file-folder-permissions-to-default-in-windows-10">How to reset all User Permissions to default in Windows 11/10</a>, or seek assistance from the ${Utils.SkyrimOrNolvusText} community. Alternatively, an easy <b>workaround</b> is to <a href = "https://support.microsoft.com/en-us/windows/create-a-local-user-or-administrator-account-in-windows-20de74e0-ac7f-3502-a866-32915af2a34d#WindowsVersion=Windows_11">create a new Windows User</a> and create a new ${Utils.SkyrimOrNolvusText} save (playthrough) from the new user.</li>
                    
                    <li><b>Use CHKDSK</b> to scan your hard drive for any corruption. You can do this by opening the Command Prompt as an administrator and running the command <code>chkdsk /f</code>. Note that you might need to restart your computer for the scan to run. Be aware that frequent use of <code>chkdsk</code> on SSDs can potentially shorten its lifespan due to the intensive write operations it performs. ⚠️CAUTION: Make certain to <b>backup</b> any important data before doing this.</li>
                    
                    ${Utils.isSkyrimPage ? `
                    <li>If you are using an auto-installed modlist (like a Wabbajack or Nexus Collection) <b>consider reinstalling</b> it to ensure your current installation is not corrupted. ⚠️CAUTION: Make certain to <b>backup</b> any important data before doing this.</li>
                    ` : ''}
                    
                    <li>Perform a <b>Repair Upgrade</b> using the Windows 11 or Windows 10 ISO file. For detailed instructions, see this <a href="https://answers.microsoft.com/en-us/windows/forum/all/how-to-perform-a-repair-upgrade-using-the-windows/35160fbe-9352-4e70-9887-f40096ec3085">guide</a>. ⚠️CAUTION: Make certain to <b>backup</b> any important data before doing this.</li>

                    <li>If you are still encountering this issue (and after also consulting with the ${!Utils.isSkyrimPage ? 'Nolvus community' : 'Skyrim modding community'}), review the remaining ideas in <a href="https://malwaretips.com/blogs/kernelbase-dll-what-it-is-how-to-fix-errors/">Kernelbase.dll: What It Is & How To Fix Errors</a>. ⚠️CAUTION: it is probably best to avoid doing a full Sytem Restore or Resetting your PC unless you really <b>know what you are doing</b>, and you are encountering kernel errors with additional software besides just Skyrim. ⚠️CAUTION: Make certain to <b>backup</b> any important data before doing this.</li>
                </ol>
            </li>
        `;
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
                        ${reinstallEngineFixesInstructions(sections)}
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
function analyzeFirstLine(sections, diagnosisOrInsight) {
    let insights = '';
    const ignoreFiles = ['Dawnguard.esm', 'Dragonborn.esm', 'null', 'null)', 'SkyrimSE.exe', 'skyrim.esm', 'SkyrimVR.exe', 'VCRUNTIME140.dll', 'ntdll.dll', 'JContainers64.dll', 'skee64.dll', 'KERNELBASE.dll', 'DbSkseFunctions.dll', 'nvngx_dlssg.dll', 'XAudio2_7.dll', ...crashIndicators.nvidiaDriverIssues.codes.map(({ code }) => code), ...crashIndicators.sseEngineFixesFiles.codes.map(({ code }) => code)]; //NOTE: these already have their own specific and better test, or are just too generic/foundational to realistically place blame on 
    const insightFiles = ['po3_PapyrusExtender.dll', 'PapyrusTweaks.dll', 'skse64_1_6_1170.dll', 'skse64_1_6_1179.dll', 'skse64_1_6_640.dll', 'skse64_1_5_97.dll', 'sksevr_1_4_15.dll', 'fiss.dll']; //NOTE: these are placed near the bottom of the report, since they are usually not at fault, and putting them at the top gives these intructions too much priority
    
    // Extract filename from sections.firstLine (actual location can vary between log types) if it exists
    const firstLine = sections.firstLine || '';
    const fileMatch = firstLine.match(/\b([^\/\\\s]+\.(?:esm|exe|esp|esl|dll|pex|skse|skse64))\b/i);
    const detectedFile = fileMatch ? fileMatch[1] : null;
    
    // Case-insensitive comparison helper
    const caseInsensitiveIncludes = (array, value) => {
        return array.some(item => item.toLowerCase() === value.toLowerCase());
    };
    
    if (detectedFile && !caseInsensitiveIncludes(ignoreFiles, detectedFile)) {
        const isInsightFile = caseInsensitiveIncludes(insightFiles, detectedFile);
        
        // Return blank string if diagnosis section and file is in insightFiles
        if (diagnosisOrInsight === 'diagnosis' && isInsightFile) {
            return '';
        }
        
        // Return blank string if insight section and file is NOT in insightFiles
        if (diagnosisOrInsight === 'insight' && !isInsightFile) {
            return '';
        }
        
        // Determine icon based on section
        const icon = diagnosisOrInsight === 'insight' ? '❓' : '❗';

        const raw = Utils.explainersMap.get(detectedFile);
        const cleaned = typeof raw === "string" ? raw.trim() : raw;
        const explanation = (cleaned && cleaned !== "undefined") ? ` ${cleaned}` : "";

        
        insights += `
        <li>${icon} <b>First-Line Error Detected:</b> <code>${detectedFile} ${explanation}</code> 
            <ol>
                <li>First, skim other sections of this report (above and below) for any more-specific issues that may involve <code>${detectedFile}</code>. (Scroll up to the top and down to the very bottom of the page to ensure you've reviewed everything.)</li>
                <li>Make sure the mod that contains <code>${detectedFile}</code> is enabled (Vortex especially sometimes disables them). If already enabled, consider redownloading and carefully reinstalling the mod, as this may be a quickest fix.</li>
                <li><strong>What This Means:</strong>
                    <ul>
                        <li>The file <code>${detectedFile}</code> is directly involved in the crash sequence</li>
                        <li>While this file is related to the crash, <b>it may not be the root cause</b></li>
                        <li>This type of error often indicates missing dependencies, version mismatches, or incompatible files</li>
                        <li>Infrastructure mods (examples: <code>EngineFixes.dll</code>, <code>OpenAnimationReplacer.dll</code>, <code>PapyrusTweaks.dll</code>, <code>po3_PapyrusExtender.dll</code>, <code>skse64_1_6_1170.dll</code>, etc.) are typically not at fault. Instead, review mods that list these infrastructure mods as a dependency.</li>
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



//🎯 Paid FSR3 Upscaler Issue Detected:
function analyzePaidFSR3UpstalerIssue(sections) {
    let insights = '';
    const dllFileName = 'nvngx_dlssg.dll';
    
    if (sections.firstLine.toLowerCase().includes(dllFileName.toLowerCase())) {
        insights += `
        <li>🎯 <b>Paid FSR3 Upscaler Issue Detected:</b> Having the <code>${dllFileName}</code> file showing up in the first line of your crash log is frequently linked to NVIDIA graphics drivers and/or Puredark's paid upscaler (FG Build Alpha 03 and later).
            <ol>
                <li><b>Update your NVIDIA drivers</b> to the latest version. You can download the latest drivers from the <a href="https://www.nvidia.com/Download/index.aspx">NVIDIA website</a>.</li>
                <li><b>Incompatible settings in the upscaler:</b> Choosing a bad upscale type or other setting can cause this issue. Review and verify the recommended settings in <a href="https://docs.google.com/document/d/1YVFKcJN2xuvhln9B6vablzOzQu-iKC4EDcbjOW-SEsA/edit?usp=sharing">Nolvus DLSS Upscaler Installation Guide</a>.</li>
                <li><b>Incompatible hardware:</b> This issue can also be caused by incompatible hardware (AMD instead of NVIDIA, GTX instead of RTX, RTX non-40xx instead of RTX 40xx, and so on).</li>
                <li>Check for any GPU overclocking settings that may be causing instability and reset them to stock speeds.</li>
                <li>If the above does not resolve the issue, try performing a clean installation of the drivers using a tool like Display Driver Uninstaller (DDU) to remove all traces of the previous drivers before installing the new ones.</li>
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
    let hasSecondaryIndicators = sections.topHalfFullLog.toLowerCase().includes('BGSStoryManagerBranchNode'.toLowerCase())
        && sections.topHalfFullLog.toLowerCase().includes('PlayerCharacter'.toLowerCase());
    if (hasPrimaryIndicator && hasSecondaryIndicators) {
        insights += `<li>🎯 <b>.STRINGS Crash Detected:</b> This error typically occurs when there is a unique or non-standard character in the <code>sLanguage</code> line of your <b>skyrim.ini</b> file. To resolve this issue:<ol>
            <li>Locate your <b>skyrim.ini</b> file.</li>
            <li>Optionally, make a quick backup copy of this file and store it outside your ${Utils.SkyrimOrNolvusText} installation.</li>
            <li>Open the original file for editing, and locate the line that reads <code>sLanguage=ENGLISH</code>.</li>
            <li>Ensure that there are no unique characters or typos in this line. It should only contain standard text. Even a dot above the "<code>I</code>" (ex: "<code>ENGLİSH</code>") or the like can cause a crash.</li>
            <li>Save the changes and restart ${Utils.SkyrimOrNolvusText} to see if the issue has been resolved.</li>
            <li>See <a href="https://raw.githubusercontent.com/Phostwood/crash-analyzer/refs/heads/main/images/corruptstringsfixtutorial.png">screenshot tutorial</a> by Discrepancy using Mod Organizer 2 (MO2).
            <li>More information and troubleshooting tips under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-1">.STRINGS Crash</a/>.</li>
            <li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a>
                <ul class="extraInfo" style="display:none">
                    <li><code>.STRINGS</code> - detected in top third of the log (<i>above</i> the Stack section)</li>
                    <li><code>'BGSStoryManagerBranchNode'</code> - detected in top half of the log (<i>above</i> the mod lists)</li>
                    <li><code>'PlayerCharacter'</code> - detected in top half of the log (<i>above</i> the mod lists)</li>
                </ul>
            </li>
            </ol></li>`;
    }
    return insights;
}




//❓No highest-confidence crash indicators detected.
function generateNoCrashDetectedMessage(sections) {
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
                        <li>Return any <b>overclocked hardware</b> (<i>usually</i> <b>excluding</b> RAM using XMP or AMD EXPO) to stock speeds.</li>
                    </ul>
                </li>
                <li>🔧Verify that you have already correctly installed and configured <b>SSE Engine Fixes</b>: <a href="#" class="toggleButton">⤵️ show more</a>
                    <ul class="extraInfo" style="display:none">
                        ${reinstallEngineFixesInstructions(sections)}
                    </ul>
                </li>
                <li>Towards isolating the cause, try individually disabling any mods listed in the "🔎 <b>Files/Elements</b>" section of this report (see below). Be mindful of any dependencies when doing so. Generally either test with a new character, and/or avoid saving while testing with an existing character.</li>
                <li>Also, review and install any missing <a href="https://www.reddit.com/r/skyrimmods/wiki/essential_mods/#wiki_essential_bugfixes">Essential Bugfixes</a> applicable to your modlist</li>
                <li>Check your <b>load order</b> against <a href="https://www.reddit.com/r/skyrimmods/wiki/begin2/">r/SkyrimMod's Beginner's Guide</a> guidelines</li>
                <li>${Utils.LootIfSkyrim}</li>
                <li><b>If you haven't already</b>, share your logs with <a href="https://www.reddit.com/r/skyrimmods/">r/SkyrimMods</a>. Share multiple logs (using <a href="http://www.pastebin.com">www.pastebin.com</a>) when possible and mention in your post that you've already used Phostwood's analyzer and followed its recommendations. The manual crash log reading gurus there can catch some things that automated analyzers will never be able to. This tool only aims to help with 70 to 90% of human-solvable crash logs...</li>
                <li><b>As a last resort:</b> Try disabling groups of mods at a time (being mindful of masters and dependencies) until the crash stops. While tedious, this can help isolate almost any problematic mod combinations.</li>
            </ol>
        </li>`;
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
                                <li>Return any <b>overclocked hardware</b> (<i>usually</i> <b>excluding</b> RAM using XMP or AMD EXPO) to stock speeds.</li>
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
    
    // Files to skip - these match the overlay pattern but aren't actual overlays
    const skipFiles = ['overlayfix.dll', 'gameoverlayrenderer64.dll'];
    
    // Track which specific files were found for each overlay
    const overlayFileMap = new Map();
    
    // Helper function to add unique overlay to list
    function addUniqueOverlay(overlay, filename = null) {
        if (!overlayFiles.includes(overlay)) {
            overlayFiles.push(overlay);
            overlayFileMap.set(overlay, []);
        }
        if (filename && !overlayFileMap.get(overlay).includes(filename)) {
            overlayFileMap.get(overlay).push(filename);
        }
    }

    // Check for overlay DLLs in top half
    const simplifiedOverlayRegex = /\b\w*overlay\w*\.dll\b/gi;
    const matches = sections.topHalf.match(simplifiedOverlayRegex) || [];

    // Process regex matches
    for (const match of matches) {
        // Skip files that aren't actual overlays
        if (skipFiles.includes(match.toLowerCase())) {
            continue;
        }
        
        overlayInTopHalf = true;
        let found = false;
        for (const [overlay, files] of Object.entries(window.overlaySignatures)) {
            if (files.some(file => file.toLowerCase() === match.toLowerCase())) {
                addUniqueOverlay(overlay, match);
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
        for (const file of files) {
            if (logFile.toLowerCase().includes(file.toLowerCase())) {
                addUniqueOverlay(overlay, file);
                if (overlay !== 'Steam' && sections.topHalf.toLowerCase().includes(file.toLowerCase())) {
                    overlayInTopHalf = true;
                }
            }
        }
    }

    // Special case for Steam
    if (sections.topHalf.toLowerCase().includes('gameoverlayrenderer64.dll')) {
        addUniqueOverlay('Steam', 'gameoverlayrenderer64.dll');
    }

    // Remove files that aren't actual overlays
    overlayFiles = overlayFiles.filter(file => 
        !skipFiles.includes(file.toLowerCase())
    );

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
                overlayFiles.map(overlay => {
                    const foundFiles = overlayFileMap.get(overlay);
                    if (foundFiles && foundFiles.length > 0) {
                        return `<li>${overlay}: &nbsp; <code>${foundFiles.join(', ')}</code></li>`;
                    } else {
                        return `<li><code>${overlay}</code></li>`;
                    }
                }).join('') +
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
        loaderInsights +=
        `<li>❓ <b>Possible Animation Loader/Behavior Engine Issue Detected:</b> To fix this, please follow these steps:
            <ol>
                <li>Regenerate/patch your animations using your behavior engine:
                    <ul>
                        <li>General requirements for behavior engines:
                            <ul>
                                <li>Clear the behavior engine's cache before regenerating</li>
                                <li>Check/enable all relevant boxes/options to generate the correct files for your installed mods</li>
                            </ul>
                        </li>
                        <li>If using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/3038">FNIS</a>, consider upgrading to Nemesis or Pandora instead. Otherwise run GenerateFNISforUsers.exe</li>
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

                loaderInsights +=
            `</ol>
        </li>`;
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
                <ul>
                    ${reinstallEngineFixesInstructions(sections)}
                </ul>
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
    let hasCommunityShaders = false;

    function findShaderCodeIssues(sections) {
        return crashIndicators.enbShaderLightingIssues.codes.filter(({ code }) =>
            sections.topHalf.toLowerCase().includes(code.toLowerCase())
        );
    }

    if (sections.topHalf.toLowerCase().includes('communityshaders.dll') ) {
        hasCommunityShaders = true;
    }

    const shaderCodeIssues = findShaderCodeIssues(sections);
    Utils.debuggingLog(['analyzeENBShaderLightingIssues', 'analyzeLog.js'], 'shaderCodeIssues:', shaderCodeIssues);

    if (shaderCodeIssues.length > 0) {
        shaderInsights += `<li>❓ <b>Possible Shader/Lighting Issue:</b> While this crash includes indications of lighting/shadows/shader/enb systems, the root cause often lies elsewhere. Follow these steps:
        <ol>
        ${(hasCommunityShaders) ? '<li>☂️ <b>Possible Community Shaders Issue:</b> As a potential quick fix, try deleting the ShaderCache folder (e.g., <code>C:\\Program Files (x86)\\Steam\\steamapps\\shadercache</code> ) or press the [End] key in-game and click "Clear Shader Cache" via the menu ... Community Shaders will then rebuild in game, and/or on next launch.</li>' : ''}
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
    
    // Check for any Engine Fixes related DLLs
    const engineFixesFiles = [...crashIndicators.sseEngineFixesFiles.codes.map(({ code }) => code)];
    const foundFile = engineFixesFiles.find(file => 
        sections.firstLine.toLowerCase().includes(file.toLowerCase())
    );
    
    if (foundFile) {  // If we found any Engine Fixes file in the first line
        diagnoses += `
            <li>❗ <b>First-Line Engine Fixes Issue:</b> <code>${foundFile}</code> in the first error line of the crash log may indicate an improperly installed Engine Fixes mod, or that a mod which uses it may have an issue or incompatibility.
                <ul>
                    ${reinstallEngineFixesInstructions(sections)}
                    <li><b>Once confident Engine Fixes is correctly installed</b>, if issue still reoccurs, attempt to isolate conflicting or problematic mod(s) by temporarily disabling mods (one-by-one, or in shrinking groups) which show up in the <b>🔎 Files/Elements</b> section of this report</li>
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
        modInsights += `<li>📊 <b>Mod Prominence Analysis</b> <code><span style="color:darkorange">(appearances : details):</span></code><br>By itself, this list does NOT indicate causation.
            <ul>
                ${!window.location.href.toLowerCase().includes('?tryformids') ? '<li>NOTE: results may be more accurate with "Display nested Log Summary" (see checkbox at top of page)</li>' : ''}`;
                // Add sorted mods to the list
                entries.forEach(([filename, stats]) => {
                    modInsights += `
                        <li><code><span style="color:darkorange">(${stats.count} : ${stats.sectionsCount})</span> ${filename}</code></li>`;
        });

        modInsights += `
            </ul>
            <ul style="list-style: none; margin-top: 10px; padding-left: 0;">
                <li>
                    <i>Interpretation Guide:</i> <a href="#" class="toggleButton">⤵️ show more</a>
                    <div class="extraInfoOL" style="display:none; margin-top: 10px;">
                        <p><i>The above mods appear frequently and/or with detailed information in the crash log. While this can indicate relevance to the crash cause, these mods might simply be more verbose in their logging and/or happened to be more active in the time leading up to the crash.</i></p>
                        <ol>
                            <li>🎯 <b>Highest-Confidence Indicators</b> (below) are typically a better determiner of a crash's cause. But this prominence list is often a useful supplement.</li>
                            <li>This indicator is less likely to be causal unless it repeats across multiple related crash logs</li>
                            <li>If multiple related crash logs do not contain better indications (above or below), consider temporarily disabling the top-listed mod and any dependent mods, and attempt to reproduce the crash<ul>
                                <li>NOTE: If tested from an old game save, many mods may cause different crashes from being removed. So, this test might need to be conducted from a new character.</li>
                            </ul></li>
                            <li>If the crash stops, investigate that mod's documentation and forum for any updates, known issues and/or patches, as well as its requirements, recommended load order and any incompatibilities. Also consider any recent changes to your load order which might have affected this mod.</li>
                            <li>If the crash continues (or if disabling this mod was infeasible), re-enable and try the next mod</li>
                            ${Utils.LootListItemIfSkyrim}
                        </ol>
                    </div>
                </li>
            </ul>
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
        const hasBeesInstalled = sections.fullLogFileLowerCaseFullLog.includes('BackportedESLSupport.dll'.toLowerCase());
        
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
        insights += `<li>❓ <b>XAudio Issue Detected:</b> Seeing 'XAudio' in the crash log may indicate a problem with the game's audio processing components. XAudio is part of the Windows audio infrastructure, separate from DirectX. This crash is often caused by audio driver issues or incompatible mods. Try these steps:<ol>
            <li>As a potentially easy fix, try adding the <a href="https://www.nexusmods.com/skyrimspecialedition/mods/71567">Sound Fix for Large Sector Drives</a> mod</li>
            <li>Ensure your sound card drivers are up to date. Visit your sound card manufacturer's website for the latest driver software.</li>
            <li>Change your Windows audio format to a lower sample rate. Right-click your speaker icon in the system tray, select "Open Sound settings," then go to "Advanced" and try changing the sample rate to 16 bit, 44100 Hz (or lower). This resolves many XAudio crashes.</li>
            <li>Check the game's audio settings and adjust them if necessary.</li>
            <li>If you're using audio-related mods, verify their compatibility with your version of Skyrim and that they don't conflict with other installed mods.</li>
            <li>Try reinstalling Direct X, as this sometimes helps. See <a href="https://mspoweruser.com/how-to-reinstall-directx-on-windows-11-a-step-by-step-guide/">How To Reinstall DirectX On Windows 11: A Step-by-Step Guide</a></li>
            <li>Disable the "Touch Keyboard and Handwriting Panel Service" in Windows (if present on your device). Press Win + R, type 'services.msc', press Enter. Find 'Touch Keyboard and Handwriting Panel Service', double-click it, click Stop, and select 'Disabled' at 'Startup type'. This service has been known to interfere with XAUDIO2_7.dll and cause crashes in games (often around 15 minutes into gameplay). Note: This service normally only exists on touchscreen-enabled devices. If you don't see it in your services list, skip this step.</li>
            <li>Disable all mods and launch the game to confirm the crash is resolved. If it is, systematically re-enable mods in small groups to isolate which mod(s) are causing the issue.</li>
            <li>Consult the Skyrim modding community forums (such as r/skyrimmods) for specific solutions to XAudio-related errors if the above steps don't resolve the issue.</li>
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
            <li><b>Vortex Users:</b> Use Purge option before launching Skyrim</li>
            <li>Open the Skyrim Launcher from Steam (not through your mod manager) to create the default ini files.</li>
            <li>Click on the "Options" menu in the launcher to ensure all default settings are generated.</li>
            <li>Close the launcher completely after the ini files are created.</li>
            <li><b>Vortex Users:</b> Deploy mods, Enable all plugins (Ctrl+A then Enable), and Sort load order.</li>
            <li>Launch the game through MO2 or Vortex (your preferred mod manager as usual).</li>
            <li>If the issue persists, check that your Skyrim.ini and SkyrimPrefs.ini files contain the appropriate entries that are generated by the vanilla launcher.</li>
            <li>Ensure you're not overriding critical vanilla settings that the game needs for basic functionality.</li>
            </ol></li>`;
            // More info from DOGGO323 (now known as Hexanode): "IIRC the ini entry is sResourceArchiveList= and sResourceArchiveList2= ... Those list all the default .bsa archives the game ships with."
    }
    
    return diagnoses;
}




// 🤖 Troubleshooting Auto-Installing Modlists:
// Streamlined function for modlist/collection users with automated installers
function checkAutoInstallerIssues(sections, hasUnlikelyErrorForAutoInstallerModlist, hasSaveLoadIssues, hasKeyboardIssue, hasPagefileIndicator, hasMissingCC) {
       
    // Main diagnosis section
    let diagnoses = `
        <li>${(hasUnlikelyErrorForAutoInstallerModlist || hasSaveLoadIssues || hasKeyboardIssue ||  hasPagefileIndicator) ? '👉 ' : ''}<span class="important-emoji">🤖</span> <b>Troubleshooting Auto-Installing Modlists:</b> Since most well-crafted auto-installing modlists, such as <b>Nolvus</b>, <b>Wabbajack modlists</b>, and <b>Nexus Mods Collections</b>, are generally stable, these guidelines (along with the "Reduce Random Crashes" section below) should help resolve most common issues that may arise. Custom modders may also find them insightful.
        <a href="#" class="toggleButton">⤵️ show details</a>
            <ul class="extraInfo" style="display:none">
                ${(hasUnlikelyErrorForAutoInstallerModlist || hasSaveLoadIssues || hasKeyboardIssue ||  hasPagefileIndicator) ? '<li>Any suggestions noted with "👉" below have indicators of <b>possible relevancy</b> in your provided crash log.</li>' : ''}
                
                <li>${hasUnlikelyErrorForAutoInstallerModlist ? '👉' : ''}Ensure modlist/collection is <b>fully downloaded and correctly installed</b> without errors:
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
                                <li>1️⃣ Initial Steps: These first ${hasMissingCC ? 'three': 'two'} steps alone fix many crashes. (⚠️ Wait for spinners to stop after each step!)
                                    <ol>
                                        ${hasMissingCC ? '<li><b>Verify CC content:</b> If you own Skyrim Anniversary Edition with all Creation Club (CC) content and have mods that expect CC content to be available, check Vortex\'s Plugins tab → Filter "Loaded by Engine" and verify 80 total files (5 <code>.esm</code> + 74 CC files + <code>_ResourcePack.esl</code>). If any are missing, refer to <a href="#missing-cc">Missing CC instructions</a> below.</li>':''}
                                        <li><b>Enable Collection Plugins:</b> In the Plugins tab, verify that all plugins from the collection that should be enabled are enabled. <i>Tip: If unsure which plugins should be enabled, select a single plugin, use CTRL+A to select all, and click "Enable" - then disable any you specifically want disabled.</i></li>
                                        <li><b>Sort Plugins:</b> Use "Sort now" in the Plugins tab. NOTE: Due to a suspected Vortex bug, <b>you may need to repeat this step 2-3 times</b> for it to fully sort. <b>If issues persist:</b> Close and reopen Vortex, disable and re-enable a relevant plugin (or use CTRL+A to toggle all), sort 2-3 times, deploy mods, then test.</li>
                                        <li><b>Reset Load Order Files (if needed):</b> Try this if you still see plugins with "Load Order" values of "-1" or "???", or if plugins that should load last (like <code>Occlusion.esp</code>, <code>DynDOLOD.esp</code>, or map mods) aren't loading last: Go to Mods tab → folder icon → "Open Game Application Data Folder" → Close Vortex → Delete <code>loadorder.txt</code> and <code>plugins.txt</code> → Restart Vortex → Enable all plugins and sort again.</li>
                                    </ol>
                                </li>
                                <li>2️⃣ <b>If Issues Persist:</b> Go to Vortex Settings → "Reset Suppressed Notifications" → Restart Vortex → Click notification bell (top right) and address warnings. <b>For "Cycles in sorting rules":</b> Search collection name in Mods tab → Right-click collection → "Apply Collection Rules" (see <a href="https://gatetosovngarde.wiki.gg/wiki/Resolving_Cycles">GTS screenshot guide</a> - plugin names differ but process is the same). <b>For "Unparsed" errors:</b> Re-install the problem mod. <b>If crashes continue:</b> Purge mods → Deploy mods → Enable all plugins and sort again.</li>
                            </ul>
                        </li>
                    </ul>
                </li>

                 <li>💬 <b>Consult before updating any mods:</b> Check with the collection's community before updating individual mods, as collections often include compatibility patches dependent on specific mod versions. Bulk updates frequently break functionality and cause crashes.</li>

                <li>🧩 <b>Best Practices</b> for modding on top of an auto-installing modlist:
                    <ul>
                        <li><b>Warning!</b> Usually this <b>voids full support</b> from modlist Discords. Some will still help you (potentially in a separate channel dedicated to customizers), but they will usually expect more effort from you in return.</li>
                        <li><b>Be patient</b> and expect to do some work (see below) ... or consider leaving your modlist as the auto-installed installation.</li>
                        <li><b>Avoid using the in-game Creations menu</b> while using external mod managers - it may conflict with MO2/Vortex</li>
                        <li>Review your <b>modlist's Discord</b> for mods recommended by others, as well as for any other mods you'd like to add. You can often save time by learning from others' experiences.</li>
                        <li>Choose your mods carefully, <b>read</b> all of a mod's documentation beforehand, including at least skimming its forum/Discord.</li>
                        <li>Only add <b>one mod (or two) at a time</b>, and usually start a new character for each round of testing. Test thoroughly before adding more mods. <b>EXCEPTION:</b> Sometimes a small group of mods can be added at once if they are known to work with your modlist (and with each other).</li>
                        <li>Check for <b>patches</b> for making your mods cross-compatible with each other. Or, learn to use <a href="https://www.nexusmods.com/skyrimspecialedition/mods/164" target="_blank">SSEEdit (xEdit)</a> to make your own patches.</li>
                        <li><b>Finalize your modlist</b> before starting a new character for a real playthrough. Test thoroughly beforehand, because many mods are not safe to remove without starting a new character.</li>
                        <li>Avoid stacking <b>multiple mods</b> that serve the <b>same purpose</b> (e.g., more than one weather overhaul, lighting system, or animation framework). Conflicting mods in the same category often overwrite each other or cause instability.</li>
                        <li><b>Load order</b> can be very important. Either read up on this, or consult your modlist's Discord for advice on how to place/prioritize your added mods.</li>
                    </ul>
                </li>
            </ul>
        </li>`;

    return diagnoses;
};

// 🎲 Reduce Random Crashes:
function checkRandomIssues(sections, hasUnlikelyErrorForAutoInstallerModlist, hasSaveLoadIssues, hasKeyboardIssue, hasPagefileIndicator, hasMissingCC) {
       
    let diagnoses = `
        <li>${(hasUnlikelyErrorForAutoInstallerModlist || hasSaveLoadIssues || hasKeyboardIssue ||  hasPagefileIndicator) ? '👉 ' : ''}<span class="important-emoji">🎲</span> <b>Reduce Random Crashes:</b> Best practices for game stability: <a href="#" class="toggleButton">⤵️ More details</a>
            <ul class="extraInfo" style="display:none">
                <li>${hasKeyboardIssue ? '👉' : ''} 🔀 Avoid Alt+Tabbing</li>
                <li>${hasSaveLoadIssues ? '👉' : ''} 🚫 Avoid loading saves mid-session</li>
                <li>${hasSaveLoadIssues ? '👉' : ''} 💀 Consider using an alternate death mod</li>
                <li>${hasSaveLoadIssues ? '👉' : ''} 📂  Practice safe saving (disable autosaves, save only during calm moments)</li>
                <li>⚡ Quit other resource-hungry apps before launching your modlist</li>
                <li>🖼️ Keep your graphics driver reasonably current, but test each update—if a new driver causes issues, roll back to the last stable version that worked well for you.</li>
                <li>🔥 Return any overclocked hardware (<i>usually</i> <b>excluding</b> RAM using XMP or AMD EXPO) to stock speeds</li>
                <li>🐌 Stuttering, short freezes, or consistently low FPS (below 20) can share root causes with crashes — optimize textures, cap framerate, and adjust configurations.</li>
                <li>${hasPagefileIndicator ? '👉' : ''} 💾 Set your Windows Pagefile to 40,000 min and max  (especially for 16GB of RAM or less). NOTE this is <b>controversial</b>. Others recommend leaving it system managed.</li>
                <li>😐 Averaging less than one crash in 4 hours usually isn't a major concern for any heavily modded Skyrim</li>
                <li>🛑 Otherwise it's usually best to not try to "fix" random issues. Except for a confident diagnosis or safe and prudent specific reinstalls/upgrades, wait for indications to repeat across multiple crash logs.</br>
                    ${(hasPagefileIndicator || hasKeyboardIssue || hasSaveLoadIssues) ? '</br><span style="font-size: 0.9em; margin: 8px 0;"><b>Legend:</b> 👉 = Possible relevancy detected in your crash log</span></br>' : ''}
                    </br>
                    <b>Full List and Details:</b> The following are general stability guidelines that can be especially helpful for crashes with inconsistent indicators or unclear causes. They are not intended as replacements for analyzing specific crash logs or troubleshooting particular issues. 
                </li>

                <li>🖥️ Verify your hardware/OS settings:
                    <ul>
                        <li>Always try the classic computer solution - <b>restart your PC</b>: This clears memory and resolves many system-level issues, especially after extended gaming sessions. It's surprising how many issues this old IT tip still fixes...</li>
                        <li>⚡ Consider quitting out of all other applications before launching your modlist, particularly resource-intensive programs (e.g., web browsers with many tabs, other games, or video editors), or if you have less than 32GB of RAM.</li>
                        <li>Maintain <a href="https://computercity.com/hardware/storage/how-much-space-should-i-leave-on-my-ssd">at least 10-20% free space</a> on your SSD for optimal performance.</li>
                        <li>🖼️ Keep your <b>graphics driver</b> reasonably current, as outdated drivers can cause crashes, graphical glitches, or performance issues. For <b>NVIDIA and AMD</b> cards, download drivers from their official websites. However, <b>not every driver update is an improvement</b>—some may introduce new bugs or performance regressions. When updating, monitor for issues and be prepared to <b>roll back</b> if you experience problems. Stick with whichever version proves most stable for your specific hardware and games. For <b>Intel integrated graphics</b>, Windows Update typically provides sufficient driver updates.</li>
                        <li>🔥 Return any overclocked hardware to <b>stock speeds</b> when troubleshooting, as overclocks can cause instability and crashes. This includes <b>CPU overclocks, GPU overclocks, and custom voltage settings</b>. You can <b><i>usually</i> exclude RAM using XMP or AMD EXPO</b>, as long as your hardware conforms to manufacturer-tested profiles.</li>
                        <li>${hasPagefileIndicator ? '👉' : ''}${verifyWindowsPageFileListItem}</li>
                    </ul>
                </li>

                <li>🦉 <b>Best Practices</b> for playing a stable heavily-modded Skyrim: (Experienced modders have differing opinions, and some of these recommendations are considered <a href="https://www.reddit.com/r/skyrimmods/comments/1ls2j8b/best_practices_for_playing_a_stable_modded_skyrim/"  target="_blank">controversial</a>, but according to three top modlist communities, breaking these may cause crashes even with a stable modlist)
                    <ul>
                        <li>${hasKeyboardIssue ? '👉' : ''}🔀 <b>Alt+Tab considerations:</b> Avoid Alt+Tabbing, especially playing full screen, or while loading/saving, or any intensive scenes. If you must, switch applications during periods of inactivity and after pausing Skyrim with the [\`] key (entering the command line menu).</li>

                        <li>${hasSaveLoadIssues ? '👉 ' : ''}If one save won't load, quit to the desktop, relaunch Skyrim and try to <b>load an older save</b>.</li>

                        <li>Sometimes it can help to <b>separate from your followers</b> to get past a crash point. Ask followers/pets/steeds to "wait" at a safe location, away from the crash-prone loading area (cell) ... and then collect them again later after getting past the crashing area.</li>

                        <li>🐌 <b>Performance and Stability:</b> While low FPS doesn't directly cause crashes, both symptoms often share underlying causes (memory shortage, script overload, CPU bottlenecks). Warning signs may include stuttering, short freezes, or FPS consistently below 20.
                            <ul>
                                <li>Quick fixes: Switch to lower-resolution texture mods or use <a href="https://www.nexusmods.com/skyrimspecialedition/mods/90557" target="_blank">VRAMr</a> at an appropriately-downscaling preset to optimize all textures and re-encode them to the faster-decompressing BC7 texture format (<a href="https://youtu.be/SHzSbX038ek?si=LO-pY6X2Z21vH5U2" target="_blank">tutorial</a>), cap FPS to 30-60 using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/34705" target="_blank">SSE Display Tweaks</a>, and/or <a href="https://www.reddit.com/r/Nolvus/comments/1nefmi3/how_to_boost_fps_by_lowering_screen_resolution/">lower your screen resolution</a></li>
                                <li>More information: See <a href="https://gatetosovngarde.wiki.gg/wiki/Collection_Performance_Tweaks" target="_blank">Gate to Sovngarde's Performance Guide</a> for (mostly) broadly applicable performance strategies</li>
                            </ul>
                        </li>

                       <li>😐 <b>Normal crash frequency:</b> Occasional instability is <a href="https://www.reddit.com/r/skyrimmods/comments/1oeve11/is_there_a_truely_stable_modlist/">expected with any heavily modded Skyrim</a>, as the game's foundation itself isn't fully stable. Except for bug fixes, adding hundreds of mods from different authors in varying combinations increases the complexity and likelihood of instability. Unless multiple crash logs share a repeating cause, crashes averaging less frequently than once every 4 hours should not be cause for immediate concern.</li>


                        <li>🛑 Don't try to "fix" random issues. Except for a confident diagnosis or safe and prudent upgrades, it's generally best to wait for specific indications to repeat across <b>multiple crash logs</b>. Trying to fix one-off random issues may lead to more issues.</li>

                        <li>${hasSaveLoadIssues ? '👉' : ''}🚫 <b>Avoid loading saves mid-session:</b> Skyrim is believed to be most stable with just the first loading per launch. Subsequent save-file loads without quitting to desktop first may cause random crashes. <b>Make it easier</b> to avoid this by adding any of these mods/collections (if your modlist doesn't already include them or equivalents):
                            <ul>
                                <li><a href="https://www.nexusmods.com/skyrimspecialedition/mods/88219"  target="_blank">Clean Save Auto-reloader</a> automatically re-launches Skyrim from desktop with each reload, potentially adding minutes of game startup time.</li>
                                <li><a href="https://www.nexusmods.com/games/skyrimspecialedition/collections/4o4jxh/mods" target="_blank">Safe Save Helpers</a> mod collection provides users an automated and more thorough approach.</li>
                                <li>💀 An <b>alternate death mod</b> can be fun, and aid in game stability by continuing the game after dying, without need to quit to desktop. Popular examples: 
                                    <ul>
                                        <li><a href="https://www.nexusmods.com/skyrimspecialedition/mods/65136"  target="_blank">Shadow of Skyrim - Nemesis and Alternative Death System</a>. Currently used by <b>Nolvus 6 beta</b>. WARNINGS: quests that expect you trapped could break when you are teleported. Also, you may need configs and/or patches to prevent issues.</li>
                                        <li><a href="https://www.nexusmods.com/skyrimspecialedition/mods/69267" target="_blank">Respawn - Soulslike Edition</a>. Currently used by <b>Lorerim</b>. WARNINGS: quests that expect you trapped could break when you are teleported. Also, you may need configs and/or patches to prevent issues.</li>
                                        <li><a href="https://www.nexusmods.com/skyrimspecialedition/mods/128265"  target="_blank">Soul Resurrection - Injury and Alternative Death System</a>. Similar to Shades of Mortality (below). Known for being broadly compatible and doesn't risk breaking scripts/quests by teleporting you out any less-flexible situations. <b>Most recommended</b> as an easy  addition to pretty much any modlist.
                                        </li>
                                        <li><a href="https://www.nexusmods.com/skyrimspecialedition/mods/136825"  target="_blank">Shades of Mortality - Death Alternative SKSE</a>  Similar to Soul Resurrection (above). Instead of dying, you go ethereal and take configurable penalties. Often recommended for adding to <b>Gate to Sovngarde</b>. Broadly compatible with other mods.</li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                        <li>${hasSaveLoadIssues ? '👉' : ''}📂 <b>Safe saving practices:</b> <a href="https://www.nexusmods.com/skyrimspecialedition/mods/81502">Disable autosaves</a>. Save only during downtime when nothing is going on, wait 20-ish seconds before saving in newly-loaded areas (allows scripts to settle).</li>
                        <li><b>References</b> on safe saving and safe loading practices:
                            <ul>
                                <li><a href="https://gatetosovngarde.wiki.gg/wiki/Safe_Saving"  target="_blank">Gate to Sovngarde's "Safe Saving" wiki page</a></li>
                                <li><a href="https://www.reddit.com/r/Nolvus/comments/1ka74em/jeriliths_2025_skyrim_safesaveguide_sexy_free/"  target="_blank">Jerilith's 2025 Skyrim Safe-Save-Guide [sexy free edition]</a> for Nolvus (and any modlist)</li>
                                <li><a href="https://lorerim.com/support/saves/"  target="_blank">Lorerim's "Safe Saving & Loading" wiki page</a></li>
                            </ul>
                        </li>
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
                        <li>Alternate fix: Update <code>Core Impact Framework</code> AND <code>Dismembering Framework</code> to their newest stable versions. Remove <code>DF - Creatures by Xtudo - Draugrs - Dry Blood</code> patch. Download and install <a href="https://www.nexusmods.com/skyrimspecialedition/mods/126608?tab=files&file_id=552042&nmm=1">this patch</a>. (GTS Discord has <a href="https://discord.com/channels/902984082181484615/1386196834091012126/1386196834091012126">more information</a> on the patches.)</li>
                    </ul>
                </li>
                <li>Recommended fix for everyone else:
                    <ul>
                        <li><b>Upgrade both mods:</b> Update <code>Core Impact Framework</code> AND <code>Dismembering Framework</code> to their newest stable versions</li>
                        <li>Both mods should be updated together to resolve the interaction issue</li>
                    </ul>
                </li>
                <li>Additional notes:
                    <ul>
                        <li><b>After fix is applied:</b> you may still have a broken save file, and need to either revert to an older save, or repair one as per these <a target="_blank" href="https://gatetosovngarde.wiki.gg/wiki/Meta:V84%2B_Save_File_Fix">save file repair instructions</a>.</li>
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



// ❗ Possible GTS T-Pose Animal Crash Detected:
function checkTPoseAnimalCrash(sections) {
    let insights = '';
    // Check for specific T-Pose crash pattern in top third of crash log
    const crashPattern = `(ActorMovementMessageMap<16>::MessageHandlerWrapper<MovementMessageWarpToLocation>*)`;
    
    if (sections.topThird.toLowerCase().includes(crashPattern.toLowerCase())) {
        
    insights += `<li>❗ <b>Possible GTS T-Pose Animal Crash Detected:</b>
        If you are playing <b>Gate to Sovngarde (GTS)</b> versions 90 or 91, you likely need to upgrade a GTS-specific mod that fixes animals experiencing "T-pose" animation issues.
        <ul>
            <li><b>Recommended upgrade:</b> Download the latest <a href="https://www.nexusmods.com/skyrimspecialedition/mods/97490?tab=files" target="_blank">T-Pose Animal Fix by SpinPigeon</a> from "JaySerpa's Small Mods and Resources (Mostly for GTS)" <b>Files</b> tab</li>
            <li><b>Alternative:</b> Update to GTS version 92 (or higher) which already includes this upgrade</li>
            <li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">
                <li><code>(ActorMovementMessageMap&lt;16&gt;::MessageHandlerWrapper&lt;MovementMessageWarpToLocation&gt;*)</code> - T-Pose animal fix crash signature found in top third of crash log.</li>
            </ul></li>
        </ul>
    </li>`;
    }
    return insights;
}




// ⚠️ Missing Creation Club Content Detected:
function checkMissingCreationClubContent(sections, hasMissingMasters) {
    Utils.debuggingLog(['checkMissingCreationClubContent'], `hasMissingMasters: ${hasMissingMasters}`);
    Utils.debuggingLog(['checkMissingCreationClubContent'], `sections.hasSkyrimAE: ${sections.hasSkyrimAE}`);
    Utils.debuggingLog(['checkMissingCreationClubContent'], `Utils.isSkyrimPage: ${Utils.isSkyrimPage}`);
    
    let insights = '';
    let hasMissingCC = false;
    if (hasMissingMasters && (sections.hasSkyrimAE || !Utils.isSkyrimPage)) {
        //NOTE: Nolvus has AE content even though not AE version (because it is downgraded)
            // But otherwise, if not AE version, assume not downgraded, and assume no AE content is expected
        // Expected Creation Club files with titles (74 total CC files)
        const expectedCCFiles = {
            'ccasvsse001-almsivi.esm': 'Ghosts of the Tribunal',
            'ccbgssse001-fish.esm': 'Fishing',
            'cctwbsse001-puzzledungeon.esm': 'Forgotten Seasons',
            'cceejsse001-hstead.esm': 'Tundra Homestead',
            'ccbgssse016-umbra.esm': 'Umbra',
            'ccbgssse031-advcyrus.esm': "Dead Man's Dread",
            'ccbgssse067-daedinv.esm': 'The Cause',
            'ccbgssse025-advdsgs.esm': 'Saints & Seducers',
            'cceejsse005-cave.esm': 'Bloodchill Manor',
            'ccafdsse001-dwesanctuary.esm': 'Nchuanthumz: Dwarven Home',
            'ccbgssse002-exoticarrows.esl': 'Arcane Archer Pack',
            'ccbgssse003-zombies.esl': 'Plague of the Dead',
            'ccbgssse004-ruinsedge.esl': "Ruin's Edge",
            'ccbgssse005-goldbrand.esl': 'Goldbrand',
            'ccbgssse006-stendarshammer.esl': "Stendarr's Hammer",
            'ccbgssse007-chrysamere.esl': 'Chrysamere',
            'ccbgssse010-petdwarvenarmoredmudcrab.esl': 'Dwarven Armored Mudcrab',
            'ccbgssse011-hrsarmrelvn.esl': 'Horse Armor - Elven',
            'ccbgssse012-hrsarmrstl.esl': 'Horse Armor - Steel',
            'ccbgssse014-spellpack01.esl': 'Arcane Accessories',
            'ccbgssse019-staffofsheogorath.esl': 'Staff of Sheogorath',
            'ccbgssse020-graycowl.esl': 'The Gray Cowl Returns!',
            'ccbgssse021-lordsmail.esl': "Lord's Mail",
            'ccmtysse001-knightsofthenine.esl': 'Divine Crusader',
            'ccqdrsse001-survivalmode.esl': 'Survival Mode',
            'ccqdrsse002-firewood.esl': 'Camping',
            'ccbgssse018-shadowrend.esl': 'Shadowrend',
            'ccbgssse035-petnhound.esl': 'Nix-Hound',
            'ccfsvsse001-backpacks.esl': "Adventurer's Backpack",
            'cckrtsse001_altar.esl': 'Bittercup',
            'cceejsse002-tower.esl': 'Myrwatch',
            'ccedhsse001-norjewel.esl': 'Nordic Jewelry',
            'ccvsvsse002-pets.esl': 'Pets of Skyrim',
            'ccbgssse037-curios.esl': 'Rare Curios',
            'ccbgssse034-mntuni.esl': 'Wild Horses',
            'ccbgssse045-hasedoki.esl': 'Staff of Hasedoki',
            'ccbgssse008-wraithguard.esl': 'Sunder & Wraithguard',
            'ccbgssse036-petbwolf.esl': 'Bone Wolf',
            'ccffbsse001-imperialdragon.esl': 'Civil War Champions',
            'ccmtysse002-ve.esl': 'Vigil Enforcer Armor Set',
            'ccbgssse043-crosselv.esl': 'Elite Crossbows',
            'ccvsvsse001-winter.esl': 'Saturalia Holiday Pack',
            'cceejsse003-hollow.esl': 'Shadowfoot Sanctum',
            'ccbgssse038-bowofshadows.esl': 'Bow of Shadows',
            'ccbgssse040-advobgobs.esl': 'Goblins',
            'ccbgssse050-ba_daedric.esl': 'Alternative Armors - Daedric Plate',
            'ccbgssse052-ba_iron.esl': 'Alternative Armors - Iron',
            'ccbgssse054-ba_orcish.esl': 'Alternative Armors - Orcish Plate',
            'ccbgssse058-ba_steel.esl': 'Alternative Armors - Steel Soldier',
            'ccbgssse059-ba_dragonplate.esl': 'Alternative Armors - Dragon Plate',
            'ccbgssse061-ba_dwarven.esl': 'Alternative Armors - Dwarven Plate',
            'ccpewsse002-armsofchaos.esl': 'Arms of Chaos',
            'ccbgssse041-netchleather.esl': 'Netch Leather Armor',
            'ccedhsse002-splkntset.esl': 'Spell Knight Armor',
            'ccbgssse064-ba_elven.esl': 'Alternative Armors - Elven Hunter',
            'ccbgssse063-ba_ebony.esl': 'Alternative Armors - Ebony Plate',
            'ccbgssse062-ba_dwarvenmail.esl': 'Alternative Armors - Dwarven Mail',
            'ccbgssse060-ba_dragonscale.esl': 'Alternative Armors - Dragonscale',
            'ccbgssse056-ba_silver.esl': 'Alternative Armors - Silver',
            'ccbgssse055-ba_orcishscaled.esl': 'Alternative Armors - Orcish Scaled',
            'ccbgssse053-ba_leather.esl': 'Alternative Armors - Leather',
            'ccbgssse051-ba_daedricmail.esl': 'Alternative Armors - Daedric Mail',
            'ccbgssse057-ba_stalhrim.esl': 'Alternative Armors - Stalhrim Fur',
            'ccbgssse066-staves.esl': 'Staves (Creation)',
            'ccbgssse068-bloodfall.esl': "Headman's Cleaver",
            'ccbgssse069-contest.esl': 'The Contest',
            'ccvsvsse003-necroarts.esl': 'Necromantic Grimoire',
            'ccvsvsse004-beafarmer.esl': 'Farming',
            'ccffbsse002-crossbowpack.esl': 'Expanded Crossbow Pack',
            'ccbgssse013-dawnfang.esl': 'Dawnfang & Duskfang',
            'ccrmssse001-necrohouse.esl': 'Gallows Hall',
            'ccedhsse003-redguard.esl': 'Redguard Elite Armaments',
            'cceejsse004-hall.esl': 'Hendraheim',
            'cccbhsse001-gaunt.esl': 'Fearsome Fists'
        };

        // Add _ResourcePack.esl only for Skyrim pages
        if (Utils.isSkyrimPage) {
            expectedCCFiles['_ResourcePack.esl'] = '(shared CC resources)';
        }

        // Count CC files in the log
        const pluginsList = sections.gamePlugins.toLowerCase();
        const foundCCFiles = [];
        const missingCCFiles = [];
        const pluginsCount = Utils.countPlugins(sections);
        
        Object.keys(expectedCCFiles).forEach(fileName => {
            const fileNameLower = fileName.toLowerCase();
            if (pluginsList.includes(fileNameLower)) {
                foundCCFiles.push(fileName);
            } else {
                missingCCFiles.push(fileName);
            }
        });

        // Check if plugins section was cut short (common issue)
        const isPluginsSectionTruncated = pluginsList.length < 80; //Number of Plugins that Vortex lists for AE as "Loaded by engine" (includes base esm files and CC files).
            //NOTE: it is possible to however have AE loaded, and purposefully not install the CC content. But all in all, this seemed the safest number?
            //NOTE: This truncated test is specific to the CC content ... other truncated booleans may have different cut off points relative to different standards
        
        // Expected total CC files loaded by engine (base game + CC files)
        const expectedTotalFiles = Utils.isSkyrimPage ? 75 : 74; // Skyrim: 1 base + 74 CC, Non-Skyrim: 74 CC only
        const foundCCCount = foundCCFiles.length;
        const missingCount = expectedTotalFiles - foundCCCount;
        const hasAllExpectedCCFiles = (foundCCCount === expectedTotalFiles);
        

        //Debugging: 
        Utils.debuggingLog(['checkMissingCreationClubContent'], `foundCCCount: ${foundCCCount}`);
        Utils.debuggingLog(['checkMissingCreationClubContent'], `missingCount: ${missingCount}`);
        Utils.debuggingLog(['checkMissingCreationClubContent'], `isPluginsSectionTruncated: ${isPluginsSectionTruncated}`);
        Utils.debuggingLog(['checkMissingCreationClubContent'], `hasAllExpectedCCFiles: ${hasAllExpectedCCFiles}`);
        
        if (!hasAllExpectedCCFiles || isPluginsSectionTruncated) {
            let detectedIndicators = '';
            hasMissingCC = true;
            
            if (missingCount > 0) {
                detectedIndicators += `<li>Missing ${missingCount} out of ${expectedTotalFiles} expected Creation Club files</li>`;
            }
            
            if (isPluginsSectionTruncated) {
                detectedIndicators += `<li>Plugins section appears truncated (cut off short) - some installed CC files may not be listed in the crash log</li>`;
            }

            // Show all missing files with titles (hidden by default)
            let missingFilesList = '';
            if (missingCCFiles.length > 0) {
                missingFilesList = missingCCFiles.map(fileName => 
                    `<li><code>${fileName}</code> - ${expectedCCFiles[fileName]}</li>`
                ).join('');
            }

            if (isPluginsSectionTruncated) {
                insights += '<li>❓ <span id="missing-cc"><b>Truncated Crash Log, Possibly Missing Creation Club Content:</b></span> '
            } else {
                insights += '<li>⚠️ <span id="missing-cc"><b>Missing Creation Club Content Detected:</b></span> '
            }

            // Determine verification text based on page type
            const vortexVerificationText = Utils.isSkyrimPage 
                ? `<li><b>Vortex Users:</b> Check Vortex Plugins tab → Filter "Loaded by Engine" and verify ${expectedTotalFiles +5} total files (5 <code>.esm</code> + ${expectedTotalFiles -1} CC files + <code>_ResourcePack.esl</code>)</li>`
                : ``;
            
            const mo2VerificationText = Utils.isSkyrimPage
                ? `<li><b>MO2 Users:</b> Search for and verify (${expectedTotalFiles} related files  CC files + <code>_ResourcePack.esl</code>)</li>`
                : `<li>Search for and verify ${expectedTotalFiles} CC files</li>`;
            
            const ccPrefixNote = Utils.isSkyrimPage
                ? `<li>All CC files start with a "<code>cc</code>" prefix, except for the related <code>_ResourcePack.esl</code> file.</li>`
                : `<li>All CC files start with a "<code>cc</code>" prefix.</li>`;

            insights +=
                `If you own the Skyrim Anniversary Edition, with the inclusion of all the Creation Club (CC) content, and have any mods that expect CC content to be available, then missing CC content could be causing your Missing Masters issue. The fully downloaded Creation Club content should have ${expectedTotalFiles} Creation Club files loaded, but ${foundCCCount === 0 ? "zero" : "only " + foundCCCount} CC ${foundCCCount === 1 ? "file was" : "files were"} detected. ${isPluginsSectionTruncated ? ' However, your log file appears to have been cut short, so it\'s impossible to determine with confidence from this crash log.' : 'NOTE: some log files are cut short before listing all the CC content, so this message could be incorrect.'}
                <ul>
                    <li><b>Download Instructions:</b>
                        <ul>
                            <li><b>Vortex Users:</b> Use Purge option before launching Skyrim</li>
                            <li>Load game via Steam to trigger automatic CC downloads</li>
                            <li>Watch for "Thanks for buying AE" message and auto-download</li>
                            <li>If auto-download doesn't start: Go to Creations menu → Options → "Download all owned Creation Club Creations" (<a href="https://help.bethesda.net/#en/answer/54457">screenshot</a>)</li>
                        </ul>
                    </li>
                    <li><b>If "Could not connect to Bethesda servers" error:</b>
                        <ul>
                            <li>Try clicking "Download all owned" multiple times</li>
                            <li>Verify game files in Steam if downloads keep failing</li>
                        </ul>
                    </li>
                    <li><b>Verification:</b>
                        <ul>
                            ${vortexVerificationText}
                            ${mo2VerificationText}
                            ${ccPrefixNote}
                            <li><a href="https://ck.uesp.net/wiki/Creation_Club_Content_by_Filename">Reference list</a></li>
                        </ul>
                    </li>
                    <li><b>Final Steps (after CC download):</b>
                        <ul>
                            <li>Close Skyrim as launched from Steam</li>
                            <li><b>Vortex Users:</b> Deploy mods, Enable all plugins (Ctrl+A then Enable), Sort load order, and launch Skyrim from Vortex</li>
                            <li><b>MO2 Users:</b> Refresh MO2, check that CC files appear in the right-side pane, and launch Skyrim from MO2</li>
                        </ul>
                    </li>` +
                    (missingFilesList ? `<li><b>Missing Files Detected:</b> <a href="#" class="toggleButton">⤵️ show list</a><ul class="extraInfo" style="display:none">${missingFilesList}</ul></li>` : '') +
                    `<li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">
                        ${detectedIndicators}
                    </ul></li>
                </ul>
            </li>`;
        } else if (hasAllExpectedCCFiles) {
            insights += `<li>✅ <b>Creation Club Content Complete:</b> All ${expectedTotalFiles}  Creation Club files detected and loaded properly.</li>`;
        }
    } else {
        insights = ''
    }
    
    return {
        insights: insights,
        hasMissingCC: hasMissingCC 
    };
}




// ❗ Probable LeveledItem Save Crash Detected:
function checkLeveledItemCrash(sections) {
    let insights = '';
    // Check for LeveledItem (53) crash pattern
    const crashPattern = `LeveledItem (53)`;
    
    if (sections.topHalf.toLowerCase().includes(crashPattern.toLowerCase())) {
        
    insights += `<li>❗ <b>Probable LeveledItem Save Crash Detected:</b>
        This crash typically occurs during saving, fast travel, or loading and is caused by corrupted leveled list data in your save file.
        <ul>
            <li><b>Primary fix:</b> Install <a href="https://www.nexusmods.com/skyrimspecialedition/mods/129136" target="_blank">LeveledList Crash Fix</a> (requires Skyrim SE version 1.6.1130+)</li>
            <li><b>For existing corrupted saves:</b> The mod may not fix already-broken save files. You may need to use <a href="https://www.nexusmods.com/skyrim/mods/76776" target="_blank">FallrimTools ReSaver</a> to remove the problematic FormID from your save file. ⚠️ <strong>CAUTION:</strong> Fixing/editing save files has inherent risks and should be avoided when possible. If you can instead revert to an acceptable older save file, that is often preferable in the long run.
            </li>
            <li><b>To identify the specific FormID:</b> Enable "<b>Display nested Log Summary (Beta feature)</b>" in this analyzer and look for the FormID associated with the <code>LeveledItem (53)</code> entry within the 🔎 <b>Files/Elements</b> section of this report.</li>
            <li><a href="https://www.nexusmods.com/skyrim/mods/76776">FallrimTools ReSaver</a> can be used to diagnose and sometimes fix corrupted save files, and can also be (carefully) used by advanced users to remove specific problematic FormIDs from your save files. ⚠️ <strong>CAUTION:</strong> Fixing/editing save files has inherent risks and should be avoided when possible. If you can instead revert to an acceptable older save file, that is often preferable in the long run.</li>
            <li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">
                <li><code>LeveledItem (53)</code> - Corrupted leveled list crash signature found in top half of crash log.</li>
            </ul></li>
        </ul>
    </li>`;
    }
    return insights;
}



// ❓ CompassNavigationOverhaul Crash Bug Detected:
function checkCompassNavigationOverhaulCrash(sections) {
    let insights = '';
    const hasHudMenu = sections.topHalf.toLowerCase().includes('hudmenu');
    const hasCompassNavigationOverhaul = sections.fullLogFileLowerCase.includes('compassnavigationoverhaul.dll');

    if (hasHudMenu && hasCompassNavigationOverhaul) {
        insights += `<li>❓ <b>Possible CompassNavigationOverhaul Crash Detected:</b>
            This may be a crash caused by an outdated version of Compass Navigation Overhaul mod.
            <ul>
                <li><b>Update the mod:</b> Download and install the latest version of <a href="https://www.nexusmods.com/skyrimspecialedition/mods/74484">Compass Navigation Overhaul</a> from Nexus Mods</li>
                <li>The outdated version of this mod's DLL file is known to cause regular crashes with <code>HUDMenu</code> references</li>
                <li>The mod doesn't include version numbers in its DLL, making it difficult to verify from a crash log</li>
                <li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">
                    <li><code>HUDMenu</code> reference found in crash log - common crash signature for UI-related crashes</li>
                    <li><code>CompassNavigationOverhaul.dll</code> detected in crash log - this mod is known to cause crashes when outdated</li>
                </ul></li>
            </ul>
        </li>`;
    }
    return insights;
}


// ⚠️ Consider Upgrading CrashLogger SSE:
function checkCrashLoggerVersionUpdate(sections) {
    let insights = '';
    
    // Only check if this is a CrashLogger log
    if (sections.logType !== "CrashLogger") {
        return insights;
    }
    
    // Extract version from the second line of header
    const headerLines = sections.header.split('\n');
    if (headerLines.length < 2) {
        return insights;
    }
    
    const versionLine = headerLines[1];
    const versionMatch = versionLine.match(/CrashLoggerSSE v(\d+-\d+-\d+-\d+)/);
    
    if (!versionMatch) {
        return insights;
    }
    
    // Convert version format from "1-15-0-0" to "1.15.0.0" for comparison
    const foundVersion = versionMatch[1].replace(/-/g, '.');
    const minimumVersion = " 1.17.0.0";
    
    // Compare versions - if found version is less than 1.16.0.0, recommend update
    if (Utils.compareVersions(foundVersion, minimumVersion) < 0) {
        insights += `<li>⚠️ <b>Consider Upgrading CrashLogger SSE:</b>
            A newer version of CrashLogger SSE is available, and in some cases may provide an improved crash log for better diagnoses.
            <ul>
                <li>Download and install the latest version of <a href="https://www.nexusmods.com/skyrimspecialedition/mods/59818">Crash Logger SSE AE VR</a> from Nexus Mods</li>
                <li>Newer versions include bug fixes for slightly improved crash logging capabilities</li>
                <li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">
                    <li>CrashLogger SSE version <code>${versionMatch[1]}</code> found in crash log header</li>
                    <li>Recommended version is <code>${minimumVersion} or later</code></li>
                </ul></li>
            </ul>
        </li>`;
    }
    
    return insights;
}


// ⚠️ Intel 13th/14th Gen CPU Instability Risk:
function checkIntelCPUIssue(sections) {
    let insights = '';
    
    // Check if header contains Intel 13th or 14th gen indicators
    if (!sections.header) {
        return insights;
    }
    
    const header = sections.header;
    const hasIntel13th = header.includes("13th Gen Intel(R)");
    const hasIntel14th = /Core\(TM\) i[579]-14\d{3}/.test(header);
    
    if (hasIntel13th || hasIntel14th) {
        const generation = hasIntel13th ? "13th" : "14th";
        
       insights += `<li>⚠️ <b>Intel ${generation} Gen CPU Instability Risk:</b>
            Your system uses an Intel ${generation} generation processor, which if not on an updated BIOS has known stability issues that can cause random crashes and shorten CPU lifespan. <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">
                <li><b>Check your microcode version:</b> Open PowerShell and run:
                    <code id="microcodeCmd">'0x{0:X}' -f [BitConverter]::ToUInt32((Get-ItemProperty "HKLM:\\HARDWARE\\DESCRIPTION\\System\\CentralProcessor\\0").'Update Revision',0)</code>
                    <button onclick="navigator.clipboard.writeText(document.getElementById('microcodeCmd').innerText)" class="no-markdown">Copy to Clipboard</button>
                    <ul>
                        <li>If the result is lower than <code>0x129</code>, update your BIOS. Acceptable versions as of September 30, 2025 are: <code>0x129</code>, <code>0x12B</code> (September 2024), or the latest <code>0x12F</code> (May 2025).</li>
                        <li>If the script doesn't work, make sure you include the entire line including the beginning ' character. You can also try alternative tools like <a href="https://www.hwinfo.com/" target="_blank">HWInfo</a>, <a href="https://www.cpuid.com/softwares/cpu-z.html" target="_blank">CPU-Z</a>, or the <a href="https://www.intel.com/content/www/us/en/support/articles/000055672/processors.html" target="_blank">Intel® Processor Identification Utility</a>.</li>
                    </ul>
                </li>
                <li><b>Critical BIOS update required:</b> Check your motherboard manufacturer's website for the latest BIOS/microcode update. Windows Updates do <u>not</u> include the 13th/14th Gen instability microcode fixes.</li>
                <li><b>Risk without update:</b> Random crashes during CPU-intensive gameplay and potential shortened processor lifespan</li>
                <li><b>Update availability:</b> BIOS fixes are released by individual motherboard manufacturers — some may not have updates available</li>
                <li><b>No BIOS update available?</b> You may still be able to apply a <i>software driver-level microcode update</i> that loads during Windows startup. This won’t permanently update your BIOS, but it ensures the CPU runs with the latest microcode each boot. See this community guide for details: <a href="https://www.reddit.com/r/GamingLaptops/comments/1engies/intelhow_to_update_your_microcode_for_intel_hx/" target="_blank">How to update your Intel microcode via driver</a>.</li>
                <li><b>Stress test tool:</b> Run Intel's <a href="https://www.intel.com/content/www/us/en/download/15951/intel-processor-diagnostic-tool.html" target="_blank">Processor Diagnostic Tool</a> to stress-test your CPU.<ul>
                    <li><i>Note:</i> After updating, a stress test helps confirm if your CPU is still healthy — failures may indicate damage that the update cannot prevent (or reverse).</li>
                    </ul>
                </li>
                <li><b>More information:</b> <a href="https://community.intel.com/t5/Mobile-and-Desktop-Processors/Microcode-0x129-Update-for-Intel-Core-13th-and-14th-Gen-Desktop/m-p/1622129" target="_blank">Intel Community Thread</a> with technical details</li>
            </ul>
        </li>`;

    }
    
    return insights;
}



// ❗ Probable Death Drop Overhaul Crash Detected:
function checkDeathDropOverhaulCrash(sections) {
    let insights = '';
    let indicators = [];
    let indicatorCount = 0;
    
    // Indicator 1: Check for outdated DLL version (v1.2.0 or v1.2.1)
    const dllVersion = Utils.getDllVersionFromLog(sections, 'DeathDropOverhaul.dll');
    Utils.debuggingLog(['checkDeathDropOverhaulCrash'], `dllVersion: ${dllVersion}`);

    const hasOutdatedVersion = dllVersion && 
        (Utils.compareVersions(dllVersion, '1.2.0.0') == 0
            || Utils.compareVersions(dllVersion, '1.2.1.0') == 0);
    Utils.debuggingLog(['checkDeathDropOverhaulCrash'], `hasOutdatedVersion: ${hasOutdatedVersion}`);
    
    if (hasOutdatedVersion) {
        indicatorCount++;
        indicators.push(`<code>DeathDropOverhaul.dll v${dllVersion}</code> detected in SKSE plugins - outdated version known to sometimes cause crashes`);
    }
    
    // Indicator 2: Check for DeathDropOverhaul.dll in callstack or Stack
    const inProbableCallstack = sections.probableCallstack && 
        sections.probableCallstack.toLowerCase().includes('deathdropoverhaul.dll');
    Utils.debuggingLog(['checkDeathDropOverhaulCrash'], `inProbableCallstack: ${inProbableCallstack}`);

    const inStack = sections.stack && 
        sections.stack.toLowerCase().includes('deathdropoverhaul.dll');
    Utils.debuggingLog(['checkDeathDropOverhaulCrash'], `inStack: ${inStack}`);
    
    if (inProbableCallstack || inStack) {
        indicatorCount++;
        let location = '';
        if (inProbableCallstack && inStack) {
            location = 'probable call stack and stack trace';
        } else if (inProbableCallstack) {
            location = 'probable call stack';
        } else {
            location = 'stack trace';
        }
        indicators.push(`<code>DeathDropOverhaul.dll</code> reference found in ${location}`);
    }
    
    // Indicator 3: Check for BaseExtraList in Stack (near top)
    if (sections.stack) {
        const stackLines = sections.stack.split('\n').slice(0, 50); // Check top ~50 lines
        Utils.debuggingLog(['checkDeathDropOverhaulCrash'], `stackLines: ${stackLines.join('\n')}`);

        const hasBaseExtraList = stackLines.some(line => 
            line.toLowerCase().includes('baseextralist')
        );
        Utils.debuggingLog(['checkDeathDropOverhaulCrash'], `hasBaseExtraList: ${hasBaseExtraList}`);
        
        if (hasBaseExtraList) {
            indicatorCount++;
            indicators.push(`<code>BaseExtraList</code> reference found near top of stack trace - common signature for this crash`);
        }
    }

    Utils.debuggingLog(['checkDeathDropOverhaulCrash'], `indicators: ${indicators}`);
    
    // Trigger if 2 or more indicators found
    if (indicatorCount >= 2) {
        insights += `<li>❗ <b>Probable Death Drop Overhaul Crash Detected:</b>
            This crash is likely caused by outdated versions (v1.2.0 or v1.2.1) of the Death Drop Overhaul mod.
            <ul>
                <li><b>Update the mod:</b> Download and install version 1.2.2 or later of <a href="https://www.nexusmods.com/skyrimspecialedition/mods/151590" target="_blank">Death Drop Overhaul</a> from Nexus Mods</li>
                <li><b>Fix details:</b> Version 1.2.2+ resolves crashes related to extra data processing in the inventory system</li>
                <li>Detected indicators (${indicatorCount}/3): <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">
                    ${indicators.map(indicator => `<li>${indicator}</li>`).join('')}
                </ul></li>
            </ul>
        </li>`;
    }
    
    return insights;
}


// ⚠️ Consider Updating Engine Fixes:
function checkEngineFixesUpdate(sections) {
    let insights = '';
    const latestVersion = '7.0.19.0';
    const shadowSceneFixingVersion = '7.0.18.0';
    
    if( !( sections.hasSkyrimSE1597 || sections.hasSkyrimAE1170 ) ){
        Utils.debuggingLog(['checkEngineFixesUpdate'], `sections.hasSkyrimSE1597: ${sections.hasSkyrimSE1597}`);
        Utils.debuggingLog(['checkEngineFixesUpdate'], `sections.hasSkyrimAE1170: ${sections.hasSkyrimAE1170}`);
        return '';
    }
    // Check for ShadowSceneNode in top half of crash log
    const hasShadowSceneNode = sections.highestConfidenceIndicators && 
        sections.highestConfidenceIndicators.toLowerCase().includes('shadowscenenode');
    Utils.debuggingLog(['checkEngineFixesUpdate'], `hasShadowSceneNode: ${hasShadowSceneNode}`);
    
    // Check Engine Fixes version
    const engineFixesVersion = Utils.getDllVersionFromLog(sections, 'EngineFixes.dll');
    Utils.debuggingLog(['checkEngineFixesUpdate'], `engineFixesVersion: ${engineFixesVersion}`);
    
    const hasOutdatedVersion = engineFixesVersion && 
        Utils.compareVersions(engineFixesVersion, latestVersion) < 0;
    Utils.debuggingLog(['checkEngineFixesUpdate'], `hasOutdatedVersion: ${hasOutdatedVersion}`);


    const hasShadowSceneFixingVersion = engineFixesVersion && 
        Utils.compareVersions(engineFixesVersion, shadowSceneFixingVersion) >= 0;
    Utils.debuggingLog(['checkEngineFixesUpdate'], `shadowSceneFixingVersion: ${shadowSceneFixingVersion}`);

    const hasPreventableCrash = hasShadowSceneNode && (!hasShadowSceneFixingVersion || !engineFixesVersion);
    Utils.debuggingLog(['checkEngineFixesUpdate'], `hasPreventableCrash: ${hasPreventableCrash}`);
    
    // Only show if ShadowSceneNode detected AND Engine Fixes is outdated (or not detected)
    if (hasOutdatedVersion || hasPreventableCrash) {
        insights += `<li>⚠️ <b>Consider Updating SSE Engine Fixes:</b>
            Some ${hasPreventableCrash ? 'crashes of this type' : 'crash types'} may be preventable by updating SSE Engine Fixes to the latest version.
            <ul>
                <li>${engineFixesVersion ? 'Update' : 'Install'} <a href="https://www.nexusmods.com/skyrimspecialedition/mods/17230" target="_blank">SSE Engine Fixes</a> to version ${latestVersion} or newer. Be sure to carefully follow <a href="https://www.nexusmods.com/skyrimspecialedition/mods/17230?tab=posts">installation instructions</a> found in the top sticky posts in the mod's forum.</li>
                <li>NOTE: you may also want to <b>review and possibly carry over any custom settings</b> in Engine Fixes' <code>.toml</code> and <code>.ini</code> files</li>
                <li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">
                    ${hasPreventableCrash ? '<li><code>ShadowSceneNode</code> found in highest-confidence sections of crash log</li>' : ''}
                    ${engineFixesVersion ? '<li><code>EngineFixes.dll v' + engineFixesVersion + '</code> (consider upgrading to v' + latestVersion + ' or newer)</li>' :''}
                </ul></li>
            </ul>
        </li>`;
    }
    
    return insights;
}



// ⚠️ Low System RAM Detected:
function checkLowSystemRAM(sections) {
    let insights = '';
    
    // Check system physical memory
    const systemRAM = sections.systemPhysicalMemoryMax;
    Utils.debuggingLog(['checkLowSystemRAM'], `systemRAM: ${systemRAM}`);
    
    if (!systemRAM) {
        return insights;
    }
    
    if (systemRAM <= 16) {
        const isVeryLowRAM = systemRAM <= 8;
        
        insights += `<li>⚠️ <b>${isVeryLowRAM ? 'Very ' : ''}Low System RAM Detected (${systemRAM}GB):</b>
            Your system has limited RAM, which can cause crashes and instability in heavily-modded Skyrim.
            <ul>
                <li><b>Close background applications:</b> Before launching Skyrim, close all unnecessary programs to free up as much RAM as possible</li>
                ${isVeryLowRAM ? `<li><b>System Requirements:</b> Steam's recommended spec for un-modded Skyrim is 8GB RAM. Your system is at or below the recommended for the base game</li>
                <li><b>Mod Selection Guidelines:</b> With ${systemRAM}GB of RAM, you need to be extremely selective with mods:
                    <ul>
                        <li>Choose lightweight mods and avoid resource-intensive options</li>
                        <li><b>Skip entirely:</b> Physics mods, ENB, Community Shaders, heavy lighting overhauls, and other performance-intensive modifications</li>
                        <li>Focus on gameplay and content mods rather than visual enhancements</li>
                    </ul>
                </li>` : ''}
                <li>${verifyWindowsPageFileListItem}</li>
                <li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">
                    <li>PHYSICAL MEMORY: <code>${systemRAM}GB</code> (${isVeryLowRAM ? '8' : '16'}GB or less)</li>
                </ul></li>
            </ul>
        </li>`;
    }
    
    return insights;
}


// ⚠️ Skyrim NetScriptFramework Legacy Notice
function checkNetScriptFrameworkStatus(sections) {
    let insights = '';
    
    // Check if header contains NetScriptFramework indicator
    if (!sections.header) {
        return insights;
    }
    
    const header = sections.header;
    const hasNetScriptFramework = /NetScriptFramework|NSF/.test(header);
    
    if (hasNetScriptFramework) {
        insights += `<li>⚠️ <b>Legacy Crash Logging Mod Detected:</b>
            <a href="https://www.nexusmods.com/skyrimspecialedition/mods/21294">NetScriptFramework</a> (NSF) was last updated in <b>October 2021</b> and no longer supports recent Skyrim versions. This analyzer still supports it, but new features won't include NSF-specific development. <b>Better alternative:</b> <a href="https://www.nexusmods.com/skyrimspecialedition/mods/59818" target="_blank">Crash Logger SSE</a> is actively maintained and supports SSE/AE/VR Skyrim versions. <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">
                <li><b>Why switch:</b> Access to all analyzer features, full version compatibility, and active development.</li>
                <li><b>Recommendation:</b> Switch to <a href="https://www.nexusmods.com/skyrimspecialedition/mods/59818" target="_blank">Crash Logger SSE</a>. Migration is straightforward, just install it, and disable other crash logging mods. New crash logs will be output to: <code>[My_Documents]\\My Games\\Skyrim Special Edition\\SKSE</code> ... replacing <code>[Skyrim_Directory]</code> with your actual Skyrim installation directory path.</li>
            </ul>
        </li>`;
    }
    
    return insights;
}



// ❓ Possible eFPS Issue detected
function checkPossibleEfpsIssue(sections) {
    let insights = '';
    const hasBSGeometryListCulling = sections.stackTop100?.includes('BSGeometryListCullingProcess');
    const hasOccTamriel = sections.bottomHalf?.toLowerCase().includes('occ_skyrim_tamriel.esp');

    if (hasBSGeometryListCulling && hasOccTamriel) {
        insights += `<li>❓ <b>Possible eFPS Issue detected:</b>
            If better diagnoses aren't listed in this report, this crash may be related to the <a href="https://www.nexusmods.com/skyrimspecialedition/mods/54907">eFPS - Exterior FPS boost</a> mod.
            <ul>
                <li><b>Remove eFPS:</b> Temporarily uninstall or disable the eFPS mod and test stability without it</li>
                <li><b>Check for patches:</b> Search for existing patches that resolve conflicts between eFPS and other mods in your load order</li>
                <li><b>Advanced users:</b> If no patch exists, consider creating a custom patch to address conflicts</li>
                <li>Detected indicators: <a href="#" class="toggleButton">⤵️ show more</a><ul class="extraInfo" style="display:none">
                    <li><code>BSGeometryListCullingProcess</code> found in top 100 lines of Stack</li>
                    <li><code>occ_skyrim_tamriel.esp</code> detected in plugin list</li>
                </ul></li>
            </ul>
        </li>`;
    }
    return insights;
}



// ❓ Possible geometry culling / occlusion-related issue
function checkPossibleGeometryCullingIssue(sections) {
    let insights = '';
    const hasBSGeometryListCulling = sections.stackTop100?.includes('BSGeometryListCullingProcess');

    if (hasBSGeometryListCulling) {
        insights += `<li>❓ <b>Possible geometry culling / occlusion-related issue:</b>
            <code>BSGeometryListCullingProcess</code> refers to the engine's scene-graph culling routine, 
            which determines which 3D objects should be rendered or hidden based on visibility, occlusion, and camera position. 
            When it appears near the top of the Stack section of a crash log, it usually means the crash occurred during this visibility-checking phase.
            <ul>
                <li><b>Known trigger:</b> Opening the map in areas with too many occluders (occlusion planes are invisible barriers that tell the engine to skip rendering unseeable objects behind them). 
                    The engine appears to have a limit on the number of occlusion planes it can process.</li>
                <li><b>Reportedly related mods:</b> 
                    <a href="https://www.nexusmods.com/skyrimspecialedition/mods/16736">Facelight Plus</a>, 
                    <a href="https://www.nexusmods.com/skyrimspecialedition/mods/54907">eFPS - Exterior FPS boost</a>, 
                    <a href="https://www.nexusmods.com/skyrimspecialedition/mods/149004">Hyperspecific Occlusion Addon</a>, 
                    <a href="https://www.nexusmods.com/skyrimspecialedition/mods/37982">Capital Whiterun Expansion</a>, and <a href="https://www.nexusmods.com/skyrimspecialedition/mods/112964">Capital Whiterun Expansion Lite</a>
                </li>
                <li><b>General categories:</b>
                    <ul>
                        <li>Mods that alter occlusion data to improve performance</li>
                        <li>Dynamic face/lighting effect mods</li>
                        <li>LOD and worldspace overhauls</li>
                        <li>Mesh replacers</li>
                        <li>City expansion/overhaul mods (especially Whiterun)</li>
                    </ul>
                </li>
                <li><b>Suggested checks:</b> 
                    <ul>
                        <li>If crashes occur when opening the map in specific areas, temporarily disable mods that add occlusion planes</li>
                        <li>Advanced users: Use xEdit or Creation Kit to disable some occlusion planes in affected areas to stay under the engine limit</li>
                        <li>Research potentially related mods for version compatibility, updates, and patches</li>
                    </ul>
                </li>
                <li>Detected indicator: <code>BSGeometryListCullingProcess</code> in first 100 lines of Stack section of log</li>
            </ul>
        </li>`;
    }
    return insights;
}


// ❓ Possible file system / OneDrive / permissions issue
function checkPossibleFilesystemIssue(sections) {
    let insights = '';
    const text = (sections.highestConfidenceIndicators || '').toLowerCase();

    const hasFileSystemError = text.includes('filesystem_error');
    const hasIFileStream = text.includes('ifilestream');
    const hasSaveStorageWrapper = text.includes('savestoragewrapper');
    const hasSaveFileHandle = text.includes('savefilehandlereaderwriter');
    const hasWin32File = text.includes('win32filetype');
    const hasSKSEStorage = text.includes('sksepersistentobjectstorage');

    // New path-based checks
    const hasOneDrivePath = text.includes('onedrive');
    const hasDocumentsPath = text.includes('documents\\my games\\skyrim') || text.includes('documents/my games/skyrim');

    if (
        hasFileSystemError ||
        hasIFileStream ||
        hasSaveStorageWrapper ||
        hasSaveFileHandle ||
        hasWin32File ||
        hasSKSEStorage ||
        hasOneDrivePath ||
        hasDocumentsPath
    ) {
        insights += `<li>❓ <b>Possible file system / OneDrive / permissions issue:</b>
            These crash indicators suggest the game may be unable to access files correctly.
            <ul>
                <li><b>Check file paths:</b> Ensure your Skyrim installation and mod paths are not deeply nested. Windows has a 260-character path limit. If necessary, move (or reinstall) Skyrim to a shorter root directory, and/or remove or relocate mods that require shorter paths. 
                    See <a href="https://gatetosovngarde.wiki.gg/wiki/Collection_Tweaks_and_Maintenance#Moving_Your_Skyrim_Install">Vortex instructions</a> (partially re-applicable to MO2). 
                    NOTE: some auto-installing modlists (like Nolvus) make a copy of all necessary Skyrim files local to their own modlist installation. For these, consult their modlist documentation and/or community.
                </li>
                <li><b>Add antivirus exclusions:</b> Your antivirus may be blocking file access or quarantining game files. Add exclusions for your Skyrim installation directory, mod manager directory, and <code>Documents\\My Games\\Skyrim Special Edition</code> folder in your antivirus software settings.</li>
                <li><b>Verify permissions:</b> Run the game and mod manager with administrator rights. Ensure your Skyrim and Mods folders are not set to read-only.</li>
                <li><b>Check OneDrive:</b> If your Documents folder is actively syncing, or if OneDrive has glitched and left files locked after syncing, Skyrim may fail to save or load files. 
                    See <a href="https://docs.google.com/document/d/1Ot0l8uFv-AJZr1X6vRMQNovhua_NUtE_HhbkrfJi1Ss/edit?tab=t.0">Ways To Get Rid Of OneDrive</a> (Google Doc) and 
                    <a href="https://steamcommunity.com/app/489830/discussions/0/2263565217515804221/">Steam Community - Skyrim vs. OneDrive</a>. 
                    Where possible, avoid extreme measures like uninstalling OneDrive; instead, adjust sync settings or exclude your Skyrim folders.
                </li>
                <li><b>Check free space:</b> Make sure your SSD or HDD has sufficient free space. Skyrim and SKSE may fail to write saves or cache files if the drive is nearly full. Aim to keep at least several GB free. Ideally, maintain <a href="https://computercity.com/hardware/storage/how-much-space-should-i-leave-on-my-ssd">at least 10-20% free space</a> on your SSD for optimal performance.</li>
                <li><b>Check autosaves:</b> Autosaves during especially busy times can cause crashes. Consider disabling or fixing autosaves with mods such as 
                    <a href="https://www.nexusmods.com/skyrimspecialedition/mods/81502">Disable Auto Save</a>, or manually edit your own <code>Skyrim.ini</code> file with <code>bDisableAutoSave=1</code>.
                </li>
                <li>Detected indicators from highest-confidence sections of crash log: 
                    <ul class="extraInfo">
                        ${hasFileSystemError ? '<li><code>filesystem_error</code></li>' : ''}
                        ${hasIFileStream ? '<li><code>IFileStream</code></li>' : ''}
                        ${hasSaveStorageWrapper ? '<li><code>SaveStorageWrapper</code></li>' : ''}
                        ${hasSaveFileHandle ? '<li><code>SaveFileHandleReaderWriter</code></li>' : ''}
                        ${hasWin32File ? '<li><code>Win32FileType</code></li>' : ''}
                        ${hasSKSEStorage ? '<li><code>SKSEPersistentObjectStorage</code></li>' : ''}
                        ${hasOneDrivePath ? '<li><code>OneDrive path detected</code></li>' : ''}
                        ${hasDocumentsPath ? '<li><code>Documents\\My Games\\Skyrim path detected</code></li>' : ''}
                    </ul>
                </li>
            </ul>
        </li>`;
    }
    return insights;
}


// ❓ Possible Mod Organizer 2 Virtual File System (USVFS) issue
function checkUsvfsIssue(sections) {
    let insights = '';
    const text = (sections.highestConfidenceIndicators || '').toLowerCase();

    const hasUsvfs = text.includes('usvfs_x64.dll');

    if (hasUsvfs) {
        insights += `<li>❓ <b>Possible Mod Organizer 2 Virtual File System (USVFS) issue:</b>
            This crash log's highest-confidence sections reference <code>usvfs_x64.dll</code>, which is part of Mod Organizer 2's virtual file system layer. Crashes here usually mean the game failed while interacting with MO2's file redirection system, not Skyrim itself.
            <ul>
                <li><b>Check Antivirus/Security Software:</b> This is the most common cause. Some antivirus tools interfere with USVFS injection. Add exceptions to your antivirus software for MO2 and Skyrim.</li>
                <li><b>Update MO2:</b> Consider upgrading if you aren't running the latest stable build of Mod Organizer 2.</li>
                <li>Detected indicators from highest-confidence sections of crash log:
                    <ul class="extraInfo">
                        ${hasUsvfs ? '<li><code>usvfs_x64.dll</code></li>' : ''}
                    </ul>
                </li>
            </ul>
        </li>`;
    }

    return insights;
}

// ❓ ENB Water Feature Incompatibility - Missing Boiling Bubbles Asset
function checkEnbWaterBoilBubblesIssue(sections) {
    let insights = '';
    const text = (sections.highestConfidenceIndicators || '').toLowerCase();
    const bottomHalfText = (sections.bottomHalf || '').toLowerCase();

    const hasMissingAsset = text.includes('mpswaterboilbubbles.nif');
    const hasWaterForEnb = bottomHalfText.includes('Water for ENB'.toLowerCase());

    if (hasMissingAsset && hasWaterForEnb) {
        insights += `<li>❓ <b>ENB Water Feature Incompatibility - Missing Boiling Bubbles Asset:</b>
            This crash appears to be caused by enabling specific ENB water-related features that reference asset files missing from <a href="https://www.nexusmods.com/skyrimspecialedition/mods/37061">Water for ENB</a>. The game attempts to load <code>MPSWaterBoilBubbles.nif</code>, which is currently not included in Water for ENB distributions.
            <ul>
                <li><b>Fix:</b> Try disabling all three of these configuration options for <b>Water</b> in <code>enbseries.ini</code>:
                    <ul>
                        <li><code>EnableVolumetricShadow</code></li>
                        <li><code>EnableCloudsShadow</code></li>
                        <li><code>EnableSelfReflection</code></li>
                    </ul>
                </li>
                <li><b>Root Cause:</b> The enabled features attempt to render boiling water bubble effects using <code>pBoilBubbles</code> parameter, but the required mesh file (<code>MPSWaterBoilBubbles.nif</code>) is not present in current Water for ENB packages.</li>
                <li>Detected indicators from highest-confidence sections of crash log:
                    <ul class="extraInfo">
                        <li><code>MPSWaterBoilBubbles.nif</code></li>
                        <li><code>Water for ENB</code> (plugin detected)</li>
                    </ul>
                </li>
            </ul>
        </li>`;
    }

    return insights;
}



// ❓ Possible armor weight perk calculation issue
function checkArmorWeightPerkIssue(sections) {
    let insights = '';
    const text = (sections.highestConfidenceIndicators || '').toLowerCase();
    
    const hasSkyrimExeOffset = text.includes('skyrimse.exe+0cd9f7c');
    const hasInputEvent = text.includes('pebqeavinputevent');

    if (hasSkyrimExeOffset || hasInputEvent) {
        insights += `<li>❓ <b>Possible armor weight perk calculation issue:</b>
            This crash signature has been associated with a bug in how the game calculates armor weight perks. 
            The issue appears to be triggered during gameplay, potentially when the game recalculates character stats or processes equipment changes.
            <ul>
                <li><b>If using OStim:</b> Update to the latest version, as newer versions may have addressed this issue</li>
                <li><b>Install and configure Scrambled Bugs:</b>
                    <ul>
                        <li>Install <a href="https://www.nexusmods.com/skyrimspecialedition/mods/43532">Scrambled Bugs</a> if not already installed</li>
                        <li>Open <code>Data/SKSE/Plugins/ScrambledBugs.json</code> in a text editor</li>
                        <li>Find the <code>"modArmorWeightPerkEntryPoint"</code> setting and set it to <code>false</code></li>
                        <li>Save the file and test stability</li>
                    </ul>
                </li>
                <li><b>Additional context:</b> This fix has resolved crashes for multiple users experiencing this specific issue. 
                    See <a href="https://www.reddit.com/r/Phostwood/comments/1or0dyw/skyrimseexe0cd9f7c_crash/">this discussion</a> for more details.</li>
                <li>Detected indicators from highest-confidence sections of crash log:
                    <ul class="extraInfo">
                        ${hasSkyrimExeOffset ? '<li><code>SkyrimSE.exe+0CD9F7C</code> (primary indicator)</li>' : ''}
                        ${hasInputEvent ? '<li><code>PEBQEAVInputEvent</code> (secondary indicator)</li>' : ''}
                    </ul>
                </li>
            </ul>
        </li>`;
    }
    return insights;
}



// ❗ Probable Disarm crash detected
function checkCombatMagicCasterDisarmIssue(sections) {
    let insights = '';
    const text = (sections.highestConfidenceIndicators || '').toLowerCase();
    
    const hasCombatMagicCasterDisarm = text.includes('combatmagiccasterdisarm');
    const hasEngineFixesDll = sections.bottomHalf.toLowerCase().includes('enginefixes.dll') || text.includes('enginefixes.dll');
    
    if (hasCombatMagicCasterDisarm) {
        insights += `<li>❗ <b>Probable Disarm crash detected:</b>
            This crash signature is usually associated with the disarm mechanic in combat. The crash occurs when weapons are forcibly removed from NPCs or the player during combat, typically through the Disarm shout or similar effects.
            <ul>
                <li><b>Install Disarmless:</b> Install the <a href="https://www.nexusmods.com/skyrimspecialedition/mods/12631">Disarmless</a> mod, which removes the Disarm shout from either Draugr only, or the entire game including mods. This mod has resolved crashes for multiple users experiencing this specific issue and is the recommended fix.</li>
                <li><b>Additional context:</b> This crash occurs during the disarm combat mechanic. Multiple users have reported this issue resolving immediately after installing Disarmless. 
                    See discussions on <a href="https://www.nexusmods.com/skyrimspecialedition/mods/12631?tab=posts">Nexus Mods</a> and 
                    <a href="https://www.reddit.com/r/Phostwood/comments/1pf8810/combatmagiccasterdisarm_crash/">Reddit</a>.</li>`;
        
        if (hasEngineFixesDll) {
            insights += `
                <li><b>Engine Fixes note:</b> Some users have reported this crash with version 7.x of <a href="https://www.nexusmods.com/skyrimspecialedition/mods/17230">Engine Fixes</a>. If installing Disarmless doesn't resolve the issue, check if there's a newer version of Engine Fixes released after December 12, 2024, as it may include a fix for this issue. As a last resort, you could try downgrading Engine Fixes to an earlier version (note: newer versions have important stability improvements, so this should only be done if other solutions fail).</li>`;
        }
        
        insights += `
                <li>Detected indicators:
                    <ul class="extraInfo">
                        ${hasCombatMagicCasterDisarm ? '<li><code>CombatMagicCasterDisarm</code> in highest-confidence sections of crash log</li>' : ''}
                        ${hasEngineFixesDll ? '<li><code>EngineFixes.dll</code> present</li>' : ''}
                    </ul>
                </li>
            </ul>
        </li>`;
    }
    return insights;
}


// ❗ Probable Custom Hair Color Mod Incompatibility
function checkCustomHairColorIssue(sections) {
    let insights = '';
    const text = (sections.highestConfidenceIndicators || '').toLowerCase();

    const hasBGSArtObjectCloneTask = text.includes('BGSArtObjectCloneTask'.toLowerCase());
    const hasActorMagicCaster = text.includes('actormagiccaster');
    const hasCustomHairColorDll = sections.fullLogFileLowerCase.includes('customhaircolor.dll');

    if (hasBGSArtObjectCloneTask && hasActorMagicCaster && hasCustomHairColorDll) {
        insights += `<li>❗ <b>Probable Custom Hair Color Mod Incompatibility:</b>
            This crash is caused by the <a href="https://www.nexusmods.com/skyrimspecialedition/mods/102909">Custom Hair Color</a> mod, which has become incompatible with recent Skyrim updates or conflicts with other installed mods. This is a commonly reported crash pattern.
            <ul>
                <li><b>Fix:</b> Disable or uninstall the Custom Hair Color mod. Users have consistently reported that removing this mod resolves the crashes.</li>
                <li>Detected indicators from crash log:
                    <ul class="extraInfo">
                        <li><code>BGSArtObjectCloneTask</code> in highest confidence portions of crash log</li>
                        <li><code>ActorMagicCaster</code> in highest confidence portions of crash log</li>
                        <li><code>CustomHairColor.dll</code> present in crash log</li>
                    </ul>
                </li>
            </ul>
        </li>`;
    }

    return insights;
}



// ❗ Probable Arcanum - A New Age of Magic Incompatibility
function checkArcanumJaceEyesCrash(sections) {
    let insights = '';
    const text = (sections.highestConfidenceIndicators || '').toLowerCase();

    const hasJaceEyes = text.includes('00spjaceeyes');
    const hasArcanumEsp = sections.fullLogFileLowerCase.includes('arcanum.esp');

    if (hasJaceEyes && hasArcanumEsp) {
        insights += `<li>❗ <b>Probable Arcanum - A New Age of Magic Incompatibility:</b>
            Crash likely caused by <a href="https://www.nexusmods.com/skyrimspecialedition/mods/23488">Arcanum - A New Age of Magic</a>. The crash involves the "00SPJaceEyes" asset, which appears to have issues in the original mod.
            <ul>
                <li><b>Fix:</b> Replace the original mod with <a href="https://www.nexusmods.com/skyrimspecialedition/mods/65221">Arcanum - A New Age of Magic (Fixed)</a>, which addresses this crash. Alternatively, disable Arcanum entirely if the fixed version doesn't resolve the issue.</li>
                <li>Detected indicators from crash log:
                    <ul class="extraInfo">
                        <li><code>00SPJaceEyes</code> in highest confidence portions of crash log</li>
                        <li><code>Arcanum.esp</code> present in crash log</li>
                    </ul>
                </li>
            </ul>
        </li>`;
    }

    return insights;
}




//❗ Missing J3w3ls' Essential Mods:
function analyzeJ3w3lsEssentialMods(sections) {
    let insights = '';
    //Maybe only show for sections.hasCrashLoggerSseLog ... or maybe just exclude for trainwreck?
    
    // Check if all plugins were loaded
    const modCounts = Utils.modCounts(sections);
    let hasLoadedGamePlugins = Utils.hasGamePluginsLoaded(modCounts, sections.gamePlugins);
    
    // Check for Missing Masters indicators
    const hasMissingMastersIndicators = 
        (sections.hasSkyrimAE && sections.firstLine.includes('0198090')) ||
        (!sections.hasSkyrimAE && sections.firstLine.includes('5E1F22')) ||
        sections.topHalf.includes('SettingT<INISettingCollection>*') ||
        !hasLoadedGamePlugins;
    
    // Helper function to group mods by category
    const groupByCategory = (modsArray) => {
        const grouped = {};
        modsArray.forEach(([key, mod]) => {
            if (!grouped[mod.category]) {
                grouped[mod.category] = [];
            }
            grouped[mod.category].push(mod);
        });
        return grouped;
    };
    
    // Helper function to format a mod entry
    const formatModEntry = (mod) => {
        const hasLink = mod.url && mod.name;
        const linkPart = hasLink ? `<a href="${mod.url}" target="_blank">${mod.name}</a>` : '';
        const separator = hasLink && mod.notes ? ' - ' : '';
        return `<li>${linkPart}${separator}${mod.notes}</li>`;
    };
    
    // Helper function to render category list
    const renderCategoryList = (modsByCategory) => {
        let html = '';
        Object.entries(modsByCategory).forEach(([category, mods]) => {
            html += `
                        <li><b>${category}:</b>
                            <ul>`;
            mods.forEach(mod => {
                html += `
                                ${formatModEntry(mod)}`;
            });
            html += `
                            </ul>
                        </li>`;
        });
        return html;
    };
    
    // Filter for testable essential mods
    const testableEssentialMods = Object.entries(skyrimEssentialMods)
        .filter(([key, mod]) => 
            (mod.category.includes('Essential') || mod.category.includes('Nice to Have') || mod.category.includes('Other Recommendations')) && 
            mod.crashLogFilenames.length > 0
        );
    
    // Filter for non-testable essential mods
    const originallyNonTestable = Object.entries(skyrimEssentialMods)
        .filter(([key, mod]) => 
            (mod.category.includes('Essential') || mod.category.includes('Nice to Have') || mod.category.includes('Other Recommendations')) && 
            mod.crashLogFilenames.length === 0
        );
    
    let missingMods = [];
    let nonTestableEssentialMods = [];
    
    if (hasMissingMastersIndicators) {
        // All testable mods become non-testable due to incomplete plugin loading
        nonTestableEssentialMods = [...testableEssentialMods, ...originallyNonTestable];
    } else {
        // Normal testing: find mods not present in crash log
        missingMods = testableEssentialMods.filter(([key, mod]) => {
            return !mod.crashLogFilenames.some(filename => 
                sections.bottomHalf.toLowerCase().includes(filename.toLowerCase().trim())
            );
        });
        nonTestableEssentialMods = originallyNonTestable;
    }

    // Only proceed if there are mods to report
    if (missingMods.length === 0 && nonTestableEssentialMods.length === 0) {
        return insights;
    }
    
    // Shared header - only show once
    const headerShown = missingMods.length > 0;
    
    if (headerShown) {
        const modsByCategory = groupByCategory(missingMods);
        
        insights += `
        <li>ℹ️ <b>J3w3ls' Essential Mods Not Found:</b> The following essential stability and bug-fixing mods from 
            <a href="https://github.com/TheOneAndOnlyJ3w3ls/Skyrim-Modding-Tutorials/wiki/J3w3ls'-Essential-Mod-List" target="_blank">J3w3ls' Essential Mod List</a> 
            were not detected in your crash log's mod list. These mods help prevent crashes and/or fix common bugs. J3w3ls is a highly experienced Skyrim modder, mod author, documentation writer, and veteran helper and admin from <a href="https://discord.com/invite/modding-guild-skyrim-guild-872252014002843658">The Modding Guild (Skyrim Guild) Discord</a>.
            <ul>
                <li><b>Missing Mods by Category:</b>
                    <ul>${renderCategoryList(modsByCategory)}
                    </ul>
                </li>`;
    } else {
        insights += `
        <li>ℹ️ <b>J3w3ls' Essential Mods:</b> Reference list from 
            <a href="https://github.com/TheOneAndOnlyJ3w3ls/Skyrim-Modding-Tutorials/wiki/J3w3ls'-Essential-Mod-List" target="_blank">J3w3ls' Essential Mod List</a> - These mods help prevent crashes and/or fix common bugs. J3w3ls is a highly experienced Skyrim modder, mod author, documentation writer, and veteran helper and admin from <a href="https://discord.com/invite/modding-guild-skyrim-guild-872252014002843658">The Modding Guild (Skyrim Guild) Discord</a>.
            <ul>`;
    }

    // Add non-testable section
    if (nonTestableEssentialMods.length > 0) {
        const nonTestableByCategory = groupByCategory(nonTestableEssentialMods);
        const reasonText = hasMissingMastersIndicators 
            ? '<b>Note:</b> Plugin loading was incomplete in this crash log, so these mods cannot be verified as installed or missing.' 
            : 'These mods cannot be detected from crash logs due to their file types, so they may or may not already be installed. Only a manual review can determine.';

        insights += `
                <li><b>Essential Mods That Cannot Be Tested From This Crash Log:</b> <a href="#" class="toggleButton">⤵️ show</a>
                    <ul class="extraInfo" style="display:none">
                        <li>${reasonText}</li>${renderCategoryList(nonTestableByCategory)}
                    </ul>
                </li>`;
    }

    insights += `
            </ul>
        </li>`;
    
    return insights;
}



// ❗ Probable SkyTactics/SkyValor Combat Navmesh Crash
function checkCombatNavmeshRetreatCrash(sections) {
    let insights = '';
    const text = (sections.highestConfidenceIndicators || '').toLowerCase();
    const includedMods = sections.bottomHalf.toLowerCase() || '';

    const hasCombatNavmeshCrash = text.includes('combatnavmeshsearcht<combatpathinggoalpolicyretreat,combatpathingsearchpolicystandard>');
    const hasSkyTactics = includedMods.includes('skytactics - dynamic combat styles.esp') || includedMods.includes('skytactics.esp');
    const hasSkyValor = includedMods.includes('skyvalor.esp');

    // Show warning if crash signature is present, regardless of whether the ESPs are detected
    // (since Crash Logger SSE often doesn't show all ESP files)
    if (hasCombatNavmeshCrash) {
        insights += `<li>❗ <b>Probable SkyTactics/SkyValor Combat Navmesh Crash:</b>
            Crash signature indicates a combat pathfinding issue commonly associated with <a href="https://www.nexusmods.com/skyrimspecialedition/mods/131148">SkyTactics - Dynamic Combat Styles</a> and/or <a href="https://www.nexusmods.com/skyrimspecialedition/mods/106240">SkyValor</a>. This may be caused by a conflict between these mods and other installed mods.
            <ul>
                <li><b>Fix:</b> Disable SkyTactics and/or SkyValor if you have them installed. If the crash persists, systematically disable other related mods to identify the conflicting mod combination.</li>
                ${hasSkyTactics || hasSkyValor ? '<li><b>Note:</b> One or both of these mods were detected in your load order.</li>' : '<li><b>Note:</b> These mods may be installed even if not detected in the crash log, as Crash Logger SSE does not always show all ESP files.</li>'}
                <li>Detected indicators from crash log:
                    <ul class="extraInfo">
                        <li><code>CombatNavmeshSearchT&lt;CombatPathingGoalPolicyRetreat,CombatPathingSearchPolicyStandard&gt;</code> crash signature found</li>
                        ${hasSkyTactics ? '<li><code>SkyTactics - Dynamic Combat Styles.esp</code> detected in bottom half of log</li>' : ''}
                        ${hasSkyValor ? '<li><code>SkyValor.esp</code> detected in bottom half of log</li>' : ''}
                    </ul>
                </li>
            </ul>
        </li>`;
    }

    return insights;
}


// ❗ Probable FISSES Thread Safety Crash
function checkFISSESThreadSafetyCrash(sections) {
    let insights = '';
    
    const isFISSESCrash = (sections.firstLine || '').toLowerCase().includes('fiss.dll');

    if (isFISSESCrash) {
        insights += `<li>❗ <b>Probable FISSES Thread Safety Crash:</b>
            Crash caused by <a href="https://www.nexusmods.com/skyrimspecialedition/mods/13956">FISSES (FileAccess Interface for Skyrim SE Scripts)</a>. FISS.dll is not thread-safe and crashes when multiple mods try to load their data files simultaneously during game startup.
            <ul>
                <li><b>Troubleshooting steps:</b>
                    <ul>
                        <li>Identify all mods using FISSES (check mod descriptions or MCM menus)</li>
                        <li>When possible, consider replacing FISSES-dependent mods with alternatives that use <a href="https://www.nexusmods.com/skyrimspecialedition/mods/13048">PapyrusUtil SE</a> (which is thread-safe)</li>
                        <li>Temporarily disable FISSES-dependent mods one at a time to identify the conflict</li>
                        <li>If using a modlist like Nolvus, check if you've added other FISSES mods besides the already-included "Simply Balanced"</li>
                        <li>If issues persist, disable all but one FISSES-dependent mod to prevent simultaneous file access</li>
                    </ul>
                </li>
                <li>Detected indicators from crash log:
                    <ul class="extraInfo">
                        <li><code>fiss.dll</code> in first error line</li>
                    </ul>
                </li>
            </ul>
        </li>`;
    }

    return insights;
}


// ❗ NPCs Use Potions + Ultimate Animated Potions NG Incompatibility
function checkNPCsPotionsUAPNGCrash(sections) {
    let insights = '';
    const highConfidence = (sections.highestConfidenceIndicators || '').toLowerCase();

    const hasDraugr = highConfidence.includes('draugr');

    if (hasDraugr) {
        const fullLog = sections.fullLogFileLowerCase || '';
        const hasNPCsUsePotions = fullLog.includes('npcsusepotions.esp');
        const hasUAPNG = fullLog.includes('uapng.dll');

        if (hasNPCsUsePotions && hasUAPNG) {
            insights += `<li>❗ <b>NPCs Use Potions + Ultimate Animated Potions NG Incompatibility:</b>
                Crash caused by an incompatibility between <a href="https://www.nexusmods.com/skyrimspecialedition/mods/67489">NPCs use Potions</a> and <a href="https://www.nexusmods.com/skyrimspecialedition/mods/97674">Ultimate Animated Potions NG</a>. This combination causes issues with NPC skeletons (particularly draugr) when they attempt to use animated potions.
                <ul>
                    <li><b>Fix options:</b>
                        <ul>
                            <li><b>Option 1:  (recommended)</b> Replace NPCs Use Potions with <a href="https://www.nexusmods.com/skyrimspecialedition/mods/40102">Smart NPC Potions - Enemies Use Potions and Poisons</a> (compatible alternative)</li>
                            <li><b>Option 2:</b> Disable Ultimate Animated Potions NG and keep NPCs Use Potions</li>
                            <li><b>Option 3:</b> Disable NPCs Use Potions and keep Ultimate Animated Potions NG</li>
                            <!-- <li><b>Option 4:</b> If you want to keep both, find a way to exclude draugr from using potions (advanced)</li> -->
                        </ul>
                    </li>
                    <li>Detected indicators from crash log:
                        <ul class="extraInfo">
                            <li><code>draugr</code> in highest confidence portions of crash log</li>
                            <li><code>NPCsUsePotions.esp</code> present in crash log</li>
                            <li><code>UAPNG.dll</code> present in crash log</li>
                        </ul>
                    </li>
                </ul>
            </li>`;
        }
    }

    return insights;
}