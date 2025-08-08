"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  ArrowRight,
  BarChart3,
  Bath,
  Bed,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  Clock,
  Copy,
  Eye,
  Heart,
  Home,
  MapPin,
  Play,
  Shield,
  Square,
  Star,
  UserPlus,
  Users,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Navigation from "./navigation";
import PropertyDemo from "./property-demo";

interface MarketingLandingProps {
  isLoggedIn: boolean;
  userRole: string | null;
}

// Mock property data for demo
const mockProperties = [
  {
    id: 1,
    address: "123 Maple Street, Downtown",
    price: "$450,000",
    beds: 3,
    baths: 2,
    sqft: "1,850 sq ft",
    score: 85,
    image: "/api/placeholder/400/250",
    pros: ["Great location", "Updated kitchen", "Good schools nearby"],
    cons: ["Small backyard", "Street parking only"],
    checklist: {
      location: 9,
      condition: 8,
      price: 7,
      amenities: 8,
    },
  },
  {
    id: 2,
    address: "456 Oak Avenue, Suburbs",
    price: "$380,000",
    beds: 4,
    baths: 3,
    sqft: "2,100 sq ft",
    score: 72,
    image: "/api/placeholder/400/250",
    pros: ["Large yard", "Quiet neighborhood", "Garage"],
    cons: ["Needs roof repair", "Far from downtown", "Old appliances"],
    checklist: {
      location: 6,
      condition: 6,
      price: 9,
      amenities: 7,
    },
  },
];

const testimonials = [
  {
    type: "First-time Buyer",
    pain: "I was overwhelmed by all the properties and didn't know what to look for",
    name: "Sarah M.",
    location: "Seattle, WA",
  },
  {
    type: "Growing Family",
    pain: "We needed to compare schools, safety, and space for our kids",
    name: "Mike & Jennifer T.",
    location: "Austin, TX",
  },
  {
    type: "Investor",
    pain: "I needed a systematic way to evaluate potential rental properties",
    name: "David L.",
    location: "Miami, FL",
  },
];

