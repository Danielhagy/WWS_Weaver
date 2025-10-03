import React, { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// US States with ISO 3166-2 codes (US-XX format)
const US_STATES = [
  { code: 'US-AL', name: 'Alabama' },
  { code: 'US-AK', name: 'Alaska' },
  { code: 'US-AZ', name: 'Arizona' },
  { code: 'US-AR', name: 'Arkansas' },
  { code: 'US-CA', name: 'California' },
  { code: 'US-CO', name: 'Colorado' },
  { code: 'US-CT', name: 'Connecticut' },
  { code: 'US-DE', name: 'Delaware' },
  { code: 'US-FL', name: 'Florida' },
  { code: 'US-GA', name: 'Georgia' },
  { code: 'US-HI', name: 'Hawaii' },
  { code: 'US-ID', name: 'Idaho' },
  { code: 'US-IL', name: 'Illinois' },
  { code: 'US-IN', name: 'Indiana' },
  { code: 'US-IA', name: 'Iowa' },
  { code: 'US-KS', name: 'Kansas' },
  { code: 'US-KY', name: 'Kentucky' },
  { code: 'US-LA', name: 'Louisiana' },
  { code: 'US-ME', name: 'Maine' },
  { code: 'US-MD', name: 'Maryland' },
  { code: 'US-MA', name: 'Massachusetts' },
  { code: 'US-MI', name: 'Michigan' },
  { code: 'US-MN', name: 'Minnesota' },
  { code: 'US-MS', name: 'Mississippi' },
  { code: 'US-MO', name: 'Missouri' },
  { code: 'US-MT', name: 'Montana' },
  { code: 'US-NE', name: 'Nebraska' },
  { code: 'US-NV', name: 'Nevada' },
  { code: 'US-NH', name: 'New Hampshire' },
  { code: 'US-NJ', name: 'New Jersey' },
  { code: 'US-NM', name: 'New Mexico' },
  { code: 'US-NY', name: 'New York' },
  { code: 'US-NC', name: 'North Carolina' },
  { code: 'US-ND', name: 'North Dakota' },
  { code: 'US-OH', name: 'Ohio' },
  { code: 'US-OK', name: 'Oklahoma' },
  { code: 'US-OR', name: 'Oregon' },
  { code: 'US-PA', name: 'Pennsylvania' },
  { code: 'US-RI', name: 'Rhode Island' },
  { code: 'US-SC', name: 'South Carolina' },
  { code: 'US-SD', name: 'South Dakota' },
  { code: 'US-TN', name: 'Tennessee' },
  { code: 'US-TX', name: 'Texas' },
  { code: 'US-UT', name: 'Utah' },
  { code: 'US-VT', name: 'Vermont' },
  { code: 'US-VA', name: 'Virginia' },
  { code: 'US-WA', name: 'Washington' },
  { code: 'US-WV', name: 'West Virginia' },
  { code: 'US-WI', name: 'Wisconsin' },
  { code: 'US-WY', name: 'Wyoming' },
  { code: 'US-DC', name: 'District of Columbia' },
  { code: 'US-AS', name: 'American Samoa' },
  { code: 'US-GU', name: 'Guam' },
  { code: 'US-MP', name: 'Northern Mariana Islands' },
  { code: 'US-PR', name: 'Puerto Rico' },
  { code: 'US-UM', name: 'U.S. Minor Outlying Islands' },
  { code: 'US-VI', name: 'U.S. Virgin Islands' }
];

/**
 * StateSelector - Dropdown for US states with ISO 3166-2 codes
 * Only shown when ISO_3166-2_Code type is selected AND country is United States
 */
export default function StateSelector({ value, onChange, placeholder = 'Select state...' }) {
  const selectedState = useMemo(() => {
    if (!value) return null;
    return US_STATES.find(state => state.code === value);
  }, [value]);

  return (
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger className="h-8">
        <SelectValue placeholder={placeholder}>
          {selectedState ? (
            <span>
              <span className="font-semibold">{selectedState.code}</span>
              <span className="text-muted-foreground ml-2">- {selectedState.name}</span>
            </span>
          ) : (
            placeholder
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {US_STATES.map((state) => (
          <SelectItem key={state.code} value={state.code}>
            <span className="font-semibold mr-2">{state.code}</span>
            <span className="text-muted-foreground">{state.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
