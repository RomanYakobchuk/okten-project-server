import {OAuth2Client} from "google-auth-library";
import {CustomError} from "../errors";
import axios from "axios";
import { configs } from "../configs";

export const googleClient = new OAuth2Client({
    clientId: configs.GOOGLE_CLIENT_ID,
    clientSecret: configs.GOOGLE_CLIENT_SECRET
})

export const getGoogleUserInfo = async (access_token: string) => {
    try {
        const data = await axios.get(configs.GOOGLE_API_GET_USER_INFO, {
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        });
        if (data) {
            return data.data
        }
    } catch (e) {
        throw new CustomError('Something went wrong', 400)
    }
}