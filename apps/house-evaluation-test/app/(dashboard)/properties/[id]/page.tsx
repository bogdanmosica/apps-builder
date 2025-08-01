import { notFound } from 'next/navigation';
import { db } from '@/lib/db/drizzle';
import { properties } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { PropertyDetailClient } from '@/components/property-detail-client';

interface PropertyPageProps {
  params: {
    id: string;
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const propertyId = parseInt(params.id);

  if (isNaN(propertyId)) {
    notFound();
  }

  const property = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.status, 'active')))
    .limit(1);

  if (property.length === 0) {
    notFound();
  }

  return <PropertyDetailClient property={property[0]} />;
}
