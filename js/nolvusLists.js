// nolvusLists.js
window.NolvusLists = {
    
    generateNolvusLists: async function(logFile, sections) {
        let insights = '';
        let insightsCount = 0;
        let nonNolvusPluginsBelowSynthesis = [];
        let badlyOrderedVanillaPlugins = [];
        let isVanillaNolvus = true;
        let hasBadlyOrganizedNolvusPlugins = false;
        let hasNonNolvusPluginsAtBottom = false;


        if (Utils.countPlugins(sections) > 1 && sections.hasNolvusV5) {
            const nonNolvusGamePluginsResult = await this.getNonNolvusGamePlugins(logFile);
            insights += nonNolvusGamePluginsResult.html;
            insightsCount += nonNolvusGamePluginsResult.count;
            isVanillaNolvus = nonNolvusGamePluginsResult.isVanilla;

            const nonNolvusModulesResult = await this.getNonNolvusModules(logFile);
            insights += nonNolvusModulesResult.html;
            insightsCount += nonNolvusModulesResult.count;

            const nonNolvusGamePluginsBelowSynthesisResult = await this.getNonNolvusGamePluginsBelowSynthesis(logFile);
            insights += nonNolvusGamePluginsBelowSynthesisResult.html;
            insightsCount += nonNolvusGamePluginsBelowSynthesisResult.count;
            hasNonNolvusPluginsAtBottom = nonNolvusGamePluginsBelowSynthesisResult.hasNonNolvusPluginsAtBottom;
            nonNolvusPluginsBelowSynthesis = nonNolvusGamePluginsBelowSynthesisResult.nonNolvusPluginsAtBottom; 


            const badlyOrganizedNolvusPluginsResult = await this.getBadlyOrganizedNolvusPlugins(logFile);
            insights += badlyOrganizedNolvusPluginsResult.html;
            insightsCount += badlyOrganizedNolvusPluginsResult.count;
            hasBadlyOrganizedNolvusPlugins = badlyOrganizedNolvusPluginsResult.hasBadlyOrganized;
            badlyOrderedVanillaPlugins = badlyOrganizedNolvusPluginsResult.badlyOrderedPlugins;
            Utils.debuggingLog(['analyzeLog', 'nolvusLists', 'analyzeLog.js'], 'Nolvus Lists Results', {
                isVanillaNolvus,
                hasBadlyOrganizedNolvusPlugins,
                hasNonNolvusPluginsAtBottom,
                badlyOrderedVanillaPlugins,
            });
        }

        const missingVanillaPluginsResult = await this.getMissingVanillaPlugins(logFile, sections);
        if(missingVanillaPluginsResult) {
            insights += missingVanillaPluginsResult.html;
            insightsCount += missingVanillaPluginsResult.count;
        }

        return { 
            insights, 
            insightsCount, 
            isVanillaNolvus, 
            hasBadlyOrganizedNolvusPlugins,
            hasNonNolvusPluginsAtBottom,
            badlyOrderedVanillaPlugins,
            nonNolvusPluginsBelowSynthesis
        };
    },

    getNonNolvusGamePluginsImpl: async function(crashLog) {
        try {
            const response = await fetch('https://raw.githubusercontent.com/Phostwood/crash-analyzer/main/vanillaNolvusPlugins - Alphabetized.txt');
            const data = await response.text();
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
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    getNonNolvusGamePlugins: async function(logFile) {
        let html = '';
        let count = 0;
        let isVanilla = true;
        try {
            const nonVanillaPlugins = await this.getNonNolvusGamePluginsImpl(logFile);
            const processedPlugins = Utils.replaceWithExplainers(nonVanillaPlugins);
            if (processedPlugins.length > 0) {
                html = this.generateDetailsHtml('Non-Vanilla Nolvus Plugins Detected', processedPlugins);
                this.updateFileFlags(processedPlugins.length);
                isVanilla = false;
                count = 1;
            } else {
                html = '<details><summary>✅ Only Vanilla Nolvus Plugins Detected</summary></details>';
            }
            Utils.debuggingLog(['getNonNolvusGamePlugins', 'nolvusLists.js'], 'nonVanillaPlugins:', processedPlugins);
        } catch (error) {
            console.error(error);
        }
        return { html, count, isVanilla };
    },

    getNonNolvusModulesImpl: async function(crashLog) {
        try {
            const response = await fetch('https://raw.githubusercontent.com/Phostwood/crash-analyzer/main/vanillaNolvusModules.txt');
            const data = await response.text();
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
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    getNonNolvusModules: async function(logFile) {
        let html = '';
        let count = 0;
        try {
            const nonVanillaModules = await this.getNonNolvusModulesImpl(logFile);
            const processedModules = Utils.replaceWithExplainers(nonVanillaModules);
            if (processedModules.length > 0) {
                html = this.generateDetailsHtml('Non-Vanilla Nolvus Modules Detected', processedModules);
                count = 1;
            } else {
                html = '<details><summary>✅ Only Vanilla Nolvus Modules Detected</summary></details>';
            }
            Utils.debuggingLog(['getNonNolvusModules', 'nolvusLists.js'], 'nonVanillaModules:', processedModules);
        } catch (error) {
            console.error(error);
        }
        return { html, count };
    },

    getNonNolvusGamePluginsBelowSynthesisImpl: async function(crashLog) {
        try {
            const response = await fetch('https://raw.githubusercontent.com/Phostwood/crash-analyzer/main/vanillaNolvusPlugins - Alphabetized.txt');
            const data = await response.text();
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

            Utils.debuggingLog(['getNonNolvusGamePluginsBelowSynthesisImpl', 'nolvusLists.js'], 'nonVanillaPluginsAtBottom:', nonVanillaPluginsAtBottom);
            return nonVanillaPluginsAtBottom;
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    getNonNolvusGamePluginsBelowSynthesis: async function(logFile) {
        let html = '';
        let count = 0;
        let hasNonNolvusPluginsAtBottom = false;
        try {
            const nonNolvusPluginsAtBottom = await this.getNonNolvusGamePluginsBelowSynthesisImpl(logFile);
            const processedPlugins = Utils.replaceWithExplainers(nonNolvusPluginsAtBottom);
            if (processedPlugins.length > 0) {
                html = this.generateDetailsHtml('Non-Nolvus Plugins Detected at Bottom', processedPlugins, 'This list identifies non-Nolvus plugins from your game\'s crash log that are loading below <code>synthesis.esp</code>, and thus might be out of their intended load order. Typically, non-Nolvus plugins should be placed above <code>FNIS.esp</code>, but it seems this is not the case here. Please ensure these plugins are positioned as intended.');
                count = 1;
                hasNonNolvusPluginsAtBottom = true;
            } else {
                html = '<details><summary>✅ No non-Nolvus Plugins at Bottom</summary></details>';
            }
            Utils.debuggingLog(['getNonNolvusGamePluginsBelowSynthesis', 'nolvusLists.js'], 'nonNolvusPluginsAtBottom:', processedPlugins);
            return { html, count, hasNonNolvusPluginsAtBottom, nonNolvusPluginsAtBottom };
        } catch (error) {
            console.error(error);
            return { html: '', count: 0, hasNonNolvusPluginsAtBottom: false, nonNolvusPluginsAtBottom: [] };
        }
    },

    getMissingVanillaPluginsImpl: async function(crashLog) {
        try {
            const response = await fetch('https://raw.githubusercontent.com/Phostwood/crash-analyzer/main/vanillaNolvusPlugins - Alphabetized.txt');
            const data = await response.text();
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
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    getMissingVanillaPlugins: async function(logFile, sections) {
        if(!sections.hasNolvusV5) return null;
        let html = '';
        let count = 0;
        try {
            const missingPlugins = await this.getMissingVanillaPluginsImpl(logFile);
            const processedPlugins = Utils.replaceWithExplainers(missingPlugins);
            if (processedPlugins.length > 0) {
                html = this.generateDetailsHtml('Potentially Missing Vanilla Plugins', processedPlugins, 'NOTE: Every Nolvus configuration is likely to be missing at least a few dozen plugins, which are only installed for specific configurations. It appears that even vanilla configurations will likely be missing anywhere from 50 to over 100 plugins. A vanilla install of the Redux variant can be missing over 200 plugins. Moreover, some crashes won\'t include most of the installed plugins in the log file, leading to a list where most, if not all, the vanilla plugins appear as missing. Nonetheless, if you suspect that an important plugin may be missing, this is the place to verify.');
                count = 1;
            } else {
                html = '<details><summary>✅ No Missing Vanilla Plugins Detected</summary></details>';
            }
            Utils.debuggingLog(['getMissingVanillaPlugins', 'nolvusLists.js'], 'missingPlugins:', processedPlugins);
        } catch (error) {
            console.error(error);
        }
        return { html, count };
    },

    getBadlyOrganizedNolvusPluginsImpl: async function(crashLog) {
        try {
            const response = await fetch('https://raw.githubusercontent.com/Phostwood/crash-analyzer/main/vanillaNolvusPlugin-WithStableLocation.txt');
            const data = await response.text();
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
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    getBadlyOrganizedNolvusPlugins: async function(logFile) {
        let html = '';
        let count = 0;
        let hasBadlyOrganized = false;
        let badlyOrderedPlugins = [];
        try {
            badlyOrderedPlugins = await this.getBadlyOrganizedNolvusPluginsImpl(logFile);
            const processedPlugins = Utils.replaceWithExplainers(badlyOrderedPlugins);
            if (processedPlugins.length > 0) {
                html = this.generateDetailsHtml('Possibly Misordered Vanilla Nolvus Plugins', processedPlugins, 'This list identifies Nolvus plugins from your game\'s crash log that may be out of their standard order. It compares the order of plugins in your crash log with the standard order of vanilla Nolvus plugins. The plugins in the list are those that seem to be out of order, which could potentially lead to game crashes. Returning these plugins to their original order may help improve game stability. NOTE: A few may shift slightly with different vanilla configurations.');
                count = 1;
                hasBadlyOrganized = true;
            } else {
                html = '<details><summary>✅ All Vanilla Nolvus Plugins are Well Ordered</summary></details>';
            }
            Utils.debuggingLog(['getBadlyOrganizedNolvusPlugins', 'nolvusLists.js'], 'badlyOrderedVanillaPlugins:', processedPlugins);
        } catch (error) {
            console.error(error);
        }
        return { html, count, hasBadlyOrganized, badlyOrderedPlugins };
    },

    generateDetailsHtml: function(summary, items, description = '') {
        let html = `<details><summary>🔎 ${summary} (<code>${items.length}</code>):<br><code>(click to expand/collapse full list)</code></summary>`;
        if (description) {
            html += description;
        }
        html += '<ul>';
        for (let item of items) {
            html += `<li><code>${item}</code></li>`;
        }
        html += '</ul></details>';
        return html;
    },

    updateFileFlags: function(count) {
        const fileFlags = document.getElementById('fileFlags');
        fileFlags.style.textAlign = "right";
        if (count > 50) {
            fileFlags.innerHTML = `<span style="float: right; white-space: nowrap;">🔧 <code>Customized (<span style="color: red;">${count}</span>)<code></span>`;
        } else {
            fileFlags.innerHTML = `<span style="float: right; white-space: nowrap;">🔧 <code>Customized (${count})<code></span>`;
        }
    }
};