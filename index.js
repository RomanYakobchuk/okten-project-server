const express = require('express');
const mongoose = require('mongoose');
const expressFileUpload = require('express-fileupload');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require("cors");
require('dotenv').config()
// { path: path.join(process.cwd(), 'environments', `${process.env.MODE}.env`)}

const { authRouter, userRouter, institutionRouter } = require('./routes');
const { configs } = require('./configs');

mongoose.connect(configs.MONGO_URL);

const app = express();
app.use(bodyParser.urlencoded({extended: true }));
app.use(bodyParser.json());
app.use(expressFileUpload());

app.use(cors({
    origin: ['http://localhost:3000', 'https://a23f-78-25-5-136.eu.ngrok.io']
}))


app.use(function(req, res, next) {
    res.header('Content-Type', 'application/json;charset=UTF-8')
    res.header('Access-Control-Allow-Credentials', true)
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

app.use('/ping', (req, res) => res.json('THE SERVER WORKS STABLY'));
app.use('/qwe', (req, res) => res.json('asdasdasdasdasdasd'));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/institution', institutionRouter);

app.use('*', (req, res) => {
    res.status(404).json('Route not found');
});

app.use((err, req, res, next) => {
    console.log(err)
    res
        .status(err.status || 500)
        .json({
            error: err.message || 'Unknown Error',
            code: err.status || 500
        });
});

app.listen(configs.PORT, () => {
    console.log(`Started on port http://localhost:${configs.PORT}`);
});
