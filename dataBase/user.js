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
            activationLink: {
                type: String
            },
            isAdmin: {
                type: Boolean,
                default: false
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
            myRatings: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "rating"
                }
            ],
            myReviews: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'review'
                }
            ]
        },
        {
            timestamps: true
        }
    )
;

module.exports = model('user', UserSchema);