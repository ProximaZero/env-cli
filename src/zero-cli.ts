import * as Crypto from 'crypto-js';
import * as prompts from 'prompts';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { PromptEloquent } from './promt-eloquent';

export class ZeroCli extends PromptEloquent {
    async main() {
        console.log('Zero Cli Startup');
    }

    async initDevMode(){
        console.log('...startting devmode');

    }

    async fix(){

    }
}
(async () => new ZeroCli().main())().then();