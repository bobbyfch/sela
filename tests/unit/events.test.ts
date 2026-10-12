import test from 'node:test';
import assert from 'node:assert/strict';
import Sela from '../../src/module.ts';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {mountSelaExtension,readerDiagnostics} from '../../src/host-integration.ts';

test('typed subscriptions dispose, abort, and preserve idempotent reentrant destruction', async () => {
  const viewer=new Sela();const modes: string[]=[];
  const off=viewer.on('modeChanged',detail=>modes.push(detail.mode));
  await viewer.setMode('single');await viewer.setMode('single');off();await viewer.setMode('book');
  assert.deepEqual(modes,['single']);
  const signal=new AbortController();viewer.on('modeChanged',()=>assert.fail('aborted listener fired'),{signal:signal.signal});signal.abort();await viewer.setMode('manga');
  let destroyed=0;viewer.on('destroyed',()=>{destroyed++;viewer.destroy();});viewer.destroy();viewer.destroy();assert.equal(destroyed,1);
});

test('host extension lifetimes release on close, reopen, failure and unmount', () => {
  const viewer=new Sela({url:'/private.pdf?token=secret',httpHeaders:{Authorization:'secret'}});
  let starts=0,cleanups=0,signal: AbortSignal;
  const unmount=mountSelaExtension(viewer,{id:'test',setup(_viewer,abort){starts++;signal=abort;return ()=>cleanups++;}});
  viewer.dispatchEvent(new CustomEvent('ready',{detail:{pages:2}}));
  viewer.dispatchEvent(new CustomEvent('close',{detail:{}}));assert(signal!.aborted);
  viewer.dispatchEvent(new CustomEvent('ready',{detail:{pages:2}}));unmount();unmount();
  assert.equal(starts,2);assert.equal(cleanups,2);
  assert(!JSON.stringify(readerDiagnostics(viewer)).includes('secret'));
  let errors=0;viewer.on('error',()=>errors++);
  const remove=mountSelaExtension(viewer,{id:'bad',setup(){throw new Error('bad extension');}});
  viewer.dispatchEvent(new CustomEvent('ready',{detail:{pages:2}}));assert.equal(errors,1);remove();
});

test('React static components escape untrusted text and attributes', () => {
  const html=renderToStaticMarkup(createElement('p',{title:'"<&'},'<script>bad</script>'));
  assert.equal(html,'<p title="&quot;&lt;&amp;">&lt;script&gt;bad&lt;/script&gt;</p>');
  assert.equal(renderToStaticMarkup(createElement('input',{disabled:true,defaultChecked:false})), '<input disabled=""/>');
});
