# 真实人物剪影替换 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有几何 SVG 剪影替换为预处理后的人物 PNG 剪影，覆盖首页和分享卡片。

**Architecture:** 一次性 Python 预处理脚本提取透明背景剪影 PNG；首页用 `<img>` 标签替换 SVG；分享卡片用 Canvas `drawImage` 替换 Path 绘制。

**Tech Stack:** HTML, CSS, JavaScript (Canvas API), Python Pillow

---

## File Structure

| 文件 | 变更 | 职责 |
|---|---|---|
| `assets/mao-silhouette.png` | 新增 | 预处理后的人物剪影（透明背景，纯黑） |
| `index.html` | 修改 | 将 `.silhouette` 内联 SVG 替换为 `<img>` 引用 |
| `css/main.css` | 修改 | 调整 `.silhouette` 样式，移除动画和路径类 |
| `js/share.js` | 修改 | 将 Canvas Path 绘制替换为 `drawImage` |

---

### Task 1: 预处理剪影素材

**Files:**
- Create: `assets/mao-silhouette.png`

**上下文：**
- 输入：`assets/【哲风壁纸】人物剪影-手持物品人物 (1).png`（2356x5120，RGBA）
- 目标：将红色背景（约 #c41e3a）设为透明，保留纯黑剪影

- [ ] **Step 1: 运行 Python 预处理脚本**

```bash
cd /Users/wangzhimao/毛主席语录学习
python3 -c "
from PIL import Image

img = Image.open('assets/【哲风壁纸】人物剪影-手持物品人物 (1).png').convert('RGBA')
data = img.getdata()

new_data = []
for item in data:
    r, g, b, a = item
    # 红色背景阈值：R 远大于 G 和 B
    if r > 100 and g < 60 and b < 60:
        new_data.append((0, 0, 0, 0))
    else:
        new_data.append((0, 0, 0, a))

img.putdata(new_data)
img.save('assets/mao-silhouette.png')
print('Saved assets/mao-silhouette.png')
"
```

- [ ] **Step 2: 验证输出文件**

```bash
ls -lh assets/mao-silhouette.png
file assets/mao-silhouette.png
```

Expected: 文件存在，类型为 PNG image data

- [ ] **Step 3: Commit**

```bash
git add assets/mao-silhouette.png
git commit -m "assets: add processed mao silhouette png

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 2: 首页剪影替换（HTML + CSS）

**Files:**
- Modify: `index.html:16-27`
- Modify: `css/main.css:589-636`

**上下文：**
- 当前首页用内联 SVG 绘制几何剪影（`.silhouette` 容器内的 `<svg>`）
- 需替换为 `<img>` 引用 `assets/mao-silhouette.png`
- 新效果：纯黑色，8% 透明度，无动画
- 位置：左下角，`width: 30%`，响应式移动端 `width: 25%`

- [ ] **Step 1: 替换 HTML 中的 SVG 为 img**

在 `index.html` 中，将第 16-27 行的 `.silhouette` 容器替换为：

```html
        <div class="silhouette" aria-hidden="true">
            <img src="assets/mao-silhouette.png" alt="" aria-hidden="true">
        </div>
```

- [ ] **Step 2: 更新 CSS 中的剪影样式**

在 `css/main.css` 中，将第 589 行开始的 `.silhouette` 区块替换为：

```css
.silhouette {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 30%;
    z-index: 3;
    pointer-events: none;
    opacity: 0.08;
}

.silhouette img {
    width: 100%;
    height: auto;
    display: block;
}

/* Responsive */
@media (max-width: 767px) {
    .silhouette {
        width: 25%;
    }
}
```

- [ ] **Step 3: 移除 CSS 中不再需要的路径类和动画**

在 `css/main.css` 中，删除以下规则：
- `.silhouette-path { ... }`（约第606行）
- `.silhouette-cutout { ... }`（约第611行）
- `@keyframes silhouetteFloat { ... }`（约第615行）
- `@media (prefers-reduced-motion: reduce) { .silhouette { animation: none; } }`（约第621行）

- [ ] **Step 4: 本地验证**

```bash
cd /Users/wangzhimao/毛主席语录学习
python3 -m http.server 8080 &
```

打开浏览器访问 `http://localhost:8080`，确认：
- 剪影显示在左下角
- 黑色，透明度约 8%
- 无浮动动画
- 移动端宽度约 25%

