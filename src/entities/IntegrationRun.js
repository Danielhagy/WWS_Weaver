import { generateId } from '@/utils';

// Mock local storage-based database for Integration Runs
const STORAGE_KEY = 'workday_integration_runs';

// Mock data - sample integration runs
const INITIAL_RUNS = [
  {
    id: 'run-001',
    integration_id: 'int-001',
    integration_name: 'New Hire Personal Info',
    status: 'success',
    trigger_type: 'webhook',
    records_processed: 15,
    records_failed: 0,
    created_date: '2025-09-29T14:22:00Z',
    completed_date: '2025-09-29T14:22:45Z'
  },
  {
    id: 'run-002',
    integration_id: 'int-002',
    integration_name: 'Time Off Requests',
    status: 'success',
    trigger_type: 'manual',
    records_processed: 8,
    records_failed: 0,
    created_date: '2025-09-28T11:45:00Z',
    completed_date: '2025-09-28T11:45:32Z'
  },
  {
    id: 'run-003',
    integration_id: 'int-001',
    integration_name: 'New Hire Personal Info',
    status: 'failed',
    trigger_type: 'webhook',
    records_processed: 3,
    records_failed: 2,
    error_message: 'Invalid date format in row 4',
    created_date: '2025-09-27T09:15:00Z',
    completed_date: '2025-09-27T09:15:18Z'
  },
  {
    id: 'run-004',
    integration_id: 'int-002',
    integration_name: 'Time Off Requests',
    status: 'success',
    trigger_type: 'webhook',
    records_processed: 12,
    records_failed: 0,
    created_date: '2025-09-26T16:30:00Z',
    completed_date: '2025-09-26T16:30:55Z'
  },
  {
    id: 'run-005',
    integration_id: 'int-001',
    integration_name: 'New Hire Personal Info',
    status: 'success',
    trigger_type: 'manual',
    records_processed: 20,
    records_failed: 0,
    created_date: '2025-09-25T13:10:00Z',
    completed_date: '2025-09-25T13:11:05Z'
  }
];

// Initialize storage with sample data if empty
function initStorage() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RUNS));
  }
}

// Get all runs from storage
function getFromStorage() {
  initStorage();
  const data = localStorage.getItem(STORAGE_KEY);
  return JSON.parse(data) || [];
}

// Save runs to storage
function saveToStorage(runs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
}

export const IntegrationRun = {
  // List all runs with optional sorting and limit
  async list(sortBy = '-created_date', limit = null) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    let runs = getFromStorage();
    
    // Simple sorting
    const [direction, field] = sortBy.startsWith('-') 
      ? ['-', sortBy.slice(1)] 
      : ['+', sortBy];
    
    runs.sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return direction === '-' ? -comparison : comparison;
    });
    
    if (limit) {
      runs = runs.slice(0, limit);
    }
    
    return runs;
  },

  // Filter runs by criteria
  async filter(criteria, sortBy = '-created_date', limit = null) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    let runs = getFromStorage();
    
    // Apply filters
    Object.keys(criteria).forEach(key => {
      runs = runs.filter(run => run[key] === criteria[key]);
    });
    
    // Sort
    const [direction, field] = sortBy.startsWith('-') 
      ? ['-', sortBy.slice(1)] 
      : ['+', sortBy];
    
    runs.sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return direction === '-' ? -comparison : comparison;
    });
    
    if (limit) {
      runs = runs.slice(0, limit);
    }
    
    return runs;
  },

  // Create a new run
  async create(data) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const runs = getFromStorage();
    const newRun = {
      ...data,
      id: generateId(),
      created_date: new Date().toISOString(),
      status: data.status || 'pending'
    };
    
    runs.push(newRun);
    saveToStorage(runs);
    
    return newRun;
  },

  // Update a run
  async update(id, updates) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const runs = getFromStorage();
    const index = runs.findIndex(r => r.id === id);
    
    if (index !== -1) {
      runs[index] = { ...runs[index], ...updates };
      saveToStorage(runs);
      return runs[index];
    }
    
    return null;
  }
};
