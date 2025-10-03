// Contract Contingent Worker Web Service Field Definitions
// Based on Workday Staffing v45.0 - Contract_Contingent_Worker operation
// Curated from WebserviceOperationJSON/Contract_Contingent_Worker Operation Details.json
//
// This configuration provides comprehensive field mapping for contracting contingent workers:
// - 29 carefully selected fields (1 choice group required, 26 optional)
// - 6 logical categories for better organization
// - text_with_type support for reference IDs with type dropdowns
// - CHOICE GROUP support for pre-hire selection (Applicant/Former Worker/Student/Create New)
// - Contract-specific fields: dates, pay rates, purchase orders
// - Support for all field types: text, text_with_type, textarea, boolean, date, number

// ===================================================================
// CHOICE GROUPS: User must select exactly ONE option from each group
// ===================================================================

export const CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS = [
  {
    id: "pre_hire_selection",
    name: "Pre-hire Selection",
    description: "Choose how to identify the person to contract",
    required: true,
    category: "Pre-hire Information",
    helpText: "REQUIRED: Select exactly one method to identify the pre-hire candidate",
    options: [
      {
        id: "applicant_reference",
        name: "Existing Applicant",
        icon: "👤",
        description: "Use an existing applicant/pre-hire record",
        isSimpleReference: true,
        fields: [
          {
            name: "Applicant ID",
            xmlPath: "Contract_Contingent_Worker_Data.Applicant_Reference.ID",
            required: true,
            type: "text_with_type",
            typeOptions: ["Applicant_ID", "WID"],
            defaultType: "Applicant_ID",
            description: "Reference to the pre-hire/applicant that will become a contingent worker",
            helpText: "Enter the Applicant ID. The applicant must exist and be eligible for hire."
          }
        ]
      },
      {
        id: "former_worker_reference",
        name: "Former Worker",
        icon: "↩️",
        description: "Rehire a former worker",
        isSimpleReference: true,
        fields: [
          {
            name: "Former Worker ID",
            xmlPath: "Contract_Contingent_Worker_Data.Former_Worker_Reference.ID",
            required: true,
            type: "text_with_type",
            typeOptions: ["Former_Worker_ID", "WID"],
            defaultType: "Former_Worker_ID",
            description: "Reference to a Former Worker to be contracted",
            helpText: "For rehiring former workers from implementation data."
          }
        ]
      },
      {
        id: "student_reference",
        name: "Student",
        icon: "🎓",
        description: "Contract an inactive student",
        isSimpleReference: true,
        fields: [
          {
            name: "Student ID",
            xmlPath: "Contract_Contingent_Worker_Data.Student_Reference.ID",
            required: true,
            type: "text_with_type",
            typeOptions: ["Student_ID", "Academic_Person_ID", "Universal_Identifier_ID", "WID"],
            defaultType: "Student_ID",
            description: "The inactive student to contract (active students not allowed)",
            helpText: "For contracting inactive students or external students (not active students or prospects)."
          }
        ]
      },
      {
        id: "create_applicant",
        name: "Create New Applicant",
        icon: "✨",
        description: "Create a new pre-hire record with full details",
        isComplexType: true,
        isExpandable: true,
        fields: [
          {
            name: "Applicant ID (New)",
            xmlPath: "Contract_Contingent_Worker_Data.Applicant_Data.Applicant_ID",
            required: false,
            type: "text",
            description: "Optional ID for the new applicant (auto-generated if blank)",
            helpText: "Leave blank for system to auto-generate, or provide custom ID"
          },
          {
            name: "First Name",
            xmlPath: "Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Name_Data.Legal_Name_Data.Name_Detail_Data.First_Name",
            required: true,
            type: "text",
            description: "Legal first name",
            helpText: "REQUIRED when creating new applicant"
          },
          {
            name: "Last Name",
            xmlPath: "Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Name_Data.Legal_Name_Data.Name_Detail_Data.Last_Name",
            required: true,
            type: "text",
            description: "Legal last name",
            helpText: "REQUIRED when creating new applicant"
          },
          {
            name: "Country (Name)",
            xmlPath: "Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Name_Data.Legal_Name_Data.Name_Detail_Data.Country_Reference.ID",
            required: true,
            type: "text_with_type",
            typeOptions: ["ISO_3166-1_Alpha-2_Code", "ISO_3166-1_Alpha-3_Code", "WID"],
            defaultType: "ISO_3166-1_Alpha-2_Code",
            description: "Country for name formatting (e.g., US, GB, CA)",
            helpText: "REQUIRED: Use ISO 2-letter code (US, GB, CA, etc.)"
          },
          {
            name: "Email Address",
            xmlPath: "Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Email_Address_Data.Email_Address",
            required: false,
            type: "text",
            description: "Primary email address",
            helpText: "Optional: Primary contact email"
          },
          {
            name: "Email Usage Type",
            xmlPath: "Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Email_Address_Data.Usage_Data.Type_Reference.ID",
            required: false,
            type: "text_with_type",
            typeOptions: ["Communication_Usage_Type_ID", "WID"],
            defaultType: "Communication_Usage_Type_ID",
            description: "Email usage type (WORK, HOME, etc.)",
            helpText: "REQUIRED if Email Address is provided. Use: WORK"
          },
          {
            name: "Email Is Primary",
            xmlPath: "Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Email_Address_Data.Usage_Data.Primary",
            required: false,
            type: "boolean",
            description: "Mark as primary email",
            helpText: "Default: true"
          },
          {
            name: "Phone Number",
            xmlPath: "Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Phone_Data.Phone_Number",
            required: false,
            type: "text",
            description: "Primary phone number",
            helpText: "Optional: Primary contact phone"
          },
          {
            name: "Phone Country Code",
            xmlPath: "Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Phone_Data.Country_ISO_Code",
            required: false,
            type: "text_with_type",
            typeOptions: ["ISO_3166-1_Alpha-2_Code", "ISO_3166-1_Alpha-3_Code", "WID"],
            defaultType: "ISO_3166-1_Alpha-2_Code",
            description: "Country ISO code for phone (e.g., US, GB, CA)",
            helpText: "REQUIRED if Phone Number is provided. Use 2-letter ISO code"
          },
          {
            name: "Phone Device Type",
            xmlPath: "Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Phone_Data.Phone_Device_Type_Reference.ID",
            required: false,
            type: "text_with_type",
            typeOptions: ["Phone_Device_Type_ID", "WID"],
            defaultType: "Phone_Device_Type_ID",
            description: "Phone device type (Mobile, Landline, etc.)",
            helpText: "REQUIRED if Phone Number is provided. Use: Mobile, Landline"
          },
          {
            name: "Phone Usage Type",
            xmlPath: "Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Phone_Data.Usage_Data.Type_Reference.ID",
            required: false,
            type: "text_with_type",
            typeOptions: ["Communication_Usage_Type_ID", "WID"],
            defaultType: "Communication_Usage_Type_ID",
            description: "Phone usage type (WORK, HOME, etc.)",
            helpText: "REQUIRED if Phone Number is provided. Use: WORK"
          },
          {
            name: "Phone Is Primary",
            xmlPath: "Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Phone_Data.Usage_Data.Primary",
            required: false,
            type: "boolean",
            description: "Mark as primary phone",
            helpText: "Default: true"
          },
          {
            name: "➕ Include Address",
            xmlPath: "Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Address_Data._toggle",
            required: false,
            type: "toggle",
            description: "Add address information",
            helpText: "Enable to add address fields",
            isToggle: true,
            togglesSection: "address"
          },
          {
            name: "Address Country",
            xmlPath: "Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Address_Data.Country_Reference.ID",
            required: false,
            type: "text_with_type",
            typeOptions: ["ISO_3166-1_Alpha-2_Code", "ISO_3166-1_Alpha-3_Code", "WID"],
            defaultType: "ISO_3166-1_Alpha-2_Code",
            description: "Country for address",
            helpText: "REQUIRED if providing address",
            section: "address"
          },
          {
            name: "Address Line 1",
            xmlPath: "Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Address_Data.Address_Line_Data.Line1",
            required: false,
            type: "text",
            description: "Street address line 1",
            helpText: "Primary street address",
            section: "address"
          },
          {
            name: "Address Line 2",
            xmlPath: "Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Address_Data.Address_Line_Data.Line2",
            required: false,
            type: "text",
            description: "Street address line 2 (optional)",
            helpText: "Apartment, suite, unit, etc.",
            section: "address"
          },
          {
            name: "City",
            xmlPath: "Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Address_Data.Municipality",
            required: false,
            type: "text",
            description: "City/Municipality",
            helpText: "City name",
            section: "address"
          },
          {
            name: "State/Province",
            xmlPath: "Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Address_Data.Country_Region_Reference.ID",
            required: false,
            type: "text_with_type",
            typeOptions: ["WID", "Country_Region_ID", "ISO_3166-2_Code", "ISO_3166-2_Country-Region_Code", "OPM_Country_Subdivision_Code"],
            defaultType: "ISO_3166-2_Code",
            description: "State, province, or region",
            helpText: "e.g., US-CA, US-NY, US-TX for ISO-2 codes",
            section: "address"
          },
          {
            name: "Postal Code",
            xmlPath: "Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Address_Data.Postal_Code",
            required: false,
            type: "text",
            description: "Zip/Postal code",
            helpText: "e.g., 90210, SW1A 1AA",
            section: "address"
          },
          {
            name: "Address Usage Type",
            xmlPath: "Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Address_Data.Usage_Data.Type_Reference.ID",
            required: false,
            type: "text_with_type",
            typeOptions: ["Communication_Usage_Type_ID", "WID"],
            defaultType: "Communication_Usage_Type_ID",
            description: "Address usage type (HOME, WORK, etc.)",
            helpText: "REQUIRED if Address provided. Use: HOME or WORK",
            section: "address"
          },
          {
            name: "Address Is Primary",
            xmlPath: "Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Address_Data.Usage_Data.Primary",
            required: false,
            type: "boolean",
            description: "Mark as primary address",
            helpText: "Default: true",
            section: "address"
          }
        ],
        expandedFieldCount: 21,
        totalAvailableFields: 50,
        note: "Creating a new applicant requires First Name, Last Name, and Country. If providing Email, Phone, or Address, their respective usage fields are also required."
      }
    ]
  },
  {
    id: "position_assignment",
    name: "Position Assignment",
    description: "Choose how to assign the worker to a position",
    required: false,
    category: "Position Assignment",
    helpText: "Optional: Select Position ID OR Job Requisition ID (not both)",
    options: [
      {
        id: "position_reference",
        name: "Position ID",
        icon: "📍",
        description: "Assign to an existing position",
        isSimpleReference: true,
        fields: [
          {
            name: "Position ID",
            xmlPath: "Contract_Contingent_Worker_Data.Position_Reference.ID",
            required: true,
            type: "text_with_type",
            typeOptions: ["Position_ID", "WID"],
            defaultType: "Position_ID",
            description: "Position Management group to contract the worker into",
            helpText: "Existing position for supervisory organization. Leave blank for Headcount Group or Job Management."
          }
        ]
      },
      {
        id: "job_requisition_reference",
        name: "Job Requisition ID",
        icon: "📋",
        description: "Assign via job requisition",
        isSimpleReference: true,
        fields: [
          {
            name: "Job Requisition ID",
            xmlPath: "Contract_Contingent_Worker_Data.Job_Requisition_Reference.ID",
            required: true,
            type: "text_with_type",
            typeOptions: ["Job_Requisition_ID", "WID"],
            defaultType: "Job_Requisition_ID",
            description: "Job requisition reference for the position",
            helpText: "Alternative to Position ID. Links to active job requisition."
          }
        ]
      }
    ]
  }
];

