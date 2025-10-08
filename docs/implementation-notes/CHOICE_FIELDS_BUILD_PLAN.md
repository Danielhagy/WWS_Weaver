# Choice Fields & Version Management - Build Plan

## Project Overview
Implement choice field support and per-credential version management for Workday web services.

---

## Phase 1: Version Management ⏳ IN PROGRESS (3/5 complete)

### 1.1 VersionSelector Component ✅ COMPLETED
- [x] Created `Components/VersionSelector.jsx`
- [x] Searchable dropdown (v44.0 to v46.0 in 0.1 increments)
- [x] Search functionality (e.g., "44" shows all v44.x versions)
- [x] Default to v45.0
- [x] Generated WORKDAY_VERSIONS array with all increments

**Files Modified:**
- `Components/VersionSelector.jsx` (CREATED)

### 1.2 Credential Entity Updates ✅ COMPLETED
- [x] Added `webservice_version` field to INITIAL_CREDENTIALS
- [x] Set default to v45.0

**Files Modified:**
- `src/entities/WorkdayCredential.js`

### 1.3 Credentials Page Integration ✅ COMPLETED
- [x] Import VersionSelector component
- [x] Add VersionSelector to form (after Data Center field)
- [x] Update formData state to include webservice_version
- [x] Update handleEdit to populate version
- [x] Update handleSubmit to save version
- [x] Update handleCancel to reset version
- [x] Display version in credential cards (new row in grid with Badge)
- [x] Fixed import path issue (moved to src/components/)

**Files Modified:**
- `Pages/Credentials.jsx` ✅
- `src/components/VersionSelector.jsx` (moved from Components/)

### 1.4 XML Generator Version Integration 🔲 PENDING
- [ ] Update xmlGenerator.js to accept credential parameter
- [ ] Extract version from credential
- [ ] Build version-aware namespace (e.g., `urn:com.workday/bsvc/Staffing/v45.0`)
- [ ] Update all XML generation functions

**Files to Modify:**
- `src/utils/xmlGenerator.js`

### 1.5 ReviewStep Version Display 🔲 PENDING
- [ ] Update ReviewStep to fetch active credential
- [ ] Display version in SOAP preview
- [ ] Show version-aware endpoint URL

**Files to Modify:**
- `Components/integration-builder/ReviewStep.jsx`

---

## Phase 2: SOAP Parser Enhancements 🔲 PENDING

### 2.1 Choice Group Detection
- [ ] Update `soap_parser.py` to detect "you have a choice of the next X items" comments
- [ ] Extract X (the number of choice options)
- [ ] Create choice group metadata in JSON output
- [ ] Tag the next X parameters as belonging to choice group

**Implementation Details:**
```python
# In soap_parser.py, add logic to:
# 1. Detect comment pattern: "you have a choice of the next (\d+) items"
# 2. Create choice_group metadata
# 3. Mark next X items with choice_group_id
```

**Files to Modify:**
- `soap_parser.py`

### 2.2 Recursive Complex Type Extraction
- [ ] Add function to recursively traverse complex types
- [ ] Extract all nested parameters (unlimited depth)
- [ ] Flatten XML paths (e.g., `Applicant_Data.Personal_Data.Name_Data.First_Name`)
- [ ] Preserve required/optional status from nested structures

**Implementation Details:**
```python
def extract_complex_type_fields(complex_type_obj, parent_path="", category_hint=""):
    """
    Recursively extract all fields from a complex type.
    Returns flattened list of fields with full XML paths.
    """
    fields = []
    # Recursive traversal logic
    return fields
```

**Files to Modify:**
- `soap_parser.py`

### 2.3 Smart Categorization
- [ ] Implement domain-based categorization logic
- [ ] Categories: "Personal Information", "Contact Information", "Address Information", etc.
- [ ] Map field names/paths to appropriate categories
- [ ] Handle edge cases (unknown categories → "Other Information")

