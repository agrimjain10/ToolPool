const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDatabase = require('./db');
const { hashPassword, comparePassword } = require('./authHelpers');
const User = require('./models/userModel');
const Tool = require('./models/toolModel');
const Request = require('./models/requestModel');
const Favorite = require('./models/favoriteModel');
const Review = require('./models/reviewModel');
const Message = require('./models/messageModel');
const Notification = require('./models/notificationModel');

const app = express();
const port = process.env.PORT || 4000;
const apiRoutes = [];

app.use(cors());
app.use(express.json({ limit: '1mb' }));

function route(method, url, handler) {
  apiRoutes.push(`${method.toUpperCase()} ${url}`);
  app[method](url, async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error. Please try again.' });
    }
  });
}

function missingFields(body, fields) {
  return fields.filter((field) => !String(body[field] ?? '').trim());
}

function userResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

function toolFilter(query) {
  const filter = {};

  if (query.category) filter.category = new RegExp(query.category, 'i');
  if (query.location) filter.location = new RegExp(query.location, 'i');
  if (query.available === 'true') filter.available = true;
  if (query.available === 'false') filter.available = false;
  if (query.q) {
    const text = new RegExp(query.q, 'i');
    filter.$or = [{ name: text }, { category: text }, { location: text }, { owner: text }];
  }

  return filter;
}

async function seedSampleData() {
  const userCount = await User.countDocuments();
  const toolCount = await Tool.countDocuments();

  if (!userCount) {
    await User.create([
      {
        name: 'Agrim Jain',
        email: 'agrim@example.com',
        password: await hashPassword('123456'),
        role: 'admin'
      },
      {
        name: 'Rohan Mehta',
        email: 'rohan@example.com',
        password: await hashPassword('123456'),
        role: 'customer'
      }
    ]);
  }

  if (toolCount) return;

  const tools = await Tool.create([
    {
      name: 'Bosch Impact Drill',
      category: 'Power tools',
      owner: 'Rohan Mehta',
      location: 'Vijay Nagar',
      distance: '350 m away',
      deposit: 500,
      available: true,
      description: 'Compact drill with charger and basic bit set.',
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=85'
    },
    {
      name: '6 ft Step Ladder',
      category: 'Home repair',
      owner: 'Ananya Shah',
      location: 'Scheme 54',
      distance: '700 m away',
      deposit: 300,
      available: true,
      description: 'Light aluminium ladder for home repair work.',
      image: 'https://images.unsplash.com/photo-1591588582259-e675bd2e6088?auto=format&fit=crop&w=900&q=85'
    },
    {
      name: 'Garden Tool Set',
      category: 'Gardening',
      owner: 'Neha Verma',
      location: 'Palasia',
      distance: '1.1 km away',
      deposit: 250,
      available: false,
      description: 'Trowel, pruner, cultivator and gloves in one kit.',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=85'
    }
  ]);

  await Request.create({
    toolId: tools[0]._id,
    borrower: 'Agrim Jain',
    message: 'Need it for shelf fitting this weekend.',
    deposit: tools[0].deposit,
    status: 'pending'
  });

  await Review.create({
    toolId: tools[0]._id,
    reviewer: 'Agrim Jain',
    rating: 5,
    comment: 'Tool was clean and worked nicely.'
  });
}

// Basic API info
route('get', '/api', (req, res) => {
  res.json({
    name: 'ToolPool MERN API',
    message: '45 self-made APIs are ready',
    totalRoutes: apiRoutes.length,
    routes: apiRoutes
  });
});

route('get', '/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected', app: 'ToolPool' });
});

// Auth APIs
route('post', '/api/auth/register', async (req, res) => {
  const missing = missingFields(req.body, ['name', 'email', 'password']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });

  const email = req.body.email.toLowerCase().trim();
  const alreadyExists = await User.findOne({ email });
  if (alreadyExists) return res.status(400).json({ error: 'Email already registered' });

  const user = await User.create({
    name: req.body.name,
    email,
    password: await hashPassword(req.body.password),
    role: req.body.role === 'admin' ? 'admin' : 'customer'
  });

  res.status(201).json(userResponse(user));
});

