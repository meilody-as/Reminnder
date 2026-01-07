const fs = require('fs');
const fetch = require('node-fetch');

const BOT_TOKEN = process.env.BOT_TOKEN;

const reminders = JSON.parse(fs.readFileSync('reminders.json'));
const today = new Date();

function diffDays(due) {
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.ceil((due - today) / oneDay);
}

(async () => {
  for (const r of reminders) {
    const due = new Date(r.due);
    const diff = diffDays(due);

    if ([7, 3, 1, 0].includes(diff)) {
      const text =
`🚨 Reminder Pajak Motor
Nama: ${r.nama}
Plat: ${r.plat}
Jatuh Tempo: ${r.due}
⏰ ${diff === 0 ? 'HARI INI' : 'H-' + diff}

Segera lakukan pembayaran.`;

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: r.chat,
          text
        })
      });
    }
  }
})();
