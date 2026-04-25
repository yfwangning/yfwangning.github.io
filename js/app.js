(function() {
    'use strict';

    // ===== DOM Elements =====
    const quoteScreen = document.getElementById('quote-screen');
    const analysisScreen = document.getElementById('analysis-screen');
    const quoteText = document.getElementById('quote-text');
    const quoteSource = document.getElementById('quote-source');
    const analysisQuote = document.getElementById('analysis-quote');
    const analysisSource = document.getElementById('analysis-source');
    const interpretationEl = document.getElementById('interpretation');
    const contextEl = document.getElementById('context');
    const insightEl = document.getElementById('insight');
    const checkinBtn = document.getElementById('checkin-btn');
    const shareOptions = document.getElementById('share-options');
    const scrollHint = document.querySelector('.scroll-hint');

    // ===== State =====
    let currentQuote = null;
    let isCheckedIn = false;

    // ===== Calendar State =====
    let calendarCurrentMonth = new Date().getMonth();
    let calendarCurrentYear = new Date().getFullYear();
    let calendarSelectedDate = null;
    let isAnalysisShown = false;

    // ===== Streak Data Layer =====

    const STORAGE_KEYS = {
        history: 'checkin_history',
        current: 'streak_current',
        best: 'streak_best',
        soundMuted: 'sound_muted'
    };

    function migrateV1Data() {
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
            return null;
        }

        history.push(today);
        saveCheckInHistory(history);

        const current = calculateStreak(history, today);
        const best = calculateBestStreak(history, current);

        localStorage.setItem(STORAGE_KEYS.current, String(current));
        localStorage.setItem(STORAGE_KEYS.best, String(best));

        return { current, best };
    }

    // Stubs for functions defined in later tasks
    function triggerParticleBurst() {}

    function updateStreakUI(current, best) {
        const streakText = document.getElementById('streak-text');
        const streakIcon = document.querySelector('.streak-icon');
        if (!streakText) return;

        if (current === 0 && best === 0) {
            streakText.textContent = '开始学习 · 每日一句，持之以恒';
        } else {
            streakText.textContent = `连续学习 ${current} 天 · 最高纪录 ${best} 天`;
        }

        if (streakIcon) {
            if (current >= 30) {
                streakIcon.style.filter = 'hue-rotate(-20deg) saturate(1.5)';
            } else if (current >= 14) {
                streakIcon.style.filter = 'hue-rotate(-10deg) saturate(1.3)';
            } else if (current >= 7) {
                streakIcon.style.filter = 'saturate(1.2)';
            }
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

    function initStreakUI() {
        const state = getStreakState();
        updateStreakUI(state.current, state.best);
        updateMuteIcon();
    }

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
            if (dateStr === todayStr) {
                className += ' today';
            }
            if (dateObj > today) {
                className += ' future';
            }
            if (checkInSet.has(dateStr)) {
                className += ' checked';
            }
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
        renderCalendar();

        const quote = getQuoteByDate(dateStr.slice(5));
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
        const mmdd = dateStr.slice(5);
        const quote = getQuoteByDate(mmdd);
        if (!quote) return;

        currentQuote = quote;
        renderQuote();
        closeCalendar();

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

    function triggerAnalysisAnimations() {
        // Stub: will be implemented in Task 6
    }

    // ===== Initialization =====
    function init() {
        migrateV1Data();
        currentQuote = getTodayQuote();
        renderQuote();
        createParticles();
        checkCheckInStatus();
        initStreakUI();
        bindEvents();
    }

    // ===== Render =====
    function renderQuote() {
        if (!currentQuote) return;

        quoteText.textContent = currentQuote.text;
        quoteSource.textContent = currentQuote.source;

        analysisQuote.textContent = currentQuote.text;
        analysisSource.textContent = currentQuote.source;
        interpretationEl.textContent = currentQuote.interpretation;
        contextEl.textContent = currentQuote.context;
        insightEl.textContent = currentQuote.insight;
    }

    // ===== Particles =====
    function createParticles() {
        const container = document.getElementById('particles');
        if (!container) return;

        const count = 25;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = (10 + Math.random() * 20) + 's';
            p.style.animationDelay = (Math.random() * 10) + 's';
            p.style.width = (2 + Math.random() * 3) + 'px';
            p.style.height = p.style.width;
            container.appendChild(p);
        }
    }

    // ===== View Transition =====
    function showAnalysis() {
        if (isAnalysisShown) return;
        isAnalysisShown = true;
        quoteScreen.classList.remove('active');
        analysisScreen.classList.add('active');
        window.scrollTo(0, 0);
        if (typeof playFlipSound === 'function') {
            playFlipSound();
        }
        triggerAnalysisAnimations();
    }

    function showQuote() {
        isAnalysisShown = false;
        analysisScreen.classList.remove('active');
        quoteScreen.classList.add('active');
    }

    // ===== Check-in =====
    function checkCheckInStatus() {
        if (isCheckedInToday()) {
            isCheckedIn = true;
            updateCheckInUI();
        }
    }

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

    function updateCheckInUI() {
        if (checkinBtn) {
            checkinBtn.textContent = '已打卡 ✓';
            checkinBtn.classList.add('checked');
        }
        if (shareOptions) {
            shareOptions.classList.remove('hidden');
        }
    }

    // ===== Events =====
    function bindEvents() {
        // Click scroll hint to show analysis
        if (scrollHint) {
            scrollHint.addEventListener('click', showAnalysis);
        }

        // Touch swipe down to show analysis
        let touchStartY = 0;
        if (quoteScreen) {
            quoteScreen.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
            }, { passive: true });

            quoteScreen.addEventListener('touchend', (e) => {
                const touchEndY = e.changedTouches[0].clientY;
                if (touchStartY - touchEndY > 50) {
                    showAnalysis();
                }
            }, { passive: true });

            // Mouse wheel to show analysis
            quoteScreen.addEventListener('wheel', (e) => {
                if (e.deltaY > 30) {
                    showAnalysis();
                }
            }, { passive: true });
        }

        // Check-in button
        if (checkinBtn) {
            checkinBtn.addEventListener('click', doCheckIn);
        }

        // Share buttons
        const shareImageBtn = document.getElementById('share-image-btn');
        if (shareImageBtn) {
            shareImageBtn.addEventListener('click', () => {
                if (typeof generateShareCard === 'function' && currentQuote) {
                    generateShareCard(currentQuote);
                }
            });
        }

        const copyTextBtn = document.getElementById('copy-text-btn');
        if (copyTextBtn) {
            copyTextBtn.addEventListener('click', () => {
                if (!currentQuote) return;
                const text = `${currentQuote.text}\n\n—— ${currentQuote.source}\n\n毛主席语录 · 每日一句`;
                navigator.clipboard.writeText(text).then(() => {
                    const original = copyTextBtn.textContent;
                    copyTextBtn.textContent = '已复制';
                    setTimeout(() => { copyTextBtn.textContent = original; }, 2000);
                }).catch(() => {
                    alert('复制失败，请手动复制');
                });
            });
        }

        // Mute toggle
        const muteBtn = document.getElementById('mute-btn');
        if (muteBtn) {
            muteBtn.addEventListener('click', toggleMute);
        }

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
    }

    // ===== Start =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
