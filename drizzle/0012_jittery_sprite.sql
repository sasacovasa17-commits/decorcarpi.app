ALTER TABLE `preventives` MODIFY COLUMN `subtotal` float NOT NULL;--> statement-breakpoint
ALTER TABLE `preventives` MODIFY COLUMN `subtotal` float NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `preventives` MODIFY COLUMN `iva` float NOT NULL;--> statement-breakpoint
ALTER TABLE `preventives` MODIFY COLUMN `iva` float NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `preventives` MODIFY COLUMN `altri` float NOT NULL;--> statement-breakpoint
ALTER TABLE `preventives` MODIFY COLUMN `altri` float NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `preventives` MODIFY COLUMN `total` float NOT NULL;--> statement-breakpoint
ALTER TABLE `preventives` MODIFY COLUMN `total` float NOT NULL DEFAULT 0;