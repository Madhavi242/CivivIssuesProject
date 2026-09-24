/**
 * CivicPulse Comprehensive Automated API Test Suite
 */
const { connectDB, disconnectDB } = require('../src/config/db');
require('../src/models');

const User = require('../src/models/User');
const Issue = require('../src/models/Issue');
const Department = require('../src/models/Department');
const FieldWorker = require('../src/models/FieldWorker');
const { classifyIssue } = require('../src/services/aiService');
const { detectDuplicates } = require('../src/services/duplicateDetectionService');
const { calculatePriority } = require('../src/services/priorityEngineService');
const { recommendWorkersForIssue } = require('../src/services/assignmentEngineService');
const { updateGeographicClusters } = require('../src/services/clusteringService');

async function runTests() {
  console.log('🧪 [Test Suite] Starting CivicPulse API & Services Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    process.env.NODE_ENV = 'test';
    await connectDB();

    // 1. Test AI Multimodal Classification
    console.log('\n--- 1. Testing AI Classification Engine ---');
    const roadAi = await classifyIssue({
      title: 'Massive pothole on road',
      description: 'Dangerous asphalt crater causing tire damage',
    });
    assert(roadAi.category === 'Road damage', `Classified as Road damage (Got: ${roadAi.category})`);
    assert(roadAi.confidence >= 0.7, `Confidence is high (${roadAi.confidence})`);
    assert(roadAi.safetyRisk >= 7, `Calculated appropriate safety risk (${roadAi.safetyRisk})`);

    const wasteAi = await classifyIssue({
      title: 'Garbage pile smelling bad',
      description: 'Trash dumped near market sidewalk',
    });
    assert(wasteAi.category === 'Garbage', `Classified as Garbage (Got: ${wasteAi.category})`);

    // 2. Test Priority Engine
    console.log('\n--- 2. Testing Priority Engine Calculation ---');
    const criticalPriority = calculatePriority({
      safetyRisk: 9,
      severity: 8,
      locationImportance: 9,
      supportingReports: 8,
      durationHours: 48,
      evidenceConfidence: 0.9,
    });
    assert(criticalPriority.priorityScore >= 80, `Calculated Critical score: ${criticalPriority.priorityScore}`);
    assert(criticalPriority.priorityLevel === 'Critical', `Priority level is Critical`);

    const lowPriority = calculatePriority({
      safetyRisk: 2,
      severity: 2,
      locationImportance: 2,
      supportingReports: 1,
      durationHours: 2,
      evidenceConfidence: 0.5,
    });
    assert(lowPriority.priorityLevel === 'Low', `Calculated Low level (Score: ${lowPriority.priorityScore})`);

    // 3. Test Users & Role Passwords
    console.log('\n--- 3. Testing User Authentication & RBAC ---');
    const testUser = await User.create({
      name: 'Automated Tester',
      email: `test-${Date.now()}@civicpulse.org`,
      password: 'testPassword123',
      role: 'citizen',
    });
    const isPassValid = await testUser.matchPassword('testPassword123');
    assert(isPassValid, 'Bcrypt password hashing and verification passed');
    const token = testUser.getSignedJwtToken();
    assert(typeof token === 'string' && token.length > 20, 'JWT token generated successfully');

    // 4. Test Duplicate Detection Engine
    console.log('\n--- 4. Testing Duplicate Detection & Geospatial Search ---');
    const baseIssue = await Issue.create({
      title: 'Broken water pipeline leaking',
      description: 'Major water leakage spilling across street',
      category: 'Water leakage',
      location: {
        type: 'Point',
        coordinates: [77.6000, 12.9800],
      },
      priorityScore: 70,
      priorityLevel: 'High',
      reportedBy: testUser._id,
      status: 'Reported',
    });

    const dupCheck = await detectDuplicates({
      category: 'Water leakage',
      coordinates: [77.6002, 12.9801], // ~25 meters away
      title: 'Water pipe burst leaking water',
      description: 'Clean water flooding the road from pipe',
      radiusMeters: 300,
    });

    assert(dupCheck.isDuplicateLikely, `Duplicate successfully detected (Confidence: ${dupCheck.confidenceScore})`);
    assert(dupCheck.topMatch.issueId.toString() === baseIssue._id.toString(), 'Matched original issue ID correctly');

    // 5. Test Worker Recommendation Engine
    console.log('\n--- 5. Testing Intelligent Worker Recommendation Engine ---');
    const testDept = await Department.create({
      name: `Test Department ${Date.now()}`,
      code: `TD${Date.now() % 1000}`,
      categories: ['Water leakage'],
    });

    const workerUser = await User.create({
      name: 'Field Technician Joe',
      email: `tech-joe-${Date.now()}@civicpulse.org`,
      password: 'workerPassword',
      role: 'field_worker',
    });

    await FieldWorker.create({
      user: workerUser._id,
      department: testDept._id,
      skills: ['Pipe Welding', 'Valve Repair'],
      assignedCategories: ['Water leakage'],
      status: 'available',
      currentWorkload: 1,
      currentLocation: {
        type: 'Point',
        coordinates: [77.6050, 12.9820], // ~800m away
      },
    });

    baseIssue.department = testDept._id;
    await baseIssue.save();

    const recResult = await recommendWorkersForIssue(baseIssue._id);
    assert(recResult.rankedCandidates.length > 0, 'Worker recommendations generated');
    assert(recResult.rankedCandidates[0].categoryMatch === true, 'Worker category matched correctly');
    assert(recResult.rankedCandidates[0].suitabilityScore > 60, `Suitability score calculated (${recResult.rankedCandidates[0].suitabilityScore})`);

    // 6. Test Geographic Clustering
    console.log('\n--- 6. Testing Geographic Clustering ---');
    await Issue.create({
      title: 'Another pipe leak nearby',
      description: 'Second leak on same main line',
      category: 'Water leakage',
      location: {
        type: 'Point',
        coordinates: [77.6010, 12.9805],
      },
      priorityScore: 75,
      priorityLevel: 'High',
      reportedBy: testUser._id,
      status: 'Reported',
    });

    const clusters = await updateGeographicClusters();
    assert(Array.isArray(clusters), 'Geographic clustering recalculated');

    console.log(`\n======================================================`);
    console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`======================================================\n`);

    await disconnectDB();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('❌ Test Suite Crashed:', err);
    process.exit(1);
  }
}

runTests();
