"use client";

import { useEffect, useState } from "react";
import { OfficeParser } from "officeparser";

async function previewApi(path: string, init: RequestInit = {}) {
  const response = await fetch(`/local-api/preview${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init.headers },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "本地数据库请求失败");
  return data;
}

const jobs = [
  {
    name: "海外销售经理",
    dept: "海外事业部",
    total: 18,
    pending: 6,
    initial: 5,
    final: 2,
    offer: 1,
    color: "coral",
  },
  {
    name: "品牌运营",
    dept: "品牌中心",
    total: 12,
    pending: 3,
    initial: 4,
    final: 2,
    offer: 1,
    color: "lime",
  },
  {
    name: "产品经理",
    dept: "产品中心",
    total: 9,
    pending: 2,
    initial: 3,
    final: 1,
    offer: 0,
    color: "blue",
  },
];

const candidates = [
  {
    name: "张晓",
    job: "海外销售经理",
    meta: "深圳 · 8年经验",
    tags: ["B2B", "欧美市场", "团队管理"],
    stage: "终试",
    date: "2026-08-25",
    time: "8月26日 14:00",
    updated: "今天 09:32",
    note: "初试通过，待验证年度渠道规划",
  },
  {
    name: "邓琪",
    job: "海外销售经理",
    meta: "深圳 · 6年经验",
    tags: ["西班牙语", "拉美市场", "渠道"],
    stage: "Offer",
    date: "2026-08-24",
    time: "8月27日前确认",
    updated: "昨天 16:18",
    note: "薪资沟通中，预计本周确认",
  },
  {
    name: "陈凯",
    job: "海外销售经理",
    meta: "广州 · 7年经验",
    tags: ["消费电子", "欧洲", "代理商"],
    stage: "可再联系",
    date: "2026-08-22",
    time: "11月25日提醒",
    updated: "8月22日 11:05",
    note: "当前岗位不匹配，建议三个月后联系",
  },
  {
    name: "李雯",
    job: "海外销售经理",
    meta: "杭州 · 5年经验",
    tags: ["英语", "北美市场", "大客户"],
    stage: "初试",
    date: "2026-08-25",
    time: "8月26日 10:00",
    updated: "今天 08:40",
    note: "已完成电话沟通，安排业务初试",
  },
  {
    name: "周航",
    job: "海外销售经理",
    meta: "东莞 · 4年经验",
    tags: ["东南亚", "渠道", "制造业"],
    stage: "筛选不合格",
    date: "2026-08-21",
    time: "8月21日 16:40",
    updated: "4天前",
    note: "管理经验暂不满足岗位要求",
  },
  {
    name: "王宁",
    job: "海外销售经理",
    meta: "厦门 · 9年经验",
    tags: ["欧洲", "德语", "团队管理"],
    stage: "初试",
    date: "2026-07-28",
    time: "7月28日 15:00",
    updated: "7月28日",
    note: "历史人才重新进入初试",
  },
  {
    name: "赵敏",
    job: "品牌运营",
    meta: "上海 · 6年经验",
    tags: ["DTC", "内容营销", "美妆"],
    stage: "Offer",
    date: "2026-08-25",
    time: "8月28日前确认",
    updated: "今天 10:15",
    note: "薪资方案已发送，等待确认",
  },
  {
    name: "林悦",
    job: "品牌运营",
    meta: "广州 · 4年经验",
    tags: ["小红书", "达人投放", "美妆"],
    stage: "初试",
    date: "2026-08-24",
    time: "8月27日 11:00",
    updated: "昨天 14:20",
    note: "作品集较完整，安排品牌负责人初试",
  },
  {
    name: "刘畅",
    job: "品牌运营",
    meta: "深圳 · 7年经验",
    tags: ["品牌策略", "新品上市", "团队管理"],
    stage: "终试",
    date: "2026-08-19",
    time: "8月26日 16:00",
    updated: "6天前",
    note: "初试通过，等待总经理终试",
  },
  {
    name: "苏晴",
    job: "品牌运营",
    meta: "杭州 · 3年经验",
    tags: ["SaaS", "用户增长", "活动策划"],
    stage: "筛选不合格",
    date: "2026-08-12",
    time: "8月12日 10:35",
    updated: "8月12日",
    note: "行业经验与当前需求偏差较大",
  },
  {
    name: "何佳",
    job: "品牌运营",
    meta: "成都 · 5年经验",
    tags: ["社媒", "内容", "生活方式"],
    stage: "可再联系",
    date: "2026-06-18",
    time: "10月18日提醒",
    updated: "6月18日",
    note: "候选人暂不考虑异地机会",
  },
  {
    name: "蒋一凡",
    job: "产品经理",
    meta: "北京 · 5年经验",
    tags: ["AI产品", "B端", "数据"],
    stage: "初试",
    date: "2026-08-25",
    time: "8月27日 15:30",
    updated: "今天 11:12",
    note: "产品案例匹配，等待初试",
  },
  {
    name: "唐可",
    job: "产品经理",
    meta: "上海 · 8年经验",
    tags: ["SaaS", "商业化", "团队管理"],
    stage: "终试",
    date: "2026-08-23",
    time: "8月28日 10:00",
    updated: "2天前",
    note: "业务面通过，安排负责人终试",
  },
  {
    name: "郭洋",
    job: "产品经理",
    meta: "深圳 · 6年经验",
    tags: ["供应链", "硬件", "数据分析"],
    stage: "Offer",
    date: "2026-08-20",
    time: "8月26日前确认",
    updated: "5天前",
    note: "背调完成，等待候选人确认",
  },
  {
    name: "袁菲",
    job: "产品经理",
    meta: "武汉 · 4年经验",
    tags: ["C端", "增长", "用户研究"],
    stage: "筛选不合格",
    date: "2026-08-05",
    time: "8月5日 13:50",
    updated: "8月5日",
    note: "岗位方向暂不匹配",
  },
  {
    name: "高远",
    job: "产品经理",
    meta: "苏州 · 7年经验",
    tags: ["B端", "制造业", "项目管理"],
    stage: "可再联系",
    date: "2026-05-26",
    time: "9月26日提醒",
    updated: "5月26日",
    note: "当前薪资差距较大，保留联系",
  },
];

const stageNames = [
  "全部",
  "待筛选",
  "初试",
  "终试",
  "Offer",
  "筛选不合格",
  "可再联系",
];
const timeOptions = [
  "今天",
  "昨天",
  "近7天",
  "本周",
  "近30天",
  "本月",
  "近3个月",
  "今年",
  "全部时间",
  "自定义日期",
];
const defaultTags = [
  "B2B",
  "欧美市场",
  "团队管理",
  "英语",
  "消费电子",
  "渠道",
  "SaaS",
  "用户增长",
];
const mockEmployees = [
  {
    id: 1,
    name: "刘畅",
    dept: "品牌中心",
    role: "品牌运营",
    joined: "2026-06-03",
    location: "深圳",
    status: "试用期",
    skills: ["内容运营", "活动策划"],
    review: "试用期评价待更新",
    manager: "苏晴",
    phone: "138-0000-1001",
  },
  {
    id: 2,
    name: "赵启",
    dept: "海外事业部",
    role: "海外销售主管",
    joined: "2025-11-18",
    location: "深圳",
    status: "正式员工",
    skills: ["北美渠道", "团队管理"],
    review: "2026 Q3 已完成",
    manager: "May",
    phone: "138-0000-1002",
  },
  {
    id: 3,
    name: "苏晴",
    dept: "产品中心",
    role: "产品经理",
    joined: "2024-08-12",
    location: "上海",
    status: "正式员工",
    skills: ["SaaS", "用户增长"],
    review: "2026 Q3 已完成",
    manager: "陈总",
    phone: "138-0000-1003",
  },
  {
    id: 4,
    name: "何睿",
    dept: "供应链中心",
    role: "采购专员",
    joined: "2026-02-20",
    location: "东莞",
    status: "正式员工",
    skills: ["供应商管理", "成本分析"],
    review: "半年评价待确认",
    manager: "周经理",
    phone: "138-0000-1004",
  },
  {
    id: 5,
    name: "林悦",
    dept: "品牌中心",
    role: "社媒运营",
    joined: "2025-09-08",
    location: "广州",
    status: "正式员工",
    skills: ["小红书", "达人投放"],
    review: "2026 Q2 良好",
    manager: "刘畅",
    phone: "138-0000-1005",
  },
  {
    id: 6,
    name: "唐可",
    dept: "产品中心",
    role: "高级产品经理",
    joined: "2023-04-17",
    location: "北京",
    status: "正式员工",
    skills: ["商业化", "团队管理"],
    review: "晋升评估进行中",
    manager: "陈总",
    phone: "138-0000-1006",
  },
];
type View = "jobs" | "import" | "pipeline" | "employees";
type ParsedResume = {
  fileName: string;
  storedName: string;
  rawText: string;
  name: string;
  job: string;
  city: string;
  years: string;
  phone: string;
  email: string;
  company: string;
  summary: string;
  skillsText: string;
  experience: string;
  education: string;
  languages: string;
  stage: string;
  parseWarning?: string;
};
type CandidateRecord = (typeof candidates)[number] & {
  id?: number;
  nextAction?: string;
};

function candidateToResume(person: (typeof candidates)[number]): ParsedResume {
  const [city = "", yearsText = ""] = person.meta
    .split("·")
    .map((item) => item.trim());
  const years = yearsText.match(/\d+/)?.[0] || "";
  const summary = `${person.note}。当前招聘阶段：${person.stage}；下一节点：${person.time}。`;
  return {
    fileName: `${person.name}-人才档案`,
    storedName: "",
    rawText: [
      `${person.name}｜${person.job}`,
      person.meta,
      `人才标签：${person.tags.join("、")}`,
      `招聘阶段：${person.stage}`,
      `最近记录：${person.note}`,
      `下一节点：${person.time}`,
    ].join("\n"),
    name: person.name,
    job: person.job,
    city,
    years,
    phone: "",
    email: "",
    company: "",
    summary,
    skillsText: person.tags.join("、"),
    experience: "待从原始简历或后续面试记录补充",
    education: "待补充",
    languages: person.tags.filter((tag) => /语$|英语|西班牙语|德语/.test(tag)).join("、"),
    stage: person.stage,
  };
}

function stageMeaning(stage: string) {
  const meanings: Record<string, string> = {
    待筛选: "简历等待人事初步筛选",
    初试: "已进入首轮面试",
    终试: "初试通过，等待最终面试",
    Offer: "面试通过，正在确认录用条件",
    筛选不合格: "本岗位已停止推进",
    可再联系: "暂缓推进，保留后续联系",
  };
  return meanings[stage] || "招聘状态等待更新";
}

function nextAction(stage: string) {
  const actions: Record<string, string> = {
    待筛选: "完成简历筛选并决定是否约面",
    初试: "完成初试并录入面试结论",
    终试: "安排终试并收集业务评价",
    Offer: "确认薪资方案与入职日期",
    筛选不合格: "补充不合格原因并归档",
    可再联系: "到期重新联系并确认求职意向",
  };
  return actions[stage] || "补充下一步跟进计划";
}

const resumeHeadings = ["个人信息", "求职意向", "职业概述", "个人概述", "个人简介", "自我介绍", "个人优势", "个人特点", "自我评价", "核心能力", "核心标签", "专业技能", "技能", "技能特长", "工作经历", "工作履历", "任职经历", "项目经历", "代表项目", "教育经历", "教育背景", "教育", "语言能力", "证书"];

function cleanResumeText(text: string) {
  return text.replace(/\u00a0/g, " ").replace(/\r/g, "").replace(/([\u4e00-\u9fa5])\s+(?=[\u4e00-\u9fa5])/g, "$1").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function labeledValue(text: string, labels: string[]) {
  const escaped = labels.map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  return text.match(new RegExp(`(?:^|\\n|[|｜])\\s*(?:${escaped})\\s*[:：|｜]?\\s*([^\\n|｜]{1,100})`, "i"))?.[1]?.trim() || "";
}

function resumeSection(text: string, headings: string[]) {
  const lines = text.split("\n");
  const normalized = (value: string) => value.replace(/[：:|｜\s]/g, "");
  const wanted = headings.map(normalized);
  const all = resumeHeadings.map(normalized);
  const isHeading = (line: string, headings: string[]) => headings.some((heading) => normalized(line).startsWith(heading));
  const start = lines.findIndex((line) => isHeading(line, wanted));
  if (start < 0) return "";
  const content: string[] = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (isHeading(lines[index], all)) break;
    content.push(lines[index]);
  }
  return content.join("\n").trim();
}

async function recognizeResumeImage(image: File | HTMLCanvasElement) {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker(["chi_sim", "eng"], 1, {
    workerPath: "/tesseract/worker.min.js",
    langPath: "/tesseract/lang",
    corePath: "/tesseract/core",
  });
  try {
    const result = await worker.recognize(image);
    return result.data.text.trim();
  } finally {
    await worker.terminate();
  }
}

async function recognizeScannedPdf(file: File) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages: string[] = [];
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker(["chi_sim", "eng"], 1, {
    workerPath: "/tesseract/worker.min.js",
    langPath: "/tesseract/lang",
    corePath: "/tesseract/core",
  });
  try {
    for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, 5); pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 2.2 });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext("2d");
      if (!context) continue;
      await page.render({ canvas, canvasContext: context, viewport }).promise;
      const result = await worker.recognize(canvas);
      pages.push(result.data.text);
    }
  } finally {
    await worker.terminate();
  }
  return pages.join("\n").trim();
}

async function readActualResume(file: File): Promise<ParsedResume> {
  const upload = await fetch("/local-api/preview/resumes/import", {
    method: "POST",
    headers: {
      "content-type": "application/octet-stream",
      "x-file-name": encodeURIComponent(file.name),
    },
    body: file,
  });
  const saved = await upload.json();
  if (!upload.ok) throw new Error(saved.error || "原始简历保存失败");
  let rawText = "";
  let parseWarning = "";
  if (/\.txt$/i.test(file.name))
    rawText = (await file.text()).replace(/\r/g, "").trim();
  else if (/\.(png|jpe?g)$/i.test(file.name)) {
    try {
      rawText = await recognizeResumeImage(file);
      parseWarning = "这是一份图片简历，已使用本地 OCR 识别；请重点核对姓名、电话和日期。";
    } catch (error) {
      console.error("图片简历 OCR 失败", error);
      parseWarning = `图片简历已保存，但 OCR 未能完成：${error instanceof Error ? error.message : "未知错误"}。`;
    }
  }
  else {
    try {
      const ast = await OfficeParser.parseOffice(
        file,
        /\.pdf$/i.test(file.name)
          ? { pdfWorkerSrc: "/pdf.worker.min.mjs" }
          : undefined,
      );
      rawText = String((await ast.to("text")).value || "")
        .replace(/\r/g, "")
        .trim();
    } catch {
      parseWarning =
        "文件已保存，但未能自动提取文字，请在右侧按原文件人工补录。";
    }
  }
  if (/\.pdf$/i.test(file.name) && rawText.replace(/\s/g, "").length < 20) {
    try {
      rawText = await recognizeScannedPdf(file);
      parseWarning = "这是一份扫描型 PDF，已使用本地 OCR 识别；请重点核对姓名、电话和日期。";
    } catch (error) {
      console.error("扫描型 PDF OCR 失败", error);
      parseWarning = `PDF 没有文字层，且 OCR 未能完成：${error instanceof Error ? error.message : "未知错误"}。`;
    }
  }
  if (!rawText && !parseWarning)
    parseWarning = "文件中没有可提取的文字，可能是扫描件，请人工补录。";
  rawText = cleanResumeText(rawText);
  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const fileBase = file.name.replace(/\.[^.]+$/, "");
  const fileNamePerson =
    fileBase.match(
      /(?:简历|resume)[-_ ]+([\u4e00-\u9fa5·]{2,4})(?:[-_ ]|$)/i,
    )?.[1] || fileBase.match(/^([\u4e00-\u9fa5·]{2,4})(?:\.|[-_ ])/i)?.[1] || "";
  const excludedNames =
    /^(职业概述|个人概述|核心能力|核心标签|工作经历|项目经历|教育经历|语言能力|联系方式|求职意向)$/;
  const compactLines = rawText
    .split(/[\n|｜]/)
    .map((line) => line.trim())
    .filter(Boolean);
  const explicitName =
    compactLines.find(
      (line) =>
        /^[\u4e00-\u9fa5·]{2,4}$/.test(line) && !excludedNames.test(line),
    ) || "";
  const spacedName =
    rawText
      .match(
        /(?:^|[|｜\n])\s*([\u4e00-\u9fa5])\s+([\u4e00-\u9fa5])(?=\s*(?:海外|国内|高级|资深|销售|产品|品牌|运营|采购|设计|财务|人事|工程))/,
      )
      ?.slice(1, 3)
      .join("") || "";
  const name = fileNamePerson || spacedName || explicitName || "待确认姓名";
  const phoneMatch = rawText.match(/(?:\+?86[\s-]?)?(1[3-9](?:[\s-]?\d){9})/);
  const phone = phoneMatch?.[1]?.replace(/[\s-]/g, "") || labeledValue(rawText, ["联系电话", "手机", "电话", "联系方式"]);
  const email = rawText.replace(/\s*@\s*/g, "@").replace(/\s*\.\s*/g, ".").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
  const yearsLabel = labeledValue(rawText, ["工作年限", "工作经验", "从业年限"]);
  const years = yearsLabel.match(/\d{1,2}/)?.[0] || rawText.match(/(\d{1,2})\s*\+?\s*年(?:以上)?(?:工作|从业)?经验/)?.[1] || "";
  const cityLabel = labeledValue(rawText, ["所在城市", "居住地", "现居地", "所在地", "工作地点", "城市"]);
  const city = cityLabel.replace(/[市区县].*$/, "") || ["深圳", "广州", "上海", "北京", "杭州", "东莞", "成都", "武汉", "苏州", "厦门", "南京", "重庆", "天津", "西安", "长沙", "郑州", "佛山", "宁波", "青岛", "珠海", "无锡", "合肥", "福州"].find((item) => rawText.includes(item)) || "";
  const jobLabel = labeledValue(rawText, ["应聘岗位", "目标岗位", "求职岗位", "期望职位", "求职意向", "当前职位", "职位"]);
  const job = jobLabel || rawText.match(
      /(海外销售(?:总监|经理|主管|负责人)|国内销售(?:总监|经理|主管)|高级产品经理|产品经理|品牌运营|社媒运营|跨境电商运营|电商运营|内容运营|采购(?:经理|专员)|财务(?:经理|主管|专员)|人事(?:经理|主管|专员)|[\u4e00-\u9fa5]{0,6}工程师)/,
    )?.[1] || "待确认岗位";
  const company = labeledValue(rawText, ["当前公司", "最近公司", "所在公司", "公司名称"]) ||
    lines.find(
      (line) =>
        line.length <= 30 && /(公司|科技|集团|品牌|网络|电子)/.test(line),
    ) || "";
  const summary =
    resumeSection(rawText, ["职业概述", "个人概述", "个人简介", "自我介绍", "个人优势", "个人特点", "自我评价"]);
  const skillsText =
    resumeSection(rawText, ["核心标签", "核心能力", "专业技能", "技能", "技能特长"]);
  const experience = resumeSection(rawText, ["工作经历", "工作履历", "任职经历"]);
  const education = resumeSection(rawText, ["教育经历", "教育背景", "教育"]);
  const languages =
    rawText
      .match(/(?:语言能力|语言)\s*[:：|｜]?\s*([^\n|｜]{2,80})/)?.[1]
      ?.trim() ||
    compactLines.find((line) =>
      /(英语|英文|西班牙语|法语|德语|日语|韩语).*(C1|C2|B1|B2|熟练|流利|母语)/i.test(
        line,
      ),
    ) ||
    "";
  const missing = [[name === "待确认姓名", "姓名"], [job === "待确认岗位", "匹配岗位"], [!phone, "电话"], [!email, "邮箱"], [!experience, "工作经历"], [!education, "教育经历"]].filter(([condition]) => condition).map(([, label]) => label);
  if (missing.length && !parseWarning) parseWarning = `已提取文件文字，但以下字段需要人工确认：${missing.join("、")}。`;
  return {
    fileName: saved.originalName,
    storedName: saved.storedName,
    rawText,
    name,
    job,
    city,
    years,
    phone,
    email,
    company,
    summary,
    skillsText,
    experience,
    education,
    languages,
    stage: "待筛选",
    parseWarning,
  };
}

function matchesTime(date: string, period: string, start: string, end: string) {
  const value = new Date(`${date}T00:00:00`).getTime();
  const today = new Date("2026-08-25T00:00:00");
  const day = 86400000;
  if (period === "全部时间") return true;
  if (period === "今天") return value === today.getTime();
  if (period === "昨天") return value === today.getTime() - day;
  if (period === "近7天" || period === "本周")
    return value >= today.getTime() - 6 * day;
  if (period === "近30天" || period === "本月")
    return value >= new Date("2026-08-01T00:00:00").getTime();
  if (period === "近3个月")
    return value >= new Date("2026-05-25T00:00:00").getTime();
  if (period === "今年")
    return value >= new Date("2026-01-01T00:00:00").getTime();
  if (period === "自定义日期")
    return (
      value >= new Date(`${start}T00:00:00`).getTime() &&
      value <= new Date(`${end}T23:59:59`).getTime()
    );
  return true;
}

export default function PreviewV2() {
  const [jobList, setJobList] = useState(jobs);
  const [candidateList, setCandidateList] = useState(candidates);
  const [shareEmployeeList, setShareEmployeeList] = useState<Array<{ id: number; name: string; dept: string; role: string; status: string; joined: string; location: string; skills: string[]; review: string; manager: string }>>([]);
  const [view, setView] = useState<View>("jobs");
  const [job, setJob] = useState(0);
  const [stage, setStage] = useState("全部");
  const [fileName, setFileName] = useState("");
  const [importedResume, setImportedResume] = useState<ParsedResume | null>(
    null,
  );
  const [editing, setEditing] = useState(false);
  const [profileReturnView, setProfileReturnView] = useState<View>("import");
  const [tagPicker, setTagPicker] = useState(false);
  const [tags, setTags] = useState(defaultTags);
  const [selectedTags, setSelectedTags] = useState(["B2B", "欧美市场"]);
  const [newTag, setNewTag] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveNotice, setSaveNotice] = useState("已保存到本地数据库");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchStage, setSearchStage] = useState("全部");
  const [jobCreatorOpen, setJobCreatorOpen] = useState(false);
  const [jobName, setJobName] = useState("");
  const [jobDepartment, setJobDepartment] = useState("海外事业部");
  const [jobColor, setJobColor] = useState("graphite");
  const [shareCenterOpen, setShareCenterOpen] = useState(false);
  const [shareMode, setShareMode] = useState<"recruiting" | "employees">("recruiting");
  const [shareAudience, setShareAudience] = useState("领导");
  const [shareTitle, setShareTitle] = useState("招聘进展分享");
  const [shareJobs, setShareJobs] = useState<string[]>([]);
  const [shareCandidates, setShareCandidates] = useState<number[]>([]);
  const [shareEmployees, setShareEmployees] = useState<number[]>([]);
  const [shareSections, setShareSections] = useState({ summary: false, jobs: false, stages: false, candidates: true, departments: false, employees: false });
  const [shareAnonymize, setShareAnonymize] = useState(true);
  const [shareExpiry, setShareExpiry] = useState("7d");
  const [shareResult, setShareResult] = useState<{ token: string; url: string; lanUrl: string; expiresAt: string | null } | null>(null);
  const [shareRecords, setShareRecords] = useState<Array<{ token: string; title: string; audience: string; expiresAt: string | null; status: string; createdAt: string; feedbackCount?: number }>>([]);
  const [shareFeedback, setShareFeedback] = useState<Array<{ id: number; candidateName: string; reviewer: string; decision: string; comment: string; createdAt: string }>>([]);
  const [feedbackRecord, setFeedbackRecord] = useState("");
  const [lanOrigin, setLanOrigin] = useState("");
  const [userProfile, setUserProfile] = useState({ name: "May", role: "人事管理员" });
  const [profileDraft, setProfileDraft] = useState({ name: "May", role: "人事管理员" });
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);

  useEffect(() => {
    Promise.all([previewApi("/jobs"), previewApi("/candidates"), previewApi("/employees")])
      .then(([savedJobs, savedCandidates, savedEmployees]) => {
        if (savedJobs.length) setJobList(savedJobs);
        if (savedCandidates.length) setCandidateList(savedCandidates);
        if (savedEmployees.length) setShareEmployeeList(savedEmployees);
      })
      .catch((error) => console.error("读取本地调试数据失败", error));
    previewApi("/settings/profile")
      .then((profile) => {
        if (!profile?.name || !profile?.role) return;
        const savedProfile = { name: String(profile.name), role: String(profile.role) };
        setUserProfile(savedProfile);
        setProfileDraft(savedProfile);
      })
      .catch((error) => console.error("读取个人资料失败", error));
  }, []);

  const openProfileEditor = () => {
    setProfileDraft(userProfile);
    setProfileEditorOpen(true);
  };
  const saveUserProfile = async () => {
    const next = { name: profileDraft.name.trim(), role: profileDraft.role.trim() };
    if (!next.name || !next.role) return;
    await previewApi("/settings/profile", { method: "PUT", body: JSON.stringify(next) });
    setUserProfile(next);
    setProfileDraft(next);
    setProfileEditorOpen(false);
  };

  const title =
    view === "jobs"
      ? "岗位人才库"
      : view === "import"
        ? "简历处理中心"
        : view === "pipeline"
          ? "招聘流程"
          : "员工档案";
  const normalizedSearch = searchQuery.trim().toLocaleLowerCase("zh-CN");
  const shareableCandidates = candidateList.filter(
    (person) => person.stage !== "筛选不合格",
  );
  const searchResults = candidateList.filter((person) => {
    const text = [
      person.name,
      person.job,
      person.meta,
      person.stage,
      person.note,
      ...person.tags,
    ]
      .join(" ")
      .toLocaleLowerCase("zh-CN");
    return (
      (!normalizedSearch || text.includes(normalizedSearch)) &&
      (searchStage === "全部" || person.stage === searchStage)
    );
  });
  const openSearchResult = (person: (typeof candidates)[number]) => {
    const index = jobList.findIndex((item) => item.name === person.job);
    if (index >= 0) setJob(index);
    setStage(person.stage);
    setView("jobs");
    setSearchOpen(false);
  };
  const openCandidateProfile = (person: (typeof candidates)[number]) => {
    setProfileReturnView(view);
    setImportedResume(candidateToResume(person));
    setSelectedTags(person.tags);
    setEditing(true);
    setView("import");
  };
  const toggleTag = (tag: string) =>
    setSelectedTags((list) =>
      list.includes(tag) ? list.filter((item) => item !== tag) : [...list, tag],
    );
  const addTag = () => {
    const value = newTag.trim();
    if (!value) return;
    if (!tags.includes(value)) setTags((list) => [...list, value]);
    if (!selectedTags.includes(value))
      setSelectedTags((list) => [...list, value]);
    setNewTag("");
  };
  const saveResume = () => {
    setSaveNotice("真实简历已保存到本地人才库");
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };
  const createJob = async () => {
    const name = jobName.trim();
    if (!name) return;
    const next = await previewApi("/jobs", {
      method: "POST",
      body: JSON.stringify({
        name,
        dept: jobDepartment,
        color: jobColor,
      }),
    });
    setJobList((list) => [...list, next]);
    setJob(jobList.length);
    setJobCreatorOpen(false);
    setJobName("");
    setSaveNotice(`岗位“${next.name}”已创建`);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };
  const saveCandidateAdvice = async (
    person: CandidateRecord,
    changes: Pick<CandidateRecord, "stage" | "note" | "time" | "nextAction">,
  ) => {
    const merged: CandidateRecord = {
      ...person,
      ...changes,
      updated: "刚刚",
    };
    const saved = person.id
      ? await previewApi(`/candidates/${person.id}`, {
          method: "PATCH",
          body: JSON.stringify(merged),
        })
      : merged;
    setCandidateList((list) =>
      list.map((item) => {
        const itemId = (item as CandidateRecord).id;
        return person.id
          ? itemId === person.id
            ? saved
            : item
          : item.name === person.name && item.job === person.job
            ? saved
            : item;
      }),
    );
    return saved as CandidateRecord;
  };
  const deleteCandidateRecord = async (person: CandidateRecord) => {
    if (person.id) await previewApi(`/candidates/${person.id}`, { method: "DELETE" });
    setCandidateList((list) => list.filter((item) => person.id ? (item as CandidateRecord).id !== person.id : !(item.name === person.name && item.job === person.job)));
  };
  const openShareCenter = async () => {
    try {
      const [records, network] = await Promise.all([previewApi("/share-records"), previewApi("/network-info")]);
      setShareRecords(records);
      if (network.addresses?.[0]) setLanOrigin(`http://${network.addresses[0]}:${network.port}`);
    } catch (error) { console.error("读取分享信息失败", error); }
    setShareCenterOpen(true);
  };
  const switchShareMode = (mode: "recruiting" | "employees") => {
    setShareMode(mode);
    setShareResult(null);
    if (mode === "recruiting") {
      setShareTitle("招聘进展分享");
      setShareSections({ summary: false, jobs: false, stages: false, candidates: true, departments: false, employees: false });
    } else {
      setShareTitle("员工表现分享");
      setShareSections({ summary: false, jobs: false, stages: false, candidates: false, departments: true, employees: true });
    }
  };
  const toggleSharedEmployee = (id: number) =>
    setShareEmployees((list) => list.includes(id) ? list.filter((value) => value !== id) : [...list, id]);
  const employeeShareGroups = [
    { title: "试用期员工", hint: "展示试用进度、阶段表现与转正建议", items: shareEmployeeList.filter((item) => item.status === "试用期") },
    { title: "正式员工", hint: "展示近期评价、能力表现与工作状态", items: shareEmployeeList.filter((item) => item.status === "正式员工") },
    { title: "其他状态", hint: "展示自定义状态下的员工档案", items: shareEmployeeList.filter((item) => !["试用期", "正式员工"].includes(item.status)) },
  ].filter((group) => group.items.length);
  const generateShowcase = async (openAfter = false) => {
    const shareableIds = new Set(
      shareableCandidates.map((person) => Number((person as CandidateRecord).id)),
    );
    const selectedCandidates = shareCandidates.filter((id) => shareableIds.has(id));
    const result = await previewApi("/showcase-snapshot", {
      method: "POST",
      body: JSON.stringify({ title: shareTitle, audience: shareAudience, selectedJobs: shareJobs, selectedCandidates, selectedEmployees: shareEmployees, sections: shareSections, anonymizeNames: shareAnonymize, expiry: shareExpiry }),
    });
    const url = `${window.location.origin}${result.share.url}`;
    setShareResult({ token: result.share.token, url, lanUrl: lanOrigin ? `${lanOrigin}${result.share.url}` : url, expiresAt: result.share.expiresAt });
    setShareRecords((list) => [{ token: result.share.token, title: shareTitle, audience: shareAudience, expiresAt: result.share.expiresAt, status: "active", createdAt: new Date().toISOString() }, ...list]);
    if (openAfter) window.open(result.share.url, "_blank", "noopener,noreferrer");
  };
  const stopShowcase = async () => {
    await previewApi("/showcase-snapshot", { method: "DELETE", body: JSON.stringify({ token: shareResult?.token }) });
    if (shareResult) setShareRecords((list) => list.map((item) => item.token === shareResult.token ? { ...item, status: "stopped" } : item));
    setShareResult(null);
  };
  const deleteShareRecord = async (token: string) => {
    await previewApi(`/share-records/${token}`, { method: "DELETE" });
    setShareRecords((list) => list.filter((item) => item.token !== token));
    if (shareResult?.token === token) setShareResult(null);
  };
  const viewShareFeedback = async (token: string) => {
    if (feedbackRecord === token) { setFeedbackRecord(""); setShareFeedback([]); return; }
    setShareFeedback(await previewApi(`/share-records/${token}`));
    setFeedbackRecord(token);
  };

  return (
    <main className="v2-shell">
      <aside className="v2-sidebar">
        <div className="v2-brand">
          <span>P</span>
          <div>
            <strong>PeopleFlow</strong>
            <small>PEOPLE WORKSPACE</small>
          </div>
        </div>
        <nav>
          <button
            className={view === "jobs" ? "active" : ""}
            onClick={() => setView("jobs")}
          >
            <i>01</i>岗位人才库
          </button>
          <button
            className={view === "import" ? "active" : ""}
            onClick={() => setView("import")}
          >
            <i>02</i>简历导入
          </button>
          <button
            className={view === "pipeline" ? "active" : ""}
            onClick={() => setView("pipeline")}
          >
            <i>03</i>招聘流程
          </button>
          <button
            className={view === "employees" ? "active" : ""}
            onClick={() => setView("employees")}
          >
            <i>04</i>员工档案
          </button>
        </nav>
        <button className="v2-share-fab" onClick={openShareCenter} aria-label="打开分享中心">
          <span>↗</span>
          <b>分享中心</b>
          <small>选择内容并转发</small>
        </button>
        <div className="v2-side-note">
          <b>本地私有空间</b>
          <p>资料仅保存在公司电脑</p>
        </div>
        <button className="v2-user-profile" onClick={openProfileEditor} aria-label="编辑姓名和身份">
          <span>{userProfile.name.slice(0, 1).toUpperCase()}</span>
          <div>
            <b>{userProfile.name}</b>
            <small>{userProfile.role}</small>
          </div>
          <em>编辑</em>
        </button>
      </aside>

      <section className="v2-main">
        <header className="v2-topbar">
          <div>
            <small>2026 · 第34周</small>
            <h1>{title}</h1>
          </div>
          <div className="v2-actions">
            <button onClick={() => setSearchOpen(true)}>搜索人才</button>
            <button
              className="dark"
              onClick={() => {
                setView("import");
                setEditing(false);
              }}
            >
              ＋ 导入简历
            </button>
          </div>
        </header>
        {view === "jobs" && (
          <JobsView
            jobItems={jobList}
            candidates={candidateList}
            job={job}
            setJob={setJob}
            stage={stage}
            setStage={setStage}
            openResume={openCandidateProfile}
            openTags={() => setTagPicker(true)}
            saveCandidate={saveCandidateAdvice}
            deleteCandidate={deleteCandidateRecord}
            createJob={() => setJobCreatorOpen(true)}
          />
        )}
        {view === "import" &&
          (editing && importedResume ? (
            <ResumeEditor
              resume={importedResume}
              jobOptions={jobList.map((item) => item.name)}
              createMatchedJob={async (name) => {
                const next = await previewApi("/jobs", {
                  method: "POST",
                  body: JSON.stringify({ name, dept: "待设置部门", color: "graphite" }),
                });
                setJobList((list) => [...list, next]);
                return next.name as string;
              }}
              selectedTags={selectedTags}
              openTags={() => setTagPicker(true)}
              exitLabel={
                profileReturnView === "pipeline"
                  ? "返回招聘流程"
                  : profileReturnView === "jobs"
                    ? "返回岗位人才库"
                    : "返回简历导入"
              }
              onExit={() => {
                setEditing(false);
                setView(profileReturnView);
              }}
              saved={async (updated) => {
                setImportedResume(updated);
                const person = await previewApi("/candidates", {
                  method: "POST",
                  body: JSON.stringify({
                    name: updated.name,
                    job: updated.job,
                    meta:
                      [
                        updated.city,
                        updated.years ? `${updated.years}年经验` : "",
                      ]
                        .filter(Boolean)
                        .join(" · ") || "待补充资料",
                    tags: selectedTags,
                    stage: updated.stage,
                    date: new Date().toISOString().slice(0, 10),
                    time: "待安排",
                    updated: "刚刚",
                    note: `由真实文件 ${updated.fileName} 导入`,
                  }),
                });
                setCandidateList((list) => [...list, person]);
                const targetJob = jobList.findIndex((item) => item.name === updated.job);
                if (targetJob >= 0) setJob(targetJob);
                setStage(updated.stage);
                saveResume();
                setEditing(false);
                setView("jobs");
              }}
            />
          ) : (
            <ResumeImport
              fileName={fileName}
              choose={(resume) => {
                const matchedJob = jobList.find((item) => item.name === resume.job)?.name
                  || (/品牌|运营|电商|内容|社媒/.test(resume.job) ? jobList.find((item) => item.name === "品牌运营")?.name : "")
                  || (/产品/.test(resume.job) ? jobList.find((item) => item.name === "产品经理")?.name : "")
                  || (/销售|渠道|外贸/.test(resume.job) ? jobList.find((item) => item.name === "海外销售经理")?.name : "")
                  || jobList[0]?.name
                  || resume.job;
                setFileName(resume.fileName);
                setImportedResume({ ...resume, job: matchedJob });
                setProfileReturnView("import");
                setEditing(true);
              }}
            />
          ))}
        {view === "pipeline" && (
          <PipelineView
            jobs={jobList}
            candidates={candidateList}
            openCandidate={openCandidateProfile}
            onCandidateAdded={(person) =>
              setCandidateList((list) => [...list, person])
            }
          />
        )}
        {view === "employees" && <EmployeeDepartmentView />}
      </section>

      {profileEditorOpen && (
        <div className="v2-overlay centered" onMouseDown={() => setProfileEditorOpen(false)}>
          <section className="v2-profile-editor" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <small>PERSONAL PROFILE</small>
                <h2>设置个人信息</h2>
                <p>用于工作台左侧显示，信息仅保存在当前本地工作台。</p>
              </div>
              <button className="v2-close profile-close" aria-label="关闭" onClick={() => setProfileEditorOpen(false)} />
            </header>
            <div className="v2-profile-preview">
              <span>{(profileDraft.name.trim() || "我").slice(0, 1).toUpperCase()}</span>
              <div><b>{profileDraft.name.trim() || "你的名字"}</b><small>{profileDraft.role.trim() || "你的身份"}</small></div>
            </div>
            <div className="v2-profile-fields">
              <label>显示姓名<input autoFocus maxLength={24} value={profileDraft.name} onChange={(event) => setProfileDraft((value) => ({ ...value, name: event.target.value }))} placeholder="例如：May、王小明" /></label>
              <label>身份<input list="peopleflow-profile-roles" maxLength={32} value={profileDraft.role} onChange={(event) => setProfileDraft((value) => ({ ...value, role: event.target.value }))} placeholder="例如：人事管理员" /></label>
              <datalist id="peopleflow-profile-roles"><option value="人事管理员"/><option value="招聘负责人"/><option value="HRBP"/><option value="部门负责人"/><option value="面试官"/></datalist>
            </div>
            <footer><button onClick={() => setProfileEditorOpen(false)}>取消</button><button className="dark" disabled={!profileDraft.name.trim() || !profileDraft.role.trim()} onClick={saveUserProfile}>保存设置</button></footer>
          </section>
        </div>
      )}

      {shareCenterOpen && (
        <div className="v2-overlay centered" onMouseDown={() => setShareCenterOpen(false)}>
          <section className="v2-share-center" onMouseDown={(event) => event.stopPropagation()}>
            <header><div><small>只读分享</small><h2>创建分享页面</h2><p>由人事决定展示什么。联系方式、原始简历和内部评价始终不会分享。</p></div><button className="v2-close" onClick={() => setShareCenterOpen(false)}>×</button></header>
            <nav className="v2-share-mode-tabs" aria-label="选择分享类型">
              <button className={shareMode === "recruiting" ? "selected" : ""} onClick={() => switchShareMode("recruiting")}><b>招聘进展</b><small>分享岗位、候选人与面试阶段</small></button>
              <button className={shareMode === "employees" ? "selected" : ""} onClick={() => switchShareMode("employees")}><b>员工表现</b><small>分享试用期与正式员工表现</small></button>
            </nav>
            <label className="v2-share-title"><span>分享名称</span><input value={shareTitle} onChange={(event) => setShareTitle(event.target.value)} placeholder="例如：海外销售岗位周报"/></label>
            <div className="v2-share-grid">
              <section><h3>1. 分享给谁</h3><div className="v2-choice-row">{["领导", "面试官", "部门负责人", "其他"].map((value) => <button key={value} className={shareAudience === value ? "selected" : ""} onClick={() => setShareAudience(value)}>{value}</button>)}</div></section>
              {shareMode === "recruiting" ? <>
                <section><h3>2. 选择岗位</h3><div className="v2-check-list">{jobList.map((item) => <label key={item.name}><input type="checkbox" checked={shareJobs.includes(item.name)} onChange={() => setShareJobs((list) => list.includes(item.name) ? list.filter((name) => name !== item.name) : [...list, item.name])}/><span>{item.name}</span></label>)}</div></section>
                <section className="wide"><h3>3. 选择候选人</h3><div className="v2-check-list candidates">{shareableCandidates.filter((item) => shareJobs.includes(item.job)).map((item) => { const id=Number((item as CandidateRecord).id); return <label key={id || `${item.name}-${item.job}`}><input type="checkbox" checked={shareCandidates.includes(id)} onChange={() => setShareCandidates((list) => list.includes(id) ? list.filter((value) => value !== id) : [...list, id])}/><span>{item.name}<small>{item.job} · {item.stage}</small></span></label>})}</div></section>
                <section><h3>4. 展示内容</h3><div className="v2-check-list">{([['summary','招聘数据概览'],['jobs','岗位招聘进度'],['stages','面试阶段统计'],['candidates','候选人摘要']] as const).map(([key,label]) => <label key={key}><input type="checkbox" checked={shareSections[key]} onChange={() => setShareSections((value) => ({ ...value, [key]: !value[key] }))}/><span>{label}</span></label>)}</div></section>
                <section><h3>5. 隐私与有效期</h3><label className="v2-switch-line"><input type="checkbox" checked={shareAnonymize} onChange={(event) => setShareAnonymize(event.target.checked)}/><span>候选人姓名匿名显示</span></label><label className="v2-share-expiry"><span>链接有效期</span><select value={shareExpiry} onChange={(event) => setShareExpiry(event.target.value)}><option value="1d">24 小时</option><option value="7d">7 天</option><option value="30d">30 天</option><option value="never">长期有效</option></select></label></section>
              </> : <>
                <section className="wide"><h3>2. 按员工阶段选择</h3><p className="v2-section-help">员工与招聘候选人分开管理。可按阶段整组选取，也可单独选择员工。</p><div className="v2-employee-share-groups">{employeeShareGroups.map((group) => { const ids=group.items.map((item) => item.id); const allSelected=ids.every((id) => shareEmployees.includes(id)); return <article key={group.title}><header><div><b>{group.title}</b><small>{group.hint}</small></div><button onClick={() => setShareEmployees((current) => allSelected ? current.filter((id) => !ids.includes(id)) : Array.from(new Set([...current, ...ids])))}>{allSelected ? '取消全选' : `全选 ${group.items.length} 人`}</button></header><div className="v2-check-list candidates">{group.items.map((item) => <label key={item.id}><input type="checkbox" checked={shareEmployees.includes(item.id)} onChange={() => toggleSharedEmployee(item.id)}/><span>{item.name}<small>{item.dept} · {item.role}</small></span></label>)}</div></article>})}</div></section>
                <section><h3>3. 展示内容</h3><div className="v2-check-list">{([['departments','部门人数概览'],['employees','员工表现明细']] as const).map(([key,label]) => <label key={key}><input type="checkbox" checked={shareSections[key]} onChange={() => setShareSections((value) => ({ ...value, [key]: !value[key] }))}/><span>{label}</span></label>)}</div></section>
                <section><h3>4. 隐私与有效期</h3><p className="v2-privacy-note">不展示电话、住址和证件信息；接收者只能查看本次选中的员工。</p><label className="v2-share-expiry"><span>链接有效期</span><select value={shareExpiry} onChange={(event) => setShareExpiry(event.target.value)}><option value="1d">24 小时</option><option value="7d">7 天</option><option value="30d">30 天</option><option value="never">长期有效</option></select></label></section>
              </>}
            </div>
            {shareResult && <div className="v2-share-result"><div><b>分享链接已生成</b><small>{shareResult.expiresAt ? `有效至 ${new Date(shareResult.expiresAt).toLocaleString('zh-CN', { hour12: false })}` : '长期有效'}</small></div><input readOnly value={shareResult.lanUrl}/><button onClick={() => navigator.clipboard.writeText(shareResult.lanUrl)}>复制链接</button><button onClick={() => window.open(shareResult.url,'_blank','noopener,noreferrer')}>打开预览</button><button className="danger" onClick={stopShowcase}>停止分享</button><p>同一公司网络的电脑可打开局域网链接；主机需保持工作台运行。</p></div>}
            {!!shareRecords.length && <section className="v2-share-history"><h3>分享记录</h3>{shareRecords.slice(0,10).map((item) => <div className="v2-share-history-item" key={item.token}><article><div><b>{item.title}</b><small>{item.audience} · {new Date(item.createdAt).toLocaleString('zh-CN',{hour12:false})}</small></div><span className={item.status}>{item.status === 'active' ? '分享中' : '已停止'}</span><button onClick={() => navigator.clipboard.writeText(`${lanOrigin || window.location.origin}/showcase?share=${item.token}`)}>复制链接</button><button onClick={() => viewShareFeedback(item.token)}>评价 {item.feedbackCount || 0}</button><button className="danger" onClick={() => deleteShareRecord(item.token)}>删除</button></article>{feedbackRecord === item.token && <div className="v2-share-feedback-list">{shareFeedback.length ? shareFeedback.map((feedback) => <div key={feedback.id}><b>{feedback.candidateName} · {feedback.decision}</b><p>{feedback.comment || '未填写具体意见'}</p><small>{feedback.reviewer} · {new Date(feedback.createdAt).toLocaleString('zh-CN',{hour12:false})}</small></div>) : <p>暂时还没有收到评价</p>}</div>}</div>)}</section>}
            <footer><button onClick={() => setShareCenterOpen(false)}>取消</button><button onClick={() => generateShowcase(true)}>生成并预览</button><button className="dark" onClick={() => generateShowcase(false)}>生成分享链接</button></footer>
          </section>
        </div>
      )}

      {jobCreatorOpen && (
        <div
          className="v2-overlay search"
          onMouseDown={() => setJobCreatorOpen(false)}
        >
          <section
            className="v2-job-creator"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <span className="eyebrow">OPEN POSITION</span>
                <h2>新建招聘岗位</h2>
                <p>完善岗位和部门信息，创建后会直接出现在岗位人才库。</p>
              </div>
              <button
                className="v2-close"
                onClick={() => setJobCreatorOpen(false)}
              >
                ×
              </button>
            </header>
            <div className="v2-job-creator-form">
              <label className="wide">
                岗位名称
                <input
                  autoFocus
                  value={jobName}
                  onChange={(event) => setJobName(event.target.value)}
                  placeholder="例如：海外销售经理"
                  onKeyDown={(event) =>
                    event.key === "Enter" && jobName.trim() && createJob()
                  }
                />
              </label>
              <label>
                所属部门
                <input
                  value={jobDepartment}
                  onChange={(event) => setJobDepartment(event.target.value)}
                  placeholder="例如：海外事业部"
                />
              </label>
              <fieldset className="v2-color-picker">
                <legend>卡片标识色</legend>
                <div>
                  {[
                    ["graphite", "石墨"],
                    ["blue", "海蓝"],
                    ["sky", "天青"],
                    ["mint", "薄荷"],
                    ["lime", "青柠"],
                    ["gold", "暖金"],
                    ["coral", "珊瑚"],
                    ["violet", "鸢尾"],
                  ].map(([value, label]) => (
                    <button
                      type="button"
                      key={value}
                      className={`${value} ${jobColor === value ? "selected" : ""}`}
                      onClick={() => setJobColor(value)}
                      aria-label={`选择${label}`}
                    >
                      <i />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
            <div className={`v2-job-preview ${jobColor}`}>
              <small>创建后预览</small>
              <b>{jobName.trim() || "岗位名称"}</b>
              <span>{jobDepartment.trim() || "所属部门"} · 0份简历</span>
            </div>
            <footer>
              <button onClick={() => setJobCreatorOpen(false)}>取消</button>
              <button
                className="dark"
                disabled={!jobName.trim()}
                onClick={createJob}
              >
                创建岗位
              </button>
            </footer>
          </section>
        </div>
      )}
      {searchOpen && (
        <div
          className="v2-overlay search"
          onMouseDown={() => setSearchOpen(false)}
        >
          <section
            className="v2-search-panel"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <span className="eyebrow">全库检索</span>
                <h2>搜索人才</h2>
                <p>姓名、岗位、城市、标签、阶段和跟进备注都可以搜索。</p>
              </div>
              <button className="v2-close" onClick={() => setSearchOpen(false)}>
                ×
              </button>
            </header>
            <div className="v2-search-box">
              <span>⌕</span>
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="例如：欧美市场、深圳、产品经理、Offer"
              />
              <button onClick={() => setSearchQuery("")}>清空</button>
            </div>
            <div className="v2-search-stages">
              {stageNames.map((item) => (
                <button
                  className={searchStage === item ? "active" : ""}
                  key={item}
                  onClick={() => setSearchStage(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="v2-search-summary">
              <b>{searchResults.length}</b>
              <span>位匹配人才</span>
              {searchQuery && <small>关键词“{searchQuery}”</small>}
            </div>
            <div className="v2-search-results">
              {searchResults.map((person) => (
                <button
                  key={`${person.job}-${person.name}`}
                  onClick={() => openSearchResult(person)}
                >
                  <span className="avatar">{person.name[0]}</span>
                  <div className="identity">
                    <b>{person.name}</b>
                    <small>
                      {person.job} · {person.meta}
                    </small>
                    <p>{person.note}</p>
                  </div>
                  <div className="tags">
                    {person.tags.slice(0, 3).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <em>{person.stage}</em>
                  <strong>查看 →</strong>
                </button>
              ))}
              {!searchResults.length && (
                <div className="v2-search-empty">
                  <b>没有找到匹配人才</b>
                  <p>可以减少关键词，或切换为“全部”阶段再试。</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
      {tagPicker && (
        <div className="v2-overlay" onMouseDown={() => setTagPicker(false)}>
          <section
            className="v2-tag-drawer"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="v2-close" onClick={() => setTagPicker(false)}>
              ×
            </button>
            <span className="eyebrow">简历标签</span>
            <h2>选择或新建标签</h2>
            <p>标签可以重复使用，也可以多选；以后可直接按标签筛选人才。</p>
            <div className="v2-tag-options">
              {tags.map((tag) => (
                <button
                  key={tag}
                  className={selectedTags.includes(tag) ? "selected" : ""}
                  onClick={() => toggleTag(tag)}
                >
                  {selectedTags.includes(tag) ? "✓ " : "＋ "}
                  {tag}
                </button>
              ))}
            </div>
            <div className="v2-new-tag">
              <input
                value={newTag}
                onChange={(event) => setNewTag(event.target.value)}
                placeholder="输入新标签，例如：东南亚市场"
                onKeyDown={(event) => event.key === "Enter" && addTag()}
              />
              <button onClick={addTag}>新增标签</button>
            </div>
            <footer>
              <span>已选择 {selectedTags.length} 个标签</span>
              <button className="dark" onClick={() => setTagPicker(false)}>
                确认标签
              </button>
            </footer>
          </section>
        </div>
      )}
      {saved && <div className="v2-toast">✓ {saveNotice}</div>}
    </main>
  );
}

function JobsView({
  jobItems,
  candidates: candidateItems,
  job,
  setJob,
  stage,
  setStage,
  openResume,
  openTags,
  saveCandidate,
  deleteCandidate,
  createJob,
}: {
  jobItems: typeof jobs;
  candidates: typeof candidates;
  job: number;
  setJob: (value: number) => void;
  stage: string;
  setStage: (value: string) => void;
  openResume: (person: (typeof candidates)[number]) => void;
  openTags: () => void;
  saveCandidate: (
    person: CandidateRecord,
    changes: Pick<CandidateRecord, "stage" | "note" | "time" | "nextAction">,
  ) => Promise<CandidateRecord>;
  deleteCandidate: (person: CandidateRecord) => Promise<void>;
  createJob: () => void;
}) {
  const [period, setPeriod] = useState("全部时间");
  const [allTalent, setAllTalent] = useState(true);
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-08-25");
  const [quickProfile, setQuickProfile] = useState<CandidateRecord | null>(null);
  const [quickEditing, setQuickEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [quickDraft, setQuickDraft] = useState({
    stage: "",
    note: "",
    time: "",
    nextAction: "",
  });
  const openQuickProfile = (person: CandidateRecord) => {
    setQuickProfile(person);
    setQuickDraft({
      stage: person.stage,
      note: person.note,
      time: person.time,
      nextAction: person.nextAction || nextAction(person.stage),
    });
    setQuickEditing(false);
    setDeleteConfirm(false);
  };
  const jobCandidates = allTalent
    ? candidateItems
    : candidateItems.filter((person) => person.job === jobItems[job]?.name);
  const shown = jobCandidates.filter(
    (person) =>
      (stage === "全部" || person.stage === stage) &&
      matchesTime(person.date, period, startDate, endDate),
  );
  return (
    <>
      <section className="v2-hero">
        <div>
          <span className="eyebrow">招聘进展一目了然</span>
          <h2>
            先看岗位，
            <br />
            再看每一份简历。
          </h2>
        </div>
        <div className="v2-summary">
          <div>
            <small>招聘中岗位</small>
            <b>03</b>
          </div>
          <div>
            <small>本周新简历</small>
            <b>18</b>
          </div>
          <div>
            <small>待反馈</small>
            <b>07</b>
          </div>
        </div>
      </section>
      <section className="v2-master-pool">
        <button
          className={allTalent ? "selected" : ""}
          onClick={() => {
            setAllTalent(true);
            setStage("全部");
          }}
        >
          <div>
            <small>ALL TALENT</small>
            <h3>综合人才库</h3>
            <p>集中查看全部岗位中的候选人，再按状态和时间筛选。</p>
          </div>
          <dl>
            <div><dt>全部人才</dt><dd>{candidateItems.length}</dd></div>
            <div><dt>待筛选</dt><dd>{candidateItems.filter((person) => person.stage === "待筛选").length}</dd></div>
            <div><dt>面试中</dt><dd>{candidateItems.filter((person) => ["初试", "终试"].includes(person.stage)).length}</dd></div>
            <div><dt>Offer</dt><dd>{candidateItems.filter((person) => person.stage === "Offer").length}</dd></div>
          </dl>
          <span>{allTalent ? "当前查看" : "查看全部人才"} →</span>
        </button>
      </section>
      <section className="v2-jobs">
        <div className="v2-section-head">
          <div>
            <small>OPEN POSITIONS</small>
            <h3>招聘岗位</h3>
          </div>
          <button onClick={createJob}>＋ 新建岗位</button>
        </div>
        <div className="v2-job-grid">
          {jobItems.map((item, index) => (
            <button
              className={`v2-job ${item.color} ${!allTalent && job === index ? "selected" : ""}`}
              key={`${item.name}-${index}`}
              onClick={() => {
                setJob(index);
                setAllTalent(false);
              }}
            >
              <div>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <em>招聘中</em>
              </div>
              <h4>{item.name}</h4>
              <p>
                {item.dept} · {item.total}份简历
              </p>
              <dl>
                <div>
                  <dt>待筛选</dt>
                  <dd>{item.pending}</dd>
                </div>
                <div>
                  <dt>初试</dt>
                  <dd>{item.initial}</dd>
                </div>
                <div>
                  <dt>终试</dt>
                  <dd>{item.final}</dd>
                </div>
                <div>
                  <dt>Offer</dt>
                  <dd>{item.offer}</dd>
                </div>
              </dl>
            </button>
          ))}
        </div>
      </section>
      <section className="v2-pool">
        <div className="v2-pool-title">
          <div>
            <small>{allTalent ? "全部岗位" : "当前岗位"}</small>
            <h3>{allTalent ? "综合人才库" : jobItems[job]?.name}</h3>
          </div>
          <span>
            当前显示 {shown.length} / 共 {jobCandidates.length} 位候选人
          </span>
        </div>
        <div className="v2-filter-stack">
          <div className="v2-time-control">
            <small>按时间</small>
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
            >
              {timeOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            {period === "自定义日期" && (
              <div className="v2-custom-dates">
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
                <span>至</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>
            )}
          </div>
          <div>
            <small>按状态</small>
            <div className="v2-stage-tabs">
              {stageNames.map((item) => (
                <button
                  className={stage === item ? "active" : ""}
                  key={item}
                  onClick={() => setStage(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="v2-candidate-list">
          {shown.length ? (
            shown.map((person, index) => (
              <article
                key={person.name}
                className="v2-candidate-row-link"
                onClick={() => openQuickProfile(person)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openQuickProfile(person);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`查看${person.name}的人才摘要`}
              >
                <button
                  className="v2-person-link"
                  onClick={() => openQuickProfile(person)}
                  aria-label={`打开${person.name}的人才档案`}
                >
                  <span className="v2-avatar">{person.name[0]}</span>
                  <span className="v2-person">
                    <h4>{person.name}</h4>
                    <p>{person.meta}</p>
                  </span>
                </button>
                <div className="v2-tags">
                  {person.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      openTags();
                    }}
                    aria-label={`给${person.name}添加标签`}
                  >
                    ＋
                  </button>
                </div>
                <div className="v2-note">
                  <small>
                    {person.updated} · 下一节点 {person.time}
                  </small>
                  <p>{person.note}</p>
                </div>
                <span className={`v2-status s${index}`}>{person.stage}</span>
                <button
                  className="v2-more"
                  onClick={(event) => {
                    event.stopPropagation();
                    openResume(person);
                  }}
                >
                  查看档案 →
                </button>
              </article>
            ))
          ) : (
            <div className="v2-empty-row">该时间与状态下暂时没有候选人</div>
          )}
        </div>
      </section>
      {quickProfile && (
        <div
          className="v2-overlay centered"
          onMouseDown={() => setQuickProfile(null)}
        >
          <section
            className="v2-candidate-preview"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div className="v2-preview-identity">
                <span>{quickProfile.name[0]}</span>
                <div>
                  <small>人才摘要</small>
                  <h2>{quickProfile.name}</h2>
                  <p>
                    {quickProfile.job} · {quickProfile.meta}
                  </p>
                </div>
              </div>
              <button className="v2-close" onClick={() => setQuickProfile(null)}>
                ×
              </button>
            </header>
            <div className="v2-preview-tags">
              {quickProfile.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <div className="v2-preview-toolbar">
              <span>系统已根据招聘阶段生成建议，人事可以按实际情况修改。</span>
              {!quickEditing && (
                <button onClick={() => setQuickEditing(true)}>编辑建议</button>
              )}
            </div>
            {quickEditing ? (
              <div className="v2-preview-editor">
                <label>
                  当前招聘进度
                  <select
                    value={quickDraft.stage}
                    onChange={(event) => {
                      const nextStage = event.target.value;
                      setQuickDraft((current) => ({
                        ...current,
                        stage: nextStage,
                        nextAction: nextAction(nextStage),
                      }));
                    }}
                  >
                    {stageNames.filter((item) => item !== "全部").map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <small>{stageMeaning(quickDraft.stage)}</small>
                </label>
                <label>
                  最近一次跟进记录
                  <textarea
                    value={quickDraft.note}
                    onChange={(event) =>
                      setQuickDraft((current) => ({ ...current, note: event.target.value }))
                    }
                  />
                </label>
                <label className="wide">
                  下一步安排
                  <textarea
                    value={quickDraft.nextAction}
                    onChange={(event) =>
                      setQuickDraft((current) => ({
                        ...current,
                        nextAction: event.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setQuickDraft((current) => ({
                        ...current,
                        nextAction: nextAction(current.stage),
                      }))
                    }
                  >
                    恢复系统建议
                  </button>
                </label>
                <label className="wide">
                  计划时间
                  <input
                    value={quickDraft.time}
                    onChange={(event) =>
                      setQuickDraft((current) => ({ ...current, time: event.target.value }))
                    }
                    placeholder="例如：8月26日 14:00"
                  />
                </label>
              </div>
            ) : (
              <>
                <div className="v2-preview-facts">
                  <div>
                    <small>当前招聘进度</small>
                    <b>{quickProfile.stage}</b>
                    <span>{stageMeaning(quickProfile.stage)}</span>
                  </div>
                  <div>
                    <small>最近一次跟进</small>
                    <b>{quickProfile.updated}</b>
                    <span>{quickProfile.note}</span>
                  </div>
                  <div>
                    <small>下一步安排</small>
                    <b>{quickProfile.nextAction || nextAction(quickProfile.stage)}</b>
                    <span>计划时间：{quickProfile.time}</span>
                  </div>
                </div>
                <section className="v2-preview-note">
                  <small>人事现在需要做什么</small>
                  <p>
                    {quickProfile.nextAction || nextAction(quickProfile.stage)}，完成后及时更新招聘阶段和记录。
                  </p>
                </section>
              </>
            )}
            <footer>
              {quickEditing ? (
                <>
                  <button onClick={() => setQuickEditing(false)}>取消编辑</button>
                  <button
                    className="dark"
                    onClick={async () => {
                      const saved = await saveCandidate(quickProfile, quickDraft);
                      setQuickProfile(saved);
                      setQuickEditing(false);
                    }}
                  >
                    保存修改
                  </button>
                </>
              ) : (
                <>
                  {deleteConfirm ? (
                    <div className="v2-delete-confirm">
                      <span>确定从人才库删除“{quickProfile.name}”吗？删除后无法恢复。</span>
                      <button onClick={() => setDeleteConfirm(false)}>取消</button>
                      <button className="danger" onClick={async () => {
                        await deleteCandidate(quickProfile);
                        setQuickProfile(null);
                        setDeleteConfirm(false);
                      }}>确认删除</button>
                    </div>
                  ) : (
                    <button className="danger" onClick={() => setDeleteConfirm(true)}>删除人才</button>
                  )}
                  {!deleteConfirm && <button onClick={() => setQuickProfile(null)}>先关闭</button>}
                  <button
                    className="dark"
                    disabled={deleteConfirm}
                    onClick={() => {
                      const person = quickProfile;
                      setQuickProfile(null);
                      openResume(person);
                    }}
                  >
                    进入完整档案
                  </button>
                </>
              )}
            </footer>
          </section>
        </div>
      )}
    </>
  );
}

function ResumeImport({
  fileName,
  choose,
}: {
  fileName: string;
  choose: (resume: ParsedResume) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const acceptFile = async (file?: File) => {
    if (!file || busy) return;
    if (!/\.(pdf|doc|docx|png|jpe?g|xlsx?|csv|txt|rtf)$/i.test(file.name)) {
      setError(
        "暂不支持该格式，请使用 PDF、Word、图片、Excel、CSV、TXT 或 RTF。",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      choose(await readActualResume(file));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "简历导入失败");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="v2-resume-start">
      <div className="v2-resume-copy">
        <span className="eyebrow">真实文件 · 本地识别</span>
        <h2>把现有简历直接放进来。</h2>
        <p>
          原文件先保存到本地，再从这份文件提取真实内容；无法识别时会明确要求人工补录，不再显示模拟简历。
        </p>
      </div>
      <div className="v2-import-card">
        <label
          className={`v2-real-drop ${busy ? "busy" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            event.currentTarget.classList.add("dragging");
          }}
          onDragLeave={(event) =>
            event.currentTarget.classList.remove("dragging")
          }
          onDrop={(event) => {
            event.preventDefault();
            event.currentTarget.classList.remove("dragging");
            acceptFile(event.dataTransfer.files?.[0]);
          }}
        >
          <input
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.xls,.csv,.txt,.rtf"
            onChange={(event) => acceptFile(event.target.files?.[0])}
            disabled={busy}
          />
          <b>{busy ? "…" : "↥"}</b>
          <h3>
            {busy
              ? `正在读取 ${fileName || "简历"}`
              : fileName || "选择或拖入一份简历"}
          </h3>
          <p>{busy ? "正在本机保存并提取真实内容" : "松开鼠标即可导入"}</p>
          <span>{busy ? "请稍候" : "选择文件"}</span>
        </label>
        <div className="v2-file-ready">
          <b>真实导入流程</b>
          <ul>
            <li>保存原始文件到 resumes</li>
            <li>提取文件中的真实文字</li>
            <li>人工核对姓名、岗位与联系方式</li>
            <li>保存为人才档案</li>
          </ul>
        </div>
      </div>
      {error && <div className="v2-import-error">{error}</div>}
      <small className="v2-privacy">
        所有解析均在本机进行；图片或扫描件可能需要人工补录。
      </small>
    </section>
  );
}

function ResumeEditor({
  resume,
  jobOptions,
  createMatchedJob,
  selectedTags,
  openTags,
  exitLabel,
  onExit,
  saved,
}: {
  resume: ParsedResume;
  jobOptions: string[];
  createMatchedJob: (name: string) => Promise<string>;
  selectedTags: string[];
  openTags: () => void;
  exitLabel: string;
  onExit: () => void;
  saved: (resume: ParsedResume) => void | Promise<void>;
}) {
  const [draft, setDraft] = useState(resume);
  const [addingJob, setAddingJob] = useState(false);
  const [newMatchedJob, setNewMatchedJob] = useState("");
  const [creatingJob, setCreatingJob] = useState(false);
  const update = (field: keyof ParsedResume, value: string) =>
    setDraft((item) => ({ ...item, [field]: value }));
  const exportWord = () => {
    const escape = (value: string) =>
      value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>");
    const html = `<html><meta charset="utf-8"><body><h1>${escape(draft.name)}</h1><p>${escape(draft.job)} · ${escape(draft.city)} · ${draft.years ? `${draft.years}年经验` : ""}</p><p>${escape(draft.phone)} ${escape(draft.email)}</p><h2>职业概述</h2><p>${escape(draft.summary)}</p><h2>核心能力</h2><p>${escape(draft.skillsText || selectedTags.join("、"))}</p><h2>工作经历</h2><p>${escape(draft.experience)}</p><h2>教育经历</h2><p>${escape(draft.education)}</p><h2>语言能力</h2><p>${escape(draft.languages)}</p></body></html>`;
    const url = URL.createObjectURL(
      new Blob([html], { type: "application/msword;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${draft.name || "候选人"}_整理版简历.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section className="v2-editor-page">
      <div className="v2-editor-head">
        <div>
          <button className="v2-editor-back" onClick={onExit}>‹ {exitLabel}</button>
          <span className="eyebrow">真实文件已读取 · 请人工检查</span>
          <h2>{draft.name || "待补录姓名"}的简历</h2>
          <p>
            来源文件：{draft.fileName}。左侧为实际提取文字，右侧字段均可修改。
          </p>
        </div>
        <div>
          <button onClick={exportWord}>导出 Word</button>
          <button className="dark" onClick={() => saved(draft)}>
            保存简历
          </button>
        </div>
      </div>
      {draft.parseWarning && (
        <div className="v2-parse-warning">{draft.parseWarning}</div>
      )}
      <div className="v2-editor-grid">
        <aside className="v2-original">
          <small>原文件提取内容</small>
          <div className="v2-paper actual">
            <b>{draft.fileName}</b>
            <pre>
              {draft.rawText ||
                "当前文件没有可提取文字。原文件已经保存，请根据原文件在右侧人工录入。"}
            </pre>
          </div>
        </aside>
        <div className="v2-form">
          <div className="v2-form-title">
            <h3>标准人才档案</h3>
            <span>{draft.rawText ? "来自真实文件" : "待人工补录"}</span>
          </div>
          <div className="v2-form-grid">
            <label>
              姓名
              <input
                value={draft.name}
                onChange={(event) => update("name", event.target.value)}
              />
            </label>
            <label>
              联系电话
              <input
                value={draft.phone}
                onChange={(event) => update("phone", event.target.value)}
              />
            </label>
            <label>
              邮箱
              <input
                value={draft.email}
                onChange={(event) => update("email", event.target.value)}
              />
            </label>
            <label>
              城市
              <input
                value={draft.city}
                onChange={(event) => update("city", event.target.value)}
              />
            </label>
            <label>
              工作年限
              <input
                value={draft.years}
                onChange={(event) =>
                  update("years", event.target.value.replace(/\D/g, ""))
                }
                placeholder="数字"
              />
            </label>
            <label>
              匹配岗位
              <select
                value={draft.job}
                onChange={(event) => {
                  if (event.target.value === "__new__") setAddingJob(true);
                  else update("job", event.target.value);
                }}
              >
                {jobOptions.map((item) => <option key={item}>{item}</option>)}
                <option value="__new__">＋ 新建岗位</option>
              </select>
              {addingJob && (
                <span className="v2-inline-create">
                  <input value={newMatchedJob} onChange={(event) => setNewMatchedJob(event.target.value)} placeholder="输入新岗位名称" autoFocus />
                  <button type="button" disabled={!newMatchedJob.trim() || creatingJob} onClick={async () => {
                    setCreatingJob(true);
                    try {
                      const name = await createMatchedJob(newMatchedJob.trim());
                      update("job", name);
                      setNewMatchedJob("");
                      setAddingJob(false);
                    } finally {
                      setCreatingJob(false);
                    }
                  }}>{creatingJob ? "创建中" : "创建并选择"}</button>
                  <button type="button" onClick={() => { setAddingJob(false); setNewMatchedJob(""); }}>取消</button>
                </span>
              )}
            </label>
            <label>
              初始招聘阶段
              <select value={draft.stage} onChange={(event) => update("stage", event.target.value)}>
                {["待筛选", "初试", "终试", "Offer", "筛选不合格", "可再联系"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="wide">
              当前公司
              <input
                value={draft.company}
                onChange={(event) => update("company", event.target.value)}
              />
            </label>
            <label className="wide">
              职业概述
              <textarea
                value={draft.summary}
                onChange={(event) => update("summary", event.target.value)}
                placeholder="概括候选人的经验方向、行业背景和主要优势"
              />
            </label>
            <label className="wide">
              核心能力与技能
              <textarea
                value={draft.skillsText}
                onChange={(event) => update("skillsText", event.target.value)}
                placeholder="例如：B2B、欧美市场、渠道管理、团队管理"
              />
            </label>
            <label className="wide">
              工作经历
              <textarea
                className="tall"
                value={draft.experience}
                onChange={(event) => update("experience", event.target.value)}
                placeholder="按公司、岗位、任职时间和工作成果整理"
              />
            </label>
            <label className="wide">
              教育经历
              <textarea
                value={draft.education}
                onChange={(event) => update("education", event.target.value)}
                placeholder="学校、专业、学历和时间"
              />
            </label>
            <label className="wide">
              语言能力
              <input
                value={draft.languages}
                onChange={(event) => update("languages", event.target.value)}
                placeholder="例如：英语 C1、西班牙语 B1"
              />
            </label>
            <details className="wide v2-raw-details">
              <summary>查看和校对原始提取文字</summary>
              <textarea
                value={draft.rawText}
                onChange={(event) => update("rawText", event.target.value)}
              />
            </details>
          </div>
          <div className="v2-selected-tags">
            <div>
              <small>人才标签（可多选）</small>
              <div>
                {selectedTags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
            <button onClick={openTags}>管理标签 ＋</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function PipelineView({
  jobs: jobItems,
  candidates: candidateItems,
  openCandidate,
  onCandidateAdded,
}: {
  jobs: typeof jobs;
  candidates: typeof candidates;
  openCandidate: (person: (typeof candidates)[number]) => void;
  onCandidateAdded: (person: (typeof candidates)[number]) => void;
}) {
  const [selectedJob, setSelectedJob] = useState("海外销售经理");
  const [period, setPeriod] = useState("本周");
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-08-25");
  const [recordDetail, setRecordDetail] = useState<{
    person: (typeof candidates)[number];
    stage: string;
  } | null>(null);
  const [candidateCreatorStage, setCandidateCreatorStage] = useState<
    string | null
  >(null);
  const [candidateDraft, setCandidateDraft] = useState({
    name: "",
    meta: "",
    time: "待安排",
    note: "",
    tags: "",
  });
  const pipelinePeople = candidateItems.filter(
    (person) =>
      person.job === selectedJob &&
      matchesTime(person.date, period, startDate, endDate),
  );
  const columns = ["初试", "终试", "Offer", "筛选不合格", "可再联系"].map(
    (name) => ({
      name,
      people: pipelinePeople.filter((person) => person.stage === name),
    }),
  );
  const showRecord = (
    person: (typeof candidates)[number],
    stage: string,
  ) => setRecordDetail({ person, stage });
  const addCandidate = async () => {
    if (!candidateCreatorStage || !candidateDraft.name.trim()) return;
    const person = await previewApi("/candidates", {
      method: "POST",
      body: JSON.stringify({
        name: candidateDraft.name.trim(),
        job: selectedJob,
        meta: candidateDraft.meta.trim() || "待补充城市与经验",
        tags: candidateDraft.tags
          .split(/[、,，]/)
          .map((item) => item.trim())
          .filter(Boolean),
        stage: candidateCreatorStage,
        date: "2026-08-25",
        time: candidateDraft.time.trim() || "待安排",
        updated: "刚刚",
        note: candidateDraft.note.trim() || "由招聘流程新增，待补充记录",
        nextAction: nextAction(candidateCreatorStage),
      }),
    });
    onCandidateAdded(person);
    setCandidateDraft({ name: "", meta: "", time: "待安排", note: "", tags: "" });
    setCandidateCreatorStage(null);
  };
  const stageMeta: Record<string, { code: string; desc: string }> = {
    初试: { code: "01", desc: "等待或进行首轮沟通" },
    终试: { code: "02", desc: "进入最终业务评估" },
    Offer: { code: "03", desc: "待确认录用与入职" },
    筛选不合格: { code: "04", desc: "本岗位停止推进" },
    可再联系: { code: "05", desc: "保留人才，定时唤回" },
  };
  return (
    <section className="v2-pipeline">
      <div className="v2-pipeline-intro">
        <span className="eyebrow">时间 → 岗位 → 面试状态</span>
        <h2>面试记录</h2>
        <p>
          先选择统计时间和招聘岗位，再查看
          Offer、终试、初试、筛选不合格与可再联系记录。
        </p>
      </div>
      <div className="v2-pipeline-filters">
        <label>
          时间范围
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          >
            {timeOptions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          招聘岗位
          <select
            value={selectedJob}
            onChange={(event) => setSelectedJob(event.target.value)}
          >
            {jobItems.map((job) => (
              <option key={job.name}>{job.name}</option>
            ))}
          </select>
        </label>
        <div>
          <small>当前查看</small>
          <b>
            {period} · {selectedJob}
          </b>
        </div>
        {period === "自定义日期" && (
          <div className="v2-custom-dates wide">
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
            <span>至</span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
        )}
      </div>
      <div className="v2-board five">
        {columns.map((column, index) => (
          <section className={`v2-column stage-${index}`} key={column.name}>
            <header>
              <div>
                <small>{stageMeta[column.name].code}</small>
                <b>{column.name}</b>
                <em>{stageMeta[column.name].desc}</em>
              </div>
              <span>{column.people.length} 人</span>
            </header>
            {column.people.map((person) => (
              <article
                className="v2-pipeline-card"
                key={`${column.name}-${person.name}`}
                role="button"
                tabIndex={0}
                aria-label={`查看${person.name}的${column.name}记录`}
                onClick={() => showRecord(person, column.name)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    showRecord(person, column.name);
                  }
                }}
              >
                <button
                  className="v2-pipeline-person-link"
                  onClick={(event) => {
                    event.stopPropagation();
                    openCandidate(person);
                  }}
                  onKeyDown={(event) => event.stopPropagation()}
                  aria-label={`打开${person.name}的人才档案`}
                >
                  <span>{person.name[0]}</span>
                  <b>{person.name}</b>
                </button>
                <small>{person.time}</small>
                <p>
                  {column.name === "筛选不合格"
                    ? "经验方向暂不匹配"
                    : column.name === "可再联系"
                      ? "建议到期重新联系"
                      : selectedJob}
                </p>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    showRecord(person, column.name);
                  }}
                >
                  查看记录 →
                </button>
              </article>
            ))}
            <button
              className="v2-add-card"
              onClick={() => setCandidateCreatorStage(column.name)}
            >
              ＋ 添加候选人
            </button>
          </section>
        ))}
      </div>
      {candidateCreatorStage && (
        <div
          className="v2-overlay centered"
          onMouseDown={() => setCandidateCreatorStage(null)}
        >
          <section
            className="v2-employee-creator v2-candidate-creator"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <span className="eyebrow">ADD CANDIDATE</span>
                <h2>添加候选人</h2>
                <p>
                  将候选人添加到“{selectedJob}”的“{candidateCreatorStage}”阶段。
                </p>
              </div>
              <button
                className="v2-close"
                onClick={() => setCandidateCreatorStage(null)}
              >
                ×
              </button>
            </header>
            <div className="v2-creator-context">
              <div>
                <small>招聘岗位</small>
                <b>{selectedJob}</b>
              </div>
              <div>
                <small>进入阶段</small>
                <b>{candidateCreatorStage}</b>
              </div>
            </div>
            <div className="v2-creator-grid">
              <label>
                候选人姓名
                <input
                  autoFocus
                  value={candidateDraft.name}
                  onChange={(event) =>
                    setCandidateDraft((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="请输入姓名"
                />
              </label>
              <label>
                城市与经验
                <input
                  value={candidateDraft.meta}
                  onChange={(event) =>
                    setCandidateDraft((current) => ({ ...current, meta: event.target.value }))
                  }
                  placeholder="例如：深圳 · 6年经验"
                />
              </label>
              <label className="wide">
                人才标签
                <input
                  value={candidateDraft.tags}
                  onChange={(event) =>
                    setCandidateDraft((current) => ({ ...current, tags: event.target.value }))
                  }
                  placeholder="用顿号分隔，例如：B2B、欧美市场、团队管理"
                />
              </label>
              <label>
                下一次跟进时间
                <input
                  value={candidateDraft.time}
                  onChange={(event) =>
                    setCandidateDraft((current) => ({ ...current, time: event.target.value }))
                  }
                  placeholder="例如：8月28日 14:00"
                />
              </label>
              <label>
                系统建议
                <input value={nextAction(candidateCreatorStage)} readOnly />
              </label>
              <label className="wide">
                最近记录或备注
                <textarea
                  value={candidateDraft.note}
                  onChange={(event) =>
                    setCandidateDraft((current) => ({ ...current, note: event.target.value }))
                  }
                  placeholder="记录沟通情况、判断依据或后续注意事项"
                />
              </label>
            </div>
            <footer>
              <button onClick={() => setCandidateCreatorStage(null)}>取消</button>
              <button
                className="dark"
                disabled={!candidateDraft.name.trim()}
                onClick={addCandidate}
              >
                保存候选人
              </button>
            </footer>
          </section>
        </div>
      )}
      {recordDetail && (
        <div
          className="v2-overlay centered"
          onMouseDown={() => setRecordDetail(null)}
        >
          <section
            className="v2-record-detail"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <span className="eyebrow">INTERVIEW RECORD</span>
                <h2>{recordDetail.person.name}的面试记录</h2>
                <p>
                  {recordDetail.person.job} · 当前阶段 {recordDetail.stage}
                </p>
              </div>
              <button className="v2-close" onClick={() => setRecordDetail(null)}>
                ×
              </button>
            </header>
            <div className="v2-record-summary">
              <div>
                <small>面试阶段</small>
                <b>{recordDetail.stage}</b>
              </div>
              <div>
                <small>面试或跟进时间</small>
                <b>{recordDetail.person.time}</b>
              </div>
              <div>
                <small>最近更新</small>
                <b>{recordDetail.person.updated}</b>
              </div>
            </div>
            <section className="v2-record-note">
              <small>最近记录</small>
              <p>{recordDetail.person.note}</p>
            </section>
            <section className="v2-record-next">
              <small>下一步</small>
              <p>
                {recordDetail.stage === "筛选不合格"
                  ? "本岗位停止推进，保留筛选结论。"
                  : recordDetail.stage === "可再联系"
                    ? `按计划在 ${recordDetail.person.time} 重新联系。`
                    : "等待人事录入本轮结论，并安排下一阶段。"}
              </p>
            </section>
            <footer>
              <button onClick={() => setRecordDetail(null)}>关闭</button>
              <button
                className="dark"
                onClick={() => {
                  const person = recordDetail.person;
                  setRecordDetail(null);
                  openCandidate(person);
                }}
              >
                查看完整人才档案
              </button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}

// Legacy employee view retained while the current data-backed view is stabilized.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function EmployeeView() {
  const [records, setRecords] = useState(mockEmployees);
  const [departmentOptions, setDepartmentOptions] = useState(
    Array.from(new Set(mockEmployees.map((employee) => employee.dept))),
  );
  const [selected, setSelected] = useState<
    (typeof mockEmployees)[number] | null
  >(null);
  const [draft, setDraft] = useState<(typeof mockEmployees)[number] | null>(
    null,
  );
  const [deptFilter, setDeptFilter] = useState("全部部门");
  const [statusFilter, setStatusFilter] = useState("全部状态");
  const [reviewFilter, setReviewFilter] = useState("全部评价");
  const remove = (employee: (typeof mockEmployees)[number]) => {
    if (!window.confirm(`确定删除虚拟员工“${employee.name}”的档案吗？`)) return;
    setRecords((list) => list.filter((item) => item.id !== employee.id));
    if (selected?.id === employee.id) setSelected(null);
  };
  const add = () => {
    const name = window.prompt("请输入虚拟员工姓名");
    if (!name?.trim()) return;
    setRecords((list) => [
      ...list,
      {
        id: Date.now(),
        name: name.trim(),
        dept: "待设置部门",
        role: "待设置岗位",
        joined: "2026-08-25",
        location: "待设置",
        status: "试用期",
        skills: ["待补充"],
        review: "尚未评价",
        manager: "待设置",
        phone: "待设置",
      },
    ]);
  };
  const addDepartment = () => {
    const name = window.prompt("请输入新部门名称");
    if (!name?.trim() || departmentOptions.includes(name.trim())) return;
    setDepartmentOptions((list) => [...list, name.trim()]);
    window.alert(`部门“${name.trim()}”已创建`);
  };
  const renameDepartment = (oldName: string) => {
    const name = window.prompt("请输入新的部门名称", oldName);
    if (!name?.trim() || name.trim() === oldName) return;
    setDepartmentOptions((list) =>
      list.map((item) => (item === oldName ? name.trim() : item)),
    );
    setRecords((list) =>
      list.map((employee) =>
        employee.dept === oldName
          ? { ...employee, dept: name.trim() }
          : employee,
      ),
    );
    if (deptFilter === oldName) setDeptFilter(name.trim());
  };
  const deleteDepartment = (name: string) => {
    if (!window.confirm(`删除部门“${name}”？该部门员工将移动到“未分配部门”。`))
      return;
    setDepartmentOptions((list) =>
      Array.from(
        new Set([...list.filter((item) => item !== name), "未分配部门"]),
      ),
    );
    setRecords((list) =>
      list.map((employee) =>
        employee.dept === name ? { ...employee, dept: "未分配部门" } : employee,
      ),
    );
    if (deptFilter === name) setDeptFilter("全部部门");
  };
  const openEmployee = (employee: (typeof mockEmployees)[number]) => {
    setSelected(employee);
    setDraft({ ...employee, skills: [...employee.skills] });
  };
  const updateDraft = (
    field: keyof (typeof mockEmployees)[number],
    value: string | string[],
  ) => setDraft((item) => (item ? { ...item, [field]: value } : item));
  const saveDraft = () => {
    if (!draft) return;
    setRecords((list) =>
      list.map((employee) => (employee.id === draft.id ? draft : employee)),
    );
    setSelected(draft);
    window.alert("员工档案已保存（调试数据，刷新后重置）");
  };
  const filtered = records.filter(
    (employee) =>
      (deptFilter === "全部部门" || employee.dept === deptFilter) &&
      (statusFilter === "全部状态" || employee.status === statusFilter) &&
      (reviewFilter === "全部评价" ||
        (reviewFilter === "待处理" &&
          (employee.review.includes("待") ||
            employee.review.includes("进行中"))) ||
        (reviewFilter === "已完成" &&
          (employee.review.includes("已完成") ||
            employee.review.includes("良好")))),
  );
  const departments = Array.from(
    new Set(filtered.map((employee) => employee.dept)),
  );
  return (
    <section className="v2-employees">
      <div className="v2-employee-controls">
        <div>
          <label>
            部门
            <select
              value={deptFilter}
              onChange={(event) => setDeptFilter(event.target.value)}
            >
              <option>全部部门</option>
              {departmentOptions.map((dept) => (
                <option key={dept}>{dept}</option>
              ))}
            </select>
          </label>
          <label>
            员工状态
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>全部状态</option>
              <option>试用期</option>
              <option>正式员工</option>
            </select>
          </label>
          <label>
            评价状态
            <select
              value={reviewFilter}
              onChange={(event) => setReviewFilter(event.target.value)}
            >
              <option>全部评价</option>
              <option>待处理</option>
              <option>已完成</option>
            </select>
          </label>
        </div>
        <div className="v2-control-actions">
          <button onClick={addDepartment}>＋ 新增部门</button>
          <button className="dark" onClick={add}>
            ＋ 新增员工
          </button>
        </div>
      </div>
      <div className="v2-employee-stats">
        <div>
          <small>当前档案</small>
          <b>{filtered.length}</b>
        </div>
        <div>
          <small>试用期</small>
          <b>{filtered.filter((item) => item.status === "试用期").length}</b>
        </div>
        <div>
          <small>待完成评价</small>
          <b>
            {
              filtered.filter(
                (item) =>
                  item.review.includes("待") || item.review.includes("进行中"),
              ).length
            }
          </b>
        </div>
      </div>
      {departments.map((department) => (
        <section className="v2-dept-group" key={department}>
          <header>
            <div>
              <small>DEPARTMENT</small>
              <h3>{department}</h3>
            </div>
            <div className="v2-dept-actions">
              <span>
                {
                  filtered.filter((employee) => employee.dept === department)
                    .length
                }{" "}
                份档案
              </span>
              <button onClick={() => renameDepartment(department)}>
                重命名
              </button>
              <button
                className="danger"
                onClick={() => deleteDepartment(department)}
              >
                删除部门
              </button>
            </div>
          </header>
          <div className="v2-employee-grid">
            {filtered
              .filter((employee) => employee.dept === department)
              .map((employee, index) => (
                <article
                  className={index === 1 ? "featured" : ""}
                  key={employee.id}
                >
                  <header>
                    <span>{employee.name[0]}</span>
                    <div>
                      <h3>{employee.name}</h3>
                      <p>{employee.role}</p>
                    </div>
                    <em>{employee.status}</em>
                  </header>
                  <dl>
                    <div>
                      <dt>入职时间</dt>
                      <dd>{employee.joined}</dd>
                    </div>
                    <div>
                      <dt>工作地点</dt>
                      <dd>{employee.location}</dd>
                    </div>
                    <div>
                      <dt>直属负责人</dt>
                      <dd>{employee.manager}</dd>
                    </div>
                  </dl>
                  <div className="v2-skill-row">
                    {employee.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                  <div className="v2-review">
                    <small>最近评价</small>
                    <b>{employee.review}</b>
                  </div>
                  <footer>
                    <button onClick={() => openEmployee(employee)}>
                      查看与编辑 →
                    </button>
                    <button className="danger" onClick={() => remove(employee)}>
                      删除
                    </button>
                  </footer>
                </article>
              ))}
          </div>
        </section>
      ))}
      {!filtered.length && (
        <div className="v2-empty-row">
          当前分类下没有员工档案，请调整筛选条件。
        </div>
      )}
      {selected && draft && (
        <div className="v2-overlay" onMouseDown={() => setSelected(null)}>
          <section
            className="v2-employee-detail"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="v2-close" onClick={() => setSelected(null)}>
              ×
            </button>
            <span className="eyebrow">员工档案 · 可编辑</span>
            <div className="v2-employee-edit">
              <label>
                姓名
                <input
                  value={draft.name}
                  onChange={(event) => updateDraft("name", event.target.value)}
                />
              </label>
              <label>
                岗位
                <input
                  value={draft.role}
                  onChange={(event) => updateDraft("role", event.target.value)}
                />
              </label>
              <label>
                部门
                <select
                  value={draft.dept}
                  onChange={(event) => updateDraft("dept", event.target.value)}
                >
                  {departmentOptions.map((dept) => (
                    <option key={dept}>{dept}</option>
                  ))}
                </select>
              </label>
              <label>
                员工状态
                <select
                  value={draft.status}
                  onChange={(event) =>
                    updateDraft("status", event.target.value)
                  }
                >
                  <option>试用期</option>
                  <option>正式员工</option>
                  <option>离职</option>
                </select>
              </label>
              <label>
                入职时间
                <input
                  type="date"
                  value={draft.joined}
                  onChange={(event) =>
                    updateDraft("joined", event.target.value)
                  }
                />
              </label>
              <label>
                工作地点
                <input
                  value={draft.location}
                  onChange={(event) =>
                    updateDraft("location", event.target.value)
                  }
                />
              </label>
              <label>
                联系电话
                <input
                  value={draft.phone}
                  onChange={(event) => updateDraft("phone", event.target.value)}
                />
              </label>
              <label>
                直属负责人
                <input
                  value={draft.manager}
                  onChange={(event) =>
                    updateDraft("manager", event.target.value)
                  }
                />
              </label>
              <label className="wide">
                能力标签（使用顿号或逗号分隔）
                <input
                  value={draft.skills.join("、")}
                  onChange={(event) =>
                    updateDraft(
                      "skills",
                      event.target.value
                        .split(/[、,，]/)
                        .map((item) => item.trim())
                        .filter(Boolean),
                    )
                  }
                />
              </label>
              <label className="wide">
                最近周期评价
                <textarea
                  value={draft.review}
                  onChange={(event) =>
                    updateDraft("review", event.target.value)
                  }
                />
              </label>
            </div>
            <h3>历史记录</h3>
            <div className="v2-timeline">
              <p>
                <time>2026 Q3</time>
                <b>{selected.review}</b>
                <span>保存新评价后，正式版会自动保留旧版本。</span>
              </p>
              <p>
                <time>入职记录</time>
                <b>{selected.joined}</b>
                <span>由候选人档案转换生成。</span>
              </p>
            </div>
            <footer>
              <button onClick={() => setSelected(null)}>取消</button>
              <button className="dark" onClick={saveDraft}>
                保存修改
              </button>
              <button className="danger" onClick={() => remove(selected)}>
                删除档案
              </button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}

function EmployeeDepartmentView() {
  type EmployeeRecord = (typeof mockEmployees)[number] & {
    customFields?: Record<string, string>;
  };
  const [records, setRecords] = useState<EmployeeRecord[]>(mockEmployees);
  const [departments, setDepartments] = useState(
    Array.from(new Set(mockEmployees.map((employee) => employee.dept))),
  );
  const [activeDept, setActiveDept] = useState(departments[0]);
  const [status, setStatus] = useState("全部状态");
  const [review, setReview] = useState("全部评价");
  const [draft, setDraft] = useState<EmployeeRecord | null>(null);
  const [reviewType, setReviewType] = useState("月度评价");
  const [reviewDate, setReviewDate] = useState("2026-08-25");
  const [reviewText, setReviewText] = useState("");
  const [reviewEntries, setReviewEntries] = useState<
    Array<{ date: string; type: string; text: string }>
  >([]);
  const [creator, setCreator] = useState<"department" | "employee" | null>(
    null,
  );
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newStatusName, setNewStatusName] = useState("");
  const [configuredStatuses, setConfiguredStatuses] = useState([
    "试用期",
    "正式员工",
    "实习生",
    "外包",
    "离职",
  ]);
  const [visibleEmployeeFields, setVisibleEmployeeFields] = useState([
    "role",
    "location",
    "joined",
  ]);
  const [customEmployeeFields, setCustomEmployeeFields] = useState<
    Array<{ key: string; label: string }>
  >([]);
  const [showFieldSettings, setShowFieldSettings] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    dept: activeDept,
    role: "",
    joined: "2026-08-25",
    location: "",
    status: "试用期",
    customFields: {} as Record<string, string>,
  });
  const employeeStatuses = Array.from(
    new Set([...configuredStatuses, ...records.map((item) => item.status)]),
  ).filter(Boolean);
  useEffect(() => {
    Promise.all([
      previewApi("/employees"),
      previewApi("/departments"),
      previewApi("/settings/employee-form"),
    ])
      .then(([savedEmployees, savedDepartments, savedSettings]) => {
        if (savedEmployees.length) setRecords(savedEmployees);
        if (savedDepartments.length) {
          const names = savedDepartments.map(
            (item: { name: string }) => item.name,
          );
          setDepartments(names);
          setActiveDept((current) =>
            names.includes(current) ? current : names[0],
          );
        }
        if (savedSettings) {
          if (Array.isArray(savedSettings.statuses))
            setConfiguredStatuses(savedSettings.statuses);
          if (Array.isArray(savedSettings.visibleFields))
            setVisibleEmployeeFields(savedSettings.visibleFields);
          if (Array.isArray(savedSettings.customFields))
            setCustomEmployeeFields(savedSettings.customFields);
        }
      })
      .catch((error) => console.error("读取员工档案失败", error));
  }, []);
  const saveEmployeeFormSettings = async (
    statuses = configuredStatuses,
    visibleFields = visibleEmployeeFields,
    customFields = customEmployeeFields,
  ) => {
    await previewApi("/settings/employee-form", {
      method: "PUT",
      body: JSON.stringify({ statuses, visibleFields, customFields }),
    });
  };
  const toggleEmployeeField = async (key: string) => {
    const next = visibleEmployeeFields.includes(key)
      ? visibleEmployeeFields.filter((item) => item !== key)
      : [...visibleEmployeeFields, key];
    setVisibleEmployeeFields(next);
    await saveEmployeeFormSettings(configuredStatuses, next, customEmployeeFields);
  };
  const addCustomEmployeeField = async () => {
    const label = newFieldName.trim();
    if (!label) return;
    const next = [
      ...customEmployeeFields,
      { key: `custom_${Date.now()}`, label },
    ];
    setCustomEmployeeFields(next);
    setNewFieldName("");
    await saveEmployeeFormSettings(configuredStatuses, visibleEmployeeFields, next);
  };
  const removeCustomEmployeeField = async (key: string) => {
    const next = customEmployeeFields.filter((item) => item.key !== key);
    setCustomEmployeeFields(next);
    setNewEmployee((current) => {
      const values = { ...current.customFields };
      delete values[key];
      return { ...current, customFields: values };
    });
    await saveEmployeeFormSettings(configuredStatuses, visibleEmployeeFields, next);
  };
  const colors = ["coral", "lime", "blue", "sage", "gold"];
  const deptRecords = records.filter(
    (employee) =>
      employee.dept === activeDept &&
      (status === "全部状态" || employee.status === status) &&
      (review === "全部评价" ||
        (review === "待处理" &&
          (employee.review.includes("待") ||
            employee.review.includes("进行中"))) ||
        (review === "已完成" &&
          (employee.review.includes("完成") ||
            employee.review.includes("良好")))),
  );
  const addDepartment = async () => {
    const name = newDepartmentName.trim();
    if (name && !departments.includes(name)) {
      const saved = await previewApi("/departments", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setDepartments((list) => [...list, saved.name]);
      setActiveDept(saved.name);
      setNewEmployee((current) => ({ ...current, dept: saved.name }));
      setNewDepartmentName("");
      setCreator(null);
    }
  };
  const renameDepartment = async (oldName: string) => {
    const name = window.prompt("请输入新部门名称", oldName);
    if (!name?.trim()) return;
    const all = await previewApi("/departments");
    const target = all.find(
      (item: { id: number; name: string }) => item.name === oldName,
    );
    if (!target) return;
    await previewApi(`/departments/${target.id}`, {
      method: "PATCH",
      body: JSON.stringify({ name: name.trim() }),
    });
    setDepartments((list) =>
      list.map((item) => (item === oldName ? name.trim() : item)),
    );
    setRecords((list) =>
      list.map((employee) =>
        employee.dept === oldName
          ? { ...employee, dept: name.trim() }
          : employee,
      ),
    );
    setActiveDept(name.trim());
  };
  const deleteDepartment = async (name: string) => {
    if (!window.confirm(`删除“${name}”？员工会移动到未分配部门。`)) return;
    const all = await previewApi("/departments");
    const target = all.find(
      (item: { id: number; name: string }) => item.name === name,
    );
    if (!target) return;
    await previewApi(`/departments/${target.id}`, { method: "DELETE" });
    const fallback = "未分配部门";
    setDepartments((list) =>
      Array.from(new Set([...list.filter((item) => item !== name), fallback])),
    );
    setRecords((list) =>
      list.map((employee) =>
        employee.dept === name ? { ...employee, dept: fallback } : employee,
      ),
    );
    setActiveDept(fallback);
  };
  const addEmployee = async () => {
    const name = newEmployee.name.trim();
    if (!name) return;
    const saved = await previewApi("/employees", {
      method: "POST",
      body: JSON.stringify({
        name,
        dept: newEmployee.dept,
        role: newEmployee.role.trim() || "待设置岗位",
        joined: newEmployee.joined,
        location: newEmployee.location.trim() || "待设置",
        status: newEmployee.status,
        skills: ["待补充"],
        review: "尚未评价",
        manager: "待设置",
        phone: "待设置",
        customFields: newEmployee.customFields,
      }),
    });
    setRecords((list) => [...list, saved]);
    setActiveDept(saved.dept);
    setNewEmployee({
      name: "",
      dept: saved.dept,
      role: "",
      joined: "2026-08-25",
      location: "",
      status: "试用期",
      customFields: {},
    });
    setCreator(null);
  };
  const removeEmployee = async (employee: (typeof mockEmployees)[number]) => {
    if (window.confirm(`确定删除“${employee.name}”的档案吗？`)) {
      await previewApi(`/employees/${employee.id}`, { method: "DELETE" });
      setRecords((list) => list.filter((item) => item.id !== employee.id));
      setDraft(null);
    }
  };
  const update = (
    field: keyof (typeof mockEmployees)[number],
    value: string | string[],
  ) =>
    setDraft((employee) =>
      employee ? { ...employee, [field]: value } : employee,
    );
  const openDraft = (employee: (typeof mockEmployees)[number]) => {
    setDraft({ ...employee, skills: [...employee.skills] });
    setReviewEntries([
      { date: "2026-08-01", type: "最近评价", text: employee.review },
    ]);
    setReviewText("");
  };
  const addReviewEntry = () => {
    const text = reviewText.trim();
    if (!text) return;
    setReviewEntries((list) => [
      { date: reviewDate, type: reviewType, text },
      ...list,
    ]);
    update("review", text);
    setReviewText("");
  };
  const save = async () => {
    if (!draft) return;
    const saved = await previewApi(`/employees/${draft.id}`, {
      method: "PATCH",
      body: JSON.stringify(draft),
    });
    setRecords((list) =>
      list.map((employee) => (employee.id === saved.id ? saved : employee)),
    );
    setDraft(null);
    window.alert("员工档案已保存到本地数据库");
  };
  return (
    <section className="v2-employee-os">
      <div className="v2-section-head employee">
        <div>
          <small>DEPARTMENTS</small>
          <h3>员工部门</h3>
        </div>
        <div>
          <button onClick={() => setCreator("department")}>＋ 新增部门</button>
          <button
            className="dark"
            onClick={() => {
              setNewEmployee((current) => ({ ...current, dept: activeDept }));
              setCreator("employee");
            }}
          >
            ＋ 新增员工
          </button>
        </div>
      </div>
      <div className="v2-department-cards">
        {departments.map((department, index) => {
          const people = records.filter(
            (employee) => employee.dept === department,
          );
          return (
            <article
              className={`${colors[index % colors.length]} ${activeDept === department ? "selected" : ""}`}
              key={department}
            >
              <button
                className="main"
                onClick={() => setActiveDept(department)}
              >
                <div>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <em>{people.length}人</em>
                </div>
                <h3>{department}</h3>
                <p>员工资料与周期评价</p>
                <dl>
                  <div>
                    <dt>员工</dt>
                    <dd>{people.length}</dd>
                  </div>
                  <div>
                    <dt>试用期</dt>
                    <dd>
                      {people.filter((item) => item.status === "试用期").length}
                    </dd>
                  </div>
                  <div>
                    <dt>待评价</dt>
                    <dd>
                      {
                        people.filter(
                          (item) =>
                            item.review.includes("待") ||
                            item.review.includes("进行中"),
                        ).length
                      }
                    </dd>
                  </div>
                </dl>
              </button>
              <footer>
                <button onClick={() => renameDepartment(department)}>
                  重命名
                </button>
                <button onClick={() => deleteDepartment(department)}>
                  删除
                </button>
              </footer>
            </article>
          );
        })}
      </div>
      <section className="v2-employee-list">
        <header>
          <div>
            <small>当前部门</small>
            <h3>{activeDept}</h3>
          </div>
          <span>当前显示 {deptRecords.length} 份员工档案</span>
        </header>
        <div className="v2-employee-list-filters">
          <label>
            员工状态
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option>全部状态</option>
              {employeeStatuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            评价状态
            <select
              value={review}
              onChange={(event) => setReview(event.target.value)}
            >
              <option>全部评价</option>
              <option>待处理</option>
              <option>已完成</option>
            </select>
          </label>
        </div>
        <div className="v2-employee-rows">
          {deptRecords.map((employee) => (
            <article
              key={employee.id}
              className="v2-employee-row-link"
              onClick={() => openDraft(employee)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openDraft(employee);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`打开${employee.name}的员工档案`}
            >
              <button
                className="v2-employee-person-link"
                onClick={() => openDraft(employee)}
                aria-label={`打开${employee.name}的员工档案`}
              >
                <span className="avatar">{employee.name[0]}</span>
                <span className="identity">
                  <b>{employee.name}</b>
                  <small>
                    {employee.role} · {employee.location}
                  </small>
                </span>
              </button>
              <div>
                <small>入职时间</small>
                <b>{employee.joined}</b>
              </div>
              <div>
                <small>能力标签</small>
                <p>
                  {employee.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </p>
              </div>
              <div>
                <small>最近评价</small>
                <b>{employee.review}</b>
              </div>
              <em>{employee.status}</em>
              <button onClick={() => openDraft(employee)}>查看与编辑 →</button>
              <button
                className="delete"
                onClick={(event) => {
                  event.stopPropagation();
                  removeEmployee(employee);
                }}
              >
                删除
              </button>
            </article>
          ))}
        </div>
        {!deptRecords.length && (
          <div className="v2-empty-row">当前分类下没有员工档案</div>
        )}
      </section>
      {creator && (
        <div className="v2-overlay centered" onMouseDown={() => setCreator(null)}>
          <section
            className="v2-employee-creator"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <span className="eyebrow">
                  {creator === "department" ? "NEW DEPARTMENT" : "NEW EMPLOYEE"}
                </span>
                <h2>{creator === "department" ? "新增部门" : "新增员工"}</h2>
                <p>
                  {creator === "department"
                    ? "新部门创建后会立即出现在员工档案分类中。"
                    : "填写基础入职信息，创建后仍可进入员工档案继续完善。"}
                </p>
              </div>
              <button className="v2-close" onClick={() => setCreator(null)}>×</button>
            </header>
            {creator === "department" ? (
              <label className="v2-creator-field">
                部门名称
                <input
                  autoFocus
                  value={newDepartmentName}
                  onChange={(event) => setNewDepartmentName(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && addDepartment()}
                  placeholder="例如：电商运营部"
                />
              </label>
            ) : (
              <div className="v2-creator-grid">
                <div className="v2-field-config-bar">
                  <div>
                    <b>表单字段</b>
                    <small>可以显示、隐藏或新增员工资料字段</small>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFieldSettings((value) => !value)}
                  >
                    {showFieldSettings ? "完成配置" : "配置字段"}
                  </button>
                </div>
                {showFieldSettings && (
                  <section className="v2-field-settings">
                    <h3>选择需要填写的资料</h3>
                    <div className="v2-field-toggles">
                      {[
                        ["role", "岗位"],
                        ["location", "工作地点"],
                        ["joined", "入职日期"],
                      ].map(([key, label]) => (
                        <label key={key}>
                          <input
                            type="checkbox"
                            checked={visibleEmployeeFields.includes(key)}
                            onChange={() => toggleEmployeeField(key)}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                    {customEmployeeFields.map((field) => (
                      <div className="v2-custom-field-row" key={field.key}>
                        <span>{field.label}</span>
                        <button type="button" onClick={() => removeCustomEmployeeField(field.key)}>
                          删除字段
                        </button>
                      </div>
                    ))}
                    <div className="v2-add-field-row">
                      <input
                        value={newFieldName}
                        onChange={(event) => setNewFieldName(event.target.value)}
                        placeholder="新增字段，例如：合同类型"
                      />
                      <button type="button" disabled={!newFieldName.trim()} onClick={addCustomEmployeeField}>
                        添加字段
                      </button>
                    </div>
                  </section>
                )}
                <label>
                  员工姓名
                  <input
                    autoFocus
                    value={newEmployee.name}
                    onChange={(event) =>
                      setNewEmployee((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="请输入姓名"
                  />
                </label>
                <label>
                  所属部门
                  <select
                    value={newEmployee.dept}
                    onChange={(event) =>
                      setNewEmployee((current) => ({ ...current, dept: event.target.value }))
                    }
                  >
                    {departments.map((department) => (
                      <option key={department}>{department}</option>
                    ))}
                  </select>
                </label>
                {visibleEmployeeFields.includes("role") && (
                  <label>
                    岗位
                    <input
                      value={newEmployee.role}
                      onChange={(event) =>
                        setNewEmployee((current) => ({ ...current, role: event.target.value }))
                      }
                      placeholder="例如：品牌运营"
                    />
                  </label>
                )}
                {visibleEmployeeFields.includes("location") && (
                  <label>
                    工作地点
                    <input
                      value={newEmployee.location}
                      onChange={(event) =>
                        setNewEmployee((current) => ({ ...current, location: event.target.value }))
                      }
                      placeholder="例如：深圳"
                    />
                  </label>
                )}
                {visibleEmployeeFields.includes("joined") && (
                  <label>
                    入职日期
                    <input
                      type="date"
                      value={newEmployee.joined}
                      onChange={(event) =>
                        setNewEmployee((current) => ({ ...current, joined: event.target.value }))
                      }
                    />
                  </label>
                )}
                <label>
                  员工状态
                  <select
                    value={newEmployee.status}
                    onChange={(event) => {
                      setNewEmployee((current) => ({ ...current, status: event.target.value }));
                      if (event.target.value !== "__custom__") setNewStatusName("");
                    }}
                  >
                    {employeeStatuses.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                    <option value="__custom__">＋ 新增自定义类别</option>
                  </select>
                  {newEmployee.status === "__custom__" && (
                    <span className="v2-custom-category">
                      <input
                        autoFocus
                        value={newStatusName}
                        onChange={(event) => setNewStatusName(event.target.value)}
                        placeholder="例如：兼职、顾问"
                      />
                      <button
                        type="button"
                        disabled={!newStatusName.trim()}
                        onClick={() => {
                          const value = newStatusName.trim();
                          if (!value) return;
                          const statuses = Array.from(new Set([...configuredStatuses, value]));
                          setConfiguredStatuses(statuses);
                          setNewEmployee((current) => ({ ...current, status: value }));
                          setNewStatusName("");
                          saveEmployeeFormSettings(statuses, visibleEmployeeFields, customEmployeeFields);
                        }}
                      >
                        添加
                      </button>
                    </span>
                  )}
                </label>
                {customEmployeeFields.map((field) => (
                  <label key={field.key}>
                    {field.label}
                    <input
                      value={newEmployee.customFields[field.key] || ""}
                      onChange={(event) =>
                        setNewEmployee((current) => ({
                          ...current,
                          customFields: {
                            ...current.customFields,
                            [field.key]: event.target.value,
                          },
                        }))
                      }
                      placeholder={`填写${field.label}`}
                    />
                  </label>
                ))}
              </div>
            )}
            <footer>
              <button onClick={() => setCreator(null)}>取消</button>
              <button
                className="dark"
                disabled={
                  creator === "department"
                    ? !newDepartmentName.trim() || departments.includes(newDepartmentName.trim())
                    : !newEmployee.name.trim() || newEmployee.status === "__custom__"
                }
                onClick={creator === "department" ? addDepartment : addEmployee}
              >
                {creator === "department" ? "创建部门" : "创建员工档案"}
              </button>
            </footer>
          </section>
        </div>
      )}
      {draft && (
        <div className="v2-overlay" onMouseDown={() => setDraft(null)}>
          <section
            className="v2-employee-detail"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="v2-close" onClick={() => setDraft(null)}>
              ×
            </button>
            <span className="eyebrow">员工档案 · 可编辑</span>
            <div className="v2-employee-edit">
              <label>
                姓名
                <input
                  value={draft.name}
                  onChange={(event) => update("name", event.target.value)}
                />
              </label>
              <label>
                岗位
                <input
                  value={draft.role}
                  onChange={(event) => update("role", event.target.value)}
                />
              </label>
              <label>
                部门
                <select
                  value={draft.dept}
                  onChange={(event) => update("dept", event.target.value)}
                >
                  {departments.map((dept) => (
                    <option key={dept}>{dept}</option>
                  ))}
                </select>
              </label>
              <label>
                状态
                <select
                  value={draft.status}
                  onChange={(event) => update("status", event.target.value)}
                >
                  {employeeStatuses.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                入职时间
                <input
                  type="date"
                  value={draft.joined}
                  onChange={(event) => update("joined", event.target.value)}
                />
              </label>
              <label>
                工作地点
                <input
                  value={draft.location}
                  onChange={(event) => update("location", event.target.value)}
                />
              </label>
              <label>
                联系电话
                <input
                  value={draft.phone}
                  onChange={(event) => update("phone", event.target.value)}
                />
              </label>
              <label>
                直属负责人
                <input
                  value={draft.manager}
                  onChange={(event) => update("manager", event.target.value)}
                />
              </label>
              <label className="wide">
                能力标签
                <input
                  value={draft.skills.join("、")}
                  onChange={(event) =>
                    update(
                      "skills",
                      event.target.value.split(/[、,，]/).filter(Boolean),
                    )
                  }
                />
              </label>
              {customEmployeeFields.map((field) => (
                <label key={field.key}>
                  {field.label}
                  <input
                    value={draft.customFields?.[field.key] || ""}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? {
                              ...current,
                              customFields: {
                                ...(current.customFields || {}),
                                [field.key]: event.target.value,
                              },
                            }
                          : current,
                      )
                    }
                  />
                </label>
              ))}
            </div>
            <section className="v2-review-editor">
              <header>
                <div>
                  <small>PERFORMANCE NOTES</small>
                  <h3>评价记录</h3>
                  <p>每次评价独立保存，方便按时间回看员工成长。</p>
                </div>
                <span>{reviewEntries.length} 条记录</span>
              </header>
              <div className="v2-review-compose">
                <label>
                  评价类型
                  <select
                    value={reviewType}
                    onChange={(event) => setReviewType(event.target.value)}
                  >
                    <option>月度评价</option>
                    <option>季度评价</option>
                    <option>试用期评价</option>
                    <option>年度评价</option>
                    <option>临时反馈</option>
                  </select>
                </label>
                <label>
                  评价日期
                  <input
                    type="date"
                    value={reviewDate}
                    onChange={(event) => setReviewDate(event.target.value)}
                  />
                </label>
                <label className="wide">
                  本次评价
                  <textarea
                    value={reviewText}
                    onChange={(event) => setReviewText(event.target.value)}
                    placeholder="记录工作表现、成果、需要改进的事项和下一阶段目标……"
                  />
                </label>
                <button
                  type="button"
                  onClick={addReviewEntry}
                  disabled={!reviewText.trim()}
                >
                  ＋ 添加本次评价
                </button>
              </div>
              <div className="v2-review-history">
                {reviewEntries.map((entry, index) => (
                  <article key={`${entry.date}-${entry.type}-${index}`}>
                    <div>
                      <time>{entry.date}</time>
                      <span>{entry.type}</span>
                    </div>
                    <p>{entry.text}</p>
                  </article>
                ))}
              </div>
            </section>
            <footer>
              <button onClick={() => setDraft(null)}>取消</button>
              <button className="dark" onClick={save}>
                保存修改
              </button>
              <button className="danger" onClick={() => removeEmployee(draft)}>
                删除档案
              </button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}
