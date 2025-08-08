"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  BarChart3,
  Building,
  Calendar,
  CheckCircle,
  Edit,
  Filter,
  Home,
  MapPin,
  MoreVertical,
  Plus,
  Ruler,
  Share,
  Star,
  Trash2,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import Navigation from "../navigation";
import { AddPropertyButton } from "../shared/AddPropertyButton";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import EditPropertyDialog from "./EditPropertyDialog";

interface EvaluationData {
  id: number;
  userId: number;
  propertyTypeId: number;
  propertyName: string | null;
  propertyLocation: string | null;
  propertySurface: number | null;
  propertyFloors: string | null;
  propertyConstructionYear: number | null;
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  level: string | null;
  badge: string | null;
  completionRate: number;
  completedAt: Date;
  createdAt: Date;
  propertyType: {
    id: number;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface EvaluationStats {
  totalEvaluations: number;
  averageScore: number;
  bestScore: number;
  completionRate: number;
}

interface EvaluationsOverviewProps {
  evaluations: EvaluationData[];
  stats: EvaluationStats;
  isLoggedIn: boolean;
  userRole: string | null;
}

export default function EvaluationsOverview({
  evaluations,
  stats,
  isLoggedIn,
  userRole,
}: EvaluationsOverviewProps) {
  const router = useRouter();
  const { t } = useTranslation(["evaluation", "property"]);
  const [sortBy, setSortBy] = useState<"date" | "score" | "type">("date");
  const [filterBy, setFilterBy] = useState<string>("all");
  const [sortedEvaluations, setSortedEvaluations] =
    useState<EvaluationData[]>(evaluations);
  const [localEvaluations, setLocalEvaluations] =
    useState<EvaluationData[]>(evaluations);

  // Dialog states
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    evaluation: EvaluationData | null;
  }>({
    isOpen: false,
    evaluation: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    evaluation: EvaluationData | null;
  }>({
    isOpen: false,
    evaluation: null,
  });

  // Simple date formatting function
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mo ago`;

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}y ago`;
  };

  // Sort and filter evaluations
  useEffect(() => {
    let filtered = [...localEvaluations];

    // Apply filter
    if (filterBy !== "all") {
      filtered = filtered.filter(
        (evaluation) =>
          evaluation.propertyType?.name?.toLowerCase() ===
          filterBy.toLowerCase(),
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(b.completedAt).getTime() -
            new Date(a.completedAt).getTime()
          );
        case "score":
          return b.percentage - a.percentage;
        case "type":
          return (a.propertyType?.name || "").localeCompare(
            b.propertyType?.name || "",
          );
        default:
          return 0;
      }
    });

    setSortedEvaluations(filtered);
  }, [localEvaluations, sortBy, filterBy]);

  // Update local evaluations when props change
  useEffect(() => {
    setLocalEvaluations(evaluations);
  }, [evaluations]);

  // Handler functions
  const handleEditEvaluation = (evaluation: EvaluationData) => {
    setEditDialog({ isOpen: true, evaluation });
  };

  const handleDeleteEvaluation = (evaluation: EvaluationData) => {
    setDeleteDialog({ isOpen: true, evaluation });
  };

  // Helper function to generate specific improvement suggestions
  const getImprovementSuggestions = (evaluation: EvaluationData) => {
    const suggestions = [];

    // Always show completion and location suggestions if applicable
    if (evaluation.completionRate < 80) {
      suggestions.push("completeAllQuestions");
    }

    if (!evaluation.propertyLocation) {
      suggestions.push("addLocationDetails");
    }

    // Score-based suggestions
    if (evaluation.percentage < 30) {
      // Very low score - focus on major structural elements
      suggestions.push("lowScoreGeneral");
      suggestions.push("improveFoundation");
      suggestions.push("improveStructure");
      suggestions.push("improveRoof");
    } else if (evaluation.percentage < 60) {
      // Medium-low score - provide specific category suggestions
      suggestions.push("mediumScoreGeneral");

      // Add 2-3 specific improvement areas based on common low-scoring categories
      const specificSuggestions = [
        "improveInsulation",
        "improveWindows",
        "improveElectrical",
        "improvePlumbing",
        "improveUtilities",
      ];

      // Randomly select 2-3 suggestions to vary the recommendations
      const selectedSuggestions = specificSuggestions
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(3, specificSuggestions.length));

      suggestions.push(...selectedSuggestions);
    } else if (evaluation.percentage < 80) {
      // Good score but could be better - fewer, more targeted suggestions
      const targetedSuggestions = [
        "improveInsulation",
        "improveWindows",
        "improveElectrical",
      ];

      const selectedSuggestions = targetedSuggestions
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);

      suggestions.push(...selectedSuggestions);
    }

    return suggestions;
  };

  const handleShareEvaluation = (evaluation: EvaluationData) => {
    const url = `${window.location.origin}/evaluation-result/${evaluation.id}`;
    navigator.clipboard.writeText(url);
    toast.success(t("messages.linkCopied"));
  };

  const handleUpdateEvaluation = async (
    evaluationId: number,
    updatedData: any,
  ) => {
    try {
      // Update in the database
      const response = await fetch(`/api/evaluation/${evaluationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update evaluation");
      }

      // Update local state only if API call was successful
      setLocalEvaluations((prev) =>
        prev.map((evaluation) =>
          evaluation.id === evaluationId
            ? {
                ...evaluation,
                propertyName: updatedData.propertyName,
                propertyLocation: updatedData.propertyLocation,
                propertySurface: updatedData.propertySurface
                  ? parseInt(updatedData.propertySurface)
                  : null,
                propertyFloors: updatedData.propertyFloors,
                propertyConstructionYear: updatedData.propertyConstructionYear
                  ? parseInt(updatedData.propertyConstructionYear)
                  : null,
              }
            : evaluation,
        ),
      );

      toast.success(t("messages.propertyUpdated"));
    } catch (error) {
      console.error("Error updating evaluation:", error);
      toast.error(t("messages.updateFailed"));
    }
  };

  const handleDeleteEvaluationConfirm = async (evaluationId: number) => {
    // Update local state immediately for better UX
    setLocalEvaluations((prev) =>
      prev.filter((evaluation) => evaluation.id !== evaluationId),
    );

    // Small delay to ensure delete operation completes
    setTimeout(() => {
      // Refresh the page data from server to ensure consistency
      router.refresh();
    }, 100);
  };

  const getPropertyIcon = (propertyType: string) => {
    if (!propertyType) return <MapPin className="w-5 h-5" />;

    switch (propertyType.toLowerCase()) {
      case "house":
      case "casa":
        return <Home className="w-5 h-5" />;
      case "apartment":
      case "apartament":
        return <Building className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getStarRating = (percentage: number) => {
    const stars = Math.round((percentage / 100) * 5);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const getBadgeColor = (level: string) => {
    if (!level) return "bg-gray-100 text-gray-800 border-gray-200";

    switch (level.toLowerCase()) {
      case "expert":
        return "bg-green-100 text-green-800 border-green-200";
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "novice":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const uniquePropertyTypes = Array.from(
    new Set(
      localEvaluations
        .map((evaluation) => evaluation.propertyType?.name)
        .filter(Boolean),
    ),
  );

  return (
    <div className="min-h-screen bg-bg-shell overflow-x-hidden">
      {/* Navigation */}
      <Navigation isLoggedIn={isLoggedIn} userRole={userRole} />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
        {/* Page Header */}
        {/* <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-text-base">
              My Property Evaluations
            </h1>
            <p className="text-text-muted mt-2">
              Track and manage your property assessments
            </p>
          </div>
          
          <div className="hidden md:block">
            <Link href="/evaluation">
              <Button className="bg-primary hover:bg-primary-dark h-12 px-6 text-lg font-semibold">
                <Plus className="w-5 h-5 mr-2" />
                Add New Property
              </Button>
            </Link>
          </div>
        </div> */}
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-muted truncate">
                    {t("stats.totalEvaluations")}
                  </p>
                  <p className="text-2xl font-bold text-text-base">
                    {stats.totalEvaluations}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-muted truncate">
                    {t("stats.averageScore")}
                  </p>
                  <p className="text-2xl font-bold text-text-base">
                    {Math.round(stats.averageScore)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-secondary flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-muted truncate">
                    {t("stats.bestScore")}
                  </p>
                  <p className="text-2xl font-bold text-text-base">
                    {Math.round(stats.bestScore)}%
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-status-success flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-muted truncate">
                    {t("stats.completionRate")}
                  </p>
                  <p className="text-2xl font-bold text-text-base">
                    {stats.completionRate}%
                  </p>
                </div>
                <Star className="w-8 h-8 text-status-warning flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sort & Filter Controls */}
        {evaluations.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 overflow-hidden">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm text-text-muted flex-shrink-0">
                {t("filters.sortBy")}
              </span>
              <Select
                value={sortBy}
                onValueChange={(value: "date" | "score" | "type") =>
                  setSortBy(value)
                }
              >
                <SelectTrigger className="w-32 sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">{t("filters.dateAdded")}</SelectItem>
                  <SelectItem value="score">{t("filters.score")}</SelectItem>
                  <SelectItem value="type">
                    {t("filters.propertyType")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm text-text-muted flex-shrink-0">
                {t("filters.filter")}
              </span>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-32 sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
                  {uniquePropertyTypes.map((type) => (
                    <SelectItem
                      key={type}
                      value={type?.toLowerCase() || type || "unknown"}
                    >
                      {t(
                        `property.types.${type?.toLowerCase() || "unknown"}`,
                        type || "Unknown",
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Evaluations Grid */}
        {sortedEvaluations.length > 0 ? (
          <div className="w-full overflow-hidden max-w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full">
              {sortedEvaluations.map((evaluation, index) => (
                <Card
                  key={evaluation.id}
                  className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group overflow-hidden w-full max-w-full relative"
                >
                  <CardHeader>
                    {/* Property Image Placeholder */}
                    <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      {getPropertyIcon(
                        evaluation.propertyType?.name || "unknown",
                      )}
                    </div>

                    {/* Title and Actions Row */}
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg dark:text-white">
                          {evaluation.propertyName &&
                          evaluation.propertyName.trim() !== ""
                            ? evaluation.propertyName
                            : `${evaluation.propertyType.name} #${evaluation.id}`}
                        </CardTitle>
                        {evaluation.propertyLocation && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {evaluation.propertyLocation}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant={
                            evaluation.percentage >= 80
                              ? "default"
                              : "secondary"
                          }
                          className={`text-lg px-3 py-1 ${evaluation.percentage >= 80 ? "bg-green-500" : evaluation.percentage >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                        >
                          {Math.round(evaluation.percentage)}/100
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditEvaluation(evaluation)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              {t("actions.editDetails")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleShareEvaluation(evaluation)}
                            >
                              <Share className="w-4 h-4 mr-2" />
                              {t("actions.share")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteEvaluation(evaluation)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t("actions.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Property Details Row */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
                      {evaluation.propertySurface && (
                        <span className="flex items-center">
                          <Ruler className="h-4 w-4 mr-1" />
                          {evaluation.propertySurface}m²
                        </span>
                      )}
                      {evaluation.propertyFloors && (
                        <span className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {evaluation.propertyFloors} floors
                        </span>
                      )}
                      {evaluation.propertyConstructionYear && (
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {evaluation.propertyConstructionYear}
                        </span>
                      )}
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          {t("overallScore", { ns: "evaluation" })}
                        </span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${evaluation.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {Math.round(evaluation.percentage)}/100
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          {t("completion", { ns: "evaluation" })}
                        </span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${evaluation.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {evaluation.completionRate}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          {t("level", { ns: "evaluation" })}
                        </span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{
                                width: `${evaluation.level === "Expert" ? 90 : evaluation.level === "Good" ? 70 : 40}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {evaluation.level
                              ? t(
                                  `evaluation.levels.${evaluation.level.toLowerCase()}`,
                                  evaluation.level,
                                )
                              : evaluation.level || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pros and Cons within fixed-height container */}
                    <div className="space-y-2 mb-4 h-32 overflow-y-auto">
                      <div>
                        <p className="text-sm font-medium text-green-700 mb-1">
                          {t("results.strengths", { ns: "evaluation" })}:
                        </p>
                        <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                          {evaluation.percentage >= 80 && (
                            <li className="flex items-center">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                              {t("results.excellentScore", {
                                ns: "evaluation",
                              })}
                            </li>
                          )}
                          {evaluation.completionRate >= 90 && (
                            <li className="flex items-center">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                              {t("results.comprehensiveEvaluation", {
                                ns: "evaluation",
                              })}
                            </li>
                          )}
                          {evaluation.level === "Expert" && (
                            <li className="flex items-center">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                              {t("results.expertLevel", { ns: "evaluation" })}
                            </li>
                          )}
                          {evaluation.propertyLocation && (
                            <li className="flex items-center">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                              {t("results.detailedLocation", {
                                ns: "evaluation",
                              })}
                            </li>
                          )}
                        </ul>
                      </div>
                      {/* Enhanced improvement suggestions */}
                      {(() => {
                        const suggestions =
                          getImprovementSuggestions(evaluation);
                        return (
                          suggestions.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-red-700 mb-1">
                                {t("results.improvements", {
                                  ns: "evaluation",
                                })}
                                :
                              </p>
                              <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                {suggestions.map((suggestion, index) => (
                                  <li key={index} className="flex items-center">
                                    <X className="h-3 w-3 text-red-500 mr-2 flex-shrink-0" />
                                    {t(`results.${suggestion}`, {
                                      ns: "evaluation",
                                    })}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        );
                      })()}
                    </div>

                    <Link href={`/evaluation-result/${evaluation.id}`}>
                      <Button variant="outline" className="w-full">
                        {t("results.viewDetails", { ns: "evaluation" })}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Empty State */
          <Card className="text-center py-12">
            <CardContent>
              <div className="max-w-md mx-auto px-4">
                <div className="w-24 h-24 bg-bg-base rounded-full flex items-center justify-center mx-auto mb-6">
                  <Home className="w-12 h-12 text-text-muted" />
                </div>
                <h3 className="text-xl font-semibold text-text-base mb-2">
                  {t("emptyState.noProperties")}
                </h3>
                <p className="text-text-muted mb-6">
                  {t("emptyState.firstPropertyDescription")}
                </p>
                <AddPropertyButton
                  className="bg-primary hover:bg-primary-dark h-12 px-8 text-lg font-semibold"
                  hideTextOnMobile={false}
                  buttonText={t("emptyState.addFirstProperty")}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gamification Encouragement */}
        {evaluations.length > 0 && evaluations.length < 5 && (
          <Card className="mt-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-text-base mb-2">
                    {t("gamification.keepGoing")}
                  </h3>
                  <p className="text-text-muted">
                    {t("gamification.addMoreProperties", {
                      count: 5 - evaluations.length,
                      propertyWord:
                        evaluations.length === 4
                          ? t("gamification.property")
                          : t("gamification.properties"),
                    })}
                  </p>
                </div>
                <AddPropertyButton
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white flex-shrink-0"
                  hideTextOnMobile={false}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile FAB */}
      <div className="md:hidden">
        <AddPropertyButton variant="fab" />
      </div>

      {/* Edit Property Dialog */}
      {editDialog.evaluation && (
        <EditPropertyDialog
          isOpen={editDialog.isOpen}
          onClose={() => setEditDialog({ isOpen: false, evaluation: null })}
          evaluation={editDialog.evaluation}
          onUpdate={handleUpdateEvaluation}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialog.evaluation && (
        <DeleteConfirmationDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, evaluation: null })}
          evaluation={deleteDialog.evaluation}
          onDelete={handleDeleteEvaluationConfirm}
        />
      )}
    </div>
  );
}
