"use client";

import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  AlertCircle,
  Building,
  Calendar,
  Loader2,
  Locate,
  MapPin,
  Navigation,
  Save,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

// Types
interface CustomField {
  id: number;
  propertyTypeId: number;
  label_ro: string;
  label_en?: string;
  fieldType: "text" | "number" | "select" | "textarea" | "date" | "boolean";
  isRequired: boolean;
  placeholder_ro?: string;
  placeholder_en?: string;
  helpText_ro?: string;
  helpText_en?: string;
  selectOptions: Array<{ value: string; label_ro: string; label_en?: string }>;
  validation: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  sortOrder: number;
  isActive: boolean;
}

interface PropertyType {
  id: number;
  name_ro: string;
  name_en?: string;
}

interface DynamicEvaluationFormProps {
  propertyType: PropertyType;
  language?: "ro" | "en";
  mode?: "create" | "edit";
  existingData?: {
    evaluationSessionId?: number;
    propertyName?: string;
    propertyLocation?: string;
    propertySurface?: number;
    propertyFloors?: string;
    propertyConstructionYear?: number;
    customFieldValues?: Record<string, any>;
  };
  onSubmit: (data: EvaluationFormData) => Promise<void>;
  onCancel?: () => void;
}

interface EvaluationFormData {
  // Universal fields
  propertyName: string;
  propertyLocation?: string;
  propertySurface?: number;
  propertyFloors?: string;
  propertyConstructionYear?: number;
  notes?: string;

  // Custom fields
  customFields: Record<string, any>;
}

