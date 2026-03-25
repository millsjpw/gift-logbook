ALTER TABLE "exchange_participants" DROP CONSTRAINT "exchange_participants_person_id_persons_id_fk";
--> statement-breakpoint
ALTER TABLE "list_items" DROP CONSTRAINT "list_items_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "exchange_exclusion_unique";--> statement-breakpoint
DROP INDEX "exchange_participant_unique";--> statement-breakpoint
DROP INDEX "user_tag_name_index";--> statement-breakpoint
DROP INDEX "exchange_assignment_unique";--> statement-breakpoint
DROP INDEX "exchange_receiver_unique";--> statement-breakpoint
DROP INDEX "user_list_item_title_index";--> statement-breakpoint
DROP INDEX "user_list_item_list_index";--> statement-breakpoint
ALTER TABLE "exchange_assignments" DROP CONSTRAINT "exchange_assignments_exchange_id_giver_id_receiver_id_pk";--> statement-breakpoint
ALTER TABLE "records" ALTER COLUMN "meta" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "exchange_assignments" ADD COLUMN "round" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "exchange_assignments" ADD CONSTRAINT "exchange_assignments_exchange_id_round_giver_id_pk" PRIMARY KEY("exchange_id","round","giver_id");--> statement-breakpoint
ALTER TABLE "exchange_participants" ADD CONSTRAINT "exchange_participants_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "exchange_assignment_unique" ON "exchange_assignments" USING btree ("exchange_id","round","giver_id");--> statement-breakpoint
CREATE UNIQUE INDEX "exchange_receiver_unique" ON "exchange_assignments" USING btree ("exchange_id","round","receiver_id");--> statement-breakpoint
CREATE INDEX "user_list_item_title_index" ON "list_items" USING btree ("list_id",lower("title"));--> statement-breakpoint
CREATE INDEX "user_list_item_list_index" ON "list_items" USING btree ("list_id");--> statement-breakpoint
ALTER TABLE "list_items" DROP COLUMN "user_id";