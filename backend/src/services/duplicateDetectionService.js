const Issue = require('../models/Issue');
const { calculateDistanceMeters } = require('../utils/geoUtils');

/**
 * Tokenize string into set of unique normalized words
 */
const tokenize = (text) => {
  if (!text) return new Set();
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2);
  return new Set(tokens);
};

/**
 * Compute Jaccard text similarity coefficient (0 to 1)
 */
const computeTextSimilarity = (textA, textB) => {
  const setA = tokenize(textA);
  const setB = tokenize(textB);

  if (setA.size === 0 || setB.size === 0) return 0;

  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) {
      intersectionCount++;
    }
  }

  const unionCount = new Set([...setA, ...setB]).size;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
};

/**
 * Detect existing similar/duplicate issues near the given location
 */
const detectDuplicates = async ({
  category,
  coordinates, // [longitude, latitude]
  title = '',
  description = '',
  radiusMeters = 350,
  confidenceThreshold = 0.60,
  excludeIssueId = null,
}) => {
  if (!coordinates || coordinates.length < 2) {
    return { isDuplicateLikely: false, matches: [], topMatch: null };
  }

  const [lng, lat] = coordinates;

  // Search active issues within radius using MongoDB $nearSphere geospatial query
  const query = {
    location: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        $maxDistance: radiusMeters,
      },
    },
    status: { $nin: ['Closed'] }, // Only check active or in-review issues
  };

  if (excludeIssueId) {
    query._id = { $ne: excludeIssueId };
  }

  let nearbyIssues = [];
  try {
    nearbyIssues = await Issue.find(query)
      .populate('reportedBy', 'name email')
      .populate('department', 'name code')
      .limit(10);
  } catch (err) {
    // Fallback if 2dsphere index is still building or testing
    nearbyIssues = await Issue.find({ status: { $nin: ['Closed'] } })
      .populate('reportedBy', 'name email')
      .populate('department', 'name code')
      .limit(50);
  }

  const evaluatedMatches = [];

  for (const existing of nearbyIssues) {
    const [existLng, existLat] = existing.location.coordinates;
    const distanceM = calculateDistanceMeters(lat, lng, existLat, existLng);

    if (distanceM > radiusMeters) continue;

    // 1. Category similarity (0 to 0.40)
    let categoryScore = 0;
    if (existing.category === category) {
      categoryScore = 0.40;
    } else if (
      (existing.category === 'Road damage' && category === 'Damaged public infrastructure') ||
      (existing.category === 'Water leakage' && category === 'Drain blockage')
    ) {
      categoryScore = 0.20;
    }

    // 2. Text similarity (0 to 0.35)
    const newText = `${title} ${description}`;
    const existText = `${existing.title} ${existing.description}`;
    const textSim = computeTextSimilarity(newText, existText);
    const textScore = Math.min(0.35, textSim * 0.45);

    // 3. Proximity score (0 to 0.25)
    // Closer distance receives higher score
    let proximityScore = 0;
    if (distanceM <= 30) {
      proximityScore = 0.25;
    } else if (distanceM <= 100) {
      proximityScore = 0.20;
    } else if (distanceM <= 200) {
      proximityScore = 0.12;
    } else {
      proximityScore = 0.05;
    }

    const totalConfidence = parseFloat(
      (categoryScore + textScore + proximityScore).toFixed(2)
    );

    if (totalConfidence >= 0.35) {
      evaluatedMatches.push({
        issueId: existing._id,
        title: existing.title,
        description: existing.description,
        category: existing.category,
        status: existing.status,
        priorityLevel: existing.priorityLevel,
        supportCount: existing.supportCount || 1,
        distanceMeters: distanceM,
        confidenceScore: totalConfidence,
        reportedAt: existing.createdAt,
        address: existing.address,
        location: existing.location,
      });
    }
  }

  // Sort descending by confidence score
  evaluatedMatches.sort((a, b) => b.confidenceScore - a.confidenceScore);

  const topMatch = evaluatedMatches[0] || null;
  const isDuplicateLikely = !!topMatch && topMatch.confidenceScore >= confidenceThreshold;

  return {
    isDuplicateLikely,
    confidenceScore: topMatch ? topMatch.confidenceScore : 0,
    matches: evaluatedMatches,
    topMatch,
  };
};

module.exports = {
  detectDuplicates,
  computeTextSimilarity,
};
