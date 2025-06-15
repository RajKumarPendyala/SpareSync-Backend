const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { 
    type: String
  },
  image: {
    path: {
      type : String
    }        
  },
  email: { 
    type: String, 
    unique: true, 
    required: true, 
    lowercase: true, 
    validate: {
      validator: (v) => /^\S+@\S+\.\S+$/.test(v), // Email format validation
      message: props => `${props.value} is not a valid email!`
    }
  },
  phoneNumber: { 
    type: Number, 
    validate: {
      validator: (v) => /^[0-9]{10}$/.test(v), // Simple numeric validation
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  passwordHash: { 
    type: String
  },
  role: { 
    type : String,
    enum: ['admin', 'seller', 'buyer'] 
  },
  address: {
    houseNo: { type: String },
    street: { type: String },
    postalCode: {
      type: String,
      validate: {
        validator: (v) => /^[0-9]{4,10}$/.test(v),
        message: (props) => `${props.value} is not a valid numeric postal code!`
      }
    },
    city: { type: String },
    state: { type: String }
  },
  isDeleted: {
    type: Boolean, 
    default: false, 
    required: true 
  },
  isVerified: { 
    type: Boolean, 
    default: false, 
    required: true
  },
  token: {
    type : Number
  },
  resetTokenExpires: { 
    type : Date
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);