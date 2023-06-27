const express = require('express');
const mongoose = require('mongoose');
const {createServer} = require('http');
const {Server} = require('socket.io');
const expressFileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const cors = require("cors");

const {removeUser, addUser, users, getUser} = require("./io.server");

const {scheduler, reserve} = require("./services");

const {
    authRouter,
    userRouter,
    institutionRouter,
    ratingRouter,
    newsRouter,
    reviewRouter,
    commentRouter, cityRouter, menuRouter, managerRouter, conversationRouter, messageRouter, caplRouter
} = require('./routes');

const {configs} = require('./configs');
const {Message} = require("./dataBase");
const {CustomError} = require("./errors");

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const server = createServer(app);
app.use(function (req, res, next) {
    res.setHeader('Content-Type', 'application/json;charset=UTF-8')
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next();
})
const io = new Server(server,
    {
        cors: {
            origin: configs.CLIENT_URL,
        }
    }
)

io.on("connection", (socket) => {

    socket.on('addUser', (userId) => {
        addUser(userId, socket.id);
        console.log(`A user connected by id: ${userId}`);
        io.emit("getUsers", users);
    });

    socket.on("sendMessage", async ({sender, receiver, text, chatId}) => {
        try {
            const chat = await Message.ConversationSchema.findById(chatId);
            if (!chat) {
                throw new CustomError("Chat not found", 404);
            }
            const data = {
                sender: sender,
                text: text
            };
            chat.lastMessage = data;
            await chat?.save({});

            const receiverSocket = getUser(receiver);
            const senderSocket = getUser(sender);
            io.to([receiverSocket?.socketId, senderSocket?.socketId]).emit("getMessage", {
                sender,
                chatId,
                text
            });
            io.to([receiverSocket?.socketId, senderSocket?.socketId]).emit("getLastMessage", {
                sender,
                chatId,
                text
            });
        } catch (e) {
            console.error('Failed to send message: ', e)
        }
    });

    socket.on('typing', (isTyping, receiver) => {
        const receiverSocket = getUser(receiver);
        io.to(receiverSocket?.socketId).emit('isTyping', {isTyping});
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected!");
        removeUser(socket.id)
        io.emit('getUsers', users)
    });
});

app.use(cors(
    {
        origin: configs.CLIENT_URL,
    }
));

app.use(expressFileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

app.use('/ping', (req, res) => res.json('THE SERVER WORKS STABLY'));

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

app.use((err, req, res, next) => {
    console.log(err)
    res
        ?.status(err?.status || 500)
        ?.send({
            error: err?.message || 'Unknown Error',
            code: err?.status || 500
        });
});

mongoose?.connect(configs.MONGO_URL).then(() => {
    console.log("|-------------------------------------------")
    console.log('| Connect: success')
    server.listen(configs.PORT, () => {
        console.log(`| Started on port http://localhost:${configs.PORT}`);
        console.log("|___________________________________________")
    });
}).catch(err => {
    console.log('connect: error')
})
