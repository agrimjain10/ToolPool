const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryServer;

async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/toolpool';
  const usingExplicitUri = Boolean(process.env.MONGO_URI || process.env.MONGODB_URI);

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2500 });
    console.log(`MongoDB connected successfully: ${mongoUri}`);
    return;
  } catch (error) {
    if (usingExplicitUri) {
      console.error('Database connection failed:', error.message);
      throw error;
    }

    console.warn(`Local MongoDB was not reachable at ${mongoUri}. Falling back to an in-memory database for this session.`);
  }

  try {
    memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri();
    await mongoose.connect(uri);
    console.log('MongoDB memory server connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }
}

module.exports = connectDatabase;
