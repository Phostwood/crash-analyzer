const crashIndicators = {

    questJournalIssues: {
        hexCodes: [
            // Space for future hex codes
        ],
        indicators: [
            { name: 'Interface/Quest_Journal.swf', description: "SkyUI journal interface file" },
            { name: 'Journal_SystemTab', description: "Quest journal functionality handler" },
            { name: 'JournalMenu', description: "Journal menu interface element" }
        ]
    },

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

    vcRuntimeIssues: {
        hexCodes: [
            // Space for future hex codes
        ],
        codes: [
            { code: 'msvcp100.dll', description: "Microsoft Visual C++ 2010 Redistributable" },
            { code: 'msvcp110.dll', description: "Microsoft Visual C++ 2012 Redistributable" },
            { code: 'msvcp110_win.dll', description: "Microsoft Visual C++ 2015 Redistributable" },
            { code: 'msvcp140.dll', description: "Microsoft Visual C++ 2015 Redistributable" },
            { code: 'vcruntime140.dll', description: "Visual C++ Runtime Library" },
            { code: 'ucrtbase.dll', description: "Universal C Runtime Library" }
        ]        
    },

    gamepadIssues: {
        hexCodes: [
            // Space for future hex codes
        ],
        indicators: [
            { name: 'BSWin32GamepadDevice', description: "Windows gamepad device handler (not always a reliable indicator)" },
            { name: 'BSPCGamepadDeviceHandler', description: "PC gamepad device handler" }
        ]
     },

     keyboardIssues: {
        hexCodes: [
            // Space for future hex codes
        ],
        indicators: [
            { name: 'bswin32keyboarddevice', description: "Windows keyboard device handler" }
        ]
     },

    sseFixesIssues: {
        hexCodes: [
            // Space for future hex codes
        ],
        impactEffects: [
            { name: 'BloodHitEffectBlunt', description: "Blunt blood impact effect" },
            { name: 'BloodHitEffectCut', description: "Cut blood impact effect" },
            { name: 'BloodSprayAlduinArrowImpact', description: "Blood spray Alduin arrow impact effect" },
            { name: 'BloodSprayArrowImpact01', description: "Blood spray arrow impact effect" },
            { name: 'BloodSprayHammerImpact01', description: "Blood spray hammer impact effect" },
            { name: 'BloodSprayImpact01', description: "Blood spray general impact effect" },
            { name: 'BloodSprayUnarmedImpact01', description: "Blood spray unarmed impact effect" },
            { name: 'FistBloodSm', description: "Small blood impact effect for unarmed attacks" },  //theoretical only?
            { name: 'FistBloodMed', description: "Medium blood impact effect for unarmed attacks" },
            { name: 'FistBloodLg', description: "Large blood impact effect for unarmed attacks" }, //theoretical only?
            { name: 'ImpactArrowDirt01', description: "Arrow dirt impact effect" },
            { name: 'ImpactArrowDust01', description: "Arrow dust impact effect" },
            { name: 'PierceBone', description: "Bone piercing effect" }
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
            { code: 'trishape', description: "Triangle shape in mesh" },
            { code: '.tri', description: "Mesh file for 3D wireframe" },
            { code: '.nif', description: "Mesh file for 3D wireframe" },
            { code: '.bto', description: "Bethesda mesh optimization file" }            
        ]
    },
    textureIssues: {
        hexCodes: [
            //No known hex codes?
        ],
        codes: [
            { code: 'bsshadertextureset', description: "Shader texture set problem" },
            { code: 'nialphaproperty', description: "Alpha property issue" },
            { code: 'nisourcetexture', description: "Source texture loading or reference issue" },
            { code: 'compressedarchivestream', description: "Compressed texture stream error" },
            { code: 'texture', description: "General texture-related problem" },
            { code: '.dds', description: "DirectDraw Surface texture file" },
            { code: '.tga', description: "Targa format texture file" }, //theoretical according to AI ... but not in my library
            { code: '.bmp', description: "Bitmap texture file" }, //rare
            { code: '.btr', description: "Bethesda texture reference file" }, //rare
            { code: 'Texture not found', description: "Potentially missing texture asset(s)" }, //theoretical according to AI, but not in library
            //{ code: '.texcache', description: "Texture cache data file" } //theoretical according to Claude AI ... but not in my library, but improperly searched for returns way too much?
        ]
    },
    animationIssues: {
        hexCodes: [
            { hexCode: 'B02235', description: "suspected animation indicator" },
        ],
        codes: [
            { code: '.hkx', description: "Havok animation file" },
            { code: 'ahkpCharacterRigidBody', description: "Havok character rigid body physics" },
            { code: 'animation', description: "General animation-related (lower-confidence indicator)" },
            { code: 'animationgraph', description: "Animation graph" },
            { code: 'bhkCharRigidBodyController', description: "Bethesda character rigid body controller" },
            { code: 'BSAnimationGraphManager', description: "Bethesda animation graph management system" },
            { code: 'bshkbanimationgraph', description: "Bethesda Havok animation graph" },
            { code: 'hkpSimpleConstraintContactMgr', description: "Havok constraint contact manager" }
        ]
    },
    animationLoaderIssues: {
        hexCodes: [
            // Space for future hex codes
        ],
        codes: [
            { code: '.hkb', description: "Havok behavior file" },
            { code: '.hkx', description: "Havok animation file" },
            { code: '0_master.hkb', description: "Master behavior file" },
            { code: '67B88B', description: "suspected animation loader, hexcode indicator" }, //PURPOSEFULLY NOT INCLUDED IN HEX CODES SECTION (since only suspected?)
            { code: 'behavior', description: "Generic behavior file reference (lower-confidence indicator)" },
            { code: 'bshkbanimationgraph', description: "Bethesda Havok animation graph" },
            { code: 'BShkbAnimationGraph', description: "Bethesda Havok animation graph system" },
            { code: 'dynamicanimationreplacer.dll', description: "DAR loader detected" },
            { code: 'dynamicanimationreplacer.ini', description: "DAR configuration file" },
            { code: 'hkbBehaviorGraph', description: "Havok behavior graph system" },
            { code: 'hkbCharacter', description: "Havok behavior character controller" },
            { code: 'hkbClipGenerator', description: "Havok behavior clip generator" },
            { code: 'hkbclipgenerator', description: "Havok clip generator" },
            { code: 'hkbehaviorgraph', description: "Havok behavior graph" },
            { code: 'hkbStateMachine', description: "Havok behavior state machine" },
            { code: 'hkbvariablebindingset', description: "Havok variable binding set" },
            { code: 'openanimationreplacer.dll', description: "OAR loader detected" },
            { code: 'openanimationreplacer.pdb', description: "OAR debug symbols" }
        ]
    },
    /* animationLoaderIssues: {
        //DELETE:
        codes: [
            { code: 'hkbBehaviorGraph', description: "" },
            { code: 'hkbCharacter', description: "" },
            { code: 'BSAnimationGraphManager', description: "" },
        ]
    }, */


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
    lotdKaragasTowerDoorCrashIssues: {
        hexCodes: [
            { hexCode: '04D26E7', description: "First-line error code for Legend of the Dragonborn's Karagas' Tower Door Crash" },
        ],
        codes: [
            { code: '04D26E7', description: "First-line hexcode for Legend of the Dragonborn's Karagas' Tower Door Crash" },
            { code: 'LegacyoftheDragonborn.esm', description: "Primary module with the crash-prone Karagas' Tower door" },
            { code: 'LegacyoftheDragonborn0.esp', description: "Additional plugin contributing to the crash" },
            { code: 'Karagas', description: "Specific location related to the crash" },
            { code: 'MovementMessageActivateDoor', description: "Script or message related to door activation causing the crash" },
            { code: 'Door (29)', description: "Reference to the door FormID involved in the crash" },
            { code: '0006597B', description: "FormID for the crashing door in Karagas' Tower" }
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
            { code: 'BSPrecomputedNavmeshInfoSearch', description: "Precomputed navigation mesh information search error" },
            { code: 'CombatNavmeshSearchT', description: "Combat-specific navigation mesh searching issue" },
            { code: 'MovementControllerNPC', description: "May indicate an NPC having nav issues" },
            { code: 'MovementPathManagerArbiter', description: "Movement path management issue" },
            //TOO GENERIC, matches on file names/paths:  { code: 'NavMesh', description: "Navigation mesh error" },
            { code: 'NavMeshInfoArea', description: "NavMesh info area problem" },
            { code: 'NavMeshInfoMap', description: "Navigation mesh information mapping error" },
            { code: 'NavMeshObstacleManager', description: "Navigation mesh obstacle handling issue" },
            { code: 'PathFinding', description: "Path finding issue" },
            { code: 'PathingCell', description: "Cell-based pathing error" },
            { code: 'PathingDoor', description: "Door-related pathing issue" },
            { code: 'PathingLockData', description: "Thread synchronization or concurrency issue during pathing data access" },
            { code: 'PathingRequest', description: "Pathing request failure" },
            { code: 'PathingTaskData', description: "Pathing task data error" },
            { code: 'SIC_WERoad07', description: "Known issue with Skyrim Immersive Creatures mounted NPCs" },
            //NOTE: those below are not in my current library, but recommended by Claude AI
            { code: 'PathManagerClient', description: "Path manager client-side error" },
            { code: 'NavMeshGenerationProperties', description: "NavMesh generation property issue" },
            { code: 'PathingCoverLocation', description: "Cover point pathing error" },
            { code: 'NavMeshPortal', description: "Navigation mesh portal connection issue" },
            { code: 'DetourNavMesh', description: "Detour navigation mesh system error" },
            { code: 'PathingStreamManager', description: "Path streaming management failure" },
            { code: 'NavmeshProcessing', description: "Navigation mesh processing error" },
            { code: 'PathSmoothing', description: "Path smoothing calculation issue" },
            { code: 'Path Following Movement State', description: "Path following movement state error" },
            { code: 'MovementPostUpdateArbiter', description: "Movement post-update arbiter issue" },
            { code: 'MovementPlannerAgentWarp', description: "Movement planner agent warp error" },
        ]
    },

    enbShaderLightingIssues: {
        codes: [
            { code: '12FDCC0', description: "Unknown BSShader function offset - may indicate shader-related instability" },
            { code: 'AmbientColor', description: "Ambient light color calculations - could relate to lighting template conflicts" },
            { code: 'AmbientOcclusion', description: "AO processing - potential issues with shader implementations" },
            { code: 'ApplyGameColorCorrection', description: "Color correction pipeline - ENB/SweetFX interference possible" },
            { code: 'BGSDecalNode', description: "Decal rendering - possible shader/texture interaction issues" },
            { code: 'BSMultiBoundRoom', description: "Multi-bound room rendering - <b>reportedly reliable indicator</b> of cell transition/interior lighting issues" },
            { code: 'Boris Vorontsov', description: "ENB developer references - may appear in error contexts" },
            { code: 'BSDynamicTriShape', description: "Complex geometry rendering - potential texture/shader overload" },
            { code: 'BSEffectShaderProperty', description: "Effect shaders - possible issues with magic/weather FX" },
            { code: 'BSImagespaceShader', description: "Post-processing effects - ENB/Reshade conflicts possible" },
            { code: 'BSImagespaceShaderAlphaBlend', description: "Alpha blending operations - may indicate screen-space effect issues" },
            { code: 'BSLightingShader', description: "Core lighting system - could indicate conflicts with lighting mods/ENB" },
            { code: 'BSLightingShaderMaterialBase', description: "Material properties - potential mesh/shader mismatches" },
            { code: 'BSLightingShaderMaterialEnvmap', description: "Reflective surfaces - environment mapping issues possible" },
            { code: 'BSLightingShaderProperty', description: "Material lighting data - texture/mesh compatibility concerns" },
            { code: 'BSShader::', description: "Engine shader operations - ENB/shader mod conflicts possible" },
            { code: 'BSShaderAccumulator', description: "Shader buffer management - potential lighting overload" },
            { code: 'BSShaderTextureSet', description: "Texture configurations - missing/incompatible textures possible" },
            { code: 'BSTextureSet', description: "Texture set handling - potential material definition errors" },
            { code: 'BSUtilityShader', description: "Utility shaders - particle/effect processing" },
            { code: 'CellLighting', description: "Localized lighting - potential cell-specific conflicts" },
            { code: 'CommunityShaders.dll', description: "Community Shaders core - installation/version issues possible" },
            { code: 'CSLighting', description: "Custom lighting features - may conflict with ENB/other shaders" },
            { code: 'CSRendering', description: "Rendering pipeline - potential mod compatibility issues" },
            { code: 'CSShader', description: "Shader extensions - possible Community Shaders-related instability" },
            { code: 'd3d11.dll', description: "DirectX 11 interface - Graphics mod hooking issues possible" },
            { code: 'd3d9.dll', description: "DirectX 9 interface - Graphics mod hooking issues possible" },
            { code: 'd3dcompiler_47.dll', description: "Shader compilation - invalid/mismatched shaders suspected" },
            { code: 'DeferredLighting', description: "Lighting pipeline - potential rendering step conflicts" },
            { code: 'DirectionalLight', description: "Sun/moon lighting - shadow/ENB adaptation issues possible" },
            { code: 'DXGI.dll', description: "Graphics interface - potential driver/ENB compatibility issues" },
            { code: 'DXGI_ERROR_DEVICE_REMOVED', description: "GPU disconnect - could indicate VRAM overutilization" },
            { code: 'ELFX - Exteriors.esp', description: "ELFX exterior module - lighting mod conflict possible" },
            { code: 'ELFXEnhancer.esp', description: "ELFX addon - potential interior lighting conflicts" },
            { code: 'ENB Reference', description: "ENB mentions - general indicator of ENB involvement" },
            //too generic: { code: 'ENB', description: "ENB framework - general graphics enhancement (generic indicator)" },
            { code: 'ENBEffect.fx', description: "Custom shaders - potential syntax/version errors" },
            { code: 'enbhelper.dll', description: "ENB extension - possible version incompatibility" },
            { code: 'enbhost.exe', description: "ENB memory process - potential memory management issues" },
            { code: 'enblocal.ini', description: "ENB configuration - possible settings mismatch" },
            { code: 'enbseries.dll', description: "ENB core - potential installation/version problems " },
            { code: 'enbseries.ini', description: "ENB settings - potential rendering configuration issues" },
            { code: 'ENBShaderCache', description: "Shader caching - corruption/version mismatch possible" },
            { code: 'ENBSky', description: "Sky rendering - weather/lighting mod conflicts possible" },
            { code: 'ENBWaterShader', description: "Water effects - potential compatibility issues" },
            //too generic: { code: 'HDR', description: "High Dynamic Range - tone mapping/ENB conflicts possible" },
            { code: 'ImageSpace', description: "Post-processing - ENB/Reshade interference possible" },
            { code: 'LightingTemplate', description: "Environment lighting - potential cell/mod compatibility issues" },
            { code: 'Lux Via.esp', description: "Lux roads module - exterior lighting conflicts possible" },
            { code: 'Lux.esp', description: "Lux core - potential interior lighting system conflicts" },
            { code: 'NiAVObject', description: "Scene objects - rendering property conflicts possible" },
            { code: 'NiNode', description: "Scene graph - potential rendering hierarchy issues" },
            //too generic: { code: 'Parallax', description: "Depth effects - potential texture/shader compatibility issues" },
            { code: 'PixelShader', description: "Shader processing - compilation/runtime errors possible" },
            { code: 'Refraction', description: "Light bending - potential transparency/shader issues" },
            { code: 'RenderTarget', description: "Buffer management - ENB/effects conflicts possible" },
            { code: 'ShaderPipeline', description: "Rendering workflow - potential mod/ENB step conflicts" },
            { code: 'ShadowSceneNode', description: "Shadow rendering - potential casting/receiving conflicts" },
            { code: 'SkyShader', description: "Sky rendering - weather/ENB sky conflicts possible" },
            { code: 'VertexShader', description: "Geometry processing - compilation/runtime errors possible" },
            { code: 'WaterShader', description: "Water rendering - ENB/water mod conflicts possible" },
            { code: 'WindowShadersRT.esp', description: "Window effects - potential shader/texture conflicts" },
            { code: 'BSFadeNode', description: "Object fade transitions - possible exterior lighting/LOD conflicts" },
            { code: 'BSXFlags', description: "Shader property flags - snow/wetness material conflicts possible" },
            { code: 'BSWaterShaderMaterial', description: "Water material properties - conflicts with water shader mods likely" },
            //too generic: { code: 'Decal', description: "Decal rendering systems - potential shader/texture blending issues" },
            { code: 'SubSurfaceScattering', description: "Subsurface effects - skin/object translucency shader conflicts (ENB/character mods)" },
            { code: 'VolumetricLighting', description: "Volumetric light rendering - ENB godray/lighting mod issues suspected" },
            { code: 'ShadowMap', description: "Shadow map handling - resolution/rendering compatibility issues" },
            { code: 'RenderTargetSize', description: "Render target dimensions - ENB upscaling/downsampling conflicts" },
            { code: 'TextureBlend', description: "Texture blending modes - parallax/terrain material incompatibilities" },
            { code: 'ENBLight', description: "ENB light sources - conflicts with custom lighting placements" },
            { code: 'ComplexFire', description: "Complex fire effects - particle lighting/shader overload" }
        ]
    },

    //
    // --- stuff thought up by AI for possible new tests: ---
    //
    pluginIssues: [
        { code: 'plugin', description: "General plugin-related problem" },
        { code: 'esp', description: "ESP file issue" },
        { code: 'esm', description: "ESM file issue" },
        { code: 'esl', description: "ESL file issue" }
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