import bcrypt from 'bcrypt';

import { CustomError } from '../errors';

class PasswordService {
    async hashPassword(password: string): Promise<string>{
        return bcrypt.hash(password, 10)
    }
    async comparePassword(hashPassword: string, password: string) {
        const isPasswordsSame = await bcrypt.compare(password, hashPassword);

        if (!isPasswordsSame) {
            throw new CustomError(`Wrong email or password`);
        }
    }
    async hashVerifyCode(code: string): Promise<string> {
        return bcrypt.hash(code, 7)
    }
    async compareVerifyCode(hashCode: string, code: string) {
        const isCodeSame = await bcrypt.compare(code, hashCode);
        if(!isCodeSame) {
            throw new CustomError("Wrong verify code")
        }
    }
}

export {
    PasswordService
}