export const CONTRACT_CONTINGENT_WORKER_FIELDS = [

  // ===================================================================
  // CONTRACT DETAILS (Core Required & Important Fields)
  // ===================================================================

  {
    name: "Contract Start Date",
    xmlPath: "Contract_Start_Date",
    required: true,
    type: "date",
    description: "The date the contract takes effect",
    category: "Contract Details",
    helpText: "REQUIRED: Format YYYY-MM-DD. The effective date when the contract begins."
  },
  {
    name: "Contingent Worker ID",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Contingent_Worker_ID",
    required: false,
    type: "text",
    description: "Unique ID for the contingent worker",
    category: "Contract Details",
    helpText: "Optional: Leave blank for auto-generation, or provide custom ID. For rehires, system can reuse terminated worker's ID."
  },
  {
    name: "Contract End Date",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Contract_End_Date",
    required: false,
    type: "date",
    description: "Date the contract is expected to end",
    category: "Contract Details",
    helpText: "Optional: Format YYYY-MM-DD. Required if creating purchase order. Leave blank for open-ended contracts."
  },
  {
    name: "First Day of Work",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.First_Day_of_Work",
    required: false,
    type: "date",
    description: "The contingent worker's first day of work",
    category: "Contract Details",
    helpText: "Optional: Format YYYY-MM-DD. If left empty, Workday uses the Contract Start Date."
  },
  {
    name: "Contract Worker Reason ID",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Contract_Worker_Reason_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["General_Event_Subcategory_ID", "Event_Classification_Subcategory_ID", "WID"],
    defaultType: "General_Event_Subcategory_ID",
    description: "Reason for contracting the worker",
    category: "Contract Details",
    helpText: "Optional: Business reason code (e.g., Project_Coverage, Peak_Season, Skill_Gap)"
  },
  {
    name: "Contract Worker Type ID",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Contract_Worker_Type_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["Contingent_Worker_Type_ID", "WID"],
    defaultType: "Contingent_Worker_Type_ID",
    description: "Type of contingent worker",
    category: "Contract Details",
    helpText: "Optional: Classification (e.g., Independent_Contractor, Temporary_Worker, Consultant)"
  },
  {
    name: "Create Purchase Order",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Create_Purchase_Order",
    required: false,
    type: "boolean",
    description: "Whether to create a purchase order for this contingent worker",
    category: "Contract Details",
    helpText: "Optional: Set to true if using Workday Procurement. Requires Contract End Date, currency, and hourly pay rate.",
    defaultValue: false
  },

  // ===================================================================
  // POSITION ASSIGNMENT (Optional Choice - Position or Job Requisition)
  // ===================================================================

  {
    name: "Position ID (Generated)",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_ID",
    required: false,
    type: "text",
    description: "Custom ID for the position assignment",
    category: "Position Assignment",
    helpText: "Optional: Override auto-generated position ID if needed."
  },

  // ===================================================================
  // POSITION DETAILS (Optional Configuration Fields)
  // ===================================================================

  {
    name: "Job Profile ID",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_Details.Job_Profile_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["Job_Profile_ID", "WID"],
    defaultType: "Job_Profile_ID",
    description: "Job Profile for the filled position",
    category: "Position Details",
    helpText: "Optional: If empty, Workday uses position restriction's job profile. Required if multiple profiles available."
  },
  {
    name: "Position Title",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_Details.Position_Title",
    required: false,
    type: "text",
    description: "Position Title of the position",
    category: "Position Details",
    helpText: "Optional: Custom title. If empty, uses existing position title."
  },
  {
    name: "Business Title",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_Details.Business_Title",
    required: false,
    type: "text",
    description: "Business Title of the position",
    category: "Position Details",
    helpText: "Optional: External-facing title. If empty, uses existing business title."
  },
  {
    name: "Location ID",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_Details.Location_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["Location_ID", "WID"],
    defaultType: "Location_ID",
    description: "Work location for the position",
    category: "Position Details",
    helpText: "Optional: Physical work location. If empty, uses position restriction's location."
  },
  {
    name: "Position Time Type ID",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_Details.Position_Time_Type_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["Position_Time_Type_ID", "WID"],
    defaultType: "Position_Time_Type_ID",
    description: "Time type for the position (Full-time/Part-time)",
    category: "Position Details",
    helpText: "Optional: Work time classification. If empty, uses existing time type."
  },
  {
    name: "Work Shift ID",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_Details.Work_Shift_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["Work_Shift_ID", "WID"],
    defaultType: "Work_Shift_ID",
    description: "Work shift for the position",
    category: "Position Details",
    helpText: "Optional: Shift schedule (e.g., Day_Shift, Night_Shift). If empty, uses existing shift."
  },
  {
    name: "Pay Rate Type ID",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_Details.Pay_Rate_Type_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["Pay_Rate_Type_ID", "WID"],
    defaultType: "Pay_Rate_Type_ID",
    description: "Pay rate type for the position",
    category: "Position Details",
    helpText: "Optional: Classification of pay rate (e.g., Hourly, Salary). Workday ignores for contingent workers."
  },

  // ===================================================================
  // COMPENSATION (Contract Pay & Details)
  // ===================================================================

  {
    name: "Contract Pay Rate",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Contract_Details_Data.Contract_Pay_Rate",
    required: false,
    type: "number",
    description: "Contract pay rate for the position",
    category: "Compensation",
    helpText: "Optional: Decimal value (e.g., 75.50). Auto-calculated from Contract Amount and Frequency."
  },
  {
    name: "Currency ID",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Contract_Details_Data.Currency_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["Currency_ID", "Currency_Numeric_Code", "WID"],
    defaultType: "Currency_ID",
    description: "Currency for the contract pay rate",
    category: "Compensation",
    helpText: "Optional: ISO currency code (e.g., USD, EUR, GBP). Required if Contract Pay Rate specified."
  },
  {
    name: "Frequency ID",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Contract_Details_Data.Frequency_Reference.ID",
    required: false,
    type: "text_with_type",
    typeOptions: ["Frequency_ID", "WID"],
    defaultType: "Frequency_ID",
    description: "Pay frequency",
    category: "Compensation",
    helpText: "Optional: How often paid (e.g., Hourly, Daily, Monthly). Workday ignores for employees."
  },
  {
    name: "Contract Amount",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Contract_Details_Data.Contract_Amount",
    required: false,
    type: "number",
    description: "Total amount of the contract",
    category: "Compensation",
    helpText: "Optional: Decimal value for total contract value (e.g., 50000.00)."
  },
  {
    name: "Contract Assignment Details",
    xmlPath: "Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Contract_Details_Data.Contract_Assignment_Details",
    required: false,
    type: "textarea",
    description: "Contract assignment description",
    category: "Compensation",
    helpText: "Optional: Free text describing the assignment. If empty, uses existing value."
  },

  // ===================================================================
  // PROCESS OPTIONS (Business Process Parameters)
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

// Field Statistics
export const FIELD_STATS = {
  total: 29,
  required: 2, // Contract Start Date + one pre-hire reference (choice)
  optional: 27,
  categories: 6
};

// Dynamic function helpers for date fields
export const DYNAMIC_FUNCTIONS = {
  today: () => new Date().toISOString().split('T')[0],
  thirty_days_from_today: () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  },
  sixty_days_from_today: () => {
    const date = new Date();
    date.setDate(date.getDate() + 60);
    return date.toISOString().split('T')[0];
  },
  ninety_days_from_today: () => {
    const date = new Date();
    date.setDate(date.getDate() + 90);
    return date.toISOString().split('T')[0];
  },
  end_of_month: () => {
    const date = new Date();
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return lastDay.toISOString().split('T')[0];
  }
};

// Helper function to get field by XML path
export function getFieldByXmlPath(xmlPath) {
  return CONTRACT_CONTINGENT_WORKER_FIELDS.find(field => field.xmlPath === xmlPath);
}

// Get all unique categories
export function getCategories() {
  return [...new Set(CONTRACT_CONTINGENT_WORKER_FIELDS.map(field => field.category))];
}

export default CONTRACT_CONTINGENT_WORKER_FIELDS;
