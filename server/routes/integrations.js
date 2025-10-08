import express from 'express';
import db from '../database/db.js';
import { generateId } from '../utils/generateId.js';
import { enrichFieldMappings } from '../utils/enrichFieldMappings.js';

const router = express.Router();

// Get all integrations
router.get('/', async (req, res) => {
  try {
    const integrations = db.prepare(`
      SELECT * FROM integrations ORDER BY created_at DESC
    `).all();

    // Parse JSON fields and enrich with xmlPath
    const parsed = await Promise.all(integrations.map(async integration => {
      const fieldMappings = integration.field_mappings ? JSON.parse(integration.field_mappings) : [];
      const enrichedMappings = await enrichFieldMappings(fieldMappings, integration.workday_service);

      return {
        ...integration,
        field_mappings: enrichedMappings,
        choice_selections: integration.choice_selections ? JSON.parse(integration.choice_selections) : {},
        choice_field_values: integration.choice_field_values ? JSON.parse(integration.choice_field_values) : {},
        sample_file_headers: integration.sample_file_headers ? JSON.parse(integration.sample_file_headers) : [],
        sample_file_data: integration.sample_file_data ? JSON.parse(integration.sample_file_data) : [],
        parsed_attributes: integration.parsed_attributes ? JSON.parse(integration.parsed_attributes) : [],
        validation_enabled: Boolean(integration.validation_enabled)
      };
    }));

    res.json(parsed);
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single integration by ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`[GET /integrations/:id] Fetching integration: ${req.params.id}`);
    const integration = db.prepare(`
      SELECT * FROM integrations WHERE id = ?
    `).get(req.params.id);

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    console.log(`[GET /integrations/:id] Found integration: ${integration.name}, service: ${integration.workday_service}`);

    // Parse JSON fields and enrich with xmlPath
    const fieldMappings = integration.field_mappings ? JSON.parse(integration.field_mappings) : [];
    console.log(`[GET /integrations/:id] Parsed ${fieldMappings.length} field mappings, calling enrichFieldMappings...`);
    const enrichedMappings = await enrichFieldMappings(fieldMappings, integration.workday_service);
    console.log(`[GET /integrations/:id] Enrichment complete, returning ${enrichedMappings.length} mappings`);

    const parsed = {
      ...integration,
      field_mappings: enrichedMappings,
      choice_selections: integration.choice_selections ? JSON.parse(integration.choice_selections) : {},
      choice_field_values: integration.choice_field_values ? JSON.parse(integration.choice_field_values) : {},
      sample_file_headers: integration.sample_file_headers ? JSON.parse(integration.sample_file_headers) : [],
      sample_file_data: integration.sample_file_data ? JSON.parse(integration.sample_file_data) : [],
      parsed_attributes: integration.parsed_attributes ? JSON.parse(integration.parsed_attributes) : [],
      validation_enabled: Boolean(integration.validation_enabled)
    };

    res.json(parsed);
  } catch (error) {
    console.error('Error fetching integration:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new integration
router.post('/', (req, res) => {
  try {
    const id = generateId();
    const {
      name,
      description,
      workday_service,
      status,
      field_mappings,
      choice_selections,
      choice_field_values,
      sample_file_url,
      sample_file_name,
      sample_file_headers,
      sample_file_data,
      sample_row_data,
      parsed_attributes,
      validation_enabled,
      validation_service,
      webhook_url
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO integrations (
        id, name, description, workday_service, status,
        field_mappings, choice_selections, choice_field_values,
        sample_file_url, sample_file_name, sample_file_headers, sample_file_data, sample_row_data,
        parsed_attributes, validation_enabled, validation_service, webhook_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      name,
      description || null,
      workday_service,
      status || 'draft',
      field_mappings ? JSON.stringify(field_mappings) : null,
      choice_selections ? JSON.stringify(choice_selections) : null,
      choice_field_values ? JSON.stringify(choice_field_values) : null,
      sample_file_url || null,
      sample_file_name || null,
      sample_file_headers ? JSON.stringify(sample_file_headers) : null,
      sample_file_data ? JSON.stringify(sample_file_data) : null,
      sample_row_data ? JSON.stringify(sample_row_data) : null,
      parsed_attributes ? JSON.stringify(parsed_attributes) : null,
      validation_enabled ? 1 : 0,
      validation_service || null,
      webhook_url || null
    );

    // Fetch and return the created integration
    const created = db.prepare('SELECT * FROM integrations WHERE id = ?').get(id);

    res.status(201).json({
      ...created,
      field_mappings: created.field_mappings ? JSON.parse(created.field_mappings) : [],
      choice_selections: created.choice_selections ? JSON.parse(created.choice_selections) : {},
      choice_field_values: created.choice_field_values ? JSON.parse(created.choice_field_values) : {},
      sample_file_headers: created.sample_file_headers ? JSON.parse(created.sample_file_headers) : [],
      sample_file_data: created.sample_file_data ? JSON.parse(created.sample_file_data) : [],
      parsed_attributes: created.parsed_attributes ? JSON.parse(created.parsed_attributes) : [],
      validation_enabled: Boolean(created.validation_enabled)
    });
  } catch (error) {
    console.error('Error creating integration:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update integration
router.put('/:id', (req, res) => {
  try {
    const {
      name,
      description,
      workday_service,
      status,
      field_mappings,
      choice_selections,
      choice_field_values,
      sample_file_url,
      sample_file_name,
      sample_file_headers,
      sample_file_data,
      sample_row_data,
      parsed_attributes,
      validation_enabled,
      validation_service,
      webhook_url
    } = req.body;

    const stmt = db.prepare(`
      UPDATE integrations SET
        name = ?,
        description = ?,
        workday_service = ?,
        status = ?,
        field_mappings = ?,
        choice_selections = ?,
        choice_field_values = ?,
        sample_file_url = ?,
        sample_file_name = ?,
        sample_file_headers = ?,
        sample_file_data = ?,
        sample_row_data = ?,
        parsed_attributes = ?,
        validation_enabled = ?,
        validation_service = ?,
        webhook_url = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `);

    const result = stmt.run(
      name,
      description || null,
      workday_service,
      status || 'draft',
      field_mappings ? JSON.stringify(field_mappings) : null,
      choice_selections ? JSON.stringify(choice_selections) : null,
      choice_field_values ? JSON.stringify(choice_field_values) : null,
      sample_file_url || null,
      sample_file_name || null,
      sample_file_headers ? JSON.stringify(sample_file_headers) : null,
      sample_file_data ? JSON.stringify(sample_file_data) : null,
      sample_row_data ? JSON.stringify(sample_row_data) : null,
      parsed_attributes ? JSON.stringify(parsed_attributes) : null,
      validation_enabled ? 1 : 0,
      validation_service || null,
      webhook_url || null,
      req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    // Fetch and return the updated integration
    const updated = db.prepare('SELECT * FROM integrations WHERE id = ?').get(req.params.id);

    res.json({
      ...updated,
      field_mappings: updated.field_mappings ? JSON.parse(updated.field_mappings) : [],
      choice_selections: updated.choice_selections ? JSON.parse(updated.choice_selections) : {},
      choice_field_values: updated.choice_field_values ? JSON.parse(updated.choice_field_values) : {},
      sample_file_headers: updated.sample_file_headers ? JSON.parse(updated.sample_file_headers) : [],
      sample_file_data: updated.sample_file_data ? JSON.parse(updated.sample_file_data) : [],
      parsed_attributes: updated.parsed_attributes ? JSON.parse(updated.parsed_attributes) : [],
      validation_enabled: Boolean(updated.validation_enabled)
    });
  } catch (error) {
    console.error('Error updating integration:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete integration
router.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM integrations WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.json({ message: 'Integration deleted successfully' });
  } catch (error) {
    console.error('Error deleting integration:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
