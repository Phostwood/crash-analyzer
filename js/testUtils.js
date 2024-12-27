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


    // Standalone function to process list items
    function processListItems(items) {
        //NOTE this is DIFFERENT from Utils.processListItems()
        // Check if items is not an array, convert to array by splitting the string using <li> tag
        if (!Array.isArray(items)) {
            items = items.split(/<li>|<\/li>/).filter(item => item.trim() !== '');
        }
        return items.map(item => `<li>${item}</li>`).join('');
    }


    Utils.extractMemoryRelatedFiles = function(logText) {
        const pathsSet = new Set();
        
        // Memory-related file patterns
        const filePatterns = [
            // Memory dump files
            /"([^"]+\.(dmp|mdmp))"/gi,
            // BSAs that might contain memory-intensive resources
            /"([^"]+\.(bsa))"/gi,
            // Memory mapped files
            /"([^"]+\.(mm|pgm))"/gi
        ];
    
        // Memory-related process and module patterns
        const memoryIndicators = [
            // Memory manager references
            /MemoryManager\((Name: `[^`]+`)\)/gi,
            // Memory heap references
            /MemoryHeap\((Name: `[^`]+`)\)/gi,
            // TBB malloc references
            /tbbmalloc\.dll\((Path: `[^`]+`)\)/gi,
            // Memory pool references
            /MemoryPool\((Name: `[^`]+`)\)/gi,
            // Virtual memory references
            /VirtualMemory\((Address: `[^`]+`)\)/gi
        ];
    
        // Process each file pattern
        for (const pattern of filePatterns) {
            let match;
            while ((match = pattern.exec(logText)) !== null) {
                pathsSet.add(match[1]);
            }
        }
    
        // Process each memory indicator pattern
        for (const pattern of memoryIndicators) {
            let match;
            while ((match = pattern.exec(logText)) !== null) {
                pathsSet.add(match[1]);
            }
        }
    
        // Extract memory addresses and allocation sizes
        const memoryAddressPattern = /0x[0-9A-Fa-f]+\s*\(\s*size:\s*\d+\s*bytes\)/gi;
        let addressMatch;
        while ((addressMatch = memoryAddressPattern.exec(logText)) !== null) {
            pathsSet.add(addressMatch[0]);
        }
    
        // Add specific memory-related module information
        const modulePattern = /((?:DirectX|d3d11|nvwgf2|amd_ags).*?\.dll)/gi;
        let moduleMatch;
        while ((moduleMatch = modulePattern.exec(logText)) !== null) {
            pathsSet.add(moduleMatch[1]);
        }
    
        // If no matches were found, add an explanatory message
        if (pathsSet.size === 0) {
            pathsSet.add('UNLIKELY CAUSE: No specific memory-related files were found in the crash log. However, memory issues can still occur without leaving file traces. Consider monitoring system resource usage during gameplay.');
        }
    
        // Check for specific memory allocation indicators
        const allocationPatterns = [
            /bad_alloc/i,
            /no_alloc/i,
            /tbbmalloc\.dll/i,
            /out of memory/i,
            /memory allocation failed/i
        ];
    
        for (const pattern of allocationPatterns) {
            if (pattern.test(logText)) {
                pathsSet.add(`Memory allocation indicator found: ${pattern.source}`);
            }
        }
    
        // Convert the Set back to an array and process to list items
        return Utils.processListItems([...pathsSet]);
    };




    Utils.extractAnimationPathsToListItems = function(logText) {
        const fileRegex = /"([^"]+\.(hkx|bsa))"/gi;
        let match;
        const pathsSet = new Set();
    
        while ((match = fileRegex.exec(logText)) !== null) {
            pathsSet.add(match[1]);
        }
    
        // If no matches were found, add the no animations found message to the set
        if (pathsSet.size === 0) {
            pathsSet.add('UNLIKELY CAUSE: Since no animation files were found in crash log, this is less likely to be the culprit. However, as a last resort, consider decompressing relevant <code>.bsa</code> archives.');
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
        return Utils.processListItems([...pathsSet]);
    };


    Utils.extractSkyrimTexturePathsToListItems = function(logText) {
        const regex = /"([^"]+\.(dds|tga|bmp|bsa))"/gi;
        let match;
        const pathsSet = new Set();

        while ((match = regex.exec(logText)) !== null) {
            pathsSet.add(match[1]);
        }

        // If no matches were found, add the no textures found message to the set
        if (pathsSet.size === 0) {
            pathsSet.add('UNLIKELY CAUSE: Since no texture files were found in crash log, this is less likely to be the culprit. However, as a last resort, consider decompressing relevant ".bsa" archives.');
        }

        // Convert the Set back to an array and process to list items
        return Utils.processListItems([...pathsSet]);
    };


    Utils.extractNifPathsToListItems = function(logText) {
        const fileRegex = /"([^"]+\.(nif|tri|bsa))"/gi;
        let match;
        const pathsSet = new Set();

        while ((match = fileRegex.exec(logText)) !== null) {
            pathsSet.add(match[1]);
        }

        // If no matches were found, add the no meshes found message to the set
        if (pathsSet.size === 0) {
            pathsSet.add('UNLIKELY CAUSE: Since no no mesh files were found in crash log, this is less likely to be the culprit. However, as a last resort, consider decompressing relevant ".bsa" archives.');
        }

        const name1Regex = /BSTriShape\((Name: `[^`]+`)\)/gi;
        const name2Regex = /\(BSTriShape\*\) -> \((Name: `[^`]+`)\)/gi;

        // Check for names using the two regexes and add their group matches to the pathsSet
        while ((match = name1Regex.exec(logText)) !== null) {
            pathsSet.add(match[1]);
        }
        while ((match = name2Regex.exec(logText)) !== null) {
            pathsSet.add(match[1]);
        }

        // Convert the Set back to an array and process to list items
        return Utils.processListItems([...pathsSet]);
    };



    
// Function to add insights about mentioned files
Utils.addMentionedFilesListItems = function(sections, fileType) {
    // Sub Function to get the appropriate extraction function
    function getExtractionFunction(fileType) {
        switch (fileType) {
            case 'mesh':
                return Utils.extractNifPathsToListItems;
            case 'memory':
                return Utils.extractMemoryRelatedFiles;
            case 'animation':
                return Utils.extractAnimationPathsToListItems;
            case 'texture':
                return Utils.extractSkyrimTexturePathsToListItems;
            default:
                throw new Error('Unsupported file type');
        }
    }

    // Get the appropriate extraction function
    const extractFunction = getExtractionFunction(fileType);

    // Get the list items from the extraction function
    const listItems = extractFunction(sections.topHalf);

    // Convert the list items to an array if it's not already
    let arrayListItems;
    if (Array.isArray(listItems)) {
        arrayListItems = listItems;
    } else {
        arrayListItems = listItems.split(/<li>|<\/li>/).filter(item => item.trim() !== '');
    }

    const hasFoundFiles = arrayListItems.length > 0;

    // Check if there are any .bsa files in the list items
    const hasBsaFile = arrayListItems.some(item => item.includes('.bsa') && !item.includes('".bsa"'));
        //NOTE: remember to keep the quotes on lines like this, otherwise hasBsaFile will be incorrectly set to true
        // 'UNLIKELY CAUSE: Since no animation files were found in crash log, this is less likely to be the culprit. However, as a last resort, consider decompressing relevant ".bsa" archives.'

    // Process the list items to HTML
    const processedListItems = Utils.processListItems(arrayListItems);

    // Add the note only if there's a .bsa file
    let parentListItem = '';
    if (hasBsaFile) {
        parentListItem += `<li>Mentioned ${fileType} files (NOTE: <code>.bsa</code> files may or may not contain compressed ${fileType} files): <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">`;
    } else {
        parentListItem += `<li>Mentioned ${fileType} files: <a href="#" class="toggleButton">⤴️ hide</a><ul class="extraInfo">`;
    }
    parentListItem += processedListItems;
    parentListItem += '</ul></li>';

    return { parentListItem: parentListItem, hasFoundFiles: hasFoundFiles };
};


    /* Usage example
    const meshResults = Utils.addMentionedFilesListItems(sections, 'mesh');
    const = forMeshInsights = meshResults.parentListItem;
    const foundMeshFiles = meshResults.foundFiles;
    */



    Utils.processListItems = function(listItems) {
        //NOTE this is DIFFERENT from procesListItems() not scoped to Utils
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