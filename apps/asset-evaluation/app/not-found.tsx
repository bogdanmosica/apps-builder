import { Button } from "@workspace/ui/components/button";
import { ArrowLeft, Building2, Home, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              Asset Evaluation
            </span>
          </Link>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* 404 Number */}
          <div className="relative">
            <h1 className="text-9xl md:text-[12rem] font-bold text-muted-foreground/20 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="h-16 w-16 text-primary/30" />
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Oops! Page Not Found
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              The page you're looking for seems to have wandered off into the
              digital void. Don't worry, it happens to the best of us!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link href="/">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Home
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="text-lg px-8 py-6"
            >
              <Link href="/dashboard">
                <Building2 className="mr-2 h-5 w-5" />
                Go to Dashboard
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <div className="pt-12 text-sm text-muted-foreground">
            <p>
              Still lost? Try going back to our{" "}
              <Link
                href="/"
                className="text-primary hover:underline font-medium"
              >
                homepage
              </Link>{" "}
              or contact our support team.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
