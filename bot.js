const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const crypto = require('crypto');

const TOKEN = '8885872945:AAFBMsgi1ZQvtYMjtA48sWBaR3TdyXjJNpg';
const BOT_OWNER = '@YUSEEF_SURCHI';
const ADMIN_PASSWORD = 'rayan1328262';

const bot = new TelegramBot(TOKEN, { polling: true });

// بنکەیێ داتایان ل بیرگێ (Database in-memory)
const users = {}; // userId -> { isVip, vipExpire, usedKey }
const validKeys = {}; // keyString -> { active, expireDays }

console.log("🚀 VIP Bot with Key System is Running...");

// کیبۆردێ سەرەکی یێ ٤ لاب (4 Labs)
function getMainMenu() {
    return {
        reply_markup: {
            keyboard: [
                [{ text: "📥 داگرتنا ڤیدیۆیێ" }, { text: "👤 پرۆفایل" }],
                [{ text: "🔑 چالاککرنا VIP" }, { text: "🛠️ دروستکرنا Key (Admin)" }]
            ],
            resize_keyboard: true
        }
    };
}

// فەرمانا /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!users[userId]) {
        users[userId] = { isVip: false, vipExpire: null, usedKey: null, step: null };
    }

    const welcomeMsg = `✨ **بەخێر بێی بۆ بۆتێ VIP یێ داگرتنا میدیایێ!**

👤 **خاوەنێ بۆتی:** ${BOT_OWNER}

تکایە ئێک ژ بژاردەیێن خوارێ هەڵبژێرە ژ کیبۆردی:`;

    bot.sendMessage(chatId, welcomeMsg, { parse_mode: 'Markdown', ...getMainMenu() });
});

