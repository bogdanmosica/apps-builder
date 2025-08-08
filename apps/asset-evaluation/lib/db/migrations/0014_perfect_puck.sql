ALTER TABLE "custom_fields" ADD COLUMN "category" varchar(50) DEFAULT 'basic' NOT NULL;--> statement-breakpoint
ALTER TABLE "custom_fields" ADD COLUMN "is_universal" boolean DEFAULT false NOT NULL;