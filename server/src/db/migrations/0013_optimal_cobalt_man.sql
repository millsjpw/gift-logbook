DROP INDEX "user_person_name_index";--> statement-breakpoint
DROP INDEX "user_record_date_index";--> statement-breakpoint
DROP INDEX "user_record_person_index";--> statement-breakpoint
ALTER TABLE "persons" ALTER COLUMN "logbook_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "records" ALTER COLUMN "logbook_id" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "logbook_person_name_index" ON "persons" USING btree ("logbook_id",lower("name"));--> statement-breakpoint
CREATE INDEX "logbook_record_date_index" ON "records" USING btree ("logbook_id","date");--> statement-breakpoint
CREATE INDEX "logbook_record_person_index" ON "records" USING btree ("logbook_id","person_id");