import * as Crypto from 'crypto-js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

export class Environment {
    private env: { [key: string]: string };
    private passEnv: string;
    private readerKey: Crypto.WordArray;
    constructor(prefix: string = '') {
        this.loadEnvironmentFile(prefix + '.env');
        this.loadPassEnvFile(prefix + '.passEnv');
    }

    private getReaderKey() {
        if (this.readerKey) return this.readerKey;
        const pkg = (JSON.parse(fs.readFileSync('package.json').toString()));
        const projectIdentfy = `${pkg.name || '' + pkg.description || '' + pkg.author || '' + pkg.license || ''}`;
        return this.readerKey = Crypto.HmacSHA256(this.env.ENV_VALIDADE_HASH, projectIdentfy);
    }

    private loadPassEnvFile(file: string) {
        this.passEnv = fs.readFileSync(file).toString();
        console.log('passEnv64', this.passEnv);
        this.passEnv = Buffer.from(this.passEnv, 'base64').toString();
        console.log('passEnv', this.passEnv);

        const keyProject = this.getReaderKey();
        console.log('keyPackage', keyProject);
        console.log('keyPackage', keyProject.toString());

        this.passEnv = Crypto.AES.decrypt(
            this.passEnv,
            Crypto.enc.Utf8.parse(keyProject.toString()),
            {
                iv: Crypto.enc.Utf8.parse(keyProject.iv), // parse the IV 
                padding: Crypto.pad.Pkcs7,
                mode: Crypto.mode.CBC
            }).toString(Crypto.enc.Utf8);

        console.log('passEnv', this.passEnv);
    }

    private loadEnvironmentFile(file: string) {
        const envVars = this.env = dotenv.parse(fs.readFileSync(file));
        console.log(envVars);
        console.log(this.getReaderKey());
    }

    getValueByPropertyName(propertyName: string) {
        if (!this.passEnv || this.passEnv === '') return 'error';
        return Crypto.AES.decrypt(this.env[propertyName], this.passEnv.split(',')[0], {
            iv: this.passEnv.split(',')[1], // parse the IV 
            padding: Crypto.pad.Pkcs7,
            mode: Crypto.mode.CBC
        }).toString(Crypto.enc.Utf8);

        // return;
        // const passenv = Crypto.AES.decrypt(this.passEnv, Crypto.enc.Utf8.parse(keyProject.toString()), {
        //     iv: Crypto.enc.Utf8.parse(keyProject.iv), // parse the IV 
        //     padding: Crypto.pad.Pkcs7,
        //     mode: Crypto.mode.CBC
        // }).toString(Crypto.enc.Utf8);
        // 
        // console.log('passenv', passenv);
        // console.log('propEncripted', this.env[propertyName]);

        //* let value = Crypto.AES.decrypt(this.env[propertyName], `${Crypto.enc.Utf8.//* parse(passenv.split(',')[0])}`, {
        //*     iv: `${Crypto.enc.Utf8.parse(passenv.split(',')[1])}`, // parse the IV 
        //*     padding: Crypto.pad.Pkcs7,
        //*     mode: Crypto.mode.CBC
        //* });
        //* return value.toString();
    }

}