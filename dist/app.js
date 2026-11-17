import {CarScene} from './video-controller.js';
export const cars=[
 {name:'Volkswagen Golf Plus',make:'Volkswagen',category:'Kompakt',body:'Monovolumen',file:'golf',price:65,stop:3.15,depart:3.15,description:'Više prostora za svakodnevne planove. Tvoj praktični saputnik.'},
 {name:'Seat Leon',make:'Seat',category:'Gradski izbor',body:'Hatchback',file:'seat',price:60,stop:2.1,depart:2.1,description:'Kompaktan, upečatljiv i spreman za tvoju sljedeću destinaciju.'},
 {name:'Mazda CX-5',make:'Mazda',category:'SUV',body:'SUV',file:'mazda',price:90,stop:2.1,depart:2.1,description:'Promijeni perspektivu. Više prostora za putovanja izvan rutine.'},
 {name:'Volkswagen Passat',make:'Volkswagen',category:'Za duži put',body:'Karavan',file:'passat',price:100,stop:2.1,depart:2.1,description:'Za planove koji traže više prostora i još koji kilometar.'},
 {name:'Volkswagen Jetta',make:'Volkswagen',category:'Limuzina',body:'Limuzina',file:'jetta',price:75,stop:2.9,depart:4.4,description:'Klasične linije za poslovni put ili opušten vikend.'},
 {name:'Peugeot 308 CC',make:'Peugeot',category:'Kabriolet',body:'Kabriolet',file:'pezo',price:50,stop:2.9,depart:4.4,description:'Malo sunca, otvoren krov i put kojim se rado ide.'},
 {name:'Volkswagen Kombi',make:'Volkswagen',category:'Kombajn',body:'Kombi',file:'kombajn',price:null,stop:2.9,depart:4.4,description:'Za velike planove. Neke stvari jednostavno nemaju cijenu.'}
];
const $=id=>document.getElementById(id),select=$('car-select'),pickup=$('pickup'),dropoff=$('return');
const money=value=>value===null?'Priceless':new Intl.NumberFormat('bs-BA').format(value)+' KM';
const price=car=>money(car.price)+(car.price===null?'':' / dan');
const scene=new CarScene([$('video-a'),$('video-b')],cars,(text,failed=false)=>{$('scene-status').textContent=text;$('retry').hidden=!failed;},{reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches});
cars.forEach((car,index)=>{
 const option=document.createElement('option');option.value=index;option.textContent=car.name;select.append(option);
 const article=document.createElement('article');article.className='fleet-card';
 const button=document.createElement('button');button.type='button';button.setAttribute('aria-label','Odaberi '+car.name);
 button.innerHTML=`<img src="assets/${car.file}-poster.jpg" alt="${car.name}" loading="lazy" width="640" height="426"><h3>${car.name}</h3><p>${car.category}<span>${price(car)}</span></p>`;
 button.addEventListener('click',()=>{select.value=index;update();$('izbor').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});article.append(button);$('fleet-grid').append(article);
});
function dayValue(value){return Date.parse(value+'T00:00:00Z');}
function localISO(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
function plusDay(value){const d=new Date(value+'T12:00:00');d.setDate(d.getDate()+1);return localISO(d);}
pickup.min=localISO(new Date());pickup.value=pickup.min;dropoff.min=plusDay(pickup.value);dropoff.value=dropoff.min;
function days(){return Math.round((dayValue(dropoff.value)-dayValue(pickup.value))/86400000);}
function estimate(){const count=days(),car=cars[Number(select.value)];dropoff.setCustomValidity(count<1?'Povrat mora biti nakon preuzimanja.':'');$('estimate').textContent=count>=1?`${count} ${count===1?'dan':'dana'} · ${car.price===null?'Priceless':money(count*car.price)} ukupno`:'Odaberi datume najma.';}
function update(){const index=Number(select.value),car=cars[index];for(const [id,value] of Object.entries({'car-name':car.name,'car-category':car.category,'car-description':car.description,'car-make':car.make,'car-body':car.body,'car-price':money(car.price),'car-number':String(index+1).padStart(2,'0')}))$(id).textContent=value;estimate();scene.select(index);}
select.addEventListener('change',update);pickup.addEventListener('change',()=>{if(pickup.value){dropoff.min=plusDay(pickup.value);if(dropoff.value<=pickup.value)dropoff.value=dropoff.min;}estimate();});dropoff.addEventListener('change',estimate);
$('retry').addEventListener('click',()=>scene.retry());
$('rental-form').addEventListener('submit',event=>{event.preventDefault();estimate();if(!$('rental-form').reportValidity())return;const car=cars[Number(select.value)],format=value=>new Intl.DateTimeFormat('bs-BA',{dateStyle:'medium'}).format(new Date(value+'T12:00:00'));$('summary-content').replaceChildren();for(const line of [car.name,`${format(pickup.value)} — ${format(dropoff.value)}`,`${days()} ${days()===1?'dan':'dana'} · ${car.price===null?'Priceless':money(days()*car.price)}`]){const p=document.createElement('p');p.textContent=line;$('summary-content').append(p);}$('summary').showModal();});
document.querySelectorAll('.close,.close-summary').forEach(button=>button.addEventListener('click',()=>$('summary').close()));
update();
