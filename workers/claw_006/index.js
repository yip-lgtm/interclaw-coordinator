// workers/claw_006/index.js
// Generic worker
import { startInterClawLoop } from './interclaw_client_standalone.js';

console.log('[claw_006] starting...');

await startInterClawLoop({
  agent_id: 'claw_006',
  skills: [],
  metadata: { hostname: 'claw_006', version: '1.0' },
  onTask: async (task) => {
    console.log('[claw_006] Task:', task.task_type, task.payload);
  }
});

console.log('[claw_006] ready.');
setInterval(() => {}, 1 << 30);
