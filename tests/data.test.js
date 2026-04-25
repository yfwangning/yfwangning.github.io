const { getQuoteByDate, getTodayQuote, QUOTES_DATA } = require('../js/data.js');

function assert(condition, message) {
    if (!condition) {
        throw new Error(`ASSERTION FAILED: ${message}`);
    }
}

function testDataStructure() {
    assert(Array.isArray(QUOTES_DATA.quotes), 'quotes should be an array');
    assert(QUOTES_DATA.quotes.length === 365, `Expected 365 quotes, got ${QUOTES_DATA.quotes.length}`);

    const first = QUOTES_DATA.quotes[0];
    assert(typeof first.id === 'string', 'quote.id should be string');
    assert(typeof first.text === 'string', 'quote.text should be string');
    assert(typeof first.source === 'string', 'quote.source should be string');
    assert(typeof first.interpretation === 'string', 'quote.interpretation should be string');
    assert(typeof first.context === 'string', 'quote.context should be string');
    assert(typeof first.insight === 'string', 'quote.insight should be string');
    console.log('✓ testDataStructure passed');
}

function testGetQuoteByDateExisting() {
    const quote = getQuoteByDate("01-01");
    assert(quote.id === "001", `Expected id "001", got "${quote.id}"`);
    assert(quote.text === "一万年太久，只争朝夕。", `Unexpected text: ${quote.text}`);
    console.log('✓ testGetQuoteByDateExisting passed');
}

function testGetQuoteByDateMidYear() {
    const quote = getQuoteByDate("07-01");
    assert(quote !== undefined, 'Mid-year date should return a quote');
    assert(quote.text !== undefined, 'Quote should have text');
    console.log('✓ testGetQuoteByDateMidYear passed');
}

function testGetQuoteByDateFallback() {
    const quote = getQuoteByDate("02-30"); // 不存在的日期
    assert(quote !== undefined, 'Fallback should return a quote');
    assert(quote.id !== undefined, 'Fallback quote should have an id');
    console.log('✓ testGetQuoteByDateFallback passed');
}

function testGetQuoteByDateDeterministic() {
    const q1 = getQuoteByDate("12-31");
    const q2 = getQuoteByDate("12-31");
    assert(q1.id === q2.id, 'Same date should return same quote');
    console.log('✓ testGetQuoteByDateDeterministic passed');
}

function testGetTodayQuote() {
    const quote = getTodayQuote();
    assert(quote !== undefined, 'getTodayQuote should return a quote');
    assert(quote.text !== undefined, 'Quote should have text');
    assert(quote.source !== undefined, 'Quote should have source');
    console.log('✓ testGetTodayQuote passed');
}

function testAllDatesCovered() {
    const dates = new Set(QUOTES_DATA.quotes.map(q => q.date));
    assert(dates.size === 365, `Expected 365 unique dates, got ${dates.size}`);

    // Verify first and last dates
    const first = QUOTES_DATA.quotes[0];
    const last = QUOTES_DATA.quotes[QUOTES_DATA.quotes.length - 1];
    assert(first.date === '01-01', `First date should be 01-01, got ${first.date}`);
    assert(last.date === '12-31', `Last date should be 12-31, got ${last.date}`);
    console.log('✓ testAllDatesCovered passed');
}

function testNoDuplicateTexts() {
    const texts = QUOTES_DATA.quotes.map(q => q.text);
    const uniqueTexts = new Set(texts);
    assert(uniqueTexts.size === 365, `Expected 365 unique texts, got ${uniqueTexts.size}`);
    console.log('✓ testNoDuplicateTexts passed');
}

function testSequentialIds() {
    for (let i = 0; i < 365; i++) {
        const expectedId = String(i + 1).padStart(3, '0');
        assert(QUOTES_DATA.quotes[i].id === expectedId, `Expected id ${expectedId} at index ${i}, got ${QUOTES_DATA.quotes[i].id}`);
    }
    console.log('✓ testSequentialIds passed');
}

// 运行所有测试
console.log('Running data tests...\n');
testDataStructure();
testSequentialIds();
testAllDatesCovered();
testNoDuplicateTexts();
testGetQuoteByDateExisting();
testGetQuoteByDateMidYear();
testGetQuoteByDateFallback();
testGetQuoteByDateDeterministic();
testGetTodayQuote();
console.log('\nAll tests passed!');
