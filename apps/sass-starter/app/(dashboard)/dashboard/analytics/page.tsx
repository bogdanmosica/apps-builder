import AnalyticsDashboard from '@/components/analytics-dashboard';

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic';

export default function DashboardAnalyticsPage() {
  return <AnalyticsDashboard />;
}
