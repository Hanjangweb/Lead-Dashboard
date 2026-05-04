const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  mobile: { 
    type: String, 
    required: [true, 'Mobile number is required'],
    match: [/^[+0-9\s\-]{10,20}$/, 'Please enter a valid mobile number']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  city: { 
    type: String, 
    required: [true, 'City is required'],
    trim: true
  },
  service: { 
    type: String, 
    required: [true, 'Service is required'],
    trim: true
  },
  budget: { 
    type: Number, 
    required: [true, 'Budget is required'],
    min: [0, 'Budget cannot be negative']
  },
  status: { 
    type: String, 
    enum: {
      values: ['New', 'Interested', 'Converted', 'Rejected'],
      message: '{VALUE} is not a valid status'
    }, 
    default: 'New' 
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);