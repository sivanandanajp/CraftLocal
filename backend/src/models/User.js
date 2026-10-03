const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please provide a name'] 
  },
  email: { 
    type: String, 
    required: [true, 'Please provide an email'], 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: [true, 'Please provide a password'] 
  },
  role: { 
    type: String, 
    enum: ['buyer', 'seller'], 
    default: 'buyer' 
  },
  // Hyperlocal Location Format (GeoJSON)
  // Default coordinates [0, 0] prevent signup validation crashes 
  // when forms do not pass initial GPS data.
  location: {
    type: { 
      type: String, 
      enum: ['Point'], 
      default: 'Point' 
    },
    coordinates: { 
      type: [Number], 
      default: [0, 0] // [longitude, latitude]
    }
  }
}, { 
  timestamps: true 
});

// Pre-save hook to hash password before saving to DB
UserSchema.pre('save', async function () {
  // If the password hasn't been modified, skip hashing
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper method to compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Indexing for proximity/geospatial searches
UserSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);