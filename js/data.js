const QUOTES_DATA = {
    quotes: [
        {
            id: "001",
            date: "04-23",
            text: "星星之火，可以燎原。",
            source: "《星星之火，可以燎原》，1930年1月5日",
            interpretation: "微小的力量也能发展成燎原之势，不要轻视开始时的渺小。",
            context: "毛泽东写给林彪的信，批评了当时党内存在的悲观思想，坚定了革命必胜的信念。",
            insight: "对当代青年：每一个伟大的成就，都始于一个看似微不足道的开始。坚持你的小火苗。"
        },
        {
            id: "002",
            date: "04-24",
            text: "一切反动派都是纸老虎。",
            source: "《和美国记者安娜·路易斯·斯特朗的谈话》，1946年8月",
            interpretation: "表面上强大的敌人其实并不可怕，真正的力量属于人民。",
            context: "在解放战争初期，面对国民党军队的强大攻势，毛泽东提出了这一著名论断。",
            insight: "对当代青年：面对困难时不要被表象吓倒，认清本质才能找到突破口。"
        },
        {
            id: "003",
            date: "04-25",
            text: "好好学习，天天向上。",
            source: "为儿童节题词，1951年",
            interpretation: "持续学习是进步的根本途径，每天都要有新的收获。",
            context: "毛泽东为庆祝国际儿童节而题写的贺词，后来成为激励全国青少年学习的经典口号。",
            insight: "对当代青年：终身学习是应对变化世界的不二法门，每天进步一点点。"
        },
        {
            id: "004",
            date: "04-26",
            text: "世上无难事，只要肯登攀。",
            source: "《水调歌头·重上井冈山》，1965年",
            interpretation: "世界上没有办不到的事情，关键在于有没有决心和毅力去做。",
            context: "毛泽东重上井冈山时所作，回顾革命历程，表达对奋斗精神的赞颂。",
            insight: "对当代青年：很多\"不可能\"只是还没尝试。迈出第一步，你就已经超过大多数人。"
        },
        {
            id: "005",
            date: "04-27",
            text: "人民，只有人民，才是创造世界历史的动力。",
            source: "《论联合政府》，1945年",
            interpretation: "历史的进程由人民群众的实践活动推动，人民是历史的真正创造者。",
            context: "在党的七大上作的政治报告，系统阐述了人民在历史发展中的决定性作用。",
            insight: "对当代青年：不要轻视个体的力量，每个普通人的选择和行动都在塑造未来。"
        },
        {
            id: "006",
            date: "04-28",
            text: "自己动手，丰衣足食。",
            source: "为大生产运动题词，1939年",
            interpretation: "依靠自己的努力来解决生存和发展的问题，自力更生是根本。",
            context: "抗日战争时期，边区开展大生产运动，毛泽东提出这一口号以克服经济困难。",
            insight: "对当代青年：依赖他人永远被动，掌握核心能力才是立足之本。"
        },
        {
            id: "007",
            date: "04-29",
            text: "没有调查，就没有发言权。",
            source: "《反对本本主义》，1930年",
            interpretation: "不了解实际情况就不应该发表意见，实践是认识的基础。",
            context: "针对当时红军中存在的教条主义思想，强调调查研究的重要性。",
            insight: "对当代青年：在表达观点之前，先确保自己真的了解事情的全貌。"
        },
        {
            id: "008",
            date: "04-30",
            text: "战略上藐视敌人，战术上重视敌人。",
            source: "《关于目前党的政策中的几个重要问题》，1948年",
            interpretation: "要有必胜的信心和勇气，同时在具体行动中谨慎周密、全力以赴。",
            context: "解放战争转入战略决战阶段时，对全党提出的斗争策略原则。",
            insight: "对当代青年：既要有\"我能行\"的底气，也要有\"每一步都走好\"的务实。"
        },
        {
            id: "009",
            date: "05-01",
            text: "劳动创造了人本身。",
            source: "相关论述",
            interpretation: "劳动是人类区别于动物的根本特征，也是人类社会发展的基础。",
            context: "五一劳动节相关论述，强调劳动的崇高价值和意义。",
            insight: "对当代青年：无论从事什么工作，认真对待、踏实劳动都是值得尊重的。"
        },
        {
            id: "010",
            date: "05-02",
            text: "虚心使人进步，骄傲使人落后。",
            source: "《中国共产党第八次全国代表大会开幕词》，1956年",
            interpretation: "保持谦虚态度才能不断学习成长，自满则会导致停滞和倒退。",
            context: "党的八大开幕词中的著名论断，是对全党作风的要求和期许。",
            insight: "对当代青年：越是有成绩的时候，越要保持清醒和谦逊。"
        }
    ]
};

/**
 * 根据日期获取当日语录
 * @param {string} dateStr - "MM-DD" 格式日期
 * @returns {Object} 语录对象
 */
function getQuoteByDate(dateStr) {
    const quote = QUOTES_DATA.quotes.find(q => q.date === dateStr);
    if (quote) return quote;

    // Fallback: 用日期哈希取模
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
        hash = hash & hash;
    }
    const index = Math.abs(hash) % QUOTES_DATA.quotes.length;
    return QUOTES_DATA.quotes[index];
}

/**
 * 获取今日语录
 * @returns {Object} 语录对象
 */
function getTodayQuote() {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return getQuoteByDate(`${mm}-${dd}`);
}

// 导出（Node.js 环境兼容）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QUOTES_DATA, getQuoteByDate, getTodayQuote };
}
