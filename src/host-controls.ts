import type { Sela, SelaSource } from './public-api.ts';
export interface ReaderAnnotation {id:string;page:number;text:string;note?:string}
export interface ReaderStorage {
  read(key:string,signal:AbortSignal):Promise<readonly ReaderAnnotation[]>;
  write(key:string,annotations:readonly ReaderAnnotation[],signal:AbortSignal):Promise<void>;
}
export type TextService = (text:string,signal:AbortSignal)=>Promise<string>;
export interface DocumentLoader {id:string;accepts(source:SelaSource):boolean;load(source:SelaSource,signal:AbortSignal):Promise<SelaSource>}
export interface RendererAdapter {
  id:string;accepts(source:SelaSource):boolean;
  /** Host renderers use their own container; they never replace internal SDK methods. */
  mount(container:HTMLElement,source:SelaSource,signal:AbortSignal):Promise<()=>void>;
}
export interface ReaderHostOptions {
  container?:HTMLElement;loaders?:readonly DocumentLoader[];renderers?:readonly RendererAdapter[];
  storage?:ReaderStorage;documentKey?:string;dictionary?:TextService;translation?:TextService;
}
export interface ReaderCommand {id:string;label:string;run(context:{viewer:Sela;page:number;text:string;signal:AbortSignal}):void|Promise<void>}
const abortError=()=>new DOMException('Reader host cancelled','AbortError');
/** Host data/providers are opt-in. No tokens or document contents enter diagnostics. */
export function createReaderHost(viewer:Sela,options:ReaderHostOptions={}) {
  let controller=new AbortController(),generation=0,disposeRenderer:(()=>void)|undefined,destroyed=false;
  const release=()=>{controller.abort();controller=new AbortController();const cleanup=disposeRenderer;disposeRenderer=undefined;cleanup?.();};
  const unsubscribe=viewer.on('destroyed',()=>{destroyed=true;generation++;release();});
  async function text(service:TextService|undefined){if(destroyed)throw abortError();if(!service)throw new Error('Text service is not configured');const signal=controller.signal;const selected=options.container?.ownerDocument.getSelection()?.toString().trim()||await viewer.getText();if(signal.aborted)throw abortError();return service(selected.slice(0,10000),signal);}
  return {
    async open(source:SelaSource){
      if(destroyed)throw abortError();const run=++generation;release();const signal=controller.signal;
      const loader=options.loaders?.find(item=>item.accepts(source));const resolved=loader?await loader.load(source,signal):source;
      if(signal.aborted||run!==generation)throw abortError();
      const renderer=options.renderers?.find(item=>item.accepts(resolved));
      if(renderer){if(!options.container)throw new Error('Custom renderer requires a host container');viewer.close();const cleanup=await renderer.mount(options.container,resolved,signal);if(signal.aborted||run!==generation){cleanup();throw abortError();}disposeRenderer=cleanup;return {renderer:renderer.id};}
      await viewer.open(resolved);if(signal.aborted||run!==generation)throw abortError();return {renderer:'universal'};
    },
    dictionary:()=>text(options.dictionary),translation:()=>text(options.translation),
    async annotations(){if(destroyed)throw abortError();if(!options.storage||!options.documentKey)throw new Error('Annotation storage and documentKey are required');return options.storage.read(options.documentKey,controller.signal);},
    async saveAnnotations(values:readonly ReaderAnnotation[]){if(destroyed)throw abortError();if(!options.storage||!options.documentKey)throw new Error('Annotation storage and documentKey are required');if(values.length>10000||values.some(item=>!Number.isInteger(item.page)||item.page<1||item.text.length>10000||(item.note?.length||0)>10000))throw new RangeError('Annotation safety limit exceeded');await options.storage.write(options.documentKey,values,controller.signal);},
    close(){generation++;release();viewer.close();},
    destroy(){if(destroyed)return;destroyed=true;generation++;unsubscribe();release();},
  };
}
/** Custom toolbars/context menus share one command contract and disposable lifetime. */
export function mountReaderCommands(viewer:Sela,container:HTMLElement,commands:readonly ReaderCommand[],kind:'toolbar'|'context-menu'='toolbar') {
  const lifetime=new AbortController();const group=document.createElement('div');group.className='sela-host-commands';group.setAttribute('role','group');group.setAttribute('aria-label',kind==='toolbar'?'Reader actions':'Selection actions');
  for(const command of commands){const button=document.createElement('button');button.type='button';button.textContent=command.label;button.dataset.command=command.id;button.onclick=async()=>{if(button.disabled||lifetime.signal.aborted)return;button.disabled=true;try{const text=document.getSelection()?.toString()||'';await command.run({viewer,page:viewer.currentPage(),text:text.slice(0,10000),signal:lifetime.signal});}catch(error){if(!lifetime.signal.aborted)viewer.dispatchEvent(new CustomEvent('error',{detail:{error:error instanceof Error?error:new Error('Reader command failed')}}));}finally{button.disabled=false;}};group.append(button);}
  container.append(group);if(kind==='context-menu'){group.hidden=true;container.addEventListener('contextmenu',event=>{if(!document.getSelection()?.toString())return;event.preventDefault();group.hidden=false;group.querySelector('button')?.focus();},{signal:lifetime.signal});container.addEventListener('keydown',event=>{if(event.key==='Escape')group.hidden=true;},{signal:lifetime.signal});}
  const close=viewer.on('close',()=>{if(kind==='context-menu')group.hidden=true;});const destroyed=viewer.on('destroyed',dispose);
  function dispose(){lifetime.abort();close();destroyed();group.remove();}return dispose;
}
export function mountReaderDebug(viewer:Sela,container:HTMLElement) {
  const start=performance.now();let loading=false,renderer='pending',errors=0,events=0,readyMs:number|null=null;
  const panel=document.createElement('output');panel.className='sela-debug-panel';panel.setAttribute('aria-label','Reader diagnostics');container.append(panel);
  const update=()=>{panel.textContent=JSON.stringify({version:(viewer.constructor as typeof Sela).version,renderer,loading,workerPolicy:renderer==='epub'||renderer==='cbz'||renderer==='docx'||renderer==='odt'?'archive worker with bounded fallback':renderer==='pdf'?'PDF.js worker':'not required',errors,events,readyMs,page:viewer.currentPage(),pages:viewer.totalPages,mode:viewer.options.mode,open:!!viewer.overlay},null,2);};
  const subscriptions=[viewer.on('loading',detail=>{events++;loading=detail.loading;update();}),viewer.on('documentLoaded',detail=>{events++;renderer=detail.format;update();}),viewer.on('ready',()=>{events++;readyMs=Math.round(performance.now()-start);update();}),viewer.on('pageChanged',()=>{events++;update();}),viewer.on('modeChanged',()=>{events++;update();}),viewer.on('error',()=>{events++;errors++;update();}),viewer.on('close',()=>{events++;update();}),viewer.on('destroyed',dispose)];
  function dispose(){subscriptions.forEach(off=>off());panel.remove();}update();return dispose;
}
