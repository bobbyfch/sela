"""Reproducible original novella assets. Requires reportlab, Pillow and pypdf."""
from pathlib import Path
import re, json, html, zipfile, hashlib
from PIL import Image
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image as PdfImage
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/'example/story'
source=(ART/'sebentar-sebelum-pulang.md').read_text(encoding='utf-8')
parts=re.split(r'^## ',source,flags=re.M)[1:]
chapters=[(part.split('\n',1)[0],part.split('\n',1)[1].strip()) for part in parts]
TITLE='Sebentar Sebelum Pulang'
for name in ['cover','veranda','morning']:
    if (ART/(name+'.png')).exists():
        with Image.open(ART/(name+'.png')) as image:
            image.convert('RGB').save(ART/(name+'.jpg'),quality=86,optimize=True)

fonts=Path('C:/Windows/Fonts')
for name,file in [('Story','georgia.ttf'),('StoryBold','georgiab.ttf'),('StoryItalic','georgiai.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(fonts/file)))
pdfmetrics.registerFontFamily('Story',normal='Story',bold='StoryBold',italic='StoryItalic')
sage=colors.HexColor('#315d46');ink=colors.HexColor('#354037');muted=colors.HexColor('#708171')
body=ParagraphStyle('StoryBody',fontName='Story',fontSize=11.5,leading=17,textColor=ink,alignment=TA_JUSTIFY,spaceAfter=8,allowWidows=0,allowOrphans=0)
heading=ParagraphStyle('StoryChapter',fontName='Story',fontSize=23,leading=30,textColor=sage,spaceBefore=14,spaceAfter=25,keepWithNext=True)
small=ParagraphStyle('Small',fontName='Story',fontSize=9,leading=14,textColor=muted,spaceAfter=12)
center=ParagraphStyle('Center',parent=small,alignment=TA_CENTER)
W,H=148*mm,210*mm
class Book(SimpleDocTemplate):
    def afterFlowable(self,flowable):
        if isinstance(flowable,Paragraph) and flowable.style.name=='StoryChapter' and (re.match(r'^\d+\.',flowable.getPlainText()) or flowable.getPlainText()=='Tentang Cerita Ini'):
            text=flowable.getPlainText();key='chapter-'+hashlib.sha1(text.encode()).hexdigest()[:10]
            self.canv.bookmarkPage(key);self.canv.addOutlineEntry(text,key,0,False)
            self.notify('TOCEntry',(0,text,self.page,key))
def decorate(canvas,doc):
    canvas.setTitle(TITLE);canvas.setAuthor('Bobby Fajar Christian · Sela');canvas.setSubject('Novelet orisinal berbahasa Indonesia tentang pulang, keluarga, dan cinta yang berubah.');canvas.setKeywords('Sela, novelet Indonesia, Bobby, Sarah, rumah, persahabatan')
    if doc.page==1:
        canvas.drawImage(str(ART/'cover.jpg'),0,0,width=W,height=H)
        canvas.setFillColor(sage);canvas.setFont('Story',25)
        canvas.drawCentredString(W/2,H-25*mm,'Sebentar')
        canvas.drawCentredString(W/2,H-37*mm,'Sebelum Pulang')
        canvas.setFont('Story',9);canvas.drawCentredString(W/2,H-47*mm,'SEBUAH NOVELET ORISINAL UNTUK SELA')
    else:
        canvas.setFillColor(colors.HexColor('#fffdf7'));canvas.rect(0,0,W,H,fill=1,stroke=0)
        canvas.setFillColor(muted);canvas.setFont('Story',7.5)
        canvas.drawString(21*mm,12*mm,'SELA · SEBENTAR SEBELUM PULANG');canvas.drawRightString(W-21*mm,12*mm,str(doc.page))
book=Book(str(ROOT/'example/sebentar-sebelum-pulang.pdf'),pagesize=(W,H),leftMargin=21*mm,rightMargin=21*mm,topMargin=20*mm,bottomMargin=23*mm,pageCompression=1)
flows=[Spacer(1,1),PageBreak(),Spacer(1,28*mm),Paragraph(TITLE,heading),Paragraph('Bobby pulang hanya untuk beberapa hari. Di rumah lama, ia menemukan bahwa yang tertinggal tidak selalu meminta untuk diulang.',body),Spacer(1,15*mm),Paragraph('Fiksi orisinal untuk Sela<br/>Bobby Fajar Christian · 2026',small),Paragraph('Teks dan ilustrasi disusun dengan bantuan AI. Semua tokoh dan peristiwa rekaan; bukan biografi. Lisensi cerita dan ilustrasi: CC BY 4.0. Lisensi kode Sela: MIT.',small),Paragraph('<link href="https://github.com/bobbyfch/sela" color="#315d46">github.com/bobbyfch/sela</link>',small),PageBreak(),Paragraph('Daftar Isi',heading)]
toc=TableOfContents();toc.levelStyles=[ParagraphStyle('TOC',parent=small,fontSize=10.5,leading=20,leftIndent=0,firstLineIndent=0,spaceBefore=8,textColor=sage)];flows.extend([toc,PageBreak()])
for index,(title,text) in enumerate(chapters):
    flows.append(Paragraph(html.escape(title),heading))
    for paragraph in text.split('\n\n'): flows.append(Paragraph(html.escape(paragraph).replace('\n',' '),body if index<8 else small))
    if index==3 or index==6:
        flows.extend([PageBreak(),PdfImage(str(ART/('veranda.jpg' if index==3 else 'morning.jpg')),width=100*mm,height=150*mm),Spacer(1,3*mm),Paragraph('Percakapan yang tidak meminta waktu kembali.' if index==3 else 'Sebuah rumah boleh memiliki kehidupan berikutnya.',center)])
    if index<len(chapters)-1:flows.append(PageBreak())
book.multiBuild(flows,onFirstPage=decorate,onLaterPages=decorate)
reader=PdfReader(book.filename)
assert 20<=len(reader.pages)<=50, f'Expected 20–50 pages, got {len(reader.pages)}'
assert len(reader.outline)>=8

# EPUB 3 with nav + NCX, real cover metadata and the same complete prose.
escape=html.escape
def xhtml(title,content):return f'<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="id"><head><title>{escape(title)}</title><link rel="stylesheet" href="style.css"/></head><body>{content}</body></html>'
entries={'META-INF/container.xml':'<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',
 'OEBPS/style.css':'body{font-family:Georgia,serif;line-height:1.8;color:#354037;background:#fffdf7}h1,h2{color:#315d46;font-weight:400}p{text-align:justify}img{max-width:100%;height:auto}small{font-size:.8em}'}
nav=[];manifest=[];spine=[]
for index,(title,text) in enumerate(chapters[:8]):
    content='<h1>'+escape(title)+'</h1>'+''.join('<p>'+escape(p)+'</p>' for p in text.split('\n\n'))
    if index==0:content=f'<img src="cover.jpg" alt="Bobby di gerbang rumah lama"/><h1>{TITLE}</h1><p>Sebuah novelet orisinal untuk Sela.</p>'+content
    if index==3:content+='<img src="veranda.jpg" alt="Bobby dan Sarah berbincang di teras"/>'
    if index==6:content+='<img src="morning.jpg" alt="Cahaya pagi memasuki ruang yang siap dihuni kembali"/>'
    if index==7:content+='<h2>Tentang Cerita Ini</h2>'+''.join('<p>'+escape(p)+'</p>' for p in chapters[8][1].split('\n\n'))
    entries[f'OEBPS/chapter{index}.xhtml']=xhtml(title,content);nav.append(f'<li><a href="chapter{index}.xhtml">{escape(title)}</a></li>');manifest.append(f'<item id="c{index}" href="chapter{index}.xhtml" media-type="application/xhtml+xml"/>');spine.append(f'<itemref idref="c{index}"/>')
entries['OEBPS/nav.xhtml']=xhtml('Daftar Isi','<nav epub:type="toc" id="toc"><h1>Daftar Isi</h1><ol>'+''.join(nav)+'</ol></nav>')
entries['OEBPS/toc.ncx']='<?xml version="1.0" encoding="UTF-8"?><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="urn:sela:sebentar-sebelum-pulang"/></head><docTitle><text>'+TITLE+'</text></docTitle><navMap>'+''.join(f'<navPoint id="p{i}" playOrder="{i+1}"><navLabel><text>{escape(title)}</text></navLabel><content src="chapter{i}.xhtml"/></navPoint>' for i,(title,_) in enumerate(chapters[:8]))+'</navMap></ncx>'
entries['OEBPS/content.opf']='<?xml version="1.0" encoding="UTF-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">urn:sela:sebentar-sebelum-pulang</dc:identifier><dc:title>'+TITLE+'</dc:title><dc:creator>Bobby Fajar Christian · Sela</dc:creator><dc:language>id</dc:language><dc:rights>CC BY 4.0 · AI-assisted original fiction and illustration</dc:rights><meta property="dcterms:modified">2026-10-09T00:00:00Z</meta><meta name="cover" content="cover"/></metadata><manifest>'+''.join(manifest)+'<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/><item id="style" href="style.css" media-type="text/css"/><item id="cover" href="cover.jpg" media-type="image/jpeg" properties="cover-image"/><item id="veranda" href="veranda.jpg" media-type="image/jpeg"/><item id="morning" href="morning.jpg" media-type="image/jpeg"/></manifest><spine toc="ncx">'+''.join(spine)+'</spine></package>'
with zipfile.ZipFile(ROOT/'example/sebentar-sebelum-pulang.epub','w',zipfile.ZIP_DEFLATED) as archive:
    archive.writestr('mimetype','application/epub+zip',compress_type=zipfile.ZIP_STORED)
    for path,text in entries.items():archive.writestr(path,text.encode('utf-8'))
    for name in ['cover','veranda','morning']:archive.write(ART/(name+'.jpg'),'OEBPS/'+name+'.jpg')
with zipfile.ZipFile(ROOT/'example/sebentar-sebelum-pulang.cbz','w',zipfile.ZIP_DEFLATED) as archive:
    for index,name in enumerate(['cover','veranda','morning']):archive.write(ART/(name+'.jpg'),f'{index+1:02}-{name}.jpg')
stats={'title':TITLE,'pages':len(reader.pages),'chapters':8,'pdfBookmarks':len(reader.outline),'chapterPages':[{'title':item.title,'page':reader.get_destination_page_number(item)+1} for item in reader.outline],'words':len(' '.join(t for _,t in chapters[:8]).split()),'illustrations':3,'language':'id','license':'CC-BY-4.0','aiAssisted':True}
(ART/'manifest.json').write_text(json.dumps(stats,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(stats,ensure_ascii=False))
