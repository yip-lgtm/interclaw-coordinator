// interclaw_coordinator_standalone.js
// Standalone HTTP coordinator (no OpenClaw dependency)
// For Zeabur deployment.
//
// Endpoints:
//   POST /coordinator/registerAgent   { agent_id, skills, metadata }
//   POST /coordinator/heartbeat       { agent_id }
//   POST /coordinator/sendTask        { from_agent, to, task_type, payload }
//   POST /coordinator/getMyTasks      { agent_id }
//   GET  /coordinator/listAgents
//   GET  /health
//
// Optional auth: set COORDINATOR_API_KEY env. If set, requests must include
//   x-api-key: <key> header.

import express from 'express';
import fs from 'fs';
import path from 'path';

const PORT = parseInt(process.env.PORT || '8080', 10);
const DATA_FILE = process.env.DATA_FILE || '/data/coordinator_state.json';
const API_KEY = process.env.COORDINATOR_API_KEY || '';
const HEARTBEAT_TTL = 2 * 60 * 1000; // 2 min

let state = { agents: new Map(), taskInbox: new Map() };

function load() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      state.agents = new Map(Object.entries(raw.agents || {}));
      state.taskInbox = new Map(Object.entries(raw.taskInbox || {}).map(([k, v]) => [k, Array.isArray(v) ? v : []]));
      console.log(`[coordinator] loaded ${state.agents.size} agents from ${DATA_FILE}`);
    }
  } catch (e) {
    console.error('[coordinator] load error:', e.message);
  }
}

function save() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const raw = { agents: Object.fromEntries(state.agents), taskInbox: Object.fromEntries(state.taskInbox) };
    fs.writeFileSync(DATA_FILE, JSON.stringify(raw, null, 2), 'utf8');
  } catch (e) {
    console.error('[coordinator] save error:', e.message);
  }
}

function cleanup() {
  const now = Date.now();
  for (const [id, data] of state.agents) {
    if (now - (data.lastSeen || 0) > HEARTBEAT_TTL) {
      state.agents.delete(id);
      state.taskInbox.delete(id);
      console.log(`[coordinator] removed dead agent: ${id}`);
    }
  }
}

const app = express();
app.use(express.json({ limit: '1mb' }));

// Auth middleware (only if API_KEY is set)
app.use((req, res, next) => {
  if (!API_KEY) return next();
  if (req.path === '/health') return next();
  const key = req.headers['x-api-key'];
  if (key !== API_KEY) return res.status(401).json({ success: false, error: 'invalid api key' });
  next();
});

app.get('/health', (req, res) => res.json({ ok: true, agents: state.agents.size, uptime: process.uptime() }));

app.post('/coordinator/registerAgent', (req, res) => {
  const { agent_id, skills = [], metadata = {} } = req.body || {};
  if (!agent_id) return res.status(400).json({ success: false, error: 'agent_id required' });
  state.agents.set(agent_id, { agent_id, skills, metadata, lastSeen: Date.now(), status: 'alive' });
  if (!state.taskInbox.has(agent_id)) state.taskInbox.set(agent_id, []);
  save();
  res.json({ success: true, registered: agent_id });
});

app.post('/coordinator/heartbeat', (req, res) => {
  const { agent_id } = req.body || {};
  if (!state.agents.has(agent_id)) return res.json({ success: false, error: 'not registered' });
  state.agents.get(agent_id).lastSeen = Date.now();
  res.json({ success: true });
});

app.post('/coordinator/sendTask', (req, res) => {
  cleanup();
  const { from_agent, to = null, task_type, payload = {} } = req.body || {};
  if (!from_agent || !task_type) return res.status(400).json({ success: false, error: 'from_agent and task_type required' });

  let target = to;
  if (!target) {
    const needed = {
      analyze_mnq: 'trading', mnq: 'trading',
      slope: 'engineering', creative: 'creative'
    }[String(task_type).toLowerCase()];
    if (needed) {
      for (const [id, data] of state.agents) {
        if (data.skills && data.skills.includes(needed)) { target = id; break; }
      }
    }
  }
  if (!target || !state.agents.has(target)) return res.json({ success: false, error: 'No suitable target found' });

  const task = { from_agent, to: target, task_type, payload, created_at: new Date().toISOString() };
  if (!state.taskInbox.has(target)) state.taskInbox.set(target, []);
  state.taskInbox.get(target).push(task);
  save();
  res.json({ success: true, routed_to: target });
});

app.post('/coordinator/getMyTasks', (req, res) => {
  const { agent_id } = req.body || {};
  if (!agent_id) return res.status(400).json({ success: false, error: 'agent_id required' });
  const tasks = state.taskInbox.get(agent_id) || [];
  state.taskInbox.set(agent_id, []);
  save();
  res.json({ tasks });
});

app.get('/coordinator/listAgents', (req, res) => {
  cleanup();
  res.json(Array.from(state.agents.values()));
});

app.use((err, req, res, next) => {
  console.error('[coordinator] error:', err);
  res.status(500).json({ success: false, error: err.message });
});

load();

app.get('/', (req, res) => {
  res.redirect('/qimen-landing');
});

app.get('/qimen-landing', (req, res) => {
  try {
    const QIMEN_DIR = process.env.QIMEN_DIR || '/home/ubuntu/qimen_service';
    const landingPath = path.join(QIMEN_DIR, 'landing.html');
    if (fs.existsSync(landingPath)) {
      res.set('Content-Type', 'text/html; charset=utf-8');
      res.send(fs.readFileSync(landingPath, 'utf8'));
    } else {
      res.status(404).send('Landing page not found at ' + landingPath);
    }
  } catch (e) {
    res.status(500).send('Error: ' + e.message);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[coordinator] listening on 0.0.0.0:${PORT}`);
  console.log(`[coordinator] data file: ${DATA_FILE}`);
  console.log(`[coordinator] auth: ${API_KEY ? 'enabled' : 'disabled'}`);
  setInterval(cleanup, 60 * 1000);
});
