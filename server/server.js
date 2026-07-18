const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const connectDatabase = require('./db');
const { hashPassword, comparePassword } = require('./authHelpers');
const { resetSampleData } = require('./seedData');
const User = require('./models/userModel');
const Tool = require('./models/toolModel');
const Request = require('./models/requestModel');
const Favorite = require('./models/favoriteModel');
const Review = require('./models/reviewModel');
const Message = require('./models/messageModel');
const Notification = require('./models/notificationModel');
const Session = require('./models/sessionModel');

const app = express();
const port = process.env.PORT || 4000;
const apiRoutes = [];
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
const adminEmail = 'agrimjain056@gmail.com';
const chatStreams = new Map();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

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

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return '';
  return header.slice(7).trim();
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function createToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function createSession(user) {
  const token = createToken();
  await Session.create({
    userId: user._id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
  });
  return token;
}

async function getAuthenticatedUser(req) {
  const token = getBearerToken(req) || String(req.query?.token || '');
  if (!token) return null;

  const session = await Session.findOne({ tokenHash: hashToken(token) });
  if (!session) return null;

  const user = await User.findById(session.userId);
  if (!user) return null;

  return { user, token, session };
}

function isAdmin(auth) {
  return auth?.user?.role === 'admin';
}

function ownsTool(auth, tool) {
  return Boolean(
    auth && tool &&
    (isAdmin(auth) ||
      (tool.ownerId && tool.ownerId.toString() === auth.user._id.toString()) ||
      tool.owner === auth.user.name)
  );
}

function isRequestParticipant(auth, request) {
  const tool = request?.toolId;
  return Boolean(
    auth && request &&
    (isAdmin(auth) ||
      (request.borrowerId && request.borrowerId.toString() === auth.user._id.toString()) ||
      request.borrower === auth.user.name ||
      ownsTool(auth, tool))
  );
}

function publishChatMessage(message) {
  const requestId = message.requestId.toString();
  const subscribers = chatStreams.get(requestId) || new Set();
  const payload = JSON.stringify(message.toObject ? message.toObject() : message);
  subscribers.forEach((response) => response.write(`event: message\ndata: ${payload}\n\n`));
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

// Basic API info
route('get', '/api', (req, res) => {
  res.json({
    name: 'ToolPool MERN API',
    message: '47 self-made APIs are ready',
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
    role: email === adminEmail ? 'admin' : 'customer'
  });

  const token = await createSession(user);
  res.status(201).json({ user: userResponse(user), token });
});

route('post', '/api/auth/login', async (req, res) => {
  const missing = missingFields(req.body, ['email', 'password']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });

  const user = await User.findOne({ email: req.body.email.toLowerCase().trim() });
  if (!user || !(await comparePassword(req.body.password, user.password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = await createSession(user);
  res.json({ user: userResponse(user), token });
});

route('get', '/api/auth/me', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated' });
  res.json(userResponse(auth.user));
});

route('post', '/api/auth/logout', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  if (auth) {
    await Session.deleteOne({ _id: auth.session._id });
  }
  res.json({ message: 'Logged out successfully' });
});

route('patch', '/api/auth/password/:id', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated' });
  if (auth.user.role !== 'admin' && auth.user._id.toString() !== req.params.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

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
  const auth = await getAuthenticatedUser(req);
  if (!auth || !isAdmin(auth)) return res.status(403).json({ error: 'Admin access required' });
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});

route('get', '/api/users/admins', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth || !isAdmin(auth)) return res.status(403).json({ error: 'Admin access required' });
  res.json(await User.find({ role: 'admin' }).select('-password'));
});

route('get', '/api/users/customers', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth || !isAdmin(auth)) return res.status(403).json({ error: 'Admin access required' });
  res.json(await User.find({ role: 'customer' }).select('-password'));
});

route('get', '/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

route('post', '/api/users', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth || !isAdmin(auth)) return res.status(403).json({ error: 'Admin access required' });
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
  const auth = await getAuthenticatedUser(req);
  if (!auth || !isAdmin(auth)) return res.status(403).json({ error: 'Admin access required' });
  const update = { name: req.body.name, email: req.body.email, role: req.body.role };
  Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

route('delete', '/api/users/:id', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth || !isAdmin(auth)) return res.status(403).json({ error: 'Admin access required' });
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'User deleted' });
});

// Tool APIs
route('get', '/api/tools', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  const filter = toolFilter(req.query);

  // Customers browse the community marketplace, so their own listings never
  // appear there. The workshop uses ?mine=true to load only their listings.
  if (auth && !isAdmin(auth)) {
    const ownerCondition = req.query.mine === 'true' ? {
        $or: [
        { ownerId: auth.user._id },
        { ownerId: { $exists: false }, owner: auth.user.name }
        ]
      } : {
        $or: [
          { ownerId: { $exists: true, $ne: auth.user._id } },
          { ownerId: { $exists: false }, owner: { $ne: auth.user.name } }
        ]
      };
    filter.$and = [...(filter.$and || []), ownerCondition];
  }

  res.json(await Tool.find(filter).sort({ createdAt: -1 }));
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
  const auth = await getAuthenticatedUser(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated' });

  const missing = missingFields(req.body, ['name', 'category', 'location', 'description']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });

  const tool = await Tool.create({
    ...req.body,
    owner: auth.user.name,
    ownerId: auth.user._id,
    deposit: Number(req.body.deposit || 0),
    available: req.body.available !== false
  });

  res.status(201).json(tool);
});

