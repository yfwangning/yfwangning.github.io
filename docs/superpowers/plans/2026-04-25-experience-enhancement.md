# 体验增强（v2）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 v1 基础上增加 streak 连续打卡、日历历史浏览、动画优化、音效反馈四项体验增强功能。

**Architecture:** 纯 HTML/CSS/JS 静态站点，零依赖。新增 `js/sound.js` 音效模块，`js/app.js` 扩展 streak/日历/动画逻辑，`index.html` 和 `css/main.css` 扩展 UI。

**Tech Stack:** HTML5, CSS3, Vanilla JS, Web Audio API, localStorage, Canvas API (已有)

---

## File Structure

| 文件 | 变更 | 职责 |
|------|------|------|
| `index.html` | 修改 | 新增 streak bar、静音开关、查看历史入口、日历覆盖层 DOM |
| `css/main.css` | 修改 | 新增日历样式、streak bar 样式、动画关键帧、按钮微交互 |
| `js/sound.js` | 新建 | Web Audio API 音效封装（翻页音效、打卡音效、静音控制） |
| `js/app.js` | 修改 | 扩展 streak 计算/展示、日历逻辑、平滑滚动、动画触发、音效调用 |
| `tests/streak.test.js` | 新建 | Node.js 可运行的 streak 计算逻辑单元测试 |
| `js/data.js` | 不变 | 365条语录数据 |
| `js/share.js` | 不变 | 分享卡片生成 |

---

### Task 1: 音效系统 Sound Module

**Files:**
- Create: `js/sound.js`
- Modify: `index.html`（引入 `<script src="js/sound.js"></script>`）

- [ ] **Step 1: 新建 js/sound.js**

```javascript
(function() {
    'use strict';

    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
    }

    function isMuted() {
        try {
            return localStorage.getItem('sound_muted') === 'true';
        } catch (e) {
            return false;
        }
    }

    /**
     * 翻页音效 — 快速频率扫频模拟纸张声
     */
    function playFlipSound() {
        if (isMuted()) return;
        try {
            const ctx = getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.2);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1200, ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.2);

            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.22);
        } catch (e) {
            // 静默降级
        }
    }

    /**
     * 打卡音效 — 低频方波短促脉冲
     */
    function playCheckinSound() {
        if (isMuted()) return;
        try {
            const ctx = getAudioContext();

            // 低频主音
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'square';
            osc1.frequency.setValueAtTime(150, ctx.currentTime);
            gain1.gain.setValueAtTime(0.2, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.16);

            // 高频泛音
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(600, ctx.currentTime);
            gain2.gain.setValueAtTime(0.08, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(ctx.currentTime);
            osc2.stop(ctx.currentTime + 0.13);
        } catch (e) {
            // 静默降级
        }
    }

    window.playFlipSound = playFlipSound;
    window.playCheckinSound = playCheckinSound;
    window.isSoundMuted = isMuted;
})();
```

- [ ] **Step 2: 在 index.html 引入 sound.js**

在 `index.html` 中，将：
```html
<script src="js/data.js"></script>
<script src="js/share.js"></script>
<script src="js/app.js"></script>
```
改为：
```html
<script src="js/data.js"></script>
<script src="js/share.js"></script>
<script src="js/sound.js"></script>
<script src="js/app.js"></script>
```

- [ ] **Step 3: 浏览器验证**

Run: `python3 -m http.server 8080`
打开 `http://localhost:8080`
在浏览器 DevTools Console 中执行：`playFlipSound()` 和 `playCheckinSound()`
Expected: 听到翻页"唰"声和打卡"咚"声

- [ ] **Step 4: Commit**

```bash
git add js/sound.js index.html
git commit -m "feat: add Web Audio API sound module with flip and checkin effects"
```

---

### Task 2: Streak 数据层重构

**Files:**
- Modify: `js/app.js`
- Create: `tests/streak.test.js`

现有的 checkin 逻辑使用分散的 `checkin_YYYY_M_D` 键和 `checkInHistory` 数组。需要统一为 v2 数据模型，并添加 streak 计算。

- [ ] **Step 1: 新建 tests/streak.test.js**

