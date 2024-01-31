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

export interface IAction extends Ids {
    actionType: string,
    person: Schema.Types.ObjectId,
    actionWith: Schema.Types.ObjectId,
}

export interface IAdmin extends Ids {
    user: Schema.Types.ObjectId,
}

export interface ICapl extends Document {
    _id: string | string & ObjectId,
    isAllowedEdit: boolean,
    user: Schema.Types.ObjectId | string,
    manager: Schema.Types.ObjectId,
    fullName: string,
    isClientAppeared: boolean,
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
        freeDateFor: [Date],
        reasonRefusal: string
    },
    isActive: boolean,
    createdAt?: Date,
    updatedAt?: Date,
}

export interface ICity extends Ids {
    name: string,
}

export interface IComment extends Document, DocumentResult<IComment> {
    createdBy: Schema.Types.ObjectId | IUser | IInstitution | {_id: string, name: string, avatar: string},
    _id: string | string & ObjectId | ObjectId,
    text: string,
    repliesLength: number,
    establishmentId: Schema.Types.ObjectId,
    parentId: Schema.Types.ObjectId | string,
    createdAt?: Date,
    updatedAt?: Date,
    refFieldCreate?: "user" | "institution",
    reactions: string | IReaction
    // [key: string]: any
}

export interface ICreateCommentItem {
    text: string,
    refFieldCreate: 'institution' | 'user',
    createdBy: string | string & ObjectId,
    parentId: string | string & ObjectId | null,
    establishmentId: string | string & ObjectId,
}

export interface IPicture {
    name: string,
    url: string
}

interface IWorkDays {
    days: {
        from: number,
        to: number
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
    sendNotifications: boolean,
    workSchedule: {
        workDays: IWorkDays[],
        weekend: string
    },
    reviewsLength: number,
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
    freeSeats: Schema.Types.ObjectId | IFreeSeats,
    createdAt?: Date,
    updatedAt?: Date,
}
export interface IFreeSeatsList {
    table: number,
    numberOfSeats: number,
    status: "free" | "reserved" | "",
    description?: string
}
export interface IFreeSeats extends Document {
    _id: string | string & ObjectId,
    establishmentId: Schema.Types.ObjectId | IInstitution,
    list: IFreeSeatsList[],
    allFreeSeats: number,
    isCombineTheSeats: boolean,
    createdAt?: Date,
    updatedAt?: Date,
}

export interface IInstitutionNews extends Document {
    institutionId: Schema.Types.ObjectId | IInstitution,
    _id: string | string & ObjectId,
    title: string,
    place: {
        isPlace: boolean,
        location: {
            lng: number,
            lat: number,
        },
        place: {
            city: string,
            address: string
        }
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
    user: Schema.Types.ObjectId | IUser,
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

export interface IConvMembers extends DocumentResult<IConvMembers>{
    user: Schema.Types.ObjectId | IUser,
    connectedAt: Date,
    indicator?: null | string,
    role: "admin" | "manager" | "user",
    conversationTitle: string
}
export interface DocumentResult<T> {
    _doc: T;
}
export interface IConversation extends Document, DocumentResult<IConversation> {
    _id: string | string & ObjectId,
    lastMessage: ILastConvMessage,
    members: IConvMembers[],
    chatInfo: {
        status: "public" | "private",
        type: "group" | "oneByOne",
        field: {
            name: "institution" | "user" | "capl",
            id: IInstitution | IUser | ICapl | (ObjectId | string)
        },
        chatName: string,
        picture: string,
        creator: ObjectId | string
    },
    createdAt?: Date,
    updatedAt?: Date
}


export interface IMessage extends Document {
    _id: string | string & ObjectId,
    conversationId: Schema.Types.ObjectId,
    sender: Schema.Types.ObjectId,
    replyTo?: Schema.Types.ObjectId,
    pictures: string[],
    text: string,
    files?: IPicture[],
    isSent: boolean,
    isDelivered: boolean,
    isRead: boolean,
    isError: boolean,
    createdAt?: Date,
    updatedAt?: Date
}


export interface IOauth extends UserId, Document {
    access_token: string,
    refresh_token: string,
    createdAt?: Date,
    updatedAt?: Date
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

export interface IUser extends Document, DocumentResult<IUser> {
    name: string,
    email: string,
    status: "user" | "manager" | "admin",
    dOB: Date,
    registerBy: "Google" | "Email" | "GitHub" | "Facebook",
    password: string,
    uniqueIndicator: {
        value: string | null,
        type: "public" | "private" | null
    },
    phone: string,
    avatar: string,
    isActivated: boolean,
    phoneVerify: boolean,
    verifyCode: string,
    activationLink: string,
    allInstitutions: IObjectIdArray,
    favoritePlaces: string | string & ObjectId | Schema.Types.ObjectId,
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
export interface IGenericArray<T> extends Array<T> {
    pull(...items: T[]): this;
}
export interface IFavPlaces {
    type: string,
    item: Schema.Types.ObjectId
}
export interface IUserFavoritePlaces extends UserId, Document {
    _id: string | string & ObjectId,
    type: string,
    item: Schema.Types.ObjectId,
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
    _id?: string & ObjectId,
    institution: string | string & ObjectId,
    date: Date,
    seats: {
        table: number,
        numberOfSeats: number,
        status: "free" | "reserved"
    },
    userStatus: ICapl['userStatus'],
    isAllowedEdit: boolean,
    institutionStatus: ICapl['institutionStatus'],
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

export interface ICityForCount extends Document {
    _id: string,
    name_ua: string,
    name_en: string,
    url: string,
    createdAt?: Date,
    updatedAt?: Date,
}

export interface ISubscribe extends Document, InstitutionId {
    _id: string & ObjectId | string,
    subscriberId: Schema.Types.ObjectId,
    createdAt?: Date,
    updatedAt?: Date,
}

export interface INotificationSubscribe extends Document {
    _id: string & ObjectId | string,
    subscribeId: Schema.Types.ObjectId,
    newsId: Schema.Types.ObjectId,
    createdAt?: Date,
    updatedAt?: Date,
}

export interface INotification extends UserId, Document {
    _id: string & ObjectId | string,
    createdAt?: Date,
    updatedAt?: Date,
    message: string,
    description?: string,
    isDelete: boolean,
    isRead: boolean,
    status: "usual" | "accepted" | "rejected",
    forUser: {
        role: 'manager' | 'admin' | 'user',
        userId: string | string & ObjectId,
    },
    type: "newReservation" | "newMessage" | "newNews" |"newFunctional" | "newEstablishment" | "newUser"
}

export type TTypeNotification = ICapl | IMessage | IInstitutionNews | IInstitution | IUser

export interface IReaction extends Document {
    _id: Ids['_id'],
    item: string | IInstitution | IInstitutionNews | IComment,
    field: 'institution' | 'institutionNew' | 'commentItem',
    likes: string[],
    unLikes: string[],
    createdAt: Date,
    updatedAt: Date,
}