**Categorization Rules:**
```
Name_Data, Birth_Date → "Personal Information"
Email_Data, Phone_Data → "Contact Information"
Address_Data, Country, Postal_Code → "Address Information"
```

**Files to Modify:**
- `soap_parser.py`

---

## Phase 3: Field Configuration Updates 🔲 PENDING

### 3.1 Contract Contingent Worker - Applicant_Data
- [ ] Re-run SOAP parser on Contract_Contingent_Worker
- [ ] Extract all Applicant_Data nested fields
- [ ] Update `contractContingentWorkerFields.js` with:
  - [ ] Choice group metadata for pre-hire selection
  - [ ] All 4 choice options (Applicant_Reference, Former_Worker_Reference, Student_Reference, Applicant_Data)
  - [ ] Nested Applicant_Data fields (flattened)
- [ ] Test field count and structure

**Files to Modify:**
- `src/config/contractContingentWorkerFields.js`

### 3.2 Create Position - Choice Group Scan
- [ ] Review Create_Position JSON for choice comments
- [ ] If found, add choice group metadata
- [ ] Update field configuration

**Files to Modify:**
- `src/config/createPositionFields.js`

### 3.3 End Contingent Worker Contract - Choice Group Scan
- [ ] Review End_Contingent_Worker_Contract JSON for choice comments
- [ ] If found, add choice group metadata
- [ ] Update field configuration

**Files to Modify:**
- `src/config/endContingentWorkerContractFields.js`

---

## Phase 4: Choice Field UI Component 🔲 PENDING

### 4.1 ChoiceFieldSelector Component
Create modern card-based selector component.

**Features:**
- [ ] Card layout (not radio buttons)
- [ ] Icons for each option (📋 Reference, ✨ Create New, etc.)
- [ ] Active/inactive states with styling
- [ ] Grey-out unselected options when one is chosen
- [ ] Badge showing "Simple Reference" vs "Create New"
- [ ] Smooth expansion animation for complex types

**Component Structure:**
```jsx
<ChoiceFieldSelector
  choiceGroup={choiceGroupMetadata}
  selectedOption={selectedOption}
  onSelect={handleSelectOption}
  fields={allFieldsInGroup}
/>
```

**Files to Create:**
- `Components/field-mapping/ChoiceFieldSelector.jsx`

### 4.2 Nested Field Expansion
- [ ] Detect when selected option is complex type (e.g., Applicant_Data)
- [ ] Dynamically render nested fields inline
- [ ] Group by category within expansion
- [ ] Show required/optional badges

**Files to Modify:**
- `Components/field-mapping/ChoiceFieldSelector.jsx`

---

## Phase 5: Integration with Existing Components 🔲 PENDING

### 5.1 EnhancedFieldMapper Updates
- [ ] Detect choice groups in field definitions
- [ ] Render ChoiceFieldSelector for choice groups
- [ ] Handle regular fields normally
- [ ] Update field mapping state to track choice selections
- [ ] Pass choice metadata to ChoiceFieldSelector

**Files to Modify:**
- `Components/integration-builder/EnhancedFieldMapper.jsx`

### 5.2 DataMappingInterface Updates (Pattern Builder)
- [ ] Add choice selector UI to Pattern Builder
- [ ] Update webhook-to-field mapping for choice fields
- [ ] Show only selected choice option's fields in mapping
- [ ] Add toggle to switch between choice options

**Files to Modify:**
- `Components/pattern-builder/DataMappingInterface.jsx`

### 5.3 MappingStep Updates
- [ ] Ensure choice field state is preserved in integrationData
- [ ] Save selected choice option along with mappings

**Files to Modify:**
- `Components/integration-builder/MappingStep.jsx`

---

## Phase 6: Validation 🔲 PENDING

### 6.1 Choice Group Validation
- [ ] Create validation function for choice groups
- [ ] Check that at least ONE option is filled out
- [ ] Return error if none selected
- [ ] Display validation errors in UI

