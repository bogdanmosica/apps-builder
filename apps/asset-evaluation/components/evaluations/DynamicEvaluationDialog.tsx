"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Edit, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import DynamicEvaluationForm from "./DynamicEvaluationForm";

interface PropertyType {
  id: number;
  name_ro: string;
  name_en?: string;
}

interface EvaluationFormData {
  propertyName: string;
  propertyLocation?: string;
  propertySurface?: number;
  propertyFloors?: string;
  propertyConstructionYear?: number;
  notes?: string;
  customFields: Record<string, any>;
}

interface DynamicEvaluationDialogProps {
  propertyType: PropertyType;
  mode: "create" | "edit";
  existingData?: {
    evaluationSessionId?: number;
    propertyName?: string;
    propertyLocation?: string;
    propertySurface?: number;
    propertyFloors?: string;
    propertyConstructionYear?: number;
    customFieldValues?: Record<string, any>;
  };
  language?: "ro" | "en";
  onEvaluationSaved?: () => void;
  children?: React.ReactNode;
}

export default function DynamicEvaluationDialog({
  propertyType,
  mode,
  existingData,
  language = "ro",
  onEvaluationSaved,
  children,
}: DynamicEvaluationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (formData: EvaluationFormData) => {
    try {
      const payload = {
        propertyTypeId: propertyType.id,
        ...formData,
      };

      let response;
      if (mode === "create") {
        response = await fetch("/api/evaluations/dynamic", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        // For edit mode, you would typically need an update endpoint
        response = await fetch(
          `/api/evaluations/dynamic/${existingData?.evaluationSessionId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );
      }

      if (!response.ok) {
        throw new Error("Failed to save evaluation");
      }

      const result = await response.json();

      setIsOpen(false);
      onEvaluationSaved?.();

      return result;
    } catch (error) {
      console.error("Error saving evaluation:", error);
      throw error;
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const propertyTypeName =
    language === "en" && propertyType.name_en
      ? propertyType.name_en
      : propertyType.name_ro;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant={mode === "create" ? "default" : "outline"}
            className="gap-2"
          >
            {mode === "create" ? (
              <Plus className="h-4 w-4" />
            ) : (
              <Edit className="h-4 w-4" />
            )}
            {mode === "create" ? "New Evaluation" : "Edit Evaluation"}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "create"
              ? "Create Property Evaluation"
              : "Edit Property Evaluation"}
            <Badge variant="secondary">{propertyTypeName}</Badge>
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? `Create a new property evaluation for ${propertyTypeName} type with dynamic custom fields.`
              : `Edit the property evaluation with updated information and custom field values.`}
          </DialogDescription>
        </DialogHeader>

        <DynamicEvaluationForm
          propertyType={propertyType}
          language={language}
          mode={mode}
          existingData={existingData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}

// Example usage component showing how to integrate with property types
export function PropertyTypesWithDynamicEvaluations({
  propertyTypes,
  language = "ro",
}: {
  propertyTypes: PropertyType[];
  language?: "ro" | "en";
}) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEvaluationSaved = () => {
    setRefreshKey((prev) => prev + 1);
    toast.success("Property evaluation saved successfully!");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        Property Types - Dynamic Evaluations
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {propertyTypes.map((propertyType) => {
          const propertyTypeName =
            language === "en" && propertyType.name_en
              ? propertyType.name_en
              : propertyType.name_ro;

          return (
            <div
              key={propertyType.id}
              className="border rounded-lg p-4 space-y-3"
            >
              <div>
                <h3 className="font-medium">{propertyTypeName}</h3>
                <p className="text-sm text-muted-foreground">
                  Property type with custom fields
                </p>
              </div>

              <DynamicEvaluationDialog
                propertyType={propertyType}
                mode="create"
                language={language}
                onEvaluationSaved={handleEvaluationSaved}
              >
                <Button className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Create Evaluation
                </Button>
              </DynamicEvaluationDialog>
            </div>
          );
        })}
      </div>
    </div>
  );
}
