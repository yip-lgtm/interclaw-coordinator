// qimen_handler.js
// Qimen divination Telegram bot handler
// For OpenClaw Telegram channel (@yip425_bot or whatever's configured)
//
// Usage:
//   node qimen_handler.js
//
// Bot commands:
//   /qimen <YYYY-MM-DD HH:MM> — Query Qimen chart
//   /price — Show service pricing
//   /wallet — Show payment wallet
//   /help — Show help
//
// Note: For now this is a CLI tool. To use as Telegram bot, integrate with OpenClaw's
// Telegram channel commands. Saba will use the OpenClaw agent to handle messages
// directly with this script as a tool.

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PYTHON_SCRIPT = path.join(__dirname, 'qimen_cli.py');

const WALLET = '0x5b1a4da88820Bf3D9fdD474cC18793c276DA849A';
const PRICE = '$1-3 USDT per query';
const PAYMENT_HINT = 'Send USDT (ERC20/Polygon) to wallet, then send tx hash with /qimen command';

function runQimen(args) {
  return new Promise((resolve, reject) => {
    const py = spawn('python3', [PYTHON_SCRIPT, ...args]);
    let stdout = '', stderr = '';
    py.stdout.on('data', d => stdout += d);
    py.stderr.on('data', d => stderr += d);
    py.on('close', code => {
      if (code !== 0) reject(new Error(stderr || `Exit code ${code}`));
      else resolve(stdout);
    });
  });
}

export const commands = {
  '/qimen': async (args) => {
    // Parse args: "2026-06-15 14:30" or "2026 6 15 14 30"
    if (!args || args.length < 2) {
      return 'Usage: /qimen YYYY-MM-DD HH:MM\nExample: /qimen 2026-06-15 14:30';
    }
    let y, mo, d, h, mi;
    const dateStr = args[0];
    const timeStr = args[1];
    if (dateStr.includes('-')) {
      [y, mo, d] = dateStr.split('-').map(Number);
      [h, mi] = timeStr.split(':').map(Number);
    } else {
      y = Number(args[0]); mo = Number(args[1]); d = Number(args[2]);
      h = Number(args[3]); mi = Number(args[4] || 0);
    }
    if ([y, mo, d, h, mi].some(v => isNaN(v))) {
      return 'Invalid date/time. Use format: YYYY-MM-DD HH:MM';
    }
    try {
      const chart = await runQimen([String(y), String(mo), String(d), String(h), String(mi), 'chabu']);
      return `🔮 Qimen Dunjia Chart\n${'='.repeat(40)}\n${chart}\n\n${'='.repeat(40)}\n💰 Service: ${PRICE}\n💸 Wallet: ${WALLET}\n\nSend USDT + tx hash for follow-up or new queries.`;
    } catch (e) {
      return `Error generating chart: ${e.message}`;
    }
  },

  '/price': async () => {
    return `💰 Qimen Divination Service\n\n${PRICE}\n\n🔮 1 query includes:\n  - 時家奇門 (chabu method)\n  - 完整 9 宮配置\n  - 值符 / 值使 / 旬空 / 馬星\n  - 長生運分析\n\n🔮 Optional add-ons:\n  - 金函玉鏡日家 +$1\n  - 刻家奇門 (minute-level) +$1\n  - 綜合排盤 +$1`;
  },

  '/wallet': async () => {
    return `💸 Payment wallet\n\nUSDT (ERC20/Polygon):\n\`${WALLET}\`\n\n${PAYMENT_HINT}`;
  },

  '/help': async () => {
    return `🔮 Qimen Divination Bot — Help\n\nCommands:\n  /qimen YYYY-MM-DD HH:MM — Query chart\n  /price — Service pricing\n  /wallet — Payment wallet\n  /help — This help\n\nExample: \`/qimen 2026-06-15 14:30\``;
  }
};

// CLI testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const cmd = process.argv[2];
  const args = process.argv.slice(3);
  if (commands[cmd]) {
    const result = await commands[cmd](args);
    console.log(result);
  } else {
    console.log('Available commands:', Object.keys(commands).join(', '));
  }
}
