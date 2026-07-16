const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryServer;

async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI;

  try {
    if (mongoUri) {
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected successfully');
      return;
    }

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
