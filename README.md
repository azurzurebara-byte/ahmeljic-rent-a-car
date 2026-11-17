# Ahmeljić Rent a Car

Pokretanje: `npm start`, zatim otvoriti http://127.0.0.1:4173. Nisu potrebne biblioteke za prikaz sajta. Testovi: `npm test`.

Sajt je u `dist/`. Cijene, nazivi i trenutak zaustavljanja (`stop`) / početak odlaska (`depart`) su u `dist/app.js`. Cijene su KM po danu; kombi je Priceless. Kontakt nije dostavljen pa obrazac daje lokalni pregled, ne šalje rezervaciju.

Video kontroler koristi dva video elementa i obrađuje brze promjene izbora. Nakon dolaska prikazuje originalnu fotografiju `Auta/<vozilo>/02-parkirano.png`. Fotografija ostaje do novog odabira, zatim se otkriva pauzirani video i nastavlja odlazak. Tek nakon odlaska kreće dolazak narednog auta. Fotografije su kopirane u `dist/assets`, bez promjene originala. Vožnja je uključena po zadanim postavkama; korisnik je može isključiti vidljivim dugmetom. „Ponovi dolazak“ ponavlja video, a „Pokreni video“ je vidljiv ako reprodukcija ne uspije.

Četiri originalna videa sadrže dolazak i odlazak. Jetta, Peugeot i kombi počinju parkirani; njihov dolazak je dodatna kompozitna animacija iz prvog kadra. Izvorni AI klipovi imaju sitne razlike u pozadini, pa kontinuitet ulice nije piksel-identičan. Originali u roditeljskom folderu ostaju sačuvani.

`prepare-videos.cjs` regeneriše web kopije uz FFmpeg (`npm install`). Za ponovnu obradu potreban je izvorni roditeljski folder sa MP4 klipovima i Auta/Golf-Plus/01-start.png. Pokrenuti iz korijena ovog projekta, uz postojeći `qa/` folder.

Provjera: testovi logike kontrolera, vizuelni pregled izdvojenih kadrova i HTTP provjere. Interaktivna provjera u pregledniku nije provedena jer nema povezanog preglednika u ovoj sesiji.
