// End Contingent Worker Contract Web Service Field Definitions
// Based on Workday Staffing v45.0 - End_Contingent_Worker_Contract operation
// Curated from WebserviceOperationJSON/End_Contingent_Worker_Contract Operation Details.json
// Reference XML: WebserviceOperations/End_Contingent_Worker_Contract_Request.xml
//
// This operation ends a contingent worker's contract using the End Contingent Worker Contract Business Process.

export const END_CONTINGENT_WORKER_CONTRACT_FIELDS = [
  // ===================================================================
  // REQUIRED FIELDS
  // ===================================================================

  {
    name: "Contingent Worker ID",
    xmlPath: "End_Contingent_Worker_Contract_Data.Contingent_Worker_Reference.ID",
    required: true,
    type: "text_with_type",
    typeOptions: ["WID", "Contingent_Worker_ID", "Employee_ID"],
    defaultType: "Contingent_Worker_ID",
    description: "Contract Worker whose contract is being ended",
    category: "Basic Information",
    helpText: "REQUIRED: Enter the ID of the contingent worker. Only workers you have access to can be ended."
  },

  {
    name: "Contract End Date",
    xmlPath: "End_Contingent_Worker_Contract_Data.Contract_End_Date",
    required: true,
    type: "date",
    description: "Date the contract will end",
    category: "Basic Information",
    helpText: "REQUIRED: Format: YYYY-MM-DD (e.g., 2024-12-31). This is the official contract end date."
  },

  {
    name: "Primary Reason ID",
    xmlPath: "End_Contingent_Worker_Contract_Data.End_Contract_Event_Data.Primary_Reason_Reference.ID",
    required: true,
    type: "text_with_type",
    typeOptions: ["WID", "Termination_Reason_ID", "Termination_Subcategory_ID"],
    defaultType: "Termination_Reason_ID",
    description: "Primary reason for ending the contract",
    category: "Termination Details",
    helpText: "REQUIRED: Specify the primary termination reason (e.g., Contract_Completed, Performance, Voluntary)"
  },

  // ===================================================================
  // TERMINATION DETAILS (Optional)
  // ===================================================================

  {
    name: "Last Day of Work",
    xmlPath: "End_Contingent_Worker_Contract_Data.End_Contract_Event_Data.Last_Day_of_Work",
    required: false,
    type: "date",
    description: "Worker's last physical day of work",
    category: "Termination Details",
    helpText: "Optional: Format: YYYY-MM-DD. May differ from contract end date (e.g., paid through end date but last work day earlier)"
  },

  {
    name: "Secondary Reason ID",
    xmlPath: "End_Contingent_Worker_Contract_Data.End_Contract_Event_Data.Secondary_Reason_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["WID", "Termination_Reason_ID", "Termination_Subcategory_ID"],
    defaultType: "Termination_Reason_ID",
    description: "Secondary reason for ending the contract",
    category: "Termination Details",
    helpText: "Optional: Additional context for termination (e.g., Budget_Cuts, Reorganization)",
    cardinality: "[0..*]"
  },

  {
    name: "Local Termination Reason ID",
    xmlPath: "End_Contingent_Worker_Contract_Data.End_Contract_Event_Data.Local_Termination_Reason_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["WID", "Local_Termination_Reason_ID"],
    defaultType: "Local_Termination_Reason_ID",
    description: "Localized termination reason for regional compliance",
    category: "Termination Details",
    helpText: "Optional: Used for country-specific termination requirements"
  },

  {
    name: "Notify Worker By Date",
    xmlPath: "End_Contingent_Worker_Contract_Data.End_Contract_Event_Data.Notify_Worker_By_Date",
    required: false,
    type: "date",
    description: "Date by which worker must be notified",
    category: "Termination Details",
    helpText: "Optional: Format: YYYY-MM-DD. Used for notification requirements and compliance"
  },

  {
    name: "Regrettable ID",
    xmlPath: "End_Contingent_Worker_Contract_Data.End_Contract_Event_Data.Regrettable_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["Yes", "No"],
    defaultType: "No",
    description: "Is this termination regrettable (would you rehire)?",
    category: "Termination Details",
    helpText: "Optional: Indicates whether losing this worker is regrettable for talent analytics"
  },

  {
    name: "Close Position",
    xmlPath: "End_Contingent_Worker_Contract_Data.End_Contract_Event_Data.Close_Position",
    required: false,
    type: "boolean",
    description: "Close the position after ending this contract",
    category: "Termination Details",
    helpText: "Optional: If true, closes the position (no replacement needed)",
    defaultValue: false
  },

  {
    name: "Job Overlap Allowed",
    xmlPath: "End_Contingent_Worker_Contract_Data.End_Contract_Event_Data.Job_Overlap_Allowed",
    required: false,
    type: "boolean",
    description: "Allow overlap for transition/knowledge transfer",
    category: "Termination Details",
    helpText: "Optional: If true, allows replacement to start before this worker's end date",
    defaultValue: false
  },

  // ===================================================================
  // BUSINESS PROCESS PARAMETERS (All Optional)
  // ===================================================================

  {
    name: "Auto Complete",
    xmlPath: "Business_Process_Parameters.Auto_Complete",
    required: false,
    type: "boolean",
    description: "Auto-complete the business process",
    category: "Process Options",
    helpText: "Optional: If true, automatically completes without manual approval steps",
    defaultValue: false
  },

  {
    name: "Run Now",
    xmlPath: "Business_Process_Parameters.Run_Now",
    required: false,
    type: "boolean",
    description: "Execute immediately",
    category: "Process Options",
    helpText: "Optional: If true, runs immediately. Recommended for web service integrations.",
    defaultValue: true
  },

  {
    name: "Discard On Exit Validation Error",
    xmlPath: "Business_Process_Parameters.Discard_On_Exit_Validation_Error",
    required: false,
    type: "boolean",
    description: "Enforce critical validation conditions",
    category: "Process Options",
    helpText: "Optional: If true, blocks submission when critical validations fail",
    defaultValue: false
  },

  {
    name: "Comment",
    xmlPath: "Business_Process_Parameters.Comment_Data.Comment",
    required: false,
    type: "textarea",
    description: "Comment for this business process",
    category: "Process Options",
    helpText: "Optional: Add notes or context for approval routing and audit purposes"
  }
];

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

