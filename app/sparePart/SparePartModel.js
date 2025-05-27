const mongoose = require("mongoose");

const sparePartSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    images: [{
      path: {
        type : String
      }
    }],
    price: {
      type: mongoose.Types.Decimal128,
      required: true,
      min: [0, 'Price must be zero or positive']
    },
    discount: {
      type: mongoose.Types.Decimal128,
      default: mongoose.Types.Decimal128.fromString("0"),
      min: [0, 'discount must be zero or positive']
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity must be Zero or positive']
    },
    weight: {
      type: mongoose.Types.Decimal128,
      min: [0, 'Weigth must be positive']
    },
    dimension: {
      type : String
    },
    color: {
      type : String
    },
    brand: {
      type: String,
      required: true
    },
    gadgetType: {
      type: String,
      enum: ['MobileDevices', 'ComputingDevices', 'HomeAppliances', 'Entertainment&MediaDevices', 'Wearable&SmartDevices', 'GamingConsoles'],
      required: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    warrentyPeriod: {
      type: Number,
      min: [0, 'Warrenty must be zero or positive']
    },
    isDeleted: { 
      type: Boolean, 
      default: false, 
      required: true 
    }
  },
  { timestamps: true}
);

module.exports = mongoose.model("SparePart", sparePartSchema);