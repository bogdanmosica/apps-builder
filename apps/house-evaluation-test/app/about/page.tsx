import { Button } from "@workspace/ui/components/button";
import { ArrowLeft, Award, Home, Target, Users } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
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
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl mb-6">
            About RoProperty
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-8">
            We're on a mission to make Romanian real estate accessible,
            transparent, and profitable for everyone. Whether you're buying your
            first home, searching for the perfect rental, or building an
            investment portfolio, we're here to guide you every step of the way.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Mission
              </h3>
              <p className="text-gray-600">
                To democratize access to Romanian real estate opportunities by
                providing comprehensive market insights, educational resources,
                and a trusted platform that connects buyers, renters, and
                investors.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Home className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Vision
              </h3>
              <p className="text-gray-600">
                To become Romania's most trusted real estate platform, known for
                transparency, expertise, and helping people make informed
                decisions that improve their lives and financial well-being.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Values
              </h3>
              <p className="text-gray-600">
                Transparency in every transaction, expertise backed by local
                market knowledge, and genuine care for our users' success in
                their real estate journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose RoProperty?
            </h2>
            <p className="text-xl text-gray-600">
              What makes us different in the Romanian real estate market
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-md">
              <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mb-4 flex items-center justify-center">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Local Expertise
              </h3>
              <p className="text-gray-600">
                Deep understanding of Romanian real estate laws, market trends,
                and local neighborhoods. We know the ins and outs of every major
                city.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-md">
              <div className="bg-green-100 rounded-full p-3 w-12 h-12 mb-4 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Comprehensive Support
              </h3>
              <p className="text-gray-600">
                From first-time buyers to seasoned investors, we provide
                tailored guidance, educational resources, and ongoing support
                throughout your real estate journey.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-md">
              <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mb-4 flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Data-Driven Insights
              </h3>
              <p className="text-gray-600">
                Advanced market analytics, price trends, and investment
                projections to help you make informed decisions based on real
                data, not just intuition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  RoProperty was born from a simple observation: Romania's real
                  estate market was full of opportunities, but navigating it was
                  unnecessarily complex and opaque. Too many people were making
                  important decisions without access to the right information or
                  guidance.
                </p>
                <p>
                  Founded in 2023 by a team of real estate professionals, data
                  scientists, and technology experts, we set out to change that.
                  We combined our deep understanding of the Romanian market with
                  cutting-edge technology to create a platform that truly serves
                  our users' needs.
                </p>
                <p>
                  Today, we're proud to serve thousands of users across Romania,
                  from Bucharest to Cluj-Napoca, Timisoara to Brasov. Our
                  platform has facilitated millions of euros in real estate
                  transactions and helped countless families find their perfect
                  homes.
                </p>
                <p>
                  But we're just getting started. As Romania's real estate
                  market continues to evolve, we're committed to innovating and
                  expanding our services to better serve our growing community.
                </p>
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">By the Numbers</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-200">
                      5,000+
                    </div>
                    <div className="text-sm text-blue-100">Happy Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-200">
                      €50M+
                    </div>
                    <div className="text-sm text-blue-100">
                      Transaction Value
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-200">25+</div>
                    <div className="text-sm text-blue-100">Cities Covered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-200">98%</div>
                    <div className="text-sm text-blue-100">
                      User Satisfaction
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Become part of Romania's fastest-growing real estate community.
            Start your journey with expert guidance and trusted insights.
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
                Explore Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
