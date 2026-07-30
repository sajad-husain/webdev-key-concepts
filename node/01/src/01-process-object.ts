
// env variable
// command line arguments
// exit code 
// process lifecycle events

// reading backend ports from env file
// read secrets - db urls, api key, password, google auth
// read CLI arguments in scripts 

import process from "node:process"

// dot env

const nodeEnv = process.env.NODE_ENV ?? "develpment";

// process.env vlaues always should be string or undefined