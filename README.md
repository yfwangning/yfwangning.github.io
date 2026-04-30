# 毛主席语录沉浸式学习网站

一个极简而优雅的在线学习平台，每日呈现一句精选的毛主席语录，帮助用户在沉浸式体验中汲取思想精华。

![License](https://img.shields.io/badge/license-MIT-blue)
![Language](https://img.shields.io/badge/language-HTML%20|%20CSS%20|%20JavaScript-brightgreen)
![Status](https://img.shields.io/badge/status-Live-success)

---

## ✨ 核心特性

### 📖 每日一句学习
- **365 条精选语录**：覆盖全年每一天，包含哲学思辨、诗词豪迈、革命建党、青年奋斗等多个主题
- **深度解析层**：每条语录配备**释义**、**历史背景**、**今日启示**三个维度的详细说明
- **精准日期映射**：特殊纪念日（春节、五一、建党节等）映射相应主题的语录

### 🎮 互动与反馈
- **打卡系统**：记录学习轨迹，支持历史查看
- **连续天数计数**（Streak）：🔥 火焰图标 + 连续天数/最高纪录，激励持续学习
- **沉浸式动画**：
  - 粒子向上飘动效果
  - 打卡爆发动画
  - 平滑滚动与微交互
  - 渐变背景 + 几何美学
- **音效系统**：Web Audio API 合成的翻页和打卡音效（零外部文件）

### 🖼️ 分享与传播
- **Canvas API 生成分享卡片**：1080×1920 高清 PNG
  - 集成毛主席几何剪影作为水印
  - 模态框预览 + 保存到相册
- **一键复制文字**：快速分享语录内容

### 📱 响应式设计
- 完美适配桌面、平板、手机等各种屏幕
- 流畅的触摸体验
- 现代化 UI（品牌红 `#c41e3a` 为主色调）

### 📅 日历视图
- 全屏日历覆盖层
- 月份导航与日期快速选择
- 已打卡标记 + 语录预览
- 点击任意日期切换对应语录

---

## 🚀 快速开始

### 线上访问
👉 **https://yfwangning.github.io/**

### 本地开发

#### 1. 克隆仓库
```bash
git clone https://github.com/yfwangning/yfwangning.github.io.git
cd yfwangning.github.io
```

#### 2. 启动本地服务器

**Python 3.x（推荐）**
```bash
python -m http.server 8000
```

**Python 2.x**
```bash
python -m SimpleHTTPServer 8000
```

**Node.js**
```bash
npx http-server -p 8000
```

#### 3. 浏览器打开
- 访问 `http://localhost:8000`
- 或直接打开 `index.html`（某些功能可能需要 HTTP 服务）

---

## 📁 项目结构

```
yfwangning.github.io/
├── README.md                 # 本文件
├── PROGRESS.md              # 详细开发日志
├── CLAUDE.md                # 开发指南与行为准则
├── index.html               # 主页面（沉浸式学习界面）
│
├── css/
│   └── main.css             # 样式文件（渐变、动画、响应式）
│
├── js/
│   ├── app.js               # 核心应用逻辑
│   ├── data.js              # 365 条语录数据库
│   ├── share.js             # 分享卡片生成（Canvas）
│   └── sound.js             # 音效合成（Web Audio API）
│
├── assets/
│   └── mao-silhouette.png   # 毛主席几何剪影素材
│
├── tests/
│   ├── data.test.js         # 语录数据测试（9/9 通过）
│   └── streak.test.js       # Streak 逻辑测试（6/6 通过）
│
└── .gitignore
```

---

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| **HTML5** | 语义化标签，无框架依赖 |
| **CSS3** | 渐变、Flexbox、媒体查询、关键帧动画 |
| **Vanilla JavaScript** | 零外部依赖，约 2000+ 行代码 |
| **Canvas API** | 分享卡片高清图片生成 |
| **Web Audio API** | 动态音效合成 |
| **localStorage** | 打卡记录与偏好设置持久化 |
| **GitHub Pages** | 静态网站托管 |

---

## 📊 数据统计

- **总代码行数**：~2000+ 行
- **语录总数**：365 条（去重精选）
- **主题分布**：
  - 哲学·思辨（169 条）
  - 诗词·豪迈（41 条）
  - 建党·革命（29 条）
  - 青年·奋斗（26 条）
  - 清明·缅怀（15 条）
  - 其他（85 条）

- **测试覆盖**：
  - 数据测试：9/9 通过
  - Streak 逻辑：6/6 通过

---

## 🎯 版本历程

### v1.0（基础版）- 2026-04-24
- 项目骨架与 HTML 结构
- CSS 渐变背景与粒子动画
- 10 条语录数据 + 日期匹配
- 核心渲染与视图切换逻辑
- Canvas 分享卡片生成

### v2.0（体验增强）- 2026-04-25
- 音效系统（翻页 + 打卡）
- Streak 连续天数追踪
- Streak UI（🔥 图标 + 数据展示）
- 日历覆盖层（月份导航 + 日期选择）
- 动画优化与平滑滚动

### v3.0（美学升级）- 2026-04-25
- 毛主席几何剪影设计
- 首页与分享卡片集成

### v3.1（素材增强）- 2026-04-26
- 真实人物剪影素材替换
- 分享卡片预览模态框

### v4.0（部署上线）- 2026-04-27
- 数据扩展至 365 条
- GitHub Pages 部署
- 全面功能验证与优化
- **已在线访问**：https://yfwangning.github.io/

---

## 💾 本地数据持久化

网站使用 `localStorage` 记录用户行为，存储以下数据：

```javascript
{
  "lastCheckinDate": "2026-04-30",  // 最后打卡日期
  "totalCheckIns": 15,              // 总打卡天数
  "checkinDates": ["2026-04-16", "2026-04-17", ...],  // 打卡日期列表
  "muteSound": false,               // 音效开关
  "streakDays": 5,                  // 当前连续天数
  "maxStreak": 8                    // 最高纪录
}
```

清除所有数据：在浏览器开发者工具 → Application → Local Storage 中选择本域名并删除。

---

## 🎨 设计理念

### 沉浸式体验
- **两屏切换**：语录屏 ↔ 解析屏，通过向下滚动递进式展开深度内容
- **极简主义**：没有菜单栏、侧边栏或过度装饰，只有语录本身
- **视觉反馈**：打卡爆发、粒子动画、音效，强化用户参与感

### 颜色与排版
- **主色调**：品牌红 `#c41e3a`（庄严肃穆）
- **字体**：谷歌 Noto Serif SC（衬线，文化气质）
- **排版**：宽松的行距与段距，便于默读与思考

### 响应式设计
- **桌面**：两栏/全屏视图，充分利用屏幕空间
- **平板**���适配中等屏幕，保持视觉舒适度
- **手机**：单栏视图，竖屏为主，触摸优化

---

## 🧪 测试

### 运行测试
```bash
# 数据测试
node tests/data.test.js

# Streak 逻辑测试
node tests/streak.test.js
```

### 测试覆盖内容
- ✅ 数据结构完整性
- ✅ ID 连续性与唯一性
- ✅ 日期覆盖完整（365 天）
- ✅ 日期匹配逻辑
- ✅ Fallback 降级
- ✅ Streak 计算准确性
- ✅ localStorage 迁移

---

## 📝 开发规范

详见 `CLAUDE.md`：
- 最小化改动原则
- 代码注释与文档
- 版本管理
- Pull Request 流程

---

## 🔄 更新日志

详见 `PROGRESS.md`，记录每个开发阶段的完成情况、测试结果与功能迭代。

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送到分支：`git push origin feature/your-feature`
5. 开启 Pull Request

任何建议与 Issue 欢迎提出！

---

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

---

## 👤 作者

**yfwangning**

- GitHub: [@yfwangning](https://github.com/yfwangning)
- 个人网站：https://yfwangning.github.io/

---

## 🙏 致谢

感谢所有为本项目提供建议和支持的朋友。

如在查看或使用本项目时有任何问题或建议，欢迎通过以下方式联系：
- 📧 GitHub Issues
- 💬 GitHub Discussions

---

## 🔗 更多资源

- **毛主席语录集**：https://zh.wikipedia.org/wiki/毛泽东语录
- **Web Audio API 文档**：https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **Canvas API 文档**：https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- **localStorage 最佳实践**：https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

---

**最后更新**：2026-04-30

⭐ 如果本项目对你有帮助，请给一个 Star！
