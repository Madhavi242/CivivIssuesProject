const Issue = require('../models/Issue');
const IssueEvidence = require('../models/IssueEvidence');
const IssueUpdate = require('../models/IssueUpdate');
const Department = require('../models/Department');
const FieldWorker = require('../models/FieldWorker');
const CitizenFeedback = require('../models/CitizenFeedback');
const IssueCluster = require('../models/IssueCluster');

const { classifyIssue } = require('../services/aiService');
const { detectDuplicates } = require('../services/duplicateDetectionService');
const { calculatePriority } = require('../services/priorityEngineService');
const { updateGeographicClusters } = require('../services/clusteringService');
const { logAudit, sendNotification } = require('../services/auditService');
const { emitBroadcast, emitToDepartment, emitToUser } = require('../config/socket');

// @desc    Report / Create new civic issue
// @route   POST /api/issues
// @access  Private (Citizen or Admin)
exports.createIssue = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category: inputCategory,
      latitude,
      longitude,
      address,
      zone,
      forceCreate = false,
      safetyRiskInput,
      severityInput,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required.',
      });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'GPS coordinates (latitude, longitude) are required for civic reporting.',
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GPS coordinates provided.',
      });
    }

    const coordinates = [lng, lat];

    // Multimodal AI Classification
    const aiResult = await classifyIssue({
      title,
      description,
      imagePath: req.file ? req.file.path : null,
    });

    const category = inputCategory && inputCategory !== 'auto'
      ? inputCategory
      : aiResult.category;

    const classificationSource = inputCategory && inputCategory !== 'auto'
      ? 'user_selected'
      : aiResult.classificationSource;

    // Duplicate Detection Check
    const duplicateCheck = await detectDuplicates({
      category,
      coordinates,
      title,
      description,
      radiusMeters: 300,
    });

    // If strong duplicate found and user hasn't explicitly confirmed to proceed
    if (duplicateCheck.isDuplicateLikely && !forceCreate) {
      return res.status(409).json({
        success: false,
        duplicateDetected: true,
        message: 'A similar civic issue has already been reported near this location.',
        existingIssue: duplicateCheck.topMatch,
        allMatches: duplicateCheck.matches,
        prompt: 'You can support the existing issue to raise its urgency, or confirm to submit anyway.',
      });
    }

    // Determine responsible department
    let department = await Department.findOne({
      categories: category,
      isActive: true,
    });

    if (!department) {
      department = await Department.findOne({ isActive: true });
    }

    // Priority Engine calculation
    const initialSafetyRisk = safetyRiskInput ? parseInt(safetyRiskInput) : aiResult.safetyRisk;
    const initialSeverity = severityInput ? parseInt(severityInput) : 4;
    const initialLocationImportance = 5;

    const priorityData = calculatePriority({
      safetyRisk: initialSafetyRisk,
      severity: initialSeverity,
      locationImportance: initialLocationImportance,
      supportingReports: 1,
      durationHours: 0,
      evidenceConfidence: req.file ? 0.9 : 0.6,
    });

    // Create the Issue
    const issue = await Issue.create({
      title,
      description,
      category,
      categoryConfidence: aiResult.confidence,
      classificationSource,
      location: {
        type: 'Point',
        coordinates,
      },
      address: address || 'Captured via GPS',
      zone: zone || 'Central Zone',
      priorityScore: priorityData.priorityScore,
      priorityLevel: priorityData.priorityLevel,
      priorityFactors: priorityData.priorityFactors,
      status: 'Reported',
      reportedBy: req.user._id,
      supportingUsers: [req.user._id],
      supportCount: 1,
      department: department ? department._id : null,
      tags: aiResult.tags,
    });

    // If image evidence was uploaded
    let evidenceDoc = null;
    if (req.file) {
      const fileUrl = `/uploads/${req.file.filename}`;
      evidenceDoc = await IssueEvidence.create({
        issue: issue._id,
        uploadedBy: req.user._id,
        evidenceType: 'initial_report',
        fileUrl,
        caption: 'Initial citizen photo evidence',
        metadata: {
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
        },
        aiAnalysis: {
          detectedCategory: aiResult.category,
          confidence: aiResult.confidence,
          detectedObjects: aiResult.detectedObjects,
          tags: aiResult.tags,
          analyzedAt: new Date(),
        },
      });
    }

    // Create initial timeline update
    await IssueUpdate.create({
      issue: issue._id,
      updatedBy: req.user._id,
      previousStatus: null,
      newStatus: 'Reported',
      action: 'REPORTED',
      comment: 'Citizen reported this civic issue.',
      evidence: evidenceDoc ? evidenceDoc._id : null,
    });

    // Audit log
    await logAudit({
      userId: req.user._id,
      action: 'ISSUE_REPORTED',
      targetType: 'Issue',
      targetId: issue._id,
      details: { category, priorityLevel: issue.priorityLevel, zone: issue.zone },
      req,
    });

    // Notifications via Socket.IO
    emitBroadcast('new_issue', {
      issueId: issue._id,
      title: issue.title,
      category: issue.category,
      priorityLevel: issue.priorityLevel,
      location: issue.location,
    });

    if (department) {
      emitToDepartment(department._id.toString(), 'dept_issue_alert', {
        issueId: issue._id,
        title: issue.title,
        priorityLevel: issue.priorityLevel,
      });
    }

    // Async cluster recalculation
    updateGeographicClusters().catch((err) =>
      console.error('Cluster update background err:', err)
    );

    const populatedIssue = await Issue.findById(issue._id)
      .populate('reportedBy', 'name email phone avatar')
      .populate('department', 'name code slaHours');

    res.status(201).json({
      success: true,
      message: 'Civic issue reported successfully.',
      issue: populatedIssue,
      evidence: evidenceDoc,
      aiAnalysis: aiResult,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all issues with filters, search, pagination
// @route   GET /api/issues
// @access  Public
exports.getIssues = async (req, res, next) => {
  try {
    const {
      category,
      status,
      priorityLevel,
      zone,
      department,
      reportedBy,
      assignedWorker,
      search,
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priorityLevel) filter.priorityLevel = priorityLevel;
    if (zone) filter.zone = zone;
    if (department) filter.department = department;
    if (reportedBy) filter.reportedBy = reportedBy;
    if (assignedWorker) filter.assignedWorker = assignedWorker;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Issue.countDocuments(filter);
    const issues = await Issue.find(filter)
      .populate('reportedBy', 'name email avatar')
      .populate('department', 'name code slaHours')
      .populate({
        path: 'assignedWorker',
        populate: { path: 'user', select: 'name email phone avatar' },
      })
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: issues.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      issues,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby civic issues using MongoDB 2dsphere geospatial search
// @route   GET /api/issues/nearby
// @access  Public
exports.getNearbyIssues = async (req, res, next) => {
  try {
    const { longitude, latitude, radius = 1000, category } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide longitude and latitude query parameters.',
      });
    }

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    const radiusMeters = parseInt(radius, 10);

    const geoQuery = {
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: radiusMeters,
        },
      },
    };

    if (category) {
      geoQuery.category = category;
    }

    let nearby = [];
    try {
      nearby = await Issue.find(geoQuery)
        .populate('reportedBy', 'name email')
        .populate('department', 'name code')
        .limit(50);
    } catch (geoErr) {
      // Fallback
      nearby = await Issue.find({}).limit(50);
    }

    res.status(200).json({
      success: true,
      count: nearby.length,
      center: { longitude: lng, latitude: lat },
      radiusMeters,
      issues: nearby,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get issue details with full timeline and evidence
// @route   GET /api/issues/:id
// @access  Public
exports.getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email phone avatar')
      .populate('department', 'name code slaHours contactPhone contactEmail')
      .populate({
        path: 'assignedWorker',
        populate: { path: 'user', select: 'name email phone avatar' },
      })
      .populate('cluster')
      .populate('duplicateOf', 'title status createdAt');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: `Issue not found with id ${req.params.id}`,
      });
    }

    // Fetch evidence media
    const evidence = await IssueEvidence.find({ issue: issue._id })
      .populate('uploadedBy', 'name role avatar')
      .sort('-createdAt');

    // Fetch update history / timeline
    const updates = await IssueUpdate.find({ issue: issue._id })
      .populate('updatedBy', 'name role avatar')
      .populate('evidence')
      .sort('createdAt');

    // Fetch citizen feedback if resolved/closed
    const feedback = await CitizenFeedback.findOne({ issue: issue._id })
      .populate('citizen', 'name avatar');

    res.status(200).json({
      success: true,
      issue,
      evidence,
      updates,
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Support an existing issue instead of creating a duplicate
// @route   POST /api/issues/:id/support
// @access  Private (Citizen)
exports.supportIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    const userId = req.user._id;

    // Check if user already supported
    const alreadySupported = issue.supportingUsers.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadySupported) {
      return res.status(400).json({
        success: false,
        message: 'You have already upvoted/supported this civic issue.',
      });
    }

    issue.supportingUsers.push(userId);
    issue.supportCount = issue.supportingUsers.length;

    // Recalculate priority with increased citizen support
    const updatedPriority = calculatePriority({
      safetyRisk: issue.priorityFactors.safetyRisk,
      severity: issue.priorityFactors.severity,
      locationImportance: issue.priorityFactors.locationImportance,
      supportingReports: issue.supportCount,
      durationHours: Math.round((Date.now() - new Date(issue.createdAt).getTime()) / 3600000),
      evidenceConfidence: issue.priorityFactors.evidenceConfidence,
    });

    issue.priorityScore = updatedPriority.priorityScore;
    issue.priorityLevel = updatedPriority.priorityLevel;
    issue.priorityFactors = updatedPriority.priorityFactors;

    await issue.save();

    // Log update
    await IssueUpdate.create({
      issue: issue._id,
      updatedBy: userId,
      previousStatus: issue.status,
      newStatus: issue.status,
      action: 'SUPPORTED',
      comment: `${req.user.name} supported this issue (Total supporters: ${issue.supportCount})`,
    });

    emitBroadcast('issue_supported', {
      issueId: issue._id,
      supportCount: issue.supportCount,
      priorityLevel: issue.priorityLevel,
    });

    res.status(200).json({
      success: true,
      message: 'You have supported this issue. Priority updated.',
      supportCount: issue.supportCount,
      priorityScore: issue.priorityScore,
      priorityLevel: issue.priorityLevel,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update issue status with workflow enforcement
// @route   PUT /api/issues/:id/status
// @access  Private (Worker / Admin)
exports.updateIssueStatus = async (req, res, next) => {
  try {
    const { status, comment, notes } = req.body;
    const issue = await Issue.findById(req.params.id).populate('reportedBy');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    const previousStatus = issue.status;
    const validTransitions = {
      Reported: ['Under Review', 'Verified', 'Closed'],
      'Under Review': ['Verified', 'Reported', 'Closed'],
      Verified: ['Assigned', 'In Progress', 'Closed'],
      Assigned: ['Accepted', 'In Progress', 'Verified'],
      Accepted: ['In Progress', 'Assigned'],
      'In Progress': ['Resolved', 'Accepted'],
      Resolved: ['Citizen Verification', 'Closed', 'Reopened'],
      'Citizen Verification': ['Closed', 'Reopened'],
      Reopened: ['Under Review', 'Assigned', 'In Progress'],
      Closed: ['Reopened'],
    };

    // Check transition
    if (
      validTransitions[previousStatus] &&
      !validTransitions[previousStatus].includes(status) &&
      req.user.role !== 'system_admin'
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${previousStatus}' to '${status}'.`,
      });
    }

    issue.status = status;
    if (status === 'Resolved') {
      issue.resolvedAt = new Date();
      issue.verification.status = 'pending';
    } else if (status === 'Closed') {
      issue.closedAt = new Date();
    }

    await issue.save();

    // Add timeline update
    let evidenceDoc = null;
    if (req.file) {
      const fileUrl = `/uploads/${req.file.filename}`;
      evidenceDoc = await IssueEvidence.create({
        issue: issue._id,
        uploadedBy: req.user._id,
        evidenceType: status === 'Resolved' ? 'resolution' : 'work_in_progress',
        fileUrl,
        caption: comment || `Evidence for status change to ${status}`,
        metadata: {
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
        },
      });
    }

    await IssueUpdate.create({
      issue: issue._id,
      updatedBy: req.user._id,
      previousStatus,
      newStatus: status,
      action: status === 'Resolved' ? 'RESOLVED' : 'STATUS_CHANGE',
      comment: comment || notes || `Status transitioned to ${status}`,
      evidence: evidenceDoc ? evidenceDoc._id : null,
    });

    // Notify citizen if issue resolved or status changed
    if (issue.reportedBy) {
      const isResolved = status === 'Resolved';
      await sendNotification({
        recipientId: issue.reportedBy._id,
        type: isResolved ? 'verification_request' : 'status_change',
        title: isResolved ? 'Issue Marked as Resolved - Please Verify' : `Issue Status Update: ${status}`,
        message: isResolved
          ? `Field worker has marked your report "${issue.title}" as resolved. Please review the evidence and verify.`
          : `Your report "${issue.title}" status is now ${status}.`,
        relatedIssueId: issue._id,
      });
    }

    emitBroadcast('issue_status_updated', {
      issueId: issue._id,
      previousStatus,
      newStatus: status,
      updatedBy: req.user.name,
    });

    res.status(200).json({
      success: true,
      message: `Issue status changed from ${previousStatus} to ${status}`,
      issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Citizen verification of resolution
// @route   POST /api/issues/:id/verify
// @access  Private (Citizen or Admin)
exports.verifyResolution = async (req, res, next) => {
  try {
    const {
      verificationStatus, // 'verified_resolved' | 'disputed_unresolved' | 'partially_resolved'
      citizenNotes,
      rating = 5,
      feedbackText = '',
    } = req.body;

    const issue = await Issue.findById(req.params.id).populate('assignedWorker');
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    const previousStatus = issue.status;

    // Handle unresolved / dispute
    if (verificationStatus === 'disputed_unresolved') {
      issue.status = 'Reopened';
      issue.verification.status = 'disputed_unresolved';
      issue.verification.verifiedAt = new Date();
      issue.verification.reopenReason = citizenNotes || 'Citizen indicated the issue was not resolved';

      await issue.save();

      // Timeline entry
      await IssueUpdate.create({
        issue: issue._id,
        updatedBy: req.user._id,
        previousStatus,
        newStatus: 'Reopened',
        action: 'CITIZEN_REOPENED',
        comment: `Citizen reopened issue: ${citizenNotes || 'Issue not properly resolved'}`,
      });

      // Notify Department Admin and Worker
      if (issue.assignedWorker) {
        const workerDoc = await FieldWorker.findById(issue.assignedWorker);
        if (workerDoc) {
          await sendNotification({
            recipientId: workerDoc.user,
            type: 'issue_reopened',
            title: 'Issue Reopened by Citizen',
            message: `Resolution for "${issue.title}" was disputed by citizen. Reason: ${citizenNotes || 'Not resolved'}`,
            relatedIssueId: issue._id,
          });
        }
      }

      emitBroadcast('issue_reopened', {
        issueId: issue._id,
        title: issue.title,
        reason: citizenNotes,
      });

      return res.status(200).json({
        success: true,
        message: 'Issue has been reopened for department review.',
        issue,
      });
    }

    // Handle confirmed resolved
    issue.status = 'Closed';
    issue.closedAt = new Date();
    issue.verification.status = verificationStatus || 'verified_resolved';
    issue.verification.verifiedAt = new Date();
    issue.verification.citizenNotes = citizenNotes || 'Citizen verified satisfactory resolution';

    await issue.save();

    // Increment worker completed count & update rating
    if (issue.assignedWorker) {
      await FieldWorker.findByIdAndUpdate(issue.assignedWorker, {
        $inc: { totalCompleted: 1, currentWorkload: -1 },
      });
    }

    // Save citizen feedback
    await CitizenFeedback.create({
      issue: issue._id,
      citizen: req.user._id,
      rating: parseInt(rating, 10) || 5,
      feedbackText: feedbackText || citizenNotes || '',
      resolutionSatisfaction: verificationStatus === 'partially_resolved' ? 'somewhat_satisfied' : 'completely_satisfied',
    });

    // Timeline entry
    await IssueUpdate.create({
      issue: issue._id,
      updatedBy: req.user._id,
      previousStatus,
      newStatus: 'Closed',
      action: 'CITIZEN_VERIFIED',
      comment: `Citizen verified and closed issue. Satisfaction Rating: ${rating}/5`,
    });

    // Audit log
    await logAudit({
      userId: req.user._id,
      action: 'ISSUE_VERIFIED_CLOSED',
      targetType: 'Issue',
      targetId: issue._id,
      details: { verificationStatus, rating },
      req,
    });

    emitBroadcast('issue_closed', {
      issueId: issue._id,
      title: issue.title,
      rating,
    });

    res.status(200).json({
      success: true,
      message: 'Thank you! Resolution verified and issue is now closed.',
      issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload additional evidence to an issue
// @route   POST /api/issues/:id/evidence
// @access  Private
exports.uploadEvidence = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please attach an image file',
      });
    }

    const { evidenceType = 'work_in_progress', caption = '' } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const evidence = await IssueEvidence.create({
      issue: issue._id,
      uploadedBy: req.user._id,
      evidenceType,
      fileUrl,
      caption,
      metadata: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
    });

    await IssueUpdate.create({
      issue: issue._id,
      updatedBy: req.user._id,
      previousStatus: issue.status,
      newStatus: issue.status,
      action: evidenceType === 'resolution' ? 'RESOLVED' : 'WORK_NOTE',
      comment: caption || `New evidence uploaded (${evidenceType})`,
      evidence: evidence._id,
    });

    res.status(201).json({
      success: true,
      message: 'Evidence uploaded successfully',
      evidence,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all issue geographic clusters
// @route   GET /api/issues/clusters
// @access  Public
exports.getClusters = async (req, res, next) => {
  try {
    const clusters = await IssueCluster.find()
      .populate('issues', 'title category priorityLevel status location address')
      .sort('-issueCount');

    res.status(200).json({
      success: true,
      count: clusters.length,
      clusters,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Category & Duplicate preview check before submission
// @route   POST /api/issues/preview
// @access  Private
exports.previewIssue = async (req, res, next) => {
  try {
    const { title, description, latitude, longitude } = req.body;

    const aiResult = await classifyIssue({
      title: title || '',
      description: description || '',
    });

    let duplicateResult = { isDuplicateLikely: false, matches: [] };
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        duplicateResult = await detectDuplicates({
          category: aiResult.category,
          coordinates: [lng, lat],
          title,
          description,
        });
      }
    }

    res.status(200).json({
      success: true,
      aiAnalysis: aiResult,
      duplicateCheck: duplicateResult,
    });
  } catch (error) {
    next(error);
  }
};
