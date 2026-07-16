const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDatabase = require('./db');
const Tool = require('./models/toolModel');
const Request = require('./models/requestModel');
const User = require('./models/userModel');
const Favorite = require('./models/favoriteModel');
const Review = require('./models/reviewModel');
const Message = require('./models/messageModel');
const Notification = require('./models/notificationModel');
const { hashPassword, comparePassword } = require('./authHelpers');

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
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });
}

function requiredFields(body, fields) {
  return fields.filter((field) => !String(body[field] ?? '').trim());
}

function getToolFilter(query) {
  const filter = {};
  if (query.category) filter.category = new RegExp(query.category, 'i');
  if (query.location) filter.location = new RegExp(query.location, 'i');
  if (query.available === 'true') filter.available = true;
  if (query.available === 'false') filter.available = false;
  if (query.q) {
    const search = new RegExp(query.q, 'i');
    filter.$or = [{ name: search }, { category: search }, { description: search }, { owner: search }];
  }
  return filter;
}

async function seedSampleData() {
  const toolCount = await Tool.countDocuments();
  if (toolCount > 0) return;

  const sampleTools = await Tool.insertMany([
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
    },
    {
      name: 'Folding Ladder',
      category: 'Home Repair',
      owner: 'Noah Patel',
      location: 'Pine Street',
      distance: '1.7 mi',
      deposit: 25,
      available: true,
      description: 'Multi-position ladder for painting, gutters, and garage projects.',
      image: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=900&q=80'
    }
  ]);

  await Request.create({
    toolId: sampleTools[0]._id,
    borrower: 'Arthur Pendelton',
    message: 'I need it for an afternoon to hang shelves.',
    deposit: 20,
    status: 'pending'
  });

  await Review.create({ toolId: sampleTools[0]._id, reviewer: 'Maya Chen', rating: 5, comment: 'Easy pickup and the drill worked perfectly.' });
  await Notification.create({ userName: 'Sarah Jenkins', title: 'New borrow request', text: 'Arthur wants to borrow your drill.' });
}

route('get', '/api', (req, res) => {
  res.json({ name: 'Neighborhood Tool Sharing API', totalRoutes: apiRoutes.length, routes: apiRoutes });
});

route('get', '/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Neighborhood Tool Sharing API is live' });
});

route('post', '/api/auth/register', async (req, res) => {
  const missing = requiredFields(req.body, ['name', 'email', 'password']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });

  const email = req.body.email.toLowerCase().trim();
  const existingUser = await User.findOne({ email }).lean();
  if (existingUser) return res.status(400).json({ error: 'An account with this email already exists.' });

  const user = await User.create({
    name: req.body.name,
    email,
    password: await hashPassword(req.body.password),
    role: req.body.role === 'admin' ? 'admin' : 'customer'
  });

  res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
});

route('post', '/api/auth/login', async (req, res) => {
  const missing = requiredFields(req.body, ['email', 'password']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });

  const user = await User.findOne({ email: req.body.email.toLowerCase().trim() });
  if (!user || !(await comparePassword(req.body.password, user.password))) {
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }

  res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
});

route('post', '/api/auth/check-email', async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email || '').toLowerCase().trim() }).lean();
  res.json({ available: !user });
});

route('post', '/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out locally.' });
});

route('patch', '/api/auth/profile/:id', async (req, res) => {
  const update = { name: req.body.name, email: req.body.email };
  Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
});

route('get', '/api/tools', async (req, res) => {
  const tools = await Tool.find(getToolFilter(req.query)).sort({ createdAt: -1 }).lean();
  res.json(tools);
});

route('get', '/api/tools/featured', async (req, res) => {
  const tools = await Tool.find({ available: true }).sort({ deposit: 1 }).limit(6).lean();
  res.json(tools);
});

route('get', '/api/tools/search', async (req, res) => {
  const tools = await Tool.find(getToolFilter(req.query)).limit(20).lean();
  res.json(tools);
});

route('get', '/api/tools/categories', async (req, res) => {
  const categories = await Tool.distinct('category');
  res.json(categories.sort());
});

route('get', '/api/tools/locations', async (req, res) => {
  const locations = await Tool.distinct('location');
  res.json(locations.sort());
});

