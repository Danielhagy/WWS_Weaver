// MVP: Focused on Create Position (Put Position) Web Service
// Based on Workday Staffing v44.2

export const WORKDAY_SERVICES = [
  {
    value: "Create_Position",
    label: "Create Position (Put Position)",
    description: "Create new positions in your organizational structure",
    category: "Staffing",
    version: "v44.2",
    namespace: "urn:com.workday/bsvc",
    requiresFile: true,
    fields: [] // Fields are defined in putPositionFields.js
  }
];

// Get service by value
export function getServiceByValue(value) {
  return WORKDAY_SERVICES.find(service => service.value === value);
}

// Get all unique categories
export function getCategories() {
  return [...new Set(WORKDAY_SERVICES.map(service => service.category))];
}

export default WORKDAY_SERVICES;