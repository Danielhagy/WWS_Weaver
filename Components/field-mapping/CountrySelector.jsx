import React, { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Comprehensive country list with ISO-2 and ISO-3 codes
const COUNTRIES = [
  { name: 'United States', iso2: 'US', iso3: 'USA' },
  { name: 'United Kingdom', iso2: 'GB', iso3: 'GBR' },
  { name: 'Canada', iso2: 'CA', iso3: 'CAN' },
  { name: 'Australia', iso2: 'AU', iso3: 'AUS' },
  { name: 'Germany', iso2: 'DE', iso3: 'DEU' },
  { name: 'France', iso2: 'FR', iso3: 'FRA' },
  { name: 'Italy', iso2: 'IT', iso3: 'ITA' },
  { name: 'Spain', iso2: 'ES', iso3: 'ESP' },
  { name: 'Netherlands', iso2: 'NL', iso3: 'NLD' },
  { name: 'Belgium', iso2: 'BE', iso3: 'BEL' },
  { name: 'Switzerland', iso2: 'CH', iso3: 'CHE' },
  { name: 'Austria', iso2: 'AT', iso3: 'AUT' },
  { name: 'Sweden', iso2: 'SE', iso3: 'SWE' },
  { name: 'Norway', iso2: 'NO', iso3: 'NOR' },
  { name: 'Denmark', iso2: 'DK', iso3: 'DNK' },
  { name: 'Finland', iso2: 'FI', iso3: 'FIN' },
  { name: 'Poland', iso2: 'PL', iso3: 'POL' },
  { name: 'Czech Republic', iso2: 'CZ', iso3: 'CZE' },
  { name: 'Ireland', iso2: 'IE', iso3: 'IRL' },
  { name: 'Portugal', iso2: 'PT', iso3: 'PRT' },
  { name: 'Greece', iso2: 'GR', iso3: 'GRC' },
  { name: 'Japan', iso2: 'JP', iso3: 'JPN' },
  { name: 'China', iso2: 'CN', iso3: 'CHN' },
  { name: 'India', iso2: 'IN', iso3: 'IND' },
  { name: 'South Korea', iso2: 'KR', iso3: 'KOR' },
  { name: 'Singapore', iso2: 'SG', iso3: 'SGP' },
  { name: 'Hong Kong', iso2: 'HK', iso3: 'HKG' },
  { name: 'Taiwan', iso2: 'TW', iso3: 'TWN' },
  { name: 'Thailand', iso2: 'TH', iso3: 'THA' },
  { name: 'Malaysia', iso2: 'MY', iso3: 'MYS' },
  { name: 'Indonesia', iso2: 'ID', iso3: 'IDN' },
  { name: 'Philippines', iso2: 'PH', iso3: 'PHL' },
  { name: 'Vietnam', iso2: 'VN', iso3: 'VNM' },
  { name: 'Brazil', iso2: 'BR', iso3: 'BRA' },
  { name: 'Mexico', iso2: 'MX', iso3: 'MEX' },
  { name: 'Argentina', iso2: 'AR', iso3: 'ARG' },
  { name: 'Chile', iso2: 'CL', iso3: 'CHL' },
  { name: 'Colombia', iso2: 'CO', iso3: 'COL' },
  { name: 'Peru', iso2: 'PE', iso3: 'PER' },
  { name: 'South Africa', iso2: 'ZA', iso3: 'ZAF' },
  { name: 'Egypt', iso2: 'EG', iso3: 'EGY' },
  { name: 'Nigeria', iso2: 'NG', iso3: 'NGA' },
  { name: 'Kenya', iso2: 'KE', iso3: 'KEN' },
  { name: 'New Zealand', iso2: 'NZ', iso3: 'NZL' },
  { name: 'Israel', iso2: 'IL', iso3: 'ISR' },
  { name: 'Turkey', iso2: 'TR', iso3: 'TUR' },
  { name: 'Russia', iso2: 'RU', iso3: 'RUS' },
  { name: 'Ukraine', iso2: 'UA', iso3: 'UKR' },
  { name: 'Romania', iso2: 'RO', iso3: 'ROU' },
  { name: 'Hungary', iso2: 'HU', iso3: 'HUN' },
  { name: 'Bulgaria', iso2: 'BG', iso3: 'BGR' },
  { name: 'Croatia', iso2: 'HR', iso3: 'HRV' },
  { name: 'Slovenia', iso2: 'SI', iso3: 'SVN' },
  { name: 'Slovakia', iso2: 'SK', iso3: 'SVK' },
  { name: 'Estonia', iso2: 'EE', iso3: 'EST' },
  { name: 'Latvia', iso2: 'LV', iso3: 'LVA' },
  { name: 'Lithuania', iso2: 'LT', iso3: 'LTU' },
  { name: 'Luxembourg', iso2: 'LU', iso3: 'LUX' },
  { name: 'Iceland', iso2: 'IS', iso3: 'ISL' },
  { name: 'Malta', iso2: 'MT', iso3: 'MLT' },
  { name: 'Cyprus', iso2: 'CY', iso3: 'CYP' },
  { name: 'United Arab Emirates', iso2: 'AE', iso3: 'ARE' },
  { name: 'Saudi Arabia', iso2: 'SA', iso3: 'SAU' },
  { name: 'Qatar', iso2: 'QA', iso3: 'QAT' },
  { name: 'Kuwait', iso2: 'KW', iso3: 'KWT' },
  { name: 'Bahrain', iso2: 'BH', iso3: 'BHR' },
  { name: 'Oman', iso2: 'OM', iso3: 'OMN' },
];

/**
 * CountrySelector - Dropdown for selecting country codes
 * Displays different codes based on selected type (ISO-2 vs ISO-3)
 */
export default function CountrySelector({ value, type, onChange, placeholder = 'Select country...' }) {
  // Determine which code format to use based on type
  const codeFormat = useMemo(() => {
    if (type === 'ISO_3166-1_Alpha-3_Code') return 'iso3';
    if (type === 'WID') return 'iso2'; // Fallback to ISO-2 for WID
    return 'iso2'; // Default to ISO-2
  }, [type]);

  // Get current country object
  const selectedCountry = useMemo(() => {
    if (!value) return null;
    return COUNTRIES.find(country =>
      country[codeFormat] === value ||
      country.iso2 === value ||
      country.iso3 === value
    );
  }, [value, codeFormat]);

  return (
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger className="h-8">
        <SelectValue placeholder={placeholder}>
          {selectedCountry ? (
            <span>
              <span className="font-semibold">{selectedCountry[codeFormat]}</span>
              <span className="text-muted-foreground ml-2">- {selectedCountry.name}</span>
            </span>
          ) : (
            placeholder
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {COUNTRIES.map((country) => (
          <SelectItem key={country.iso2} value={country[codeFormat]}>
            <span className="font-semibold mr-2">{country[codeFormat]}</span>
            <span className="text-muted-foreground">{country.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
