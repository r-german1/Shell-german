const express = require('express');
const app = express();
app.use(express.json());

// API Endpoint بۆ دروستکرنا VPS یان بۆت
app.post('/api/create-server', (req, res) => {
    const { username, serviceType } = req.body;
    
    // لێرەدا کۆدێ بەستنا ب Docker یان API یا Pterodactyl دهێتە نڤێسین
    if(serviceType === 'vps') {
        res.json({ success: true, message: `VPS ب سەرکەفتن بۆ ${username} هاتە دروستکرن!` });
    } else {
        res.json({ success: true, message: `هۆستێ بۆتێ تێلیگرامێ بۆ ${username} چالاک بوو!` });
    }
});

app.listen(3000, () => console.log('Server is running on port 3000'));
