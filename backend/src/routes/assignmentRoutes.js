const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  assignWorker,
  getMyAssignments,
} = require('../controllers/assignmentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.get('/recommend/:issueId', authorize('department_admin', 'system_admin'), getRecommendations);
router.post('/', authorize('department_admin', 'system_admin'), assignWorker);
router.get('/', getMyAssignments);

module.exports = router;
