import test from 'node:test';
import assert from 'node:assert/strict';
import {readingPreferences} from '../../src/preferences.js';

test('persisted settings whitelist mode and typography, bound values and omit secrets',()=>{
 assert.deepEqual(readingPreferences({mode:'scroll',fit:'width',brightness:Infinity,fontSize:100,lineHeight:-3,textMargin:-4,cropMargin:80,fontFamily:'sans',textAlign:'justify',lowPower:true,httpHeaders:{Authorization:'secret'},unknown:true}),{mode:'scroll',fit:'width',fontSize:36,lineHeight:1.2,textMargin:0,cropMargin:15,lowPower:true,fontFamily:'sans',textAlign:'justify'});
 assert.deepEqual(readingPreferences({mode:'invalid',fit:'invalid',filter:'constructor',fontSize:'24',dim:'true'}),{});
 assert.deepEqual(readingPreferences(null),{});
});
