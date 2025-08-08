import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { propertyFavorites } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.propertyId) {
      return NextResponse.json(
        { error: "Missing propertyId" },
        { status: 400 },
      );
    }

    // Check if already favorited
    const existing = await db
      .select()
      .from(propertyFavorites)
      .where(
        and(
          eq(propertyFavorites.userId, session.user.id),
          eq(propertyFavorites.propertyId, body.propertyId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "Already favorited" }, { status: 400 });
    }

    const newFavorite = await db
      .insert(propertyFavorites)
      .values({
        userId: session.user.id,
        propertyId: body.propertyId,
      })
      .returning();

    return NextResponse.json(newFavorite[0]);
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.propertyId) {
      return NextResponse.json(
        { error: "Missing propertyId" },
        { status: 400 },
      );
    }

    await db
      .delete(propertyFavorites)
      .where(
        and(
          eq(propertyFavorites.userId, session.user.id),
          eq(propertyFavorites.propertyId, body.propertyId),
        ),
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 },
    );
  }
}
