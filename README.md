# 个人网站 / GitHub Pages

这是我的个人静态网站仓库（GitHub Pages），托管在 yfwangning.github.io。网站基于原生 HTML/CSS/JavaScript 编写，目录结构简单，便于直接部署与预览。

## 主要内容

- 主页：`index.html`
- 静态资源：`assets/`（图片、字体等）
- 样式：`css/`
- 脚本：`js/`
- 文档/草稿：`docs/`
- 项目进展：`PROGRESS.md`
- 行为准则/开发指南：`CLAUDE.md`
- 测试（占位）：`tests/`

仓库主要语言组成为 JavaScript（约 92.6%）、CSS（约 5.4%）、HTML（约 2%）。

## 快速开始（本地预览）

1. 克隆仓库：

   git clone https://github.com/yfwangning/yfwangning.github.io.git

2. 进入目录并用静态服务器预览：

   - 使用 Python（3.x）内置服务器：
     
     python -m http.server 8000

   - 或者使用 VSCode 的 Live Server 插件。

3. 在浏览器打开 http://localhost:8000 查看效果，直接打开 `index.html` 也可在多数浏览器下本地预览，但��些跨域请求或脚本模块可能需要 HTTP 服务。

## 部署

该仓库以 GitHub Pages 方式托管（用户名页仓库：`<username>.github.io`）。直接将更改推送到默认分支（通常为 `main`）即可自动生效。

## 修改与开发规范

- 优先遵循仓库现有的代码风格和组织方式。
- 做出最小改动（见 CLAUDE.md 中的行为指南）。
- 如果添加或修改脚本/样式，请在对应目录下维护清晰的注释和版本记录。

## 测试

当前仓库包含 `tests/` 目录作为占位。若需要添加前端自动化测试（例如使用 Jest 或 Playwright），建议在加入之前先在本地配置并验证通过。

## 致谢与联系方式

作者：yfwangning

如果你在查看或使用本仓库时发现问题，欢迎通过 GitHub Issues 提交反馈。
