

// while running something if we need a delay 
// if we want repeatedly running something with fixed time interval

function runSetTimoutExample(): void{
    console.log("1. Running Example")
    setTimeout(() =>{
        console.log("2. Runnsing set time out with 1sec delay")
    })
    console.log("3. This will run immediately node don't wait.");
    
}

function runClearTimeout(): void{
    const timer = setTimeout(() => {
        console.log("Timeout with 2sec delay");
        
    }, 2000);
    clearTimeout(timer)
    console.log("4. Ran clearTimout the timer cancelled the 2sec ")
}

function runSetInterval(): void{
    let count = 0;
    const interval = setInterval(() => {
        count++
        console.log(`5. Interval tick: ${count}`)
        if(count === 3){
            clearInterval(interval)
            console.log("6. Interval cleared count =", count)
        }
    }, 500);
}

function runSetImmediate(): void{
    setImmediate(() =>{
        console.log("7. setImmedite callback")
    })
    console.log("8. Sync code after setImmediate")
}

 async function testTimout() {
    runSetTimoutExample()
    runClearTimeout()
    runSetInterval()
    runSetImmediate()
}

testTimout()