import {emailActionTypeEnum} from '../enums';

type EmailActionType = keyof typeof emailActionTypeEnum;
export const emailTemplates: Record<EmailActionType, {subject: string, template: string}> = {
    [emailActionTypeEnum.WELCOME]: {
        subject: 'Weclome on board',
        template: 'welcome'
    },

    [emailActionTypeEnum.FORGOT_PASSWORD]: {
        subject: 'Opps looks like you forgot password',
        template: 'forgot-password'
    },

    [emailActionTypeEnum.USER_BANNED]: {
        subject: 'Account was blocked',
        template: 'account-blocked'
    },

    [emailActionTypeEnum.LOGOUT]: {
        subject: 'User was logout',
        template: 'logout'
    },
    [emailActionTypeEnum.ORDER_PROCESS]: {
        subject: "",
        template: ""
    }
}