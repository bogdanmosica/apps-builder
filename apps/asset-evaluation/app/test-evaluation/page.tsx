import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { CheckCircle2, Eye, Home, Play, Star, Trophy } from "lucide-react";
import Link from "next/link";

export default function EvaluationTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Home className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Property Evaluation System
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience our interactive property evaluation with gamification
            elements, instant feedback, and comprehensive scoring.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-lg">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-foreground">
                Interactive Questions
              </h3>
              <p className="text-sm text-muted-foreground">
                15 expert-designed questions across 7 categories with instant
                feedback and scoring
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-foreground">Gamification</h3>
              <p className="text-sm text-muted-foreground">
                Earn points, unlock achievements, and level up from Beginner to
                Property Master
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-foreground">
                Detailed Results
              </h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive scoring breakdown with improvement suggestions and
                downloadable reports
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-xl border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                Start Full Evaluation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Complete the interactive property evaluation with real questions
                from our database. Experience the full gamified journey with
                instant feedback and detailed results.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">15 Questions</Badge>
                <Badge variant="secondary">7 Categories</Badge>
                <Badge variant="secondary">~8 Minutes</Badge>
                <Badge variant="secondary">Gamified</Badge>
              </div>
              <Link href="/evaluation">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  <Play className="w-4 h-4 mr-2" />
                  Start Evaluation
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-secondary" />
                View Demo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Explore a pre-populated demo showing how the evaluation results
                look. Perfect for understanding the output format and scoring
                system.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Pre-filled Data</Badge>
                <Badge variant="outline">Result Preview</Badge>
                <Badge variant="outline">Quick Look</Badge>
                <Badge variant="outline">Sample Scores</Badge>
              </div>
              <Link href="/demo">
                <Button variant="outline" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  View Demo
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Technical Info */}
        <Card className="shadow-lg bg-muted/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">
              🛠️ Technical Implementation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-foreground mb-2">
                  Frontend Features
                </h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• shadcn/ui components with Tailwind CSS</li>
                  <li>• CSS animations and transitions</li>
                  <li>• Responsive mobile-first design</li>
                  <li>• Toast notifications for feedback</li>
                  <li>• Progress tracking and local storage</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">
                  Backend & Data
                </h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Drizzle ORM with PostgreSQL</li>
                  <li>• Seeded with Romanian property questions</li>
                  <li>• Real-time scoring calculations</li>
                  <li>• Category-based question organization</li>
                  <li>• Analytics event tracking</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Built with Next.js, shadcn/ui, Tailwind CSS, and Drizzle ORM
          </p>
        </div>
      </div>
    </div>
  );
}
