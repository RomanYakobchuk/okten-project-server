module.exports = {
    userPresenter: (user) => {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            dOB: user.dOB,
            isActivated: user.isActivated,
            isAdmin: user.isAdmin,
            avatar: user.avatar,
            phone: user.phone,
            phoneVerify: user.phoneVerify,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            favoritePlaces: user.favoritePlaces,
            myReviews: user.myReviews,
            allInstitutions: user.allInstitutions
        }
    },
};