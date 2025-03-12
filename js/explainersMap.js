// explainersMap.js

if (typeof Utils === 'undefined') {
    console.error('Error: Utils object is not defined. Make sure utils.js is loaded before testUtils.js');
} else {
    Utils.explainersMap = new Map([
        //!IMPORTANT: all filenames are expected to be lower case!
        ['_nvngx.dll', '(<b>NVIDIA</b> NGX Runtime Library)'],
        ['a0d789patch.dll', '(<b>recommended</b> bug fix)'],
        ['aero.esl', '(Abyssal Wind Magic mod)'],
        ['achievements.dll', '(Achievements Mods Enabler <b>SKSE</b> plugin)'],
        ['addresslibrarysse.dll', '(Address Library for <b>SKSE</b> Plugins)'],
        ['amdxc64.dll', '(AMD <b>graphics</b> component)'],
        ['animationdatasystem.dll', '(<b>Animation</b> Data System SKSE plugin)'],
        ['animationmotion.dll', '(<b>Animation</b> Motion Revolution SKSE plugin)'],
        ['antimalware_provider64.dll', '(<b>antimalware</b> provider)'],
        ['applicationtargetedfeaturedatabase.dll', '(feature database - MS <b>Windows</b>)'],
        ['asm.plugin.audiodevprops2.dll', '(Nahimic <b>audio</b> component)'],
        ['atcuf64.dll', '(<b>Bitdefender</b> Active Threat Control Userland API)'],
        ['atidxx64.dll', '(AMD <b>graphics</b> component)'],
        ['atiumd6a.dll', '(AMD <b>graphics</b> component)'],
        ['atiuxp64.dll', '(AMD <b>graphics</b> component)'],
        ['autohdr64.addon', '(AutoHDR Addon for <b>ReShade</b>)'],
        ['avamsi.dll', '(Avira <b>Antimalware</b> Scan Interface)'],
        ['avamsicli.dll', '(Avira <b>Antimalware</b> Client Interface)'],
        ['avast.dll', '(Avast <b>Antivirus</b> Core Component)'],
        ['avgui.dll', '(AVG <b>Antivirus</b> User Interface)'],
        ['backportedeslsupport.dll', '(aka BEES 🐝- <b>SKSE</b> plugin)'],
        ['bdcore.dll', '(Bitdefender Core <b>Antivirus</b> Module)'],
        ['bdhkm64.dll', '(Bitdefender Hooking Module - <b>antivirus</b>)'],
        ['bink2w64.dll', '(Bink <b>Video</b> codec - newer version)'],
        ['binkw64.dll', '(Bink <b>Video</b> codec for in-game videos)'],
        ['bsa.dll', '(BSA handling library for <b>mod managers</b>)'],
        ['bufferpatch.dll', '(SSE Display Tweaks <b>SKSE</b> plugin)'],
        ['categorizedmodmenu.dll', '(Categorized Favorite Menu <b>SKSE</b> plugin)'],
        ['cbp.dll', '(Collision Body <b>Physics</b> ... less likely culprit)'],
        ['ccbgssse018-shadowrend.esl', '(Indicator for potential Shadowrend issue?)'],
        ['cef.dll', '(Chromium Embedded Framework - used by some <b>UI</b> mods)'],
        ['chargen.dll', '(<b>RaceMenu</b> character generation plugin)'],
        ['clib64.dll', '(CommonLib shared library for <b>SKSE</b> plugins)'],
        ['com_antivirus.dll', '(Comodo <b>Antivirus</b> Component)'],
        ['comctl32.dll', '(Common Controls Library - MS <b>Windows</b>)'],
        ['comdlg32.dll', '(Common Dialog Box Library - MS <b>Windows</b>)'],
        ['compstui.dll', '(Common Property Sheet UI - MS <b>Windows</b> printing)'],
        ['con_bypass.dll', '(Console Bypass <b>SKSE</b> plugin)'],
        ['concrt140.dll', '(Concurrency Runtime Library - MS <b>Windows</b>)'],
        ['console.dll', '(Enhanced Console Commands <b>SKSE</b> plugin)'],
        ['crashfixes.dll', '(Various <b>crash fixes</b> for Skyrim)'],
        ['crashlogger.dll', '(<b>Crash Logger SSE</b> plugin)'],
        ['d3d10.dll', '(Direct3D 10 Runtime - MS <b>Windows</b> graphics)'],
        ['d3d10_1.dll', '(Direct3D 10.1 Runtime - MS <b>Windows</b> graphics)'],
        ['d3d10_1core.dll', '(Direct3D 10.1 Core Runtime - MS <b>Windows</b> graphics)'],
        ['d3d10core.dll', '(Direct3D 10 Core Runtime - MS <b>Windows</b> graphics)'],
        ['d3d10warp.dll', '(⚠️CPU <b>emulation</b> of GPU - MS <b>Windows</b> graphics)'],
        ['d3d11.dll', '(Direct3D 11 Runtime - MS <b>Windows</b> graphics)'],
        ['d3d11on12.dll', '(Direct3D 11On12 Runtime - MS <b>Windows</b> graphics)'],
        ['d3d12core.dll', '(Direct3D 12 Core Runtime - MS <b>Windows</b> graphics)'],
        ['d3dcompiler_42.dll', '(DirectX HLSL Compiler - MS <b>Windows</b> graphics)'],
        ['d3dcompiler_46e.dll', '(<b>ENB</b> shader compiler)'],
        ['d3dcompiler_47.dll', '(DirectX Shader Compiler - used by some <b>graphics</b> mods)'],
        ['d3dscache.dll', '(Direct3D Shader Cache - MS <b>Windows</b> graphics)'],
        ['d3dx10_42.dll', '(DirectX 10.1 Extensions - MS <b>Windows</b> graphics)'],
        ['d3dx11_42.dll', '(Direct3D 11 Extensions - MS <b>Windows</b> graphics)'],
        ['d3dx9_42.dll', '(DirectX 9 library - likely from <b>SSE Engine Fixes</b> - Part 2)'],
        ['d3dx9_43.dll', '(Direct3D 9 Extensions - MS <b>Windows</b> graphics)'],
        ['dbsksefunctions.dll', '(Dylbill\'s Papyrus Functions <b>SKSE</b> plugin)'],
        ['detoured.dll', '(Microsoft Detours Library - <b>Windows</b>)'],
        ['deviceaccess.dll', '(Device Broker And Policy COM Server - MS <b>Windows</b>)'],
        ['dinput8.dll', '(DirectInput library - used for <b>input</b> handling)'],
        ['disco_gravelordpatch.esp', '(<b>recommended</b> bug fix)'],
        ['disco_odingravelordpatchb.esp', '(<b>recommended</b> bug fix)'],
        ['discordhook64.dll', '(Discord <b>Overlay</b> Component)'],
        ['dkaf.dll', '(Skyrim modding tool for binding keys to <b>animations</b>)'],
        ['dmenu.dll', '(Dynamic Menu for Skyrim SE Mods - MS <b>Windows</b>)'],
        ['dsound.dll', '(DirectSound library for <b>audio</b> processing)'],
        ['dxcompiler.dll', '(Direct3D Shader Compiler - MS <b>Windows</b>)'],
        ['dxgi.dll', '(DirectX Graphics Infrastructure - part of <b>Windows</b>, but altered by some mods)'],
        ['dxil.dll', '(DirectX Intermediate Language Library - MS <b>Windows</b>)'],
        ['dxilconv.dll', '(DXBC to DXIL Converter - MS <b>Windows</b>)'],
        ['dynamicanimationreplacer.dll', '(aka DAR - <i>older</i> <b>animation</b> replacer mod)'],
        ['eamsi.dll', '(ESET <b>Antimalware</b> Scan Interface)'],
        ['edputil.dll', '(EDP Utility Library - MS <b>Windows</b>)'],
        ['egui.dll', '(ESET Graphical User Interface - <b>antivirus</b>)'],
        ['enb123.dll', '(Older version of <b>ENB</b> graphics mod)'],
        ['enbhelper.dll', '(<b>ENB</b> helper library)'],
        ['engine_fixes.dll', '(SSE Engine Fixes <b>SKSE</b> plugin ... less likely culprit)'],
        ['equippablekittails.dll', '(Equippable Khajiit Tails <b>SKSE</b> plugin)'],
        ['f4se_1_10_163.dll', '(<b>Fallout 4</b> Script Extender - mistakenly present)'],
        ['ffx_backend_dx12_x64.dll', '(FidelityFX S.R. 3.0 Backend Library - <b>NVIDIA</b>)'],
        ['ffx_frameinterpolation_x64.dll', '(FidelityFX S.R. 3.0 Frame Interpolation - <b>NVIDIA</b>)'],
        ['ffx_fsr2_api_dx11_x64.dll', '(FidelityFX S.R. 2 API for DirectX 11 - <b>AMD</b>)'],
        ['ffx_fsr2_api_dx12_x64.dll', '(FidelityFX S.R. 2.0 API for DirectX 12 - <b>AMD</b>)'],
        ['ffx_fsr2_api_x64.dll', '(FidelityFX S.R. 2 API - <b>AMD</b>)'],
        ['ffx_fsr3_x64.dll', '(FidelityFX S.R. 3.0 Core Library - <b>NVIDIA</b> driver)'],
        ['ffx_fsr3upscaler_x64.dll', '(FidelityFX S.R. 3.0 <b>Upscaler</b> - NVIDIA)'],
        ['ffx_opticalflow_x64.dll', '(Optical Flow for FidelityFX S.R. 3.0 - <b>NVIDIA</b>)'],
        ['fileregistry64.dll', '(<b>File Registry</b> SKSE plugin)'],
        ['flexrelease_x64.dll', '(NVIDIA PhysX library - used by some <b>physics</b> mods)'],
        ['fmod.dll', '(FMOD <b>audio</b> engine used by Skyrim)'],
        ['fnis.dll', '(Fores New Idles in Skyrim <b>animation</b> framework)'],
        ['fraps.dll', '(Fraps Screen Capture and <b>Overlay</b>)'],
        ['freezeprotect.dll', '(Freeze Protection <b>SKSE</b> plugin)'],
        ['fsaus.dll', '(F-Secure <b>Antivirus</b> User-mode Service)'],
        ['fwmf.esp', '(Flat World <b>Map</b> Framework)'],
        ['gameoverlayrenderer64.dll', '(Steam <b>Overlay</b> Component)'],
        ['gamepad++.dll', '(Gamepad++ <b>controller</b> mod)'],
        ['glu32.dll', '(OpenGL Utility Library - <b>graphics</b> component)'],
        ['gridhud.dll', '(Grid HUD interface mod - <b>UI</b>)'],
        ['havok.dll', '(Havok <b>Physics</b> engine used by Skyrim)'],
        ['hdtphysicsextensions.dll', '(HDT-SMP <b>Physics</b> mod)'],
        ['hdtsmp64.dll', '(Skinned Mesh <b>Physics</b> ... less likely culprit)'],
        ['hooksharedsse.dll', '(HookShare <b>SKSE</b> plugin)'],
        ['iequip.dll', '(iEquip <b>SKSE</b> plugin)'],
        ['igc64.dll', '(Intel Graphics Compiler for OpenCL - <b>graphics</b>)'],
        ['igd10iumd64.dll', '(Intel Graphics Accelerator Drivers - <b>graphics</b>)'],
        ['igd10um64gen11.dll', '(Intel Graphics Accelerator Driver - <b>graphics</b>)'],
        ['igd10um64xe.dll', '(Intel HD <b>Graphics</b> Driver)'],
        ['igdgmm64.dll', '(Intel HD <b>Graphics</b> Drivers)'],
        ['immersivefp.dll', '(Immersive First Person View <b>SKSE</b> plugin)'],
        ['inputhook.dll', '(Input hook library used by some <b>controller</b> mods)'],
        ['intelcontrollib.dll', '(Intel <b>Graphics</b> Control Lib Runtime)'],
        ['jcontainers.dll', '(JContainers <b>SKSE</b> plugin for advanced scripting)'],
        ['jsproxy.dll', '(JScript Proxy Auto-Configuration - associated with Internet Explorer)'],
        ['kavprot.dll', '(Kaspersky <b>Antivirus</b> Protection Module)'],
        ['kerberos.dll', '(Kerberos Security Package - MS <b>Windows</b> security)'],
        ['libxess.dll', '(Xe Super Sampling Library - <b>NVIDIA</b>)'],
        ['llcbhook.dll', '(Load Library Copy Back hook for <b>mod managers</b>)'],
        ['loadgamefix.dll', '(Load Game CTD Fix <b>SKSE</b> plugin)'],
        ['locksys.dll', '(Lock System <b>SKSE</b> plugin for enhanced lockpicking)'],
        ['markarth outskirts - water for enb (shades of skyrim) patch.esp', '(optionally load after <b>DynDOLOD.esp</b>)'],
        ['maxsu.dll', '(MaxSU <b>SKSE</b> plugin for script utility functions)'],
        ['mcafee.dll', '(McAfee <b>Antivirus</b> Core Component)'],
        ['mcmhelper.dll', '(<b>MCM Helper</b> SKSE plugin for mod configuration)'],
        ['medal-hook64.dll', '(<b>Medal.tv</b> Hook Library - used for game recording)'],
        ['mfgfix.dll', '(<b>SKSE</b> plugin for facial animation fixes)'],
        ['mlang.dll', '(Multilanguage Support DLL - MS <b>Windows</b>)'],
        ['modorganizer.dll', '(Mod Organizer 2 virtual <b>file system</b>)'],
        ['msacm32.dll', '(Microsoft ACM <b>Audio</b> Filter)'],
        ['msiso.dll', '(Internet Explorer Isolation Library - MS <b>Windows</b>)'],
        ['msvcp100.dll', '(Microsoft Visual C++ 2010 Redistributable - <b>Windows</b>)'],
        ['msvcp110.dll', '(Microsoft Visual C++ 2012 Redistributable - <b>Windows</b>)'],
        ['msvcp110_win.dll', '(Microsoft Visual C++ 2015 Redistributable - <b>Windows</b>)'],
        ['msvcp140.dll', '(Microsoft Visual C++ 2015 Redistributable - <b>Windows</b>)'],
        ['n64hooks.dll', '(N64 hooks library - <b>emulator</b>)'],
        ['nativepatch.dll', '(SSE Native Patch <b>SKSE</b> plugin)'],
        ['nemesis unlimited behavior engine.exe', '(<b>Animation</b> framework, alternative to FNIS)'],
        ['netimmerse.dll', '(NetImmerse Override <b>SKSE</b> plugin)'],
        ['ninput.dll', '(Microsoft Pen and Touch <b>Input</b> Component)'],
        ['npsystem.dll', '(Norton Protection System Component - <b>antivirus</b>)'],
        ['nscore64.dll', '(Nscore library - <b>antivirus</b>)'],
        ['nv_ags.dll', '(<b>NVIDIA</b> Advanced Graphics SDK)'],
        ['nvapi64.dll', '(<b>NVIDIA</b> Driver API Library)'],
        ['nvcuda.dll', '(<b>NVIDIA</b> CUDA Driver)'],
        ['nvdxgdmal64.dll', '(<b>NVIDIA</b> DirectX Graphics Device Memory Allocation Library)'],
        ['nvgpucomp64.dll', '(NVIDIA GPU Component - <b>graphics driver</b>)'],
        ['nvlddmkm.sys', '(<b>NVIDIA</b> Windows Kernel Mode Driver)'],
        ['nvngx_dlss.dll', '(<b>NVIDIA</b> DLSS Driver)'],
        ['nvngx_dlssg.dll', '(<b>NVIDIA</b> DLSS Driver for FSR3)'],
        ['nvofapi64.dll', '(<b>NVIDIA</b> Optical Flow API)'],
        ['nvoglv32.dll', '(<b>NVIDIA</b> OpenGL Driver for 32-bit)'],
        ['nvoglv64.dll', '(<b>NVIDIA</b> OpenGL Driver for 64-bit)'],
        ['nvspcap64.dll', '(<b>NVIDIA</b> Video Capture API)'],
        ['nvwgf2um.dll', '(<b>NVIDIA</b> D3D10 User Mode Driver for 32-bit)'],
        ['nvwgf2umx.dll', '(<b>NVIDIA</b> D3D10 User Mode Driver for 64-bit)'],
        ['nxmhandler.dll', '(Nexus Mod Manager URL handler - <b>mod manager</b>)'],
        ['occlusion.esp', '(<b>DynDOLOD</b> occlusion optimization file)'],
        ['oleacc.dll', '(Active Accessibility Core Component - MS <b>Windows</b>)'],
        ['onecorecommonproxystub.dll', '(<b>Windows</b> system component)'],
        ['onecoreuapcommonproxystub.dll', '(OneCore UAP Common Proxy Stub - MS <b>Windows</b>)'],
        ['openanimationreplacer.dll', '(aka OAR - <i>newer</i> <b>animation</b> replacer mod)'],
        ['opengl32.dll', '(OpenGL Client DLL - <b>graphics</b> component)'],
        ['overwolf.dll', '(Overwolf <b>Overlay</b> Component)'],
        ['ow-graphics-hook64.dll', '(Overwolf Graphics Hook gaming component - <b>overlay</b>)'],
        ['owclient.dll', '(Overwolf gaming component - <b>overlay</b>)'],
        ['owexplorer.dll', '(Overwolf gaming component - <b>overlay</b>)'],
        ['owutils.dll', '(Overwolf gaming component - <b>overlay</b>)'],
        ['papyrus compiler.exe', '(Compiler for Skyrim\'s <b>scripting</b> language)'],
        ['papyrusextender64.dll', '(Papyrus <b>Script</b> Extender)'],
        ['papyrusextenderse.dll', '(Papyrus <b>Script</b> Extender)'],
        ['papyrusextenderse64.dll', '(Papyrus <b>Script</b> Extender)'],
        ['papyrustweaks.dll', '(Papyrus <b>Script</b> Tweaks)'],
        ['papyrusutil.dll', '(Papyrus <b>Script</b> Utility)'],
        ['parallaxfix.dll', '(Parallax Fix <b>SKSE</b> plugin)'],
        ['particlepatch.dll', '(Particle Patch for <b>ENB</b>)'],
        ['pcb.dll', '(Payload Control Box used by some <b>SKSE</b> plugins)'],
        ['pdperfplugin.dll', '(<b>Puredark\'s</b> Performance Plugin - SKSE)'],
        ['pluginmanager.dll', '(Plugin Manager for <b>mod organizers</b>)'],
        ['po3_papyrusextender.dll', '(Papyrus <b>Script</b> Extender)'],
        ['po3_tweaks.dll', '(Powerof3\'s Tweaks <b>SKSE</b> plugin)'],
        ['product_info.dll', '(A-Volute 3D Sound Experts - <b>audio</b> component)'],
        ['quicklootee.dll', '(QuickLoot EE <b>SKSE</b> plugin)'],
        ['raptr64.dll', '(Raptr Gaming <b>Overlay</b>)'],
        ['reshade64.dll', '(<b>ReShade</b> post-processing injector)'],
        ['rtsshdrs64.dll', '(RivaTuner Statistics Server Hooks - <b>monitoring</b>)'],
        ['rtsshooks64.dll', '(RivaTuner Statistics Server Hooks for graphics card <b>monitoring</b>)'],
        ['sandboxingext.dll', '(Sandboxing Extended <b>SKSE</b> plugin)'],
        ['savecleanerpolyfill.dll', '(Save Cleaner <b>SKSE</b> plugin)'],
        ['scaleform.dll', '(Scaleform <b>UI</b> middleware used by Skyrim)'],
        ['simplemap.dll', '(Simple Map <b>SKSE</b> plugin)'],
        ['skee64.dll', '(<b>RaceMenu</b> SKSE plugin)'],
        ['skeleton.nif', '(less likely culprit)'],
        ['skeleton_female.nif', '(less likely culprit)'],
        ['skeleton_male.nif', '(less likely culprit)'], //Does this exist? Or is it just skeleton.nif (as above)?
        ['skinned mesh physics.dll', '(<b>Physics</b> mod for character models)'],
        ['skinshader.dll', '(Custom skin <b>shader</b> used by some texture mods)'],
        ['skse64_1_5_97.dll', '(Skyrim <b>Script</b> Extender)'],
        ['skse64_1_6_1170.dll', '(Skyrim <b>Script</b> Extender) ... unlikely culprit'],
        ['skse64_steam_loader.dll', '(<b>SKSE</b> Steam loader)'],
        ['skse64_loader.exe', '(<b>SKSE</b> loader executable)'],
        ['skyprocednpp.dll', '(SkyProc Patchers <b>SKSE</b> plugin)'],
        ['skyrim paper map by freelancecartography (2nd edition) for fwmf.esp', '(place near <b>bottom</b> of load order)'],
        ['skyrimautoreloader.dll', '(<b>recommended</b> bug fix)'],
        ['skyrimupscaler.dll', '(Puredark\'s <b>Upscaler</b>)'],
        ['sl.common.dll', '(Streamline Common Library - <b>NVIDIA</b>)'],
        ['sl.dlss_g.dll', '(<b>NVIDIA</b> DLSS Frame Generation)'],
        ['sl.interposer.dll', '(<b>NVIDIA</b> Streamline Interposer Module)'],
        ['sl.reflex.dll', '(<b>NVIDIA</b> Reflex Library)'],
        ['spis.dll', '(Spell Perk Item Distributor <b>SKSE</b> plugin)'],
        ['sse-hooks.dll', '(SSE Fixes <b>SKSE</b> plugin)'],
        ['streamcore.dll', '(Streaming Core library used by some <b>audio</b> mods)'],
        ['subsurfacescattering.dll', '(Subsurface Scattering <b>shader</b> mod)'],
        ['symamsi.dll', '(Windows Security <b>Antimalware</b> Scan Interface)'],
        ['symnav.dll', '(Symantec <b>Antivirus</b> Core Component)'],
        ['symsrv.dll', '(Symbol Server - MS <b>Windows</b> debugging component)'],
        ['tbb.dll', '(Intel Threading Building Blocks library - likely from <b>SSE Engine Fixes</b> - Part 2)'],
        ['tbbmalloc.dll', '(Intel Threading Building Blocks Memory Allocator - likely from <b>SSE Engine Fixes</b> - Part 2)'],
        ['tes5conv.dll', '(TES5Edit Converter library - <b>modding</b> tool)'],
        ['threadpoolwinrt.dll', '(<b>Windows</b> Runtime Thread Pool Library)'],
        ['tmntsrv.dll', '(Trend Micro Network Service - <b>antivirus</b>)'],
        ['truehud.dll', '(TrueHUD <b>SKSE</b> plugin)'],
        ['uapng.dll', '(Ultimate Animated Potions NG mod)'],
        ['uiautomationcore.dll', '(Microsoft UI Automation Core - <b>Windows</b>)'],
        ['ucrtbase.dll', '(Universal C Runtime Library - <b>MS Windows</b>)'],
        ['und.dll', '(Ultimate NPC Dodging mod)'],
        ['user32.dll', '(Microsoft User Interface Library - <b>Windows</b>)'],
        ['usvfs_x64.dll', '(User Space Virtual <b>File System</b> - MO2 - ⚠️ possible indicator of antivirus issue ⚠️)'],
        ['vcruntime140.dll', '(Visual C++ Runtime Library - MS <b>Windows</b>)'],
        ['versionlib.dll', '(VersionLib <b>SKSE</b> plugin)'],
        ['vsfilter.dll', '(DirectShow subtitle rendering - used by some <b>video</b> mods)'],
        ['vulkan-1.dll', '(Vulkan Runtime Library - MS <b>Windows</b>)'],
        ['vulkaninfo.exe', '(Vulkan Info Utility - MS <b>Windows</b>)'],
        ['water for enb (shades of skyrim).esp', '(optionally load after <b>DynDOLOD.esp</b> along with patches)'],
        ['water for enb - patch - atlas map markers.esp', '(optionally load after <b>DynDOLOD.esp</b>)'],
        ['water for enb - patch - beyond reach.esp', '(optionally load after <b>DynDOLOD.esp</b>)'],
        ['water for enb - patch - beyond skyrim.esp', '(optionally load after <b>DynDOLOD.esp</b>)'],
        ['water for enb - patch - blue rift water.esp', '(optionally load after <b>DynDOLOD.esp</b>)'],
        ['water for enb - patch - blue volcanic water.esp', '(optionally load after <b>DynDOLOD.esp</b>)'],
        ['water for enb - patch - clear creek water.esp', '(optionally load after <b>DynDOLOD.esp</b>)'],
        ['water for enb - patch - clear interior water.esp', '(optionally load after <b>DynDOLOD.esp</b>)'],
        ['water for enb - patch - clear underwater.esp', '(optionally load after <b>DynDOLOD.esp</b>)'],
        ['water for enb - patch - darker lod water.esp', '(optionally load after <b>DynDOLOD.esp</b>)'],
        ['water for enb - patch - expanded towns and cities.esp', '(optionally load after <b>DynDOLOD.esp</b>)'],
        ['water for enb - patch - folkvangr.esp', '(optionally load after <b>DynDOLOD.esp</b>)'],
        ['water for enb - patch - fwmf for fantasy paper maps.esp', '(Load after <b>FWMF for Fantasy Paper Maps.esp</b>)'],
        ['water for enb - patch - generic landscape patch.esp', '(optionally load after <b>DynDOLOD.esp</b>)'],
        ['water for enb - patch - jks bannered mare.esp', '(optionally load after <b>DynDOLOD.esp</b>)'],
        ['water for enb - patch - jks ragged flagon.esp', '(optionally load after <b>DynDOLOD.esp</b>)'],
        ['water for enb - patch - landscape fixes for grass mods.esp', '(optionally load after <b>DynDOLOD.esp</b>)'],
        ['water for enb - patch - lux - jks ragged flagon.esp', '(optionally load after <b>DynDOLOD.esp</b>)'],
        ['water for enb - patch - muddy creek water.esp', '(optionally load after <b>DynDOLOD.esp</b>)'],
        ['water for enb - patch - transparent horse trough water.esp', '(optionally load after <b>DynDOLOD.esp</b>)'],
        ['water for enb - patch - volcanic water.esp', '(optionally load after <b>DynDOLOD.esp</b>)'],
        ['water for enb - patch - wyrmstooth.esp', '(optionally load after <b>DynDOLOD.esp</b>)'],
        ['windows.shell.servicehostbuilder.dll', '(<b>Windows</b> Shell Service Host Builder)'],
        ['windows.staterepositorycore.dll', '(<b>Windows</b> State Repository Core)'],
        ['windows.system.launcher.dll', '(<b>Windows</b> System Launcher)'],
        ['winepulse.drv', '(Wine PulseAudio Driver - Windows <b>emulator</b>)'],
        ['winevulkan.dll', '(Wine Vulkan Driver - Windows <b>emulator</b>)'],
        ['winex11.drv', '(Wine X11 Driver - Windows <b>emulator</b>)'],
        ['winspool.drv', '(<b>Windows</b> Spooler Driver - printing subsystem)'],
        ['wintrust.dll', '(Windows Trust Manager - <b>Windows</b>)'],
        ['wrsvc.dll', '(Webroot SecureAnywhere Service - <b>antivirus</b>)'],
        ['wtsapi32.dll', '(<b>Windows</b> Terminal Server SDK API)'],
        ['xaudio2_7.dll', '(XAudio library for <b>audio</b> processing)'],
        ['xefx.dll', '(Intel Xe <b>Graphics</b> Architecture)'],
        ['xefx_loader.dll', '(Intel Xe <b>Graphics</b> Loader)'],
        ['xinput1_3.dll', '(XInput library for <b>controller</b> support)'],
        ['zavcore.dll', '(ZoneAlarm Core <b>Antivirus</b> Module)'],
    ]);
}