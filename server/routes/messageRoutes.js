// Message routes — real-time chat (SSE stream), inbox, request messages, send

const router = require('express').Router();
const Message = require('../models/messageModel');
const Request = require('../models/requestModel');
const {
  missingFields,
  getAuthenticatedUser,
  isAdmin,
  isRequestParticipant
} = require('../middleware/auth');

// Map of requestId -> Set of SSE response objects
const chatStreams = new Map();

// Push a new message to all SSE subscribers for a request
function publishChatMessage(message) {
  const requestId = message.requestId.toString();
  const subscribers = chatStreams.get(requestId) || new Set();
  const payload = JSON.stringify(message.toObject ? message.toObject() : message);
  subscribers.forEach((response) => response.write(`event: message\ndata: ${payload}\n\n`));
}

// GET /request/:requestId/stream — SSE stream for real-time chat
router.get('/request/:requestId/stream', async (req, res) => {
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

// GET /inbox/:userName — list messages received by a user
router.get('/inbox/:userName', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) return res.status(401).json({ error: 'Not authenticated' });
    if (!isAdmin(auth) && req.params.userName !== auth.user.name) return res.status(403).json({ error: 'Forbidden' });
    res.json(await Message.find({ receiver: req.params.userName }).sort({ createdAt: -1 }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// GET /request/:requestId — list messages in a request chat
router.get('/request/:requestId', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) return res.status(401).json({ error: 'Not authenticated' });

    const request = await Request.findById(req.params.requestId).populate('toolId');
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'approved') return res.status(403).json({ error: 'Chat opens after the owner approves the request' });
    if (!isRequestParticipant(auth, request)) return res.status(403).json({ error: 'Forbidden' });

    res.json(await Message.find({ requestId: req.params.requestId }).sort({ createdAt: 1 }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST / — send a message (chat or direct)
router.post('/', async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
