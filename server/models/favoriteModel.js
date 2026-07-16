const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true, trim: true },
    toolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tool', required: true }
  },
  { timestamps: true }
);

favoriteSchema.index({ userName: 1, toolId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
