CREATE TABLE `session_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`generationsUsed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `session_usage_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_usage_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
DROP TABLE `credits`;--> statement-breakpoint
DROP TABLE `payments`;