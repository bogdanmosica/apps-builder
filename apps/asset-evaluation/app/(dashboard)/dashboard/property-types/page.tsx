/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { asc } from "drizzle-orm";
import { Settings2 } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AdminManagementPanel from "@/components/admin/comprehensive/AdminManagementPanel";
import PropertyTypesTableSkeleton from "@/components/admin/property-types/PropertyTypesTableSkeleton";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import {
  answers,
  customFields,
  propertyTypes,
  questionCategories,
  questions,
} from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function PropertyTypesAdminPage() {
  const user = await getUser();

  // If user is not logged in or not an admin/owner, redirect to home page
  if (!user || !["admin", "owner"].includes(user.role)) {
    redirect("/");
  }

  // Fetch all data with relationships for admin management
  const allPropertyTypes = await db.query.propertyTypes.findMany({
    orderBy: asc(propertyTypes.name_ro),
    with: {
      questionCategories: {
        orderBy: asc(questionCategories.name_ro),
        with: {
          questions: {
            orderBy: asc(questions.text_ro),
            with: {
              answers: {
                orderBy: asc(answers.text_ro),
              },
            },
          },
        },
      },
      customFields: {
        orderBy: asc(customFields.sortOrder),
      },
    },
  });

  return (
    <div className="container py-6 space-y-6">
      {/* Admin Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-blue-500" />
            <h1 className="text-3xl font-bold tracking-tight text-text-base">
              QA Management
            </h1>
            <Badge variant="default" className="ml-2">
              {user.role.toUpperCase()}
            </Badge>
          </div>
          <p className="text-text-muted max-w-3xl">
            Complete control over property types, question categories,
            questions, and answers. Changes here affect the entire evaluation
            system for all users.
          </p>
        </div>
      </div>

      {/* Admin Management Panel */}
      <Suspense fallback={<PropertyTypesTableSkeleton />}>
        <AdminManagementPanel initialData={allPropertyTypes} />
      </Suspense>
    </div>
  );
}

function SuperuserManagementSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, j) => (
                <div
                  key={j}
                  className="h-4 w-full bg-gray-100 rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const metadata = {
  title: "QA Management | Admin Panel",
  description:
    "Manage property types, categories, questions, and answers for asset evaluation",
};
