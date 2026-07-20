// Favorite routes — manage user's favorite tools

const router = require('express').Router();
const Favorite = require('../models/favoriteModel');
const { missingFields } = require('../middleware/auth');

// GET /:userName — list favorites for a user
router.get('/:userName', async (req, res) => {
  try {
    res.json(await Favorite.find({ userName: req.params.userName }).populate('toolId').sort({ createdAt: -1 }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST / — add a tool to favorites (upsert to avoid duplicates)
router.post('/', async (req, res) => {
  try {
    const missing = missingFields(req.body, ['userName', 'toolId']);
    if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });

    const favorite = await Favorite.findOneAndUpdate(
      { userName: req.body.userName, toolId: req.body.toolId },
      { userName: req.body.userName, toolId: req.body.toolId },
      { upsert: true, new: true }
    );

    res.status(201).json(favorite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// DELETE /:userName/:toolId — remove a favorite
router.delete('/:userName/:toolId', async (req, res) => {
  try {
    await Favorite.findOneAndDelete({ userName: req.params.userName, toolId: req.params.toolId });
    res.json({ message: 'Favorite removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