// Group fields by category for better UI organization
export function getFieldsByCategory() {
  const categories = {};
  END_CONTINGENT_WORKER_CONTRACT_FIELDS.forEach(field => {
    if (!categories[field.category]) {
      categories[field.category] = [];
    }
    categories[field.category].push(field);
  });
  return categories;
}

// Get required fields only
export function getRequiredFields() {
  return END_CONTINGENT_WORKER_CONTRACT_FIELDS.filter(f => f.required);
}

// Get optional fields only
export function getOptionalFields() {
  return END_CONTINGENT_WORKER_CONTRACT_FIELDS.filter(f => !f.required);
}

// Get field by name
export function getFieldByName(name) {
  return END_CONTINGENT_WORKER_CONTRACT_FIELDS.find(f => f.name === name);
}

// Get field by XML path
export function getFieldByXmlPath(xmlPath) {
  return END_CONTINGENT_WORKER_CONTRACT_FIELDS.find(f => f.xmlPath === xmlPath);
}

// Dynamic value functions (reused from other field configs)
export const DYNAMIC_FUNCTIONS = [
  {
    id: "today",
    label: "Today's Date",
    description: "Current date in YYYY-MM-DD format",
    category: "Date Functions",
    execute: () => new Date().toISOString().split('T')[0]
  },
  {
    id: "thirty_days_from_today",
    label: "30 Days From Today",
    description: "Date 30 days in the future",
    category: "Date Functions",
    execute: () => {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date.toISOString().split('T')[0];
    }
  },
  {
    id: "sixty_days_from_today",
    label: "60 Days From Today",
    description: "Date 60 days in the future",
    category: "Date Functions",
    execute: () => {
      const date = new Date();
      date.setDate(date.getDate() + 60);
      return date.toISOString().split('T')[0];
    }
  },
  {
    id: "end_of_month",
    label: "End of Current Month",
    description: "Last day of the current month",
    category: "Date Functions",
    execute: () => {
      const date = new Date();
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      return lastDay.toISOString().split('T')[0];
    }
  },
  {
    id: "uuid",
    label: "Generate UUID",
    description: "Unique identifier for this record",
    category: "ID Generation",
    execute: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  }
];

// Mapping source types
export const MAPPING_SOURCE_TYPES = {
  FILE_COLUMN: 'file_column',
  GLOBAL_ATTRIBUTE: 'global_attribute',
  HARDCODED: 'hardcoded',
  DYNAMIC_FUNCTION: 'dynamic_function',
  UNMAPPED: 'unmapped'
};

// Field statistics
export const FIELD_STATS = {
  total: END_CONTINGENT_WORKER_CONTRACT_FIELDS.length,
  required: getRequiredFields().length,
  optional: getOptionalFields().length,
  categories: Object.keys(getFieldsByCategory()).length
};

export default END_CONTINGENT_WORKER_CONTRACT_FIELDS;
