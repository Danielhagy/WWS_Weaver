# Put Position Integration - Mapping Guide

## Overview

This guide explains how to map your data to create positions in Workday using the Create Position web service.

## Sample CSV Template

A sample CSV file (`sample_position_data.csv`) is included with the following columns:

- `supervisory_org_id` - The organization that will own the position
- `supervisory_org_type` - Type of organization ID (e.g., "Organization_Reference_ID")
- `position_id` - Unique identifier for the position (optional, can be auto-generated)
- `job_title` - Title to display in job postings
- `job_description_summary` - Brief summary of the job
- `job_description` - Full detailed job description
- `is_critical` - Whether this is a critical position (true/false)
- `available_for_overlap` - Allow multiple workers (true/false)
- `request_reason_id` - Reason for creating position (e.g., "New_Headcount", "Replacement")
- `difficulty_to_fill` - Expected difficulty (Easy, Medium, Hard, Very_Hard)

## Field Mapping Types

### 1. Map from File Column 📄
Map a Workday field to a column in your CSV file.

**When to use:**
- When your data file contains the values
- When each record has different values
- Most common mapping type

**Example:**
- Map `Job_Posting_Title` → CSV column `job_title`
- Map `Supervisory_Organization_ID` → CSV column `supervisory_org_id`

### 2. Hardcode Value #
Set a fixed value that applies to all records.

**When to use:**
- Same value for all positions being created
- Organization-wide defaults
- Process parameters

**Example:**
- Hardcode `Auto_Complete` = `false` (all positions need approval)
- Hardcode `Run_Now` = `true` (execute immediately)
- Hardcode `Supervisory_Organization_Type` = `Organization_Reference_ID`

### 3. Dynamic Function ⚡
Use a function that generates values at runtime.

**Available Functions:**

#### Today's Date
- **Use for:** Effective dates, creation dates
- **Output:** Current date in YYYY-MM-DD format
- **Example:** `2025-09-30`

#### Current Date and Time
- **Use for:** Timestamps, audit fields
- **Output:** ISO timestamp
- **Example:** `2025-09-30T14:30:00.000Z`

#### Unix Timestamp
- **Use for:** Unique identifiers, sorting
- **Output:** Seconds since epoch
- **Example:** `1727707800`

#### Generate UUID
- **Use for:** Unique record identifiers
- **Output:** UUID v4
- **Example:** `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

#### Random Number
- **Use for:** Testing, temporary IDs
- **Output:** Random number 1-1000
- **Example:** `742`

## Required vs Optional Fields

### ✅ Required Fields (Must Map)

These fields MUST be mapped for the integration to work:

1. **Supervisory_Organization_ID**
   - The organization that owns this position
   - Usually from your organizational hierarchy
   - Example: `SUPERVISORY_ORG-6-123`

2. **Supervisory_Organization_Type**
   - Type of organization identifier
   - Common values: `Organization_Reference_ID`, `Supervisory_Organization_ID`
   - Can be hardcoded if consistent

### ⭕ Optional Fields (Enhance Your Data)

Optional fields add detail but aren't required:

#### Position Details
- `Position_ID` - Custom ID (leave blank to auto-generate)
- `Job_Posting_Title` - External job title
- `Job_Description_Summary` - Brief description
- `Job_Description` - Full description
- `Critical_Job` - Mark as business-critical
- `Available_for_Overlap` - Allow multiple workers

#### Request Information
- `Position_Request_Reason_ID` - Why creating position
- `Position_Request_Reason_Type` - Type of reason
- `Difficulty_to_Fill_ID` - Recruitment difficulty

#### Process Options
- `Auto_Complete` - Skip approval steps
- `Run_Now` - Execute immediately
- `Comment` - Notes for approvers

## Mapping Best Practices

### 1. Start with Required Fields
Always map the required fields first. The system will alert you if any are missing.

### 2. Use Hardcoded Values for Constants
If all positions belong to the same organization type, hardcode it rather than including it in every CSV row.

**Example:**
- Hardcode `Supervisory_Organization_Type` = `Organization_Reference_ID`
- Hardcode `Run_Now` = `true`

### 3. Use Dynamic Functions for Dates
Never hardcode dates. Use the "Today's Date" function so the integration always uses the current date.

**Example:**
- Use `Today's Date` function for effective dates
- Ensures positions are always created with current date

