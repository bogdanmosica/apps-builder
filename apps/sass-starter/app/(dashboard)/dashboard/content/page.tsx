import ContentManagement from "@/components/content-management";
import { getContentData } from "@/lib/actions/content-actions";

// Force dynamic rendering since this page uses cookies for authentication
export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const contentData = await getContentData();

  return <ContentManagement contentData={contentData} />;
}
