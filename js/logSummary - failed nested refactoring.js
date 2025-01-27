// logSummary.js  (old version!)

// Claude AI attempted to fix a prior issue, but created more issues than it fixed. But I'm keeping the code here in case any of its new code is useful...


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
                // Add unique section identifier to each merged line
                processedContent = processedContent.split('\n').map((line, index) => 
                    `${sectionName}_${index}|${line}`
                ).join('\n');
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
                `Processing item for grouping: "${item.match}"`, {
                    sourceLine: item.sourceLine
                }
            );
    
            // Create a normalized version of the source line for consistent grouping
            const normalizedLine = item.sourceLine.trim();
            const originalSection = item.originalSection || '';

            // Initialize the group for this source line if it doesn't exist
            const groupKey = `${originalSection}:${normalizedLine}`;
            if (!groups.has(groupKey)) {
                groups.set(groupKey, []);
            }

            // Add item to its source line group
            groups.get(groupKey).push(item);
            
            return groups;
        }, new Map());
    
        const processedMatches = [];
        lineGroups.forEach((group, sourceLine) => {
            Utils.debuggingLog(['processGroups', 'logSummary.js'], 
                `Processing group for line: ${sourceLine}`, {
                    groupSize: group.length,
                    items: group.map(item => item.match)
                }
            );
    
            // Select the primary item for the group
            const primary = group.find(item => {
                const result = item.hasFile;
                Utils.debuggingLog(['primary', 'logSummary.js'], 
                    `Testing for File: "${item.match}"`, {
                        hasFile: item.hasFile,
                        wasChosen: result
                    }
                );
                return result;
            }) || group.find(item => {
                const result = item.hasName && !item.match.toLowerCase().includes('formtype:');
                Utils.debuggingLog(['primary', 'logSummary.js'], 
                    `Testing for Name: "${item.match}"`, {
                        hasName: item.hasName,
                        hasFormType: item.match.toLowerCase().includes('formtype:'),
                        wasChosen: result
                    }
                );
                return result;
            }) || group.find(item => {
                const result = item.hasEditorId;
                Utils.debuggingLog(['primary', 'logSummary.js'], 
                    `Testing for EditorID: "${item.match}"`, {
                        hasEditorId: item.hasEditorId,
                        wasChosen: result
                    }
                );
                return result;
            }) || group[0];
    
            // Process sub-items that belong to the same source line
            const subItems = group
                .filter(item => item !== primary)
                .map(item => this.createSubItem(item))
                .filter(item => {
                    const isFormType = this.isFormType(item.match);
                    const isValidAttribute = isFormType || item.hasName || item.hasEditorId;
                    Utils.debuggingLog(['subItems', 'logSummary.js'],
                        `Filtering subitem "${item.match}":`, {
                            isFormType,
                            isValidAttribute,
                            kept: isValidAttribute
                        }
                    );
                    return isValidAttribute;
                })
                .sort((a, b) => {
                    const aIsFormType = this.isFormType(a.match);
                    const bIsFormType = this.isFormType(b.match);
                    
                    if (aIsFormType !== bIsFormType) {
                        return aIsFormType ? -1 : 1;
                    }
                    return 0;
                });
    
            processedMatches.push(subItems.length > 0 ? {...primary, subItems} : primary);
        });
    
        return processedMatches.map(match => {
            if (match.subItems && match.subItems.length > 0) {
                // Only collect FormIDs from items in the same group
                const allFormIds = new Set([
                    ...this.extractFormIds(match.match),
                    ...match.subItems.flatMap(item => this.extractFormIds(item.match))
                ]);
                
                const formIdString = Array.from(allFormIds)
                    .map(id => `[${id}]`)
                    .join(' ');
                
                if (!match.match.includes(formIdString)) {
                    match.match = `${match.match.split('[')[0].trim()} ${formIdString}`;
                }
            }
            return match;
        });
    },



    getGroupKey: function(item) {
        if (!item.sourceLine) {
            Utils.debuggingLog(['getGroupKey', 'logSummary.js'], 
                'No source line found for item:', {
                    item: item.match
                }
            );
            return item.match;
        }
        
        // Use both originalSection and sourceLine for consistent grouping
        const normalizedLine = item.sourceLine.trim().replace(/\s+/g, ' ');
        const originalSection = item.originalSection || '';
        const groupKey = `${originalSection}:${normalizedLine}`;
        
        Utils.debuggingLog(['getGroupKey', 'logSummary.js'], 
            'Generated group key:', {
                originalLine: item.sourceLine,
                normalizedKey: groupKey,
                item: item.match
            }
        );
        
        return groupKey;
    },


    createSubItem: function(item) {
        let match = item.match;
        
        // Remove FormIDs and brackets first
        match = match.replace(/\s*\[[^\]]*\]/g, '');
        
        // Handle form types more precisely
        if (this.isFormType(match)) {
            // Remove numeric identifiers while preserving the base type name
            match = match.replace(/\s*\(\d+\)(?=\s*(?:\[|$)|\s*$)/, '');
            match = match.replace(/FormType:\s*/, '');
            
            // Clean up common form types to ensure consistent formatting
            const formTypeMap = {
                'actorcharacter': 'ActorCharacter',
                'npc': 'NPC',
                'cell': 'Cell',
                'location': 'Location'
            };
            
            // Apply standard capitalization for known form types
            const lowercaseMatch = match.toLowerCase();
            for (const [key, value] of Object.entries(formTypeMap)) {
                if (lowercaseMatch.includes(key)) {
                    match = value;
                    break;
                }
            }
        }
        
        // Clean up other prefixes and quotes
        match = match.replace(/^(?:Name|File|EditorID):\s*["']?/, '');
        match = match.replace(/["']/g, '');
        
        Utils.debuggingLog(['createSubItem', 'logSummary.js'], 
            `Creating subitem from "${item.match}"`, {
                originalMatch: item.match,
                processedMatch: match.trim(),
                isFormType: this.isFormType(match)
            }
        );
        
        return {
            ...item,
            match: match.trim()
        };
    },


    mergeIndentedLines: function(logSection) {
        const lines = logSection.split('\n');
        let processedLines = [];
        
        // Process each line in sequence
        for (let i = 0; i < lines.length; i++) {
            const currentLine = lines[i];
            const currentIndent = currentLine.startsWith('\t') ? 
                currentLine.split(/[^\t]/)[0].length : 0;
            
            // Detect the beginning of a new logical group
            const isNewGroup = currentIndent === 0 && currentLine.trim().length > 0;
            
            if (isNewGroup) {
                Utils.debuggingLog(['mergeIndentedLines', 'logSummary.js'], 
                    'Found new group:', {
                        line: currentLine.trim()
                    }
                );
                
                // Find all subordinate lines for this group
                let subordinates = [];
                let j = i + 1;
                
                while (j < lines.length) {
                    const nextLine = lines[j];
                    const nextIndent = nextLine.startsWith('\t') ? 
                        nextLine.split(/[^\t]/)[0].length : 0;
                    
                    // Only include immediate subordinates (one level deeper)
                    if (nextIndent === currentIndent + 1) {
                        subordinates.push(nextLine.trim());
                        j++;
                    } else if (nextIndent <= currentIndent) {
                        // Stop when we hit a line with same or less indentation
                        break;
                    } else {
                        // Skip deeper nested lines
                        j++;
                    }
                }
                
                // Create the merged line with a consistent delimiter
                const mergedLine = subordinates.length > 0 ? 
                    `${currentLine.trim()} \t${subordinates.join(' \t')}` : 
                    currentLine.trim();
                
                Utils.debuggingLog(['mergeIndentedLines', 'logSummary.js'], 
                    'Created merged line:', {
                        original: currentLine.trim(),
                        subordinates: subordinates,
                        result: mergedLine
                    }
                );
                
                processedLines.push(mergedLine);
                i = j - 1;  // Skip processed subordinate lines
            } else if (currentLine.trim().length > 0) {
                // Preserve non-empty lines that aren't part of a group
                processedLines.push(currentLine.trim());
            }
        }
        
        const result = processedLines.join('\n');
        Utils.debuggingLog(['mergeIndentedLines', 'logSummary.js'], 
            'Completed line merging:', {
                totalGroups: processedLines.length
            }
        );
        
        return result;
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
        
            // First check for full file paths and explicit File: tags
            const fileMatch = line.match(/File:\s*["`]([^"`]+)["`]/);
            if (fileMatch) {
                const potentialMatch = fileMatch[1];
                foundMatchCount += this.addMatch(potentialMatch, priority, color, namedElementMatches, line);
            }
        
            // Then check for individual file extensions
            this.fileExtensions.forEach(extension => {
                if (line.toLowerCase().includes(extension)) {
                    let index = line.toLowerCase().lastIndexOf(extension);
                    let end = index + extension.length;
                    let start = index;
                    let tempFileStartCharacter = [...this.fileStartCharacters];
        
                    // Improve file name extraction by handling nested structures
                    while (start > 0) {
                        let char = line.charAt(start - 1);
                        if (char === ')' && tempFileStartCharacter.includes('(')) {
                            // Only remove the '(' if we're in a valid file context
                            const textBeforeParens = line.substring(0, start).toLowerCase();
                            if (!textBeforeParens.includes('formtype:')) {
                                tempFileStartCharacter = tempFileStartCharacter.filter(item => item !== '(');
                            }
                        }
                        if (tempFileStartCharacter.includes(char)) {
                            break;
                        }
                        start--;
                    }
        
                    let potentialMatch = line.slice(start, end).trim();
                    
                    // Add additional context logging
                    Utils.debuggingLog(['processFileExtensions', 'logSummary.js'], 
                        `Processing file extension match:`, {
                            original: line,
                            extracted: potentialMatch,
                            start,
                            end,
                            extension
                        }
                    );
        
                    // Only process if it's a valid file name
                    if (potentialMatch && !potentialMatch.includes('FormType:')) {
                        foundMatchCount += this.addMatch(potentialMatch, priority, color, namedElementMatches, line);
                    }
                }
            });
        
            return foundMatchCount;
        },





    processModifiedByChain: function(line) {
        if (!line) return null;
        
        // Look for both standard and alternate ModifiedBy formats
        const modPatterns = [
            /ModifiedBy:\s*(.+?)(?=\t|$)/i,
            /Modified\s+by:\s*(.+?)(?=\t|$)/i,
            /Modified\s+By:\s*(.+?)(?=\t|$)/i
        ];

        for (const pattern of modPatterns) {
            const match = line.match(pattern);
            if (match) {
                const chainText = match[1].trim();
                
                // Process the modification chain
                const mods = chainText.split(/\s*->\s*/)
                    .map(mod => mod.trim())
                    .filter(mod => {
                        // Filter out empty entries and known invalid values
                        return mod && 
                            !this.removeList.includes(mod.toLowerCase()) &&
                            !mod.includes('FormType:');
                    });
                
                Utils.debuggingLog(['processModifiedByChain', 'logSummary.js'], 
                    `Processing modification chain:`, {
                        original: chainText,
                        processed: mods,
                        sourceLine: line
                    }
                );
                
                // Only return if we found valid modifications
                if (mods.length > 0) {
                    return {
                        chain: mods,
                        isBaseGame: mods[0].toLowerCase() === 'skyrim.esm',
                        modCount: mods.length
                    };
                }
            }
        }
        
        return null;
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

                // Add BaseForm check
                if (formIdIndex === -1) {
                    formIdIndex = line.indexOf('BaseForm:', end);
                }

                if (formIdIndex !== -1) {
                    Utils.debuggingLog(['processNameAndFile', 'logSummary.js'], 'Found FormID at index:', formIdIndex);
                    
                    let formIdStart = formIdIndex + (line.indexOf('FormID:') !== -1 ? 'FormID:' : 
                                                    line.indexOf('FormId:') !== -1 ? 'FormId:' : 'BaseForm:').length;
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
                        
                        // Look for additional nested FormIds
                        const nestedMatch = line.substring(formIdEnd).match(/BaseForm:[^)]*FormId:\s*(?:0x)?([0-9A-Fa-f]{8})/i);
                        if (nestedMatch) {
                            const nestedFormId = nestedMatch[1].toUpperCase();
                            Utils.debuggingLog(['processNameAndFile', 'logSummary.js'], 'Found nested FormID:', nestedFormId);
                            associatedFormId = [associatedFormId, nestedFormId];
                        }
                        
                        Utils.debuggingLog(['processNameAndFile', 'logSummary.js'], 'Extracted FormID(s):', associatedFormId);
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
        if (!potentialMatch) return 0;
        
        // Ensure consistent string handling
        potentialMatch = String(potentialMatch)
            .replace(/\s*at\s+0x[0-9A-Fa-f]+\s*/, '')
            .replace('Unhandled exception', '');
        
        // Handle specific log format cleaning
        if (Utils.logType === 'CrashLogger' || Utils.logType === 'Trainwreck') {
            potentialMatch = potentialMatch
                .replace(/^\d+\s*\]\s+0x[0-9A-Fa-f]+\s+/, '')
                .replace(/^void\*\s+->\s+/, '')
                .trim();
        }
        
        // Process the match only if it's valid and not in the remove list
        if (potentialMatch && !this.removeList.includes(potentialMatch.split('[')[0].trim().toLowerCase())) {
            const lowerMatch = potentialMatch.toLowerCase();
            
            // Enhanced attribute detection
            const hasFile = this.fileExtensions.some(ext => lowerMatch.endsWith(ext));
            const hasName = lowerMatch.includes('name:') || 
                           (!hasFile && !lowerMatch.includes('formtype:') && !lowerMatch.includes('editorid:'));
            const hasEditorId = lowerMatch.includes('editorid:');
            const hasFormType = this.isFormType(potentialMatch);
            
            // Add debug logging for match processing
            Utils.debuggingLog(['addMatch', 'logSummary.js'], 
                `Processing match: "${potentialMatch}"`, {
                    hasFile,
                    hasName,
                    hasEditorId,
                    hasFormType,
                    sourceLine: line
                }
            );
            
            namedElementMatches.push({ 
                match: potentialMatch, 
                priority, 
                color, 
                // Update sourceLine handling
                sourceLine: line.includes('|') ? line.split('|')[1] : line,
                originalSection: line.includes('|') ? line.split('|')[0] : '',
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
                const baseKey = this.stripFormIds(item.match);
                
                if (!map.has(baseKey)) {
                    map.set(baseKey, {
                        ...item,
                        formIds: new Set([...this.extractFormIds(item.match)])
                    });
                } else {
                    const existing = map.get(baseKey);
                    
                    // Add any new FormIDs to the existing set
                    this.extractFormIds(item.match).forEach(id => 
                        existing.formIds.add(id)
                    );
                    
                    // Update the item if it has higher priority
                    if (item.priority < existing.priority) {
                        map.set(baseKey, {
                            ...item,
                            formIds: existing.formIds
                        });
                    }
                }
                return map;
            }, new Map()).values()
        ).map(item => {
            let processedItem = item.match.split(' [')[0];
            
            // Sort FormIDs numerically and apply consistent color coding
            const sortedFormIds = Array.from(item.formIds)
                .sort((a, b) => parseInt(a, 16) - parseInt(b, 16))
                .map(id => {
                    const isDynamic = id.startsWith('FF');
                    const color = isDynamic ? 'seagreen' : '#2F4F2F';
                    return `[<span style="color: ${color}">${id}</span>]`;
                })
                .join(' ');
            
            if (sortedFormIds) {
                processedItem = `${processedItem} ${sortedFormIds}`;
            }
            
            // Handle special cases and informational notes
            const lowercaseMatch = processedItem.toLowerCase();
            if (this.unlikelyCulprits.includes(lowercaseMatch)) {
                processedItem = `(${processedItem} ... unlikely culprit)`;
            }
            else if (Utils.explainersMap && Utils.explainersMap.has(lowercaseMatch)) {
                processedItem = `${processedItem} ${Utils.explainersMap.get(lowercaseMatch)}`;
            }
            
            Utils.debuggingLog(['processNamedElementMatches', 'logSummary.js'], 
                'Processing item:', {
                    originalMatch: item.match,
                    formIds: Array.from(item.formIds),
                    result: processedItem
                }
            );
            
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
        if (!text) return [];

        // Handle standard, nested, and specialized FormID formats
        const patterns = [
            /\[(?:<span[^>]*>)?([0-9A-Fa-f]{8})(?:<\/span>)?\]/g,  // Standard bracketed FormIDs
            /FormID:\s*(?:0x)?([0-9A-Fa-f]{8})/gi,                 // FormID: prefix format
            /FormId:\s*(?:0x)?([0-9A-Fa-f]{8})/gi,                 // Alternative FormId: prefix format
            /BaseForm:[^)]*FormId:\s*(?:0x)?([0-9A-Fa-f]{8})/gi    // Nested BaseForm FormIds
        ];

        const matches = new Set();  // Using Set to avoid duplicates
        
        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                matches.add(match[1].toUpperCase());
            }
        });

        Utils.debuggingLog(['extractFormIds', 'logSummary.js'], 
            `Extracted FormIDs from: "${text}"`, {
                foundIds: Array.from(matches),
                sourceText: text
            }
        );

        return Array.from(matches);
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
        if (!text) return false;
        
        // Convert to lowercase for consistent comparison
        const lowerText = text.toLowerCase();
        
        // Check for explicit FormType prefix
        if (lowerText.includes('formtype:')) {
            return true;
        }
        
        // Check for common form types with or without their numeric identifiers
        const formTypes = [
            'npc',
            'actorcharacter',
            'cell',
            'location'
        ];
        
        // Match form types whether they appear alone or with a number in parentheses
        return formTypes.some(type => 
            lowerText.startsWith(type) || 
            new RegExp(`^${type}\\s*\\([0-9]+\\)`, 'i').test(text)
        );
    },
};