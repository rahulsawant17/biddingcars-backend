const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const carddetailsSchema = new Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId,
    refPath: 'User',
    },
    customerName: {
    type: String,
    required: true,
    },
    cardNumber: {
      type: Number,
      required: true,
    },
    expiryDate: {
      type: String,
    },
    cardType: {
      type: String,
      enum: ["creditCard", "debitCard"],
      required: true,
    },
    cvv: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Carddetails =  mongoose.models.Carddetails || mongoose.model("Carddetails", carddetailsSchema);

module.exports = Carddetails;
