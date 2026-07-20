// Request routes — borrow requests lifecycle (create, approve, reject, return, etc.)

const router = require('express').Router();
const Tool = require('../models/toolModel');
const Request = require('../models/requestModel');
const Notification = require('../models/notificationModel');
const {
  missingFields,
  getAuthenticatedUser,
  isAdmin,
  ownsTool,
  isRequestParticipant
} = require('../middleware/auth');

// GET / — list requests (filtered by status, scoped to participant)
router.get('/', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) return res.status(401).json({ error: 'Not authenticated' });
    const filter = req.query.status ? { status: req.query.status } : {};
    if (!isAdmin(auth)) {
      const ownTools = await Tool.find({ $or: [{ ownerId: auth.user._id }, { ownerId: { $exists: false }, owner: auth.user.name }] }).select('_id');
      filter.$or = [{ borrowerId: auth.user._id }, { borrower: auth.user.name }, { toolId: { $in: ownTools.map((tool) => tool._id) } }];
    }
    res.json(await Request.find(filter).populate('toolId').sort({ createdAt: -1 }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// GET /pending — list pending requests for tools you own
router.get('/pending', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) return res.status(401).json({ error: 'Not authenticated' });
    const filter = { status: 'pending' };
    if (!isAdmin(auth)) {
      const ownTools = await Tool.find({ $or: [{ ownerId: auth.user._id }, { ownerId: { $exists: false }, owner: auth.user.name }] }).select('_id');
      filter.toolId = { $in: ownTools.map((tool) => tool._id) };
    }
    res.json(await Request.find(filter).populate('toolId').sort({ createdAt: -1 }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// GET /mine/:borrower — list requests made by a specific borrower
router.get('/mine/:borrower', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) return res.status(401).json({ error: 'Not authenticated' });
    if (!isAdmin(auth) && req.params.borrower !== auth.user.name) return res.status(403).json({ error: 'Forbidden' });
    res.json(await Request.find({ $or: [{ borrowerId: auth.user._id }, { borrower: new RegExp(req.params.borrower, 'i') }] }).populate('toolId'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// GET /:id — get a single request by ID
router.get('/:id', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) return res.status(401).json({ error: 'Not authenticated' });
    const request = await Request.findById(req.params.id).populate('toolId');
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (!isRequestParticipant(auth, request)) return res.status(403).json({ error: 'Forbidden' });
    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST / — create a new borrow request
router.post('/', async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// PATCH /:id/status — generic status update
router.patch('/:id/status', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) return res.status(401).json({ error: 'Not authenticated' });
    const existing = await Request.findById(req.params.id).populate('toolId');
    if (!existing) return res.status(404).json({ error: 'Request not found' });
    if (!isRequestParticipant(auth, existing)) return res.status(403).json({ error: 'Forbidden' });
    const request = await Request.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).populate('toolId');
    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// PATCH /:id/approve — approve a pending request (owner only)
router.patch('/:id/approve', async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// PATCH /:id/reject — reject a request (owner only)
router.patch('/:id/reject', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) return res.status(401).json({ error: 'Not authenticated' });
    const existing = await Request.findById(req.params.id).populate('toolId');
    if (!existing) return res.status(404).json({ error: 'Request not found' });
    if (!ownsTool(auth, existing.toolId)) return res.status(403).json({ error: 'Only the tool owner can reject a request' });
    const request = await Request.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    await Notification.create({ userName: request.borrower, title: 'Request declined', text: `Your request for ${existing.toolId?.name || 'the tool'} was declined.` });
    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// PATCH /:id/return — mark tool as returned (owner only)
router.patch('/:id/return', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) return res.status(401).json({ error: 'Not authenticated' });
    const existing = await Request.findById(req.params.id).populate('toolId');
    if (!existing) return res.status(404).json({ error: 'Request not found' });
    if (!ownsTool(auth, existing.toolId)) return res.status(403).json({ error: 'Only the tool owner can mark a tool returned' });
    const request = await Request.findByIdAndUpdate(req.params.id, { status: 'returned' }, { new: true }).populate('toolId');
    if (request.toolId) await Tool.findByIdAndUpdate(request.toolId._id, { available: true });
    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// DELETE /:id — delete a request
router.delete('/:id', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) return res.status(401).json({ error: 'Not authenticated' });
    const existing = await Request.findById(req.params.id).populate('toolId');
    if (!existing) return res.status(404).json({ error: 'Request not found' });
    if (!isRequestParticipant(auth, existing)) return res.status(403).json({ error: 'Forbidden' });
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json({ message: 'Request deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
