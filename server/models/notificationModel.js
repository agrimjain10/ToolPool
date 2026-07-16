const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
