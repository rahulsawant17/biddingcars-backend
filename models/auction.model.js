const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const auctionSchema = new Schema({
  auctionId: { type: Number, required: true },
  modelName: { type: Array, required: true },

}, {
  timestamps: true,
});

const Auction = mongoose.models.Auction ||  mongoose.model('Auction', auctionSchema);

module.exports = Auction;