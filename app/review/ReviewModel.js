const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userName: { type: 'String', required: true},
  userImage: {
    path: {
      type : String
    }        
  },
  sparePartId: { type: mongoose.Schema.Types.ObjectId, ref: 'SparePart', required: true},
  images: [{
    path: {
      type : String
    }
  }],
  rating: {
    type : Number
  },
  comment: {
    type : String
  }
}, { timestamps: { createdAt: 'sentAt', updatedAt: 'updatedAt' } });

module.exports = mongoose.model('Review', reviewSchema);