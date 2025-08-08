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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  AlertCircle,
  Building,
  CheckCircle,
  Loader2,
  Plus,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import DynamicEvaluationDialog, {
  PropertyTypesWithDynamicEvaluations,
} from "@/components/evaluations/DynamicEvaluationDialog";

interface PropertyType {
  id: number;
  name_ro: string;
  name_en?: string;
}

interface EvaluationSession {
  id: number;
  propertyName: string;
  propertyLocation?: string;
  propertySurface?: number;
  propertyFloors?: string;
  propertyConstructionYear?: number;
  propertyType: PropertyType;
  completedAt: string;
  customFieldValues?: Record<string, any>;
}

export default function DynamicEvaluationDemo() {
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load property types
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load property types
        const typesResponse = await fetch("/api/admin/property-types");
        if (typesResponse.ok) {
          const types = await typesResponse.json();
          setPropertyTypes(types);
        }

        // Load existing evaluations
        const evaluationsResponse = await fetch("/api/evaluations");
        if (evaluationsResponse.ok) {
          const evalData = await evaluationsResponse.json();
          setEvaluations(evalData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [refreshKey]);

  const handleEvaluationSaved = () => {
    setRefreshKey((prev) => prev + 1);
    toast.success("Property evaluation saved successfully!");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading dynamic evaluation system...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Dynamic Evaluation Form System
            </h1>
            <p className="text-muted-foreground">
              Property evaluation forms that adapt to each property type's
              custom fields
            </p>
          </div>
        </div>

        {/* Feature Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium">EVF-001</div>
                  <div className="text-sm text-muted-foreground">
                    Abstract Form Builder
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium">EVF-002</div>
                  <div className="text-sm text-muted-foreground">
                    Universal Fields
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium">EVF-003</div>
                  <div className="text-sm text-muted-foreground">
                    Custom Fields
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium">EVF-004-008</div>
                  <div className="text-sm text-muted-foreground">
                    All Features
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Evaluations</TabsTrigger>
          <TabsTrigger value="existing">Existing Evaluations</TabsTrigger>
          <TabsTrigger value="features">Feature Details</TabsTrigger>
        </TabsList>

        {/* Create Evaluations Tab */}
        <TabsContent value="create" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">
                Create New Property Evaluations
              </h2>
              <p className="text-muted-foreground">
                Select a property type to create an evaluation with its specific
                custom fields
              </p>
            </div>

            {propertyTypes.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No property types found. Please configure property types in
                  the admin panel first.
                </AlertDescription>
              </Alert>
            ) : (
              <PropertyTypesWithDynamicEvaluations
                propertyTypes={propertyTypes}
                language="ro"
              />
            )}
          </div>
        </TabsContent>

        {/* Existing Evaluations Tab */}
        <TabsContent value="existing" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">
                Existing Property Evaluations
              </h2>
              <p className="text-muted-foreground">
                View and edit your created property evaluations
              </p>
            </div>

            {evaluations.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No evaluations yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first property evaluation to see it here
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {evaluations.map((evaluation) => (
                  <Card key={evaluation.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="truncate">
                          {evaluation.propertyName}
                        </span>
                        <Badge variant="secondary">
                          {evaluation.propertyType.name_ro}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {evaluation.propertyLocation || "No location specified"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm space-y-1">
                        {evaluation.propertySurface && (
                          <div>Surface: {evaluation.propertySurface} sqm</div>
                        )}
                        {evaluation.propertyFloors && (
                          <div>Floors: {evaluation.propertyFloors}</div>
                        )}
                        {evaluation.propertyConstructionYear && (
                          <div>
                            Built: {evaluation.propertyConstructionYear}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(evaluation.completedAt)}
                        </span>

                        <DynamicEvaluationDialog
                          propertyType={evaluation.propertyType}
                          mode="edit"
                          existingData={{
                            evaluationSessionId: evaluation.id,
                            propertyName: evaluation.propertyName,
                            propertyLocation: evaluation.propertyLocation,
                            propertySurface: evaluation.propertySurface,
                            propertyFloors: evaluation.propertyFloors,
                            propertyConstructionYear:
                              evaluation.propertyConstructionYear,
                            customFieldValues: evaluation.customFieldValues,
                          }}
                          language="ro"
                          onEvaluationSaved={handleEvaluationSaved}
                        >
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </DynamicEvaluationDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Feature Details Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">
                Dynamic Evaluation Form Features
              </h2>
              <p className="text-muted-foreground">
                Complete implementation of all EVF requirements
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    EVF-001: Abstract Form Builder
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Single generic form that renders fields dynamically based on
                    property type configuration. Built using React with
                    TypeScript for full type safety.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    EVF-002: Universal Fields Section
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Standard fields (Name, Address, Notes, Surface, Floors,
                    Construction Year) are always present at the top of every
                    evaluation form.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    EVF-003: Custom Fields Section
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Dynamic fields loaded from database based on property type.
                    Displayed in configured sort order with proper labels and
                    validation.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    EVF-004: Field Type-Based UI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Supports text, number, select, textarea, date, and boolean
                    field types. Each renders with appropriate UI component and
                    validation.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    EVF-005: Required Field Enforcement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Required fields are validated on form submission with clear
                    error messages. Visual indicators (*) show required fields.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    EVF-006: Translation-Aware Labels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Field labels, placeholders, and help text adapt to user
                    language (Romanian/English). Fallback to Romanian if English
                    translation not available.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    EVF-007: Store Custom Field Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Custom field values stored in dedicated table linked to
                    evaluation session. Supports complex data types with JSON
                    serialization.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    EVF-008: Edit Existing Property
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Load saved evaluation data back into form for editing.
                    Preserves both universal and custom field values.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
