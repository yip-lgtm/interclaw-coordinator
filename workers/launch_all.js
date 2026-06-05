// workers/launch_all.js
// Launch all 5 workers in one process (for 0-cost Option 2: sibling processes)
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

const procs = [];

for (const w of workers) {
  console.log(`[launcher] starting ${w.id}...`);
  const p = spawn('node', ['index.js'], {
    cwd: path.join(__dirname, w.dir),
    env: { ...process.env, INTERCLAW_GATEWAY_URL: process.env.INTERCLAW_GATEWAY_URL || 'https://interclaw-yip-lgtm.loca.lt' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  p.stdout.on('data', d => process.stdout.write(`[${w.id}] ${d}`));
  p.stderr.on('data', d => process.stderr.write(`[${w.id}-err] ${d}`));
  p.on('exit', code => console.log(`[launcher] ${w.id} exited with code ${code}`));
  procs.push(p);
}

console.log(`[launcher] all ${workers.length} workers started, PIDs: ${procs.map(p => p.pid).join(', ')}`);

// Keep this process alive
setInterval(() => {}, 1 << 30);
