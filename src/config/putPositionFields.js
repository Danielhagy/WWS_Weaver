// Put Position Web Service Field Definitions
// Based on Workday Staffing v44.2 - Create_Position operation
// XML Analysis: Only Supervisory_Organization_Reference is truly REQUIRED in the XML schema

export const PUT_POSITION_FIELDS = [
  // === REQUIRED FIELDS (from XML analysis) ===
  // Only Supervisory_Organization_Reference is not marked as "Optional:" in the XML

  {
    name: "Supervisory Organization ID",
    xmlPath: "Create_Position_Data.Supervisory_Organization_Reference.ID",
    required: true, // NOT marked as optional in XML line 37
    type: "text_with_type",
    typeOptions: ["Organization_Reference_ID", "Supervisory_Organization_ID", "Cost_Center_Reference_ID"],
    defaultType: "Organization_Reference_ID",
    description: "The supervisory organization that will own this position",
    category: "Required Mappings",
    helpText: "REQUIRED: Enter the ID of the supervisory organization (e.g., SUPERVISORY_ORG-6-123). Select the type from the dropdown."
  },

  // === POSITION DATA FIELDS (All Optional per XML) ===

  {
    name: "Position ID",
    xmlPath: "Create_Position_Data.Position_Data.Position_ID",
    required: false,
    type: "text",
    description: "Unique identifier for the position",
    category: "Position Details",
    helpText: "Optional: Leave blank for Workday to auto-generate, or provide a custom ID"
  },
  {
    name: "Job Posting Title",
    xmlPath: "Create_Position_Data.Position_Data.Job_Posting_Title",
    required: false,
    type: "text",
    description: "Title to display in job postings",
    category: "Position Details",
    helpText: "Optional: External-facing job title (e.g., 'Senior Software Engineer')"
  },
  {
    name: "Job Description Summary",
    xmlPath: "Create_Position_Data.Position_Data.Job_Description_Summary",
    required: false,
    type: "textarea",
    description: "Brief summary of the job",
    category: "Position Details",
    helpText: "Optional: Short description for job postings and quick reference"
  },
  {
    name: "Job Description",
    xmlPath: "Create_Position_Data.Position_Data.Job_Description",
    required: false,
    type: "textarea",
    description: "Full job description",
    category: "Position Details",
    helpText: "Optional: Detailed description of responsibilities, requirements, qualifications"
  },
  {
    name: "Critical Job",
    xmlPath: "Create_Position_Data.Position_Data.Critical_Job",
    required: false,
    type: "boolean",
    description: "Whether this is a critical position",
    category: "Position Details",
    helpText: "Optional: Mark as critical if vacancy would significantly impact operations",
    defaultValue: false
  },
  {
    name: "Available for Overlap",
    xmlPath: "Create_Position_Data.Position_Data.Available_for_Overlap",
    required: false,
    type: "boolean",
    description: "Allow multiple workers in this position simultaneously",
    category: "Position Details",
    helpText: "Optional: Enable if the position can have overlapping employees during transitions",
    defaultValue: false
  },
  {
    name: "Difficulty to Fill ID",
    xmlPath: "Create_Position_Data.Position_Data.Difficulty_to_Fill_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["Difficulty_to_Fill_ID", "Difficulty_to_Fill_Reference_ID"],
    defaultType: "Difficulty_to_Fill_ID",
    description: "Expected difficulty filling this position",
    category: "Position Details",
    helpText: "Optional: Helps with recruitment planning and resource allocation (e.g., Easy, Medium, Hard)"
  },

  // === POSITION GROUP RESTRICTIONS DATA ===

  {
    name: "Availability Date",
    xmlPath: "Create_Position_Data.Position_Group_Restrictions_Data.Availability_Date",
    required: false,
    type: "date",
    description: "Date when position becomes available",
    category: "Position Restrictions",
    helpText: "Optional: Date format: YYYY-MM-DD (e.g., 2024-01-15)"
  },
  {
    name: "Earliest Hire Date",
    xmlPath: "Create_Position_Data.Position_Group_Restrictions_Data.Earliest_Hire_Date",
    required: false,
    type: "date",
    description: "Earliest date a worker can be hired",
    category: "Position Restrictions",
    helpText: "Optional: Date format: YYYY-MM-DD (e.g., 2024-02-01)"
  },
  {
    name: "Job Family ID",
    xmlPath: "Create_Position_Data.Position_Group_Restrictions_Data.Job_Family_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["Job_Family_ID", "Job_Family_Reference_ID", "Job_Family_Name"],
    defaultType: "Job_Family_ID",
    description: "Job family classification",
    category: "Position Restrictions",
    helpText: "Optional: Classify position by job family (e.g., Engineering, Sales, HR)"
  },
  {
    name: "Job Profile ID",
    xmlPath: "Create_Position_Data.Position_Group_Restrictions_Data.Job_Profile_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["Job_Profile_ID", "Job_Profile_Reference_ID", "Job_Profile_Name"],
    defaultType: "Job_Profile_ID",
    description: "Job profile for standardized role",
    category: "Position Restrictions",
    helpText: "Optional: Link to predefined job profile template"
  },
  {
    name: "Location ID",
    xmlPath: "Create_Position_Data.Position_Group_Restrictions_Data.Location_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["Location_ID", "Location_Reference_ID", "Location_Name"],
    defaultType: "Location_ID",
    description: "Physical work location",
    category: "Position Restrictions",
    helpText: "Optional: Workday location ID for the position"
  },
  {
    name: "Worker Type ID",
    xmlPath: "Create_Position_Data.Position_Group_Restrictions_Data.Worker_Type_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["WID", "Worker_Type_ID"],
    defaultType: "Worker_Type_ID",
    description: "Type of worker (Employee, Contingent, etc.)",
    category: "Position Restrictions",
    helpText: "Optional: Specify worker classification (e.g., Employee, Contractor)"
  },
  {
    name: "Time Type ID",
    xmlPath: "Create_Position_Data.Position_Group_Restrictions_Data.Time_Type_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["WID", "Position_Time_Type_ID"],
    defaultType: "Position_Time_Type_ID",
    description: "Full-time or Part-time",
    category: "Position Restrictions",
    helpText: "Optional: Work time classification (e.g., Full_Time, Part_Time)"
  },
  {
    name: "Position Worker Type ID",
    xmlPath: "Create_Position_Data.Position_Group_Restrictions_Data.Position_Worker_Type_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["Contingent_Worker_Type_ID", "WID", "Employee_Type_ID"],
    defaultType: "WID",
    description: "Position-specific worker type",
    category: "Position Restrictions",
    helpText: "Optional: Additional worker type classification for this position"
  },
  {
    name: "Default Hours",
    xmlPath: "Create_Position_Data.Position_Restriction_Working_Hours_Details_Data.Default_Hours",
    required: false,
    type: "number",
    description: "Default weekly working hours",
    category: "Position Restrictions",
    helpText: "Optional: Standard hours per week (e.g., 40.00)"
  },
  {
    name: "Scheduled Hours",
    xmlPath: "Create_Position_Data.Position_Restriction_Working_Hours_Details_Data.Scheduled_Hours",
    required: false,
    type: "number",
    description: "Scheduled weekly hours",
    category: "Position Restrictions",
    helpText: "Optional: Scheduled hours per week (e.g., 40.00)"
  },

  // === POSITION REQUEST REASON (Optional per XML) ===

  {
    name: "Position Request Reason ID",
    xmlPath: "Create_Position_Data.Position_Request_Reason_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["Position_Request_Reason_ID", "Position_Reason_Reference_ID"],
    defaultType: "Position_Request_Reason_ID",
    description: "Reason for creating this position",
    category: "Request Information",
    helpText: "Optional: Reason code (e.g., New_Headcount, Replacement, Reorganization)"
  },

  // === BUSINESS PROCESS PARAMETERS (All Optional per XML) ===

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
    helpText: "Optional: Add notes or context for approval routing and audit purposes"
  }
];

