// import schedule from "node-schedule";
// import dayjs from "dayjs";
//
// import {Institution_newsSchema} from "../dataBase";
//
// const checkScheduledNews = async () => {
//     try {
//         const currentTime = new Date();
//         const startTime = Date.now();
//         console.log('+------------------------------------+')
//         console.log(`|\x1b[33m Started check draft news \x1b[0m`)
//         console.log(`| Date: ${dayjs(startTime).format('DD/MM/YYYY')}`)
//         console.log(`| Time: ${dayjs(startTime).format('HH:mm:ss')}`)
//         const draftNews = await Institution_newsSchema.find({ status: 'draft' }).exec();
//
//         for (const news of draftNews) {
//             const publishTime = news.publishAt.datePublish;
//             console.log('checking...')
//
//             if (news?.publishAt?.isPublish && publishTime <= currentTime) {
//                 await Institution_newsSchema.updateOne(
//                     { _id: news._id },
//                     { $set: { status: 'published' } }
//                 ).exec();
//                 console.log(`News "${news.title}" published at ${publishTime}`);
//             }
//         }
//         console.log('--------------')
//         const finishDate = Date.now();
//         console.log(`|\x1b[33m Finished check draft news \x1b[0m`)
//         console.log(`| Date: ${dayjs(finishDate).format('DD/MM/YYYY')}`)
//         console.log(`| Time: ${dayjs(finishDate).format('HH:mm:ss')}`)
//         console.log('+------------------------------------+')
//
//     } catch (error) {
//         console.error(`Error publishing scheduled news: ${error}`);
//     }
// };
//
// // Run the function every minute
// schedule.scheduleJob('*/1 * * * *', async function() {
//     await checkScheduledNews();
// });