route('get', '/api/tools/available', async (req, res) => {
  res.json(await Tool.find({ available: true }).sort({ name: 1 }).lean());
});

route('get', '/api/tools/borrowed', async (req, res) => {
  res.json(await Tool.find({ available: false }).sort({ updatedAt: -1 }).lean());
});

route('get', '/api/tools/recent', async (req, res) => {
  res.json(await Tool.find().sort({ createdAt: -1 }).limit(8).lean());
});

route('get', '/api/tools/nearby/:location', async (req, res) => {
  res.json(await Tool.find({ location: new RegExp(req.params.location, 'i') }).lean());
});

route('get', '/api/tools/owner/:owner', async (req, res) => {
  res.json(await Tool.find({ owner: new RegExp(req.params.owner, 'i') }).sort({ createdAt: -1 }).lean());
});

route('get', '/api/tools/category/:category', async (req, res) => {
  res.json(await Tool.find({ category: new RegExp(req.params.category, 'i') }).lean());
});

route('get', '/api/tools/:id', async (req, res) => {
  const tool = await Tool.findById(req.params.id).lean();
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  res.json(tool);
});

route('post', '/api/tools', async (req, res) => {
  const missing = requiredFields(req.body, ['name', 'category', 'owner', 'location', 'description']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });

  const tool = await Tool.create({ ...req.body, available: req.body.available !== false, deposit: Number(req.body.deposit || 0) });
  res.status(201).json(tool);
});

route('put', '/api/tools/:id', async (req, res) => {
  const tool = await Tool.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  res.json(tool);
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
  res.json({ message: 'Tool deleted' });
});

route('patch', '/api/tools/:id/availability', async (req, res) => {
  const tool = await Tool.findByIdAndUpdate(req.params.id, { available: Boolean(req.body.available) }, { new: true });
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  res.json(tool);
});

route('patch', '/api/tools/:id/deposit', async (req, res) => {
  const tool = await Tool.findByIdAndUpdate(req.params.id, { deposit: Number(req.body.deposit || 0) }, { new: true, runValidators: true });
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  res.json(tool);
});

route('patch', '/api/tools/:id/image', async (req, res) => {
  const tool = await Tool.findByIdAndUpdate(req.params.id, { image: req.body.image }, { new: true, runValidators: true });
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  res.json(tool);
});

route('get', '/api/requests', async (req, res) => {
  res.json(await Request.find(req.query.status ? { status: req.query.status } : {}).sort({ createdAt: -1 }).populate('toolId').lean());
});

route('get', '/api/requests/pending', async (req, res) => {
  res.json(await Request.find({ status: 'pending' }).populate('toolId').lean());
});

route('get', '/api/requests/approved', async (req, res) => {
  res.json(await Request.find({ status: 'approved' }).populate('toolId').lean());
});

route('get', '/api/requests/returned', async (req, res) => {
  res.json(await Request.find({ status: 'returned' }).populate('toolId').lean());
});

route('get', '/api/requests/mine/:borrower', async (req, res) => {
  res.json(await Request.find({ borrower: new RegExp(req.params.borrower, 'i') }).populate('toolId').lean());
});

route('get', '/api/requests/tool/:toolId', async (req, res) => {
  res.json(await Request.find({ toolId: req.params.toolId }).sort({ createdAt: -1 }).lean());
});

route('get', '/api/requests/:id', async (req, res) => {
  const request = await Request.findById(req.params.id).populate('toolId').lean();
  if (!request) return res.status(404).json({ error: 'Request not found' });
  res.json(request);
});

route('post', '/api/requests', async (req, res) => {
  const missing = requiredFields(req.body, ['toolId', 'borrower', 'message']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });

  const tool = await Tool.findById(req.body.toolId);
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  if (!tool.available) return res.status(400).json({ error: 'This tool is already borrowed.' });

  const request = await Request.create({ ...req.body, deposit: Number(req.body.deposit ?? tool.deposit), status: 'pending' });
  await Notification.create({ userName: tool.owner, title: 'New borrow request', text: `${request.borrower} wants to borrow ${tool.name}.` });
  res.status(201).json(request);
});

route('patch', '/api/requests/:id', async (req, res) => {
  const request = await Request.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!request) return res.status(404).json({ error: 'Request not found' });
  res.json(request);
});

