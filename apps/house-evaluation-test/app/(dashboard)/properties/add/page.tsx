import { redirect } from "next/navigation";
import { PropertyWizard } from "@/components/property-wizard";
import { getSession } from "@/lib/auth/session";

export default async function AddPropertyPage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <PropertyWizard />
      </div>
    </div>
  );
}
