// dllCompatibleSkyrimVersionsMap.js

/**
 * Structured data for DLL compatibility with Skyrim versions.
 * min: Minimum supported Skyrim version
 * max: Maximum supported Skyrim version
 * 
 * NOTE: none of the versions here can be compatible with the most recent version of Skyrim
 * NOTE: for each mod, list the most recent version that is NOT compatible with the most recent version of Skyrim
 * 
 */
const dllCompatibleSkyrimVersionsMap = {
    'ConsoleUtilSSE.dll': {
        '1.4.0': {
            minSkyrim: null, // unknown
            maxSkyrim: '1.6.1129.9999',
            recommendedVersion: '1.5.1',
            modName: 'ConsoleUtilSSE NG',
            url: 'https://www.nexusmods.com/skyrimspecialedition/mods/76649?tab=files'
        }
    },
    'QuickLootRE.dll': {
        '2.15': {
            minSkyrim: null,
            maxSkyrim: '1.6.1129.9999',
            /* UNABLE TO DETECT FIX UNLESS SEPARATE TEST: recommendedVersion: '2.16.0',
            modName: 'Quick Loot RE for 1.6.1130',
            url: 'https://www.nexusmods.com/skyrimspecialedition/mods/108262?tab=files' */
            //AND QuickLoot IE is supposed to be better anyway
            recommendedVersion: '2.0.0',
            modName: 'QuickLoot IE - A QuickLoot EE Fork',
            url: 'https://www.nexusmods.com/skyrimspecialedition/mods/120075?tab=files'
        }
    },
    /* PENDING new version number for ability to verify fixed:
    'QQuickLootEE.dll': {
        '1.2.1': {
            minSkyrim: null,
            maxSkyrim: '1.6.1129.9999',
            recommendedVersion: '1.2.2', //VERIFY?
            modName: 'QuickLootEE 1.6.1170 Support',
            url: 'https://github.com/WaterFace/QuickLootEE/releases/tag/v1'
        }
    },
    */
    'po3_PapyrusExtender.dll': {
        '5.6.1.1': {
            minSkyrim: null,
            maxSkyrim: '1.6.1129.9999',
            recommendedVersion: '5.7.0',
            modName: 'powerofthree\'s Papyrus Extender',
            url: 'https://www.nexusmods.com/skyrimspecialedition/mods/22854?tab=files'
        }
    },
    'DynamicAnimationReplacer.dll': {
        '1.1.3': {
            minSkyrim: null,
            maxSkyrim: '1.6.1129.9999',
            recommendedVersion: '2.3.6',
            modName: 'Open Animation Replacer (OAR)',
            url: 'https://www.nexusmods.com/skyrimspecialedition/mods/92109?tab=files'
        }
    },
    
    'CombatMusicFix_NG.dll': {
        '1.0.0': {
            minSkyrim: null,
            maxSkyrim: '1.6.1129.9999', //verify 1130 is where it breaks?
            recommendedVersion: '1.1.0',
            modName: 'Combat Music Fix NG Updated',
            url: 'https://www.nexusmods.com/skyrimspecialedition/mods/110459?tab=files'
        }
    },

    'CombatMusicFix.dll': {
        '1.0.1': {
            minSkyrim: null,
            maxSkyrim: '1.6.1129.9999', //verify 1130 is where it breaks?
            recommendedVersion: '1.1.0',
            modName: 'Combat Music Fix NG Updated',
            url: 'https://www.nexusmods.com/skyrimspecialedition/mods/110459?tab=files'
        }
    },

    'MCMHelper.dll': {
        '1.4.0': {
            minSkyrim: null,
            maxSkyrim: '1.6.1129.9999',
            recommendedVersion: '1.5.0',
            modName: 'MCM Helper',
            url: 'https://nexusmods.com/skyrimspecialedition/mods/53000?tab=files'
        }
    },

    'QuickLootEE.dll': { //QUESTION: still unable to verify if fixed??
        '1.1': { //WAS 1.2.1, but wasn't able to verify any fixes, and reportedly that version can potentially be working
            minSkyrim: null,
            maxSkyrim: '1.6.1129.9999',
            recommendedVersion: '2.0.0',
            modName: 'QuickLoot IE - A QuickLoot EE Fork',
            url: 'https://www.nexusmods.com/skyrimspecialedition/mods/120075?tab=files'
        }
    },

    'SkyClimb.dll': {
        '0.0.0.1': { //NOTE: incompatible version of SkyClimb actually doesn't report a version number, but 0.001 is default
            minSkyrim: null,
            maxSkyrim: '1.6.1129.9999',
            recommendedVersion: '1.0.0',
            modName: 'SkyClimb 1.6.1170 Fix',
            url: 'https://www.nexusmods.com/skyrimspecialedition/mods/124203?tab=files',
        }
    }
    
    /* DISABLED: NEEDS TO BE A SEPARATE TEST which doesn't check for v# ... new version doesn't seem to provide a v#...
    'CompassNavigationOverhaul.dll': {
        '0.0.0.1': { //NOTE: incompatible version of SkyClimb actually doesn't report a version number, but 0.001 is default
            minSkyrim: null,
            maxSkyrim: '1.6.1129.9999',
            recommendedVersion: '2.2.0', //QUESTION: does the new version display a v# in crash logs? If not, disable this test...
            modName: 'Compass Navigation Overhaul',
            url: 'https://www.nexusmods.com/skyrimspecialedition/mods/74484?tab=files',
        }
    }  */

};