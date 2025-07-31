CREATE TABLE "evaluation_answer_choices" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"answer_text" text NOT NULL,
	"answer_value" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evaluation_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"description" text,
	"category" varchar(50) NOT NULL,
	"weight" integer DEFAULT 100 NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_evaluations" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"answer_choice_id" integer,
	"custom_answer" text,
	"evaluated_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_quality_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"total_score" integer DEFAULT 0 NOT NULL,
	"star_rating" integer DEFAULT 1 NOT NULL,
	"last_calculated_at" timestamp DEFAULT now() NOT NULL,
	"calculated_by" integer,
	CONSTRAINT "property_quality_scores_property_id_unique" UNIQUE("property_id")
);
--> statement-breakpoint
ALTER TABLE "evaluation_answer_choices" ADD CONSTRAINT "evaluation_answer_choices_question_id_evaluation_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."evaluation_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_evaluations" ADD CONSTRAINT "property_evaluations_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_evaluations" ADD CONSTRAINT "property_evaluations_question_id_evaluation_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."evaluation_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_evaluations" ADD CONSTRAINT "property_evaluations_answer_choice_id_evaluation_answer_choices_id_fk" FOREIGN KEY ("answer_choice_id") REFERENCES "public"."evaluation_answer_choices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_evaluations" ADD CONSTRAINT "property_evaluations_evaluated_by_users_id_fk" FOREIGN KEY ("evaluated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_quality_scores" ADD CONSTRAINT "property_quality_scores_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_quality_scores" ADD CONSTRAINT "property_quality_scores_calculated_by_users_id_fk" FOREIGN KEY ("calculated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;