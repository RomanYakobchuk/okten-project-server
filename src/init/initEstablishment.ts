import {EstablishmentSchema} from "../dataBase";

require('ts-node/register');

import mongoose from "mongoose";
import {IEstablishment} from "../interfaces/common";

async function initDataBase() {
    try {
        await mongoose.connect("mongodb+srv://romanyakobchuk28:Hjvfydfk-28@main.e6ajbvh.mongodb.net/?retryWrites=true&w=majority");
        const existingData = await EstablishmentSchema.find();

        if (existingData.length === 0) {
            const initialData: IEstablishment[] | any = [
                {
                    title: "EstablishmentSchema 1",
                    pictures: [
                        { name: "Picture 1", url: "https://thumb.tildacdn.com/tild6233-3362-4139-b535-386535393636/-/resize/824x/-/format/webp/koncepciya-kafe.jpg" },
                        { name: "Picture 2", url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlXScHk1AcIwb2vVvQzqwAiFjX4jQAPqBFSU8XPPZwEbZGzKaJOxXlHv1RzWmMevpQahs&usqp=CAU" },
                        { name: "Picture 3", url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0I3RcrFJ4_avwNuqNYsSa24M2raztNcrxtCnp-v6xLlfH4s_JwU5xzr_b-oZ9DTiI86c&usqp=CAU" },
                    ],
                    workSchedule: {
                        workDays: [
                            { days: { from: 1, to: 3 }, time: { from: new Date(), to: new Date() } },
                            { days: { from: 5, to: 6 }, time: { from: new Date(), to: new Date() } },
                        ],
                        weekend: "01.01",
                    },
                    location: { lng: 30.547101960608394, lat: 50.41274670612611 },
                    place: { city: "Київ", address: "Address 1" },
                    type: "cafe",
                    description: "Description for EstablishmentSchema 1",
                    contacts: [{ value: "Contact 1" }],
                    tags: [{ value: "Tag 1" }],
                    verify: "published",
                    averageCheck: 60.0,
                    features: [{ value: "Feature 1" }],
                    createdBy: "63ff662330c343feee014e7a",
                },
                {
                    title: "EstablishmentSchema 2",
                    pictures: [
                        { name: "Picture 1", url: "https://profood.com.ua/uploads/file.png?1551951662452" },
                        { name: "Picture 2", url: "https://pyvtrest.com.ua/images/Articles/9.jpg" },
                        { name: "Picture 3", url: "https://i0.wp.com/antennadaily.ru/wp-content/uploads/2020/10/24.09.20-Bar-London-Hires-6-scaled.jpg?fit=1200%2C800&ssl=1" },
                    ],
                    workSchedule: {
                        workDays: [
                            { days: { from: 1, to: 5 }, time: { from: new Date(), to: new Date() } },
                        ],
                        weekend: "01.01",
                    },
                    location: { lng: 24.043249575347865, lat: 49.814787413721824},
                    place: { city: "Львів", address: "Address 2" },
                    type: "bar",
                    description: "Description for EstablishmentSchema 2",
                    contacts: [{ value: "Contact 2" }],
                    tags: [{ value: "free wi-fi" }],
                    verify: "published",
                    averageCheck: 200.0,
                    features: [{ value: "Feature 2" }],
                    createdBy: "63ff662330c343feee014e7a",
                },
                {
                    title: "EstablishmentSchema 3",
                    pictures: [
                        { name: "Picture 1", url: "https://reston.ua/runtime/cache/248x142/6153274.jpg" },
                        { name: "Picture 2", url: "https://static.tildacdn.com/tild3662-3537-4439-b237-303435623130/IMG_3613.jpg" },
                        { name: "Picture 3", url: "https://media-cdn.tripadvisor.com/media/photo-s/25/a5/03/73/caption.jpg" },
                        { name: "Picture 4", url: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Ostankino_restaurant.jpg" },
                    ],
                    workSchedule: {
                        workDays: [
                            { days: { from: 1, to: 3 }, time: { from: new Date(), to: new Date() } },
                            { days: { from: 4, to: 6 }, time: { from: new Date(), to: new Date() } },
                        ],
                        weekend: "01.01",
                    },
                    location: { lng: 30.547101960608394, lat: 50.41274670612611 },
                    place: { city: "Київ", address: "Address 3" },
                    type: "restaurant",
                    description: "Description for EstablishmentSchema 3",
                    contacts: [{ value: "Contact 3" }],
                    tags: [{ value: "Tag 3" }],
                    verify: "published",
                    averageCheck: 1800.0,
                    features: [{ value: "Feature 3" }],
                    createdBy: "63ff662330c343feee014e7a",
                },
                {
                    title: "EstablishmentSchema 4",
                    pictures: [
                        { name: "Picture 1", url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ44WIgeq9O3RdmFRXe4vO2G-exQMn75L9MkFRexUPesKPvtZjM4oY4D4MCglsrxIshIlU&usqp=CAU" },
                        { name: "Picture 2", url: "https://reston.ua/runtime/cache/248x142/6153274.jpg" },
                        { name: "Picture 3", url: "https://static.tildacdn.com/tild3662-3537-4439-b237-303435623130/IMG_3613.jpg" },
                        { name: "Picture 4", url: "https://media-cdn.tripadvisor.com/media/photo-s/25/a5/03/73/caption.jpg" },
                        { name: "Picture 5", url: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Ostankino_restaurant.jpg" },
                    ],
                    workSchedule: {
                        workDays: [
                            { days: { from: 1, to: 3 }, time: { from: new Date(), to: new Date() } },
                            { days: { from: 4, to: 5 }, time: { from: new Date(), to: new Date() } },
                        ],
                        weekend: "01.01",
                    },
                    location: { lng: 25.600713971605, lat: 49.55055462907285 },
                    place: { city: "Тернопіль", address: "Address 4" },
                    type: "restaurant",
                    description: "Description for EstablishmentSchema 4",
                    contacts: [{ value: "Contact 4" }],
                    tags: [{ value: "Tag 4" }],
                    verify: "published",
                    averageCheck: 900.0,
                    features: [{ value: "Feature 4" }],
                    createdBy: "63ff662330c343feee014e7a",
                },
            ];
            await EstablishmentSchema.insertMany(initialData)
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