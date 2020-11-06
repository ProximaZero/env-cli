import { PromptEloquent } from './promt-eloquent';
import * as prompts from 'prompts';
import * as fs from 'fs';
import * as child_process from 'child_process';
import { IPackage } from './common/i-package';
import { runInThisContext } from 'vm';
const PKG: IPackage = JSON.parse(fs.readFileSync('package.json').toString('utf-8'));
export class ZeroCli extends PromptEloquent {
    async main() {
        console.log('Zero Cli Startup');
        if (process.argv.includes('jenkins')) import('./../services/jenkins'); else
            if (process.argv.includes('init')) this.initRepo(); else
                if (process.argv.includes('dev-mode')) this.initDevMode(); else
                    this.menu();
    }
    async initDevMode() { }
    async initRepo() {
        // if (this.isInitialized()) { this.menu(); return; }
        /// TODO: obter todos os parâmetros para consrtrprojeto aqui
        const result = await
            (async () => {
                const projectName = await prompts({
                    type: 'text',
                    name: 'project_name',
                    validate: v => typeof v === 'string' && v.length >= 0 && v.length <= 128,
                    message: `Project Name? (${PKG.name})`
                });
                
                
                this.exec('npm i -D -F ~/zero/br.com.zero.core/');
            })();
    }

    exec(cwd: string) {
        const exec = child_process.execSync(cwd,{},dwd).toString('utf-8');
        return exec;
    }
    async isInitialized() {
        return false;
    }
    async menu() {
        // if(this.isInitialized())
        (async () => {
            const menuOption: { menuOption: string } = await prompts(
                {
                    type: 'select',
                    name: 'menuOption',
                    message: "O que fazer?",
                    choices: [
                        { title: 'Init', value: 'initRepo', description: '' },
                        { title: 'Generate', value: 'generate', description: '' },
                        { title: 'Exit', value: 'exit', description: '' },
                    ]
                },
            );
            if (menuOption && menuOption.menuOption && typeof menuOption.menuOption === 'string') {
                (this as any)[`${menuOption.menuOption}`]();
            }
        })();
    }

    async generate() {

    }

    async exit() {
        process.kill(0);
    }
}
(async () => new ZeroCli().main())().then();