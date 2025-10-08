import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Generate version options from v44.0 to v46.0 in 0.1 increments
const generateVersions = () => {
  const versions = [];
  // v44.x
  for (let minor = 0; minor <= 9; minor++) {
    versions.push(`v44.${minor}`);
  }
  // v45.x
  for (let minor = 0; minor <= 9; minor++) {
    versions.push(`v45.${minor}`);
  }
  // v46.0
  versions.push('v46.0');
  return versions;
};

export const WORKDAY_VERSIONS = generateVersions();
export const DEFAULT_VERSION = 'v45.0';

/**
 * VersionSelector component with search capability
 * Allows users to select Workday web service version (v44.0 - v46.0)
 */
export default function VersionSelector({ value, onChange, required = false, disabled = false }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter versions based on search term
  const filteredVersions = useMemo(() => {
    if (!searchTerm) return WORKDAY_VERSIONS;
    return WORKDAY_VERSIONS.filter(version =>
      version.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="space-y-2">
      <Label htmlFor="webservice_version">
        Web Service Version {required && <span className="text-red-500">*</span>}
      </Label>

      {/* Custom Select with Search */}
      <div className="relative">
        <Select
          value={value || DEFAULT_VERSION}
          onValueChange={(newValue) => {
            onChange(newValue);
            setSearchTerm("");
          }}
        >
          <SelectTrigger disabled={disabled} className="w-full">
            <SelectValue placeholder="Select version..." />
          </SelectTrigger>

          <SelectContent>
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200">
              <Input
                type="text"
                placeholder="Search versions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Version Options */}
            <div className="max-h-[200px] overflow-y-auto">
              {filteredVersions.length > 0 ? (
                filteredVersions.map((version) => (
                  <SelectItem key={version} value={version}>
                    {version}
                    {version === DEFAULT_VERSION && (
                      <span className="ml-2 text-xs text-gray-500">(default)</span>
                    )}
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-4 text-center text-sm text-gray-500">
                  No versions found
                </div>
              )}
            </div>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-gray-500">
        Select the Workday SOAP web service version for this credential
      </p>
    </div>
  );
}