// ڕێڤەبرنا پەیامان و ٤ لابان
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text ? msg.text.trim() : '';

    if (text.startsWith('/')) return;

    if (!users[userId]) {
        users[userId] = { isVip: false, vipExpire: null, usedKey: null, step: null };
    }

    const user = users[userId];

    // پشکنینا ماوەیا VIP
    if (user.isVip && user.vipExpire && new Date() > new Date(user.vipExpire)) {
        user.isVip = false;
        user.vipExpire = null;
        bot.sendMessage(chatId, "⚠️ **ماوەیا هژمارا تە یا VIP ب داوی هات!** نوکە هژمارا تە بووەوە ئاسایی (Normal).");
    }

    // 🔴 LAB 1: داگرتنا ڤیدیۆیێ
    if (text === "📥 داگرتنا ڤیدیۆیێ") {
        user.step = 'awaiting_url';
        return bot.sendMessage(chatId, "📥 **تکایە لینکێ ڤیدیۆیێ ژ (TikTok, Instagram, YouTube, Snapchat, Facebook) بڕێزە:**");
    }

    // 🔴 LAB 2: پرۆفایل
    if (text === "👤 پرۆفایل") {
        const status = user.isVip ? "🌟 VIP" : "👤 Normal (ئاسایی)";
        const expireInfo = user.isVip ? `\n⏳ **بەروارێ بەسەرچوونێ:** ${new Date(user.vipExpire).toLocaleDateString()}` : "";
        const qualityInfo = user.isVip ? "✨ **کوالیتییا تە:** 4K Full VIP (زۆر بەرز)" : "⚡ **کوالیتییا تە:** Free 1080p (ئاسایی)";

        const profileText = `👤 **زانیاریێن پرۆفایلی:**\n\n🆔 **ID:** \`${userId}\` \n📊 **پلە:** ${status}${expireInfo}\n🎬 **کوالیتییا داگرتنێ:** ${qualityInfo}`;
        return bot.sendMessage(chatId, profileText, { parse_mode: 'Markdown' });
    }

    // 🔴 LAB 3: چالاککرنا Key
    if (text === "🔑 چالاککرنا VIP") {
        user.step = 'awaiting_key';
        return bot.sendMessage(chatId, "🔑 **تکایە Keyێ خۆ یێ ١٦ پیتی بڕێزە دا هژمارا تە ببیتە VIP بۆ ماوەیا ۱ مەهێ:**");
    }

    // 🔴 LAB 4: دروستکرنا Key (تەنێ بۆ خاوەنی ب پاسپۆرت)
    if (text === "🛠️ دروستکرنا Key (Admin)") {
        user.step = 'awaiting_admin_pass';
        return bot.sendMessage(chatId, "🔐 **تکایە پاسپۆرتێ ڕێڤەبەری بنڤێسە دا بشێی Key دروست بکی:**");
    }

    // ⚙️ پرۆسەیا لێدانا پاسپۆرتێ ڕێڤەبەری
    if (user.step === 'awaiting_admin_pass') {
        if (text === ADMIN_PASSWORD) {
            user.step = null;
            
            // دروستکرنا Key ب پیتا SNAPTIK + 9 پیتێن عشوائی (کۆم: 16 پیت)
            const randomPart = crypto.randomBytes(5).toString('hex').toUpperCase().slice(0, 9);
            const newKey = `SNAPTIK${randomPart}`;
            
            validKeys[newKey] = { active: true, expireDays: 30 };

            return bot.sendMessage(chatId, `✅ **Key ب سەرکەفتنی هاتە دروستکرن!**\n\n🔑 **VIP Key:** \`${newKey}\` \n📅 **ماوە:** 1 مەهـ (30 ڕۆژ)\n\n*(ئەڤ Keyە تەنێ بۆ ئێک کەسی کار دکەت و پاشان بەسەر دچێت)*`, { parse_mode: 'Markdown' });
        } else {
            user.step = null;
            return bot.sendMessage(chatId, "❌ **پاسپۆرت شاشە!** دەسەڵاتا تە نینە Key دروست بکی.");
        }
    }

    // ⚙️ پرۆسەیا چالاککرنا Key ژ لایێ بەکارهێنەری ڤە
    if (user.step === 'awaiting_key') {
        user.step = null;
        const enteredKey = text.toUpperCase();

        if (validKeys[enteredKey] && validKeys[enteredKey].active) {
            // سڕینەوەی key دا کەسەک دی نەشێت بکاربینێت
            validKeys[enteredKey].active = false;

            const expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + 30); // 30 ڕۆژ

            user.isVip = true;
            user.vipExpire = expireDate;
            user.usedKey = enteredKey;

            return bot.sendMessage(chatId, "🎉 **پیڕۆزە! هژمارا تە بوو ب 🌟 VIP بۆ ماوەیا ۱ مەهێ.**\nنوکە تۆ دشێی ڤیدیۆیان ب کوالیتییا **4K** بێ بڕین دابگری!");
        } else {
            return bot.sendMessage(chatId, "❌ **ئەڤ Keyە ناپەژیرێت، بکارهاتییە یان شاشە!**");
        }
    }

    // ⚙️ پرۆسەیا داگرتنا لینکێ میدیایێ
    if (text.startsWith('http://') || text.startsWith('https://')) {
        const isVip = user.isVip;
        const qualityText = isVip ? "✨ 4K Full VIP Quality" : "⚡ 1080p Free Quality";
        const loadingMsg = await bot.sendMessage(chatId, `⏳ **یێ ل سەر کار دکەت... داگرتنا میدیایێ ب کوالیتییا (${qualityText})...**`);

        try {
            const apiUrl = `https://api.cobalt.tools/api/json`;
            const response = await axios.post(apiUrl, {
                url: text,
                vQuality: isVip ? "max" : "1080",
                vCodec: "h264",
                noWatermark: true
            }, {
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            });

            if (response.data && response.data.url) {
                await bot.sendVideo(chatId, response.data.url, {
                    caption: `✅ **داگرتن سەرکەفت ب کوالیتییا (${qualityText})!**\n👤 Owner: ${BOT_OWNER}`,
                    parse_mode: 'Markdown'
                });
            } else {
                bot.sendMessage(chatId, "❌ کێشەیەک پەیدا بوو. پشتڕاست ببەوە کو لینکێ تە دروستە.");
            }
            bot.deleteMessage(chatId, loadingMsg.message_id);
        } catch (err) {
            bot.deleteMessage(chatId, loadingMsg.message_id);
            bot.sendMessage(chatId, "❌ نەتوانرا ڤیدیۆ بێتە داگرتن. تکایە لینکەکێ دی بپشکنە.");
        }
    }
});
