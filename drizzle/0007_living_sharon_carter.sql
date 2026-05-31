CREATE TABLE `vernice_quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`color_hex` varchar(16) NOT NULL,
	`color_name` varchar(255) NOT NULL,
	`wall_description` varchar(255) NOT NULL,
	`preview_image_url` text NOT NULL,
	`notes` text,
	`status` enum('draft','saved','sent') NOT NULL DEFAULT 'saved',
	`sent_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vernice_quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `vernice_quotes` ADD CONSTRAINT `vernice_quotes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;