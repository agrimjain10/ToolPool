const mongoose = require('mongoose');
const connectDatabase = require('./db');
const { resetSampleData } = require('./seedData');

async function seedData() {
  await connectDatabase();
  await resetSampleData();

  console.log('Database cleared');
  await mongoose.disconnect();
}

seedData().catch((error) => {
  console.error(error);
  process.exit(1);
});
