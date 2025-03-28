const antivirusSignatures = {
    '360 Total Security': ['360safe.dll'],
    'AhnLab V3': ['v3svc.dll'],
    'AOL Active Virus Shield': ['aolav.dll'],
    'ArcaBit': ['arcabitengine.dll'],
    'AVG': ['avgui.dll'],
    'Avast': ['avast.dll', 'aswEngineA.dll'],
    'Avira/Surfshark': ['avamsi.dll', 'avamsicli.dll', 'avcuf32.dll'],
        //NOTE: 'avamsi.dll' is also a filename used by SurfShark. My guess they are rebranding software from Avira?
        //BUT: Surfshark is also allegedly a variant of Webroot (or at least was)
    'Baidu Antivirus': ['bdhsvc.dll'],
    'Bitdefender': ['bdcore.dll', 'avc3.dll', 'atcuf64.dll', 'antimalware_provider64.dll', 'bdhkm64.dll'],
    'BullGuard': ['bullguard.dll', 'bgadriver.dll'],
    'ClamAV': ['libclamav.dll'],
    'Comodo': ['cavwp.dll'],
    'Dr.Web': ['dwengine.dll', 'drwebsp.dll'],
    'Emsisoft': ['a2cmd.dll'],
    'ESET': ['egui.dll', 'eks.dll'],
    'F-Secure': ['fsaus.dll', 'fsdfw.dll'],
    'Fortinet': ['fnetwizard.dll', 'fortinet_krn.dll'],
    'G Data': ['gdata_avi.dll', 'gdavflt.dll'],
    'K7 AntiVirus': ['k7sentry.dll', 'k7avgent.dll'],
    'Kaspersky': ['kavprot.dll', 'klif.dll', 'com_antivirus.dll'],
    'Malwarebytes': ['mbamswissarmy.dll'],
    'McAfee': ['mcafee.dll', 'mfehidk.dll'],
    'Norton': ['npsystem.dll', 'symcorpui.dll'],
    'Nscore': ['nscore64.dll'],
    'Panda': ['panda_url_filtering.dll', 'pavbootstartdriver.dll'],
    'Quick Heal': ['qhsafemain.dll', 'qhwtp.dll'],
    'Rising': ['ravmon.dll', 'rfapi.dll'],
    'Sophos': ['sophos_detoured.dll', 'savapi.dll', 'sav.dll'],
    'SurfShark': ['ssav.dll', 'surfshark.dll', 'sscore.dll', 'sskill.dll', 'ssprotect.dll', 'ssfirewall.dll', 'ssantivirus.dll', 'ssmonitor.dll', 'ssscanner.dll', 'surfshark'],
        //NOTE: Surf shark is supposed to be a variant on Webroot, so doing an aggressive search
    'Symantec': ['symnav.dll', 'symcheck.dll'],
    'TotalDefense': ['sbamsvc.dll', 'tdrtac.dll'],
    'Trend Micro': ['tmntsrv.dll', 'tmwlutil.dll', 'vsapi32.dll'],
    'VirusBuster': ['vba32core.dll', 'vbadeint.dll'],
    'Webroot': ['wrsvc.dll', 'wrsa.dll', 'wrusr.dll', 'wrlogon.dll', 'wrweb.dll', 'webroot'],
        //NOTE: getting especially aggressive trying to find apparently-elusive indicators for Webroot
            //If it still evades detection, then consider adding these, but these are a bit loose, so each one would have be be searched for in my library to make sure of no false positives: 'wrsvc', 'wrsa', 'wrusr', 'wrlogon', 'wrweb', 'wr_', 'wrusercheck', 'wrkernel'
    //EXCEPTION: 'Windows Security': ['msmpeng.exe', 'msmpsvc.dll'], //NOTE: Windows Security is typically the recommended antivirus for heavily-modded Skyrim, so no warning is needed unless it shows up in the top half of the crash log (handled elsewhere)
    'ZoneAlarm': ['zavcore.dll', 'zlclient.dll']
};