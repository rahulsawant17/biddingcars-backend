const mongoose = require('mongoose');

require('dotenv').config();

const uri = process.env.ATLAS_URI;
console.log('uri',uri)
mongoose.connect(uri, { useNewUrlParser: true }
);
exports.connection = mongoose.connection;