route('post', '/api/auth/login', async (req, res) => {
  const missing = missingFields(req.body, ['email', 'password']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });

  const user = await User.findOne({ email: req.body.email.toLowerCase().trim() });
  if (!user || !(await comparePassword(req.body.password, user.password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({ ...userResponse(user), token: `local-${user._id}` });
});

route('post', '/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

route('patch', '/api/auth/password/:id', async (req, res) => {
  const missing = missingFields(req.body, ['oldPassword', 'newPassword']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (!(await comparePassword(req.body.oldPassword, user.password))) {
    return res.status(401).json({ error: 'Old password is wrong' });
  }

  user.password = await hashPassword(req.body.newPassword);
  await user.save();
  res.json({ message: 'Password updated' });
});

// User APIs
route('get', '/api/users', async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});

route('get', '/api/users/admins', async (req, res) => {
  res.json(await User.find({ role: 'admin' }).select('-password'));
});

route('get', '/api/users/customers', async (req, res) => {
  res.json(await User.find({ role: 'customer' }).select('-password'));
});

route('get', '/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

route('post', '/api/users', async (req, res) => {
  const missing = missingFields(req.body, ['name', 'email', 'password']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });

  const user = await User.create({
    name: req.body.name,
    email: req.body.email.toLowerCase().trim(),
    password: await hashPassword(req.body.password),
    role: req.body.role === 'admin' ? 'admin' : 'customer'
  });

  res.status(201).json(userResponse(user));
});

route('patch', '/api/users/:id', async (req, res) => {
  const update = { name: req.body.name, email: req.body.email, role: req.body.role };
  Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

route('delete', '/api/users/:id', async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'User deleted' });
});

// Tool APIs
route('get', '/api/tools', async (req, res) => {
  res.json(await Tool.find(toolFilter(req.query)).sort({ createdAt: -1 }));
});

route('get', '/api/tools/featured', async (req, res) => {
  res.json(await Tool.find({ available: true }).sort({ deposit: 1 }).limit(6));
});

route('get', '/api/tools/categories', async (req, res) => {
  res.json((await Tool.distinct('category')).sort());
});

route('get', '/api/tools/available', async (req, res) => {
  res.json(await Tool.find({ available: true }).sort({ name: 1 }));
});

route('get', '/api/tools/owner/:owner', async (req, res) => {
  res.json(await Tool.find({ owner: new RegExp(req.params.owner, 'i') }).sort({ createdAt: -1 }));
});

route('get', '/api/tools/:id', async (req, res) => {
  const tool = await Tool.findById(req.params.id);
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  res.json(tool);
});

route('post', '/api/tools', async (req, res) => {
  const missing = missingFields(req.body, ['name', 'category', 'owner', 'location', 'description']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });

  const tool = await Tool.create({
    ...req.body,
    deposit: Number(req.body.deposit || 0),
    available: req.body.available !== false
  });

  res.status(201).json(tool);
});

route('patch', '/api/tools/:id', async (req, res) => {
  const tool = await Tool.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  res.json(tool);
});

route('delete', '/api/tools/:id', async (req, res) => {
  const tool = await Tool.findByIdAndDelete(req.params.id);
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  await Request.deleteMany({ toolId: req.params.id });
  await Favorite.deleteMany({ toolId: req.params.id });
  await Review.deleteMany({ toolId: req.params.id });
  res.json({ message: 'Tool deleted' });
});

route('patch', '/api/tools/:id/availability', async (req, res) => {
  const tool = await Tool.findByIdAndUpdate(req.params.id, { available: Boolean(req.body.available) }, { new: true });
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  res.json(tool);
});

// Borrow request APIs
route('get', '/api/requests', async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  res.json(await Request.find(filter).populate('toolId').sort({ createdAt: -1 }));
});

route('get', '/api/requests/pending', async (req, res) => {
  res.json(await Request.find({ status: 'pending' }).populate('toolId').sort({ createdAt: -1 }));
});

route('get', '/api/requests/mine/:borrower', async (req, res) => {
  res.json(await Request.find({ borrower: new RegExp(req.params.borrower, 'i') }).populate('toolId'));
});

route('get', '/api/requests/:id', async (req, res) => {
  const request = await Request.findById(req.params.id).populate('toolId');
  if (!request) return res.status(404).json({ error: 'Request not found' });
  res.json(request);
});

route('post', '/api/requests', async (req, res) => {
  const missing = missingFields(req.body, ['toolId', 'borrower', 'message']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });

  const tool = await Tool.findById(req.body.toolId);
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  if (!tool.available) return res.status(400).json({ error: 'Tool is not available' });

  const request = await Request.create({
    toolId: tool._id,
    borrower: req.body.borrower,
    message: req.body.message,
    deposit: Number(req.body.deposit ?? tool.deposit),
    status: 'pending'
  });

  await Notification.create({
    userName: tool.owner,
    title: 'New borrow request',
    text: `${request.borrower} wants to borrow ${tool.name}`
  });

  res.status(201).json(request);
});

