import { and, desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import { products, teamMembers } from "@/lib/db/schema";

const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(100, "Product name must be less than 100 characters"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be a positive number"),
  currency: z
    .string()
    .length(3, "Currency must be 3 characters")
    .default("usd"),
  billingPeriod: z.enum(["monthly", "yearly", "one_time"]).default("monthly"),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's team
    const userWithTeam = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    // If user has no team, return empty products array
    if (userWithTeam.length === 0) {
      return NextResponse.json({ products: [] });
    }

    const teamId = userWithTeam[0].teamId;

    // Get all products for the team
    const teamProducts = await db
      .select()
      .from(products)
      .where(eq(products.teamId, teamId))
      .orderBy(desc(products.createdAt));

    // Format products for display (empty array if no products)
    const formattedProducts = teamProducts.map((product) => ({
      ...product,
      formattedPrice: `$${(product.price / 100).toFixed(2)}`,
      isActive: product.isActive === "true",
    }));

    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's team
    const userWithTeam = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    if (userWithTeam.length === 0) {
      return NextResponse.json(
        {
          error: "No team found. Please create or join a team first.",
        },
        { status: 400 },
      );
    }

    const teamId = userWithTeam[0].teamId;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createProductSchema.parse(body);

    // Convert price to cents
    const priceInCents = Math.round(validatedData.price * 100);

    // Create the product
    const newProduct = await db
      .insert(products)
      .values({
        teamId,
        name: validatedData.name,
        description: validatedData.description || null,
        price: priceInCents,
        currency: validatedData.currency,
        billingPeriod: validatedData.billingPeriod,
        isActive: "true",
      })
      .returning();

    return NextResponse.json(
      {
        product: {
          ...newProduct[0],
          formattedPrice: `$${(newProduct[0].price / 100).toFixed(2)}`,
          isActive: newProduct[0].isActive === "true",
        },
        message: "Product created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
