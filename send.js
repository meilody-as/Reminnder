const axios = require('axios');

const BIN_ID = process.env.BIN_ID;
const MASTER_KEY = process.env.MASTER_KEY;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const getDaysDifference = (dateString) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateString);
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays;
};

async function sendReminders() {
  try {
    console.log("Mengambil data...");
    const response = await axios.get(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': MASTER_KEY }
    });

    let rawData = response.data.record;
    if (!Array.isArray(rawData)) rawData = []; 
    const reminders = rawData;

    console.log(`Total reminder: ${reminders.length}`);

    for (const r of reminders) {
      if (!r.due) continue;
      const daysLeft = getDaysDifference(r.due);
      const customDays = r.custom_reminder || [];

      if (daysLeft === 0 || customDays.includes(daysLeft)) {
        const message = `🔔 TES TELEGRAM: ${r.nama} (Tersisa: ${daysLeft} hari)`;
        
        console.log(`Mencoba kirim ke Chat ID: ${CHAT_ID}...`);
        
        // Kirim ke Telegram & Simpan Hasil Balasan
        const res = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          chat_id: CHAT_ID,
          text: message
        });

        // --- KUNCI DIAGNOSA ---
        // Kita lihat apa yang dibalas Telegram
        console.log("🔴 JAWABAN TELEGRAM:", JSON.stringify(res.data));
        
        if (res.data.ok) {
            console.log(`✅ Terkirim: ${r.nama}`);
        } else {
            console.log(`❌ GAGAL TELEGRAM: ${res.data.description}`);
        }
      }
    }
    console.log("Selesai.");

  } catch (error) {
    console.error("Error:", error.message); 
  }
}

sendReminders();
