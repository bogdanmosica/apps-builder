import AdvancedBilling from '@/components/advanced-billing';

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic';

export default function BillingPage() {
  return <AdvancedBilling />;
}
