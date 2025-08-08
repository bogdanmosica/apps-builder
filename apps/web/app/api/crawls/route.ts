import { type NextRequest, NextResponse } from "next/server";
import type { CrawlDataResponseDto, SelectorRequestDto } from "types/crawl-dto";
import { getCrawlWebsite } from "@/actions/crawl-website";
import { getUserCrawls } from "@/actions/crawls/get-user-crawls";
import { auth } from "@/auth"; // Import your NextAuth v5 authentication

export const GET = auth(async (req) => {
  const session = req.auth;

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session?.user?.id;

  try {
    const crawls = await getUserCrawls(userId ?? "");

    return NextResponse.json(crawls, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching crawls", error },
      { status: 500 },
    );
  }
});

type RequestBody = {
  url: string;
  selectors: SelectorRequestDto[];
  compositionIds?: number[];
};

// Define the POST method handler
export async function POST(
  req: NextRequest,
  res: NextResponse<CrawlDataResponseDto>,
) {
  try {
    // Get the user session from NextAuth v5
    const session = await auth(); // Call the auth function without arguments

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string; // Get the user ID from the session

    // Extract the JSON body
    const body = await req.json();
    const {
      url,
      selectors,
      compositionIds = [], // Accept compositionIds from the request body
    }: RequestBody = body;

    if (!url || !selectors || selectors.length === 0) {
      return NextResponse.json(
        { message: "URL and selectors are required" },
        { status: 400 },
      );
    }

    // Check if the URL already exists for the authenticated user
    const existingCrawl = await db.crawledData.findFirst({
      where: {
        url,
        userId, // Ensure the check is user-specific
      },
    });

    // Parse data for each container and ensure it's grouped by selector names
    const parsedData = await getCrawlWebsite({ url, selectors });

    // If URL exists, update parsedData and selectors, otherwise create new entry
    if (existingCrawl) {
      const updatedCrawl = await db.crawledData.update({
        where: { id: existingCrawl.id },
        data: {
          selectors, // Update selectors as JSON
          parsedData, // Update parsed data as JSON array
          // compositionIds will not be updated here; they can be added later
        },
      });

      return NextResponse.json(updatedCrawl, { status: 200 });
    } else {
      // Create a new entry if the URL doesn't exist
      const newCrawl = await db.crawledData.create({
        data: {
          url,
          selectors, // Save selectors as JSON
          parsedData, // Save parsed data as JSON array
          compositionIds, // Initialize with empty compositionIds or provided ones
          userId, // Associate the crawled data with the user
        },
      });

      return NextResponse.json(newCrawl, { status: 200 });
    }
  } catch (error) {
    console.error("Error during crawling:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
