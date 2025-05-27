const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      sparePartId: { type: mongoose.Schema.Types.ObjectId, ref: "SparePart", required: true},
      quantity: {
          type: Number,
          required: true,
          default: 1,
          min: [1, 'Total quantity must be one or positive']
      },
      subTotal:{
          type: mongoose.Types.Decimal128,
          required: true,
          min: [0, 'subTotal amount must be zero or positive']
      },
      subTotalDiscount:{
        type: mongoose.Types.Decimal128,
        min: [0, 'subTotal amount must be zero or positive']
      }
    }
  ],
  totalAmount: {
    type: mongoose.Types.Decimal128,
    min: [0, 'Total amount must be zero or positive'],
    required: true
  },
  discountAmount: {
    type: mongoose.Types.Decimal128,
    min: [0, 'Discount must be zero or positive']
  }
}, {timestamps: true});

module.exports = mongoose.model('Cart', cartSchema);