import * as Crypto from 'crypto-js';
import { PromptEloquent } from './promt-eloquent';

export class ZeroCli extends PromptEloquent {
    async main() {
        console.log('Zero Cli Startup');
        if (process.argv.includes('jenkins')) import('./../services/jenkins');
    }

    async initDevMode(){
        console.log('...startting devmode');

    }

}
(async () => new ZeroCli().main())().then();