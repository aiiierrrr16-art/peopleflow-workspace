import { createServer } from "node:http";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { basename, extname, join, normalize } from "node:path";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { networkInterfaces } from "node:os";

const root = process.cwd();
const dataRoot = process.env.PEOPLEFLOW_DATA_DIR || join(root, "PeopleFlow-Data");
const publicRoot = join(root, "out");
for (const name of ["", "resumes", "imports", "exports", "backups"]) mkdirSync(join(dataRoot, name), { recursive: true });

const db = new DatabaseSync(join(dataRoot, "peopleflow.db"));
const transaction = (work) => { db.exec("begin immediate"); try { const result = work(); db.exec("commit"); return result; } catch (error) { db.exec("rollback"); throw error; } };
db.exec(`
  pragma journal_mode = WAL;
  pragma foreign_keys = ON;
  create table if not exists users (
    id integer primary key autoincrement,
    email text not null unique collate nocase,
    password_hash text not null,
    role text not null check(role in ('pending','hr','leader')) default 'pending',
    display_name text not null default '',
    created_at text not null default current_timestamp
  );
  create table if not exists sessions (
    token text primary key,
    user_id integer not null references users(id) on delete cascade,
    expires_at text not null
  );
  create table if not exists candidates (
    id integer primary key autoincrement,
    name text not null,
    matched_position text not null default '',
    city text not null default '',
    stage text not null default '待初试',
    notes text not null default '',
    tags text not null default '[]',
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp
  );
  create table if not exists jobs (
    id integer primary key autoincrement,
    name text not null unique,
    dept text not null default '',
    color text not null default 'blue',
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp
  );
  create table if not exists departments (
    id integer primary key autoincrement,
    name text not null unique,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp
  );
  create table if not exists employees (
    id integer primary key autoincrement,
    name text not null,
    department text not null default '未分配部门',
    role text not null default '',
    joined text not null default '',
    location text not null default '',
    status text not null default '试用期',
    skills text not null default '[]',
    review text not null default '',
    manager text not null default '',
    phone text not null default '',
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp
  );
  create table if not exists app_meta (key text primary key, value text not null);
  create table if not exists showcase_snapshots (
    id integer primary key check(id=1),
    payload text not null,
    generated_at text not null default current_timestamp
  );
  create table if not exists share_records (
    token text primary key,
    title text not null,
    audience text not null,
    payload text not null,
    expires_at text,
    status text not null default 'active',
    created_at text not null default current_timestamp
  );
  create table if not exists share_feedback (
    id integer primary key autoincrement,
    share_token text not null references share_records(token) on delete cascade,
    candidate_name text not null,
    reviewer text not null default '匿名访客',
    decision text not null default '',
    comment text not null default '',
    created_at text not null default current_timestamp
  );
  create table if not exists audit_logs (
    id integer primary key autoincrement,
    user_id integer,
    action text not null,
    entity_type text not null,
    entity_id text,
    created_at text not null default current_timestamp
  );
`);
const candidateColumns = new Set(db.prepare("pragma table_info(candidates)").all().map((column) => column.name));
for (const [name, definition] of [
  ["source", "text not null default ''"],
  ["contact", "text not null default ''"],
  ["current_company", "text not null default ''"],
  ["work_years", "integer"],
  ["record_date", "text not null default ''"],
  ["next_time", "text not null default ''"],
  ["next_action", "text not null default ''"],
  ["updated_label", "text not null default ''"],
  ["meta", "text not null default ''"],
]) {
  if (!candidateColumns.has(name)) db.exec(`alter table candidates add column ${name} ${definition}`);
}
const employeeColumns = new Set(db.prepare("pragma table_info(employees)").all().map((column) => column.name));
if (!employeeColumns.has("custom_fields")) db.exec("alter table employees add column custom_fields text not null default '{}'");
db.exec(`
  create index if not exists idx_candidates_position_stage on candidates(matched_position, stage);
  create index if not exists idx_candidates_record_date on candidates(record_date);
  create index if not exists idx_employees_department_status on employees(department, status);
`);

