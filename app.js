import {CarScene, StreetView} from './car-scene.js?v=7';
import {photos} from './photo-data.js';
import {createGallery} from './gallery.js?v=7';

// KONTAKT. Brojevi su prepisani s tablica "Ahmeljić Auto" na fotografijama vozila.
// whatsapp / viber: samo cifre s pozivnim brojem države. Prazan tekst ('') sakriva tu opciju.
export const contact = {
  phones: ['061 762 218', '062 351 900'],
  whatsapp: '38761762218',
  viber: '38761762218',
};

// VOZILA. Cijena je u KM po danu; null znači "Priceless".
export const cars = [
  {name: 'Volkswagen Golf Plus', make: 'Volkswagen', category: 'Kompakt', body: 'Monovolumen', file: 'golf', price: 65, description: 'Više prostora za svakodnevne planove. Tvoj praktični saputnik.'},
  {name: 'Seat Leon', make: 'Seat', category: 'Gradski izbor', body: 'Hatchback', file: 'seat', price: 60, description: 'Kompaktan, upečatljiv i spreman za tvoju sljedeću destinaciju.'},
  {name: 'Mazda CX-5', make: 'Mazda', category: 'SUV', body: 'SUV', file: 'mazda', price: 90, description: 'Promijeni perspektivu. Više prostora za putovanja izvan rutine.'},
  {name: 'Volkswagen Passat', make: 'Volkswagen', category: 'Za duži put', body: 'Karavan', file: 'passat', price: 100, description: 'Za planove koji traže više prostora i još koji kilometar.'},
  {name: 'Volkswagen Jetta', make: 'Volkswagen', category: 'Limuzina', body: 'Limuzina', file: 'jetta', price: 75, description: 'Klasične linije za poslovni put ili opušten vikend.'},
  {name: 'Peugeot 308 CC', make: 'Peugeot', category: 'Kabriolet', body: 'Kabriolet', file: 'pezo', price: 50, description: 'Malo sunca, otvoren krov i put kojim se rado ide.'},
  {name: 'Volkswagen Kombi', make: 'Volkswagen', category: 'Kombajn', body: 'Kombi', file: 'kombajn', price: null, description: 'Za velike planove. Neke stvari jednostavno nemaju cijenu.'},
];

const $ = id => document.getElementById(id);
const select = $('car-select'), pickup = $('pickup'), dropoff = $('return');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const el = (tag, props = {}, ...children) => {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
};

const money = value => value === null ? 'Priceless' : new Intl.NumberFormat('de-DE').format(value) + ' KM';
const perDay = car => money(car.price) + (car.price === null ? '' : ' / dan');
// Bosnian: 1 dan, 21 dan, 31 dan; everything else (2, 5, 11, 14...) dana.
const dayWord = count => count % 10 === 1 && count % 100 !== 11 ? 'dan' : 'dana';
const telHref = phone => 'tel:+387' + phone.replace(/\D/g, '').replace(/^0/, '');
const currentCar = () => cars[Number(select.value)];

/* ---------- Street scene ---------- */
const gallery = createGallery();
const stage = $('street-stage');
const view = new StreetView(stage, cars);
const scene = new CarScene(view, (state, index) => {
  const name = cars[index]?.name || '';
  const messages = {
    loading: 'Pripremamo ' + name + '…',
    leaving: name + ' odlazi…',
    arriving: 'Dolazi ' + name + '…',
    parked: name + ' · Odaberi auto za sljedeći put',
    error: 'Slika vozila nije učitana. Pokušaj ponovo.',
  };
  $('scene-status').textContent = messages[state];
  $('retry').hidden = state !== 'error';
  $('replay-scene').disabled = state !== 'parked' && state !== 'error';
});

// The street and the car share ONE coordinate plane that covers the scene, so they stay aligned at
// every size. Side-by-side layout keeps the car right of the form; on phones the car sits in the middle.
const container = document.querySelector('.scene');
const stacked = matchMedia('(max-width: 1050px)'), phone = matchMedia('(max-width: 700px)');
const RATIO = 1672 / 941, CAR_CENTER = .66;
function layoutStage() {
  const w = container.clientWidth, h = container.clientHeight;
  let sw = Math.max(w, h * RATIO);
  if (phone.matches) sw = Math.max(sw, w / (2 * (1 - CAR_CENTER)));
  const sh = sw / RATIO;
  const left = stacked.matches ? Math.min(0, Math.max(w - sw, w / 2 - CAR_CENTER * sw)) : (w - sw) * .65;
  const top = (h - sh) * (phone.matches ? 1 : stacked.matches ? .8 : .5);
  Object.assign(stage.style, {width: sw + 'px', height: sh + 'px', left: left + 'px', top: top + 'px'});
}
new ResizeObserver(layoutStage).observe(container);

