import mongoose from 'mongoose';

const connectToMongo = async (): Promise<any> => {
  try {
    const connection = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017',
      { dbName: 'thaparcarpool' },
    );
    if (connection) {
      console.log('Connected to MongoDB!');
    }
  } catch (error) {
    console.error(error);
  }
};

export default connectToMongo;
