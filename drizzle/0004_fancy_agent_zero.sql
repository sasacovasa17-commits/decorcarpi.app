CREATE TABLE `preventive_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`preventiveId` int NOT NULL,
	`type` varchar(64) NOT NULL,
	`model` varchar(255) NOT NULL,
	`color` varchar(16),
	`room` varchar(255) NOT NULL,
	`sqm` int NOT NULL,
	`pricePerSqm` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `preventive_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `preventives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectName` varchar(255) NOT NULL,
	`preventiveNumber` int NOT NULL,
	`clientName` varchar(255),
	`clientCF` varchar(64),
	`clientAddress` varchar(255),
	`clientEmail` varchar(320),
	`description` text,
	`iva` int NOT NULL DEFAULT 0,
	`altri` int NOT NULL DEFAULT 0,
	`status` enum('draft','sent','accepted','rejected') NOT NULL DEFAULT 'draft',
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `preventives_id` PRIMARY KEY(`id`)
);
