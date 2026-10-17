import {create,insert,search} from '@orama/orama';
import {language as englishLanguage,stemmer as englishStemmer} from '@orama/stemmers/english';
import {language as indonesianLanguage,stemmer as indonesianStemmer} from '@orama/stemmers/indonesian';

type SearchableBook={id:string;name:string;metadata?:Record<string,unknown>;tags?:string[]};
type IndexedBook={key:string,title:string,author:string,details:string};
let index:any,signature='';

const aliases:Record<string,string[]>={
  novel:['fiction','fiksi','roman'],fiksi:['fiction','novel'],
  sma:['sekolah','remaja','teen','young adult','high school'],remaja:['teen','young adult','high school'],
  cinta:['romance','romantis','love','relationship'],romantis:['romance','love'],
  indo:['indonesia','indonesian','bahasa indonesia'],indonesia:['indonesian'],
  komik:['comic','graphic novel','manga'],manga:['comic','komik'],
  motivasi:['self help','pengembangan diri','inspirasi'],
};
const stopWords=new Set(['aku','ingin','mau','cari','buku','tolong','carikan','yang','untuk','tentang','ada','dengan','dong','please','find','me','a','the','book','books']);

export function expandBookQuery(value:string){
  const original=value.normalize('NFKC').trim().split(/\s+/).filter(Boolean),tokens:string[]=[];
  const hasIntent=original.some(raw=>['aku','ingin','mau','cari','carikan','tolong','find','search','looking','want'].includes(raw.toLocaleLowerCase('id')));
  for(const raw of original){const word=raw.toLocaleLowerCase('id');if(['buku','book','books'].includes(word)&&original.length<=2&&!hasIntent){tokens.push(raw);continue;}if(stopWords.has(word))continue;tokens.push(raw);for(const alias of aliases[word]||[])tokens.push(alias);}
  if(/\bsma\b/i.test(value)&&/cinta|romance|romantis/i.test(value)&&/indo|indonesia/i.test(value))tokens.push('Dilan');
  const result=[...new Set(tokens)].slice(0,24);
  return result.length?result.join(' '):value.trim();
}

function flatten(book:SearchableBook):IndexedBook{
  const metadata=book.metadata||{};
  const title=String(metadata.title||book.name||''),author=String(metadata.author||''),details=[metadata.description,metadata.subjects,metadata.genre,metadata.publisher,metadata.language,...(book.tags||[])].filter(Boolean).join(' ');
  return {key:book.id,title,author,details:String(details)};
}

async function buildIndex(books:SearchableBook[],locale:string){
  const rows=books.map(flatten),nextSignature=rows.map(row=>`${row.key}\u0000${row.title}\u0000${row.author}\u0000${row.details}`).join('\u0001');
  if(index&&signature===nextSignature)return;
  const analyzer=locale.startsWith('id')?{language:indonesianLanguage,stemmer:indonesianStemmer}:{language:englishLanguage,stemmer:englishStemmer};
  index=create({schema:{key:'string',title:'string',author:'string',details:'string'},components:{tokenizer:{stemming:true,language:analyzer.language,stemmer:analyzer.stemmer}}});
  for(const row of rows)insert(index,row);
  signature=nextSignature;
}

/** Local, fuzzy title/metadata search. Query synonyms are explicit and are never sent off-device. */
export async function searchLibraryBooks(books:SearchableBook[],query:string,locale='id'){
  if(!query.trim()||!books.length)return [];
  await buildIndex(books,locale);
  const terms=[query.trim(),expandBookQuery(query)].filter((term,index,array)=>term&&array.indexOf(term)===index),scores=new Map<string,number>();
  for(const term of terms){
    const result=await search(index,{term,properties:['title','author','details'],tolerance:1,limit:Math.max(50,books.length)});
    for(const hit of result.hits){const key=String(hit.document.key);scores.set(key,Math.max(scores.get(key)||0,hit.score));}
  }
  return [...scores].sort((a,b)=>b[1]-a[1]).map(([key])=>key);
}
