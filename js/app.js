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

    // ===== Initialization =====
    function init() {
        currentQuote = getTodayQuote();
        renderQuote();
        createParticles();
        checkCheckInStatus();
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
        quoteScreen.classList.remove('active');
        analysisScreen.classList.add('active');
        window.scrollTo(0, 0);
    }

    function showQuote() {
        analysisScreen.classList.remove('active');
        quoteScreen.classList.add('active');
    }

    // ===== Check-in =====
    function getCheckInKey() {
        const today = new Date();
        return `checkin_${today.getFullYear()}_${today.getMonth() + 1}_${today.getDate()}`;
    }

    function checkCheckInStatus() {
        const key = getCheckInKey();
        const checked = localStorage.getItem(key) === 'true';
        if (checked) {
            isCheckedIn = true;
            updateCheckInUI();
        }
    }

    function doCheckIn() {
        if (isCheckedIn) return;

        const key = getCheckInKey();
        localStorage.setItem(key, 'true');

        // Update streak
        const today = new Date().toISOString().split('T')[0];
        let history = JSON.parse(localStorage.getItem('checkInHistory') || '[]');
        if (!history.includes(today)) {
            history.push(today);
            localStorage.setItem('checkInHistory', JSON.stringify(history));
        }

        isCheckedIn = true;
        updateCheckInUI();
    }

    function updateCheckInUI() {
        checkinBtn.textContent = '已打卡 ✓';
        checkinBtn.classList.add('checked');
        shareOptions.classList.remove('hidden');
    }

    // ===== Events =====
    function bindEvents() {
        // Click scroll hint to show analysis
        if (scrollHint) {
            scrollHint.addEventListener('click', showAnalysis);
        }

        // Touch swipe down to show analysis
        let touchStartY = 0;
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

        // Check-in button
        checkinBtn.addEventListener('click', doCheckIn);

        // Share buttons
        document.getElementById('share-image-btn').addEventListener('click', () => {
            if (typeof generateShareCard === 'function' && currentQuote) {
                generateShareCard(currentQuote);
            }
        });

        document.getElementById('copy-text-btn').addEventListener('click', () => {
            if (!currentQuote) return;
            const text = `${currentQuote.text}\n\n—— ${currentQuote.source}\n\n毛主席语录 · 每日一句`;
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.getElementById('copy-text-btn');
                const original = btn.textContent;
                btn.textContent = '已复制';
                setTimeout(() => { btn.textContent = original; }, 2000);
            }).catch(() => {
                alert('复制失败，请手动复制');
            });
        });
    }

    // ===== Start =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
