ALTER TABLE "persons" ADD COLUMN "birth_month" integer;--> statement-breakpoint
ALTER TABLE "persons" ADD COLUMN "birth_day" integer;--> statement-breakpoint
ALTER TABLE "persons" ADD COLUMN "birth_year" integer;--> statement-breakpoint
ALTER TABLE "persons" ADD CONSTRAINT "birth_month_valid" CHECK ("persons"."birth_month" IS NULL OR ("persons"."birth_month" >= 1 AND "persons"."birth_month" <= 12));--> statement-breakpoint
ALTER TABLE "persons" ADD CONSTRAINT "birth_day_valid" CHECK ("persons"."birth_day" IS NULL OR ("persons"."birth_day" >= 1 AND "persons"."birth_day" <= 31));--> statement-breakpoint
ALTER TABLE "persons" ADD CONSTRAINT "birth_year_valid" CHECK ("persons"."birth_year" IS NULL OR ("persons"."birth_year" >= 1900 AND "persons"."birth_year" <= EXTRACT(YEAR FROM CURRENT_DATE)));