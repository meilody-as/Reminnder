const axios = require('axios');

// 1. Ambil Variabel Lingkungan (Environment Variables)
const BIN_ID = process.env.BIN_ID;
const MASTER_KEY = process.env.MASTER_KEY;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// Fungsi untuk menghitung selisih hari
const getDaysDifference = (dateString) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset jam ke 00:00:00 supaya akurat
  const targetDate = new Date(dateString);
  
  // Selisih waktu dalam milidetik
  const diffTime = targetDate - today;
  // Konversi ke hari
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays;
};

// 2. Fungsi Utama
async function sendReminders() {
  try {
    console.log("Mengambil data dari JSONBin...");
    
    // Ambil Data
    const response = await axios.get(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': MASTER_KEY }
    });

    const reminders = response.data.record || [];
    console.log(`Total reminder ditemukan: ${reminders.length}`);

    // Looping Reminder
    for (const r of reminders) {
      if (!r.due) continue; // Skip jika tidak ada tanggal

      const daysLeft = getDaysDifference(r.due);
      const customDays = r.custom_reminder || []; // Array [30, 7, 1]

      // Logika: Kirim jika Hari Ini (0) ATAU hari ini ada di daftar H-Minus (customDays)
      if (daysLeft === 0 || customDays.includes(daysLeft)) {
        
        const message = `
🔔 PENGINGAT OTOMATIS

📝 Item: ${r.nama}
👤 Pemilik: ${r.pemilik || '-'}
📅 Jatuh Tempo: ${r.due}
⏰ Tersisa: ${daysLeft} hari lagi.

Mohon segera diperiksa!
        `.trim();

        // Kirim ke Telegram
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          chat_id: CHAT_ID,
          text: message
        });

        console.log(`✅ Notifikasi dikirim: ${r.nama} (H-${daysLeft})`);
      }
    }

    console.log("Proses Selesai.");

  } catch (error) {
    console.error("Terjadi Error:", error.message);
  }
}

// Jalankan Fungsi
sendReminders();
