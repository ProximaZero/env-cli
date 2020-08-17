import * as Crypto from 'crypto-js';
import * as prompts from 'prompts';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

export class EnvCli {
    private options: prompts.Answers<"fileEnv" | "pwd">;
    private envParsed: dotenv.DotenvParseOutput;
    private envs: string[];
    private envFile: string;
    private meta: any = {};
    private uMeta: any = { dt: Date.now() };
    private hashVerify: string;
    private envPrefix = '';
    async main() {
        this.envs = fs.readdirSync('./').filter((file) => file.indexOf('.env') > -1);
        this.options = (await prompts([{
            type: 'select',
            name: 'fileEnv',
            message: 'Selecione o arquivo de configuração',
            choices:
                this.envs.map((f) => {
                    return {
                        title: f, value: f
                    }
                }),
        },
        {
            type: 'password',
            name: 'pwd',
            message: 'Senha de segurança',
        }]));
        this.envParsed = dotenv.parse(fs.readFileSync(this.envFile = this.options.fileEnv));
        if (this.envFile.lastIndexOf('.')) {
            this.envPrefix = this.envFile.substr(0, this.envFile.lastIndexOf('.'));
        }
        if (this.envParsed.METADATA !== undefined) {
            this.meta = JSON.parse(Buffer.from(this.envParsed.METADATA, 'base64').toString());
            delete this.envParsed.METADATA;
        }
        if (this.envParsed.ENV_VALIDADE_HASH !== undefined) {
            let validadeHash = this.hashVerify = this.envParsed.ENV_VALIDADE_HASH;
            delete this.envParsed.ENV_VALIDADE_HASH;
            const KEY = Crypto.HmacSHA256(validadeHash, this.options.pwd);

            Object.keys(this.envParsed).forEach(prop => {
                let value = Crypto.AES.decrypt(this.envParsed[prop], `${Crypto.enc.Utf8.parse(KEY.toString())}`, {
                    iv: `${Crypto.enc.Utf8.parse(KEY.iv)}`, // parse the IV 
                    padding: Crypto.pad.Pkcs7,
                    mode: Crypto.mode.CBC
                });
                this.envParsed[prop] = value.toString(Crypto.enc.Utf8);
            });
        }
        this.menu();
    }

    async getGitUserEmail() {

    }

