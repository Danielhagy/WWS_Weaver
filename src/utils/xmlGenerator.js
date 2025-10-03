/**
 * XML Generator for Workday SOAP Web Services
 * Generates SOAP XML requests for testing in Postman
 * Supports multiple operations: Create Position, Contract Contingent Worker, End Contingent Worker Contract
 */

import { DYNAMIC_FUNCTIONS } from '@/config/createPositionFields';
import { getServiceByValue } from '@/config/workdayServices';

/**
 * Main entry point - generates SOAP XML for any operation
 * @param {Object} data - Integration data with field mappings and workday_service
 * @param {Object} sampleData - Sample data row (optional, uses placeholders if not provided)
 * @param {Object} credential - Workday credential with version information (optional)
 * @returns {string} - SOAP XML string
 */
export function generateCreatePositionXML(data, sampleData = {}, credential = null) {
  const service = getServiceByValue(data.workday_service);

  if (!service) {
    return generateGenericXML(data, sampleData, credential);
  }

  // Route to specific generator based on operation
  switch (service.operationName) {
    case 'Create_Position':
      return generateCreatePositionSOAP(data, sampleData, credential, service);
    case 'Contract_Contingent_Worker':
      return generateContractContingentWorkerSOAP(data, sampleData, credential, service);
    case 'End_Contingent_Worker_Contract':
      return generateEndContingentWorkerContractSOAP(data, sampleData, credential, service);
    default:
      return generateGenericXML(data, sampleData, credential);
  }
}

/**
 * Helper to get value for a field mapping
 */
function getValue(mapping, sampleData) {
  if (mapping.source_type === 'hardcoded') {
    return mapping.source_value || '';
  }
  if (mapping.source_type === 'dynamic_function') {
    const func = DYNAMIC_FUNCTIONS.find(f => f.id === mapping.source_value);
    return func ? func.execute() : `{{${mapping.source_value}}}`;
  }
  if (mapping.source_type === 'file_column' || mapping.source_type === 'global_attribute') {
    const value = sampleData[mapping.source_value];
    return value || `{{${mapping.source_value}}}`;
  }
  return '';
}

/**
 * Build mapped fields object from field mappings
 */
function buildMappedFields(field_mappings, sampleData) {
  const mappedFields = {};
  const mappedTypes = {};

  field_mappings.forEach(mapping => {
    if (mapping.source_type !== 'unmapped') {
      // Handle xmlPath from nested fields (choice groups)
      const fieldKey = mapping.xmlPath || mapping.target_field;
      const value = getValue(mapping, sampleData);

      console.log(`[buildMappedFields] Field: ${fieldKey}`);
      console.log(`[buildMappedFields]   - source_type: ${mapping.source_type}`);
      console.log(`[buildMappedFields]   - source_value: ${mapping.source_value}`);
      console.log(`[buildMappedFields]   - type_value: ${mapping.type_value}`);
      console.log(`[buildMappedFields]   - resolved value: ${value}`);

      mappedFields[fieldKey] = value;

      if (mapping.type_value) {
        mappedTypes[fieldKey] = mapping.type_value;
        console.log(`[buildMappedFields]   - stored type: ${mapping.type_value}`);
      }
    }
  });

  console.log('[buildMappedFields] Final mappedFields:', mappedFields);
  console.log('[buildMappedFields] Final mappedTypes:', mappedTypes);

  return { mappedFields, mappedTypes };
}

/**
 * Generate Contract Contingent Worker SOAP XML
 */
