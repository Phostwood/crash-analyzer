// testUtils.js

// Check if Utils object exists, if not, throw an error
if (typeof Utils === 'undefined') {
    console.error('Error: Utils object is not defined. Make sure utils.js is loaded before testUtils.js');
} else {
    // Add new methods to Utils object
    //OLD METHOD: Utils.getPercentAlphabetized = function(passedLogFile) {
        //OLD METHOD: const pluginsRegex = /Game plugins \(\d+\)\s*\{[\s\S]*?\}/;
        //OLD METHOD: var pluginsMatch = passedLogFile.match(pluginsRegex);
        //OLD METHOD: var pluginsSection = pluginsMatch ? pluginsMatch[0] : '';
    
    Utils.getPercentAlphabetized = function(gamePlugins) {
        Utils.debuggingLog(['getPercentAlphabetized', 'testUtils.js'], 'gamePlugins:', gamePlugins);

        var lines = gamePlugins.split('\n').filter(line => line.includes('.esp'));

        var alphabetizedOrderCount = 0;
        var totalEspPlugins = lines.length - 1;

        for (var i = 0; i < totalEspPlugins; i++) {
            var currentPluginMatch = lines[i].match(/^\s*\[.*?\]\s*(.+\.esp)$/i);
            var nextPluginMatch = lines[i + 1].match(/^\s*\[.*?\]\s*(.+\.esp)$/i);

            if (currentPluginMatch && nextPluginMatch) {
                var currentPlugin = currentPluginMatch[1].toLowerCase().trim();
                var nextPlugin = nextPluginMatch[1].toLowerCase().trim();

                if (currentPlugin.localeCompare(nextPlugin) < 0) {
                    alphabetizedOrderCount++;
                    this.debuggingLog(['getPercentAlphabetized', 'testUtils.js'], currentPlugin + ' is alphabetized before ' + nextPlugin);
                }
            } else {
                console.error('A line does not contain a .esp file name:', lines[i]);
            }
        }

        var percentAlphabetized = (alphabetizedOrderCount / totalEspPlugins) * 100;
        this.debuggingLog(['getPercentAlphabetized', 'testUtils.js'], 'percentAlphabetized:', percentAlphabetized);

        return percentAlphabetized.toFixed(2);
    };

    Utils.extractNifPathsToListItems = function(logText) {
        const fileRegex = /"([^"]+\.(nif|tri))"/g;
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
        return this.processListItems([...pathsSet]);
    };

    Utils.extractHkxPathsToListItems = function(logText) {
        const fileRegex = /"([^"]+\.hkx)"/gi;
        let match;
        const pathsSet = new Set();
    
        while ((match = fileRegex.exec(logText)) !== null) {
            pathsSet.add(match[1]);
        }
    
        // If no matches were found, add the no animations found message to the set
        if (pathsSet.size === 0) {
            pathsSet.add('(no animation files found in crash log ... consider decompressing relevant .bsa archives)');
        }
    
        const hkbRegex = /hkbBehaviorGraph\((Name: `[^`]+`)\)/gi;
        const animGraphRegex = /BShkbAnimationGraph\((Name: `[^`]+`)\)/gi;
    
    
        // Check for names using the two regexes and add their group matches to the pathsSet
        while ((match = hkbRegex.exec(logText)) !== null) {
            pathsSet.add(match[1]);
        }
        while ((match = animGraphRegex.exec(logText)) !== null) {
            pathsSet.add(match[1]);
        }
    
        // Convert the Set back to an array and process to list items
        return this.processListItems([...pathsSet]);
    };


    Utils.extractSkyrimTexturePathsToListItems = function(logText) {
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
        return this.processListItems([...pathsSet]);
    };

    Utils.processListItems = function(listItems) {
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
    };

    Utils.replaceWithExplainers = function(fileList) {
        return fileList.map(file => {
            const lowerCaseFile = file.toLowerCase();
            const explanation = this.explainersMap.get(lowerCaseFile);
            return explanation ? `${file} ${explanation}` : file;
        });
    };

    // You can add more test-related utility functions here
}


// Reusable Diagnosis Strings:

Utils.LootIfSkyrim = '';
Utils.LootListItemIfSkyrim = '';
Utils.LootWarningForNolvus = '';
Utils.NolvusOrSkyrimText = '';

if (Utils.isSkyrimPage) {
    const lootDescription = 'Try using <a href="https://loot.github.io/">LOOT</a> as a <b>diagnostic tool</b>. ' +
    '⚠️Caution: LOOT can safely be used as a diagnostic tool or for load order suggestions, ' +
    'but its automatic load order reorganization is often discouraged. ' +
    'It\'s widely thought to incorrectly sort 5 to 10% of mods, ' +
    'which can be especially problematic with large mod lists.';

    Utils.LootIfSkyrim = lootDescription;
    Utils.LootListItemIfSkyrim = `<li>${lootDescription}</li>`;
    Utils.NolvusOrSkyrimText = 'Skyrim';

} else {
   Utils.LootWarningForNolvus = ' ⚠️Note: Avoid auto-sorting Nolvus with tools like LOOT.';
   Utils.NolvusOrSkyrimText = 'Nolvus';

}