// Utility function to create page URLs for navigation
export function createPageUrl(pageName) {
  return `/${pageName}`;
}

// Generate a unique ID
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format date for display
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Merge classnames (utility for Tailwind)
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
