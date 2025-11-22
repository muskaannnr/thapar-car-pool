import mongoose, { Schema, Document } from 'mongoose';

interface DriverDocument extends Document {
  name: string;
  phone: string;
  isAvailable: boolean; // Driver's availability status
}

const DriverSchema: Schema<DriverDocument> = new Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model<DriverDocument>('Driver', DriverSchema);
