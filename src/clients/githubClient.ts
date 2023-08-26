import {CustomError} from "../errors";
import axios from "axios";
import {configs} from "../configs";
import * as querystring from "querystring";

const getAccessTokenFromCode = async (code: string) => {
    try {
        const {data} = await axios.get(configs.GITHUB_OAUTH_ROOT_URL, {
            params: {
                client_id: configs.GITHUB_OAUTH_CLIENT_ID,
                client_secret: configs.GITHUB_OAUTH_CLIENT_SECRET,
                redirect_uri: configs.GITHUB_OAUTH_REDIRECT_URL,
                code
            }
        });

        const parseData = querystring.parse(data);
        if (parseData.error) {
            return new CustomError(`Parsed github data wrong: ${parseData?.error_description}`);
        }
        return parseData.access_token;
    } catch (e) {
        throw new CustomError(`Something went wrong - GitHub: ${e}`)
    }
}

const getGitHubUserData = async (code: string) => {
    try {

        const access_token = await getAccessTokenFromCode(code);

        const {data} = await axios.get(configs.GITHUB_OAUTH_USER_DATA_URL, {
            headers: {
                Authorization: `token ${access_token}`,
            }
        })
        const {data: emailData} = await axios.get(`${configs.GITHUB_OAUTH_USER_DATA_URL}/emails`, {
            headers: {
                Authorization: `token ${access_token}`,
            }
        })

        return {
            name: data.name,
            picture: data?.avatar_url,
            email: emailData[0]?.email,
            email_verified: emailData[0]?.verified
        };
    } catch (e) {
        throw new CustomError(`Something went wrong - GitHub UserData: ${e}`)
    }
}

export {
    getGitHubUserData,
    getAccessTokenFromCode
}