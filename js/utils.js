// Create a global Utils object
window.Utils = {};
Utils.logLines = [];

// Constants
Utils.isDebugging = true; // Set this to false to disable debugging (non-error) output
// Set this to control which batches of logs to display
//Utils.debugBatch = ['ALL'];  // Can be ['ALL'] or any array of specific batchIds
//Utils.debugBatch = ['analyzeLog', 'logSummary.js'];
//Utils.debugBatch = ['generateLogSummary', 'processLines', 'splitIntoLines', 'getLogSectionsMap', 'getLogSectionsMap'];
//Utils.debugBatch = ['getLogType', 'userInterface.js'];
//Utils.debugBatch = ['analyzeLog', 'getBadlyOrganizedNolvusPlugins' ];
//Utils.debugBatch = ['getLogSectionsMap_long'];
//Utils.debugBatch = ['hasSkyrimAE'];
//Utils.debugBatch = ['getLogSectionsMap_long', 'getLogType', 'getLogSectionsMap'];
//Utils.debugBatch = ['loadAndAnalyzeTestLog'];
//Utils.debugBatch = ['getLogSectionsMap_long', 'hasNewEslSupport'];
//Utils.debugBatch = ['checkForNolvusModlist', 'getLogSectionsMap_long'];
//Utils.debugBatch = ['missingMastersDiagnosis'];
//Utils.debugBatch = ['getPercentAlphabetized'];
//Utils.debugBatch = ['hasSkyrimVersionOrHigher', 'hasSkyrimAE', 'hasNewEslSupport'];
//Utils.debugBatch = ['getDllVersionFromLog', 'hasCompatibleDll', 'checkDllCompatibility', 'compareVersions'];
//Utils.debugBatch = ['hasCompatibleDll', 'checkDllCompatibility', 'getDllVersionFromLog'];

Utils.debugBatch = [''];





Utils.isSkyrimPage = window.location.href.toLowerCase().includes('skyrim.html');

Utils.SkyrimOrNolvusText = Utils.isSkyrimPage ? 'Skyrim' : 'Nolvus';

Utils.nolvusUltraPlugins = [
    'treerific.esp',
    'dawn of skyrim.esp',
    'moretreesincities.esp'
];

Utils.physicsPlugins = [
    'kshairdossmp.esp',
    'ursine armour hdt smp se.esp',
    '1nivwiccloaks_smp_patch.esp',
    'cloaks&capes_smp_patch.esp',
    'cloaks_smp_patch.esp'
];

Utils.alternateLevelingPlugins = [
    'experience.esl',
    'experience.esp',
    'staticskillleveling.esp'
];

Utils.hardcoreModePlugins = [
    'skyrim revamped.esp',
    'the_sinister_seven.esp',
    'realistic ai detection 3 - lite.esp'
];

Utils.splitLogIntoLines = function(logFile) {
    Utils.debuggingLog(['splitLogIntoLines'], 'Entering splitLogIntoLines');
    Utils.debuggingLog(['splitLogIntoLines'], 'logFile length:', logFile.length);
    
    if (typeof logFile !== 'string' || logFile.length === 0) {
        console.error('ERROR: Invalid log file. Unable to split into lines.');
        this.logLines = [];
        return this.logLines;
    }

    this.logLines = logFile.split('\n');
    Utils.debuggingLog(['splitLogIntoLines'], 'Number of lines after split:', this.logLines.length);
    
    if (this.logLines.length > 0) {
        Utils.debuggingLog(['splitLogIntoLines'], 'First line:', this.logLines[0]);
        if (this.logLines.length > 1) Utils.debuggingLog(['splitLogIntoLines'], 'Second line:', this.logLines[1]);
        if (this.logLines.length > 2) Utils.debuggingLog(['splitLogIntoLines'], 'Third line:', this.logLines[2]);
    }

    return this.logLines;
};

// Utility functions
Utils.isReady = false;
Utils.init = function() {
    this.isReady = true;
};

Utils.debuggingLog = function(batchIds, message, content) {
    if (Utils.isDebugging &&
            (Utils.debugBatch.includes('ALL') || batchIds.some(id => Utils.debugBatch.includes(id)))) {
      if (content === undefined) content = ' ';
      console.groupCollapsed(`[${batchIds.join('|')}]`, message, content);
      console.trace('Caller location');
      console.groupEnd();
    }
};


