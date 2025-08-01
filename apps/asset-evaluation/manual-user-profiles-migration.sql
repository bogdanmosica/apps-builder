-- Migration script to manually run user profiles table creation
-- This can be run if the drizzle migration doesn't work properly

CREATE TABLE IF NOT EXISTS "user_profiles" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL UNIQUE,
  "first_name" varchar(50),
  "last_name" varchar(50),
  "bio" text,
  "avatar" text,
  "phone" varchar(20),
  "timezone" varchar(50) DEFAULT 'UTC',
  "language" varchar(10) DEFAULT 'en',
  "company_name" varchar(100),
  "company_website" text,
  "job_title" varchar(100),
  "linkedin_url" text,
  "twitter_url" text,
  "github_url" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action
);

-- Create updated_at trigger for user_profiles
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