function generateContractContingentWorkerSOAP(data, sampleData, credential, service) {
  const { field_mappings = [], choiceSelections = {}, choiceFieldValues = {} } = data;
  const version = credential?.webservice_version || service.version || 'v45.0';

  console.log('[XML Generator] Contract Contingent Worker - Sample data:', sampleData);
  console.log('[XML Generator] Field mappings:', field_mappings);
  console.log('[XML Generator] Choice selections:', choiceSelections);
  console.log('[XML Generator] Choice field values:', choiceFieldValues);

  const { mappedFields, mappedTypes } = buildMappedFields(field_mappings, sampleData);

  // Merge choice field values into mapped fields (these take priority)
  Object.keys(choiceFieldValues).forEach(key => {
    if (choiceFieldValues[key] && choiceFieldValues[key] !== '') {
      let value = choiceFieldValues[key];

      // Skip type fields - they'll be handled separately
      if (key.endsWith('_type')) {
        const baseKey = key.replace('_type', '');
        mappedTypes[baseKey] = value;
        return;
      }

      // Check if this is a dynamic function ID and execute it
      const dynamicFunc = DYNAMIC_FUNCTIONS.find(f => f.id === value);
      if (dynamicFunc) {
        console.log(`[XML Generator] Executing dynamic function '${value}' for field '${key}'`);
        value = dynamicFunc.execute();
        console.log(`[XML Generator] Dynamic function result: ${value}`);
      }
      // Check if this is a file column reference and look it up in sampleData
      else if (sampleData[value] !== undefined) {
        console.log(`[XML Generator] Looking up file column '${value}' for field '${key}'`);
        const fileValue = sampleData[value];
        console.log(`[XML Generator] File column value: ${fileValue}`);
        value = fileValue;
      }
      // Otherwise it's a hardcoded value or global attribute - use as-is
      else {
        console.log(`[XML Generator] Using direct value '${value}' for field '${key}'`);
      }

      mappedFields[key] = value;
    }
  });

  console.log('[XML Generator] Final mapped fields:', mappedFields);
  console.log('[XML Generator] Final mapped types:', mappedTypes);

  // Build pre-hire reference based on choice selection
  let preHireReference = '';
  const preHireSelection = choiceSelections['pre_hire_selection'];

  if (preHireSelection === 'applicant_reference') {
    const applicantId = mappedFields['Contract_Contingent_Worker_Data.Applicant_Reference.ID'];
    const applicantType = mappedFields['Contract_Contingent_Worker_Data.Applicant_Reference.ID_type'] || 'Applicant_ID';
    if (applicantId) {
      preHireReference = `<bsvc:Applicant_Reference>
          <bsvc:ID bsvc:type="${escapeXml(applicantType)}">${escapeXml(applicantId)}</bsvc:ID>
        </bsvc:Applicant_Reference>`;
    }
  } else if (preHireSelection === 'former_worker_reference') {
    const formerWorkerId = mappedFields['Contract_Contingent_Worker_Data.Former_Worker_Reference.ID'];
    const formerWorkerType = mappedFields['Contract_Contingent_Worker_Data.Former_Worker_Reference.ID_type'] || 'Former_Worker_ID';
    if (formerWorkerId) {
      preHireReference = `<bsvc:Former_Worker_Reference>
          <bsvc:ID bsvc:type="${escapeXml(formerWorkerType)}">${escapeXml(formerWorkerId)}</bsvc:ID>
        </bsvc:Former_Worker_Reference>`;
    }
  } else if (preHireSelection === 'student_reference') {
    const studentId = mappedFields['Contract_Contingent_Worker_Data.Student_Reference.ID'];
    const studentType = mappedFields['Contract_Contingent_Worker_Data.Student_Reference.ID_type'] || 'Student_ID';
    if (studentId) {
      preHireReference = `<bsvc:Student_Reference>
          <bsvc:ID bsvc:type="${escapeXml(studentType)}">${escapeXml(studentId)}</bsvc:ID>
        </bsvc:Student_Reference>`;
    }
  } else if (preHireSelection === 'create_applicant') {
    preHireReference = generateApplicantData(mappedFields, mappedTypes);
  }

  // Build position assignment based on choice selection
  let positionAssignment = '';
  const positionAssignmentSelection = choiceSelections['position_assignment'];

  console.log('[XML Generator] Position assignment selection:', positionAssignmentSelection);
  console.log('[XML Generator] Choice selections:', choiceSelections);
  console.log('[XML Generator] Choice field values:', choiceFieldValues);

  if (positionAssignmentSelection === 'position_reference') {
    const positionId = mappedFields['Contract_Contingent_Worker_Data.Position_Reference.ID'];
    const positionType = mappedTypes['Contract_Contingent_Worker_Data.Position_Reference.ID'] || 'Position_ID';
    console.log('[XML Generator] Position Reference - ID:', positionId, 'Type:', positionType);
    if (positionId) {
      positionAssignment = `\n        <bsvc:Position_Reference>
          <bsvc:ID bsvc:type="${escapeXml(positionType)}">${escapeXml(positionId)}</bsvc:ID>
        </bsvc:Position_Reference>`;
    }
  } else if (positionAssignmentSelection === 'job_requisition_reference') {
    const jobReqId = mappedFields['Contract_Contingent_Worker_Data.Job_Requisition_Reference.ID'];
    const jobReqType = mappedTypes['Contract_Contingent_Worker_Data.Job_Requisition_Reference.ID'] || 'Job_Requisition_ID';
    console.log('[XML Generator] Job Requisition Reference - ID:', jobReqId, 'Type:', jobReqType);
    if (jobReqId) {
      positionAssignment = `\n        <bsvc:Job_Requisition_Reference>
          <bsvc:ID bsvc:type="${escapeXml(jobReqType)}">${escapeXml(jobReqId)}</bsvc:ID>
        </bsvc:Job_Requisition_Reference>`;
    }
  }

  console.log('[XML Generator] Final position assignment XML:', positionAssignment);

  // Build Organization Reference (direct child of Contract_Contingent_Worker_Data)
  const orgReference = generateOrganizationReference(mappedFields, mappedTypes);

  // Build Contract Start Date (REQUIRED, direct child of Contract_Contingent_Worker_Data)
  const startDate = mappedFields['Contract_Start_Date'];
  const contractStartDateXml = startDate
    ? `\n        <bsvc:Contract_Start_Date>${escapeXml(startDate)}</bsvc:Contract_Start_Date>`
    : `\n        <!-- Contract_Start_Date REQUIRED but not mapped -->`;

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
    <bsvc:Contract_Contingent_Worker_Request bsvc:version="${version}">
      ${generateBusinessProcessParameters(mappedFields)}
      <bsvc:Contract_Contingent_Worker_Data>
        ${preHireReference || '<!-- Pre-hire reference REQUIRED - select one option in Pre-hire Selection -->'}${orgReference}${positionAssignment}${contractStartDateXml}
        ${generateContractContingentWorkerEventData(mappedFields, mappedTypes)}
      </bsvc:Contract_Contingent_Worker_Data>
    </bsvc:Contract_Contingent_Worker_Request>
  </soapenv:Body>
</soapenv:Envelope>`;

  return xml;
}

/**
 * Generate Applicant Data for Create New Applicant option
 */
function generateApplicantData(fields, types = {}) {
  let xml = '<bsvc:Applicant_Data>';

  if (fields['Contract_Contingent_Worker_Data.Applicant_Data.Applicant_ID']) {
    xml += `\n          <bsvc:Applicant_ID>${escapeXml(fields['Contract_Contingent_Worker_Data.Applicant_Data.Applicant_ID'])}</bsvc:Applicant_ID>`;
  }

  // Personal Data with Name
  const firstName = fields['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Name_Data.Legal_Name_Data.Name_Detail_Data.First_Name'];
  const lastName = fields['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Name_Data.Legal_Name_Data.Name_Detail_Data.Last_Name'];
  const countryId = fields['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Name_Data.Legal_Name_Data.Name_Detail_Data.Country_Reference.ID'];
  const countryType = types['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Name_Data.Legal_Name_Data.Name_Detail_Data.Country_Reference.ID'] || 'ISO_3166-1_Alpha-2_Code';

  if (firstName || lastName) {
    xml += `\n          <bsvc:Personal_Data>
            <bsvc:Name_Data>
              <bsvc:Legal_Name_Data>
                <bsvc:Name_Detail_Data>`;
    if (firstName) {
      xml += `\n                  <bsvc:First_Name>${escapeXml(firstName)}</bsvc:First_Name>`;
    }
    if (lastName) {
      xml += `\n                  <bsvc:Last_Name>${escapeXml(lastName)}</bsvc:Last_Name>`;
    }
    // Country_Reference is REQUIRED
    if (countryId) {
      xml += `\n                  <bsvc:Country_Reference>
                    <bsvc:ID bsvc:type="${escapeXml(countryType)}">${escapeXml(countryId)}</bsvc:ID>
                  </bsvc:Country_Reference>`;
    } else {
      xml += `\n                  <!-- Country_Reference REQUIRED - please provide country code (e.g., US, GB, CA) -->`;
    }
    xml += `\n                </bsvc:Name_Detail_Data>
              </bsvc:Legal_Name_Data>
            </bsvc:Name_Data>`;

    // Contact Data
    const email = fields['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Email_Address_Data.Email_Address'];
    const emailUsageType = fields['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Email_Address_Data.Usage_Data.Type_Reference.ID'];
    const emailUsageTypeRef = types['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Email_Address_Data.Usage_Data.Type_Reference.ID'] || 'Communication_Usage_Type_ID';
    const emailPrimary = fields['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Email_Address_Data.Usage_Data.Primary'] || 'true';

    const phone = fields['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Phone_Data.Phone_Number'];
    const phoneCountryCode = fields['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Phone_Data.Country_ISO_Code'];
    const phoneDeviceTypeId = fields['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Phone_Data.Phone_Device_Type_Reference.ID'];
    const phoneDeviceTypeRef = types['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Phone_Data.Phone_Device_Type_Reference.ID'] || 'Phone_Device_Type_ID';
    const phoneUsageType = fields['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Phone_Data.Usage_Data.Type_Reference.ID'];
    const phoneUsageTypeRef = types['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Phone_Data.Usage_Data.Type_Reference.ID'] || 'Communication_Usage_Type_ID';
    const phonePrimary = fields['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Phone_Data.Usage_Data.Primary'] || 'true';

    if (email || phone) {
      xml += `\n            <bsvc:Contact_Data>`;

      // Email with Usage_Data (REQUIRED if email provided)
      if (email) {
        xml += `\n              <bsvc:Email_Address_Data>
                <bsvc:Email_Address>${escapeXml(email)}</bsvc:Email_Address>`;
        if (emailUsageType) {
          xml += `\n                <bsvc:Usage_Data bsvc:Public="true">
                  <bsvc:Type_Data bsvc:Primary="${escapeXml(emailPrimary)}">
                    <bsvc:Type_Reference>
                      <bsvc:ID bsvc:type="${escapeXml(emailUsageTypeRef)}">${escapeXml(emailUsageType)}</bsvc:ID>
                    </bsvc:Type_Reference>
                  </bsvc:Type_Data>
                </bsvc:Usage_Data>`;
        } else {
          xml += `\n                <!-- Usage_Data REQUIRED when Email_Address is provided - use WORK as Type -->`;
        }
        xml += `\n              </bsvc:Email_Address_Data>`;
      }

      // Phone with all required fields
      if (phone) {
        xml += `\n              <bsvc:Phone_Data>`;
        if (phoneCountryCode) {
          xml += `\n                <bsvc:Country_ISO_Code>${escapeXml(phoneCountryCode)}</bsvc:Country_ISO_Code>`;
        } else {
          xml += `\n                <!-- Country_ISO_Code REQUIRED when Phone_Number is provided (e.g., US, GB) -->`;
        }
        xml += `\n                <bsvc:Phone_Number>${escapeXml(phone)}</bsvc:Phone_Number>`;
        if (phoneDeviceTypeId) {
          xml += `\n                <bsvc:Phone_Device_Type_Reference>
                  <bsvc:ID bsvc:type="${escapeXml(phoneDeviceTypeRef)}">${escapeXml(phoneDeviceTypeId)}</bsvc:ID>
                </bsvc:Phone_Device_Type_Reference>`;
        } else {
          xml += `\n                <!-- Phone_Device_Type_Reference REQUIRED - use Mobile or Landline -->`;
        }
        if (phoneUsageType) {
          xml += `\n                <bsvc:Usage_Data bsvc:Public="true">
                  <bsvc:Type_Data bsvc:Primary="${escapeXml(phonePrimary)}">
                    <bsvc:Type_Reference>
                      <bsvc:ID bsvc:type="${escapeXml(phoneUsageTypeRef)}">${escapeXml(phoneUsageType)}</bsvc:ID>
                    </bsvc:Type_Reference>
                  </bsvc:Type_Data>
                </bsvc:Usage_Data>`;
        } else {
          xml += `\n                <!-- Usage_Data REQUIRED when Phone_Number is provided - use WORK as Type -->`;
        }
        xml += `\n              </bsvc:Phone_Data>`;
      }

      // Address Data (optional)
      const addressCountryId = fields['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Address_Data.Country_Reference.ID'];
      const addressLine1 = fields['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Address_Data.Address_Line_Data.Line1'];
      const addressLine2 = fields['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Address_Data.Address_Line_Data.Line2'];
      const city = fields['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Address_Data.Municipality'];
      const stateId = fields['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Address_Data.Country_Region_Reference.ID'];
      const postalCode = fields['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Address_Data.Postal_Code'];
      const addressUsageType = fields['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Address_Data.Usage_Data.Type_Reference.ID'];
      const addressPrimary = fields['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Address_Data.Usage_Data.Primary'] || 'true';

      const addressCountryType = types['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Address_Data.Country_Reference.ID'] || 'ISO_3166-1_Alpha-2_Code';
      const stateType = types['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Address_Data.Country_Region_Reference.ID'] || 'Country_Region_ID';
      const addressUsageTypeRef = types['Contract_Contingent_Worker_Data.Applicant_Data.Personal_Data.Contact_Data.Address_Data.Usage_Data.Type_Reference.ID'] || 'Communication_Usage_Type_ID';

      if (addressCountryId || addressLine1 || city || postalCode) {
        xml += `\n              <bsvc:Address_Data>`;

        // Country_Reference (REQUIRED if address provided)
        if (addressCountryId) {
          xml += `\n                <bsvc:Country_Reference>
                  <bsvc:ID bsvc:type="${escapeXml(addressCountryType)}">${escapeXml(addressCountryId)}</bsvc:ID>
                </bsvc:Country_Reference>`;
        } else {
          xml += `\n                <!-- Country_Reference REQUIRED when Address is provided -->`;
        }

        // Address_Line_Data
        if (addressLine1 || addressLine2) {
          xml += `\n                <bsvc:Address_Line_Data>`;
          if (addressLine1) {
            xml += `\n                  <bsvc:Line1>${escapeXml(addressLine1)}</bsvc:Line1>`;
          }
          if (addressLine2) {
            xml += `\n                  <bsvc:Line2>${escapeXml(addressLine2)}</bsvc:Line2>`;
          }
          xml += `\n                </bsvc:Address_Line_Data>`;
        }

        // Municipality (City)
        if (city) {
          xml += `\n                <bsvc:Municipality>${escapeXml(city)}</bsvc:Municipality>`;
        }

        // Country_Region_Reference (State/Province)
        if (stateId) {
          xml += `\n                <bsvc:Country_Region_Reference>
                  <bsvc:ID bsvc:type="${escapeXml(stateType)}">${escapeXml(stateId)}</bsvc:ID>
                </bsvc:Country_Region_Reference>`;
        }

        // Postal_Code
        if (postalCode) {
          xml += `\n                <bsvc:Postal_Code>${escapeXml(postalCode)}</bsvc:Postal_Code>`;
        }

        // Usage_Data (REQUIRED if address provided)
        if (addressUsageType) {
          xml += `\n                <bsvc:Usage_Data bsvc:Public="true">
                  <bsvc:Type_Data bsvc:Primary="${escapeXml(addressPrimary)}">
                    <bsvc:Type_Reference>
                      <bsvc:ID bsvc:type="${escapeXml(addressUsageTypeRef)}">${escapeXml(addressUsageType)}</bsvc:ID>
                    </bsvc:Type_Reference>
                  </bsvc:Type_Data>
                </bsvc:Usage_Data>`;
        } else {
          xml += `\n                <!-- Usage_Data REQUIRED when Address is provided - use HOME or WORK as Type -->`;
        }

        xml += `\n              </bsvc:Address_Data>`;
      }

      xml += `\n            </bsvc:Contact_Data>`;
    }

    xml += `\n          </bsvc:Personal_Data>`;
  }

  xml += '\n        </bsvc:Applicant_Data>';
  return xml;
}

/**
 * Generate Organization Reference
 */
function generateOrganizationReference(fields, types) {
  const orgId = fields['Contract_Contingent_Worker_Data.Organization_Reference.ID'];
  const orgType = types['Contract_Contingent_Worker_Data.Organization_Reference.ID'] || 'Organization_Reference_ID';

  if (!orgId) {
    return '';
  }

  return `\n        <bsvc:Organization_Reference>
          <bsvc:ID bsvc:type="${escapeXml(orgType)}">${escapeXml(orgId)}</bsvc:ID>
        </bsvc:Organization_Reference>`;
}

/**
 * Generate Contract Contingent Worker Event Data
 */
function generateContractContingentWorkerEventData(fields, types) {
  let xml = '<bsvc:Contract_Contingent_Worker_Event_Data>';

  // Contingent_Worker_ID (optional)
  if (fields['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Contingent_Worker_ID']) {
    xml += `\n          <bsvc:Contingent_Worker_ID>${escapeXml(fields['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Contingent_Worker_ID'])}</bsvc:Contingent_Worker_ID>`;
  }

  // Position_ID (optional) - Used when contracting into Headcount Group or Job Management Org
  if (fields['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_ID']) {
    xml += `\n          <bsvc:Position_ID>${escapeXml(fields['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_ID'])}</bsvc:Position_ID>`;
  }

  // Contract_End_Date (optional, required if Create_Purchase_Order is true)
  if (fields['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Contract_End_Date']) {
    xml += `\n          <bsvc:Contract_End_Date>${escapeXml(fields['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Contract_End_Date'])}</bsvc:Contract_End_Date>`;
  }

  // First_Day_of_Work (optional)
  if (fields['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.First_Day_of_Work']) {
    xml += `\n          <bsvc:First_Day_of_Work>${escapeXml(fields['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.First_Day_of_Work'])}</bsvc:First_Day_of_Work>`;
  }

  // Contract Worker Reason
  const reasonId = fields['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Contract_Worker_Reason_Reference.ID'];
  const reasonType = types['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Contract_Worker_Reason_Reference.ID'] || 'General_Event_Subcategory_ID';
  if (reasonId) {
    xml += `\n          <bsvc:Contract_Worker_Reason_Reference>
            <bsvc:ID bsvc:type="${escapeXml(reasonType)}">${escapeXml(reasonId)}</bsvc:ID>
          </bsvc:Contract_Worker_Reason_Reference>`;
  }

  // Contract Worker Type
  const typeId = fields['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Contract_Worker_Type_Reference.ID'];
  const typeType = types['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Contract_Worker_Type_Reference.ID'] || 'Contingent_Worker_Type_ID';
  if (typeId) {
    xml += `\n          <bsvc:Contract_Worker_Type_Reference>
            <bsvc:ID bsvc:type="${escapeXml(typeType)}">${escapeXml(typeId)}</bsvc:ID>
          </bsvc:Contract_Worker_Type_Reference>`;
  }

  // Create Purchase Order
  if (fields['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Create_Purchase_Order']) {
    xml += `\n          <bsvc:Create_Purchase_Order>${escapeXml(fields['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Create_Purchase_Order'])}</bsvc:Create_Purchase_Order>`;
  }

  // Position_Details (REQUIRED element - can be empty)
  xml += generatePositionDetails(fields, types);

  xml += '\n        </bsvc:Contract_Contingent_Worker_Event_Data>';
  return xml;
}

/**
 * Generate Position_Details (REQUIRED element in Contract_Contingent_Worker_Event_Data)
 */
function generatePositionDetails(fields, types) {
  let xml = '\n          <bsvc:Position_Details>';

  // Job_Profile_Reference (optional)
  const jobProfileId = fields['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_Details.Job_Profile_Reference.ID'];
  const jobProfileType = types['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_Details.Job_Profile_Reference.ID'] || 'Job_Profile_ID';
  if (jobProfileId) {
    xml += `\n            <bsvc:Job_Profile_Reference>
              <bsvc:ID bsvc:type="${escapeXml(jobProfileType)}">${escapeXml(jobProfileId)}</bsvc:ID>
            </bsvc:Job_Profile_Reference>`;
  }

  // Position_Title (optional)
  if (fields['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_Details.Position_Title']) {
    xml += `\n            <bsvc:Position_Title>${escapeXml(fields['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_Details.Position_Title'])}</bsvc:Position_Title>`;
  }

  // Business_Title (optional)
  if (fields['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_Details.Business_Title']) {
    xml += `\n            <bsvc:Business_Title>${escapeXml(fields['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_Details.Business_Title'])}</bsvc:Business_Title>`;
  }

  // Location_Reference (optional)
  const locationId = fields['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_Details.Location_Reference.ID'];
  const locationType = types['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_Details.Location_Reference.ID'] || 'Location_ID';
  if (locationId) {
    xml += `\n            <bsvc:Location_Reference>
              <bsvc:ID bsvc:type="${escapeXml(locationType)}">${escapeXml(locationId)}</bsvc:ID>
            </bsvc:Location_Reference>`;
  }

  // Position_Time_Type_Reference (optional)
  const timeTypeId = fields['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_Details.Position_Time_Type_Reference.ID'];
  const timeTypeType = types['Contract_Contingent_Worker_Data.Contract_Contingent_Worker_Event_Data.Position_Details.Position_Time_Type_Reference.ID'] || 'Position_Time_Type_ID';
  if (timeTypeId) {
    xml += `\n            <bsvc:Position_Time_Type_Reference>
              <bsvc:ID bsvc:type="${escapeXml(timeTypeType)}">${escapeXml(timeTypeId)}</bsvc:ID>
            </bsvc:Position_Time_Type_Reference>`;
  }

  xml += '\n          </bsvc:Position_Details>';
  return xml;
}

/**
 * Generate Create Position SOAP XML
 */
function generateCreatePositionSOAP(data, sampleData, credential, service) {
  const { field_mappings = [], choiceSelections = {}, choiceFieldValues = {} } = data;
  const version = credential?.webservice_version || service.version || 'v45.0';

  console.log('[XML Generator] Create Position - Sample data:', sampleData);
  console.log('[XML Generator] Field mappings:', field_mappings);
  console.log('[XML Generator] Choice selections:', choiceSelections);
  console.log('[XML Generator] Choice field values:', choiceFieldValues);

  const { mappedFields, mappedTypes } = buildMappedFields(field_mappings, sampleData);

  // Merge choice field values into mapped fields (these take priority)
  Object.keys(choiceFieldValues).forEach(key => {
    if (choiceFieldValues[key] && choiceFieldValues[key] !== '') {
      let value = choiceFieldValues[key];

      // Skip type fields - they'll be handled separately
      if (key.endsWith('_type')) {
        const baseKey = key.replace('_type', '');
        mappedTypes[baseKey] = value;
        return;
      }

      // Check if this is a dynamic function ID and execute it
      const dynamicFunc = DYNAMIC_FUNCTIONS.find(f => f.id === value);
      if (dynamicFunc) {
        console.log(`[XML Generator] Executing dynamic function '${value}' for field '${key}'`);
        value = dynamicFunc.execute();
        console.log(`[XML Generator] Dynamic function result: ${value}`);
      }
      // Check if this is a file column reference and look it up in sampleData
      else if (sampleData[value] !== undefined) {
        console.log(`[XML Generator] Looking up file column '${value}' for field '${key}'`);
        const fileValue = sampleData[value];
        console.log(`[XML Generator] File column value: ${fileValue}`);
        value = fileValue;
      }
      // Otherwise it's a hardcoded value or global attribute - use as-is
      else {
        console.log(`[XML Generator] Using direct value '${value}' for field '${key}'`);
      }

      mappedFields[key] = value;
    }
  });

  console.log('[XML Generator] Final mapped fields:', mappedFields);
  console.log('[XML Generator] Final mapped types:', mappedTypes);

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
    <bsvc:Create_Position_Request bsvc:version="${version}">
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

/**
 * Generate End Contingent Worker Contract SOAP XML
 */
function generateEndContingentWorkerContractSOAP(data, sampleData, credential, service) {
  const { field_mappings = [], choiceSelections = {}, choiceFieldValues = {} } = data;
  const version = credential?.webservice_version || service.version || 'v45.0';

  console.log('[XML Generator] End Contract - Sample data:', sampleData);
  console.log('[XML Generator] Field mappings:', field_mappings);
  console.log('[XML Generator] Choice selections:', choiceSelections);
  console.log('[XML Generator] Choice field values:', choiceFieldValues);

  const { mappedFields, mappedTypes } = buildMappedFields(field_mappings, sampleData);

  // Merge choice field values into mapped fields (these take priority)
  Object.keys(choiceFieldValues).forEach(key => {
    if (choiceFieldValues[key] && choiceFieldValues[key] !== '') {
      let value = choiceFieldValues[key];

      // Skip type fields - they'll be handled separately
      if (key.endsWith('_type')) {
        const baseKey = key.replace('_type', '');
        mappedTypes[baseKey] = value;
        return;
      }

      // Check if this is a dynamic function ID and execute it
      const dynamicFunc = DYNAMIC_FUNCTIONS.find(f => f.id === value);
      if (dynamicFunc) {
        console.log(`[XML Generator] Executing dynamic function '${value}' for field '${key}'`);
        value = dynamicFunc.execute();
        console.log(`[XML Generator] Dynamic function result: ${value}`);
      }
      // Check if this is a file column reference and look it up in sampleData
      else if (sampleData[value] !== undefined) {
        console.log(`[XML Generator] Looking up file column '${value}' for field '${key}'`);
        const fileValue = sampleData[value];
        console.log(`[XML Generator] File column value: ${fileValue}`);
        value = fileValue;
      }
      // Otherwise it's a hardcoded value or global attribute - use as-is
      else {
        console.log(`[XML Generator] Using direct value '${value}' for field '${key}'`);
      }

      mappedFields[key] = value;
    }
  });

  console.log('[XML Generator] Final mapped fields:', mappedFields);
  console.log('[XML Generator] Final mapped types:', mappedTypes);

  // Build Contract End Date (REQUIRED at top level)
  const contractEndDate = mappedFields['End_Contingent_Worker_Contract_Data.Contract_End_Date'];
  const contractEndDateXml = contractEndDate
    ? `\n        <bsvc:Contract_End_Date>${escapeXml(contractEndDate)}</bsvc:Contract_End_Date>`
    : `\n        <!-- Contract_End_Date REQUIRED but not mapped -->`;

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
    <bsvc:End_Contingent_Worker_Contract_Request bsvc:version="${version}">
      ${generateBusinessProcessParameters(mappedFields)}

      <bsvc:End_Contingent_Worker_Contract_Data>
        ${generateContingentWorkerReference(mappedFields, mappedTypes)}${contractEndDateXml}
        ${generateEndContractEventData(mappedFields, mappedTypes)}
      </bsvc:End_Contingent_Worker_Contract_Data>
    </bsvc:End_Contingent_Worker_Contract_Request>
  </soapenv:Body>
</soapenv:Envelope>`;

  return xml;
}

