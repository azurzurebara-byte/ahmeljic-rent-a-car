// One immutable street, one independently moving car. Requests are serialized;
// a rapid selection always settles on the last requested vehicle.
export class CarScene {
 constructor(adapter,onStatus){this.view=adapter;this.onStatus=onStatus;this.current=null;this.desired=0;this.task=null;this.motion=true;this.replayRequested=false;this.failed=false;}
 get busy(){return this.task!==null;}
 select(index){this.desired=index;return this.start();}
 replay(){this.replayRequested=true;return this.start();}
 retry(){return this.start();}
 setMotion(enabled){this.motion=enabled;if(!enabled)this.view.finish?.();}
 start(){if(this.task)return this.task;this.task=this.run().finally(()=>{this.task=null;this.onStatus(this.failed?'error':'parked',this.current);});return this.task;}
 async run(){
  this.failed=false;
  try{
   while(this.current!==this.desired||this.replayRequested){
    let target=this.desired;
    this.onStatus('loading',target);await this.view.prepare(target);
    if(target!==this.desired)continue;
    this.replayRequested=false;
    if(this.current!==null){this.onStatus('leaving',this.current);await this.view.leave(this.motion);this.current=null;}
    // A request can change while the previous vehicle is driving off.
    while(target!==this.desired){target=this.desired;this.onStatus('loading',target);await this.view.prepare(target);}
    this.onStatus('arriving',target);await this.view.enter(target,this.motion);this.current=target;
   }
  }catch{this.failed=true;this.view.finish?.();}
 }
}

export class StreetView {
 constructor(stage,cars){this.stage=stage;this.cars=cars;this.images=new Map();this.vehicle=null;this.animation=null;}
 async prepare(index){
  if(!this.images.has(index)){
   const img=new Image();img.src=`assets/cutouts/${this.cars[index].file}.png`;img.alt=this.cars[index].name;img.draggable=false;
   this.images.set(index,img);
  }
  const img=this.images.get(index);
  let timer;
  try{await Promise.race([img.decode(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Image timeout')),15000);})]);}
  catch(error){this.images.delete(index);throw error;}
  finally{clearTimeout(timer);}
 }
 async animate(element,keyframes,options){
  if(!element.animate)return;
  this.animation=element.animate(keyframes,{...options,fill:'both'});
  try{await this.animation.finished;}finally{this.animation?.cancel();this.animation=null;}
 }
 async enter(index,motion){
  const car=this.cars[index];const el=document.createElement('div');el.className='vehicle';
  el.style.width=car.file==='kombajn'?'57%':'49%';el.style.left=car.file==='kombajn'?'35%':'42%';
  const shadow=document.createElement('div');shadow.className='vehicle-shadow';shadow.setAttribute('aria-hidden','true');
  el.append(shadow,this.images.get(index));this.stage.append(el);this.vehicle=el;
  if(motion)await this.animate(el,[{transform:'translate(150%, -18%) scale(.76)'},{transform:'translate(0, 0) scale(1)'}],{duration:1550,easing:'cubic-bezier(.16,.65,.24,1)'});
 }
 async leave(motion){
  if(!this.vehicle)return;const el=this.vehicle;
  if(motion)await this.animate(el,[{transform:'translate(0, 0) scale(1)'},{transform:'translate(-250%, 18%) scale(1.12)'}],{duration:1150,easing:'cubic-bezier(.55,0,.8,.45)'});
  el.remove();this.vehicle=null;
 }
 finish(){this.animation?.finish();}
}
