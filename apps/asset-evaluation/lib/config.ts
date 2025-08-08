// Environment configuration with validation
export const config = {
  // Database
  databaseUrl: process.env.DATABASE_URL || process.env.POSTGRES_URL || "",

  // Authentication
  authSecret: process.env.AUTH_SECRET || "",

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",

  // Base URL
  baseUrl:
    process.env.BASE_URL || process.env.VERCEL_URL || "http://localhost:3000",

  // Email
  resendApiKey: process.env.RESEND_API_KEY || "",
  fromEmail: process.env.FROM_EMAIL || "onboarding@resend.dev",

  // Environment
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;

// Validate required environment variables
export function validateConfig() {
  const errors: string[] = [];

  if (!config.authSecret) {
    errors.push("AUTH_SECRET is required");
  }

  if (!config.databaseUrl) {
    errors.push("DATABASE_URL or POSTGRES_URL is required");
  }

  if (config.isProduction) {
    if (!config.stripeSecretKey) {
      errors.push("STRIPE_SECRET_KEY is required in production");
    }

    if (!config.resendApiKey) {
      errors.push("RESEND_API_KEY is required in production");
    }
  }

  if (errors.length > 0) {
    console.error("Environment configuration errors:");
    errors.forEach((error) => console.error(`- ${error}`));

    if (config.isProduction) {
      throw new Error(
        `Missing required environment variables: ${errors.join(", ")}`,
      );
    } else {
      console.warn(
        "Some environment variables are missing but continuing in development mode",
      );
    }
  }

  return config;
}

// Validate configuration on import
if (typeof window === "undefined") {
  // Only validate on server side
  validateConfig();
}
