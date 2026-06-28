const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, email } = req.body;
  const PRICE_ID = process.env.STRIPE_PRICE_ID;
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  const origin = req.headers.origin || 'https://careerpath-git-main-kazuma43matsukawa-6337s-projects.vercel.app';

  const formData = `mode=subscription&line_items[0][price]=${PRICE_ID}&line_items[0][quantity]=1&success_url=${encodeURIComponent(origin + '?payment=success')}&cancel_url=${encodeURIComponent(origin + '?payment=cancel')}&customer_email=${encodeURIComponent(email)}&metadata[userId]=${userId}&locale=ja`;

  const options = {
    hostname: 'api.stripe.com',
    path: '/v1/checkout/sessions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(formData),
    },
  };

  return new Promise((resolve) => {
    const apiReq = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', (chunk) => { data += chunk; });
      apiRes.on('end', () => {
        try {
          res.status(200).json(JSON.parse(data));
        } catch (e) {
          res.status(500).json({ error: 'Parse error' });
        }
        resolve();
      });
    });
    apiReq.on('error', (e) => {
      res.status(500).json({ error: e.message });
      resolve();
    });
    apiReq.write(formData);
    apiReq.end();
  });
};
