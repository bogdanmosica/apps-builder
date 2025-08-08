import { asc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { pricingPlans } from "@/lib/db/schema";

// Define the pricing plan type
type PricingPlan = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  billingPeriod: string;
  features: string;
  isPopular: string;
  isActive: string;
  stripePriceId: string | null;
  stripeProductId: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

// GET /api/pricing - Fetch all active pricing plans
export async function GET() {
  try {
    const plans = await db
      .select()
      .from(pricingPlans)
      .where(eq(pricingPlans.isActive, "true"))
      .orderBy(asc(pricingPlans.sortOrder), asc(pricingPlans.price));

    // Parse features JSON for each plan
    const formattedPlans = plans.map((plan: PricingPlan) => ({
      ...plan,
      features: JSON.parse(plan.features),
      price: plan.price / 100, // Convert cents to dollars
      isPopular: plan.isPopular === "true",
    }));

    return NextResponse.json(formattedPlans);
  } catch (error) {
    console.error("Error fetching pricing plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing plans" },
      { status: 500 },
    );
  }
}

// POST /api/pricing - Create a new pricing plan (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      currency = "usd",
      billingPeriod = "monthly",
      features,
      isPopular = false,
      stripePriceId,
      stripeProductId,
      sortOrder = 0,
    } = body;

    // Validate required fields
    if (!name || !description || price === undefined || !features) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Convert features array to JSON string
    const featuresJson = JSON.stringify(features);

    const newPlan = await db
      .insert(pricingPlans)
      .values({
        name,
        description,
        price: Math.round(price * 100), // Convert dollars to cents
        currency,
        billingPeriod,
        features: featuresJson,
        isPopular: isPopular ? "true" : "false",
        stripePriceId,
        stripeProductId,
        sortOrder,
      })
      .returning();

    const formattedPlan = {
      ...newPlan[0],
      features: JSON.parse(newPlan[0].features),
      price: newPlan[0].price / 100,
      isPopular: newPlan[0].isPopular === "true",
    };

    return NextResponse.json(formattedPlan, { status: 201 });
  } catch (error) {
    console.error("Error creating pricing plan:", error);
    return NextResponse.json(
      { error: "Failed to create pricing plan" },
      { status: 500 },
    );
  }
}
