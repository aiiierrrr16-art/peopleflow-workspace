"use client";
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { localApi } from "../lib/local-api";

const localMode = process.env.NEXT_PUBLIC_PEOPLEFLOW_MODE === "local";
type AppSession = Session | { user: { email?: string } };

const nav = [
  "本周工作台",
  "人才库",
  "面试记录",
  "员工档案",
  "飞书导入",
  "权限设置",
];
const icons = ["◫", "◎", "◉", "▤", "↗", "⌾"];
const seed = [
  {
    name: "张晓",
    role: "海外销售经理",
    city: "深圳",
    stage: "待终试",
    history: "初试通过",
    tags: ["B2B", "欧美市场", "团队管理"],
    touch: "今天",
  },
  {
    name: "李雯",
    role: "产品经理",
    city: "上海",
    stage: "待初试",
    history: "暂无面试",
    tags: ["SaaS", "增长", "英语"],
    touch: "本周一",
  },
  {
    name: "陈凯",
    role: "海外销售经理",
    city: "广州",
    stage: "已归档",
    history: "终试未通过",
    tags: ["渠道", "欧洲", "消费电子"],
    touch: "本周二",
  },
  {
    name: "赵敏",
    role: "品牌运营",
    city: "杭州",
    stage: "拟录用",
    history: "终试通过",
    tags: ["DTC", "内容", "美妆"],
    touch: "本周三",
  },
  {
    name: "蒋一凡",
    role: "产品经理",
    city: "上海",
    stage: "待终试",
    history: "初试通过",
    tags: ["AI产品", "商业化", "数据"],
    touch: "本周三",
  },
  {
    name: "邓琪",
    role: "海外销售经理",
    city: "深圳",
    stage: "拟录用",
    history: "终试通过",
    tags: ["拉美市场", "西班牙语", "渠道"],
    touch: "本周四",
  },
];
type Candidate = {
  id?: string;
  name: string;
  role: string;
  city: string;
  stage: string;
  history: string;
  tags: string[];
  touch: string;
  source?: string;
  contact?: string;
  currentCompany?: string;
  workYears?: string;
};

const presentCandidate = (row: Record<string, unknown>): Candidate => ({
  id: String(row.id),
  name: String(row.name ?? ""),
  role: String(row.matched_position ?? ""),
  city: String(row.city ?? ""),
  stage: String(row.stage ?? "待初试"),
  history: String(row.notes || "暂无面试"),
  tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
  touch: row.updated_at ? new Date(String(row.updated_at)).toLocaleDateString("zh-CN") : "刚刚",
  source: String(row.source ?? ""),
  contact: String(row.contact ?? ""),
  currentCompany: String(row.current_company ?? ""),
  workYears: row.work_years ? `${row.work_years}年` : "",
});

export default function Home() {
  const [session, setSession] = useState<AppSession | null>(null);
  const [checking, setChecking] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (localMode) {
      localApi.me().then(({ user }) => { setSession({ user }); setRole(user.role); }).catch(() => setSession(null)).finally(() => setChecking(false));
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setChecking(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (localMode) return;
    if (!session) { setRole(null); return; }
    supabase.from("profiles").select("role").eq("id", (session as Session).user.id).single()
      .then(({ data }) => setRole(data?.role ?? "pending"));
  }, [session]);

  if (!localMode && !supabaseConfigured) return <AuthMessage title="尚未配置数据库" detail="请联系系统管理员完成 Supabase 连接。" />;
  if (checking) return <AuthMessage title="正在验证访问身份" detail="请稍候…" />;
  if (!session) return <Login />;
  if (!role) return <AuthMessage title="正在读取权限" detail="请稍候…" />;
  if (role === "pending") return <AuthMessage title="账号等待授权" detail="管理员批准为人事或领导后即可进入。" action={() => { if (localMode) { localApi.logout(); window.location.reload(); } else supabase.auth.signOut(); }} actionLabel="退出登录" />;

  return <Workspace userEmail={session.user.email ?? "已授权成员"} role={role} />;
}

