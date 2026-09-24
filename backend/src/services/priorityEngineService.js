/**
 * CivicPulse Configurable Priority Engine
 * Calculates normalized composite priority scores and severity levels
 * for civic issues using transparent decision-support parameters.
 */

const DEFAULT_CONFIG = {
  weights: {
    safetyRisk: 0.30,         // Weight for immediate public hazard
    severity: 0.25,           // Weight for structural/physical extent
    locationImportance: 0.15, // Weight for school, hospital, transit, arterial road
    supportingReports: 0.15,  // Weight for citizen validation / volume
    durationHours: 0.10,      // Weight for unresolved duration (escalation)
    evidenceConfidence: 0.05, // Weight for verified photo/multimodal confidence
  },
  thresholds: {
    lowMax: 30,
    mediumMax: 60,
    highMax: 80,
    // > 80 is Critical
  },
};

const calculatePriority = ({
  safetyRisk = 3,           // 1 to 10
  severity = 3,             // 1 to 10
  locationImportance = 3,   // 1 to 10
  supportingReports = 1,    // 1 to 100+
  durationHours = 0,        // 0 to 500+
  evidenceConfidence = 0.8, // 0 to 1
  customConfig = null,
}) => {
  const cfg = customConfig || DEFAULT_CONFIG;

  // 1. Normalize each factor to a 0.0 - 1.0 scale
  const normSafety = Math.min(1.0, Math.max(0, safetyRisk / 10));
  const normSeverity = Math.min(1.0, Math.max(0, severity / 10));
  const normLocation = Math.min(1.0, Math.max(0, locationImportance / 10));
  
  // Logarithmic scale for citizen support: 1 report = 0.1, 5 reports = 0.5, 10+ reports = 1.0
  const normSupport = Math.min(1.0, Math.max(0.1, Math.log10(supportingReports + 1) / 1.04));

  // Time escalation: After 24h, priority gradually increases up to 120h (5 days)
  const normDuration = Math.min(1.0, Math.max(0, durationHours / 120));

  const normEvidence = Math.min(1.0, Math.max(0, evidenceConfidence));

  // 2. Weighted Sum
  const weightedSum =
    normSafety * cfg.weights.safetyRisk +
    normSeverity * cfg.weights.severity +
    normLocation * cfg.weights.locationImportance +
    normSupport * cfg.weights.supportingReports +
    normDuration * cfg.weights.durationHours +
    normEvidence * cfg.weights.evidenceConfidence;

  // 3. Scale to 0-100
  const rawScore = weightedSum * 100;
  const priorityScore = Math.min(100, Math.max(1, Math.round(rawScore)));

  // 4. Map to Priority Level
  let priorityLevel = 'Low';
  if (priorityScore > cfg.thresholds.highMax) {
    priorityLevel = 'Critical';
  } else if (priorityScore > cfg.thresholds.mediumMax) {
    priorityLevel = 'High';
  } else if (priorityScore > cfg.thresholds.lowMax) {
    priorityLevel = 'Medium';
  } else {
    priorityLevel = 'Low';
  }

  return {
    priorityScore,
    priorityLevel,
    priorityFactors: {
      safetyRisk: Number(safetyRisk),
      severity: Number(severity),
      locationImportance: Number(locationImportance),
      supportingReports: Number(supportingReports),
      durationHours: Number(durationHours),
      evidenceConfidence: parseFloat(Number(evidenceConfidence).toFixed(2)),
    },
    factorBreakdown: {
      safetyContribution: Math.round(normSafety * cfg.weights.safetyRisk * 100),
      severityContribution: Math.round(normSeverity * cfg.weights.severity * 100),
      locationContribution: Math.round(normLocation * cfg.weights.locationImportance * 100),
      supportContribution: Math.round(normSupport * cfg.weights.supportingReports * 100),
      durationContribution: Math.round(normDuration * cfg.weights.durationHours * 100),
    },
  };
};

module.exports = {
  calculatePriority,
  DEFAULT_CONFIG,
};
