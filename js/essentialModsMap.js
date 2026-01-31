const skyrimEssentialMods = {
    // Ultra Essential Modlist - Essentials
    ussep: {
        name: 'USSEP',
        category: 'Essentials',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/266',
        crashLogFilenames: ['unofficial skyrim special edition patch.esp'],
        notes: 'Unofficial patch fixing thousands of bugs in Skyrim SE/AE.'
    },
    
    usmp: {
        name: 'USMP',
        category: 'Essentials',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/49616',
        crashLogFilenames: ['Unofficial Skyrim Modders Patch.esp'],
        notes: 'Community patch for modder resources and fixes. (NOTE: we generally disagree with its recommendation to use AI for crash logs)'
    },
    
    navigator: {
        name: 'Navigator',
        category: 'Essentials',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/52641',
        crashLogFilenames: ['Navigator-NavFixes.esl', 'Navigator-NavFixes.esp'],
        notes: 'Fixes navmesh issues throughout Skyrim.'
    },
    
    sseEngineFixes: {
        name: 'SSE Engine Fixes',
        category: 'Essentials',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/17230',
        crashLogFilenames: ['EngineFixes.dll'],
        notes: 'Addresses numerous stability issues in Skyrim\'s engine. <b>Almost mandatory</b>.'
    },
    
    sseDisplayTweaks: {
        name: 'SSE Display Tweaks',
        category: 'Essentials',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/34705',
        crashLogFilenames: ['SSEDisplayTweaks.dll'],
        notes: 'Display and performance tweaks SKSE plugin.'
    },
    
    powerofthreeTweaks: {
        name: "powerofthree's Tweaks",
        category: 'Essentials',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/51073',
        crashLogFilenames: ['po3_Tweaks.dll'],
        notes: 'Collection of engine-level tweaks and fixes.'
    },
    
    bugFixesSSE: {
        name: 'Bug Fixes SSE',
        category: 'Essentials',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/33261',
        crashLogFilenames: ['BugFixesSSE.dll'],
        notes: 'SKSE plugin fixing various engine bugs.'
    },
    
    scrambledBugs: {
        name: 'Scrambled Bugs',
        category: 'Essentials',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/43532',
        crashLogFilenames: ['ScrambledBugs.dll'],
        notes: 'Comprehensive bug fixes collection.'
    },
    
    addressLibrary: {
        name: 'Address Library',
        category: 'Essentials',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/32444',
        crashLogFilenames: [], //NOTE: only undetectable .bin files
        notes: 'Required dependency for SKSE plugins.'
    },
    
    moreInformativeConsole: {
        name: 'More Informative Console AE',
        category: 'Essentials',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/19250',
        crashLogFilenames: ['MoreInformativeConsole.dll'],
        notes: 'Enhanced console with better reference information.'
    },
    
    /* crashLogger: {
        name: 'Crash Logger SSE AE VR',
        category: 'Essentials',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/59818',
        crashLogFilenames: [], //NOTE: already has own tests recommending it in Diagnoses section 
        notes: 'Generates crash logs - already tested separately'
    }, */
    
    mfgFix: {
        name: 'Mfg Fix (as required by Mfg Fix NG, below)',
        category: 'Essentials',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/11669',
        crashLogFilenames: ['mfgfix.dll'],
        notes: 'Fixes facial expression issues - required for Mfg Fix NG.'
    },
    
    mfgFixNG: {
        name: 'Mfg Fix NG',
        category: 'Essentials',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/133568',
        crashLogFilenames: ['mfgfix.dll'],
        notes: 'Next generation facial expression fixes.'
    },
    
    ultimateOptimizedScripts: {
        name: 'Ultimate Optimized Scripts Compilation', // "UOSC"
        category: 'Essentials',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/122999',
        crashLogFilenames: ['UOSC.esl'],
        notes: 'Optimized vanilla scripts for better performance.  (Note: have the mod overwrite USMP if needed)'
    },

    scrote: {
        name: 'Scripts Carefully Reworked Optimized and Tactfully Enhanced (SCROTE) - Simply Optimized Scripts AIO',
        category: 'Essentials',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/97155',
        crashLogFilenames: ['SimplyOptimizedScripts.esl'],
        notes: 'Additional script optimizations beyond UOSC. Load SimplyOptimizedScripts.esl after UOSC.esl in your load order. (Note: variant "SCROTE Loose Files Version" is undetectable in crash logs)'
    },

    critterSpawnReduction: {
        name: 'CritterSpawn - Script Call Reduction',
        category: 'Essentials',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/141745',
        crashLogFilenames: [], //NOTE: no detectible files
        notes: 'Reduces script load from critter spawning.'
    },

    // Essential Bugfixes
    actorLimitFix: {
        name: 'Actor Limit Fix',
        category: 'Essential Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/32349',
        crashLogFilenames: ['ActorLimitFix.dll'],
        notes: 'Increases actor limit to help prevent crashes in crowded areas.'
    },
    
    fastTravelCrashFix: {
        name: 'Fast Travel Crash Fix',
        category: 'Essential Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/102323',
        crashLogFilenames: ['Fast Travel Crash Fix.esp'],
        notes: 'Prevents a common crash when fast traveling to Whiterun.'
    },
    
    lodUnloadingBugFix: {
        name: 'LOD Unloading Bug Fix',
        category: 'Essential Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/61251',
        crashLogFilenames: ['fixLOD.esp'],
        notes: 'Fixes LOD unloading issues causing visual bugs.'
    },
    
    combatMusicFix: {
        name: 'Combat Music Fix NG Updated',
        category: 'Essential Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/110459',
        crashLogFilenames: ['CombatMusicFixNG.dll'],
        notes: 'Prevents combat music not ending properly.'
    },
    
    questJournalLimitFix: {
        name: 'Quest Journal Limit Bug Fixer',
        category: 'Essential Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/56130',
        crashLogFilenames: ['Quest Journal Limit Bug Fixer.esp'],
        notes: 'Removes quest journal entry limit.'
    },
    
    removeAllItemsFreezeFix: {
        name: 'RemoveAllItems Freeze Fix',
        category: 'Essential Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/90734',
        crashLogFilenames: ['RemoveAllItemsFix.dll'],
        notes: 'Prevents freezes when removing all items from containers.'
    },
    
    highGateRuinsFix: {
        name: 'High Gate Ruins Puzzle Reset Fix',
        category: 'Essential Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/53643',
        crashLogFilenames: [],  //NOTE: no detectible files
        notes: 'Fixes puzzle reset issue at High Gate Ruins.'
    },
    
    dwemerGatesFix: {
        name: "Dwemer Gates Don't Reset - Base Object Swapper",
        category: 'Essential Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/164849',
        crashLogFilenames: ['DwemerGatesNoRelock - BOS.esl'],
        notes: 'Prevents Dwemer gates from resetting.'
    },
    
    /* Included with UOSC: 
        dragonActorScriptFix: {
            name: 'Dragonactorscript infinite loop fix',
            category: 'Essential Bugfixes',
            url: 'https://www.nexusmods.com/skyrimspecialedition/mods/87940',
            crashLogFilenames: [],  //NOTE: no detectible files
            notes: 'Fixes infinite loop in dragon AI script'
        },
    */
    
    npcBleedoutFix: {
        name: 'NPC Stuck in Bleedout fix',
        category: 'Essential Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/95489',
        crashLogFilenames: ['bleedoutFix.esp'],
        notes: 'Prevents NPCs getting stuck in bleedout state.'
    },
    
     /* Included with UOSC:
        worldEncounterHostilityFix: {
            name: 'World Encounter Hostility Fix',
            category: 'Essential Bugfixes',
            url: 'https://www.nexusmods.com/skyrimspecialedition/mods/91403',
            crashLogFilenames: [],  //NOTE: no detectible files
            notes: 'Fixes incorrect hostility in world encounters'
        },
    */
    
    zeroBountyHostilityFix: {
        name: 'Zero Bounty Hostility Fix',
        category: 'Essential Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/95989',
        crashLogFilenames: ['zeroBountyHostilityFix.esp'],
        notes: 'Prevents guards attacking with zero bounty.'
    },
    
     /* Included with UOSC: 
        wiDeadBodyCleanupFix: {
            name: 'WIDeadBodyCleanupScript Crash Fix',
            category: 'Essential Bugfixes',
            url: 'https://www.nexusmods.com/skyrimspecialedition/mods/62413',
            crashLogFilenames: [],  //NOTE: no detectible files
            notes: 'Fixes crashes from dead body cleanup script'
        },
    */
    
    barterLimitFix: {
        name: 'Barter Limit Fix',
        category: 'Essential Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/77173',
        crashLogFilenames: ['BarterLimitFix.dll'],
        notes: 'Fixes vendor gold limit issues.'
    },
    
    volkiharHostilityFix: {
        name: 'Volkihar hostility fix',
        category: 'Essential Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/95643',
        crashLogFilenames: ['Volkihar hostility fix.esp'],
        notes: 'Fixes Volkihar vampires being incorrectly hostile.'
    },
    
    /* REMOVED BY J3w3ls due to crashes
    npcAIProcessFix: {
        name: 'NPC AI Process Position Fix - NG',
        category: 'Essential Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/69326',
        crashLogFilenames: ['MaxsuAIProcessFix.dll'],
        notes: 'Fixes NPC AI processing position errors'
    },
    */
    
    alchemyXPFix: {
        name: 'Alchemy XP Fix',
        category: 'Essential Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/117389',
        crashLogFilenames: ['po3_AlchemyXPFix.dll'],
        notes: 'Fixes alchemy experience gain calculation.'
    },

    // Essential Quest Fixes
    collegeQuestStartFix: {
        name: 'College of Winterhold Quest Start Fixes',
        category: 'Essential Quest Fixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/53817',
        crashLogFilenames: ['College of Winterhold Quest Start Fixes.esp'],
        notes: 'Fixes College of Winterhold quest start issues.'
    },
    
    /* Included with UOSC: 
        kingOlafFestivalFix: {
            name: "King Olaf's Fire Festival Not Ending Fix",
            category: 'Essential Quest Fixes',
            url: 'https://www.nexusmods.com/skyrimspecialedition/mods/65849',
            crashLogFilenames: [],  //NOTE: no detectible files
            notes: "Fixes King Olaf's festival not ending properly"
        },
    */
    
    /* Included with UOSC: 
        magicStudentQuestFix: {
            name: 'Magic Student (WIChangeLocation04) Quest Fix',
            category: 'Essential Quest Fixes',
            url: 'https://www.nexusmods.com/skyrimspecialedition/mods/80676',
            crashLogFilenames: [],  //NOTE: no detectible files
            notes: 'Fixes magic student random quest'
        },
    */
    
    nelothExperimentalSubjectFix: {
        name: "Neloth's Experimental Subject Quest (DLC2TTR4a) Fix",
        category: 'Essential Quest Fixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/64016',
        crashLogFilenames: [],  //NOTE: no detectible files
        notes: "Fixes Neloth's experimental subject quest."
    },
    
    beneathBronzeWatersFix: {
        name: 'Beneath Bronze Waters Start Fix',
        category: 'Essential Quest Fixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/87760',
        crashLogFilenames: ['Beneath Bronze Waters Start Fix.esp'],
        notes: 'Fixes Beneath Bronze Waters quest start issues.'
    },
    
    delphineSkyhaven: {
        name: 'Delphine Skyhaven Bugfix MQ203',
        category: 'Essential Quest Fixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/100595',
        crashLogFilenames: [],  //NOTE: no detectible files
        notes: 'Fixes Delphine Skyhaven Temple main quest bug.'
    },

    // Essential Mesh Fixes ... none of which will have detectable files
    noteFordMeshFixes: {
        name: '',
        category: 'Essential Mesh Fixes',
        url: '',
        crashLogFilenames: [],
        notes: 'Note: Load these early in your list, so other mods may overwrite if needed.'
    },
    assortedMeshFixes: {
        name: 'Assorted Mesh Fixes',
        category: 'Essential Mesh Fixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/32117',
        crashLogFilenames: [],
        notes: 'Mesh-only fixes for various objects.'
    },
    
    unofficialMaterialFix: {
        name: 'Unofficial Material Fix',
        category: 'Essential Mesh Fixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/21027',
        crashLogFilenames: [],
        notes: 'Material and texture fixes.'
    },
    
    blackreachTentacleFix: {
        name: 'Blackreach Tentacle Mesh Fix',
        category: 'Essential Mesh Fixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/43083',
        crashLogFilenames: [],
        notes: 'Fixes Blackreach tentacle mesh issues.'
    },
    
    labyrinthianFixes: {
        name: "Labyrinthian Shalidor's Maze Fixes",
        category: 'Essential Mesh Fixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/52239',
        crashLogFilenames: [],
        notes: "Fixes Labyrinthian maze meshes."
    },
    
    noBlindingFog: {
        name: 'No More Blinding Fog',
        category: 'Essential Mesh Fixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/87342',
        crashLogFilenames: [],
        notes: 'Reduces excessive fog effects.'
    },

    // Nice to Have
    saveUnbaker: {
        name: 'Save Unbaker',
        category: 'Nice to Have',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/85565',
        crashLogFilenames: ['po3_SaveUnbaker.dll'],
            notes: 'Loads certain records from plugins instead of save, such as NPC weight and persistent ref position. May help in installing certain mods mid-save. <b>Caution:</b> Installing or removing mods mid-save is risky and not recommended, even with this mod.'
    },
    
    autoInputSwitch: {
        name: 'Auto Input Switch',
        category: 'Nice to Have',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/54309',
        crashLogFilenames: ['AutoInputSwitch.dll'],
        notes: 'Automatically switches between keyboard/controller.'
    },
    
    autoAudioSwitch: {
        name: 'Auto Audio Switch',
        category: 'Nice to Have',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/134404',
        crashLogFilenames: ['AutoAudioSwitch.dll'],
        notes: 'Automatically switches audio output devices.'
    },
    
    xpmsse: {
        name: 'XP32 Maximum Skeleton Special Extended - XPMSSE',
        category: 'Nice to Have',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/1988',
        crashLogFilenames: ['XPMSE.esp', 'FK\'s Diverse Racial Skeletons.esp'], //NOTE: Racial Skeletons is a currently-popular alternative to XPM, but no need to recommend XPM when Racial Skeletons is present
        notes: 'Extended skeleton for animations. Note: choose the minimal version during installation'
    },

    // Nice to Have Bugfixes
    floatingAshPileFix: {
        name: 'Floating Ash Pile Fix',
        category: 'Nice to Have Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/63434',
        crashLogFilenames: [], //NOTE: no detectible files
        notes: 'Fixes floating ash piles.'
    },
    
    grainMillAnimationFix: {
        name: 'Grain Mill Animation Fix',
        category: 'Nice to Have Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/130679',
        crashLogFilenames: [], //NOTE: no detectible files
        notes: 'Fixes grain mill animations.'
    },
    
    esbernVoiceFix: {
        name: 'Esbern Voice Consistency Fix',
        category: 'Nice to Have Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/88503',
        crashLogFilenames: [],  //NOTE: no detectible files
        notes: '"Replaces Esbern voice lines done by a different actor."'
    },
    
    horseSaveLoadFix: {
        name: 'Horse Save Load Fix',
        category: 'Nice to Have Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/132110',
        crashLogFilenames: ['HorseFix.esp'],
        notes: 'Prevents "horse flying into the sky when loading save."'
    },
    
    bashBugFix: {
        name: 'Bash Bug Fix',
        category: 'Nice to Have Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/83581',
        crashLogFilenames: ['BashBugFix.dll'],
        notes: 'Prevents bash attack causing the current weapon\'s damage.'
    },
    
    huntersNotBandits: {
        name: 'Hunters Not Bandits',
        category: 'Nice to Have Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/1547',
        crashLogFilenames: ['Hunters Not Bandits.esp'],
        notes: 'Prevents hunters from taunting at their prey, and other related fixes.'
    },
    
    animationQueueFix: {
        name: 'Animation Queue Fix',
        category: 'Nice to Have Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/82395',
        crashLogFilenames: ['AnimationQueueFix.dll'],
        notes: 'Fixes animation queue issues. Speeds animation loading when you first start up the game. Helps prevent T-Poses.'
    },
    
    equipEnchantmentFix: {
        name: 'Equip Enchantment Fix',
        category: 'Nice to Have Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/42839',
        crashLogFilenames: ['EquipEnchantmentFix.dll'],
        notes: '"Fixes engine bugs where item enchantments don\'t apply when equipped or stop working while the item is still equipped."'
    },
    
    sprintSneakFix: {
        name: 'Sprint Sneak Movement Speed Fix',
        category: 'Nice to Have Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/86631',
        crashLogFilenames: ['SSMT_Fix.dll'],
        notes: '"Fixes the game applying wrong movement speed if the character draws, sheathes or shouts while sprinting or sneaking."'
    },
    
    auroraFix: {
        name: 'Aurora Fix',
        category: 'Nice to Have Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/77834',
        crashLogFilenames: ['AuroraFix.dll'],
        notes: 'Prevents auroras getting stuck when transitioning between worldspaces'
    },
    
    cameraPersistenceFixes: {
        name: 'Camera Persistence Fixes',
        category: 'Nice to Have Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/94490',
        crashLogFilenames: ['po3_CameraPersistenceFixes.dll'],
        notes: 'Fixes camera state persistence issues. "eg. if you save in free camera mode (tfc) and reload, camera will bug out and put you near 0,0,0 world coordinates'
    },
    
    npcInfiniteBlockFix: {
        name: 'NPC Infinite Block Fix - SkyPatcher',
        category: 'Nice to Have Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/113227',
        crashLogFilenames: ['NIBF_SkyPatcher.esp'],
        notes: 'Prevents NPCs from blocking excessively.'
    },
    
    staminaOfSteeds: {
        name: 'Stamina of Steeds',
        category: 'Nice to Have Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/58742',
        crashLogFilenames: ['Stamina of Steeds.esp'],
        notes: 'Prevents horse stamina from being limited by player stamina.'
    },
    
    whirlwindSprintVoiceFix: {
        name: 'Whirlwind Sprint Delayed Voice Fix - SSE',
        category: 'Nice to Have Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/92799',
        crashLogFilenames: ['WhirlwindSprintVoiceWorkaround.esp'],
        notes: 'Prevents second and third words of the Whirlwind Sprint shout from initiating 1-2 seconds late.'
    },
    
    buySellTorchesFix: {
        name: 'Buy and Sell Torches - Bug Fix',
        category: 'Nice to Have Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/96387',
        crashLogFilenames: ['buy and sell torches.esp'],
        notes: 'Fixes torch buying/selling issues'
    },
    
    worldEncounterNobleHorseFix: {
        name: 'World Encounter Noble Riding Horse Fix - WERoad02',
        category: 'Nice to Have Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/150951',
        crashLogFilenames: ['WERoad02Fix.esp'],
        notes: '"Fixes bug where noble abandons the horse."'
    },
    
    riftenTempleSconceFix: {
        name: 'Riften Temple Sconce Fix',
        category: 'Nice to Have Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/76169',
        crashLogFilenames: [],  //NOTE: no detectible files
        notes: '"Fixes the floating sconces in front of the Riften Temple of Mara (and some other small issues)."'
    },
    
    animatedStaticReloadFix: {
        name: 'Animated Static Reload Fix - NG',
        category: 'Nice to Have Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/69331',
        crashLogFilenames: ['AnimatedStaticReload.dll'],
        notes: 'Fixes animated static reload issues'
    },
    
    nakedDeadNPCFix: {
        name: 'Naked Dead NPC Fix',
        category: 'Nice to Have Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/99024',
        crashLogFilenames: ['NakedDeadNPCFix.dll'],
        notes: 'Prevents dead NPCs from appearing naked'
    },
    
    slaughterfishFastTravelFix: {
        name: 'Slaughterfish Fast Travel And Submersion Fix',
        category: 'Nice to Have Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/129228',
        crashLogFilenames: ['eve - slaughterfish fast travel fix.esp'],
        notes: 'Prevents slaughterfish from blocking fast travel.'
    },
    
    unaggressiveDragonPriestsFix: {
        name: 'Unaggressive Dragon Priests Fix',
        category: 'Nice to Have Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/69026',
        crashLogFilenames: ['Unaggressive Dragon Priests Fix.esp'],
        notes: 'Fixes passive dragon priests not attacking.'
    },
    
    stuckLoadDoorPromptFix: {
        name: 'Stuck on Screen Load Door Prompt Fix',
        category: 'Nice to Have Bugfixes',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/96531',
        crashLogFilenames: ['stuck on screen fix.esp'],
        notes: '"Fixes auto load door prompt getting stuck."'
    },

    soulResurrection: {
        name: 'Soul Resurrection',
        category: 'Other Recommendations',
        url: 'https://www.nexusmods.com/skyrimspecialedition/mods/128265',
        crashLogFilenames: ['Soul Resurrection - Injury and Alternative Death System.esp'],
        notes: 'A "death alternative" mod such as Soul Resurrection is beneficial, due to the potential of <b>save breaking bugs</b> upon reloading a save without exiting the game. Avoid death alternative mods that teleport you somewhere else, due to the risk of breaking quests that lock you in a certain area.'
    }
};