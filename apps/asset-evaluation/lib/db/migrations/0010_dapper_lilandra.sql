CREATE TABLE "evaluation_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"property_type_id" integer NOT NULL,
	"total_score" integer NOT NULL,
	"max_possible_score" integer NOT NULL,
	"percentage" integer NOT NULL,
	"level" varchar(20) NOT NULL,
	"badge" text NOT NULL,
	"completion_rate" integer NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_evaluation_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"evaluation_session_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"answer_id" integer NOT NULL,
	"answer_weight" integer NOT NULL,
	"question_weight" integer NOT NULL,
	"points_earned" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "evaluation_sessions" ADD CONSTRAINT "evaluation_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluation_sessions" ADD CONSTRAINT "evaluation_sessions_property_type_id_property_types_id_fk" FOREIGN KEY ("property_type_id") REFERENCES "public"."property_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_evaluation_answers" ADD CONSTRAINT "user_evaluation_answers_evaluation_session_id_evaluation_sessions_id_fk" FOREIGN KEY ("evaluation_session_id") REFERENCES "public"."evaluation_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_evaluation_answers" ADD CONSTRAINT "user_evaluation_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_evaluation_answers" ADD CONSTRAINT "user_evaluation_answers_answer_id_answers_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."answers"("id") ON DELETE no action ON UPDATE no action;