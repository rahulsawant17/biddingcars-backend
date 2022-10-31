const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
console.log('uri',uri)
mongoose.connect(uri, { useNewUrlParser: true }
);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

const carsRouter = require('../routes/cars');
const usersRouter = require('../routes/users');

app.use('/.netlify/functions/server', carsRouter);
app.use('/.netlify/functions/server', usersRouter);

// app.listen(port, () => {
//     console.log(`Server is running on port: ${port}`);
// });
module.exports = app;
module.exports.handler=serverless(app)