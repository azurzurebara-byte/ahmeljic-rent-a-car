// Each clip contains an arrival, a parked frame, and a departure.
// Selection requests are coalesced; only one transition owns the two players.
export class CarScene {
  constructor(players,cars,onStatus,{reducedMotion=false}={}) {
    this.players=players;this.cars=cars;this.onStatus=onStatus;
    this.reducedMotion=reducedMotion;this.current=null;this.desired=0;
    this.active=players[0];this.busy=false;this.failed=false;
    for(const v of players){v.muted=true;v.playsInline=true;}
  }
  select(index){this.desired=index;return this.run();}
  async prepare(video,car){
    video.pause();video.src=`assets/${car.file}.mp4`;video.poster=`assets/${car.file}-poster.jpg`;
    await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>done(new Error('load timeout')),20000);
      const done=error=>{clearTimeout(timer);video.removeEventListener('loadeddata',loaded);video.removeEventListener('error',failed);error?reject(error):resolve();};
      const loaded=()=>done();const failed=()=>done(new Error('video load failed'));
      video.addEventListener('loadeddata',loaded);video.addEventListener('error',failed);video.load();
    });
  }
  async seek(video,time){
    if(Math.abs(video.currentTime-time)<0.015)return;
    await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>done(new Error('seek timeout')),12000);
      const done=error=>{clearTimeout(timer);video.removeEventListener('seeked',ready);video.removeEventListener('error',failed);error?reject(error):resolve();};
      const ready=()=>done(),failed=()=>done(new Error('seek failed'));
      video.addEventListener('seeked',ready);video.addEventListener('error',failed);video.currentTime=time;
    });
  }
  async playUntil(video,time){
    await new Promise((resolve,reject)=>{
      let frame,timer;const target=Math.min(time,video.duration-0.06);
      const cleanup=()=>{clearTimeout(timer);if(frame!==undefined){if(video.requestVideoFrameCallback)video.cancelVideoFrameCallback(frame);else cancelAnimationFrame(frame);}video.removeEventListener('timeupdate',check);video.removeEventListener('ended',ended);video.removeEventListener('error',failed);};
      const done=error=>{cleanup();video.pause();error?reject(error):resolve();};
      const check=()=>{if(video.currentTime>=target-0.025)done();};
      const tick=()=>{if(video.currentTime>=target-0.025){done();return;}frame=video.requestVideoFrameCallback?video.requestVideoFrameCallback(tick):requestAnimationFrame(tick);};
      const ended=()=>done(),failed=()=>done(new Error('playback failed'));
      timer=setTimeout(()=>done(new Error('playback timeout')),25000);
      video.addEventListener('timeupdate',check);video.addEventListener('ended',ended);video.addEventListener('error',failed);
      frame=video.requestVideoFrameCallback?video.requestVideoFrameCallback(tick):requestAnimationFrame(tick);
      video.play().catch(done);
    });
    await this.seek(video,Math.min(time,video.duration-0.06));
  }
  show(video){for(const v of this.players){v.classList.toggle('visible',v===video);v.setAttribute('aria-hidden',String(v!==video));}this.active=video;}
  async run(){
    if(this.busy)return;this.busy=true;this.failed=false;
    try {
      if(this.current===null){
        const index=this.desired,car=this.cars[index];this.onStatus('Dolazi '+car.name+'…');
        await this.prepare(this.active,car);this.show(this.active);
        if(this.reducedMotion)await this.seek(this.active,car.stop);else await this.playUntil(this.active,car.stop);
        this.current=index;
      }
      while(this.desired!==this.current){
        const index=this.desired,car=this.cars[index],next=this.players.find(v=>v!==this.active);
        this.onStatus('Pripremamo '+car.name+'…');await this.prepare(next,car);
        // If the user changed their mind during loading, skip the stale request.
        if(index!==this.desired)continue;
        if(!this.reducedMotion){
          this.onStatus('Trenutni automobil odlazi…');
          const old=this.cars[this.current];
          if(old.depart>this.active.currentTime)await this.seek(this.active,old.depart);
          await this.playUntil(this.active,this.active.duration-0.06);
        }
        if(this.reducedMotion)await this.seek(next,car.stop);
        this.show(next);this.current=index;
        if(!this.reducedMotion){this.onStatus('Dolazi '+car.name+'…');await this.playUntil(next,car.stop);}
      }
      this.onStatus(this.cars[this.current].name+' · Tvoj sljedeći kilometar');
    } catch(error){
      this.failed=true;for(const v of this.players)v.pause();
      this.onStatus('Video nije spreman. Pokušaj ponovo.',true);
    } finally {this.busy=false;}
  }
  retry(){this.current=null;return this.run();}
}
