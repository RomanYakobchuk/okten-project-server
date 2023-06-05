const {Menu, MenuItem} = require("../dataBase");
const {cloudService} = require("../services");
module.exports = {
    menuByInstitutionId: async (req, res, next) => {
        try {
            const institution = req.data_info;

            const menu = await Menu.findOne({institutionId: institution?._id}).populate("items");

            let category = [];
            if (menu) {
                for (const item of menu.items) {
                    category.push(item.category)
                }
            }
            res.status(200).json({
                menu,
                category: new Set(category)
            })
        } catch (e) {
            next(e)
        }
    },
    createMenu: async (req, res, next) => {
        try {
            const {items} = req.body;
            const menuFile = req.files.menu;
            console.log(menuFile)
            // const {userId: user} = req.user;
            // const institution = req.data_info;
            //
            // const menu = await Menu.create({
            //     institutionId: institution?._id,
            //     createdBy: user?._id,
            //     items: [],
            //     fileMenu: ''
            // })
            //
            // if (items?.length > 0) {
            //     for (const item of items) {
            //         const {url} = await cloudService.uploadFile(item?.image, `institution/${institution?._id}/menu/items`)
            //         const menuItem = await MenuItem.create({
            //             title: item.title,
            //             description: item.description,
            //             image: url,
            //             institutionId: institution?._id,
            //             price: item.price,
            //             weight: item.weight,
            //             category: item.category
            //         });
            //         menu?.items?.push(menuItem?._id)
            //     }
            // }
            // if (req.files.menu) {
            //     const {url} = await cloudService.uploadFile(menuFile, `institution/${institution?._id}/menu/file`)
            //     menu.fileMenu = url;
            // }
            //
            // await menu?.save();

            res.status(200).json({message: "Menu create successfully"})
        } catch (e) {
            next(e)
        }
    }
}