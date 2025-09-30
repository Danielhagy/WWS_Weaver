/**
 * XML Generator for Workday SOAP Web Services
 * Generates SOAP XML requests for testing in Postman
 */

import { DYNAMIC_FUNCTIONS } from '@/config/putPositionFields';

/**
 * Generate SOAP envelope for Create Position request
 * @param {Object} data - Integration data with field mappings
 * @param {Object} sampleData - Sample data row (optional, uses placeholders if not provided)
 * @returns {string} - SOAP XML string
 */
export function generateCreatePositionXML(data, sampleData = {}) {
  const { field_mappings = [] } = data;

  // Helper to get value for a field
  const getValue = (mapping) => {
    if (mapping.source_type === 'hardcoded') {
      return mapping.source_value || '';
    }
    if (mapping.source_type === 'dynamic_function') {
      // Execute the dynamic function to get actual value
      const func = DYNAMIC_FUNCTIONS.find(f => f.id === mapping.source_value);
      return func ? func.execute() : `{{${mapping.source_value}}}`;
    }
    if (mapping.source_type === 'file_column') {
      return sampleData[mapping.source_value] || `{{${mapping.source_value}}}`;
    }
    return '';
  };

  // Get mapped values and types
  const mappedFields = {};
  const mappedTypes = {};
  field_mappings.forEach(mapping => {
    if (mapping.source_type !== 'unmapped') {
      mappedFields[mapping.target_field] = getValue(mapping);
      if (mapping.type_value) {
        mappedTypes[mapping.target_field] = mapping.type_value;
      }
    }
  });

  // Build XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:bsvc="urn:com.workday/bsvc">
  <soapenv:Header>
    <wsse:Security soapenv:mustUnderstand="1" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
      <wsse:UsernameToken>
        <wsse:Username>{{ISU_USERNAME}}</wsse:Username>
        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">{{ISU_PASSWORD}}</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
  </soapenv:Header>
  <soapenv:Body>
    <bsvc:Create_Position_Request bsvc:version="v44.2">
      ${generateBusinessProcessParameters(mappedFields)}

      <bsvc:Create_Position_Data>
        ${generateSupervisoryOrgReference(mappedFields, mappedTypes)}
        ${generatePositionData(mappedFields, mappedTypes)}
        ${generatePositionGroupRestrictions(mappedFields, mappedTypes)}
        ${generatePositionRequestReason(mappedFields, mappedTypes)}
      </bsvc:Create_Position_Data>
    </bsvc:Create_Position_Request>
  </soapenv:Body>
</soapenv:Envelope>`;

  return xml;
}

function generateBusinessProcessParameters(fields) {
  let xml = '<bsvc:Business_Process_Parameters>';

  // Auto_Complete - default to true if not specified
  const autoComplete = fields.Auto_Complete !== undefined ? fields.Auto_Complete : 'true';
  xml += `\n        <bsvc:Auto_Complete>${escapeXml(autoComplete)}</bsvc:Auto_Complete>`;

  // Run_Now - default to true if not specified
  const runNow = fields.Run_Now !== undefined ? fields.Run_Now : 'true';
  xml += `\n        <bsvc:Run_Now>${escapeXml(runNow)}</bsvc:Run_Now>`;

  // Comment - optional
  if (fields.Comment) {
    xml += `\n        <bsvc:Comment_Data>`;
    xml += `\n          <bsvc:Comment>${escapeXml(fields.Comment)}</bsvc:Comment>`;
    xml += `\n        </bsvc:Comment_Data>`;
  }

  xml += '\n      </bsvc:Business_Process_Parameters>';
  return xml;
}

function generateSupervisoryOrgReference(fields, types) {
  const orgId = fields.Supervisory_Organization_ID;
  const orgType = types.Supervisory_Organization_ID || 'Organization_Reference_ID';

  if (!orgId) {
    return `<!-- Supervisory_Organization_Reference REQUIRED but not mapped -->`;
  }

  return `<bsvc:Supervisory_Organization_Reference>
          <bsvc:ID bsvc:type="${escapeXml(orgType)}">${escapeXml(orgId)}</bsvc:ID>
        </bsvc:Supervisory_Organization_Reference>`;
}

function generatePositionData(fields, types) {
  let xml = '<bsvc:Position_Data>';

  // Optional fields
  if (fields.Position_ID) {
    xml += `\n          <bsvc:Position_ID>${escapeXml(fields.Position_ID)}</bsvc:Position_ID>`;
  }
  if (fields.Job_Posting_Title) {
    xml += `\n          <bsvc:Job_Posting_Title>${escapeXml(fields.Job_Posting_Title)}</bsvc:Job_Posting_Title>`;
  }
  if (fields.Job_Description_Summary) {
    xml += `\n          <bsvc:Job_Description_Summary>${escapeXml(fields.Job_Description_Summary)}</bsvc:Job_Description_Summary>`;
  }
  if (fields.Job_Description) {
    xml += `\n          <bsvc:Job_Description>${escapeXml(fields.Job_Description)}</bsvc:Job_Description>`;
  }
  if (fields.Critical_Job) {
    xml += `\n          <bsvc:Critical_Job>${escapeXml(fields.Critical_Job)}</bsvc:Critical_Job>`;
  }
  if (fields.Available_for_Overlap) {
    xml += `\n          <bsvc:Available_for_Overlap>${escapeXml(fields.Available_for_Overlap)}</bsvc:Available_for_Overlap>`;
  }
  if (fields.Difficulty_to_Fill_ID) {
    const diffType = types.Difficulty_to_Fill_ID || 'Difficulty_to_Fill_ID';
    xml += `\n          <bsvc:Difficulty_to_Fill_Reference>`;
    xml += `\n            <bsvc:ID bsvc:type="${escapeXml(diffType)}">${escapeXml(fields.Difficulty_to_Fill_ID)}</bsvc:ID>`;
    xml += `\n          </bsvc:Difficulty_to_Fill_Reference>`;
  }

  xml += '\n        </bsvc:Position_Data>';
  return xml;
}

function generatePositionGroupRestrictions(fields, types) {
  let xml = '';
  let restrictionsData = '';
  let workingHoursData = '';

  // Position_Group_Restrictions_Data fields
  if (fields.Availability_Date) {
    restrictionsData += `\n          <bsvc:Availability_Date>${escapeXml(fields.Availability_Date)}</bsvc:Availability_Date>`;
  }
  if (fields.Earliest_Hire_Date) {
    restrictionsData += `\n          <bsvc:Earliest_Hire_Date>${escapeXml(fields.Earliest_Hire_Date)}</bsvc:Earliest_Hire_Date>`;
  }
  if (fields.Job_Family_ID) {
    const jobFamilyType = types.Job_Family_ID || 'Job_Family_ID';
    restrictionsData += `\n          <bsvc:Job_Family_Reference>`;
    restrictionsData += `\n            <bsvc:ID bsvc:type="${escapeXml(jobFamilyType)}">${escapeXml(fields.Job_Family_ID)}</bsvc:ID>`;
    restrictionsData += `\n          </bsvc:Job_Family_Reference>`;
  }
  if (fields.Job_Profile_ID) {
    const jobProfileType = types.Job_Profile_ID || 'Job_Profile_ID';
    restrictionsData += `\n          <bsvc:Job_Profile_Reference>`;
    restrictionsData += `\n            <bsvc:ID bsvc:type="${escapeXml(jobProfileType)}">${escapeXml(fields.Job_Profile_ID)}</bsvc:ID>`;
    restrictionsData += `\n          </bsvc:Job_Profile_Reference>`;
  }
  if (fields.Location_ID) {
    const locationType = types.Location_ID || 'Location_ID';
    restrictionsData += `\n          <bsvc:Location_Reference>`;
    restrictionsData += `\n            <bsvc:ID bsvc:type="${escapeXml(locationType)}">${escapeXml(fields.Location_ID)}</bsvc:ID>`;
    restrictionsData += `\n          </bsvc:Location_Reference>`;
  }
  if (fields.Worker_Type_ID) {
    const workerType = types.Worker_Type_ID || 'Worker_Type_ID';
    restrictionsData += `\n          <bsvc:Worker_Type_Reference>`;
    restrictionsData += `\n            <bsvc:ID bsvc:type="${escapeXml(workerType)}">${escapeXml(fields.Worker_Type_ID)}</bsvc:ID>`;
    restrictionsData += `\n          </bsvc:Worker_Type_Reference>`;
  }
  if (fields.Time_Type_ID) {
    const timeType = types.Time_Type_ID || 'Position_Time_Type_ID';
    restrictionsData += `\n          <bsvc:Time_Type_Reference>`;
    restrictionsData += `\n            <bsvc:ID bsvc:type="${escapeXml(timeType)}">${escapeXml(fields.Time_Type_ID)}</bsvc:ID>`;
    restrictionsData += `\n          </bsvc:Time_Type_Reference>`;
  }
  if (fields.Position_Worker_Type_ID) {
    const posWorkerType = types.Position_Worker_Type_ID || 'WID';
    restrictionsData += `\n          <bsvc:Position_Worker_Type_Reference>`;
    restrictionsData += `\n            <bsvc:ID bsvc:type="${escapeXml(posWorkerType)}">${escapeXml(fields.Position_Worker_Type_ID)}</bsvc:ID>`;
    restrictionsData += `\n          </bsvc:Position_Worker_Type_Reference>`;
  }

  // Working Hours Data
  if (fields.Default_Hours || fields.Scheduled_Hours) {
    workingHoursData += `\n        <bsvc:Position_Restriction_Working_Hours_Details_Data>`;
    if (fields.Default_Hours) {
      workingHoursData += `\n          <bsvc:Default_Hours>${escapeXml(fields.Default_Hours)}</bsvc:Default_Hours>`;
    }
    if (fields.Scheduled_Hours) {
      workingHoursData += `\n          <bsvc:Scheduled_Hours>${escapeXml(fields.Scheduled_Hours)}</bsvc:Scheduled_Hours>`;
    }
    workingHoursData += `\n        </bsvc:Position_Restriction_Working_Hours_Details_Data>`;
  }

  if (restrictionsData) {
    xml += `\n        <bsvc:Position_Group_Restrictions_Data>${restrictionsData}\n        </bsvc:Position_Group_Restrictions_Data>`;
  }

  if (workingHoursData) {
    xml += workingHoursData;
  }

  return xml;
}

function generatePositionOrganizationAssignments(fields, types) {
  let xml = '';

  if (fields.Company_Assignments_ID || fields.Cost_Center_Assignments_ID) {
    xml += '\n        <bsvc:Position_Organization_Assignments_Data>';

    if (fields.Company_Assignments_ID) {
      const companyType = types.Company_Assignments_ID || 'Company_Reference_ID';
      xml += `\n          <bsvc:Company_Assignments_Reference>`;
      xml += `\n            <bsvc:ID bsvc:type="${escapeXml(companyType)}">${escapeXml(fields.Company_Assignments_ID)}</bsvc:ID>`;
      xml += `\n          </bsvc:Company_Assignments_Reference>`;
    }

    if (fields.Cost_Center_Assignments_ID) {
      const costCenterType = types.Cost_Center_Assignments_ID || 'Cost_Center_Reference_ID';
      xml += `\n          <bsvc:Cost_Center_Assignments_Reference>`;
      xml += `\n            <bsvc:ID bsvc:type="${escapeXml(costCenterType)}">${escapeXml(fields.Cost_Center_Assignments_ID)}</bsvc:ID>`;
      xml += `\n          </bsvc:Cost_Center_Assignments_Reference>`;
    }

    xml += '\n        </bsvc:Position_Organization_Assignments_Data>';
  }

  return xml;
}

function generatePositionRequestReason(fields, types) {
  if (fields.Position_Request_Reason_ID) {
    const reasonType = types.Position_Request_Reason_ID || 'Position_Request_Reason_ID';
    return `\n        <bsvc:Position_Request_Reason_Reference>
          <bsvc:ID bsvc:type="${escapeXml(reasonType)}">${escapeXml(fields.Position_Request_Reason_ID)}</bsvc:ID>
        </bsvc:Position_Request_Reason_Reference>`;
  }
  return '';
}

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate Postman instructions
 */
export function generatePostmanInstructions(tenantUrl) {
  return `
Postman Setup Instructions:

1. Create a new POST request
2. URL: ${tenantUrl || 'https://wd2-impl-services1.workday.com/ccx/service/YOUR_TENANT/Staffing/v44.2'}
3. Headers:
   - Content-Type: text/xml
   - SOAPAction: "Create_Position"
4. Body: Select "raw" and "XML"
5. Paste the generated XML above
6. Replace {{ISU_USERNAME}} and {{ISU_PASSWORD}} with your actual credentials
7. Replace any {{field_name}} placeholders with actual data
8. Send the request

Expected Response:
- Success: HTTP 200 with SOAP response containing the new Position ID
- Error: SOAP Fault with error details
  `.trim();
}