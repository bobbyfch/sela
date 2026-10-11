// Android content providers often omit MIME types or usable extensions.
// File contents decide binary formats; extension is only a text-format hint.
export async function detectBookFormat(file,data) {
  if(!file.size||file.size>64*1048576)throw Error('Choose a non-empty book up to 64 MiB.');
  const header=data?new Uint8Array(data,0,Math.min(512,data.byteLength)):new Uint8Array(await file.slice(0,512).arrayBuffer());
  const prefix=new TextDecoder().decode(header),ext=(file.name||'').split('.').pop().toLowerCase();
  if(prefix.startsWith('%PDF-'))return 'pdf';
  if(header[0]===80&&header[1]===75){
    const {extractArchive,validateEpub}=await import('../dist/js/sela.archive.js');
    const files=extractArchive(new Uint8Array(data||await file.arrayBuffer()));
    if(files['word/document.xml']&&files['[Content_Types].xml'])return 'docx';
    if(files['content.xml']&&new TextDecoder().decode(files.mimetype||new Uint8Array()).trim()==='application/vnd.oasis.opendocument.text')return 'odt';
    if(files['META-INF/container.xml']){
      validateEpub(files);
      return 'epub';
    }
    if(Object.keys(files).some(name=>/\.(png|jpe?g|gif|webp|avif)$/i.test(name)))return 'cbz';
    throw Error('This ZIP is not an EPUB or image comic.');
  }
  if(['pdf','epub','cbz','docx','odt'].includes(ext))throw Error('File contents do not match '+ext.toUpperCase()+'.');
  if(header.includes(0))throw Error('Unsupported binary document.');
  if(/<FictionBook[\s>]/i.test(prefix)||ext==='fb2')return 'fb2';
  if(/<!doctype html|<html[\s>]/i.test(prefix)||['html','htm'].includes(ext))return 'html';
  if(ext==='md')return 'md';
  if(ext==='txt'||/^text\/plain/i.test(file.type||''))return 'txt';
  throw Error('Supported: PDF, EPUB, CBZ, TXT, MD, HTML, FB2, DOCX and ODT.');
}
