import json
import os
import zipfile
import xml.sax.saxutils as saxutils
from PIL import Image

WORKSPACE = r"C:\Users\iamka\Desktop\njath\njath-next-website"
JSON_PATH = os.path.join(WORKSPACE, "server", "scripts", "extracted_questions.json")
OUTPUT_DOCX = os.path.join(WORKSPACE, "NJATH_Questions_and_Answers.docx")

def escape(text):
    if text is None:
        return ""
    return saxutils.escape(str(text))

def build_docx():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        questions = json.load(f)

    # Sort questions by level and order
    questions.sort(key=lambda x: (x["level"], x["order"]))

    # Group questions by level
    levels = {}
    for q in questions:
        levels.setdefault(q["level"], []).append(q)

    # Document relationships and media tracking
    rels = [
        ('rId1', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles', 'styles.xml')
    ]
    media_files = {} # target_path_in_zip -> local_path
    rel_id_counter = 2

    # Build XML document
    doc_body = []

    # Title paragraph
    doc_body.append('''
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Title"/>
        <w:jc w:val="center"/>
        <w:spacing w:before="240" w:after="120"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="52"/>
          <w:szCs w:val="52"/>
          <w:color w:val="0F172A"/>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        </w:rPr>
        <w:t>NJATH (Not Just Another Treasure Hunt)</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:before="0" w:after="360"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:sz w:val="28"/>
          <w:szCs w:val="28"/>
          <w:color w:val="475569"/>
          <w:i/>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        </w:rPr>
        <w:t>Official Question Bank &amp; Complete Answer Key (Levels 1 to 6 - 48 Questions)</w:t>
      </w:r>
    </w:p>
    ''')

    # Summary Table of Answers at the top
    doc_body.append('''
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
        <w:spacing w:before="240" w:after="120"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="36"/>
          <w:color w:val="0F172A"/>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        </w:rPr>
        <w:t>Summary Answer Key Table (1 - 48)</w:t>
      </w:r>
    </w:p>
    ''')

    # Create summary table XML
    table_xml = ['''
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="0" w:type="auto"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>
          <w:left w:val="none"/>
          <w:bottom w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>
          <w:right w:val="none"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
          <w:insideV w:val="none"/>
        </w:tblBorders>
        <w:tblCellMar>
          <w:top w:w="120" w:type="dxa"/>
          <w:bottom w:w="120" w:type="dxa"/>
          <w:left w:w="160" w:type="dxa"/>
          <w:right w:w="160" w:type="dxa"/>
        </w:tblCellMar>
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="1200"/>
        <w:gridCol w:w="1200"/>
        <w:gridCol w:w="3800"/>
        <w:gridCol w:w="3400"/>
      </w:tblGrid>
      <w:tr>
        <w:trPr>
          <w:tblHeader/>
        </w:trPr>
        <w:tc>
          <w:tcPr>
            <w:shd w:val="clear" w:color="auto" w:fill="1E293B"/>
          </w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/></w:rPr><w:t>Level</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:shd w:val="clear" w:color="auto" w:fill="1E293B"/>
          </w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/></w:rPr><w:t>Order</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:shd w:val="clear" w:color="auto" w:fill="1E293B"/>
          </w:tcPr>
          <w:p><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/></w:rPr><w:t>Question Title</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:shd w:val="clear" w:color="auto" w:fill="1E293B"/>
          </w:tcPr>
          <w:p><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/></w:rPr><w:t>Official Answer</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
    ''']

    for q in questions:
        fill_color = "F1F5F9" if (q["order"] % 2 == 0) else "FFFFFF"
        table_xml.append(f'''
        <w:tr>
          <w:tc>
            <w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="{fill_color}"/></w:tcPr>
            <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t>Level {q["level"]}</w:t></w:r></w:p>
          </w:tc>
          <w:tc>
            <w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="{fill_color}"/></w:tcPr>
            <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t>Q{q["order"]}</w:t></w:r></w:p>
          </w:tc>
          <w:tc>
            <w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="{fill_color}"/></w:tcPr>
            <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>{escape(q["title"])}</w:t></w:r></w:p>
          </w:tc>
          <w:tc>
            <w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="{fill_color}"/></w:tcPr>
            <w:p><w:r><w:rPr><w:b/><w:color w:val="0D9488"/></w:rPr><w:t>{escape(q["answer"])}</w:t></w:r></w:p>
          </w:tc>
        </w:tr>
        ''')
    table_xml.append('</w:tbl>')
    doc_body.append("".join(table_xml))

    # Page break after summary table
    doc_body.append('''
    <w:p>
      <w:r>
        <w:br w:type="page"/>
      </w:r>
    </w:p>
    ''')

    # Detailed Questions by Level
    for lvl in sorted(levels.keys()):
        doc_body.append(f'''
        <w:p>
          <w:pPr>
            <w:pStyle w:val="Heading1"/>
            <w:spacing w:before="360" w:after="160"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:b/>
              <w:sz w:val="40"/>
              <w:color w:val="1E3A8A"/>
              <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
            </w:rPr>
            <w:t>LEVEL {lvl}</w:t>
          </w:r>
        </w:p>
        ''')

        for q in levels[lvl]:
            doc_body.append(f'''
            <w:p>
              <w:pPr>
                <w:pStyle w:val="Heading2"/>
                <w:spacing w:before="240" w:after="80"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:b/>
                  <w:sz w:val="28"/>
                  <w:color w:val="0F172A"/>
                  <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                </w:rPr>
                <w:t>Level {q["level"]} - Question {q["order"]}: {escape(q["title"])}</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:spacing w:before="40" w:after="60"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:b/>
                  <w:color w:val="475569"/>
                </w:rPr>
                <w:t>Description: </w:t>
              </w:r>
              <w:r>
                <w:t>{escape(q["description"])}</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:spacing w:before="40" w:after="60"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:b/>
                  <w:color w:val="D97706"/>
                </w:rPr>
                <w:t>Hint: </w:t>
              </w:r>
              <w:r>
                <w:rPr><w:i/></w:rPr>
                <w:t>{escape(q["hint"]) if q.get("hint") else "No hint provided"}</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:spacing w:before="40" w:after="80"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:b/>
                  <w:color w:val="059669"/>
                </w:rPr>
                <w:t>Answer: </w:t>
              </w:r>
              <w:r>
                <w:rPr>
                  <w:b/>
                  <w:color w:val="047857"/>
                </w:rPr>
                <w:t>{escape(q["answer"])}</w:t>
              </w:r>
            </w:p>
            ''')

            # Embed image if present
            img_rel_url = q.get("imageUrl")
            if img_rel_url and img_rel_url.startswith("/"):
                local_img_path = os.path.join(WORKSPACE, "public", img_rel_url.lstrip("/\\"))
                if os.path.exists(local_img_path):
                    try:
                        with Image.open(local_img_path) as im:
                            w_px, h_px = im.size
                        # Max width in EMU: 5 inches = 4572000 EMUs (914400 EMUs per inch)
                        max_w_emu = 4572000
                        max_h_emu = 3429000
                        # 1 px ~= 9525 EMUs at 96 DPI
                        w_emu = int(w_px * 9525)
                        h_emu = int(h_px * 9525)
                        scale = min(1.0, max_w_emu / w_emu, max_h_emu / h_emu)
                        cx = int(w_emu * scale)
                        cy = int(h_emu * scale)

                        r_id = f"rIdImg{rel_id_counter}"
                        rel_id_counter += 1
                        ext = os.path.splitext(local_img_path)[1].lower()
                        zip_media_name = f"image_{rel_id_counter}{ext}"
                        zip_media_path = f"media/{zip_media_name}"
                        media_files[zip_media_path] = local_img_path

                        rels.append((r_id, 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image', zip_media_path))

                        # Insert DrawingML XML
                        doc_body.append(f'''
                        <w:p>
                          <w:pPr>
                            <w:spacing w:before="60" w:after="160"/>
                          </w:pPr>
                          <w:r>
                            <w:drawing>
                              <wp:inline distT="0" distB="0" distL="0" distR="0">
                                <wp:extent cx="{cx}" cy="{cy}"/>
                                <wp:docPr id="{rel_id_counter}" name="Question Image {q['order']}"/>
                                <wp:cNvGraphicFramePr>
                                  <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
                                </wp:cNvGraphicFramePr>
                                <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                                  <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                                    <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                                      <pic:nvPicPr>
                                        <pic:cNvPr id="0" name="Picture"/>
                                        <pic:cNvPicPr/>
                                      </pic:nvPicPr>
                                      <pic:blipFill>
                                        <a:blip r:embed="{r_id}"/>
                                        <a:stretch><a:fillRect/></a:stretch>
                                      </pic:blipFill>
                                      <pic:spPr>
                                        <a:xfrm>
                                          <a:off x="0" y="0"/>
                                          <a:ext cx="{cx}" cy="{cy}"/>
                                        </a:xfrm>
                                        <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                                      </pic:spPr>
                                    </pic:pic>
                                  </a:graphicData>
                                </a:graphic>
                              </wp:inline>
                            </w:drawing>
                          </w:r>
                        </w:p>
                        ''')
                    except Exception as e:
                        print(f"Error embedding image {local_img_path}: {e}")

            # Separator space
            doc_body.append('''
            <w:p>
              <w:pPr>
                <w:pBdr>
                  <w:bottom w:val="single" w:sz="4" w:space="8" w:color="E2E8F0"/>
                </w:pBdr>
                <w:spacing w:before="60" w:after="160"/>
              </w:pPr>
            </w:p>
            ''')

        # Page break after each level except the last
        if lvl < max(levels.keys()):
            doc_body.append('''
            <w:p>
              <w:r>
                <w:br w:type="page"/>
              </w:r>
            </w:p>
            ''')

    full_document_xml = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
                xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
                xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
                xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
                xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"
                xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml">
      <w:body>
        {"".join(doc_body)}
        <w:sectPr>
          <w:pgSz w:w="12240" w:h="15840"/>
          <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
        </w:sectPr>
      </w:body>
    </w:document>
    '''

    content_types_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
      <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
      <Default Extension="xml" ContentType="application/xml"/>
      <Default Extension="png" ContentType="image/png"/>
      <Default Extension="jpg" ContentType="image/jpeg"/>
      <Default Extension="jpeg" ContentType="image/jpeg"/>
      <Default Extension="gif" ContentType="image/gif"/>
      <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
      <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
    </Types>
    '''

    rels_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
    </Relationships>
    '''

    doc_rels_items = [f'<Relationship Id="{r[0]}" Type="{r[1]}" Target="{r[2]}"/>' for r in rels]
    document_rels_xml = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      {"".join(doc_rels_items)}
    </Relationships>
    '''

    styles_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:docDefaults>
        <w:rPrDefault>
          <w:rPr>
            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
            <w:sz w:val="22"/>
            <w:szCs w:val="22"/>
            <w:color w:val="334155"/>
          </w:rPr>
        </w:rPrDefault>
      </w:docDefaults>
      <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
        <w:name w:val="Normal"/>
        <w:qFormat/>
      </w:style>
      <w:style w:type="paragraph" w:styleId="Heading1">
        <w:name w:val="heading 1"/>
        <w:basedOn w:val="Normal"/>
        <w:next w:val="Normal"/>
        <w:qFormat/>
        <w:rPr>
          <w:b/>
          <w:sz w:val="36"/>
          <w:color w:val="0F172A"/>
        </w:rPr>
      </w:style>
      <w:style w:type="paragraph" w:styleId="Heading2">
        <w:name w:val="heading 2"/>
        <w:basedOn w:val="Normal"/>
        <w:next w:val="Normal"/>
        <w:qFormat/>
        <w:rPr>
          <w:b/>
          <w:sz w:val="28"/>
          <w:color w:val="1E293B"/>
        </w:rPr>
      </w:style>
      <w:style w:type="paragraph" w:styleId="Title">
        <w:name w:val="Title"/>
        <w:basedOn w:val="Normal"/>
        <w:next w:val="Normal"/>
        <w:qFormat/>
        <w:rPr>
          <w:b/>
          <w:sz w:val="52"/>
          <w:color w:val="0F172A"/>
        </w:rPr>
      </w:style>
    </w:styles>
    '''

    with zipfile.ZipFile(OUTPUT_DOCX, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types_xml.strip())
        z.writestr("_rels/.rels", rels_xml.strip())
        z.writestr("word/_rels/document.xml.rels", document_rels_xml.strip())
        z.writestr("word/styles.xml", styles_xml.strip())
        z.writestr("word/document.xml", full_document_xml.strip())
        for zip_target, local_path in media_files.items():
            z.write(local_path, f"word/{zip_target}")

    print(f"Successfully generated DOCX file with embedded images at: {OUTPUT_DOCX}")
    print(f"File size: {os.path.getsize(OUTPUT_DOCX)} bytes")
    print(f"Embedded images count: {len(media_files)}")

if __name__ == "__main__":
    build_docx()
