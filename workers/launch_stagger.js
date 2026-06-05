// workers/launch_stagger.js
// Launch 5 workers with stagger (avoids concurrent connection overload)
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workers = [
  { dir: 'claw_trading_002', id: 'claw_trading_002' },
  { dir: 'claw_engineering_003', id: 'claw_engineering_003' },
  { dir: 'claw_creative_004', id: 'claw_creative_004' },
  { dir: 'claw_005', id: 'claw_005' },
  { dir: 'claw_006', id: 'claw_006' },
];
const GATEWAY = process.env.INTERCLAW_GATEWAY_URL || 'https://thin-eels-tease.loca.lt';

for (const w of workers) {
  console.log(`[launcher] starting ${w.id}...`);
  const p = spawn('node', ['index.js'], {
    cwd: path.join(__dirname, w.dir),
    env: { ...process.env, INTERCLAW_GATEWAY_URL: GATEWAY },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  p.stdout.on('data', d => process.stdout.write(`[${w.id}] ${d}`));
  p.stderr.on('data', d => process.stderr.write(`[${w.id}-err] ${d}`));
  p.on('exit', code => console.log(`[launcher] ${w.id} exited (${code})`));
  await new Promise(r => setTimeout(r, 4000));
}
console.log(`[launcher] all ${workers.length} workers started`);
setInterval(() => {}, 1 << 30);
