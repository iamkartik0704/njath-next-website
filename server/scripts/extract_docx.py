import zipfile
import xml.etree.ElementTree as ET
import os
import sys

def extract_docx_text(docx_path):
    print(f"=== Reading {docx_path} ===")
    with zipfile.ZipFile(docx_path, 'r') as docx:
        # Check files inside
        namelist = docx.namelist()
        media_files = [f for f in namelist if f.startswith('word/media/')]
        print(f"Total media files: {len(media_files)}")
        
        xml_content = docx.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        
        # Namespaces
        namespaces = {
            'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
            'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
            'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
        }
        
        paragraphs = []
        for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
            texts = [t.text for t in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if t.text]
            p_text = "".join(texts).strip()
            if p_text:
                paragraphs.append(p_text)
                
        return paragraphs, media_files

if __name__ == "__main__":
    p1, m1 = extract_docx_text("NJATH 2023 Questions Round 0&1.docx")
    print(f"\nExtracted {len(p1)} paragraphs from Round 0&1.")
    print("--- First 30 paragraphs ---")
    for i, p in enumerate(p1[:30]):
        print(f"[{i}] {p}")
        
    p2, m2 = extract_docx_text("NJATH Final Questions.docx")
    print(f"\nExtracted {len(p2)} paragraphs from Final Questions.")
    print("--- First 30 paragraphs ---")
    for i, p in enumerate(p2[:30]):
        print(f"[{i}] {p}")
