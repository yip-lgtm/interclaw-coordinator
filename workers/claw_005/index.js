// workers/claw_005/index.js
// Generic worker
import { startInterClawLoop } from './interclaw_client_standalone.js';

console.log('[claw_005] starting...');

await startInterClawLoop({
  agent_id: 'claw_005',
  skills: [],
  metadata: { hostname: 'claw_005', version: '1.0' },
  onTask: async (task) => {
    console.log('[claw_005] Task:', task.task_type, task.payload);
  }
});

console.log('[claw_005] ready.');
setInterval(() => {}, 1 << 30);
