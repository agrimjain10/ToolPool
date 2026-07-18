const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    toolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tool', required: true },
    borrower: { type: String, required: true, trim: true },
    borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    message: { type: String, required: true, trim: true },
    fromDate: { type: String, default: '' },
    toDate: { type: String, default: '' },
    deposit: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled', 'returned'], default: 'pending' }
  },
  { timestamps: true }
);

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;
