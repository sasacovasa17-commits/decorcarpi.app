CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`originalImageUrl` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `renders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`textureId` varchar(64) NOT NULL,
	`colorHex` varchar(16),
	`intensity` int DEFAULT 80,
	`resultImageUrl` text NOT NULL,
	`prompt` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `renders_id` PRIMARY KEY(`id`)
);
