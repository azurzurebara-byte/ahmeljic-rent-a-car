// Builds the web-sized images in dist/assets from the full-size sources in assets-src/.
// Run from the rent-a-car folder:  node tools/build-images.cjs
// Needs "sharp". It is not a dependency of the site itself; this script looks for it here
// and in ../sajt/tools/node_modules (already installed there).
const fs = require('fs');
const path = require('path');

function loadSharp() {
  for (const p of ['sharp', path.join(__dirname, '..', '..', 'sajt', 'tools', 'node_modules', 'sharp')]) {
    try { return require(p); } catch { /* try the next place */ }
  }
  console.error('sharp nije pronađen. Pokreni: npm install --no-save sharp');
  process.exit(2);
}
const sharp = loadSharp();

const root = path.join(__dirname, '..');
const src = path.join(root, 'assets-src');
const out = path.join(root, 'dist', 'assets');
const cars = ['golf', 'seat', 'mazda', 'passat', 'jetta', 'pezo', 'kombajn'];
const kb = file => Math.round(fs.statSync(file).size / 1024) + ' KB';

async function webp(input, output, width, options) {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  await sharp(input).resize({ width, withoutEnlargement: true }).webp(options).toFile(output);
  console.log(path.relative(root, output).replace(/\\/g, '/'), kb(output));
}

(async () => {
  // The street behind the cars: full size for large screens, smaller ones for laptops and phones.
  await webp(path.join(src, 'street.png'), path.join(out, 'street.webp'), 1672, { quality: 80 });
  await webp(path.join(src, 'street.png'), path.join(out, 'street-1280.webp'), 1280, { quality: 76 });
  await webp(path.join(src, 'street.png'), path.join(out, 'street-960.webp'), 960, { quality: 70 });

  // Transparent cars: hero (full and phone size) and the fleet cards.
  for (const car of cars) {
    const input = path.join(src, 'cutouts', car + '.png');
    const alpha = { quality: 84, alphaQuality: 92, effort: 5 };
    await webp(input, path.join(out, 'cutouts', car + '.webp'), 1672, alpha);
    await webp(input, path.join(out, 'cutouts', car + '-960.webp'), 960, alpha);
    await webp(input, path.join(out, 'cutouts', car + '-640.webp'), 640, alpha);
  }

  // Backdrop behind the cars on the fleet cards (made with Codex CLI, brief in assets-src/codex/PROMPT.md).
  const backdrop = path.join(src, 'codex', 'fleet-bg.png');
  if (fs.existsSync(backdrop)) {
    await webp(backdrop, path.join(out, 'fleet-bg.webp'), 800, { quality: 76 });
  }

  // Logo: shown at 132 px, so 396 px covers 3x screens.
  await webp(path.join(src, 'ahmeljic-logo.png'), path.join(out, 'ahmeljic-logo.webp'), 396, { quality: 92, alphaQuality: 100 });

  // Real photos: the originals stay untouched in dist/assets/photos (the gallery links to them).
  // These are lighter copies for viewing (-view) and for the thumbnail strip (-thumb).
  const photos = path.join(out, 'photos');
  for (const car of fs.readdirSync(photos)) {
    for (const file of fs.readdirSync(path.join(photos, car)).filter(f => /^\d+\.jpg$/.test(f))) {
      const input = path.join(photos, car, file), base = file.replace('.jpg', '');
      await webp(input, path.join(photos, car, base + '-view.webp'), 1280, { quality: 74 });
      await webp(input, path.join(photos, car, base + '-thumb.webp'), 240, { quality: 70 });
    }
  }
})().catch(error => { console.error(error); process.exit(1); });
