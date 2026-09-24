const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartmentWorkers,
  createDepartment,
} = require('../controllers/departmentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', getDepartments);
router.get('/:id/workers', protect, getDepartmentWorkers);
router.post('/', protect, authorize('system_admin'), createDepartment);

module.exports = router;
