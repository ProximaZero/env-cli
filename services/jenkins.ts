import * as child_process from 'child_process';
/// child_process.execSync();

export async function main(){
    while(true){
        await wakeup();
    }   
} 

export async function wakeup(){    
    return child_process.exec('cd ~/snap/jenkins && open sh run-v2',{windowsHide:true},(err, stdout)=>{ 
        console.info(stdout);
    });
}

setTimeout(async () => 
    {
        try { 
            await main();
        } catch(error){ 
            console.trace("Error on setup Jenkins service... /bad service");
            console.trace(error);
        }
    },0);