route('patch', '/api/tools/:id', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated' });
  const existing = await Tool.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Tool not found' });
  if (!ownsTool(auth, existing)) return res.status(403).json({ error: 'Only the owner or an admin can edit this tool' });
  const update = { ...req.body };
  delete update.owner;
  delete update.ownerId;
  const tool = await Tool.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  res.json(tool);
});

route('delete', '/api/tools/:id', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated' });
  const existing = await Tool.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Tool not found' });
  if (!ownsTool(auth, existing)) return res.status(403).json({ error: 'Only the owner or an admin can delete this tool' });
  const tool = await Tool.findByIdAndDelete(req.params.id);
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  await Request.deleteMany({ toolId: req.params.id });
  await Favorite.deleteMany({ toolId: req.params.id });
  await Review.deleteMany({ toolId: req.params.id });
  res.json({ message: 'Tool deleted' });
});

route('patch', '/api/tools/:id/availability', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated' });
  const existing = await Tool.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Tool not found' });
  if (!ownsTool(auth, existing)) return res.status(403).json({ error: 'Only the owner or an admin can change availability' });
  const tool = await Tool.findByIdAndUpdate(req.params.id, { available: Boolean(req.body.available) }, { new: true });
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  res.json(tool);
});

// Borrow request APIs
route('get', '/api/requests', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated' });
  const filter = req.query.status ? { status: req.query.status } : {};
  if (!isAdmin(auth)) {
    const ownTools = await Tool.find({ $or: [{ ownerId: auth.user._id }, { ownerId: { $exists: false }, owner: auth.user.name }] }).select('_id');
    filter.$or = [{ borrowerId: auth.user._id }, { borrower: auth.user.name }, { toolId: { $in: ownTools.map((tool) => tool._id) } }];
  }
  res.json(await Request.find(filter).populate('toolId').sort({ createdAt: -1 }));
});

route('get', '/api/requests/pending', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated' });
  const filter = { status: 'pending' };
  if (!isAdmin(auth)) {
    const ownTools = await Tool.find({ $or: [{ ownerId: auth.user._id }, { ownerId: { $exists: false }, owner: auth.user.name }] }).select('_id');
    filter.toolId = { $in: ownTools.map((tool) => tool._id) };
  }
  res.json(await Request.find(filter).populate('toolId').sort({ createdAt: -1 }));
});
route('get', '/api/requests/mine/:borrower', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated' });
  if (!isAdmin(auth) && req.params.borrower !== auth.user.name) return res.status(403).json({ error: 'Forbidden' });
  res.json(await Request.find({ $or: [{ borrowerId: auth.user._id }, { borrower: new RegExp(req.params.borrower, 'i') }] }).populate('toolId'));
});

route('get', '/api/requests/:id', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated' });
  const request = await Request.findById(req.params.id).populate('toolId');
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (!isRequestParticipant(auth, request)) return res.status(403).json({ error: 'Forbidden' });
  res.json(request);
});

route('post', '/api/requests', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated' });

  const missing = missingFields(req.body, ['toolId', 'message']);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });

  const tool = await Tool.findById(req.body.toolId);
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  if (tool.ownerId && tool.ownerId.toString() === auth.user._id.toString()) {
    return res.status(400).json({ error: 'You cannot request your own tool' });
  }
  if (!tool.available) return res.status(400).json({ error: 'Tool is not available' });

  const existingRequest = await Request.findOne({
    toolId: tool._id,
    $or: [{ borrowerId: auth.user._id }, { borrower: auth.user.name }],
    status: { $in: ['pending', 'approved'] }
  });
  if (existingRequest) return res.status(400).json({ error: 'You already have an active request for this tool' });

  const request = await Request.create({
    toolId: tool._id,
    borrower: auth.user.name,
    borrowerId: auth.user._id,
    message: req.body.message,
    fromDate: req.body.fromDate || '',
    toDate: req.body.toDate || '',
    deposit: Number(req.body.deposit ?? tool.deposit),
    status: 'pending'
  });

  await Notification.create({
    userName: tool.owner,
    title: 'New borrow request',
    text: `${auth.user.name} wants to borrow ${tool.name}`
  });

  res.status(201).json(request);
});

route('patch', '/api/requests/:id/status', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated' });
  const existing = await Request.findById(req.params.id).populate('toolId');
  if (!existing) return res.status(404).json({ error: 'Request not found' });
  if (!isRequestParticipant(auth, existing)) return res.status(403).json({ error: 'Forbidden' });
  const request = await Request.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).populate('toolId');
  res.json(request);
});

