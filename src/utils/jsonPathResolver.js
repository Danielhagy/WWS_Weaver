// Smart JSON Path Resolver
// Resolves JSON paths using pattern matching instead of hardcoded array indices
// This ensures paths work across different environments and data structures

/**
 * Convert a path with array indices to a pattern-based path
 * Example: "request.attributes[0].name" becomes "request.attributes[*].name"
 * @param {string} path - The JSON path with array indices
 * @returns {object} - Pattern and matching strategy
 */
export function createPathPattern(path) {
  // Replace array indices with wildcards
  const pattern = path.replace(/\[\d+\]/g, '[*]');

  // Extract the search criteria from the path
  // e.g., for "request.attributes[*].name" we might want to match by config_id or name
  const parts = path.split('.');
  const arrayParts = parts.filter(part => part.includes('['));

  return {
    pattern,
    originalPath: path,
    requiresArrayMatching: arrayParts.length > 0,
    arrayParts
  };
}

/**
 * Resolve a JSON path pattern against actual data
 * Uses intelligent matching for arrays instead of relying on indices
 * @param {object} data - The JSON data to search
 * @param {string} pathPattern - The path pattern (e.g., "request.requester.email")
 * @param {object} matchCriteria - Optional criteria for matching array elements
 * @returns {*} - The resolved value
 */
export function resolveJsonPath(data, pathPattern, matchCriteria = null) {
  if (!data || !pathPattern) return null;

  const parts = pathPattern.split('.');
  let current = data;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    // Handle array wildcards
    if (part.includes('[*]')) {
      const arrayKey = part.replace('[*]', '');
      current = current[arrayKey];

      if (!Array.isArray(current)) {
        return null;
      }

      // If we have match criteria, find the matching element
      if (matchCriteria) {
        current = findMatchingArrayElement(current, matchCriteria);
        if (!current) return null;
      } else {
        // Default: use first element (but this should be avoided in production)
        current = current[0];
      }
    }
    // Handle specific array indices (for backward compatibility)
    else if (part.includes('[') && part.includes(']')) {
      const matches = part.match(/^(.+)\[(\d+)\]$/);
      if (matches) {
        const arrayKey = matches[1];
        const index = parseInt(matches[2]);
        current = current[arrayKey];

        if (!Array.isArray(current) || index >= current.length) {
          return null;
        }

        current = current[index];
      }
    }
    // Handle regular object property
    else {
      if (current === null || current === undefined) {
        return null;
      }
      current = current[part];
    }

    if (current === undefined) {
      return null;
    }
  }

  return current;
}

/**
 * Find a matching element in an array based on criteria
 * @param {Array} array - Array to search
 * @param {object} criteria - Matching criteria (e.g., {name: "Requester", type: "user"})
 * @returns {*} - Matching element or null
 */
function findMatchingArrayElement(array, criteria) {
  if (!Array.isArray(array)) return null;

  // Try to find exact match
  const exactMatch = array.find(item => {
    return Object.keys(criteria).every(key => {
      return item[key] === criteria[key];
    });
  });

  if (exactMatch) return exactMatch;

  // Try partial match (useful for flexible matching)
  const partialMatch = array.find(item => {
    return Object.keys(criteria).some(key => {
      return item[key] === criteria[key];
    });
  });

  return partialMatch || array[0]; // Fallback to first element
}

/**
 * Create a smart path mapping that includes matching strategy
 * This is what gets stored in the field mapping configuration
 * @param {string} displayName - User-friendly name (e.g., "Requester Email")
 * @param {string} jsonPath - The JSON path (e.g., "request.requester.email")
 * @param {object} sampleData - Sample data for creating match criteria
 * @returns {object} - Smart mapping configuration
 */
export function createSmartMapping(displayName, jsonPath, sampleData = null) {
  const pattern = createPathPattern(jsonPath);

  // If this path involves arrays, try to infer matching criteria
  const matchingStrategy = inferMatchingStrategy(jsonPath, sampleData);

  return {
    displayName,
    jsonPath,
    pathPattern: pattern.pattern,
    matchingStrategy,
    type: 'smart_json_path'
  };
}

/**
 * Infer a matching strategy from the path and sample data
 * This helps create consistent matching across environments
 * @param {string} jsonPath - The JSON path
 * @param {object} sampleData - Sample data to analyze
 * @returns {object|null} - Matching strategy or null
 */
function inferMatchingStrategy(jsonPath, sampleData) {
  if (!jsonPath.includes('[') || !sampleData) return null;

  // Parse the path to understand the structure
  // For example: "request.attributes[0].data"
  // We want to match based on "name" or "config_id" fields in attributes array

  const parts = jsonPath.split('.');
  let strategy = null;

  // Look for arrays in the path
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.includes('[')) {
      const arrayKey = part.replace(/\[\d+\]/, '');

      // Navigate to this array in sample data
      let current = sampleData;
      for (let j = 0; j < i; j++) {
        current = current[parts[j]];
        if (!current) break;
      }

      if (current && Array.isArray(current[arrayKey]) && current[arrayKey].length > 0) {
        const firstElement = current[arrayKey][0];

        // Look for stable identifiers in the array element
        const stableFields = ['config_id', 'name', 'id', 'type', 'key'];
        const matchFields = {};

        stableFields.forEach(field => {
          if (firstElement[field] !== undefined) {
            matchFields[field] = firstElement[field];
          }
        });

        if (Object.keys(matchFields).length > 0) {
          strategy = {
            arrayPath: parts.slice(0, i + 1).join('.').replace(/\[\d+\]/, ''),
            matchFields,
            description: `Match by ${Object.keys(matchFields).join(', ')}`
          };
          break;
        }
      }
    }
  }

  return strategy;
}

/**
 * Apply a smart mapping to extract data from JSON
 * @param {object} jsonData - The source JSON data
 * @param {object} smartMapping - The smart mapping configuration
 * @returns {*} - Extracted value
 */
export function applySmartMapping(jsonData, smartMapping) {
  if (!smartMapping || smartMapping.type !== 'smart_json_path') {
    // Fallback to simple path resolution
    return resolveJsonPath(jsonData, smartMapping?.jsonPath || '');
  }

  return resolveJsonPath(
    jsonData,
    smartMapping.pathPattern,
    smartMapping.matchingStrategy?.matchFields
  );
}

/**
 * Generate user-friendly description of what a path does
 * @param {string} jsonPath - The JSON path
 * @returns {string} - Description
 */
export function describeJsonPath(jsonPath) {
  const parts = jsonPath.split('.');
  const readable = parts.map(part => {
    // Remove array indices
    return part.replace(/\[\d+\]/, '').replace(/_/g, ' ');
  });

  return readable.join(' → ');
}
