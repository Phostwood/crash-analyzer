// Create a global Utils object
window.Utils = {};
Utils.logLines = [];
Utils.hasSkyrimAE = false;

// Constants
Utils.isDebugging = true; // Set this to false to disable debugging (non-error) output
// Set this to control which batches of logs to display
//Utils.debugBatch = ['ALL'];  // Can be ['ALL'] or any array of specific batchIds
//Utils.debugBatch = ['analyzeLog', 'logSummary.js'];
//Utils.debugBatch = ['generateLogSummary', 'processLines', 'splitIntoLines', 'getLogSectionsMap', 'getLogSectionsMap'];
Utils.debugBatch = ['getLogType', 'userInterface.js'];
//Utils.debugBatch = ['analyzeLog', 'getBadlyOrganizedNolvusPlugins' ];


Utils.isSkyrimPage = window.location.href.toLowerCase().includes('skyrim.html');

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

/*OLD VERSION: Utils.debuggingLog = function(batchIds, message, content) {
    if (Utils.isDebugging && 
        (Utils.debugBatch.includes('ALL') || 
         batchIds.some(id => Utils.debugBatch.includes(id)))) {
        if (content === undefined) content = ' ';
        console.log(`[${batchIds.join('|')}]`, message, content);
    }
}; */

Utils.debuggingLog = function(batchIds, message, content) {
    if (Utils.isDebugging && (Utils.debugBatch.includes('ALL') || batchIds.some(id => Utils.debugBatch.includes(id)))) {
      if (content === undefined) content = ' ';
      console.groupCollapsed(`[${batchIds.join('|')}]`, message, content);
      console.trace('Caller location');
      console.groupEnd();
    }
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


Utils.getLogType = function(lines) {
    Utils.debuggingLog(['getLogType'], 'Entering getLogType');
    Utils.debuggingLog(['getLogType'], 'Number of lines:', lines.length);
    
    if (lines.length > 2 && lines[2].includes('NetScriptFramework')) {
        Utils.debuggingLog(['getLogType'], 'Detected NetScriptFramework log');
        Utils.hasSkyrimAE = false; 
        return 'NetScriptFramework';
    } else if (lines.length > 1 && lines[1].includes('CrashLoggerSSE')) {
        Utils.debuggingLog(['getLogType'], 'Detected CrashLogger log');
        Utils.hasSkyrimAE = true;
        return 'CrashLogger';
    } else {
        console.error(['getLogType'], 'ERROR: Unknown log type detected');
        Utils.debuggingLog(['getLogType'], 'First 3 lines of log:', lines.slice(0, 3));
        Utils.hasSkyrimAE = false; 
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
        }
        // Trigger the change event to update the UI
        document.getElementById('logType').dispatchEvent(new Event('change'));
    }
};

