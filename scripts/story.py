"""Rebuild the eight-page illustrated sample from committed optimized artwork."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

ROOT = Path(__file__).resolve().parents[1]
W, H = 420, 595
GREEN = HexColor('#27523c')
PAPER = HexColor('#f7f2e6')
BODY = ParagraphStyle('body', fontName='Times-Roman', fontSize=12, leading=17, textColor=HexColor('#354238'), spaceAfter=13)
C = canvas.Canvas(str(ROOT/'example/limarayamusic.pdf'), pagesize=(W,H), pageCompression=1, invariant=1)
C.setTitle('Limaraya - Rumah untuk cerita yang belum selesai')
C.setAuthor('FlippyPDF / Bobby Fajar Christian')
C.setSubject('Cerita fiksi pendek tentang persahabatan; ilustrasi berbantuan AI')

def base(n, label='LIMARAYA'):
    C.setFillColor(PAPER); C.rect(0,0,W,H,fill=1,stroke=0)
    C.setFillColor(GREEN); C.setFont('Helvetica',8)
    C.drawString(32,25,label); C.drawRightString(W-32,25,f'{n:02d} / 08')

def art(name,y,height):
    # Preserve the illustration's aspect ratio; no distortion or text overlap.
    C.drawImage(str(ROOT/f'example/story/{name}.jpg'),0,y,width=W,height=height,preserveAspectRatio=True,anchor='c',mask='auto')

def title(text,y,small=''):
    C.setFillColor(GREEN)
    if small:
        C.setFont('Helvetica',8); C.drawString(32,y,small); y-=30
    C.setFont('Times-Roman',24); C.drawString(32,y,text)
    return y-30

def paragraphs(texts,y):
    for text in texts:
        p=Paragraph(text,BODY); _,height=p.wrap(W-64,H)
        if y-height < 55: raise ValueError('Story text overflows page')
        p.drawOn(C,32,y-height); y-=height+13

base(1); art('cover',240,355)
C.setFillColor(GREEN); C.setFont('Times-Roman',42); C.drawString(32,195,'Limaraya')
C.setFont('Times-Italic',16); C.drawString(32,158,'Rumah untuk cerita')
C.drawString(32,137,'yang belum selesai')
C.setFont('Helvetica',9); C.drawString(32,82,'Sebuah cerita tentang pulang dan persahabatan')
C.showPage()

base(2); art('cover',365,230)
y=title('Jalan pulang',332,'01 / SEBUAH JANJI KECIL')
paragraphs([
'Di desa Limaraya, sore selalu berbau tanah basah. Nara pulang membawa koper kecil dan kalimat besar yang belum berani ia ucapkan: ia tidak ingin kembali ke kota.',
'Di bawah beringin, Bima dan Sari menunggunya. Dulu mereka berjanji membuka rumah baca di sana. Sekarang pintu kayunya miring, raknya berdebu, dan papan namanya tinggal separuh. Namun Sari masih menyimpan kuncinya.',
'"Kita mulai dari membuka pintu," kata Bima. Untuk pertama kalinya dalam berbulan-bulan, Nara merasa sebuah awal tidak harus megah.'
],y); C.showPage()

base(3); y=title('Yang belum selesai',516,'02 / TIGA CARA MENJAGA')
paragraphs([
'Mereka bekerja sepanjang pagi. Bima memperbaiki rak, Sari memilah buku, dan Nara menyapu daun yang menyelinap lewat jendela. Seekor burung hijau hinggap di ambang, seolah sedang mengawasi perpustakaan paling kecil di dunia.',
'Di antara buku usang, Nara menemukan buku tulis miliknya. Halaman terakhir berisi cerita tentang tiga sahabat dan sebuah rumah yang tak pernah sepi. Ceritanya berhenti di tengah kalimat.',
'"Kenapa tidak diteruskan?" tanya Sari.',
'Nara menutup buku itu. "Aku takut akhirnya tidak sebagus yang kita bayangkan."',
'Bima menaruh palu. "Mungkin akhirnya belum perlu bagus. Mungkin kita hanya perlu tetap ada."',
'Nara tersenyum, tetapi belum menjawab. Di luar, langit mulai menumpuk awan.'
],y); C.showPage()

base(4); art('rain',365,230)
y=title('Hujan di dalam rumah',332,'03 / SAAT ATAP TIDAK KUAT')
paragraphs([
'Hujan datang sebelum rak terakhir selesai. Air menetes dari atap, lalu mengalir di dinding. Nara membeku melihat halaman-halaman basah. Ia merasa semua yang disentuhnya kembali gagal.',
'"Buku dulu," kata Sari lembut. "Sedihnya nanti kita temani."',
'Bima menggeser meja. Sari membawa ember. Nara mengangkat buku satu per satu. Mereka tidak sempat menjadi pahlawan; mereka hanya tiga orang yang enggan meninggalkan satu sama lain.'
],y); C.showPage()

base(5); y=title('Boleh meminjam harapan',516,'04 / MALAM PALING PANJANG')
paragraphs([
'Listrik padam. Di bawah cahaya lentera, mereka membentangkan halaman basah seperti pakaian kecil. Sebagian tulisan luntur, tetapi masih bisa dibaca.',
'Nara akhirnya bercerita tentang pekerjaan yang ditinggalkannya, lamaran yang tak dijawab, dan betapa melelahkannya berpura-pura baik-baik saja. Bima mengaku takut rumah baca itu tak akan pernah ramai. Sari mengaku lelah menjadi orang yang selalu terlihat kuat.',
'Tidak ada yang memberi nasihat panjang. Mereka membagi teh, menggeser kursi, dan membiarkan malam mendengarkan.',
'"Kalau harapanmu habis," ujar Sari, "pinjam punyaku dulu."',
'Nara membuka buku tulisnya. Di bawah kalimat yang terputus, ia menulis: <i>Rumah itu tidak dibangun oleh orang yang selalu berani. Ia dibangun oleh orang yang saling menunggu.</i>'
],y); C.showPage()

base(6); art('evening',365,230)
y=title('Satu rak, banyak tangan',332,'05 / DESA IKUT MENULIS')
paragraphs([
'Pagi berikutnya, seorang anak datang membawa dua buku dongeng. Ibunya menyusul dengan kain lap. Pak Darto membawa genting sisa. Menjelang siang, halaman rumah baca dipenuhi sandal.',
'Mereka memperbaiki atap, menjemur buku, dan membuat kartu pinjam dari kertas bekas. Nara menggambar burung hijau pada papan baru. Di bawahnya ia menulis: LIMARAYA.',
'"Artinya apa?" tanya anak itu. Sari tertawa. "Tempat cerita boleh pulang."'
],y); C.showPage()

base(7); y=title('Bab yang dibaca bersama',516,'06 / TIDAK HARUS SEMPURNA')
paragraphs([
'Pada malam pembukaan, kursi mereka tidak seragam. Beberapa buku masih bergelombang bekas hujan. Lentera menyala pelan, dan angin membawa suara katak dari sawah.',
'Nara membacakan cerita yang dulu berhenti di tengah kalimat. Bima duduk di sebelah kirinya, Sari di sebelah kanannya. Anak-anak mendekat setiap kali suaranya mengecil.',
'Di halaman terakhir, ketiga tokohnya tidak menemukan harta karun. Mereka menemukan sebuah meja, tiga cangkir, dan seseorang yang selalu menyisakan kursi.',
'Nara menutup buku. Di luar, burung hijau terbang dari beringin. Ia tahu hidupnya belum selesai diperbaiki. Namun untuk malam itu, ia tidak harus memperbaikinya sendirian.',
'<i>Dan di Limaraya, itu sudah cukup untuk memulai bab berikutnya.</i>'
],y); C.showPage()

base(8,'CERITA SELESAI, PERSAHABATAN BERLANJUT'); art('evening',260,335)
y=title('Untuk yang masih mencoba',221)
paragraphs(['Ada rumah yang dibangun dari kayu. Ada pula yang dibangun dari orang-orang yang tetap tinggal. Semoga kamu menemukan keduanya.'],y)
C.setFont('Helvetica',8); C.setFillColor(GREEN)
for i,line in enumerate(['Fiksi orisinal untuk demo FlippyPDF. Semua tokoh dan tempat rekaan.', 'Ilustrasi dibuat dengan bantuan AI; desain buku dan teks disusun untuk demo.', 'Baca dengan mode book, single, webtoon, atau manga.', 'flippypdf / MIT / 2026']): C.drawString(32,100-i*13,line)
C.save()
print(ROOT/'example/limarayamusic.pdf')
