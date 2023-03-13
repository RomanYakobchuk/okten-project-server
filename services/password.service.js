const bcrypt = require('bcrypt');

const { CustomError } = require('../errors');

module.exports = {
    hashPassword: (password) => bcrypt.hash(password, 10),
    comparePassword: async (hashPassword, password) => {
        const isPasswordsSame = await bcrypt.compare(password, hashPassword);

        if (!isPasswordsSame) {
            throw new CustomError(`Wrong email or password`);
        }
    },
    hashVerifyCode: (code) => bcrypt.hash(code, 7),
    compareVerifyCode: async (hashCode, code) => {
        const isCodeSame = await bcrypt.compare(code, hashCode);
        if(!isCodeSame) {
            throw new CustomError("Wrong verify code")
        }
    }
}