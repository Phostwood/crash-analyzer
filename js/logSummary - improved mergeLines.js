// logSummary.js  (old version!)

// ISSUE 1: for logs like  Crash_2025_1_16_0-54-34.txt, it grabs wrong FormID for Thistlefoot in this example line:
    //Character(FormId: FF00287F, BaseForm: TESNPC(Name: `Thistlefoot`, FormId: 590D1701, File: `018Auri.esp`))
// ISSUE 2: currently only works for NSF logs (not Trainwreck or Crash Logger SSE )


// First, let's create a helper function to strip FormIDs for comparison
function stripFormIds(text) {
    // Remove any [XXXXXXXX] or [0xXXXXXXXX] patterns
    return text.replace(/\s*\[[0-9A-Fa-f]{8}\]/g, '')
               .replace(/\s*\[0x[0-9A-Fa-f]{8}\]/g, '')
               .trim();
}

window.LogSummary = {

    // Constants
    fileExtensions: ['.bat', '.bik', '.bmp', '.bsa', '.bsl', '.bto', '.btr', '.cpp', '.dds', '.dll', '.esl', '.esm',
        '.esp', '.exe', '.fuz', '.hkb', '.hkx', '.ini', '.json', '.lip', '.nif', '.pex', '.psc',
        '.seq', '.skse', '.skse64', '.swf', '.tga', '.tri', '.txt', '.wav', '.xml', '.xwm'],
    
    fileStartCharacters: ['`', '"', ':', '(', '['],
    nameStartCharacters: ['`', '"'],
    unlikelyCulprits: ['clr.dll', 'd3d12core.dll', 'd3dcompiler_47.dll', 'kernel32.dll', 'kernelbase.dll', 
        'ntdll.dll', 'runtime.dll', 'steamclient64.dll', 'system.ni.dll', 
        'ucrtbase.dll', 'uiautomationcore.dll', 'win32u.dll', 'xinput1_3.dll'], //REMOVED: 'vcruntime140.dll',
    removeList: ['Dawnguard.esm', 'Dragonborn.esm', 'null', 'null)', 'NetScriptFramework', 'SkyrimSE.exe', 'skyrim.esm', 'SkyrimVR.exe', 'Skyrim', 'Tamriel `Skyrim'].map(item => item.toLowerCase()),



    generateLogSummary: function (logFile, sections, sectionsMap, isVanillaNolvus) {
        Utils.debuggingLog(['generateLogSummary', 'logSummary.js'], 'generateLogSummary started, sections:', Object.keys(sections));
        Utils.debuggingLog(['generateLogSummary', 'logSummary.js'], 'sections.topHalf length:', sections.topHalf.length);
        let insights = '<h5>Log Summary:</h5><ul>';
        let insightsCount = 0;

        if (Utils.countPlugins(logFile) > 2000) {
            insights += this.generateLogInsights(logFile, sections, isVanillaNolvus);
            insightsCount++;
        }

        const lineCounts = this.generateLineCounts(sections, sectionsMap);
        if (Object.keys(lineCounts).length > 0) {
            insights += this.generateLineCountInsights(sections, sectionsMap, lineCounts);
            insightsCount++;
        }

        Utils.debuggingLog(['generateLogSummary_long', 'logSummary.js'], 'sectionsMap:', sectionsMap);
        Utils.debuggingLog(['generateLogSummary', 'logSummary.js'], 'Before processLines');
        const { namedElementMatches, missedMatches } = this.processLines(sectionsMap);
        Utils.debuggingLog(['generateLogSummary', 'logSummary.js'], 'After processLines');
        Utils.debuggingLog(['generateLogSummary', 'logSummary.js'], 'namedElementMatches length:', namedElementMatches.length);
        Utils.debuggingLog(['generateLogSummary', 'logSummary.js'], 'missedMatches length:', missedMatches.length);
        Utils.debuggingLog(['generateLogSummary', 'logSummary.js'], ' ');
        Utils.debuggingLog(['generateLogSummary_long', 'logSummary.js'], 'missedMatches:', missedMatches);
        Utils.debuggingLog(['generateLogSummary_long', 'logSummary.js'], 'namedElementMatches:', namedElementMatches);

        if (namedElementMatches.length > 0) {
            insights += this.generateSectionDescriptions(sectionsMap);
            const processedList = this.processColoredListItems(namedElementMatches);
            Utils.debuggingLog(['generateLogSummary', 'logSummary.js'], 'After processColoredListItems:', processedList);
            insights += '<ul>' + this.highlightFilenames(processedList) + '</ul>';
            insights += '</li>';
            insightsCount++;
        }

        Utils.debuggingLog(['generateLogSummary', 'logSummary.js'], 'generateLogSummary completed');
        return { insights, insightsCount, namedElementMatches, missedMatches };
    },

    generateLogInsights: function (logFile, sections, isVanillaNolvus) {
        const nolvusVersion = Utils.getNolvusVersion(sections);
        // Only show these for v5
        let insights = '';
        if (nolvusVersion == 5) {
            insights += '<li>🔎 <b>Log Insights:</b> (not 100% accurate)<ul>' +
                '<li>Nolvus version: <code><b>' + nolvusVersion + '</b></code></li>' +
                '<li>Vanilla or Customized: <code><b>' + (isVanillaNolvus ? 'vanilla' : 'customized') + '</b></code></li>' +
                '<li>Nolvus Variant: <code><b>' + Utils.reduxOrUltraVariant(logFile) + '</b></code></li>' +
                '<li>Advanced Physics: <code>' + Utils.hasPhysics(logFile) + '</code></li>' +
                '<li>Hardcore Mode: <code>' + Utils.hasHardcoreMode(logFile) + '</code></li>' +
                '<li>Fantasy Mode: <code>' + Utils.hasFantasyMode(logFile) + '</code></li>' +
                '<li>Alternate Leveling: <code>' + Utils.hasAlternateLeveling(logFile) + '</code></li>' +
                '<li>SSE FPS Stabilizer: <code>' + Utils.hasSseFpsStabilizer(logFile) + '</code></li>' +
                '<li>Paid Upscaler: <code>' + Utils.hasPaidUpscaler(logFile) + '</code></li>' +
                '<li>FSR3: <code>' + Utils.hasFSR3(logFile) + '</code></li>' +
                '<li>Occurrences of NULL and void: <code>' + Utils.countNullVoid(sections.topHalf) + ' (probably meaningless?)</code></li>' +
                '</ul></li>';
        } else if (nolvusVersion == 6) {
            insights += '<li>🔎 <b>Log Insights:</b> (check <b>PDF Report</b> from Nolvus Dashboard for more information and better accuracy!)<ul>' +
                '<li>Nolvus version: <code><b>' + nolvusVersion + '</b></code></li>' +
                '<li>SSE FPS Stabilizer: <code>' + Utils.hasSseFpsStabilizer(logFile) + '</code></li>' +
                '<li>Paid Upscaler: <code>' + Utils.hasPaidUpscaler(logFile) + '</code></li>' +
                '<li>FSR3: <code>' + Utils.hasFSR3(logFile) + '</code></li>' +
                '<li>Occurrences of NULL and void: <code>' + Utils.countNullVoid(sections.topHalf) + ' (probably meaningless?)</code></li>' +
                '</ul></li>';
        }
        return insights;
    },

    generateLineCounts: function (sections, sectionsMap) {
        let lineCounts = {};
        for (const [sectionName, sectionInfo] of sectionsMap) {
            if (sectionInfo.content) {
                let lines = sectionInfo.content.split('\n').filter(line => line.trim() !== '');
                lineCounts[sectionName] = lines.length;
            } else {
                // If there's no content (shouldn't happen), set count to 0
                lineCounts[sectionName] = 0;
            }
        }
        // Adding the new section "nonEslPlugins"
        const gamePluginsSection = sectionsMap.get('gamePlugins');
        if (gamePluginsSection && gamePluginsSection.content) {
            // ^Check if 'gamePlugins' exists and has content before adding 'nonEslPlugins'
            const allPluginsInLogSection = gamePluginsSection.content;
            const nonEslPluginInfo = Utils.countNonEslPlugins(allPluginsInLogSection);
            lineCounts['nonEslPlugins'] = nonEslPluginInfo.nonEslPluginsCount;

            // DEBUGGING: lineCounts["test"] = "this is just a test";
            Utils.debuggingLog(['logLineCounts', 'logSummary.js'], 'allPluginsInLogSection:', allPluginsInLogSection);
            Utils.debuggingLog(['logLineCounts', 'logSummary.js'], 'nonEslPluginInfo:', nonEslPluginInfo);
            Utils.debuggingLog(['logLineCounts', 'logSummary.js'], 'lineCounts:', lineCounts);
        }

        return lineCounts;
    },

    generateLineCountInsights: function (sections, sectionsMap, lineCounts) {
        let insights = '<li>🔎 <b>Line Counts</b> for each section in the log file: <ul>';
        const nolvusVersion = Utils.getNolvusVersion(sections);
        //DEBUGGING: alert(`Utils.getNolvusVersion = ${nolvusVersion}`);
        for (const [sectionName, sectionInfo] of sectionsMap) {
            if (sectionName === 'logType' || sectionName === 'firstLine' || sectionInfo.label === undefined) continue;
            let count = lineCounts[sectionName] || 0;
            let min = sectionInfo.nolvusExpectedMin;
            let max = sectionInfo.nolvusExpectedMax;
            if ((!Utils.isSkyrimPage)
                && (nolvusVersion != 6)
                && (min !== null && max !== null)
                && (count < min || count > max)
            ) {
                insights += `<li>${sectionInfo.label}:&nbsp; <code>${count.toLocaleString()} ⚠️<b>expected between ${min.toLocaleString()} and ${max.toLocaleString()}</b></code></li>`;
            } else {
                insights += `<li>${sectionInfo.label}:&nbsp; <code>${count.toLocaleString()}</code></li>`;
            }
        }
        // Adding the new section "Non-ESL-ed plugins"
        const nonEslPluginsCount = lineCounts["nonEslPlugins"] || 'error';
        if (nonEslPluginsCount >254) {
            insights += `<li>Non-ESL-ed plugins:&nbsp; <code>${nonEslPluginsCount.toLocaleString()} ⚠️<b>maximum 254!</b>⚠️</code></li>`;
        } else {
            insights += `<li>Non-ESL-ed plugins:&nbsp; <code>${nonEslPluginsCount.toLocaleString()}</code></li>`;
        }
        insights += '</ul></li>';
        return insights;
    },


    processLines: function (sectionsMap) {
        const logType = sectionsMap.get('logType');
        Utils.debuggingLog(['processLines', 'logSummary.js'], 'processLines started');
    
        let namedElementMatches = [];
        let missedMatches = [];
    
        // Filter sections with assigned colors and sort by priority
        const relevantSections = Array.from(sectionsMap.entries())
            .filter(([_, info]) => info.color !== null && info.color !== undefined)
            .sort((a, b) => a[1].priority - b[1].priority);
    
        relevantSections.forEach(([sectionName, sectionInfo]) => {
            let processedContent = sectionInfo.content;
    
            // Merge indented lines for Crash Logger and Trainwreck
            if (logType === 'CrashLogger' || logType === 'Trainwreck') {
                processedContent = this.mergeIndentedLines(processedContent);
            }
    
            const lines = this.splitIntoLines(processedContent);
            Utils.debuggingLog(['processLines', 'logSummary.js'], 
                `Processing section: ${sectionName}, Number of lines: ${lines.length}`);
    
            // Track which lines we've already processed to avoid duplicates
            const processedLines = new Set();
    
            lines.forEach(line => {
                if (line === '' || processedLines.has(line)) return;
    
                // Add to processed set to avoid duplicates
                processedLines.add(line);
    
                if (line.toLowerCase().includes('kernel32.dll')) {
                    Utils.debuggingLog(['processLines', 'logSummary.js'], 'Found in line:', line);
                }
    
                let foundMatchCount = 0;
    
                // Process both the merged line and its components
                foundMatchCount += this.processFileExtensions(line, sectionInfo.priority, 
                    sectionInfo.color, namedElementMatches, line);  // Add line parameter
                foundMatchCount += this.processNameAndFile(line, sectionInfo.priority, 
                    sectionInfo.color, namedElementMatches, line);  // Add line parameter
    
                if (foundMatchCount < this.containsKeyword(line)) {
                    missedMatches.push(line);
                }
            });
        });
    
        Utils.debuggingLog(['processLines', 'logSummary.js'], 
            'Before sorting namedElementMatches:', namedElementMatches.length);
        
        // Deduplicate matches while preserving priority
        namedElementMatches = Array.from(
            namedElementMatches.reduce((map, item) => {
                // Get first file/mod name from the path for comparison
                let key = item.match;
                if (key.includes('->') || key.includes('<-')) {
                    // Extract first part of the path (before first arrow)
                    key = key.split(/->|<-/)[0].trim();
                }
                
                if (!map.has(key) || item.priority < map.get(key).priority) {
                    map.set(key, item);
                }
                return map;
            }, new Map()).values()
        ).sort((a, b) => a.priority - b.priority);
        
        namedElementMatches = this.processNamedElementMatches(namedElementMatches);
        Utils.debuggingLog(['processLines', 'logSummary.js'], 
            'After processing namedElementMatches:', namedElementMatches.length);

        // Process and group matches
        namedElementMatches = this.processAndGroupMatches(namedElementMatches);
    
        return { namedElementMatches, missedMatches };
    },

    processAndGroupMatches: function(matches) {
        const lineGroups = matches.reduce((groups, item) => {
            if (!item.sourceLine) return groups;
            
            Utils.debuggingLog(['processGroups', 'logSummary.js'], 
                `Source line group for "${item.match}":`, {
                    hasFile: item.match.toLowerCase().includes('file:'),
                    hasName: item.match.toLowerCase().includes('name:'),
                    hasFormType: item.match.toLowerCase().includes('formtype:') || /\(\d+\)/.test(item.match),
                    sourceLine: item.sourceLine
                }
            );
    
            if (!groups.has(item.sourceLine)) {
                groups.set(item.sourceLine, []);
            }
            
            const isModifiedBy = item.match.includes('->') && !item.match.toLowerCase().includes('formid:');
            if (!isModifiedBy) {
                const getName = str => str.includes('\tName:');
                const getFile = str => str.includes('\tFile:') || /\.(esp|esm|esl)$/i.test(str);
                const getFormType = str => str.includes('\tFormType:') || /\(\d+\)/.test(str);

                groups.get(item.sourceLine).push({
                    ...item,
                    hasName: item.sourceLine.includes('Name:') || item.match.includes('Name:'),
                    hasFile: item.sourceLine.includes('File:') || item.match.includes('File:') || 
                             /\.(esp|esm|esl)$/i.test(item.match),
                    hasFormType: item.sourceLine.includes('FormType:') || item.match.includes('FormType:') || 
                                 /\(\d+\)/.test(item.match),
                    formIds: this.extractFormIds(item.match),
                    _sourceLine: item.sourceLine.replace(/\t/g, '[TAB]')  // Debug view
                });
            }
            return groups;
        }, new Map());
    
        const processedMatches = [];
        lineGroups.forEach((group, sourceLine) => {
            Utils.debuggingLog(['processGroups', 'logSummary.js'], 
                `Processing group for line ${sourceLine}:`, 
                group.map(item => ({
                    match: item.match,
                    hasFile: item.hasFile,
                    hasName: item.hasName,
                    hasFormType: item.hasFormType
                }))
            );
    
            const primary = group.find(item => {
                const result = item.hasFile;
                Utils.debuggingLog(['primary', 'logSummary.js'], 
                    `Testing "${item.match}" for primary:`, {
                        hasFile: item.hasFile,
                        wasChosen: result
                    }
                );
                return result;
            }) || group.find(item => {
                const result = item.hasName && !item.hasFormType;
                Utils.debuggingLog(['primary', 'logSummary.js'], 
                    `Testing "${item.match}" for secondary:`, {
                        hasName: item.hasName,
                        hasFormType: item.hasFormType,
                        wasChosen: result
                    }
                );
                return result;
            }) || group[0];
    
            const subItems = group
                .filter(item => item !== primary)
                .map(item => this.createSubItem(item))
                .sort((a, b) => {
                    const aIsFormType = /^[A-Za-z]+$/.test(a.match);
                    const bIsFormType = /^[A-Za-z]+$/.test(b.match);
                    return aIsFormType - bIsFormType;
                });
    
            processedMatches.push(subItems.length > 0 ? {...primary, subItems} : primary);
        });
    
        return processedMatches;
    },

    getGroupKey: function(item) {
        // Try to group by FormIDs first
        const formIds = this.extractFormIds(item.match);
        if (formIds.length > 0) {
            return formIds.sort().join('_');
        }
        return item.sourceLine;
    },


    // In createSubItem
    createSubItem: function(item) {
        let match = item.match;
        
        // Remove FormIDs and brackets
        match = match.replace(/\s*\[[^\]]*\]/g, '');
        
        // Remove form type numbers
        if (this.isFormType(match)) {
            match = match.replace(/\s*\([0-9]+\)(?=\s*(?:\[|$))/, '');
            match = match.replace(/FormType:\s*/, '');
        }
        
        // Clean prefixes and quotes
        match = match.replace(/^(?:Name|File|EditorID):\s*["']?/, '');
        match = match.replace(/["']/g, '');
        
        return {
            ...item,
            match: match.trim()
        };
    },

    mergeIndentedLines: function(logSection) {
        const lines = logSection.split('\n');
        let processedLines = [];
        let currentBaseLine = null;
        let subordinateGroup = [];
        
        const debugInfo = (stage, data) => {
            Utils.debuggingLog(['mergeIndentedLines', 'logSummary.js'], 
                `${stage}: ${JSON.stringify(data)}`);
        };
    
        const outputGroup = () => {
            if (currentBaseLine) {
                if (subordinateGroup.length > 0) {
                    processedLines.push(currentBaseLine + ' \t' + subordinateGroup.join(' \t'));
                } else {
                    processedLines.push(currentBaseLine);
                }
                debugInfo('Processing group', {
                    base: currentBaseLine,
                    subordinates: subordinateGroup,
                    output: processedLines[processedLines.length - 1]
                });
            }
        };
    
        for (let i = 0; i < lines.length; i++) {
            const currentLine = lines[i].replace(/\r$/, '').replace(/\s+$/, '');
            if (currentLine.trim() === '') continue;
            
            const leadingTabs = currentLine.match(/^\t*/)[0].length;
            
            debugInfo('Processing line', {
                lineNumber: i,
                tabs: leadingTabs,
                line: currentLine
            });
    
            // Header (no tabs)
            if (leadingTabs === 0) {
                outputGroup();
                currentBaseLine = null;
                subordinateGroup = [];
                processedLines.push(currentLine);
                continue;
            }
    
            // Base line (one tab)
            if (leadingTabs === 1) {
                outputGroup();
                currentBaseLine = currentLine;
                subordinateGroup = [];
                continue;
            }
    
            // Subordinate line (two or more tabs)
            if (leadingTabs > 1 && currentBaseLine) {
                subordinateGroup.push(currentLine.trim());
            }
        }
    
        // Handle final group
        outputGroup();
    
        return processedLines.join('\n');
    },
    
    mergeGroupWithSubordinates: function(baseLine, subordinateLines) {
        if (subordinateLines.length === 0) {
            return baseLine;
        }
        return baseLine + ' \t' + subordinateLines.join(' \t');
    },


    splitIntoLines: function (text) {
        Utils.debuggingLog(['splitIntoLines', 'logSummary.js'], 'Input text length:', text.length);
        const maxLineLength = 5000; //What would a good max safe length be? Increased from 1000. Claude AI thinks 16k would be safe, but there are extreme circumstances where this causes issues...
        let lines = [];
        let start = 0;
        while (start < text.length) {
            let lineEnd = text.indexOf('\n', start);
            if (lineEnd === -1) lineEnd = text.length;
            let stringEnd = Math.min(start + maxLineLength, lineEnd);
            lines.push(text.substring(start, stringEnd));
            start = lineEnd + 1;
        }
        Utils.debuggingLog(['splitIntoLines', 'logSummary.js'], 'Number of lines split:', lines.length);
        Utils.debuggingLog(['splitIntoLines', 'logSummary.js'], 'First line:', lines[0]);
        Utils.debuggingLog(['splitIntoLines', 'logSummary.js'], 'Last line:', lines[lines.length - 1]);
        return lines;
    },

    /*UNUSED?     getLogSection: function(line, sectionsMap) {
            for (const [sectionName, sectionInfo] of sectionsMap) {
                // Skip the 'logType' entry
                if (sectionName === 'logType') continue;
        
                // Check if the line is in the section's content
                if (sectionInfo.content && sectionInfo.content.includes(line)) {
                    return {
                        name: sectionName,
                        ...sectionInfo
                    };
                }
            }
            return {
                name: 'unknown',
                label: 'Unknown',
                priority: null,
                color: null,
                nolvusExpectedMin: null,
                nolvusExpectedMax: null
            };
        }, */

    processFileExtensions: function (line, priority, color, namedElementMatches) {
        let foundMatchCount = 0;

        this.fileExtensions.forEach(extension => {
            if (line.toLowerCase().includes(extension)) {
                let index = line.toLowerCase().lastIndexOf(extension);
                let end = index + extension.length;
                let start = index;
                let tempFileStartCharacter = [...this.fileStartCharacters];

                while (start > 0) {
                    let char = line.charAt(start - 1);
                    if (char === ')') {
                        tempFileStartCharacter = tempFileStartCharacter.filter(item => item !== '(');
                    }
                    if (tempFileStartCharacter.includes(char)) {
                        break;
                    }
                    start--;
                }

                let potentialMatch = line.slice(start, end).trim();
                foundMatchCount += this.addMatch(potentialMatch, priority, color, namedElementMatches, line); // Pass line
            }
        });

        return foundMatchCount;
    },

    // Add new helper method
    processModifiedByChain: function(line) {
        const modifiedByIndex = line.indexOf('ModifiedBy:');
        if (modifiedByIndex === -1) return null;
        
        const chainStart = modifiedByIndex + 'ModifiedBy:'.length;
        const chainEnd = line.indexOf('\n', chainStart);
        const chain = line.substring(chainStart, chainEnd === -1 ? line.length : chainEnd).trim();
        
        return chain.split('->').map(mod => mod.trim());
    },


    processNameAndFile: function (line, priority, color, namedElementMatches) {
        let foundMatchCount = 0;
        
        // Track the current name/file and its associated FormID
        let currentMatch = null;
        let associatedFormId = null;
    
        Utils.debuggingLog(['processNameAndFile', 'logSummary.js'], 'Processing line:', line);
    
        ["Name:", "File:", "FormType:", "EditorID:"].forEach(keyword => {
            Utils.debuggingLog(['processNameAndFile', 'logSummary.js'], 'Checking for keyword:', keyword);
            
            if (line.match(new RegExp(`${keyword}`))) {
                Utils.debuggingLog(['processNameAndFile', 'logSummary.js'], 'Found keyword:', keyword);
                
                let index = line.indexOf(keyword) + keyword.length;
                let start = index;
                let delimiter = '';
    
                while (start < line.length) {
                    let char = line.charAt(start);
                    if (this.nameStartCharacters.includes(char) || (char >= 'a' && char <= 'z') || 
                        (char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9')) {
                        if (this.nameStartCharacters.includes(char)) {
                            delimiter = char;
                        }
                        break;
                    }
                    start++;
                }
    
                if (!/[a-zA-Z0-9]/.test(line.charAt(start))) {
                    start++;
                }
    
                let end = start;
                while (end < line.length) {
                    let char = line.charAt(end);
                    if (char === delimiter || char === ',' || char === '\t' || char === '\n' || char === '\r') {
                        break;
                    }
                    end++;
                }
    
                currentMatch = line.slice(start, end);
                currentMatch = this.cleanString(currentMatch);
                Utils.debuggingLog(['processNameAndFile', 'logSummary.js'], 'Found currentMatch:', currentMatch);

                // Check if this is a FormType or EditorID
/* BROKEN MAYBE? and weird code...                if (keyword === "FormType:" || keyword === "EditorID:") {
                    if (keyword === "FormType:") {
                        currentMatch = `${currentMatch} (${currentMatch})`;
                    } else {
                        currentMatch = `${currentMatch} <${currentMatch}>`;
                    }
                } */
    
                // Look for FormID after finding a name/file
                let formIdIndex = line.indexOf('FormID:', end);
                if (formIdIndex === -1) {
                    formIdIndex = line.indexOf('FormId:', end);
                }
                
                if (formIdIndex !== -1) {
                    Utils.debuggingLog(['processNameAndFile', 'logSummary.js'], 'Found FormID at index:', formIdIndex);
                    
                    let formIdStart = formIdIndex + (line.indexOf('FormID:') !== -1 ? 'FormID:' : 'FormId:').length;
                    Utils.debuggingLog(['processNameAndFile', 'logSummary.js'], 'FormID start position:', formIdStart);
                    Utils.debuggingLog(['processNameAndFile', 'logSummary.js'], 'Characters at start:', line.substr(formIdStart, 20));

                    // Skip whitespace and optional '0x' prefix, preserving any 0s that are part of the actual hex number
                    while (formIdStart < line.length && line[formIdStart] === ' ') {
                        formIdStart++;
                    }
                    if (line.substr(formIdStart, 2) === '0x') {
                        formIdStart += 2;
                    }

                    Utils.debuggingLog(['processNameAndFile', 'logSummary.js'], 'After skipping prefix, start position:', formIdStart);
                    Utils.debuggingLog(['processNameAndFile', 'logSummary.js'], 'Characters at adjusted start:', line.substr(formIdStart, 20));                
                    
                    let formIdEnd = formIdStart;
                    let hexCount = 0;
                    while (hexCount < 8 && formIdEnd < line.length && 
                        ((line[formIdEnd] >= '0' && line[formIdEnd] <= '9') ||
                         (line[formIdEnd].toUpperCase() >= 'A' && line[formIdEnd].toUpperCase() <= 'F'))) {
                        hexCount++;
                        formIdEnd++;
                    }
                    
                    Utils.debuggingLog(['processNameAndFile', 'logSummary.js'], 'Hex digits found:', hexCount);
    
                    if (hexCount === 8) {
                        associatedFormId = line.slice(formIdStart, formIdEnd);
                        Utils.debuggingLog(['processNameAndFile', 'logSummary.js'], 'Extracted FormID:', associatedFormId);
                    } else {
                        Utils.debuggingLog(['processNameAndFile', 'logSummary.js'], 'Failed to find 8 hex digits');
                    }
                }
    
                // Add the match with its FormID if found
                if (currentMatch) {
                    if (associatedFormId) {
                        currentMatch = `${currentMatch} [${associatedFormId}]`;
                        Utils.debuggingLog(['processNameAndFile', 'logSummary.js'], 'Final match with FormID:', currentMatch);
                    }
                    foundMatchCount += this.addMatch(currentMatch, priority, color, namedElementMatches, line); // Pass line
                }

                if (line.includes('ModifiedBy:')) {
                    const modChain = this.processModifiedByChain(line);
                    if (modChain) {
                        currentMatch = `${currentMatch} (${modChain.join(' -> ')})`;
                    }
                }
            }
        });
    
        return foundMatchCount;
    },

    addMatch: function (potentialMatch, priority, color, namedElementMatches, line) {
        potentialMatch = String(potentialMatch).replace(/\s*at\s+0x[0-9A-Fa-f]+\s*/, '');
        potentialMatch = String(potentialMatch).replace('Unhandled exception', '');
    
        if (Utils.logType === 'CrashLogger' || Utils.logType === 'Trainwreck') {
            potentialMatch = potentialMatch.replace(/^\d+\s*\]\s+0x[0-9A-Fa-f]+\s+/, '');
            potentialMatch = potentialMatch.replace(/^void\*\s+->\s+/, '');
            potentialMatch = potentialMatch.trim();
        }
    
        if (potentialMatch && !this.removeList.includes(potentialMatch.split('[')[0].trim().toLowerCase())) {
            const lowerMatch = potentialMatch.toLowerCase();
            const hasFile = this.fileExtensions.some(ext => lowerMatch.endsWith(ext));
            const hasName = lowerMatch.includes('name:') || (!hasFile && !lowerMatch.includes('formtype:') && !lowerMatch.includes('editorid:'));
            const hasEditorId = lowerMatch.includes('editorid:');
            const hasFormType = lowerMatch.includes('formtype:') || 
                              /\([0-9]+\)(?:\s*\[|$)/.test(potentialMatch);
    
            namedElementMatches.push({ 
                match: potentialMatch, 
                priority, 
                color, 
                sourceLine: line,
                hasFile,
                hasName,
                hasEditorId,
                hasFormType
            });
            return 1;
        }
        return 0;
    },

    containsKeyword: function (line) {
        const keywords = [...window.LogSummary.fileExtensions, 'name:', 'file:', 'formtype:'];
        //NOTE on OLD (below): why doesn't this use the "fileExtensions" const from the top of this .js file?
        //OLD: const keywords = ['.dds', '.tga', '.bmp', '.nif', '.esl', '.esp', '.esm', '.pex', '.dll', '.exe', '.ini', '.bsa', '.fuz', '.hkx', '.seq', '.swf', 'name:', 'file:'];
        const lowerCaseLine = line.toLowerCase();
        return keywords.filter(keyword => lowerCaseLine.includes(keyword)).length;
    },

    cleanString: function (input) {
        let str = String(input);

        // First remove any trailing backticks
        if (str.endsWith('`')) {
            str = str.slice(0, -1);
        }

        // Then continue with existing bracket matching logic
        const pairs = [['(', ')'], ['[', ']'], ['{', '}'], ['<', '>']];
        pairs.forEach(([open, close]) => {
            const stack = [];
            str = str.split('').filter((char, i) => {
                if (char === open) {
                    stack.push(i);
                    return true;
                } else if (char === close) {
                    if (stack.length > 0) {
                        stack.pop();
                        return true;
                    }
                    return false;
                }
                return true;
            }).join('');
        });
        return str;
    },

    processNamedElementMatches: function (namedElementMatches) {
        return Array.from(
            namedElementMatches.reduce((map, item) => {
                const baseKey = stripFormIds(item.match);
                if (!map.has(baseKey)) {
                    map.set(baseKey, {
                        ...item,
                        formIds: new Set([...this.extractFormIds(item.match)])
                    });
                } else {
                    const existing = map.get(baseKey);
                    this.extractFormIds(item.match).forEach(id => 
                        existing.formIds.add(id)
                    );
                    if (item.priority < existing.priority) {
                        map.set(baseKey, {...item, formIds: existing.formIds});
                    }
                }
                return map;
            }, new Map()).values()
        ).map(item => {
            let processedItem = item.match.split(' [')[0];
            
            // Sort FormIDs numerically
            const sortedFormIds = Array.from(item.formIds)
                .sort((a, b) => parseInt(a, 16) - parseInt(b, 16))
                .map(id => {
                    const color = id.startsWith('FF') ? 'seagreen' : '#2F4F2F';
                    return `[<span style="color: ${color}">${id}</span>]`;
                })
                .join(' ');
            
            if (sortedFormIds) {
                processedItem = `${processedItem} ${sortedFormIds}`;
            }
            
            const lowercaseMatch = processedItem.toLowerCase();
            if (this.unlikelyCulprits.includes(lowercaseMatch)) {
                processedItem = `(${processedItem} ... unlikely culprit)`;
            }
            else if (Utils.explainersMap && Utils.explainersMap.has(lowercaseMatch)) {
                processedItem = `${processedItem} ${Utils.explainersMap.get(lowercaseMatch)}`;
            }
            
            Utils.debuggingLog(['processNamedElementMatches', 'logSummary.js'], 'Processing item:', {
                match: item.match,
                formIds: item.formIds,
                result: processedItem
            });
            return { ...item, match: processedItem };
        });
    },

    processColoredListItems: function(listItems) {
        return listItems.map(item => {
            const truncatedMatch = item.match.length > 300 ? 
                item.match.substring(0, 300) + '...' : item.match;
            
            let html = `<li><code><span style="color:${item.color}">[${item.priority}]</span> ${truncatedMatch}</code>`;
            
            if (item.subItems && item.subItems.length > 0) {
                html += '<ul>' + item.subItems.map(subItem => 
                    `<li><code>${subItem.match}</code></li>`
                ).join('') + '</ul>';
            }
            
            html += '</li>';
            return html;
        }).join('');
    },

    generateSectionDescriptions: function (sectionsMap) {
        const relevantSections = Array.from(sectionsMap.entries())
            .filter(([sectionName, info]) =>
                info.color !== null && info.color !== undefined
            )
            .sort((a, b) => a[1].priority - b[1].priority);

        const sectionDescriptions = relevantSections.map(([sectionName, info], index, array) => {
            const description = `<code><span style="color:${info.color}">[${info.priority}]</span> ${info.label}</code>`;
            if (index === array.length - 2) {
                return description + ', and/or';
            } else if (index === array.length - 1) {
                return description;
            } else {
                return description + ',';
            }
        }).join(' ');

        return `<li>🔎 <b>Files/Elements</b> listed within ${sectionDescriptions} sections of the crash log. Items are sorted by priority, with lower numbers (and higher positions in the list) indicating a higher likelihood of contributing to the crash. <code><span style="color:#FF0000">[1]</span> First Line</code> files are nearly always involved in (and frequently the cause of) the crash. FormIDs are shown in brackets with different colors: <span style="color:seagreen">lighter green (0xFF...)</span> indicates dynamically generated/save-specific IDs that are usually safer to delete, while <span style="color:#2F4F2F">darker green</span> IDs may be riskier to modify. Pay extra attention to anything related to <b>mods you have recently added</b> to ${Utils.NolvusOrSkyrimText}:`;
    },

    highlightFilenames: function(html) {
        // If no html content, return as is
        if (!html) return html;
        
        // Create a regex-safe pattern from the extensions array
        const extensionPattern = this.fileExtensions
            .map(ext => ext.replace('.', '\\.'))  // Escape dots for regex
            .join('|');  // Join with OR operator
        
        // Create regex that matches word characters followed by the extension
        // Using positive lookbehind to ensure we match extensions at the end of filenames
        const regex = new RegExp(`(\\w+)(${extensionPattern})(?![\\w])`, 'gi');
        
        // Replace matches with highlighted version
        // Using deeppink which complements the existing colors while being distinct
        return html.replace(regex, (match, filename, extension) => 
            `${filename}<span style="color: hotpink">${extension}</span>`
        );
    },

    // Move stripFormIds inside the object
    stripFormIds: function(text) {
        return text.replace(/\s*\[[0-9A-Fa-f]{8}\]/g, '')
                .replace(/\s*\[0x[0-9A-Fa-f]{8}\]/g, '')
                .trim();
    },

    // Helper functions
    extractFormIds: function(text) {
        const pattern = /\[(?:<span[^>]*>)?([0-9A-Fa-f]{8})(?:<\/span>)?\]/g;
        const matches = [];
        let match;
        while ((match = pattern.exec(text)) !== null) {
            matches.push(match[1].toUpperCase());
        }
        return matches;
    },

    hasFileExtension: function(text) {
        return this.fileExtensions.some(ext => text.toLowerCase().includes(ext.toLowerCase()));
    },

    hasEditorId: function(text) {
        return /<[^>]+>/.test(text);
    },

    hasParenthesesNumber: function(text) {
        return /\(\d+\)/.test(text);
    },

    isFormType: function(text) {
        return text.toLowerCase().includes('formtype:') || /^[A-Za-z]+\s*\([0-9]+\)/.test(text);
    },
};