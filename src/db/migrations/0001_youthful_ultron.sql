DROP INDEX "user_list_name_index";--> statement-breakpoint
DROP INDEX "user_person_name_index";--> statement-breakpoint
CREATE UNIQUE INDEX "user_list_name_index" ON "lists" USING btree ("user_id",lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX "user_person_name_index" ON "persons" USING btree ("user_id",lower("name"));