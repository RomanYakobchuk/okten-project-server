import express, {Request, Response, NextFunction} from 'express';
import mongoose from  'mongoose';
import expressFileUpload from  'express-fileupload';
import bodyParser from  'body-parser';
import cors from  "cors";
import dotenv from  "dotenv";
import compression from  "compression";


// import {scheduler, reserve} from "./services";

import {
    authRouter,
    userRouter,
    institutionRouter,
    ratingRouter,
    newsRouter,
    reviewRouter,
    commentRouter, cityRouter, menuRouter, managerRouter, conversationRouter, messageRouter, caplRouter
} from './routes';

import {configs} from './configs';
import {CustomError} from "./errors";
dotenv.config({path: `./environments/.env`});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function (req, res, next) {
    res.setHeader('Content-Type', 'application/json;charset=UTF-8')
    res.setHeader('Access-Control-Allow-Credentials', '*')
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next();
})

app.use(cors(
    {
        origin: configs.CLIENT_URL,
    }
));
app.use(compression());

app.use(expressFileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

app.use('/api/v1/ping', (req, res) => res.json('THE SERVER WORKS STABLY'));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/managers', managerRouter);
app.use('/api/v1/conversation', conversationRouter);
app.use('/api/v1/message', messageRouter);
app.use('/api/v1/institution', institutionRouter);
app.use('/api/v1/rating', ratingRouter);
app.use('/api/v1/news', newsRouter);
app.use('/api/v1/review', reviewRouter);
app.use('/api/v1/comment', commentRouter);
app.use('/api/v1/city', cityRouter);
app.use('/api/v1/menu', menuRouter);
app.use('/api/v1/capl', caplRouter);

app.use('*', (req, res) => {
    res.status(404).json('Route not found');
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.log(err)
    res
        ?.status(err?.status || 500)
        ?.send({
            error: err?.message || 'Unknown Error',
            code: err?.status || 500
        });
});

mongoose.Promise = Promise;
mongoose.connect(configs.MONGO_URL as string).then(() => {
    console.log("|-------------------------------------------")
    console.log('| Connect: success')
    app.listen(Number(configs.PORT)!, configs.HOST!, () => {
        console.log(`| Started on port http://localhost:${configs.PORT}`);
        console.log("|___________________________________________")
    });
}).catch(err => {
    console.log(err)
    console.log('connect: error')
})
