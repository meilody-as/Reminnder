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
    console.log("Mengambil data dari JSONBin...");
    
    const response = await axios.get(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': MASTER_KEY }
    });

    // --- PERBAIKAN UTAMA: SAFETY CHECK DATA ---
    let rawData = response.data.record;

    // Cek apakah data berbentuk Array. Jika bukan, jadikan Array Kosong.
    if (!Array.isArray(rawData)) {
        console.warn("⚠️ Data Format Salah (Bukan Array). Direset ke kosong.");
        rawData = []; 
    }
    
    const reminders = rawData;
    // -----------------------------------------

    console.log(`Total reminder ditemukan: ${reminders.length}`);

    for (const r of reminders) {
      if (!r.due) continue;
      const daysLeft = getDaysDifference(r.due);
      const customDays = r.custom_reminder || [];

      if (daysLeft === 0 || customDays.includes(daysLeft)) {
        const message = `🔔 PENGINGAT: ${r.nama} (Hari: ${r.due}, Tersisa: ${daysLeft} hari)`;
        
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          chat_id: CHAT_ID,
          text: message
        });

        console.log(`✅ Terkirim: ${r.nama}`);
      }
    }
    console.log("Selesai.");

  } catch (error) {
    console.error("❌ GAGAL MENGAMBIL DATA JSONBIN:");
    console.error(error.message); 
  }
}

sendReminders();
