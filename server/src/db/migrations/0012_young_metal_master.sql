CREATE TABLE "logbook_members" (
	"logbook_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "logbook_members_logbook_id_user_id_pk" PRIMARY KEY("logbook_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "logbooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "persons" DROP CONSTRAINT "persons_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "records" DROP CONSTRAINT "records_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "persons" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "records" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "persons" ADD COLUMN "logbook_id" uuid;--> statement-breakpoint
ALTER TABLE "records" ADD COLUMN "logbook_id" uuid;--> statement-breakpoint
ALTER TABLE "logbook_members" ADD CONSTRAINT "logbook_members_logbook_id_logbooks_id_fk" FOREIGN KEY ("logbook_id") REFERENCES "public"."logbooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logbook_members" ADD CONSTRAINT "logbook_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logbooks" ADD CONSTRAINT "logbooks_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "logbook_member_user_index" ON "logbook_members" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "persons" ADD CONSTRAINT "persons_logbook_id_logbooks_id_fk" FOREIGN KEY ("logbook_id") REFERENCES "public"."logbooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persons" ADD CONSTRAINT "persons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "records" ADD CONSTRAINT "records_logbook_id_logbooks_id_fk" FOREIGN KEY ("logbook_id") REFERENCES "public"."logbooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "records" ADD CONSTRAINT "records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;