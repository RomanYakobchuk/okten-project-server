import { smsActionTypeEnum } from '../enums';

const welcome = {
    [smsActionTypeEnum.WELCOME]: (name: string, code: number) => {
        return `Hi ${name}, It\`s your verify code ${code}. Welcome on our platform.`;
    },
};


export {
    welcome
}