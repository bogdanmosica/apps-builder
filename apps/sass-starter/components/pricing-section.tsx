"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface PricingPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: string;
  features: string[];
  isPopular: boolean;
  stripePriceId?: string;
  stripeProductId?: string;
}

interface PricingSectionProps {
  isLoggedIn: boolean;
}

export default function PricingSection({ isLoggedIn }: PricingSectionProps) {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/public/products");
        if (response.ok) {
          const data = await response.json();
          setPlans(data);
        } else {
          console.error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section id="pricing" className="py-20 bg-gray-50 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include core
              features.
            </p>
          </div>
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-10 h-10 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-sm text-gray-600">Loading pricing plans...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-20 bg-gray-50 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include core
            features.
          </p>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Products Coming Soon
            </h3>
            <p className="text-gray-600 mb-8">
              We're preparing our product offerings. Check back soon for our
              pricing plans!
            </p>
            <Button asChild>
              <Link href={isLoggedIn ? "/dashboard" : "/sign-up"}>
                {isLoggedIn ? "Go to Dashboard" : "Get Early Access"}
              </Link>
            </Button>
          </div>
        ) : (
          <div
            className={`grid gap-8 max-w-5xl mx-auto ${
              plans.length === 1
                ? "md:grid-cols-1 max-w-md"
                : plans.length === 2
                  ? "md:grid-cols-2 max-w-3xl"
                  : "md:grid-cols-3"
            }`}
          >
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`border-0 shadow-lg hover:shadow-xl transition-shadow relative ${
                  plan.isPopular ? "border-2 border-primary" : ""
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600">
                      /{plan.billingPeriod === "monthly" ? "month" : "year"}
                    </span>
                  </div>
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.isPopular ? "default" : "outline"}
                    asChild
                  >
                    <Link href={isLoggedIn ? "/dashboard" : "/sign-up"}>
                      {plan.name === "Enterprise"
                        ? "Contact Sales"
                        : "Get Started"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Can I change plans anytime?
              </h4>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                take effect at the next billing cycle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h4>
              <p className="text-gray-600">
                All plans come with a 14-day free trial. No credit card required
                to get started.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-gray-600">
                We accept all major credit cards and PayPal. All payments are
                processed securely through Stripe.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h4>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. You'll
                continue to have access until the end of your billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