const previewJobs = [
  ["海外销售经理", "海外事业部", "coral"], ["品牌运营", "品牌中心", "lime"], ["产品经理", "产品中心", "blue"],
];
const previewCandidates = [
  ["张晓","海外销售经理","深圳 · 8年经验",'["B2B","欧美市场","团队管理"]',"终试","2026-08-25","8月26日 14:00","今天 09:32","初试通过，待验证年度渠道规划"],
  ["邓琪","海外销售经理","深圳 · 6年经验",'["西班牙语","拉美市场","渠道"]',"Offer","2026-08-24","8月27日前确认","昨天 16:18","薪资沟通中，预计本周确认"],
  ["陈凯","海外销售经理","广州 · 7年经验",'["消费电子","欧洲","代理商"]',"可再联系","2026-08-22","11月25日提醒","8月22日 11:05","当前岗位不匹配，建议三个月后联系"],
  ["李雯","海外销售经理","杭州 · 5年经验",'["英语","北美市场","大客户"]',"初试","2026-08-25","8月26日 10:00","今天 08:40","已完成电话沟通，安排业务初试"],
  ["周航","海外销售经理","东莞 · 4年经验",'["东南亚","渠道","制造业"]',"筛选不合格","2026-08-21","8月21日 16:40","4天前","管理经验暂不满足岗位要求"],
  ["王宁","海外销售经理","厦门 · 9年经验",'["欧洲","德语","团队管理"]',"初试","2026-07-28","7月28日 15:00","7月28日","历史人才重新进入初试"],
  ["赵敏","品牌运营","上海 · 6年经验",'["DTC","内容营销","美妆"]',"Offer","2026-08-25","8月28日前确认","今天 10:15","薪资方案已发送，等待确认"],
  ["林悦","品牌运营","广州 · 4年经验",'["小红书","达人投放","美妆"]',"初试","2026-08-24","8月27日 11:00","昨天 14:20","作品集较完整，安排品牌负责人初试"],
  ["刘畅","品牌运营","深圳 · 7年经验",'["品牌策略","新品上市","团队管理"]',"终试","2026-08-19","8月26日 16:00","6天前","初试通过，等待总经理终试"],
  ["苏晴","品牌运营","杭州 · 3年经验",'["SaaS","用户增长","活动策划"]',"筛选不合格","2026-08-12","8月12日 10:35","8月12日","行业经验与当前需求偏差较大"],
  ["何佳","品牌运营","成都 · 5年经验",'["社媒","内容","生活方式"]',"可再联系","2026-06-18","10月18日提醒","6月18日","候选人暂不考虑异地机会"],
  ["蒋一凡","产品经理","北京 · 5年经验",'["AI产品","B端","数据"]',"初试","2026-08-25","8月27日 15:30","今天 11:12","产品案例匹配，等待初试"],
  ["唐可","产品经理","上海 · 8年经验",'["SaaS","商业化","团队管理"]',"终试","2026-08-23","8月28日 10:00","2天前","业务面通过，安排负责人终试"],
  ["郭洋","产品经理","深圳 · 6年经验",'["供应链","硬件","数据分析"]',"Offer","2026-08-20","8月26日前确认","5天前","背调完成，等待候选人确认"],
  ["袁菲","产品经理","武汉 · 4年经验",'["C端","增长","用户研究"]',"筛选不合格","2026-08-05","8月5日 13:50","8月5日","岗位方向暂不匹配"],
  ["高远","产品经理","苏州 · 7年经验",'["B端","制造业","项目管理"]',"可再联系","2026-05-26","9月26日提醒","5月26日","当前薪资差距较大，保留联系"],
];
const previewEmployees = [
  ["刘畅","品牌中心","品牌运营","2026-06-03","深圳","试用期",'["内容运营","活动策划"]',"试用期评价待更新","苏晴","138-0000-1001"],
  ["赵启","海外事业部","海外销售主管","2025-11-18","深圳","正式员工",'["北美渠道","团队管理"]',"2026 Q3 已完成","May","138-0000-1002"],
  ["苏晴","产品中心","产品经理","2024-08-12","上海","正式员工",'["SaaS","用户增长"]',"2026 Q3 已完成","陈总","138-0000-1003"],
  ["何睿","供应链中心","采购专员","2026-02-20","东莞","正式员工",'["供应商管理","成本分析"]',"半年评价待确认","周经理","138-0000-1004"],
  ["林悦","品牌中心","社媒运营","2025-09-08","广州","正式员工",'["小红书","达人投放"]',"2026 Q2 良好","刘畅","138-0000-1005"],
  ["唐可","产品中心","高级产品经理","2023-04-17","北京","正式员工",'["商业化","团队管理"]',"晋升评估进行中","陈总","138-0000-1006"],
];
if (!db.prepare("select value from app_meta where key='preview_seed_v2'").get()) {
  const seed = () => transaction(() => {
    const addJob = db.prepare("insert or ignore into jobs(name,dept,color) values(?,?,?)");
    for (const item of previewJobs) addJob.run(...item);
    const addCandidate = db.prepare("insert into candidates(name,matched_position,meta,tags,stage,record_date,next_time,updated_label,notes) values(?,?,?,?,?,?,?,?,?)");
    if (db.prepare("select count(*) count from candidates").get().count === 0) for (const item of previewCandidates) addCandidate.run(...item);
    const addDepartment = db.prepare("insert or ignore into departments(name) values(?)");
    for (const name of [...new Set(previewEmployees.map((item) => item[1]))]) addDepartment.run(name);
    const addEmployee = db.prepare("insert into employees(name,department,role,joined,location,status,skills,review,manager,phone) values(?,?,?,?,?,?,?,?,?,?)");
    if (db.prepare("select count(*) count from employees").get().count === 0) for (const item of previewEmployees) addEmployee.run(...item);
    db.prepare("insert into app_meta(key,value) values('preview_seed_v2','1')").run();
  });
  seed();
}