// Helper function to compare version strings
Utils.compareVersions = function (a, b) {
    Utils.debuggingLog(['compareVersions'], `Comparing ${a} with ${b}`);
    let segmentsA = a.split('.').map(Number);
    let segmentsB = b.split('.').map(Number);

    // Function to get the number of segments
    function numberOfSegments(segments) {
        return segments.length;
    }

    // Function to compare versions with equal number of segments
    function compareVersionsWithEqualSegments(segmentsA, segmentsB) {
        for (let i = 0; i < segmentsA.length; i++) {
            let segmentA = parseInt(segmentsA[i]);
            let segmentB = parseInt(segmentsB[i]);

            if (segmentA === segmentB) {
                continue;
            } else if (segmentA > segmentB) {
                return 1;
            } else if (segmentA < segmentB) {
                return -1;
            }
        }
        return 0;
    }

    // Function to remove trailing zeros or ones (until both segments have an equal length)
    function removeTrailingZerosOrOnes(segmentsA, segmentsB) {
        while (numberOfSegments(segmentsA) > numberOfSegments(segmentsB) && (segmentsA[segmentsA.length - 1] === 0 || segmentsA[segmentsA.length - 1] === 1)) {
            segmentsA.pop();
        }
        while (numberOfSegments(segmentsB) > numberOfSegments(segmentsA) && (segmentsB[segmentsB.length - 1] === 0 || segmentsB[segmentsB.length - 1] === 1)) {
            segmentsB.pop();
        }
        return [segmentsA, segmentsB];
    }

    // Adjust segments to have equal number of segments if possible
    [segmentsA, segmentsB] = removeTrailingZerosOrOnes(segmentsA, segmentsB);

    // If A is longer than B
    if (numberOfSegments(segmentsA) > numberOfSegments(segmentsB)) {
        const shortenedA = segmentsA.slice(0, numberOfSegments(segmentsB));
        const result = compareVersionsWithEqualSegments(shortenedA, segmentsB);
        if (result !== 0) {
            return result;
        }
        return 1; // A is greater if shortened A is equal to B
    }

    // If B is longer than A
    if (numberOfSegments(segmentsB) > numberOfSegments(segmentsA)) {
        const shortenedB = segmentsB.slice(0, numberOfSegments(segmentsA));
        const result = compareVersionsWithEqualSegments(segmentsA, shortenedB);
        if (result !== 0) {
            return result;
        }
        return -1; // B is greater if shortened B is equal to A
    }

    // If both have the same number of segments
    return compareVersionsWithEqualSegments(segmentsA, segmentsB);
}











function testCompareVersions() {
    function interpretResult(result, a, b) {
        if (result === 0) return `${a} is considered equal to ${b}`;
        if (result > 0) return `${a} is considered greater than ${b}`;
        return `${a} is considered less than ${b}`;
    }

    function expectResult(a, b, expectedResult) {
        const result = Utils.compareVersions(a, b);
        const interpretation = interpretResult(result, a, b);
        Utils.debuggingLog(['testCompareVersions'], `   Interpretation: ${interpretation}`);

        if (
            (expectedResult === 'equal' && result !== 0) ||
            (expectedResult === 'greater' && result <= 0) ||
            (expectedResult === 'less' && result >= 0)
        ) {
            console.error(`Error: Unexpected result for ${a} vs ${b}. Expected ${expectedResult}, got ${interpretation}`);
        }
    }

    const testCases = [
        //equal cases:
        ['1.4.0', '1.4', 'equal'],
        ['1.4.1', '1.4', 'equal'],
        ['1.4', '1.4.0', 'equal'],
        ['1.1', '1', 'equal'],
        ['1.0', '1', 'equal'],
        ['1.0.0.0.1', '1', 'equal'],
        ['1', '1.0.0.0', 'equal'],
        ['1.1', '1', 'equal'],
        ['1.1', '1.1', 'equal'],
        ['1', '1.0.0.0.0', 'equal'],
        ['1', '1.1', 'equal'],
        ['2.3', '2.3.0.0.0', 'equal'],
        ['2.3', '2.3.1', 'equal'],
        ['4.5.6', '4.5.6.0.0.0', 'equal'],
        ['4.5.6', '4.5.6.1', 'equal'],
        ['7.8.9.10', '7.8.9.10.0.0.0', 'equal'],
        ['7.8.9.10', '7.8.9.10.1', 'equal'],
        ['1.2.3.4.5.6.7.8.9.10', '1.2.3.4.5.6.7.8.9.10.0', 'equal'],
        ['1.2.3.4.5.6.7.8.9.10', '1.2.3.4.5.6.7.8.9.10.1', 'equal'],
        //greater than cases:
        ['1.1', '1.0', 'greater'],
        ['1.1.1', '1.1.0', 'greater'],
        ['1.1.1.1', '1.0.1', 'greater'],
        ['1.2', '1.1.9999', 'greater'],
        ['1.6.999.1', '1.6.500.999', 'greater'],
        ['1.0.1.3', '1', 'greater'],
        ['1.0.1.3', '1.0.1.2', 'greater'],
        ['1.0.1.3', '1.0.1.2.0.0.0', 'greater'],
        ['1.1.0.3', '1', 'greater'],
        ['1.1.0.3', '1.0.1.2', 'greater'],
        ['1.1.0.3', '1.0.1.2.0.0.0', 'greater'],      
        //less than cases:
        ['1.0', '1.1', 'less'],
        ['1.0.0.0.1', '1.0.0.1', 'less'],
        ['1.1.9999', '1.2', 'less'],
        ['1.6.500.999', '1.6.999.1', 'less'],
    ];

    Utils.debuggingLog(['testCompareVersions'], 'Testing compareVersions function:');
    Utils.debuggingLog(['testCompareVersions'], '--------------------------------');

    testCases.forEach(([a, b, expected], index) => {
        Utils.debuggingLog(['testCompareVersions'], `Test ${index + 1}: compareVersions('${a}', '${b}')`);
        expectResult(a, b, expected);
    });
    Utils.debuggingLog(['testCompareVersions'], '--------------------------------');
}

