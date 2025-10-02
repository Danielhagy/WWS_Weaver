// Workday Web Services Configuration
// Dynamically supports multiple operations via JSON parsing

export const WORKDAY_SERVICES = [
  {
    value: "put_position",
    label: "Create Position (Legacy - v44.2)",
    description: "Create new positions using v44.2 schema (manual field definitions)",
    category: "Staffing",
    version: "v44.2",
    namespace: "urn:com.workday/bsvc",
    requiresFile: true,
    fieldConfig: "putPositionFields", // References src/config/putPositionFields.js
    operationName: "Create_Position"
  },
  {
    value: "create_position",
    label: "Create Position (Enhanced - v45.0)",
    description: "Create new positions with dynamically generated fields from SOAP documentation",
    category: "Staffing",
    version: "v45.0",
    namespace: "urn:com.workday/bsvc",
    requiresFile: true,
    fieldConfig: "createPositionFields", // References src/config/createPositionFields.js
    operationName: "Create_Position",
    jsonSource: "WebserviceOperationJSON/Create_Position Operation Details.json"
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