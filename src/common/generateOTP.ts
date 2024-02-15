type Props = {
    length: number,
    includeUpperCase?: boolean,
    includeLowerCase?: boolean,
    includeSpecialChars?: boolean
}
export const generateOTP = ({
                                length,
                                includeLowerCase = false,
                                includeUpperCase = false,
                                includeSpecialChars = false
                            }: Props) => {
    if (!includeSpecialChars && !includeUpperCase && !includeLowerCase) {
        return Math.floor(Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1)) + Math.pow(10, length - 1));
        // const OTP = Math.floor(Math.random() * 90000) + 10000;
    }
    let charset = '0123456789';
    if (includeLowerCase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUpperCase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeSpecialChars) charset += '!@#$%^&*()-_=+';

    let OTP = '';
    for (let i = 0; i < length; i++) {
        OTP += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return OTP;
}