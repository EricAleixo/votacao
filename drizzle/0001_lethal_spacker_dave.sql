ALTER TABLE "votes" RENAME COLUMN "voter_ip" TO "device_id";--> statement-breakpoint
ALTER TABLE "votes" DROP CONSTRAINT "votes_candidate_id_candidates_id_fk";
--> statement-breakpoint
DROP INDEX "unique_vote_per_ip";--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "votes" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "unique_vote_per_device" UNIQUE("device_id");