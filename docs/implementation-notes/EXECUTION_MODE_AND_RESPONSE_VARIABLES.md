# Execution Mode and Response Variable Capture

## Overview

This feature enables multi-step integrations where:
1. One step executes once per file to create a parent record (e.g., Create Position)
2. Subsequent steps loop through rows using response data from previous steps (e.g., Contract multiple workers to that position)

## Use Case Example

**Scenario:** Create a position and contract multiple contingent workers to it

**Step 1: Create Position** (Run Once Per File)
- Input: Position details from first row of CSV
- Execute: Create_Position webservice
- Output: Capture `Position_ID` from response
- Execution: Runs once for the entire file

**Step 2: Contract Contingent Workers** (Run For Each Row)
- Input: Worker details from each row of CSV + `Position_ID` from Step 1
- Execute: Contract_Contingent_Worker webservice for each worker
- Mapping: Use captured `Position_ID` from Step 1 response
- Execution: Loops through every row in the file

## Technical Design

### 1. Execution Mode

Each step has an `executionMode` property with two options:

```javascript
executionMode: 'once_per_file' | 'once_per_row'
```

#### `once_per_file` Mode
- Executes the webservice exactly once
- Uses data from the first row (or aggregated file data)
- Ideal for: Creating parent records, file-level operations
- Example: Create Position, Create Organization

#### `once_per_row` Mode (Default)
- Loops through each row in the CSV file
- Executes the webservice for every row
- Ideal for: Child records, bulk operations
- Example: Contract Workers, Update Employee Data

### 2. Response Variable Capture

After a step executes successfully, users can specify which response elements to capture as variables.

#### Step Configuration
```javascript
{
  id: 'step-1',
  name: 'Create Position',
  webService: 'Create_Position',
  executionMode: 'once_per_file',
  responseCapture: {
    enabled: true,
    variables: [
      {
        name: 'Position_ID',
        xmlPath: 'Create_Position_Response.Position_Reference.ID',
        description: 'The created position ID'
      }
    ]
  }
}
```

#### Runtime Storage
```javascript
{
  stepId: 'step-1',
  executionResults: [
    {
      rowIndex: 0, // null for once_per_file
      success: true,
      capturedVariables: {
        Position_ID: 'POS-12345'
      }
    }
  ]
}
```

### 3. Variable Mapping in Subsequent Steps

Subsequent steps can reference captured variables in their field mappings:

```javascript
{
  targetField: 'Position ID',
  sourceType: 'previous_step_response',
  sourceStepId: 'step-1',
  sourceVariable: 'Position_ID',
  transformation: 'none'
}
```

## UI Components

### 1. Execution Mode Selector

Located in Step Configuration Panel, below webservice selection:

```
┌──────────────────────────────────────────────────────┐
│ Execution Mode                                       │
│                                                      │
│ ┌─────────────────┐  ┌──────────────────┐          │
│ │  🎯 Once Per    │  │  🔄 For Each     │          │
│ │     File        │  │     Row          │          │
│ │                 │  │                  │          │
│ │  ✓ Selected     │  │  (Default)       │          │
│ └─────────────────┘  └──────────────────┘          │
│                                                      │
│ ℹ️ This step will execute once using the first row  │
└──────────────────────────────────────────────────────┘
```

**Visual Indicators:**
- **Once Per File**: 🎯 Target icon (single execution)
- **For Each Row**: 🔄 Loop icon (repeated execution)

### 2. Response Variable Capture UI

Appears after webservice is selected, collapsible section:

```
┌──────────────────────────────────────────────────────┐
│ 📤 Capture Response Data (Optional)                  │
│                                                      │
│ ▼ Capture variables from this step's response       │
│                                                      │
│   Variable 1:                                        │
│   ┌──────────────────────────────────────────────┐  │
│   │ Name: Position_ID                            │  │
│   │ XPath: Position_Reference.ID                 │  │
│   │ Description: The created position            │  │
│   └──────────────────────────────────────────────┘  │
│                                                      │
│   + Add Another Variable                             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 3. Variable Source Selection in Data Mapping

Enhanced source type dropdown in field mapping:

```
Source Type:
┌────────────────────────────────────┐
│ 📄 File Column                     │
│ 🔗 Webhook Attribute               │
│ # Hardcoded Value                  │
│ ⚡ Dynamic Function                │
│ ✨ Previous Step Response (New!)   │  ← New option
└────────────────────────────────────┘