export default function DynamicEvaluationForm({
  propertyType,
  language = "ro",
  mode = "create",
  existingData,
  onSubmit,
  onCancel,
}: DynamicEvaluationFormProps) {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form data state
  const [formData, setFormData] = useState<EvaluationFormData>({
    propertyName: existingData?.propertyName || "",
    propertyLocation: existingData?.propertyLocation || "",
    propertySurface: existingData?.propertySurface || undefined,
    propertyFloors: existingData?.propertyFloors || "",
    propertyConstructionYear:
      existingData?.propertyConstructionYear || undefined,
    notes: "",
    customFields: existingData?.customFieldValues || {},
  });

  // Load custom fields for this property type
  useEffect(() => {
    const loadCustomFields = async () => {
      try {
        console.log(
          `🔄 Loading custom fields for property type ${propertyType.id}...`,
        );
        const response = await fetch(
          `/api/custom-fields?propertyTypeId=${propertyType.id}`,
        );
        console.log(`📡 API Response status: ${response.status}`);

        if (!response.ok) {
          throw new Error(
            `Failed to load custom fields: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        console.log(`📦 API Response data:`, data);

        // Handle the API response structure: { success: true, customFields: [...] }
        const fields = data.customFields || [];
        console.log(
          `✅ Loaded ${fields.length} custom fields, filtering for active ones...`,
        );

        const activeFields = fields.filter(
          (field: CustomField) => field.isActive,
        );
        console.log(
          `🎯 Found ${activeFields.length} active custom fields:`,
          activeFields,
        );

        setCustomFields(activeFields);
      } catch (error) {
        console.error("❌ Error loading custom fields:", error);
        toast.error("Failed to load custom fields");
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomFields();
  }, [propertyType.id]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate universal fields
    if (!formData.propertyName || formData.propertyName.trim().length < 3) {
      newErrors.propertyName = "Property name must be at least 3 characters";
    }

    if (formData.propertySurface && formData.propertySurface < 10) {
      newErrors.propertySurface = "Surface must be at least 10 sqm";
    }

    if (formData.propertyConstructionYear) {
      const currentYear = new Date().getFullYear();
      if (
        formData.propertyConstructionYear < 1900 ||
        formData.propertyConstructionYear > currentYear
      ) {
        newErrors.propertyConstructionYear = `Year must be between 1900 and ${currentYear}`;
      }
    }

    // Validate custom fields
    customFields.forEach((field) => {
      const fieldKey = `custom_${field.id}`;
      const fieldValue = formData.customFields[fieldKey];

      if (field.isRequired && (!fieldValue || fieldValue === "")) {
        newErrors[fieldKey] = `${getFieldLabel(field)} is required`;
        return;
      }

      if (fieldValue) {
        switch (field.fieldType) {
          case "number": {
            const numValue = Number(fieldValue);
            if (isNaN(numValue)) {
              newErrors[fieldKey] = "Must be a valid number";
            } else {
              if (
                field.validation.min !== undefined &&
                numValue < field.validation.min
              ) {
                newErrors[fieldKey] =
                  `Must be at least ${field.validation.min}`;
              }
              if (
                field.validation.max !== undefined &&
                numValue > field.validation.max
              ) {
                newErrors[fieldKey] = `Must be at most ${field.validation.max}`;
              }
            }
            break;
          }

          case "text":
          case "textarea":
            if (
              field.validation.min &&
              fieldValue.length < field.validation.min
            ) {
              newErrors[fieldKey] =
                `Must be at least ${field.validation.min} characters`;
            }
            if (
              field.validation.max &&
              fieldValue.length > field.validation.max
            ) {
              newErrors[fieldKey] =
                `Must be at most ${field.validation.max} characters`;
            }
            break;

          case "select": {
            const validOptions = field.selectOptions.map((opt) => opt.value);
            if (!validOptions.includes(fieldValue)) {
              newErrors[fieldKey] = "Invalid selection";
            }
            break;
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUniversalFieldChange = (
    fieldName: keyof EvaluationFormData,
    value: any,
  ) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));

    // Clear error
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const handleCustomFieldChange = (fieldId: number, value: any) => {
    const fieldKey = `custom_${fieldId}`;
    setFormData((prev) => ({
      ...prev,
      customFields: { ...prev.customFields, [fieldKey]: value },
    }));

    // Clear error
    if (errors[fieldKey]) {
      setErrors((prev) => ({ ...prev, [fieldKey]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast.success(
        mode === "create"
          ? "Property evaluation created successfully!"
          : "Property evaluation updated successfully!",
      );
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to save property evaluation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldLabel = (field: CustomField) => {
    return language === "en" && field.label_en
      ? field.label_en
      : field.label_ro;
  };

  const getFieldPlaceholder = (field: CustomField) => {
    return language === "en" && field.placeholder_en
      ? field.placeholder_en
      : field.placeholder_ro;
  };

  const getFieldHelpText = (field: CustomField) => {
    return language === "en" && field.helpText_en
      ? field.helpText_en
      : field.helpText_ro;
  };

  // Geolocation function
  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // For now, just use coordinates (can be enhanced later with reverse geocoding)
          const coordinatesString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          handleUniversalFieldChange("propertyLocation", coordinatesString);
          toast.success("Current location added successfully!");
        } catch (error) {
          console.error("Error processing location:", error);
          toast.error("Failed to process location");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsGettingLocation(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error(
              "Location access denied. Please enable location permissions.",
            );
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out.");
            break;
          default:
            toast.error("An unknown error occurred while getting location.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    );
  };

  const renderCustomField = (field: CustomField) => {
    const fieldKey = `custom_${field.id}`;
    const label = getFieldLabel(field);
    const placeholder = getFieldPlaceholder(field);
    const helpText = getFieldHelpText(field);
    const value = formData.customFields[fieldKey] || "";
    const error = errors[fieldKey];

    return (
      <div key={field.id} className="space-y-2">
        <Label className="flex items-center gap-2">
          {label}
          {field.isRequired && <span className="text-red-500">*</span>}
        </Label>

        {field.fieldType === "text" && (
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            className={error ? "border-red-500" : ""}
          />
        )}

        {field.fieldType === "number" && (
          <Input
            type="number"
            placeholder={placeholder}
            value={value}
            onChange={(e) =>
              handleCustomFieldChange(
                field.id,
                e.target.value ? Number(e.target.value) : "",
              )
            }
            min={field.validation.min}
            max={field.validation.max}
            className={error ? "border-red-500" : ""}
          />
        )}

        {field.fieldType === "textarea" && (
          <Textarea
            placeholder={placeholder}
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            rows={3}
            className={error ? "border-red-500" : ""}
          />
        )}

        {field.fieldType === "date" && (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            className={error ? "border-red-500" : ""}
          />
        )}

        {field.fieldType === "boolean" && (
          <div className="flex items-center gap-2">
            <Switch
              checked={value || false}
              onCheckedChange={(checked) =>
                handleCustomFieldChange(field.id, checked)
              }
            />
            <span className="text-sm text-muted-foreground">
              {value ? "Yes" : "No"}
            </span>
          </div>
        )}

        {field.fieldType === "select" && (
          <Select
            value={value || ""}
            onValueChange={(newValue) =>
              handleCustomFieldChange(field.id, newValue)
            }
          >
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder={placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.selectOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {language === "en" && option.label_en
                    ? option.label_en
                    : option.label_ro}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {helpText && (
          <p className="text-sm text-muted-foreground">{helpText}</p>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading evaluation form...</span>
      </div>
    );
  }

  const propertyTypeName =
    language === "en" && propertyType.name_en
      ? propertyType.name_en
      : propertyType.name_ro;

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          <h2 className="text-lg sm:text-xl font-semibold">
            {mode === "create"
              ? "New Property Evaluation"
              : "Edit Property Evaluation"}
          </h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">{propertyTypeName}</Badge>
          <span className="text-xs sm:text-sm text-muted-foreground">
            Property type with {customFields.length} custom fields
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Universal Fields Section */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Building className="h-4 w-4" />
              Basic Property Information
            </CardTitle>
            <CardDescription className="text-sm">
              Standard information required for all properties
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Property Name - Required */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Property Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g., Casa părinților, Apartament București"
                value={formData.propertyName}
                onChange={(e) =>
                  handleUniversalFieldChange("propertyName", e.target.value)
                }
                className={errors.propertyName ? "border-red-500" : ""}
              />
              {errors.propertyName && (
                <p className="text-sm text-red-500">{errors.propertyName}</p>
              )}
            </div>

            {/* Property Location */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location / Address
              </Label>
              <div className="flex gap-2">
                <Textarea
                  placeholder="e.g., Strada Victoriei 15, București"
                  rows={2}
                  value={formData.propertyLocation || ""}
                  onChange={(e) =>
                    handleUniversalFieldChange(
                      "propertyLocation",
                      e.target.value,
                    )
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetCurrentLocation}
                  disabled={isGettingLocation}
                  className="shrink-0 h-auto self-start px-3"
                  title="Get current location"
                >
                  {isGettingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Locate className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Optional - for your reference only. Click the location button to
                auto-detect.
              </p>
            </div>

            {/* Optimized grid for mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Surface Area - compact on mobile */}
              <div className="space-y-2">
                <Label className="text-sm">Surface (sqm)</Label>
                <Input
                  type="number"
                  placeholder="85"
                  value={formData.propertySurface || ""}
                  onChange={(e) =>
                    handleUniversalFieldChange(
                      "propertySurface",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  min={10}
                  className={errors.propertySurface ? "border-red-500" : ""}
                />
                {errors.propertySurface && (
                  <p className="text-xs text-red-500">
                    {errors.propertySurface}
                  </p>
                )}
              </div>

              {/* Construction Year - more compact */}
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Built Year
                </Label>
                <Input
                  type="number"
                  placeholder="2010"
                  value={formData.propertyConstructionYear || ""}
                  onChange={(e) =>
                    handleUniversalFieldChange(
                      "propertyConstructionYear",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  min={1900}
                  max={new Date().getFullYear()}
                  className={
                    errors.propertyConstructionYear ? "border-red-500" : ""
                  }
                />
                {errors.propertyConstructionYear && (
                  <p className="text-xs text-red-500">
                    {errors.propertyConstructionYear}
                  </p>
                )}
              </div>

              {/* Number of Floors - full width on mobile */}
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="text-sm">Floors</Label>
                <Select
                  value={formData.propertyFloors || ""}
                  onValueChange={(value) =>
                    handleUniversalFieldChange("propertyFloors", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Floor</SelectItem>
                    <SelectItem value="2">2 Floors</SelectItem>
                    <SelectItem value="3">3 Floors</SelectItem>
                    <SelectItem value="mansarda">Attic</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                placeholder="Add any additional information about this property..."
                rows={3}
                value={formData.notes || ""}
                onChange={(e) =>
                  handleUniversalFieldChange("notes", e.target.value)
                }
              />
              <p className="text-sm text-muted-foreground">
                Optional notes for your reference
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Custom Fields Section */}
        {customFields.length > 0 && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Settings className="h-4 w-4" />
                Custom Fields for {propertyTypeName}
              </CardTitle>
              <CardDescription className="text-sm">
                Property-specific information configured for this type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {customFields
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map(renderCustomField)}
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {customFields.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No custom fields configured for this property type. Contact
                  your administrator to add custom fields.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {mode === "create"
                    ? "Create Evaluation"
                    : "Update Evaluation"}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