### 4. Map Optional Fields for Better Data
While optional, fields like `Job_Posting_Title` and `Job_Description` are highly recommended for a complete position record.

### 5. Keep CSV Simple
Only include columns you'll actually map. You don't need to include every possible field in your CSV.

## Step-by-Step Mapping Process

### Step 1: Upload Your CSV
1. Click "Choose File" or drag and drop
2. System analyzes your CSV and detects columns
3. Review detected columns

### Step 2: Map Required Fields
1. Find each required field (marked with red "Required" badge)
2. Click "Map from File" button
3. Select the appropriate CSV column
4. Verify the mapping

Example:
```
Supervisory_Organization_ID → supervisory_org_id (CSV column)
```

### Step 3: Add Hardcoded Defaults
For fields that are the same for all records:
1. Click "Hardcode Value" button
2. Enter the value
3. Save

Example:
```
Supervisory_Organization_Type = Organization_Reference_ID (hardcoded)
```

### Step 4: Configure Dynamic Functions (Optional)
For fields that need runtime values:
1. Click "Dynamic Function" button
2. Select function (e.g., "Today's Date")
3. Preview the output

### Step 5: Map Optional Fields
Enhance your data by mapping optional fields:
- Job titles and descriptions
- Position characteristics
- Process parameters

### Step 6: Verify and Proceed
- Check that all required fields show "mapped"
- Green success message confirms readiness
- Click "Next" to continue

## Common Mapping Scenarios

### Scenario 1: Bulk Position Creation
**Goal:** Create 50 new positions from HR planning

**Mapping Strategy:**
- **From File:** All position-specific data (titles, descriptions, org IDs)
- **Hardcoded:** Process parameters (Run_Now, Auto_Complete)
- **Dynamic:** Use Today's Date for effective dates

### Scenario 2: Template-Based Creation
**Goal:** Create similar positions with slight variations

**Mapping Strategy:**
- **From File:** Only varying fields (Position_ID, Job_Title, Org_ID)
- **Hardcoded:** Standard descriptions, process settings
- **Dynamic:** Effective dates

### Scenario 3: Testing/Development
**Goal:** Test integration with sample data

**Mapping Strategy:**
- **From File:** Minimal required fields
- **Dynamic:** Generate UUIDs for position IDs
- **Hardcoded:** Test organization IDs

## Troubleshooting

### "Required fields pending" Alert
**Problem:** Not all required fields are mapped
**Solution:** Map `Supervisory_Organization_ID` and `Supervisory_Organization_Type`

### "No columns available" in Dropdown
**Problem:** CSV file not uploaded or has no headers
**Solution:** 
1. Upload a CSV file with headers in the first row
2. Ensure CSV is properly formatted
3. Try the sample CSV file provided

### Values Not Appearing
**Problem:** Dynamic function not generating values
**Solution:** 
1. Select the function from dropdown
2. Check the preview to confirm output
3. Proceed to next step to finalize

## Advanced Tips

### Combining Approaches
You can use all three mapping types together:
- Required org fields: **From File** (varies by position)
- Process settings: **Hardcoded** (same for all)
- Effective dates: **Dynamic** (always current)

### CSV Formatting
- First row must contain column headers
- Use clear, descriptive column names
- Avoid special characters in headers
- Keep data consistent (no mixed formats)

### Data Validation
The system validates:
- Required fields are mapped
- Dynamic functions generate valid data
- Hardcoded boolean values are true/false
- All mappings are complete before proceeding

---

## Quick Reference

| Field | Type | Required | Recommended Mapping |
|-------|------|----------|-------------------|
| Supervisory_Organization_ID | Text | ✅ Yes | From File |
| Supervisory_Organization_Type | Select | ✅ Yes | Hardcoded |
| Position_ID | Text | ⭕ No | From File or Auto |
| Job_Posting_Title | Text | ⭕ No | From File |
| Job_Description | Textarea | ⭕ No | From File |
| Critical_Job | Boolean | ⭕ No | From File or Hardcoded |
| Auto_Complete | Boolean | ⭕ No | Hardcoded |
| Run_Now | Boolean | ⭕ No | Hardcoded |

---

**Need Help?** Review the field descriptions and help text in the mapping interface for detailed guidance on each field.
