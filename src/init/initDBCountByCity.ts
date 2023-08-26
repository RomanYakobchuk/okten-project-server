import {CityForCount} from "../dataBase";

require('ts-node/register');

import mongoose from "mongoose";

async function initDataBase() {
    try {
        await mongoose.connect("mongodb+srv://romanyakobchuk28:Hjvfydfk-28@main.e6ajbvh.mongodb.net/?retryWrites=true&w=majority");
        const existingData = await CityForCount.find();

        if (existingData.length === 0) {
            const initialData = [
                {
                    name_ua: 'Вінниця',
                    name_en: 'Vinnytsia',
                    url: 'https://tripmydream.cc/travelhub/travel/block_gallery/10/5937/default_105937.jpg?',
                },
                {
                    name_ua: 'Дніпро',
                    name_en: 'Dnipro',
                    url: 'https://2day.kh.ua/sites/default/files/2022-04/dnipro.jpg',
                },
                {
                    name_ua: 'Донецьк',
                    name_en: 'Donetsk',
                    url: 'https://travels.in.ua/api/Photo/PhotoStreamCIL/706',
                },
                {
                    name_ua: 'Житомир',
                    name_en: 'Zhytomyr',
                    url: 'https://zhzh.com.ua/storage/21670/ava3-big-big.jpg',
                },
                {
                    name_ua: 'Запоріжжя',
                    name_en: 'Zaporizhzhia',
                    url: 'https://img.pravda.com/images/doc/8/8/8840c88-63545bf-gettyimages-1237411394.jpg',
                },
                {
                    name_ua: 'Івано-Франківськ',
                    name_en: 'Ivano-Frankivsk',
                    url: 'https://galinfo.com.ua/media/gallery/full/m/i/miske-ozero-if-3.jpg',
                },
                {
                    name_ua: 'Київ',
                    name_en: 'Kyiv',
                    url: 'https://kyivpastfuture.com.ua/wp-content/uploads/2020/04/kyev-s-v%D1%8Bsot%D1%8B-1-800x445.jpg',
                },
                {
                    name_ua: 'Кропивницький',
                    name_en: 'Kropyvnytskyi',
                    url: 'https://travels.in.ua/api/Photo/PhotoStreamCIL/871',
                },
                {
                    name_ua: 'Луганськ',
                    name_en: 'Luhansk',
                    url: 'https://i.tyzhden.ua/content/photoalbum/2019/05_2019/05/06/pu/_6.jpg',
                },
                {
                    name_ua: 'Луцьк',
                    name_en: 'Lutsk',
                    url: 'https://ua.igotoworld.com/frontend/webcontent/images/tours/2034962_800x600_37_big.jpg',
                },
                {
                    name_ua: 'Львів',
                    name_en: 'Lviv',
                    url: 'https://we.org.ua/wp-content/uploads/2014/12/vulytsi-nichnogo-lvova.jpeg',
                },
                {
                    name_ua: 'Миколаїв',
                    name_en: 'Mykolaiv',
                    url: 'https://s.mind.ua/img/forall/a/202600/43.jpg?1689597954',
                },
                {
                    name_ua: 'Одеса',
                    name_en: 'Odesa',
                    url: 'https://ukraine.ua/wp-content/uploads/2020/11/Theatre-in-old-town-of-Odesa-sea-port-weiv.simbiothy.depositphotos-2048x1536.jpg',
                },
                {
                    name_ua: 'Полтава',
                    name_en: 'Poltava',
                    url: 'https://imgs2.tribun.com.ua/images/360/49/368b5d4fee8759882584055612607328_36049.webp',
                },
                {
                    name_ua: 'Рівне',
                    name_en: 'Rivne',
                    url: 'https://admin.rvnews.rv.ua/uploads/full_size/2023/07/24/9d4b882ab1bd29cbdb0eae628f84c156.jpg',
                },
                {
                    name_ua: 'Суми',
                    name_en: 'Sumy',
                    url: 'https://ukrainian-travel.com/wp-content/uploads/2021/02/Sumy-by-Alina-Kosovska.jpg',
                },
                {
                    name_ua: 'Тернопіль',
                    name_en: 'Ternopil',
                    url: 'https://ternopilcity.gov.ua/upload/DJI-0006-2.jpg',
                },
                {
                    name_ua: 'Ужгород',
                    name_en: 'Uzhhorod',
                    url: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/%D0%A3%D0%B6%D0%B3%D0%BE%D1%80%D0%BE%D0%B4%D1%81%D1%8C%D0%BA%D0%B8%D0%B9_%D0%BA%D0%B0%D1%84%D0%B5%D0%B4%D1%80%D0%B0%D0%BB%D1%8C%D0%BD%D0%B8%D0%B9_%D1%81%D0%BE%D0%B1%D0%BE%D1%80%2C_%D0%B0%D0%B5%D1%80%D0%BE%D1%84%D0%BE%D1%82%D0%BE_2.jpg',
                },
                {
                    name_ua: 'Харків',
                    name_en: 'Kharkiv',
                    url: 'https://www.dobovo.com/blog/wp-content/uploads/2017/07/%D0%95%D0%B4%D0%B5%D0%BC-%D0%B2-%D0%A5%D0%B0%D1%80%D1%8C%D0%BA%D0%BE%D0%B2-%D1%82%D0%BE%D0%BF-10-%D0%BC%D0%B5%D1%81%D1%82-825x510.jpg',
                },
                {
                    name_ua: 'Херсон',
                    name_en: 'Kherson',
                    url: 'https://upload.wikimedia.org/wikipedia/commons/1/16/%D0%A2%D1%80%D0%B8_%D1%88%D1%82%D1%8B%D0%BA%D0%B0_%D1%82%D0%B0%D0%B2%D1%80%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9.jpg',
                },
                {
                    name_ua: 'Хмельницький',
                    name_en: 'Khmelnytskyi',
                    url: 'https://vsim.ua/img/cache/news_new_m/news/0006/41/f731f4216d9134d97b78700bb6184917c0a7a39d.jpeg?hash=2017-02-22-22-47-28',
                },
                {
                    name_ua: 'Черкаси',
                    name_en: 'Cherkasy',
                    url: 'https://vycherpno.ck.ua/wp-content/uploads/2019/10/995000.jpg',
                },
                {
                    name_ua: 'Чернівці',
                    name_en: 'Chernivtsi',
                    url: 'https://buktour.icu/images/2018/11/23/007-00-02.jpg',
                },
                {
                    name_ua: 'Чернігів',
                    name_en: 'Chernihiv',
                    url: 'https://rsidehotel.com/wp-content/uploads/2018/12/chern3.jpg',
                },
                {
                    name_ua: 'Сімферополь',
                    name_en: 'Simferopol',
                    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Zavodskoe_Airport.JPG/1100px-Zavodskoe_Airport.JPG',
                }
            ];
            await CityForCount.insertMany(initialData)
            console.log('Initial Data added to CityForCount table')

            await mongoose.connection.close();
        } else {
            console.log('Data is exist')
        }
    } catch (e) {
        console.log('Init countByCity Error', e)
    }
}

initDataBase();