import type { LanguageName } from './state.ts';

const readingNotes = [
  ['A quiet page is still a page forward.', 'Halaman yang tenang tetap membawa kita maju.'],
  ['Let one sentence stay with you for a while.', 'Biarkan satu kalimat tinggal sebentar di pikiranmu.'],
  ['A story takes the time it takes.', 'Cerita tumbuh dengan waktunya sendiri.'],
  ['Your shelf keeps a record of where your mind has wandered.', 'Rak bukumu menyimpan jejak pikiran yang pernah kamu kunjungi.'],
  ['One good paragraph can change the shape of a day.', 'Satu paragraf yang tepat bisa mengubah hari.'],
  ['Reading slowly is still reading.', 'Membaca perlahan tetap berarti membaca.'],
  ['Let curiosity choose the next page.', 'Ikuti rasa ingin tahu ke halaman berikutnya.'],
  ['Some stories meet us exactly where we are.', 'Kadang sebuah cerita datang saat kita membutuhkannya.'],
] as const;

export type ReflectionTopic = 'reading' | 'calm' | 'courage' | 'life' | 'friendship' | 'creativity' | 'spiritual';
const reflectionTopics: Record<ReflectionTopic, readonly [string, string][]> = {
  reading: [['A few pages are enough for today.', 'Beberapa halaman cukup untuk hari ini.'], ['Read at your own pace.', 'Baca dengan kecepatanmu sendiri.']],
  calm: [['Leave a little room for quiet.', 'Sisakan tempat untuk tenang.'], ['Rest is part of reading time.', 'Istirahat juga bagian dari waktu membaca.']],
  courage: [['A small beginning is still a beginning.', 'Awal kecil tetap sebuah awal.'], ['You can begin again without rushing.', 'Kamu bisa mulai lagi tanpa terburu-buru.']],
  life: [['Make room for a different point of view.', 'Sisakan tempat untuk sudut pandang berbeda.'], ['Today need not look like yesterday.', 'Hari ini tak harus seperti kemarin.']],
  friendship: [['A shared story opens a conversation.', 'Cerita bersama membuka percakapan.'], ['Leave a page for someone you care about.', 'Sisakan halaman untuk orang yang kamu sayangi.']],
  creativity: [['Let a question stay open a while.', 'Biarkan pertanyaan terbuka sebentar.'], ['A margin can hold a new idea.', 'Tepi halaman bisa menyimpan ide baru.']],
  spiritual: [['Take a quiet moment for gratitude.', 'Ambil waktu tenang untuk bersyukur.'], ['Give reflection a little space today.', 'Beri renungan sedikit ruang hari ini.']],
};

export function dailyReadingNote(language: LanguageName, date = new Date(), topic: ReflectionTopic = 'reading') {
  const localDay = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  const rows = reflectionTopics[topic] || readingNotes;
  const [english, indonesian] = rows[((localDay % rows.length) + rows.length) % rows.length];
  return language === 'id' ? indonesian : english;
}
