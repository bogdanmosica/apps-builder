CREATE TABLE "custom_field_values" (
	"id" serial PRIMARY KEY NOT NULL,
	"evaluation_session_id" integer NOT NULL,
	"custom_field_id" integer NOT NULL,
	"value" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_type_id" integer NOT NULL,
	"label_ro" text NOT NULL,
	"label_en" text,
	"field_type" varchar(20) NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"placeholder_ro" text,
	"placeholder_en" text,
	"help_text_ro" text,
	"help_text_en" text,
	"select_options" json DEFAULT '[]'::json,
	"validation" json DEFAULT '{}'::json,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "custom_field_values" ADD CONSTRAINT "custom_field_values_evaluation_session_id_evaluation_sessions_id_fk" FOREIGN KEY ("evaluation_session_id") REFERENCES "public"."evaluation_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_field_values" ADD CONSTRAINT "custom_field_values_custom_field_id_custom_fields_id_fk" FOREIGN KEY ("custom_field_id") REFERENCES "public"."custom_fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_fields" ADD CONSTRAINT "custom_fields_property_type_id_property_types_id_fk" FOREIGN KEY ("property_type_id") REFERENCES "public"."property_types"("id") ON DELETE cascade ON UPDATE no action;