# Ahmeljić Rent a Car

Pokretanje: `npm start`, zatim otvoriti http://127.0.0.1:4173. Nisu potrebne biblioteke za prikaz sajta. Testovi: `npm test`.

Sajt je u `dist/`. Cijene i nazivi su u `dist/app.js`. Cijene su KM po danu; kombi je Priceless. Kontakt nije dostavljen pa obrazac daje lokalni pregled, ne šalje rezervaciju.

Hero koristi jednu nepomičnu ulicu i izdvojene prozirne slike auta. Web Animations API pomjera samo automobil i njegovu sjenu: dolazak s desne strane uz usporavanje, mirovanje do novog izbora, pa odlazak ulijevo. Kretanje je 2.5D stilizacija, ne simulacija fizičke vožnje; točkovi se ne rotiraju zasebno. Pozadina se ne mijenja pri izboru vozila. `dist/car-scene.js` upravlja sekvencom i brzim promjenama izbora. „Ponovi dolazak“ ponavlja odlazak/dolazak, a „Isključi vožnju“ daje statičan prikaz.

Ulica je kopija `Auta/Golf-Plus/01-start.png`. Prozirna vozila su u `dist/assets/cutouts/`. Izrađena su ugrađenim imagegen alatom iz fotografija `Auta/<vozilo>/02-parkirano.png`. Izvori i promptovi su opisani u `ASSETS.md`. Originalne fotografije i videi u roditeljskom folderu ostaju sačuvani.

Nema runtime biblioteka ni video datoteka u objavljenoj verziji. Položaj i veličina auta te trajanje animacija podešavaju se u `StreetView` klasi. Zajednička koordinatna ravnina prilagođava se veličini prozora pomoću `ResizeObserver`.

Provjera: sedam testova sekvence, brzih promjena izbora, grešaka, ponavljanja, isključivanja pokreta i izvora hero sekcije. Svaki cutout je vizuelno pregledan i provjeren je RGBA alpha kanal. Interaktivna provjera u pregledniku nije provedena jer nema povezanog preglednika u ovoj sesiji.