**Validation Logic:**
```js
function validateChoiceGroup(choiceGroup, mappings) {
  const groupFields = choiceGroup.choiceOptions;
  const hasSelection = groupFields.some(option =>
    mappings.some(m => m.targetField.startsWith(option))
  );
  return hasSelection ? null : "Please select one option from this choice group";
}
```

**Files to Modify:**
- `src/utils/validationHelpers.js` (CREATE if needed)
- `Components/integration-builder/EnhancedFieldMapper.jsx`

### 6.2 Prevent Multiple Choice Selections
- [ ] When user fills one choice option, grey out others
- [ ] Clear other options if user switches choice
- [ ] Show confirmation dialog if switching with data loss

**Files to Modify:**
- `Components/field-mapping/ChoiceFieldSelector.jsx`

---

## Phase 7: Testing 🔲 PENDING

### 7.1 Version Management Tests
- [ ] Test version dropdown in Credentials
- [ ] Test search functionality
- [ ] Test version persistence
- [ ] Test version in SOAP preview

### 7.2 Choice Field Tests
- [ ] Test choice group rendering
- [ ] Test option selection
- [ ] Test nested field expansion
- [ ] Test validation
- [ ] Test grey-out logic

### 7.3 End-to-End Tests
- [ ] Create integration with Contract Contingent Worker
- [ ] Select "Create New Applicant" option
- [ ] Fill nested fields
- [ ] Validate XML generation
- [ ] Test in Pattern Builder

**Files to Create:**
- `tests/version-management.spec.js`
- `tests/choice-fields.spec.js`

---

## Implementation Order (Optimal Path)

1. ✅ **Complete Phase 1.3** - Finish Credentials page integration (30 min)
2. **Phase 1.4 & 1.5** - XML generator & ReviewStep version support (1 hour)
3. **Phase 2** - Enhance SOAP parser (2-3 hours)
4. **Phase 3** - Update all field configurations (2 hours)
5. **Phase 4** - Build Choice Field UI component (2-3 hours)
6. **Phase 5** - Integrate with existing components (2-3 hours)
7. **Phase 6** - Add validation (1 hour)
8. **Phase 7** - Comprehensive testing (2 hours)

**Total Estimated Time: 12-15 hours**

---

## Current Status Summary

### Completed ✅
- VersionSelector component with search
- Credential entity version field
- Credentials page import

### In Progress ⏳
- XML generator version support

### Next Up 🎯
- ReviewStep version display
- SOAP parser enhancements (Phase 2)
- Field configuration updates (Phase 3)

---

## Notes & Decisions

**Version Format:** `v44.0` to `v46.0` in 0.1 increments
**Default Version:** `v45.0`
**Choice UI Style:** Card-based (not radio buttons)
**Nested Field Strategy:** Flatten with smart categorization
**Validation:** At least one choice option required

---

## Files Modified/Created Tracker

### Created ✅
- `src/components/VersionSelector.jsx`
- `CHOICE_FIELDS_BUILD_PLAN.md` (this file)

### Modified ✅
- `src/entities/WorkdayCredential.js`
- `Pages/Credentials.jsx` ✅ COMPLETE

### To Modify 🔲
- `Pages/Credentials.jsx` (complete)
- `src/utils/xmlGenerator.js`
- `Components/integration-builder/ReviewStep.jsx`
- `soap_parser.py`
- `src/config/contractContingentWorkerFields.js`
- `src/config/createPositionFields.js`
- `src/config/endContingentWorkerContractFields.js`
- `Components/integration-builder/EnhancedFieldMapper.jsx`
- `Components/pattern-builder/DataMappingInterface.jsx`
- `Components/integration-builder/MappingStep.jsx`

### To Create 🔲
- `Components/field-mapping/ChoiceFieldSelector.jsx`
- `src/utils/validationHelpers.js`
- `tests/version-management.spec.js`
- `tests/choice-fields.spec.js`

---

**Last Updated:** 2025-10-02 18:00 EST
**Current Phase:** Phase 1.4 - XML Generator Version Support
**Progress:** Phase 1 is 60% complete (3/5 tasks done)
