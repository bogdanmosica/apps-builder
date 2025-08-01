import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { products } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

// Type for public product data from specific query
type PublicProductData = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  billingPeriod: string;
};

// GET /api/public/products - Fetch active products for public display (marketing page)
export async function GET() {
  try {
    // Fetch all active products, sorted by price
    const activeProducts = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        currency: products.currency,
        billingPeriod: products.billingPeriod,
        stripePriceId: products.stripePriceId,
        stripeProductId: products.stripeProductId,
      })
      .from(products)
      .where(eq(products.isActive, 'true'))
      .orderBy(asc(products.price));

    // Format products for display
    const formattedProducts = activeProducts.map((product: PublicProductData, index: number) => ({
      ...product,
      price: product.price / 100, // Convert cents to dollars
      // Create some default features based on price tier
      features: generateFeaturesForProduct(product.name, product.price / 100),
      // Mark middle-priced product as popular if there are 3+ products
      isPopular: activeProducts.length >= 3 && index === Math.floor(activeProducts.length / 2),
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching public products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// Helper function to generate features based on product name and price
function generateFeaturesForProduct(name: string, price: number): string[] {
  const baseName = name.toLowerCase();
  
  // Default features based on price ranges
  const baseFeatures = [
    'SSL certificate',
    'Email support',
    'Basic analytics',
  ];

  const midFeatures = [
    'Priority support',
    'Advanced analytics',
    'Team collaboration',
    'Custom integrations',
  ];

  const premiumFeatures = [
    '24/7 phone support',
    'Custom analytics',
    'Advanced security',
    'Dedicated account manager',
    'Custom development',
  ];

  // Generate features based on price
  if (price < 20) {
    return [
      `Up to 5 ${baseName} projects`,
      ...baseFeatures,
      '5GB storage',
    ];
  } else if (price < 50) {
    return [
      `Unlimited ${baseName} projects`,
      ...baseFeatures,
      ...midFeatures.slice(0, 3),
      '100GB storage',
    ];
  } else {
    return [
      `Enterprise ${baseName} features`,
      ...baseFeatures,
      ...midFeatures,
      ...premiumFeatures.slice(0, 3),
      'Unlimited storage',
    ];
  }
}
