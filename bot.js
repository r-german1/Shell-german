const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// ⚡ توکنێ تە یێ فەرمی ل ڤێرێ هاتە جێگیرکرن
const TOKEN = '8885872945:AAFBMsgi1ZQvtYMjtA48sWBaR3TdyXjJNpg';
const REQUIRED_CHANNEL = '@KurdishCinemas'; 

const bot = new TelegramBot(TOKEN, { polling: true });

console.log("🚀 VIP Social Media Downloader Bot is Running...");

// بپشکنە کا بەکارهێنەر ل کەناڵی جۆین بوویە یان نا
async function isUserSubscribed(userId) {
    try {
        const member = await bot.getChatMember(REQUIRED_CHANNEL, userId);
        const status = member.status;
        return ['creator', 'administrator', 'member'].includes(status);
    } catch (error) {
        console.error("Error checking channel membership:", error.message);
        return false;
    }
}

// نیشاندانا پەیاما جۆینبوونا ئیجباری
function sendForceJoinMessage(chatId) {
    const opts = {
        reply_markup: {
            inline_keyboard: [
                [{ text: "📢 جۆینبوونا کەناڵی (KurdishCinemas)", url: `https://t.me/${REQUIRED_CHANNEL.replace('@', '')}` }],
                [{ text: "🔄 مـن جـۆیـن کــرد (پشتڕاستکرنەوە)", callback_data: "check_subscription" }]
            ]
        }
    };
    bot.sendMessage(chatId, `⛔ **ببۆڕە! بۆ بکارئینانا بۆتی دڤێت سەرەتا جۆینی کەناڵێ مە ببی.**\n\nئەگەر unjoin بکی یان جۆین نەبی، بۆت کار ناکەت!`, { parse_mode: 'Markdown', ...opts });
}

// فەرمانا /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const subscribed = await isUserSubscribed(userId);
    if (!subscribed) {
        return sendForceJoinMessage(chatId);
    }

    bot.sendMessage(chatId, `✨ **بەخێر بێی بۆ بۆتێ VIP یێ داگرتنا میدیایێ!**\n\nتۆ دشێی ڕاستەوخۆ لینکێ (TikTok, Instagram, YouTube, Snapchat, Facebook) بۆ من بڕێزی دا ب بەلاڕەشی و **بێ No Watermark (MP4 / MP3)** بۆ تە دابگرم!`, { parse_mode: 'Markdown' });
});

// پشکنینا دووبارە دەمێ کلیک ل سەر کۆمبوتا "پشتڕاستکرنەوە" دکەت
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const userId = query.from.id;

    if (query.data === "check_subscription") {
        const subscribed = await isUserSubscribed(userId);
        if (subscribed) {
            bot.answerCallbackQuery(query.id, { text: "✅ پیڕۆزە! نوکە تۆ دشێی بۆتی بکاربینی." });
            bot.sendMessage(chatId, "🎉 سوپاس بۆ جۆینبوونێ! نوکە هەر لینکەکێ هەی بۆ من بڕێزە دا ب کوالیتییا VIP دابگرم.");
        } else {
            bot.answerCallbackQuery(query.id, { text: "❌ هەتا نوکە تۆ جۆینی کەناڵی نەبوویە!", show_alert: true });
        }
    }
});

// وەرگرتنا لینکێن میدیایێ
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text ? msg.text.trim() : '';

    if (text.startsWith('/')) return;

    // پشکنینا جۆینبوونێ بەریا هەر داواکارییەکێ (ئەگەر unjoin کربیت ڕاستەوخۆ ڕادەگرت)
    const subscribed = await isUserSubscribed(userId);
    if (!subscribed) {
        return sendForceJoinMessage(chatId);
    }

    if (text.startsWith('http://') || text.startsWith('https://')) {
        const loadingMsg = await bot.sendMessage(chatId, "⏳ **یێ ل سەر کار دکەت... داگرتنا میدیایێ ژ سەرڤەرێ VIP...**", { parse_mode: 'Markdown' });

        try {
            const apiUrl = `https://api.cobalt.tools/api/json`;
            const response = await axios.post(apiUrl, {
                url: text,
                vCodec: "h264",
                noWatermark: true
            }, {
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            });

            if (response.data && response.data.url) {
                const mediaUrl = response.data.url;

                await bot.sendVideo(chatId, mediaUrl, {
                    caption: "✅ **داگرتن ب سەرکەفتنی ئامادە بوو!**\n📢 Channel: @KurdishCinemas",
                    parse_mode: 'Markdown'
                });
            } else {
                bot.sendMessage(chatId, "❌ ببۆڕە، کێشەیەک ل داگرتنا ڤی لینکی پەیدا بوو. تکایە پشتڕاست ببەوە کو لینکێ تە دروستە.");
            }
            bot.deleteMessage(chatId, loadingMsg.message_id);
        } catch (err) {
            console.error("Download Error:", err.message);
            bot.deleteMessage(chatId, loadingMsg.message_id);
            bot.sendMessage(chatId, "❌ نەتوانرا ڤیدیۆ بێتە داگرتن. تکایە لینکەکێ دی یێ جێگیر بپشکنە.");
        }
    } else {
        bot.sendMessage(chatId, "📥 تکایە **لینکەکێ دروست** ژ ڕستەیێن (TikTok, Instagram, YouTube, Snapchat, Facebook) بنڤێسە.");
    }
});
