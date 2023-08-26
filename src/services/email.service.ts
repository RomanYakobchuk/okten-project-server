import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';

import {configs} from '../configs';
import {emailTemplates} from '../email-templates';
import {CustomError} from "../errors";
import {emailActionTypeEnum} from "../enums";

interface CustomOptions extends nodemailer.SendMailOptions {
    template: string;
    context: any
}
export const emailService = async (userMail = '', emailAction = '' as keyof typeof emailActionTypeEnum, context = {} as any, link?: string) => {
    const transporter = nodemailer.createTransport({
        from: 'No reply',
        auth: {
            user: configs.NO_REPLY_EMAIL,
            pass: configs.NO_REPLY_EMAIL_PASSWORD,
        },
        service: 'gmail',
    });

    const hbsOptions = {
        viewEngine: {
            extname: '.hbs',
            defaultLayout: 'main',
            layoutsDir: path.join(process.cwd(), 'src', 'email-templates', 'layouts'),
            partialsDir: path.join(process.cwd(), 'src', 'email-templates', 'partials'),
        },
        viewPath: path.join(process.cwd(), 'src', 'email-templates', 'views'),
        extName: '.hbs',
    }

    transporter.use('compile', hbs(hbsOptions));

    const templateInfo = emailTemplates[emailAction];
    if (!templateInfo) {
        throw new CustomError('Wrong email action', 500);
    }

    context.link = link;

    console.log(`Email start sending | email: ${userMail} | action: ${emailAction}`);

    const mailOptions: CustomOptions = {
        from: configs.NO_REPLY_EMAIL,
        to: userMail,
        subject: templateInfo.subject,
        template: templateInfo.template,
        context,
    }
    return transporter.sendMail(mailOptions);
}
