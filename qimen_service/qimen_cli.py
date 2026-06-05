#!/usr/bin/env python3
"""
Qimen Dunjia CLI wrapper
Provides quick Qimen chart generation for Telegram bot / API.
"""
import sys
import json
import datetime
from kinqimen.kinqimen import Qimen


def get_qimen_chart(year=None, month=None, day=None, hour=None, minute=None, method="chabu"):
    """Generate Qimen Dunjia chart for given time."""
    now = datetime.datetime.now()
    if year is None:
        year, month, day = now.year, now.month, now.day
        hour, minute = now.hour, now.minute

    try:
        chart = Qimen(year, month, day, hour, minute)
        if method == "chabu":
            return chart.pan(1)  # 1=拆補
        elif method == "zhirun":
            return chart.pan(2)  # 2=置閏
        elif method == "minute":
            return chart.pan_minute(2)
        elif method == "golden_mirror":
            return chart.gpan()
        elif method == "combined":
            return chart.overall()
        else:
            return chart.pan(1)
    except Exception as e:
        return {"error": str(e)}


def format_chart_text(chart):
    """Format Qimen chart as readable text."""
    if "error" in chart:
        return f"Error: {chart['error']}"

    lines = []
    lines.append(f"🔮 奇門遁甲排盤 — {chart.get('干支', 'N/A')}")
    lines.append(f"📅 排局: {chart.get('排局', 'N/A')}")
    lines.append(f"🌱 節氣: {chart.get('節氣', 'N/A')}")
    lines.append(f"⚡ 旬空: {chart.get('旬空', {})}")
    lines.append("")
    lines.append("值符值使:")
    for k, v in chart.get('值符值使', {}).items():
        lines.append(f"  {k}: {v}")
    lines.append("")
    lines.append("九宮配置:")
    for palace, stem in chart.get('天盤', {}).items():
        door = chart.get('門', {}).get(palace, '')
        star = chart.get('星', {}).get(palace, '')
        spirit = chart.get('神', {}).get(palace, '')
        lines.append(f"  {palace}宮: 天盤={stem}, 門={door}, 星={star}, 神={spirit}")
    return "\n".join(lines)


if __name__ == "__main__":
    # CLI: qimen_cli.py [year month day hour minute] [method]
    args = sys.argv[1:]
    method = "chabu"
    if args and args[-1] in ["chabu", "zhirun", "minute", "golden_mirror", "combined"]:
        method = args[-1]
        args = args[:-1]

    if len(args) >= 5:
        year, month, day, hour, minute = map(int, args[:5])
    else:
        year = month = day = hour = minute = None

    chart = get_qimen_chart(year, month, day, hour, minute, method)
    if "--json" in sys.argv:
        print(json.dumps(chart, ensure_ascii=False, indent=2))
    else:
        print(format_chart_text(chart))
