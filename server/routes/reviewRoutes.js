// Review routes — tool reviews (list, create, delete)

const router = require('express').Router();
const Review = require('../models/reviewModel');
const { missingFields } = require('../middleware/auth');

// GET /tool/:toolId — list reviews for a specific tool
router.get('/tool/:toolId', async (req, res) => {
  try {
    res.json(await Review.find({ toolId: req.params.toolId }).sort({ createdAt: -1 }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST / — create a new review
router.post('/', async (req, res) => {
  try {
    const missing = missingFields(req.body, ['toolId', 'reviewer', 'rating']);
    if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });
    res.status(201).json(await Review.create(req.body));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// DELETE /:id — delete a review
router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
