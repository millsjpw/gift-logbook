ALTER TABLE "exchange_exclusions" RENAME TO "person_exclusions";--> statement-breakpoint
ALTER TABLE "person_exclusions" DROP CONSTRAINT "exchange_exclusions_exchange_id_exchanges_id_fk";
--> statement-breakpoint
ALTER TABLE "person_exclusions" DROP CONSTRAINT "exchange_exclusions_person_id_1_persons_id_fk";
--> statement-breakpoint
ALTER TABLE "person_exclusions" DROP CONSTRAINT "exchange_exclusions_person_id_2_persons_id_fk";
--> statement-breakpoint
DROP INDEX "exchange_exclusion_exchange_index";--> statement-breakpoint
DROP INDEX "exchange_exclusion_person1_index";--> statement-breakpoint
DROP INDEX "exchange_exclusion_person2_index";--> statement-breakpoint
ALTER TABLE "person_exclusions" DROP CONSTRAINT "exchange_exclusions_exchange_id_person_id_1_person_id_2_pk";--> statement-breakpoint
ALTER TABLE "person_exclusions" ADD CONSTRAINT "person_exclusions_person_id_1_person_id_2_pk" PRIMARY KEY("person_id_1","person_id_2");--> statement-breakpoint
ALTER TABLE "person_exclusions" ADD CONSTRAINT "person_exclusions_person_id_1_persons_id_fk" FOREIGN KEY ("person_id_1") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_exclusions" ADD CONSTRAINT "person_exclusions_person_id_2_persons_id_fk" FOREIGN KEY ("person_id_2") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "person_exclusion_person1_index" ON "person_exclusions" USING btree ("person_id_1");--> statement-breakpoint
CREATE INDEX "person_exclusion_person2_index" ON "person_exclusions" USING btree ("person_id_2");--> statement-breakpoint
ALTER TABLE "person_exclusions" DROP COLUMN "exchange_id";