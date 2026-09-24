const Department = require('../models/Department');
const FieldWorker = require('../models/FieldWorker');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('head', 'name email phone')
      .sort('name');

    res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get workers belonging to a department
// @route   GET /api/departments/:id/workers
// @access  Private
exports.getDepartmentWorkers = async (req, res, next) => {
  try {
    const workers = await FieldWorker.find({ department: req.params.id })
      .populate('user', 'name email phone avatar isActive')
      .populate('department', 'name code');

    res.status(200).json({
      success: true,
      count: workers.length,
      workers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private (System Admin)
exports.createDepartment = async (req, res, next) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json({
      success: true,
      department,
    });
  } catch (error) {
    next(error);
  }
};
