CREATE TABLE `promo_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(64) NOT NULL,
	`generationsLimit` int NOT NULL,
	`generationsUsed` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`createdBy` int,
	`notes` text,
	CONSTRAINT `promo_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `promo_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `session_promo_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`promoCodeId` int NOT NULL,
	`generationsRemaining` int NOT NULL,
	`appliedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `session_promo_codes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `promo_codes` ADD CONSTRAINT `promo_codes_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_promo_codes` ADD CONSTRAINT `session_promo_codes_promoCodeId_promo_codes_id_fk` FOREIGN KEY (`promoCodeId`) REFERENCES `promo_codes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_promo_codes_code` ON `promo_codes` (`code`);--> statement-breakpoint
CREATE INDEX `idx_promo_codes_isActive` ON `promo_codes` (`isActive`);--> statement-breakpoint
CREATE INDEX `idx_session_promo_codes_sessionId` ON `session_promo_codes` (`sessionId`);--> statement-breakpoint
CREATE INDEX `idx_session_promo_codes_promoCodeId` ON `session_promo_codes` (`promoCodeId`);