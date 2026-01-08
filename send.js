const fs = require('fs');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const BOT_TOKEN = process.env.BOT_TOKEN;
const API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

const data = JSON.parse(fs.readFileSync('reminders.json', 'utf8'));
const today = new Date();

function addPeriod(date, value, unit) {
  const d = new Date(date);
  if (unit === 'tahun') d.setFullYear(d.getFullYear() + value);
  if (unit === 'bulan') d.setMonth(d.getMonth() + value);
  return d;
}

data.items.forEach(item => {
  let due = addPeriod(item.start_date, item.periode.value, item.periode.unit);

  item.notify_before.forEach(days => {
    const notifyDate = new Date(due);
    notifyDate.setDate(due.getDate() - days);

    if (notifyDate.toDateString() === today.toDateString()) {
      const text = `
🔔 *Reminder ${item.kategori}*
👤 ${item.pemilik}
📄 ${item.nama}
🆔 ${item.identitas}
⏳ Jatuh tempo: ${due.toISOString().slice(0,10)}
⚠️ ${days} hari lagi
`;

      fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: item.chat_id,
          text,
          parse_mode: 'Markdown'
        })
      });
    }
  });
});
