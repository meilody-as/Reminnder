const fs = require("fs");
const fetch = require("node-fetch");

const BOT_TOKEN = process.env.BOT_TOKEN;
const reminders = JSON.parse(fs.readFileSync("reminders.json"));

const today = new Date().toISOString().split("T")[0];

function daysBetween(a, b) {
  return Math.ceil(
    (new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24)
  );
}

(async () => {
  for (const r of reminders) {
    const diff = daysBetween(today, r.due);

    if (diff === r.remind) {
      const text =
`🔔 Reminder ${r.kategori}

📌 ${r.nama}
📅 Jatuh tempo: ${r.due}
⏰ ${diff === 1 ? 'BESOK' : `H-${diff}`}`;

      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: r.chat,
            text
          })
        }
      );
    }
  }
})();