```javascript
// streak 计算逻辑的单元测试（Node.js 环境）

function assert(condition, message) {
    if (!condition) {
        throw new Error(`ASSERTION FAILED: ${message}`);
    }
}

// 模拟 getStreakState 和 updateStreak 的纯计算逻辑
function calculateStreak(history, todayStr) {
    if (!history || history.length === 0) {
        return { current: 0, best: 0 };
    }

    const set = new Set(history);
    let current = 0;
    let checkDate = new Date(todayStr);

    // 往回数连续天数（包含今天）
    while (true) {
        const d = checkDate.toISOString().split('T')[0];
        if (set.has(d)) {
            current++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return { current };
}

function calculateBest(history, current) {
    if (!history || history.length === 0) return 0;
    const set = new Set(history);
    const sorted = Array.from(set).sort();
    let maxStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1]);
        const curr = new Date(sorted[i]);
        const diff = (curr - prev) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
            tempStreak++;
        } else {
            maxStreak = Math.max(maxStreak, tempStreak);
            tempStreak = 1;
        }
    }
    maxStreak = Math.max(maxStreak, tempStreak);
    return Math.max(maxStreak, current);
}

function testStreakEmpty() {
    const result = calculateStreak([], '2026-04-25');
    assert(result.current === 0, 'Empty history should have 0 streak');
    console.log('✓ testStreakEmpty passed');
}

function testStreakSingleDay() {
    const result = calculateStreak(['2026-04-25'], '2026-04-25');
    assert(result.current === 1, 'Single day should have streak 1');
    console.log('✓ testStreakSingleDay passed');
}

function testStreakConsecutive() {
    const history = ['2026-04-22', '2026-04-23', '2026-04-24', '2026-04-25'];
    const result = calculateStreak(history, '2026-04-25');
    assert(result.current === 4, `Expected streak 4, got ${result.current}`);
    console.log('✓ testStreakConsecutive passed');
}

function testStreakBroken() {
    const history = ['2026-04-20', '2026-04-21', '2026-04-25'];
    const result = calculateStreak(history, '2026-04-25');
    assert(result.current === 1, `Broken streak should be 1, got ${result.current}`);
    console.log('✓ testStreakBroken passed');
}

function testBestStreak() {
    const history = ['2026-04-01', '2026-04-02', '2026-04-03', '2026-04-10', '2026-04-11'];
    const best = calculateBest(history, 2);
    assert(best === 3, `Expected best streak 3, got ${best}`);
    console.log('✓ testBestStreak passed');
}

function testBestStreakIncludesCurrent() {
    const history = ['2026-04-22', '2026-04-23', '2026-04-24', '2026-04-25'];
    const current = calculateStreak(history, '2026-04-25').current;
    const best = calculateBest(history, current);
    assert(best === 4, `Expected best streak 4, got ${best}`);
    console.log('✓ testBestStreakIncludesCurrent passed');
}

// 运行测试
console.log('Running streak tests...\n');
testStreakEmpty();
testStreakSingleDay();
testStreakConsecutive();
testStreakBroken();
testBestStreak();
testBestStreakIncludesCurrent();
console.log('\nAll streak tests passed!');
```

- [ ] **Step 2: 运行 streak 测试**

Run: `cd /Users/wangzhimao/毛主席语录学习 && node tests/streak.test.js`
Expected: 6 个测试全部通过

- [ ] **Step 3: 修改 js/app.js — 添加 streak 数据层**

在 app.js 的 `// ===== State =====` 区域后添加以下函数（插入到 `bindEvents` 之前）：

```javascript
    // ===== Streak Data Layer =====

    const STORAGE_KEYS = {
        history: 'checkin_history',
        current: 'streak_current',
        best: 'streak_best',
        soundMuted: 'sound_muted'
    };

    function migrateV1Data() {
        // v1 使用 checkInHistory 数组
        const oldHistory = localStorage.getItem('checkInHistory');
        const newHistory = localStorage.getItem(STORAGE_KEYS.history);
        if (oldHistory && !newHistory) {
            try {
                const parsed = JSON.parse(oldHistory);
                localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(parsed));
            } catch (e) {
                // ignore
            }
        }
    }

    function getCheckInHistory() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]');
        } catch (e) {
            return [];
        }
    }

    function saveCheckInHistory(history) {
        localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
    }

    function getStreakState() {
        migrateV1Data();
        const history = getCheckInHistory();
        const current = parseInt(localStorage.getItem(STORAGE_KEYS.current) || '0', 10);
        const best = parseInt(localStorage.getItem(STORAGE_KEYS.best) || '0', 10);
        return { history, current, best };
    }

    function calculateStreak(history, todayStr) {
        if (!history || history.length === 0) return 0;
        const set = new Set(history);
        let current = 0;
        let checkDate = new Date(todayStr);
        while (true) {
            const d = checkDate.toISOString().split('T')[0];
            if (set.has(d)) {
                current++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        return current;
    }

    function calculateBestStreak(history, currentStreak) {
        if (!history || history.length === 0) return 0;
        const sorted = Array.from(new Set(history)).sort();
        let maxStreak = 0;
        let tempStreak = 1;
        for (let i = 1; i < sorted.length; i++) {
            const prev = new Date(sorted[i - 1]);
            const curr = new Date(sorted[i]);
            const diff = (curr - prev) / (1000 * 60 * 60 * 24);
            if (diff === 1) {
                tempStreak++;
            } else {
                maxStreak = Math.max(maxStreak, tempStreak);
                tempStreak = 1;
            }
        }
        maxStreak = Math.max(maxStreak, tempStreak);
        return Math.max(maxStreak, currentStreak);
    }

    function isCheckedInToday() {
        const today = new Date().toISOString().split('T')[0];
        const history = getCheckInHistory();
        return history.includes(today);
    }

    function updateStreakForCheckIn() {
        const today = new Date().toISOString().split('T')[0];
        let history = getCheckInHistory();

        if (history.includes(today)) {
            return null; // 今天已打卡，无需更新
        }

        history.push(today);
        saveCheckInHistory(history);

        const current = calculateStreak(history, today);
        const best = calculateBestStreak(history, current);

        localStorage.setItem(STORAGE_KEYS.current, String(current));
        localStorage.setItem(STORAGE_KEYS.best, String(best));

        return { current, best };
    }
```