route('patch', '/api/requests/:id/status', async (req, res) => {
  const request = await Request.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).populate('toolId');
  if (!request) return res.status(404).json({ error: 'Request not found' });
  res.json(request);
});

route('patch', '/api/requests/:id/approve', async (req, res) => {
  const request = await Request.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true }).populate('toolId');
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (request.toolId) await Tool.findByIdAndUpdate(request.toolId._id, { available: false });
  res.json(request);
});

route('patch', '/api/requests/:id/reject', async (req, res) => {
  const request = await Request.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
  if (!request) return res.status(404).json({ error: 'Request not found' });
  res.json(request);
});

route('patch', '/api/requests/:id/return', async (req, res) => {
  const request = await Request.findByIdAndUpdate(req.params.id, { status: 'returned' }, { new: true }).populate('toolId');
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (request.toolId) await Tool.findByIdAndUpdate(request.toolId._id, { available: true });
  res.json(request);
});

route('delete', '/api/requests/:id', async (req, res) => {
  const request = await Request.findByIdAndDelete(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  res.json({ message: 'Request deleted' });
});

// Favorite APIs
route('get', '/api/favorites/:userName', async (req, res) => {
  res.json(await Favorite.find({ userName: req.params.userName }).populate('toolId').sort({ createdAt: -1 }));
});

route('post', '/api/favorites', async (req, res) => {
  const missing = missingFields(req.body, ['userName', 'toolId']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });

  const favorite = await Favorite.findOneAndUpdate(
    { userName: req.body.userName, toolId: req.body.toolId },
    { userName: req.body.userName, toolId: req.body.toolId },
    { upsert: true, new: true }
  );

  res.status(201).json(favorite);
});

route('delete', '/api/favorites/:userName/:toolId', async (req, res) => {
  await Favorite.findOneAndDelete({ userName: req.params.userName, toolId: req.params.toolId });
  res.json({ message: 'Favorite removed' });
});

// Review APIs
route('get', '/api/reviews/tool/:toolId', async (req, res) => {
  res.json(await Review.find({ toolId: req.params.toolId }).sort({ createdAt: -1 }));
});

route('post', '/api/reviews', async (req, res) => {
  const missing = missingFields(req.body, ['toolId', 'reviewer', 'rating']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });
  res.status(201).json(await Review.create(req.body));
});

route('delete', '/api/reviews/:id', async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return res.status(404).json({ error: 'Review not found' });
  res.json({ message: 'Review deleted' });
});

// Message APIs
route('get', '/api/messages/inbox/:userName', async (req, res) => {
  res.json(await Message.find({ receiver: req.params.userName }).sort({ createdAt: -1 }));
});

route('post', '/api/messages', async (req, res) => {
  const missing = missingFields(req.body, ['sender', 'receiver', 'text']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });
  res.status(201).json(await Message.create(req.body));
});

// Notification APIs
route('get', '/api/notifications/:userName', async (req, res) => {
  res.json(await Notification.find({ userName: req.params.userName }).sort({ createdAt: -1 }));
});

route('patch', '/api/notifications/:id/read', async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  if (!notification) return res.status(404).json({ error: 'Notification not found' });
  res.json(notification);
});

// Admin APIs
route('get', '/api/admin/stats', async (req, res) => {
  const [users, tools, availableTools, requests, pendingRequests, reviews] = await Promise.all([
    User.countDocuments(),
    Tool.countDocuments(),
    Tool.countDocuments({ available: true }),
    Request.countDocuments(),
    Request.countDocuments({ status: 'pending' }),
    Review.countDocuments()
  ]);

  res.json({ users, tools, availableTools, requests, pendingRequests, reviews });
});

route('post', '/api/admin/reset-sample', async (req, res) => {
  await Promise.all([
    User.deleteMany({}),
    Tool.deleteMany({}),
    Request.deleteMany({}),
    Favorite.deleteMany({}),
    Review.deleteMany({}),
    Message.deleteMany({}),
    Notification.deleteMany({})
  ]);

  await seedSampleData();
  res.json({ message: 'Sample data reset successfully' });
});

if (apiRoutes.length !== 45) {
  throw new Error(`API route count should be 45, currently ${apiRoutes.length}`);
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});

async function startServer() {
  await connectDatabase();
  await seedSampleData();
  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
    console.log(`${apiRoutes.length} API routes ready`);
  });
}

startServer();
