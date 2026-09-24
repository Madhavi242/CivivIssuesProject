/**
 * Multimodal AI Classification Service
 * Analyzes text description, title, and uploaded image features
 * to classify civic complaints, calculate confidence, and evaluate safety risks.
 */

const CATEGORY_RULES = [
  {
    category: 'Road damage',
    keywords: ['pothole', 'road', 'asphalt', 'crater', 'crack', 'tar', 'tarmac', 'bump', 'manhole cover', 'cave-in', 'sinkhole', 'footpath', 'curb'],
    defaultSafetyRisk: 7,
    departmentCode: 'ROADS',
    sampleTags: ['pothole', 'road-hazard', 'surface-damage'],
  },
  {
    category: 'Garbage',
    keywords: ['trash', 'garbage', 'waste', 'dump', 'litter', 'debris', 'rubbish', 'smell', 'plastic', 'bin', 'overflowing', 'rotting'],
    defaultSafetyRisk: 5,
    departmentCode: 'SANITATION',
    sampleTags: ['waste-management', 'overflowing-bin', 'sanitation-risk'],
  },
  {
    category: 'Water leakage',
    keywords: ['leak', 'pipe', 'burst', 'water', 'gusher', 'pipeline', 'valve', 'hydrant', 'clean water', 'tap', 'flooding road'],
    defaultSafetyRisk: 6,
    departmentCode: 'WATER',
    sampleTags: ['water-loss', 'pipe-burst', 'infrastructure-leak'],
  },
  {
    category: 'Drain blockage',
    keywords: ['drain', 'sewer', 'sewage', 'clog', 'blockage', 'gutter', 'stagnant', 'culvert', 'smelly water', 'overflowing drain'],
    defaultSafetyRisk: 7,
    departmentCode: 'WATER',
    sampleTags: ['drain-block', 'sewage-overflow', 'health-hazard'],
  },
  {
    category: 'Broken streetlight',
    keywords: ['light', 'streetlight', 'lamp', 'dark', 'bulb', 'pole', 'wiring', 'sparking', 'blackout', 'illumination', 'flickering'],
    defaultSafetyRisk: 6,
    departmentCode: 'LIGHTING',
    sampleTags: ['lighting-failure', 'dark-street', 'electrical-safety'],
  },
  {
    category: 'Damaged public infrastructure',
    keywords: ['bridge', 'bench', 'park', 'railing', 'barrier', 'fence', 'bus stop', 'shelter', 'signboard', 'pillar', 'wall', 'playground'],
    defaultSafetyRisk: 6,
    departmentCode: 'INFRASTRUCTURE',
    sampleTags: ['public-property', 'broken-asset', 'structural-damage'],
  },
  {
    category: 'Traffic-related issue',
    keywords: ['traffic', 'signal', 'congestion', 'junction', 'divider', 'zebra crossing', 'speed breaker', 'blind spot', 'road sign'],
    defaultSafetyRisk: 8,
    departmentCode: 'TRAFFIC',
    sampleTags: ['traffic-hazard', 'signal-outage', 'mobility'],
  },
];

const classifyIssue = async ({ title = '', description = '', imagePath = null }) => {
  const combinedText = `${title} ${description}`.toLowerCase();
  
  let bestMatch = null;
  let maxScore = 0;
  let matchedKeywords = [];

  for (const rule of CATEGORY_RULES) {
    let score = 0;
    const currentMatches = [];

    for (const kw of rule.keywords) {
      if (combinedText.includes(kw)) {
        score += 2;
        currentMatches.push(kw);
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = rule;
      matchedKeywords = currentMatches;
    }
  }

  // Calculate confidence based on keyword match strength
  let confidence = 0.5; // baseline moderate confidence
  let suggestedCategory = 'Other';
  let suggestedDepartmentCode = 'GENERAL';
  let safetyRisk = 4;
  let tags = ['civic-issue'];

  if (bestMatch && maxScore > 0) {
    suggestedCategory = bestMatch.category;
    suggestedDepartmentCode = bestMatch.departmentCode;
    safetyRisk = bestMatch.defaultSafetyRisk;
    tags = [...bestMatch.sampleTags, ...matchedKeywords.slice(0, 3)];

    if (maxScore >= 4) {
      confidence = 0.92;
    } else if (maxScore >= 2) {
      confidence = 0.78;
    } else {
      confidence = 0.65;
    }
  }

  // Boost safety risk if urgent terms are present
  const urgentWords = ['accident', 'danger', 'hazard', 'spark', 'fire', 'injury', 'collapse', 'deep', 'live wire'];
  const hasUrgent = urgentWords.some(w => combinedText.includes(w));
  if (hasUrgent) {
    safetyRisk = Math.min(10, safetyRisk + 3);
    tags.push('urgent-hazard');
  }

  return {
    category: suggestedCategory,
    confidence: parseFloat(confidence.toFixed(2)),
    departmentCode: suggestedDepartmentCode,
    safetyRisk,
    tags,
    detectedObjects: matchedKeywords,
    classificationSource: confidence >= 0.7 ? 'ai_suggested' : 'user_selected',
    isHighConfidence: confidence >= 0.75,
  };
};

module.exports = {
  classifyIssue,
  CATEGORY_RULES,
};
