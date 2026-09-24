const mongoose = require('mongoose');
require('dotenv').config();

const { connectDB, disconnectDB } = require('../config/db');
require('../models');

const User = require('../models/User');
const Department = require('../models/Department');
const FieldWorker = require('../models/FieldWorker');
const Issue = require('../models/Issue');
const IssueEvidence = require('../models/IssueEvidence');
const IssueUpdate = require('../models/IssueUpdate');
const IssueCluster = require('../models/IssueCluster');
const CitizenFeedback = require('../models/CitizenFeedback');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { updateGeographicClusters } = require('../services/clusteringService');

const seed = async () => {
  try {
    console.log('🌱 [Seed] Connecting to database...');
    await connectDB();

    console.log('🧹 [Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany(),
      Department.deleteMany(),
      FieldWorker.deleteMany(),
      Issue.deleteMany(),
      IssueEvidence.deleteMany(),
      IssueUpdate.deleteMany(),
      IssueCluster.deleteMany(),
      CitizenFeedback.deleteMany(),
      AuditLog.deleteMany(),
      Notification.deleteMany(),
    ]);

    console.log('🏢 [Seed] Creating Municipal Departments...');
    const departments = await Department.create([
      {
        name: 'Roads & Infrastructure',
        code: 'ROADS',
        description: 'Pothole remediation, road surfacing, footpaths, bridges, and public barriers.',
        categories: ['Road damage', 'Damaged public infrastructure'],
        contactEmail: 'roads@civicpulse.gov',
        contactPhone: '+1-555-0191',
        slaHours: 48,
      },
      {
        name: 'Sanitation & Solid Waste',
        code: 'SANITATION',
        description: 'Municipal garbage collection, illegal dumping removal, public bin maintenance.',
        categories: ['Garbage'],
        contactEmail: 'sanitation@civicpulse.gov',
        contactPhone: '+1-555-0192',
        slaHours: 24,
      },
      {
        name: 'Water Supply & Drainage',
        code: 'WATER',
        description: 'Pipeline leak repairs, storm drain clearing, sewage overflow containment.',
        categories: ['Water leakage', 'Drain blockage'],
        contactEmail: 'water@civicpulse.gov',
        contactPhone: '+1-555-0193',
        slaHours: 36,
      },
      {
        name: 'Public Lighting & Electricity',
        code: 'LIGHTING',
        description: 'Streetlight outages, exposed electrical wiring, high-mast illumination repair.',
        categories: ['Broken streetlight'],
        contactEmail: 'lighting@civicpulse.gov',
        contactPhone: '+1-555-0194',
        slaHours: 24,
      },
      {
        name: 'Traffic & Urban Mobility',
        code: 'TRAFFIC',
        description: 'Traffic signal synchronization, zebra crossings, divider hazards, road signage.',
        categories: ['Traffic-related issue', 'Other'],
        contactEmail: 'traffic@civicpulse.gov',
        contactPhone: '+1-555-0195',
        slaHours: 12,
      },
    ]);

    const deptMap = {};
    departments.forEach((d) => (deptMap[d.code] = d));

    console.log('👥 [Seed] Creating Demo Users (Marked as DEMO ONLY)...');
    // 1. System Admin
    const sysAdmin = await User.create({
      name: 'System Admin (DEMO)',
      email: 'admin@civicpulse.org',
      password: 'admin123',
      role: 'system_admin',
      phone: '+1-555-9000',
    });

    // 2. Department Admins
    const deptAdminRoads = await User.create({
      name: 'Elena Rostova (Roads Admin - DEMO)',
      email: 'deptadmin.roads@civicpulse.org',
      password: 'admin123',
      role: 'department_admin',
      department: deptMap.ROADS._id,
      phone: '+1-555-9001',
    });

    const deptAdminSanitation = await User.create({
      name: 'Marcus Chen (Sanitation Admin - DEMO)',
      email: 'deptadmin.sanitation@civicpulse.org',
      password: 'admin123',
      role: 'department_admin',
      department: deptMap.SANITATION._id,
      phone: '+1-555-9002',
    });

    // Update department heads
    deptMap.ROADS.head = deptAdminRoads._id;
    await deptMap.ROADS.save();
    deptMap.SANITATION.head = deptAdminSanitation._id;
    await deptMap.SANITATION.save();

    // 3. Field Workers
    const workerUser1 = await User.create({
      name: 'Rajesh Kumar (Field Tech - DEMO)',
      email: 'worker.rajesh@civicpulse.org',
      password: 'worker123',
      role: 'field_worker',
      department: deptMap.ROADS._id,
      phone: '+1-555-8001',
    });

    const workerUser2 = await User.create({
      name: 'Anita Sharma (Sanitation Lead - DEMO)',
      email: 'worker.anita@civicpulse.org',
      password: 'worker123',
      role: 'field_worker',
      department: deptMap.SANITATION._id,
      phone: '+1-555-8002',
    });

    const workerUser3 = await User.create({
      name: 'Vikram Singh (Electrical Tech - DEMO)',
      email: 'worker.vikram@civicpulse.org',
      password: 'worker123',
      role: 'field_worker',
      department: deptMap.LIGHTING._id,
      phone: '+1-555-8003',
    });

    // 4. Citizens
    const citizen1 = await User.create({
      name: 'Priya Patel (Active Citizen - DEMO)',
      email: 'citizen.priya@civicpulse.org',
      password: 'citizen123',
      role: 'citizen',
      phone: '+1-555-7001',
    });

    const citizen2 = await User.create({
      name: 'Arun Verma (Resident - DEMO)',
      email: 'citizen.arun@civicpulse.org',
      password: 'citizen123',
      role: 'citizen',
      phone: '+1-555-7002',
    });

    console.log('👷 [Seed] Creating Field Worker Profiles...');
    const fieldWorker1 = await FieldWorker.create({
      user: workerUser1._id,
      department: deptMap.ROADS._id,
      skills: ['Pothole Repair', 'Asphalt Patching', 'Kerb Restoration'],
      assignedCategories: ['Road damage', 'Damaged public infrastructure'],
      status: 'available',
      currentWorkload: 1,
      currentLocation: {
        type: 'Point',
        coordinates: [77.5960, 12.9730],
        address: 'MG Road Depot, Central Zone',
      },
      rating: 4.8,
      totalCompleted: 24,
    });

    const fieldWorker2 = await FieldWorker.create({
      user: workerUser2._id,
      department: deptMap.SANITATION._id,
      skills: ['Waste Clearing', 'Bio-Hazard Containment', 'Compactor Operations'],
      assignedCategories: ['Garbage'],
      status: 'available',
      currentWorkload: 1,
      currentLocation: {
        type: 'Point',
        coordinates: [77.6010, 12.9780],
        address: 'Cubbon Park Sector Depot',
      },
      rating: 4.9,
      totalCompleted: 38,
    });

    const fieldWorker3 = await FieldWorker.create({
      user: workerUser3._id,
      department: deptMap.LIGHTING._id,
      skills: ['High Voltage Wiring', 'LED Pole Replacement', 'Circuit Diagnostics'],
      assignedCategories: ['Broken streetlight'],
      status: 'available',
      currentWorkload: 0,
      currentLocation: {
        type: 'Point',
        coordinates: [77.5850, 12.9650],
        address: 'South Power Station',
      },
      rating: 4.7,
      totalCompleted: 19,
    });

    console.log('📍 [Seed] Creating Realistic Civic Issues...');
    // Coordinates around city center (Bangalore reference: 12.9716 N, 77.5946 E)
    const issue1 = await Issue.create({
      title: 'Deep Hazardous Pothole near Metro Station',
      description: 'Severe 1.5 ft crater right before the pedestrian crossing at Metro Gate 2. Causes heavy vehicle skidding during monsoon rain.',
      category: 'Road damage',
      categoryConfidence: 0.95,
      classificationSource: 'ai_suggested',
      location: {
        type: 'Point',
        coordinates: [77.5955, 12.9725],
      },
      address: 'Opposite Metro Station Gate 2, MG Road',
      zone: 'Zone 3 - Central',
      priorityScore: 84,
      priorityLevel: 'Critical',
      priorityFactors: {
        safetyRisk: 9,
        supportingReports: 6,
        severity: 8,
        locationImportance: 9,
        durationHours: 32,
        evidenceConfidence: 0.92,
      },
      status: 'In Progress',
      reportedBy: citizen1._id,
      supportingUsers: [citizen1._id, citizen2._id],
      supportCount: 6,
      department: deptMap.ROADS._id,
      assignedWorker: fieldWorker1._id,
      assignedAt: new Date(Date.now() - 3600000 * 6),
      tags: ['pothole', 'metro-hazard', 'monsoon-risk'],
    });

    const issue2 = await Issue.create({
      title: 'Secondary Pothole Cluster on Parallel Service Road',
      description: 'Multiple surface cracks and two potholes expanding rapidly after pipe maintenance.',
      category: 'Road damage',
      categoryConfidence: 0.91,
      classificationSource: 'ai_suggested',
      location: {
        type: 'Point',
        coordinates: [77.5970, 12.9735],
      },
      address: 'Church Street Corner, MG Road Extension',
      zone: 'Zone 3 - Central',
      priorityScore: 68,
      priorityLevel: 'High',
      priorityFactors: {
        safetyRisk: 6,
        supportingReports: 3,
        severity: 6,
        locationImportance: 8,
        durationHours: 18,
        evidenceConfidence: 0.88,
      },
      status: 'Reported',
      reportedBy: citizen2._id,
      supportingUsers: [citizen2._id],
      supportCount: 3,
      department: deptMap.ROADS._id,
      tags: ['road-damage', 'service-lane'],
    });

    const issue3 = await Issue.create({
      title: 'Overflowing Commercial Garbage Dump on Sidewalk',
      description: 'Large mound of restaurant waste overflowing across 20 meters of walking path. Strong odor and stray animal nuisance.',
      category: 'Garbage',
      categoryConfidence: 0.96,
      classificationSource: 'ai_suggested',
      location: {
        type: 'Point',
        coordinates: [77.6030, 12.9790],
      },
      address: 'Behind Commercial Complex, Brigade Road',
      zone: 'Zone 2 - East',
      priorityScore: 72,
      priorityLevel: 'High',
      priorityFactors: {
        safetyRisk: 7,
        supportingReports: 5,
        severity: 7,
        locationImportance: 7,
        durationHours: 14,
        evidenceConfidence: 0.9,
      },
      status: 'In Progress',
      reportedBy: citizen1._id,
      supportingUsers: [citizen1._id],
      supportCount: 5,
      department: deptMap.SANITATION._id,
      assignedWorker: fieldWorker2._id,
      assignedAt: new Date(Date.now() - 3600000 * 4),
      tags: ['garbage', 'overflowing-dump', 'commercial-waste'],
    });

    const issue4 = await Issue.create({
      title: 'Water Main Pipe Gushing Clean Water',
      description: 'Underground drinking water main cracked, causing a 2-foot fountain of clean water flooding the street.',
      category: 'Water leakage',
      categoryConfidence: 0.98,
      classificationSource: 'ai_suggested',
      location: {
        type: 'Point',
        coordinates: [77.5880, 12.9690],
      },
      address: 'Near Government High School, Sampangi Rama Nagar',
      zone: 'Zone 1 - North',
      priorityScore: 89,
      priorityLevel: 'Critical',
      priorityFactors: {
        safetyRisk: 8,
        supportingReports: 9,
        severity: 9,
        locationImportance: 9,
        durationHours: 8,
        evidenceConfidence: 0.95,
      },
      status: 'Under Review',
      reportedBy: citizen2._id,
      supportingUsers: [citizen1._id, citizen2._id],
      supportCount: 9,
      department: deptMap.WATER._id,
      tags: ['pipe-burst', 'water-wastage', 'urgent-leak'],
    });

    const issue5 = await Issue.create({
      title: 'Broken Streetlight with Exposed Wire',
      description: 'Streetlight pole hit by truck. Light is non-functional and live cable is hanging within reach of children.',
      category: 'Broken streetlight',
      categoryConfidence: 0.94,
      classificationSource: 'ai_suggested',
      location: {
        type: 'Point',
        coordinates: [77.5860, 12.9660],
      },
      address: 'Lalbagh Road Junction, Near Primary Health Center',
      zone: 'Zone 4 - South',
      priorityScore: 92,
      priorityLevel: 'Critical',
      priorityFactors: {
        safetyRisk: 10,
        supportingReports: 4,
        severity: 9,
        locationImportance: 8,
        durationHours: 6,
        evidenceConfidence: 0.93,
      },
      status: 'Assigned',
      reportedBy: citizen1._id,
      supportingUsers: [citizen1._id],
      supportCount: 4,
      department: deptMap.LIGHTING._id,
      assignedWorker: fieldWorker3._id,
      assignedAt: new Date(Date.now() - 3600000 * 2),
      tags: ['live-wire', 'electrical-hazard', 'dark-street'],
    });

    const issue6 = await Issue.create({
      title: 'Clogged Stormwater Drain Overspill',
      description: 'Debris and plastic bottles blocking the culvert inlet causing black runoff during showers.',
      category: 'Drain blockage',
      categoryConfidence: 0.88,
      classificationSource: 'ai_suggested',
      location: {
        type: 'Point',
        coordinates: [77.5910, 12.9710],
      },
      address: 'Richmond Circle Underpass',
      zone: 'Zone 3 - Central',
      priorityScore: 52,
      priorityLevel: 'Medium',
      priorityFactors: {
        safetyRisk: 5,
        supportingReports: 2,
        severity: 5,
        locationImportance: 6,
        durationHours: 20,
        evidenceConfidence: 0.85,
      },
      status: 'Reported',
      reportedBy: citizen2._id,
      supportingUsers: [citizen2._id],
      supportCount: 2,
      department: deptMap.WATER._id,
      tags: ['drain-block', 'culvert-clog'],
    });

    const issue7 = await Issue.create({
      title: 'Cracked Pedestrian Overbridge Handrail',
      description: 'Iron handrail severed on footbridge stairs, safe access compromised for senior citizens.',
      category: 'Damaged public infrastructure',
      categoryConfidence: 0.9,
      classificationSource: 'user_selected',
      location: {
        type: 'Point',
        coordinates: [77.6045, 12.9810],
      },
      address: 'Trinity Circle Skywalk',
      zone: 'Zone 2 - East',
      priorityScore: 78,
      priorityLevel: 'High',
      priorityFactors: {
        safetyRisk: 8,
        supportingReports: 4,
        severity: 7,
        locationImportance: 8,
        durationHours: 48,
        evidenceConfidence: 0.89,
      },
      status: 'Resolved',
      reportedBy: citizen1._id,
      supportingUsers: [citizen1._id],
      supportCount: 4,
      department: deptMap.ROADS._id,
      assignedWorker: fieldWorker1._id,
      resolvedAt: new Date(Date.now() - 3600000 * 3),
      verification: {
        status: 'pending',
      },
      tags: ['footbridge', 'broken-railing', 'safety-risk'],
    });

    const issue8 = await Issue.create({
      title: 'Non-Functional Traffic Signal at Busy Crossroads',
      description: 'Red light blinks intermittently and green light burnt out, causing gridlock during evening peak hour.',
      category: 'Traffic-related issue',
      categoryConfidence: 0.96,
      classificationSource: 'ai_suggested',
      location: {
        type: 'Point',
        coordinates: [77.5990, 12.9750],
      },
      address: 'Residency Road and Brigade Road Crossroad',
      zone: 'Zone 3 - Central',
      priorityScore: 82,
      priorityLevel: 'Critical',
      priorityFactors: {
        safetyRisk: 8,
        supportingReports: 7,
        severity: 8,
        locationImportance: 9,
        durationHours: 5,
        evidenceConfidence: 0.91,
      },
      status: 'Closed',
      reportedBy: citizen2._id,
      supportingUsers: [citizen1._id, citizen2._id],
      supportCount: 7,
      department: deptMap.TRAFFIC._id,
      resolvedAt: new Date(Date.now() - 3600000 * 24),
      closedAt: new Date(Date.now() - 3600000 * 12),
      verification: {
        status: 'verified_resolved',
        verifiedAt: new Date(Date.now() - 3600000 * 12),
        citizenNotes: 'Signal electronics replaced and working normally.',
      },
      tags: ['traffic-signal', 'intersection-gridlock'],
    });

    console.log('📸 [Seed] Creating Evidence & Timelines...');
    // Evidence for Issue 1
    const ev1 = await IssueEvidence.create({
      issue: issue1._id,
      uploadedBy: citizen1._id,
      evidenceType: 'initial_report',
      fileUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      caption: 'Initial photo of deep pothole near Metro gate',
      aiAnalysis: {
        detectedCategory: 'Road damage',
        confidence: 0.95,
        detectedObjects: ['pothole', 'asphalt crater', 'pedestrian crosswalk'],
        tags: ['pothole', 'metro-hazard'],
      },
    });

    // Evidence for Issue 7 (Resolved)
    const ev7 = await IssueEvidence.create({
      issue: issue7._id,
      uploadedBy: workerUser1._id,
      evidenceType: 'resolution',
      fileUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      caption: 'Steel handrail welded, secured, and painted with reflective yellow caution tape.',
    });

    // Timelines
    await IssueUpdate.create([
      {
        issue: issue1._id,
        updatedBy: citizen1._id,
        newStatus: 'Reported',
        action: 'REPORTED',
        comment: 'Citizen reported this critical civic hazard with photo evidence.',
        evidence: ev1._id,
      },
      {
        issue: issue1._id,
        updatedBy: deptAdminRoads._id,
        previousStatus: 'Reported',
        newStatus: 'Assigned',
        action: 'ASSIGNED',
        comment: 'Assigned to field worker Rajesh Kumar with high priority dispatch.',
      },
      {
        issue: issue1._id,
        updatedBy: workerUser1._id,
        previousStatus: 'Assigned',
        newStatus: 'In Progress',
        action: 'IN_PROGRESS',
        comment: 'Field crew arrived at location with cold-mix asphalt and safety cones.',
      },
      {
        issue: issue7._id,
        updatedBy: workerUser1._id,
        previousStatus: 'In Progress',
        newStatus: 'Resolved',
        action: 'RESOLVED',
        comment: 'Welding completed and structural bolts torqued. Ready for citizen verification.',
        evidence: ev7._id,
      },
      {
        issue: issue8._id,
        updatedBy: citizen2._id,
        previousStatus: 'Resolved',
        newStatus: 'Closed',
        action: 'CITIZEN_VERIFIED',
        comment: 'Citizen verified and closed issue. Satisfaction Rating: 5/5',
      },
    ]);

    // Citizen Feedback for issue 8
    await CitizenFeedback.create({
      issue: issue8._id,
      citizen: citizen2._id,
      rating: 5,
      feedbackText: 'Traffic control team fixed the controller box within 5 hours! Very impressed.',
      resolutionSatisfaction: 'completely_satisfied',
    });

    // Initial Notifications
    await Notification.create([
      {
        recipient: citizen1._id,
        type: 'verification_request',
        title: 'Action Needed: Verify Resolution',
        message: 'Field technician Rajesh Kumar has marked "Cracked Pedestrian Overbridge Handrail" as Resolved. Please confirm.',
        relatedIssue: issue7._id,
      },
      {
        recipient: workerUser1._id,
        type: 'issue_assigned',
        title: 'New Assignment: Metro Pothole',
        message: 'High priority road repair assigned at MG Road Metro Station.',
        relatedIssue: issue1._id,
      },
    ]);

    console.log('🗺️ [Seed] Generating Geographic Issue Clusters...');
    await updateGeographicClusters();

    console.log('✅ [Seed] Database seeded successfully!');
    console.log('\n================ DEMO CREDENTIALS (DEMO ONLY) ================');
    console.log('👑 System Admin:       admin@civicpulse.org            / admin123');
    console.log('🏢 Dept Admin (Roads): deptadmin.roads@civicpulse.org  / admin123');
    console.log('🏢 Dept Admin (Waste): deptadmin.sanitation@civicpulse.org / admin123');
    console.log('👷 Field Worker:       worker.rajesh@civicpulse.org    / worker123');
    console.log('🧑 Citizen:            citizen.priya@civicpulse.org    / citizen123');
    console.log('=================================================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seed Error]:', error);
    process.exit(1);
  }
};

seed();