// Run the test
testCompareVersions();





Utils.getSkyrimVersion = function(sectionHeader) {
    const lowerCaseLog = sectionHeader.toLowerCase();
    let version = null;

    // Check for Net Script Framework log format
    const nsfMatch = lowerCaseLog.match(/applicationversion:\s*(\d+\.\d+\.\d+\.\d+)/);
    if (nsfMatch) {
        Utils.debuggingLog(['getSkyrimVersion'], `Skyrim version detected: ${nsfMatch}`);
        return nsfMatch[1];
    }

    // Check for Crash Logger and Trainwreck log formats
    const versionMatch = lowerCaseLog.match(/skyrim\s*(?:se|sse)?\s*v?(\d+\.\d+\.\d+)/i);
    if (versionMatch) {
        Utils.debuggingLog(['getSkyrimVersion'], `Skyrim version detected: ${versionMatch}`);
        return versionMatch[1];
    }

    console.warn('ERROR: Unable to determine Skyrim version from log.');
    return null;
};

Utils.hasSkyrimVersionOrHigher = function(sectionHeader, targetVersion) {
    const detectedVersion = Utils.getSkyrimVersion(sectionHeader);
    
    if (!detectedVersion) {
        return false;
    }
    
    const version = detectedVersion.split('.').map(Number);

    // Compare versions
    for (let i = 0; i < targetVersion.length; i++) {
        if (version[i] > targetVersion[i]) {
            Utils.debuggingLog(['hasSkyrimVersionOrHigher'], `Version ${detectedVersion} is greater than or equal to ${targetVersion.join('.')}`);
            return true;
        }
        if (version[i] < targetVersion[i]) {
            Utils.debuggingLog(['hasSkyrimVersionOrHigher'], `Version ${detectedVersion} is less than ${targetVersion.join('.')}`);
            return false;
        }
    }
    
    Utils.debuggingLog(['hasSkyrimVersionOrHigher'], `Version ${detectedVersion} is equal to ${targetVersion.join('.')}`);
    return true; // Versions are equal
};

Utils.hasSkyrimAE = function(sectionHeader) {
    const isAE = Utils.hasSkyrimVersionOrHigher(sectionHeader, [1, 6, 0, 0]);
    Utils.debuggingLog(['hasSkyrimAE_long'], 'hasSkyrimAE raw sectionHeader:', sectionHeader);
    Utils.debuggingLog(['hasSkyrimAE'], 'hasSkyrimAE flag set to:', isAE);
    return isAE;
};

Utils.hasNewEslSupport = function(sectionHeader) {
    const hasNewEslSupport = Utils.hasSkyrimVersionOrHigher(sectionHeader, [1, 6, 1130, 0]);
    Utils.debuggingLog(['hasNewEslSupport_long'], 'hasNewEslSupport raw sectionHeader:', sectionHeader);
    Utils.debuggingLog(['hasNewEslSupport'], 'hasNewEslSupport flag set to:', hasNewEslSupport);
    return hasNewEslSupport;
};

Utils.hasSkyrimAE1170 = function(sectionHeader) {
    const hasSkyrimAE1170 = Utils.hasSkyrimVersionOrHigher(sectionHeader, [1, 6, 1170, 0]);
    Utils.debuggingLog(['hasSkyrimAE1170_long'], 'hasSkyrimAE1170 raw sectionHeader:', sectionHeader);
    Utils.debuggingLog(['hasSkyrimAE1170'], 'hasSkyrimAE1170 flag set to:', hasSkyrimAE1170);
    return hasSkyrimAE1170;
};


Utils.pluginChecker = function(crashLog, plugins) {
    const lowerCaseLog = crashLog.toLowerCase();
    return plugins.some(plugin => lowerCaseLog.includes(plugin));
};

Utils.hasNolvusUltra = function(crashLog) {
    return this.pluginChecker(crashLog, this.nolvusUltraPlugins);
};