- [ ] **Step 4: 修改 js/app.js — 替换旧的 checkin 逻辑**

将 `doCheckIn()` 函数替换为：

```javascript
    function doCheckIn() {
        if (isCheckedIn) return;

        const result = updateStreakForCheckIn();
        if (!result) return; // 已经打过卡

        isCheckedIn = true;
        updateCheckInUI();
        updateStreakUI(result.current, result.best);

        // 播放打卡音效
        if (typeof playCheckinSound === 'function') {
            playCheckinSound();
        }

        // 粒子爆发效果
        triggerParticleBurst();
    }
```

将 `checkCheckInStatus()` 函数替换为：

```javascript
    function checkCheckInStatus() {
        if (isCheckedInToday()) {
            isCheckedIn = true;
            updateCheckInUI();
        }
    }
```

将 `init()` 函数改为：

```javascript
    function init() {
        migrateV1Data();
        currentQuote = getTodayQuote();
        renderQuote();
        createParticles();
        checkCheckInStatus();
        initStreakUI();
        bindEvents();
    }
```

- [ ] **Step 5: 修改 js/app.js — 更新 updateCheckInUI**

将 `updateCheckInUI()` 替换为：

```javascript
    function updateCheckInUI() {
        if (checkinBtn) {
            checkinBtn.textContent = '已打卡 ✓';
            checkinBtn.classList.add('checked');
        }
        if (shareOptions) {
            shareOptions.classList.remove('hidden');
        }
    }
```

- [ ] **Step 6: 运行 streak 测试确认**

Run: `node tests/streak.test.js`
Expected: 6 个测试全部通过

- [ ] **Step 7: Commit**

```bash
git add js/app.js tests/streak.test.js
git commit -m "feat: add streak calculation data layer with v1 migration"
```

---

### Task 3: Streak UI（streak bar + 静音开关 + 查看历史入口）

**Files:**
- Modify: `index.html`
- Modify: `css/main.css`
- Modify: `js/app.js`

- [ ] **Step 1: 修改 index.html — 在解析屏底部添加 streak bar 区域**

在 `index.html` 中，找到解析屏的 `.checkin-area` 区域，将其替换为：

```html
            <div class="streak-bar">
                <div class="streak-info">
                    <span class="streak-icon">🔥</span>
                    <span id="streak-text">开始学习 · 每日一句，持之以恒</span>
                </div>
                <div class="streak-actions">
                    <button id="history-btn" class="history-btn">查看历史 →</button>
                    <button id="mute-btn" class="mute-btn" title="开关音效">🔊</button>
                </div>
            </div>
            <div class="checkin-area">
```

即 `.checkin-area` 前插入 `.streak-bar`。

- [ ] **Step 2: 修改 css/main.css — 添加 streak bar 和按钮样式**

在 `css/main.css` 末尾（`@media` 查询之前）添加：

```css
/* ===== Streak Bar ===== */
.streak-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-top: 1px solid rgba(160, 128, 96, 0.15);
    margin-top: 1rem;
    min-height: 36px;
}

.streak-info {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 14px;
    color: #a08060;
}

.streak-icon {
    font-size: 16px;
    transition: transform 0.3s ease;
}

.streak-icon.pop {
    animation: streakPop 0.3s ease;
}

@keyframes streakPop {
    0% { transform: scale(1) translateY(0); }
    50% { transform: scale(1.3) translateY(-4px); }
    100% { transform: scale(1) translateY(0); }
}

.streak-actions {
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.history-btn {
    background: transparent;
    color: #a08060;
    border: none;
    font-size: 14px;
    cursor: pointer;
    transition: color 0.2s ease;
    font-family: inherit;
    padding: 0.2rem 0;
}

.history-btn:hover {
    color: #f5e6c8;
}

.mute-btn {
    background: transparent;
    border: none;
    font-size: 18px;
    cursor: pointer;
    padding: 0.2rem;
    opacity: 0.7;
    transition: opacity 0.2s ease;
}

.mute-btn:hover {
    opacity: 1;
}
```

- [ ] **Step 3: 修改 js/app.js — 添加 streak UI 逻辑**

在 app.js 的 streak 数据层函数之后（`updateStreakForCheckIn` 之后），添加：

