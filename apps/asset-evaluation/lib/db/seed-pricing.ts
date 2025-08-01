import { db } from './drizzle';
import { pricingPlans } from './schema';

const PRICING_PLANS = [
  {
    name: 'Starter',
    description: 'Perfect for individuals and small projects',
    price: 900, // $9.00 in cents
    currency: 'usd',
    billingPeriod: 'monthly',
    features: JSON.stringify([
      'Up to 5 projects',
      'Basic analytics',
      'Email support',
      '5GB storage',
      'SSL certificate'
    ]),
    isPopular: 'false',
    isActive: 'true',
    sortOrder: 1
  },
  {
    name: 'Pro',
    description: 'Best for growing businesses and teams',
    price: 2900, // $29.00 in cents
    currency: 'usd',
    billingPeriod: 'monthly',
    features: JSON.stringify([
      'Unlimited projects',
      'Advanced analytics',
      'Priority support',
      '100GB storage',
      'Team collaboration',
      'Custom integrations'
    ]),
    isPopular: 'true',
    isActive: 'true',
    sortOrder: 2
  },
  {
    name: 'Enterprise',
    description: 'For large organizations with custom needs',
    price: 9900, // $99.00 in cents
    currency: 'usd',
    billingPeriod: 'monthly',
    features: JSON.stringify([
      'Unlimited everything',
      'Custom analytics',
      '24/7 phone support',
      'Unlimited storage',
      'Advanced security',
      'Dedicated account manager'
    ]),
    isPopular: 'false',
    isActive: 'true',
    sortOrder: 3
  }
];

async function seedPricingPlans() {
  try {
    console.log('🌱 Seeding pricing plans...');
    
    // Insert pricing plans
    for (const plan of PRICING_PLANS) {
      await db.insert(pricingPlans).values(plan).onConflictDoNothing();
    }
    
    console.log('✅ Pricing plans seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding pricing plans:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedPricingPlans()
    .then(() => {
      console.log('✅ All pricing plans seeded successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error seeding pricing plans:', error);
      process.exit(1);
    });
}

export { seedPricingPlans };
