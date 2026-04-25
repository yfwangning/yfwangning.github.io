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
