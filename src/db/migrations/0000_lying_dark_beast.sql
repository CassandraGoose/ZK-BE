CREATE TABLE "note" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created" timestamp with time zone DEFAULT now(),
	"edited" timestamp with time zone
);
