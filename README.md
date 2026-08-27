# PeopleFlow Workspace

一个本地优先、注重隐私的人事招聘与员工档案工作台模板。它覆盖岗位人才库、简历导入、招聘进展、员工档案和受控分享，适合中小团队二次开发或作为内部工具起点。

> 仓库内的姓名、联系方式、简历和业务记录均为虚构演示数据。请勿将真实简历、数据库或环境变量提交到公开仓库。

## 功能

- 综合人才库与按岗位候选人管理
- PDF、Word、Excel、图片简历导入与本地 OCR
- 初试、终试、Offer、不合格和可再联系等招聘进展
- 部门、员工档案、负责人、状态和周期评价
- 招聘进展与员工表现的选择性分享
- 分享有效期、评价收集、停止分享和记录管理
- 本地 SQLite 数据库、附件目录与备份脚本
- 可选的 Supabase、Cloudflare 和 Netlify 部署结构

## 技术栈

- Next.js 16、React 19、TypeScript
- Node.js 本地 HTTP 服务与 SQLite
- Tesseract.js、PDF.js、OfficeParser、SheetJS
- Supabase、Drizzle、vinext 与 Cloudflare 适配

## 本地运行

要求 Node.js `>=22.13.0` 和 pnpm。

```bash
pnpm install
pnpm run build:local
pnpm run start:local
```

浏览器访问：

- 工作台：`http://localhost:3210/preview`
- 分享页面：`http://localhost:3210/showcase`

本地数据默认写入 `PeopleFlow-Data/`。可通过 `PEOPLEFLOW_DATA_DIR` 指定其他位置。这个目录已被 Git 忽略。

## 可选的 Supabase 模式

复制 `.env.example` 为 `.env.local`，填入自己的 Supabase 项目地址和 publishable key。未配置时，本地模式仍可正常构建。

## 常用命令

```bash
pnpm run build:local   # 构建本地静态工作台
pnpm run start:local   # 启动本地服务
pnpm run package:local # 生成 Windows 便携包
pnpm run build         # Next.js 构建
pnpm run lint          # 代码质量检查
```

## 隐私与安全

PeopleFlow Workspace 是模板，不是经安全审计的成品 HR SaaS。正式保存真实人事数据前，请至少完成：

- 为全部内部工作台 API 增加身份认证与角色授权
- 将公开分享接口与内部读写接口隔离
- 限制附件大小、类型和访问范围
- 配置 HTTPS、备份恢复、审计日志与数据保留策略
- 使用虚构数据进行开发与公开演示

本地服务默认允许局域网访问，方便打开分享链接。这也意味着部署者必须自行保护工作台入口和所在网络。

## 项目结构

```text
app/       Next.js 页面与样式
local/     本地服务、SQLite 和备份逻辑
lib/       前端数据访问封装
public/    OCR worker、语言模型和导入模板
scripts/   构建、打包与演示资料脚本
tests/     自动化测试与虚构测试资料
```

## 开源协议

[MIT](LICENSE)
