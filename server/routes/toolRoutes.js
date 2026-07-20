// Tool routes — browse, create, update, delete tools and manage availability

const router = require('express').Router();
const Tool = require('../models/toolModel');
const Request = require('../models/requestModel');
const Favorite = require('../models/favoriteModel');
const Review = require('../models/reviewModel');
const {
  missingFields,
  getAuthenticatedUser,
  isAdmin,
  ownsTool,
  toolFilter
} = require('../middleware/auth');

// GET / — list tools with optional filters
router.get('/', async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// GET /featured — 6 cheapest available tools
router.get('/featured', async (req, res) => {
  try {
    res.json(await Tool.find({ available: true }).sort({ deposit: 1 }).limit(6));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// GET /categories — list distinct tool categories
router.get('/categories', async (req, res) => {
  try {
    res.json((await Tool.distinct('category')).sort());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// GET /available — all available tools sorted by name
router.get('/available', async (req, res) => {
  try {
    res.json(await Tool.find({ available: true }).sort({ name: 1 }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// GET /owner/:owner — tools by owner name
router.get('/owner/:owner', async (req, res) => {
  try {
    res.json(await Tool.find({ owner: new RegExp(req.params.owner, 'i') }).sort({ createdAt: -1 }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// GET /:id — single tool by ID
router.get('/:id', async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);
    if (!tool) return res.status(404).json({ error: 'Tool not found' });
    res.json(tool);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST / — create a new tool listing
router.post('/', async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// PATCH /:id — update a tool (owner or admin only)
router.patch('/:id', async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// DELETE /:id — delete a tool and related data (owner or admin only)
router.delete('/:id', async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// PATCH /:id/availability — toggle tool availability (owner or admin only)
router.patch('/:id/availability', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) return res.status(401).json({ error: 'Not authenticated' });
    const existing = await Tool.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Tool not found' });
    if (!ownsTool(auth, existing)) return res.status(403).json({ error: 'Only the owner or an admin can change availability' });
    const tool = await Tool.findByIdAndUpdate(req.params.id, { available: Boolean(req.body.available) }, { new: true });
    if (!tool) return res.status(404).json({ error: 'Tool not found' });
    res.json(tool);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
