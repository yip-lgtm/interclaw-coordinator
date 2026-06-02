// workers/claw_creative_004/index.js
// Creative worker
import { startInterClawLoop } from './interclaw_client_standalone.js';

console.log('[claw_creative_004] starting...');

await startInterClawLoop({
  agent_id: 'claw_creative_004',
  skills: ['creative'],
  metadata: { hostname: 'claw_creative_004', version: '1.0' },
  onTask: async (task) => {
    console.log('[claw_creative_004] Task:', task.task_type, task.payload);
    switch (task.task_type) {
      case 'creative':
        console.log('  → running creative generation...');
        break;
      default:
        console.log('  → unhandled task_type');
    }
  }
});

console.log('[claw_creative_004] ready.');
setInterval(() => {}, 1 << 30);
