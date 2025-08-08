import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { propertyInquiries } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.propertyId || !body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const newInquiry = await db
      .insert(propertyInquiries)
      .values({
        propertyId: body.propertyId,
        userId: session.user.id,
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        message: body.message,
        status: "new",
      })
      .returning();

    return NextResponse.json(newInquiry[0]);
  } catch (error) {
    console.error("Error creating property inquiry:", error);
    return NextResponse.json(
      { error: "Failed to create inquiry" },
      { status: 500 },
    );
  }
}
