ALTER TABLE "note_source" RENAME COLUMN "noteId" TO "note_id";--> statement-breakpoint
ALTER TABLE "note_source" RENAME COLUMN "sourceId" TO "source_id";--> statement-breakpoint
ALTER TABLE "note_source" DROP CONSTRAINT "note_source_noteId_note_id_fk";
--> statement-breakpoint
ALTER TABLE "note_source" DROP CONSTRAINT "note_source_sourceId_source_id_fk";
--> statement-breakpoint
ALTER TABLE "note_source" DROP CONSTRAINT "note_source_noteId_sourceId_pk";--> statement-breakpoint
ALTER TABLE "note_source" ADD CONSTRAINT "note_source_note_id_source_id_pk" PRIMARY KEY("note_id","source_id");--> statement-breakpoint
ALTER TABLE "note_source" ADD CONSTRAINT "note_source_note_id_note_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."note"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_source" ADD CONSTRAINT "note_source_source_id_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."source"("id") ON DELETE cascade ON UPDATE no action;