//Split log files into sections 
Utils.getLogSectionsMap = function(logFile) {
    Utils.debuggingLog(['getLogSectionsMap'], 'Entering getLogSectionsMap');
    Utils.debuggingLog(['getLogSectionsMap'], 'logFile length:', logFile.length);
    
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
    Utils.debuggingLog(['getLogType'], 'hasSkyrimAE flag set to:', Utils.hasSkyrimAE);

    const sectionDefinitions = [
        {
            //LEGEND: "nsf" = .Net Script Framework, "cl" = Crash Logger
            name: 'firstLine',
            nsfLabel: 'First Line',
            clLabel: 'First Line',
            nsfRegex: /^.*$/m,
            clRegex: /^.*$/m,
            nsfPriority: 1,
            clPriority: 1,
            nsfColor: 'red',
            clColor: 'red',
            nolvusExpectedMin: 1,
            nolvusExpectedMax: 1
        },
        {
            name: 'relevantObjects',
            nsfLabel: 'Possible relevant objects',
            clLabel: null, // CrashLogger logs don't have this section
            nsfRegex: /Possible relevant objects \(\d+\)\s*\{([\s\S]*?)(?=\n*\})/,
            clRegex: null,
            nsfPriority: 2,
            clPriority: null,
            nsfColor: 'darkorange',
            clColor: null,
            nolvusExpectedMin: 0,
            nolvusExpectedMax: 50
        },
        {
            name: 'probableCallstack',
            nsfLabel: 'Probable callstack',
            clLabel: 'Probable call stack',
            nsfRegex: /Probable callstack(?:\s*\(.*?\))?\s*\{([\s\S]*?)(?=\n*\})/,
            clRegex: /PROBABLE CALL STACK:(?:\r?\n)([\s\S]*?)(?=\n\nREGISTERS:)/,
            nsfPriority: 3,
            clPriority: 2,
            nsfColor: 'gold',
            clColor: 'darkorange',
            nolvusExpectedMin: 0,
            nolvusExpectedMax: 500
        },
        {
            name: 'registers',
            nsfLabel: 'Registers',
            clLabel: 'Registers',
            nsfRegex: /Registers\s*\{([\s\S]*?)(?=\n*\})/,
            clRegex: /REGISTERS:(?:\r?\n)([\s\S]*?)(?=\n\nSTACK:)/,
            nsfPriority: 4,
            clPriority: 3,
            nsfColor: 'dodgerblue',
            clColor: 'gold',
            nolvusExpectedMin: 0,
            nolvusExpectedMax: 500
        },
        {
            name: 'stack',
            nsfLabel: 'Stack',
            clLabel: 'Stack',
            nsfRegex: /Stack\s*\{([\s\S]*?)(?=\n*\})/,
            clRegex: /^STACK:(?:\r?\n)([\s\S]*?)(?=\n\nMODULES:)/m,
            nsfPriority: 5,
            clPriority: 4,
            nsfColor: 'blueviolet',
            clColor: 'dodgerblue',
            nolvusExpectedMin: 20,
            nolvusExpectedMax: 600
        },
        {
            name: 'modules',
            nsfLabel: 'Modules',
            clLabel: 'Modules',
            nsfRegex: /Modules\s*\{([\s\S]*?)(?=\n*\})/,
            clRegex: /^MODULES:(?:\r?\n)([\s\S]*?)(?=\n\nSKSE PLUGINS:)/m,
            nsfPriority: 6,
            clPriority: 5,
            nsfColor: null,
            clColor: null,
            nolvusExpectedMin: 270,
            nolvusExpectedMax: 305
        },
        {
            name: 'sksePlugins',
            nsfLabel: null, // .NET Script Framework logs don't have this section
            clLabel: 'SKSE Plugins',
            nsfRegex: null,
            clRegex: /^SKSE PLUGINS:(?:\r?\n|\s)([\s\S]*?)(?=\r?\n\r?\nPLUGINS:)/m,
            nsfPriority: null,
            clPriority: 6,
            nsfColor: null,
            clColor: null,
            nolvusExpectedMin: null,
            nolvusExpectedMax: null
        },
        {
            name: 'plugins',
            nsfLabel: 'Plugins',
            clLabel: null, // CrashLogger logs don't have this section (at least not with the same purpose)
            nsfRegex: /Plugins\s*\((\d+)\)\s*\{/, //NOTE: this data is different than the rest, so just grabbing the #
            clRegex: null,
            nsfPriority: 7,
            clPriority: null,
            nsfColor: null,
            clColor: null,
            nolvusExpectedMin: 2,
            nolvusExpectedMax: 3
        },
        {
            name: 'gamePlugins',
            nsfLabel: 'Game plugins',
            clLabel: 'PLUGINS', //NOTE: for Crash Logger, this section is just caled PLUGINS (confusing, but seems unavoidabe)
            nsfRegex: /Game plugins \(\d+\)\s*\{(?:\r?\n)([\s\S]*?)(?=\r?\n\s*\})/,
            clRegex: /^PLUGINS:.*\r?\n.*\r?\n([\s\S]*)/m,
            nsfPriority: 8,
            clPriority: 7,
            nsfColor: null,
            clColor: null,
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
        const regex = logType === 'NetScriptFramework' ? def.nsfRegex : def.clRegex;
        const priority = logType === 'NetScriptFramework' ? def.nsfPriority : def.clPriority;
        const label = logType === 'NetScriptFramework' ? def.nsfLabel : def.clLabel;
        const color = logType === 'NetScriptFramework' ? def.nsfColor : def.clColor;
        const sectionContent = getSection(regex, '', def.name);
        Utils.debuggingLog(['getLogSectionsMap'], `Section ${def.name} content length:`, sectionContent ? sectionContent.length : 0);
        sections[def.name] = sectionContent;
        if (priority !== null) {
            sectionsMap.set(sectionContent, {
                name: def.name,
                label: label,
                priority,
                color: color,
                nolvusExpectedMin: def.nolvusExpectedMin,
                nolvusExpectedMax: def.nolvusExpectedMax
            });
        }
    });

    // Create composite sections
    sections.topQuarter = [sections.firstLine, sections.relevantObjects, sections.probableCallstack].filter(Boolean).join('\n\n');
    sections.topThird = [sections.firstLine, sections.relevantObjects, sections.probableCallstack, sections.registers].filter(Boolean).join('\n\n');
    sections.topHalf = [sections.firstLine, sections.relevantObjects, sections.probableCallstack, sections.registers, sections.stack].filter(Boolean).join('\n\n');
    sections.topThirdNoHeading = [sections.relevantObjects, sections.probableCallstack, sections.registers].filter(Boolean).join('\n\n');

    sections.logType = logType;
    if(logType === 'CrashLogger') {
        sections.firstLine = this.logLines[3]; // NOTE: for Crash Logger logs, what I called the "firstLine" for NSF logs is moved to the 4th line (desinated as the 3rd in the array).
    }
    sections.secondLine = this.logLines[1];
    sections.thirdLine = this.logLines[2];

    // Add debugging output for the entire sections object
    Utils.debuggingLog(['getLogSectionsMap_long'], '-', '-- ------------------ ---');
    Utils.debuggingLog(['getLogSectionsMap_long'], '-', '-- BEGIN LOG SECTIONS ---');
    Utils.debuggingLog(['getLogSectionsMap_long'], '-', '-- ------------------ ---');
    Utils.debuggingLog(['getLogSectionsMap_long'], 'Sections object:', sections); //I think I prefer it without stringify?
    //Utils.debuggingLog(['getLogSectionsMap'], 'Sections object:', JSON.stringify(sections, null, 2));
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