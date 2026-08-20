const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Real-time VIP Shell via WebSocket
wss.on('connection', (ws) => {
    ws.send('\r\n\x1b[1;32m[VIP SYSTEM ONLINE] Full VIP Terminal Connected!\x1b[0m\r\n$ ');

    ws.on('message', (message) => {
        const cmd = message.toString().trim();
        if (!cmd) return;

        // ئەنجامدانا فەرمانا ل سەر سەرڤەری
        const child = spawn(cmd, { shell: true });

        child.stdout.on('data', (data) => {
            ws.send(data.toString());
        });

        child.stderr.on('data', (data) => {
            ws.send(`\x1b[1;31m${data.toString()}\x1b[0m`);
        });

        child.on('close', () => {
            ws.send('\r\n$ ');
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`VIP Server running on port ${PORT}`);
});
