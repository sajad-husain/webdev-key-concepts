
// env variable
// command line arguments
// exit code 
// process lifecycle events

// reading backend ports from env file
// read secrets - db urls, api key, password, google auth
// read CLI arguments in scripts 

import process from "node:process"
import crypto from "crypto"

// dot env

const nodeEnv = process.env.NODE_ENV ?? "develpment";

// process.env vlaues always should be string or undefined
const port = Number(process.env.NODE_ENV ?? 3000)

// process.argv[0] path to node
// process.argv[1] path to url-file in my case it's src/01-process-object.ts
// process.argv[2] start => we'll start our value from 2nd argv

const commnadArg = process.argv[2] ?? "start";

// crash flag 
// fail flag
const shouldFail = process.argv.includes("--fail")
const shouldCrash = process.argv.includes("--crash")

// dont start async here 
// node is already shutting down
// final log, final cleanup

process.on("exit", (code) =>{
    console.log(`process is finished with exite code ${code}`);
    
})

function runApp(): void {
    console.log({commnadArg,});
    
    if(shouldCrash){
        console.error("Manual crash triggered with  --crash flag")
        process.exit(1)
    }
    
    if(shouldFail){
        console.error("Manual fail triggered with  --fail flag")
        process.exit(1)
    }
}

runApp()