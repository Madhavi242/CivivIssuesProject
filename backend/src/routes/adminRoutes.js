const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAnalytics,
  getUsers,
  getAuditLogs,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.get('/dashboard', authorize('department_admin', 'system_admin'), getDashboardStats);
router.get('/analytics', authorize('department_admin', 'system_admin'), getAnalytics);
router.get('/users', authorize('system_admin'), getUsers);
router.get('/audit-logs', authorize('system_admin'), getAuditLogs);

module.exports = router;
