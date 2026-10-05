const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    // Authentication & Core Identity
    name: {
      type: String,
      required: [true, 'Please provide a name'],
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

    // Profile Details
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

    // Hyperlocal Location Format (GeoJSON)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },

      coordinates: {
        type: [Number],
        default: [0, 0], // [longitude, latitude]
      },
    },

    // Saved Shipping Addresses
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

// Pre-save hook to hash password before saving to DB
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

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