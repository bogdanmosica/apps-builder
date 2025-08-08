import { redirect } from "next/navigation";
import { getUser } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function SuperuserAdminPage() {
  const user = await getUser();

  // If user is not logged in, redirect to home page
  if (!user) {
    redirect("/");
  }

  // If user is an admin, redirect to the property-types page
  if (user.role === "admin") {
    redirect("/dashboard/property-types");
  }

  // For all other users, redirect to home page
  redirect("/");
}

export const metadata = {
  title: "Admin Management Redirect",
  description: "Redirecting to admin management page",
};
