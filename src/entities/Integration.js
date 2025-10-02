import { generateId } from '@/utils';

// Mock local storage-based database for Integrations
const STORAGE_KEY = 'workday_integrations';

// Mock data - sample integrations
const INITIAL_INTEGRATIONS = [
  {
    id: 'int-001',
    name: 'New Hire Personal Info',
    description: 'Import new employee personal information from CSV',
    workday_service: 'Submit_Employee_Personal_Info',
    status: 'active',
    field_mappings: [
      { source_field: 'emp_id', target_field: 'Employee_ID', transformation: 'none' },
      { source_field: 'first_name', target_field: 'First_Name', transformation: 'none' },
      { source_field: 'last_name', target_field: 'Last_Name', transformation: 'none' },
      { source_field: 'email', target_field: 'Email', transformation: 'lowercase' },
      { source_field: 'birth_date', target_field: 'Date_of_Birth', transformation: 'format-date' }
    ],
    sample_file_headers: ['emp_id', 'first_name', 'last_name', 'email', 'birth_date'],
    parsed_attributes: [
      { value: 'company_code', label: 'company_code', scope: 'global' },
      { value: 'department', label: 'department', scope: 'global' }
    ],
    validation_enabled: true,
    webhook_url: 'https://api.workdayweaver.com/webhooks/int-001',
    created_date: '2025-09-15T10:30:00Z',
    last_run_date: '2025-09-29T14:22:00Z'
  },
  {
    id: 'int-002',
    name: 'Time Off Requests',
    description: 'Process employee time off requests',
    workday_service: 'Submit_Time_Off',
    status: 'active',
    field_mappings: [
      { source_field: 'employee_id', target_field: 'Employee_ID', transformation: 'none' },
      { source_field: 'start', target_field: 'Start_Date', transformation: 'format-date' },
      { source_field: 'end', target_field: 'End_Date', transformation: 'format-date' },
      { source_field: 'type', target_field: 'Time_Off_Type', transformation: 'none' }
    ],
    sample_file_headers: ['employee_id', 'start', 'end', 'type'],
    parsed_attributes: [
      { value: 'approver_email', label: 'approver_email', scope: 'global' }
    ],
    validation_enabled: false,
    webhook_url: 'https://api.workdayweaver.com/webhooks/int-002',
    created_date: '2025-09-20T09:15:00Z',
    last_run_date: '2025-09-28T11:45:00Z'
  }
];

// Initialize storage with sample data if empty
function initStorage() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INTEGRATIONS));
  }
}

// Get all integrations from storage
function getFromStorage() {
  initStorage();
  const data = localStorage.getItem(STORAGE_KEY);
  return JSON.parse(data) || [];
}

// Save integrations to storage
function saveToStorage(integrations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(integrations));
}

export const Integration = {
  // List all integrations with optional sorting
  async list(sortBy = '-created_date') {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    
    let integrations = getFromStorage();
    
    // Simple sorting
    const [direction, field] = sortBy.startsWith('-') 
      ? ['-', sortBy.slice(1)] 
      : ['+', sortBy];
    
    integrations.sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return direction === '-' ? -comparison : comparison;
    });
    
    return integrations;
  },

  // Create a new integration
  async create(data) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const integrations = getFromStorage();
    const newIntegration = {
      ...data,
      id: generateId(),
      created_date: new Date().toISOString(),
      status: data.status || 'draft',
      webhook_url: `https://api.workdayweaver.com/webhooks/${generateId()}`
    };
    
    integrations.push(newIntegration);
    saveToStorage(integrations);
    
    return newIntegration;
  },

  // Update an existing integration
  async update(id, updates) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const integrations = getFromStorage();
    const index = integrations.findIndex(i => i.id === id);
    
    if (index !== -1) {
      integrations[index] = { ...integrations[index], ...updates };
      saveToStorage(integrations);
      return integrations[index];
    }
    
    return null;
  },

  // Delete an integration
  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const integrations = getFromStorage();
    const filtered = integrations.filter(i => i.id !== id);
    saveToStorage(filtered);
    
    return true;
  },

  // Get a single integration by ID
  async get(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const integrations = getFromStorage();
    return integrations.find(i => i.id === id) || null;
  }
};
