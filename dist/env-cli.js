"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.EnvCli = void 0;
var Crypto = require("crypto-js");
var prompts = require("prompts");
var fs = require("fs");
var dotenv = require("dotenv");
var EnvCli = (function () {
    function EnvCli() {
    }
    EnvCli.prototype.main = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, validadeHash, KEY_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.envs = fs.readdirSync('./').filter(function (file) { return file.indexOf('.env') > -1; });
                        _a = this;
                        return [4, prompts([{
                                    type: 'select',
                                    name: 'fileEnv',
                                    message: 'Selecione o arquivo de configuração',
                                    choices: this.envs.map(function (f) {
                                        return {
                                            title: f, value: f
                                        };
                                    })
                                }, {
                                    type: 'password',
                                    name: 'pwd',
                                    message: 'Senha de segurança'
                                }])];
                    case 1:
                        _a.options = (_b.sent());
                        this.envParsed = dotenv.parse(fs.readFileSync(this.envFile = this.options.fileEnv));
                        if (this.envParsed.ENV_VALIDADE_HASH !== undefined) {
                            validadeHash = this.envParsed.ENV_VALIDADE_HASH;
                            delete this.envParsed.ENV_VALIDADE_HASH;
                            KEY_1 = Crypto.HmacSHA256(validadeHash, this.options.pwd);
                            Object.keys(this.envParsed).forEach(function (prop) {
                                var value = Crypto.AES.decrypt(_this.envParsed[prop], Crypto.enc.Utf8.parse(KEY_1.toString()), {
                                    iv: Crypto.enc.Utf8.parse(KEY_1.iv),
                                    padding: Crypto.pad.Pkcs7,
                                    mode: Crypto.mode.CBC
                                });
                                _this.envParsed[prop] = value.toString(Crypto.enc.Utf8);
                            });
                        }
                        this.whatToDo();
                        return [2];
                }
            });
        });
    };
    EnvCli.prototype.whatToDo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var opt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, prompts({
                            type: 'select',
                            message: 'O que deseja fazer?',
                            name: 'wto',
                            choices: __spreadArrays(Object.keys(this.envParsed).map(function (k, i) {
                                return { title: "edit \"" + k + "\"", value: i };
                            }), [
                                { title: 'Add new var', value: 'addNewPropAndVar' },
                                { title: 'Read var', value: 'readVar' },
                                { title: 'Save and Continue', value: 'saveAndContinue' },
                                { title: 'Save and Exit', value: 'saveAndExit' },
                                { title: 'Cancel', value: 'cancel' },
                            ])
                        })];
                    case 1:
                        opt = (_a.sent()).wto;
                        if (!(typeof opt === 'string')) return [3, 3];
                        return [4, (this[opt]())];
                    case 2:
                        _a.sent();
                        return [3, 4];
                    case 3:
                        this.edit(opt);
                        _a.label = 4;
                    case 4: return [2];
                }
            });
        });
    };
    EnvCli.prototype.edit = function (prop) {
        return __awaiter(this, void 0, void 0, function () {
            var newValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, prompts({
                            type: 'text',
                            name: 'newValue',
                            message: "Novo valor para " + Object.keys(this.envParsed)[prop]
                        })];
                    case 1:
                        newValue = (_a.sent()).newValue;
                        this.envParsed[Object.keys(this.envParsed)[prop]] = newValue;
                        this.whatToDo();
                        return [2];
                }
            });
        });
    };
    EnvCli.prototype.addNewPropAndVar = function () {
        return __awaiter(this, void 0, void 0, function () {
            var options;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, prompts([
                            {
                                type: 'text',
                                name: 'propertyName',
                                message: "Nome"
                            },
                            {
                                type: 'text',
                                name: 'propertyValue',
                                message: "Valor"
                            },
                        ])];
                    case 1:
                        options = (_a.sent());
                        this.envParsed[options.propertyName] = options.propertyValue;
                        this.whatToDo();
                        return [2];
                }
            });
        });
    };
    EnvCli.prototype.readVar = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.whatToDo();
                return [2];
            });
        });
    };
    EnvCli.prototype.saveAndContinue = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.save();
                this.whatToDo();
                return [2];
            });
        });
    };
    EnvCli.prototype.save = function () {
        return __awaiter(this, void 0, void 0, function () {
            var envFile, hash, KEY;
            var _this = this;
            return __generator(this, function (_a) {
                envFile = '# written with env-cli \n';
                hash = Crypto.HmacSHA256(this.options.pwd, 'AZ').toString();
                envFile += "\n";
                Object.keys(this.envParsed).forEach(function (prop) {
                    try {
                        hash = Crypto.HmacSHA256(String(_this.envParsed[prop]), hash).toString();
                    }
                    catch (e) {
                        console.error(e);
                    }
                });
                KEY = Crypto.HmacSHA256(hash, this.options.pwd);
                Object.keys(this.envParsed).forEach(function (prop) {
                    var value = _this.envParsed[prop];
                    value = Crypto.AES.encrypt(value, Crypto.enc.Utf8.parse(KEY.toString()), {
                        iv: Crypto.enc.Utf8.parse(KEY.iv),
                        padding: Crypto.pad.Pkcs7,
                        mode: Crypto.mode.CBC
                    }).toString();
                    envFile += prop + "=" + value + "\n";
                });
                envFile += "\n";
                envFile += "ENV_VALIDADE_HASH=" + hash + " \n";
                envFile += '# do not edit manually';
                fs.writeFileSync(this.envFile, envFile);
                return [2];
            });
        });
    };
    EnvCli.prototype.saveAndExit = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.save()];
                    case 1:
                        _a.sent();
                        console.log('Saved, bye!');
                        return [2];
                }
            });
        });
    };
    EnvCli.prototype.cancel = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log(this.envParsed);
                console.log('Bye!');
                return [2];
            });
        });
    };
    return EnvCli;
}());
exports.EnvCli = EnvCli;
(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2, new EnvCli().main()];
}); }); })().then();
//# sourceMappingURL=env-cli.js.map