const secret=process.env.TINY_PLANET_CRON_SECRET;if(!secret)throw Error('Scheduler secret missing');
const r=await fetch('https://tiny-planet-trmnl.vercel.app/api/autopilot',{method:'POST',headers:{Authorization:'Bearer '+secret},signal:AbortSignal.timeout(45000)});const data=await r.json();if(!r.ok)throw Error('Autopilot could not run: '+(data.error||r.status));console.log(JSON.stringify(data));
