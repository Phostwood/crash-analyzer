function hasNolvusUltra(crashLog) {
    // Convert crashLog to lower case
    crashLog = crashLog.toLowerCase();
    // List of plugins to check
    const plugins = [
        //FOUND IN REDUX: 'blubbopines_v3.esp',
        'treerific.esp',
        'dawn of skyrim.esp',
        'moretreesincities.esp'
    ];
    // Check if crashLog includes any of the plugins
    for (let plugin of plugins) {
        if (crashLog.includes(plugin)) {
            return true;
        }
    }
    return false;
}

function reduxOrUltraVariant(crashLog) {
    if (countPlugins(crashLog) > 2100) { //NOTE: probably can't reliably determine if less than 2100 plugins ... all of them might not have loaded?
        if (hasNolvusUltra(crashLog)) {
            return 'Ultra';
        } else {
            return 'Redux';
        }
    } else {
        return '???';
    }
}

function hasPhysics(crashLog) {
    // Convert crashLog to lower case
    crashLog = crashLog.toLowerCase();
    // List of physics-related plugins to check
    const physicsPlugins = [
        'kshairdosSMP.esp',
        'ursine armour hdt smp se.esp',
        '1nivwiccloaks_smp_patch.esp',
        'cloaks&capes_smp_patch.esp',
        'cloaks_smp_patch.esp'
    ];
    // Check if crashLog includes any of the physics plugins
    for (let plugin of physicsPlugins) {
        if (crashLog.includes(plugin)) {
            return true;
        }
    }
    return false;
}

function hasAlternateLeveling(crashLog) {
    // Convert crashLog to lower case
    crashLog = crashLog.toLowerCase();
    // List of Alternate Leveling plugins to check
    const alternateLevelingPlugins = [
        'experience.esl',
        'experience.esp',
        'staticskillleveling.esp'
    ];
    // Check if crashLog includes any of the Alternate Leveling plugins
    for (let plugin of alternateLevelingPlugins) {
        if (crashLog.includes(plugin)) {
            return true;
        }
    }
    return false;
}

function hasHardcoreMode(crashLog) {
    // Convert crashLog to lower case
    crashLog = crashLog.toLowerCase();
    // List of Hardcore Mode plugins to check
    const hardcoreModePlugins = [
        'skyrim revamped.esp',
        'the_sinister_seven.esp',
        'realistic ai detection 3 - lite.esp'
    ];
    // Check if crashLog includes any of the Hardcore Mode plugins
    for (let plugin of hardcoreModePlugins) {
        if (crashLog.includes(plugin)) {
            return true;
        }
    }
    return false;
}
function hasFantasyMode(crashLog) {
    crashLog = crashLog.toLowerCase();
    if (crashLog.includes('doublejump.esp')) {
        return true;
    }
    return false;
}

function hasSseFpsStabilizer(crashLog) {
    // Convert crashLog to lower case
    crashLog = crashLog.toLowerCase();
    // Check if crashLog includes ssefpsstabilizer.dll
    if (crashLog.includes('ssefpsstabilizer.dll')) {
        return true;
    }
    return false;
}

function hasPaidUpscaler(crashLog) {
    // Convert crashLog to lower case
    crashLog = crashLog.toLowerCase();
    // Check if crashLog includes indicators
    if (crashLog.includes('ffx_fsr2_api_x64.dll') || crashLog.includes('nvngx_dlssg.dll') || crashLog.includes('libxess.dll')) {
        return true;
    }
    return false;
}

function hasFSR3(crashLog) {
    // Convert crashLog to lower case
    crashLog = crashLog.toLowerCase();
    // Check if crashLog includes indicators
    if (crashLog.includes('nvngx_dlssg.dll')) {
        return true;
    }
    return false;
}

function countNullVoid(crashLog) {
    // Convert crashLog to lower case
    crashLog = crashLog.toLowerCase();
    // Count the number of times "null" or "void" appears in the crashLog
    const nullCount = (crashLog.match(/null/g) || []).length;
    const voidCount = (crashLog.match(/void/g) || []).length;
    return nullCount + voidCount;
}

function countPlugins(crashLog) {
    const gamePluginsCountRegex = /Game plugins \((\d+)\)\s*\{([\s\S]*?)}/;
    var gamePluginsCountMatch = crashLog.match(gamePluginsCountRegex);
    var gamePluginsCountSection = gamePluginsCountMatch ? gamePluginsCountMatch[1] : '0';
    const gamePluginsCount = parseInt(gamePluginsCountSection);
    //DEBUGGING: console.log('gamePluginsCountMatch:', gamePluginsCountMatch);
    //DEBUGGING: console.log('gamePluginsCount:', gamePluginsCount);
    return gamePluginsCount;
}



function getNonNolvusGamePlugins(crashLog) {
    return fetch('https://raw.githubusercontent.com/Phostwood/crash-analyzer/main/vanillaNolvusPlugins - Alphabetized.txt')
        .then(response => response.text())
        .then(data => {
            const vanillaNolvusPluginsLines = data.split('\n').map(line => line.trim());

            const gamePluginsRegex = /Game plugins \(\d+\)\s*\{([\s\S]*?)}/;
            var gamePluginsMatch = crashLog.match(gamePluginsRegex);
            var gamePluginsSection = gamePluginsMatch ? gamePluginsMatch[1] : '';

            const gamePluginsLines = gamePluginsSection.split('\n');

            const nonVanillaPlugins = [];

            gamePluginsLines.forEach(line => {
                if (line.includes(']')) {
                    const pluginName = line.substring(line.indexOf(']') + 1).trim();
                    if (!vanillaNolvusPluginsLines.includes(pluginName.toLowerCase())) {
                        nonVanillaPlugins.push(pluginName);
                    }
                }
            });

            nonVanillaPlugins.sort();

            return nonVanillaPlugins;
        })
        .catch(error => console.error(error));
}

function getMissingVanillaPlugins(crashLog) {
    return fetch('https://raw.githubusercontent.com/Phostwood/crash-analyzer/main/vanillaNolvusPlugins - Alphabetized.txt')
        .then(response => response.text())
        .then(data => {
            const vanillaNolvusPluginsLines = data.split('\n').map(line => line.trim().toLowerCase());

            const gamePluginsRegex = /Game plugins \(\d+\)\s*\{([\s\S]*?)}/;
            var gamePluginsMatch = crashLog.match(gamePluginsRegex);
            var gamePluginsSection = gamePluginsMatch ? gamePluginsMatch[1] : '';

            const gamePluginsLines = gamePluginsSection.split('\n').map(line => {
                if (line.includes(']')) {
                    return line.substring(line.indexOf(']') + 1).trim().toLowerCase();
                }
                return null;
            }).filter(Boolean);

            const missingVanillaPlugins = vanillaNolvusPluginsLines.filter(plugin => !gamePluginsLines.includes(plugin));

            return missingVanillaPlugins;
        })
        .catch(error => console.error(error));
}

function getNonNolvusModules(crashLog) {
    return fetch('https://raw.githubusercontent.com/Phostwood/crash-analyzer/main/vanillaNolvusModules.txt')
        .then(response => response.text())
        .then(data => {
            const vanillaNolvusModulesLines = data.split('\n').map(line => line.trim());

            const modulesRegex = /Modules\s*\{([\s\S]*?)}/;
            var modulesMatch = crashLog.match(modulesRegex);
            var modulesSection = modulesMatch ? modulesMatch[1] : '';

            const modulesLines = modulesSection.split('\n');

            const nonVanillaModules = [];

            modulesLines.forEach(line => {
                if (line.includes(':')) {
                    const moduleName = line.substring(0, line.indexOf(':')).trim();
                    if (!vanillaNolvusModulesLines.includes(moduleName.toLowerCase())) {
                        nonVanillaModules.push(moduleName);
                    }
                }
            });

            nonVanillaModules.sort();

            return nonVanillaModules;
        })
        .catch(error => console.error(error));
}

function getBadlyOrganizedNolvusPlugins(crashLog) {
    return fetch('https://raw.githubusercontent.com/Phostwood/crash-analyzer/main/vanillaNolvusPlugin-WithStableLocation.txt')
        .then(response => response.text())
        .then(data => {
            const vanillaNolvusPlugins = data.split('\n').map(line => line.trim().toLowerCase());

            const gamePluginsRegex = /Game plugins \(\d+\)\s*\{([\s\S]*?)}/;
            var gamePluginsMatch = crashLog.match(gamePluginsRegex);
            var gamePluginsSection = gamePluginsMatch ? gamePluginsMatch[1] : '';

            const pluginsInCrashLog = gamePluginsSection.split('\n');

            const vanillaPluginsInCrashLog = [];
            pluginsInCrashLog.forEach((line, index) => {
                if (line.includes(']')) {
                    const pluginName = line.substring(line.indexOf(']') + 1).trim();
                    if (vanillaNolvusPlugins.includes(pluginName.toLowerCase())) {
                        vanillaPluginsInCrashLog.push(pluginName);
                    }
                }
            });

            const badlyOrderedVanillaPluginsInCrashLog = [];
            vanillaPluginsInCrashLog.forEach((line, index) => {
                let pluginVanillaIndex = vanillaNolvusPlugins.indexOf(line.toLowerCase());
                let nextPluginInCrashLog = vanillaPluginsInCrashLog[index + 1];

                if (nextPluginInCrashLog) {
                    let nextPluginVanillaIndex = vanillaNolvusPlugins.indexOf(nextPluginInCrashLog.toLowerCase());

                    if (nextPluginVanillaIndex < pluginVanillaIndex) {
                        badlyOrderedVanillaPluginsInCrashLog.push(line);
                    }
                }
            });

            return badlyOrderedVanillaPluginsInCrashLog;
        })
        .catch(error => console.error(error));
}

function getNonNolvusGamePluginsBelowSynthesis(crashLog) {
    return fetch('https://raw.githubusercontent.com/Phostwood/crash-analyzer/main/vanillaNolvusPlugins - Alphabetized.txt')
        .then(response => response.text())
        .then(data => {
            const vanillaNolvusPluginsLines = data.split('\n').map(line => line.trim());
            const gamePluginsRegex = /Game plugins \(\d+\)\s*\{([\s\S]*?)}/;
            var gamePluginsMatch = crashLog.match(gamePluginsRegex);
            var gamePluginsSection = gamePluginsMatch ? gamePluginsMatch[1] : '';
            const gamePluginsLines = gamePluginsSection.split('\n');
            const nonVanillaPluginsAtBottom = [];
            let isBelowSynthesis = false;
            gamePluginsLines.forEach(line => {
                if (line.includes(']')) {
                    const pluginName = line.substring(line.indexOf(']') + 1).trim();
                    if (pluginName.toLowerCase() === 'synthesis.esp') {
                        isBelowSynthesis = true;
                    }
                    if (isBelowSynthesis && !vanillaNolvusPluginsLines.includes(pluginName.toLowerCase())) {
                        nonVanillaPluginsAtBottom.push(pluginName);
                    }
                }
            });
            //DISABLED: nonVanillaPlugins.sort();
            console.log('nonVanillaPluginsAtBottom:', nonVanillaPluginsAtBottom);
            return nonVanillaPluginsAtBottom;
        })
        .catch(error => console.error(error));
}

function compareLogToVanillaNolvusPluginsLines(crashLog) {
    Promise.all([
        fetch('https://raw.githubusercontent.com/Phostwood/crash-analyzer/main/vanillaNolvusPlugins.txt'),
        fetch('https://raw.githubusercontent.com/Phostwood/crash-analyzer/main/nonVanillaPlugins.txt')
    ])
        .then(responses => Promise.all(responses.map(response => response.text())))
        .then(data => {
            // Split the text into lines and trim and convert each line to lower case
            const vanillaNolvusPlugins = data[0].split('\n').map(line => line.trim());
            const nonVanillaPlugins = data[1].split('\n').map(line => line.trim().toLowerCase());

            // Extract the "Possible relevant objects" section
            const gamePluginsRegex = /Game plugins \(\d+\)\s*\{([\s\S]*?)}/;
            var gamePluginsMatch = crashLog.match(gamePluginsRegex);
            var gamePluginsSection = gamePluginsMatch ? gamePluginsMatch[1] : '';

            // Split the gamePluginsSection into an array of lines
            const pluginsInCrashLog = gamePluginsSection.split('\n');

            // Create an array to store the non-vanilla plugins
            const vanillaPluginsInCrashLog = [];
            const nonVanillaPluginsInCrashLog = [];
            const allPluginsInCrashLog = [];
            const possibleReduxPluginInCrashLog = [];
            const missingPluginsInCrashLog = [];

            pluginsInCrashLog.forEach((line, index) => {
                if (line.includes(']')) {
                    const pluginName = line.substring(line.indexOf(']') + 1).trim().toLowerCase();

                    allPluginsInCrashLog.push(pluginName); //TEMPORARY:

                    if (vanillaNolvusPlugins.includes(pluginName)) {
                        vanillaPluginsInCrashLog.push(pluginName);
                    } else {
                        nonVanillaPluginsInCrashLog.push(pluginName);
                    }
                } else {
                    // Handle the case where the line does not contain ']'
                    missingPluginsInCrashLog.push(line);
                    // Skip presuming it is an empty line ... probably the { or } line
                    //DEBUGGING: console.error('A line does not contain a plugin name:', line);
                }
            });

            const badlyOrderedVanillaPluginsInCrashLog = [];
            vanillaPluginsInCrashLog.forEach((line, index) => {
                let pluginVanillaIndex = vanillaNolvusPlugins.indexOf(line);
                let nextPluginInCrashLog = vanillaPluginsInCrashLog[index + 1];
                let nextPluginVanillaIndex = vanillaNolvusPlugins.indexOf(nextPluginInCrashLog);

                if (nextPluginInCrashLog && (nextPluginVanillaIndex < pluginVanillaIndex)) {
                    badlyOrderedVanillaPluginsInCrashLog.push(line);
                }
            });

            // Alphabetize the nonVanillaPlugins array
            //DEPENDS: nonVanillaPlugins.sort();

            // Convert the nonVanillaPlugins array to a string with new lines for every plugin
            const nonVanillaPluginsInCrashLogString = nonVanillaPluginsInCrashLog.join('\n');
            const allPluginsInCrashLogString = allPluginsInCrashLog.join('\n');

            // Log the nonVanillaPlugins string along with the count
            console.log(`Possibly non-vanilla plugins (${nonVanillaPluginsInCrashLog.length}):\n${nonVanillaPluginsInCrashLogString}`);
            //console.log(`All plugins (${allPluginsInCrashLog.length}):\n${allPluginsInCrashLogString}`);

            // Log the nonVanillaPlugins string along with the count
            console.log('possibleReduxPluginInCrashLog:', possibleReduxPluginInCrashLog);

            // Log the badlyOrderedVanillaPlugins
            console.log('Badly ordered vanilla plugins:', badlyOrderedVanillaPluginsInCrashLog);
            console.log('Presumably-empty lines in crash log:', missingPluginsInCrashLog);

        })
        .catch(error => console.error(error));
}

function compareLogToVanillaNolvusModulesLines(crashLog) {
    return fetch('https://raw.githubusercontent.com/Phostwood/crash-analyzer/main/vanillaNolvusModules.txt')
        .then(response => response.text())
        .then(data => {
            const vanillaNolvusModulesLines = data.split('\n').map(line => line.trim());

            // Extract the "Possible relevant objects" section
            const modulesRegex = /Modules\s*\{([\s\S]*?)}/;
            var modulesMatch = crashLog.match(modulesRegex);
            var modulesSection = modulesMatch ? modulesMatch[1] : '';

            // Split the modulesSection into lines
            const modulesLines = modulesSection.split('\n');

            // Create an array to store the non-vanilla Modules
            const nonVanillaModules = [];
            // const badlyOrderedVanillaModules = [];
            const possibleReduxFlags = [];

            // Loop through each line in modulesSection
            modulesLines.forEach((line, index) => {
                // Check if the line contains ':'
                if (line.includes(':')) {
                    // Split the line by ':' and take the first part, trim it and convert it to lower case
                    const moduleName = line.substring(0, line.indexOf(':')).trim().toLowerCase();

                    // If the moduleName is not found in vanillaNolvusModulesLines, add it to the nonVanillaModules array
                    if (!vanillaNolvusModulesLines.includes(moduleName)) {
                        nonVanillaModules.push(moduleName);
                    }
                    //  else {
                    // 	// Check if the next item in vanillaNolvusModulesLines isn't also after in modulesLines
                    // 	const nextVanillaModule = vanillaNolvusModulesLines[vanillaNolvusModulesLines.indexOf(moduleName) + 1];
                    // 	if (nextVanillaModule && !modulesLines.slice(index + 1).some(line => line.toLowerCase().includes(nextVanillaModule))) {
                    // 		badlyOrderedVanillaModules.push(moduleName);
                    // 	}
                    // }
                } else {
                    // Handle the case where the line does not contain ':'
                    console.error('A line does not contain a module name:', line);
                }
            });

            // Alphabetize the nonVanillaModules array
            //LATER: nonVanillaModules.sort();

            // Convert the nonVanillaModules array to a string with new lines for every module
            const nonVanillaModulesString = nonVanillaModules.join('\n');

            // Log the nonVanillaModules string along with the count
            console.log(`Possibly non-vanilla modules (${nonVanillaModules.length}):\n${nonVanillaModulesString}`);

            // Log the nonVanillaModules string along with the count
            console.log('possibleReduxFlags:', possibleReduxFlags);

            // Log the badlyOrderedVanillaModules
            //console.log('badlyOrderedVanillaModules:', badlyOrderedVanillaModules);
        })
        .catch(error => console.error(error));
}


