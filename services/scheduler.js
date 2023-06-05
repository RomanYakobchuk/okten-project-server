const {InstitutionNews} = require("../dataBase");
const schedule = require("node-schedule");

// const checkScheduledNews = async () => {
//     try {
//         const currentTime = new Date();
//         console.log("Check draft institution")
//         const draftNews = await InstitutionNews.find({ status: 'draft' }).exec();
//
//         for (const news of draftNews) {
//             const publishTime = new Date(news.publishAt);
//
//             if (news?.publishAt?.isPublish && publishTime <= currentTime) {
//                 await InstitutionNews.updateOne(
//                     { _id: news._id },
//                     { $set: { status: 'published' } }
//                 ).exec();
//                 console.log(`News "${news.title}" published at ${publishTime}`);
//             }
//         }
//     } catch (error) {
//         console.error(`Error publishing scheduled news: ${error}`);
//     }
// };
//
// // Run the function every minute
// schedule.scheduleJob('*/1 * * * *', async function() {
//     await checkScheduledNews();
// });