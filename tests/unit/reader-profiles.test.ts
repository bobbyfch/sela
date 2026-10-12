import test from 'node:test';
import assert from 'node:assert/strict';
import {validateProfiles,mergeProfiles} from '../../app/library/reader-profiles.ts';

test('reading profiles whitelist settings, bound resource use and keep local conflicts',()=>{
 const local=[{name:' Daily ',values:{fontSize:999,mode:'single',url:'https://unwanted.invalid',theme:'dark'}}];
 assert.deepEqual(validateProfiles(local),[{name:'Daily',values:{fontSize:36,mode:'single'}}]);
 assert.deepEqual(mergeProfiles(local,[{name:'Daily',values:{fontSize:12}},{name:'New',values:{lineHeight:1.7}}]),[{name:'Daily',values:{fontSize:36,mode:'single'}},{name:'New',values:{lineHeight:1.7}}]);
 for(const invalid of [null,{},[{name:'',values:{fontSize:20}}],[{name:'x',values:{brightness:Infinity}}],[{name:'x',values:[]}],[{name:'x',values:{fontSize:20}},{name:' x ',values:{fontSize:18}}]])assert.throws(()=>validateProfiles(invalid));
 const full=Array.from({length:20},(_,i)=>({name:'Profile '+i,values:{fontSize:20}}));assert.throws(()=>mergeProfiles(full,[{name:'Extra',values:{mode:'single'}}]));
});
