'use client';
import {useEffect, useRef, useState} from 'react';
import type {Sela} from '@bobbyfch/sela';

/** Import on the client and dispose even when a lazy import resolves after unmount. */
export function SelaButton({url,assetBase}: {url: string;assetBase?:string}) {
  const viewer=useRef<Sela | null>(null);const [ready,setReady]=useState(false);
  useEffect(()=>{
    let mounted=true;setReady(false);
    void import('@bobbyfch/sela').then(({default: Sela})=>{
      if(mounted){viewer.current=new Sela({url,assetBase});setReady(true);}
    });
    return ()=>{mounted=false;viewer.current?.destroy();viewer.current=null;};
  },[url,assetBase]);
  return <button type="button" disabled={!ready} onClick={()=>{void viewer.current?.open().catch(error=>{if(error.name!=='AbortError')console.error('Reader could not open');});}}>Read document</button>;
}
