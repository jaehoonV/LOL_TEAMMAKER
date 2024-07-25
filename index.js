const express = require('express');
const http = require('http');
const path = require('path');
const { exec } = require('child_process');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*', // 모든 출처 허용
    credentials: true
}));

app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/get_puuid/:gameName/:tagLine/:api_key', async (req, res) => {
    const { gameName, tagLine, api_key } = req.params;
    const url = `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}?api_key=${encodeURIComponent(api_key)}`;
   
    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).send('Error fetching account data');
    }
});

http.createServer(app).listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);

    // 브라우저에서 index.html 파일을 여는 부분 수정
    exec(`start http://localhost:${PORT}/`, (err) => {
        if (err) {
            console.error('Failed to open browser:', err);
        }
    });
});
