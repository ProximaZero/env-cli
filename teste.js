var Cipher = require('aes-ecb');

var keyString = 'KeyMustBe16ByteOR24ByteOR32Byte!';
var input = 'Some secret string that should be encrypted or decrypted !';
 
var encrypt = Cipher.encrypt(keyString, input);
var decrypt = Cipher.decrypt(keyString, encrypt);


console.log(encrypt, '\n' ,decrypt);