function Workspace({ userEmail, role }: { userEmail: string; role: string }) {
  const [page, setPage] = useState(nav[0]);
  const [search, setSearch] = useState(false);
  const [toast, setToast] = useState("");
  const notify = (s: string) => {
    setToast(s);
    window.setTimeout(() => setToast(""), 2400);
  };
  return (
    <main className="private-shell">
      <aside>
        <div className="brand">
          <span>PF</span>
          <div>
            <strong>PeopleFlow</strong>
            <small>通用人事工作台</small>
          </div>
        </div>
        <div className="secure">
          <i>●</i>
          <span>
            内部受限空间<small>仅授权成员可访问</small>
          </span>
        </div>
        <nav>
          {nav.map((x, i) => (
            <button
              key={x}
              className={page === x ? "active" : ""}
              onClick={() => setPage(x)}
            >
              <b>{icons[i]}</b>
              {x}
            </button>
          ))}
        </nav>
        <footer>
          <span className="avatar">M</span>
          <div>
            <strong>{userEmail}</strong>
            <small>{role === "leader" ? "领导（只读）" : "May"}</small>
          </div>
          <button aria-label="账号与权限" onClick={() => setPage("权限设置")}>···</button>
        </footer>
      </aside>
      <section className="content">
        <header>
          <div>
            <p>人才与员工资料中心</p>
            <h1>{page}</h1>
          </div>
          <div className="head-actions">
            <button onClick={() => setSearch(true)}>搜索</button>
            <button className="primary" onClick={() => setPage("飞书导入")}>
              ＋ 本周录入
            </button>
          </div>
        </header>
        {page === "本周工作台" && <Week go={setPage} />}{" "}
        {page === "人才库" && <Pool go={setPage} notify={notify} />}{" "}
        {page === "面试记录" && <Interviews notify={notify} />}{" "}
        {page === "员工档案" && <Employees notify={notify} />}{" "}
        {page === "飞书导入" && <Importer notify={notify} />}{" "}
        {page === "权限设置" && <Permissions />}
      </section>
      {toast && <div className="prototype-toast">✓ {toast}</div>}
      {search && (
        <Modal
          title="搜索工作台"
          eyebrow="全局查找"
          close={() => setSearch(false)}
        >
          <input
            className="modal-search"
            autoFocus
            placeholder="搜索候选人、员工或功能"
          />
          <div className="search-links">
            {[
              ["张晓 · 海外销售经理", "人才库"],
              ["陈凯 · 终试未通过", "面试记录"],
              ["刘畅 · 品牌运营", "员工档案"],
              ["本周飞书资料导入", "飞书导入"],
            ].map((x) => (
              <button
                key={x[0]}
                onClick={() => {
                  setPage(x[1]);
                  setSearch(false);
                }}
              >
                <span>{x[0]}</span>
                <em>{x[1]} →</em>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </main>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage("");
    if (localMode) {
      try {
        if (mode === "login") { await localApi.login(email, password); window.location.reload(); }
        else { const result = await localApi.signup(email, password); setMessage(result.role === "hr" ? "首个账号已创建，将作为人事管理员。请返回登录。" : "账号已创建，等待管理员授权。"); }
      } catch (error) { setMessage(error instanceof Error ? error.message : "操作失败"); }
      setBusy(false); return;
    }
    const result = mode === "login" ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
    if (result.error) setMessage(result.error.message);
    else if (mode === "signup") setMessage("账号已创建，请查收验证邮件。验证后还需管理员授权。 ");
    setBusy(false);
  };
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-mark">TF</div>
        <span>PeopleFlow · 私有招聘工作台</span>
        <h1>{mode === "login" ? "登录工作台" : "申请使用账号"}</h1>
        <p>候选人、面试记录和员工档案仅对授权成员开放。</p>
        <form onSubmit={submit}>
          <label>工作邮箱<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@company.com" /></label>
          <label>密码<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="至少 8 位" /></label>
          {message && <div className="auth-message">{message}</div>}
          <button className="primary" disabled={busy}>{busy ? "请稍候…" : mode === "login" ? "登录" : "创建账号"}</button>
        </form>
        <button className="auth-switch" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>
          {mode === "login" ? "第一次使用？申请账号" : "已有账号？返回登录"}
        </button>
      </section>
    </main>
  );
}

function AuthMessage({ title, detail, action, actionLabel }: { title: string; detail: string; action?: () => void; actionLabel?: string }) {
  return <main className="auth-shell"><section className="auth-card"><div className="auth-mark">TF</div><h1>{title}</h1><p>{detail}</p>{action && <button className="primary" onClick={action}>{actionLabel}</button>}</section></main>;
}

function Week({ go }: { go: (s: string) => void }) {
  return (
    <div className="week">
      <section className="welcome">
        <div>
          <span>2026年第34周 · 8月17日—23日</span>
          <h2>本周资料维护，还有 9 项需要补齐。</h2>
          <p>先完成飞书资料导入，再补充面试结果与员工评价。</p>
        </div>
        <button onClick={() => go("飞书导入")}>开始本周录入 →</button>
      </section>
      <section className="metrics">
        {[
          ["本周新简历", "18", "已整理 15"],
          ["待补面试记录", "4", "初试 3 · 终试 1"],
          ["缺少结果原因", "3", "需要补充"],
          ["待更新员工评价", "2", "本周到期"],
        ].map((m, i) => (
          <article key={m[0]}>
            <i>{["↥", "◉", "!", "▤"][i]}</i>
            <span>{m[0]}</span>
            <b>{m[1]}</b>
            <small>{m[2]}</small>
          </article>
        ))}
      </section>
      <section className="two-col">
        <div className="panel">
          <Title eyebrow="本周流程" title="资料完成情况" />
          <div className="progress-list">
            <Progress label="飞书资料导入" done="18 / 18" width="100%" />
            <Progress label="简历标记与岗位匹配" done="15 / 18" width="83%" />
            <Progress label="初试与终试记录" done="9 / 13" width="69%" />
            <Progress label="结果原因完整" done="10 / 13" width="77%" />
          </div>
        </div>
        <div className="panel action-panel">
          <Title eyebrow="建议先做" title="待处理事项" />
          {[
            ["补充陈凯终试未通过原因", "面试记录"],
            ["为3份新简历匹配招聘岗位", "人才库"],
            ["更新刘畅试用期评价", "员工档案"],
          ].map((x) => (
            <button className="task" key={x[0]} onClick={() => go(x[1])}>
              <i>□</i>
              <span>
                <b>{x[0]}</b>
                <small>{x[1]}</small>
              </span>
              <em>→</em>
            </button>
          ))}
        </div>
      </section>
      <section className="panel">
        <Title
          eyebrow="最新变化"
          title="本周人才动态"
          action="查看人才库"
          onAction={() => go("人才库")}
        />
        <div className="mini-table">
          <div className="table-head">
            <span>候选人</span>
            <span>匹配岗位</span>
            <span>本周记录</span>
            <span>当前状态</span>
          </div>
          {seed.slice(0, 4).map((c, i) => (
            <div className="table-row" key={c.name}>
              <span>
                <i className={`face f${i}`}>{c.name[0]}</i>
                <b>{c.name}</b>
              </span>
              <span>{c.role}</span>
              <span>{c.history}</span>
              <span>
                <em>{c.stage}</em>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Pool({
  go,
  notify,
}: {
  go: (s: string) => void;
  notify: (s: string) => void;
}) {
  const [items, setItems] = useState<Candidate[]>(seed);
  useEffect(() => {
    if (localMode) {
      localApi.candidates().then((data) => { if (data?.length) setItems(data.map(presentCandidate)); }).catch(() => undefined);
      return;
    }
    supabase.from("candidates").select("*").order("created_at", { ascending: true })
      .then(({ data }) => { if (data?.length) setItems(data.map(presentCandidate)); });
  }, []);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("全部岗位");
  const [stage, setStage] = useState("全部状态");
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [dialog, setDialog] = useState("");
  const list = useMemo(
    () =>
      items.filter(
        (x) =>
          `${x.name}${x.role}${x.city}${x.tags}`.includes(q) &&
          (role === "全部岗位" || x.role === role) &&
          (stage === "全部状态" || x.stage === stage),
      ),
    [items, q, role, stage],
  );
  const saveNew = async () => {
    const name = document.querySelector<HTMLInputElement>("#candidate-name-input")?.value.trim() || "周宁";
    const city = document.querySelector<HTMLInputElement>("#candidate-city-input")?.value.trim() || "苏州";
    const stageValue = document.querySelector<HTMLSelectElement>("#candidate-stage-input")?.value || "待初试";
    const tagsValue = document.querySelector<HTMLInputElement>("#candidate-tags-input")?.value || "B2B、英语";
    const customRole = document.querySelector<HTMLInputElement>(
      "#candidate-role-input",
    )?.value;
    const draft = { name, role: customRole?.trim() || "海外销售经理", city, stage: stageValue, history: "暂无面试", tags: tagsValue.split(/[、,，]/).filter(Boolean), touch: "刚刚" };
    try {
      const payload = {
        name: draft.name, matched_position: draft.role, city: draft.city,
        stage: draft.stage, notes: draft.history, tags: draft.tags,
      };
      let data;
      if (localMode) data = await localApi.createCandidate(payload);
      else {
        const result = await supabase.from("candidates").insert(payload).select().single();
        if (result.error) throw result.error;
        data = result.data;
      }
      setItems([...items, presentCandidate(data)]); setDialog(""); notify(`候选人${name}已永久保存`);
    } catch { notify("数据库尚未启用，暂时无法永久保存"); }
  };
  return (
    <>
      <div className="panel full">
        <div className="page-title">
          <div>
            <span>长期人才资产</span>
            <h2>候选人档案</h2>
            <p>简历、岗位匹配和历次面试都围绕同一个人持续积累。</p>
          </div>
          <button className="primary" onClick={() => setDialog("new")}>
            ＋ 新建候选人
          </button>
        </div>
        <div className="filters">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索姓名、岗位、城市或标签"
          />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option>全部岗位</option>
            <option>海外销售经理</option>
            <option>产品经理</option>
            <option>品牌运营</option>
          </select>
          <select value={stage} onChange={(e) => setStage(e.target.value)}>
            <option>全部状态</option>
            <option>待初试</option>
            <option>待终试</option>
            <option>拟录用</option>
            <option>已归档</option>
          </select>
        </div>
        <div className="candidate-list">
          {list.map((c, i) => (
            <article key={c.name}>
              <div className="candidate-top">
                <i className={`face f${i}`}>{c.name[0]}</i>
                <div>
                  <h3>{c.name}</h3>
                  <p>
                    {c.role} · {c.city}
                  </p>
                </div>
                <em>{c.stage}</em>
              </div>
              <div className="tags">
                {c.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="history">
                <span>最近面试</span>
                <b>{c.history}</b>
              </div>
              <footer>
                <span>{c.touch}更新</span>
                <button onClick={() => setSelected(c)}>打开完整档案 →</button>
              </footer>
            </article>
          ))}
        </div>
      </div>
      {selected && (
        <div className="overlay" onMouseDown={() => setSelected(null)}>
          <section className="drawer" onMouseDown={(e) => e.stopPropagation()}>
            <header>
              <button onClick={() => setSelected(null)}>← 返回人才库</button>
              <span>{selected.stage}</span>
            </header>
            <div className="profile-head">
              <i className="face large">{selected.name[0]}</i>
              <div>
                <h2>{selected.name}</h2>
                <p>
                  {selected.role} · {selected.city}
                </p>
              </div>
              <button onClick={() => setDialog("resume")}>查看原始简历</button>
            </div>
            <div className="profile-grid">
              <article>
                <small>工作年限</small>
                <b>{selected.workYears || "未填写"}</b>
              </article>
              <article>
                <small>当前公司</small>
                <b>{selected.currentCompany || "未填写"}</b>
              </article>
              <article>
                <small>人才来源</small>
                <b>{selected.source || "未填写"}</b>
              </article>
            </div>
            <div className="detail-block">
              <h3>人才标签</h3>
              <div className="tags">
                {selected.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
            <div className="detail-block">
              <h3>岗位匹配历史</h3>
              <div className="timeline">
                <div>
                  <i />
                  <span>2026.08.18</span>
                  <b>匹配 {selected.role}</b>
                  <p>岗位能力与行业经验基本匹配</p>
                </div>
                <div>
                  <i />
                  <span>2026.08.20</span>
                  <b>{selected.history}</b>
                  <p>沟通清晰，建议在下一轮验证业务案例</p>
                </div>
              </div>
            </div>
            <div className="drawer-actions">
              <button
                className="danger"
                onClick={async () => {
                  if (!window.confirm(`确定删除${selected.name}的候选人档案吗？删除后无法恢复。`)) return;
                  if (selected.id) {
                    try {
                      if (localMode) await localApi.deleteCandidate(selected.id);
                      else {
                        const { error } = await supabase.from("candidates").delete().eq("id", selected.id);
                        if (error) throw error;
                      }
                    } catch { notify("删除失败，请稍后重试"); return; }
                  }
                  setItems(items.filter((item) => item.id ? item.id !== selected.id : item.name !== selected.name));
                  setSelected(null);
                  notify(`${selected.name}的候选人档案已删除`);
                }}
              >
                删除档案
              </button>
              <button onClick={() => setDialog("edit")}>编辑档案</button>
              <button
                className="primary"
                onClick={() => {
                  setSelected(null);
                  go("面试记录");
                }}
              >
                录入下一轮面试
              </button>
            </div>
          </section>
        </div>
      )}
      {dialog === "new" && (
        <Modal
          title="新建候选人"
          eyebrow="人才库录入"
          close={() => setDialog("")}
        >
          <CandidateForm />
          <Actions
            close={() => setDialog("")}
            save={saveNew}
            label="保存候选人"
          />
        </Modal>
      )}
      {dialog === "edit" && selected && (
        <Modal
          title={`编辑${selected.name}的档案`}
          eyebrow="更新候选人"
          close={() => setDialog("")}
        >
          <CandidateForm c={selected} />
          <Actions
            close={() => setDialog("")}
            save={async () => {
              if (!selected.id) { setDialog(""); notify("示例候选人尚未写入数据库"); return; }
              try {
                const payload = {
                  name: selected.name, matched_position: selected.role, city: selected.city,
                  stage: selected.stage, notes: selected.history, tags: selected.tags,
                  updated_at: new Date().toISOString(),
                };
                let data;
                if (localMode) data = await localApi.updateCandidate(selected.id, payload);
                else {
                  const result = await supabase.from("candidates").update(payload).eq("id", selected.id).select().single();
                  if (result.error) throw result.error;
                  data = result.data;
                }
                const saved = presentCandidate(data);
                setItems(items.map((item) => item.id === selected.id ? saved : item)); setSelected(saved); setDialog(""); notify("候选人档案已永久更新");
              } catch { notify("数据库更新失败，请稍后重试"); }
            }}
            label="保存修改"
          />
        </Modal>
      )}
      {dialog === "resume" && selected && (
        <Modal
          title={`${selected.name}的原始简历`}
          eyebrow="简历预览"
          close={() => setDialog("")}
        >
          <Info
            rows={[
              ["应聘岗位", selected.role],
              ["工作经历", "星瀚科技｜8年相关经验"],
              ["核心能力", selected.tags.join(" · ")],
            ]}
          />
          <Actions
            close={() => setDialog("")}
            save={() => notify("简历已进入导出队列（演示）")}
            label="导出PDF"
          />
        </Modal>
      )}
    </>
  );
}

const records = [
  {
    name: "张晓",
    role: "海外销售经理",
    round: "初试",
    result: "通过",
    reason: "欧美渠道经验完整，英语沟通符合岗位要求",
    next: "待终试",
  },
  {
    name: "陈凯",
    role: "海外销售经理",
    round: "终试",
    result: "未通过",
    reason: "团队管理案例不足；保留至高级销售人才池",
    next: "已归档",
  },
  {
    name: "赵敏",
    role: "品牌运营",
    round: "终试",
    result: "通过",
    reason: "DTC品牌增长经验与岗位高度匹配",
    next: "拟录用",
  },
  {
    name: "蒋一凡",
    role: "产品经理",
    round: "初试",
    result: "通过",
    reason: "AI产品商业化经验清晰，建议终试验证团队协作",
    next: "待终试",
  },
];
function Interviews({ notify }: { notify: (s: string) => void }) {
  const [items, setItems] = useState(records);
  const [form, setForm] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  return (
    <>
      <div className="panel full">
        <div className="page-title">
          <div>
            <span>过程完整留痕</span>
            <h2>初试与终试记录</h2>
            <p>每次岗位匹配拥有独立记录，不覆盖候选人的历史经历。</p>
          </div>
          <button className="primary" onClick={() => setForm(true)}>
            ＋ 录入面试结果
          </button>
        </div>
        <div className="record-list">
          {items.map((r) => (
            <article className="record" key={r.name}>
              <span className="face">{r.name[0]}</span>
              <div className="record-person">
                <h3>{r.name}</h3>
                <p>{r.role}</p>
              </div>
              <div>
                <small>面试轮次</small>
                <b>{r.round}</b>
              </div>
              <div>
                <small>结果</small>
                <b className={r.result === "未通过" ? "red" : "green"}>
                  {r.result}
                </b>
              </div>
              <div className="record-reason">
                <small>评价与原因</small>
                <p>{r.reason}</p>
              </div>
              <em>{r.next}</em>
              <button onClick={() => setDetail(r)}>查看记录</button>
            </article>
          ))}
        </div>
      </div>
      {form && (
        <InterviewForm
          close={() => setForm(false)}
          save={() => {
            setForm(false);
            notify("面试记录已保存（演示数据）");
          }}
        />
      )}
      {detail && (
        <Modal
          title={`${detail.name}的${detail.round}记录`}
          eyebrow="面试详情"
          close={() => setDetail(null)}
        >
          <Info
            rows={[
              ["匹配岗位", detail.role],
              ["结果", `${detail.result} · ${detail.next}`],
              ["评价与原因", detail.reason],
            ]}
          />
          <button
            className="danger block"
            onClick={() => {
              if (!window.confirm(`确定删除${detail.name}的${detail.round}记录吗？删除后无法恢复。`)) return;
              setItems(items.filter((item) => item !== detail));
              setDetail(null);
              notify(`${detail.name}的面试记录已删除（演示数据）`);
            }}
          >
            删除面试记录
          </button>
          <Actions
            close={() => setDetail(null)}
            save={() => {
              setDetail(null);
              setForm(true);
            }}
            label="继续编辑"
          />
        </Modal>
      )}
    </>
  );
}

function Employees({ notify }: { notify: (s: string) => void }) {
  const [convert, setConvert] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState<Record<string, string>>({});
  const [deleted, setDeleted] = useState<string[]>([]);
  const people = [
    {
      name: "刘畅",
      role: "品牌运营",
      dept: "品牌中心",
      date: "2026-06-03",
      review: "试用期评价待更新",
      skill: "内容运营 · 活动策划",
    },
    ...(added
      ? [
          {
            name: "赵敏",
            role: "品牌运营",
            dept: "品牌中心",
            date: "2026-09-01",
            review: "等待首次评价",
            skill: "DTC · 内容增长",
          },
        ]
      : []),
    {
      name: "赵启",
      role: "海外销售主管",
      dept: "海外事业部",
      date: "2025-11-18",
      review: "2026 Q3 已完成",
      skill: "北美渠道 · 团队管理",
    },
    {
      name: "苏晴",
      role: "产品经理",
      dept: "产品中心",
      date: "2024-08-12",
      review: "2026 Q3 已完成",
      skill: "SaaS · 用户增长",
    },
  ].filter((p) => !deleted.includes(p.name)).map((p) => ({ ...p, review: reviews[p.name] || p.review }));
  const saveReview = () => {
    if (!detail) return;
    const input = document.querySelector<HTMLInputElement>("#review-period");
    setReviews({
      ...reviews,
      [detail.name]: `${input?.value || "2026 Q3"} 已完成`,
    });
    setEditing(false);
    setDetail(null);
    notify(`${detail.name}的评价已保存（演示数据）`);
  };
  return (
    <>
      <div className="privacy-note">
        <span>⌾</span>
        <div>
          <b>员工档案属于受限资料</b>
          <p>当前页面展示模拟信息；正式版将根据角色限制查看、修改和导出。</p>
        </div>
      </div>
      <div className="panel full">
        <div className="page-title">
          <div>
            <span>从入职持续积累</span>
            <h2>员工档案</h2>
            <p>保留入职岗位、能力记录和每个周期的评价。</p>
          </div>
          <button className="primary" onClick={() => setConvert(true)}>
            候选人转为员工
          </button>
        </div>
        <div className="employees">
          {people.map((p) => (
            <article className="employee" key={p.name}>
              <header>
                <span className="face">{p.name[0]}</span>
                <div>
                  <h3>{p.name}</h3>
                  <p>
                    {p.role} · {p.dept}
                  </p>
                </div>
                <button onClick={() => setDetail(p)}>···</button>
              </header>
              <dl>
                <div>
                  <dt>入职时间</dt>
                  <dd>{p.date}</dd>
                </div>
                <div>
                  <dt>能力档案</dt>
                  <dd>{p.skill}</dd>
                </div>
                <div>
                  <dt>最近评价</dt>
                  <dd>{p.review}</dd>
                </div>
              </dl>
              <footer>
                <button onClick={() => setDetail(p)}>查看完整档案 →</button>
              </footer>
            </article>
          ))}
        </div>
      </div>
      {convert && (
        <Modal
          title="确认候选人入职"
          eyebrow="从招聘档案创建"
          close={() => setConvert(false)}
        >
          <Info
            rows={[
              ["候选人", "赵敏"],
              ["入职日期", "2026-09-01"],
              ["部门与岗位", "品牌中心 · 品牌运营"],
            ]}
          />
          <Actions
            close={() => setConvert(false)}
            save={() => {
              setConvert(false);
              setAdded(true);
              notify("赵敏已创建员工档案（演示数据）");
            }}
            label="确认并创建"
          />
        </Modal>
      )}
      {detail && !editing && (
        <Modal
          title={`${detail.name}的员工档案`}
          eyebrow="受限资料"
          close={() => setDetail(null)}
        >
          <Info
            rows={[
              ["岗位与部门", `${detail.role} · ${detail.dept}`],
              ["入职时间", detail.date],
              ["能力档案", detail.skill],
              ["最近评价", detail.review],
            ]}
          />
          <button
            className="danger block"
            onClick={() => {
              if (!window.confirm(`确定删除${detail.name}的员工档案吗？删除后无法恢复。`)) return;
              setDeleted([...deleted, detail.name]);
              setDetail(null);
              notify(`${detail.name}的员工档案已删除（演示数据）`);
            }}
          >
            删除员工档案
          </button>
          <Actions
            close={() => setDetail(null)}
            save={() => setEditing(true)}
            label="编辑评价"
          />
        </Modal>
      )}
      {detail && editing && (
        <Modal
          title={`编辑${detail.name}的评价`}
          eyebrow="绩效与能力记录"
          close={() => setEditing(false)}
        >
          <div className="form-grid">
            <label>
              评价周期
              <input id="review-period" defaultValue="2026 Q3" />
            </label>
            <label>
              评价状态
              <select defaultValue="已完成">
                <option>草稿</option>
                <option>待确认</option>
                <option>已完成</option>
              </select>
            </label>
            <label className="span-two">
              工作表现评价
              <textarea defaultValue="工作目标完成稳定，跨部门协作积极；下一周期建议加强数据复盘与项目沉淀。" />
            </label>
            <label className="span-two">
              能力标签
              <input defaultValue={detail.skill.replaceAll(" · ", "、")} />
            </label>
            <label className="span-two">
              下周期发展建议
              <textarea defaultValue="独立负责一个重点项目，并在季度末完成方法论复盘。" />
            </label>
          </div>
          <Actions
            close={() => setEditing(false)}
            save={saveReview}
            label="保存评价"
          />
        </Modal>
      )}
    </>
  );
}

function Importer({ notify }: { notify: (s: string) => void }) {
  const [step, setStep] = useState(0);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [result, setResult] = useState({ imported: 0, skipped: 0 });
  const fields = [
    ["name", "候选人姓名", ["姓名", "候选人姓名", "name", "candidate", "candidate name"]],
    ["position", "匹配岗位", ["匹配岗位", "应聘岗位", "应聘职位", "岗位", "职位", "position", "role"]],
    ["city", "城市", ["城市", "地区", "所在地", "city", "location"]],
    ["stage", "当前阶段", ["当前阶段", "招聘阶段", "面试状态", "状态", "stage", "status"]],
    ["tags", "人才标签", ["人才标签", "标签", "tags", "tag"]],
    ["notes", "备注与原因", ["结果与原因", "面试结论", "评价", "备注", "原因", "notes", "reason", "comment"]],
    ["source", "人才来源", ["人才来源", "来源", "source", "channel"]],
    ["contact", "联系方式", ["联系方式", "电话", "手机", "邮箱", "contact", "phone", "email"]],
    ["company", "当前公司", ["当前公司", "现公司", "公司", "current company", "company"]],
    ["workYears", "工作年限", ["工作年限", "经验年限", "年限", "work years", "experience"]],
  ] as const;
  const chooseFile = async (file?: globalThis.File) => {
    if (!file) return;
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: false });
      if (!parsed.length) throw new Error("文件中没有可读取的数据行");
      const discovered = Object.keys(parsed[0]);
      const normalized = (value: string) => value.trim().toLowerCase().replace(/[\s_\-（）()]/g, "");
      const auto: Record<string, string> = {};
      for (const [key, , aliases] of fields) {
        const found = discovered.find((header) => aliases.some((alias) => normalized(header) === normalized(alias) || normalized(header).includes(normalized(alias))));
        if (found) auto[key] = found;
      }
      setFileName(file.name); setRows(parsed); setHeaders(discovered); setMapping(auto); setStep(1);
    } catch (error) { notify(error instanceof Error ? error.message : "文件识别失败"); }
  };
  const importRows = async () => {
    if (!mapping.name) { notify("请先为“候选人姓名”选择对应列"); return; }
    let imported = 0; let skipped = 0;
    for (const row of rows) {
      const text = (key: string) => String(row[mapping[key]] ?? "").trim();
      const name = text("name");
      if (!name) { skipped++; continue; }
      const payload = {
        name,
        matched_position: text("position"), city: text("city"), stage: text("stage") || "待初试",
        notes: text("notes"), source: text("source"), contact: text("contact"),
        current_company: text("company"), work_years: Number.parseInt(text("workYears")) || null,
        tags: text("tags").split(/[、,，;；|]/).map((x) => x.trim()).filter(Boolean),
      };
      try {
        if (localMode) await localApi.createCandidate(payload);
        else { const { error } = await supabase.from("candidates").insert(payload); if (error) throw error; }
        imported++;
      } catch { skipped++; }
    }
    setResult({ imported, skipped }); setStep(3); notify(`${imported}条候选人资料已写入工作台`);
  };
  return (
    <div className="import-grid">
      <section className="panel import-main">
        <div className="page-title">
          <div>
            <span>任意表格批量录入</span>
            <h2>直接导入 Excel 或 CSV</h2>
            <p>不要求使用固定模板，系统会读取第一张工作表并自动识别常见字段。</p>
          </div>
        </div>
        {step === 0 && (
          <div className="import-start">
            <div className="drop compact-drop">
              <span>↥</span><h3>选择现有表格</h3><p>支持 .xlsx、.xls 和 .csv，无需整理成指定模板</p>
              <label className="primary file-picker">选择文件<input type="file" accept=".xlsx,.xls,.csv" onChange={(event) => chooseFile(event.target.files?.[0])} /></label>
              <small>文件在当前电脑读取，不会上传到外部云端</small>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="mapping">
            <div className="file-ok"><span>✓</span><div><b>{fileName}</b><small>识别到 {rows.length} 行 · {headers.length} 列</small></div></div>
            <h3>自动识别与字段对应</h3>
            {fields.map(([key, label]) => (
              <div className="map-row" key={key}>
                <select value={mapping[key] || ""} onChange={(event) => setMapping({ ...mapping, [key]: event.target.value })}>
                  <option value="">未识别 / 不导入</option>
                  {headers.map((header) => <option key={header}>{header}</option>)}
                </select>
                <b>→</b>
                <span>{label}</span>
                <em>{mapping[key] ? "已匹配" : "待确认"}</em>
              </div>
            ))}
            <button className="primary block" onClick={() => setStep(2)} disabled={!mapping.name}>
              确认并预览 {rows.length} 条记录
            </button>
          </div>
        )}
        {step === 2 && (
          <div className="mapping">
            <div className="file-ok"><span>✓</span><div><b>{fileName}</b><small>即将写入本地人才库</small></div></div>
            <h3>导入预览</h3>
            <Info
              rows={[
                ["文件数据", `${rows.length}条`],
                ["已识别字段", `${Object.values(mapping).filter(Boolean).length}个`],
                ["姓名示例", rows.slice(0, 3).map((row) => String(row[mapping.name] || "")).filter(Boolean).join("、") || "无"],
              ]}
            />
            <button
              className="primary block"
              onClick={importRows}
            >
              确认写入工作台
            </button>
          </div>
        )}
        {step === 3 && (
          <div className="drop">
            <span>✓</span>
            <h3>本周资料已完成导入</h3>
            <p>{result.imported}条成功，{result.skipped}条跳过</p>
            <button onClick={() => { setStep(0); setRows([]); setHeaders([]); setMapping({}); }}>继续导入另一份表格</button>
          </div>
        )}
      </section>
      <aside className="panel import-side">
        <Title eyebrow="导入流程" title="本周录入的四步" />
        <ol>
          {[
            "选择任意表格",
            "确认自动识别",
            "预览数据内容",
            "写入本地人才库",
          ].map((x, i) => (
            <li className={step >= i ? "done" : ""} key={x}>
              <b>{i + 1}</b>
              <span>
                {x}
                <small>
                  {
                    [
                      "Excel、旧表或飞书导出均可",
                      "可手动调整每一列",
                      "空姓名会自动跳过",
                      "形成长期候选人档案",
                    ][i]
                  }
                </small>
              </span>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}

function Permissions() {
  const [selected, setSelected] = useState<any>(null);
  const roles = [
    {
      name: "人事",
      desc: "负责工作台日常维护，管理候选人、面试与员工档案",
      access: [
        "新增、编辑和导入招聘资料",
        "维护面试记录与员工评价",
        "查看敏感字段并按需导出",
      ],
    },
    {
      name: "领导",
      desc: "查看招聘效率与人才进展，个人档案按需授权",
      access: [
        "查看招聘周报与流程统计",
        "查看岗位进度和待处理事项",
        "经人事授权查看个人档案",
      ],
    },
  ];
  return (
    <>
      <div className="panel full">
        <div className="page-title">
          <div>
            <span>精简访问边界</span>
            <h2>人事与领导权限</h2>
            <p>工作台只保留两个真实使用角色，减少复杂设置和误操作。</p>
          </div>
          <span className="draft">两类角色</span>
        </div>
        <div className="roles roles-two">
          {roles.map((r) => (
            <article className="role" key={r.name}>
              <span>◉</span>
              <h3>{r.name}</h3>
              <p>{r.desc}</p>
              <ul>
                {r.access.map((x) => (
                  <li key={x}>✓ {x}</li>
                ))}
              </ul>
              <button onClick={() => setSelected(r)}>查看权限范围</button>
            </article>
          ))}
        </div>
      </div>
      {selected && (
        <Modal
          title={`${selected.name}权限范围`}
          eyebrow="访问控制"
          close={() => setSelected(null)}
        >
          <Info rows={selected.access.map((x: string) => ["允许范围", x])} />
          <Actions
            close={() => setSelected(null)}
            save={() => setSelected(null)}
            label="确认"
          />
        </Modal>
      )}
    </>
  );
}

function Modal({
  title,
  eyebrow,
  close,
  children,
}: {
  title: string;
  eyebrow: string;
  close: () => void;
  children: any;
}) {
  return (
    <div className="overlay" onMouseDown={close}>
      <section
        className="modal compact"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header>
          <div>
            <span>{eyebrow}</span>
            <h2>{title}</h2>
          </div>
          <button onClick={close}>×</button>
        </header>
        {children}
      </section>
    </div>
  );
}
function Actions({
  close,
  save,
  label,
}: {
  close: () => void;
  save: () => void;
  label: string;
}) {
  return (
    <footer>
      <button onClick={close}>取消</button>
      <button className="primary" onClick={save}>
        {label}
      </button>
    </footer>
  );
}
function CandidateForm({ c }: { c?: Candidate }) {
  const [histories, setHistories] = useState(
    c
      ? [
          {
            date: "2026-08-18",
            title: `匹配 ${c.role}`,
            note: "岗位能力与行业经验基本匹配",
          },
          {
            date: "2026-08-20",
            title: c.history,
            note: "沟通清晰，建议在下一轮验证业务案例",
          },
        ]
      : [{ date: "2026-08-21", title: "新建候选人", note: "待进行岗位匹配" }],
  );
  return (
    <div className="candidate-editor">
      <div className="form-grid">
        <label>
          姓名
          <input
            id="candidate-name-input"
            defaultValue={c?.name || "周宁"}
            onChange={(e) => {
              if (c) c.name = e.target.value;
            }}
          />
        </label>
        <label>
          城市
          <input
            id="candidate-city-input"
            defaultValue={c?.city || "苏州"}
            onChange={(e) => {
              if (c) c.city = e.target.value;
            }}
          />
        </label>
        <label>
          匹配岗位
          <input
            id="candidate-role-input"
            list="candidate-role-options"
            defaultValue={c?.role || "海外销售经理"}
            onChange={(e) => {
              if (c) c.role = e.target.value;
            }}
            placeholder="选择或输入新岗位"
          />
          <datalist id="candidate-role-options">
            <option value="海外销售经理" />
            <option value="产品经理" />
            <option value="品牌运营" />
            <option value="海外销售主管" />
          </datalist>
          <small className="field-tip">可直接输入未创建过的新岗位</small>
        </label>
        <label>
          当前阶段
          <select
            id="candidate-stage-input"
            defaultValue={c?.stage || "待初试"}
            onChange={(e) => {
              if (c) c.stage = e.target.value;
            }}
          >
            <option>待初试</option>
            <option>待终试</option>
            <option>拟录用</option>
            <option>已归档</option>
          </select>
        </label>
        <label>
          工作年限
          <input defaultValue="8年" />
        </label>
        <label>
          当前公司
          <input defaultValue="星瀚科技" />
        </label>
        <label>
          人才来源
          <select defaultValue="LinkedIn">
            <option>LinkedIn</option>
            <option>飞书推荐</option>
            <option>招聘网站</option>
            <option>员工推荐</option>
            <option>行业社群</option>
          </select>
        </label>
        <label>
          联系方式
          <input defaultValue="138****6721" />
        </label>
        <label className="span-two">
          人才标签
          <input
            id="candidate-tags-input"
            defaultValue={c?.tags.join("、") || "B2B、英语"}
            onChange={(e) => {
              if (c) c.tags = e.target.value.split(/[、,，]/).filter(Boolean);
            }}
          />
        </label>
        <label className="span-two">
          候选人备注
          <textarea defaultValue="可长期跟进；重要沟通与判断请记录在这里。" />
        </label>
      </div>
      <div className="history-editor">
        <div className="history-editor-head">
          <div>
            <small>可编辑</small>
            <h3>岗位匹配历史</h3>
          </div>
          <button
            type="button"
            onClick={() =>
              setHistories([
                ...histories,
                {
                  date: "2026-08-21",
                  title: "新增记录",
                  note: "填写本次岗位匹配或沟通结果",
                },
              ])
            }
          >
            ＋ 新增记录
          </button>
        </div>
        {histories.map((h, i) => (
          <div className="history-edit-row" key={i}>
            <label>
              日期
              <input type="date" defaultValue={h.date} />
            </label>
            <label>
              记录标题
              <input defaultValue={h.title} />
            </label>
            <label className="history-note">
              备注
              <textarea defaultValue={h.note} />
            </label>
            <button
              type="button"
              aria-label="删除记录"
              onClick={() => setHistories(histories.filter((_, j) => j !== i))}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
function InterviewForm({
  close,
  save,
}: {
  close: () => void;
  save: () => void;
}) {
  return (
    <Modal title="录入面试结果" eyebrow="新增记录" close={close}>
      <div className="form-grid">
        <label>
          候选人
          <select>
            <option>张晓</option>
            <option>李雯</option>
          </select>
        </label>
        <label>
          匹配岗位
          <select>
            <option>海外销售经理</option>
            <option>产品经理</option>
          </select>
        </label>
        <label>
          轮次
          <select>
            <option>终试</option>
            <option>初试</option>
          </select>
        </label>
        <label>
          结果
          <select>
            <option>通过</option>
            <option>未通过</option>
            <option>待定</option>
          </select>
        </label>
        <label className="span-two">
          评价与事实依据
          <textarea defaultValue="欧美客户开发案例完整，建议进入录用沟通。" />
        </label>
      </div>
      <Actions close={close} save={save} label="保存面试记录" />
    </Modal>
  );
}
function Info({ rows }: { rows: string[][] }) {
  return (
    <div className="resume-sheet">
      {rows.map((r, i) => (
        <div key={i}>
          <b>{r[0]}</b>
          <p>{r[1]}</p>
        </div>
      ))}
    </div>
  );
}
function Title({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="section-title">
      <div>
        <p>{eyebrow}</p>
        <h3>{title}</h3>
      </div>
      {action && <button onClick={onAction}>{action} →</button>}
    </div>
  );
}
function Progress({
  label,
  done,
  width,
}: {
  label: string;
  done: string;
  width: string;
}) {
  return (
    <div className="progress-item">
      <div>
        <span>{label}</span>
        <b>{done}</b>
      </div>
      <i>
        <u style={{ width }} />
      </i>
    </div>
  );
}