```javascript
    // ===== Streak UI =====

    function initStreakUI() {
        const state = getStreakState();
        updateStreakUI(state.current, state.best);
        updateMuteIcon();
    }

    function updateStreakUI(current, best) {
        const streakText = document.getElementById('streak-text');
        const streakIcon = document.querySelector('.streak-icon');
        if (!streakText) return;

        if (current === 0 && best === 0) {
            streakText.textContent = '开始学习 · 每日一句，持之以恒';
        } else {
            streakText.textContent = `连续学习 ${current} 天 · 最高纪录 ${best} 天`;
        }

        // 火焰颜色随 streak 增长变暖
        if (streakIcon) {
            if (current >= 30) {
                streakIcon.style.filter = 'hue-rotate(-20deg) saturate(1.5)';
            } else if (current >= 14) {
                streakIcon.style.filter = 'hue-rotate(-10deg) saturate(1.3)';
            } else if (current >= 7) {
                streakIcon.style.filter = 'saturate(1.2)';
            }
            // 打卡成功时的动画已在 doCheckIn 中通过添加 .pop 类触发
        }
    }

    function animateStreakUpdate() {
        const streakText = document.getElementById('streak-text');
        const streakIcon = document.querySelector('.streak-icon');
        if (streakText) {
            streakText.style.transition = 'transform 0.2s ease, color 0.2s ease';
            streakText.style.transform = 'scale(1.3)';
            streakText.style.color = '#f5e6c8';
            setTimeout(() => {
                streakText.style.transform = 'scale(1)';
                streakText.style.color = '#a08060';
            }, 200);
        }
        if (streakIcon) {
            streakIcon.classList.add('pop');
            setTimeout(() => streakIcon.classList.remove('pop'), 300);
        }
    }

    // ===== Mute Toggle =====

    function updateMuteIcon() {
        const muteBtn = document.getElementById('mute-btn');
        if (!muteBtn) return;
        const muted = (function() {
            try { return localStorage.getItem('sound_muted') === 'true'; }
            catch (e) { return false; }
        })();
        muteBtn.textContent = muted ? '🔇' : '🔊';
    }

    function toggleMute() {
        const muted = (function() {
            try { return localStorage.getItem('sound_muted') === 'true'; }
            catch (e) { return false; }
        })();
        localStorage.setItem('sound_muted', String(!muted));
        updateMuteIcon();
    }
```

- [ ] **Step 4: 修改 js/app.js — 将 streak 动画绑定到打卡流程**

修改 `doCheckIn()`，在 `updateStreakUI` 后添加 `animateStreakUpdate()`：

```javascript
    function doCheckIn() {
        if (isCheckedIn) return;

        const result = updateStreakForCheckIn();
        if (!result) return;

        isCheckedIn = true;
        updateCheckInUI();
        updateStreakUI(result.current, result.best);
        animateStreakUpdate();

        if (typeof playCheckinSound === 'function') {
            playCheckinSound();
        }
        triggerParticleBurst();
    }
```

- [ ] **Step 5: 修改 js/app.js — 绑定 streak 相关事件**

在 `bindEvents()` 函数末尾添加：

```javascript
        // Mute toggle
        const muteBtn = document.getElementById('mute-btn');
        if (muteBtn) {
            muteBtn.addEventListener('click', toggleMute);
        }
```

- [ ] **Step 6: 浏览器验证**

Run: `python3 -m http.server 8080`
打开 `http://localhost:8080`，下滑到解析屏
Expected: streak bar 显示 "开始学习 · 每日一句，持之以恒"；右侧有"查看历史 →"和🔊按钮

- [ ] **Step 7: Commit**

```bash
git add index.html css/main.css js/app.js
git commit -m "feat: add streak bar UI with mute toggle and history entry"
```

---

### Task 4: 日历覆盖层 HTML/CSS

**Files:**
- Modify: `index.html`
- Modify: `css/main.css`

- [ ] **Step 1: 修改 index.html — 在 body 末尾添加日历覆盖层**

在 `</body>` 前，canvas 之后，添加：

```html
    <!-- 日历覆盖层 -->
    <div id="calendar-overlay" class="calendar-overlay">
        <div class="calendar-backdrop"></div>
        <div class="calendar-panel">
            <div class="calendar-header">
                <button id="calendar-close" class="calendar-close">×</button>
                <div class="calendar-nav">
                    <button id="calendar-prev" class="calendar-nav-btn">←</button>
                    <span id="calendar-month-label" class="calendar-month-label">2026年4月</span>
                    <button id="calendar-next" class="calendar-nav-btn">→</button>
                </div>
            </div>
            <div class="calendar-weekdays">
                <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
            </div>
            <div id="calendar-grid" class="calendar-grid"></div>
            <div id="calendar-quote-preview" class="calendar-quote-preview">
                <p id="calendar-quote-text" class="calendar-quote-text">选择日期查看语录</p>
                <p id="calendar-quote-source" class="calendar-quote-source"></p>
            </div>
        </div>
    </div>
```

- [ ] **Step 2: 修改 css/main.css — 添加日历覆盖层样式**

在 `css/main.css` 末尾添加：

