CREATE TABLE `emails` (
	`id` varchar(36) NOT NULL,
	`to` varchar(255) NOT NULL,
	`from` varchar(255) NOT NULL DEFAULT 'contact@decorcarpi.it',
	`subject` varchar(255) NOT NULL,
	`html_content` text NOT NULL,
	`text_content` text,
	`type` enum('contact','preventivo','confirmation','admin_notification') NOT NULL DEFAULT 'contact',
	`status` enum('sent','failed','pending','retry') NOT NULL DEFAULT 'pending',
	`client_name` varchar(255),
	`client_email` varchar(255),
	`preventive_type` varchar(100),
	`retry_count` int NOT NULL DEFAULT 0,
	`last_error` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`sent_at` timestamp,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emails_id` PRIMARY KEY(`id`)
);
