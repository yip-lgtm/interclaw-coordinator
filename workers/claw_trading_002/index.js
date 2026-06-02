// workers/claw_trading_002/index.js
// Trading worker: registers + heartbeat + polls coordinator
// Set env var: INTERCLAW_GATEWAY_URL=http://interclaw-coordinator-dipt.zeabur.internal:8080

import { startInterClawLoop } from './interclaw_client_standalone.js';

console.log('[claw_trading_002] starting...');

await startInterClawLoop({
  agent_id: 'claw_trading_002',
  skills: ['trading', 'mnq_analysis'],
  metadata: { hostname: 'claw_trading_002', version: '1.0' },
  onTask: async (task) => {
    console.log('[claw_trading_002] Task:', task.task_type, task.payload);
    switch (task.task_type) {
      case 'analyze_mnq':
        console.log('  → running MNQ analysis...');
        // TODO: hook up to your trading analysis pipeline
        break;
      case 'check_position':
        console.log('  → checking position...');
        break;
      default:
        console.log('  → unhandled task_type');
    }
  }
});

console.log('[claw_trading_002] ready.');

// Keep process alive
setInterval(() => {}, 1 << 30);
