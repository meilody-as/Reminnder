const axios = require('axios');

// 1. Ambil Variabel Lingkungan
const BIN_ID = process.env.BIN_ID;
const MASTER_KEY = process.env.MASTER_KEY;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

console.log("=== SCRIPT BERJALAN ===");
console.log("Cek ID:", BIN_ID); // Akan menulis "undefined" jika kosong

if (!BIN_ID || BIN_ID === "ISI_DENGAN_BIN_ID_ANDA") {
    console.error("❌ ERROR: BIN_ID TIDAK DITEMUKAN ATAU BELUM DIISI!");
    process.exit(1);
}

// Fungsi Hitung Hari
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

    const reminders = response.data.record || [];
    console.log(`Total reminder ditemukan: ${reminders.length}`); // INI YANG DICARI

    // Looping
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
