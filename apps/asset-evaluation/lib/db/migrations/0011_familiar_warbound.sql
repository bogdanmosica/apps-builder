ALTER TABLE "answers" RENAME COLUMN "text" TO "text_ro";--> statement-breakpoint
ALTER TABLE "property_types" DROP CONSTRAINT "property_types_name_unique";--> statement-breakpoint
ALTER TABLE "answers" ADD COLUMN "text_en" text;--> statement-breakpoint
ALTER TABLE "property_types" ADD COLUMN "name_ro" text NOT NULL;--> statement-breakpoint
ALTER TABLE "property_types" ADD COLUMN "name_en" text;--> statement-breakpoint
ALTER TABLE "question_categories" ADD COLUMN "name_ro" text NOT NULL;--> statement-breakpoint
ALTER TABLE "question_categories" ADD COLUMN "name_en" text;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "text_ro" text NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "text_en" text;--> statement-breakpoint
ALTER TABLE "property_types" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "question_categories" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "questions" DROP COLUMN "text";--> statement-breakpoint
ALTER TABLE "property_types" ADD CONSTRAINT "property_types_name_ro_unique" UNIQUE("name_ro");