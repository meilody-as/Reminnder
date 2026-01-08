const fs = require('fs');
const fetch = require('node-fetch');

const BOT_TOKEN = process.env.BOT_TOKEN;
const FILE = 'reminders.json';

const today = new Date();
today.setHours(0,0,0,0);

const data = JSON.parse(fs.readFileSync(FILE,'utf8')).items;

function diffDays(due){
  const d=new Date(due);
  d.setHours(0,0,0,0);
  return Math.round((d - today)/(1000*60*60*24));
}

async function send(chat,text){
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({chat_id:chat,text})
  });
}

(async()=>{
  for(const r of data){
    const d=diffDays(r.due);
    if(r.notify_days.includes(d)){
      await send(r.chat,
`🔔 Reminder ${r.nama}
📅 Jatuh tempo: ${r.due}
⏰ H-${d}`);
    }
  }
})();
