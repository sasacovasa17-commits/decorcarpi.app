ALTER TABLE `preventive_items` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `preventives` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `projects` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `renders` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_sessionId_unique` UNIQUE(`sessionId`);--> statement-breakpoint
ALTER TABLE `preventive_items` ADD CONSTRAINT `preventive_items_preventiveId_preventives_id_fk` FOREIGN KEY (`preventiveId`) REFERENCES `preventives`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `preventives` ADD CONSTRAINT `preventives_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `renders` ADD CONSTRAINT `renders_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_preventive_items_preventiveId` ON `preventive_items` (`preventiveId`);--> statement-breakpoint
CREATE INDEX `idx_preventives_userId` ON `preventives` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_preventives_status` ON `preventives` (`status`);--> statement-breakpoint
CREATE INDEX `idx_projects_sessionId` ON `projects` (`sessionId`);--> statement-breakpoint
CREATE INDEX `idx_renders_projectId` ON `renders` (`projectId`);