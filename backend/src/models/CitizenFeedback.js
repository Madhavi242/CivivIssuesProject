const mongoose = require('mongoose');

const citizenFeedbackSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
      index: true,
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feedbackText: {
      type: String,
      trim: true,
      default: '',
    },
    resolutionSatisfaction: {
      type: String,
      enum: ['completely_satisfied', 'somewhat_satisfied', 'neutral', 'unsatisfied'],
      default: 'completely_satisfied',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CitizenFeedback', citizenFeedbackSchema);
