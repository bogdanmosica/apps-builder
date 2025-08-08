"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
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
import { Textarea } from "@workspace/ui/components/textarea";
import {
  ArrowLeft,
  ArrowRight,
  Building,
  Calendar,
  Home,
  MapPin,
  Ruler,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export interface PropertyInfo {
  name: string;
  location?: string;
  surface?: number;
  floors?: string;
  constructionYear?: number;
}

interface PropertyInfoScreenProps {
  propertyTypeName: string;
  onSave: (propertyInfo: PropertyInfo) => void;
  onBack?: () => void;
  initialData?: PropertyInfo;
}

export default function PropertyInfoScreen({
  propertyTypeName,
  onSave,
  onBack,
  initialData,
}: PropertyInfoScreenProps) {
  const { t } = useTranslation("evaluation");
  const [formData, setFormData] = useState<PropertyInfo>({
    name: initialData?.name || "",
    location: initialData?.location || "",
    surface: initialData?.surface || undefined,
    floors: initialData?.floors || "",
    constructionYear: initialData?.constructionYear || undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = t("propertyInfoScreen.fields.propertyName.error", {
        ns: "evaluation",
      });
    }

    // Optional field validations
    if (formData.surface !== undefined && formData.surface < 10) {
      newErrors.surface = t("propertyInfoScreen.fields.surface.error", {
        ns: "evaluation",
      });
    }

    if (formData.constructionYear !== undefined) {
      const currentYear = new Date().getFullYear();
      if (
        formData.constructionYear < 1900 ||
        formData.constructionYear > currentYear
      ) {
        newErrors.constructionYear = t(
          "propertyInfoScreen.fields.constructionYear.error",
          { currentYear, ns: "evaluation" },
        );
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (
    field: keyof PropertyInfo,
    value: string | number | undefined,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const isFormValid = formData.name.trim().length >= 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-10 w-10"
          title={t("propertyInfoScreen.backToDashboard", { ns: "evaluation" })}
        >
          <Link href="/">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
      </div>

      <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Card className="bg-card/50 backdrop-blur-sm border-2 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Home className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">
              {t("propertyInfoScreen.title", { ns: "evaluation" })}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {t("propertyInfoScreen.subtitle", {
                propertyType: propertyTypeName.toLowerCase(),
                ns: "evaluation",
              })}
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-8 h-2 bg-primary rounded-full"></div>
              <div className="w-8 h-2 bg-primary rounded-full"></div>
              <div className="w-8 h-2 bg-muted rounded-full"></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t("propertyInfoScreen.stepIndicator", { ns: "evaluation" })}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Property Name - Required */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Building className="w-4 h-4 text-primary" />
                  {t("propertyInfoScreen.fields.propertyName.label", {
                    ns: "evaluation",
                  })}{" "}
                  *
                </Label>
                <Input
                  id="name"
                  placeholder={t(
                    "propertyInfoScreen.fields.propertyName.placeholder",
                    { ns: "evaluation" },
                  )}
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Location - Optional */}
              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-primary" />
                  {t("propertyInfoScreen.fields.location.label", {
                    ns: "evaluation",
                  })}
                </Label>
                <Textarea
                  id="location"
                  placeholder={t(
                    "propertyInfoScreen.fields.location.placeholder",
                    { ns: "evaluation" },
                  )}
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  rows={2}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {t("propertyInfoScreen.fields.location.helpText", {
                    ns: "evaluation",
                  })}
                </p>
              </div>

              {/* Surface Area - Optional */}
              <div className="space-y-2">
                <Label
                  htmlFor="surface"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Ruler className="w-4 h-4 text-primary" />
                  {t("propertyInfoScreen.fields.surface.label", {
                    ns: "evaluation",
                  })}
                </Label>
                <Input
                  id="surface"
                  type="number"
                  placeholder={t(
                    "propertyInfoScreen.fields.surface.placeholder",
                    { ns: "evaluation" },
                  )}
                  value={formData.surface || ""}
                  onChange={(e) => {
                    const value = e.target.value
                      ? parseInt(e.target.value)
                      : undefined;
                    handleInputChange("surface", value);
                  }}
                  className={errors.surface ? "border-red-500" : ""}
                  min="10"
                />
                {errors.surface && (
                  <p className="text-sm text-red-500">{errors.surface}</p>
                )}
              </div>

              {/* Number of Floors - Optional */}
              <div className="space-y-2">
                <Label
                  htmlFor="floors"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Building className="w-4 h-4 text-primary" />
                  {t("propertyInfoScreen.fields.floors.label", {
                    ns: "evaluation",
                  })}
                </Label>
                <Select
                  value={formData.floors}
                  onValueChange={(value) => handleInputChange("floors", value)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        "propertyInfoScreen.fields.floors.placeholder",
                        { ns: "evaluation" },
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">
                      {t("propertyInfoScreen.fields.floors.options.1", {
                        ns: "evaluation",
                      })}
                    </SelectItem>
                    <SelectItem value="2">
                      {t("propertyInfoScreen.fields.floors.options.2", {
                        ns: "evaluation",
                      })}
                    </SelectItem>
                    <SelectItem value="3">
                      {t("propertyInfoScreen.fields.floors.options.3", {
                        ns: "evaluation",
                      })}
                    </SelectItem>
                    <SelectItem value="mansarda">
                      {t("propertyInfoScreen.fields.floors.options.mansarda", {
                        ns: "evaluation",
                      })}
                    </SelectItem>
                    <SelectItem value="other">
                      {t("propertyInfoScreen.fields.floors.options.other", {
                        ns: "evaluation",
                      })}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Construction Year - Optional */}
              <div className="space-y-2">
                <Label
                  htmlFor="constructionYear"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-primary" />
                  {t("propertyInfoScreen.fields.constructionYear.label", {
                    ns: "evaluation",
                  })}
                </Label>
                <Input
                  id="constructionYear"
                  type="number"
                  placeholder={t(
                    "propertyInfoScreen.fields.constructionYear.placeholder",
                    { ns: "evaluation" },
                  )}
                  value={formData.constructionYear || ""}
                  onChange={(e) => {
                    const value = e.target.value
                      ? parseInt(e.target.value)
                      : undefined;
                    handleInputChange("constructionYear", value);
                  }}
                  className={errors.constructionYear ? "border-red-500" : ""}
                  min="1900"
                  max={new Date().getFullYear()}
                />
                {errors.constructionYear && (
                  <p className="text-sm text-red-500">
                    {errors.constructionYear}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="pt-4 space-y-3">
                {onBack && (
                  <Button
                    type="button"
                    onClick={onBack}
                    variant="outline"
                    className="w-full h-12 text-lg font-semibold"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    <span>
                      {t("propertyInfoScreen.buttons.backToOverview", {
                        ns: "evaluation",
                      })}
                    </span>
                  </Button>
                )}

                <Button
                  type="submit"
                  disabled={!isFormValid}
                  className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary-dark transition-all duration-200 hover:scale-105"
                >
                  <span>
                    {t("propertyInfoScreen.buttons.startEvaluation", {
                      ns: "evaluation",
                    })}
                  </span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {/* Helper Text */}
              <p className="text-sm text-muted-foreground text-center">
                {t("propertyInfoScreen.helpText", { ns: "evaluation" })}
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
