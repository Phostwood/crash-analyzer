// dllCompatibleSkyrimVersionsMap.js

/**
 * Structured data for DLL compatibility with Skyrim versions.
 * min: Minimum supported Skyrim version
 * max: Maximum supported Skyrim version
 */
const dllCompatibleSkyrimVersionsMap = {
    'ConsoleUtilSSE.dll': {
        '1.2.0': {
            minSkyrim: '1.5.50',
            maxSkyrim: '1.5.97',
            modName: 'ConsoleUtilSSE NG',
            url: 'https://www.nexusmods.com/skyrimspecialedition/mods/76649?tab=files',
            recommendedVersion: '1.5.1 (note different mod and URL)'
        },
        '1.3.2': {
            minSkyrim: '1.6.0.0',
            maxSkyrim: '1.6.629',
            modName: 'ConsoleUtilSSE NG',
            url: 'https://www.nexusmods.com/skyrimspecialedition/mods/76649?tab=files',
            recommendedVersion: '1.5.1 (note different mod and URL)'
        },
        '1.4.0': {
            minSkyrim: '1.6.640',
            maxSkyrim: '1.6.1129.9999',
            modName: 'ConsoleUtilSSE NG',
            url: 'https://www.nexusmods.com/skyrimspecialedition/mods/76649?tab=files',
            recommendedVersion: '1.5.1  (note different mod and URL)',
            note: '(note different mod and URL)'
        }
    },
    'QuickLootRE.dll': {
        '2.8.6': {
            minSkyrim: '1.5.50',
            maxSkyrim: '1.5.97',
            modName: 'Quick Loot RE for 1.6.1130',
            url: 'https://www.nexusmods.com/skyrimspecialedition/mods/108262?tab=files',
            recommendedVersion: 'most recent, compatible version',
            note: '(note different mod and URL if you need support for Skyrim AE 1.6.1130)',
        },
        '2.12.0': {
            minSkyrim: null,
            maxSkyrim: '1.6.1129.9999',
            modName: 'Quick Loot RE for 1.6.1130',
            url: 'https://www.nexusmods.com/skyrimspecialedition/mods/108262?tab=files',
            recommendedVersion: '2.16.0',
            note: '(note different mod and URL)'
        },
        '2.15.0': {
            minSkyrim: null,
            maxSkyrim: '1.6.1129.9999',
            modName: 'Quick Loot RE for 1.6.1130',
            url: 'https://www.nexusmods.com/skyrimspecialedition/mods/108262?tab=files',
            recommendedVersion: '2.16.0',
            note: '(note different mod and URL)'
        }
    },
    'po3_PapyrusExtender.dll': {
        '5.6.2-': {
            minSkyrim: null,
            maxSkyrim: '1.6.1129.9999',
            modName: 'powerofthree\'s Papyrus Extender',
            url: 'https://www.nexusmods.com/skyrimspecialedition/mods/22854?tab=files',
            recommendedVersion: '5.7.0 (universal support for Skyrim SE 1.5.97, AE 1.6.640, and AE 1.6.1170+)',
            note: null
        }
    }
};