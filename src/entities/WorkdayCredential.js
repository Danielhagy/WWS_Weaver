import { generateId } from '@/utils';

// Mock local storage-based database for Workday Credentials
const STORAGE_KEY = 'workday_credentials';

// Mock data - sample credential
const INITIAL_CREDENTIALS = [
  {
    id: 'cred-001',
    tenant_name: 'acme_demo',
    tenant_url: 'https://wd2-impl.workday.com',
    isu_username: 'ISU_Integration_User@acme_demo',
    isu_password_encrypted: 'ZW5jcnlwdGVkX3Bhc3N3b3JkXzEyMzQ1Ng==',
    is_active: true,
    last_validated: '2025-09-28T10:00:00Z',
    created_date: '2025-09-01T08:00:00Z'
  }
];

// Initialize storage with sample data if empty
function initStorage() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CREDENTIALS));
  }
}

// Get all credentials from storage
function getFromStorage() {
  initStorage();
  const data = localStorage.getItem(STORAGE_KEY);
  return JSON.parse(data) || [];
}

// Save credentials to storage
function saveToStorage(credentials) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
}

export const WorkdayCredential = {
  // List all credentials with optional sorting
  async list(sortBy = '-created_date') {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    let credentials = getFromStorage();
    
    // Simple sorting
    const [direction, field] = sortBy.startsWith('-') 
      ? ['-', sortBy.slice(1)] 
      : ['+', sortBy];
    
    credentials.sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return direction === '-' ? -comparison : comparison;
    });
    
    return credentials;
  },

  // Create a new credential
  async create(data) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const credentials = getFromStorage();
    const newCredential = {
      ...data,
      id: generateId(),
      created_date: new Date().toISOString(),
      is_active: data.is_active !== undefined ? data.is_active : true
    };
    
    credentials.push(newCredential);
    saveToStorage(credentials);
    
    return newCredential;
  },

  // Update an existing credential
  async update(id, updates) {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const credentials = getFromStorage();
    const index = credentials.findIndex(c => c.id === id);
    
    if (index !== -1) {
      credentials[index] = { ...credentials[index], ...updates };
      saveToStorage(credentials);
      return credentials[index];
    }
    
    return null;
  },

  // Delete a credential
  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const credentials = getFromStorage();
    const filtered = credentials.filter(c => c.id !== id);
    saveToStorage(filtered);
    
    return true;
  },

  // Get the active credential
  async getActive() {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const credentials = getFromStorage();
    return credentials.find(c => c.is_active) || null;
  }
};
