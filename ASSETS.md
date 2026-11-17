# Vehicle cutouts

Mode: built-in imagegen, background-extraction, transparent_background=true. Originals preserved. Final assets: `dist/assets/cutouts/{golf,seat,mazda,passat,jetta,pezo,kombajn}.png`.

Source mapping: Golf-Plus → golf, Seat → seat, Mazda → mazda, Passat → passat, Jetta → jetta, Peugeot → pezo, Kombi → kombajn. Each source was `../Auta/<folder>/02-parkirano.png`.

Prompt set (same extraction brief for all seven, with vehicle name substituted):

> Use case: background-extraction. Extract ONLY the exact [vehicle] from this edit target photo with actual transparent alpha. Preserve front-left three-quarter angle facing left, all body proportions, model, wheels, reflections, paint, plate artwork, lettering and vehicle details. Entire vehicle fully visible with small transparent padding, tightly framed landscape canvas. Keep glass/reflections opaque. Remove ALL scenery, ground and external cast shadows. No background, no ground plane, no new vehicle. Website adds shadow separately.

Vehicles: black Volkswagen Golf Plus; red Seat Leon; grey Mazda CX-5; white Volkswagen Passat estate; white Volkswagen Jetta sedan; silver Peugeot 308 CC convertible; white Volkswagen Transporter van.

The website uses the original empty street `../Auta/Golf-Plus/01-start.png`, copied to `dist/assets/street.png`. Imagegen can slightly reinterpret small lettering; these cutouts are visual presentation assets, not a source of contact information.
