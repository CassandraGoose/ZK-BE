ALTER TABLE "note_source" RENAME COLUMN "note_id" TO "noteId";--> statement-breakpoint
ALTER TABLE "note_source" DROP CONSTRAINT "note_source_note_id_note_id_fk";
--> statement-breakpoint
ALTER TABLE "note_source" DROP CONSTRAINT "note_source_source_id_source_id_fk";
--> statement-breakpoint
ALTER TABLE "note_source" DROP CONSTRAINT "note_source_note_id_source_id_pk";--> statement-breakpoint
ALTER TABLE "note_source" ADD CONSTRAINT "note_source_noteId_sourceId_pk" PRIMARY KEY("noteId","sourceId");--> statement-breakpoint
ALTER TABLE "note_source" ADD COLUMN "sourceId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "note_source" ADD CONSTRAINT "note_source_noteId_note_id_fk" FOREIGN KEY ("noteId") REFERENCES "public"."note"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_source" ADD CONSTRAINT "note_source_sourceId_source_id_fk" FOREIGN KEY ("sourceId") REFERENCES "public"."source"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_source" DROP COLUMN "source_id";