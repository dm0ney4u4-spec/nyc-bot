import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {handleStaffPrompt,staffPromptPayload,staffPrompts,promptRoleId,promptBanner} from '../apps/bot/src/staff-prompts.js';
import {ids} from '../config/ids.js';

function fixture(content:string, authorized=true) {
 const events:string[]=[],payloads:any[]=[];
 const message:any={content,guildId:ids.guildId,author:{id:'issuer',bot:false,send:async()=>events.push('dm')},id:'123456789',deletable:true,guild:{members:{fetch:async(options:any)=>{assert.equal(options.force,true);return{roles:{cache:new Set(authorized?[promptRoleId]:[])}};}}},channel:{isSendable:()=>true,send:async(payload:any)=>{events.push('sent');payloads.push(payload);}},delete:async()=>events.push('deleted')};
 return{message,events,payloads};
}
test('all requested prompts use white embeds, supplied artwork and no pings',()=>{
 assert.ok(fs.existsSync(promptBanner));
 for(const name of Object.keys(staffPrompts) as (keyof typeof staffPrompts)[]) {const p=staffPromptPayload(name),embed=p.embeds[0].toJSON();assert.equal(embed.color,0xFFFFFF);assert.match(embed.description!,/1572797767557062885/);assert.equal(embed.image?.url,'attachment://nyc-applications.png');assert.deepEqual(p.allowedMentions.parse,[]);}
 assert.match(staffPrompts.application,/10\. Two players/);
});
test('authorized prefix commands post once before deleting the trigger',async()=>{
 for(const command of ['!fastpass','!transfer','!application',' !APPLICATION ']) {const f=fixture(command);assert.equal(await handleStaffPrompt(f.message),true);assert.deepEqual(f.events,['sent','deleted']);assert.equal(f.payloads[0].nonce,f.message.id);}
});
test('ordinary users, wrong guild, bots and unrelated commands cannot post prompts',async()=>{
 const denied=fixture('!application',false);await handleStaffPrompt(denied.message);assert.deepEqual(denied.events,[]);
 for(const change of [{guildId:'other'},{content:'!application extra'},{author:{bot:true}},{webhookId:'webhook'}]) {const f=fixture('!application');Object.assign(f.message,change);assert.equal(await handleStaffPrompt(f.message),false);assert.deepEqual(f.events,[]);}
});
test('missing deletion permissions or failed posting preserve the trigger',async()=>{
 const f=fixture('!transfer');f.message.deletable=false;await handleStaffPrompt(f.message);assert.deepEqual(f.events,['dm']);
 const g=fixture('!fastpass');g.message.channel.send=async()=>{throw Error('Discord unavailable');};await assert.rejects(()=>handleStaffPrompt(g.message));assert.deepEqual(g.events,[]);
});
