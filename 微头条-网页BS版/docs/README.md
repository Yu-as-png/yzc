# 04-网页BS版 · 文档索引

Vue 3 + Vite + vue-router 网页版（B/S，:5173），`/api` 代理到共享后端 `server-nestjs`（:3000）。

| 文档 | 内容 |
|---|---|
| [架构总览](./架构总览.md) | 项目结构与技术栈 |
| [功能原子化拆解](./功能原子化拆解.md) | 原子功能 → 业务规则 → 实现代码位置 |
| [流程图](./流程图.md) | 业务流程 mermaid 图（9 张） |
| [原子功能详解](原子功能详解-首页信息流与公告检索.md) | 首页信息流与公告检索：路由态搜索/双栏布局 深度走读 |

> 补充（后续迭代新增的功能，未含在上表旧文档中）：
> - 首页改版为**今日头条式布局**：频道 Tab（channel-bar）+ 无卡片信息流（feed-item）+ 右侧 sticky 侧栏（热榜 Top10 前三红色角标 + 公告卡）—— `src/views/Home.vue`、`src/style.css`
> - 顶栏搜索：`src/App.vue` `doSearch()`（回车跳 `/?q`），`Home.vue` 读取 `route.query.q`
> - 公告检索：`Home.vue` `searchNotices()` + `GET /api/notices?keyword=`（标题∪内容模糊）
> - 详情页文章式排版：作者头像栏（`avatarColor`）、灰底评论框、嵌套回复—— `src/views/Detail.vue`
> - 账号：admin/123456（管理员）、tom/jerry/123456

## 运行

```bash
# 1. 先启动 ../server-nestjs (npm run start)
cd web && npm install && npm run dev    # http://localhost:5173
```
