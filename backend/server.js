const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Register all Mongoose models
require('./src/models');

const { connectDB } = require('./src/config/db');
const { initSocket } = require('./src/config/socket');
const errorHandler = require('./src/middleware/errorHandler');

// Initialize app & server
const app = express();
const server = http.createServer(app);

// Connect to MongoDB Atlas
connectDB().then(async () => {
  try {
    const User = require('./src/models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 [Server Startup] Database is empty. Seeding initial demo data...');
      // Run seed logic inline or require
      const { updateGeographicClusters } = require('./src/services/clusteringService');
      const Department = require('./src/models/Department');
      const FieldWorker = require('./src/models/FieldWorker');
      const Issue = require('./src/models/Issue');
      const IssueEvidence = require('./src/models/IssueEvidence');
      const IssueUpdate = require('./src/models/IssueUpdate');
      const Notification = require('./src/models/Notification');
      const CitizenFeedback = require('./src/models/CitizenFeedback');

      // Departments
      const departments = await Department.create([
        { name: 'Roads & Infrastructure', code: 'ROADS', description: 'Pothole remediation and surfacing', categories: ['Road damage', 'Damaged public infrastructure'], contactEmail: 'roads@civicpulse.gov', contactPhone: '+1-555-0191', slaHours: 48 },
        { name: 'Sanitation & Solid Waste', code: 'SANITATION', description: 'Municipal garbage collection', categories: ['Garbage'], contactEmail: 'sanitation@civicpulse.gov', contactPhone: '+1-555-0192', slaHours: 24 },
        { name: 'Water Supply & Drainage', code: 'WATER', description: 'Pipeline leak and drain clearing', categories: ['Water leakage', 'Drain blockage'], contactEmail: 'water@civicpulse.gov', contactPhone: '+1-555-0193', slaHours: 36 },
        { name: 'Public Lighting & Electricity', code: 'LIGHTING', description: 'Streetlight outages and wiring', categories: ['Broken streetlight'], contactEmail: 'lighting@civicpulse.gov', contactPhone: '+1-555-0194', slaHours: 24 },
        { name: 'Traffic & Urban Mobility', code: 'TRAFFIC', description: 'Signals and crossings', categories: ['Traffic-related issue', 'Other'], contactEmail: 'traffic@civicpulse.gov', contactPhone: '+1-555-0195', slaHours: 12 },
      ]);
      const deptMap = {};
      departments.forEach(d => deptMap[d.code] = d);

      // Demo Users
      const sysAdmin = await User.create({ name: 'System Admin (DEMO)', email: 'admin@civicpulse.org', password: 'admin123', role: 'system_admin' });
      const deptAdminRoads = await User.create({ name: 'Elena Rostova (Roads Admin - DEMO)', email: 'deptadmin.roads@civicpulse.org', password: 'admin123', role: 'department_admin', department: deptMap.ROADS._id });
      const deptAdminSanitation = await User.create({ name: 'Marcus Chen (Sanitation Admin - DEMO)', email: 'deptadmin.sanitation@civicpulse.org', password: 'admin123', role: 'department_admin', department: deptMap.SANITATION._id });
      deptMap.ROADS.head = deptAdminRoads._id; await deptMap.ROADS.save();
      deptMap.SANITATION.head = deptAdminSanitation._id; await deptMap.SANITATION.save();

      const worker1 = await User.create({ name: 'Rajesh Kumar (Field Tech - DEMO)', email: 'worker.rajesh@civicpulse.org', password: 'worker123', role: 'field_worker', department: deptMap.ROADS._id });
      const worker2 = await User.create({ name: 'Anita Sharma (Sanitation Lead - DEMO)', email: 'worker.anita@civicpulse.org', password: 'worker123', role: 'field_worker', department: deptMap.SANITATION._id });
      const worker3 = await User.create({ name: 'Vikram Singh (Electrical Tech - DEMO)', email: 'worker.vikram@civicpulse.org', password: 'worker123', role: 'field_worker', department: deptMap.LIGHTING._id });

      const citizen1 = await User.create({ name: 'Priya Patel (Citizen - DEMO)', email: 'citizen.priya@civicpulse.org', password: 'citizen123', role: 'citizen' });
      const citizen2 = await User.create({ name: 'Arun Verma (Citizen - DEMO)', email: 'citizen.arun@civicpulse.org', password: 'citizen123', role: 'citizen' });

      // FieldWorker profiles
      const fw1 = await FieldWorker.create({ user: worker1._id, department: deptMap.ROADS._id, skills: ['Pothole Repair', 'Asphalt Patching'], assignedCategories: ['Road damage', 'Damaged public infrastructure'], status: 'available', currentWorkload: 1, currentLocation: { type: 'Point', coordinates: [77.5960, 12.9730] } });
      const fw2 = await FieldWorker.create({ user: worker2._id, department: deptMap.SANITATION._id, skills: ['Waste Clearing'], assignedCategories: ['Garbage'], status: 'available', currentWorkload: 1, currentLocation: { type: 'Point', coordinates: [77.6010, 12.9780] } });
      const fw3 = await FieldWorker.create({ user: worker3._id, department: deptMap.LIGHTING._id, skills: ['Streetlight Wiring'], assignedCategories: ['Broken streetlight'], status: 'available', currentWorkload: 0, currentLocation: { type: 'Point', coordinates: [77.5850, 12.9650] } });

      // Realistic Issues
      const is1 = await Issue.create({ title: 'Deep Hazardous Pothole near Metro Station', description: 'Severe 1.5 ft crater right before the pedestrian crossing at Metro Gate 2. Causes heavy vehicle skidding.', category: 'Road damage', categoryConfidence: 0.95, classificationSource: 'ai_suggested', location: { type: 'Point', coordinates: [77.5955, 12.9725] }, address: 'Opposite Metro Gate 2, MG Road', zone: 'Zone 3 - Central', priorityScore: 84, priorityLevel: 'Critical', status: 'In Progress', reportedBy: citizen1._id, supportingUsers: [citizen1._id, citizen2._id], supportCount: 6, department: deptMap.ROADS._id, assignedWorker: fw1._id, assignedAt: new Date(), tags: ['pothole', 'metro-hazard'] });
      const is2 = await Issue.create({ title: 'Secondary Pothole Cluster on Service Road', description: 'Multiple asphalt cracks expanding on service road.', category: 'Road damage', categoryConfidence: 0.91, classificationSource: 'ai_suggested', location: { type: 'Point', coordinates: [77.5970, 12.9735] }, address: 'Church Street Corner, MG Road', zone: 'Zone 3 - Central', priorityScore: 68, priorityLevel: 'High', status: 'Reported', reportedBy: citizen2._id, supportCount: 3, department: deptMap.ROADS._id, tags: ['road-damage'] });
      const is3 = await Issue.create({ title: 'Overflowing Commercial Garbage Dump on Sidewalk', description: 'Large pile of restaurant garbage blocking sidewalk with foul smell.', category: 'Garbage', categoryConfidence: 0.96, classificationSource: 'ai_suggested', location: { type: 'Point', coordinates: [77.6030, 12.9790] }, address: 'Behind Commercial Complex, Brigade Road', zone: 'Zone 2 - East', priorityScore: 72, priorityLevel: 'High', status: 'In Progress', reportedBy: citizen1._id, supportCount: 5, department: deptMap.SANITATION._id, assignedWorker: fw2._id, assignedAt: new Date(), tags: ['garbage', 'sanitation'] });
      const is4 = await Issue.create({ title: 'Water Main Pipe Gushing Clean Water', description: 'Underground drinking water main cracked, causing a fountain of water flooding street.', category: 'Water leakage', categoryConfidence: 0.98, classificationSource: 'ai_suggested', location: { type: 'Point', coordinates: [77.5880, 12.9690] }, address: 'Near High School, Sampangi Rama Nagar', zone: 'Zone 1 - North', priorityScore: 89, priorityLevel: 'Critical', status: 'Under Review', reportedBy: citizen2._id, supportCount: 9, department: deptMap.WATER._id, tags: ['pipe-burst', 'leak'] });
      const is5 = await Issue.create({ title: 'Broken Streetlight with Exposed Wire', description: 'Streetlight pole hit by vehicle with exposed dangling wire.', category: 'Broken streetlight', categoryConfidence: 0.94, classificationSource: 'ai_suggested', location: { type: 'Point', coordinates: [77.5860, 12.9660] }, address: 'Lalbagh Road Junction', zone: 'Zone 4 - South', priorityScore: 92, priorityLevel: 'Critical', status: 'Assigned', reportedBy: citizen1._id, supportCount: 4, department: deptMap.LIGHTING._id, assignedWorker: fw3._id, assignedAt: new Date(), tags: ['electrical-hazard'] });
      const is6 = await Issue.create({ title: 'Cracked Pedestrian Overbridge Handrail', description: 'Iron handrail severed on footbridge stairs, safety hazard.', category: 'Damaged public infrastructure', categoryConfidence: 0.9, classificationSource: 'user_selected', location: { type: 'Point', coordinates: [77.6045, 12.9810] }, address: 'Trinity Circle Skywalk', zone: 'Zone 2 - East', priorityScore: 78, priorityLevel: 'High', status: 'Resolved', reportedBy: citizen1._id, supportCount: 4, department: deptMap.ROADS._id, assignedWorker: fw1._id, resolvedAt: new Date(), verification: { status: 'pending' }, tags: ['footbridge', 'broken-railing'] });

      // Evidence & Updates
      const ev1 = await IssueEvidence.create({ issue: is1._id, uploadedBy: citizen1._id, evidenceType: 'initial_report', fileUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80', caption: 'Pothole photo evidence' });
      const ev6 = await IssueEvidence.create({ issue: is6._id, uploadedBy: worker1._id, evidenceType: 'resolution', fileUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', caption: 'Handrail welded and safety painted' });

      await IssueUpdate.create([
        { issue: is1._id, updatedBy: citizen1._id, newStatus: 'Reported', action: 'REPORTED', comment: 'Citizen reported hazardous pothole', evidence: ev1._id },
        { issue: is1._id, updatedBy: deptAdminRoads._id, previousStatus: 'Reported', newStatus: 'Assigned', action: 'ASSIGNED', comment: 'Assigned to field technician Rajesh Kumar' },
        { issue: is1._id, updatedBy: worker1._id, previousStatus: 'Assigned', newStatus: 'In Progress', action: 'IN_PROGRESS', comment: 'Crew on site with asphalt repair vehicle' },
        { issue: is6._id, updatedBy: worker1._id, previousStatus: 'In Progress', newStatus: 'Resolved', action: 'RESOLVED', comment: 'Welding completed, awaiting citizen verification', evidence: ev6._id }
      ]);

      await Notification.create([
        { recipient: citizen1._id, type: 'verification_request', title: 'Verify Resolution: Pedestrian Bridge', message: 'Field worker marked overbridge handrail as resolved. Please verify.', relatedIssue: is6._id },
        { recipient: worker1._id, type: 'issue_assigned', title: 'New Task: Metro Pothole', message: 'Critical pothole repair assigned to you.', relatedIssue: is1._id }
      ]);

      await updateGeographicClusters();
      console.log('✅ [Server Startup] Demo data auto-seeded successfully.');
    }
  } catch (seedErr) {
    console.warn('⚠️ [Startup Seed Notice]:', seedErr.message);
  }
});

// Initialize Socket.io
initSocket(server);

// Security & utility middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const corsOptions = {
  origin: (origin, callback) => {
    // Dynamic origin allowance for localhost, Vercel deployments, Render, and API tools
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static evidence uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown';

  res.status(200).json({
    success: true,
    message: 'CivicPulse API is running',
    timestamp: new Date().toISOString(),
    service: 'CivicPulse Platform',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbState,
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'civicpulse'
    }
  });
});

// Mount Routes (lazy or imported)
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/issues', require('./src/routes/issueRoutes'));
app.use('/api/assignments', require('./src/routes/assignmentRoutes'));
app.use('/api/departments', require('./src/routes/departmentRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`📡 [CivicPulse API] Server listening on http://localhost:${PORT}`);
  console.log(`🩺 [Health Check] http://localhost:${PORT}/api/health`);
});

module.exports = { app, server };
