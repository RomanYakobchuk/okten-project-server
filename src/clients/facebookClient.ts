import {CustomError} from "../errors";
import axios from "axios";
import {configs} from "../configs";

export const getFacebookUserInfo = async (userId: string, access_token: string) => {
    try {
        const data = await axios.get(`${configs.FACEBOOK_API_GET_USER_INFO}/${userId}?fields=name,email,picture&access_token=${access_token}`, {
            headers: {
                "Content-type":"application/json"
            }
        });
        if (data) {
            return data.data
        }
    } catch (e) {
        console.log(e)
        throw new CustomError('Something went wrong');
    }
}

// https://graph.facebook.com/me?fields= "name,gender,location,picture/*any other fields*/&access_token=${access_token}`