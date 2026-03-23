CREATE TABLE "exchange_assignments" (
	"exchange_id" uuid NOT NULL,
	"giver_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "exchange_assignments_exchange_id_giver_id_receiver_id_pk" PRIMARY KEY("exchange_id","giver_id","receiver_id")
);
--> statement-breakpoint
CREATE TABLE "exchange_exclusions" (
	"exchange_id" uuid NOT NULL,
	"person_id_1" uuid NOT NULL,
	"person_id_2" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "exchange_exclusions_exchange_id_person_id_1_person_id_2_pk" PRIMARY KEY("exchange_id","person_id_1","person_id_2")
);
--> statement-breakpoint
CREATE TABLE "exchange_participants" (
	"exchange_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "exchange_participants_exchange_id_person_id_pk" PRIMARY KEY("exchange_id","person_id")
);
--> statement-breakpoint
CREATE TABLE "exchanges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "list_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"list_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"url" varchar(2048)
);
--> statement-breakpoint
CREATE TABLE "lists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"person_id" uuid
);
--> statement-breakpoint
CREATE TABLE "persons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"meta" jsonb DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "record_tags" (
	"record_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "record_tags_record_id_tag_id_pk" PRIMARY KEY("record_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"person_id" uuid,
	"item_text" varchar(256) NOT NULL,
	"amount" numeric(10, 2),
	"date" timestamp NOT NULL,
	"meta" jsonb DEFAULT '{}' NOT NULL,
	CONSTRAINT "amount_non_negative" CHECK ("records"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"token" varchar(512) PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"email" varchar(256) NOT NULL,
	"hashed_password" varchar(256) NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "exchange_assignments" ADD CONSTRAINT "exchange_assignments_exchange_id_exchanges_id_fk" FOREIGN KEY ("exchange_id") REFERENCES "public"."exchanges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exchange_assignments" ADD CONSTRAINT "exchange_assignments_giver_id_persons_id_fk" FOREIGN KEY ("giver_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exchange_assignments" ADD CONSTRAINT "exchange_assignments_receiver_id_persons_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exchange_exclusions" ADD CONSTRAINT "exchange_exclusions_exchange_id_exchanges_id_fk" FOREIGN KEY ("exchange_id") REFERENCES "public"."exchanges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exchange_exclusions" ADD CONSTRAINT "exchange_exclusions_person_id_1_persons_id_fk" FOREIGN KEY ("person_id_1") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exchange_exclusions" ADD CONSTRAINT "exchange_exclusions_person_id_2_persons_id_fk" FOREIGN KEY ("person_id_2") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exchange_participants" ADD CONSTRAINT "exchange_participants_exchange_id_exchanges_id_fk" FOREIGN KEY ("exchange_id") REFERENCES "public"."exchanges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exchange_participants" ADD CONSTRAINT "exchange_participants_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exchanges" ADD CONSTRAINT "exchanges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_list_id_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lists" ADD CONSTRAINT "lists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lists" ADD CONSTRAINT "lists_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persons" ADD CONSTRAINT "persons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "record_tags" ADD CONSTRAINT "record_tags_record_id_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "record_tags" ADD CONSTRAINT "record_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "records" ADD CONSTRAINT "records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "records" ADD CONSTRAINT "records_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "exchange_assignment_unique" ON "exchange_assignments" USING btree ("exchange_id","giver_id");--> statement-breakpoint
CREATE UNIQUE INDEX "exchange_receiver_unique" ON "exchange_assignments" USING btree ("exchange_id","receiver_id");--> statement-breakpoint
CREATE INDEX "exchange_assignment_exchange_index" ON "exchange_assignments" USING btree ("exchange_id");--> statement-breakpoint
CREATE INDEX "exchange_assignment_giver_index" ON "exchange_assignments" USING btree ("giver_id");--> statement-breakpoint
CREATE INDEX "exchange_assignment_receiver_index" ON "exchange_assignments" USING btree ("receiver_id");--> statement-breakpoint
CREATE UNIQUE INDEX "exchange_exclusion_unique" ON "exchange_exclusions" USING btree ("exchange_id","person_id_1","person_id_2");--> statement-breakpoint
CREATE INDEX "exchange_exclusion_exchange_index" ON "exchange_exclusions" USING btree ("exchange_id");--> statement-breakpoint
CREATE INDEX "exchange_exclusion_person1_index" ON "exchange_exclusions" USING btree ("person_id_1");--> statement-breakpoint
CREATE INDEX "exchange_exclusion_person2_index" ON "exchange_exclusions" USING btree ("person_id_2");--> statement-breakpoint
CREATE UNIQUE INDEX "exchange_participant_unique" ON "exchange_participants" USING btree ("exchange_id","person_id");--> statement-breakpoint
CREATE INDEX "exchange_participant_exchange_index" ON "exchange_participants" USING btree ("exchange_id");--> statement-breakpoint
CREATE INDEX "exchange_participant_person_index" ON "exchange_participants" USING btree ("person_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_exchange_unique" ON "exchanges" USING btree ("user_id",lower("name"));--> statement-breakpoint
CREATE INDEX "user_list_item_title_index" ON "list_items" USING btree ("user_id",lower("title"));--> statement-breakpoint
CREATE INDEX "user_list_item_list_index" ON "list_items" USING btree ("user_id","list_id");--> statement-breakpoint
CREATE INDEX "user_list_name_index" ON "lists" USING btree ("user_id",lower("name"));--> statement-breakpoint
CREATE INDEX "user_list_person_index" ON "lists" USING btree ("user_id","person_id");--> statement-breakpoint
CREATE INDEX "user_person_name_index" ON "persons" USING btree ("user_id",lower("name"));--> statement-breakpoint
CREATE INDEX "record_tag_record_index" ON "record_tags" USING btree ("record_id");--> statement-breakpoint
CREATE INDEX "record_tag_tag_index" ON "record_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "user_record_date_index" ON "records" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "user_record_person_index" ON "records" USING btree ("user_id","person_id");--> statement-breakpoint
CREATE INDEX "person_record_index" ON "records" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "session_user_index" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_expires_index" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_tag_unique" ON "tags" USING btree ("user_id",lower("name"));--> statement-breakpoint
CREATE INDEX "user_tag_name_index" ON "tags" USING btree ("user_id",lower("name"));