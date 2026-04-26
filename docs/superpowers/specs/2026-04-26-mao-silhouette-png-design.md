# 真实人物剪影替换设计文档

## 背景

v3 版本使用纯代码绘制的几何抽象剪影（SVG + Canvas Path），用户反馈"效果不够理想"。用户已找到真实人物剪影素材（竖版 PNG，黑色剪影在红色背景上），需替换原有的几何抽象剪影。

## 决策记录

| 决策 | 选择 | 原因 |
|---|---|---|
| 红色背景处理 | 提取纯黑剪影，去掉红色背景 | 与现有深红渐变背景（#2d0a0a → #1a0a0a）融合 |
| 放置位置 | 左下角，半身像 | 延续现有位置习惯，视觉重心在语录文字 |
| 分享卡片 | 同步替换 | 保持视觉一致性 |
| 视觉效果 | 纯黑色 + 8% 透明度 + 无动画 | 用户明确选择，更低调庄重 |
| 实现方案 | 预处理提取 + 直接引用 | 零运行时开销，跨浏览器兼容 |

## 素材预处理

### 输入
- 原文件：`assets/【哲风壁纸】人物剪影-手持物品人物 (1).png`
- 尺寸：2356 x 5120 像素
- 模式：RGBA

### 处理逻辑
- 使用 Python Pillow 脚本
- 将红色背景（#c41e3a 及相近色域）设为透明
- 保留纯黑剪影像素

### 输出
- 目标文件：`assets/mao-silhouette.png`
- 透明背景，纯黑剪影，保持原始分辨率

## 首页修改

### HTML（index.html）

替换 `.silhouette` 容器内容：
- **移除**：内联 SVG 几何图形（`<svg>...<path>...<circle>...`）
- **新增**：`<img src="assets/mao-silhouette.png" alt="" aria-hidden="true">`

### CSS（css/main.css）

调整 `.silhouette` 类：
- `position: absolute; bottom: 0; left: 0;`
- `width: 30%; height: auto;`
- `z-index: 3; pointer-events: none;`
- **移除**：`animation: silhouetteFloat 5s ease-in-out infinite`
- `opacity` 在图片本身不需要设置（通过图片颜色控制），或保持统一用 CSS `opacity: 0.08`

响应式（`@media (max-width: 767px)`）：
- `width: 25%;`

**移除**：
- `.silhouette-path` 类
- `.silhouette-cutout` 类
- `@keyframes silhouetteFloat`
- `prefers-reduced-motion` 相关规则

## 分享卡片修改

### JS（js/share.js）

在 `generateShareCard()` 函数中，替换剪影绘制部分：

**移除**：
- Canvas Path 绘制代码（`ctx.beginPath()`、`bezierCurveTo()` 等所有几何路径）

**新增**：
- 预加载 `assets/mao-silhouette.png`（`new Image()`）
- 在背景绘制后，用 `ctx.drawImage()` 绘制水印
- `ctx.globalAlpha = 0.12`
- 位置：画布右侧，约覆盖 40% 宽度
- 尺寸自适应，高度约束不超过画布 70%

## 文件变更清单

| 文件 | 变更类型 | 说明 |
|---|---|---|
| `assets/mao-silhouette.png` | 新增 | 预处理后的透明背景剪影 |
| `index.html` | 修改 | 替换 SVG 为 img 标签 |
| `css/main.css` | 修改 | 调整剪影样式，移除动画和路径类 |
| `js/share.js` | 修改 | 替换 Canvas Path 为 drawImage |

## 回滚策略

全部为原子改动，回滚简单：
1. 恢复 `index.html`、 `css/main.css`、 `js/share.js` 到修改前版本
2. 删除 `assets/mao-silhouette.png`
3. 原几何剪影立即恢复

## 验证清单

- [ ] 首页剪影正常显示，位置正确，透明背景正常
- [ ] 移动端响应式正常
- [ ] 分享卡片生成正常，剪影水印正常
- [ ] 现有测试全部通过（回归测试）
- [ ] 浏览器截图确认视觉效果