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
            recommendedVersion: '2.16.0',
            modName: 'Quick Loot RE for 1.6.1130',
            url: 'https://www.nexusmods.com/skyrimspecialedition/mods/108262?tab=files'
        }
    },
    /* PENDING new version number:
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
        '5.6.1': {
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
    }
    /* SkyClimb.dll ... pending new and old version numbers
        .. if it even report version numbers in CrashLogger and/or Trainwreck?*/
};