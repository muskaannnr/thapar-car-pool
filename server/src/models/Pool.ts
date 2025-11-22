import mongoose, { Schema } from 'mongoose';

const PoolSchema = new Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  journeyDate: {
    type: Date,
    required: true,
  },
  members: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      arrivalTime: {
        type: Date,
        required: true,
      },
    },
  ],
  originalArrivalTime: {
    type: Date,
    required: true,
  },
  locked: {
    type: Boolean,
    default: false,
  },
  driver: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'driver',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
  },
});

export default mongoose.model('pool', PoolSchema);
