const mongoose = require('mongoose');

const issueEvidenceSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    evidenceType: {
      type: String,
      enum: ['initial_report', 'work_in_progress', 'resolution', 'verification'],
      default: 'initial_report',
      index: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'Evidence media URL is required'],
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    caption: {
      type: String,
      trim: true,
      default: '',
    },
    metadata: {
      fileName: String,
      fileSize: Number,
      mimeType: String,
      uploadedAt: { type: Date, default: Date.now },
    },
    aiAnalysis: {
      detectedCategory: String,
      confidence: Number,
      detectedObjects: [String],
      tags: [String],
      analyzedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('IssueEvidence', issueEvidenceSchema);
