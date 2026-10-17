import type {FaithId,FaithReading} from './scripture-sources.ts';

type LocalReading={title:string;reference:string;text:string;sourceUrl:string;attribution:string;language:string;license:string;};

const localReadings:Partial<Record<Exclude<FaithId,'none'>,readonly LocalReading[]>>={
 protestantism:[
  {title:'Bible reading',reference:'John 3:16',text:'For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.',sourceUrl:'https://ebible.org/engwebp/JHN03.htm',attribution:'World English Bible · Public Domain · eBible.org',language:'en',license:'Public Domain'},
  {title:'Bible reading',reference:'Psalm 23:1',text:'Yahweh is my shepherd: I shall lack nothing.',sourceUrl:'https://ebible.org/engwebp/PSA023.htm',attribution:'World English Bible · Public Domain · eBible.org',language:'en',license:'Public Domain'},
  {title:'Bible reading',reference:'Matthew 5:9',text:'Blessed are the peacemakers, for they shall be called children of God.',sourceUrl:'https://ebible.org/engwebp/MAT05.htm',attribution:'World English Bible · Public Domain · eBible.org',language:'en',license:'Public Domain'},
  {title:'Bible reading',reference:'Romans 12:12',text:'rejoicing in hope; enduring in troubles; continuing steadfastly in prayer;',sourceUrl:'https://ebible.org/engwebp/ROM12.htm',attribution:'World English Bible · Public Domain · eBible.org',language:'en',license:'Public Domain'},
  {title:'Bible reading',reference:'Philippians 4:6',text:'In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God.',sourceUrl:'https://ebible.org/engwebp/PHP04.htm',attribution:'World English Bible · Public Domain · eBible.org',language:'en',license:'Public Domain'},
 ],
 catholicism:[
  {title:'Catholic Bible reading',reference:'John 3:16',text:'For God so loved the world, as to give his only begotten Son; that whosoever believeth in him, may not perish, but may have life everlasting.',sourceUrl:'https://ebible.org/engDRA/JHN03.htm',attribution:'Douay-Rheims 1899 American Edition · Public Domain · eBible.org',language:'en',license:'Public Domain'},
  {title:'Catholic Bible reading',reference:'Psalm 23:1',text:'A psalm for David. The Lord ruleth me: and I shall want nothing.',sourceUrl:'https://ebible.org/engDRA/PSA023.htm',attribution:'Douay-Rheims 1899 American Edition · Public Domain · eBible.org',language:'en',license:'Public Domain'},
  {title:'Catholic Bible reading',reference:'Matthew 5:9',text:'Blesses are the peacemakers: for they shall be called children of God.',sourceUrl:'https://ebible.org/engDRA/MAT05.htm',attribution:'Douay-Rheims 1899 American Edition · Public Domain · eBible.org',language:'en',license:'Public Domain'},
  {title:'Catholic Bible reading',reference:'Romans 12:12',text:'Rejoicing in hope. Patient in tribulation. Instant in prayer.',sourceUrl:'https://ebible.org/engDRA/ROM12.htm',attribution:'Douay-Rheims 1899 American Edition · Public Domain · eBible.org',language:'en',license:'Public Domain'},
  {title:'Catholic Bible reading',reference:'Philippians 4:6',text:'Be nothing solicitous; but in every thing, by prayer and supplication, with thanksgiving, let your petitions be made known to God.',sourceUrl:'https://ebible.org/engDRA/PHP04.htm',attribution:'Douay-Rheims 1899 American Edition · Public Domain · eBible.org',language:'en',license:'Public Domain'},
 ],
 buddhism:[
  {title:'Dhamma reading',reference:'Dhammapada 1',text:'Intention is the leader of things; intention is first, they’re made by intention. If with pure intent you speak or act, happiness follows you like a shadow that never leaves.',sourceUrl:'https://suttacentral.net/dhp1-20/en/sujato',attribution:'Bhikkhu Sujato · SuttaCentral · CC0 1.0',language:'en',license:'CC0 1.0'},
  {title:'Dhamma reading',reference:'Dhammapada 5',text:'For never is hatred laid to rest by hate, it’s laid to rest by love: this is an ancient teaching.',sourceUrl:'https://suttacentral.net/dhp1-20/en/sujato',attribution:'Bhikkhu Sujato · SuttaCentral · CC0 1.0',language:'en',license:'CC0 1.0'},
  {title:'Dhamma reading',reference:'Dhammapada 20',text:'Little though they may recite scripture, if they live in line with the teaching, having given up greed, hate, and delusion, with deep understanding and heart well freed, they share in the blessings of the ascetic life.',sourceUrl:'https://suttacentral.net/dhp1-20/en/sujato',attribution:'Bhikkhu Sujato · SuttaCentral · CC0 1.0',language:'en',license:'CC0 1.0'},
  {title:'Dhamma reading',reference:'AN 8.19',text:'Just as the ocean has one taste, the taste of salt, this teaching has one taste, the taste of freedom.',sourceUrl:'https://suttacentral.net/an8.19/en/sujato',attribution:'Bhikkhu Sujato · SuttaCentral · CC0 1.0',language:'en',license:'CC0 1.0'},
 ],
 hinduism:[
  {title:'Bhagavad Gita',reference:'Bhagavad Gita · Chapter 2',text:'Find full reward of doing right in right! Let right deeds be thy motive, not the fruit which comes from them.',sourceUrl:'https://www.gutenberg.org/ebooks/2388',attribution:'The Song Celestial, translated by Sir Edwin Arnold (1900) · Project Gutenberg #2388 · Public Domain',language:'en',license:'Public Domain'},
  {title:'Bhagavad Gita',reference:'Bhagavad Gita · Chapter 3',text:'Do thine allotted task! Work is more excellent than idleness; the body’s life proceeds not, lacking work.',sourceUrl:'https://www.gutenberg.org/ebooks/2388',attribution:'The Song Celestial, translated by Sir Edwin Arnold (1900) · Project Gutenberg #2388 · Public Domain',language:'en',license:'Public Domain'},
 ],
 confucianism:[
  {title:'The Analects',reference:'Analects 1.1',text:'Is it not pleasant to learn with a constant perseverance and application? Is it not delightful to have friends coming from distant quarters? Is he not a man of complete virtue, who feels no discomposure though men may take no note of him?',sourceUrl:'https://www.gutenberg.org/ebooks/3330',attribution:'Confucian Analects, translated by James Legge · Project Gutenberg #3330 · Public Domain in the United States',language:'en',license:'Public Domain in the United States'},
  {title:'The Analects',reference:'Analects 2.4',text:'At fifteen, I had my mind bent on learning. At thirty, I stood firm. At forty, I had no doubts. At fifty, I knew the decrees of Heaven.',sourceUrl:'https://www.gutenberg.org/ebooks/3330',attribution:'Confucian Analects, translated by James Legge · Project Gutenberg #3330 · Public Domain in the United States',language:'en',license:'Public Domain in the United States'},
 ]
};

function dayNumber(date:Date):number{return Math.floor(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate())/86400000);}

/** Small, source-identified offline passages. Exact source editions and licenses stay attached. */
export function localFaithReading(faith:FaithId,date=new Date()):FaithReading|null{
 if(faith==='islam'||faith==='none')return null;
 const entries=localReadings[faith];if(!entries?.length)return null;
 const item=entries[((dayNumber(date)%entries.length)+entries.length)%entries.length];
 return {...item,faith};
}
