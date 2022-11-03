let Carddetails = require('../models/carddetails.model');
const User = require('../models/user.model');
exports.getCarddetails = (req, res) => {
  Carddetails.find()
    .then((cards) => res.json(cards))
    .catch((err) => res.status(400).json("Error: " + err));
};

exports.addCarddetails = async (req, res) => {
    const newCarddetails = new Carddetails({
      customerId:req.user._id,
      customerName: req.body.name,
      cardNumber: Number(req.body.cardnumber),
      expiryDate: req.body.expiry,
      cardType:req.body.cardtype,
      cvv:Number(req.body.cvv),
    });
    newCarddetails
      .save()
    .then(() => res.json("Card details added!"))
    .catch((err) => res.status(400).json("Error: " + err));
}