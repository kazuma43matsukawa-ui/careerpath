const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
const API_KEY = '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';

app.use(cors());
app.use(express.json());

app.post('/api/chat', (req, res) => {
  const body = JSON.stringify(req.body);
  const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', (chunk) => { data += chunk; });
    apiRes.on('end', () => {
      try {
        res.json(JSON.parse(data));
      } catch (e) {
        res.status(500).json({ error: 'Parse error' });
      }
    });
  });

  apiReq.on('error', (e) => {
    console.error('Error:', e);
    res.status(500).json({ error: e.message });
  });

  apiReq.write(body);
  apiReq.end();
});

app.listen(3001, () => {
  console.log('CareerPath APIサーバー起動中 → http://localhost:3001');
  console.log('このウィンドウは閉じないでください！');
});
