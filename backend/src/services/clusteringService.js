const Issue = require('../models/Issue');
const IssueCluster = require('../models/IssueCluster');
const { calculateDistanceMeters } = require('../utils/geoUtils');

/**
 * Cluster active civic issues by category and geographic proximity (e.g., 600m radius)
 */
const updateGeographicClusters = async () => {
  try {
    const activeIssues = await Issue.find({
      status: { $nin: ['Closed'] },
    }).select('_id title category location priorityScore priorityLevel status zone');

    if (!activeIssues || activeIssues.length === 0) {
      return [];
    }

    // Group issues by category
    const byCategory = {};
    for (const issue of activeIssues) {
      if (!byCategory[issue.category]) {
        byCategory[issue.category] = [];
      }
      byCategory[issue.category].push(issue);
    }

    const detectedClusters = [];

    // For each category, cluster spatially within 600 meters
    for (const [category, items] of Object.entries(byCategory)) {
      const visited = new Set();

      for (let i = 0; i < items.length; i++) {
        if (visited.has(items[i]._id.toString())) continue;

        const currentCluster = [items[i]];
        visited.add(items[i]._id.toString());
        const [lng1, lat1] = items[i].location.coordinates;

        for (let j = i + 1; j < items.length; j++) {
          if (visited.has(items[j]._id.toString())) continue;
          const [lng2, lat2] = items[j].location.coordinates;
          const dist = calculateDistanceMeters(lat1, lng1, lat2, lng2);

          if (dist <= 600) {
            currentCluster.push(items[j]);
            visited.add(items[j]._id.toString());
          }
        }

        // Only create a visible cluster if there are 2 or more related issues
        if (currentCluster.length >= 2) {
          // Calculate center coordinates
          const avgLng =
            currentCluster.reduce((sum, item) => sum + item.location.coordinates[0], 0) /
            currentCluster.length;
          const avgLat =
            currentCluster.reduce((sum, item) => sum + item.location.coordinates[1], 0) /
            currentCluster.length;

          // Status summary
          const statusSummary = {
            reported: currentCluster.filter((it) => it.status === 'Reported').length,
            inProgress: currentCluster.filter((it) => ['Assigned', 'Accepted', 'In Progress'].includes(it.status)).length,
            resolved: currentCluster.filter((it) => ['Resolved', 'Citizen Verification'].includes(it.status)).length,
            closed: 0,
          };

          // Aggregate priority: maximum of member priorities
          const hasCritical = currentCluster.some((it) => it.priorityLevel === 'Critical');
          const hasHigh = currentCluster.some((it) => it.priorityLevel === 'High');
          let clusterPriority = 'Medium';
          if (hasCritical || currentCluster.length >= 5) clusterPriority = 'Critical';
          else if (hasHigh || currentCluster.length >= 3) clusterPriority = 'High';

          const primaryZone = currentCluster[0].zone || 'Central Zone';
          const clusterName = `${category} Cluster (${primaryZone})`;

          // Upsert or create cluster document
          let clusterDoc = await IssueCluster.findOne({
            name: clusterName,
            category,
          });

          if (clusterDoc) {
            clusterDoc.issues = currentCluster.map((it) => it._id);
            clusterDoc.issueCount = currentCluster.length;
            clusterDoc.priority = clusterPriority;
            clusterDoc.statusSummary = statusSummary;
            clusterDoc.centerLocation = {
              type: 'Point',
              coordinates: [parseFloat(avgLng.toFixed(6)), parseFloat(avgLat.toFixed(6))],
            };
            await clusterDoc.save();
          } else {
            clusterDoc = await IssueCluster.create({
              name: clusterName,
              category,
              zone: primaryZone,
              centerLocation: {
                type: 'Point',
                coordinates: [parseFloat(avgLng.toFixed(6)), parseFloat(avgLat.toFixed(6))],
              },
              radiusMeters: 600,
              issues: currentCluster.map((it) => it._id),
              issueCount: currentCluster.length,
              priority: clusterPriority,
              statusSummary,
            });
          }

          // Link cluster ID to issues
          await Issue.updateMany(
            { _id: { $in: currentCluster.map((it) => it._id) } },
            { $set: { cluster: clusterDoc._id } }
          );

          detectedClusters.push(clusterDoc);
        }
      }
    }

    return detectedClusters;
  } catch (error) {
    console.error('❌ [Clustering Error]:', error.message);
    return [];
  }
};

module.exports = {
  updateGeographicClusters,
};
