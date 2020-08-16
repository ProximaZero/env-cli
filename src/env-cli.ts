import * as Crypto from 'crypto-js';
import * as prompts from 'prompts';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

export class EnvCli {
    private options: prompts.Answers<"fileEnv" | "pwd">;
    private envParsed: dotenv.DotenvParseOutput;
    private envs: string[];
    private envFile: string;
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
        if (this.envParsed.ENV_VALIDADE_HASH !== undefined) {
            let validadeHash = this.envParsed.ENV_VALIDADE_HASH;
            delete this.envParsed.ENV_VALIDADE_HASH;

            const KEY = Crypto.HmacSHA256(validadeHash, this.options.pwd);

            Object.keys(this.envParsed).forEach(prop => {
                let value = Crypto.AES.decrypt(this.envParsed[prop], Crypto.enc.Utf8.parse(KEY.toString()), {
                    iv: Crypto.enc.Utf8.parse(KEY.iv), // parse the IV 
                    padding: Crypto.pad.Pkcs7,
                    mode: Crypto.mode.CBC
                });
                this.envParsed[prop] = value.toString(Crypto.enc.Utf8);
            });
        }
        this.whatToDo();
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
            value = Crypto.AES.encrypt(value, Crypto.enc.Utf8.parse(KEY.toString()), {
                iv: Crypto.enc.Utf8.parse(KEY.iv), // parse the IV 
                padding: Crypto.pad.Pkcs7,
                mode: Crypto.mode.CBC
            }).toString();
            envFile += `${prop}=${value}\n`;
        });
        envFile += `\n`;
        envFile += `ENV_VALIDADE_HASH=${hash} \n`;
        envFile += '# do not edit manually';

        fs.writeFileSync(this.envFile, envFile);
    }
    async saveAndExit() {
        await this.save();
        console.log('Saved, bye!');
    }
    async cancel() {
        console.log(this.envParsed);
        console.log('Bye!');
    }
}
(async () => new EnvCli().main())().then();