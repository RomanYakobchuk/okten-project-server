import Joi from "joi";

import { emailValidator, nameValidator} from "./common.validator";

const findAll = Joi.object({
    name: nameValidator,
    email: emailValidator,
});

export {
    findAll,
};