ALTER TABLE "device_new" RENAME TO "device";--> statement-breakpoint
ALTER TABLE "device" DROP CONSTRAINT "device_new_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "device" ADD CONSTRAINT "device_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;