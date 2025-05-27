const mongoose = require('mongoose');

const financialReportSchema = new mongoose.Schema({
  totalSales: {
    type: mongoose.Types.Decimal128,
    required: true,
    min: [0, 'Total sales must be zero or positive']
  },
  totalOrders: {
    type: Number,
    required: true,
    min: [0, 'Total orders must be zero or positive']
  },
  netProfit: {
    type: mongoose.Types.Decimal128,
    required: true,
    min: [0, 'Net profit must be zero or positive']
  },
  isDeleted: {
    type: Boolean,
    default: false,
    required: true
  }
}, {
  timestamps: { createdAt: 'generatedAt', updatedAt: 'updatedAt' }
});

module.exports = mongoose.model('FinancialReport', financialReportSchema);
