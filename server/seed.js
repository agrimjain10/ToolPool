const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Tool = require('./models/toolModel');
const Request = require('./models/requestModel');

async function seedData() {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  await Tool.deleteMany({});
  await Request.deleteMany({});

  const tools = await Tool.insertMany([
    {
      name: 'DeWalt 20V Max Drill',
      category: 'Power Tools',
      owner: 'Sarah Jenkins',
      location: 'Oak Ridge',
      distance: '1.2 mi',
      deposit: 20,
      available: true,
      description: 'Heavy-duty drill with two batteries and a basic bit set.',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&q=80'
    },
    {
      name: 'Heavy Duty Extension Cord',
      category: 'Outdoor',
      owner: 'Miguel Brooks',
      location: 'Maple Grove',
      distance: '2.6 mi',
      deposit: 10,
      available: true,
      description: '100-foot outdoor extension cord for community events.',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80'
    },
    {
      name: 'Garden Wheelbarrow',
      category: 'Gardening',
      owner: 'Amina Shah',
      location: 'Cedar Lane',
      distance: '0.8 mi',
      deposit: 15,
      available: false,
      description: 'Sturdy wheelbarrow for yard work and mulch transport.',
      image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80'
    }
  ]);

  await Request.create({
    toolId: tools[0]._id,
    borrower: 'Arthur Pendelton',
    message: 'I need it for an afternoon to hang shelves.',
    deposit: 20,
    status: 'pending'
  });

  console.log('Seed data added');
  mongoose.disconnect();
}

seedData().catch((error) => {
  console.error(error);
  process.exit(1);
});
