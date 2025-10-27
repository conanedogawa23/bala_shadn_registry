import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInput } from "@/components/ui/form/FormInput";
import { FormSelect } from "@/components/ui/form/FormSelect";
import { FormDatePicker } from "@/components/ui/form/FormDatePicker";
import { FormCheckbox } from "@/components/ui/form/FormCheckbox";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertCircle, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface InsuranceFieldConfig {
  type: '1st' | '2nd' | '3rd';
  prefix: string; // e.g., 'insurance1', 'insurance2', 'insurance3'
  title: string;
  description?: string;
}

export interface InsuranceSectionProps {
  config: InsuranceFieldConfig;
  watch: UseFormReturn<any>['watch'];
  isEnabled: boolean;
  showCoverage?: boolean; // Option to show coverage fields
  showDPA?: boolean; // Option to show DPA checkbox
  showCOB?: boolean; // Option to show COB field
  showAddress?: boolean; // Option to show address fields
  mode?: 'create' | 'edit' | 'view';
}

/**
 * Reusable Insurance Section Component
 * 
 * Displays insurance information form fields based on backend model structure.
 * 
 * IMPORTANT: Per visio_req.md requirements, only 1st and 2nd insurance should be used.
 * The 3rd insurance option has been removed from the system to comply with requirements.
 * 
 * Supported types: '1st' (Primary), '2nd' (Secondary)
 * Removed type: '3rd' (Tertiary) - Do not use
 */
