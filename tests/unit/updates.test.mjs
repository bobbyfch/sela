import test from 'node:test';
import assert from 'node:assert/strict';
import '../../extension/updates.js';
import {brightness} from '../../src/appearance.js';
test('release checker compares stable semver and rejects untrusted release metadata',async()=>{
 assert.equal(SelaUpdates.newer('v1.10.0','1.9.9'),true);assert.equal(SelaUpdates.newer('v1.1.0','1.1.0'),false);assert.equal(SelaUpdates.newer('v1.2.0-beta','1.1.0'),false);
 let options;const result=await SelaUpdates.check('1.0.0',async(url,config)=>{options=config;return {ok:true,json:async()=>({tag_name:'v1.1.0',html_url:'https://evil.invalid/',draft:false,prerelease:false})};});
 assert.equal(options.credentials,'omit');assert.equal(result.available,true);assert.equal(result.url,'https://github.com/bobbyfch/sela/releases/tag/v1.1.0');
 await assert.rejects(SelaUpdates.check('1.1.0',async()=>({ok:true,json:async()=>({tag_name:'../../malicious'})})),/Invalid/);
 await assert.rejects(SelaUpdates.check('1.1.0',async()=>({ok:false,status:403})),/unavailable/);
});
test('appearance rejects nonfinite brightness and bounds contrast adjustments',()=>{assert.equal(brightness(-10),.35);assert.equal(brightness(10),1.25);assert.throws(()=>brightness(NaN),/finite/);});
