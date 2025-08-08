import { getUser } from "@/lib/db/queries";

export async function GET() {
  try {
    const user = await getUser();
    return Response.json(user);
  } catch (error) {
    console.error("Failed to get user:", error);
    // Return 401 if user can't be retrieved (likely authentication issue)
    return new Response("Unauthorized", { status: 401 });
  }
}
