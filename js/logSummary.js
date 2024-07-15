// logSummary.js
window.LogSummary = {
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
            insights += this.generateLineCountInsights(sectionsMap, lineCounts);
            insightsCount++;
        }

        /* THIS SECTION WAS ABONDONED.
        // NOLVUS has Total Plugins (ESM + ESP): 2,284 where thousands of them are actually ESL flagged ESPs ... which we can't tell by from just the crash log
        const pluginCountInsights = this.generatePluginCountInsights(sections);
        if (pluginCountInsights) {
            insights += pluginCountInsights;
            insightsCount++;
        }
        */

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
            insights += '<ul>' + this.processColoredListItems(namedElementMatches) + '</ul>';
            insights += '</li>';
            insightsCount++;
        }

        Utils.debuggingLog(['generateLogSummary', 'logSummary.js'], 'generateLogSummary completed');
        return { insights, insightsCount, namedElementMatches, missedMatches };
    },

    generateLogInsights: function (logFile, sections, isVanillaNolvus) {
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
        return lineCounts;
    },

    generateLineCountInsights: function (sectionsMap, lineCounts) {
        let insights = '<li>🔎 <b>Line Counts</b> for each section in the log file: <ul>';
        for (const [sectionName, sectionInfo] of sectionsMap) {
            if (sectionName === 'logType' || sectionName === 'firstLine' || sectionInfo.label === undefined) continue;
            let count = lineCounts[sectionName] || 0;
            let min = sectionInfo.nolvusExpectedMin;
            let max = sectionInfo.nolvusExpectedMax;
            if (!Utils.isSkyrimPage
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

    generatePluginCountInsights: function (sections) {
        //THIS SECTION WAS REMOVED.
        // NOLVUS has Total Plugins (ESM + ESP): 2,284 where thousands of them are actually ESL flagged ESPs ... which we can't tell by from just the crash log
        let insights = '<li>🔎 <b>Plugin Counts</b> for Plugins section in the log file: <ul>';

        insights += `<li>ESM Plugins: <code>${sections.countEsmPlugins.toLocaleString()}</code></li>`;
        insights += `<li>ESP Plugins: <code>${sections.countEspPlugins.toLocaleString()}</code></li>`;
        insights += `<li>ESL Plugins: <code>${sections.countEslPlugins.toLocaleString()}</code></li>`;
        insights += `<li>Total Plugins (ESM + ESP): <code>${sections.countTotalPlugins.toLocaleString()}</code></li>`;

        insights += '</ul></li>';

        // Add information about plugin limits
        insights += '<li>ℹ️ <b>Plugin Limit Information</b>:<ul>';
        insights += '<li>The combined total of ESM and ESP plugins cannot exceed 254.</li>';
        insights += '<li>ESL (light) plugins do not count towards this 254 limit.</li>';

        // Check if the plugin limit is approaching or exceeded
        if (sections.countTotalPlugins > 253) {
            insights += `<li>⚠️ <b>Warning:</b> Your total plugin count (${sections.countTotalPlugins}) exceeds the 254 limit. This may cause odd issues and/or crashes. For more information see <a href="https://www.reddit.com/r/Nolvus/comments/1b041m9/reference_keep_your_active_esmsesps_count_to_254/">REFERENCE: Keep your Active ESMs+ESPs count to 254 or lower!</a></li>`;
        } else if (sections.countTotalPlugins > 250) {
            insights += `<li>⚠️ <b>Caution:</b> Your total plugin count (${sections.countTotalPlugins}) is approaching the 254 limit. For more information see <a href="https://www.reddit.com/r/Nolvus/comments/1b041m9/reference_keep_your_active_esmsesps_count_to_254/">REFERENCE: Keep your Active ESMs+ESPs count to 254 or lower!</a></li>`;
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
            /* NEEDS more code alterations:
                - need to preserve arrow emojis in processFileExtensions() and processNameAndFile()
                - need to also merge the above functions somehow, so output will preserve not only indentations, but also the original sort order of all of the matches for that merged line
                    - I have no idea how to go about doing that...
                    - this is probably a good thing for NSF logs too?
                - maxLineLength probably needs to be raised in splitIntoLines() ... maybe to 8,000? 1,000 characters would probalby cut off too much useful info for a merged, extra-long line.
                    - what would safest maxLineLength be???
            if (logType === 'CrashLogger' || logType === 'Trainwreck') {
                processedContent = this.mergeIndentedLines(processedContent);
            }
            */

            const lines = this.splitIntoLines(processedContent);
            Utils.debuggingLog(['processLines', 'logSummary.js'], `Processing section: ${sectionName}, Number of lines: ${lines.length}`);

            lines.forEach(line => {
                if (line === '') return;

                if (line.toLowerCase().includes('kernel32.dll')) {
                    Utils.debuggingLog(['processLines', 'logSummary.js'], 'Found in line:', line);
                }

                let foundMatchCount = 0;

                foundMatchCount += this.processFileExtensions(line, sectionInfo.priority, sectionInfo.color, namedElementMatches);
                foundMatchCount += this.processNameAndFile(line, sectionInfo.priority, sectionInfo.color, namedElementMatches);

                if (foundMatchCount < this.containsKeyword(line)) {
                    missedMatches.push(line);
                }
            });
        });

        Utils.debuggingLog(['processLines', 'logSummary.js'], 'Before sorting namedElementMatches:', namedElementMatches.length);
        namedElementMatches.sort((a, b) => a.priority - b.priority);
        namedElementMatches = this.processNamedElementMatches(namedElementMatches);
        Utils.debuggingLog(['processLines', 'logSummary.js'], 'After processing namedElementMatches:', namedElementMatches.length);

        return { namedElementMatches, missedMatches };
    },

    mergeIndentedLines: function(logSection) {
        const lines = logSection.split('\n');
        let mergedLines = [];
        let currentLine = '';
        let indentLevel = 0;
    
        lines.forEach((line, index) => {
            const trimmedLine = line.trimLeft();
            const leadingTabs = line.length - trimmedLine.length;
    
            if (leadingTabs > 0 || (index > 0 && lines[index - 1].trim().endsWith('{'))) {
                // This is an indented line or follows a line ending with '{'
                if (leadingTabs > indentLevel) {
                    currentLine += ' ' + '➡️'.repeat(leadingTabs - indentLevel);
                    indentLevel = leadingTabs;
                } else if (leadingTabs < indentLevel) {
                    indentLevel = leadingTabs;
                }
                currentLine += ` ${trimmedLine}`;
            } else {
                // This is a new main line
                if (currentLine) {
                    mergedLines.push(currentLine);
                }
                currentLine = line;
                indentLevel = 0;
            }
        });
    
        // Add the last line
        if (currentLine) {
            mergedLines.push(currentLine);
        }
    
        return mergedLines.join('\n');
    },

    splitIntoLines: function (text) {
        Utils.debuggingLog(['splitIntoLines', 'logSummary.js'], 'Input text length:', text.length);
        const maxLineLength = 1000; //What would a good max safe length be?
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
        const fileExtensions = ['.bat', '.bik', '.bmp', '.bsa', '.bsl', '.cpp', '.dds', '.dll', '.esl', '.esm',
            '.esp', '.exe', '.fuz', '.hkx', '.ini', '.json', '.lip', '.nif', '.pex', '.psc',
            '.seq', '.skse', '.skse64', '.swf', '.tga', '.tri', '.txt', '.wav', '.xml', '.xwm'];
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

    processNameAndFile: function (line, priority, color, namedElementMatches) {
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

    addMatch: function (potentialMatch, priority, color, namedElementMatches) {
        if (Utils.logType === 'CrashLogger' || Utils.logType === 'Trainwreck') {
            //OLD: potentialMatch = potentialMatch.replace(/^\d+\]\s+0x[0-9A-Fa-f]+\s+/, '');
            potentialMatch = potentialMatch.replace(/^\d+\s*\]\s+0x[0-9A-Fa-f]+\s+/, '');
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

    containsKeyword: function (line) {
        const keywords = ['.dds', '.tga', '.bmp', '.nif', '.esl', '.esp', '.esm', '.pex', '.dll', '.exe', '.ini', '.bsa', '.fuz', '.hkx', '.seq', '.swf', 'name:', 'file:'];
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

        return `<li>🔎 <b>Files/Elements</b> listed within ${sectionDescriptions} sections of the crash log. Items are sorted by priority, with lower numbers (and higher positions in the list) indicating a higher likelihood of contributing to the crash. Pay extra attention to anything related to <b>mods you have added</b> to Nolvus:`;
    }
};