// Workday Web Services Configuration
// Dynamically supports multiple operations via JSON parsing

export const WORKDAY_SERVICES = [
  {
    value: "create_position",
    label: "Create Position (v45.0)",
    description: "Create new positions with dynamically generated fields from SOAP documentation",
    category: "Staffing",
    version: "v45.0",
    namespace: "urn:com.workday/bsvc",
    requiresFile: true,
    fieldConfig: "createPositionFields", // References src/config/createPositionFields.js
    operationName: "Create_Position",
    jsonSource: "WebserviceOperationJSON/Create_Position Operation Details.json"
  },
  {
    value: "contract_contingent_worker",
    label: "Contract Contingent Worker (v45.0)",
    description: "Contract an existing pre-hire into a contingent worker position or job. Includes compensation, position details, and contract dates.",
    category: "Staffing",
    version: "v45.0",
    namespace: "urn:com.workday/bsvc",
    requiresFile: true,
    fieldConfig: "contractContingentWorkerFields", // References src/config/contractContingentWorkerFields.js
    operationName: "Contract_Contingent_Worker",
    jsonSource: "WebserviceOperationJSON/Contract_Contingent_Worker Operation Details.json"
  },
  {
    value: "end_contingent_worker_contract",
    label: "End Contingent Worker Contract (v45.0)",
    description: "End a contingent worker's contract using the End Contingent Worker Contract Business Process",
    category: "Staffing",
    version: "v45.0",
    namespace: "urn:com.workday/bsvc",
    requiresFile: true,
    fieldConfig: "endContingentWorkerContractFields", // References src/config/endContingentWorkerContractFields.js
    operationName: "End_Contingent_Worker_Contract",
    jsonSource: "WebserviceOperationJSON/End_Contingent_Worker_Contract Operation Details.json"
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