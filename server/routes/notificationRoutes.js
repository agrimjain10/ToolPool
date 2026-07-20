// Notification routes — list and mark as read

const router = require('express').Router();
const Notification = require('../models/notificationModel');

// GET /:userName — list notifications for a user
router.get('/:userName', async (req, res) => {
  try {
    res.json(await Notification.find({ userName: req.params.userName }).sort({ createdAt: -1 }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// PATCH /:id/read — mark a notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
