/**
 * Fuzzy matching utility for intelligent field mapping
 * Uses multiple strategies to find the best match between source data and target fields
 */

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity score between two strings (0-1)
 */
function calculateSimilarity(str1, str2) {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1.0;
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - distance / maxLen;
}

/**
 * Normalize field name for comparison
 * Removes special characters, converts to lowercase, handles common variations
 */
function normalizeFieldName(name) {
  return name
    .toLowerCase()
    .replace(/[_\-\s]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

/**
 * Extract keywords from field name and description
 */
function extractKeywords(field) {
  const keywords = new Set();

  // Add field name words
  const nameWords = normalizeFieldName(field.name).split(' ');
  nameWords.forEach(word => {
    if (word.length > 2) keywords.add(word);
  });

  // Add description words
  if (field.description) {
    const descWords = normalizeFieldName(field.description).split(' ');
    descWords.forEach(word => {
      if (word.length > 3) keywords.add(word);
    });
  }

  // Add help text words
  if (field.helpText) {
    const helpWords = normalizeFieldName(field.helpText).split(' ');
    helpWords.forEach(word => {
      if (word.length > 3) keywords.add(word);
    });
  }

  return Array.from(keywords);
}

/**
 * Semantic matching patterns for common field types
 */
const SEMANTIC_PATTERNS = {
  email: ['email', 'mail', 'e-mail', 'emailaddress', 'email_address'],
  phone: ['phone', 'telephone', 'tel', 'mobile', 'cell', 'phonenumber', 'phone_number'],
  name: ['name', 'fullname', 'full_name', 'firstname', 'first_name', 'lastname', 'last_name'],
  location: ['location', 'loc', 'site', 'place', 'address', 'city', 'country', 'state'],
  organization: ['organization', 'org', 'company', 'department', 'dept', 'division', 'unit'],
  position: ['position', 'pos', 'job', 'title', 'jobtitle', 'job_title', 'role'],
  supervisor: ['supervisor', 'manager', 'boss', 'lead', 'chief', 'head'],
  date: ['date', 'startdate', 'start_date', 'enddate', 'end_date', 'effectivedate', 'effective_date'],
  id: ['id', 'identifier', 'code', 'number', 'num', 'ref', 'reference'],
  employee: ['employee', 'emp', 'worker', 'staff', 'personnel'],
  cost: ['cost', 'price', 'amount', 'salary', 'pay', 'compensation', 'rate'],
  time: ['time', 'hours', 'duration', 'period', 'shift'],
  type: ['type', 'category', 'class', 'classification', 'kind'],
  status: ['status', 'state', 'condition', 'stage'],
  description: ['description', 'desc', 'details', 'notes', 'comments', 'remarks'],
  requisition: ['requisition', 'req', 'request', 'order'],
  contract: ['contract', 'agreement', 'engagement', 'assignment']
};

/**
 * Detect semantic category of a field
 */
function detectSemanticCategory(fieldName) {
  const normalized = normalizeFieldName(fieldName);

  for (const [category, patterns] of Object.entries(SEMANTIC_PATTERNS)) {
    for (const pattern of patterns) {
      if (normalized.includes(pattern) || pattern.includes(normalized)) {
        return category;
      }
    }
  }

  return null;
}

/**
 * Calculate match score between source and target field
 * Returns a score from 0-100
 */
function calculateMatchScore(sourceField, targetField, sourceData) {
  let score = 0;

  const sourceName = normalizeFieldName(sourceData.displayName || sourceField);
  const targetName = normalizeFieldName(targetField.name);
  const sourceWords = sourceName.split(' ').filter(w => w.length > 0);
  const targetWords = targetName.split(' ').filter(w => w.length > 0);

  // Also check description field if available
  const targetDesc = targetField.description ? normalizeFieldName(targetField.description) : '';

  // 1. Check for exact match (100 points - instant high confidence)
  if (sourceName === targetName) {
    return 100;
  }

  // 2. Check if source is contained in target or vice versa (70-95 points)
  // This catches cases like "title" in "job posting title"
  if (targetName.includes(sourceName) || sourceName.includes(targetName)) {
    const ratio = Math.min(sourceName.length, targetName.length) / Math.max(sourceName.length, targetName.length);
    score += 70 + (ratio * 25);
  }

  // Also check description field for containment
  if (targetDesc && (targetDesc.includes(sourceName) || sourceName.includes(targetDesc))) {
    const ratio = Math.min(sourceName.length, targetDesc.length) / Math.max(sourceName.length, targetDesc.length);
    score = Math.max(score, 60 + (ratio * 20)); // Slightly lower than name match
  }

  // 3. Check for word-level exact matches (up to 50 points)
  let exactWordMatches = 0;
  let partialWordMatches = 0;

  for (const sourceWord of sourceWords) {
    if (sourceWord.length <= 2) continue; // Skip very short words like "id", "no"

    let foundMatch = false;
    for (const targetWord of targetWords) {
      if (targetWord.length <= 2) continue;

      if (sourceWord === targetWord) {
        exactWordMatches++;
        foundMatch = true;
        break;
      } else if (sourceWord.includes(targetWord) || targetWord.includes(sourceWord)) {
        const matchRatio = Math.min(sourceWord.length, targetWord.length) / Math.max(sourceWord.length, targetWord.length);
        if (matchRatio > 0.5) { // At least 50% overlap
          partialWordMatches++;
          foundMatch = true;
          break;
        }
      }
    }

    // If no match in name, check description
    if (!foundMatch && targetDesc) {
      const descWords = targetDesc.split(' ').filter(w => w.length > 2);
      for (const descWord of descWords) {
        if (sourceWord === descWord) {
          exactWordMatches += 0.8; // Slightly lower weight for description matches
          break;
        } else if (sourceWord.includes(descWord) || descWord.includes(sourceWord)) {
          const matchRatio = Math.min(sourceWord.length, descWord.length) / Math.max(sourceWord.length, descWord.length);
          if (matchRatio > 0.5) {
            partialWordMatches += 0.8;
            break;
          }
        }
      }
    }
  }

  // Weight exact word matches very heavily for high confidence
  const totalWords = Math.max(sourceWords.length, targetWords.length);
  if (totalWords > 0) {
    score += (exactWordMatches / totalWords) * 50;
    score += (partialWordMatches / totalWords) * 30;
  }

  // 4. Semantic category matching (up to 30 points)
  const sourceCategory = detectSemanticCategory(sourceName);
  const targetCategory = detectSemanticCategory(targetName);

  if (sourceCategory && targetCategory && sourceCategory === targetCategory) {
    score += 30;
  } else if (sourceCategory && targetCategory) {
    // Partial credit for related categories
    const relatedCategories = {
      name: ['employee', 'supervisor'],
      location: ['organization'],
      position: ['employee', 'job'],
      id: ['employee', 'position', 'requisition'],
      description: ['position', 'job', 'requisition']
    };

    if (relatedCategories[sourceCategory]?.includes(targetCategory) ||
        relatedCategories[targetCategory]?.includes(sourceCategory)) {
      score += 15;
    }
  }

  // 5. Levenshtein similarity as fallback (up to 15 points)
  const similarity = calculateSimilarity(sourceName, targetName);
  score += similarity * 15;

  // 6. Field type compatibility validation
  if (targetField.type && sourceData.sampleValue) {
    const targetType = targetField.type.toLowerCase();
    const sampleValue = String(sourceData.sampleValue).trim();

    // STRICT BOOLEAN VALIDATION: Boolean fields must have boolean values
    if (targetType === 'boolean') {
      // Only accept pure boolean representations (true/false, yes/no, t/f, 0/1)
      // Must be exact match - no other numbers or text allowed
      const isBooleanValue = /^(true|false|yes|no|t|f)$/i.test(sampleValue) ||
                             (sampleValue === '0' || sampleValue === '1');
      if (!isBooleanValue) {
        // Disqualify non-boolean values from matching boolean fields
        return 0;
      } else {
        // Bonus for valid boolean match
        score += 10;
      }
    }
    // Type compatibility bonuses for other types
    else if (targetType.includes('email') && sampleValue.includes('@')) {
      score += 10;
    } else if (targetType.includes('date') && /\d{4}-\d{2}-\d{2}/.test(sampleValue)) {
      score += 10;
    } else if (targetType.includes('number') && /^\d+$/.test(sampleValue)) {
      score += 10;
    }
  }

  return Math.min(score, 100);
}

/**
 * Find best match for a target field from available sources
 * Returns { source, score, sourceType } or null
 */
function findBestMatch(targetField, fileColumns, globalAttributes, existingMappings) {
  // Skip if already mapped
  if (existingMappings.some(m => m.target_field === targetField.name && m.source_type !== 'unmapped')) {
    return null;
  }

  let bestMatch = null;
  let bestScore = 0;
  const MIN_SCORE = 30; // Minimum confidence threshold

  // IMPORTANT: Boolean fields should NEVER auto-map from file columns
  // They need to be manually configured to evaluate file data as true/false
  const targetType = targetField.type ? targetField.type.toLowerCase() : '';
  const isBooleanField = targetType === 'boolean';

  // Check file columns first (higher priority) - BUT skip for boolean fields
  if (!isBooleanField) {
    for (const column of fileColumns) {
      const score = calculateMatchScore(column.value, targetField, column);

      if (score > bestScore && score >= MIN_SCORE) {
        bestScore = score;
        bestMatch = {
          source: column.value,
          score: score,
          sourceType: 'file_column',
          displayName: column.displayName || column.value,
          type_value: targetField.defaultType || null
        };
      }
    }
  }

  // Check global attributes (lower priority than file columns)
  // Only check global attributes for boolean fields OR if no file match found
  if (isBooleanField || !bestMatch) {
    for (const attr of globalAttributes) {
      const score = calculateMatchScore(attr.value, targetField, attr);

      // Reduce score slightly for global attributes to prefer file columns
      const adjustedScore = score * 0.95;

      if (adjustedScore > bestScore && adjustedScore >= MIN_SCORE) {
        bestScore = adjustedScore;
        bestMatch = {
          source: attr.value,
          score: adjustedScore,
          sourceType: 'global_attribute',
          displayName: attr.displayName || attr.value,
          type_value: targetField.defaultType || null
        };
      }
    }
  }

  return bestMatch;
}

/**
 * Auto-map all fields using fuzzy matching
 * Returns array of mappings and statistics
 */
export function autoMapFields(targetFields, fileColumns = [], globalAttributes = [], existingMappings = []) {
  const newMappings = [...existingMappings];
  const stats = {
    total: targetFields.length,
    mapped: 0,
    highConfidence: 0,
    mediumConfidence: 0,
    lowConfidence: 0,
    unmapped: 0
  };

  for (const field of targetFields) {
    const match = findBestMatch(field, fileColumns, globalAttributes, newMappings);

    if (match) {
      // Remove any existing mapping for this field
      const existingIndex = newMappings.findIndex(m => m.target_field === field.name);
      if (existingIndex >= 0) {
        newMappings.splice(existingIndex, 1);
      }

      // Add new mapping
      newMappings.push({
        target_field: field.name,
        source_type: match.sourceType,
        source_value: match.source,
        transformation: 'none',
        confidence: match.score,
        type_value: match.type_value
      });

      stats.mapped++;

      // Categorize by confidence
      if (match.score >= 70) {
        stats.highConfidence++;
      } else if (match.score >= 50) {
        stats.mediumConfidence++;
      } else {
        stats.lowConfidence++;
      }
    }
  }

  stats.unmapped = stats.total - stats.mapped;

  return { mappings: newMappings, stats };
}

/**
 * Get confidence level label
 */
export function getConfidenceLabel(score) {
  if (score >= 70) return 'High';
  if (score >= 50) return 'Medium';
  if (score >= 30) return 'Low';
  return 'Very Low';
}

/**
 * Get confidence color class
 */
export function getConfidenceColor(score) {
  if (score >= 70) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  if (score >= 30) return 'text-orange-600';
  return 'text-red-600';
}
