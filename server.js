const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
const ANTHROPIC_API_KEY = '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';
const STRIPE_SECRET_KEY = 'sk_test_51TnGV5GyuDnEkSsK2WR7eazdjpuo0J8Gt1Vf0HRwWlDgtZlrpR1GL4iRDVaZUbnCoBXhRnSTHzdcxsKuCZdJwnGb00ijKE4vwW';
const PRICE_ID = 'price_1TnIgTGyuDnEkSsKcd8Vn4yO';

app.use(cors());
app.use(express.json());

// Anthropic API proxy
app.post('/api/chat', (req, res) => {
  const body = JSON.stringify(req.body);
  const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(body),
    },
  };
  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', (chunk) => { data += chunk; });
    apiRes.on('end', () => {
      try { res.json(JSON.parse(data)); }
      catch (e) { res.status(500).json({ error: 'Parse error' }); }
    });
  });
  apiReq.on('error', (e) => res.status(500).json({ error: e.message }));
  apiReq.write(body);
  apiReq.end();
});

// Stripe チェックアウトセッション作成
app.post('/api/create-checkout', (req, res) => {
  const { userId, email } = req.body;
  const body = JSON.stringify({
    mode: 'subscription',
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    success_url: `${req.headers.origin || 'http://localhost:3000'}?payment=success`,
    cancel_url: `${req.headers.origin || 'http://localhost:3000'}?payment=cancel`,
    customer_email: email,
    metadata: { userId },
    locale: 'ja',
  });

  const options = {
    hostname: 'api.stripe.com',
    path: '/v1/checkout/sessions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  // Stripeはform-encodedを使う
  const formData = `mode=subscription&line_items[0][price]=${PRICE_ID}&line_items[0][quantity]=1&success_url=${encodeURIComponent((req.headers.origin || 'http://localhost:3000') + '?payment=success')}&cancel_url=${encodeURIComponent((req.headers.origin || 'http://localhost:3000') + '?payment=cancel')}&customer_email=${encodeURIComponent(email)}&metadata[userId]=${userId}&locale=ja`;

  const options2 = {
    hostname: 'api.stripe.com',
    path: '/v1/checkout/sessions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(formData),
    },
  };

  const apiReq = https.request(options2, (apiRes) => {
    let data = '';
    apiRes.on('data', (chunk) => { data += chunk; });
    apiRes.on('end', () => {
      try { res.json(JSON.parse(data)); }
      catch (e) { res.status(500).json({ error: 'Parse error' }); }
    });
  });
  apiReq.on('error', (e) => res.status(500).json({ error: e.message }));
  apiReq.write(formData);
  apiReq.end();
});

app.listen(3001, () => {
  console.log('CareerPath APIサーバー起動中 → http://localhost:3001');
  console.log('このウィンドウは閉じないでください！');
});
