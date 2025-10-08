# Position Assignment Choice Group Implementation

## Summary
Added a second choice group to Contract Contingent Worker for **Position Assignment**, making Position ID and Job Requisition ID mutually exclusive options (just like Pre-hire Selection).

## Changes Made

### 1. Configuration File Updates
**File**: [src/config/contractContingentWorkerFields.js](src/config/contractContingentWorkerFields.js)

#### Added New Choice Group:
```javascript
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
      fields: [...]
    },
    {
      id: "job_requisition_reference",
      name: "Job Requisition ID",
      icon: "📋",
      description: "Assign via job requisition",
      isSimpleReference: true,
      fields: [...]
    }
  ]
}
```

#### Removed Duplicate Fields:
- ❌ Removed "Position ID" from regular fields (was at line ~220)
- ❌ Removed "Job Requisition ID" from regular fields (was at line ~232)
- ✅ These are now exclusively in the choice group

### 2. XML Generator Updates
**File**: [src/utils/xmlGenerator.js](src/utils/xmlGenerator.js)

#### Added Choice-Based Logic (lines 161-181):
```javascript
// Build position assignment based on choice selection
let positionAssignment = '';
const positionAssignmentSelection = choiceSelections['position_assignment'];

if (positionAssignmentSelection === 'position_reference') {
  const positionId = mappedFields['Contract_Contingent_Worker_Data.Position_Reference.ID'];
  const positionType = mappedTypes['Contract_Contingent_Worker_Data.Position_Reference.ID'] || 'Position_ID';
  if (positionId) {
    positionAssignment = `\n        <bsvc:Position_Reference>
          <bsvc:ID bsvc:type="${escapeXml(positionType)}">${escapeXml(positionId)}</bsvc:ID>
        </bsvc:Position_Reference>`;
  }
} else if (positionAssignmentSelection === 'job_requisition_reference') {
  const jobReqId = mappedFields['Contract_Contingent_Worker_Data.Job_Requisition_Reference.ID'];
  const jobReqType = mappedTypes['Contract_Contingent_Worker_Data.Job_Requisition_Reference.ID'] || 'Job_Requisition_ID';
  if (jobReqId) {
    positionAssignment = `\n        <bsvc:Job_Requisition_Reference>
          <bsvc:ID bsvc:type="${escapeXml(jobReqType)}">${escapeXml(jobReqId)}</bsvc:ID>
        </bsvc:Job_Requisition_Reference>`;
  }
}
```

#### Updated SOAP Template (line 205):
```xml
<bsvc:Contract_Contingent_Worker_Data>
  ${preHireReference || '<!-- Pre-hire reference REQUIRED -->'}
  ${generateOrganizationReference(mappedFields, mappedTypes)}
  ${positionAssignment}  <!-- Now based on choice selection -->
  ${contractStartDateXml}
  ${generateContractContingentWorkerEventData(mappedFields, mappedTypes)}
</bsvc:Contract_Contingent_Worker_Data>
```

#### Removed Old Function:
- ❌ Deleted `generatePositionOrJobReference()` function (was generating both fields)

## Correct SOAP XML Structure

### Before (Incorrect - Both Fields Generated):
```xml
<bsvc:Contract_Contingent_Worker_Data>
  <bsvc:Applicant_Reference>...</bsvc:Applicant_Reference>
  <bsvc:Organization_Reference>...</bsvc:Organization_Reference>
  <bsvc:Position_Reference>...</bsvc:Position_Reference>
  <bsvc:Job_Requisition_Reference>...</bsvc:Job_Requisition_Reference>
  <bsvc:Contract_Start_Date>2025-10-03</bsvc:Contract_Start_Date>
  ...
</bsvc:Contract_Contingent_Worker_Data>
```

### After (Correct - Only Selected Choice):
```xml
<bsvc:Contract_Contingent_Worker_Data>
  <bsvc:Applicant_Reference>...</bsvc:Applicant_Reference>
  <bsvc:Organization_Reference>...</bsvc:Organization_Reference>
  <bsvc:Position_Reference>  <!-- OR Job_Requisition_Reference, not both -->
    <bsvc:ID bsvc:type="Position_ID">P001</bsvc:ID>
  </bsvc:Position_Reference>
  <bsvc:Contract_Start_Date>2025-10-03</bsvc:Contract_Start_Date>
  ...
</bsvc:Contract_Contingent_Worker_Data>
```

## UI Behavior

### Position Assignment Section:
The "Position Assignment" category now displays as **choice tiles** (like Pre-hire Selection):

1. **Position ID Tile** (📍)
   - Name: "Position ID"
   - Description: "Assign to an existing position"
   - Fields: Position ID (with type dropdown)

2. **Job Requisition ID Tile** (📋)
   - Name: "Job Requisition ID"
   - Description: "Assign via job requisition"
   - Fields: Job Requisition ID (with type dropdown)

### User Interaction:
- Click one tile to select
- Clicking the same tile again deselects it (since it's optional)
- Selecting one automatically deselects the other
- Each tile expands to show field mapping options (File/Global/Static/Dynamic tabs)

## Testing Verification

### Manual Test Steps:
1. Create new Contract Contingent Worker integration
2. Upload test CSV file
3. In "Position Assignment" section:
   - ✅ Should see 2 tiles: "Position ID" and "Job Requisition ID"
   - ✅ Click "Position ID" tile → should expand
   - ✅ Map Position ID to a file column
   - ✅ Click "Job Requisition ID" tile → Position ID should deselect
   - ✅ Map Job Requisition ID instead
4. Go to Validation step
5. **Verify SOAP XML**:
   - ✅ Only ONE of Position_Reference OR Job_Requisition_Reference appears
   - ✅ The selected reference has the mapped value
   - ✅ No duplicate or conflicting references

## Benefits

1. **Enforces Workday API Rules**: Position and Job Requisition are mutually exclusive per API spec
2. **Clearer UX**: Visual tiles make it obvious this is a choice
3. **Prevents Errors**: Can't accidentally map both fields
4. **Consistent Pattern**: Matches Pre-hire Selection behavior
5. **Correct SOAP**: Generated XML follows Workday schema exactly
