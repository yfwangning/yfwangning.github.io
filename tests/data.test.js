const { getQuoteByDate, getTodayQuote, QUOTES_DATA } = require('../js/data.js');

function assert(condition, message) {
    if (!condition) {
        throw new Error(`ASSERTION FAILED: ${message}`);
    }
}

function testGetQuoteByDateExisting() {
    const quote = getQuoteByDate("04-23");
    assert(quote.id === "001", `Expected id "001", got "${quote.id}"`);
    assert(quote.text === "星星之火，可以燎原。", `Unexpected text: ${quote.text}`);
    console.log('✓ testGetQuoteByDateExisting passed');
}

function testGetQuoteByDateFallback() {
    const quote = getQuoteByDate("12-31"); // 不存在的日期
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

function testDataStructure() {
    assert(Array.isArray(QUOTES_DATA.quotes), 'quotes should be an array');
    assert(QUOTES_DATA.quotes.length > 0, 'quotes should not be empty');

    const first = QUOTES_DATA.quotes[0];
    assert(typeof first.id === 'string', 'quote.id should be string');
    assert(typeof first.text === 'string', 'quote.text should be string');
    assert(typeof first.source === 'string', 'quote.source should be string');
    assert(typeof first.interpretation === 'string', 'quote.interpretation should be string');
    assert(typeof first.context === 'string', 'quote.context should be string');
    assert(typeof first.insight === 'string', 'quote.insight should be string');
    console.log('✓ testDataStructure passed');
}

// 运行所有测试
console.log('Running data tests...\n');
testDataStructure();
testGetQuoteByDateExisting();
testGetQuoteByDateFallback();
testGetQuoteByDateDeterministic();
testGetTodayQuote();
console.log('\nAll tests passed!');