function generateContingentWorkerReference(fields, types) {
  const workerId = fields['End_Contingent_Worker_Contract_Data.Contingent_Worker_Reference.ID'];
  const workerType = types['End_Contingent_Worker_Contract_Data.Contingent_Worker_Reference.ID'] || 'Contingent_Worker_ID';

  if (!workerId) {
    return `<!-- Contingent_Worker_Reference REQUIRED but not mapped -->`;
  }

  return `<bsvc:Contingent_Worker_Reference>
          <bsvc:ID bsvc:type="${escapeXml(workerType)}">${escapeXml(workerId)}</bsvc:ID>
        </bsvc:Contingent_Worker_Reference>`;
}

function generateEndContractEventData(fields, types) {
  let xml = '<bsvc:End_Contingent_Worker_Contract_Event_Data>';

  // Primary Reason (REQUIRED)
  const primaryReasonId = fields['End_Contingent_Worker_Contract_Data.End_Contract_Event_Data.Primary_Reason_Reference.ID'];
  const primaryReasonType = types['End_Contingent_Worker_Contract_Data.End_Contract_Event_Data.Primary_Reason_Reference.ID'] || 'Termination_Reason_ID';
  if (primaryReasonId) {
    xml += `\n          <bsvc:Primary_Reason_Reference>
            <bsvc:ID bsvc:type="${escapeXml(primaryReasonType)}">${escapeXml(primaryReasonId)}</bsvc:ID>
          </bsvc:Primary_Reason_Reference>`;
  } else {
    xml += `\n          <!-- Primary_Reason_Reference REQUIRED but not mapped -->`;
  }

  // Last Day of Work
  if (fields['End_Contingent_Worker_Contract_Data.End_Contract_Event_Data.Last_Day_of_Work']) {
    xml += `\n          <bsvc:Last_Day_of_Work>${escapeXml(fields['End_Contingent_Worker_Contract_Data.End_Contract_Event_Data.Last_Day_of_Work'])}</bsvc:Last_Day_of_Work>`;
  }

  // Secondary Reason
  const secondaryReasonId = fields['End_Contingent_Worker_Contract_Data.End_Contract_Event_Data.Secondary_Reason_Reference.ID'];
  const secondaryReasonType = types['End_Contingent_Worker_Contract_Data.End_Contract_Event_Data.Secondary_Reason_Reference.ID'] || 'Termination_Reason_ID';
  if (secondaryReasonId) {
    xml += `\n          <bsvc:Secondary_Reason_Reference>
            <bsvc:ID bsvc:type="${escapeXml(secondaryReasonType)}">${escapeXml(secondaryReasonId)}</bsvc:ID>
          </bsvc:Secondary_Reason_Reference>`;
  }

  xml += '\n        </bsvc:End_Contingent_Worker_Contract_Event_Data>';
  return xml;
}

