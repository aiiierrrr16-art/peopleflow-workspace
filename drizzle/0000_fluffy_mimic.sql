CREATE TABLE `candidates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`stage` text DEFAULT '待初试' NOT NULL,
	`history` text DEFAULT '暂无面试' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`touch` text DEFAULT '刚刚' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
