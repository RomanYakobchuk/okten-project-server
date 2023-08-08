import {Schema, ObjectId, Document} from "mongoose";
import {UserModel} from "./model";

interface Ids {
    _id?: string & ObjectId | Schema.Types.ObjectId,
    createdAt?: Date,
    updatedAt?: Date,
}
export interface IObjectIdArray extends Array<Schema.Types.ObjectId> {
    pull(...items: Schema.Types.ObjectId[]): this;
}

export interface IAction extends Ids{
    actionType: string,
    person: Schema.Types.ObjectId,
    actionWith: Schema.Types.ObjectId,
}
export interface IAdmin extends Ids{
    user: Schema.Types.ObjectId,
}

export interface ICapl extends Document {
    _id: string | string & ObjectId,
    user: Schema.Types.ObjectId | string,
    manager: Schema.Types.ObjectId,
    fullName: string,
    institution: Schema.Types.ObjectId | IInstitution,
    eventType: string,
    date: Date,
    comment: string,
    writeMe: boolean,
    desiredAmount: number,
    numberPeople: number,
    whoPay: string,
    userStatus: {
        value: "accepted" | "rejected" | "draft",
        reasonRefusal: string
    },
    institutionStatus: {
        value: "accepted" | "rejected" | "draft",
        freeDateFor: [
            {
                day: Date,
                time: Date
            }
        ],
        reasonRefusal: string
    },
    isActive: boolean,
    createdAt?: Date,
    updatedAt?: Date,
}

export interface ICity extends Ids {
    name: string,
}

export interface IComment extends Document {
    createdBy: Schema.Types.ObjectId,
    _id: string | string & ObjectId | any,
    text: string,
    institutionId: Schema.Types.ObjectId,
    replies: IObjectIdArray,
    createdAt?: Date,
    updatedAt?: Date,
    // [key: string]: any
}

export interface ICreateCommentItem {
    text: string,
    createdBy: string | string & ObjectId,
    institutionId: string | string & ObjectId,
}

export interface IAnswerComment extends Document {
    _id: string | string & ObjectId,
    parentCommentId: Schema.Types.ObjectId,
    createdBy: Schema.Types.ObjectId,
    text: string,
    createdAt?: Date,
    updatedAt?: Date,
}
export interface IPicture {
    name: string,
    url: string
}
interface IWorkDays {
    days: {
        from: string,
        to: string
    },
    time: {
        from: Date,
        to: Date
    }
}
export interface IInstitution extends Document {
    title: string,
    _id: string | string & ObjectId,
    views: IViews | Schema.Types.ObjectId,
    pictures: IPicture[],
    workSchedule: {
        workDays: IWorkDays[],
        weekend: string
    },
    location: {
        lng: number,
        lat: number
    },
    place: {
        city: string,
        address: string
    },
    type: string,
    description: string,
    contacts: [{
        value: string
    }],
    tags: [{
        value: string
    }],
    verify: "draft" | "published" | "rejected",
    verifyBy: Schema.Types.ObjectId,
    rating: number,
    averageCheck: number,
    features: [{
        value: string
    }],
    createdBy: Schema.Types.ObjectId | string,
    news: IObjectIdArray,
    createdAt?: Date,
    updatedAt?: Date,
}

export interface IInstitutionNews extends Document {
    institutionId: Schema.Types.ObjectId,
    _id: string | string & ObjectId,
    title: string,
    place: {
        isPlace: boolean,
        location: {
            lng: number,
            lat: number,
        },
        city: string,
        address: string
    },
    publishAt: {
        isPublish: boolean,
        datePublish: Date
    },
    dateEvent: [{
        schedule: {
            from: Date,
            to: Date
        },
        time: {
            from: Date,
            to: Date
        }
    }],
    pictures: IPicture[],
    category: "general" | "promotions" | "events",
    description: string,
    status: "draft" | "published" | "rejected",
    createdBy: Schema.Types.ObjectId,
    createdAt?: Date,
    updatedAt?: Date,
}

