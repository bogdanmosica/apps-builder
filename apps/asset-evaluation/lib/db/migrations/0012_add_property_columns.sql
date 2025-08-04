ALTER TABLE "evaluation_sessions" ADD COLUMN IF NOT EXISTS "property_name" varchar(100);--> statement-breakpoint
ALTER TABLE "evaluation_sessions" ADD COLUMN IF NOT EXISTS "property_location" varchar(255);--> statement-breakpoint
ALTER TABLE "evaluation_sessions" ADD COLUMN IF NOT EXISTS "property_surface" integer;--> statement-breakpoint
ALTER TABLE "evaluation_sessions" ADD COLUMN IF NOT EXISTS "property_floors" varchar(20);--> statement-breakpoint
ALTER TABLE "evaluation_sessions" ADD COLUMN IF NOT EXISTS "property_construction_year" integer;
