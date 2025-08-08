"use client";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  AlertTriangle,
  Check,
  Pencil,
  Plus,
  Settings2,
  Trash,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { CustomField } from "@/lib/evaluation-utils";
import type {
  CreateCustomFieldData,
  SelectOption,
  UpdateCustomFieldData,
} from "@/lib/types/admin";

interface CustomFieldManagerProps {
  propertyTypeId: number;
  propertyTypeName: string;
  language: "ro" | "en";
}

interface CustomFieldFormData {
  label_ro: string;
  label_en: string;
  fieldType: "text" | "number" | "select" | "textarea" | "date" | "boolean";
  isRequired: boolean;
  placeholder_ro: string;
  placeholder_en: string;
  helpText_ro: string;
  helpText_en: string;
  selectOptions: SelectOption[];
}

const fieldTypeLabels = {
  text: "Text",
  number: "Number",
  select: "Select",
  textarea: "Textarea",
  date: "Date",
  boolean: "Boolean",
};

export default function CustomFieldManager({
  propertyTypeId,
  propertyTypeName,
  language,
}: CustomFieldManagerProps) {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [deletingField, setDeletingField] = useState<CustomField | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<CustomFieldFormData>({
    label_ro: "",
    label_en: "",
    fieldType: "text",
    isRequired: false,
    placeholder_ro: "",
    placeholder_en: "",
    helpText_ro: "",
    helpText_en: "",
    selectOptions: [],
  });

  const [newSelectOption, setNewSelectOption] = useState({
    value: "",
    label_ro: "",
    label_en: "",
  });

  useEffect(() => {
    fetchCustomFields();
  }, [propertyTypeId]);

  const fetchCustomFields = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/property-types/${propertyTypeId}/custom-fields`,
      );
      if (!response.ok) throw new Error("Failed to fetch custom fields");

      const result = await response.json();
      setCustomFields(result.data || []);
    } catch (error) {
      console.error("Error fetching custom fields:", error);
      toast.error("Failed to load custom fields");
      setCustomFields([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      label_ro: "",
      label_en: "",
      fieldType: "text",
      isRequired: false,
      placeholder_ro: "",
      placeholder_en: "",
      helpText_ro: "",
      helpText_en: "",
      selectOptions: [],
    });
    setNewSelectOption({ value: "", label_ro: "", label_en: "" });
  };

  const handleAddField = () => {
    resetForm();
    setEditingField(null);
    setShowAddDialog(true);
  };

  const handleEditField = (field: CustomField) => {
    setFormData({
      label_ro: field.label_ro,
      label_en: field.label_en || "",
      fieldType: field.fieldType,
      isRequired: field.isRequired,
      placeholder_ro: field.placeholder_ro || "",
      placeholder_en: field.placeholder_en || "",
      helpText_ro: field.helpText_ro || "",
      helpText_en: field.helpText_en || "",
      selectOptions: field.selectOptions || [],
    });
    setEditingField(field);
    setShowAddDialog(true);
  };

  const handleDeleteField = (field: CustomField) => {
    setDeletingField(field);
  };

  const confirmDeleteField = async () => {
    if (!deletingField) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        `/api/admin/custom-fields/${deletingField.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) throw new Error("Failed to delete custom field");

      setCustomFields((prev) => prev.filter((f) => f.id !== deletingField.id));
      toast.success("Custom field deleted successfully");
      setDeletingField(null);
    } catch (error) {
      console.error("Error deleting custom field:", error);
      toast.error("Failed to delete custom field");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitField = async () => {
    if (!formData.label_ro.trim()) {
      toast.error("Romanian label is required");
      return;
    }

    if (
      formData.fieldType === "select" &&
      formData.selectOptions.length === 0
    ) {
      toast.error("Select fields must have at least one option");
      return;
    }

    setSubmitting(true);
    try {
      const fieldData: CreateCustomFieldData | UpdateCustomFieldData = {
        ...(editingField ? { id: editingField.id } : {}),
        propertyTypeId,
        label_ro: formData.label_ro.trim(),
        label_en: formData.label_en.trim() || undefined,
        fieldType: formData.fieldType,
        isRequired: formData.isRequired,
        placeholder_ro: formData.placeholder_ro.trim() || undefined,
        placeholder_en: formData.placeholder_en.trim() || undefined,
        helpText_ro: formData.helpText_ro.trim() || undefined,
        helpText_en: formData.helpText_en.trim() || undefined,
        selectOptions:
          formData.fieldType === "select" ? formData.selectOptions : undefined,
        sortOrder: customFields.length,
      };

      const url = editingField
        ? `/api/admin/custom-fields/${editingField.id}`
        : `/api/admin/property-types/${propertyTypeId}/custom-fields`;

      const method = editingField ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fieldData),
      });

      if (!response.ok)
        throw new Error(
          `Failed to ${editingField ? "update" : "create"} custom field`,
        );

      const result = await response.json();

      if (editingField) {
        setCustomFields((prev) =>
          prev.map((f) => (f.id === editingField.id ? result.data : f)),
        );
        toast.success("Custom field updated successfully");
      } else {
        setCustomFields((prev) => [...prev, result.data]);
        toast.success("Custom field created successfully");
      }

      setShowAddDialog(false);
      resetForm();
      setEditingField(null);
    } catch (error) {
      console.error("Error saving custom field:", error);
      toast.error(
        `Failed to ${editingField ? "update" : "create"} custom field`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const addSelectOption = () => {
    if (!newSelectOption.value.trim() || !newSelectOption.label_ro.trim()) {
      toast.error("Option value and Romanian label are required");
      return;
    }

    const option: SelectOption = {
      value: newSelectOption.value.trim(),
      label_ro: newSelectOption.label_ro.trim(),
      label_en: newSelectOption.label_en.trim() || undefined,
    };

    setFormData((prev) => ({
      ...prev,
      selectOptions: [...prev.selectOptions, option],
    }));

    setNewSelectOption({ value: "", label_ro: "", label_en: "" });
  };

  const removeSelectOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      selectOptions: prev.selectOptions.filter((_, i) => i !== index),
    }));
  };

  const getFieldLabel = (field: CustomField) => {
    return language === "en" && field.label_en
      ? field.label_en
      : field.label_ro;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading custom fields...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Custom Fields</h3>
          <p className="text-muted-foreground text-sm">
            Manage custom fields for <strong>{propertyTypeName}</strong>{" "}
            properties
          </p>
        </div>
        <Button onClick={handleAddField} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Custom Field
        </Button>
      </div>

      {/* Custom Fields Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Custom Fields ({customFields.length})
          </CardTitle>
          <CardDescription>
            {customFields.length === 0
              ? "No custom fields defined for this property type. Add some to get started."
              : "Custom fields that will appear in property evaluation forms."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customFields.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Required</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-[120px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customFields.map((field) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {getFieldLabel(field)}
                        </div>
                        {field.helpText_ro && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {language === "en" && field.helpText_en
                              ? field.helpText_en
                              : field.helpText_ro}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {fieldTypeLabels[field.fieldType]}
                      </Badge>
                      {field.fieldType === "select" && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {field.selectOptions?.length || 0} options
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {field.isRequired ? (
                        <Badge variant="destructive">Required</Badge>
                      ) : (
                        <Badge variant="secondary">Optional</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {field.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleEditField(field)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleDeleteField(field)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Settings2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No custom fields defined</p>
              <p className="text-sm text-muted-foreground">
                Add custom fields to collect additional property information
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Custom Field Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="w-[95vw] max-w-7xl max-h-[90vh] overflow-y-auto sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:max-w-7xl">
          <DialogHeader>
            <DialogTitle>
              {editingField ? "Edit Custom Field" : "Add Custom Field"}
            </DialogTitle>
            <DialogDescription>
              Configure a custom field for {propertyTypeName} properties
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Field Labels */}
            <Tabs defaultValue="ro" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ro">Română</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
              </TabsList>

              <TabsContent value="ro" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="label_ro">Label (Romanian) *</Label>
                  <Input
                    id="label_ro"
                    placeholder="e.g., Numărul de camere"
                    value={formData.label_ro}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        label_ro: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placeholder_ro">Placeholder (Romanian)</Label>
                  <Input
                    id="placeholder_ro"
                    placeholder="e.g., Introduceți numărul de camere"
                    value={formData.placeholder_ro}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        placeholder_ro: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="helpText_ro">Help Text (Romanian)</Label>
                  <Textarea
                    id="helpText_ro"
                    placeholder="Informații suplimentare despre acest câmp"
                    value={formData.helpText_ro}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        helpText_ro: e.target.value,
                      }))
                    }
                    rows={2}
                  />
                </div>
              </TabsContent>

              <TabsContent value="en" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="label_en">Label (English)</Label>
                  <Input
                    id="label_en"
                    placeholder="e.g., Number of rooms"
                    value={formData.label_en}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        label_en: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placeholder_en">Placeholder (English)</Label>
                  <Input
                    id="placeholder_en"
                    placeholder="e.g., Enter number of rooms"
                    value={formData.placeholder_en}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        placeholder_en: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="helpText_en">Help Text (English)</Label>
                  <Textarea
                    id="helpText_en"
                    placeholder="Additional information about this field"
                    value={formData.helpText_en}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        helpText_en: e.target.value,
                      }))
                    }
                    rows={2}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Field Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fieldType">Field Type *</Label>
                <Select
                  value={formData.fieldType}
                  onValueChange={(value: any) =>
                    setFormData((prev) => ({ ...prev, fieldType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="textarea">Textarea</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex items-center">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="required"
                    checked={formData.isRequired}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isRequired: checked }))
                    }
                  />
                  <Label htmlFor="required">Required field</Label>
                </div>
              </div>
            </div>

            {/* Select Options */}
            {formData.fieldType === "select" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Select Options</CardTitle>
                  <CardDescription>
                    Define the available options for this select field
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Option Form */}
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Value (e.g., 1)"
                      value={newSelectOption.value}
                      onChange={(e) =>
                        setNewSelectOption((prev) => ({
                          ...prev,
                          value: e.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="Romanian label"
                      value={newSelectOption.label_ro}
                      onChange={(e) =>
                        setNewSelectOption((prev) => ({
                          ...prev,
                          label_ro: e.target.value,
                        }))
                      }
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="English label"
                        value={newSelectOption.label_en}
                        onChange={(e) =>
                          setNewSelectOption((prev) => ({
                            ...prev,
                            label_en: e.target.value,
                          }))
                        }
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={addSelectOption}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Options List */}
                  {formData.selectOptions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Options:</h4>
                      {formData.selectOptions.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div className="flex-1">
                            <span className="font-mono text-sm">
                              {option.value}
                            </span>
                            <span className="mx-2">→</span>
                            <span>{option.label_ro}</span>
                            {option.label_en && (
                              <span className="text-muted-foreground">
                                {" "}
                                / {option.label_en}
                              </span>
                            )}
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => removeSelectOption(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.selectOptions.length === 0 && (
                    <div className="text-center p-4 text-muted-foreground text-sm border-2 border-dashed rounded">
                      <AlertTriangle className="h-4 w-4 mx-auto mb-2" />
                      No options defined. Add at least one option.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitField}
              disabled={submitting || !formData.label_ro.trim()}
            >
              {submitting
                ? "Saving..."
                : editingField
                  ? "Update Field"
                  : "Add Field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingField}
        onOpenChange={(open) => !open && setDeletingField(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Custom Field</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingField?.label_ro}"? This
              action cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingField(null)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteField}
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
