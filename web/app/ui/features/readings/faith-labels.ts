import { PACK_FAITHS, type PackFaith } from '../../../../../app/library/content-packs.ts';

export const FAITH_LABELS: Record<PackFaith, { en: string; id: string; ledeEn: string; ledeId: string }> = {
  islam: { en: 'Islam', id: 'Islam', ledeEn: 'The Quran, hadith and stories of the prophets, kept on this device.', ledeId: 'Al-Qur’an, hadis, dan kisah para nabi, tersimpan di perangkat ini.' },
  protestantism: { en: 'Protestant Christianity', id: 'Kristen Protestan', ledeEn: 'Bible editions and Christian classics, kept on this device.', ledeId: 'Edisi Alkitab dan karya klasik Kristen, tersimpan di perangkat ini.' },
  catholicism: { en: 'Catholic Christianity', id: 'Katolik', ledeEn: 'Bible editions and Catholic classics, kept on this device.', ledeId: 'Edisi Alkitab dan karya klasik Katolik, tersimpan di perangkat ini.' },
  buddhism: { en: 'Buddhism', id: 'Buddha', ledeEn: 'Discourses, verses and stories, kept on this device.', ledeId: 'Khotbah, syair, dan kisah, tersimpan di perangkat ini.' },
  hinduism: { en: 'Hinduism', id: 'Hindu', ledeEn: 'Scriptures and epics, kept on this device.', ledeId: 'Kitab suci dan wiracarita, tersimpan di perangkat ini.' },
  confucianism: { en: 'Confucianism', id: 'Konghucu', ledeEn: 'The classics of the Confucian tradition, kept on this device.', ledeId: 'Kitab klasik tradisi Konghucu, tersimpan di perangkat ini.' },
};

export const isPackFaith = (value: unknown): value is PackFaith => (PACK_FAITHS as readonly unknown[]).includes(value);
