---
name: qimen_service
description: |
  Qimen Dunjia (奇門遁甲) AI divination service. When user asks for a Qimen chart
  or divination, use the kinqimen Python package to generate a 9-palace chart.
  
  Triggers:
  - "奇門" / "奇門遁甲" / "Qimen" / "QMD"
  - "排盤" / "divination chart" / "起卦"
  - User provides a target datetime and asks for divination
  - User wants to know auspicious timing for an event
---

# Qimen Dunjia Service

A Qimen (奇門遁甲) chart generation service. Built on the open-source `kinqimen` Python package.

## When to use

- User explicitly requests a 奇門遁甲 chart
- User asks about auspicious timing / divination
- User wants analysis of an event using Chinese metaphysics
- User says "/qimen" followed by a datetime

## How to generate

```bash
# Basic — chabu method (default)
python3 /home/node/.openclaw/workspace/qimen_service/qimen_cli.py [YYYY-MM-DD HH:MM]

# Specific methods:
# chabu (拆補法) - default
# zhirun (置閏法)
# minute (刻家奇門)
# golden_mirror (金函玉鏡日家)
# combined (綜合排盤)
```

Or via Node handler:
```bash
node /home/node/.openclaw/workspace/qimen_service/qimen_handler.js /qimen "2026-06-15 14:30"
```

## Pricing

- Basic: $1 USDT (時家奇門 chabu)
- Premium: $2 USDT (Basic + 金函玉鏡日家)
- Pro: $3 USDT (Premium + 刻家奇門 + 綜合排盤)

Payment wallet: `0x5b1a4da88820Bf3D9fdD474cC18793c276DA849A` (USDT ERC20/Polygon)

## Response format

When a user requests a chart, output:
1. Confirm datetime + method
2. Run CLI, get chart
3. Format result as readable text
4. Add payment info if not already paid
5. Brief interpretation if user provides context

## Sample response

```
🔮 奇門遁甲排盤 — 丙午年甲午月庚申日癸未時
📅 排局: 陽遁九局下元
🌱 節氣: 芒種
⚡ 旬空: {'日空': '子丑', '時空': '申酉'}

[full 9-palace configuration]

💰 Service: $1-3 USDT per query
💸 Wallet: 0x5b1a4da88820Bf3D9fdD474cC18793c276DA849A
```

## Notes

- Qimen is a metaphysical / divination system, not scientific
- Do not claim Qimen predictions are factually accurate
- For trading or financial decisions, recommend also checking technical analysis
- Treat as fun/entertainment, similar to tarot or astrology readings
