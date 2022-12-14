const express = require('express');
const cors = require('cors');

const socketApp = express();
const http = require('http');
const socketServer = http.createServer(socketApp);
const { Server } = require("socket.io");
const io = new Server(socketServer, {
  cors: {
    origin: "https://bidfrontend.netlify.app/auctions",
    methods: ["GET", "POST"],
  },
});

socketApp.use(cors());

socketServer.listen(process.env.SOCKET_PORT, () => {
    console.log(`Server is running on socket: ${process.env.SOCKET_PORT}`);
});

module.exports = { io };