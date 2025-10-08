/**
 * Utility to enrich field_mappings with xmlPath from field definitions
 * This migrates old mappings that only have target_field to include xmlPath
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load field definitions from the frontend config files
const configPath = join(__dirname, '../../src/config');

async function loadFieldDefinitions() {
  const { CREATE_POSITION_FIELDS } = await import(`file://${join(configPath, 'createPositionFields.js')}`);
  const { CONTRACT_CONTINGENT_WORKER_FIELDS } = await import(`file://${join(configPath, 'contractContingentWorkerFields.js')}`);
  const { END_CONTINGENT_WORKER_CONTRACT_FIELDS } = await import(`file://${join(configPath, 'endContingentWorkerContractFields.js')}`);
  const { PUT_POSITION_FIELDS } = await import(`file://${join(configPath, 'putPositionFields.js')}`);

  return {
    CREATE_POSITION_FIELDS,
    CONTRACT_CONTINGENT_WORKER_FIELDS,
    END_CONTINGENT_WORKER_CONTRACT_FIELDS,
    PUT_POSITION_FIELDS
  };
}

/**
 * Enrich field mappings with xmlPath by looking up field definitions
 * @param {Array} fieldMappings - Array of field mapping objects
 * @param {string} workdayService - The Workday service name
 * @returns {Promise<Array>} - Enriched field mappings with xmlPath
 */
export async function enrichFieldMappings(fieldMappings, workdayService) {
  console.log(`[enrichFieldMappings] Called with service: ${workdayService}, mappings count: ${fieldMappings?.length || 0}`);

  if (!fieldMappings || fieldMappings.length === 0) {
    console.log('[enrichFieldMappings] No mappings to enrich, returning early');
    return fieldMappings;
  }

  // Load field definitions dynamically
  const fieldDefs = await loadFieldDefinitions();
  console.log('[enrichFieldMappings] Field definitions loaded successfully');

  // Map of service names to their field definitions
  const FIELD_DEFINITIONS_MAP = {
    'create_position': fieldDefs.CREATE_POSITION_FIELDS,
    'contract_contingent_worker': fieldDefs.CONTRACT_CONTINGENT_WORKER_FIELDS,
    'end_contingent_worker_contract': fieldDefs.END_CONTINGENT_WORKER_CONTRACT_FIELDS,
    'put_position': fieldDefs.PUT_POSITION_FIELDS
  };

  // Get field definitions for this service
  const fieldDefinitions = FIELD_DEFINITIONS_MAP[workdayService];
  if (!fieldDefinitions) {
    console.warn(`[enrichFieldMappings] No field definitions found for service: ${workdayService}`);
    return fieldMappings;
  }

  // Enrich each mapping with xmlPath if missing
  const enrichedMappings = fieldMappings.map(mapping => {
    // If xmlPath already exists, return as-is
    if (mapping.xmlPath) {
      console.log(`[enrichFieldMappings] Mapping for ${mapping.target_field} already has xmlPath: ${mapping.xmlPath}`);
      return mapping;
    }

    // Find the field definition by target_field name
    const fieldDef = fieldDefinitions.find(f => f.name === mapping.target_field);

    if (fieldDef && fieldDef.xmlPath) {
      console.log(`[enrichFieldMappings] Added xmlPath to ${mapping.target_field}: ${fieldDef.xmlPath}`);
      return {
        ...mapping,
        xmlPath: fieldDef.xmlPath
      };
    }

    // If no field definition found, log warning and return original
    console.warn(`[enrichFieldMappings] No xmlPath found for field: ${mapping.target_field}`);
    return mapping;
  });

  console.log(`[enrichFieldMappings] Enriched ${enrichedMappings.length} mappings`);
  return enrichedMappings;
}
