const Issue = require('../models/Issue');
const FieldWorker = require('../models/FieldWorker');
const IssueUpdate = require('../models/IssueUpdate');
const { recommendWorkersForIssue } = require('../services/assignmentEngineService');
const { logAudit, sendNotification } = require('../services/auditService');
const { emitBroadcast, emitToUser } = require('../config/socket');

// @desc    Get intelligent worker recommendations for an issue
// @route   GET /api/assignments/recommend/:issueId
// @access  Private (Department Admin or System Admin)
exports.getRecommendations = async (req, res, next) => {
  try {
    const recommendations = await recommendWorkersForIssue(req.params.issueId);
    res.status(200).json({
      success: true,
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign field worker to an issue
// @route   POST /api/assignments
// @access  Private (Department Admin or System Admin)
exports.assignWorker = async (req, res, next) => {
  try {
    const { issueId, workerId, notes } = req.body;

    if (!issueId || !workerId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both issueId and workerId.',
      });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    const worker = await FieldWorker.findById(workerId).populate('user');
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Field worker not found',
      });
    }

    // Previous worker adjustment if reassigning
    if (issue.assignedWorker && issue.assignedWorker.toString() !== workerId) {
      await FieldWorker.findByIdAndUpdate(issue.assignedWorker, {
        $inc: { currentWorkload: -1 },
      });
    }

    // Update Issue
    const previousStatus = issue.status;
    issue.assignedWorker = worker._id;
    if (worker.department) {
      issue.department = worker.department;
    }
    issue.status = 'Assigned';
    issue.assignedAt = new Date();
    await issue.save();

    // Increment new worker's workload
    worker.currentWorkload = (worker.currentWorkload || 0) + 1;
    if (worker.currentWorkload >= 5) {
      worker.status = 'busy';
    }
    await worker.save();

    // Timeline entry
    await IssueUpdate.create({
      issue: issue._id,
      updatedBy: req.user._id,
      previousStatus,
      newStatus: 'Assigned',
      action: 'ASSIGNED',
      comment: `Assigned to field worker ${worker.user.name}. ${notes ? `Admin notes: ${notes}` : ''}`,
    });

    // Notify field worker
    await sendNotification({
      recipientId: worker.user._id,
      type: 'issue_assigned',
      title: 'New Issue Assignment',
      message: `You have been assigned to: "${issue.title}". Priority: ${issue.priorityLevel}.`,
      relatedIssueId: issue._id,
    });

    // Audit log
    await logAudit({
      userId: req.user._id,
      action: 'WORKER_ASSIGNED',
      targetType: 'Assignment',
      targetId: issue._id,
      details: { workerId: worker._id, workerName: worker.user.name },
      req,
    });

    emitBroadcast('issue_assigned', {
      issueId: issue._id,
      workerId: worker._id,
      workerName: worker.user.name,
      status: 'Assigned',
    });

    res.status(200).json({
      success: true,
      message: `Successfully assigned to ${worker.user.name}`,
      issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assignments for the current user/worker
// @route   GET /api/assignments
// @access  Private
exports.getMyAssignments = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    let query = {};

    if (userRole === 'field_worker') {
      const workerProfile = await FieldWorker.findOne({ user: req.user._id });
      if (!workerProfile) {
        return res.status(200).json({ success: true, count: 0, issues: [] });
      }
      query.assignedWorker = workerProfile._id;
    } else if (userRole === 'department_admin' && req.user.department) {
      query.department = req.user.department._id || req.user.department;
    }

    const issues = await Issue.find(query)
      .populate('reportedBy', 'name email phone avatar')
      .populate('department', 'name code')
      .populate({
        path: 'assignedWorker',
        populate: { path: 'user', select: 'name email phone avatar' },
      })
      .sort('-priorityScore');

    res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    next(error);
  }
};
