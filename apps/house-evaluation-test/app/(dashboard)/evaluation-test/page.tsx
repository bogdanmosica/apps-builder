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
import { ArrowLeft, BarChart3, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PropertyEvaluationForm } from "@/components/evaluation/property-evaluation-form";
import { PropertyQualityScore } from "@/components/evaluation/property-quality-score";

export default function EvaluationTestPage() {
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [evaluationComplete, setEvaluationComplete] = useState(false);

  // Mock property data for testing
  const mockProperty = {
    id: 1,
    title: "Apartament modern cu 3 camere în centrul Bucureștiului",
    address: "Strada Victoriei 123",
    city: "București",
    county: "București",
    price: 250000,
    currency: "EUR",
    area: 85,
    bedrooms: 2,
    bathrooms: 2,
  };

  const handleEvaluationComplete = () => {
    setEvaluationComplete(true);
    setShowEvaluationForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="mb-4">
          <Link
            href="/properties"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Properties
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Property Evaluation Test
          </h1>
          <p className="text-gray-600">
            Test the weighted scoring evaluation system for properties
          </p>
        </div>

        {/* Mock Property Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{mockProperty.title}</CardTitle>
                <CardDescription className="mt-1">
                  {mockProperty.address}, {mockProperty.city},{" "}
                  {mockProperty.county}
                </CardDescription>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>{mockProperty.area} mp</span>
                  <span>{mockProperty.bedrooms} bedrooms</span>
                  <span>{mockProperty.bathrooms} bathrooms</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  €{mockProperty.price.toLocaleString()}
                </div>
                <Badge variant="secondary">Test Property</Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Evaluation Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Quality Rating
              </CardTitle>
              <CardDescription>
                View the current quality score and rating breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PropertyQualityScore
                propertyId={mockProperty.id}
                showBreakdown={true}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Evaluation Form
              </CardTitle>
              <CardDescription>
                Complete or update the property evaluation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showEvaluationForm ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Click the button below to start evaluating this property.
                    You'll answer questions about location, condition,
                    efficiency, and amenities.
                  </p>
                  <Button
                    onClick={() => setShowEvaluationForm(true)}
                    className="w-full"
                  >
                    Start Evaluation
                  </Button>
                  {evaluationComplete && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        ✅ Evaluation completed! The quality score has been
                        updated.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowEvaluationForm(false)}
                  className="w-full"
                >
                  Hide Evaluation Form
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Evaluation Form */}
        {showEvaluationForm && (
          <PropertyEvaluationForm
            propertyId={mockProperty.id}
            propertyTitle={mockProperty.title}
            onComplete={handleEvaluationComplete}
          />
        )}

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Evaluation System Features</CardTitle>
            <CardDescription>
              Overview of the implemented features for the property evaluation
              system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">✅ Implemented Features</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Weighted evaluation questions</li>
                  <li>• Multiple choice answers with scores</li>
                  <li>• Category-based question grouping</li>
                  <li>• Automatic star rating calculation (1-5 stars)</li>
                  <li>• Quality score breakdown by category</li>
                  <li>• Admin interface for managing questions</li>
                  <li>• Property listing with star ratings</li>
                  <li>• Real-time score updates</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🎯 User Stories Covered</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>
                    • <strong>US-E1:</strong> Evaluation questions with weighted
                    scoring
                  </li>
                  <li>
                    • <strong>US-E2:</strong> Star rating calculation (1-5
                    stars)
                  </li>
                  <li>
                    • <strong>US-E3:</strong> Star ratings displayed on property
                    cards
                  </li>
                  <li>
                    • <strong>US-E4:</strong> Admin interface for question
                    management
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
