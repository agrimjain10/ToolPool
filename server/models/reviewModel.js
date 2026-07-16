const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    toolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tool', required: true },
    reviewer: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