function getPercentAlphabetized(passedLogFile) {
    // Extract the "Game plugins" section
    const pluginsRegex = /Game plugins \(\d+\)\s*\{[\s\S]*?\}/;
    var pluginsMatch = passedLogFile.match(pluginsRegex);
    var pluginsSection = pluginsMatch ? pluginsMatch[0] : '';

    // Split the section into lines and filter out non-.esp plugin lines
    var lines = pluginsSection.split('\n').filter(line => line.includes('.esp'));

    // Variables to count alphabetization issues
    var alphabetizedOrderCount = 0;
    var totalEspPlugins = lines.length - 1; // Subtract one because we compare each plugin to the next

    // Check if each .esp plugin is alphabetically ordered
    for (var i = 0; i < totalEspPlugins; i++) {
        // Extract plugin names without the bracketed index
        var currentPluginMatch = lines[i].match(/^\s*\[.*?\]\s*(.+\.esp)$/i);
        var nextPluginMatch = lines[i + 1].match(/^\s*\[.*?\]\s*(.+\.esp)$/i);

        if (currentPluginMatch && nextPluginMatch) {
            var currentPlugin = currentPluginMatch[1].toLowerCase().trim();
            var nextPlugin = nextPluginMatch[1].toLowerCase().trim();
            // Compare plugin names and count if alphabetized
            if (currentPlugin.localeCompare(nextPlugin) < 0) {
                alphabetizedOrderCount++;
                //DEBUGGING: console.log(currentPlugin + ' is alphabetized before ' + nextPlugin); //DEBUGGING
            }
        } else {
            // Handle the case where the line does not contain a .esp file name
            console.error('A line does not contain a .esp file name:', lines[i]); //DEBUGGING
        }
    }
    // Calculate the percentage of alphabetized .esp plugins
    var percentAlphabetized = (alphabetizedOrderCount / totalEspPlugins) * 100;
    //DEBUGGING console.log('percentAlphabetized:',percentAlphabetized); //DEBUGGING
    return percentAlphabetized.toFixed(2); // Return percentage rounded to two decimals
}

function extractNifPathsToListItems(logText) {
    const fileRegex = /"([^"]+\.nif)"/g;
    let match;
    const pathsSet = new Set();

    while ((match = fileRegex.exec(logText)) !== null) {
        pathsSet.add(match[1]);
    }

    // If no matches were found, add the no meshes found message to the set
    if (pathsSet.size === 0) {
        pathsSet.add('(no mesh files found in crash log ... consider decompressing relevant .bsa archives)');
    }

    const name1Regex = /BSTriShape\((Name: `[^`]+`)\)/g;
    const name2Regex = /\(BSTriShape\*\) -> \((Name: `[^`]+`)\)/g;

    // Check for names using the two regexes and add their group matches to the pathsSet
    while ((match = name1Regex.exec(logText)) !== null) {
        pathsSet.add(match[1]);
    }
    while ((match = name2Regex.exec(logText)) !== null) {
        pathsSet.add(match[1]);
    }

    // Convert the Set back to an array and process to list items
    return processListItems([...pathsSet]);
}

function extractSkyrimTexturePathsToListItems(logText) {
    const regex = /"([^"]+\.(dds|tga|bmp))"/g;
    let match;
    const pathsSet = new Set();

    while ((match = regex.exec(logText)) !== null) {
        pathsSet.add(match[1]);
    }

    // If no matches were found, add the no textures found message to the set
    if (pathsSet.size === 0) {
        pathsSet.add('(no textures found in crash log ... consider decompressing relevant .bsa archives)');
    }

    // Convert the Set back to an array and process to list items
    return processListItems([...pathsSet]);
}

function processListItems(listItems) {
    // Deduplicate the list before truncating
    const dedupedListItemsBeforeTruncate = [...new Set(listItems)];

    // Truncate each file name if over 300 characters
    const truncatedListItems = dedupedListItemsBeforeTruncate.map(itemName => {
        if (itemName.length > 300) {
            itemName = itemName.substring(0, 300) + '...';
        }
        return itemName;
    });

    // Deduplicate the list after truncating
    const dedupedListItemsAfterTruncate = [...new Set(truncatedListItems)];

    // Wrap each file name in HTML
    const wrappedListItems = dedupedListItemsAfterTruncate.map(itemName => {
        return '<li><code>' + itemName + '</code></li>';
    });

    // Add <ul> tags before the first <li> and after the last <li>
    return wrappedListItems.join('');
}






function replaceWithExplainers(fileList) {
    // Append the explanations to the items in fileList
    for (let i = 0; i < fileList.length; i++) {
        let lowerCaseFile = fileList[i].toLowerCase();
        if (explainersMap.has(lowerCaseFile)) {
            fileList[i] += ' ' + explainersMap.get(lowerCaseFile);
        }
    }

    return fileList;
}


