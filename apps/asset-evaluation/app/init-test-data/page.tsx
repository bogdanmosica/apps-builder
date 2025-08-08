"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useState } from "react";

export default function InitTestDataPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const initializeTestData = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/init-test-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to initialize test data");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Initialize Test Data</CardTitle>
          <CardDescription>
            Create test user and sample analytics data for the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={initializeTestData}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              "Initialize Test Data"
            )}
          </Button>

          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">Success!</span>
              </div>
              <p className="text-sm text-green-700 mb-2">{result.message}</p>
              {result.user && (
                <div className="text-sm text-green-700">
                  <p>
                    <strong>Email:</strong> {result.user.email}
                  </p>
                  <p>
                    <strong>Password:</strong> {result.user.password}
                  </p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center mb-2">
                <XCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="font-medium text-red-800">Error</span>
              </div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              This will create a test user with sample analytics data.
              <br />
              Use the credentials above to sign in and test the analytics
              dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
