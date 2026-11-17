import test from 'node:test';
import assert from 'node:assert/strict';
import {CarScene} from './dist/video-controller.js';
class Video extends EventTarget {
 constructor(){super();this.time=0;this.duration=1;this.paused=true;this.classes=new Set();this.classList={toggle:(s,on)=>on?this.classes.add(s):this.classes.delete(s)};}
 setAttribute(){}
 get currentTime(){return this.time;}
 set currentTime(t){this.time=t;queueMicrotask(()=>this.dispatchEvent(new Event('seeked')));}
 load(){this.time=0;setTimeout(()=>this.dispatchEvent(new Event(this.fail?'error':'loadeddata')),1);}
 pause(){this.paused=true;}
 play(){if(this.block)return Promise.reject(new Error('autoplay blocked'));this.paused=false;return Promise.resolve();}
 requestVideoFrameCallback(callback){return setTimeout(()=>{if(!this.paused)this.time+=.05;callback();},1);}
 cancelVideoFrameCallback(id){clearTimeout(id);}
}
const cars=['golf','seat','mazda'].map(file=>({file,name:file,stop:.2,depart:.2}));
const delay=ms=>new Promise(r=>setTimeout(r,ms));
test('parks indefinitely and leaves only after a new choice',async()=>{const players=[new Video(),new Video()],s=new CarScene(players,cars,()=>{});await s.select(0);assert.equal(s.active.currentTime,.2);await delay(30);assert.equal(s.active.currentTime,.2);assert(s.active.paused);await s.select(1);assert.equal(s.current,1);assert.equal(s.active.currentTime,.2);assert.equal(players.filter(v=>v.classes.has('visible')).length,1);});
test('rapid selections finish on latest selection',async()=>{const s=new CarScene([new Video(),new Video()],cars,()=>{});await s.select(0);const run=s.select(1);await delay(4);s.select(2);s.select(0);s.select(2);await run;assert.equal(s.current,2);assert(s.active.paused);});
test('selection during initial arrival is preserved',async()=>{const s=new CarScene([new Video(),new Video()],cars,()=>{});const run=s.select(0);s.select(2);await run;assert.equal(s.current,2);});
test('reduced motion seeks straight to parked frame',async()=>{const players=[new Video(),new Video()];players.forEach(v=>v.block=true);const s=new CarScene(players,cars,()=>{},{reducedMotion:true});await s.select(0);await s.select(2);assert.equal(s.current,2);assert.equal(s.failed,false);assert.equal(s.active.currentTime,.2);});
test('load errors can recover with retry',async()=>{const players=[new Video(),new Video()];players[0].fail=true;const s=new CarScene(players,cars,()=>{});await s.select(0);assert(s.failed);assert(!s.busy);players[0].fail=false;await s.retry();assert.equal(s.current,0);assert(!s.failed);});
test('autoplay rejection is reported, then recovers',async()=>{const players=[new Video(),new Video()];players[0].block=true;const s=new CarScene(players,cars,()=>{});await s.select(0);assert(s.failed);players[0].block=false;await s.retry();assert(!s.failed);assert.equal(s.active.currentTime,.2);});
