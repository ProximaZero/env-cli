import * as child_process from 'child_process';
/// child_process.execSync();

export async function main(){
    while(true){
        await wakeup();
    }   
} 

export async function wakeup(){
    return child_process.execSync('cd ~/snap/jenkins && sh run-v2');
}

setTimeout(async () => 
    {
        try { 
            await main();
        } catch(error: any){ 
            console.trace("Error on setup Jenkins service... /bad service");
            console.trace(error);
        }
    },0);