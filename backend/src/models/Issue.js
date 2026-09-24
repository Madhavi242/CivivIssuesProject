const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an issue title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed issue description'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please specify issue category'],
      enum: [
        'Road damage',
        'Garbage',
        'Water leakage',
        'Drain blockage',
        'Broken streetlight',
        'Damaged public infrastructure',
        'Traffic-related issue',
        'Other',
      ],
      index: true,
    },
    categoryConfidence: {
      type: Number,
      default: 0.9,
      min: 0,
      max: 1,
    },
    classificationSource: {
      type: String,
      enum: ['ai_suggested', 'user_selected', 'manual_override'],
      default: 'user_selected',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Please provide GPS coordinates [longitude, latitude]'],
      },
    },
    address: {
      type: String,
      trim: true,
      default: 'Location captured via GPS',
    },
    zone: {
      type: String,
      trim: true,
      default: 'Central Zone',
      index: true,
    },
    priorityScore: {
      type: Number,
      default: 20,
      min: 0,
      max: 100,
      index: true,
    },
    priorityLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low',
      index: true,
    },
    priorityFactors: {
      safetyRisk: { type: Number, default: 2 },
      supportingReports: { type: Number, default: 1 },
      severity: { type: Number, default: 2 },
      locationImportance: { type: Number, default: 2 },
      durationHours: { type: Number, default: 0 },
      evidenceConfidence: { type: Number, default: 0.8 },
    },
    status: {
      type: String,
      enum: [
        'Reported',
        'Under Review',
        'Verified',
        'Assigned',
        'Accepted',
        'In Progress',
        'Resolved',
        'Citizen Verification',
        'Closed',
        'Reopened',
      ],
      default: 'Reported',
      index: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    supportingUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    supportCount: {
      type: Number,
      default: 1,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      index: true,
      default: null,
    },
    assignedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FieldWorker',
      index: true,
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    verification: {
      status: {
        type: String,
        enum: ['pending', 'verified_resolved', 'disputed_unresolved', 'partially_resolved'],
        default: 'pending',
      },
      verifiedAt: { type: Date, default: null },
      citizenNotes: { type: String, default: '' },
      reopenReason: { type: String, default: '' },
    },
    cluster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IssueCluster',
      default: null,
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      default: null,
    },
    duplicateScore: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
issueSchema.index({ location: '2dsphere' });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ status: 1, priorityLevel: 1 });
issueSchema.index({ category: 1, zone: 1 });

// Virtual for evidence
issueSchema.virtual('evidence', {
  ref: 'IssueEvidence',
  localField: '_id',
  foreignField: 'issue',
});

// Virtual for updates timeline
issueSchema.virtual('updates', {
  ref: 'IssueUpdate',
  localField: '_id',
  foreignField: 'issue',
});

module.exports = mongoose.model('Issue', issueSchema);
