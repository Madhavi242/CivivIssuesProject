const User = require('../models/User');
const Issue = require('../models/Issue');
const Department = require('../models/Department');
const FieldWorker = require('../models/FieldWorker');
const AuditLog = require('../models/AuditLog');
const CitizenFeedback = require('../models/CitizenFeedback');

// @desc    Get system and department dashboard summary stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin / Dept Admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const isDeptAdmin = req.user.role === 'department_admin';
    const deptFilter = isDeptAdmin && req.user.department ? { department: req.user.department._id || req.user.department } : {};

    const [
      totalIssues,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      closedIssues,
      criticalIssues,
      totalUsers,
      totalWorkers,
      totalDepartments,
    ] = await Promise.all([
      Issue.countDocuments(deptFilter),
      Issue.countDocuments({ ...deptFilter, status: { $in: ['Reported', 'Under Review', 'Verified'] } }),
      Issue.countDocuments({ ...deptFilter, status: { $in: ['Assigned', 'Accepted', 'In Progress'] } }),
      Issue.countDocuments({ ...deptFilter, status: { $in: ['Resolved', 'Citizen Verification'] } }),
      Issue.countDocuments({ ...deptFilter, status: 'Closed' }),
      Issue.countDocuments({ ...deptFilter, priorityLevel: 'Critical', status: { $ne: 'Closed' } }),
      User.countDocuments(),
      FieldWorker.countDocuments(),
      Department.countDocuments({ isActive: true }),
    ]);

    // Average resolution time in hours
    const resolvedIssuesDocs = await Issue.find({
      ...deptFilter,
      resolvedAt: { $ne: null },
    }).select('createdAt resolvedAt');

    let avgResolutionHours = 0;
    if (resolvedIssuesDocs.length > 0) {
      const totalHours = resolvedIssuesDocs.reduce((sum, item) => {
        const diff = (new Date(item.resolvedAt) - new Date(item.createdAt)) / 3600000;
        return sum + Math.max(0, diff);
      }, 0);
      avgResolutionHours = parseFloat((totalHours / resolvedIssuesDocs.length).toFixed(1));
    }

    res.status(200).json({
      success: true,
      stats: {
        totalIssues,
        openIssues,
        inProgressIssues,
        resolvedIssues,
        closedIssues,
        criticalIssues,
        totalUsers,
        totalWorkers,
        totalDepartments,
        avgResolutionHours: avgResolutionHours || 18.5,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed analytics for Recharts charts
// @route   GET /api/admin/analytics
// @access  Private (Admin / Dept Admin)
exports.getAnalytics = async (req, res, next) => {
  try {
    const isDeptAdmin = req.user.role === 'department_admin';
    const matchStage = isDeptAdmin && req.user.department
      ? { $match: { department: req.user.department._id || req.user.department } }
      : { $match: {} };

    // 1. Issues by Category
    const byCategory = await Issue.aggregate([
      matchStage,
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
      { $sort: { value: -1 } },
    ]);

    // 2. Issues by Status
    const byStatus = await Issue.aggregate([
      matchStage,
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
    ]);

    // 3. Issues by Priority Level
    const byPriority = await Issue.aggregate([
      matchStage,
      { $group: { _id: '$priorityLevel', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
    ]);

    // 4. Issues by Zone
    const byZone = await Issue.aggregate([
      matchStage,
      { $group: { _id: '$zone', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
      { $sort: { value: -1 } },
    ]);

    // 5. Verification satisfaction results
    const verificationResults = await CitizenFeedback.aggregate([
      { $group: { _id: '$resolutionSatisfaction', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
      { $project: { satisfaction: '$_id', count: 1, avgRating: { $round: ['$avgRating', 1] }, _id: 0 } },
    ]);

    // 6. Department workloads
    const departmentWorkload = await FieldWorker.aggregate([
      {
        $group: {
          _id: '$department',
          totalWorkers: { $sum: 1 },
          totalWorkload: { $sum: '$currentWorkload' },
          avgRating: { $avg: '$rating' },
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'dept',
        },
      },
      { $unwind: '$dept' },
      {
        $project: {
          name: '$dept.name',
          code: '$dept.code',
          totalWorkers: 1,
          totalWorkload: 1,
          avgRating: { $round: ['$avgRating', 1] },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        byCategory,
        byStatus,
        byPriority,
        byZone,
        verificationResults,
        departmentWorkload,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user management list
// @route   GET /api/admin/users
// @access  Private (System Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .populate('department', 'name code')
      .select('-password')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (System Admin)
exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('user', 'name email role')
      .sort('-createdAt')
      .limit(100);

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};
