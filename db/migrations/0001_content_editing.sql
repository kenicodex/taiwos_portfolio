CREATE TABLE "content_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_documents_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "content_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"window_started_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact_messages" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "contact_messages" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "contact_messages" ADD COLUMN "timeline" text;--> statement-breakpoint
ALTER TABLE "contact_messages" ADD COLUMN "ip_hash" text;--> statement-breakpoint
ALTER TABLE "contact_messages" ADD COLUMN "notified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contact_messages" ADD COLUMN "notify_error" text;--> statement-breakpoint
ALTER TABLE "experiences" ADD COLUMN "period_label" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "experiences" ADD COLUMN "status" "content_status" DEFAULT 'published' NOT NULL;--> statement-breakpoint
ALTER TABLE "experiences" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "experiences" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "role" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "duration" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "placeholder_color" text DEFAULT '#1A1A1A' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "case_study_url" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "role" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "initials" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "location" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "contact_email" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "phone" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "availability" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "copyright_text" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "header_nav" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "footer_nav" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "resume_media_id" uuid;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "share_image_id" uuid;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "icon_media_id" uuid;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "visible" boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE INDEX "content_items_collection_order_idx" ON "content_items" USING btree ("collection","display_order");--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_resume_media_id_media_id_fk" FOREIGN KEY ("resume_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_share_image_id_media_id_fk" FOREIGN KEY ("share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_icon_media_id_media_id_fk" FOREIGN KEY ("icon_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;