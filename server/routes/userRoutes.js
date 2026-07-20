// User routes — admin-only CRUD for managing users

const router = require('express').Router();
const { hashPassword } = require('../authHelpers');
const User = require('../models/userModel');
const {
  missingFields,
  getAuthenticatedUser,
  isAdmin,
  userResponse
} = require('../middleware/auth');

// GET / — list all users (admin only)
router.get('/', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth || !isAdmin(auth)) return res.status(403).json({ error: 'Admin access required' });
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// GET /admins — list admin users only
router.get('/admins', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth || !isAdmin(auth)) return res.status(403).json({ error: 'Admin access required' });
    res.json(await User.find({ role: 'admin' }).select('-password'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// GET /customers — list customer users only
router.get('/customers', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth || !isAdmin(auth)) return res.status(403).json({ error: 'Admin access required' });
    res.json(await User.find({ role: 'customer' }).select('-password'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// GET /:id — get a single user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST / — create a new user (admin only)
router.post('/', async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// PATCH /:id — update a user (admin only)
router.patch('/:id', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth || !isAdmin(auth)) return res.status(403).json({ error: 'Admin access required' });
    const update = { name: req.body.name, email: req.body.email, role: req.body.role };
    Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// DELETE /:id — delete a user (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth || !isAdmin(auth)) return res.status(403).json({ error: 'Admin access required' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
