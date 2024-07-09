// nolvusUtils.js

// Create a global NolvusUtils object
window.NolvusUtils = {};

// Utility functions
NolvusUtils.compareLogToVanillaNolvusPluginsLines = async function(crashLog) {
    try {
        const [vanillaNolvusPluginsResponse, nonVanillaPluginsResponse] = await Promise.all([
            fetch('https://raw.githubusercontent.com/Phostwood/crash-analyzer/main/vanillaNolvusPlugins.txt'),
            fetch('https://raw.githubusercontent.com/Phostwood/crash-analyzer/main/nonVanillaPlugins.txt')
        ]);

        const [vanillaNolvusPluginsData, nonVanillaPluginsData] = await Promise.all([
            vanillaNolvusPluginsResponse.text(),
            nonVanillaPluginsResponse.text()
        ]);

        const vanillaNolvusPlugins = vanillaNolvusPluginsData.split('\n').map(line => line.trim());
        const nonVanillaPlugins = nonVanillaPluginsData.split('\n').map(line => line.trim().toLowerCase());

        const gamePluginsRegex = /Game plugins \(\d+\)\s*\{([\s\S]*?)}/;
        var gamePluginsMatch = crashLog.match(gamePluginsRegex);
        var gamePluginsSection = gamePluginsMatch ? gamePluginsMatch[1] : '';
        const pluginsInCrashLog = gamePluginsSection.split('\n');

        const vanillaPluginsInCrashLog = [];
        const nonVanillaPluginsInCrashLog = [];
        const allPluginsInCrashLog = [];
        const possibleReduxPluginInCrashLog = [];
        const missingPluginsInCrashLog = [];

        pluginsInCrashLog.forEach((line, index) => {
            if (line.includes(']')) {
                const pluginName = line.substring(line.indexOf(']') + 1).trim().toLowerCase();
                allPluginsInCrashLog.push(pluginName);
                if (vanillaNolvusPlugins.includes(pluginName)) {
                    vanillaPluginsInCrashLog.push(pluginName);
                } else {
                    nonVanillaPluginsInCrashLog.push(pluginName);
                }
            } else {
                missingPluginsInCrashLog.push(line);
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

        const nonVanillaPluginsInCrashLogString = nonVanillaPluginsInCrashLog.join('\n');
        const allPluginsInCrashLogString = allPluginsInCrashLog.join('\n');

        Utils.debuggingLog(['compareLogToVanillaNolvusPluginsLines', 'nolvusUtils.js'], `Possibly non-vanilla plugins (${nonVanillaPluginsInCrashLog.length}):\n${nonVanillaPluginsInCrashLogString}`);
        Utils.debuggingLog(['compareLogToVanillaNolvusPluginsLines', 'nolvusUtils.js'], `All plugins (${allPluginsInCrashLog.length}):\n${allPluginsInCrashLogString}`);
        Utils.debuggingLog(['compareLogToVanillaNolvusPluginsLines', 'nolvusUtils.js'], 'possibleReduxPluginInCrashLog:', possibleReduxPluginInCrashLog);
        Utils.debuggingLog(['compareLogToVanillaNolvusPluginsLines', 'nolvusUtils.js'], 'Badly ordered vanilla plugins:', badlyOrderedVanillaPluginsInCrashLog);
        Utils.debuggingLog(['compareLogToVanillaNolvusPluginsLines', 'nolvusUtils.js'], 'Presumably-empty lines in crash log:', missingPluginsInCrashLog);

        return {
            nonVanillaPluginsInCrashLog,
            allPluginsInCrashLog,
            badlyOrderedVanillaPluginsInCrashLog,
            missingPluginsInCrashLog
        };
    } catch (error) {
        console.error(error);
        return {
            nonVanillaPluginsInCrashLog: [],
            allPluginsInCrashLog: [],
            badlyOrderedVanillaPluginsInCrashLog: [],
            missingPluginsInCrashLog: []
        };
    }
};


NolvusUtils.compareLogToVanillaNolvusModulesLines = async function(crashLog) {
    try {
        const response = await fetch('https://raw.githubusercontent.com/Phostwood/crash-analyzer/main/vanillaNolvusModules.txt');
        const data = await response.text();
        const vanillaNolvusModulesLines = data.split('\n').map(line => line.trim());

        const modulesRegex = /Modules\s*\{([\s\S]*?)}/;
        var modulesMatch = crashLog.match(modulesRegex);
        var modulesSection = modulesMatch ? modulesMatch[1] : '';
        const modulesLines = modulesSection.split('\n');

        const nonVanillaModules = [];
        const possibleReduxFlags = [];
        // const badlyOrderedVanillaModules = [];

        modulesLines.forEach((line, index) => {
            if (line.includes(':')) {
                const moduleName = line.substring(0, line.indexOf(':')).trim().toLowerCase();
                if (!vanillaNolvusModulesLines.includes(moduleName)) {
                    nonVanillaModules.push(moduleName);
                }
                // Commented out badlyOrderedVanillaModules logic as it's not being used
                // else {
                //     const nextVanillaModule = vanillaNolvusModulesLines[vanillaNolvusModulesLines.indexOf(moduleName) + 1];
                //     if (nextVanillaModule && !modulesLines.slice(index + 1).some(line => line.toLowerCase().includes(nextVanillaModule))) {
                //         badlyOrderedVanillaModules.push(moduleName);
                //     }
                // }
            } else {
                console.error('A line does not contain a module name:', line);
            }
        });

        // nonVanillaModules.sort(); // Commented out as per //LATER: comment

        const nonVanillaModulesString = nonVanillaModules.join('\n');

        Utils.debuggingLog(['compareLogToVanillaNolvusModulesLines', 'nolvusUtils.js'], `Possibly non-vanilla modules (${nonVanillaModules.length}):\n${nonVanillaModulesString}`);
        Utils.debuggingLog(['compareLogToVanillaNolvusModulesLines', 'nolvusUtils.js'], 'possibleReduxFlags:', possibleReduxFlags);
        // Utils.debuggingLog(['compareLogToVanillaNolvusModulesLines', 'nolvusUtils.js'], 'badlyOrderedVanillaModules:', badlyOrderedVanillaModules);

        return {
            nonVanillaModules,
            possibleReduxFlags,
            // badlyOrderedVanillaModules
        };
    } catch (error) {
        console.error('Error in compareLogToVanillaNolvusModulesLines:', error);
        return {
            nonVanillaModules: [],
            possibleReduxFlags: [],
            // badlyOrderedVanillaModules: []
        };
    }
};

// You can add more Nolvus-specific utility functions here as needed

// Initialize NolvusUtils
NolvusUtils.init = function() {
    // Any initialization code for NolvusUtils
    Utils.debuggingLog(['nolvusUtils.js'],'NolvusUtils initialized');
};

// Call init function
NolvusUtils.init();