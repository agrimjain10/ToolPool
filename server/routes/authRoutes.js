// Auth routes — register, login, current user, logout, change password

const router = require('express').Router();
const { hashPassword, comparePassword } = require('../authHelpers');
const User = require('../models/userModel');
const Session = require('../models/sessionModel');
const {
  missingFields,
  createSession,
  getAuthenticatedUser,
  userResponse
} = require('../middleware/auth');

const adminEmail = 'agrimjain056@gmail.com';

// POST /register — create a new account
router.post('/register', async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST /login — authenticate with email and password
router.post('/login', async (req, res) => {
  try {
    const missing = missingFields(req.body, ['email', 'password']);
    if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });

    const user = await User.findOne({ email: req.body.email.toLowerCase().trim() });
    if (!user || !(await comparePassword(req.body.password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = await createSession(user);
    res.json({ user: userResponse(user), token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// GET /me — get the current authenticated user
router.get('/me', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) return res.status(401).json({ error: 'Not authenticated' });
    res.json(userResponse(auth.user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST /logout — destroy the current session
router.post('/logout', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (auth) {
      await Session.deleteOne({ _id: auth.session._id });
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// PATCH /password/:id — change password (own account or admin)
router.patch('/password/:id', async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
