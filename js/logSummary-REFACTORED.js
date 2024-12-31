// logSummary.js
// REFACTORED, but still not working correctly. Working with Claude on it...
window.LogSummary = {
    // Constants
    fileExtensions: ['.bat', '.bik', '.bmp', '.bsa', '.bsl', '.cpp', '.dds', '.dll', '.esl', '.esm',
        '.esp', '.exe', '.fuz', '.hkx', '.ini', '.json', '.lip', '.nif', '.pex', '.psc',
        '.seq', '.skse', '.skse64', '.swf', '.tga', '.tri', '.txt', '.wav', '.xml', '.xwm'],
    
    fileStartCharacters: ['`', '"', ':', '(', '['],
    nameStartCharacters: ['`', '"'],
    unlikelyCulprits: ['clr.dll', 'd3d12core.dll', 'd3dcompiler_47.dll', 'kernel32.dll', 'kernelbase.dll', 
        'msvcp140.dll', 'ntdll.dll', 'runtime.dll', 'steamclient64.dll', 'system.ni.dll', 
        'ucrtbase.dll', 'uiautomationcore.dll', 'win32u.dll', 'xinput1_3.dll'], //REMOVED: 'vcruntime140.dll',
    removeList: ['Dawnguard.esm', 'Dragonborn.esm', 'null', 'null)', 'NetScriptFramework', 'SkyrimSE.exe', 'skyrim.esm'],

    generateLogSummary: function(logFile, sections, sectionsMap, isVanillaNolvus) {
        Utils.debuggingLog(['generateLogSummary', 'logSummary.js'], 'generateLogSummary started', {
            sections: Object.keys(sections),
            topHalfLength: sections.topHalf?.length
        });

        let insights = '<h5>Log Summary:</h5><ul>';
        let insightsCount = 0;

        // Generate system insights if enough plugins
        if (Utils.countPlugins(logFile) > 2000) {
            insights += this.generateLogInsights(logFile, sections, isVanillaNolvus);
            insightsCount++;
        }

        // Generate line counts
        const lineCounts = this.generateLineCounts(sections, sectionsMap);
        if (Object.keys(lineCounts).length > 0) {
            insights += this.generateLineCountInsights(sectionsMap, lineCounts);
            insightsCount++;
        }

        // Process lines and generate element matches
        const { namedElementMatches, missedMatches } = this.processLines(sectionsMap);
        
        if (namedElementMatches.length > 0) {
            insights += this.generateSectionDescriptions(sectionsMap);
            insights += '<ul>' + this.processColoredListItems(namedElementMatches) + '</ul></li>';
            insightsCount++;
        }

        Utils.debuggingLog(['generateLogSummary', 'logSummary.js'], 'Summary complete', {
            insightsCount,
            matchCount: namedElementMatches.length
        });

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
            '</ul></li>';
    },

    generateLineCounts: function(sections, sectionsMap) {
        let lineCounts = {};
        for (const [sectionName, sectionInfo] of sectionsMap) {
            if (sectionInfo.content) {
                let lines = sectionInfo.content.split('\n').filter(line => line.trim() !== '');
                lineCounts[sectionName] = lines.length;
            } else {
                lineCounts[sectionName] = 0;
            }
        }

        // Add non-ESL plugins count
        const gamePluginsSection = sectionsMap.get('gamePlugins');
        if (gamePluginsSection?.content) {
            const nonEslPluginInfo = Utils.countNonEslPlugins(gamePluginsSection.content);
            lineCounts['nonEslPlugins'] = nonEslPluginInfo.nonEslPluginsCount;
        }

        return lineCounts;
    },

    generateLineCountInsights: function(sectionsMap, lineCounts) {
        let insights = '<li>🔎 <b>Line Counts</b> for each section in the log file: <ul>';
        
        // Process regular sections
        for (const [sectionName, sectionInfo] of sectionsMap) {
            if (sectionName === 'logType' || sectionName === 'firstLine' || !sectionInfo.label) continue;
            
            let count = lineCounts[sectionName] || 0;
            let min = sectionInfo.nolvusExpectedMin;
            let max = sectionInfo.nolvusExpectedMax;
            
            if (!Utils.isSkyrimPage && min !== null && max !== null && (count < min || count > max)) {
                insights += `<li>${sectionInfo.label}:&nbsp; <code>${count.toLocaleString()} ⚠️<b>expected between ${min.toLocaleString()} and ${max.toLocaleString()}</b></code></li>`;
            } else {
                insights += `<li>${sectionInfo.label}:&nbsp; <code>${count.toLocaleString()}</code></li>`;
            }
        }

        // Add non-ESL plugins count
        const nonEslCount = lineCounts["nonEslPlugins"];
        if (nonEslCount !== undefined) {
            if (nonEslCount > 254) {
                insights += `<li>Non-esl plugins:&nbsp; <code>${nonEslCount.toLocaleString()} ⚠️<b>maximum 254!</b>⚠️</code></li>`;
            } else {
                insights += `<li>Non-esl plugins:&nbsp; <code>${nonEslCount.toLocaleString()}</code></li>`;
            }
        }

        insights += '</ul></li>';
        return insights;
    },

    processLines: function(sectionsMap) {
        const logType = sectionsMap.get('logType');
        Utils.debuggingLog(['processLines', 'logSummary.js'], 'processLines started');

        let namedElementMatches = [];
        let missedMatches = [];

        // Filter sections with assigned colors and sort by priority
        const relevantSections = Array.from(sectionsMap.entries())
            .filter(([_, info]) => info.color !== null && info.color !== undefined)
            .sort((a, b) => a[1].priority - b[1].priority);

        relevantSections.forEach(([sectionName, sectionInfo]) => {
            const lines = this.splitIntoLines(sectionInfo.content);
            lines.forEach(line => {
                if (line === '') return;

                let foundMatchCount = 0;

                foundMatchCount += this.processFileExtensions(line, sectionInfo.priority, sectionInfo.color, namedElementMatches);
                foundMatchCount += this.processNameAndFile(line, sectionInfo.priority, sectionInfo.color, namedElementMatches);

                if (foundMatchCount < this.containsKeyword(line)) {
                    missedMatches.push(line);
                }
            });
        });

        namedElementMatches.sort((a, b) => a.priority - b.priority);
        namedElementMatches = this.processNamedElementMatches(namedElementMatches);

        return { namedElementMatches, missedMatches };
    },

    processFileExtensions: function(line, priority, color, namedElementMatches) {
        let foundMatchCount = 0;
    
        // First check for complete file paths
        const filePath = line.match(/[\\\/].*\.(txt|esl|esp|esm)$/i);
        if (filePath) {
            foundMatchCount += this.addMatch(filePath[0], priority, color, namedElementMatches);
        }
    
        // Check for special format paths
        const specialPath = line.match(/%s.*\.txt$/i);
        if (specialPath) {
            foundMatchCount += this.addMatch(specialPath[0], priority, color, namedElementMatches);
        }
    
        // Then do the normal file extension checks
        this.fileExtensions.forEach(extension => {
            if (line.toLowerCase().includes(extension)) {
                // Handle memory address lines differently
                if (line.includes('0x')) {
                    const fileMatch = line.match(/([a-zA-Z0-9_-]+\.(dll|exe|esm))/i);
                    if (fileMatch) {
                        foundMatchCount += this.addMatch(fileMatch[1], priority, color, namedElementMatches);
                    }
                    return;
                }
    
                let index = line.toLowerCase().lastIndexOf(extension);
                let end = index + extension.length;
                let start = index;
                let tempFileStartChars = [...this.fileStartCharacters];
    
                while (start > 0) {
                    let char = line.charAt(start - 1);
                    if (char === ')') {
                        tempFileStartChars = tempFileStartChars.filter(item => item !== '(');
                    }
                    if (tempFileStartChars.includes(char)) {
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

        ["Name:", "File:"].forEach(keyword => {
            if (line.includes(keyword)) {
                let index = line.indexOf(keyword) + keyword.length;
                let start = index;
                let delimiter = '';

                while (start < line.length) {
                    let char = line.charAt(start);
                    if (this.nameStartCharacters.includes(char) || /[a-zA-Z0-9]/.test(char)) {
                        if (this.nameStartCharacters.includes(char)) {
                            delimiter = char;
                        }
                        break;
                    }
                    start++;
                }

                let end = start;
                while (end < line.length) {
                    let char = line.charAt(end);
                    if (char === delimiter || /[,\t\n\r]/.test(char)) {
                        break;
                    }
                    end++;
                }

                let potentialMatch = this.cleanString(line.slice(start, end));
                foundMatchCount += this.addMatch(potentialMatch, priority, color, namedElementMatches);
            }
        });

        return foundMatchCount;
    },

    addMatch: function(potentialMatch, priority, color, namedElementMatches) {
        if (Utils.logType === 'CrashLogger' || Utils.logType === 'Trainwreck') {
            potentialMatch = potentialMatch
                .replace(/^\d+\s*\]\s+0x[0-9A-Fa-f]+\s+/, '')
                .replace(/^void\*\s+->\s+/, '')
                .trim();
        }

        if (potentialMatch && !this.removeList.map(item => item.toLowerCase()).includes(potentialMatch.toLowerCase())) {
            // Handle full line captures for special cases
            if (potentialMatch.includes('->') || potentialMatch.includes('<-') ||
                potentialMatch.match(/\([^)]+\)$/)) {
                namedElementMatches.push({ match: potentialMatch, priority, color });
                return 1;
            }

            // Handle DLL with description format
            const dllWithDesc = potentialMatch.match(/([a-zA-Z0-9_-]+\.dll)(\s*\([^)]+\))?/i);
            if (dllWithDesc) {
                namedElementMatches.push({ match: potentialMatch, priority, color });
                return 1;
            }

            // Handle normal file matches
            namedElementMatches.push({ match: potentialMatch, priority, color });
            return 1;
        }
        return 0;
    },

    containsKeyword: function(line) {
        const keywords = [...this.fileExtensions, 'name:', 'file:'];
        return keywords.filter(keyword => line.toLowerCase().includes(keyword)).length;
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

    splitIntoLines: function(text) {
        const maxLineLength = 1000;
        const lines = [];
        let start = 0;
        
        while (start < text.length) {
            let lineEnd = text.indexOf('\n', start);
            if (lineEnd === -1) lineEnd = text.length;
            
            let stringEnd = Math.min(start + maxLineLength, lineEnd);
            lines.push(text.substring(start, stringEnd));
            start = lineEnd + 1;
        }
        
        return lines;
    },

    processNamedElementMatches: function(namedElementMatches) {
        const firstLineFiles = new Set(
            namedElementMatches
                .filter(item => item.priority === 1)
                .map(item => {
                    const fileMatch = item.match.match(/([a-zA-Z0-9_-]+\.(dll|exe|esm|esl|esp))/i);
                    return fileMatch ? fileMatch[1].toLowerCase() : item.match.toLowerCase();
                })
        );

        return namedElementMatches.map(item => {
            const originalItem = item.match;
            
            // Skip if this file was already in first line and this isn't the first line
            if (item.priority !== 1) {
                const fileMatch = originalItem.match(/([a-zA-Z0-9_-]+\.(dll|exe|esm|esl|esp))/i);
                const processedItem = fileMatch ? fileMatch[1].toLowerCase() : originalItem.toLowerCase();
                if (firstLineFiles.has(processedItem)) {
                    return null;
                }
            }

            // Handle arrow-connected lines
            if (originalItem.includes('->') || originalItem.includes('<-')) {
                return { ...item, match: originalItem };
            }

            // Extract the main part for checking against unlikely culprits
            const processedItem = originalItem.toLowerCase();

            // Handle unlikely culprits - but skip the label if it's in first line
            if (this.unlikelyCulprits.includes(processedItem)) {
                if (item.priority === 1) {
                    return { ...item, match: originalItem };
                }
                return { ...item, match: `(${originalItem} ... unlikely culprit)` };
            }

            // Handle items with explainers
            if (Utils.explainersMap?.has(processedItem)) {
                const explanation = Utils.explainersMap.get(processedItem);
                const isSystemFile = this.unlikelyCulprits.includes(processedItem) || 
                                    this.removeList.includes(processedItem);
                
                if (!isSystemFile) {
                    return { 
                        ...item, 
                        match: `${originalItem} ${explanation}`,
                        useCustomColor: true,
                        customColorLength: originalItem.length
                    };
                }
                return { ...item, match: `${originalItem} ${explanation}` };
            }

            // Color non-system files if they have a file extension
            const hasFileExtension = this.fileExtensions.some(ext => processedItem.includes(ext));
            const isSystemFile = this.unlikelyCulprits.includes(processedItem) || 
                                this.removeList.includes(processedItem);
            
            if (hasFileExtension && !isSystemFile) {
                return { 
                    ...item, 
                    match: originalItem,
                    useCustomColor: true
                };
            }

            return { ...item, match: originalItem };
        }).filter(Boolean);
    },

    generateSectionDescriptions: function(sectionsMap) {
        const relevantSections = Array.from(sectionsMap.entries())
            .filter(([_, info]) => info.color !== null && info.color !== undefined)
            .sort((a, b) => a[1].priority - b[1].priority);

        const sectionDescriptions = relevantSections.map(([sectionName, info], index, array) => {
            const description = `<code><span style="color:${info.color}">[${info.priority}]</span> ${info.label}</code>`;
            if (index === array.length - 2) return description + ', and/or';
            if (index === array.length - 1) return description;
            return description + ',';
        }).join(' ');
    
        return `<li>🔎 <b>Files/Elements</b> listed within ${sectionDescriptions} sections of the crash log. Items are sorted by priority, with lower numbers (and higher positions in the list) indicating a higher likelihood of contributing to the crash. <code><span style="color:#FF0000">[1]</span> First Line</code> files are nearly always involved in (and frequently the cause of) the crash. Files highlighted in <span style="color:#20B2AA">green</span> are often good candidates to scrutinize, especially those higher up in the list. Pay extra attention to anything related to <b>mods you have recently added</b> to ${Utils.NolvusOrSkyrimText}:`;
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

        return dedupedItems
            .map(item => ({
                ...item,
                match: item.match.length > 300 ? item.match.substring(0, 300) + '...' : item.match
            }))
            .map(item => {
                const textColor = '#20B2AA'; // Light Sea Green
                if (item.useCustomColor) {
                    if (item.customColorLength) {
                        // Split into colored and non-colored parts for items with explanations
                        const coloredPart = item.match.slice(0, item.customColorLength);
                        const restPart = item.match.slice(item.customColorLength);
                        return `<li><code><span style="color:${item.color}">[${item.priority}]</span> <span style="color:${textColor}">${coloredPart}</span>${restPart}</code></li>`;
                    }
                    return `<li><code><span style="color:${item.color}">[${item.priority}]</span> <span style="color:${textColor}">${item.match}</span></code></li>`;
                }
                return `<li><code><span style="color:${item.color}">[${item.priority}]</span> ${item.match}</code></li>`;
            })
            .join('');
    }
};