# 毛主席几何剪影 — 设计文档

## 目标
在现有 v2 网站中加入毛主席几何抽象剪影，同时出现在**首页（语录屏）**和**分享卡片**上，增强品牌辨识度和历史沉浸感，同时零外部依赖。

## 设计决策

### 风格：几何抽象风
- 用简洁几何图形（圆形、椭圆、贝塞尔路径）拼接出可辨识的头部轮廓
- 纯 SVG 代码实现，零外部图片/字体依赖
- 与现有深色渐变 + 粒子动画风格协调

### 首页（语录屏）
| 属性 | 值 |
|---|---|
| 位置 | 画面左下象限，宽度约占画面 30% |
| 颜色 | 品牌红 `#c41e3a`，透明度 8-12% |
| 动效 | 缓慢上下浮动（`translateY` 周期 5s，幅度 6px，`ease-in-out`） |
| 层级 | `z-index: 3`，位于粒子层（2）之上、语录容器（10）之下 |
| 实现 | 内联 SVG 直接写入 `index.html`，CSS 控制样式和动画 |

#### SVG 几何轮廓（精确路径）
```svg
<svg viewBox="0 0 120 160" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
  <!-- 头部轮廓 -->
  <path fill="currentColor" d="M60 10 
    C75 10, 85 25, 85 45 
    C85 55, 80 65, 75 70 
    L80 90 L95 110 L90 160 L30 160 L25 110 L40 90 L45 70 
    C40 65, 35 55, 35 45 
    C35 25, 45 10, 60 10Z" />
  <!-- 面部特征（负形镂空） -->
  <circle cx="60" cy="35" r="18" fill="#1a0a0a" />
  <path fill="#1a0a0a" d="M42 38 Q60 55 78 38 L78 45 Q60 62 42 45Z" />
</svg>
```

### 分享卡片（1080×1920 Canvas）
| 属性 | 值 |
|---|---|
| 位置 | 画面右侧，高度占卡片 60-70% |
| 颜色 | 品牌红 `#c41e3a`，透明度 10-15%（`rgba(196, 30, 58, 0.12)`） |
| 作用 | 大面积背景纹理，语录文字偏左居中，形成杂志封面般的图文并排 |
| 实现 | 在 `js/share.js` Canvas 绘制逻辑中加入 Path 绘制 |

#### Canvas 绘制代码
```javascript
ctx.save();
ctx.globalAlpha = 0.12;
ctx.fillStyle = '#c41e3a';
// 头部轮廓（缩放至卡片尺寸）
const sX = width * 0.55;  // 右侧起始
const sY = height * 0.15; // 顶部偏移
const s = width * 0.0045; // 缩放系数
ctx.beginPath();
ctx.moveTo(sX + 60*s, sY + 10*s);
ctx.bezierCurveTo(sX + 75*s, sY + 10*s, sX + 85*s, sY + 25*s, sX + 85*s, sY + 45*s);
ctx.bezierCurveTo(sX + 85*s, sY + 55*s, sX + 80*s, sY + 65*s, sX + 75*s, sY + 70*s);
ctx.lineTo(sX + 80*s, sY + 90*s);
ctx.lineTo(sX + 95*s, sY + 110*s);
ctx.lineTo(sX + 90*s, sY + 160*s);
ctx.lineTo(sX + 30*s, sY + 160*s);
ctx.lineTo(sX + 25*s, sY + 110*s);
ctx.lineTo(sX + 40*s, sY + 90*s);
ctx.lineTo(sX + 45*s, sY + 70*s);
ctx.bezierCurveTo(sX + 40*s, sY + 65*s, sX + 35*s, sY + 55*s, sX + 35*s, sY + 45*s);
ctx.bezierCurveTo(sX + 35*s, sY + 25*s, sX + 45*s, sY + 10*s, sX + 60*s, sY + 10*s);
ctx.fill();

// 面部负形（用背景色覆盖）
ctx.globalAlpha = 1;
ctx.fillStyle = '#1a0a0a';
ctx.beginPath();
ctx.arc(sX + 60*s, sY + 35*s, 18*s, 0, Math.PI * 2);
ctx.fill();
// 下巴负形
ctx.beginPath();
ctx.moveTo(sX + 42*s, sY + 38*s);
ctx.quadraticCurveTo(sX + 60*s, sY + 55*s, sX + 78*s, sY + 38*s);
ctx.lineTo(sX + 78*s, sY + 45*s);
ctx.quadraticCurveTo(sX + 60*s, sY + 62*s, sX + 42*s, sY + 45*s);
ctx.fill();
ctx.restore();
```

## 响应式
- 移动端（< 768px）：剪影宽度缩小至画面 25%，位置更靠左边缘
- 桌面端（>= 768px）：剪影宽度保持 30%，左侧留适当边距

## 无障碍
- 剪影为纯装饰元素，无需 `alt` 文本
- 动画为极缓慢浮动，不触发前庭障碍，无需 `prefers-reduced-motion` 特殊处理（但若用户开启减少动画，可停止浮动）

## 文件改动
| 文件 | 操作 |
|---|---|
| `index.html` | 在 `#quote-screen` 内添加 SVG 剪影元素 |
| `css/main.css` | 添加 `.silhouette` 样式和 `@keyframes silhouetteFloat` |
| `js/share.js` | 在 `generateShareCard()` 中添加 Canvas 剪影绘制代码 |

## 测试验证
- [ ] 首页剪影正确显示在左下象限，颜色/透明度符合设计
- [ ] 浮动动画平滑，周期 5s
- [ ] 语录文字可读性不受影响
- [ ] 分享卡片生成后剪影出现在右侧
- [ ] 移动端剪影尺寸自适应
