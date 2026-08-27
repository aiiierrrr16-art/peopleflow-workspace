import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const release = join(root, "release", "PeopleFlow-Workspace-Local");
rmSync(release, { recursive: true, force: true });
mkdirSync(release, { recursive: true });

for (const item of ["out", "local"]) {
  cpSync(join(root, item), join(release, item), { recursive: true });
}
const samples = join(root, "samples");
if (existsSync(samples)) cpSync(samples, join(release, "测试资料"), { recursive: true });
for (const item of ["启动本地工作台.cmd", "备份本地数据.cmd"]) {
  const windowsText = readFileSync(join(root, item), "utf8").replace(/\r?\n/g, "\r\n");
  writeFileSync(join(release, item), windowsText, "utf8");
}
mkdirSync(join(release, "runtime"), { recursive: true });
cpSync(process.execPath, join(release, "runtime", "node.exe"));
for (const folder of ["resumes", "imports", "exports", "backups"]) mkdirSync(join(release, "PeopleFlow-Data", folder), { recursive: true });
writeFileSync(join(release, "使用说明.txt"), [
  "PeopleFlow Workspace - 本地私有版",
  "",
  "1. 解压后，将整个 PeopleFlow-Workspace-Local 文件夹放到人事电脑的固定位置。",
  "2. 双击 启动本地工作台.cmd。",
  "3. 浏览器会打开 http://localhost:3210/preview。",
  "4. 第一个注册账号自动成为人事管理员。",
  "5. 使用时请保持黑色启动窗口开启。",
  "6. 岗位、候选人、面试流程、部门和员工档案保存在 PeopleFlow-Data\\peopleflow.db，请定期备份。",
  "7. 不要只复制启动脚本，必须复制完整文件夹。",
  "8. 测试资料文件夹内提供虚拟简历，可用于验证拖入、识别、编辑和保存流程。",
].join("\r\n"), "utf8");
console.log(`便携包已生成：${release}`);