export interface IManager extends Document {
    _id?: string | string & ObjectId,
    user: Schema.Types.ObjectId,
    name: string,
    email: string,
    phone: string,
    verify: {
        verifyBy: Schema.Types.ObjectId,
        verifyDate: Date,
        isVerify: boolean
    },
    createdAt?: Date,
    updatedAt?: Date,
}

export interface IMenu extends Ids {
    institutionId: Schema.Types.ObjectId,
    items: Schema.Types.ObjectId[] | IMenuItem[],
    fileMenu: string,
    createdBy: Schema.Types.ObjectId,
}

export interface IMenuItem extends Ids {
    description: string,
    institutionId: Schema.Types.ObjectId,
    title: string,
    category: string,
    weight: number,
    price: number,
    image: string,
}
interface InstitutionId {
    institutionId: Schema.Types.ObjectId
}
interface UserId {
    userId: Schema.Types.ObjectId | IUser | UserModel
}
export interface ILastConvMessage {
    sender: Schema.Types.ObjectId,
    status?: string,
    text: string,
    updatedAt: Date
}
export interface IConvMembers {
    user: Schema.Types.ObjectId,
    connectedAt: Date,
    role: "admin" | "manager" | "user"
}
export interface IConversation extends InstitutionId, Document {
    _id: string | string & ObjectId,
    userName: string,
    lastMessage: ILastConvMessage,
    institutionTitle: string,
    members: IConvMembers[],
    institutionId: Schema.Types.ObjectId,
    createdAt?: Date,
    updatedAt?: Date
}


export interface IMessage extends Document {
    _id: string | string & ObjectId,
    conversationId: Schema.Types.ObjectId,
    sender: Schema.Types.ObjectId,
    replyTo: Schema.Types.ObjectId,
    pictures: string[],
    text: string,
    isSent: boolean,
    isDelivered: boolean,
    isRead: boolean,
    isError: boolean,
    createdAt?: Date,
    updatedAt?: Date
}


export interface IOauth extends UserId, Ids {
    access_token: string,
    refresh_token: string,
}

export interface IRating extends InstitutionId, Ids {
    createdBy: Schema.Types.ObjectId,
    grade: number,
}

export interface IReviewItem extends InstitutionId, Ids {
    createdBy: Schema.Types.ObjectId,
    text: {
        like: string,
        notLike: string
    },
    grade: number,
    review: Schema.Types.ObjectId,
}

export interface IReview extends InstitutionId, Ids {
    reviews: Schema.Types.ObjectId[],
}

export interface IUser extends Document{
    name: string,
    email: string,
    status: "user" | "manager" | "admin",
    dOB: Date,
    password: string,
    phone: string,
    avatar: string,
    isActivated: boolean,
    phoneVerify: boolean,
    verifyCode: string,
    activationLink: string,
    allInstitutions: IObjectIdArray,
    favoritePlaces: IObjectIdArray,
    favoriteNews?: Schema.Types.ObjectId[],
    myRatings: IObjectIdArray,
    blocked: {
        isBlocked: boolean,
        whyBlock: string
    },
    myReviews?: Schema.Types.ObjectId[] | any,
    createdAt?: Date,
    updatedAt?: Date,
    [key: string]: any
}

export interface IUserFavoritePlaces extends UserId, Document {
    _id: string | string & ObjectId,
    places: Schema.Types.ObjectId[],
    createdAt?: Date,
    updatedAt?: Date,
}

export interface IView extends Ids {
    viewsId: Schema.Types.ObjectId,
    user: Schema.Types.ObjectId,
    verify: "draft" | "accepted" | "rejected",
}

export interface IViews extends Document {
    _id: string & ObjectId,
    refField: string,
    viewsWith: Schema.Types.ObjectId,
    viewsNumber: number,
    verify: "draft" | "accepted" | "rejected",
    createdAt?: Date,
    updatedAt?: Date,
}

export interface CreateReserve {
    institution: string | string & ObjectId,
    date: Date,
    writeMe: boolean,
    comment: string,
    fullName: string,
    desiredAmount: number,
    numberPeople: number,
    whoPay: string,
    manager: string | string & ObjectId,
    user: string | string & ObjectId,
    eventType: string
}