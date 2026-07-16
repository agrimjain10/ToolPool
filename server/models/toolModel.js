const mongoose = require('mongoose');

const toolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    owner: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    distance: { type: String, default: '1 mi' },
    deposit: { type: Number, required: true, default: 0 },
    available: { type: Boolean, default: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, default: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&q=80' }
  },
  { timestamps: true }
);

const Tool = mongoose.model('Tool', toolSchema);

module.exports = Tool;
