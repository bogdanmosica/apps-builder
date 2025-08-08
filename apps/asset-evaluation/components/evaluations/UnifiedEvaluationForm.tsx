/**
 * UnifiedEvaluationForm Component
 *
 * This component replaces the previous dual approach (universal + custom fields)
 * with a single unified form that renders ALL fields dynamically based on
 * property type. All fields (including what were previously "universal" fields)
 * are now stored as custom fields in the database and grouped by category.
 *
 * Features:
 * - Single API call to get all fields for a property type
 * - Fields grouped by category (basic, details, construction, amenities, notes, etc.)
 * - Responsive grid layout optimized for mobile
 * - Auto-location functionality with GPS coordinates
 * - Support for all field types: text, number, select, boolean, textarea
 * - Built-in validation and error handling
 */

"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import { Loader2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

interface CustomField {
  id: number;
  label_ro: string;
  label_en?: string | null;
  fieldType: "text" | "number" | "select" | "boolean" | "textarea";
  isRequired: boolean;
  placeholder_ro?: string | null;
  placeholder_en?: string | null;
  helpText_ro?: string | null;
  helpText_en?: string | null;
  selectOptions?: Array<{ value: string; label_ro: string; label_en?: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  category?: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface UnifiedEvaluationFormProps {
  propertyTypeId: number;
  onSubmit?: (data: Record<string, any>) => void;
  initialData?: Record<string, any>;
  isLoading?: boolean;
}

// Category display configuration
const categoryConfig = {
  basic: {
    title_ro: "Informații proprietate",
    title_en: "Property Information",
    icon: "🏠",
    order: 1,
  },
  notes: {
    title_ro: "Observații",
    title_en: "Notes",
    icon: "📝",
    order: 2,
  },
  general: {
    title_ro: "General",
    title_en: "General",
    icon: "📋",
    order: 3,
  },
};

export function UnifiedEvaluationForm({
  propertyTypeId,
  onSubmit,
  initialData = {},
  isLoading = false,
}: UnifiedEvaluationFormProps) {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [fieldsByCategory, setFieldsByCategory] = useState<
    Record<string, CustomField[]>
  >({});
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [loadingFields, setLoadingFields] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gettingLocation, setGettingLocation] = useState(false);

  // Fetch all fields for the property type
  useEffect(() => {
    async function fetchFields() {
      if (!propertyTypeId) return;

      try {
        setLoadingFields(true);
        console.log(
          `🔍 Fetching unified fields for property type ${propertyTypeId}...`,
        );

        const response = await fetch(
          `/api/custom-fields?propertyTypeId=${propertyTypeId}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          const { fields: allFields, fieldsByCategory: categorizedFields } =
            result.data;

          setFields(allFields || []);
          setFieldsByCategory(categorizedFields || {});

          console.log(
            `✅ Loaded ${allFields?.length || 0} unified fields in ${Object.keys(categorizedFields || {}).length} categories`,
          );
        } else {
          console.error("❌ Failed to fetch fields:", result.error);
          // Set empty arrays to prevent crashes
          setFields([]);
          setFieldsByCategory({});
        }
      } catch (error) {
        console.error("❌ Error fetching fields:", error);
        // Set empty arrays to prevent crashes
        setFields([]);
        setFieldsByCategory({});
      } finally {
        setLoadingFields(false);
      }
    }

    fetchFields();
  }, [propertyTypeId]);

  // Handle form field changes
  const handleFieldChange = (fieldId: number, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    // Clear any existing error for this field
    if (errors[fieldId.toString()]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId.toString()];
        return newErrors;
      });
    }
  };

  // Auto-location functionality
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation nu este suportată de acest browser.");
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        try {
          const { latitude, longitude } = position.coords;
          console.log(`📍 GPS coordinates: ${latitude}, ${longitude}`);

          // Find the address field and set coordinates
          const addressField = fields.find(
            (field) =>
              field.label_ro.toLowerCase().includes("adres") ||
              field.label_ro.toLowerCase().includes("locați"),
          );

          if (addressField) {
            const coordinatesText = `Coordonate GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            handleFieldChange(addressField.id, coordinatesText);
          }

          setGettingLocation(false);
        } catch (error) {
          console.error("❌ Error processing location:", error);
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error("❌ Geolocation error:", error);
        let errorMessage = "Nu s-a putut obține locația.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permisiunea pentru locație a fost refuzată.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Informația de locație nu este disponibilă.";
            break;
          case error.TIMEOUT:
            errorMessage = "Cererea pentru locație a expirat.";
            break;
        }

        alert(errorMessage);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    );
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.isRequired && !formData[field.id]) {
        newErrors[field.id.toString()] = `${field.label_ro} este obligatoriu`;
      }

      if (field.validation && formData[field.id]) {
        const value = formData[field.id];

        if (field.fieldType === "number") {
          const numValue = Number(value);
          if (field.validation.min && numValue < field.validation.min) {
            newErrors[field.id.toString()] =
              `Valoarea minimă este ${field.validation.min}`;
          }
          if (field.validation.max && numValue > field.validation.max) {
            newErrors[field.id.toString()] =
              `Valoarea maximă este ${field.validation.max}`;
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("❌ Form validation failed");
      return;
    }

    console.log("✅ Form is valid, submitting...");
    onSubmit?.(formData);
  };

  // Render individual field
  const renderField = (field: CustomField) => {
    const fieldId = field.id.toString();
    const hasError = !!errors[fieldId];
    const fieldValue = formData[field.id] ?? "";

    const commonProps = {
      id: fieldId,
      className: hasError ? "border-red-500" : "",
    };

    switch (field.fieldType) {
      case "text":
        return (
          <Input
            {...commonProps}
            type="text"
            value={fieldValue}
            placeholder={field.placeholder_ro || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleFieldChange(field.id, e.target.value)
            }
          />
        );

      case "number":
        return (
          <Input
            {...commonProps}
            type="number"
            value={fieldValue}
            placeholder={field.placeholder_ro || ""}
            min={field.validation?.min}
            max={field.validation?.max}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleFieldChange(field.id, e.target.value)
            }
          />
        );

      case "select":
        return (
          <Select
            value={fieldValue}
            onValueChange={(value: string) =>
              handleFieldChange(field.id, value)
            }
          >
            <SelectTrigger className={hasError ? "border-red-500" : ""}>
              <SelectValue
                placeholder={field.placeholder_ro || "Selectați..."}
              />
            </SelectTrigger>
            <SelectContent>
              {field.selectOptions?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label_ro}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={fieldId}
              checked={fieldValue === true}
              onCheckedChange={(checked: boolean) =>
                handleFieldChange(field.id, checked)
              }
            />
            <Label htmlFor={fieldId} className="text-sm font-normal">
              Da
            </Label>
          </div>
        );

      case "textarea":
        return (
          <Textarea
            {...commonProps}
            value={fieldValue}
            placeholder={field.placeholder_ro || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleFieldChange(field.id, e.target.value)
            }
            rows={3}
          />
        );

      default:
        return null;
    }
  };

  // Get sorted categories
  const sortedCategories = Object.keys(fieldsByCategory).sort((a, b) => {
    const orderA =
      categoryConfig[a as keyof typeof categoryConfig]?.order ?? 999;
    const orderB =
      categoryConfig[b as keyof typeof categoryConfig]?.order ?? 999;
    return orderA - orderB;
  });

  if (loadingFields) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Se încarcă câmpurile...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (fields.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            Nu au fost găsite câmpuri pentru acest tip de proprietate.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {sortedCategories.map((categoryKey) => {
        const categoryFields = fieldsByCategory[categoryKey];
        const categoryInfo = categoryConfig[
          categoryKey as keyof typeof categoryConfig
        ] || {
          title_ro: categoryKey,
          title_en: categoryKey,
          icon: "📋",
          order: 999,
        };

        return (
          <Card key={categoryKey}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span>{categoryInfo.icon}</span>
                {categoryInfo.title_ro}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryFields.map((field) => (
                  <div
                    key={field.id}
                    className={
                      field.fieldType === "textarea" ? "md:col-span-2" : ""
                    }
                  >
                    <Label
                      htmlFor={field.id.toString()}
                      className="text-sm font-medium"
                    >
                      {field.label_ro}
                      {field.isRequired && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>

                    {/* Special case for address field with location button */}
                    {(field.label_ro.toLowerCase().includes("adres") ||
                      field.label_ro.toLowerCase().includes("locați")) && (
                      <div className="flex gap-2 mt-1">
                        <div className="flex-1">{renderField(field)}</div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleGetCurrentLocation}
                          disabled={gettingLocation}
                          className="shrink-0"
                        >
                          {gettingLocation ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MapPin className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Regular field rendering */}
                    {!(
                      field.label_ro.toLowerCase().includes("adres") ||
                      field.label_ro.toLowerCase().includes("locați")
                    ) && <div className="mt-1">{renderField(field)}</div>}

                    {/* Help text */}
                    {field.helpText_ro && (
                      <p className="text-xs text-gray-500 mt-1">
                        {field.helpText_ro}
                      </p>
                    )}

                    {/* Error message */}
                    {errors[field.id.toString()] && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors[field.id.toString()]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="min-w-32">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Se procesează...
            </>
          ) : (
            "Continuă"
          )}
        </Button>
      </div>
    </form>
  );
}
