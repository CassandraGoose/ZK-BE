CREATE TABLE "source" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"artifact" text NOT NULL,
	"created" timestamp with time zone DEFAULT now(),
	"edited" timestamp with time zone
);
