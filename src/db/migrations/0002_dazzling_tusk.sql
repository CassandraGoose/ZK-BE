CREATE TABLE "note_source" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"note_id" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	"created" timestamp with time zone DEFAULT now(),
	CONSTRAINT "note_source_note_id_source_id_pk" PRIMARY KEY("note_id","source_id")
);
--> statement-breakpoint
ALTER TABLE "note_source" ADD CONSTRAINT "note_source_note_id_note_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."note"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_source" ADD CONSTRAINT "note_source_source_id_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."source"("id") ON DELETE cascade ON UPDATE no action;