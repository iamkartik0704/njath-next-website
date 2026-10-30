import json

with open("parsed_round0_1.json", "r", encoding="utf-8") as f:
    r01 = json.load(f)

with open("parsed_final.json", "r", encoding="utf-8") as f:
    fin = json.load(f)

print("Round 0 & 1 with images:")
for i, item in enumerate(r01):
    if item['images']:
        # print surrounding text
        txt = " | ".join([r01[j]['text'] for j in range(max(0, i-2), min(len(r01), i+3)) if r01[j]['text']])
        print(f"Item {i} Imgs: {item['images']} -> Context: {txt[:100]}")

print("\nFinal with images:")
for i, item in enumerate(fin):
    if item['images']:
        txt = " | ".join([fin[j]['text'] for j in range(max(0, i-2), min(len(fin), i+3)) if fin[j]['text']])
        print(f"Item {i} Imgs: {item['images']} -> Context: {txt[:100]}")

