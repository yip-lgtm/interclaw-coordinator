// interclaw_client_standalone.js
// Client SDK for connecting to standalone coordinator (port 8080)
// Other Claws use this to talk to the Zeabur-deployed coordinator.

const HEARTBEAT_INTERVAL_MS = 50 * 1000;  // 50s
const POLL_INTERVAL_MS = 15 * 1000;        // 15s
const GATEWAY_URL = process.env.INTERCLAW_GATEWAY_URL || 'http://localhost:8080';
const API_KEY = process.env.INTERCLAW_API_KEY || '';

let _log = (msg) => console.log(`[InterClaw] ${msg}`);

async function callCoordinator(action, params) {
  const url = `${GATEWAY_URL}/coordinator/${action}`;
  const headers = { 'Content-Type': 'application/json' };
  if (API_KEY) headers['x-api-key'] = API_KEY;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(params || {})
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return await res.json();
}

export async function registerToCoordinator(agent_id, skills = [], metadata = {}) {
  _log(`Registering ${agent_id} (skills: ${skills.join(",")})`);
  return await callCoordinator('registerAgent', { agent_id, skills, metadata });
}

export async function sendHeartbeat(agent_id) {
  return await callCoordinator('heartbeat', { agent_id });
}

export async function sendTaskToClaw(from_agent, task_type, payload, to = null) {
  _log(`sendTask ${task_type} from ${from_agent} → ${to || "auto"}`);
  return await callCoordinator('sendTask', { from_agent, to, task_type, payload });
}

export async function checkMyTasks(agent_id) {
  const r = await callCoordinator('getMyTasks', { agent_id });
  return r.tasks || [];
}

export async function listAgents() {
  const url = `${GATEWAY_URL}/coordinator/listAgents`;
  const headers = {};
  if (API_KEY) headers['x-api-key'] = API_KEY;
  const res = await fetch(url, { headers });
  return await res.json();
}

export async function startInterClawLoop({ agent_id, skills = [], metadata = {}, onTask = null, log = null }) {
  if (log) _log = log;
  if (!agent_id) throw new Error('agent_id required');

  await registerToCoordinator(agent_id, skills, metadata);

  setInterval(() => {
    sendHeartbeat(agent_id).catch(e => _log(`heartbeat err: ${e.message}`));
  }, HEARTBEAT_INTERVAL_MS);

  setInterval(async () => {
    try {
      const tasks = await checkMyTasks(agent_id);
      for (const task of tasks) {
        _log(`Task from ${task.from_agent}: ${task.task_type}`);
        if (onTask) {
          try { await onTask(task); } catch (e) { _log(`onTask error: ${e.message}`); }
        }
      }
    } catch (e) { _log(`poll err: ${e.message}`); }
  }, POLL_INTERVAL_MS);

  _log(`Loop started (heartbeat ${HEARTBEAT_INTERVAL_MS/1000}s, poll ${POLL_INTERVAL_MS/1000}s, gateway: ${GATEWAY_URL})`);
}

export default { callCoordinator, registerToCoordinator, sendHeartbeat, sendTaskToClaw, checkMyTasks, listAgents, startInterClawLoop };
