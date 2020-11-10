import { PromptEloquent } from './promt-eloquent';
import * as prompts from 'prompts';
import * as fs from 'fs';
import * as child_process from 'child_process';
import { IPackage } from './common/i-package';
import { runInThisContext } from 'vm';
import { Extract } from './common/utils/extract';
const PKG: IPackage = JSON.parse(fs.readFileSync('package.json').toString('utf-8'));
export class ZeroCli extends PromptEloquent {
    async main() {
        console.log('Zero Cli Startup');
        if ([
            process.argv[0],
            process.argv[1],
            process.argv[2],
            process.argv[3],
        ].includes('rebuild')) {
            this.rebuild();
        }
        else
            if (process.argv.includes('jenkins')) import('./../services/jenkins'); else
                if (process.argv.includes('init')) this.initRepo(); else
                    if (process.argv.includes('-develop')) this.develop(); else
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
        const exec = child_process.execSync(cwd, {}).toString('utf-8');
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

    async develop(commit_message: string = process.argv[process.argv.length - 1]) {
        await this.exec(`git add .`);
        await this.exec(`git commit -m "${commit_message}"`);
        await this.exec(`git push`); // TODO: set up stream 

    }

    async exit() {
        process.kill(0);
    }

    async rebuild() {
        await this.exec(`cd ~/zero/env-cli && tsc && npm version prerelease && git add . && git commit -m "${ await this.getCommitMessage()}" && npm i -g ./ --force`);
    }

    async getCommitMessage() {
        const extract = await new Extract(await this.exec('git status'));
        const branchName = extract.onRight(['ramo']).inLine().build();
        
        const currentDate = new Date();
        
        const jiraBranchName: string = '' || 'UND';
        const jiraBranchID: string =  '' || '0'
        const jiraItemType: 'task' | 'error' | 'epic' = 'task';
        const changes : string = '### Changes: ' +
        '';
        return `${
            jiraBranchName.toUpperCase()
        }/${
            jiraBranchID.toLocaleUpperCase()
        }[${
            branchName
        }]:\n${
            changes
        }`;
    }
}
(async () => new ZeroCli().main())().then();