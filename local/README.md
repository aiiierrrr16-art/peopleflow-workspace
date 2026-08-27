# PeopleFlow 本地私有版

本地版将程序与业务数据分开：程序可以重新安装，`PeopleFlow-Data` 目录需要独立备份和迁移。

数据目录包括：

- `peopleflow.db`：账号、岗位、候选人、员工、分享记录和审计日志
- `resumes`：简历附件
- `imports`：待导入文件
- `exports`：导出文件
- `backups`：数据库备份

## 启动

```bash
pnpm run build:local
pnpm run start:local
```

默认地址是 `http://localhost:3210/preview`。服务监听局域网接口以支持分享页面，因此正式保存真实数据前，应为内部工作台 API 增加完整的身份认证和角色授权。

## Windows 便携包

运行 `pnpm run package:local` 后，将生成包含运行时、静态页面、本地服务和数据目录结构的便携包。使用过程中不要关闭启动窗口，并定期运行备份脚本。
