import { type NextRequest, NextResponse } from "next/server";
import type { SelectorRequestDto } from "types/crawl-dto";
import { getCrawlWebsite } from "@/actions/crawl-website";
import { auth } from "@/auth";

type RequestBody = {
  url: string;
  selectors: SelectorRequestDto[];
  compositionIds?: number[];
};

// PUT: Update an existing crawl
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;

    const body = await req.json();
    const { url, selectors, compositionIds = [] }: RequestBody = body;

    const id = req.nextUrl.searchParams.get("id"); // Get crawl ID from query

    if (!id) {
      return NextResponse.json(
        { message: "Crawl ID is required" },
        { status: 400 },
      );
    }

    if (!url || !selectors || selectors.length === 0) {
      return NextResponse.json(
        { message: "URL and selectors are required" },
        { status: 400 },
      );
    }

    // Find existing crawl by ID and user ID
    const existingCrawl = await db.crawledData.findFirst({
      where: {
        id: Number(id),
        userId,
      },
    });

    if (!existingCrawl) {
      return NextResponse.json({ message: "Crawl not found" }, { status: 404 });
    }

    // Parse data for each container and ensure it's grouped by selector names
    const parsedData = await getCrawlWebsite({ url, selectors });

    // Update existing crawl
    const updatedCrawl = await db.crawledData.update({
      where: { id: Number(id), userId },
      data: {
        url,
        selectors,
        parsedData,
        compositionIds,
      },
    });

    return NextResponse.json(updatedCrawl, { status: 200 });
  } catch (error) {
    console.error("Error during crawling:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const id = req.nextUrl.searchParams.get("id"); // Get Crawl ID from query

  if (!id) {
    return NextResponse.json(
      { message: "Crawl ID is required" },
      { status: 400 },
    );
  }

  try {
    await db.crawledData.delete({
      where: { id: Number(id), userId },
    });

    return NextResponse.json(
      { message: "Crawl deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting crawl", error },
      { status: 500 },
    );
  }
}
