import { Button } from "@workspace/ui/components/button";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Home,
  MapPin,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function GuidesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
          <div className="mt-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Romanian Real Estate Guides
            </h1>
            <p className="mt-2 text-xl text-gray-600">
              Expert insights and comprehensive guides to help you navigate
              Romania's real estate market
            </p>
          </div>
        </div>
      </header>

      {/* Featured Guide */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-4">
                Complete Guide to Real Estate Investment in Romania
              </h2>
              <p className="text-xl mb-6 text-blue-100">
                Everything you need to know about investing in Romanian real
                estate, from legal requirements to market trends and ROI
                calculations.
              </p>
              <Button className="bg-white text-blue-600 hover:bg-gray-100">
                Read Full Guide
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Guide Categories */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Browse by Category
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Home className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Buying Guides
              </h3>
              <p className="text-gray-600 text-sm">
                First-time buyer tips, financing, and legal processes
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Renting Guides
              </h3>
              <p className="text-gray-600 text-sm">
                Tenant rights, lease agreements, and finding rentals
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Investment</h3>
              <p className="text-gray-600 text-sm">
                ROI analysis, market trends, and portfolio building
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Market Analysis
              </h3>
              <p className="text-gray-600 text-sm">
                City guides, neighborhood insights, and trends
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Guide Articles */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Latest Guides
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Buying vs Renting Guide */}
            <article className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-8">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <Home className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-blue-600">
                    BUYING GUIDE
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Buying vs. Renting in Romania: The Complete Decision Guide
                </h3>
                <p className="text-gray-600 mb-6">
                  Should you buy or rent in Romania's current market? This
                  comprehensive guide analyzes costs, benefits, and market
                  conditions to help you make the right decision for your
                  financial situation and lifestyle.
                </p>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    What you'll learn:
                  </h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Cost comparison calculator for major Romanian cities
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Hidden costs of buying vs. renting
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Market trends and future predictions
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Financial requirements and mortgage options
                    </li>
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Updated January 2025</span>
                  </div>
                  <Button>Read Guide</Button>
                </div>
              </div>
            </article>

            {/* Investment Guide */}
            <article className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-8">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 rounded-full p-2 mr-3">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-purple-600">
                    INVESTMENT GUIDE
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Real Estate Investment for Beginners in Romania
                </h3>
                <p className="text-gray-600 mb-6">
                  Start your real estate investment journey in Romania with
                  confidence. Learn about market opportunities, legal
                  requirements, financing options, and strategies for building a
                  profitable property portfolio.
                </p>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    What you'll learn:
                  </h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      Investment strategies for different budgets
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      Legal requirements for foreign investors
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      ROI calculation and market analysis
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      Tax implications and optimization strategies
                    </li>
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Updated December 2024</span>
                  </div>
                  <Button>Read Guide</Button>
                </div>
              </div>
            </article>

            {/* Neighborhood Guide */}
            <article className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-8">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-blue-600">
                    LOCATION GUIDE
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Best Neighborhoods in Romanian Cities 2025
                </h3>
                <p className="text-gray-600 mb-6">
                  Discover the most promising neighborhoods for living and
                  investing across Romania's major cities. Get insider insights
                  on amenities, transport, schools, and future development
                  plans.
                </p>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Featured cities:
                  </h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Bucharest: Herastrau, Pipera, Primaverii, Calea Victoriei
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Cluj-Napoca: Gheorgheni, Zorilor, Buna Ziua
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Timisoara: Fabric, Elisabetin, Dumbravita
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Brasov: Tractorul, Noua, Centrul Vechi
                    </li>
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Updated November 2024</span>
                  </div>
                  <Button>Read Guide</Button>
                </div>
              </div>
            </article>

            {/* Legal Guide */}
            <article className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-8">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 rounded-full p-2 mr-3">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    LEGAL GUIDE
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Legal Requirements for Property Purchase in Romania
                </h3>
                <p className="text-gray-600 mb-6">
                  Navigate the legal aspects of buying property in Romania.
                  Understand documentation requirements, notary processes,
                  taxes, and legal protections for both Romanian and foreign
                  buyers.
                </p>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Key topics covered:
                  </h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      Required documentation and due diligence
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      Notary fees and legal costs breakdown
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      Property taxes and ongoing obligations
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      Rights and protections for foreign buyers
                    </li>
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Updated October 2024</span>
                  </div>
                  <Button>Read Guide</Button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Take Action?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Apply what you've learned from our guides. Start your real estate
            journey in Romania today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Get Started Free
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                size="lg"
                className="text-white border-white hover:bg-white hover:text-blue-600"
              >
                Browse Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
