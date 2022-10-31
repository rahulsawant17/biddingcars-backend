const router = require("express").Router();
const { getUsers,addUser,getUserById,getUserByEmail, updateUserByEmail } = require('../controllers/users');
let requireSignin = require("../middleware");


router.get("/",getUsers);

router.get("/:email",requireSignin,getUserByEmail);

router.get('/:id',requireSignin,getUserById);

router.post("/add",requireSignin,addUser);

router.post("/update",requireSignin,updateUserByEmail);

module.exports = router;