Utils.hasPhysics = function(crashLog) {
    return this.pluginChecker(crashLog, this.physicsPlugins);
};

Utils.hasAlternateLeveling = function(crashLog) {
    return this.pluginChecker(crashLog, this.alternateLevelingPlugins);
};

Utils.hasHardcoreMode = function(crashLog) {
    return this.pluginChecker(crashLog, this.hardcoreModePlugins);
};

Utils.hasFantasyMode = function(crashLog) {
    return crashLog.toLowerCase().includes('doublejump.esp');
};

Utils.hasSseFpsStabilizer = function(crashLog) {
    return crashLog.toLowerCase().includes('ssefpsstabilizer.dll');
};

Utils.hasPaidUpscaler = function(crashLog) {
    const lowerCaseLog = crashLog.toLowerCase();
    return ['ffx_fsr2_api_x64.dll', 'nvngx_dlssg.dll', 'libxess.dll'].some(dll => lowerCaseLog.includes(dll));
};

Utils.hasFSR3 = function(crashLog) {
    return crashLog.toLowerCase().includes('nvngx_dlssg.dll');
};

Utils.countNullVoid = function(crashLog) {
    const lowerCaseLog = crashLog.toLowerCase();
    return (lowerCaseLog.match(/null/g) || []).length + (lowerCaseLog.match(/void/g) || []).length;
};



Utils.countNonEslPlugins = function(crashLogSection) {
    //NOTE: complicated in that some .esp files are flagged to behave in this manner like .esl files.
    //NOTE: solution to this (thank you keyf!) is that all non-ESLs have only two characters in their hex number
    /*  Example log file section showing the difference:
            [00] Skyrim.esm
            [FE] EldenSkyrim_RimSkills.esp
            [FF] FNIS.esp
            [FE 000] ccbgssse002-exoticarrows.esl
            [FE 001] ccbgssse003-zombies.esl
        2nd Example which broke my initially published implementation of this with the "1" at the beginning of the filename. The regex is loosened up considerably now (but I don't think it will give any overly high counts):
            [FE] HotKeySkill.esp
            [FF] 1Ogres.esp
            [FE 000] ccbgssse002-exoticarrows.esl
    */
    const nonEslPluginRegex = /\[([0-9A-F]{2})\].+\.(esp|esm|esl)/gi;
    let largestHex = "00";

    let matchArray;
    while ((matchArray = nonEslPluginRegex.exec(crashLogSection)) !== null) {
        if (parseInt(matchArray[1], 16) > parseInt(largestHex, 16)) {
            largestHex = matchArray[1];
        }
    }

    const nonEslPluginsCount = parseInt(largestHex, 16);
    
    return {
        largestHex: `[${largestHex}]`,
        nonEslPluginsCount: nonEslPluginsCount
    };
};


