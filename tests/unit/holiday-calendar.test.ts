import test from 'node:test';
import assert from 'node:assert/strict';
import {loadPublicHolidays} from '../../app/library/holiday-calendar.ts';

test('public holidays load from the country endpoint and use a session cache',async()=>{
  const calls:string[]=[];
  const fetcher=(async(input:URL|string|Request,init?:RequestInit)=>{
    calls.push(String(input));
    assert.equal(init?.credentials,'omit');
    assert.equal(init?.referrerPolicy,'no-referrer');
    return new Response(JSON.stringify([{date:'2099-01-01',localName:'元日',name:"New Year's Day",countryCode:'JP',fixed:true,global:true,counties:null,launchYear:null,types:['Public']}]),{status:200,headers:{'content-type':'application/json'}});
  }) as typeof fetch;
  const result=await loadPublicHolidays(2099,'JP',fetcher);
  assert.equal(result.holidays[0].localName,'元日');
  assert.match(calls[0],/PublicHolidays\/2099\/JP$/);
  const cached=await loadPublicHolidays(2099,'JP',fetcher);
  assert.equal(cached.cached,true);
  assert.equal(calls.length,1);
});

test('invalid holiday years and country codes are rejected before network access',async()=>{
  await assert.rejects(loadPublicHolidays(1800,'JP',fetch),TypeError);
  await assert.rejects(loadPublicHolidays(2099,'JPN',fetch),TypeError);
});
