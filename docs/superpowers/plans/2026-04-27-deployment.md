# GitHub Pages 部署上线 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将「毛主席语录 · 每日一句」静态网站部署到 GitHub Pages 用户站点 `https://yfwangning.github.io/`。

**Architecture:** 纯静态网站（HTML + CSS + JS），无需构建步骤。将当前仓库转换为 GitHub Pages 用户站点仓库，通过清理开发文件、重命名分支、推送至 remote 后自动发布。

**Tech Stack:** Git, GitHub Pages

---

## 文件结构

本计划涉及以下文件变更：

| 文件/目录 | 操作 | 说明 |
|---|---|---|
| 根目录 `*.png`（21 张截图） | 删除 | 开发截图，无需发布 |
| `.DS_Store` | 删除 | macOS 系统文件 |
| `.playwright-mcp/` | 删除 | Playwright MCP 缓存目录 |
| `assets/【哲风壁纸】人物剪影-手持物品人物 (1).png` | 删除 | 4.8MB 未用原始素材 |
| `.gitignore` | 修改 | 添加根目录截图、系统文件、缓存目录忽略规则 |
| 分支 `master` | 重命名 | → `main`（GitHub Pages 默认发布分支） |
| remote `origin` | 新增 | 指向 `git@github.com:yfwangning/yfwangning.github.io.git` |

---

### Task 1: 清理开发文件

**Files:**
- Delete: 根目录全部 `*.png`（共 21 张）
- Delete: `.DS_Store`
- Delete: `.playwright-mcp/`
- Delete: `assets/【哲风壁纸】人物剪影-手持物品人物 (1).png`

- [ ] **Step 1: 删除根目录截图**

```bash
cd /Users/wangzhimao/毛主席语录学习
git rm after-show-analysis.png analysis-for-share.png analysis-screen.png final-analysis.png final-calendar.png final-homepage.png homepage-new-silhouette.png homepage-quote-screen.png homepage-silhouette-check.png homepage-top.png homepage-verify.png screenshot-desktop.png screenshot-desktop2.png screenshot-mobile.png share-preview-closed.png share-preview-modal.png silhouette-desktop-2.png silhouette-desktop.png silhouette-mobile-2.png silhouette-mobile-3.png silhouette-mobile.png
```

- [ ] **Step 2: 删除系统文件和缓存目录**

```bash
git rm .DS_Store
git rm -r .playwright-mcp/
```

- [ ] **Step 3: 删除未用原始素材**

```bash
git rm "assets/【哲风壁纸】人物剪影-手持物品人物 (1).png"
```

- [ ] **Step 4: 验证删除结果**

Run: `git status`
Expected: 显示大量 deleted 文件，无未跟踪文件。`assets/` 目录中 `mao-silhouette.png`、`preview_thumb.png`、`preview_transparent.png`、`bg/` 子目录保留。

- [ ] **Step 5: Commit**

```bash
git commit -m "chore: remove development files before deployment

Remove screenshots, .DS_Store, .playwright-mcp cache, and unused
raw asset to prepare for public release.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 2: 更新 .gitignore

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: 编辑 .gitignore**

在 `.gitignore` 末尾追加以下内容：

```
/*.png
.DS_Store
.playwright-mcp/
```

注意：`/*.png` 使用根路径模式，只忽略根目录下的 `.png` 文件，不忽略 `assets/` 中的必需图片。

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: update .gitignore for deployment

Ignore root-level screenshots, macOS system files, and test cache.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 3: 分支重命名

**Files:**
- Modify: 分支名 `master` → `main`

- [ ] **Step 1: 重命名分支**

```bash
git branch -m master main
```

- [ ] **Step 2: 验证分支名**

Run: `git branch --show-current`
Expected: `main`

---

### Task 4: 创建 Remote 并推送

**Files:**
- Modify: `.git/config`（通过 git remote 命令）

- [ ] **Step 1: 添加 remote**

```bash
git remote add origin git@github.com:yfwangning/yfwangning.github.io.git
```

- [ ] **Step 2: 验证 remote**

Run: `git remote -v`
Expected:
```
origin  git@github.com:yfwangning/yfwangning.github.io.git (fetch)
origin  git@github.com:yfwangning/yfwangning.github.io.git (push)
```

- [ ] **Step 3: 推送 main 分支**

```bash
git push -u origin main
```

Expected: 推送成功，远端仓库被创建（或更新），显示分支追踪信息。

---

### Task 5: 配置 GitHub Pages

**Files:**
- 无文件修改，需在 GitHub Web UI 操作

- [ ] **Step 1: 在 GitHub 仓库 Settings → Pages 中配置**

打开 `https://github.com/yfwangning/yfwangning.github.io/settings/pages`

设置：
- Source: Deploy from a branch
- Branch: `main` / `/(root)`
- 点击 Save

- [ ] **Step 2: 等待构建**

GitHub Pages 自动构建通常需要 1-2 分钟。可在同一页面查看构建状态。

---

### Task 6: 验证部署

**Files:**
- 无文件修改

- [ ] **Step 1: 访问首页**

打开 `https://yfwangning.github.io/`

Expected: 页面加载，显示今日语录，背景粒子动画正常。

- [ ] **Step 2: 验证解析屏**

向下滚动到解析屏。

Expected: 解析内容（释义、历史背景、今日启示）正确显示，streak bar 正常。

- [ ] **Step 3: 验证打卡功能**

点击「今日已学」按钮。

Expected: 按钮状态变化，触发粒子爆发动画。

- [ ] **Step 4: 验证分享卡片**

点击「生成分享卡片」。

Expected: 弹出预览模态框，卡片图片正确显示。

点击「保存到相册」。

Expected: 图片下载成功。

- [ ] **Step 5: 验证日历**

点击「查看历史」。

Expected: 日历覆盖层弹出，月份导航正常，日期可点击。

- [ ] **Step 6: 验证移动端**

使用浏览器开发者工具模拟 iPhone 14 Pro Max。

Expected: 布局正常，语录文字大小合适，按钮可点击。

---

## 回滚方案

如果部署后发现问题，可随时回滚：

1. 在 GitHub 仓库中 revert 最近的 commit
2. 或直接在本地修改后 `git push origin main`
3. GitHub Pages 会在推送后 1-2 分钟内自动重新构建

---

## Self-Review

**Spec coverage:**
- [x] 文件清理 → Task 1
- [x] .gitignore 更新 → Task 2
- [x] 分支重命名 → Task 3
- [x] Remote 设置与推送 → Task 4
- [x] GitHub Pages 配置 → Task 5
- [x] 验证标准 → Task 6

**Placeholder scan:** 无 TBD/TODO/"implement later" 等占位符。

**Type consistency：** N/A，本计划不涉及代码类型定义。
