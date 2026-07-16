const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
    sender: { type: String, required: true, trim: true },
    receiver: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