route('patch', '/api/requests/:id/approve', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated' });
  const existing = await Request.findById(req.params.id).populate('toolId');
  if (!existing) return res.status(404).json({ error: 'Request not found' });
  if (!ownsTool(auth, existing.toolId)) return res.status(403).json({ error: 'Only the tool owner can approve a request' });
  if (existing.status !== 'pending') return res.status(400).json({ error: 'Only pending requests can be approved' });
  const request = await Request.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true }).populate('toolId');
  if (request.toolId) await Tool.findByIdAndUpdate(request.toolId._id, { available: false });
  await Notification.create({ userName: request.borrower, title: 'Request approved', text: `Your request for ${request.toolId?.name || 'the tool'} was approved. Chat is now open.` });
  res.json(request);
});

route('patch', '/api/requests/:id/reject', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated' });
  const existing = await Request.findById(req.params.id).populate('toolId');
  if (!existing) return res.status(404).json({ error: 'Request not found' });
  if (!ownsTool(auth, existing.toolId)) return res.status(403).json({ error: 'Only the tool owner can reject a request' });
  const request = await Request.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
  await Notification.create({ userName: request.borrower, title: 'Request declined', text: `Your request for ${existing.toolId?.name || 'the tool'} was declined.` });
  res.json(request);
});

route('patch', '/api/requests/:id/return', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated' });
  const existing = await Request.findById(req.params.id).populate('toolId');
  if (!existing) return res.status(404).json({ error: 'Request not found' });
  if (!ownsTool(auth, existing.toolId)) return res.status(403).json({ error: 'Only the tool owner can mark a tool returned' });
  const request = await Request.findByIdAndUpdate(req.params.id, { status: 'returned' }, { new: true }).populate('toolId');
  if (request.toolId) await Tool.findByIdAndUpdate(request.toolId._id, { available: true });
  res.json(request);
});

route('delete', '/api/requests/:id', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated' });
  const existing = await Request.findById(req.params.id).populate('toolId');
  if (!existing) return res.status(404).json({ error: 'Request not found' });
  if (!isRequestParticipant(auth, existing)) return res.status(403).json({ error: 'Forbidden' });
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
apiRoutes.push('GET /api/messages/request/:requestId/stream');
app.get('/api/messages/request/:requestId/stream', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) return res.status(401).end();
    const request = await Request.findById(req.params.requestId).populate('toolId');
    if (!request || request.status !== 'approved' || !isRequestParticipant(auth, request)) return res.status(403).end();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    res.write('event: ready\ndata: {"connected":true}\n\n');

    const subscribers = chatStreams.get(req.params.requestId) || new Set();
    subscribers.add(res);
    chatStreams.set(req.params.requestId, subscribers);
    const keepAlive = setInterval(() => res.write(': keep-alive\n\n'), 15000);

    req.on('close', () => {
      clearInterval(keepAlive);
      subscribers.delete(res);
      if (!subscribers.size) chatStreams.delete(req.params.requestId);
    });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.status(500).end();
  }
});

route('get', '/api/messages/inbox/:userName', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated' });
  if (!isAdmin(auth) && req.params.userName !== auth.user.name) return res.status(403).json({ error: 'Forbidden' });
  res.json(await Message.find({ receiver: req.params.userName }).sort({ createdAt: -1 }));
});

route('get', '/api/messages/request/:requestId', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated' });

  const request = await Request.findById(req.params.requestId).populate('toolId');
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (request.status !== 'approved') return res.status(403).json({ error: 'Chat opens after the owner approves the request' });
  if (!isRequestParticipant(auth, request)) return res.status(403).json({ error: 'Forbidden' });

  res.json(await Message.find({ requestId: req.params.requestId }).sort({ createdAt: 1 }));
});

route('post', '/api/messages', async (req, res) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated' });

  if (req.body.requestId) {
    const missing = missingFields(req.body, ['requestId', 'text']);
    if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });

    const request = await Request.findById(req.body.requestId).populate('toolId');
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'approved') return res.status(403).json({ error: 'Chat opens after the owner approves the request' });
    if (!isRequestParticipant(auth, request)) return res.status(403).json({ error: 'Forbidden' });

    const isBorrower = (request.borrowerId && request.borrowerId.toString() === auth.user._id.toString()) || request.borrower === auth.user.name;
    const receiver = isBorrower ? request.toolId?.owner : request.borrower;
    const message = await Message.create({
        requestId: req.body.requestId,
        sender: auth.user.name,
        receiver,
        text: req.body.text,
        read: false
      });
    publishChatMessage(message);
    return res.status(201).json(message);
  }

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
  const auth = await getAuthenticatedUser(req);
  if (!auth || !isAdmin(auth)) return res.status(403).json({ error: 'Admin access required' });
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
  const auth = await getAuthenticatedUser(req);
  if (!auth || !isAdmin(auth)) return res.status(403).json({ error: 'Admin access required' });
  await resetSampleData();
  res.json({ message: 'Sample data reset successfully' });
});

if (apiRoutes.length !== 48) {
  throw new Error(`API route count should be 48, currently ${apiRoutes.length}`);
}

app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

async function startServer() {
  await connectDatabase();
  await User.updateOne({ email: adminEmail }, { $set: { role: 'admin' } });
  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
    console.log(`${apiRoutes.length} API routes ready`);
  });
}

startServer();
