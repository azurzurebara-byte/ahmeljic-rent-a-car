import {photos} from './photo-data.js';
export class GallerySelection {
 constructor(){this.file=null;this.index=0;}
 get images(){return photos[this.file]||[];}
 open(file){if(!photos[file]?.length)return false;this.file=file;this.index=0;return true;}
 select(index){const count=this.images.length;if(count)this.index=((index%count)+count)%count;return this.images[this.index];}
 step(direction){return this.select(this.index+direction);}
}
export function createGallery(){
 const $=id=>document.getElementById(id),dialog=$('photo-gallery'),model=new GallerySelection();
 let carName='',opener=null;
 function render(){
  $('gallery-error').hidden=true;
  $('gallery-image').src=model.images[model.index];
  $('gallery-image').alt=`${carName} — stvarna fotografija ${model.index+1} od ${model.images.length}`;
  $('gallery-count').textContent=`${model.index+1} / ${model.images.length}`;
  $('gallery-original').href=model.images[model.index];
  $('gallery-prev').disabled=$('gallery-next').disabled=model.images.length<=1;
  [...$('gallery-thumbs').children].forEach((button,i)=>{button.setAttribute('aria-current',String(i===model.index));});
 }
 const navigate=direction=>{model.step(direction);render();};
 $('gallery-prev').addEventListener('click',()=>navigate(-1));$('gallery-next').addEventListener('click',()=>navigate(1));
 $('gallery-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{document.body.classList.remove('gallery-open');opener?.focus();});
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
 dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();navigate(event.key==='ArrowRight'?1:-1);}});
 $('gallery-image').addEventListener('error',()=>{$('gallery-error').hidden=false;});
 return {open(car){
  if(!model.open(car.file))return;
  opener=document.activeElement;carName=car.name;$('gallery-title').textContent=carName;$('gallery-thumbs').replaceChildren();
  model.images.forEach((src,i)=>{const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',`Prikaži fotografiju ${i+1}`);const img=document.createElement('img');img.src=src;img.alt='';img.loading='lazy';button.append(img);button.addEventListener('click',()=>{model.select(i);render();});$('gallery-thumbs').append(button);});
  render();document.body.classList.add('gallery-open');dialog.showModal();
 }};
}
