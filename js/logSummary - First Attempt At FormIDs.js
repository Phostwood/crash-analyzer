// logSummary.js  (old version!)

// ISSUE 1: for logs like  Crash_2025_1_16_0-54-34.txt, it grabs wrong FormID for Thistlefoot in this example line:
    //Character(FormId: FF00287F, BaseForm: TESNPC(Name: `Thistlefoot`, FormId: 590D1701, File: `018Auri.esp`))
// ISSUE 2: currently only works for NSF logs (not Trainwreck or Crash Logger SSE )


window.LogSummary = {

    // Constants
    fileExtensions: ['.bat', '.bik', '.bmp', '.bsa', '.bsl', '.bto', '.btr', '.cpp', '.dds', '.dll', '.esl', '.esm',
        '.esp', '.exe', '.fuz', '.hkb', '.hkx', '.ini', '.json', '.lip', '.nif', '.pex', '.psc',
        '.seq', '.skse', '.skse64', '.swf', '.tga', '.tri', '.txt', '.wav', '.xml', '.xwm'],
    
    fileStartCharacters: ['`', '"', ':', '(', '['],
    nameStartCharacters: ['`', '"'],
    unlikelyCulprits: ['clr.dll', 'd3d12core.dll', 'd3dcompiler_47.dll', 'kernel32.dll', 'kernelbase.dll', 
        'msvcp140.dll', 'ntdll.dll', 'runtime.dll', 'steamclient64.dll', 'system.ni.dll', 
        'ucrtbase.dll', 'uiautomationcore.dll', 'win32u.dll', 'xinput1_3.dll'], //REMOVED: 'vcruntime140.dll',
    removeList: ['Dawnguard.esm', 'Dragonborn.esm', 'null', 'null)', 'NetScriptFramework', 'SkyrimSE.exe', 'skyrim.esm', 'SkyrimVR.exe'].map(item => item.toLowerCase()),



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
            insights += '<ul>' + this.highlightFilenames(this.processColoredListItems(namedElementMatches)) + '</ul>';
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
                // First merge the lines - this will return both merged and individual lines
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
                    sectionInfo.color, namedElementMatches);
                foundMatchCount += this.processNameAndFile(line, sectionInfo.priority, 
                    sectionInfo.color, namedElementMatches);
    
                if (foundMatchCount < this.containsKeyword(line)) {
                    missedMatches.push(line);
                }
            });
        });
    
        Utils.debuggingLog(['processLines', 'logSummary.js'], 
            'Before sorting namedElementMatches:', namedElementMatches.length);
        
        // Remove any duplicate matches that might have occurred from processing 
        // both merged and individual lines
        namedElementMatches = Array.from(new Set(namedElementMatches.map(JSON.stringify)))
            .map(JSON.parse)
            .sort((a, b) => a.priority - b.priority);
        
        namedElementMatches = this.processNamedElementMatches(namedElementMatches);
        Utils.debuggingLog(['processLines', 'logSummary.js'], 
            'After processing namedElementMatches:', namedElementMatches.length);
    
        return { namedElementMatches, missedMatches };
    },

    mergeIndentedLines: function(logSection) {
        const lines = logSection.split('\n');
        let processedLines = [];
        
        // Process each line in sequence
        for (let i = 0; i < lines.length; i++) {
            const currentLine = lines[i];
            const currentIndent = (currentLine.match(/^\t+/) || [''])[0].length;
            
            // Find immediate subordinate lines
            let subordinates = [];
            let j = i + 1;
            while (j < lines.length) {
                const nextLine = lines[j];
                const nextIndent = (nextLine.match(/^\t+/) || [''])[0].length;
                
                // If next line is an immediate subordinate (one more indent level)
                if (nextIndent === currentIndent + 1) {
                    subordinates.push(nextLine.trim());
                } else if (nextIndent <= currentIndent) {
                    // Stop when we hit a line with same or less indentation
                    break;
                }
                j++;
            }
            
            // Create merged line with current line and its immediate subordinates
            const mergedLine = subordinates.length > 0 
                ? `${currentLine.trim()} \t${subordinates.join(' \t')}`
                : currentLine.trim();
                
            processedLines.push(mergedLine);
        }
        
        return processedLines.join('\n');
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
                foundMatchCount += this.addMatch(potentialMatch, priority, color, namedElementMatches);
            }
        });

        return foundMatchCount;
    },

    processNameAndFile: function (line, priority, color, namedElementMatches) {
        let foundMatchCount = 0;
        
        // Get FormID once for the whole line
        let formId = null;
        const formIdIndex = line.indexOf('FormId: FF') || line.indexOf('FormID: 0xFF') ; //Check for both Net Script Framework and Crash Logger SSE versions
        if (formIdIndex !== -1) {
            let formIdStart = formIdIndex + 'FormId:'.length;
            while (formIdStart < line.length && /\s/.test(line[formIdStart])) formIdStart++;
            let formIdEnd = formIdStart;
            while (formIdEnd < line.length && /[0-9A-Fa-f]/.test(line[formIdEnd])) formIdEnd++;
            if (formIdEnd > formIdStart) {
                formId = line.slice(formIdStart, formIdEnd);
            }
        }
    
        ["Name:", "File:"].forEach(keyword => {
            if (line.match(new RegExp(keyword, 'i'))) { // Made case-insensitive
                let index = line.toLowerCase().indexOf(keyword.toLowerCase()) + keyword.length; // Case-insensitive search
                let start = index;
                let delimiter = '';
    
                while (start < line.length) {
                    let char = line.charAt(start);
                    if (this.nameStartCharacters.includes(char) || (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9')) {
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
    
                let potentialMatch = line.slice(start, end);
                potentialMatch = this.cleanString(potentialMatch);
                
                // Only add FormID for Name: matches
                if (formId && keyword.toLowerCase() === "name:") {
                    potentialMatch = `${potentialMatch} [<span style="color: seagreen">${formId}</span>]`;
                }
                
                foundMatchCount += this.addMatch(potentialMatch, priority, color, namedElementMatches);
            }
        });
    
        return foundMatchCount;
    },

    addMatch: function (potentialMatch, priority, color, namedElementMatches) {
        // Remove hex codes at the start of lines like "[1] at 0x7FF70D9FE703"
        potentialMatch = String(potentialMatch).replace(/\s*at\s+0x[0-9A-Fa-f]+\s*/, '');
        //Remove remaining non-filename part from lines like "Unhandled exception at 0x7FF70D9FE703 badMod.dll"
        potentialMatch = String(potentialMatch).replace('Unhandled exception', '');

        if (Utils.logType === 'CrashLogger' || Utils.logType === 'Trainwreck') {
            //OLD: potentialMatch = potentialMatch.replace(/^\d+\]\s+0x[0-9A-Fa-f]+\s+/, '');
            potentialMatch = potentialMatch.replace(/^\d+\s*\]\s+0x[0-9A-Fa-f]+\s+/, '');
            potentialMatch = potentialMatch.replace(/^void\*\s+->\s+/, '');
            potentialMatch = potentialMatch.trim();
        }
        if (potentialMatch && !this.removeList.includes(potentialMatch.toLowerCase())) {
            namedElementMatches.push({ match: potentialMatch, priority, color });
            return 1;
        }
        return 0;
    },

    containsKeyword: function (line) {
        const keywords = [...window.LogSummary.fileExtensions, 'name:', 'file:'];
        //NOTE on OLD (below): why doesn't this use the "fileExtensions" const from the top of this .js file?
        //OLD: const keywords = ['.dds', '.tga', '.bmp', '.nif', '.esl', '.esp', '.esm', '.pex', '.dll', '.exe', '.ini', '.bsa', '.fuz', '.hkx', '.seq', '.swf', 'name:', 'file:'];
        const lowerCaseLine = line.toLowerCase();
        return keywords.filter(keyword => lowerCaseLine.includes(keyword)).length;
    },

    cleanString: function (input) {
        let str = String(input);
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
        //MAYBE function should be renamed processExplainersAndUnlikely()  ?
        return namedElementMatches.map(item => {
            let processedItem = item.match.toLowerCase();
            let originalItem = item.match;
            if (this.unlikelyCulprits.includes(processedItem)) {
                processedItem = `(${originalItem} ... unlikely culprit)`;
            }
            else if (Utils.explainersMap && Utils.explainersMap.has(processedItem)) {
                processedItem = `${originalItem} ${Utils.explainersMap.get(processedItem)}`;
            } else {
                processedItem = originalItem;
            }
            return { ...item, match: processedItem };
        }).filter(item => item !== undefined);
    },

    processColoredListItems: function (listItems) {
        const dedupedItems = Array.from(
            listItems.reduce((map, item) => {
                if (!map.has(item.match) || item.priority < map.get(item.match).priority) {
                    map.set(item.match, item);
                }
                return map;
            }, new Map()).values()
        );

        const truncatedItems = dedupedItems.map(item => {
            const truncatedMatch = item.match.length > 300 ? item.match.substring(0, 300) + '...' : item.match;
            return { ...item, match: truncatedMatch };
        });
        const wrappedItems = truncatedItems.map(item =>
            `<li><code><span style="color:${item.color}">[${item.priority}]</span> ${item.match}</code></li>`
        );
        return wrappedItems.join('');
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

        return `<li>🔎 <b>Files/Elements</b> listed within ${sectionDescriptions} sections of the crash log. Items are sorted by priority, with lower numbers (and higher positions in the list) indicating a higher likelihood of contributing to the crash. <code><span style="color:#FF0000">[1]</span> First Line</code> files are nearly always involved in (and frequently the cause of) the crash. Pay extra attention to anything related to <b>mods you have recently added</b> to ${Utils.NolvusOrSkyrimText}:`;
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
    }
};