// Group fields by category for better UI organization
export function getFieldsByCategory() {
  const categories = {};
  PUT_POSITION_FIELDS.forEach(field => {
    if (!categories[field.category]) {
      categories[field.category] = [];
    }
    categories[field.category].push(field);
  });
  return categories;
}

// Get required fields only
export function getRequiredFields() {
  return PUT_POSITION_FIELDS.filter(f => f.required);
}

// Get optional fields only
export function getOptionalFields() {
  return PUT_POSITION_FIELDS.filter(f => !f.required);
}

// Get field by name
export function getFieldByName(name) {
  return PUT_POSITION_FIELDS.find(f => f.name === name);
}

// Dynamic value functions
export const DYNAMIC_FUNCTIONS = [
  {
    id: "today",
    label: "Today's Date",
    description: "Current date in YYYY-MM-DD format",
    category: "Date Functions",
    execute: () => new Date().toISOString().split('T')[0]
  },
  {
    id: "now",
    label: "Current Date and Time",
    description: "Current timestamp in ISO format",
    category: "Date Functions",
    execute: () => new Date().toISOString()
  },
  {
    id: "timestamp",
    label: "Unix Timestamp",
    description: "Current Unix timestamp (seconds since epoch)",
    category: "Date Functions",
    execute: () => Math.floor(Date.now() / 1000).toString()
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
  },
  {
    id: "random_number",
    label: "Random Number (1-1000)",
    description: "Generate a random number",
    category: "Utilities",
    execute: () => Math.floor(Math.random() * 1000 + 1).toString()
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
  total: PUT_POSITION_FIELDS.length,
  required: getRequiredFields().length,
  optional: getOptionalFields().length,
  categories: Object.keys(getFieldsByCategory()).length
};

export default PUT_POSITION_FIELDS;