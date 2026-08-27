import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const candidates = sqliteTable("candidates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  role: text("role").notNull(),
  city: text("city").notNull().default(""),
  stage: text("stage").notNull().default("待初试"),
  history: text("history").notNull().default("暂无面试"),
  tags: text("tags").notNull().default("[]"),
  touch: text("touch").notNull().default("刚刚"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