Utils.countPlugins = function(crashLog) {
    const match = crashLog.match(/Game plugins \((\d+)\)\s*\{/);
    return match ? parseInt(match[1], 10) : 0;
};

Utils.reduxOrUltraVariant = function(crashLog) {
    const pluginCount = this.countPlugins(crashLog);
    if (pluginCount > 2100) {
        return this.hasNolvusUltra(crashLog) ? 'Ultra' : 'Redux';
    }
    return '???';
};

Utils.getNolvusVersion = function(sections) {
    // First check if this is even a complete-ish NSF log
    if (!sections.bottomHalf) {
        Utils.debuggingLog(['getNolvusVersion'], 'No bottomHalf section found in log');
        return null;
    }

    const isNolvusLog = !Utils.isSkyrimPage; //FOR NOW assume all usage of the Nolvus Crash Log Analyzer is for Nolvus

    // Check for version 6 marker
    if (isNolvusLog && sections.bottomHalf.toLowerCase().includes('northern roads - nolvus fixes.esp')) {
        Utils.debuggingLog(['getNolvusVersion'], 'Detected Nolvus version 6');
        return 6;
    }

    if (isNolvusLog) {
        Utils.debuggingLog(['getNolvusVersion'], 'Detected Nolvus version 5');
        return 5;
    }

    Utils.debuggingLog(['getNolvusVersion'], 'No Nolvus version detected');
    return null;
};


Utils.getLogType = function(lines) {
    Utils.debuggingLog(['getLogType'], 'Entering getLogType');
    Utils.debuggingLog(['getLogType'], 'Number of lines:', lines.length);
    
    if (lines.length > 2 && lines[2].includes('NetScriptFramework')) {
        Utils.debuggingLog(['getLogType'], 'Detected NetScriptFramework log');
        return 'NetScriptFramework';
    } else if (lines.length > 1 && lines[1].includes('CrashLoggerSSE')) {
        Utils.debuggingLog(['getLogType'], 'Detected CrashLogger log');
        return 'CrashLogger';
    } else if (lines.length > 1 && lines[1].toLowerCase().includes('trainwreck')) {
        Utils.debuggingLog(['getLogType'], 'Detected Trainwreck log');
        return 'Trainwreck';
    } else {
        console.error(['getLogType'], 'ERROR: Unknown log type detected');
        Utils.debuggingLog(['getLogType'], 'First 500 characters of passed log:', lines.slice(0, 500));
        return 'Unknown';
    }
};

Utils.setLogType = function (logType) {
    Utils.logType = logType;
    if (Utils.isSkyrimPage) {
        if (logType === 'CrashLogger') {
            document.getElementById('logType').value = 'crashlogger';
        } else if (logType === 'NetScriptFramework') {
            document.getElementById('logType').value = 'netscript';
        } else if (logType === 'Trainwreck') {
            document.getElementById('logType').value = 'trainwreck';
        }
        // Trigger the change event to update the UI
        document.getElementById('logType').dispatchEvent(new Event('change'));
    }
};

Utils.getDllVersionFromLog = function(sections, dllFileName) {
    if (sections.logType !== 'CrashLogger' && sections.logType !== 'Trainwreck') {
        console.warn('ERROR: Unsupported log type for getDllVersionFromLog');
        return '(unlisted in NSF logs)';
    }

    let version = null;

    // Check SKSE plugins section (both CrashLogger and Trainwreck)
    if (sections.sksePlugins) {
        const pluginLines = sections.sksePlugins.split('\n');
        for (const line of pluginLines) {
            if (line.includes(dllFileName)) {
                const parts = line.split(/\s+/);
                const lastPart = parts[parts.length - 1].trim();
                if (lastPart && !lastPart.includes(dllFileName)) {
                    version = lastPart.replace('v', '');
                    Utils.debuggingLog(['getDllVersionFromLog'], `Version found in log for ${dllFileName}: ${version}`);
                } else {
                    version = '0.0.0.1'; // default version number when mod's .DLL is listed, but no version number given
                    Utils.debuggingLog(['getDllVersionFromLog'], `No version found in log for ${dllFileName}`);
                }
                break;
            }
        }
    }

    /* DISABLE CODE? (1) is only for Trainwreck, which we recommend against anyway
    //  (2) still has a bug where version shows up as the DLL filename
    //  (3) most mods in Trainwreck's modules section don't have version numbers anyway
    //  (4) ... so, this is mostly a test for the SKSE section which is already tested for above
    // Check modules section (Trainwreck only, as CrashLogger's "MODULES:"" section doesn't list version numbers)
    if (!version && sections.logType == 'Trainwreck' && sections.modules) {
        const moduleLines = sections.modules.split('\n');
        for (let i = 0; i < moduleLines.length; i++) {
            if (moduleLines[i].includes(dllFileName)) {
                const versionLine = moduleLines[i + 2]; // Version is typically two lines below the DLL name
                if (versionLine && versionLine.includes('Version:')) {
                    version = versionLine.split('Version:')[1].trim().replace('v', '');
                    if (version == dllFileName || !version) {
                        version = '0.0.0.1'; // default version number when mod's .DLL is listed, but no version number given
                    }
                    break;
                }
            }
        }
    }  

    if (version != "0.0.0.1") {
        Utils.debuggingLog(['getDllVersionFromLog'], `Version found in log for ${dllFileName}: ${version}`);
    } else {
        Utils.debuggingLog(['getDllVersionFromLog'], `No version found in log for ${dllFileName}`);
    }*/

    return version;
};


Utils.preProcessLogFile = function(logFile) {
    // Remove space characters from empty lines
    logFile = logFile.replace(/^\s+$/gm, '');
    
    // Remove any leading or trailing whitespace
    //DISABLED SINCE CrashLogger and Trainwreck use significant indentations:  logFile = logFile.trim();
    
    // Add more pre-processing steps here as needed
    
    return logFile;
};



//Split log files into sections 
Utils.getLogSectionsMap = function(logFile) {
    Utils.debuggingLog(['getLogSectionsMap'], 'Entering getLogSectionsMap');
    Utils.debuggingLog(['getLogSectionsMap'], 'logFile length:', logFile.length);

    // Pre-process the logFile
    logFile = this.preProcessLogFile(logFile);
    Utils.debuggingLog(['getLogSectionsMap'], 'Processed logFile length:', logFile.length);
    
    // Always call splitLogIntoLines to ensure fresh processing
    this.splitLogIntoLines(logFile);
    
    Utils.debuggingLog(['getLogSectionsMap'], 'Number of lines:', this.logLines.length);
    
    if (this.logLines.length === 0) {
        console.error('ERROR: No lines in log file. Unable to process log sections.');
        return { sections: {}, sectionsMap: new Map() };
    }

    const logType = this.getLogType(this.logLines);
    Utils.logType = logType;
    Utils.debuggingLog(['getLogSectionsMap'], 'Detected log type:', Utils.logType);

    const sectionDefinitions = [
        {
            //LEGEND: "nsf" = .Net Script Framework, "cl" = Crash Logger, "tw" = Trainwreck
            name: 'header',
            nsfLabel: 'Header',
            clLabel: 'Header',
            twHeader: 'Header',
            nsfRegex: /^[\s\S]*?(?=Possible relevant objects)/,
            clRegex: /^[\s\S]*?(?=PROBABLE CALL STACK)/,
            twRegex: /^[\s\S]*?(?=PROBABLE CALL STACK)/,
            nsfPriority: 0,
            clPriority: 0,
            twPriority: 0,
            nsfColor: null,
            clColor: null,
            twColor: null,
            nolvusExpectedMin: null,
            nolvusExpectedMax: null
        },
        {
            name: 'firstLine',
            nsfLabel: 'First Line',
            clLabel: 'First Line',
            twLabel: 'First Line',
            nsfRegex: /^.*$/m,
            clRegex: /^.*$/m,
            twRegex: /^.*$/m,
            nsfPriority: 1,
            clPriority: 1,
            twPriority: 1,
            nsfColor: 'red',
            clColor: 'red',
            twColor: 'red',
            nolvusExpectedMin: 1,
            nolvusExpectedMax: 1
        },
        {
            name: 'relevantObjects',
            nsfLabel: 'Possible relevant objects',
            clLabel: null, // CrashLogger logs don't have this section
            twLabel: null, // Trainwreck logs don't have this section
            nsfRegex: /Possible relevant objects \(\d+\)\s*\{([\s\S]*?)(?=\n*\})/,
            clRegex: null,
            twRegex: null,
            nsfPriority: 2,
            clPriority: null,
            twPriority: null,
            nsfColor: 'darkorange',
            clColor: null,
            twColor: null,
            nolvusExpectedMin: 0,
            nolvusExpectedMax: 50
        },
        {
            name: 'probableCallstack',
            nsfLabel: 'Probable callstack',
            clLabel: 'Probable call stack',
            twLabel: 'Probable call stack',
            nsfRegex: /Probable callstack(?:\s*\(.*?\))?\s*\{([\s\S]*?)(?=\n*\})/,
            clRegex: /PROBABLE CALL STACK:(?:\r?\n)([\s\S]*?)(?=\n\nREGISTERS:)/,
            twRegex: /PROBABLE CALL STACK:(?:\r?\n)([\s\S]*?)(?=\n\nREGISTERS:)/,
            nsfPriority: 3,
            clPriority: 2,
            twPriority: 2,
            nsfColor: 'gold',
            clColor: 'darkorange',
            twColor: 'darkorange',
            nolvusExpectedMin: 0,
            nolvusExpectedMax: 500
        },
        {
            name: 'registers',
            nsfLabel: 'Registers',
            clLabel: 'Registers',
            twLabel: 'Registers',
            nsfRegex: /Registers\s*\{([\s\S]*?)(?=\n*\})/,
            clRegex: /REGISTERS:(?:\r?\n)([\s\S]*?)(?=\n\nSTACK:)/,
            twRegex: /REGISTERS:(?:\r?\n)([\s\S]*?)(?=\n\nSTACK:)/,
            nsfPriority: 4,
            clPriority: 3,
            twPriority: 3,
            nsfColor: 'dodgerblue',
            clColor: 'gold',
            twColor: 'gold',
            nolvusExpectedMin: 0,
            nolvusExpectedMax: 500
        },
        {
            name: 'stack',
            nsfLabel: 'Stack',
            clLabel: 'Stack',
            twLabel: 'Stack',
            nsfRegex: /Stack\s*\{([\s\S]*?)(?=\n*\})/,
            clRegex: /^STACK:(?:\r?\n)([\s\S]*?)(?=\n\nMODULES:)/m,
            twRegex: /^STACK:(?:\r?\n)([\s\S]*?)(?=\n\nMODULES:)/m,
            nsfPriority: 5,
            clPriority: 4,
            twPriority: 4,
            nsfColor: 'blueviolet',
            clColor: 'dodgerblue',
            twColor: 'dodgerblue',
            nolvusExpectedMin: 20,
            nolvusExpectedMax: 600
        },
        {
            name: 'modules',
            nsfLabel: 'Modules',
            clLabel: 'Modules',
            twLabel: 'Modules',
            nsfRegex: /Modules\s*\{([\s\S]*?)(?=\n*\})/,
            clRegex: /^MODULES:(?:\r?\n)([\s\S]*?)(?=\n\nSKSE PLUGINS:)/m,
            twRegex: /^MODULES:(?:\r?\n)([\s\S]*?)(?=\n\nSCRIPT EXTENDER PLUGINS:)/m,
            nsfPriority: 6,
            clPriority: 5,
            twPriority: 5,
            nsfColor: null,
            clColor: null,
            twColor: null,
            nolvusExpectedMin: 270,
            nolvusExpectedMax: 305
        },
        {
            name: 'sksePlugins',
            nsfLabel: null, // .NET Script Framework logs don't have this section
            clLabel: 'SKSE Plugins',
            twLabel: 'Script Extender Plugins',
            nsfRegex: null,
            clRegex: /^SKSE PLUGINS:(?:\r?\n|\s)([\s\S]*?)(?=\r?\n\r?\nPLUGINS:)/m,
            twRegex: /^SCRIPT EXTENDER PLUGINS:[\r\n]+([\s\S]*)$/m,
            nsfPriority: null,
            clPriority: 6,
            twPriority: 6,
            nsfColor: null,
            clColor: null,
            twColor: null,
            nolvusExpectedMin: null,
            nolvusExpectedMax: null
        },
        {
            name: 'plugins',
            nsfLabel: 'Plugins',
            clLabel: null, // CrashLogger logs don't have this section (at least not with the same purpose)
            twLabel: null, // Trainwreck logs don't have this section (at least not with the same purpose)
            nsfRegex: /Plugins\s*\((\d+)\)\s*\{/, //NOTE: this data is different than the rest, so just grabbing the #
            clRegex: null,
            twRegex: null,
            nsfPriority: 7,
            clPriority: null,
            twPriority: null,
            nsfColor: null,
            clColor: null,
            twColor: null,
            nolvusExpectedMin: 2,
            nolvusExpectedMax: 3
        },
        {
            name: 'gamePlugins',
            nsfLabel: 'Game plugins',
            clLabel: 'PLUGINS', //NOTE: for Crash Logger, this section is just called PLUGINS (confusing, but seems unavoidable)
            twLabel: null, // Trainwreck logs don't have this section
            nsfRegex: /Game plugins \(\d+\)\s*\{(?:\r?\n)([\s\S]*?)(?=\r?\n\s*\})/,
            clRegex: /^PLUGINS:.*\r?\n.*\r?\n([\s\S]*)/m,
            twRegex: null,
            nsfPriority: 8,
            clPriority: 7,
            twPriority: null,
            nsfColor: null,
            clColor: null,
            twColor: null,
            nolvusExpectedMin: 2215,
            nolvusExpectedMax: 2400
        }
    ];

    const getSection = (regex, fallback = '', sectionName = '') => {
        if (!regex) return fallback;
        const match = logFile.match(regex);
        if (sectionName === 'plugins' && match && match[1]) {
          // Return just the captured number for Net Script Framework plugins (note: diff than gamePlugins):
          const pluginCount = parseInt(match[1], 10);
          return isNaN(pluginCount) ? fallback : Array(pluginCount).fill('Plugin_Name: Version 1.0').join('\n');
        }
        return match ? match[match.length - 1] : fallback;
    };

    const sections = {};
    Utils.debuggingLog(['getLogSectionsMap'], 'Log type:', logType);
    Utils.debuggingLog(['getLogSectionsMap'], 'Log file length:', logFile.length);
    const sectionsMap = new Map();
    sectionsMap.set('logType', logType);

    sectionDefinitions.forEach(def => {
        const regex = logType === 'NetScriptFramework' ? def.nsfRegex : (logType === 'CrashLogger' ? def.clRegex : def.twRegex);
        const priority = logType === 'NetScriptFramework' ? def.nsfPriority : (logType === 'CrashLogger' ? def.clPriority : def.twPriority);
        const label = logType === 'NetScriptFramework' ? def.nsfLabel : (logType === 'CrashLogger' ? def.clLabel : def.twLabel);
        const color = logType === 'NetScriptFramework' ? def.nsfColor : (logType === 'CrashLogger' ? def.clColor : def.twColor);
        const sectionContent = getSection(regex, '', def.name);
        Utils.debuggingLog(['getLogSectionsMap'], `Section ${def.name} content length:`, sectionContent ? sectionContent.length : 0);
        sections[def.name] = sectionContent;
        if (priority !== null) {
            sectionsMap.set(def.name, {
                content: sectionContent,
                label: label,
                priority,
                color: color,
                nolvusExpectedMin: def.nolvusExpectedMin,
                nolvusExpectedMax: def.nolvusExpectedMax
            });
        }
    });
    sections.logType = logType;
    if(logType === 'CrashLogger' || logType === 'Trainwreck') {
        sections.firstLine = this.logLines[3]; // NOTE: for Crash Logger (and Trainwreck) logs, what I called the "firstLine" for NSF logs is moved to the 4th line (designated as the 3rd in the array).
        sectionsMap.set('firstLine', {  // NOTE: update sectionsMap
            ...sectionsMap.get('firstLine'),
            content: this.logLines[3]
        });
    }
    sections.hasSkyrimAE = this.hasSkyrimAE(sections.header);
    sections.hasNewEslSupport = this.hasNewEslSupport(sections.header);
    //wrong way to set since not already set before?: sectionsMap.set('hasNewEslSupport', Utils.hasNewEslSupport(sections.header));
    sections.hasSkyrimAE1170 = this.hasSkyrimAE1170(sections.header);
    //wrong way to set since not already set before?: sectionsMap.set('hasSkyrimAE1170', Utils.hasSkyrimAE1170(sections.header));


    sections.secondLine = this.logLines[1];
    sections.thirdLine = this.logLines[2];

    // Create composite sections
    sections.header = sections.header; //QUESTION: WHY DO I HAVE TO RE-SPECIFY THIS SECTION?
    sections.topQuarter = [sections.firstLine, sections.relevantObjects, sections.probableCallstack].filter(Boolean).join('\n\n');
    sections.topThird = [sections.firstLine, sections.relevantObjects, sections.probableCallstack, sections.registers].filter(Boolean).join('\n\n');
    sections.topHalf = [sections.firstLine, sections.relevantObjects, sections.probableCallstack, sections.registers, sections.stack].filter(Boolean).join('\n\n');
    sections.bottomHalf = [sections.modules, sections.sksePlugins, sections.plugins, sections.gamePlugins].filter(Boolean).join('\n\n');
    sections.topThirdNoHeading = [sections.relevantObjects, sections.probableCallstack, sections.registers].filter(Boolean).join('\n\n');
    sections.fullLogFileLowerCase = logFile.toLowerCase();
    sections.fullLogFile = logFile;
    

    // Add debugging output for the entire sections object
    Utils.debuggingLog(['getLogSectionsMap_long'], '-', '-- ------------------ ---');
    Utils.debuggingLog(['getLogSectionsMap_long'], '-', '-- BEGIN LOG SECTIONS ---');
    Utils.debuggingLog(['getLogSectionsMap_long'], '-', '-- ------------------ ---');
    //Utils.debuggingLog(['getLogSectionsMap_long'], 'Sections object:', sections); //I think I prefer it without stringify?
    //Utils.debuggingLog(['getLogSectionsMap'], 'Sections object:', JSON.stringify(sections, null, 2));
    //Utils.debuggingLog(['getLogSectionsMap_long'], 'sectionsMap object:', sectionsMap);
    Utils.debuggingLog(['getLogSectionsMap_long'], 'Sections object:', 
        Object.fromEntries(
            Object.entries(sections).map(([key, value]) => 
                [key, typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value]
            )
        )
    );
    
    Utils.debuggingLog(['getLogSectionsMap_long'], 'sectionsMap object:', 
        Object.fromEntries(
            Array.from(sectionsMap.entries()).map(([key, value]) => {
                return [key, {
                    ...value,
                    content: value.content && value.content.length > 50 ? value.content.substring(0, 50) + '...' : value.content
                }];
            })
        )
    );
    Utils.debuggingLog(['getLogSectionsMap_long'], '-', '-- ---------------- ---');
    Utils.debuggingLog(['getLogSectionsMap_long'], '-', '-- END LOG SECTIONS ---');
    Utils.debuggingLog(['getLogSectionsMap_long'], '-', '-- ---------------- ---');

    Utils.init();

    Utils.debuggingLog(['getLogSectionsMap'], 'firstLine length:', sections.firstLine.length);
    Utils.debuggingLog(['getLogSectionsMap'], 'relevantObjects length:', sections.relevantObjects ? sections.relevantObjects.length : 0);
    Utils.debuggingLog(['getLogSectionsMap'], 'probableCallstack length:', sections.probableCallstack ? sections.probableCallstack.length : 0);
    Utils.debuggingLog(['getLogSectionsMap'], 'registers length:', sections.registers ? sections.registers.length : 0);
    Utils.debuggingLog(['getLogSectionsMap'], 'stack length:', sections.stack ? sections.stack.length : 0);
    Utils.debuggingLog(['getLogSectionsMap'], 'topHalf length:', sections.topHalf.length);
    Utils.debuggingLog(['getLogSectionsMap'], 'logType added to sectionsMap:', sectionsMap.get('logType'));

    return { sections, sectionsMap };
};

document.addEventListener('DOMContentLoaded', function() {
    Utils.init();
    Utils.debuggingLog(['DOMContentLoaded', 'utils.js'], 'Utils is now ready');
});