export default function MarketingLanding({
  isLoggedIn,
  userRole,
}: MarketingLandingProps) {
  const { t } = useTranslation(["landing", "common"]);
  const [inviteLink] = useState("asseteval.app/join/family-home-search-2024");
  const [copied, setCopied] = useState(false);

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`https://${inviteLink}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <Navigation isLoggedIn={isLoggedIn} userRole={userRole} />

      {/* Section 1: Hero Problem Statement */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Badge variant="secondary" className="mb-4 text-sm px-4 py-2">
                🏠 Smart Property Evaluation
              </Badge>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {t("hero.mainTitle", { ns: "landing" })}
              <span className="text-blue-600 dark:text-blue-400 block">
                {t("hero.mainTitleHighlight", { ns: "landing" })}
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              {t("hero.mainSubtitle", { ns: "landing" })}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isLoggedIn ? (
                <Button
                  size="lg"
                  asChild
                  className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 text-primary"
                >
                  <Link href="/dashboard">
                    <CheckSquare className="mr-2 h-5 w-5" />
                    {t("hero.ctaDashboard", { ns: "landing" })}
                  </Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  asChild
                  className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700"
                >
                  <Link href="/sign-up">
                    <CheckSquare className="mr-2 h-5 w-5" />
                    {t("hero.ctaMain", { ns: "landing" })}
                  </Link>
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              {t("hero.benefits", { ns: "landing" })}
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: How It Works (3 Steps) */}
      <section
        id="how-it-works"
        className="py-20 bg-gray-50 dark:bg-gray-800 px-4"
      >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t("howItWorks.title", { ns: "landing" })}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t("howItWorks.subtitle", { ns: "landing" })}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow text-center dark:bg-gray-700">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl dark:text-white">
                  {t("howItWorks.step1.title", { ns: "landing" })}
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  {t("howItWorks.step1.description", { ns: "landing" })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {t("howItWorks.step1.details", { ns: "landing" })}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow text-center dark:bg-gray-700">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckSquare className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl dark:text-white">
                  {t("howItWorks.step2.title", { ns: "landing" })}
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  {t("howItWorks.step2.description", { ns: "landing" })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {t("howItWorks.step2.details", { ns: "landing" })}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow text-center dark:bg-gray-700">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl dark:text-white">
                  {t("howItWorks.step3.title", { ns: "landing" })}
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  {t("howItWorks.step3.description", { ns: "landing" })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {t("howItWorks.step3.details", { ns: "landing" })}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <PropertyDemo
              trigger={
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6"
                >
                  <Play className="mr-2 h-5 w-5" />
                  {t("howItWorks.demoButton", { ns: "landing" })}
                </Button>
              }
            />
          </div>
        </div>
      </section>

      {/* Section 3: Interactive Comparison Demo */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t("comparison.title", { ns: "landing" })}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t("comparison.subtitle", { ns: "landing" })}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {mockProperties.map((property) => (
              <Card
                key={property.id}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow"
              >
                <CardHeader>
                  <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <Home className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg dark:text-white">
                        {property.address}
                      </CardTitle>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        {property.price}
                      </p>
                    </div>
                    <Badge
                      variant={property.score >= 80 ? "default" : "secondary"}
                      className={`text-lg px-3 py-1 ${property.score >= 80 ? "bg-green-500" : "bg-yellow-500"}`}
                    >
                      {property.score}/100
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <span className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      {property.beds} beds
                    </span>
                    <span className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      {property.baths} baths
                    </span>
                    <span className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      {property.sqft}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Location</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${property.checklist.location * 10}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {property.checklist.location}/10
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Condition</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${property.checklist.condition * 10}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {property.checklist.condition}/10
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Price Value</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${property.checklist.price * 10}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {property.checklist.price}/10
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-1">
                        Pros:
                      </p>
                      <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                        {property.pros.map((pro, idx) => (
                          <li key={idx} className="flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-700 mb-1">
                        Cons:
                      </p>
                      <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                        {property.cons.map((con, idx) => (
                          <li key={idx} className="flex items-center">
                            <X className="h-3 w-3 text-red-500 mr-2 flex-shrink-0" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <PropertyDemo
              trigger={
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6"
                >
                  <Eye className="mr-2 h-5 w-5" />
                  {t("comparison.demoButton", { ns: "landing" })}
                </Button>
              }
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {t("comparison.demoSubtext", { ns: "landing" })}
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Family/Partner Collaboration */}
      <section className="py-20 bg-blue-50 dark:bg-gray-800 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t("collaboration.title", { ns: "landing" })}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {t("collaboration.subtitle", { ns: "landing" })}
            </p>

            <Card className="border-0 shadow-lg max-w-2xl mx-auto dark:bg-gray-700">
              <CardHeader>
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <CardTitle className="dark:text-white">
                  {t("collaboration.cardTitle", { ns: "landing" })}
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  {t("collaboration.cardDescription", { ns: "landing" })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl border border-blue-100 dark:border-gray-600 mb-6">
                  <div className="text-center mb-4">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                      🔗 {t("collaboration.inviteTitle", { ns: "landing" })}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-4">
                      {t("collaboration.inviteDescription", { ns: "landing" })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg border-2 border-blue-200 dark:border-blue-800 overflow-hidden">
                      <code className="block p-3 text-sm text-gray-700 dark:text-gray-300 font-mono break-all">
                        https://{inviteLink}
                      </code>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyInviteLink}
                      className="px-4 py-3 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
                    >
                      {copied ? (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">
                            {t("collaboration.copied", { ns: "landing" })}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Copy className="h-4 w-4" />
                          <span className="text-sm">
                            {t("collaboration.copy", { ns: "landing" })}
                          </span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 py-3 text-primary">
                  <UserPlus className="mr-2 h-5 w-5" />
                  {t("collaboration.inviteButton", { ns: "landing" })}
                </Button>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  {t("collaboration.features.shared.title", { ns: "landing" })}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t("collaboration.features.shared.description", {
                    ns: "landing",
                  })}
                </p>
              </div>
              <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckSquare className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  {t("collaboration.features.consensus.title", {
                    ns: "landing",
                  })}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t("collaboration.features.consensus.description", {
                    ns: "landing",
                  })}
                </p>
              </div>
              <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  {t("collaboration.features.saveTime.title", {
                    ns: "landing",
                  })}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t("collaboration.features.saveTime.description", {
                    ns: "landing",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Offline + Trust Badge */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t("offline.title", { ns: "landing" })}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {t("offline.description", { ns: "landing" })}
                </p>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Wifi className="h-5 w-5 text-green-500" />
                    <span className="text-sm">
                      {t("offline.onlineSync", { ns: "landing" })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <WifiOff className="h-5 w-5 text-blue-500" />
                    <span className="text-sm">
                      {t("offline.offlineReady", { ns: "landing" })}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Shield className="h-8 w-8 text-green-500" />
                      <div>
                        <CardTitle className="text-lg dark:text-white">
                          {t("security.title", { ns: "landing" })}
                        </CardTitle>
                        <CardDescription>
                          {t("security.subtitle", { ns: "landing" })}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {t("security.features.encryption", { ns: "landing" })}
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {t("security.features.noPartnerships", {
                          ns: "landing",
                        })}
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {t("security.features.gdpr", { ns: "landing" })}
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {t("security.features.deleteAnytime", {
                          ns: "landing",
                        })}
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Testimonials */}
      <section
        id="testimonials"
        className="py-20 bg-gray-50 dark:bg-gray-800 px-4"
      >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t("testimonials.title", { ns: "landing" })}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t("testimonials.subtitle", { ns: "landing" })}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="border-0 shadow-lg">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">
                    {testimonial.type}
                  </Badge>
                  <CardDescription className="text-base italic">
                    "{testimonial.pain}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.location}
                      </p>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              {t("testimonials.cta", { ns: "landing" })}
            </Button>
          </div>
        </div>
      </section>

      {/* Section 7: FAQ */}
      <section id="faq" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t("faq.title", { ns: "landing" })}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                {t("faq.subtitle", { ns: "landing" })}
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem
                value="item-1"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold">
                  {t("faq.q1.question", { ns: "landing" })}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300 pt-2">
                  {t("faq.q1.answer", { ns: "landing" })}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-2"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold">
                  {t("faq.q2.question", { ns: "landing" })}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300 pt-2">
                  {t("faq.q2.answer", { ns: "landing" })}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-3"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold">
                  {t("faq.q3.question", { ns: "landing" })}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300 pt-2">
                  {t("faq.q3.answer", { ns: "landing" })}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-4"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold">
                  {t("faq.q4.question", { ns: "landing" })}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300 pt-2">
                  {t("faq.q4.answer", { ns: "landing" })}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-5"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold">
                  {t("faq.q5.question", { ns: "landing" })}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300 pt-2">
                  {t("faq.q5.answer", { ns: "landing" })}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-6"
                className="last:border-b border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold">
                  {t("faq.q6.question", { ns: "landing" })}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300 pt-2">
                  {t("faq.q6.answer", { ns: "landing" })}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Section 8: Final CTA */}
      <section className="py-20 bg-blue-600 text-white px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t("finalCta.title", { ns: "landing" })}
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              {t("finalCta.subtitle", { ns: "landing" })}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              {isLoggedIn ? (
                <Button
                  size="lg"
                  variant="secondary"
                  asChild
                  className="text-lg px-8 py-6"
                >
                  <Link href="/dashboard">
                    <CheckSquare className="mr-2 h-5 w-5" />
                    {t("finalCta.ctaDashboard", { ns: "landing" })}
                  </Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="secondary"
                  asChild
                  className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-50"
                >
                  <Link href="/sign-up">
                    <CheckSquare className="mr-2 h-5 w-5" />
                    {t("finalCta.ctaMain", { ns: "landing" })}
                  </Link>
                </Button>
              )}
            </div>
            <p className="text-sm opacity-75 mb-8">
              {t("finalCta.encouragement", { ns: "landing" })}
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm opacity-75">
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                {t("finalCta.benefits.free", { ns: "landing" })}
              </span>
              <span className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                {t("finalCta.benefits.secure", { ns: "landing" })}
              </span>
              <span className="flex items-center">
                <WifiOff className="h-4 w-4 mr-2" />
                {t("finalCta.benefits.offline", { ns: "landing" })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Home className="h-6 w-6" />
                <span className="text-xl font-bold">
                  {t("footer.brand.short", { ns: "landing" })}
                </span>
              </div>
              <p className="text-gray-400 dark:text-gray-500">
                {t("footer.description", { ns: "landing" })}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">
                {t("footer.product.title", { ns: "landing" })}
              </h3>
              <ul className="space-y-2 text-gray-400 dark:text-gray-500">
                <li>
                  <Link
                    href="#"
                    className="hover:text-white dark:hover:text-gray-200 transition-colors"
                  >
                    {t("footer.product.checklists", { ns: "landing" })}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-white dark:hover:text-gray-200 transition-colors"
                  >
                    {t("footer.product.comparison", { ns: "landing" })}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-white dark:hover:text-gray-200 transition-colors"
                  >
                    {t("footer.product.sharing", { ns: "landing" })}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">
                {t("footer.resources.title", { ns: "landing" })}
              </h3>
              <ul className="space-y-2 text-gray-400 dark:text-gray-500">
                <li>
                  <Link
                    href="#"
                    className="hover:text-white dark:hover:text-gray-200 transition-colors"
                  >
                    {t("footer.resources.guide", { ns: "landing" })}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-white dark:hover:text-gray-200 transition-colors"
                  >
                    {t("footer.resources.templates", { ns: "landing" })}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-white dark:hover:text-gray-200 transition-colors"
                  >
                    {t("footer.resources.analysis", { ns: "landing" })}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">
                {t("footer.support.title", { ns: "landing" })}
              </h3>
              <ul className="space-y-2 text-gray-400 dark:text-gray-500">
                <li>
                  <Link
                    href="#"
                    className="hover:text-white dark:hover:text-gray-200 transition-colors"
                  >
                    {t("footer.support.help", { ns: "landing" })}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-white dark:hover:text-gray-200 transition-colors"
                  >
                    {t("footer.support.contact", { ns: "landing" })}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-white dark:hover:text-gray-200 transition-colors"
                  >
                    {t("footer.support.privacy", { ns: "landing" })}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-center text-gray-400 dark:text-gray-500">
            <p>{t("footer.copyright", { ns: "landing" })}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
