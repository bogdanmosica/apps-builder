import ContentManagement from '@/components/content-management';
import { getContentData } from '@/lib/actions/content-actions';

export default async function ContentPage() {
  const contentData = await getContentData();
  
  return <ContentManagement contentData={contentData} />;
}
