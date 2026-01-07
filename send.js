const fetch = require('node-fetch');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = "8395291891"; // HANYA ANGKA

(async () => {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: 8568224727,
      text: "✅ TEST BERHASIL: GitHub Actions → Telegram OK"
    })
  });

  const data = await res.json();
  console.log(data);
})();

