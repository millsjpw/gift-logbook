CREATE TABLE "list_item_tags" (
	"list_item_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "list_item_tags_list_item_id_tag_id_pk" PRIMARY KEY("list_item_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "list_item_tags" ADD CONSTRAINT "list_item_tags_list_item_id_list_items_id_fk" FOREIGN KEY ("list_item_id") REFERENCES "public"."list_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_item_tags" ADD CONSTRAINT "list_item_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "list_item_tag_item_index" ON "list_item_tags" USING btree ("list_item_id");--> statement-breakpoint
CREATE INDEX "list_item_tag_tag_index" ON "list_item_tags" USING btree ("tag_id");