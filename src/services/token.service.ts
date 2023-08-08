import jwt from 'jsonwebtoken';

import {configs} from "../configs";
import {CustomError} from '../errors';
import {tokenTypeEnum} from '../enums';

class TokenService {
   async generateAuthTokens(payload = {}) {
        const access_token = jwt.sign(payload, configs.ACCESS_TOKEN_SECRET!, {expiresIn: '3h'});
        const refresh_token = jwt.sign(payload, configs.REFRESH_TOKEN_SECRET!, {expiresIn: '30d'});

        return {
            access_token,
            refresh_token
        }
    }

   async checkToken(token = '', tokenType: string) {
        try {
            let secret: string = '';

            if (tokenType === tokenTypeEnum.ACCESS) secret = configs.ACCESS_TOKEN_SECRET;
            if (tokenType === tokenTypeEnum.REFRESH) secret = configs.REFRESH_TOKEN_SECRET;
            if (tokenType === tokenTypeEnum.TOKEN_WITH_DATA) secret = configs.TOKEN_WITH_DATA;

            return jwt.verify(token, secret);
        } catch (e) {
            throw new CustomError(`Token not valid`, 401);
        }
    }

   async tokenWithData(data: any, live: string) {
        const token = jwt.sign({...data}, configs.TOKEN_WITH_DATA!, {expiresIn: live});

        return {token}
    }
}

export {
    TokenService
}