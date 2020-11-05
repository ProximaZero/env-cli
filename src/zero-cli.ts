import { PromptEloquent } from './promt-eloquent';
import * as prompts from 'prompts';
import * as fs from 'fs';
import { IPackage } from './common/i-package';
export class ZeroCli extends PromptEloquent {
    async main() {
        console.log('Zero Cli Startup');
        if (process.argv.includes('jenkins')) import('./../services/jenkins');
        if (process.argv.includes('init')) this.initRepo();
    }

    async initDevMode(){
        /// console.log('...startting devmode');

    }

    async initRepo(){
        console.log('Iniciando repositório');

        /// TODO: obter todos os parâmetros para consrtrprojeto aqui
        const PKG: IPackage = JSON.parse(fs.readFileSync('package.json').toString('utf-8'));

        const result = 
        ( async () => {
            const response = await prompts({
                type: 'text',
                name: 'project_name',
                validate: v => typeof v === 'string' && v.length >= 0 && v.length <= 36,
                message: `Project Name? (${PKG.name})` 
            });
        } ) ();
    }

}
(async () => new ZeroCli().main())().then();