const json = (res, status, body) => {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
};
const body = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
};
const binaryBody = async (req, limit = 25 * 1024 * 1024) => {
  const chunks = []; let size = 0;
  for await (const chunk of req) { size += chunk.length; if (size > limit) throw new Error("文件超过25MB限制"); chunks.push(chunk); }
  return Buffer.concat(chunks);
};
const hashPassword = (password, salt = randomBytes(16).toString("hex")) => `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
const passwordMatches = (password, stored) => {
  const [salt, expected] = stored.split(":");
  const actual = scryptSync(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(expected, "hex"));
};
const currentUser = (req) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  return db.prepare(`select u.id,u.email,u.role,u.display_name from sessions s join users u on u.id=s.user_id where s.token=? and s.expires_at>datetime('now')`).get(token) || null;
};
const requireUser = (req, res, roles = ["hr", "leader"]) => {
  const user = currentUser(req);
  if (!user || !roles.includes(user.role)) { json(res, 403, { error: "没有访问权限" }); return null; }
  return user;
};
const candidate = (row) => ({ ...row, job: row.matched_position, date: row.record_date, time: row.next_time, nextAction: row.next_action, updated: row.updated_label, note: row.notes, tags: JSON.parse(row.tags || "[]") });
const employee = (row) => ({ ...row, dept: row.department, skills: JSON.parse(row.skills || "[]"), customFields: JSON.parse(row.custom_fields || "{}") });
const jobWithCounts = (row) => {
  const counts = db.prepare("select stage,count(*) count from candidates where matched_position=? group by stage").all(row.name);
  const count = (stage) => Number(counts.find((item) => item.stage === stage)?.count || 0);
  return { ...row, total: counts.reduce((sum, item) => sum + Number(item.count), 0), pending: count("待筛选"), initial: count("初试"), final: count("终试"), offer: count("Offer") };
};
const buildShowcase = (config = {}) => {
  const allJobs = db.prepare("select * from jobs order by id").all().map(jobWithCounts);
  const selectedJobs = Array.isArray(config.selectedJobs) && config.selectedJobs.length ? config.selectedJobs : allJobs.map((item) => item.name);
  const jobRows = allJobs.filter((item) => selectedJobs.includes(item.name));
  const selectedCandidates = Array.isArray(config.selectedCandidates) ? config.selectedCandidates.map(Number) : null;
  const candidateRows = db.prepare("select * from candidates order by id").all().map(candidate).filter((item) => selectedJobs.includes(item.job) && (!selectedCandidates || selectedCandidates.includes(Number(item.id))));
  const selectedEmployees = Array.isArray(config.selectedEmployees) ? config.selectedEmployees.map(Number) : null;
  const employeeRows = db.prepare("select * from employees where status!='离职' order by id").all().map(employee).filter((item) => !selectedEmployees || selectedEmployees.includes(Number(item.id)));
  const departmentRows = db.prepare("select department,count(*) count from employees where status!='离职' group by department order by count desc").all();
  const stages = ["待筛选", "初试", "终试", "Offer", "筛选不合格", "可再联系"];
  return {
    generatedAt: new Date().toISOString(),
    expiresAt: config.expiresAt || null,
    audience: config.audience || "领导",
    sections: { summary: true, jobs: true, stages: true, candidates: false, departments: false, employees: false, ...(config.sections || {}) },
    summary: { jobs: jobRows.length, candidates: candidateRows.length, active: candidateRows.filter((item) => ["待筛选", "初试", "终试", "Offer"].includes(item.stage)).length, offers: candidateRows.filter((item) => item.stage === "Offer").length, employees: employeeRows.length, probation: employeeRows.filter((item) => item.status === "试用期").length },
    jobs: jobRows.map((item) => ({ name: item.name, dept: item.dept, total: item.total, pending: item.pending, initial: item.initial, final: item.final, offer: item.offer })),
    stages: stages.map((name) => ({ name, count: candidateRows.filter((item) => item.stage === name).length })),
    candidates: candidateRows.map((item) => ({
      name: config.anonymizeNames === false ? item.name : `${String(item.name || "候").slice(0, 1)}某`,
      job: item.job,
      meta: item.meta,
      tags: item.tags.slice(0, 5),
      stage: item.stage,
      evaluation: item.note || "暂未填写评价",
      latestUpdate: item.updated || item.date || "暂无跟进记录",
      nextAction: item.nextAction || "待人事安排下一步",
      nextTime: item.time || "时间待定",
    })),
    departments: departmentRows.map((item) => ({ name: item.department, count: Number(item.count) })),
    employees: employeeRows.map((item) => ({ name: item.name, role: item.role, department: item.dept, status: item.status, joined: item.joined, location: item.location, skills: item.skills.slice(0, 6), review: item.review || "暂未填写周期评价", manager: item.manager || "待设置负责人" })),
  };
};
const saveShowcase = (config = {}) => {
  const durations = { "1d": 86400000, "7d": 604800000, "30d": 2592000000 };
  const expiresAt = config.expiry === "never" ? null : new Date(Date.now() + (durations[config.expiry] || durations["7d"])).toISOString();
  const snapshot = buildShowcase({ ...config, expiresAt });
  const token = randomBytes(12).toString("hex");
  db.prepare("insert into showcase_snapshots(id,payload,generated_at) values(1,?,current_timestamp) on conflict(id) do update set payload=excluded.payload,generated_at=current_timestamp").run(JSON.stringify(snapshot));
  db.prepare("insert into share_records(token,title,audience,payload,expires_at) values(?,?,?,?,?)").run(token, config.title || `${config.audience || "招聘"}分享`, config.audience || "领导", JSON.stringify(snapshot), expiresAt);
  return { snapshot, token };
};
const audit = (user, action, entityType, entityId = "") => db.prepare("insert into audit_logs(user_id,action,entity_type,entity_id) values(?,?,?,?)").run(user.id, action, entityType, String(entityId));

async function api(req, res, url) {
  if (req.method === "POST" && url.pathname === "/local-api/preview/resumes/import") {
    const requestedName = decodeURIComponent(String(req.headers["x-file-name"] || "resume.bin"));
    const safeName = basename(requestedName).replace(/[<>:"/\\|?*\x00-\x1f]/g, "_");
    const extension = extname(safeName).toLowerCase();
    if (![".pdf", ".doc", ".docx", ".xlsx", ".xls", ".csv", ".txt", ".rtf", ".png", ".jpg", ".jpeg"].includes(extension)) return json(res, 400, { error: "不支持该文件格式" });
    const bytes = await binaryBody(req);
    if (!bytes.length) return json(res, 400, { error: "文件内容为空" });
    const storedName = `${Date.now()}-${safeName}`;
    writeFileSync(join(dataRoot, "resumes", storedName), bytes);
    return json(res, 201, { ok: true, originalName: safeName, storedName, size: bytes.length });
  }
  if (req.method === "GET" && url.pathname === "/local-api/showcase") {
    const token = url.searchParams.get("token");
    const row = token ? db.prepare("select payload,status from share_records where token=?").get(token) : db.prepare("select payload,'active' status from showcase_snapshots where id=1").get();
    if (!row) return json(res, 404, { error: "该分享已停止" });
    if (row.status !== "active") return json(res, 410, { error: "该分享已停止" });
    const snapshot = JSON.parse(row.payload);
    if (snapshot.expiresAt && Date.parse(snapshot.expiresAt) < Date.now()) return json(res, 410, { error: "该分享链接已过期" });
    return json(res, 200, snapshot);
  }
  if (req.method === "POST" && url.pathname === "/local-api/showcase-feedback") {
    const input = await body(req);
    const share = db.prepare("select token,status,expires_at from share_records where token=?").get(input.token);
    if (!share || share.status !== "active") return json(res, 410, { error: "该分享已停止，无法提交评价" });
    if (share.expires_at && Date.parse(share.expires_at) < Date.now()) return json(res, 410, { error: "该分享已过期" });
    if (!String(input.comment || "").trim() && !String(input.decision || "").trim()) return json(res, 400, { error: "请填写评价结论或具体意见" });
    const result = db.prepare("insert into share_feedback(share_token,candidate_name,reviewer,decision,comment) values(?,?,?,?,?)").run(input.token, String(input.candidateName || "候选人"), String(input.reviewer || "匿名访客").trim() || "匿名访客", String(input.decision || ""), String(input.comment || "").trim());
    return json(res, 201, { id: Number(result.lastInsertRowid), ok: true });
  }
  if (req.method === "POST" && url.pathname === "/local-api/preview/showcase-snapshot") {
    const input = await body(req);
    const { snapshot, token } = saveShowcase(input);
    return json(res, 201, { ...snapshot, share: { token, url: `/showcase?share=${token}`, expiresAt: snapshot.expiresAt, active: true } });
  }
  if (req.method === "DELETE" && url.pathname === "/local-api/preview/showcase-snapshot") { const input = await body(req); if (input.token) db.prepare("update share_records set status='stopped' where token=?").run(input.token); else db.prepare("delete from showcase_snapshots where id=1").run(); return json(res, 200, { ok: true }); }
  if (req.method === "GET" && url.pathname === "/local-api/preview/share-records") return json(res, 200, db.prepare("select r.token,r.title,r.audience,r.expires_at expiresAt,r.status,r.created_at createdAt,count(f.id) feedbackCount from share_records r left join share_feedback f on f.share_token=r.token group by r.token order by r.created_at desc limit 30").all());
  const shareRecord = url.pathname.match(/^\/local-api\/preview\/share-records\/([a-f0-9]+)$/);
  if (shareRecord && req.method === "DELETE") { db.prepare("delete from share_records where token=?").run(shareRecord[1]); return json(res, 200, { ok: true }); }
  if (shareRecord && req.method === "GET") return json(res, 200, db.prepare("select id,candidate_name candidateName,reviewer,decision,comment,created_at createdAt from share_feedback where share_token=? order by created_at desc").all(shareRecord[1]));
  if (req.method === "GET" && url.pathname === "/local-api/preview/network-info") {
    const addresses = Object.values(networkInterfaces()).flat().filter((item) => item && item.family === "IPv4" && !item.internal).map((item) => item.address);
    return json(res, 200, { port: Number(process.env.PORT || 3210), addresses });
  }
  const previewSetting = url.pathname.match(/^\/local-api\/preview\/settings\/([a-z0-9_-]+)$/i);
  if (previewSetting && req.method === "GET") {
    const row = db.prepare("select value from app_meta where key=?").get(previewSetting[1]);
    return json(res, 200, row ? JSON.parse(row.value) : null);
  }
  if (previewSetting && req.method === "PUT") {
    const input = await body(req);
    db.prepare("insert into app_meta(key,value) values(?,?) on conflict(key) do update set value=excluded.value").run(previewSetting[1], JSON.stringify(input));
    return json(res, 200, input);
  }
  if (req.method === "GET" && url.pathname === "/local-api/preview/jobs") return json(res, 200, db.prepare("select * from jobs order by id").all().map(jobWithCounts));
  if (req.method === "POST" && url.pathname === "/local-api/preview/jobs") {
    const input = await body(req);
    const result = db.prepare("insert into jobs(name,dept,color) values(?,?,?)").run(String(input.name || "").trim(), input.dept || "待设置部门", input.color || "blue");
    return json(res, 201, jobWithCounts(db.prepare("select * from jobs where id=?").get(result.lastInsertRowid)));
  }
  const previewJob = url.pathname.match(/^\/local-api\/preview\/jobs\/(\d+)$/);
  if (previewJob && req.method === "PATCH") {
    const input = await body(req); const old = db.prepare("select * from jobs where id=?").get(previewJob[1]);
    transaction(() => { db.prepare("update jobs set name=?,dept=?,color=?,updated_at=current_timestamp where id=?").run(input.name, input.dept || "", input.color || "blue", previewJob[1]); if (old && old.name !== input.name) db.prepare("update candidates set matched_position=? where matched_position=?").run(input.name, old.name); });
    return json(res, 200, jobWithCounts(db.prepare("select * from jobs where id=?").get(previewJob[1])));
  }
  if (previewJob && req.method === "DELETE") { db.prepare("delete from jobs where id=?").run(previewJob[1]); return json(res, 200, { ok: true }); }

  if (req.method === "GET" && url.pathname === "/local-api/preview/candidates") return json(res, 200, db.prepare("select * from candidates order by id").all().map(candidate));
  if (req.method === "POST" && url.pathname === "/local-api/preview/candidates") {
    const input = await body(req);
    const result = db.prepare("insert into candidates(name,matched_position,meta,city,stage,notes,tags,record_date,next_time,next_action,updated_label) values(?,?,?,?,?,?,?,?,?,?,?)")
      .run(input.name, input.job || input.matched_position || "", input.meta || "", input.city || "", input.stage || "待筛选", input.note || input.notes || "", JSON.stringify(input.tags || []), input.date || "", input.time || "", input.nextAction || input.next_action || "", input.updated || "刚刚");
    return json(res, 201, candidate(db.prepare("select * from candidates where id=?").get(result.lastInsertRowid)));
  }
  const previewCandidate = url.pathname.match(/^\/local-api\/preview\/candidates\/(\d+)$/);
  if (previewCandidate && req.method === "PATCH") {
    const input = await body(req);
    db.prepare("update candidates set name=?,matched_position=?,meta=?,stage=?,notes=?,tags=?,record_date=?,next_time=?,next_action=?,updated_label=?,updated_at=current_timestamp where id=?")
      .run(input.name, input.job || input.matched_position || "", input.meta || "", input.stage || "待筛选", input.note || input.notes || "", JSON.stringify(input.tags || []), input.date || "", input.time || "", input.nextAction || input.next_action || "", input.updated || "刚刚", previewCandidate[1]);
    return json(res, 200, candidate(db.prepare("select * from candidates where id=?").get(previewCandidate[1])));
  }
  if (previewCandidate && req.method === "DELETE") { db.prepare("delete from candidates where id=?").run(previewCandidate[1]); return json(res, 200, { ok: true }); }

  if (req.method === "GET" && url.pathname === "/local-api/preview/departments") return json(res, 200, db.prepare("select * from departments order by id").all());
  if (req.method === "POST" && url.pathname === "/local-api/preview/departments") {
    const input = await body(req); const result = db.prepare("insert into departments(name) values(?)").run(String(input.name || "").trim());
    return json(res, 201, db.prepare("select * from departments where id=?").get(result.lastInsertRowid));
  }
  const previewDepartment = url.pathname.match(/^\/local-api\/preview\/departments\/(\d+)$/);
  if (previewDepartment && req.method === "PATCH") {
    const input = await body(req); const old = db.prepare("select * from departments where id=?").get(previewDepartment[1]);
    transaction(() => { db.prepare("update departments set name=?,updated_at=current_timestamp where id=?").run(input.name, previewDepartment[1]); if (old) db.prepare("update employees set department=?,updated_at=current_timestamp where department=?").run(input.name, old.name); });
    return json(res, 200, db.prepare("select * from departments where id=?").get(previewDepartment[1]));
  }
  if (previewDepartment && req.method === "DELETE") {
    const old = db.prepare("select * from departments where id=?").get(previewDepartment[1]);
    transaction(() => { db.prepare("insert or ignore into departments(name) values('未分配部门')").run(); if (old) db.prepare("update employees set department='未分配部门',updated_at=current_timestamp where department=?").run(old.name); db.prepare("delete from departments where id=?").run(previewDepartment[1]); });
    return json(res, 200, { ok: true });
  }

  if (req.method === "GET" && url.pathname === "/local-api/preview/employees") return json(res, 200, db.prepare("select * from employees order by id").all().map(employee));
  if (req.method === "POST" && url.pathname === "/local-api/preview/employees") {
    const input = await body(req); const result = db.prepare("insert into employees(name,department,role,joined,location,status,skills,review,manager,phone,custom_fields) values(?,?,?,?,?,?,?,?,?,?,?)")
      .run(input.name, input.dept || "未分配部门", input.role || "", input.joined || "", input.location || "", input.status || "试用期", JSON.stringify(input.skills || []), input.review || "", input.manager || "", input.phone || "", JSON.stringify(input.customFields || {}));
    return json(res, 201, employee(db.prepare("select * from employees where id=?").get(result.lastInsertRowid)));
  }
  const previewEmployee = url.pathname.match(/^\/local-api\/preview\/employees\/(\d+)$/);
  if (previewEmployee && req.method === "PATCH") {
    const input = await body(req); db.prepare("update employees set name=?,department=?,role=?,joined=?,location=?,status=?,skills=?,review=?,manager=?,phone=?,custom_fields=?,updated_at=current_timestamp where id=?")
      .run(input.name, input.dept || "未分配部门", input.role || "", input.joined || "", input.location || "", input.status || "试用期", JSON.stringify(input.skills || []), input.review || "", input.manager || "", input.phone || "", JSON.stringify(input.customFields || {}), previewEmployee[1]);
    return json(res, 200, employee(db.prepare("select * from employees where id=?").get(previewEmployee[1])));
  }
  if (previewEmployee && req.method === "DELETE") { db.prepare("delete from employees where id=?").run(previewEmployee[1]); return json(res, 200, { ok: true }); }

  if (req.method === "POST" && url.pathname === "/local-api/auth/signup") {
    const input = await body(req);
    if (!input.email || String(input.password || "").length < 8) return json(res, 400, { error: "邮箱无效或密码少于8位" });
    const first = db.prepare("select count(*) count from users").get().count === 0;
    try {
      const result = db.prepare("insert into users(email,password_hash,role,display_name) values(?,?,?,?)")
        .run(String(input.email).trim(), hashPassword(String(input.password)), first ? "hr" : "pending", first ? "May" : "");
      return json(res, 201, { ok: true, role: first ? "hr" : "pending", id: result.lastInsertRowid });
    } catch { return json(res, 409, { error: "该邮箱已经注册" }); }
  }
  if (req.method === "POST" && url.pathname === "/local-api/auth/login") {
    const input = await body(req);
    const user = db.prepare("select * from users where email=?").get(String(input.email || "").trim());
    if (!user || !passwordMatches(String(input.password || ""), user.password_hash)) return json(res, 401, { error: "邮箱或密码错误" });
    const token = randomBytes(32).toString("hex");
    db.prepare("insert into sessions(token,user_id,expires_at) values(?,?,datetime('now','+12 hours'))").run(token, user.id);
    return json(res, 200, { token, user: { email: user.email, role: user.role, display_name: user.display_name } });
  }
  if (req.method === "GET" && url.pathname === "/local-api/auth/me") {
    const user = currentUser(req);
    return user ? json(res, 200, { user }) : json(res, 401, { error: "未登录" });
  }
  if (req.method === "GET" && url.pathname === "/local-api/candidates") {
    if (!requireUser(req, res)) return;
    return json(res, 200, db.prepare("select * from candidates order by created_at").all().map(candidate));
  }
  if (req.method === "POST" && url.pathname === "/local-api/candidates") {
    const user = requireUser(req, res, ["hr"]); if (!user) return;
    const input = await body(req);
    const result = db.prepare("insert into candidates(name,matched_position,city,stage,notes,tags,source,contact,current_company,work_years) values(?,?,?,?,?,?,?,?,?,?)")
      .run(input.name, input.matched_position || "", input.city || "", input.stage || "待初试", input.notes || "", JSON.stringify(input.tags || []), input.source || "", input.contact || "", input.current_company || "", input.work_years || null);
    audit(user, "create", "candidate", result.lastInsertRowid);
    return json(res, 201, candidate(db.prepare("select * from candidates where id=?").get(result.lastInsertRowid)));
  }
  const match = url.pathname.match(/^\/local-api\/candidates\/(\d+)$/);
  if (match && req.method === "PATCH") {
    const user = requireUser(req, res, ["hr"]); if (!user) return;
    const input = await body(req);
    db.prepare("update candidates set name=?,matched_position=?,city=?,stage=?,notes=?,tags=?,source=?,contact=?,current_company=?,work_years=?,updated_at=current_timestamp where id=?")
      .run(input.name, input.matched_position || "", input.city || "", input.stage || "待初试", input.notes || "", JSON.stringify(input.tags || []), input.source || "", input.contact || "", input.current_company || "", input.work_years || null, match[1]);
    audit(user, "update", "candidate", match[1]);
    return json(res, 200, candidate(db.prepare("select * from candidates where id=?").get(match[1])));
  }
  if (match && req.method === "DELETE") {
    const user = requireUser(req, res, ["hr"]); if (!user) return;
    db.prepare("delete from candidates where id=?").run(match[1]); audit(user, "delete", "candidate", match[1]);
    return json(res, 200, { ok: true });
  }
  return json(res, 404, { error: "接口不存在" });
}

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".wasm": "application/wasm",
  ".gz": "application/gzip",
};
createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    if (url.pathname.startsWith("/local-api/")) return await api(req, res, url);
    const requested = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    const file = normalize(join(publicRoot, requested));
    const htmlFile = `${file}.html`;
    const directoryIndex = join(file, "index.html");
    const target = file.startsWith(publicRoot) && existsSync(file) && !extname(file)
      ? (existsSync(directoryIndex) ? directoryIndex : existsSync(htmlFile) ? htmlFile : join(publicRoot, "index.html"))
      : file.startsWith(publicRoot) && existsSync(file)
        ? file
        : file.startsWith(publicRoot) && existsSync(htmlFile)
          ? htmlFile
          : join(publicRoot, "index.html");
    res.writeHead(200, { "content-type": mime[extname(target)] || "application/octet-stream" });
    res.end(readFileSync(target));
  } catch (error) { json(res, 500, { error: error instanceof Error ? error.message : "服务器错误" }); }
}).listen(Number(process.env.PORT || 3210), "0.0.0.0", () => {
  console.log(`PeopleFlow 本地私有版已启动: http://localhost:${process.env.PORT || 3210}`);
  console.log(`数据目录: ${dataRoot}`);
});
