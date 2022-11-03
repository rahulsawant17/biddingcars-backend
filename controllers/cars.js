const Car = require('../models/car.model');
const Timeline = require('../models/timeline.model');
const User = require('../models/user.model');
const cloudinary = require('../utils/cloudinary');
const { connection } = require('../express/mongoDB');
const { io } = require('../express/socketIO');

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
        status: 'pending',
        endTime: req.body.endTime,
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
exports.getMyListings = async (req, res) => {
  const id = await User.find({email: req.params.email},{ "_id": 1});
  Car.find({ownerId:id})
    .then((car) => res.json(car))
    .catch((err) => res.status(400).json('Error: ' + err));
};

exports.getMyBids = async (req, res) => {
  let id = await User.find({email: req.params.email},{ "_id": 1});
  console.log(id)
  id=id[0]._id
  let car = await Timeline.find({ timeline: {$elemMatch:{'user._id':id}} },{"carId":1,"_id":0})
  if (car){
    let carids=car.map(function(ele) {return ele.carId} )
  Car.find({_id: {$in: carids}})
    .then((car) => {
      res.json(car)
    })
    .catch((err) => res.status(400).json('Error: ' + err));
  }else{
    res.json([])
  }

};

exports.getAllListings = async (req, res) => {
  Car.find()
    .then((cars) => res.json(cars))
    .catch((err) => res.status(400).json('Error: ' + err));
};

exports.placeBid = async (req, res) => {
  const car = req.body.car;
  try {
    const owner = await User.findById(req.body.car.ownerId);
    const bid = Number(req.body.bid);

    //check owner
    if (req.user.email === owner.email) {
      return res.status(200).json({ message: 'Owner is trying to bid' });
    } else {
      //check bid > baseprice
      if (bid < car.basePrice) {
        return res.status(200).json({ message: 'Bid has to be greater than the base price' });
      } else {
        const reqdCar = await Car.findById(car._id);
        if (!reqdCar.lock) {
          await Car.findOneAndUpdate(
            {
              _id: car._id,
            },
            { lock: true },
          );
          //start transaction
          const session = await connection.startSession();
          await session.withTransaction(async () => {
            if (bid > reqdCar.currentBid) {
              const condition = {
                _id: car._id,
              };

              const update = {
                $inc: {
                  numberOfBids: +1,
                },
                $set: {
                  currentBid: bid,
                },
              };

              //update car document atomically
              await Car.findOneAndUpdate(condition, update, { session });

              const timelineObject = {
                user: req.user,
                bid: bid,
                time: new Date(),
              };

              //update timeline
              const timeline = await Timeline.findOne({ carId: car._id });
              if (timeline) {
                const arr = timeline.timeline;
                arr.push(timelineObject);
                await Timeline.findOneAndUpdate({ carId: car._id }, { timeline: arr }, { session });
                await session.commitTransaction();
                res.status(200).json({ message: 'Bid added successfully!!' });
              } else {
                const newTimeline = new Timeline({
                  carId: car._id,
                  ownerId: owner._id,
                  timeline: [timelineObject],
                });

                await newTimeline.save({ session });
                await Car.findOneAndUpdate(
                  {
                    _id: car._id,
                  },
                  { lock: false },
                  { session },
                );

                await session.commitTransaction();

                res.status(200).json({ message: 'Bid added successfully!!', carDetails: newTimeline });
              }
            } else {
              throw new Error('Bidding amount should be greater than current bid');
            }
            const newCar = await Car.findOneAndUpdate(
              {
                _id: car._id,
              },
              { lock: false },
              { session },
            );

            io.emit('bid_update', newCar);
            session.endSession();


          });
        } else {
          res.status(200).json({
            message: "Someone else's bid is being processed. Please wait some time and try again",
          });
        }
      }
    }
  } catch (err) {
    await Car.findOneAndUpdate(
      {
        _id: car._id,
      },
      { lock: false },
    );
    console.log(err);
    res.status(500).json({ message: err });
  }
};

exports.placeBidCheck = async (req, res) => {
  try {
    const owner = await User.findById(req.body.car.ownerId);
    const vercheck = await User.find({email:req.user.email},{"isVerified":1,"_id":0});
    if (req.user.email === owner.email) {
      res.status(200).json({check:false, message: 'Owner cannot bid on his own car' });
    }else if (req.user.role === "admin") {
      res.status(200).json({check:false, message: 'Admin cannot bid' });
    }else{
    res.status(200).json({check:true,isVerified:vercheck[0].isVerified});}
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