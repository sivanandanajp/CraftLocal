
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    // Authentication and core identity
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, 'Please provide a password'],
    },

    role: {
      type: String,
      enum: ['buyer', 'seller', 'creator'],
      default: 'buyer',
    },

    // Profile details
    bio: {
      type: String,
      default: '',
    },

    avatar: {
      type: String,
      default: '',
    },

    phone: {
      type: String,
      default: '',
    },

    // Hyperlocal location: [longitude, latitude]
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    // Saved shipping addresses
    savedAddresses: [
      {
        street: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          required: true,
        },
        zipCode: {
          type: String,
          required: true,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with stored hash
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Geospatial index
UserSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);
