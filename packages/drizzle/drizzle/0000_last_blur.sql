CREATE TABLE "mqtt_device" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"imei" varchar(50) NOT NULL,
	CONSTRAINT "mqtt_device_id_unique" UNIQUE("id"),
	CONSTRAINT "mqtt_device_imei_unique" UNIQUE("imei")
);
--> statement-breakpoint
CREATE TABLE "mqtt_device_interval" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"imei" varchar NOT NULL,
	"batteryStatusInterval" integer,
	"deviceStatusInterval" integer,
	"lastUpdate" timestamp,
	CONSTRAINT "mqtt_device_interval_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "device_new" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userAgent" text NOT NULL,
	"ip" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_login_at" timestamp,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mqtt_setup_channel" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"imei" varchar NOT NULL,
	"usingChannel" varchar(4) NOT NULL,
	"lastUpdate" timestamp,
	CONSTRAINT "mqtt_setup_channel_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "user_credential" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"password_hash" text NOT NULL,
	CONSTRAINT "user_credential_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"age" integer,
	"image" text,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_login_at" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "mqtt_device_interval" ADD CONSTRAINT "mqtt_device_interval_imei_mqtt_device_imei_fk" FOREIGN KEY ("imei") REFERENCES "public"."mqtt_device"("imei") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_new" ADD CONSTRAINT "device_new_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mqtt_setup_channel" ADD CONSTRAINT "mqtt_setup_channel_imei_mqtt_device_imei_fk" FOREIGN KEY ("imei") REFERENCES "public"."mqtt_device"("imei") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_credential" ADD CONSTRAINT "user_credential_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;