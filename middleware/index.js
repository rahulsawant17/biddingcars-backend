const admin = require("../config/firebase-config");
const User = require('../models/user.model');

const requireSignin = async (req, res, next) => {
  try {
    // console.log( 'requireSignin',req.headers);
  } catch {
    console.log("user object not ");
  }
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    const decodeValue = await admin.auth().verifyIdToken(token);
    if (decodeValue) {
      const user=await User.find({ email: decodeValue.email });
      req.user = user[0];
      return next();
    }
    return res.status(400).json({ message: "Authorization required" });
  } else {
    return res.status(400).json({ message: "Unauthorized Access" });
  }
};

module.exports = requireSignin;