    async addModificationHistory() {
        if (!this.meta.hist) {
            this.meta.hist = [];
        }
        if (this.meta.hist.indexOf(this.uMeta > -1)) {
            this.meta.hist.push(this.uMeta);
        }
        require('child_process').exec('git config --global user.email', (err: any, stdout: any, stderr: any) => {
            if (stdout) {
                if (this.uMeta.user === undefined)
                    this.uMeta.user = {};

                this.uMeta.user.email = String(stdout).slice(0, -1);
            }
        });
        require('child_process').exec('git config --global user.name', (err: any, stdout: any, stderr: any) => {
            if (stdout) {
                if (this.uMeta.user === undefined)
                    this.uMeta.user = {};

                this.uMeta.user.name = String(stdout).slice(0, -1);
            }
        });
    }
    async menu() {
        await this.navigate([
            { name: 'View', fn: () => this.whatToDo() },
            { name: 'Edit', fn: () => { this.addModificationHistory(); this.whatToDo() } },
            { name: 'Audit', fn: () => this.audit() },
            { name: 'Create .PassEnv', fn: () => this.createPassEnv() },
        ])
    }
    async audit() {
        await this.navigate([
            {
                name: 'Show History', fn: () => {
                    if (Array.isArray(this.meta.hist)) {
                        Array(...this.meta.hist).forEach(inf => {
                            console.log(` ${new Date(inf.dt)} - ${inf.user?.name || 'non-name'} - ${inf.user?.email || 'non-email'}`);
                        });
                    }
                }
            },
        ]);
    }
    async navigate(itens: { name: string, fn: () => void }[]) {
        itens[(await prompts([
            {
                message: 'Menu',
                type: 'select',
                name: 'option',
                choices: itens.map((item, i) => { return { title: item.name, value: i } }),
            },
        ])).option].fn();
    }
    // TODO: validade pass
    async whatToDo() {
        const opt: number |
            'addNewPropAndVar' |
            'readVar' |
            'saveAndContinue' |
            'saveAndExit' |
            'cancel'
            = (await prompts(
                {
                    type: 'select',
                    message: 'O que deseja fazer?',
                    name: 'wto',
                    choices: [
                        ...Object.keys(this.envParsed).map((k, i) => {
                            return { title: `edit "${k}"`, value: i }
                        }),
                        { title: 'Add new var', value: 'addNewPropAndVar' },
                        { title: 'Read var', value: 'readVar' },
                        { title: 'Save and Continue', value: 'saveAndContinue' },
                        { title: 'Save and Exit', value: 'saveAndExit' },
                        { title: 'Cancel', value: 'cancel' },
                    ]
                })).wto;
        if (typeof opt === 'string') {
            await (this[opt]());
        } else {
            this.edit(opt);
        }
    }
    async edit(prop: number) {
        var newValue = (await prompts({
            type: 'text',
            name: 'newValue',
            message: `Novo valor para ${Object.keys(this.envParsed)[prop]}`,
        })).newValue;
        this.envParsed[Object.keys(this.envParsed)[prop]] = newValue;
        this.whatToDo();
    }
    async addNewPropAndVar() {
        let options = (await prompts([
            {
                type: 'text',
                name: 'propertyName',
                message: `Nome`,
            },
            {
                type: 'text',
                name: 'propertyValue',
                message: `Valor`,
            },
        ]));
        this.envParsed[options.propertyName] = options.propertyValue;
        this.whatToDo();
    }
    async readVar() {

        this.whatToDo();
    }
    async saveAndContinue() {
        this.save();
        this.whatToDo();
    }
    async save() {
        let envFile = '# written with env-cli \n';
        let hash: string = Crypto.HmacSHA256(this.options.pwd, 'AZ').toString();
        envFile += `\n`;
        Object.keys(this.envParsed).forEach(prop => {
            try {
                hash = Crypto.HmacSHA256(String(this.envParsed[prop]), hash).toString();
            } catch (e) { console.error(e); }
        });
        const KEY = Crypto.HmacSHA256(hash, this.options.pwd);
        Object.keys(this.envParsed).forEach(prop => {
            let value = this.envParsed[prop];
            value = Crypto.AES.encrypt(value, `${Crypto.enc.Utf8.parse(KEY.toString())}`, {
                iv: `${Crypto.enc.Utf8.parse(KEY.iv)}`, // parse the IV 
                padding: Crypto.pad.Pkcs7,
                mode: Crypto.mode.CBC
            }).toString();
            envFile += `${prop}=${value}\n`;
        });
        envFile += `\n`;

        envFile += `ENV_VALIDADE_HASH=${hash} \n`;
        envFile += `METADATA=${Buffer.from(JSON.stringify(this.meta)).toString('base64')} \n`;
        envFile += '# do not edit manually';

        fs.writeFileSync(this.envFile, envFile);
    }
    async saveAndExit() {
        await this.save();
        this.createPassEnv();
        console.log('Saved, bye!');
    }
    async cancel() {
        console.log('Bye bye!');
    }
    createPassEnv() {
        const pkg = (JSON.parse(fs.readFileSync('./package.json').toString()));
        const pkgInf = `${pkg.name || '' + pkg.description || '' + pkg.author || '' + pkg.license || ''}`;
        const keyProject = Crypto.HmacSHA256(this.hashVerify, pkgInf);
        const KEY = Crypto.HmacSHA256(this.hashVerify, this.options.pwd);

        let passenv = `${Crypto.enc.Utf8.parse(KEY.toString())},${Crypto.enc.Utf8.parse(KEY.iv)}`;
        passenv = Crypto.AES.encrypt(passenv, Crypto.enc.Utf8.parse(keyProject.toString()), {
            iv: Crypto.enc.Utf8.parse(keyProject.iv), // parse the IV 
            padding: Crypto.pad.Pkcs7,
            mode: Crypto.mode.CBC
        }).toString();
        passenv = Buffer.from(passenv).toString('base64');
        fs.writeFileSync(`./${this.envPrefix}.passEnv`, passenv);
    }
}
(async () => new EnvCli().main())().then();