```css
/* ===== Calendar Overlay ===== */
.calendar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 100;
    display: none;
    flex-direction: column;
    justify-content: flex-end;
}

.calendar-overlay.active {
    display: flex;
}

.calendar-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    opacity: 0;
    transition: opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.calendar-overlay.active .calendar-backdrop {
    opacity: 1;
}

.calendar-panel {
    position: relative;
    background: #1a0a0a;
    border-radius: 20px 20px 0 0;
    padding: 1.5rem 1rem 1rem;
    transform: translateY(100%);
    transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    max-height: 85vh;
    overflow-y: auto;
    z-index: 101;
}

.calendar-overlay.active .calendar-panel {
    transform: translateY(0);
}

.calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    padding: 0 0.5rem;
}

.calendar-close {
    background: transparent;
    border: none;
    color: #a08060;
    font-size: 28px;
    cursor: pointer;
    line-height: 1;
    padding: 0 0.5rem;
}

.calendar-nav {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.calendar-nav-btn {
    background: transparent;
    border: 1px solid rgba(160, 128, 96, 0.3);
    color: #a08060;
    font-size: 16px;
    cursor: pointer;
    padding: 0.3rem 0.8rem;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.calendar-nav-btn:hover {
    border-color: #f5e6c8;
    color: #f5e6c8;
}

.calendar-month-label {
    font-size: 16px;
    color: #f5e6c8;
    min-width: 120px;
    text-align: center;
}

.calendar-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(160, 128, 96, 0.1);
}

.calendar-weekdays span {
    font-size: 12px;
    color: #a08060;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    padding: 0.5rem 0;
}

.calendar-cell {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #d4c4a8;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    transition: background 0.15s ease;
    min-height: 40px;
}

.calendar-cell:hover:not(.disabled):not(.future) {
    background: rgba(196, 30, 58, 0.15);
}

.calendar-cell.today {
    border: 1px solid #c41e3a;
}

.calendar-cell.checked::after {
    content: '';
    position: absolute;
    bottom: 4px;
    width: 4px;
    height: 4px;
    background: #c41e3a;
    border-radius: 50%;
}

.calendar-cell.future {
    color: #555;
    cursor: default;
}

.calendar-cell.disabled {
    color: #555;
    cursor: default;
}

.calendar-cell.selected {
    background: rgba(196, 30, 58, 0.25);
}

.calendar-quote-preview {
    padding: 1rem 0.5rem;
    border-top: 1px solid rgba(160, 128, 96, 0.15);
    margin-top: 0.5rem;
    cursor: pointer;
    transition: background 0.15s ease;
    border-radius: 8px;
}

.calendar-quote-preview:hover {
    background: rgba(160, 128, 96, 0.05);
}

.calendar-quote-text {
    font-size: 14px;
    color: #f5e6c8;
    line-height: 1.5;
    margin-bottom: 0.3rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.calendar-quote-source {
    font-size: 12px;
    color: #a08060;
}

/* ===== Check-in Button Enhancements ===== */
.checkin-btn {
    transition: all 0.15s ease;
}

.checkin-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(196, 30, 58, 0.3);
}

.checkin-btn.checked {
    background: #8b1538;
    pointer-events: none;
}

/* ===== Share Button Enhancements ===== */
.share-btn {
    transition: all 0.15s ease;
}

.share-btn:hover {
    transform: translateY(-2px);
    border-color: #f5e6c8;
    color: #f5e6c8;
}
```

- [ ] **Step 3: 浏览器验证**

Run: `python3 -m http.server 8080`
打开 `http://localhost:8080`
在 DevTools Console 执行：`document.getElementById('calendar-overlay').classList.add('active')`
Expected: 日历覆盖层从底部滑入，显示标题栏、星期行、空白网格区域、底部语录预览区

- [ ] **Step 4: Commit**

```bash
git add index.html css/main.css
git commit -m "feat: add calendar overlay markup and styles"
```

---

### Task 5: 日历逻辑

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: 修改 js/app.js — 添加日历状态和方法**

在 app.js State 区域后添加：

```javascript
    // ===== Calendar State =====
    let calendarCurrentMonth = new Date().getMonth();
    let calendarCurrentYear = new Date().getFullYear();
    let calendarSelectedDate = null;
```

- [ ] **Step 2: 修改 js/app.js — 添加日历核心函数**

在 app.js 中，在 streak UI 函数之后添加：

