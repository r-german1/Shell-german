const TelegramBot = require('node-telegram-bot-api');

// ⚠️ توکنێ خۆ ل شوێنا 'YOUR_TELEGRAM_BOT_TOKEN' بپێستینە
const token = 'YOUR_TELEGRAM_BOT_TOKEN';

const bot = new TelegramBot(token, { polling: true });

// بنکەیێ داتایان بۆ تۆمارکرنا تەمەنێ بەکارهێنەران
const userData = {};

console.log("🚀 VIP Bot with Age Restriction (Max 25 Years) is running...");

// فەرمانا دەستپێکێ /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (userData[userId] && userData[userId].registered) {
        bot.sendMessage(chatId, `چالاكە! هەژمارا تە سەرکەفتوو بوو. (تەمەنێ تە: ${userData[userId].age} ساڵ)\nتۆ دشێی ب خۆڕایی بکاربینی! ⚡`);
    } else {
        userData[userId] = { step: 'WAITING_FOR_AGE' };
        bot.sendMessage(chatId, "سڵاو! بەخێر بێی بۆ خزمەتگوزاریا خۆڕایی (Free VIP).\n\nتکایە **تەمەنێ خۆ (ب ژمارە)** بنڤێسە دا کو سیستم هەژمارا تە چالاک بکت (تەنێ بۆ تەمەنێ هەتا 25 ساڵانە):");
    }
});

// وەرگرتنا پەیامان و پشتڕاستکرنا تەمەنی
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text ? msg.text.trim() : '';

    if (text === '/start') return;

    // گەر بەکارهێنەر ل قۆناغا تۆمارکرنا تەمەنی بێت
    if (userData[userId] && userData[userId].step === 'WAITING_FOR_AGE') {
        const age = parseInt(text, 10);

        if (isNaN(age) || age <= 0) {
            bot.sendMessage(chatId, "❌ تکایە تەنێ ژمارەیەکا دروست بنڤێسە (بۆ نموونە: 18 یان 22):");
            return;
        }

        if (age <= 25) {
            userData[userId] = { age: age, registered: true, step: 'COMPLETED' };
            bot.sendMessage(chatId, `✅ پیڕۆزە! تەمەنێ تە (${age} ساڵ) هاتە پەسەندکرن.\n\nنوکە خزمەتگوزاریا Full VIP بۆ تە بەلاڕەشە و 24 کاژێری تۆ دشێی بکاربینی! 🎉`);
        } else {
            userData[userId] = { age: age, registered: false, step: 'REJECTED' };
            bot.sendMessage(chatId, `⛔ ببورە! ئەڤ خزمەتگوزارییە خۆڕاییە تەنێ بۆ ئەو کەسانەیە کو تەمەنێ وان ۲٥ ساڵ یان کێمترە. (تەمەنێ تە: ${age} ساڵ)`);
        }
    } else if (userData[userId] && userData[userId].registered) {
        // ئەگەر تۆمارکری بێت و پەیام نارد بێت
        bot.sendMessage(chatId, `🤖 بەرسڤا ئۆتۆماتیکی VIP: پەیاما تە ژ لایەنێ سیستمێ خۆڕایی هاتە وەرگرتن!\nتە نڤێسی: ${text}`);
    }
});