When "Previous Step Response" selected:
┌────────────────────────────────────┐
│ From Step: Step 1 - Create Positi…│
│ Variable: Position_ID               │
└────────────────────────────────────┘
```

## Data Flow Example

### File Input (positions_and_workers.csv)
```csv
position_title,org_id,worker_first,worker_last,start_date
Senior Engineer,ORG-123,John,Doe,2024-01-15
Senior Engineer,ORG-123,Jane,Smith,2024-01-20
Senior Engineer,ORG-123,Bob,Johnson,2024-01-25
```

### Step 1 Execution (Once Per File)
```
Input Row 0:
  position_title: "Senior Engineer"
  org_id: "ORG-123"

Execute: Create_Position(
  Job_Posting_Title: "Senior Engineer",
  Supervisory_Organization_ID: "ORG-123"
)

Response:
  <Position_Reference>
    <ID type="Position_ID">POS-789</ID>
  </Position_Reference>

Captured Variables:
  Position_ID = "POS-789"
```

### Step 2 Execution (For Each Row)
```
Loop Row 0:
  Execute: Contract_Contingent_Worker(
    Position_ID: "POS-789",  ← From Step 1 response
    First_Name: "John",
    Last_Name: "Doe",
    Contract_Start_Date: "2024-01-15"
  )

Loop Row 1:
  Execute: Contract_Contingent_Worker(
    Position_ID: "POS-789",  ← From Step 1 response
    First_Name: "Jane",
    Last_Name: "Smith",
    Contract_Start_Date: "2024-01-20"
  )

Loop Row 2:
  Execute: Contract_Contingent_Worker(
    Position_ID: "POS-789",  ← From Step 1 response
    First_Name: "Bob",
    Last_Name: "Johnson",
    Contract_Start_Date: "2024-01-25"
  )
```

## Implementation Phases

### Phase 1: Execution Mode UI ✅
- Add execution mode selector to StepConfigPanel
- Store executionMode in step configuration
- Add visual indicators (icons, help text)

### Phase 2: Response Variable Capture UI
- Add collapsible response capture section
- Allow users to define variables to capture
- Store responseCapture configuration in step

### Phase 3: Variable Storage & Retrieval
- Execute steps according to their execution mode
- Parse SOAP responses and extract variables
- Store captured variables with step results

### Phase 4: Variable Mapping
- Add "Previous Step Response" source type
- Display available variables from previous steps
- Support variable mapping in DataMappingInterface

### Phase 5: Execution Engine
- Implement once_per_file execution logic
- Implement once_per_row execution with variable injection
- Handle error cases (Step 1 fails → Step 2 doesn't execute)

## User Experience Principles

### Principle 1: Visual Clarity
- Use distinct icons for each execution mode
- Show clear help text explaining the behavior
- Display execution count preview ("This will execute 1 time" vs "This will execute 25 times")

### Principle 2: Intelligent Defaults
- Default to `once_per_row` (most common use case)
- Auto-suggest response variables based on webservice type
- Validate that "once_per_file" steps don't reference row-specific data

### Principle 3: Error Prevention
- Warn if Step 2 depends on Step 1 but Step 1 doesn't capture variables
- Validate XPath expressions for response capture
- Show preview of available variables in real-time

### Principle 4: Progressive Disclosure
- Hide response capture UI until webservice is selected
- Collapse response capture section by default
- Only show "Previous Step Response" option if previous steps exist

## Testing Scenarios

### Test 1: Single Position, Multiple Workers
- Step 1: Create Position (once per file) → Capture Position_ID
- Step 2: Contract 5 Workers (for each row) → Use Position_ID
- Expected: 1 position created, 5 workers contracted to it

### Test 2: Multiple Positions, One Worker Each
- Step 1: Create Position (for each row) → Capture Position_ID
- Step 2: Contract Worker (for each row) → Use Position_ID from same row
- Expected: 5 positions created, 5 workers (one per position)

### Test 3: Chained Dependencies
- Step 1: Create Organization (once per file) → Capture Org_ID
- Step 2: Create Position (once per file) → Use Org_ID, Capture Position_ID
- Step 3: Contract Workers (for each row) → Use Position_ID
- Expected: 1 org, 1 position, 5 workers

### Test 4: Error Handling
- Step 1: Create Position fails
- Step 2: Should not execute (no Position_ID available)
- Expected: Clear error message, graceful stop

## Future Enhancements

1. **Conditional Execution**: Execute step only if previous step succeeded
2. **Variable Transformations**: Transform captured variables before use
3. **Multi-Value Capture**: Capture arrays of values from responses
4. **Row-Specific Variables**: For "for each row" steps, capture per-row responses
5. **Variable Preview**: Show sample values during configuration

---

**Status**: Design Complete, Ready for Implementation
**Priority**: High - Enables critical multi-step use cases
**Estimated Effort**: 3-4 hours for full implementation
