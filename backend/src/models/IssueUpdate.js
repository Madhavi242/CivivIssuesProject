const mongoose = require('mongoose');

const issueUpdateSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
      index: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    previousStatus: {
      type: String,
      default: null,
    },
    newStatus: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'REPORTED',
        'STATUS_CHANGE',
        'ASSIGNED',
        'REASSIGNED',
        'ACCEPTED',
        'IN_PROGRESS',
        'WORK_NOTE',
        'RESOLVED',
        'CITIZEN_VERIFIED',
        'CITIZEN_REOPENED',
        'CLOSED',
        'SUPPORTED',
      ],
      default: 'STATUS_CHANGE',
    },
    comment: {
      type: String,
      trim: true,
      default: '',
    },
    evidence: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IssueEvidence',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

issueUpdateSchema.index({ issue: 1, createdAt: 1 });

module.exports = mongoose.model('IssueUpdate', issueUpdateSchema);
