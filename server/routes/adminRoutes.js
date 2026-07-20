// Admin routes — dashboard stats and sample data reset (admin only)

const router = require('express').Router();
const User = require('../models/userModel');
const Tool = require('../models/toolModel');
const Request = require('../models/requestModel');
const Review = require('../models/reviewModel');
const { resetSampleData } = require('../seedData');
const { getAuthenticatedUser, isAdmin } = require('../middleware/auth');

// GET /stats — aggregate counts for the admin dashboard
router.get('/stats', async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST /reset-sample — reset the database with sample data
router.post('/reset-sample', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth || !isAdmin(auth)) return res.status(403).json({ error: 'Admin access required' });
    await resetSampleData();
    res.json({ message: 'Sample data reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
