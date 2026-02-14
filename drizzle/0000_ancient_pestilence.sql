CREATE TABLE "requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"webhook_id" uuid NOT NULL,
	"webhook_token" varchar(255) NOT NULL,
	"method" varchar(10) NOT NULL,
	"headers" jsonb NOT NULL,
	"query_params" jsonb NOT NULL,
	"body" text,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"source_ip" varchar(45) NOT NULL,
	"user_agent" text,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "response_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"webhook_id" uuid NOT NULL,
	"status_code" integer DEFAULT 200 NOT NULL,
	"headers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"body" text,
	"content_type" varchar(100) DEFAULT 'application/json' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "response_configs_webhook_id_unique" UNIQUE("webhook_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" varchar(255) NOT NULL,
	"name" varchar(255),
	"is_enabled" boolean DEFAULT true NOT NULL,
	"owner_id" uuid,
	"session_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "webhooks_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_webhook_id_webhooks_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."webhooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_configs" ADD CONSTRAINT "response_configs_webhook_id_webhooks_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."webhooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;