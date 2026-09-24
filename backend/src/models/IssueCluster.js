const mongoose = require('mongoose');

const issueClusterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    zone: {
      type: String,
      default: 'Central Zone',
      index: true,
    },
    centerLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    radiusMeters: {
      type: Number,
      default: 500,
    },
    issues: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue',
      },
    ],
    issueCount: {
      type: Number,
      default: 1,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    statusSummary: {
      reported: { type: Number, default: 0 },
      inProgress: { type: Number, default: 0 },
      resolved: { type: Number, default: 0 },
      closed: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

issueClusterSchema.index({ centerLocation: '2dsphere' });

module.exports = mongoose.model('IssueCluster', issueClusterSchema);
