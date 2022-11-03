const router = require("express").Router();
const { getCarddetails,addCarddetails} = require('../controllers/cards');
let requireSignin = require("../middleware");

router.get("/",getCarddetails);

router.post("/add",requireSignin,addCarddetails);

module.exports = router;
