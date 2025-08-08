"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { ArrowRight, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminEvaluationRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new admin questions page after a brief moment
    const timer = setTimeout(() => {
      router.push("/admin/questions");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Admin Panel Restructured</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            The admin evaluation features have been moved to a dedicated
            admin-only section for better security and organization.
          </p>
          <p className="text-sm text-gray-500">
            You will be automatically redirected to the new question management
            page...
          </p>
          <Button
            onClick={() => router.push("/admin/questions")}
            className="mt-4"
          >
            Go to Question Management <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
