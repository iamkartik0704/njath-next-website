import zipfile
import xml.etree.ElementTree as ET

def dump_docx(docx_path, out_txt):
    with zipfile.ZipFile(docx_path, 'r') as docx:
        xml_content = docx.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        with open(out_txt, 'w', encoding='utf-8') as f:
            for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
                texts = [t.text for t in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if t.text]
                p_text = "".join(texts).strip()
                if p_text:
                    f.write(p_text + "\n")

dump_docx("NJATH 2023 Questions Round 0&1.docx", "dump_round0_1.txt")
dump_docx("NJATH Final Questions.docx", "dump_final.txt")
print("Dumped text successfully.")