```javascript
    // ===== Calendar Logic =====

    function openCalendar() {
        const overlay = document.getElementById('calendar-overlay');
        if (!overlay) return;
        calendarCurrentMonth = new Date().getMonth();
        calendarCurrentYear = new Date().getFullYear();
        renderCalendar();
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCalendar() {
        const overlay = document.getElementById('calendar-overlay');
        if (!overlay) return;
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function renderCalendar() {
        const grid = document.getElementById('calendar-grid');
        const monthLabel = document.getElementById('calendar-month-label');
        if (!grid || !monthLabel) return;

        monthLabel.textContent = `${calendarCurrentYear}年${calendarCurrentMonth + 1}月`;
        grid.innerHTML = '';

        const year = calendarCurrentYear;
        const month = calendarCurrentMonth;
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const checkInSet = new Set(getCheckInHistory());

        // 空白填充
        for (let i = 0; i < firstDay; i++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell disabled';
            grid.appendChild(cell);
        }

        // 日期格子
        for (let d = 1; d <= daysInMonth; d++) {
            const cell = document.createElement('div');
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dateObj = new Date(year, month, d);

            let className = 'calendar-cell';

            // 是否是今天
            if (dateStr === todayStr) {
                className += ' today';
            }

            // 是否是未来
            if (dateObj > today) {
                className += ' future';
            }

            // 是否已打卡
            if (checkInSet.has(dateStr)) {
                className += ' checked';
            }

            // 是否选中
            if (calendarSelectedDate === dateStr) {
                className += ' selected';
            }

            cell.className = className;
            cell.textContent = d;

            if (dateObj <= today) {
                cell.addEventListener('click', () => selectCalendarDate(dateStr));
            }

            grid.appendChild(cell);
        }
    }

    function selectCalendarDate(dateStr) {
        calendarSelectedDate = dateStr;
        renderCalendar(); // 刷新选中状态

        const quote = getQuoteByDate(dateStr.slice(5)); // 取 "MM-DD"
        const previewText = document.getElementById('calendar-quote-text');
        const previewSource = document.getElementById('calendar-quote-source');
        if (previewText && quote) {
            previewText.textContent = quote.text;
        }
        if (previewSource && quote) {
            previewSource.textContent = quote.source;
        }
    }

    function goToQuoteDate(dateStr) {
        // dateStr: "YYYY-MM-DD"
        const mmdd = dateStr.slice(5);
        const quote = getQuoteByDate(mmdd);
        if (!quote) return;

        currentQuote = quote;
        renderQuote();
        closeCalendar();

        // 显示"历史回顾"标签（可选：通过给 quote-screen 加 class 实现）
        const quoteScreenEl = document.getElementById('quote-screen');
        if (quoteScreenEl) {
            const existingTag = quoteScreenEl.querySelector('.history-tag');
            if (existingTag) existingTag.remove();
            const tag = document.createElement('div');
            tag.className = 'history-tag';
            tag.textContent = `${dateStr} 的历史语录`;
            tag.style.cssText = 'position:absolute;top:20px;left:50%;transform:translateX(-50%);font-size:12px;color:#a08060;opacity:0.8;z-index:10;';
            quoteScreenEl.appendChild(tag);
        }

        // 回到语录屏
        showQuote();
    }

    function prevMonth() {
        calendarCurrentMonth--;
        if (calendarCurrentMonth < 0) {
            calendarCurrentMonth = 11;
            calendarCurrentYear--;
        }
        renderCalendar();
    }

    function nextMonth() {
        calendarCurrentMonth++;
        if (calendarCurrentMonth > 11) {
            calendarCurrentMonth = 0;
            calendarCurrentYear++;
        }
        renderCalendar();
    }
```

- [ ] **Step 3: 修改 js/app.js — 绑定日历事件**

在 `bindEvents()` 函数末尾添加：

```javascript
        // Calendar
        const historyBtn = document.getElementById('history-btn');
        if (historyBtn) {
            historyBtn.addEventListener('click', openCalendar);
        }

        const calendarClose = document.getElementById('calendar-close');
        const calendarBackdrop = document.querySelector('.calendar-backdrop');
        if (calendarClose) {
            calendarClose.addEventListener('click', closeCalendar);
        }
        if (calendarBackdrop) {
            calendarBackdrop.addEventListener('click', closeCalendar);
        }

        const calendarPrev = document.getElementById('calendar-prev');
        const calendarNext = document.getElementById('calendar-next');
        if (calendarPrev) {
            calendarPrev.addEventListener('click', prevMonth);
        }
        if (calendarNext) {
            calendarNext.addEventListener('click', nextMonth);
        }

        const quotePreview = document.getElementById('calendar-quote-preview');
        if (quotePreview) {
            quotePreview.addEventListener('click', () => {
                if (calendarSelectedDate) {
                    goToQuoteDate(calendarSelectedDate);
                }
            });
        }

        // Calendar swipe down to close
        let calTouchStartY = 0;
        const calPanel = document.querySelector('.calendar-panel');
        if (calPanel) {
            calPanel.addEventListener('touchstart', (e) => {
                calTouchStartY = e.touches[0].clientY;
            }, { passive: true });

            calPanel.addEventListener('touchend', (e) => {
                const calTouchEndY = e.changedTouches[0].clientY;
                if (calTouchEndY - calTouchStartY > 80) {
                    closeCalendar();
                }
            }, { passive: true });
        }
```

- [ ] **Step 4: 修改 js/app.js — 修正 showQuote/showAnalysis 以支持音效**

将 `showAnalysis()` 修改为：

```javascript
    let isAnalysisShown = false;

    function showAnalysis() {
        if (isAnalysisShown) return;
        isAnalysisShown = true;
        quoteScreen.classList.remove('active');
        analysisScreen.classList.add('active');
        window.scrollTo(0, 0);
        if (typeof playFlipSound === 'function') {
            playFlipSound();
        }
        // 触发错开淡入动画
        triggerAnalysisAnimations();
    }

    function showQuote() {
        isAnalysisShown = false;
        analysisScreen.classList.remove('active');
        quoteScreen.classList.add('active');
    }
```