function generateBusinessProcessParameters(fields) {
  let xml = '<bsvc:Business_Process_Parameters>';

  // Auto Complete - default to true if not specified
  const autoComplete = fields['Auto Complete'] !== undefined ? fields['Auto Complete'] : 'true';
  xml += `\n        <bsvc:Auto_Complete>${escapeXml(autoComplete)}</bsvc:Auto_Complete>`;

  // Run Now - default to true if not specified
  const runNow = fields['Run Now'] !== undefined ? fields['Run Now'] : 'true';
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
  const orgId = fields['Create_Position_Data.Supervisory_Organization_Reference.ID'];
  const orgType = types['Create_Position_Data.Supervisory_Organization_Reference.ID'] || 'Organization_Reference_ID';

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
  if (fields['Create_Position_Data.Position_Data.Position_ID']) {
    xml += `\n          <bsvc:Position_ID>${escapeXml(fields['Create_Position_Data.Position_Data.Position_ID'])}</bsvc:Position_ID>`;
  }
  if (fields['Create_Position_Data.Position_Data.Job_Posting_Title']) {
    xml += `\n          <bsvc:Job_Posting_Title>${escapeXml(fields['Create_Position_Data.Position_Data.Job_Posting_Title'])}</bsvc:Job_Posting_Title>`;
  }
  if (fields['Create_Position_Data.Position_Data.Job_Description_Summary']) {
    xml += `\n          <bsvc:Job_Description_Summary>${escapeXml(fields['Create_Position_Data.Position_Data.Job_Description_Summary'])}</bsvc:Job_Description_Summary>`;
  }
  if (fields['Create_Position_Data.Position_Data.Job_Description']) {
    xml += `\n          <bsvc:Job_Description>${escapeXml(fields['Create_Position_Data.Position_Data.Job_Description'])}</bsvc:Job_Description>`;
  }
  if (fields['Create_Position_Data.Position_Data.Critical_Job']) {
    xml += `\n          <bsvc:Critical_Job>${escapeXml(fields['Create_Position_Data.Position_Data.Critical_Job'])}</bsvc:Critical_Job>`;
  }
  if (fields['Create_Position_Data.Position_Data.Available_for_Overlap']) {
    xml += `\n          <bsvc:Available_for_Overlap>${escapeXml(fields['Create_Position_Data.Position_Data.Available_for_Overlap'])}</bsvc:Available_for_Overlap>`;
  }
  if (fields['Create_Position_Data.Position_Data.Difficulty_to_Fill_Reference.ID']) {
    const diffType = types['Create_Position_Data.Position_Data.Difficulty_to_Fill_Reference.ID'] || 'Difficulty_to_Fill_ID';
    xml += `\n          <bsvc:Difficulty_to_Fill_Reference>`;
    xml += `\n            <bsvc:ID bsvc:type="${escapeXml(diffType)}">${escapeXml(fields['Create_Position_Data.Position_Data.Difficulty_to_Fill_Reference.ID'])}</bsvc:ID>`;
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
  if (fields['Create_Position_Data.Position_Group_Restrictions_Data.Availability_Date']) {
    restrictionsData += `\n          <bsvc:Availability_Date>${escapeXml(fields['Create_Position_Data.Position_Group_Restrictions_Data.Availability_Date'])}</bsvc:Availability_Date>`;
  }
  if (fields['Create_Position_Data.Position_Group_Restrictions_Data.Earliest_Hire_Date']) {
    restrictionsData += `\n          <bsvc:Earliest_Hire_Date>${escapeXml(fields['Create_Position_Data.Position_Group_Restrictions_Data.Earliest_Hire_Date'])}</bsvc:Earliest_Hire_Date>`;
  }
  if (fields['Create_Position_Data.Position_Group_Restrictions_Data.Job_Family_Reference.ID']) {
    const jobFamilyType = types['Create_Position_Data.Position_Group_Restrictions_Data.Job_Family_Reference.ID'] || 'Job_Family_ID';
    restrictionsData += `\n          <bsvc:Job_Family_Reference>`;
    restrictionsData += `\n            <bsvc:ID bsvc:type="${escapeXml(jobFamilyType)}">${escapeXml(fields['Create_Position_Data.Position_Group_Restrictions_Data.Job_Family_Reference.ID'])}</bsvc:ID>`;
    restrictionsData += `\n          </bsvc:Job_Family_Reference>`;
  }
  if (fields['Create_Position_Data.Position_Group_Restrictions_Data.Job_Profile_Reference.ID']) {
    const jobProfileType = types['Create_Position_Data.Position_Group_Restrictions_Data.Job_Profile_Reference.ID'] || 'Job_Profile_ID';
    restrictionsData += `\n          <bsvc:Job_Profile_Reference>`;
    restrictionsData += `\n            <bsvc:ID bsvc:type="${escapeXml(jobProfileType)}">${escapeXml(fields['Create_Position_Data.Position_Group_Restrictions_Data.Job_Profile_Reference.ID'])}</bsvc:ID>`;
    restrictionsData += `\n          </bsvc:Job_Profile_Reference>`;
  }
  if (fields['Create_Position_Data.Position_Group_Restrictions_Data.Location_Reference.ID']) {
    const locationType = types['Create_Position_Data.Position_Group_Restrictions_Data.Location_Reference.ID'] || 'Location_ID';
    restrictionsData += `\n          <bsvc:Location_Reference>`;
    restrictionsData += `\n            <bsvc:ID bsvc:type="${escapeXml(locationType)}">${escapeXml(fields['Create_Position_Data.Position_Group_Restrictions_Data.Location_Reference.ID'])}</bsvc:ID>`;
    restrictionsData += `\n          </bsvc:Location_Reference>`;
  }
  if (fields['Create_Position_Data.Position_Group_Restrictions_Data.Worker_Type_Reference.ID']) {
    const workerType = types['Create_Position_Data.Position_Group_Restrictions_Data.Worker_Type_Reference.ID'] || 'Worker_Type_ID';
    restrictionsData += `\n          <bsvc:Worker_Type_Reference>`;
    restrictionsData += `\n            <bsvc:ID bsvc:type="${escapeXml(workerType)}">${escapeXml(fields['Create_Position_Data.Position_Group_Restrictions_Data.Worker_Type_Reference.ID'])}</bsvc:ID>`;
    restrictionsData += `\n          </bsvc:Worker_Type_Reference>`;
  }
  if (fields['Create_Position_Data.Position_Group_Restrictions_Data.Time_Type_Reference.ID']) {
    const timeType = types['Create_Position_Data.Position_Group_Restrictions_Data.Time_Type_Reference.ID'] || 'Position_Time_Type_ID';
    restrictionsData += `\n          <bsvc:Time_Type_Reference>`;
    restrictionsData += `\n            <bsvc:ID bsvc:type="${escapeXml(timeType)}">${escapeXml(fields['Create_Position_Data.Position_Group_Restrictions_Data.Time_Type_Reference.ID'])}</bsvc:ID>`;
    restrictionsData += `\n          </bsvc:Time_Type_Reference>`;
  }
  if (fields['Create_Position_Data.Position_Group_Restrictions_Data.Position_Worker_Type_Reference.ID']) {
    const posWorkerType = types['Create_Position_Data.Position_Group_Restrictions_Data.Position_Worker_Type_Reference.ID'] || 'Employee_Type_ID';
    restrictionsData += `\n          <bsvc:Position_Worker_Type_Reference>`;
    restrictionsData += `\n            <bsvc:ID bsvc:type="${escapeXml(posWorkerType)}">${escapeXml(fields['Create_Position_Data.Position_Group_Restrictions_Data.Position_Worker_Type_Reference.ID'])}</bsvc:ID>`;
    restrictionsData += `\n          </bsvc:Position_Worker_Type_Reference>`;
  }

  // Working Hours Data
  if (fields['Create_Position_Data.Position_Restriction_Working_Hours_Details_Data.Default_Hours'] || fields['Create_Position_Data.Position_Restriction_Working_Hours_Details_Data.Scheduled_Hours']) {
    workingHoursData += `\n        <bsvc:Position_Restriction_Working_Hours_Details_Data>`;
    if (fields['Create_Position_Data.Position_Restriction_Working_Hours_Details_Data.Default_Hours']) {
      workingHoursData += `\n          <bsvc:Default_Hours>${escapeXml(fields['Create_Position_Data.Position_Restriction_Working_Hours_Details_Data.Default_Hours'])}</bsvc:Default_Hours>`;
    }
    if (fields['Create_Position_Data.Position_Restriction_Working_Hours_Details_Data.Scheduled_Hours']) {
      workingHoursData += `\n          <bsvc:Scheduled_Hours>${escapeXml(fields['Create_Position_Data.Position_Restriction_Working_Hours_Details_Data.Scheduled_Hours'])}</bsvc:Scheduled_Hours>`;
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

function generatePositionRequestReason(fields, types) {
  if (fields['Create_Position_Data.Position_Request_Reason_Reference.ID']) {
    const reasonType = types['Create_Position_Data.Position_Request_Reason_Reference.ID'] || 'General_Event_Subcategory_ID';
    return `\n        <bsvc:Position_Request_Reason_Reference>
          <bsvc:ID bsvc:type="${escapeXml(reasonType)}">${escapeXml(fields['Create_Position_Data.Position_Request_Reason_Reference.ID'])}</bsvc:ID>
        </bsvc:Position_Request_Reason_Reference>`;
  }
  return '';
}

/**
 * Generic XML generator (fallback)
 */
function generateGenericXML(data, sampleData, credential) {
  const version = credential?.webservice_version || 'v45.0';
  return `<?xml version="1.0" encoding="UTF-8"?>
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
    <!-- Generic SOAP request - operation-specific XML not available -->
    <!-- Configure operation in workdayServices.js for proper XML generation -->
  </soapenv:Body>
</soapenv:Envelope>`;
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
 * @param {Object} credential - Workday credential with tenant URL and version
 * @param {string} operationName - Name of the SOAP operation
 */
export function generatePostmanInstructions(credential = null, operationName = 'Create_Position') {
  const version = credential?.webservice_version || 'v45.0';
  const tenantUrl = credential?.tenant_url
    ? `${credential.tenant_url}/Staffing/${version}`
    : `https://wd2-impl-services1.workday.com/ccx/service/YOUR_TENANT/Staffing/${version}`;

  return `
Postman Setup Instructions:

1. Create a new POST request
2. URL: ${tenantUrl}
3. Headers:
   - Content-Type: text/xml
   - SOAPAction: "${operationName}"
4. Body: Select "raw" and "XML"
5. Paste the generated XML above
6. Replace {{ISU_USERNAME}} and {{ISU_PASSWORD}} with your actual credentials
7. Replace any {{field_name}} placeholders with actual data
8. Send the request

Expected Response:
- Success: HTTP 200 with SOAP response containing the result
- Error: SOAP Fault with error details
  `.trim();
}