route('patch', '/api/requests/:id/status', async (req, res) => {
  const request = await Request.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }).populate('toolId');
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (request.toolId && ['approved', 'returned'].includes(request.status)) {
    await Tool.findByIdAndUpdate(request.toolId._id, { available: request.status === 'returned' });
  }
  res.json(request);
});

route('patch', '/api/requests/:id/approve', async (req, res) => {
  req.body.status = 'approved';
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

route('get', '/api/users', async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
  res.json(users);
});

route('get', '/api/users/admins', async (req, res) => {
  res.json(await User.find({ role: 'admin' }).select('-password').lean());
});

route('get', '/api/users/customers', async (req, res) => {
  res.json(await User.find({ role: 'customer' }).select('-password').lean());
});

route('get', '/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select('-password').lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

route('post', '/api/users', async (req, res) => {
  const missing = requiredFields(req.body, ['name', 'email', 'password']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });
  const user = await User.create({ ...req.body, password: await hashPassword(req.body.password) });
  res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
});

route('patch', '/api/users/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

route('patch', '/api/users/:id/role', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true, runValidators: true }).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

route('delete', '/api/users/:id', async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'User deleted' });
});

route('get', '/api/favorites', async (req, res) => {
  res.json(await Favorite.find().populate('toolId').sort({ createdAt: -1 }).lean());
});

route('get', '/api/favorites/:userName', async (req, res) => {
  res.json(await Favorite.find({ userName: req.params.userName }).populate('toolId').lean());
});

route('post', '/api/favorites', async (req, res) => {
  const favorite = await Favorite.create({ userName: req.body.userName, toolId: req.body.toolId });
  res.status(201).json(favorite);
});

route('delete', '/api/favorites/:id', async (req, res) => {
  const favorite = await Favorite.findByIdAndDelete(req.params.id);
  if (!favorite) return res.status(404).json({ error: 'Favorite not found' });
  res.json({ message: 'Favorite removed' });
});

route('delete', '/api/favorites/:userName/:toolId', async (req, res) => {
  await Favorite.findOneAndDelete({ userName: req.params.userName, toolId: req.params.toolId });
  res.json({ message: 'Favorite removed' });
});

route('get', '/api/reviews', async (req, res) => {
  res.json(await Review.find().populate('toolId').sort({ createdAt: -1 }).lean());
});

route('get', '/api/reviews/tool/:toolId', async (req, res) => {
  res.json(await Review.find({ toolId: req.params.toolId }).sort({ createdAt: -1 }).lean());
});

route('get', '/api/reviews/average/:toolId', async (req, res) => {
  const reviews = await Review.find({ toolId: req.params.toolId }).lean();
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  res.json({ count: reviews.length, average: Number(average.toFixed(1)) });
});

route('post', '/api/reviews', async (req, res) => {
  const missing = requiredFields(req.body, ['toolId', 'reviewer', 'rating']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });
  res.status(201).json(await Review.create(req.body));
});

route('delete', '/api/reviews/:id', async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return res.status(404).json({ error: 'Review not found' });
  res.json({ message: 'Review deleted' });
});

route('get', '/api/messages', async (req, res) => {
  res.json(await Message.find().sort({ createdAt: -1 }).lean());
});

route('get', '/api/messages/thread/:requestId', async (req, res) => {
  res.json(await Message.find({ requestId: req.params.requestId }).sort({ createdAt: 1 }).lean());
});

route('get', '/api/messages/inbox/:userName', async (req, res) => {
  res.json(await Message.find({ receiver: req.params.userName }).sort({ createdAt: -1 }).lean());
});

route('post', '/api/messages', async (req, res) => {
  const missing = requiredFields(req.body, ['sender', 'receiver', 'text']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });
  res.status(201).json(await Message.create(req.body));
});

route('patch', '/api/messages/:id/read', async (req, res) => {
  const message = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  if (!message) return res.status(404).json({ error: 'Message not found' });
  res.json(message);
});

route('delete', '/api/messages/:id', async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.id);
  if (!message) return res.status(404).json({ error: 'Message not found' });
  res.json({ message: 'Message deleted' });
});

route('get', '/api/notifications', async (req, res) => {
  res.json(await Notification.find().sort({ createdAt: -1 }).lean());
});

