const fs = require('fs');
const fetch = require('node-fetch');

const BOT_TOKEN = process.env.BOT_TOKEN;

// ===== TIMEZONE WIB =====
function todayWIB() {
  const now = new Date();
  return new Date(
    now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
  );
}

// ===== HITUNG SELISIH HARI =====
function diffDays(due) {
  const today = todayWIB();
  today.setHours(0, 0, 0, 0);

  const target = new Date(due);
  target.setHours(0, 0, 0, 0);

  const oneDay = 1000 * 60 * 60 * 24;
  return Math.round((target - today) / oneDay);
}

// ===== MAIN =====
(async () => {
  const reminders = JSON.parse(fs.readFileSync('reminders.json'));
  const today = todayWIB().toISOString().split('T')[0];

  for (const r of reminders) {
    const diff = diffDays(r.due);

    if ([30, 7, 3, 1, 0].includes(diff)) {
      const text =
`🔔 Reminder ${r.kategori}

📌 Nama: ${r.nama}
🆔 Identitas: ${r.identitas}
📅 Jatuh Tempo: ${r.due}

⏰ ${diff === 0 ? 'HARI INI' : 'H-' + diff}

⚠️ Jangan sampai terlewat!`;

      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: r.chat,
          text
        })
      });

      const data = await res.json();
      console.log('Sent to', r.chat, data.ok);
    }
  }
})();

