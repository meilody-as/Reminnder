const fs = require('fs');
const fetch = require('node-fetch');

const BOT_TOKEN = process.env.BOT_TOKEN;
const FILE = 'reminders.json';

const today = new Date();
today.setHours(0,0,0,0);

let data = JSON.parse(fs.readFileSync(FILE,'utf8'));

function diffDays(due){
  const d=new Date(due);
  d.setHours(0,0,0,0);
  return Math.round((d - today)/(1000*60*60*24));
}

function addPeriod(start,period){
  const d=new Date(start);
  if(period.unit==='year') d.setFullYear(d.getFullYear()+period.value);
  if(period.unit==='month') d.setMonth(d.getMonth()+period.value);
  return d.toISOString().slice(0,10);
}

async function send(chat,text){
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({chat_id:chat,text})
  });
}

let changed=false;

(async()=>{
  for(const r of data.items){
    let d = diffDays(r.due);

    if(d < 0){
      r.start = r.due;
      r.due = addPeriod(r.start, r.period);
      changed=true;
      d = diffDays(r.due);
    }

    const maxNotify = Math.max(...r.notify_days);
    const shouldSend =
      r.notify_days.includes(d) ||
      (r.repeat==='daily_after' && d < maxNotify && d >= 0);

    if(shouldSend){
      await send(
        r.chat,
`🔔 Reminder: ${r.nama}
📅 Jatuh tempo: ${r.due}
⏰ H-${d}`
      );
    }
  }

  if(changed){
    fs.writeFileSync(FILE, JSON.stringify(data,null,2));
  }
})();
