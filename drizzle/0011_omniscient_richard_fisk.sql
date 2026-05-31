ALTER TABLE `preventives` MODIFY COLUMN `preventiveNumber` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `preventives` MODIFY COLUMN `iva` decimal(10,2) NOT NULL DEFAULT '0';--> statement-breakpoint
ALTER TABLE `preventives` MODIFY COLUMN `altri` decimal(10,2) NOT NULL DEFAULT '0';--> statement-breakpoint
ALTER TABLE `preventives` ADD `clientPhone` varchar(20);--> statement-breakpoint
ALTER TABLE `preventives` ADD `calculator` varchar(255);--> statement-breakpoint
ALTER TABLE `preventives` ADD `subtotal` decimal(10,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `preventives` ADD `total` decimal(10,2) DEFAULT '0' NOT NULL;