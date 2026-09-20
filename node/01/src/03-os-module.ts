// ============================================================
// OS module — platform, arch, cpus, memory, home/temp dirs
// Started: 2026-08-02   Finished: 2026-08-02
// ============================================================

import * as os from "node:os"

// os
// cpu info, memory, home/temp dir

function runOsDemo(): void {
    console.log("Plateform", os.platform());
    console.log("Architecture", os.arch());
    console.log("OS type", os.type());
    console.log("OS release", os.release());
    console.log("Home directory", os.homedir());
    console.log("Temp directory", os.tmpdir());
    
    const cpus = os.cpus()
    console.log("Cpu's Details", cpus.length)

    if(cpus.length > 0){
        console.log("FIRST CPU MODEL IS:", cpus[0].model,"SPEED IS" ,cpus[0].speed,"TIMES IS" ,cpus[0].times)
    }

    const toGB = (bytes:number) => (bytes / (1024 ** 3)).toFixed(2);
    console.log("free memory", toGB(os.freemem()))
    console.log("total memory", toGB(os.totalmem()));
    
}

runOsDemo()