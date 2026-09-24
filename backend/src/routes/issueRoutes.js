const express = require('express');
const router = express.Router();
const {
  createIssue,
  getIssues,
  getNearbyIssues,
  getIssueById,
  supportIssue,
  updateIssueStatus,
  verifyResolution,
  uploadEvidence,
  getClusters,
  previewIssue,
} = require('../controllers/issueController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Specific paths must precede parameter routes /:id
router.get('/nearby', getNearbyIssues);
router.get('/clusters', getClusters);
router.post('/preview', protect, previewIssue);

router.route('/')
  .get(getIssues)
  .post(protect, upload.single('image'), createIssue);

router.route('/:id')
  .get(getIssueById);

router.post('/:id/support', protect, supportIssue);
router.put('/:id/status', protect, upload.single('evidence'), updateIssueStatus);
router.post('/:id/verify', protect, verifyResolution);
router.post('/:id/evidence', protect, upload.single('evidence'), uploadEvidence);

module.exports = router;
