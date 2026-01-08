/**
 * send.js
 * Reminder otomatis + history notifikasi
 * Jalan via GitHub Actions
 */

const fs = require('fs');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

/* ===== CONFIG ===== */
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN tidak ditemukan');
  process.exit(1);
}
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

/* ===== LOAD DATA ===== */
const raw = fs.readFileSync('reminders.json', 'utf8');
const data = JSON.parse(raw);

const today = new Date();
today.setHours(0, 0, 0, 0);

/* ===== HELPERS ===== */
function addPeriod(startDate, value, unit) {
  const d = new Date(startDate);
  if (unit === 'tahun') d.setFullYear(d.getFullYear() + value);
  if (unit === 'bulan') d.setMonth(d.getMonth() + value);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

/* ===== MAIN LOGIC ===== */
(async () => {
  let historyChanged = false;

  for (const item of data.items) {
    // pastikan history ada
    item.history = item.history || [];

    // hitung jatuh tempo
    const dueDate = addPeriod(
      item.start_date,
      item.periode.value,
      item.periode.unit
    );

    for (const days of item.notify_before) {
      const notifyDate = new Date(dueDate);
      notifyDate.setDate(dueDate.getDate() - days);

      if (notifyDate.getTime() !== today.getTime()) continue;

      const notifyDateStr = formatDate(notifyDate);

      // cek apakah sudah pernah dikirim
      const alreadySent = item.history.some(
        h => h.date === notifyDateStr && h.type === `H-${days}`
      );

      if (alreadySent) {
        console.log(
          `⏭️ Skip (sudah terkirim): ${item.nama} H-${days}`
        );
        continue;
      }

      /* ===== KIRIM TELEGRAM ===== */
      const message = `
🔔 *Reminder ${item.kategori}*
👤 ${item.pemilik}
📄 ${item.nama}
🆔 ${item.identitas || '-'}
📅 Jatuh tempo: ${formatDate(dueDate)}
⏳ *${days} hari lagi*
`.trim();

      try {
        await fetch(TELEGRAM_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: item.chat_id,
            text: message,
            parse_mode: 'Markdown'
          })
        });

        console.log(
          `✅ Terkirim: ${item.nama} (H-${days})`
        );

        // simpan history
        item.history.push({
          date: notifyDateStr,
          type: `H-${days}`
        });

        historyChanged = true;
      } catch (err) {
        console.error('❌ Gagal kirim Telegram:', err);
      }
    }
  }

  /* ===== SIMPAN HISTORY (OPSIONAL OUTPUT) ===== */
  if (historyChanged) {
    const output = {
      updated_at: new Date().toISOString(),
      items: data.items
    };

    fs.writeFileSync(
      'reminders.with-history.json',
      JSON.stringify(output, null, 2)
    );

    console.log(
      '📝 File reminders.with-history.json dibuat (berisi history terbaru)'
    );
  } else {
    console.log('ℹ️ Tidak ada notifikasi hari ini');
  }
})();
