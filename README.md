# Ahmeljić Rent a Car

Pokretanje: `npm start`, zatim otvoriti http://127.0.0.1:4173. Nisu potrebne biblioteke za prikaz sajta. Testovi: `npm test`.

Objavljuje se samo folder `dist/`.

## Šta gdje mijenjati

| Šta | Gdje |
|---|---|
| Telefoni, WhatsApp, Viber | `dist/app.js`, objekat `contact` na vrhu fajla |
| Vozila: naziv, klasa, opis, cijena (KM po danu; `null` = Priceless) | `dist/app.js`, lista `cars` |
| Tekstovi sekcija | `dist/index.html` |
| Boje, fontovi, veličine | `dist/style.css`, varijable u `:root` na vrhu |
| Fotografije po vozilu | `dist/photo-data.js` i `dist/assets/photos/` |

Kontakt: brojevi 061 762 218 i 062 351 900 prepisani su s tablica "Ahmeljić Auto" na fotografiji Seata. WhatsApp i Viber su postavljeni na prvi broj; ako broj nije na tim aplikacijama, upiši `''` i opcija nestaje. Adresa nije poznata pa je nema na stranici.

## Kako stranica radi

Hero koristi jednu nepomičnu ulicu i izdvojene prozirne slike auta. Web Animations API pomjera samo automobil i njegovu sjenu: dolazak s desne strane uz usporavanje, mirovanje do novog izbora, pa odlazak ulijevo. Kretanje je 2.5D stilizacija, ne simulacija fizičke vožnje. Pozadina se ne mijenja pri izboru vozila. `dist/car-scene.js` upravlja sekvencom i brzim promjenama izbora. "Ponovi dolazak" ponavlja odlazak i dolazak, a "Isključi vožnju" daje statičan prikaz.

Rasporedi: iznad 1050 px forma je lijevo, a auto desno. Do 1050 px ulica je gore, a forma ispod. Do 700 px (telefon) forma je kompaktna, auto je na sredini ulice, a u headeru je dugme "Pozovi". Položaj ulice računa `layoutStage` u `dist/app.js`; položaj i veličina auta te trajanje animacija su u klasi `StreetView`.

"Pošalji upit" otvara pregled (vozilo, datumi, iznos) s dugmadima: WhatsApp s popunjenom porukom, Viber (poruka se usput kopira), poziv i "Kopiraj poruku". Stranica ništa ne šalje sama i nema server.

Stvarne fotografije: 27 originalnih JPG datoteka kopirano je bez izmjena iz `Kola/` u `dist/assets/photos/` (`photo-sources.json` čuva mapiranje). Galerija prikazuje lakše kopije (`NN-view.webp`, `NN-thumb.webp`), a "Otvori original" vodi na netaknuti JPG. Golf nema galeriju prema korisnikovoj uputi.

## Slike

Izvorne slike pune veličine su u `assets-src/` (ulica, prozirna vozila, logo) i ne objavljuju se. `npm run images` iz njih pravi WebP verzije u `dist/assets/` (ulica u 3 širine, svako vozilo u 3 širine, logo, kopije fotografija). Skripta `tools/build-images.cjs` treba paket `sharp`; traži ga i u `../sajt/tools/node_modules`.

Ulica je kopija `Auta/Golf-Plus/01-start.png`. Prozirna vozila su izrađena imagegen alatom iz fotografija `Auta/<vozilo>/02-parkirano.png`; izvori i promptovi su u `ASSETS.md`. Logo je imagegen rekonstrukcija prema fotografiji Seata, ne originalni vektorski fajl.

Pozadina iza auta u karticama voznog parka (`assets-src/codex/fleet-bg.png`) napravljena je Codex CLI-jem; opis koji je dobio je u `assets-src/codex/PROMPT.md`.

Fontovi (DM Sans, Manrope; SIL Open Font License) služe se s ovog sajta iz `dist/assets/fonts/`, bez poziva prema Googleu.

Slika za dijeljenje: `dist/assets/og.jpg` (1200x630) nastaje iz `tools/og.html`. `og:image` u `index.html` je relativna putanja; kad sajt dobije stalnu adresu, upisati punu (https://...), jer je neke mreže traže.

## Provjera

`npm test`: sekvenca dolaska i odlaska, brze promjene izbora, greške, ponavljanje, isključivanje pokreta, galerije, postojanje svih slika i izvora.

Vizuelna provjera (design skill, headless Chrome) na 320, 375, 768, 1366x768 i 1440 px: 0 blokera. Snimci i izvještaji su u `qa/design-check/` (folder `qa/` se ne objavljuje).