/* ---------- Fleet cards ---------- */
function pick(index) {
  select.value = index;
  update();
  $('izbor').scrollIntoView({behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  select.focus({preventScroll: true});
}
cars.forEach((car, index) => {
  select.append(el('option', {value: index, textContent: car.name}));

  const image = el('img', {src: `assets/cutouts/${car.file}-640.webp`, alt: '', loading: 'lazy', width: 640, height: 360});
  const pickButton = el('button', {type: 'button', className: 'card-pick', textContent: 'Odaberi'});
  pickButton.setAttribute('aria-label', 'Odaberi ' + car.name);
  pickButton.addEventListener('click', () => pick(index));
  const actions = el('div', {className: 'card-actions'}, pickButton);

  const count = photos[car.file]?.length || 0;
  if (count) {
    const photoButton = el('button', {type: 'button', className: 'photo-button'},
      el('span', {className: 'photo-label', textContent: 'Fotografije'}), `(${count})`);
    photoButton.setAttribute('aria-label', `Stvarne fotografije (${count}): ${car.name}`);
    photoButton.addEventListener('click', () => gallery.open(car));
    actions.append(photoButton);
  }
  $('fleet-grid').append(el('article', {className: 'fleet-card'},
    el('div', {className: 'card-photo'}, image),
    el('h3', {textContent: car.name}),
    el('p', {className: 'card-meta'}, el('span', {textContent: car.category}), el('strong', {textContent: perDay(car)})),
    actions));
});

/* ---------- Contact ---------- */
const firstPhone = contact.phones[0];
if (firstPhone) {
  $('fleet-grid').append(el('article', {className: 'fleet-card fleet-help'},
    el('h3', {textContent: 'Ne znaš koje vozilo odabrati?'}),
    el('p', {textContent: 'Reci nam kuda putuješ i koliko vas je. Predložit ćemo vozilo koje ti odgovara.'}),
    el('a', {className: 'card-pick', href: telHref(firstPhone), textContent: 'Pozovi ' + firstPhone})));

  const call = $('header-call');
  call.href = telHref(firstPhone);
  call.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.57 3.6a1 1 0 0 1-.25 1l-2.2 2.2Z"/></svg>';
  call.append('Pozovi');
  call.setAttribute('aria-label', 'Pozovi ' + firstPhone);
  call.hidden = false;
}
const contactRow = (href, label, value, action, external) => {
  const row = el('a', {className: 'contact-row', href},
    el('span', {}, el('small', {textContent: label}), el('strong', {textContent: value})),
    el('em', {textContent: action}));
  if (external) Object.assign(row, {target: '_blank', rel: 'noopener'});
  return row;
};
contact.phones.forEach(phone => {
  $('contact-list').append(contactRow(telHref(phone), 'Telefon', phone, 'Pozovi'));
  $('footer-phones').append(el('a', {href: telHref(phone), textContent: phone}));
});
if (contact.whatsapp) $('contact-list').append(contactRow('https://wa.me/' + contact.whatsapp, 'WhatsApp', firstPhone, 'Pošalji poruku', true));
if (contact.viber) $('contact-list').append(contactRow('viber://chat?number=%2B' + contact.viber, 'Viber', firstPhone, 'Pošalji poruku'));

/* ---------- Dates and estimate ---------- */
const dayValue = value => Date.parse(value + 'T00:00:00Z');
const localISO = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
function plusDay(value) {
  const date = new Date(value + 'T12:00:00');
  date.setDate(date.getDate() + 1);
  return localISO(date);
}
pickup.min = localISO(new Date());
pickup.value = pickup.min;
dropoff.min = plusDay(pickup.value);
dropoff.value = dropoff.min;
const lastDay = new Date();
lastDay.setFullYear(lastDay.getFullYear() + 2);
pickup.max = dropoff.max = localISO(lastDay);
const validDate = input => /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(input.value) && input.value <= input.max;

const days = () => Math.round((dayValue(dropoff.value) - dayValue(pickup.value)) / 86400000);
const total = (car, count) => car.price === null ? 'Priceless' : money(count * car.price);
function estimate() {
  const count = days(), car = currentCar();
  // Messages in Bosnian instead of the browser's own language.
  pickup.setCustomValidity(validDate(pickup) ? '' : 'Unesi ispravan datum preuzimanja.');
  const problem = !validDate(dropoff) ? 'Unesi ispravan datum povrata.' : !(count >= 1) ? 'Povrat mora biti nakon preuzimanja.' : '';
  dropoff.setCustomValidity(problem);
  const error = pickup.validationMessage || problem;
  $('estimate').textContent = error || `${count} ${dayWord(count)} · ${total(car, count)} ukupno`;
  $('estimate').classList.toggle('is-error', Boolean(error));
}

function update() {
  const index = Number(select.value), car = cars[index];
  const fields = {'car-name': car.name, 'car-category': car.category, 'car-description': car.description, 'car-make': car.make, 'car-body': car.body, 'car-price': money(car.price), 'car-number': String(index + 1).padStart(2, '0')};
  for (const [id, value] of Object.entries(fields)) $(id).textContent = value;
  $('car-price-mobile').textContent = perDay(car);
  const count = photos[car.file]?.length || 0;
  $('hero-gallery').hidden = count === 0;
  $('hero-gallery').replaceChildren(el('span', {className: 'photo-label', textContent: 'Fotografije'}), `(${count})`);
  $('hero-gallery').setAttribute('aria-label', `Stvarne fotografije (${count}): ${car.name}`);
  estimate();
  scene.select(index);
}

select.addEventListener('change', update);
pickup.addEventListener('change', () => {
  if (pickup.value) {
    dropoff.min = plusDay(pickup.value);
    if (dropoff.value <= pickup.value) dropoff.value = dropoff.min;
  }
  estimate();
});
dropoff.addEventListener('change', estimate);
$('hero-gallery').addEventListener('click', () => gallery.open(currentCar()));
$('retry').addEventListener('click', () => scene.retry());
$('replay-scene').addEventListener('click', () => scene.replay());
// The choice is remembered on this device.
const remember = value => { try { localStorage.setItem('voznja', value); } catch { /* private mode */ } };
function showMotion() {
  $('motion-toggle').textContent = scene.motion ? 'Isključi vožnju' : 'Uključi vožnju';
  $('motion-toggle').setAttribute('aria-pressed', String(!scene.motion));
}
try { if (localStorage.getItem('voznja') === 'off') { scene.setMotion(false); showMotion(); } } catch { /* private mode */ }
$('motion-toggle').addEventListener('click', () => {
  scene.setMotion(!scene.motion);
  remember(scene.motion ? 'on' : 'off');
  showMotion();
  if (scene.motion) scene.replay();
});

/* ---------- Request: summary and the ways to send it ---------- */
const summary = $('summary');
// Written by hand: several browsers have no Bosnian date data and would print "2026 M11 17".
const formatDate = value => { const [year, month, day] = value.split('-').map(Number); return `${day}.${month}.${year}.`; };
function requestText() {
  const car = currentCar(), count = days();
  return [
    `Pozdrav, zanima me najam vozila ${car.name}.`,
    `Preuzimanje: ${formatDate(pickup.value)}`,
    `Povrat: ${formatDate(dropoff.value)} (${count} ${dayWord(count)})`,
    car.price === null ? null : `Procjena: ${money(count * car.price)}`,
    'Molim potvrdu dostupnosti.',
  ].filter(Boolean).join('\n');
}
async function copyRequest(done) {
  try {
    await navigator.clipboard.writeText(requestText());
    $('send-status').textContent = done;
  } catch {
    $('send-status').textContent = 'Kopiranje nije uspjelo. Nazovi nas ili prepiši podatke iznad.';
  }
}
$('rental-form').addEventListener('submit', event => {
  event.preventDefault();
  estimate();
  if (!$('rental-form').reportValidity()) return;
  const car = currentCar(), count = days(), text = encodeURIComponent(requestText());

  $('summary-content').replaceChildren(...[
    car.name,
    `Od ${formatDate(pickup.value)} do ${formatDate(dropoff.value)}`,
    `${count} ${dayWord(count)} · ${total(car, count)}`,
  ].map(line => el('p', {textContent: line})));

  const actions = [];
  if (contact.whatsapp) actions.push(el('a', {href: `https://wa.me/${contact.whatsapp}?text=${text}`, target: '_blank', rel: 'noopener', textContent: 'Pošalji na WhatsApp'}));
  if (contact.viber) {
    const viber = el('a', {href: `viber://chat?number=%2B${contact.viber}&draft=${text}`, textContent: 'Pošalji na Viber'});
    viber.addEventListener('click', () => copyRequest('Poruka je kopirana. Ako je Viber ne popuni sam, zalijepi je.'));
    actions.push(viber);
  }
  if (firstPhone) actions.push(el('a', {href: telHref(firstPhone), textContent: 'Pozovi ' + firstPhone}));
  const copy = el('button', {type: 'button', textContent: 'Kopiraj poruku'});
  copy.addEventListener('click', () => copyRequest('Poruka je kopirana.'));
  actions.push(copy);
  actions.forEach((action, index) => { action.className = index === 0 ? 'primary' : 'secondary'; });

  $('send-actions').replaceChildren(...actions);
  $('send-status').textContent = '';
  summary.showModal();
});
summary.querySelector('.close').addEventListener('click', () => summary.close());
summary.addEventListener('click', event => {
  if (event.target !== summary) return;
  const box = summary.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) summary.close();
});

update();
