// logSummary.js
window.LogSummary = {
    generateLogSummary: function(logFile, sections, sectionsMap, isVanillaNolvus) {
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
        const { namedElementMatches, missedMatches } = this.processLines(sections.topHalf, sectionsMap);
        Utils.debuggingLog(['generateLogSummary', 'logSummary.js'], 'After processLines');
        Utils.debuggingLog(['generateLogSummary', 'logSummary.js'], 'namedElementMatches length:', namedElementMatches.length);
        Utils.debuggingLog(['generateLogSummary', 'logSummary.js'], 'missedMatches length:', missedMatches.length);
        Utils.debuggingLog(['generateLogSummary', 'logSummary.js'], ' ');
        Utils.debuggingLog(['generateLogSummary_long', 'logSummary.js'], 'missedMatches:', missedMatches);
        Utils.debuggingLog(['generateLogSummary_long', 'logSummary.js'], 'namedElementMatches:', namedElementMatches);

        if (namedElementMatches.length > 0) {
            insights += this.generateSectionDescriptions(sections, sectionsMap);
            insights += '<ul>' + this.processColoredListItems(namedElementMatches) + '</ul>';
            insights += '</li>';
            insightsCount++;
        }

        Utils.debuggingLog(['generateLogSummary', 'logSummary.js'], 'generateLogSummary completed');
        return { insights, insightsCount, namedElementMatches, missedMatches };
    },

    generateLogInsights: function(logFile, sections, isVanillaNolvus) {
        return '<li>🔎 <b>Log Insights:</b> (not 100% accurate)<ul>' +
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
            '</ul>';
    },

    generateLineCounts: function(sections, sectionsMap) {
        let lineCounts = {};
        for (const [sectionContent, sectionInfo] of sectionsMap) {
            const sectionName = sectionInfo.name;
            let lines = sectionContent.split('\n').filter(line => line.trim() !== '');
            lineCounts[sectionName] = lines.length;
        }
        return lineCounts;
    },

    generateLineCountInsights: function (sections, sectionsMap, lineCounts) {
        let insights = '<li>🔎 <b>Line Counts</b> for each section in the log file: <ul>';
        for (const [sectionContent, sectionInfo] of sectionsMap) {
            const sectionName = sectionInfo.name;
            if (sectionName === 'firstLine' || sectionInfo.label === undefined) continue;
            let count = lineCounts[sectionName] || 0;
            let min = sectionInfo.nolvusExpectedMin;
            let max = sectionInfo.nolvusExpectedMax;
            if ((sections.logType === 'NetScriptFramework')
                && (min !== null && max !== null)
                && (count < min || count > max)
            ) {
                insights += `<li>${sectionInfo.label}:&nbsp; <code>${count.toLocaleString()} ⚠️<b>expected between ${min.toLocaleString()} and ${max.toLocaleString()}</b></code></li>`;
            } else {
                insights += `<li>${sectionInfo.label}:&nbsp; <code>${count.toLocaleString()}</code></li>`;
            }
        }
        insights += '</ul></li>';
        return insights;
    },

    processLines: function(topHalf, sectionsMap) {
        const logType = sectionsMap.get('logType');
        Utils.debuggingLog(['processLines', 'logSummary.js'], 'processLines started, topHalf length:', topHalf.length);
        Utils.debuggingLog(['processLines_long', 'logSummary.js'], 'topHalf first 100 characters:', topHalf.substring(0, 100));
        const lines = this.splitIntoLines(topHalf);
        Utils.debuggingLog(['processLines', 'logSummary.js'], 'Number of lines after split:', lines.length);
        let namedElementMatches = [];
        let missedMatches = [];
        let lineCounter = 0;

        lines.forEach(line => {
            if (line === '') return;

            if (line.toLowerCase().includes('kernel32.dll')) {
                Utils.debuggingLog(['processLines', 'logSummary.js'], 'Found in line:', line);
            }

            let foundMatchCount = 0;

            const { priority, color } = this.getLogSection(line, sectionsMap);

            foundMatchCount += this.processFileExtensions(line, priority, color, namedElementMatches);
            foundMatchCount += this.processNameAndFile(line, priority, color, namedElementMatches);

            if (foundMatchCount < this.containsKeyword(line)) {
                missedMatches.push(line);
            }
            lineCounter++;
        });

        Utils.debuggingLog(['processLines', 'logSummary.js'], 'Before sorting namedElementMatches:', namedElementMatches.length);
        namedElementMatches.sort((a, b) => a.priority - b.priority);
        namedElementMatches = this.processNamedElementMatches(namedElementMatches);
        Utils.debuggingLog(['processLines', 'logSummary.js'], 'After processing namedElementMatches:', namedElementMatches.length);

        return { namedElementMatches, missedMatches };
    },

    splitIntoLines: function(text) {
        Utils.debuggingLog(['splitIntoLines', 'logSummary.js'], 'Input text length:', text.length);
        const maxLineLength = 1000;
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

    getLogSection: function(line, sectionsMap) {
        for (const [sectionContent, sectionInfo] of sectionsMap) {
            if (sectionContent.includes(line)) {
                return sectionInfo;
            }
        }
        return {
            name: 'unknown',
            label: 'Unknown',
            priority: 6,
            color: 'gray',
            nolvusExpectedMin: 0,
            nolvusExpectedMax: Infinity
        };
    },

    processFileExtensions: function(line, priority, color, namedElementMatches) {
        let foundMatchCount = 0;
        const fileExtensions = ['.bat', '.bik', '.bmp', '.bsa', '.bsl', '.cpp', '.dds', '.dll', '.esl', '.esm',
            '.esp', '.exe', '.fuz', '.hkx', '.ini', '.json', '.lip', '.nif', '.pex', '.psc',
            '.seq', '.skse', '.skse64', '.swf', '.tga', '.tri'];
        const fileStartCharacter = ['`', '"', ':', '(', '['];

        fileExtensions.forEach(extension => {
            if (line.toLowerCase().includes(extension)) {
                let index = line.toLowerCase().lastIndexOf(extension);
                let end = index + extension.length;
                let start = index;
                let tempFileStartCharacter = [...fileStartCharacter];
                
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

    processNameAndFile: function(line, priority, color, namedElementMatches) {
        let foundMatchCount = 0;
        const nameStartCharacter = ['`', '"'];

        ["Name:", "File:"].forEach(keyword => {
            if (line.match(new RegExp(`${keyword}`))) {
                let index = line.indexOf(keyword) + keyword.length;
                let start = index;
                let delimiter = '';
                
                while (start < line.length) {
                    let char = line.charAt(start);
                    if (nameStartCharacter.includes(char) || (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9')) {
                        if (nameStartCharacter.includes(char)) {
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
                foundMatchCount += this.addMatch(potentialMatch, priority, color, namedElementMatches);
            }
        });

        return foundMatchCount;
    },

    addMatch: function(potentialMatch, priority, color, namedElementMatches) {
        if (Utils.logType === 'CrashLogger') {
            potentialMatch = potentialMatch.replace(/^\d+\]\s+0x[0-9A-Fa-f]+\s+/, '');
            potentialMatch = potentialMatch.replace(/^void\*\s+->\s+/, '');
            potentialMatch = potentialMatch.trim();
          }
        const removeList = ['Dawnguard.esm', 'Dragonborn.esm', 'null', 'null)', 'NetScriptFramework', 'SkyrimSE.exe', 'skyrim.esm'].map(item => item.toLowerCase());
        if (potentialMatch && !removeList.includes(potentialMatch.toLowerCase())) {
            namedElementMatches.push({ match: potentialMatch, priority, color });
            return 1;
        }
        return 0;
    },

    containsKeyword: function(line) {
        const keywords = ['.dds', '.tga', '.bmp', '.nif', '.esl', '.esp', '.esm', '.pex', '.dll', '.exe', '.ini', '.bsa', '.fuz', '.hkx', '.seq', '.swf', 'name:', 'file:'];
        const lowerCaseLine = line.toLowerCase();
        return keywords.filter(keyword => lowerCaseLine.includes(keyword)).length;
    },

    cleanString: function(input) {
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

    processNamedElementMatches: function(namedElementMatches) {
        const unlikelyCulpritsList = ['clr.dll', 'd3d12core.dll', 'd3dcompiler_47.dll', 'kernel32.dll', 'kernelbase.dll', 'msvcp140.dll', 'ntdll.dll', 'runtime.dll', 'steamclient64.dll', 'system.ni.dll', 'ucrtbase.dll', 'uiautomationcore.dll', 'vcruntime140.dll', 'win32u.dll', 'xinput1_3.dll'];

        return namedElementMatches.map(item => {
            let processedItem = item.match.toLowerCase();
            let originalItem = item.match;
            if (unlikelyCulpritsList.includes(processedItem)) {
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

    processColoredListItems: function(listItems) {
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

    generateSectionDescriptions: function(sections, sectionsMap) {
        const relevantSections = Array.from(sectionsMap.entries())
            .filter(([sectionContent, info]) => 
                info.color !== null && sections.topHalf.includes(sectionContent)
            )
            .sort((a, b) => a[1].priority - b[1].priority);

        const sectionDescriptions = relevantSections.map(([_, info], index, array) => {
            const description = `<code><span style="color:${info.color}">[${info.priority}]</span> ${info.label}</code>`;
            if (index === array.length - 2) {
                return description + ', and/or';
            } else if (index === array.length - 1) {
                return description;
            } else {
                return description + ',';
            }
        }).join(' ');

        return `<li>🔎 <b>Files/Elements</b> listed within ${sectionDescriptions} sections of the crash log. Items are sorted by priority, with lower numbers (and higher positions in the list) indicating a higher likelihood of contributing to the crash. Pay extra attention to anything related to <b>mods you have added</b> to Nolvus:`;
    }
};