// - - - Main Function - - - 
async function analyzeLog() {
    clearResult();
    var logFile = document.getElementById('crashLog').value;
    var diagnoses = '';
    var diagnosesCount = 0;

    //DISABLE UNLESS NEEDED: compareLogToVanillaNolvusPluginsLines(logFile);	
    //DISABLE UNLESS NEEDED: compareLogToVanillaNolvusModulesLines(logFile);	

    var logsFirstLine = logFile.split('\n')[0];
    var logsThirdLine = logFile.split('\n')[2];


    //logsTopQuarter contains heading, "Possible relevant objects", "Probable callstack" (but excludes "Registers" and the full "Stack")
    const logsTopQuarterRegex = /^([\s\S]*?Probable callstack\s*{[\s\S]*?})/;
    var logsTopQuarterMatch = logFile.match(logsTopQuarterRegex);
    var logsTopQuarter = logsTopQuarterMatch ? logsTopQuarterMatch[0] : '';
    if (!logsTopQuarter) {
        logsTopQuarter = logFile;
    }

    //logsTopThird contains heading, "Possible relevant objects", "Probable callstack", and "Registers" (but excludes the full "Stack")
    const logsTopThirdRegex = /^([\s\S]*?Registers\s*{[\s\S]*?})/;
    var logsTopThirdMatch = logFile.match(logsTopThirdRegex);
    var logsTopThird = logsTopThirdMatch ? logsTopThirdMatch[0] : '';
    if (!logsTopThird) {
        logsTopThird = logsTopQuarter;
    }

    //Extract the entire top "half" of the crash log (excluding "Modules", "Plugins", and "Game plugins" sections)
    const logsTopHalfRegex = /^([\s\S]*?Stack\s*{[\s\S]*?})/;
    var logsTopHalfMatch = logFile.match(logsTopHalfRegex);
    var logsTopHalf = logsTopHalfMatch ? logsTopHalfMatch[0] : '';
    if (!logsTopHalf) {
        logsTopHalf = logsTopThird;
    }

    //logsTopThirdNoHeading contains "Possible relevant objects", "Probable callstack", and "Registers"
    const logsTopThirdNoHeadingRegex = /(Possible relevant objects[\s\S]*)/;
    var logsTopThirdNoHeadingMatch = logsTopThird.match(logsTopThirdNoHeadingRegex);
    var logsTopThirdNoHeading = logsTopThirdNoHeadingMatch ? logsTopThirdNoHeadingMatch[0] : '';

    // Extract the "Possible relevant objects" section
    const relevantObjectsRegex = /Possible relevant objects \(\d+\)\s*\{[\s\S]*?\}/;
    var relevantObjectsMatch = logsTopQuarter.match(relevantObjectsRegex);
    var logsRelevantObjectsSection = relevantObjectsMatch ? relevantObjectsMatch[0] : '';

    // Extract the "Probable callstack" section
    const probableCallstackRegex = /Probable callstack\s*\{[\s\S]*?\}/;
    var probableCallstackMatch = logsTopQuarter.match(probableCallstackRegex);
    var logsProbableCallstackSection = probableCallstackMatch ? probableCallstackMatch[0] : '';

    // Extract the "Registers" section
    const registersRegex = /Registers\s*\{[\s\S]*?\}/;
    var registersMatch = logsTopThird.match(registersRegex);
    var logsRegistersSection = registersMatch ? registersMatch[0] : '';

    // Extract the "Stack" section
    const stackRegex = /Stack\s*\{[\s\S]*?\}/;
    var stackMatch = logsTopHalf.match(stackRegex);
    var logsStackSection = stackMatch ? stackMatch[0] : '';

    const logSectionsMap = new Map([
        [logsFirstLine, { priority: 1, color: 'red' }],
        [logsRelevantObjectsSection, { priority: 2, color: 'darkorange' }],
        [logsProbableCallstackSection, { priority: 3, color: 'gold' }],
        [logsRegistersSection, { priority: 4, color: 'dodgerblue' }],
        [logsStackSection, { priority: 5, color: 'blueviolet' }],
    ]);

    /* DEBUGGING: 
    console.log('--- --------- ---');
    console.log('--- DEBUGGING ---');
    console.log('--- --------- ---');
    console.log('logsFirstLine:' + logsFirstLine);
    console.log('logsThirdLine:' + logsThirdLine);
    console.log('logsRelevantObjectsSection:' + logsRelevantObjectsSection);
    console.log('logsProbableCallstackSection:' + logsProbableCallstackSection);
    console.log('logsRegistersSection:' + logsRegistersSection);
    console.log('logsStackSection:' + logsStackSection);
    console.log('logsTopQuarter:' + logsTopQuarter);
    console.log('logsTopThird:' + logsTopThird);
    console.log('logsTopThirdNoHeading:' + logsTopThirdNoHeading);
    console.log('logsTopHalf:' + logsTopHalf);
    console.log('--- ------------- ---');
    console.log('--- END DEBUGGING ---');
    console.log('--- ------------- ---');
    */

    // Verify NetScriptFramework
    if (!logsThirdLine.includes('NetScriptFramework')) {
        diagnoses += '<li>❌ <b>Incompatible Log File:</b> Unfortunately, this analyzer can only process logs from NetScriptFramework. If you are not using Nolvus, you will need to install the <a href="https://www.nexusmods.com/skyrimspecialedition/mods/21294">.NET Script Framework mod</a> to obtain compatible crash logs. If you\'re using Nolvus, you can find your compatible crash logs at <code>[YOUR_DRIVE]\\Nolvus\\Instances\\Nolvus Ascension\\MODS\\overwrite\\NetScriptFramework\\Crash</code></li>';
        diagnosesCount++;
    }

    // Verify NOT IOException type of crash log
    if (logsFirstLine.includes('Unhandled managed exception (IOException)')) {
        diagnoses += '<li>❌ <b>Incompatible IOException Log File:</b> Unfortunately, this analyzer cannot process crash logs that start with "Unhandled managed exception (IOException)". These types of logs are rare and currently unsupported.</li>';
        diagnosesCount++;
    }

    // Check for .STRINGS crash
    var R14StringsRegex = /R14.*\.STRINGS/; // Regular expression to match "R14" and ".STRINGS" on the same line
    if (R14StringsRegex.test(logsTopHalf)) {
        diagnoses += '<li>🎯 <b>.STRINGS Crash Detected:</b> Remove any unique character in your <b>skyrim.ini</b> file\'s <code>sLanguage=ENGLISH</code> line.  More information and troubleshooting tips under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-1">.STRINGS Crash</a/>.</li>';
        diagnosesCount++;
    }

    // Check for VRAMr Gorehowl crash (specific variant of D6DDDA crash)
    if (logsFirstLine.includes('D6DDDA') && logsRelevantObjectsSection.includes('Gorehowl')) {
        diagnoses += '<li>🎯 <b>VRAMr Gorehowl Crash Detected:</b> If you are using VRAMr, try temporarily disabling VRAMr\'s output mod to get past the "Night at the Museum" quest, and then re-enable afterwards. Alternately, delete the "clgorehowl" textures .dds image files. Or, just hide their VRAMr overrides in MO2. <code>NOTE: the VRAMr mod author fixed this issue in his April 19, 2024 version.</code></li>';
        diagnosesCount++;
    }

    // Check for JContainers crash
    if (logsFirstLine.includes('JContainers64.dll+10AE45')) {
        diagnoses += '<li>🎯 <b>JContainers Crash Detected:</b> Go to <a href="https://www.nexusmods.com/skyrimspecialedition/mods/108591?tab=files&file_id=458596">Discrepancy\'s patch settings hub</a> and add the <b>JContainers Crash Workaround</b> mod (from the "Files" section) into Mod Organizer 2 (MO2). If you would like guidance on modding/patching Nolvus, please watch this <a href="https://youtu.be/YOvug9KP5L4">brief tutorial video</a> for step-by-step instructions. More information and troubleshooting tips under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-4">JContainers Crash</a/>.</li>';
        diagnosesCount++;
    }

    // Check for Mihail Sithis crash
    if (logsTopHalf.includes('Wraith of Sithis') && logsTopHalf.includes('mihailmmasithis.esp')) {
        diagnoses += '<li>🎯 <b>Gravelord / "Wraith of Sithis" Crash Detected:</b> This crash is usually associated with MihailMods\' "Wraith of Sithis" conflicting with Odin - Skyrim Magic Overhaul, and may occur shortly after an encounter where a character or NPC summons a Wraith of Sithis. Despite the name, it is not directly related to Gravelords. To resolve this issue:</li>' +
            '<ul>' +
            '<li>Go to <a href="https://www.nexusmods.com/skyrimspecialedition/mods/108591">Discrepancy\'s patch settings hub</a> and download the <b>Odin and Gravelords Compatibility Patch</b>.</li>' +
            '<li>During installation for Nolvus Ascension version 5, select the option for the Gravelords Standalone version (mihailmmasithis.esp).</li>' +
            '<li>This patch can be safely installed mid-game.</li>' +
            '<li>Ensure the plugin is positioned above FNIS.esp. For a guide on modding/patching Nolvus, view this <a href="https://youtu.be/YOvug9KP5L4">tutorial video</a>.</li>' +
            '<li>Find more information and troubleshooting tips under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-8">Mihail Sithis Crash</a>.</li>' +
            '</ul>';
        diagnosesCount++; // Increment the count of diagnoses detected
    }


    // Check for A0D789 crash
    if (logsFirstLine.includes('(SkyrimSE.exe+A0D789)')) {
        diagnoses += '<li>🎯 <b>A0D789 Crash Detected:</b> Reload game and continue playing, or alternatively, add the <a href="https://www.patreon.com/posts/se-ae-69951525">[SE/AE]A0D789patch</a> patch by kingeric1992 into Mod Organizer (MO2). If you would like guidance on modding/patching Nolvus, please watch this <a href="https://youtu.be/YOvug9KP5L4">brief tutorial video</a> for step-by-step instructions. NOTE: this specific patch does NOT have a plugin that shows up in the right side of MO2. More information and troubleshooting tips under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-10">A0D789 Crash</a/>.</li>';
        diagnosesCount++;
    }

    // Check for USVFS crash
    if (logsProbableCallstackSection.toLowerCase().includes('usvfs_x64.dll')) {
        diagnoses += '<li>🎯 <b>USVFS Crash Detected:</b> An antivirus (most frequently, Webroot or Bitdefender) is blocking the MO2 file system. Either change your antivirus, or disable your antivirus, and/or create an exception for the entire Nolvus directory. More information and troubleshooting tips under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-12">USVFS Crash</a/>.</li>';
        diagnosesCount++;
    }
    // Check for Alphabetized Load Order crash
    var percentAlphabetized = getPercentAlphabetized(logFile);
    if (percentAlphabetized > 70) {
        diagnoses += '<li>🎯 <b>Alphabetized Load Order Detected:</b> This log file\'s .esp mods are ' + percentAlphabetized + '% alphabetized in their load order. Open the Nolvus Dashboard, click on "Manage" then "Instance". Once loaded, click on <b>"Apply Order"</b>. For more information and a screenshot, see this r/Nolvus post <a href="https://www.reddit.com/r/Nolvus/comments/1chuod0/how_to_apply_order_button_usage_in_the_nolvus/">How To: "Apply Order" button usage in the Nolvus Dashboard</a>. Also, if you have customized Nolvus with additional mods, review information on the <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-7">Load Order Crash</a>. ⚠️NOTE: Any added mods will be disabled and moved to the bottom of your list, so you\'ll have to manually re-order and re-enable those, but your vanilla Nolvus mods will be returned to their intended order.</li>';
        diagnosesCount++;
    }

    // Check for 12F4797 Physics crash
    if (logsFirstLine.toLowerCase().includes('12F4797'.toLowerCase()) && logsRelevantObjectsSection.toLowerCase().includes("NiCamera(Name: `WorldRoot Camera`)".toLowerCase()) && logsRelevantObjectsSection.toLowerCase().includes("BSMultiBoundRoom(Name: null)".toLowerCase())) {
        diagnoses += '<li>🎯 <b>12F4797 Physics Crash Detected:</b> This issue is commonly encountered in Ancestor Glade (or possibly from a recent save made from Ancestor Glade) and may be linked to having a large number of physics-enabled objects active at once, such as the player\'s own armor and hair. The <b>workaround</b> is to swap out these items for non-physics counterparts. Also, if your character or follower has physics enabled hair, you should wear a non-physics helmet to cover cover it up.</li>';
        diagnosesCount++;
    }

    // Check for Medal streaming software
    if (logFile.includes('medal-hook64.dll')) {
        diagnoses += '<li>🎯 <b>Medal Streaming Software Detected:</b> Medal streaming software has been frequently reported to cause issues with Nolvus, particularly severe graphical darkness/distortions and crashes to desktop (CTDs). These problems have reportedly been escalating with recent updates to Medal. To prevent these issues, we recommend the following actions: <ul><li>Disable Medal via its settings before running Nolvus.</li><li>If disabling does not work, terminate the Medal process using Windows Task Manager.</li><li>As a last resort, consider uninstalling Medal completely from your system.</li></ul></li>';
        diagnosesCount++; // Increment the count of diagnoses detected
    }

    //NVIDIA graphics driver
    if (logsFirstLine.toLowerCase().includes('nvwgf2umx.dll') || logsFirstLine.toLowerCase().includes('nvlddmkm.sys') || logsFirstLine.toLowerCase().includes('nvoglv32.dll') || logsFirstLine.toLowerCase().includes('nvoglv64.dll') || logsFirstLine.toLowerCase().includes('nvwgf2um.dll') || logsFirstLine.toLowerCase().includes('nvapi64.dll')) {
        diagnoses += '<li>🎯 <b>NVIDIA Driver Issue Detected:</b> The appearance of NVIDIA driver .dll files in the first line of your crash log is often associated with NVIDIA graphics driver issues. To resolve this, try the following steps:<ol>' +
            '<li><b>Update your NVIDIA drivers</b> to the latest version. You can download the latest drivers from the <a href="https://www.nvidia.com/Download/index.aspx">NVIDIA website</a>.</li>' +
            '<li>Check for any GPU overclocking settings that may be causing instability and reset them to default if necessary.</li>' +
            '<li>If the above does not resolve the issue, try performing a clean installation of the drivers using a tool like Display Driver Uninstaller (DDU) to remove all traces of the previous drivers before installing the new ones.</li>' +
            '</ol></li>';
        diagnosesCount++;
    }


    //SkyrimUpscaler crash
    // Files names from Puredark's Upscalers:
    // All three: SkyrimUpscaler.dll, nvngx_dlss.dll, PDPerfPlugin.dll
    // Free version: (nothing else added besides those shared by all three (see above))
    // V11 adds: XeFX_Loader.dll, ffx_fsr2_api_dx12_x64.dll, ffx_fsr2_api_x64.dll, igxess.dll, libxess.dll, XeFX.dll
    // V12 adds: ffx_fsr2_api_x64.dll, ffx_fsr2_api_dx11_x64.dll, libxess.dll
    // FSR3 version for RTX 40xx series has:  nvngx_dlssg.dll, nvngx_dlss.dll, ("All three" above?), (more ???)
    // NOTE: apparently not all of the above show up in crash logs, but I'm listing them here for reference
    if (logsFirstLine.toLowerCase().includes('nvngx_dlss.dll') || logsFirstLine.toLowerCase().includes('PDPerfPlugin.dll'.toLowerCase()) || logsFirstLine.toLowerCase().includes('SkyrimUpscaler.dll'.toLowerCase())) {
        diagnoses += '<li>🎯 <b>Upscaler Issue Detected:</b> The appearance of ‘SkyrimUpscaler.dll,’ ‘PDPerfPlugin.dll,’ or ‘nvngx_dlss.dll’ in the first line of your crash log is often associated with NVIDIA graphics drivers and/or Puredark’s upscalers. To resolve this, try the following steps:<ol>' +
            '<li><b>Update your NVIDIA drivers</b> to the latest version. You can download the latest drivers from the <a href="https://www.nvidia.com/Download/index.aspx">NVIDIA website</a>.</li>' +
            '<li>If you are using one of Puredark\'s <a href="https://www.patreon.com/collection/50002?view=expanded">paid FSR2 or FSR3 Upscalers</a> (rather than his free FSR2 version included with Nolvus): <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            '<li><b>Check hardware compatibility:</b> This issue may also arise due to incompatible hardware (e.g., AMD instead of NVIDIA, GTX instead of RTX, RTX non-40xx instead of RTX 40xx).</li>' +
            '<li><b>Review settings:</b> Ensure that you follow the recommended settings in the <a href="https://docs.google.com/document/d/1YVFKcJN2xuvhln9B6vablzOzQu-iKC4EDcbjOW-SEsA/edit?usp=sharing">Nolvus DLSS Upscaler Installation Guide</a>. Confirm that you have the correct version and settings for your graphics card.</li>' +
            '</ul></li>' +
            '<li>Check for any GPU overclocking settings that may be causing instability and reset them to default if necessary.</li>' +
            '<li>If the above does not resolve the issue, optionally try performing a clean installation of the drivers using a tool like Display Driver Uninstaller (DDU) to remove all traces of the previous drivers before installing the new ones.</li>' +
            '<li>Alternatively, disable the upscaler and opt for TAA (Temporal Anti-Aliasing), as demonstrated on the website under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-11">PDPerfPlugin Crash</a/>.</li>' +
            '<li>If issue persists, share your crash logs with <a href="https://www.reddit.com/r/Nolvus/">r/Nolvus</a> and/or the <a href="https://discord.gg/Zkh5PwD">Nolvus Discord</a></li>' +
            '</ol></li>';
        diagnosesCount++;
    }

    //Paid FSR3 Upscaler
    if (logsFirstLine.toLowerCase().includes('nvngx_dlssg.dll')) {
        diagnoses += '<li>🎯 <b>Paid FSR3 Upscaler Issue Detected:</b> Having the "nvngx_dlssg.dll" error showing up in the first line of your crash log is frequently linked to NVIDIA graphics drivers and/or Puredark\'s paid upsclaler (FG Build Alpha 03 and later). To resolve this, try the following steps:<ol>' +
            '<li><b>Update your NVIDIA drivers</b> to the latest version. You can download the latest drivers from the <a href="https://www.nvidia.com/Download/index.aspx">NVIDIA website</a>.</li>' +
            '<li><b>Incompatible settings in the upscaler:</b> Choosing a bad upscale type or other setting can cause this issue. Review and verify the recommended settings in <a href="https://docs.google.com/document/d/1YVFKcJN2xuvhln9B6vablzOzQu-iKC4EDcbjOW-SEsA/edit?usp=sharing">Nolvus DLSS Upscaler Installation Guide</a>.</li>' +
            '<li><b>Incompatible hardware:</b> This issue can also be caused by incompatible hardware (AMD instead of NVIDIA, GTX instead of RTX, RTX non-40xx intead of  RTX 40xx, and so on).</li>' +
            '<li>Check for any GPU overclocking settings that may be causing instability and reset them to default if necessary.</li>' +
            '<li>If the above does not resolve the issue, try performing a clean installation of the drivers using a tool like Display Driver Uninstaller (DDU) to remove all traces of the previous drivers before installing the new ones.</li>' +
            '</ol></li>';
        diagnosesCount++;
    }

    // Check for KERNELBASE JSON Crash
    if (logsFirstLine.toLowerCase().includes('KERNELBASE.dll'.toLowerCase()) && logsTopHalf.includes('json.exception.parse_error')) {
        diagnoses += '<li>🎯<b>KERNELBASE JSON Crash Detected:</b> Usually, this issue stems from one of three causes:<ol>' +
            '<li>Windows <b>permissions</b> have become overly restrictive and are blocking access to necessary mod storage. The usual solution is to reset your file permissions. See <a href="https://www.thewindowsclub.com/how-to-reset-file-folder-permissions-to-default-in-windows-10">How to reset all User Permissions to default in Windows 11/10</a>, or seek assistance from the Nolvus community.' +
            '<li>Storage files (.json files) have become <b>corrupted/broken.</b> This is especially common if you have manually edited a .json file. After identifying the specific file, either manually repair it, revert the file to a backup, or delete it, allowing the accessing mod(s) to create a new one. Other mods mentioned in the crash log may help to identify the specific storage file, or seek assistance from the Nolvus community.' +
            '<li>Overwriting or reinstalling <b>SSE Engine Fixes</b> can cause the <code>MaxStdio</code> value to be set too low, which can lead to crashes in Nolvus. For example, an individual who reinstalled papermaps found that it reset their SSE Engine Fixes values. To fix this:<ol>' +
            '<li>Open Mod Organizer 2 (MO2).</li>' +
            '<li>In the "1.2 BUG FIXES & TWEAKS" section, right-click on "SSE Engine Fixes" and select "Information...".</li>' +
            '<li>Click on the "Textfiles" tab.</li>' +
            '<li>Find and open the file <code>EngineFixes.toml</code>.</li>' +
            '<li>Locate the line <code>MaxStdio =</code> and restore the value to:  <code>MaxStdio = 8192</code>.</li>' +
            '<li>Click "Close" and "Yes" to save the changes.</li>' +
            '</ol></li>' +
            '</ol>' +
            'For the first two issues, an easy <b>workaround</b> is to <a href = "https://support.microsoft.com/en-us/windows/create-a-local-user-or-administrator-account-in-windows-20de74e0-ac7f-3502-a866-32915af2a34d#WindowsVersion=Windows_11">create a new Windows User</a> and create a new Nolvus save (playthrough) from the new user.</li>';
        diagnosesCount++;
    }

    // Check for KERNELBASE JContainers Crash
    if (logsFirstLine.toLowerCase().includes('KERNELBASE.dll'.toLowerCase()) && logsProbableCallstackSection.includes('JContainers64.dll')) {
        diagnoses += '<li>🎯<b>KERNELBASE JContainers Crash Detected:</b> Usually, this issue stems from one of three causes:<ol>' +
            '<li>JContainers may need patched. Go to <a href="https://www.nexusmods.com/skyrimspecialedition/mods/108591?tab=files&file_id=458596">Discrepancy\'s patch settings hub</a> and add the <b>JContainers Crash Workaround</b> mod (from the "Files" section) into Mod Organizer 2 (MO2). If you would like guidance on modding/patching Nolvus, please watch this <a href="https://youtu.be/YOvug9KP5L4">brief tutorial video</a> for step-by-step instructions.</li>' +
            '<li>Windows <b>permissions</b> may have become overly restrictive and are blocking access to necessary mod storage. The usual solution is to reset your file permissions. See <a href="https://www.thewindowsclub.com/how-to-reset-file-folder-permissions-to-default-in-windows-10">How to reset all User Permissions to default in Windows 11/10</a>, or seek assistance from the Nolvus community.</li>' +
            '<li>Storage files (JContainer\'s .json files) may have become <b>corrupted/broken.</b> These files often reside in your `..\\Documents\\My Games\\Skyrim Special Edition\\JCUser` folder, but can be located in mod-specific locations. This issue is especially common if you have manually edited a .json file. After identifying the specific file, either manually repair it, revert the file to a backup, or delete it, allowing the accessing mod(s) to create a new one. Other mods mentioned in the crash log may help to identify the specific storage file, or seek assistance from the Nolvus community.</li>' +
            '</ol>' +
            'Also, for some of these issues, an easy <b>workaround</b> is to <a href = "https://support.microsoft.com/en-us/windows/create-a-local-user-or-administrator-account-in-windows-20de74e0-ac7f-3502-a866-32915af2a34d#WindowsVersion=Windows_11">create a new Windows User</a> and create a new Nolvus save (playthrough) from the new user.</li>';
        diagnosesCount++;
    }

    // Check for KERNELBASE Crash excluding JContainers and JSON parse error
    if (logsFirstLine.toLowerCase().includes('KERNELBASE.dll'.toLowerCase()) && !logsProbableCallstackSection.includes('JContainers64.dll') && !logsTopHalf.includes('json.exception.parse_error')) {
        diagnoses += '<li>❗<b>KERNELBASE Crash Detected:</b> This rare issue could be related to a specific added mod, or to hardware or a system-wide issue. Here are some steps you can take:<ol>' +
            '<li>Check the <b>Windows Event Log</b> for any related issues. You can do this by opening the Event Viewer (search for it in the Start Menu), then navigate to Windows Logs > Application. Look for any recent errors that might be related to your issue. For detailed instructions, see this <a href="https://support.microsoft.com/en-us/windows/open-event-viewer-17d427d2-43d6-5e01-8535-1fc570ea8a14">Microsoft guide</a>.</li>' +
            '<li>If the issue persists, consider reaching out to the <b>Nolvus Discord</b> for additional help.</li>' +
            '</ol></li>';
        diagnosesCount++;
    }


    // Check for D6DDDA crash
    if (logsFirstLine.toLowerCase().includes('D6DDDA'.toLowerCase())) {
        diagnoses += '<li>❗<b>D6DDDA Crash Detected:</b> This may occur when either RAM or VRAM has been exceeded, or due to broken/corrupt meshes (.nif) or textures (.dds). Here are some steps to address this:<ul>' +
            '<li>Close any unnecessary applications to free up memory.</li>' +
            '<li>Verify that you have correctly <a href="https://www.nolvus.net/appendix/pagefile">set your Windows Pagefile Size</a>.</li>' +
            '<li>If your PC has less than 12GB of VRAM (<a href="https://www.lifewire.com/how-to-check-vram-5235783">how to check</a>), consider running your load order through <a href="https://www.reddit.com/r/Nolvus/comments/1doakj1/psa_use_vramr_if_you_have_12gb_of_vram/">VRAMr</a>.</li>' +
            '<li>If you are playing vanilla Nolvus and this issue persists, it could (rarely) indicate hardware issues.</li>' +
            '</ul>' +
            'For more information and troubleshooting tips, see the <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-2">D6DDDA Crash</a> section and the second instance of this test in the "Advanced Users" section of this analyzer.</li>';
        diagnosesCount++;
    }

    // Check for Shadow Scene Node crash
    if (logsProbableCallstackSection.toLowerCase().includes('BSCullingProcess::unk_D51280+78'.toLowerCase()) && logsFirstLine.includes('(SkyrimSE.exe+12FDD00)')) {
        diagnoses += '<li>❗<b>Shadow Scene Node Crash Detected:</b> Load an earlier save, traveling to a different cell from the original crash, and play for a few days in game away from the area. This avoids the Shadow Scene, and hopefully allows the issue to resolve itself. More information and troubleshooting tips under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-3">Shadow Scene Node crash</a/>.</li>';
        diagnosesCount++;
    }

    //TODO: Custom mod found in Probable Callstack:  In customized you’ll likely find that there will be many direct mod related crashes which will list themselves. Most of the time it’s as simple as disabling or adjusting the load order of referenced mod

    // Check for Skeleton crash
    var skeletonRegex = /NPC L UpperarmTwist|NPC R UpperarmTwist|skeleton\.nif|skeleton_female\.nif|NPC L Forearm|NPC R Forearm|bisection|NPC SpineX|NPC L Heel|NPC R Heel|NPC L Foot|NPC R Foot|SaddleBone|NPC L Hand|NPC R Hand|NPC L Finger|NPC R Finger/g;
    var skeletonMatches = logsRelevantObjectsSection.match(skeletonRegex) || [];
    if (skeletonMatches.length > 0) {
        diagnoses += '<li>❓<b>Possible Skeleton Issue:</b> Detected ' + skeletonMatches.length + ' potential indicators(s). Multiple indicators are more likely to be the cause than just one. Restarting may help if you\'re using vanilla Nolvus. For custom mods, verify your load order. Skeleton Issues are frequently NOT the crash culprit when other issues are present. More information and troubleshooting tips under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-9">Skeleton Crash</a/> and <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-7">Load Order Crash</a>.</li>';
        diagnosesCount++;
    }

    // Check for Shadowrend crash
    if (logsRelevantObjectsSection.toLowerCase().includes('ccbgssse018-shadowrend.esl')) {
        diagnoses += '<li>❓<b>Possible Shadowrend Issue:</b> Try loading an earlier save and avoid the crash area for a few days. <b>Be cautious</b> when loading a save that previously experienced the Shadowrend crash. Continuing to play on such a save might compound the issue, leading to more frequent crashes. For custom mods, verify your load order. Shadowrend is frequently NOT the crash culprit when other issues are present. More information and troubleshooting tips under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-6">Shadowrend Crash</a/> and <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-7">Load Order Crash</a>.</li>';
        diagnosesCount++;
    }

    // Antivirus Warning
    let foundAntivirus = '';
    for (const [antivirus, dlls] of Object.entries(antivirusSignatures)) {
        if (dlls.some(dll => logFile.toLowerCase().includes(dll))) {
            foundAntivirus = antivirus;
            break;
        }
    }

    if (foundAntivirus) {
        diagnoses += `<li>⚠️<b>Antivirus Warning:</b> <code>${foundAntivirus}</code> antivirus detected. Third-party antivirus software is a frequent contributor to crashes in heavily-modded Skyrim. Consider adding Nolvus/Skyrim to your antivirus exclusions and/or switching to the built-in Windows Defender for better compatibility.</li>`;
        diagnosesCount++;
    } else {
        // Check for Windows Defender in logsTopHalf if no other antivirus found
        const windowsDefenderDlls = ['mpsvc.dll', 'mpclient.dll'];
        if (windowsDefenderDlls.some(dll => logsTopHalf.toLowerCase().includes(dll))) {
            diagnoses += `<li>⚠️<b>Antivirus Info:</b> Windows Defender detected in the top half of your crash log (above the Modules section). Windows Defender is typically not a problem for Skyrim, but if you're experiencing issues, you might consider adding exclusions for Nolvus/Skyrim.</li>`;
            diagnosesCount++;
        }
    }

    //Overlays Warning
    let overlayFiles = [];
    let overlayRegex = /\b(?!discordhook64|overwolf|raptr64|fraps|nv_ags|gameoverlayrenderer64|rtsshdrs64|dxgi)\w+overlay\w+\.dll\b/i;
    let match = logsTopHalf.match(overlayRegex);
    if (match) overlayFiles.push(match[0]);

    if (logFile.toLowerCase().includes('discordhook64.dll')) overlayFiles.push('Discord');
    if (logFile.toLowerCase().includes('overwolf.dll')) overlayFiles.push('Overwolf');
    if (logFile.toLowerCase().includes('raptr64.dll')) overlayFiles.push('Raptr');
    if (logFile.toLowerCase().includes('fraps.dll')) overlayFiles.push('Fraps');
    if (logFile.toLowerCase().includes('nv_ags.dll')) overlayFiles.push('NVIDIA GeForce Experience');
    if (logsTopHalf.toLowerCase().includes('gameoverlayrenderer64.dll')) overlayFiles.push('Steam');
    if (logFile.toLowerCase().includes('rtsshdrs64.dll')) overlayFiles.push('RivaTuner Statistics Server');
    if (logFile.toLowerCase().includes('msiafterburner.dll')) overlayFiles.push('MSI Afterburner');

    if (overlayFiles.length > 0) {
        diagnoses += '<li>⚠️<b>Overlay Warning:</b> Overlays detected. While some are generally considered safe, others may cause issues in heavily-modded Skyrim. It\'s best to try disabling all overlays temporarily to ensure they aren\'t contributing to your crash.<ul>' +
            '<li>List of detected overlays: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            overlayFiles.map(file => `<li>${file}</li>`).join('') +
            '</ul></li></ul></li>';
        diagnosesCount++;
    }

    // Default to unknown crash
    if (diagnoses == '') {
        diagnoses = '<li>❓<b>No recognized crash pattern detected.</b> If you aren\'t aware of (and diligently following) <b>Jerilith\'s Safe Save Guide</b>, review it at <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-5">Save Bloat Crash</a/>. Also, if you have customized Nolvus with additional mods, review information on the <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-7">Load Order Crash</a>. The Crash Analyzer\'s "Advanced Users" section contains additional crash types and insights that may help isolate this issue. If the problem persists, share your crash logs with <a href="https://www.reddit.com/r/Nolvus/">r/Nolvus</a> and/or the <a href="https://discord.gg/Zkh5PwD">Nolvus Discord</a>.</li>';
        //DON'T COUNT: diagnosesCount++;
    }

    console.log('Diagnoses:', diagnosesCount);


    // - - - Speculative Insights - - -
    // Rechecks of some of the above crash tests, just include mostly-AI-generated descriptions
    //(some tests weren't rechecked if they had an easy defitive solution, or if the AI didn't generate a good alternative description.
    // Some checks were inspired by work from sea (no code was used nor were any descriptions directly copied)
    // Acknowledgment:
    // Special thanks to "sea" for the diligent collection of crash identifiers and descriptions that were very helpful in the development of these speculative insights.
    // Created: 2023.04.22 by Sephrajin aka sri-arjuna aka (sea)
    // Licence: GPLv2
    // Source code: https://github.com/sri-arjuna/SSE-CLA
    // Nexus Mod page: https://www.nexusmods.com/skyrimspecialedition/mods/89860




    var insights = '';
    var insightsCount = 0;
    var isVanillaNolvus = false;
    //UNUSED? var isVanillaNolvusHtml = '';


    if (countPlugins(logFile) > 1) {
        var nonNolvusGamePluginsHtml = '';
        async function getNonNolvusGamePluginsHtml(logFile) {
            var outHtml = '';
            try {
                var nonVanillaPlugins = await getNonNolvusGamePlugins(logFile);
                nonVanillaPlugins = replaceWithExplainers(nonVanillaPlugins);
                if (nonVanillaPlugins.length > 0) {
                    outHtml += '<details><summary>🔎 Non-Vanilla Nolvus Plugins Detected (<code>' + nonVanillaPlugins.length + '</code>):<br><code>(click to expand/collapse full list)</code></summary><ul>';
                    for (let plugin of nonVanillaPlugins) {
                        outHtml += '<li><code>' + plugin + '</code></li>';
                    }
                    outHtml += '</ul></details>';

                    //Set the flag below the text area field
                    document.getElementById('fileFlags').style.textAlign = "right";
                    if (nonVanillaPlugins.length > 50) {
                        document.getElementById('fileFlags').innerHTML = `<span style="float: right; white-space: nowrap;">🔧 <code>Customized (<span style="color: red;">${nonVanillaPlugins.length}</span>)<code></span><br>`;
                    } else {
                        document.getElementById('fileFlags').innerHTML = `<span style="float: right; white-space: nowrap;">🔧 <code>Customized (${nonVanillaPlugins.length})<code></span><br>`;
                    }
                } else {
                    document.getElementById('fileFlags').style.textAlign = "left";
                    document.getElementById('fileFlags').innerHTML = '';
                }
                console.log('nonVanillaPlugins:', nonVanillaPlugins);  //DEBUGGING:
            } catch (error) {
                console.error(error);
            }
            return outHtml;
        }

        try {
            var nonNolvusGamePluginsHtml = await getNonNolvusGamePluginsHtml(logFile);
            if (nonNolvusGamePluginsHtml.length > 0) {
                isVanillaNolvus = false;
                insightsCount++;
                //isVanillaNolvusHtml = '<span style="display: block; text-align: right;"></span><br>';
            } else {
                nonNolvusGamePluginsHtml += '<details><summary>✅ Only Vanilla Nolvus Plugins Detected</summary></details>';
                isVanillaNolvus = true;
            }
        } catch (error) {
            console.error(error);
        }

        insights += nonNolvusGamePluginsHtml;



        var nonNolvusModulesHtml = '';
        async function getNonNolvusModulesHtml(logFile) {
            var outHtml = '';
            try {
                var nonVanillaModules = await getNonNolvusModules(logFile);
                nonVanillaModules = replaceWithExplainers(nonVanillaModules);
                if (nonVanillaModules.length > 0) {
                    outHtml += '<details><summary>🔎 Non-Vanilla Nolvus Modules Detected (<code>' + nonVanillaModules.length + '</code>):<br><code>(click to expand/collapse full list)</code></summary><ul>';
                    for (let module of nonVanillaModules) {
                        outHtml += '<li><code>' + module + '</code></li>';
                    }
                    outHtml += '</ul></details>';
                }
                console.log('nonVanillaModules:', nonVanillaModules);  //DEBUGGING:
            } catch (error) {
                console.error(error);
            }
            return outHtml;
        }

        try {
            var nonNolvusModulesHtml = await getNonNolvusModulesHtml(logFile);
            if (nonNolvusModulesHtml.length > 0) {
                //isVanillaNolvus = false;
                insightsCount++;
                //isVanillaNolvusHtml = '<span style="display: block; text-align: right;"></span><br>';
            } else {
                nonNolvusModulesHtml += '<details><summary>✅ Only Vanilla Nolvus Modules Detected</summary></details>';
                //isVanillaNolvus = true;
            }
        } catch (error) {
            console.error(error);
        }

        insights += nonNolvusModulesHtml;

        var nonNolvusGamePluginsBelowSynthesisHtml = '';
        var hasNonNolvusPluginsAtBottom = false;
        var countNonNolvusPluginsAtBottom = 0;
        async function getNonNolvusGamePluginsBelowSynthesisHtml(logFile) {
            var outHtml = '';
            try {
                var nonNolvusPluginsAtBottom = await getNonNolvusGamePluginsBelowSynthesis(logFile);
                nonNolvusPluginsAtBottom = replaceWithExplainers(nonNolvusPluginsAtBottom);
                countNonNolvusPluginsAtBottom = nonNolvusPluginsAtBottom.length;
                if (countNonNolvusPluginsAtBottom > 0) {
                    outHtml += '<details><summary>🔎 Non-Nolvus Plugins Detected at Bottom (<code>' + countNonNolvusPluginsAtBottom + '</code>):<br><code>(click to expand/collapse full list)</code></summary> This list identifies non-Nolvus plugins from your game\'s crash log that are loading below <code>synthesis.esp</code>, and thus might be out of their intended load order. Typically, non-Nolvus plugins should be placed above <code>FNIS.esp</code>, but it seems this is not the case here. Please ensure these plugins are positioned as intended.<ul>';
                    for (let plugin of nonNolvusPluginsAtBottom) {
                        outHtml += '<li><code>' + plugin + '</code></li>';
                    }
                    outHtml += '</ul></details>';
                    hasNonNolvusPluginsAtBottom = true;
                } else {
                    outHtml += '<details><summary>✅ No non-Nolvus Plugins at Bottom</summary></details>';
                    hasNonNolvusPluginsAtBottom = false;
                }
                console.log('nonNolvusPluginsAtBottom:', nonNolvusPluginsAtBottom);  //DEBUGGING:
            } catch (error) {
                console.error(error);
            }
            return outHtml;
        }

        try {
            var nonNolvusGamePluginsBelowSynthesisHtml = await getNonNolvusGamePluginsBelowSynthesisHtml(logFile);
            if (nonNolvusGamePluginsBelowSynthesisHtml.length > 0) {
                insightsCount++;
            }
        } catch (error) {
            console.error(error);
        }

        insights += nonNolvusGamePluginsBelowSynthesisHtml;
    }


    var missingVanillaPluginsHtml = '';
    async function getMissingVanillaPluginsHtml(logFile) {
        var outHtml = '';
        try {
            var missingPlugins = await getMissingVanillaPlugins(logFile);
            missingPlugins = replaceWithExplainers(missingPlugins);
            if (missingPlugins.length > 0) {
                outHtml += '<details><summary>🔎 Potentially Missing Vanilla Plugins (<code>' + missingPlugins.length + '</code>):<br><code>(click to expand/collapse full list)</code></summary> NOTE: Every Nolvus configuration is likely to be missing  at least a few dozen plugins, which are only installed for specific configurations. It appears that even vanilla configurations will likely be missing anywhere from 50 to over 100 plugins. A vanilla install of the Redux variant can be missing over 200 plugins. Moreover, some crashes won’t include most of the installed plugins in the log file, leading to a list where most, if not all, the vanilla plugins appear as missing. Nonetheless, if you suspect that an important plugin may be missing, this is the place to verify.<ul>';
                for (let plugin of missingPlugins) {
                    outHtml += '<li><code>' + plugin + '</code></li>';
                }
                outHtml += '</ul></details>';
            } else {
                outHtml += '<details><summary>✅ No Missing Vanilla Plugins Detected</summary></details>';
                hasBadlyOrganizedNolvusPlugins = false;
            }
            console.log('missingPlugins:', missingPlugins);  //DEBUGGING:
        } catch (error) {
            console.error(error);
        }
        return outHtml;
    }

    try {
        var missingVanillaPluginsHtml = await getMissingVanillaPluginsHtml(logFile);
        if (missingVanillaPluginsHtml.length > 0) {
            insightsCount++;
        }
    } catch (error) {
        console.error(error);
    }

    insights += missingVanillaPluginsHtml;




    if (countPlugins(logFile) > 1) {
        var badlyOrderedVanillaPlugins = '';
        var badlyOrganizedNolvusPluginsHtml = '';
        var hasBadlyOrganizedNolvusPlugins = false;
        var countBadlyOrganizedNolvusPlugins = 0;
        async function getBadlyOrganizedNolvusPluginsHtml(logFile) {
            var outHtml = '';
            try {
                badlyOrderedVanillaPlugins = await getBadlyOrganizedNolvusPlugins(logFile);
                badlyOrderedVanillaPlugins = replaceWithExplainers(badlyOrderedVanillaPlugins);
                countBadlyOrganizedNolvusPlugins = badlyOrderedVanillaPlugins.length;
                if (countBadlyOrganizedNolvusPlugins > 0) {
                    outHtml += '<details><summary>🔎 Possibly Misordered Vanilla Nolvus Plugins (<code>' + badlyOrderedVanillaPlugins.length + '</code>):<br><code>(click to expand/collapse full list)</code></summary> This list identifies Nolvus plugins from your game\'s crash log that may be out of their standard order. It compares the order of plugins in your crash log with the standard order of vanilla Nolvus plugins. The plugins in the list are those that seem to be out of order, which could potentially lead to game crashes. Returning these plugins to their original order may help improve game stability. NOTE: A few may shift slightly with different vanilla configurations.<ul>';
                    for (let plugin of badlyOrderedVanillaPlugins) {
                        outHtml += '<li><code>' + plugin + '</code></li>';
                    }
                    outHtml += '</ul></details>';
                    hasBadlyOrganizedNolvusPlugins = true;
                } else {
                    outHtml += '<details><summary>✅ All Vanilla Nolvus Plugins are Well Ordered</summary></details>';
                    hasBadlyOrganizedNolvusPlugins = false;
                }
                console.log('badlyOrderedVanillaPlugins:', badlyOrderedVanillaPlugins);  //DEBUGGING:
            } catch (error) {
                console.error(error);
            }
            return outHtml;
        }

        try {
            var badlyOrganizedNolvusPluginsHtml = await getBadlyOrganizedNolvusPluginsHtml(logFile);
            if (badlyOrganizedNolvusPluginsHtml.length > 0) {
                insightsCount++;
            }
        } catch (error) {
            console.error(error);
        }

        insights += badlyOrganizedNolvusPluginsHtml;
    }







    insights += '<h5>Log Summary:</h5><ul>';

    if (countPlugins(logFile) > 2000) { //TODO: refine this number up?  //NOTE: this report can't be accurate unless plugins have been reported in the log file
        insights += '<li>🔎 <b>Log Insights:</b> (not 100% accurate)<ul>' +
            '<li>Vanilla or Customized: <code><b>' + (isVanillaNolvus ? 'vanilla' : 'customized') + '</b></code></li>' +
            '<li>Nolvus Variant: <code><b>' + reduxOrUltraVariant(logFile) + '</b></code></li>' +
            '<li>Advanced Physics: <code>' + hasPhysics(logFile) + '</code></li>' +
            '<li>Hardcore Mode: <code>' + hasHardcoreMode(logFile) + '</code></li>' +
            '<li>Fantasy Mode: <code>' + hasFantasyMode(logFile) + '</code></li>' +
            '<li>Alternate Leveling: <code>' + hasAlternateLeveling(logFile) + '</code></li>' +
            '<li>SSE FPS Stabilizer: <code>' + hasSseFpsStabilizer(logFile) + '</code></li>' +
            '<li>Paid Upscaler: <code>' + hasPaidUpscaler(logFile) + '</code></li>' +
            '<li>FSR3: <code>' + hasFSR3(logFile) + '</code></li>' +
            '<li>Occurrences of NULL and void: <code>' + countNullVoid(logsTopHalf) + ' (probably meaningless?)</code></li>' +
            '</ul>';
    }

    // Define the sections to count lines in
    const sections = [
        { name: 'Possible relevant objects', min: 0, max: 50 },
        { name: 'Probable callstack', min: 0, max: 500 },
        { name: 'Registers', min: 0, max: 500 },
        { name: 'Stack', min: 20, max: 600 },
        { name: 'Modules', min: 270, max: 305 },
        { name: 'Plugins', min: 2, max: 3 },
        { name: 'Game plugins', min: 2215, max: 2400 },
    ];

    // Initialize an object to store the line counts
    let lineCounts = {};

    // Loop over each section
    for (const section of sections) {
        // Find the start and end of the section
        const start = logFile.indexOf(section.name);
        const dataStart = logFile.indexOf('{', start);
        const dataEnd = logFile.indexOf('}', start);

        // If the section was found, count the lines and store the count
        if (start !== -1 && dataStart !== -1 && dataEnd !== -1) {
            let sectionHeader = logFile.slice(start, dataStart);
            if (sectionHeader.includes('(')) {
                // If the section header contains a count in parentheses, extract the count
                let sectionCount = sectionHeader.slice(sectionHeader.indexOf('(') + 1, sectionHeader.indexOf(')')).trim();
                const count = parseInt(sectionCount);
                lineCounts[section.name] = count;
            } else {
                // If the section header does not contain a count, count the lines in the section
                const sectionContent = logFile.slice(dataStart, dataEnd);
                let lines = sectionContent.split('\n').filter(line => line.trim() !== '');
                lineCounts[section.name] = lines.length - 1; // Subtract 1 to exclude the opening brace
            }
        } else {
            lineCounts[section.name] = 0;
        }
    }

    // Create the insights message
    if (Object.keys(lineCounts).length > 0) {
        insights += '<li>🔎 <b>Line Counts</b> for each section in the log file: <ul>';
        for (let section of sections) {
            let count = lineCounts[section.name];
            let warning = '';
            if (count < section.min || count > section.max) {
                insights += `<li>${section.name}:&nbsp; <code>${count.toLocaleString()} ⚠️<b>expected between ${section.min.toLocaleString()} and ${section.max.toLocaleString()}</b></code></li>`;
            } else {
                insights += `<li>${section.name}:&nbsp; <code>${count.toLocaleString()}</code></li>`;
            }
        }
        insights += '</ul></li>';
        insightsCount++;
    }
    console.log('sections:', sections);



    function containsKeyword(line) {
        // Define the keywords
        const keywords = ['.dds', '.tga', '.bmp', '.nif', '.esl', '.esp', '.esm', '.pex', '.dll', '.exe', '.ini', '.bsa', '.fuz', '.hkx', '.seq', '.swf', 'name:', 'file:'];

        // Convert the line to lowercase for case-insensitive comparison
        const lowerCaseLine = line.toLowerCase();

        // Initialize a counter for the number of matches
        let matchCount = 0;

        // Check if the line contains any of the keywords
        keywords.forEach(keyword => {
            if (lowerCaseLine.includes(keyword)) {
                matchCount++;
            }
        });

        // Return the number of matches
        return matchCount;
    }

    const fileExtensions = [
        '.bat', '.bik', '.bmp', '.bsa', '.bsl', '.cpp', '.dds', '.dll', '.esl', '.esm',
        '.esp', '.exe', '.fuz', '.hkx', '.ini', '.json', '.lip', '.nif', '.pex', '.psc',
        '.seq', '.skse', '.skse64', '.swf', '.tga', '.tri'
    ];

    const fileStartCharacter = ['`', '"', ':', '(', '['];

    function cleanString(input) {
        // Ensure input is a string
        let str = String(input);

        function removeUnpaired(charOpen, charClose) {
            const stack = [];
            let result = '';
            for (const char of str) {
                if (char === charOpen) {
                    stack.push(result.length);
                    result += char;
                } else if (char === charClose) {
                    if (stack.length > 0) {
                        stack.pop();
                        result += char;
                    }
                } else {
                    result += char;
                }
            }
            // Remove unopened charClose using the indices in the stack
            for (let i = stack.length - 1; i >= 0; i--) {
                result = result.substring(0, stack[i]) + result.substring(stack[i] + 1);
            }
            return result;
        }

        // Process the string for each pair of characters
        str = removeUnpaired('(', ')');
        str = removeUnpaired('[', ']');
        str = removeUnpaired('{', '}');
        str = removeUnpaired('<', '>');

        return str;
    }

    const nameStartCharacter = ['`', '"'];

    // List of common metadata and items likely to be duplicate entries
    const removeList = [
        //'char*',
        'Dawnguard.esm',
        'Dragonborn.esm',
        'null',
        'null)',
        'NetScriptFramework',
        'SkyrimSE.exe',
        'skyrim.esm',
        //'void*',
    ].map(item => item.toLowerCase());

    // List of files to filter
    const unlikelyCulpritsList = [
        'clr.dll',
        //'d3d11.dll',
        'D3D12Core.dll',
        'D3DCOMPILER_47.dll',
        'kernel32.dll',
        'kernelbase.dll',
        'MSVCP140.dll',
        'ntdll.dll',
        'Runtime.dll',
        'steamclient64.dll',
        'System.ni.dll',
        'ucrtbase.dll',
        'uiautomationcore.dll',
        'vcruntime140.dll',
        'win32u.dll',
        'XINPUT1_3.dll'
    ].map(item => item.toLowerCase());


    //NOTE: This section originally focused on just logsTopThird, but now changed to logsTopHalf (now includes "Stack")
    // Split the logs into lines
    //BUG: const lines = logsTopHalf.split('\n'); //BUG: creates empty lines in the array where there are way too many characters in a line (Gravelord has a line with 24k+ characters)

    const maxLineLength = 1000; // Adjust this value to your needs

    // Split the logs into chunks of maxLineLength characters (can't use logsTopHalf.split('\n') because it is incompatible with extra long log lines)
    let lines = [];
    let start = 0;
    let end = 0;
    let lineEnd = 0;

    while (start < logsTopHalf.length) {
        lineEnd = logsTopHalf.indexOf('\n', start);
        if (lineEnd === -1) {
            //If there are no more newlines, then we are at the end of the logsTopHalf
            stringEnd = logsTopHalf.length;
            lineEnd = stringEnd;
        }
        if (lineEnd > start + maxLineLength) {
            //If the line is too long, we need to shorten it
            stringEnd = start + maxLineLength;
        } else {
            stringEnd = lineEnd;
        }

        let line = logsTopHalf.substring(start, stringEnd); //NOTE: was logsTopHalf even when above was logsTopThird
        lines.push(line);
        start = lineEnd + 1;
    }
    //DEBUGGNG: console.log('lines:', lines);


    let namedElementMatches = [];
    let missedMatches = [];
    async function processLines() {
        lines.forEach(line => {
            if (line === '') return;
            let foundMatchCount = 0;

            function getLogSection(line) {
                for (const [sectionContent, { priority, color }] of logSectionsMap) {
                    if (sectionContent.includes(line)) {
                        return { priority, color };
                    }
                }
                return { priority: 6, color: 'gray' }; // Default if no section found
            }

            function addMatch(potentialMatch, removeList, priority, color) {
                if (potentialMatch && !removeList.includes(potentialMatch.toLowerCase())) {
                    namedElementMatches.push({ match: potentialMatch, priority, color });
                    return 1;
                }
                return 0;
            }

            const { priority, color } = getLogSection(line);

            fileExtensions.forEach(extension => {
                if (line.includes(extension)) {
                    let index = line.lastIndexOf(extension);
                    let end = index + extension.length;
                    let start = index;
                    let tempFileStartCharacter = [...fileStartCharacter];
                    //Find the start by searching backwards:
                    while (start > 0) {
                        let char = line.charAt(start - 1);
                        if (char === ')') {
                            //If we find a closing parenthesis, skip to the matching opening parenthesis
                            tempFileStartCharacter = tempFileStartCharacter.filter(item => item !== '(');
                        }
                        if (tempFileStartCharacter.includes(char)) {
                            break;
                        }
                        start--;
                    }
                    let potentialMatch = line.slice(start, end).trim();
                    foundMatchCount += addMatch(potentialMatch, removeList, priority, color);
                }
            });

            ["Name:", "File:"].forEach(keyword => {
                if (line.match(new RegExp(`${keyword}`))) {
                    let index = line.indexOf(keyword) + keyword.length;
                    let start = index;
                    let delimiter = '';
                    //Find the start character:
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
                    //Find the end character:
                    let end = start;
                    while (end < line.length) {
                        let char = line.charAt(end);
                        if (char === delimiter || char === ',' || char === '\t' || char === '\n' || char === '\r') {
                            break;
                        }
                        end++;
                    }

                    //Match: the Name/File substring:
                    let potentialMatch = line.slice(start, end);
                    potentialMatch = cleanString(potentialMatch);
                    foundMatchCount += addMatch(potentialMatch, removeList, priority, color);
                }
            });

            if (foundMatchCount < containsKeyword(line)) {
                missedMatches.push(line);
            }
        });

        // Sort namedElementMatches by priority
        namedElementMatches.sort((a, b) => a.priority - b.priority);

        namedElementMatches = namedElementMatches.map(item => {
            let processedItem = item.match;
            if (unlikelyCulpritsList.includes(processedItem.toLowerCase())) {
                processedItem = `(${processedItem} ... unlikely culprit)`;
            }
            if (explainersMap.has(processedItem.toLowerCase())) {
                processedItem += ` ${explainersMap.get(processedItem.toLowerCase())}`;
            }
            return { ...item, match: processedItem };
        }).filter(item => item !== undefined);
    }

    // Call the async function
    await processLines();

    console.log(' ');
    console.log('missedMatches:', missedMatches);
    console.log('namedElementMatches:', namedElementMatches);

    function processColoredListItems(listItems) {
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
    }

    // Create the insights message
    if (namedElementMatches.length > 0) {
        insights += '<li>🔎 <b>Files/Elements</b> listed within <code><span style="color:red">[1]</span> the first line</code>, <code><span style="color:darkorange">[2]</span> Possible relevant objects</code>, <code><span style="color:gold">[3]</span> Probable callstack</code>, <code><span style="color:dodgerblue">[4]</span> Registers</code> and/or <code><span style="color:blueviolet">[5]</span> Stack</code> sections of the crash log. Items are sorted by priority, with lower numbers (and higher positions in the list) indicating a higher likelihood of contributing to the crash. Pay extra attention to anything related to <b>mods you have added</b> to Nolvus:';
        insights += '<ul>' + processColoredListItems(namedElementMatches) + '</ul>';
        insights += '</li>';
        insightsCount++;
    }




    insights += '</ul><h5>Higher-Confidence Test Results:</h5><ul>';

    //VRAMr Gorehowl
    if (logsFirstLine.includes('D6DDDA') && logsRelevantObjectsSection.includes('Gorehowl')) {
        insights += '<li>🎯 <b>VRAMr Gorehowl Crash Detected:</b> The \'D6DDDA\' error, combined with references to the weapon "Gorehowl," indicates a specific issue related to VRAMr and the "Night at the Museum" quest. To address this issue:<ol>' +
            '<li>If you are using VRAMr, temporarily disable VRAMr\'s output mod.</li>' +
            '<li>After completing the quest, re-enable VRAMr\'s output mod.</li>' +
            '<li>Alternatively, you can delete the "clgorehowl" .dds texture files associated with the quest.</li>' +
            '<li>Or, consider hiding their overrides in MO2 to prevent conflicts.</li>' +
            '<li>NOTE: the VRAMr mod author fixed this issue in his April 19, 2024 version.</li>' +
            '</ol></li>';
        insightsCount++;
    }
    //Strings
    if (R14StringsRegex.test(logsTopHalf)) {
        insights += '<li>🎯 <b>.STRINGS Crash Detected:</b> This error typically occurs when there is a unique or non-standard character in the <code>sLanguage</code> line of your <b>skyrim.ini</b> file. To resolve this issue:<ol>' +
            '<li>Open your <b>skyrim.ini</b> file located in the Documents/My Games/Skyrim folder.</li>' +
            '<li>Locate the line that reads <code>sLanguage=ENGLISH</code>.</li>' +
            '<li>Ensure that there are no unique characters or typos in this line. It should only contain standard text.</li>' +
            '<li>Save the changes and restart Skyrim to see if the issue has been resolved.</li>' +
            '<li>More information and troubleshooting tips under <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-1">.STRINGS Crash</a/>.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //USVFS (Antivirus)
    if (logsProbableCallstackSection.includes('usvfs_x64.dll')) {
        insights += '<li>🎯 <b>USVFS Crash Detected:</b> The presence of \'usvfs_x64.dll\' in the crash log indicates an issue related to the MO2 (Mod Organizer 2) file system. This crash is often caused by <b>antivirus software</b>, particularly Webroot or Bitdefender, blocking MO2\'s file operations. To resolve this issue:<ol>' +
            '<li>Check if you have Webroot or Bitdefender antivirus installed.</li>' +
            '<li>Temporarily disable your antivirus or create an exception for the entire Nolvus directory within your antivirus settings.</li>' +
            '<li>Ensure that MO2 has the necessary permissions to access and modify files without interference from the antivirus.</li>' +
            '<li>For detailed troubleshooting tips, refer to the <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-12">USVFS Crash section</a> on the Nolvus support page.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //ENB issue (long, but collapsable version)
    if (logsFirstLine.includes('d3d11.dll')) {
        insights += '<li>❗ <b>ENB Issue Detected:</b> The presence of <code>d3d11.dll</code> in the first line of a crash log indicates a graphics-related crash. If you have recently installed an ENB or Reshader, ensure it is the correct version and consider reinstalling it. Follow the appropriate steps based on your installation method:<ol>' +
            '<li>❗ <b>For Manual Installers/Modders:</b> If you manually installed an ENB or similar:<a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            '<li>For manual installations of standard Nolvus options, refer to the <a href="https://www.nolvus.net/guide/natl/enb">Guide on ENB & RESHADE Installation</a>.</li>' +
            '<li>For information on the new Cabbage ENB and Kauz ENB, see the <a href="https://www.reddit.com/r/Nolvus/comments/1clurux/nolvus_enb_install_guides_and_info/">Nolvus ENB Installation Guides and Information</a>.</li>' +
            '</ul></li>' +
            '<li>❗ <b>For Autoinstallers:</b> Consider the following steps for fixing your ENB-related issue:<a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            '<li>For a potential <b>quick fix,</b> standard Nolvus players can try manually reinstalling the <code>d3d11.dll</code> file by following the instructions in the <a href="https://www.nolvus.net/guide/natl/enb">Guide on ENB & RESHADE Installation</a>. If this does not resolve the issue, proceed with the steps below.</li>' +
            '<li><b>Reinstalling Nolvus</b> may seem daunting, but <b>as long as you archived</b> during installation, the process is straightforward and <b>far faster.</b></li>' +
            '<li><b>⚠️ CAUTION:</b> Reinstalling Nolvus will delete your save games, character presets, and screenshots. Please <b>back them up</b> first if you wish to keep them! <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            '<li>Game saves (.ess and .skse files) are located in <code>\\Nolvus\\Instances\\Nolvus Ascension\\MODS\\profiles\\Nolvus Ascension\\saves</code></li>' +
            '<li>Screenshots are saved in <code>\\Nolvus\\Instances\\Nolvus Ascension\\SHOTS</code></li>' +
            '<li>Character presets are located in <code>\\Nolvus\\Instances\\Nolvus Ascension\\MODS\\overwrite\\SKSE\\Plugins\\Chargen\\Presets</code></li>' +
            '<li>Character head sculpts are located in <code>\\Nolvus\\Instances\\Nolvus Ascension\\MODS\\overwrite\\SKSE\\Plugins\\Chargen</code></li>' +
            '</ul></li>' +
            '<li>Close Mod Organizer 2 (MO2) if it is currently open.</li>' +
            '<li>Open the Nolvus Dashboard.</li>' +
            '<li>Click the Manage button and select Delete Instance (see <a href="https://www.nolvus.net/appendix/installer/faq?acc=accordion-1-23">How to Delete an Instance</a>). NOTE: This will NOT delete your archives if you have enabled archiving.</li>' +
            '<li>Wait for the process to complete - this takes about 2 minutes depending on your system.</li>' +
            '<li>Once the process is complete, follow the prompts to install a new instance with your preferred settings. Please note that your game saves from another instance will not be compatible unless you choose the same settings.</li>' +
            '<li>If you previously enabled archiving, make sure the dashboard points to the correct Archive folder to prevent unnecessary re-downloads.</li>' +
            '</ul></li>' +
            '</ol></li>';
        insightsCount++;
    }

    // Apply Order
    if (hasBadlyOrganizedNolvusPlugins) {
        var badlyOrderedVanillaPluginsListItems = '';
        badlyOrderedVanillaPlugins = replaceWithExplainers(badlyOrderedVanillaPlugins);
        for (let plugin of badlyOrderedVanillaPlugins) {
            badlyOrderedVanillaPluginsListItems += '<li><code>' + plugin + '</code></li>';
        }
        insights += '<li>❗<b>Potential Misorganization of Vanilla Nolvus Plugins:</b>  <code>' + countBadlyOrganizedNolvusPlugins + '</code> standard plugins appear to be out of their usual sequence (relative to each other). A few mods will move around with different configurations of Nolvus, but others can cause problems if they are out of their typical loading order. If you\'re having load order issues, you can use the <b>Apply Order</b> button in the Nolvus Dashboard to restore the original order of all vanilla Nolvus mods. Follow these steps:<ol>' +
            '<li>Open the dashboard and click on <b>Manage</b>, then <b>Instance</b>.</li>' +
            '<li>Once loaded, click on <b>Apply Order</b>.</li>' +
            '<li>Any disabled vanilla mods will be re-enabled.</li>' +
            '<li>All vanilla Nolvus mods will be returned to their original order (load order).</li>' +
            '<li>⚠️All non-vanilla mods will be disabled and moved to the end of your load order.</li>' +
            '<li>Optionally, manually re-enable and reposition your added non-vanilla mods, or start a new game with them disabled.</li>' +
            '<li>This is helpful if you\'re troubleshooting a load order and want to revert to a vanilla Nolvus state without reinstalling, if you\'ve accidentally rearranged one or more mods in Mod Organizer 2 (MO2), or if your load order has become corrupted.</li>' +
            '<li>For additional information and a screenshot, refer to this r/Nolvus post <a href="https://www.reddit.com/r/Nolvus/comments/1chuod0/how_to_apply_order_button_usage_in_the_nolvus/">How To: Use the "Apply Order" Button in the Nolvus Dashboard</a>.</li>' +
            '<li>List of potentially, badly-organized vanilla Nolvus plugins: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            badlyOrderedVanillaPluginsListItems +
            '</ul></ol></li>';

        insightsCount++;
    }

    // Test for Non-Nolvus Plugins at Bottom
    if (hasNonNolvusPluginsAtBottom) {
        var nonNolvusPluginsAtBottomListItems = '';
        var nonNolvusPluginsAtBottom = await getNonNolvusGamePluginsBelowSynthesis(logFile);
        nonNolvusPluginsAtBottom = replaceWithExplainers(nonNolvusPluginsAtBottom);
        for (let plugin of nonNolvusPluginsAtBottom) {
            nonNolvusPluginsAtBottomListItems += '<li><code>' + plugin + '</code></li>';
        }
        insights += '<li>❗<b>Non-Nolvus Plugins Detected at Bottom:</b> <code>' + countNonNolvusPluginsAtBottom + '</code> Non-Nolvus plugins have been detected at the bottom of your load order (below <code>synthesis.esp</code>). This could potentially cause issues with your game. Here is how to address this:<ol>' +
            '<li>Open Mod Organizer 2 (MO2).</li>' +
            '<li>In both the left and right-side panes, identify the non-Nolvus plugins at the bottom of your load order.</li>' +
            '<li>Move these plugins to their correct positions in the load order. Typically, non-Nolvus plugins should be placed above <code>FNIS.esp</code>. If you would like guidance on modding/patching Nolvus, please watch this <a href="https://youtu.be/YOvug9KP5L4">brief tutorial video</a> for step-by-step instructions.</li>' +
            '<li>Review information on the <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-7">Load Order Crash</a>. If this issue persists, share your crash logs with <a href="https://www.reddit.com/r/Nolvus/">r/Nolvus</a> and/or the <a href="https://discord.gg/Zkh5PwD">Nolvus Discord</a>.</li>' +
            '<li>List of non-Nolvus plugins at bottom: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            nonNolvusPluginsAtBottomListItems +
            '</ul></ol></li>';

        insightsCount++;
    }

    //D6DDDA
    if (logsFirstLine.includes('D6DDDA')) {
        insights += '<li>❗<b>D6DDDA Crash Detected:</b> The \'D6DDDA\' error may occur due to one of the following reasons:<ol>' +
            '<li>Exceeded RAM or VRAM: Ensure that your system has sufficient memory resources:<ol>' +
            '<li>Check if other applications are consuming excessive memory. Consider closing other applications.</li>' +
            '<li>If your PC has less than 12GB of VRAM (<a href="https://www.lifewire.com/how-to-check-vram-5235783">how to check</a>), consider running your load order through <a href="https://www.reddit.com/r/Nolvus/comments/1doakj1/psa_use_vramr_if_you_have_12gb_of_vram/">VRAMr</a> to conserve both VRAM and RAM by compressing all/most of your load order\'s texture files in an automated fashion. This will reduce your load order\'s images to a smaller resolution (file size) without a noticeable decrease in image quality, and typically leads to fewer low-point FPS stutters and fewer memory-related crashes.</li>' +
            '</ol></li>' +
            '<li>Broken/Corrupt Meshes (.nif) or Textures (.dds): Verify the integrity of your installed mods. Corrupted files can lead to crashes:<ol>' +
            '<li><a href="https://www.nexusmods.com/skyrimspecialedition/mods/23316">Cathedral Assets Optimizer (CAO)</a> can often be used to repair damaged image files. CAO ensures that textures are properly formatted and can also reduce their resolution (file size) without noticeably reducing visual quality.</li>' +
            '<li>Additionally, consider reaching out to the mod author if a specific mesh is identified as causing issues.</li>' +
            '</ol></li>' +
            '<li>Windows Pagefile Size: Verify that you have correctly <a href="https://www.nolvus.net/appendix/pagefile">set your Windows Pagefile Size</a>.</li>' +
            '<li>Hardware Issues (Rare): While uncommon, persistent D6DDDA crashes could indicate underlying hardware problems. Run a memory diagnostic tool to check for faulty RAM. Windows Memory Diagnostic or MemTest86 can be used for this purpose. Monitor your system for other signs of instability.</li>' +
            '</ol>For more detailed information and troubleshooting tips, refer to the <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-2">D6DDDA Crash section</a> on the Nolvus support page.</li>';
        insightsCount++;
    }

    //NVIDIA graphics driver
    if (logsTopThirdNoHeading.toLowerCase().includes('nvwgf2umx.dll') || logsTopThirdNoHeading.toLowerCase().includes('nvlddmkm.sys') || logsTopThirdNoHeading.toLowerCase().includes('nvoglv32.dll') || logsTopThirdNoHeading.toLowerCase().includes('nvoglv64.dll') || logsTopThirdNoHeading.toLowerCase().includes('nvwgf2um.dll') || logsTopThirdNoHeading.toLowerCase().includes('nvapi64.dll')) {
        insights += '<li>❗<b>Potential NVIDIA Driver Issue Detected:</b> NVIDIA driver .dll files showing up in the top few sections of a crash log may be linked to NVIDIA graphics driver issues. To resolve this, try the following steps:<ol>' +
            '<li><b>Update your NVIDIA drivers</b> to the latest version. You can download the latest drivers from the <a href="https://www.nvidia.com/Download/index.aspx">NVIDIA website</a>.</li>' +
            '<li>If updating does not resolve the issue, perform a clean installation of the drivers using a tool like Display Driver Uninstaller (DDU) to remove all traces of the previous drivers before installing the new ones.</li>' +
            '<li>Check for any GPU overclocking settings that may be causing instability and reset them to default if necessary.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //Memory issue (Missing Masters)
    // Check thought up by AI (MS Bing Copilot):
    if (logsTopHalf.includes('0xC0000005')) {
        insights += '<li>❗<b>Memory Access Violation Detected:</b> Error code 0xc0000005 points to memory-related issues, such as invalid memory access operations. Common causes and resolutions include:<ol>' +
            '<li><b>Missing Master Files:</b> Incompatibilities from a new mod may sometimes be resolved by installing <a href="https://www.nexusmods.com/skyrimspecialedition/mods/106441">Backported Extended ESL Support (BEES)</a>. If a mod was removed while others are still depending on it, see <a href="https://github.com/LivelyDismay/Learn-To-Mod/blob/main/lessons/Remove%20a%20Master.md">How To Remove a Master Requirement From a Plugin</a>.</li>' +
            '<li><b>Incompatible Mods:</b> Review your mod list for conflicts that could affect memory allocation or access.</li>' +
            '<li><b>File Format Versions:</b> Ensure all mods are compatible with your game version to prevent crashes from format mismatches.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //Missing Master 2
    if (logsFirstLine.includes('5E1F22') || logsFirstLine.includes('05E1F22')) {
        insights += '<li>❗<b>Potential Missing Masters Detected:</b> Codes for 5E1F22 or 05E1F22 in the first line of a crash log may suggest a missing master files. MO2 will display a warning icon next to plugins that are missing their masters. This issue can arise from incompatibilities due to a newly added mod, which is sometimes resolvable by installing <a href="https://www.nexusmods.com/skyrimspecialedition/mods/106441">Backported Extended ESL Support (BEES)</a>. It can also occur when one mod is removed (or disabled) while another mod or patch still expects it to be present. In this scenario, refer to the following tutorial on <a href="https://github.com/LivelyDismay/Learn-To-Mod/blob/main/lessons/Remove%20a%20Master.md">How To Remove a Master Requirement From a Plugin</a>.</li>';
        insightsCount++;
    }

    // dxgi.dll issue (ReShade and PureDark Upscaler)
    if (logsTopHalf.includes('dxgi.dll')) {
        insights += '<li>❗<b>dxgi.dll Issue Detected:</b> The presence of dxgi.dll in the log\'s top half indicates a potential issue between ReShade and the PureDark Upscaler. Common causes and resolutions include:<ol>' +
            '<li><b>ReShade Version:</b> If you have upgraded your ReShade to a newer version (e.g., 6.11 for the latest Cabbage release), the older and customized dxgi.dll from PureDark might cause issues. See below if you wish to revert to the original Reshade.</li>' +
            '<li><b>PureDark Upscaler:</b> If you are using newer versions of the PureDark upscaler (specifically for 40xx cards), you need to download a customized version of dxgi.dll from their Discord for compatibility with ReShade.</li>' +
            '<li><b>Missing dxgi.dll:</b> If you want to revert back from PureDark and don\'t have the original dxgi.dll, you can find it in your archived mods installed from Nolvus. Alternatively, reinstall ReShade following the <a href="https://www.nolvus.net/guide/natl/enb">11.3 Reshade Binaries</a> instructions on the Nolvus site.</li>' +
            '<li><b>Workaround:</b> Alternatively, you can disable ReShade by pressing the DEL key to turn it on or off.' +
            '</ol></li>';
        insightsCount++;
    }

    //Upscaler
    if (logsTopThird.toLowerCase().includes('upscaler.dll') || logsTopThird.toLowerCase().includes('pdperfplugin.dll')) {
        insights += '<li>❗<b>Potential Upscaler Issue Detected:</b> The error involving \'Upscaler.dll\' or \'PDPerfPlugin.dll\'suggests a problem with the Upscaler mod, which is designed to improve the game\'s graphics by increasing the resolution of textures. If you are using Puredark\'s paid Upscaler, consider the following troubleshooting steps:<ol>' +
            '<li>Ensure you are using the correct version of the upscaler that is compatible with your GPU.</li>' +
            '<li>Review the <a href="https://docs.google.com/document/d/1YVFKcJN2xuvhln9B6vablzOzQu-iKC4EDcbjOW-SEsA/edit?usp=sharing">Nolvus DLSS Upscaler Installation Guide</a> to confirm that you have followed all the installation steps correctly.</li>' +
            '<li>Review the <b>SkyrimUpscaler.log</b> file for more detailed information about the error.</li>' +
            '<li>Temporarily disable the Upscaler mod to determine if it is the source of the crash.</li>' +
            '<li>Ensure that your system meets the hardware requirements for running the mod, as upscaling can be resource-intensive.</li>' +
            '<li>Check for updates to the Upscaler mod that may address known issues.</li>' +
            '<li>If the problem persists, report it to the mod\'s support page, providing details from the log file to assist with troubleshooting.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    // Check for KERNELBASE Crash excluding JContainers and JSON parse error
    if (logsFirstLine.toLowerCase().includes('KERNELBASE.dll'.toLowerCase()) && !logsProbableCallstackSection.includes('JContainers64.dll') && !logsTopHalf.includes('json.exception.parse_error')) {
        insights += '<li>❗<b>KERNELBASE Crash Detected:</b> This rare issue could be related to a specific added mod, or to hardware or a system-wide issue such as virus, malware, drive corruption, corrupted Nolvus install, or corrupted file permissions. Here are some steps you can take, ordered from easiest to hardest:<ol>' +
            '<li>You can restore the original sorting of all vanilla Nolvus mods using the <b>Apply Order</b> button in the Nolvus Dashboard.<ul>' +

                '<li>Here is how to do it: <a href="#" class="toggleButton">⤴️ hide</a><ol class="extraInfo">' +
                    '<li>Open the dashboard, click on <b>Manage</b> and then <b>Instance</b>.</li>' +
                    '<li>When loaded, click on <b>Apply Order</b>.</li>' +
                    '<li>All non-vanilla mods will be disabled and moved to the bottom of your load order.</li>' +
                    '<li>Any disabled vanilla mods will again be enabled.</li>' +
                    '<li>All vanilla Nolvus mods will be restored to their original sorting (load order).</li>' +
                    '<li>This is useful if you are troubleshooting a load order and wish to start from a vanilla Nolvus state without reinstalling, if you accidentally moved one or more mods in Mod Organizer 2 (MO2), or if your load order somehow got corrupted.</li>' +
                    '<li>For more information and a screenshot, see this r/Nolvus post <a href="https://www.reddit.com/r/Nolvus/comments/1chuod0/how_to_apply_order_button_usage_in_the_nolvus/">How To: "Apply Order" button usage in the Nolvus Dashboard</a>.</li>' +
                '</ol></ul></li>' +
            '<li>Check the Windows Event Log for any related issues. You can do this by opening the <b>Event Viewer</b> (search for it in the Start Menu), then navigate to Windows Logs > Application. Look for any recent errors that might be related to your issue. For detailed instructions, see this <a href="https://support.microsoft.com/en-us/windows/open-event-viewer-17d427d2-43d6-5e01-8535-1fc570ea8a14">Microsoft guide</a>.</li>' +
            '<li>Reinstall Nolvus to ensure the installation is not corrupted. Make sure to back up any important data before doing this. For detailed instructions, see this <a href="https://docs.google.com/document/d/1R_AVeneeCiqs0XGYzggXx34v3Ufq5eUHNoCHo3QE-G8/edit">guide</a>.</li>' +
            '<li>Ensure your Windows is up to date, as well as any drivers. You can check for updates by going to Settings > Update & Security > Windows Update.</li>' +
            '<li>Run a full system scan for any viruses or malware. We generally recommend using the built-in Windows Defender for this.</li>' +
            '<li>Try disabling mods you have added one-by-one to see if the issue persists. This can help identify if a specific mod is causing the problem.</li>' +
            '<li>Reset your file permissions. See <a href="https://www.thewindowsclub.com/how-to-reset-file-folder-permissions-to-default-in-windows-10">How to reset all User Permissions to default in Windows 11/10</a>, or seek assistance from the Nolvus community.</li>' +
            '<li>Alternatively to resetting permissions, an an easy <b>workaround</b> is to <a href = "https://support.microsoft.com/en-us/windows/create-a-local-user-or-administrator-account-in-windows-20de74e0-ac7f-3502-a866-32915af2a34d#WindowsVersion=Windows_11">create a new Windows User</a> and create a new Nolvus save (playthrough) from the new user.</li>' +
            '<li>Check your hard drive for any corruption. You can do this by opening the Command Prompt as an administrator and running the command <code>chkdsk /f</code>. Note that you might need to restart your computer for the scan to run. Be aware that frequent use of `chkdsk` on SSDs can potentially shorten their lifespan due to the write operations it performs.</li>' +
            '<li>Perform a Repair Upgrade using the Windows 11 or Windows 10 ISO file. For detailed instructions, see this <a href="https://answers.microsoft.com/en-us/windows/forum/all/how-to-perform-a-repair-upgrade-using-the-windows/35160fbe-9352-4e70-9887-f40096ec3085">guide</a>.</li>' +
            '</ol></li>';
        insightsCount++;
    }


    insights += '</ul><h5>Memory and Image-related Issues:</h5><ul>';

    //Out of RAM
    if (logsTopHalf.toLowerCase().includes('bad_alloc')) {
        insights += '<li>❓ <b>bad_alloc Issue Detected:</b> The \'bad_alloc\' error typically indicates that the game has run <b>out of RAM</b> memory. To address this issue, follow these steps:<ol>' +
            '<li>Close unnecessary applications to free up RAM.</li>' +
            '<li>Consider upgrading your system with more RAM if you frequently encounter memory issues.</li>' +
            '<li>Verify that you have correctly <a href="https://www.nolvus.net/appendix/pagefile">set your Windows Pagefile Size</a>.</li>' +
            '<li>Ensure that your mods are efficiently using memory and not exceeding your system\'s limits.</li>' +
            '<li>Consider switching to texture packs with lower resolutions (e.g., 1K or 2K instead of 4K) to reduce memory usage. Texture mods that are too large can strain both VRAM and RAM resources.</li>' +
            '<li>Consider conserving both VRAM and RAM by compressing all/most of your load order\'s texture (image) files in an automated fashion with <a href="https://www.reddit.com/r/Nolvus/comments/1doakj1/psa_use_vramr_if_you_have_12gb_of_vram/">VRAMr</a> reducing their size without a noticeable decrease in image quality. This can lead to smoother performance and fewer memory-related issues.</li>' +
            '</ol></li>';
        insightsCount++;
    }


    //Memory allocation failure
    if (logsTopHalf.toLowerCase().includes('no_alloc')) {
        insights += '<li>❓ <b>no_alloc Issue Detected:</b> The \'no_alloc\' error suggests a <b>memory allocation</b> failure, often due to mod conflicts or system limitations. To troubleshoot this issue, follow these steps:<ol>' +
            '<li>Run a memory diagnostic tool to check for faulty RAM. Windows Memory Diagnostic or MemTest86 can be used for this purpose.</li>' +
            '<li>Review your mod list to ensure there are no conflicts.</li>' +
            '<li>Reduce the number of mods installed, particularly if you have many large, resource-intensive mods.</li>' +
            '<li>Keep your mods updated, including any patches that improve memory management.</li>' +
            '<li>If the issue persists, disable mods one by one to isolate the problematic mod. Re-enable them gradually to maintain system stability.</li>' +
            '<li>Consider switching to texture packs with lower resolutions (e.g., 1K or 2K instead of 4K) to reduce memory usage. Texture mods that are too large can strain both VRAM and RAM resources.</li>' +
            '<li>Consider conserving both VRAM and RAM by compressing all/most of your load order\'s texture (image) files in an automated fashion with <a href="https://www.reddit.com/r/Nolvus/comments/1doakj1/psa_use_vramr_if_you_have_12gb_of_vram/">VRAMr</a> reducing their size without a noticeable decrease in image quality. This can lead to smoother performance and fewer memory-related issues.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //tbbmalloc memory allocation issues
    if (logsTopHalf.toLowerCase().includes('tbbmalloc.dll')) {
        insights += '<li>❓ <b>tbbmalloc.dll Issue Detected:</b> This indicator is associated with <b>memory allocation</b>. Its presence in the crash log suggests potential mod conflicts or the need for mod updates. Consider the following:<ol>' +
            '<li>Check for mod compatibility issues, especially with those that modify memory allocation.</li>' +
            '<li>Ensure all mods, particularly those related to memory management, are up to date.</li>' +
            '<li>Verify that you have correctly <a href="https://www.nolvus.net/appendix/pagefile">set your Windows Pagefile Size</a>.</li>' +
            '<li>Seek advice from the modding community if crashes persist after taking these steps.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //Skeleton
    if (skeletonMatches.length > 0) {
        insights += '<li>❓ <b>Possible Skeleton Crash Detected:</b> The crash log suggests ' + skeletonMatches.length + ' potential skeleton integrity issues. Skeleton files are crucial for character and creature animations in Skyrim. A corrupted or incompatible skeleton file can lead to game instability. To address this:<ol>' +
            '<li>Verify the integrity of skeleton-related mods. Ensure that mods like XPMSSE are properly installed and not overwritten by other mods.</li>' +
            '<li>Check the load order for mods affecting skeletons. Use a mod manager to resolve conflicts and ensure proper priority.</li>' +
            '<li>Utilize tools such as FNIS or Nemesis to rebuild animations, particularly if you have mods that modify character or creature animations. Follow these instructions for <a href="https://www.nolvus.net/guide/asc/output/nemesis">regenerating Nemesis for Nolvus</a>.</li>' +
            '<li>Inspect other mods that may alter skeleton structures. Disable them sequentially to pinpoint the issue.</li>' +
            '<li>If identifiable, using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/23316">Cathedral Asset Optimizer (CAO)</a> may help fix the problematic NIF file(s)</li>' +
            '</ol>For detailed steps and more troubleshooting advice, visit the <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-9">Skeleton Crash</a> and <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-7">Load Order Crash</a> sections on Nolvus.</li>';
        insightsCount++;
    }

    //Corrupted NIF
    if (logsFirstLine.includes('12FDD00')) {
        insights += '<li>❓ <b>12FDD00 Detected:</b> This code often indicates a crash due to a <b>corrupt NIF file</b>. It\'s recommended to check for any recently installed mods that might have altered or added NIF files and ensure they are uncorrupted. If identifiable, using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/23316">Cathedral Asset Optimizer (CAO)</a> may help fix the problematic NIF file(s). Additionally, consider reaching out to the mod author if a specific mesh is identified as causing issues.<ul>' +
            '<li>List of mentioned meshes: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            extractNifPathsToListItems(logsTopHalf) +
            '</ul></ul></li>';
        insightsCount++;
    }

    //NIF
    if (logsTopHalf.toLowerCase().includes('trishape')) {
        insights += '<li>❓ <b>Trishape Issue Detected:</b> Trishapes are components of NIF files that define the shape of 3D objects in the game. An issue here is likely due to a mod providing a corrupt or incompatible mesh. To resolve this:<ol>' +
            '<li>Identify the mod responsible for the bad mesh by reviewing the list of mentioned meshes below.</li>' +
            '<li>Check for updates or patches for the mod that may address the issue.</li>' +
            '<li>If no updates are available, consider removing the mod and replacing it with an alternative or updated version.</li>' +
            '<li>If identifiable, using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/23316">Cathedral Asset Optimizer (CAO)</a> may help fix the problematic NIF file(s).</li>' +

            '<li>List of mentioned meshes: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            extractNifPathsToListItems(logsTopHalf) +
            '</ul></ol></li>';

        insightsCount++;
    }

    //Mesh (NIF, right?)
    if (logsTopHalf.toLowerCase().includes('mesh')) {
        insights += '<li>❓ <b>Possible Mesh Issue Detected:</b> This error indicates a generic mesh problem, which could be due to corrupt or incompatible mesh files. To address this issue:<ol>' +
            '<li>Review the list of mentioned meshes below to identify any recently added or updated mods that may include these files.</li>' +
            '<li>Check for updates or compatibility patches for the mods that provide these mesh files.</li>' +
            '<li>If identifiable, using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/23316">Cathedral Asset Optimizer (CAO)</a> may help fix the problematic NIF file(s).</li>' +
            '<li>If issues persist, consider removing or replacing the problematic mod with an alternative.</li>' +
            '<li>List of mentioned meshes: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            extractNifPathsToListItems(logsTopHalf) +
            '</ul></ol></li>';
        insightsCount++;
    }

    // Check thought up by AI (MS Bing Copilot):
    //Mesh Issue
    const meshIssueRegex = /Name: "([^"]+\.nif)"/i;
    var meshIssueMatch = logsTopHalf.match(meshIssueRegex);
    if (meshIssueMatch) {
        const meshName = meshIssueMatch[1];
        insights += '<li><b>Possible NIF Issue Detected:</b> The mesh file <b>' + meshName + '</b> may be causing the crash. Check for corrupt or incompatible mesh files.</li>';
        insightsCount++;
    }

    //NiNode
    if (logsTopHalf.toLowerCase().includes('NiNode'.toLowerCase())) {
        insights += '<li>❓ <b>NiNode Issue Detected:</b> NiNodes are related to the skeletal structure of characters and creatures in Skyrim. This error could indicate an incompatible skeleton or a bad mesh. To troubleshoot this issue:<ol>' +
            '<li>Read the descriptions of related mods and ensure the correct load order for skeleton-based mods. ⚠️Note: Avoid using tools like LOOT with Nolvus.</li>' +
            '<li>Make sure you have a compatible skeleton mod installed, such as XPMSSE, and that it is not being overwritten by another mod in your mod manager.</li>' +
            '<li>Run FNIS or Nemesis to regenerate animations, especially if you are using mods that alter character animations.  Follow these instructions for <a href="https://www.nolvus.net/guide/asc/output/nemesis">regenerating Nemesis for Nolvus</a>.</li>' +
            '<li>Check for any other mods that affect skeletons, not just humanoid but creatures too, and test by disabling them.</li>' +
            '<li>If identifiable, using <a href="https://www.nexusmods.com/skyrimspecialedition/mods/23316">Cathedral Asset Optimizer (CAO)</a> may help fix the problematic NIF file(s).</li>' +
            '<li>List of mentioned meshes: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            extractNifPathsToListItems(logsTopHalf) +
            '</ul></ol></li>';
        insightsCount++;
    }

    //Head Mesh
    if (logsFirstLine.includes('132BEF')) {
        insights += '<li>❓ <b>132BEF Detected:</b> This error is often linked to a <b>head mesh</b> issue. To troubleshoot, follow these steps:<ol>' +
            '<li>Check the log for the last NPC loaded before the crash; this NPC\'s head mesh might be the source of the problem.</li>' +
            '<li>Verify that all head meshes are compatible with the current version of Skyrim and any installed body mods.</li>' +
            '<li>If a particular mod is identified, consider reinstalling it or checking for updates that address compatibility issues.</li>' +
            '<li>Regenerate facegen data for the NPC using Creation Kit or other specialized tools if the issue persists.</li>' +
            '<li>List of mentioned meshes: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            extractNifPathsToListItems(logsTopHalf) +
            '</ul></ol></li>';
        insightsCount++;
    }

    //Face Gen
    if (logsFirstLine.includes('12F5590')) {
        insights += '<li>❓ <b>12F5590 Detected:</b> This error is often associated with a <b>face generation</b> issue for NPCs. To troubleshoot, follow these steps:<ol>' +
            '<li>Check the log for the last NPC loaded before the crash; this NPC is likely the source of the problem.</li>' +
            '<li>If a particular mod is identified, consider reinstalling it or checking for updates that address compatibility issues.</li>' +
            '<li>For persistent problems, regenerate facegen data for the NPC using Creation Kit or other specialized tools.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //RaceMenu
    if (logsTopHalf.toLowerCase().includes('skee64.dll')) {
        insights += '<li>❓ <b>skee64.dll Issue Detected:</b> This file is typically associated with <b>RaceMenu</b> and can indicate incompatibility issues with mods that affect character models or body meshes. To troubleshoot this issue:<ol>' +
            '<li>Check for any recent mod installations or updates that may have altered character models or body meshes.</li>' +
            '<li>Ensure that RaceMenu and all related mods are up to date and compatible with your version of Skyrim and SKSE.</li>' +
            '<li>Read the descriptions of related mods and ensure the correct load order, and verify that there are no conflicts between mods that modify the same assets. ⚠️Note: Avoid using tools like LOOT with Nolvus.</li>' +
            '<li>If the problem persists, consider disabling mods one by one to isolate the conflicting mod.</li>' +
            '<li>List of mentioned meshes: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            extractNifPathsToListItems(logsTopHalf) +
            '</ul></ol></li>';
        insightsCount++;
    }

    //Bad texture
    if (logsTopHalf.toLowerCase().includes('CompressedArchiveStream'.toLowerCase())) {
        insights += '<li>❓ <b>CompressedArchiveStream Issue Detected:</b> This error typically points to a <b>corrupted texture</b> file, which can occur when a mod improperly overwrites textures from the game or its DLCs. To resolve this issue, follow these steps:<ol>' +
            '<li>Identify if a DLC texture is being overwritten by checking the load order and mod descriptions.</li>' +
            '<li>If no specific texture name is mentioned, extract the "*.BSA" archives linked with any "*.esp" or "*.esm" files, excluding those from official DLCs, to pinpoint the corrupted file.</li>' +
            '<li>Temporarily disable texture mods that are associated with the crash location to see if the issue is resolved.</li>' +
            '<li>Use tools like BSA Browser to safely extract and inspect the contents of "*.BSA" files.</li>' +
            '<li>Consult mod forums and communities for known issues with specific texture files and recommended solutions.</li>' +
            '<li>List of mentioned textures: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            extractSkyrimTexturePathsToListItems(logsTopHalf) +
            '</ul></ol></li>';
        insightsCount++;
    }

    //Textures
    if (logsTopHalf.toLowerCase().includes('texture')) {
        insights += '<li>❓ <b>Texture Issue Detected:</b> The mention of \'texture\' in the crash log may indicate a potential problem related to texture files. Textures play a crucial role in the visual quality of Skyrim, affecting everything from character models to landscapes and objects. To address texture-related issues, consider the following steps:<ol>' +
            '<li><a href="https://www.nexusmods.com/skyrimspecialedition/mods/23316">Cathedral Assets Optimizer (CAO)</a> can often be used to repair damaged image files. CAO ensures that textures are properly formatted and can also reduce their resolution (file size) without noticeably reducing visual quality.</li>' +
            '<li>Check your mod load order to prevent texture conflicts. Ensure that texture mods are loaded after any mods that alter the same textures.</li>' +
            '<li>Inspect the list of textures mentioned in the crash log. These textures may be associated with specific mods or locations.</li>' +
            '<li>Consider using lower resolution texture packs (e.g., 2K textures) if you experience performance or stability issues. High-resolution textures (e.g., 4K) can strain both your system\'s RAM and VRAM.</li>' +
            '<li>Temporarily disable texture mods associated with the crash location to see if the issue is resolved.</li>' +
            '<li>Consult Skyrim modding forums and communities for specific advice related to texture troubleshooting.</li>' +
            '<li>List of mentioned textures: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">' +
            extractSkyrimTexturePathsToListItems(logsTopHalf) +
            '</ul></ol></li>';
        insightsCount++;
    }




    insights += '</ul><h5>Mod-specific Issues:</h5><ul>';

    //Monster Mod
    if (logsFirstLine.includes('5999C7') || logsFirstLine.includes('D02C2C')) {
        insights += '<li>❓ <b>5999C7 or D02C2C Detected:</b> These errors are often related to <b>"Monster Mod.esp"</b>. This mod is commonly thought to cause numerous errors and crashes to desktop (CTD), even with unofficial patches and the latest updates. If you prefer to keep the mod, consider the following steps:<ol>' +
            '<li>Ensure you have the latest version of the mod installed.</li>' +
            '<li>Apply any available unofficial patches that may address known issues.</li>' +
            '<li>Check for compatibility with other mods and load order. ⚠️Note: Avoid using tools like LOOT with Nolvus.</li>' +
            '<li>If crashes persist, consider removing the mod and cleaning your save file with a tool like FallrimTools.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //Lanterns Of Skyrim II
    if (logsTopHalf.toLowerCase().includes('lanterns\\lantern.dds') || logsTopHalf.toLowerCase().includes('Lanterns Of Skyrim II.esm'.toLowerCase())) {
        insights += '<li>❓ <b>Possible Lanterns Of Skyrim II Issue Detected:</b> If you\'re using both the mods "Lanterns of Skyrim II" (LoS II) and "JK Skyrim," exercise caution when installing the "No Lights Patch." The LoS II patch is specifically designed to be used without the "No Lights Patch." Installing both may lead to conflicts or unexpected behavior related to lantern textures and lighting in your game. To avoid issues, follow these steps:<ol>' +
            '<li>Check the mod descriptions and compatibility notes for both "Lanterns of Skyrim II" and "JK Skyrim."</li>' +
            '<li>If you intend to use the "No Lights Patch," ensure that it is compatible with both mods.</li>' +
            '<li>If conflicts persist, consider using alternative patches or adjusting your mod load order.</li>' +
            '<li>Note: "Lanterns of Skyrim II" mod is not present in vanilla Nolvus.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //ImprovedCameraSE
    if (logsTopHalf.toLowerCase().includes('ImprovedCameraSE.dll'.toLowerCase())) {
        insights += '<li>❓ <b>ImprovedCameraSE.dll+ Issue Detected:</b> The presence of \'ImprovedCameraSE.dll+\' in the crash log indicates an error related to the **Improved Camera SE** mod. This mod enhances the in-game camera functionality, allowing for more dynamic and immersive views. However, pinpointing the exact cause of this error can be challenging. Here are some potential solutions to consider:<ol>' +
            '<li>Add \'-forcesteamloader\' to your SKSE (Skyrim Script Extender) launch arguments. This flag ensures that SKSE uses the Steam loader, which can resolve compatibility issues with certain mods.</li>' +
            '<li>Modify ReShade\'s INI file: Look for the \'MenuMode\' setting and change it to \'0\'. This adjustment might prevent conflicts between ReShade and Improved Camera SE.</li>' +
            '<li>If issues persist, seek assistance on the mod\'s support page or community forums. Other users may have encountered similar problems and can provide specific advice.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    /* 	DISABLED: as (1) is well tested as part of vanilla Nolvus, (2) doesn't have a specific fix, and (3) is not a common issue (if at all?)
        //Skyrim Unbound
        if (logsTopHalf.includes('Skyrim unbound')) {
            insights += '<li><b>Skyrim Unbound Issue Detected:</b> The mention of \'Skyrim Unbound\' in the crash log indicates a potential issue related to this mod. If you\'re experiencing problems, consider installing one of the available fixes specifically designed for Skyrim Unbound. These fixes address common issues and enhance compatibility with other mods.</li>';
            insightsCount++;
        }
    */


    //SimplestHorses.esp
    if (logsRelevantObjectsSection.toLowerCase().includes('SimplestHorses.esp'.toLowerCase())) {
        insights += '<li>❓ <b>Potential Conflict with Simplest Horses:</b> Crashes may occur due to conflicts between Simplest Horses and other mods, especially when custom lists are involved. To address this, you can: <ul><li>Command your horse to wait at a location before fast traveling. Press the "H" hotkey while not targeting your horse to make it wait.</li><li>Disable horse followers in the Mod Configuration Menu (MCM) of your follower framework (e.g., Nether\'s Follower Framework in Nolvus).</li><li>If the issue still persists, consider disabling recently added mods or the following mods: <ol><li>Simplest Horses</li><li>Simplest Horses - Animated Whistling Patch</li></ol></li></ul></li>';
        insightsCount++;
    }

    //Animated Ice Floes.esp
    if (logsRelevantObjectsSection.toLowerCase().includes('Animated Ice Floes.esp'.toLowerCase())) {
        insights += '<li>❓ <b>Potential Conflict with Animated Ice Floes:</b> This crash occurs on customized lists and is speculated to be the result of a conflict between Animated Ice Floes and certain additional mods. If issue persists try disabling either your recently added mod(s), or the Animated Ice Floes mod.</li>';
        insightsCount++;
    }


    insights += '</ul><h5>Miscellaneous Issues:</h5><ul>';

    //Shadowrend
    if (logsRelevantObjectsSection.toLowerCase().includes('ccbgssse018-shadowrend.esl')) {
        insights += '<li>❓ <b>Possible Shadowrend Crash Detected:</b> The presence of \'ccbgssse018-shadowrend.esl\' in the crash log suggests an issue related to the Shadowrend weapon. To address this issue:<ol>' +
            '<li>Load an earlier save that predates the crash.</li>' +
            '<li>Travel to a different cell (area) from where the original crash occurred.</li>' +
            '<li>Play for a few in-game days away from the area where Shadowrend is involved. This may allow the issue to resolve itself.</li>' +
            '<li><b>Be cautious</b> when loading a save that previously experienced the Shadowrend crash. Continuing to play on such a save might compound the issue, leading to more frequent crashes.</li>' +
            '<li>Note that while Shadowrend often appears in crash logs, it may not always be the direct cause of the crash. Other factors, such as load order conflicts, can also contribute.</li>' +
            '</ol>For more detailed information and troubleshooting tips, refer to the <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-6">Shadowrend Crash section</a> on the Nolvus support page.</li>';
        insightsCount++;
    }

    //Forced Termination
    if (logsFirstLine.includes('0CB748E')) {
        insights += '<li>❓ <b>0CB748E Detected:</b>This type of crash is often not indicative of a problem within the game itself but rather the result of the game\'s process being <b>forcibly terminated</b>. When Skyrim is closed in this manner, it doesn\’t go through the normal shutdown sequence, which can result in incomplete or corrupted data being written to the crash log.</li>';
        insightsCount++;
    }

    //Animation Issue
    if (logsFirstLine.includes('67B88B')) {
        insights += '<li>❓ <b>67B88B Detected:</b> This error is often linked to issues with the <b>"AnimationGraphManagerHolder"</b> callstack, which can occur when there are conflicts between animation mods or when an animation mod fails to overwrite vanilla animations properly. To resolve this:<ol>' +
            '<li>Regenerate animations using FNIS (Fores New Idles in Skyrim) or Nemesis (as is used by vanilla Nolvus).  Follow these instructions for <a href="https://www.nolvus.net/guide/asc/output/nemesis">regenerating Nemesis for Nolvus</a>.</li>' +
            '<li>Ensure that the FNIS.esp file is not deleted, as it is generated by FNIS/Nemesis and is necessary for the animations to work correctly.</li>' +
            '<li>Check for updates or patches for your animation mods, especially if you have recently installed or updated other mods that may affect animations.</li>' +
            '<li>If the issue persists, consider disabling recent animation mods one by one to identify the culprit.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //SSE Engine Fixes and Equipment Durability System
    if (logsFirstLine.includes('7428B1')) {
        insights += '<li>❓ <b>7428B1 Detected:</b> This error is often connected to issues with the <b>"SSE Engine Fixes"</b> mod. To troubleshoot, consider the following steps:<ol>' +
            '<li>Check if you are using the <b>"Equipment Durability System"</b> mod, which can cause issues when an enchanted weapon breaks.</li>' +
            '<li>Look for conflicts with other mods that modify characters while they are holding a weapon. This includes mods that alter animations, equipment, or character models.</li>' +
            '<li>Ensure that "SSE Engine Fixes" is properly installed and configured according to the latest instructions provided by the mod author.</li>' +
            '<li>If the problem persists, try disabling the "Equipment Durability System" mod and any other recently added mods one by one to identify the conflict.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //SSE Engine Fixes and SSE Display Tweaks
    if (logsFirstLine.includes('8BDA97')) {
        insights += '<li>❓ <b>8BDA97 Detected:</b> This error may be due to a conflict between <b>"SSE Engine Fixes" and "SSE Display Tweaks"</b> mods. To address this issue:<ol>' +
            '<li>Review the settings in both mods and ensure they are not set to override each other.</li>' +
            '<li>Consult the documentation for each mod to understand the recommended settings for compatibility.</li>' +
            '<li>Check for any updates or patches that might resolve known conflicts between these mods.</li>' +
            '<li>If the issue persists, consider using one mod at a time to identify which settings are causing the conflict.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //Hotkeys
    if (logsFirstLine.includes('C1315C')) {
        insights += '<li>❓ <b>C1315C Detected:</b> This error is often related to modifications in the "controlmap.txt" file, which can be altered by mods that utilize <b>hotkeys</b>. To troubleshoot this issue:<ol>' +
            '<li>Identify any mods that have been recently installed or updated, which may modify the "controlmap.txt" file.</li>' +
            '<li>Check the mod descriptions and documentation for any known issues or specific instructions regarding the "controlmap.txt" file.</li>' +
            '<li>Consider reverting "controlmap.txt" to its original state or using a backup if available.</li>' +
            '<li>If the problem persists, disable the suspected mods one by one to identify the culprit.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //Save game issues
    if (logsFirstLine.includes('D2B923')) {
        insights += '<li>❓ <b>D2B923 Detected:</b> This error is often linked to <b>save game issues</b>. It may be associated with mods that alter the save system, such as "Save System Overhaul (SSO)" or "Alternate Start - Live Another Life (LAL)". A potential fix for users experiencing flashing savegame entries with SkyUI SE is the "SkyUI SE - Flashing Savegames Fix". If you\'re using a version of Skyrim SE or AE before v1.6.1130, this fix should work. For later versions, the "SkyUI SE - Difficulty Persistence Fix" is recommended, which includes the flashing savegames fix. Also, if you aren\'t aware of (and diligently following) <b>Jerilith\'s Safe Save Guide</b>, review it at <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-5">Save Bloat Crash</a/>.</li>';
        insightsCount++;
    }

    //Save game issue 2
    if (logsTopHalf.toLowerCase().includes('BGSSaveLoadManager'.toLowerCase())) {
        insights += '<li>❓ <b>BGSSaveLoadManager Issue Detected:</b> This error is associated with problems in the <b>save game</b> system. If you aren\'t aware of (and diligently following) <b>Jerilith\'s Safe Save Guide</b>, review it at <a href="https://www.nolvus.net/catalog/crashlog?acc=accordion-1-5">Save Bloat Crash</a/>. Issue may manifest as corrupted saves or issues when loading games. To potentially resolve this, you can try the following after loading the last working save:<ol>' +
            '<li>Open the console in-game by pressing the tilde (~) key.</li>' +
            '<li>Type the command "player.kill" and press Enter. This will kill your character and force the game to reload.</li>' +
            '<li>After the game reloads, check if the issue with saving or loading persists.</li>' +
            '<li>If problems continue, consider reverting to an earlier save or using save cleaning tools to remove orphaned scripts and other potential corruptions.</li>' +
            '<li>Always keep backups of your saves before attempting fixes or using cleaning tools.</li>' +
            '</ol>Note: This method is experimental and may not work for all users. It is recommended to seek further assistance from the Skyrim modding community if save game issues are persistent.</li>';
        insightsCount++;
    }

    //SKSE
    if (logsTopHalf.toLowerCase().includes('skse64_loader.exe')) {
        insights += '<li>❓ <b>skse64_loader.exe Issue Detected:</b> This entry suggests that there may be an issue with <b>SKSE (Skyrim Script Extender)</b> or a mod that utilizes it. Common troubleshooting steps include:<ol>' +
            '<li>Ensuring that SKSE is properly installed and that you are launching Skyrim through the SKSE launcher.</li>' +
            '<li>Checking that your version of SKSE matches your version of Skyrim SE/AE.</li>' +
            '<li>Verifying that all mods dependent on SKSE are up to date and compatible with your current game version.</li>' +
            '<li>Running Skyrim as an administrator, which can sometimes resolve permission issues with SKSE.</li>' +
            '<li>Adding exceptions for SKSE and your mod manager in your security software to prevent interference.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //HDT-SMP (Skinned Mesh Physics)
    if (logsTopHalf.toLowerCase().includes('hdtSMP64.dll'.toLowerCase())) {
        insights += '<li>❓ <b>hdtSMP64.dll Issue Detected:</b> Frequent occurrences of this error might suggest a configuration issue or indicate <b>physics</b> issues with NPCs wearing <b>HDT/SMP</b> enabled armor/clothing/hair. To troubleshoot this issue:<ol>' +
            '<li>Ensure that \'hdtSMP64.dll\' is compatible with your installed versions of SkyrimSE.exe and SKSE. Incompatible DLLs can lead to crashes.</li>' +
            '<li>Check for any recent updates or patches for the mod associated with \'hdtSMP64.dll\'.</li>' +
            '<li>Review your mod configuration settings, especially those related to HDT/SMP, to ensure they are set up correctly.</li>' +
            '<li><b>Workaround:</b> Sometimes, wearing all non-physics armor/clothing/wigs/equipment can alleviate problems with physics. Also, if you or a follower has physics-enabled hair, try wearing a non-physics helmet to cover it up.</li>' +
            '<li><b>Alternatively,</b> reinstall Nolvus without Advanced Physics to prevent any such future issues.</li>' +
            '<li>If the issue persists, consider disabling mods that use HDT/SMP one by one to identify the source of the problem.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //cbp.dll Issue
    if (logsTopHalf.toLowerCase().includes('cbp.dll')) {
        insights += '<li>❓ <b>cbp.dll Issue Detected:</b> Frequent appearances of this error might suggest a configuration issue or indicate <b>physics</b> issues with NPCs are wearing <b>SMP/CBP</b> enabled clothing. To troubleshoot this issue:<ol>' +
            '<li>Ensure that \'cbp.dll\' is compatible with your installed versions of SkyrimSE.exe and SKSE. Incompatible DLLs can lead to crashes.</li>' +
            '<li>Check for any recent updates or patches for the mod associated with \'cbp.dll\'.</li>' +
            '<li>Review your mod configuration settings, especially those related to CBP, to ensure they are set up correctly.</li>' +
            '<li><b>Workaround:</b> Sometimes, wearing all non-physics armor/clothing/wigs/equipment can alleviate problems with physics. Also, if you or a follower has physics-enabled hair, try wearing a non-physics helmet to cover it up</li>' +
            '<li><b>Alternatively,</b> reinstall Nolvus without Advanced Physics to prevent any such future issues.</li>' +
            '<li>If the issue persists, consider disabling mods that use CBP one by one to identify the source of the problem.</li>' +
            '<li>Some users have reported success by restarting their PC, renaming \'cbp.dll\' to something else to force a different load order, or verifying the integrity of game files on Steam if there\'s a suspicion of file corruption.</li>' +
            '</ol></li>';
        insightsCount++;
    }


    //0x0 on thread (Lighting or Shadows)
    if (logsTopHalf.toLowerCase().includes('0x0 on thread')) {
        insights += '<li>❓ <b>0x0 on thread Issue Detected:</b> This rare engine issue is often related to face lighting or shadow problems. To mitigate this issue, follow these steps:<ol>' +
            '<li>Ensure you have the latest version of <a href="https://www.nexusmods.com/skyrimspecialedition/mods/17230">SSE Engine Fixes</a> installed. Engine Fixes addresses various bugs and patches issues in Skyrim Special Edition.</li>' +
            '<li>Check for any conflicting mods that may affect lighting or shadows. Disable or adjust mods related to lighting, weather, or visual enhancements.</li>' +
            '<li>Verify that your graphics drivers are up-to-date, as outdated drivers can sometimes cause graphical glitches.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //HUD
    //Merged with test thought up by AI (MS Bing Copilot):
    const hudRelatedRegex = /HUD|menus|maps/ig;
    var hudRelatedMatches = logsTopHalf.match(hudRelatedRegex) || [];
    if (hudRelatedMatches.length > 0) {
        insights += '<li>❓ <b>HUD Issue Detected:</b> The error suggests a conflict with your HUD/UI. To troubleshoot this issue, consider the following steps:<ol>' +
            '<li>Check for any mods that alter the HUD or user interface. Disable or adjust these mods to see if the issue persists.</li>' +
            '<li>Ensure that you have the latest version of SkyUI installed. Sometimes outdated versions can cause HUD-related problems.</li>' +
            '<li>Verify that your SKSE (Skyrim Script Extender) is up-to-date, as it\'s essential for many mods, including SkyUI.</li>' +
            '<li>If you\'re using other HUD-related mods, ensure they are compatible and load them in the correct order.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //XPMSE
    if (logsTopHalf.toLowerCase().includes('XPMSE'.toLowerCase())) {
        insights += '<li>❓ <b>XPMSE Issue Detected:</b> The mention of \'XPMSE\' in the crash log suggests a potential conflict or issue with the XP32 Maximum Skeleton Extended mod or its dependencies. This mod is crucial for animation support and is often required by other mods that add or modify character animations. To address this issue, consider the following steps:<ol>' +
            '<li>Ensure that XPMSE is installed correctly and is loaded at the correct point in your mod load order.</li>' +
            '<li>Verify that all mods requiring XPMSE as a dependency are compatible with the version you have installed.</li>' +
            '<li>Update XPMSE and any related mods to their latest versions.</li>' +
            '<li>If you have recently added or removed mods, check for any that might affect skeleton or animation files and adjust accordingly.</li>' +
            '<li>Consult the mod descriptions and community forums for specific troubleshooting steps related to XPMSE.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    //XAudio
    if (logsTopHalf.toLowerCase().includes('XAudio'.toLowerCase())) {
        insights += '<li>❓ <b>XAudio Issue Detected:</b> The \'XAudio\' error indicates a problem with the game\'s audio processing components. XAudio is a part of the Windows audio infrastructure, separate from DirectX. To resolve audio issues, follow these steps:<ol>' +
            '<li>Download and install the latest version of the XAudio redistributable that is compatible with your operating system.</li>' +
            '<li>Ensure your sound card drivers are up to date. Visit the manufacturer\'s website for the latest driver software.</li>' +
            '<li>If you\'re using audio mods, verify their compatibility with your version of Skyrim and other installed mods.</li>' +
            '<li>Check the game\'s audio settings and adjust them if necessary. Sometimes, changing the audio format can resolve issues.</li>' +
            '<li>Consult the Skyrim modding community forums for specific solutions to XAudio-related errors.</li>' +
            '</ol></li>';
        insightsCount++;
    }


    //keyboard
    if (logsTopHalf.toLowerCase().includes('bswin32keyboarddevice')) {
        insights += '<li>❓ <b>bswin32keyboarddevice Issue Detected:</b> The error related to \'bswin32keyboarddevice\' typically indicates a problem with the keyboard input system within the game. While this issue can sometimes be resolved with a simple computer restart, there are additional steps you can take if the problem persists:<ol>' +
            '<li>Restart your computer to refresh the system and potentially resolve any temporary conflicts.</li>' +
            '<li>Check for update	s to your keyboard drivers and install them if available.</li>' +
            '<li>Ensure that Skyrim and any related mods are up to date.</li>' +
            '<li>If you are using mods that affect keyboard inputs or hotkeys, verify their compatibility and settings.</li>' +
            '<li>Consult the modding community forums for any known issues with \'bswin32keyboarddevice\' and potential fixes.</li>' +
            '</ol></li>';
        insightsCount++;
    }


    //DynDOLOD
    if (logsTopHalf.toLowerCase().includes('DynDOLOD.esm'.toLowerCase())) {
        insights += '<li>❓ <b>DynDOLOD.esm Issue Detected:</b> The \'DynDOLOD.esm\' error is known to cause crashes to desktop (CTDs) when transitioning between locations, especially when autosave occurs concurrently with script execution. This can be due to the mod making extensive changes to the game\'s LOD (Level of Detail) which can be resource-intensive. To mitigate this issue:<ol>' +
            '<li>Disable autosave in the game settings, particularly when changing locations or fast traveling.</li>' +
            '<li>Manually save your game at regular intervals to avoid losing progress.</li>' +
            '<li>Ensure that \'DynDOLOD.esm\' is properly installed and that you have the latest version.</li>' +
            '<li>Check for any updates or patches that may address known issues with this mod.</li>' +
            '<li>Consider <a href="https://www.nolvus.net/guide/asc/output/dyndolod">regenning DynDOLOD</a>?</li>' +
            '<li>If the problem persists, seek assistance on the mod\'s official support forum. Provide detailed information about your issue and any relevant crash logs for further investigation.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    // Check thought up by AI (MS Bing Copilot):
    //ObjectReference Issues
    const objectReferenceRegex = /kDeleted|TESLevItem/ig;
    var objectReferenceMatches = logsTopHalf.match(objectReferenceRegex) || [];
    if (objectReferenceMatches.length > 0) {
        insights += '<li>❓ <b>ObjectReference Issues Detected:</b> The presence of ' + objectReferenceMatches.length + ' ObjectReference keyword(s) suggests crashes related to specific objects or records. To troubleshoot this:<ol>' +
            '<li>Search the crash log for keywords like <b>"kDeleted"</b> or <b>"TESLevItem"</b> which indicate missing or corrupted game objects.</li>' +
            '<li>Review the involved plugins (mods) and their load order to ensure there are no conflicts or missing dependencies.</li>' +
            '<li>Use mod management tools to verify the integrity of the mods and resolve any conflicts.</li>' +
            '<li>If a particular object or record is consistently involved in crashes, consider removing or replacing the mod that contains it.</li>' +
            '</ol></li>';
        insightsCount++;
    }

    // Horse Follower Pathing Issue
    if (logsTopHalf.includes('Pathing') &&
        (logsRelevantObjectsSection.toLowerCase().includes('horse') ||
            logsRelevantObjectsSection.toLowerCase().includes('pony') ||
            logsRelevantObjectsSection.toLowerCase().includes('mount'))) {
        insights += '<li>❓ <b>Horse Follower Pathing Issue:</b> This crash may occur when horse or pony followers encounter pathfinding issues to reach the player character. To mitigate this, consider the following steps: <ul><li>Disable horse followers in the Mod Configuration Menu (MCM) of your follower framework (e.g., Nether\'s Follower Framework in Nolvus).</li><li>Command your horse to wait at a location before initiating fast travel.</li></ul></li>';
        insightsCount++; // Increment the count of insights detected
    }

    /*DISABLED UNTIL I CAN FIND EXAMPLES SO I CAN LIST THE MISSING/CORRUPTED OBJECTS:
          // Check thought up by AI (MS Bing Copilot):
        //ObjectReference Issues 2
        if (objectReferenceMatches.length > 0) {
            const missingOrCorruptedObjects = objectReferenceMatches.map(match => match === 'kDeleted' ? 'missing' : 'corrupted');
            const uniqueObjects = [...new Set(missingOrCorruptedObjects)];
	
            insights += '<li><b>ObjectReference Issues Detected:</b> The presence of ' + objectReferenceMatches.length + ' ObjectReference keyword(s) suggests crashes related to specific objects or records. To troubleshoot this:<ol>' +
                '<li>Search the crash log for keywords like <b>"kDeleted"</b> or <b>"TESLevItem"</b> which indicate ' + (uniqueObjects.length === 1 ? 'the following issue:' : 'the following issues:') + '</li>' +
                '<li><ul>';
	
            if (uniqueObjects.includes('missing')) {
                insights += '<li><b>Missing Objects:</b> These "missing" objects are referenced but not found in the game. Check if any required mods or assets are missing or disabled.</li>';
            }
	
            if (uniqueObjects.includes('corrupted')) {
                insights += '<li><b>Corrupted Objects:</b> These "corrupted" objects may be damaged or incorrectly modified. Investigate the involved plugins (mods) and their load order.</li>';
            }
	
            insights += '</ul></li>' +
                '<li>Use mod management tools to verify the integrity of the mods and resolve any conflicts.</li>' +
                '<li>If a particular object or record is consistently involved in crashes, consider removing or replacing the mod that contains it.</li>' +
                '</ol></li>';
            insightsCount++;
        } */


    /* 	DISABLED TEST ... AI thought it up, and I can't even get it to throw even on a mockup test.log and even with AI's help
        //WILL THIS ONE EVER ACTUALLY FIND ANYTHING?
        // Check thought up by AI (MS Bing Copilot):
        //File Format Version Mismatch
        const frameworkVersionRegex = /ApplicationVersion: (\\d+\\.\\d+\\.\\d+\\.\\d+)/;
        var frameworkVersionMatch = logsTopHalf.match(frameworkVersionRegex);
        var gameVersion = frameworkVersionMatch ? frameworkVersionMatch[1] : 'unknown'; // Fallback to 'unknown' if not found
	
        const fileFormatVersionMismatchRegex = /File Format Version: (\\d+\\.\\d+)/g;
        var fileFormatVersionMatches = logsTopHalf.match(fileFormatVersionMismatchRegex) || [];
	
        if (fileFormatVersionMatches.length > 0 && gameVersion !== 'unknown') {
            var mismatchedFiles = fileFormatVersionMatches.filter(match => !match.includes(gameVersion));
            insights += '<li><b>File Format Version Mismatch Detected:</b> Incompatible file format versions can lead to crashes. To troubleshoot:<ol>' +
                '<li>Check the file format versions listed in the crash log against your game version (' + gameVersion + ').</li>' +
                '<li>If mismatches are found, consider updating the files or mods to ensure compatibility.</li>' +
                '<li>Installing <a href=\\"https://www.nexusmods.com/skyrimspecialedition/mods/21146\\">Backported Extended ESL Support (BEES)</a> may help load older files safely.</li>' +
                '</ol>' +
                (mismatchedFiles.length > 0 ? '<p>The following file(s) have mismatched versions:</p><ul>' + mismatchedFiles.map(file => '<li>' + file + '</li>').join('') + '</ul>' : '') +
                '</li>';
            insightsCount++;
        } END DISABLED TEST */




    var outputHtml = '<ul>' + diagnoses + '</ul>';
    document.getElementById('result').innerHTML = outputHtml;

    if (document.getElementById('speculativeInsights').checked) {
        if (insights.trim() !== '') {
            outputHtml = '<h4>For Advanced Users:</h4>⚠️<b>CAUTION:</b> some of the instructions below (and a few of their tests) were generated by an AI system ... so they could potentially be giving bad advice. If you aren\'t confident in what you are doing, please consult with the Nolvus modding community before making any significant changes to mods added by vanilla Nolvus.' + insights + '</ul>';
            showH4();
            document.getElementById('speculation').innerHTML = outputHtml;
        }
    }

    console.log('diagnosesCount:', diagnosesCount);
    console.log('insightsCount:', insightsCount);
    console.log('insightsCount - diagnosesCount =', insightsCount - diagnosesCount);

    showCopyDiagnosesButton();
    addEmojiClickEvent();
}


