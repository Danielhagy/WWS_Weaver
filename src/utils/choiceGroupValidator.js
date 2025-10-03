/**
 * Choice Group Validation Utilities
 *
 * Validates choice group selections to ensure:
 * 1. Exactly one option is selected from each required choice group
 * 2. All required fields within the selected option are filled
 * 3. Field values meet their validation rules
 */

/**
 * Validates all choice groups
 * @param {Array} choiceGroups - Array of choice group definitions
 * @param {Object} choiceSelections - Map of choiceGroupId -> selectedOptionId
 * @param {Object} choiceFieldValues - Map of xmlPath -> value
 * @returns {Object} - { isValid: boolean, errors: Object, summary: Object }
 */
export function validateChoiceGroups(choiceGroups, choiceSelections, choiceFieldValues) {
  const errors = {};
  const summary = {
    totalGroups: choiceGroups.length,
    validGroups: 0,
    invalidGroups: 0,
    unselectedGroups: 0
  };

  choiceGroups.forEach((choiceGroup) => {
    const selectedOptionId = choiceSelections[choiceGroup.id];

    // Check if option is selected
    if (!selectedOptionId) {
      if (choiceGroup.required) {
        errors[choiceGroup.id] = `Required: Please select one option for ${choiceGroup.name}`;
        summary.unselectedGroups++;
        summary.invalidGroups++;
      }
      return;
    }

    // Find the selected option
    const selectedOption = choiceGroup.options.find(opt => opt.id === selectedOptionId);
    if (!selectedOption) {
      errors[choiceGroup.id] = `Invalid option selected for ${choiceGroup.name}`;
      summary.invalidGroups++;
      return;
    }

    // Validate fields within the selected option
    const fieldErrors = validateOptionFields(selectedOption, choiceFieldValues);

    if (Object.keys(fieldErrors).length > 0) {
      // Store field-level errors
      Object.assign(errors, fieldErrors);
      summary.invalidGroups++;
    } else {
      summary.validGroups++;
    }
  });

  return {
    isValid: summary.invalidGroups === 0 && summary.unselectedGroups === 0,
    errors,
    summary
  };
}

/**
 * Validates fields within a selected option
 * @param {Object} option - The selected option with fields array
 * @param {Object} fieldValues - Map of xmlPath -> value
 * @returns {Object} - Map of xmlPath -> error message
 */
export function validateOptionFields(option, fieldValues) {
  const errors = {};

  if (!option.fields || option.fields.length === 0) {
    return errors;
  }

  option.fields.forEach((field) => {
    const value = fieldValues[field.xmlPath];

    // Check required fields
    if (field.required && (!value || value.trim() === '')) {
      errors[field.xmlPath] = `${field.name} is required`;
      return;
    }

    // Skip validation if field is not filled and not required
    if (!value || value.trim() === '') {
      return;
    }

    // Type-specific validation
    if (field.type === 'text_with_type') {
      // Check if type is also provided
      const typeValue = fieldValues[`${field.xmlPath}_type`];
      if (!typeValue) {
        errors[`${field.xmlPath}_type`] = `Please select a type for ${field.name}`;
      }
    }

    if (field.type === 'number') {
      if (isNaN(value)) {
        errors[field.xmlPath] = `${field.name} must be a valid number`;
      }
    }

    if (field.type === 'date') {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(value)) {
        errors[field.xmlPath] = `${field.name} must be a valid date (YYYY-MM-DD)`;
      }
    }

    if (field.type === 'text' && field.minLength) {
      if (value.length < field.minLength) {
        errors[field.xmlPath] = `${field.name} must be at least ${field.minLength} characters`;
      }
    }

    if (field.type === 'text' && field.maxLength) {
      if (value.length > field.maxLength) {
        errors[field.xmlPath] = `${field.name} must be at most ${field.maxLength} characters`;
      }
    }

    // Email validation (basic)
    if (field.name.toLowerCase().includes('email') && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors[field.xmlPath] = `${field.name} must be a valid email address`;
      }
    }
  });

  return errors;
}

/**
 * Validates a single choice group
 * @param {Object} choiceGroup - Choice group definition
 * @param {String} selectedOptionId - ID of selected option
 * @param {Object} fieldValues - Map of xmlPath -> value
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export function validateSingleChoiceGroup(choiceGroup, selectedOptionId, fieldValues) {
  const errors = {};

  // Check if option is selected
  if (!selectedOptionId) {
    if (choiceGroup.required) {
      errors[choiceGroup.id] = `Required: Please select one option for ${choiceGroup.name}`;
    }
    return { isValid: Object.keys(errors).length === 0, errors };
  }

  // Find the selected option
  const selectedOption = choiceGroup.options.find(opt => opt.id === selectedOptionId);
  if (!selectedOption) {
    errors[choiceGroup.id] = `Invalid option selected for ${choiceGroup.name}`;
    return { isValid: false, errors };
  }

  // Validate fields within the selected option
  const fieldErrors = validateOptionFields(selectedOption, fieldValues);
  Object.assign(errors, fieldErrors);

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Gets all required fields across all choice groups
 * @param {Array} choiceGroups - Array of choice group definitions
 * @param {Object} choiceSelections - Map of choiceGroupId -> selectedOptionId
 * @returns {Array} - Array of required field definitions
 */
export function getRequiredFields(choiceGroups, choiceSelections) {
  const requiredFields = [];

  choiceGroups.forEach((choiceGroup) => {
    const selectedOptionId = choiceSelections[choiceGroup.id];
    if (!selectedOptionId) return;

    const selectedOption = choiceGroup.options.find(opt => opt.id === selectedOptionId);
    if (!selectedOption || !selectedOption.fields) return;

    selectedOption.fields.forEach((field) => {
      if (field.required) {
        requiredFields.push({
          ...field,
          choiceGroupId: choiceGroup.id,
          optionId: selectedOption.id
        });
      }
    });
  });

  return requiredFields;
}

/**
 * Checks if all required fields are filled
 * @param {Array} choiceGroups - Array of choice group definitions
 * @param {Object} choiceSelections - Map of choiceGroupId -> selectedOptionId
 * @param {Object} fieldValues - Map of xmlPath -> value
 * @returns {Boolean} - True if all required fields are filled
 */
export function areAllRequiredFieldsFilled(choiceGroups, choiceSelections, fieldValues) {
  const requiredFields = getRequiredFields(choiceGroups, choiceSelections);

  return requiredFields.every((field) => {
    const value = fieldValues[field.xmlPath];
    return value && value.trim() !== '';
  });
}

/**
 * Gets validation summary for display
 * @param {Array} choiceGroups - Array of choice group definitions
 * @param {Object} choiceSelections - Map of choiceGroupId -> selectedOptionId
 * @param {Object} fieldValues - Map of xmlPath -> value
 * @returns {Object} - Summary object with counts and status
 */
export function getValidationSummary(choiceGroups, choiceSelections, fieldValues) {
  const validation = validateChoiceGroups(choiceGroups, choiceSelections, fieldValues);
  const requiredFields = getRequiredFields(choiceGroups, choiceSelections);
  const filledRequiredFields = requiredFields.filter((field) => {
    const value = fieldValues[field.xmlPath];
    return value && value.trim() !== '';
  });

  return {
    ...validation.summary,
    requiredFieldsTotal: requiredFields.length,
    requiredFieldsFilled: filledRequiredFields.length,
    isComplete: validation.isValid && requiredFields.length === filledRequiredFields.length,
    errors: validation.errors
  };
}
