const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const timelineSchema = new Schema(
  {
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'Car',
      required: true,
    },
    ownerId: { type: mongoose.Schema.Types.ObjectId, refPath: 'User', required: true },
    timeline: {
      type: Array,
    },
  },
  {
    timestamps: true,
  },
);

const Timeline =  mongoose.models.Timeline || mongoose.model('Timeline', timelineSchema);

module.exports = Timeline;