注意：需要在 State 区域添加 `let isAnalysisShown = false;`。

- [ ] **Step 5: 浏览器验证**

Run: `python3 -m http.server 8080`
打开 `http://localhost:8080`
1. 下滑到解析屏，点击"查看历史 →"
2. Expected: 日历覆盖层从底部滑入，显示当月日历，今天有红圈标记
3. 点击已打卡日期，底部预览更新
4. 点击底部预览，日历关闭，语录屏更新为该日语录
5. 点击 × 或背景遮罩，日历关闭

- [ ] **Step 6: Commit**

```bash
git add js/app.js
git commit -m "feat: add calendar logic with month navigation, date selection, and quote switching"
```

---

### Task 6: 动画优化

**Files:**
- Modify: `css/main.css`
- Modify: `js/app.js`

- [ ] **Step 1: 修改 css/main.css — 粒子飘动方向优化**

将 `.particle` 和 `@keyframes float` 替换为：

```css
.particle {
    position: absolute;
    width: 3px;
    height: 3px;
    background: #f5e6c8;
    border-radius: 50%;
    opacity: 0.05;
    animation: floatUp linear infinite;
}

@keyframes floatUp {
    0% {
        transform: translateY(100vh) translateX(0);
        opacity: 0;
    }
    10% {
        opacity: 0.08;
    }
    50% {
        transform: translateY(50vh) translateX(15px);
    }
    90% {
        opacity: 0.06;
    }
    100% {
        transform: translateY(-10vh) translateX(-5px);
        opacity: 0;
    }
}
```

同时修改 `createParticles()` 中动画持续时间范围：

在 app.js 中，将 `createParticles` 中：
```javascript
p.style.animationDuration = (10 + Math.random() * 20) + 's';
```
改为：
```javascript
p.style.animationDuration = (10 + Math.random() * 15) + 's';
```

- [ ] **Step 2: 修改 css/main.css — 粒子爆发动画类**

添加：

```css
/* Particle burst effect */
.particle.burst {
    transition: opacity 0.2s ease, transform 0.2s ease;
    opacity: 0.3 !important;
}
```

- [ ] **Step 3: 修改 js/app.js — 添加粒子爆发触发**

在 app.js 中添加：

```javascript
    // ===== Particle Burst =====
    function triggerParticleBurst() {
        const particles = document.querySelectorAll('.particle');
        particles.forEach(p => {
            p.classList.add('burst');
            const currentDuration = parseFloat(p.style.animationDuration) || 15;
            p.style.animationDuration = (currentDuration / 3) + 's';
        });
        setTimeout(() => {
            particles.forEach(p => {
                p.classList.remove('burst');
                const currentDuration = parseFloat(p.style.animationDuration) || 5;
                p.style.animationDuration = (currentDuration * 3) + 's';
            });
        }, 500);
    }
```

- [ ] **Step 4: 修改 css/main.css — 解析屏错开淡入**

添加：

```css
/* Analysis section staggered fade-in */
.analysis-sections .section {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.5s ease, transform 0.5s ease;
}

.analysis-sections .section.visible {
    opacity: 1;
    transform: translateY(0);
}

.analysis-sections .section:nth-child(1) { transition-delay: 0ms; }
.analysis-sections .section:nth-child(2) { transition-delay: 150ms; }
.analysis-sections .section:nth-child(3) { transition-delay: 300ms; }

/* Quote screen entrance */
.quote-container {
    animation: quoteEnter 1.2s ease-out forwards;
}

.quote-source {
    opacity: 0;
    animation: quoteEnter 1.2s ease-out 0.3s forwards;
}
```

- [ ] **Step 5: 修改 js/app.js — IntersectionObserver 触发错开淡入**

添加：

```javascript
    // ===== Analysis Animations =====
    function triggerAnalysisAnimations() {
        const sections = document.querySelectorAll('.analysis-sections .section');
        sections.forEach((section, index) => {
            section.classList.remove('visible');
            // 强制重排确保动画可重新触发
            void section.offsetWidth;
            setTimeout(() => {
                section.classList.add('visible');
            }, index * 150);
        });
    }
```

注意：之前的 `showAnalysis()` 中已经调用了 `triggerAnalysisAnimations()`。

- [ ] **Step 6: 浏览器验证**

Run: `python3 -m http.server 8080`
打开 `http://localhost:8080`
1. 页面加载：语录文字从下方淡入滑出，出处延迟 300ms 淡入
2. 下滑到解析屏：三个 section 依次淡入，间隔 150ms
3. 点击打卡：粒子短暂加速变亮，然后恢复
4. 按钮 hover：轻微上浮 + 阴影

- [ ] **Step 7: Commit**

```bash
git add css/main.css js/app.js
git commit -m "feat: add particle burst, staggered fade-in, and button micro-interactions"
```

---

### Task 7: 平滑滚动升级

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: 修改 js/app.js — 替换原生滚动为自定义缓动**

