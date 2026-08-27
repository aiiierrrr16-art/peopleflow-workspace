import { DatabaseSync, backup } from "node:sqlite";
import { mkdirSync, existsSync, cpSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dataRoot = process.env.PEOPLEFLOW_DATA_DIR || join(root, "PeopleFlow-Data");
const stamp = new Date().toISOString().replaceAll(":", "-").replace("T", "_").slice(0, 19);
const target = join(dataRoot, "backups", stamp);
mkdirSync(target, { recursive: true });

const sourcePath = join(dataRoot, "peopleflow.db");
if (existsSync(sourcePath)) {
  const database = new DatabaseSync(sourcePath, { readOnly: true });
  await backup(database, join(target, "peopleflow.db"));
  database.close();
}
for (const folder of ["resumes", "imports", "exports"]) {
  const source = join(dataRoot, folder);
  if (existsSync(source)) cpSync(source, join(target, folder), { recursive: true });
}
console.log(`备份完成：${target}`);
