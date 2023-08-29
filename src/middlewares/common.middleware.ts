import { Types } from 'mongoose';
import { CustomError } from '../errors';
import {CustomRequest} from "../interfaces/func";
import {NextFunction, Response} from "express";

class CommonMiddleware {

    constructor() {
        this.isIdValid = this.isIdValid.bind(this);
        this.isDateValid = this.isDateValid.bind(this);
    }

    isIdValid(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            if (!Types.ObjectId.isValid(id)) {
                return next(new CustomError('Not valid ID'));
            }

            next();
        } catch (e) {
            next(e);
        }
    }

    isDateValid = (validationSchema: any, dataType = 'body') => async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            const { error, value } = validationSchema.validate(req[dataType]);

            if (error) {
                console.log(`помилка у файлі common.middleware isDateValid error`)
                return next(new CustomError(`${error.details[0].message}`));
            }

            req[dataType] = value;
            next();
        } catch (e) {
            next(e);
        }
    }
}

export default new CommonMiddleware();