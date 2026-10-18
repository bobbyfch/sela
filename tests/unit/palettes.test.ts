import test from 'node:test';
import assert from 'node:assert/strict';
import {paletteCatalog, getPaletteDefinition} from '../../app/library/themes.ts';

function relativeLuminance(hex:string) {
  const channels=hex.match(/[0-9a-f]{2}/gi)!.map(value=>parseInt(value,16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4);
  return .2126*channels[0]+.7152*channels[1]+.0722*channels[2];
}
function contrast(first:string,second:string) {
  const [light,dark]=[relativeLuminance(first),relativeLuminance(second)].sort((a,b)=>b-a);
  return (light+.05)/(dark+.05);
}

test('all viewer palette accents are unique, white-text readable, and have a distinct motif',()=>{
  assert.equal(paletteCatalog.length,8);
  assert.equal(new Set(paletteCatalog.map(palette=>palette.key)).size,8);
  assert.equal(new Set(paletteCatalog.map(palette=>palette.accent)).size,8);
  assert.equal(new Set(paletteCatalog.map(palette=>palette.motif)).size,8);
  for(const palette of paletteCatalog){
    assert.ok(contrast(palette.accent,'#ffffff')>=4.5,`${palette.key} accent contrast is ${contrast(palette.accent,'#ffffff').toFixed(2)}:1`);
    assert.notEqual(getPaletteDefinition(palette.key).soft,palette.accent);
  }
});