route('get', '/api/notifications/:userName', async (req, res) => {
  res.json(await Notification.find({ userName: req.params.userName }).sort({ createdAt: -1 }).lean());
});

route('post', '/api/notifications', async (req, res) => {
  const missing = requiredFields(req.body, ['userName', 'title', 'text']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });
  res.status(201).json(await Notification.create(req.body));
});

route('patch', '/api/notifications/:id/read', async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  if (!notification) return res.status(404).json({ error: 'Notification not found' });
  res.json(notification);
});

route('delete', '/api/notifications/:id', async (req, res) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);
  if (!notification) return res.status(404).json({ error: 'Notification not found' });
  res.json({ message: 'Notification deleted' });
});

route('get', '/api/dashboard', async (req, res) => {
  const requests = await Request.find().sort({ createdAt: -1 }).populate('toolId').lean();
  res.json({
    approved: requests.filter((item) => item.status === 'approved').length,
    pending: requests.filter((item) => item.status === 'pending').length,
    completed: requests.filter((item) => item.status === 'returned').length,
    requests: requests.slice(0, 5)
  });
});

route('get', '/api/admin/stats', async (req, res) => {
  const [totalTools, availableCount, borrowedCount, pendingRequests, approvedRequests, completedReturns, users] = await Promise.all([
    Tool.countDocuments(),
    Tool.countDocuments({ available: true }),
    Tool.countDocuments({ available: false }),
    Request.countDocuments({ status: 'pending' }),
    Request.countDocuments({ status: 'approved' }),
    Request.countDocuments({ status: 'returned' }),
    User.countDocuments()
  ]);

  res.json({ totalTools, availableCount, borrowedCount, pendingRequests, approvedRequests, completedReturns, users });
});

route('get', '/api/admin/activity', async (req, res) => {
  const [tools, requests, reviews] = await Promise.all([
    Tool.find().sort({ createdAt: -1 }).limit(3).lean(),
    Request.find().sort({ createdAt: -1 }).limit(3).populate('toolId').lean(),
    Review.find().sort({ createdAt: -1 }).limit(3).lean()
  ]);
  res.json({ tools, requests, reviews });
});

route('get', '/api/admin/inventory-value', async (req, res) => {
  const tools = await Tool.find().lean();
  res.json({ depositTotal: tools.reduce((sum, tool) => sum + tool.deposit, 0) });
});

route('get', '/api/admin/route-count', (req, res) => {
  res.json({ totalRoutes: apiRoutes.length });
});

route('post', '/api/admin/reset-sample', async (req, res) => {
  await Promise.all([Tool.deleteMany({}), Request.deleteMany({}), Review.deleteMany({}), Favorite.deleteMany({}), Message.deleteMany({}), Notification.deleteMany({})]);
  await seedSampleData();
  res.json({ message: 'Sample data reset' });
});

route('get', '/api/reports/summary', async (req, res) => {
  const [tools, requests, reviews] = await Promise.all([Tool.find().lean(), Request.find().lean(), Review.find().lean()]);
  res.json({ toolCount: tools.length, requestCount: requests.length, reviewCount: reviews.length });
});

route('get', '/api/reports/popular-tools', async (req, res) => {
  const requests = await Request.find().populate('toolId').lean();
  const counts = requests.reduce((map, request) => {
    const name = request.toolId?.name || 'Unknown tool';
    map[name] = (map[name] || 0) + 1;
    return map;
  }, {});
  res.json(Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count));
});

route('get', '/api/reports/open-requests', async (req, res) => {
  res.json(await Request.find({ status: { $in: ['pending', 'approved'] } }).populate('toolId').lean());
});

route('post', '/api/payments/deposit-preview', (req, res) => {
  const deposit = Number(req.body.deposit || 0);
  res.json({ deposit, serviceFee: 0, totalHold: deposit, chargedNow: 0 });
});

route('post', '/api/support/contact', async (req, res) => {
  const missing = requiredFields(req.body, ['name', 'message']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });
  await Notification.create({ userName: 'Admin', title: `Support message from ${req.body.name}`, text: req.body.message });
  res.status(201).json({ message: 'Support message saved' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});

async function startServer() {
  await connectDatabase();
  await seedSampleData();
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
    console.log(`${apiRoutes.length} API routes ready`);
  });
}

startServer();