- [ ] **Step 5: Commit**

```bash
git add index.html css/main.css
git commit -m "feat: replace SVG silhouette with real PNG on homepage

- Replace inline SVG with <img> pointing to assets/mao-silhouette.png
- Remove float animation, set opacity to 0.08
- Remove unused .silhouette-path, .silhouette-cutout classes

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 3: 分享卡片剪影替换（JS）

**Files:**
- Modify: `js/share.js`

**上下文：**
- 当前分享卡片用 Canvas Path API 绘制几何剪影水印（第27-62行）
- 需改为 `drawImage()` 加载 `assets/mao-silhouette.png`
- 位置：画布右侧大面积水印，`globalAlpha: 0.12`
- 尺寸：约覆盖画布右侧 40% 宽度

**方案：** 在文件顶部预加载图片为全局常量，在 `generateShareCard` 中同步使用。如果图片尚未加载完成则跳过（极少发生，因为用户通常在页面加载后才点击分享）。

- [ ] **Step 1: 在 share.js 顶部添加预加载**

在 `js/share.js` 文件开头（第1行之前）添加：

```javascript
// Pre-load silhouette for share card
const SILHOUETTE_IMG = new Image();
SILHOUETTE_IMG.src = 'assets/mao-silhouette.png';
```

- [ ] **Step 2: 替换 Canvas 剪影绘制逻辑**

在 `js/share.js` 的 `generateShareCard` 函数中，将第 27-62 行的原有剪影绘制代码（以 `// ===== Silhouette =====` 开头，到 `ctx.restore();` 结束）替换为：

```javascript
    // ===== Silhouette =====
    if (SILHOUETTE_IMG.complete && SILHOUETTE_IMG.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = 0.12;
        const sHeight = height * 0.7;
        const sWidth = sHeight * (SILHOUETTE_IMG.width / SILHOUETTE_IMG.height);
        const sX = width * 0.55;
        const sY = height * 0.15;
        ctx.drawImage(SILHOUETTE_IMG, sX, sY, sWidth, sHeight);
        ctx.restore();
    }
```

- [ ] **Step 3: 验证分享卡片生成**

在浏览器中：
1. 访问 `http://localhost:8080`
2. 下滑到解析屏
3. 点击"今日已学"
4. 点击"生成分享卡片"
5. 确认下载的 PNG 中包含人物剪影水印（右侧，约 12% 透明度）

- [ ] **Step 4: Commit**

```bash
git add js/share.js
git commit -m "feat: replace canvas path silhouette with drawImage in share card

- Pre-load mao-silhouette.png as global Image object
- Replace Path API drawing with ctx.drawImage()
- Skip drawing if image not yet loaded

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 4: 回归测试

**Files:**
- No file changes, run existing tests

- [ ] **Step 1: 运行现有测试**

```bash
cd /Users/wangzhimao/毛主席语录学习
node tests/data.test.js
node tests/streak.test.js
```

Expected: All tests pass (data: 9/9, streak: 6/6)

- [ ] **Step 2: 浏览器端到端验证**

```bash
python3 -m http.server 8080 &
```

打开浏览器验证：
- [ ] 首页剪影显示正常（位置、透明度、无动画）
- [ ] 移动端响应式正常
- [ ] 解析屏各区块正常显示
- [ ] 分享卡片生成正常，含剪影水印
- [ ] 日历功能正常
- [ ] 打卡功能正常

- [ ] **Step 3: Commit 测试通过记录**

```bash
git commit --allow-empty -m "test: regression tests pass for silhouette replacement

- data.test.js: 9/9 pass
- streak.test.js: 6/6 pass
- Browser E2E: homepage + share card verified

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Self-Review Checklist

### Spec Coverage
- [x] 素材预处理（Task 1）
- [x] 首页剪影替换（Task 2）
- [x] 分享卡片剪影替换（Task 3）
- [x] 回归测试（Task 4）

### Placeholder Scan
- [x] 无 "TBD", "TODO", "implement later"
- [x] 每个步骤包含完整代码
- [x] 无 "Similar to Task N" 引用

### Type Consistency
- [x] `assets/mao-silhouette.png` 路径在所有任务中一致
- [x] 透明度值一致（首页 0.08，分享卡片 0.12）
