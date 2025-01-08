const crashIndicators = {
    dragonsEyeMinimapIssues: {
        hexCodes: [
            // Space for future hex codes
        ],
        codes: [
            { code: 'BSImagespace', description: "Image space shader issue" },
            { code: 'NiCamera', description: "Camera issue" },
            { code: 'WorldRoot Camera', description: "World root camera issue" },
            { code: 'WorldRoot Node', description: "World root node issue" },
            { code: 'Block (', description: "Indicates cell block reference" },
            { code: 'HUDMenu', description: "Indicates heads-up display issue"}
        ]        
    },

    sseFixesIssues: {
        hexCodes: [
            // Space for future hex codes
        ],
        impactEffects: [
            { name: 'BloodSprayArrowImpact01', description: "Blood spray impact effect" },
            { name: 'ImpactArrowDust01', description: "Arrow dust impact effect" },
            { name: 'BloodHitEffectBlunt', description: "Blunt blood impact effect" },
            { name: '1hBloodHitEffectCut', description: "Cut blood impact effect" },
            { name: 'BloodSprayImpact01', description: "Blood spray impact" }
        ],
        files: [
            { name: 'FpsFixPlugin.dll', description: "SSE Fixes plugin file" }
        ]
    },


    //NOTE: many of these codes were suggested by AI. Some of them may not be the best indicators of the issue type? Also, I don't know if some of these ever show up in Skyrim crash logs, but I didn't see any harm in leaving them in. 
    meshIssues: {
        hexCodes: [
            { hexCode: '132BEF', description: "head mesh issue" },
            { hexCode: '12FDD00', description: "corrupted NIF file" },
            { hexCode: '12F5590', description: "mesh loading or rendering issue (often FaceGen/NPC faces, but can be other meshes)" }
        ],
        codes: [
            { code: 'bhkcollisionobject', description: "Collision object" },
            { code: 'bhkcompressedmeshshape', description: "Compressed mesh shape" },
            { code: 'bsbloodsplattershader', description: "Blood splatter shader" },
            { code: 'bsdynamictrishape', description: "Dynamic triangle shape" },
            { code: 'bseffectshaderproperty', description: "Effect shader property" },
            { code: 'bsfadenode', description: "BSFadeNode" },
            { code: 'bsinvmarker', description: "Inventory marker" },
            { code: 'bslightingshaderproperty', description: "Lighting shader property" },
            { code: 'bslodtrishape', description: "LOD triangle shape" },
            { code: 'bsmultiboundnode', description: "Multi-bound node" },
            { code: 'bsmultiindextrishape', description: "Multi-index triangle shape" },
            { code: 'bsordereddynamictrishape', description: "Ordered dynamic triangle shape" },
            { code: 'bssegmentedtrishape', description: "Segmented triangle shape" },
            { code: 'bssubindextrishape', description: "Subindex triangle shape" },
            { code: 'bstrishape', description: "BSTriShape node" },
            { code: 'hkprigidbody', description: "Havok rigid body" },
            //TOO BROAD: { code: 'mesh', description: "General mesh-related" },
            { code: 'nigeometry', description: "Geometry data" },
            { code: 'nimaterialproperty', description: "Material property" },
            { code: 'ninode', description: "NiNode" },
            { code: 'niskininstance', description: "Skin instance" },
            { code: 'nistringextradata', description: "String extra data" },
            { code: 'nitexturetransformcontroller', description: "Texture transform controller" },
            { code: 'nitribasedgeom', description: "Triangle-based geometry" },
            { code: 'nitrishape', description: "NiTriShape node" },
            { code: 'nitristrips', description: "NiTriStrips node" },
            { code: 'trishape', description: "Triangle shape in mesh" }
        ]
    },
    textureIssues: {
        hexCodes: [
            //No known hex codes?
        ],
        codes: [
            { code: 'bsshadertextureset', description: "Shader texture set problem" },
            { code: 'nialphaproperty', description: "Alpha property issue" },
            { code: 'compressedarchivestream', description: "Compressed texture stream error" },
            { code: 'texture', description: "General texture-related problem" }
        ]
    },
    animationIssues: {
        hexCodes: [
            { hexCode: 'B02235', description: "suspected animation indictor" },
        ],
        codes: [
            { code: 'hkbehaviorgraph', description: "Havok behavior graph" },
            { code: 'animationgraph', description: "Animation graph" },
            { code: 'hkbclipgenerator', description: "Havok clip generator" },
            { code: 'hkbvariablebindingset', description: "Havok variable binding set" },
            { code: '.hkx', description: "Havok animation file" },
            { code: 'bshkbanimationgraph', description: "BShkb Animation Graph" },
            { code: 'animation', description: "General animation-related (lower-confidence indicator)" }
        ]
    },
    animationLoaderIssues: {
        hexCodes: [
            // Space for future hex codes
        ],
        codes: [
            { code: 'dynamicanimationreplacer.dll', description: "DAR loader detected" },
            { code: 'dynamicanimationreplacer.ini', description: "DAR configuration file" },
            { code: 'openanimationreplacer.dll', description: "OAR loader detected" },
            { code: 'openanimationreplacer.pdb', description: "OAR debug symbols" },
            { code: 'behavior', description: "Generic behavior file reference" },
            { code: '.hkb', description: "Havok behavior file" },
            { code: '.hkx', description: "Havok animation file" },
            { code: '0_master.hkb', description: "Master behavior file" },
            { code: 'bshkbanimationgraph', description: "Bethesda Havok animation graph" }
        ]
    },
    scriptIssues: [
        { code: 'papyrus vm', description: "Papyrus virtual machine error" },
        { code: 'script', description: "General script-related problem" },
        { code: 'property', description: "Script property issue" },
        { code: 'skse', description: "Skyrim Script Extender problem" }
    ],
    memoryIssues: {
        hexCodes: [
            { hexCode: 'D6DDDA', description: "VRAM/visual memory allocation failure" },
            { hexCode: '0xc0000005', description: "Windows memory access violation" }
        ],
        codes: [
            { code: 'memory allocation failed', description: "Failed to allocate memory" },
            { code: 'out of memory', description: "System ran out of memory" },
            { code: 'heap corruption', description: "Memory heap corruption detected" },
            { code: 'bad_alloc', description: "Memory allocation failure" },
            { code: 'no_alloc', description: "Memory allocation not possible" },
            { code: 'tbbmalloc.dll', description: "Threading Building Blocks memory allocator issue" },
            { code: 'virtual memory', description: "Virtual memory management issue" },
            { code: 'memory leak', description: "Potential memory leak detected" },
            { code: 'stack overflow', description: "Stack memory overflow" },
            { code: 'buffer overflow', description: "Buffer memory overflow" },
            { code: 'memory fragmentation', description: "Memory fragmentation issue" }
        ]
    },
    pathingAndNavMeshIssues: {
        hexCodes: [
            // Space for future hex codes
        ],
        codes: [
            { code: 'AiNavigation', description: "AI navigation issue" },
            { code: 'AutoRegisterPathBuilderFactory', description: "Path building system issue" },
            { code: 'BGSProcedureFollowExecState', description: "May indicate a follower having nav issues" },
            { code: 'BSPathBuilder', description: "Base path building system error" },
            { code: 'MovementControllerNPC', description: "May indicate an NPC having nav issues" },
            { code: 'MovementPathManagerArbiter', description: "Movement path management issue" },
            { code: 'NavMesh', description: "Navigation mesh error" },
            { code: 'NavMeshInfoArea', description: "NavMesh info area problem" },
            { code: 'NavMeshInfoMap', description: "Navigation mesh information mapping error" },
            { code: 'NavMeshObstacleManager', description: "Navigation mesh obstacle handling issue" },
            { code: 'PathFinding', description: "Path finding issue" },
            { code: 'PathingCell', description: "Cell-based pathing error" },
            { code: 'PathingDoor', description: "Door-related pathing issue" },
            { code: 'PathingRequest', description: "Pathing request failure" },
            { code: 'PathingTaskData', description: "Pathing task data error" },
            { code: 'SIC_WERoad07', description: "Known issue with Skyrim Immersive Creatures mounted NPCs" },
        ]
    },
    pluginIssues: [
        { code: 'plugin', description: "General plugin-related problem" },
        { code: 'esp', description: "ESP file issue" },
        { code: 'esm', description: "ESM file issue" },
        { code: 'esl', description: "ESL file issue" }
    ],
    physicsIssues: [
        { code: 'havok', description: "General Havok physics problem" },
        { code: 'hkpworld', description: "Havok physics world issue" }
    ],
    audioIssues: [
        { code: 'bgsoundoutput', description: "Sound output problem" },
        { code: 'audio', description: "General audio-related issue" }
    ],
    engineIssues: [
        { code: 'skyrimse.exe', description: "Main game executable issue" },
        { code: 'skyrimse.exe+', description: "Specific address in game executable" },
        { code: 'bethesda game studios', description: "Engine-level problem" }
    ],
    graphicsIssues: [
        { code: 'directx', description: "DirectX-related problem" },
        { code: 'd3d11', description: "Direct3D 11 issue" },
        { code: 'gpu', description: "Graphics processing unit problem" }
    ],
    landscapeIssues: [
        { code: 'landscape', description: "Landscape-related issue" },
        { code: 'cell', description: "Game cell problem" },
        { code: 'worldspace', description: "Worldspace-related issue" }
    ],
    actorIssues: [
        { code: 'actor', description: "General actor-related problem" },
        { code: 'npc_', description: "NPC-specific issue" },
        { code: 'tesnpc', description: "TESNpc object problem" }
    ],
    formIssues: [
        { code: 'tesform', description: "TESForm object issue" },
        { code: 'tesobjectrefr', description: "TESObjectREFR problem" }
    ],
    saveGameIssues: [
        { code: 'savegame', description: "Save game file issue" },
        { code: 'cosave', description: "Co-save file problem" }
    ],
    renderingIssues: [
        { code: 'bsshader', description: "Shader-related problem" },
        { code: 'rendermanager', description: "Render manager issue" },
        { code: 'shadowstate', description: "Shadow rendering problem" },
        { code: 'particlesystem', description: "Particle system issue" }
    ],
    ini_Settings: [
        { code: 'skyrim.ini', description: "Main INI file setting issue" },
        { code: 'skyrimprefs.ini', description: "Preferences INI file problem" },
        { code: 'customini', description: "Custom INI setting issue" }
    ],
    dlc_Issues: [
        { code: 'dlc', description: "DLC-related problem" },
        { code: 'hearthfires', description: "Hearthfires DLC issue" },
        { code: 'dragonborn', description: "Dragonborn DLC issue" },
        { code: 'dawnguard', description: "Dawnguard DLC issue" }
    ],
    vampirismWerewolfIssues: [
        { code: 'vampire', description: "Vampirism-related issue" },
        { code: 'werewolf', description: "Werewolf-related problem" },
        { code: 'dlc1vampirebeastrace', description: "Dawnguard vampire beast race issue" }
    ],
    weatherIssues: [
        { code: 'sky', description: "Sky or weather-related problem" },
        { code: 'weathermanager', description: "Weather manager issue" },
        { code: 'imagespace', description: "Image space (visual effects) problem" }
    ],
    inventoryIssues: [
        { code: 'inventory', description: "Inventory-related issue" },
        { code: 'container', description: "Container interaction problem" },
        { code: 'equipmanager', description: "Equipment manager issue" }
    ],
    modConflicts: [
        { code: 'conflict', description: "Potential mod conflict" },
        { code: 'overwrite', description: "Asset overwrite issue" },
        { code: 'incompatible', description: "Incompatible mod detected" }
    ],
    networkIssues: [
        { code: 'netimmerse', description: "NetImmerse-related problem" },
        { code: 'networkmanager', description: "Network manager issue (for multiplayer mods)" }
    ]
};