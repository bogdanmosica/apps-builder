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
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Progress } from "@workspace/ui/components/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Separator } from "@workspace/ui/components/separator";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  Bed,
  CheckCircle,
  Euro,
  Home,
  MapPin,
  Ruler,
  Star,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { EvaluationQuestionWithChoices } from "@/lib/evaluation/service";
import {
  LISTING_TYPE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  ROMANIAN_COUNTIES,
} from "../lib/constants";

interface PropertyFormData {
  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  address: string;
  city: string;
  county: string;
  postalCode: string;
  price: string;
  area: string;
  rooms: string;
  bedrooms: string;
  bathrooms: string;
  floor: string;
  totalFloors: string;
  yearBuilt: string;
  features: string;
  amenities: string;
}

interface PropertyWizardProps {
  initialData?: Partial<PropertyFormData>;
  propertyId?: number;
}

const STEPS = [
  {
    id: 1,
    title: "Basic Details",
    description: "Property information and location",
  },
  {
    id: 2,
    title: "Property Features",
    description: "Specifications and amenities",
  },
  {
    id: 3,
    title: "Quality Evaluation",
    description: "Answer questions to rate your property",
  },
  {
    id: 4,
    title: "Review & Submit",
    description: "Confirm details and complete listing",
  },
];

export function PropertyWizard({
  initialData,
  propertyId,
}: PropertyWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Property form data
  const [formData, setFormData] = useState<PropertyFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    propertyType: initialData?.propertyType || "apartment",
    listingType: initialData?.listingType || "sale",
    address: initialData?.address || "",
    city: initialData?.city || "",
    county: initialData?.county || "",
    postalCode: initialData?.postalCode || "",
    price: initialData?.price || "",
    area: initialData?.area || "",
    rooms: initialData?.rooms || "",
    bedrooms: initialData?.bedrooms || "",
    bathrooms: initialData?.bathrooms || "",
    floor: initialData?.floor || "",
    totalFloors: initialData?.totalFloors || "",
    yearBuilt: initialData?.yearBuilt || "",
    features: initialData?.features || "",
    amenities: initialData?.amenities || "",
  });

  // Evaluation data
  const [questions, setQuestions] = useState<EvaluationQuestionWithChoices[]>(
    [],
  );
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [evaluationScore, setEvaluationScore] = useState<number>(0);
  const [starRating, setStarRating] = useState<number>(0);

  useEffect(() => {
    if (currentStep === 3) {
      fetchQuestions();
    }
  }, [currentStep]);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/evaluation/questions");

      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      const data = await response.json();
      setQuestions(
        data.filter((q: EvaluationQuestionWithChoices) => q.isActive),
      );
    } catch (err) {
      console.error("Error fetching questions:", err);
      toast.error("Failed to load evaluation questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof PropertyFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAnswerSelect = (questionId: number, answerChoiceId: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerChoiceId,
    }));
  };

  const calculateProgress = () => {
    return ((currentStep - 1) / (STEPS.length - 1)) * 100;
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.title &&
          formData.propertyType &&
          formData.listingType &&
          formData.address &&
          formData.city &&
          formData.county
        );
      case 2:
        return !!(formData.price && formData.area);
      case 3: {
        const requiredQuestions = questions.filter((q) => q.isActive);
        return requiredQuestions.every((q) => selectedAnswers[q.id]);
      }
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      toast.error("Please fill in all required fields before continuing.");
      return;
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateEvaluationScore = () => {
    if (questions.length === 0) return { score: 0, stars: 0 };

    let totalWeightedScore = 0;
    let totalWeight = 0;

    questions.forEach((question) => {
      const selectedAnswerId = selectedAnswers[question.id];
      if (selectedAnswerId) {
        const selectedAnswer = question.answerChoices.find(
          (choice) => choice.id === selectedAnswerId,
        );
        if (selectedAnswer) {
          totalWeightedScore +=
            (selectedAnswer.answerValue * question.weight) / 100;
          totalWeight += question.weight;
        }
      }
    });

    const score =
      totalWeight > 0
        ? Math.round((totalWeightedScore / totalWeight) * 100)
        : 0;
    const stars = Math.round((score / 100) * 5);

    return { score, stars };
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate evaluation score
      const { score, stars } = calculateEvaluationScore();
      setEvaluationScore(score);
      setStarRating(stars);

      // Submit property data
      const response = await fetch("/api/properties", {
        method: propertyId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          propertyId,
          evaluationAnswers: selectedAnswers,
          qualityScore: score,
          starRating: stars,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save property");
      }

      const result = await response.json();

      toast.success("Property created successfully with quality rating!");
      router.push("/properties");
    } catch (error) {
      console.error("Error submitting property:", error);
      toast.error("Failed to create property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicDetails();
      case 2:
        return renderPropertyFeatures();
      case 3:
        return renderEvaluation();
      case 4:
        return renderReview();
      default:
        return null;
    }
  };

  const renderBasicDetails = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Property Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          placeholder="e.g., Modern 2-bedroom apartment in city center"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="propertyType">Property Type *</Label>
          <Select
            value={formData.propertyType}
            onValueChange={(value) => handleInputChange("propertyType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPE_OPTIONS.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="listingType">Listing Type *</Label>
          <Select
            value={formData.listingType}
            onValueChange={(value) => handleInputChange("listingType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select listing type" />
            </SelectTrigger>
            <SelectContent>
              {LISTING_TYPE_OPTIONS.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          placeholder="Street address"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            placeholder="City name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="county">County *</Label>
          <Select
            value={formData.county}
            onValueChange={(value) => handleInputChange("county", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select county" />
            </SelectTrigger>
            <SelectContent>
              {ROMANIAN_COUNTIES.map((county) => (
                <SelectItem key={county} value={county}>
                  {county}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="postalCode">Postal Code</Label>
        <Input
          id="postalCode"
          value={formData.postalCode}
          onChange={(e) => handleInputChange("postalCode", e.target.value)}
          placeholder="Postal code"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Describe your property..."
          rows={4}
        />
      </div>
    </div>
  );

  const renderPropertyFeatures = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="price">
          Price ({formData.listingType === "rent" ? "per month" : "total"}) *
        </Label>
        <div className="relative">
          <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            placeholder="0"
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="area">
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Area (m²) *
            </div>
          </Label>
          <Input
            id="area"
            type="number"
            value={formData.area}
            onChange={(e) => handleInputChange("area", e.target.value)}
            placeholder="0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rooms">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Number of Rooms
            </div>
          </Label>
          <Input
            id="rooms"
            type="number"
            value={formData.rooms}
            onChange={(e) => handleInputChange("rooms", e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedrooms">
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4" />
              Bedrooms
            </div>
          </Label>
          <Input
            id="bedrooms"
            type="number"
            value={formData.bedrooms}
            onChange={(e) => handleInputChange("bedrooms", e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bathrooms">
            <div className="flex items-center gap-2">
              <Bath className="h-4 w-4" />
              Bathrooms
            </div>
          </Label>
          <Input
            id="bathrooms"
            type="number"
            value={formData.bathrooms}
            onChange={(e) => handleInputChange("bathrooms", e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="floor">Floor</Label>
          <Input
            id="floor"
            value={formData.floor}
            onChange={(e) => handleInputChange("floor", e.target.value)}
            placeholder="e.g., 3, Ground, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalFloors">Total Floors</Label>
          <Input
            id="totalFloors"
            type="number"
            value={formData.totalFloors}
            onChange={(e) => handleInputChange("totalFloors", e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="yearBuilt">Year Built</Label>
        <Input
          id="yearBuilt"
          type="number"
          value={formData.yearBuilt}
          onChange={(e) => handleInputChange("yearBuilt", e.target.value)}
          placeholder="e.g., 2020"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="features">Key Features</Label>
        <Textarea
          id="features"
          value={formData.features}
          onChange={(e) => handleInputChange("features", e.target.value)}
          placeholder="e.g., Hardwood floors, Updated kitchen, Walk-in closet..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amenities">Amenities</Label>
        <Textarea
          id="amenities"
          value={formData.amenities}
          onChange={(e) => handleInputChange("amenities", e.target.value)}
          placeholder="e.g., Parking, Pool, Gym, Security..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderEvaluation = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Quality Evaluation
        </h3>
        <p className="text-gray-600">
          Answer these questions to generate a quality rating for your property.
          This helps potential buyers/renters understand the value proposition.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading evaluation questions...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((question) => (
            <Card key={question.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">
                      {question.question}
                      <span className="text-red-500 ml-1">*</span>
                    </CardTitle>
                    {question.description && (
                      <CardDescription className="mt-1">
                        {question.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {question.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {question.answerChoices.map((choice) => (
                    <label
                      key={choice.id}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedAnswers[question.id] === choice.id
                          ? "bg-blue-50 border-blue-200"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={choice.id}
                        checked={selectedAnswers[question.id] === choice.id}
                        onChange={() =>
                          handleAnswerSelect(question.id, choice.id)
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                          selectedAnswers[question.id] === choice.id
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedAnswers[question.id] === choice.id && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="text-sm text-gray-900">
                        {choice.answerText}
                      </span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderReview = () => {
    const { score, stars } = calculateEvaluationScore();

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Review Your Property Listing
          </h3>
          <p className="text-gray-600">
            Please review all details before submitting your property listing.
          </p>
        </div>

        {/* Quality Score Preview */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Quality Rating Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">
                  Your property score:
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= stars
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-green-800">
                    {stars}/5 ({score}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Property Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">{formData.title}</h4>
              <p className="text-sm text-gray-600">
                {
                  PROPERTY_TYPE_OPTIONS.find(
                    (t) => t.value === formData.propertyType,
                  )?.label
                }{" "}
                •{" "}
                {
                  LISTING_TYPE_OPTIONS.find(
                    (t) => t.value === formData.listingType,
                  )?.label
                }
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Price:</span>
                <p className="font-medium">€{formData.price}</p>
              </div>
              <div>
                <span className="text-gray-500">Area:</span>
                <p className="font-medium">{formData.area} m²</p>
              </div>
              <div>
                <span className="text-gray-500">Location:</span>
                <p className="font-medium">
                  {formData.city}, {formData.county}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Rooms:</span>
                <p className="font-medium">{formData.rooms || "N/A"}</p>
              </div>
            </div>

            {formData.description && (
              <div>
                <span className="text-gray-500 text-sm">Description:</span>
                <p className="text-sm mt-1">{formData.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {propertyId ? "Edit Property" : "Add New Property"}
          </h1>
          <Badge variant="outline">
            Step {currentStep} of {STEPS.length}
          </Badge>
        </div>

        <Progress value={calculateProgress()} className="mb-4" />

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{STEPS[currentStep - 1]?.title}</span>
          <span>{STEPS[currentStep - 1]?.description}</span>
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1]?.title}</CardTitle>
          <CardDescription>
            {STEPS[currentStep - 1]?.description}
          </CardDescription>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {currentStep < STEPS.length ? (
            <Button
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!validateStep(currentStep) || isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Property...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Create Property
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
