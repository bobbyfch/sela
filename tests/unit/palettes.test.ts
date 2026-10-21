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

test('all paper and OLED palette accents are unique, readable on their intended surface, and retain motif variety',()=>{
  assert.equal(paletteCatalog.length,9);
  assert.equal(new Set(paletteCatalog.map(palette=>palette.key)).size,9);
  assert.equal(new Set(paletteCatalog.map(palette=>palette.accent)).size,9);
  assert.equal(new Set(paletteCatalog.map(palette=>palette.motif)).size,6);
  for(const palette of paletteCatalog){
    const surface=palette.key==='oled'?'#000000':'#ffffff';
    assert.ok(contrast(palette.accent,surface)>=4.5,`${palette.key} accent contrast is ${contrast(palette.accent,surface).toFixed(2)}:1`);
    assert.notEqual(getPaletteDefinition(palette.key).soft,palette.accent);
  }
});
