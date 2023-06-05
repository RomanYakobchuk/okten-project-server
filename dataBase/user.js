const {Schema, model} = require('mongoose');

const UserSchema = new Schema({
            name: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                unique: true,
                required: true,
                trim: true,
                lowercase: true
            },
            status: {
                type: String,
                default: 'user' //manager, admin
            },
            dOB: {
                type: Date,
                required: true,
            },
            password: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                required: true
            },
            avatar: {
                type: String,
                default: ""
            },
            // by gmail
            isActivated: {
                type: Boolean,
                default: false
            },
            phoneVerify: {
                type: Boolean,
                default: false
            },
            verifyCode: {
                type: String
            },
            // by gmail
            activationLink: {
                type: String
            },
            allInstitutions: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "institution"
                }
            ],
            favoritePlaces: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "institution"
                }
            ],
            favoriteNews: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'institutionNews'
                }
            ],
            myRatings: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "rating"
                }
            ],
            myReviews: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'reviews'
                }
            ],
            blocked: {
                isBlocked: {
                    type: Boolean,
                    default: false,
                },
                whyBlock: {
                    type: String,
                    default: ''
                }
            }
        },
        {
            timestamps: true
        }
    )
;

module.exports = model('user', UserSchema);