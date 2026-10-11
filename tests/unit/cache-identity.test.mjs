import test from 'node:test';
import assert from 'node:assert/strict';
import {appCacheIdentity} from '../../scripts/cache-identity.mjs';
test('same-version app edits invalidate cached assets; input order is irrelevant',()=>{
 const before=[['app.js',Buffer.from('first')],['style.css',Buffer.from('paper')]];
 const after=[['app.js',Buffer.from('fixed')],before[1]];
 assert.notEqual(appCacheIdentity('1.7.1',before),appCacheIdentity('1.7.1',after));
 assert.equal(appCacheIdentity('1.7.1',before),appCacheIdentity('1.7.1',[...before].reverse()));
 assert.notEqual(appCacheIdentity('1.7.1',before),appCacheIdentity('1.8.0',before));
 assert.equal(appCacheIdentity('1.7.1',[['app.js',Buffer.from('first\r\nsecond')]]),appCacheIdentity('1.7.1',[['app.js',Buffer.from('first\nsecond')]]));
 assert.notEqual(appCacheIdentity('1.7.1',[['cover.png',Buffer.from('first\r\nsecond')]]),appCacheIdentity('1.7.1',[['cover.png',Buffer.from('first\nsecond')]]));
});
