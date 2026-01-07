const fetch = require('node-fetch');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = "ISI_CHAT_ID_ANDA";

(async () => {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: 8395291891:AAHOxCGIjGqUmasweoTiYOecyG7ndwcJwnQ,
      text: "✅ TEST BERHASIL: GitHub Actions → Telegram OK"
    })
  });
})();
