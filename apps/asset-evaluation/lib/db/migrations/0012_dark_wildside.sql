-- Add property information columns to evaluation_sessions table
-- These columns exist in schema but may be missing from production database
ALTER TABLE "evaluation_sessions" ADD COLUMN IF NOT EXISTS "property_name" varchar(100);
ALTER TABLE "evaluation_sessions" ADD COLUMN IF NOT EXISTS "property_location" varchar(255);
ALTER TABLE "evaluation_sessions" ADD COLUMN IF NOT EXISTS "property_surface" integer;
ALTER TABLE "evaluation_sessions" ADD COLUMN IF NOT EXISTS "property_floors" varchar(20);
ALTER TABLE "evaluation_sessions" ADD COLUMN IF NOT EXISTS "property_construction_year" integer;