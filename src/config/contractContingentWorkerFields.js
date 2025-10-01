// Contract Contingent Worker Web Service Field Definitions
// Based on Workday Staffing v44.2 - Contract_Contingent_Worker operation
// XML Analysis: Contract_Start_Date, Contract_Contingent_Worker_Event_Data, and Position_Details are REQUIRED

export const CONTRACT_CONTINGENT_WORKER_FIELDS = [
  // === REQUIRED FIELDS ===

  {
    name: "Contract_Start_Date",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Start_Date",
    required: true,
    type: "date",
    description: "Date when the contingent worker contract begins",
    category: "Contract Information",
    helpText: "REQUIRED: Contract start date in YYYY-MM-DD format (e.g., 2024-01-15)"
  },

  // === WORKER IDENTIFICATION (CHOICE: must provide one) ===

  {
    name: "Applicant_ID",
    xmlPath: "Contract_Contingent_Worker_Data.Applicant_Reference.ID",
    required: false, // One of the worker identification methods is required
    type: "text_with_type",
    typeOptions: ["Applicant_ID", "WID", "Employee_ID"],
    defaultType: "Applicant_ID",
    description: "Reference to an existing applicant",
    category: "Worker Identification",
    helpText: "Use this if contracting an applicant from your talent pool"
  },
  {
    name: "Former_Worker_ID",
    xmlPath: "Contract_Contingent_Worker_Data.Former_Worker_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["Worker_ID", "WID", "Employee_ID", "Contingent_Worker_ID"],
    defaultType: "Worker_ID",
    description: "Reference to a former worker",
    category: "Worker Identification",
    helpText: "Use this to rehire a former worker as a contingent worker"
  },
  {
    name: "First_Name",
    xmlPath: "Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Name_Data.Legal_Name_Data.First_Name",
    required: false,
    type: "text",
    description: "Worker's first name (legal name)",
    category: "Worker Identification",
    helpText: "Required if creating a new applicant record"
  },
  {
    name: "Last_Name",
    xmlPath: "Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Name_Data.Legal_Name_Data.Last_Name",
    required: false,
    type: "text",
    description: "Worker's last name (legal name)",
    category: "Worker Identification",
    helpText: "Required if creating a new applicant record"
  },

  // === POSITION/CONTRACT EVENT DATA ===

  {
    name: "Contingent_Worker_ID",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Contingent_Worker_ID",
    required: false,
    type: "text",
    description: "Unique identifier for the contingent worker",
    category: "Contract Information",
    helpText: "Optional: Leave blank for Workday to auto-generate"
  },
  {
    name: "Position_ID",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_ID",
    required: false,
    type: "text",
    description: "ID of the position to fill",
    category: "Contract Information",
    helpText: "Optional: Specify a position ID or use Position_Reference"
  },
  {
    name: "Position_Reference_ID",
    xmlPath: "Contract_Contingent_Worker_Data.Position_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["Position_ID", "WID"],
    defaultType: "Position_ID",
    description: "Reference to an existing position",
    category: "Contract Information",
    helpText: "Link this contract to an existing open position"
  },
  {
    name: "Contract_End_Date",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Contract_End_Date",
    required: false,
    type: "date",
    description: "Date when the contract ends",
    category: "Contract Information",
    helpText: "Optional: End date in YYYY-MM-DD format"
  },
  {
    name: "First_Day_of_Work",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.First_Day_of_Work",
    required: false,
    type: "date",
    description: "Worker's first day of work",
    category: "Contract Information",
    helpText: "Optional: First work date in YYYY-MM-DD format (may differ from contract start)"
  },
  {
    name: "Contract_Worker_Reason_ID",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Contract_Worker_Reason_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["Contract_Worker_Reason_ID", "WID"],
    defaultType: "Contract_Worker_Reason_ID",
    description: "Reason for contracting this worker",
    category: "Contract Information",
    helpText: "Optional: Reason code (e.g., Temporary_Replacement, Project_Work)"
  },
  {
    name: "Contract_Worker_Type_ID",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Contract_Worker_Type_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["Contingent_Worker_Type_ID", "WID"],
    defaultType: "Contingent_Worker_Type_ID",
    description: "Type of contingent worker",
    category: "Contract Information",
    helpText: "Optional: Worker type (e.g., Contractor, Consultant, Temporary)"
  },
  {
    name: "Create_Purchase_Order",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Create_Purchase_Order",
    required: false,
    type: "boolean",
    description: "Whether to create a purchase order",
    category: "Contract Information",
    helpText: "Optional: Set to true if a PO is needed for billing",
    defaultValue: false
  },

  // === POSITION DETAILS (Required Container) ===

  {
    name: "Position_Title",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_Details.Position_Title",
    required: false,
    type: "text",
    description: "Title for this position",
    category: "Position Details",
    helpText: "Optional: Job title (e.g., 'Senior Consultant')"
  },
  {
    name: "Business_Title",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_Details.Business_Title",
    required: false,
    type: "text",
    description: "Business title",
    category: "Position Details",
    helpText: "Optional: Alternative or business-facing title"
  },
  {
    name: "Job_Profile_ID",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_Details.Job_Profile_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["Job_Profile_ID", "WID"],
    defaultType: "Job_Profile_ID",
    description: "Job profile for this position",
    category: "Position Details",
    helpText: "Optional: Link to job profile template"
  },
  {
    name: "Location_ID",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_Details.Location_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["Location_ID", "WID"],
    defaultType: "Location_ID",
    description: "Work location",
    category: "Position Details",
    helpText: "Optional: Workday location for the worker"
  },
  {
    name: "Default_Hours",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_Details.Default_Hours",
    required: false,
    type: "number",
    description: "Default weekly hours",
    category: "Position Details",
    helpText: "Optional: Standard hours per week (e.g., 40.00)"
  },
  {
    name: "Scheduled_Hours",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_Details.Scheduled_Hours",
    required: false,
    type: "number",
    description: "Scheduled weekly hours",
    category: "Position Details",
    helpText: "Optional: Scheduled hours per week (e.g., 40.00)"
  },

  // === ORGANIZATION ASSIGNMENT ===

  {
    name: "Organization_ID",
    xmlPath: "Contract_Contingent_Worker_Data.Organization_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["Organization_Reference_ID", "Organization_ID", "Cost_Center_Reference_ID"],
    defaultType: "Organization_Reference_ID",
    description: "Organization assignment",
    category: "Organization",
    helpText: "Optional: Assign to a supervisory organization"
  },

  // === BUSINESS PROCESS PARAMETERS ===

  {
    name: "Auto_Complete",
    xmlPath: "Business_Process_Parameters.Auto_Complete",
    required: false,
    type: "boolean",
    description: "Auto-complete the business process",
    category: "Process Options",
    helpText: "Optional: If true, automatically completes without manual approval",
    defaultValue: false
  },
  {
    name: "Run_Now",
    xmlPath: "Business_Process_Parameters.Run_Now",
    required: false,
    type: "boolean",
    description: "Execute immediately",
    category: "Process Options",
    helpText: "Optional: If true, runs immediately instead of being scheduled",
    defaultValue: true
  },
  {
    name: "Comment",
    xmlPath: "Business_Process_Parameters.Comment_Data.Comment",
    required: false,
    type: "textarea",
    description: "Comment for this business process",
    category: "Process Options",
    helpText: "Optional: Add notes for approval routing and audit purposes"
  }
];

// Group fields by category for better UI organization
export function getFieldsByCategory() {
  const categories = {};
  CONTRACT_CONTINGENT_WORKER_FIELDS.forEach(field => {
    if (!categories[field.category]) {
      categories[field.category] = [];
    }
    categories[field.category].push(field);
  });
  return categories;
}

// Get required fields only
export function getRequiredFields() {
  return CONTRACT_CONTINGENT_WORKER_FIELDS.filter(f => f.required);
}

// Get optional fields only
export function getOptionalFields() {
  return CONTRACT_CONTINGENT_WORKER_FIELDS.filter(f => !f.required);
}

// Get field by name
export function getFieldByName(name) {
  return CONTRACT_CONTINGENT_WORKER_FIELDS.find(f => f.name === name);
}

// Field statistics
export const FIELD_STATS = {
  total: CONTRACT_CONTINGENT_WORKER_FIELDS.length,
  required: getRequiredFields().length,
  optional: getOptionalFields().length,
  categories: Object.keys(getFieldsByCategory()).length
};

export default CONTRACT_CONTINGENT_WORKER_FIELDS;
