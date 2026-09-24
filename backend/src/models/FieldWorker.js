const mongoose = require('mongoose');

const fieldWorkerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
      index: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    assignedCategories: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['available', 'busy', 'on_leave', 'offline'],
      default: 'available',
      index: true,
    },
    currentWorkload: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.5946, 12.9716], // default city center coordinates
      },
      address: {
        type: String,
        default: '',
      },
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    totalCompleted: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

fieldWorkerSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('FieldWorker', fieldWorkerSchema);
