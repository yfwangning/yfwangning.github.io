# 部署上线设计文档 — GitHub Pages 用户站点

## 目标

将「毛主席语录 · 每日一句」静态网站部署到 GitHub Pages，使用用户站点方式，访问地址为 `https://yfwangning.github.io/`。

## 方案概述

采用方案1：将当前仓库直接转换为 GitHub Pages 用户站点仓库。

- 仓库名：`yfwangning.github.io`
- 发布分支：`main`
- 发布目录：仓库根目录

## 步骤设计

### 步骤1：文件清理

删除根目录中不需要发布到公网的开发文件：

- `*.png` — 所有开发截图（`after-show-analysis.png`、`analysis-screen.png` 等约 15 张）
- `.DS_Store` — macOS 系统文件
- `.playwright-mcp/` — Playwright MCP 缓存目录
- `assets/` 中未使用的原始素材：`【哲风壁纸】人物剪影-手持物品人物 (1).png`（4.8MB）

更新 `.gitignore`：

```
.DS_Store
*.png
.playwright-mcp/
```

注意：`assets/` 目录中的 `mao-silhouette.png`、`preview_thumb.png`、`preview_transparent.png` 以及 `bg/` 子目录是站点运行必需的，保留。

### 步骤2：分支重命名

将当前 `master` 分支重命名为 `main`：

```bash
git branch -m master main
```

### 步骤3：Remote 设置与推送

创建 remote 指向用户站点仓库：

```bash
git remote add origin git@github.com:yfwangning/yfwangning.github.io.git
git push -u origin main
```

如果用户站点仓库已存在，先确认是否覆盖；如果不存在，GitHub 会在首次推送时自动创建（需确认 GitHub 设置）。

### 步骤4：GitHub Pages 配置

在 GitHub 仓库 Settings → Pages 中：

- Source：Deploy from a branch
- Branch：`main` / `/(root)`
- 保存后等待自动构建

### 步骤5：验证

- 访问 `https://yfwangning.github.io/`
- 验证首页语录加载
- 验证解析屏展开
- 验证打卡功能
- 验证分享卡片生成和下载
- 验证日历功能
- 验证移动端响应式

## 验证标准

| 检查项 | 通过标准 |
|---|---|
| 首页加载 | 语录正常显示，背景粒子动画正常 |
| 解析屏 | 滚动后解析内容正确显示，streak bar 正常 |
| 打卡 | 点击「今日已学」后按钮状态变化，粒子爆发 |
| 分享卡片 | 生成预览模态框正常，图片下载正常 |
| 日历 | 点击「查看历史」弹出日历，月份切换正常 |
| 移动端 | iPhone SE / 14 Pro Max 模拟器下布局正常 |

## 无自定义域名

本次部署不使用自定义域名，直接通过 `yfwangning.github.io` 访问。未来如需自定义域名，可后续追加 CNAME 文件和 DNS 配置。