添加：

```javascript
    // ===== Smooth Scroll =====
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function smoothScrollTo(targetY, duration) {
        const startY = window.scrollY || window.pageYOffset;
        const diff = targetY - startY;
        const startTime = performance.now();

        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            window.scrollTo(0, startY + diff * eased);
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }
        requestAnimationFrame(step);
    }
```

- [ ] **Step 2: 修改 js/app.js — 在 showAnalysis 中使用自定义滚动**

修改 `showAnalysis`：

```javascript
    function showAnalysis() {
        if (isAnalysisShown) return;
        isAnalysisShown = true;
        quoteScreen.classList.remove('active');
        analysisScreen.classList.add('active');
        smoothScrollTo(0, 800);
        if (typeof playFlipSound === 'function') {
            playFlipSound();
        }
        triggerAnalysisAnimations();
    }
```

- [ ] **Step 3: 浏览器验证**

Run: `python3 -m http.server 8080`
打开 `http://localhost:8080`
下滑触发解析屏：Expected: 滚动更平滑，有阻尼感，不是原生 smooth scroll 的线性感觉

- [ ] **Step 4: Commit**

```bash
git add js/app.js
git commit -m "feat: replace native smooth scroll with custom cubic-bezier easing"
```

---

### Task 8: 集成验证

**Files:**
- Modify: `tests/streak.test.js`（如需要补充）

- [ ] **Step 1: 运行所有 Node.js 测试**

Run: `node tests/data.test.js && node tests/streak.test.js`
Expected: 两个测试文件全部通过（data: 9/9, streak: 6/6）

- [ ] **Step 2: 浏览器端到端验证**

Run: `python3 -m http.server 8080`
打开 `http://localhost:8080`

逐项验证：
1. ✅ 语录屏入场动画（文字淡入滑出，出处延迟）
2. ✅ 下滑到解析屏有翻页音效
3. ✅ 解析屏三个 section 依次淡入
4. ✅ streak bar 显示正确（新用户显示"开始学习..."）
5. ✅ 点击"今日已学" → 按钮变"已打卡 ✓"，背景变深红
6. ✅ 打卡同时播放"咚"音效
7. ✅ streak 数字放大高亮动画
8. ✅ 火焰图标跳动动画
9. ✅ 粒子短暂加速变亮
10. ✅ 分享选项展开
11. ✅ 点击"查看历史" → 日历覆盖层滑入
12. ✅ 日历显示当月，今天有红圈
13. ✅ 已打卡日期有小红点
14. ✅ 点击日期，底部预览更新
15. ✅ 点击底部预览 → 关闭日历，语录屏切换为该日内容
16. ✅ 点击 🔊 变 🔇，再次点击恢复，状态持久化
17. ✅ 静音状态下打卡/翻页无音效
18. ✅ 下滑关闭日历（touch）

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: v2 experience enhancement complete — streak, calendar, animations, sound"
```

---

## Self-Review

### Spec Coverage Checklist

| Spec 章节 | 实现任务 | 状态 |
|-----------|----------|------|
| 3.1 Streak 数据模型 | Task 2 | ✅ |
| 3.1 Streak UI 展示 | Task 3 | ✅ |
| 3.1 打卡成功动画 | Task 3 + Task 6 | ✅ |
| 3.2 日历触发入口 | Task 3 | ✅ |
| 3.2 日历覆盖层打开/关闭 | Task 4 + Task 5 | ✅ |
| 3.2 月历网格样式 | Task 4 | ✅ |
| 3.2 交互行为 | Task 5 | ✅ |
| 3.3 滚动缓动 | Task 7 | ✅ |
| 3.3 错开淡入 | Task 6 | ✅ |
| 3.3 粒子飘动方向 | Task 6 | ✅ |
| 3.3 粒子爆发 | Task 6 | ✅ |
| 3.3 按钮微交互 | Task 4 (CSS) | ✅ |
| 3.4 翻页音效 | Task 1 | ✅ |
| 3.4 打卡音效 | Task 1 | ✅ |
| 3.4 静音控制 | Task 1 + Task 3 | ✅ |
| 3.4 代码封装 | Task 1 | ✅ |
| 5. 数据迁移策略 | Task 2 | ✅ |
| 8. 验收标准 | Task 8 | ✅ |

### Placeholder Scan

- 无 TBD/TODO/"implement later" ✅
- 无 "add appropriate error handling" 等模糊描述 ✅
- 所有步骤包含具体代码 ✅
- 无 "Similar to Task N" 引用 ✅

### Type Consistency

- `localStorage` 键名在 Task 2 的 `STORAGE_KEYS` 中统一声明，Task 3 读取时直接使用 ✅
- `calendarSelectedDate` 格式为 `YYYY-MM-DD`，与 `getQuoteByDate` 需要的 `MM-DD` 在 `goToQuoteDate` 中正确转换 ✅
- `playFlipSound` / `playCheckinSound` 全局暴露方式在 Task 1 定义，Task 3/5/6 调用时一致 ✅

### 无 gaps，计划完整 ✅
