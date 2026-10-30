import json
import re

with open("parsed_round0_1.json", "r", encoding="utf-8") as f:
    items1 = json.load(f)

with open("parsed_final.json", "r", encoding="utf-8") as f:
    items2 = json.load(f)

print("=== Scanning Round 0 & 1 ===")
for i, item in enumerate(items1):
    t = item.get('text', '')
    imgs = item.get('images', [])
    if any(k in t.lower() for k in ['question', 'answer', 'r0', 'r1', 'r2', 'ans:']):
        print(f"[{i}] {t[:80]} | Imgs: {imgs}")

print("\n=== Scanning Final ===")
for i, item in enumerate(items2):
    t = item.get('text', '')
    imgs = item.get('images', [])
    if any(k in t.lower() for k in ['level', 'answer', 'ans', 'hint', 'ques']):
        print(f"[{i}] {t[:80]} | Imgs: {imgs}")

