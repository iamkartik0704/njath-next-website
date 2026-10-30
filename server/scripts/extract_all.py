import zipfile
import xml.etree.ElementTree as ET
import os

def parse_docx_questions(docx_path, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    with zipfile.ZipFile(docx_path, 'r') as docx:
        # Read relationships
        rels_xml = docx.read('word/_rels/document.xml.rels')
        rels_tree = ET.fromstring(rels_xml)
        rel_map = {}
        for rel in rels_tree:
            rId = rel.attrib.get('Id')
            target = rel.attrib.get('Target')
            if rId and target:
                rel_map[rId] = target

        # Read document.xml
        xml_content = docx.read('word/document.xml')
        tree = ET.fromstring(xml_content)

        w_ns = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
        a_ns = 'http://schemas.openxmlformats.org/drawingml/2006/main'
        r_ns = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'

        items = []
        for p in tree.iter(f'{{{w_ns}}}p'):
            texts = [t.text for t in p.iter(f'{{{w_ns}}}t') if t.text]
            p_text = "".join(texts).strip()

            # Find images
            images = []
            for blip in p.iter(f'{{{a_ns}}}blip'):
                embed_id = blip.attrib.get(f'{{{r_ns}}}embed')
                if embed_id and embed_id in rel_map:
                    target = rel_map[embed_id]
                    # target is e.g. "media/image1.png"
                    full_media_path = "word/" + target if not target.startswith("word/") else target
                    img_filename = os.path.basename(target)
                    try:
                        img_data = docx.read(full_media_path)
                        save_path = os.path.join(output_dir, img_filename)
                        with open(save_path, 'wb') as img_f:
                            img_f.write(img_data)
                        images.append(img_filename)
                    except Exception as e:
                        pass

            if p_text or images:
                items.append({'text': p_text, 'images': images})

        return items

print("Extracting media & parsing...")
items1 = parse_docx_questions("NJATH 2023 Questions Round 0&1.docx", "public/assets/questions/round0_1")
items2 = parse_docx_questions("NJATH Final Questions.docx", "public/assets/questions/final")

print(f"Extracted Round 0&1 items: {len(items1)}")
print(f"Extracted Final items: {len(items2)}")

# Save raw items for inspection
import json
with open("parsed_round0_1.json", "w", encoding="utf-8") as f:
    json.dump(items1, f, indent=2)
with open("parsed_final.json", "w", encoding="utf-8") as f:
    json.dump(items2, f, indent=2)

print("Saved JSON structures.")

