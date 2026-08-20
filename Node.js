const express = require('express');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);

app.use(express.static(__dirname));

// بڕێڤەبرنا فەرمانێن Shell ب شێوەیەکێ پاراستی (Isolated VIP Shell)
function runCommand(command, res) {
    const process = spawn(command, { shell: true });

    process.stdout.on('data', (data) => {
        console.log(`Output: ${data}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
    });

    process.on('close', (code) => {
        console.log(`Process exited with code ${code}`);
    });
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`VIP Terminal Running on port ${PORT}`);
});
