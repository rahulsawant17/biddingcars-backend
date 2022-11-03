const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { connection } = require('./mongoDB');
const { io } = require('./socketIO');
const serverless = require('serverless-http');
require('dotenv').config();

const app = express();
// const socketApp = express();
// const http = require('http');
// const server = http.createServer(socketApp);
// const { Server } = require("socket.io");
// const io = new Server(server, {
  // cors: {
    // origin: "http://localhost:3000",
    // methods: ["GET", "POST"],
  // },
// });
const port = process.env.PORT || 5000;

app.use(cors());
// socketApp.use(cors());
app.use(express.json());

connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

io.on('connection', (socket) => {
  console.log('a user connected');
});
const carsRouter = require('../routes/cars');
const usersRouter = require('../routes/users');
const cardsRouter = require('../routes/cards');

app.use('/.netlify/functions/server/cars', carsRouter);
app.use('/.netlify/functions/server/users', usersRouter);
app.use('/.netlify/functions/server/cards', cardsRouter);


module.exports = app;
module.exports.handler=serverless(app)