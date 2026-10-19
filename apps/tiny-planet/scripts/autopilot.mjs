import {runAutopilot} from '../lib/scheduler.js';
console.log(JSON.stringify(await runAutopilot({secret:process.env.TINY_PLANET_CRON_SECRET})));
