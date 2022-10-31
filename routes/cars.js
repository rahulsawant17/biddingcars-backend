const router = require('express').Router();
const { listCar,updateCar,deleteCar,getById,getAllListings, verifyCar, rejectCar, placeBid,  getHistory } = require('../controllers/cars');
let Car = require('../models/car.model');
const requireSignin = require('../middleware');
const multer = require('../utils/multer');

router.get('/',getAllListings);

router.post('/add',requireSignin, multer.array('image'),listCar);

router.get('/:id', getById);

router.get('/:id/history',getHistory);

router.delete('/:id',deleteCar);

router.post('/update/:id',requireSignin,updateCar);

router.post('/verify/:id',requireSignin,verifyCar);

router.post('/reject/:id', requireSignin, rejectCar);

router.post('/placebid', requireSignin,placeBid);

module.exports = router;
