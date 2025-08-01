CREATE TABLE "pricing_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'usd' NOT NULL,
	"billing_period" varchar(20) DEFAULT 'monthly' NOT NULL,
	"features" text NOT NULL,
	"is_popular" varchar(10) DEFAULT 'false' NOT NULL,
	"is_active" varchar(10) DEFAULT 'true' NOT NULL,
	"stripe_price_id" text,
	"stripe_product_id" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pricing_plans_stripe_price_id_unique" UNIQUE("stripe_price_id"),
	CONSTRAINT "pricing_plans_stripe_product_id_unique" UNIQUE("stripe_product_id")
);
