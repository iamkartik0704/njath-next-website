import json

with open(r"C:\Users\iamka\Desktop\njath\njath-next-website\server\scripts\extracted_questions.json", encoding="utf-8") as f:
    questions = json.load(f)

questions.sort(key=lambda x: (x["level"], x["order"]))
for q in questions:
    print(f"Level {q['level']} | Q{q['order']} | {q['title']} | Answer: {q['answer']}")

