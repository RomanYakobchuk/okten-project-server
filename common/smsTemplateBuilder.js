const { smsActionTypeEnum } = require('../enums');

module.exports = {
    [smsActionTypeEnum.WELCOME]: (name, code) => {
        return `Hi ${name}, It\`s your verify code ${code}. Welcome on our platform.`;
    },
};