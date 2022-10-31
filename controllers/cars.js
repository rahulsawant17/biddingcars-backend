let Car = require('../models/car.model');
const Timeline = require('../models/timeline.model');
const User = require('../models/user.model');
const cloudinary = require('../utils/cloudinary');

exports.listCar = async (req, res) => {
  try {
    const photos = req.files;
    result = [];
    photos.forEach(async (photo) => {
      let cloudPhoto = cloudinary.uploader.upload(photo.path);
      result.push(cloudPhoto);
    });

    Promise.all(result).then((e) => {
      let urls = e;
      resultantUrls = [];
      urls.forEach((e) => {
        resultantUrls.push(e.url);
      });
      const newCar = new Car({
        carCompany: req.body.carCompany,
        photos: resultantUrls,
        modelName: req.body.modelName,
        modelYear: Number(req.body.modelYear),
        color: req.body.color,
        kilometersDriven: Number(req.body.kilometersDriven),
        condition: req.body.condition,
        description: req.body.description,
        basePrice: Number(req.body.basePrice),
        fullPrice: Number(req.body.fullPrice),
        ownerId: req.user._id,
        currentBid: req.body.currentBid,
        bidTimelineId: req.body.bidTimelineId,
        currentBidUserId: req.body.currentBidUserId,
        status: 'pending for approval',
      });

      newCar
        .save()
        .then((saved) => res.status(200).json({ message: 'Listing added successfully!!', carDetails: saved }))
        .catch((err) => res.status(400).json('Error: ' + err));
    });
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
};

exports.updateCar = async (req, res) => {
  Car.findById(req.params.id)
    .then((car) => {
      (car.carCompany = req.body.carCompany),
        (car.modelName = req.body.modelName),
        (car.modelYear = Number(req.body.modelYear)),
        (car.color = req.body.color),
        (car.kilometersDriven = Number(req.body.kilometersDriven)),
        (car.condition = req.body.condition),
        (car.basePrice = Number(req.body.basePrice)),
        (car.fullPrice = Number(req.body.fullPrice)),
        (car.ownerId = req.body.ownerId),
        (car.currentBid = req.body.currentBid),
        (car.bidTimelineId = req.body.bidTimelineId),
        (car.currentBidUserId = req.body.currentBidUserId),
        (car.status = req.body.status),
        car
          .save()
          .then(() => res.json('Car updated!'))
          .catch((err) => res.status(400).json('Error: ' + err));
    })
    .catch((err) => res.status(400).json('Error: ' + err));
};

exports.verifyCar = async (req, res) => {
  Car.findById(req.params.id)
    .then((car) => {
      (car.status = req.body.status),
        car
          .save()
          .then(() => res.json('Car Verified!'))
          .catch((err) => res.status(400).json('Error: ' + err));
    })
    .catch((err) => res.status(400).json('Error: ' + err));
};

exports.rejectCar = async (req, res) => {
  Car.findById(req.params.id)
    .then((car) => {
      (car.status = req.body.status),
        car
          .save()
          .then(() => res.json('Car Rejected!'))
          .catch((err) => res.status(400).json('Error: ' + err));
    })
    .catch((err) => res.status(400).json('Error: ' + err));
};

exports.deleteCar = async (req, res) => {
  Car.findByIdAndDelete(req.params.id)
    .then(() => res.json('Car deleted.'))
    .catch((err) => res.status(400).json('Error: ' + err));
};

exports.getById = (req, res) => {
  Car.findById(req.params.id)
    .then((car) => res.json(car))
    .catch((err) => res.status(400).json('Error: ' + err));
};

exports.getAllListings = async (req, res) => {
  Car.find()
    .then((cars) => res.json(cars))
    .catch((err) => res.status(400).json('Error: ' + err));
};

exports.placeBid = async (req, res) => {
  try {
    const owner = await User.findById(req.body.car.ownerId);
    const bid = Number(req.body.bid);
    if (req.user.email === owner.email) {
      res.status(200).json({ message: 'Owner is trying to bid' });
    } else {
      const car = req.body.car;
      Car.findById(car._id).then(async (e) => {
        if (bid > e.currentBid) {
          const reqdCar = await Car.findById(car._id);
          reqdCar.currentBid = bid;
          reqdCar.numberOfBids = reqdCar.numberOfBids+1;
          reqdCar.save();
          const timelineObject = {
            user: req.user,
            bid: bid,
            time:new Date()
          }
          const timeline = await Timeline.findOne({ carId: car._id });
          if (timeline) {
            const arr = timeline.timeline;
            arr.push(timelineObject);
            await Timeline.findOneAndUpdate({ carId: car._id }, { timeline: arr });

            res.status(200).json({message:'Bid added successfully!!'});
          } else {
            const newTimeline = new Timeline({
              carId: car._id,
              ownerId: owner._id,
              timeline: [timelineObject],
            });
  
            newTimeline
              .save()
              .then((saved) => res.status(200).json({ message: 'Bid added successfully!!', carDetails: saved }))
              .catch((err) => res.status(400).json('Error: ' + err));
          }
        } else {
          throw new Error('Bidding amount should be greater than current bid')
        }
      })
        
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};


exports.getHistory = async (req, res) => {
  
  Timeline.findOne({ carId: req.params.id })
    .then((timeline) => res.status(200).json({ history: timeline }))
    .catch((err) => res.status(400).json('Error: ' + err));
};