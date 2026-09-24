const FieldWorker = require('../models/FieldWorker');
const Department = require('../models/Department');
const Issue = require('../models/Issue');
const { calculateDistanceKm } = require('../utils/geoUtils');

/**
 * Recommend ranked field workers for a specific civic issue
 */
const recommendWorkersForIssue = async (issueId) => {
  const issue = await Issue.findById(issueId).populate('department');
  if (!issue) {
    throw new Error('Issue not found');
  }

  const [issueLng, issueLat] = issue.location.coordinates;
  const targetCategory = issue.category;
  const targetDepartmentId = issue.department?._id || issue.department;

  // Query candidate workers
  const filter = { status: { $ne: 'offline' } };
  if (targetDepartmentId) {
    filter.department = targetDepartmentId;
  }

  let candidates = await FieldWorker.find(filter)
    .populate('user', 'name email phone avatar')
    .populate('department', 'name code');

  // If no candidates in specific department, check across all active workers
  if (candidates.length === 0) {
    candidates = await FieldWorker.find({ status: { $ne: 'offline' } })
      .populate('user', 'name email phone avatar')
      .populate('department', 'name code');
  }

  const evaluatedWorkers = [];

  for (const worker of candidates) {
    const [workerLng, workerLat] = worker.currentLocation.coordinates;
    const distanceKm = calculateDistanceKm(issueLat, issueLng, workerLat, workerLng);

    // 1. Category / Skill match
    const categoryMatch =
      worker.assignedCategories.some(
        (c) => c.toLowerCase() === targetCategory.toLowerCase()
      ) ||
      worker.skills.some((s) =>
        targetCategory.toLowerCase().includes(s.toLowerCase())
      );

    // 2. Availability score (0-25)
    let availabilityScore = 0;
    if (worker.status === 'available') availabilityScore = 25;
    else if (worker.status === 'busy') availabilityScore = 12;

    // 3. Category match score (0-35)
    const categoryScore = categoryMatch ? 35 : 10;

    // 4. Distance score (0-25): Full 25 points if <= 1km, decreasing
    const distanceScore = Math.max(0, Math.round(25 - distanceKm * 2.5));

    // 5. Workload penalty score (0-15): 15 for 0 workload, decreasing
    const workloadScore = Math.max(0, Math.round(15 - (worker.currentWorkload || 0) * 3));

    const totalSuitability = Math.min(
      100,
      Math.max(10, categoryScore + availabilityScore + distanceScore + workloadScore)
    );

    // Transparent reason bullets
    const reasons = [];
    if (categoryMatch) {
      reasons.push(`Specialized in ${targetCategory}`);
    } else {
      reasons.push('General municipal technician');
    }
    reasons.push(`Located ${distanceKm} km from issue`);
    reasons.push(`Active workload: ${worker.currentWorkload || 0} issues`);
    reasons.push(`Current status: ${worker.status}`);

    evaluatedWorkers.push({
      workerId: worker._id,
      userId: worker.user._id,
      name: worker.user.name,
      email: worker.user.email,
      phone: worker.user.phone,
      departmentName: worker.department ? worker.department.name : 'Municipal Works',
      distanceKm,
      currentWorkload: worker.currentWorkload || 0,
      status: worker.status,
      categoryMatch,
      suitabilityScore: totalSuitability,
      reasons,
    });
  }

  // Sort descending by suitability score
  evaluatedWorkers.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  return {
    issueId: issue._id,
    issueTitle: issue.title,
    category: issue.category,
    priorityLevel: issue.priorityLevel,
    rankedCandidates: evaluatedWorkers,
  };
};

module.exports = {
  recommendWorkersForIssue,
};
