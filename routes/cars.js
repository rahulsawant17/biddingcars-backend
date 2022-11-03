const router = require('express').Router();
const { listCar,updateCar,deleteCar,getById,getAllListings, verifyCar, rejectCar, placeBid, placeBidCheck, getHistory ,getMyListings,getMyBids} = require('../controllers/cars');
let Car = require('../models/car.model');
const requireSignin = require('../middleware');
const multer = require('../utils/multer');

router.get('/',getAllListings);

router.post('/add',requireSignin, multer.array('image'),listCar);

router.get('/:id', getById);

router.get('/mylistings/:email',requireSignin, getMyListings);

router.get('/mybids/:email',requireSignin, getMyBids);

router.get('/:id/history',getHistory);

router.delete('/:id',deleteCar);

router.post('/update/:id',requireSignin,updateCar);

router.post('/verify/:id',requireSignin,verifyCar);

router.post('/reject/:id', requireSignin, rejectCar);

router.post('/placebid', requireSignin,placeBid);

router.post('/placebidcheck', requireSignin,placeBidCheck);

module.exports = router;