export function InsuranceSection({
  config,
  watch,
  isEnabled,
  showCoverage = true,
  showDPA = true,
  showCOB = true,
  showAddress = true,
  mode = 'create'
}: InsuranceSectionProps) {
  const { prefix, title, type } = config;
  
  const isViewMode = mode === 'view';
  
  // Get insurance values from form
  const policyHolder = watch(`${prefix}PolicyHolder`);
  const company = watch(`${prefix}Company`);
  const certificateNumber = watch(`${prefix}CertificateNumber`);
  
  // Check if insurance has any data (for view mode)
  const hasInsuranceData = policyHolder || company || certificateNumber;

  if (isViewMode && !hasInsuranceData) {
    return null; // Don't show empty insurance sections in view mode
  }

  return (
    <Card className="border-2 border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">{title}</CardTitle>
            {isEnabled && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
          </div>
          
          {!isViewMode && !isEnabled && (
            <Badge variant="outline" className="bg-gray-50 text-gray-500">
              Not Configured
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!isEnabled && !isViewMode ? (
          <div className="text-center py-6 text-gray-500">
            <AlertCircle className="mx-auto h-8 w-8 mb-2 text-gray-300" />
            <p className="text-sm">Enable this insurance to add information</p>
          </div>
        ) : (
          <>
            {/* Policy Holder Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                Policy Holder Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  name={`${prefix}PolicyHolder`}
                  label="Policy Holder"
                  options={[
                    { value: "Self", label: "Self" },
                    { value: "Spouse", label: "Spouse" },
                    { value: "Parent", label: "Parent" },
                    { value: "Other", label: "Other" },
                  ]}
                  disabled={isViewMode}
                />
                
                <FormInput
                  name={`${prefix}PolicyHolderName`}
                  label="Policy Holder Name"
                  placeholder="John Doe"
                  disabled={isViewMode}
                />
              </div>
              
              <FormDatePicker
                name={`${prefix}PolicyHolderBirthday`}
                label="Policy Holder Date of Birth"
                disabled={isViewMode}
              />
            </div>

            <Separator />

            {/* Insurance Company Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-700">
                Insurance Company Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  name={`${prefix}Company`}
                  label="Insurance Company *"
                  placeholder="Blue Cross, Manulife, etc."
                  disabled={isViewMode}
                />
                
                <FormInput
                  name={`${prefix}CertificateNumber`}
                  label="Certificate Number *"
                  placeholder="CERT123456"
                  disabled={isViewMode}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  name={`${prefix}GroupNumber`}
                  label="Group Number (Optional)"
                  placeholder="12345"
                  disabled={isViewMode}
                />
                
                {showCOB && (
                  <FormSelect
                    name={`${prefix}COB`}
                    label="Coordination of Benefits (COB)"
                    options={[
                      { value: "NO", label: "No" },
                      { value: "YES", label: "Yes" },
                    ]}
                    disabled={isViewMode}
                  />
                )}
              </div>
              
              {showDPA && (
                <FormCheckbox
                  name={`${prefix}DPA`}
                  label="Direct Payment Authorization (DPA)"
                  description="Check if this insurance has DPA authorization"
                  disabled={isViewMode}
                />
              )}
            </div>

            {/* Company Address (Optional) */}
            {showAddress && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-700">
                    Company Address (Optional)
                  </h4>
                  
                  <FormInput
                    name={`${prefix}CompanyAddress`}
                    label="Street Address"
                    placeholder="123 Insurance St"
                    disabled={isViewMode}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                      name={`${prefix}City`}
                      label="City"
                      placeholder="Toronto"
                      disabled={isViewMode}
                    />
                    
                    <FormInput
                      name={`${prefix}Province`}
                      label="Province"
                      placeholder="Ontario"
                      disabled={isViewMode}
                    />
                    
                    <FormInput
                      name={`${prefix}PostalCode`}
                      label="Postal Code"
                      placeholder="A1A 1A1"
                      disabled={isViewMode}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Coverage Details (Optional) */}
            {showCoverage && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-700">
                    Coverage Details (Optional)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      name={`${prefix}CoveragePhysiotherapy`}
                      label="Physiotherapy Coverage ($)"
                      type="number"
                      placeholder="0"
                      disabled={isViewMode}
                    />
                    
                    <FormInput
                      name={`${prefix}CoverageMassage`}
                      label="Massage Coverage ($)"
                      type="number"
                      placeholder="0"
                      disabled={isViewMode}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      name={`${prefix}CoverageOrthopedicShoes`}
                      label="Orthopedic Shoes ($)"
                      type="number"
                      placeholder="0"
                      disabled={isViewMode}
                    />
                    
                    <FormInput
                      name={`${prefix}CoverageCompressionStockings`}
                      label="Compression Stockings ($)"
                      type="number"
                      placeholder="0"
                      disabled={isViewMode}
                    />
                  </div>
                  
                  <FormInput
                    name={`${prefix}CoverageOther`}
                    label="Other Coverage ($)"
                    type="number"
                    placeholder="0"
                    disabled={isViewMode}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      name={`${prefix}CoverageFrequency`}
                      label="Coverage Frequency"
                      placeholder="Annual, Biennial, etc."
                      disabled={isViewMode}
                    />
                    
                    <FormInput
                      name={`${prefix}CoverageTotalAmountPerYear`}
                      label="Total Amount Per Year ($)"
                      type="number"
                      placeholder="0"
                      disabled={isViewMode}
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Insurance Summary Card - For View Mode
 * Compact display of insurance information
 */
export interface InsuranceSummaryProps {
  insurance: {
    type: '1st' | '2nd' | '3rd';
    company: string;
    certificateNumber: string;
    policyHolder?: string;
    policyHolderName?: string;
    groupNumber?: string;
    dpa?: boolean;
    cob?: string;
    coverage?: {
      physiotherapy?: number;
      massage?: number;
      orthopedicShoes?: number;
      compressionStockings?: number;
      other?: number;
    };
  };
}

export function InsuranceSummaryCard({ insurance }: InsuranceSummaryProps) {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-base">
              {insurance.type === '1st' ? 'Primary' : insurance.type === '2nd' ? 'Secondary' : 'Tertiary'} Insurance
            </CardTitle>
          </div>
          
          <div className="flex gap-2">
            {insurance.dpa && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                DPA
              </Badge>
            )}
            {insurance.cob === 'YES' && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                COB
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-700">{insurance.company}</p>
          <p className="text-xs text-gray-500">Certificate: {insurance.certificateNumber}</p>
          {insurance.groupNumber && (
            <p className="text-xs text-gray-500">Group: {insurance.groupNumber}</p>
          )}
        </div>
        
        {insurance.policyHolderName && (
          <div className="text-sm">
            <span className="text-gray-600">Policy Holder: </span>
            <span className="font-medium">{insurance.policyHolderName}</span>
            {insurance.policyHolder && insurance.policyHolder !== insurance.policyHolderName && (
              <span className="text-gray-500 text-xs ml-2">({insurance.policyHolder})</span>
            )}
          </div>
        )}
        
        {insurance.coverage && (
          <div className="bg-gray-50 rounded-md p-3 space-y-1">
            <p className="text-xs font-medium text-gray-700 mb-2">Coverage:</p>
            {insurance.coverage.physiotherapy && insurance.coverage.physiotherapy > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Physiotherapy</span>
                <span className="font-medium">${insurance.coverage.physiotherapy}</span>
              </div>
            )}
            {insurance.coverage.massage && insurance.coverage.massage > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Massage</span>
                <span className="font-medium">${insurance.coverage.massage}</span>
              </div>
            )}
            {insurance.coverage.orthopedicShoes && insurance.coverage.orthopedicShoes > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Orthopedic Shoes</span>
                <span className="font-medium">${insurance.coverage.orthopedicShoes}</span>
              </div>
            )}
            {insurance.coverage.compressionStockings && insurance.coverage.compressionStockings > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Compression Stockings</span>
                <span className="font-medium">${insurance.coverage.compressionStockings}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

