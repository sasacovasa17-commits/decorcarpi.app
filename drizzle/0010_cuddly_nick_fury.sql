CREATE TABLE `ai_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128),
	`userId` int,
	`modelUsed` varchar(64) NOT NULL,
	`costEstimated` int NOT NULL,
	`status` enum('success','failed') NOT NULL DEFAULT 'success',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ai_usage` ADD CONSTRAINT `ai_usage_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_ai_usage_sessionId` ON `ai_usage` (`sessionId`);--> statement-breakpoint
CREATE INDEX `idx_ai_usage_userId` ON `ai_usage` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_ai_usage_createdAt` ON `ai_usage` (`createdAt`);