# Changes — Special People in a Special Place: Tung Chung!

This update wires Charlie's real Drive assets into the Vite + React storybook so it can be played with the full set of bodies, places, music, and the Chicken Pie font.

## Assets added

- **Fonts:** `CHICKEN Pie.ttf` and `CHICKEN Pie.otf` are now in `src/` (so `src/index.css` `@font-face` can load them) and in `public/` (for exported HTML or any canvas/public path). UI text already used `'Chicken Pie', 'Fredoka', sans-serif`; the face was not loading because the font files were missing from the original zip.
- **Music:** Replaced the short 257 KB stand-in at `public/Tung Chung.mp3` with the full 999.2 KB Drive track. The dance-song path is unchanged (`./Tung Chung.mp3`).
- **Bodies:** Copied all 77 Make-You sprites (`001.png`–`077.png`) into `public/make-you-bodies/`. The original 8 named outfits (Red Star Tunic, Sunny Overalls, etc.) are kept at the start of the list.
- **Places:** Copied all 18 Drive photos that were in the folder (`Tung Chung Places (1).jpeg` and `(17)`–`(33).jpeg`) into `public/Tung Chung Places/`. Photos 2–16 were not in the Drive folder and were not invented. The original 4 illustrated backgrounds (Ngong Ping 360, Tung Chung Park, Tung Chung Fort, Waterfront Promenade) are visually distinct cartoon scenes, not compressed duplicates, so they are kept as well.

## Config

`public/config.js` and the fallbacks in `src/utils/storyHelpers.ts` now ship:

- **85 bodies:** the 8 original outfits, then all 77 Make-You sprites, each with a short English outfit name.
- **22 places:** the 4 original illustrated backgrounds, then the 18 Drive photos with friendly names (see below).
- `danceSongUrl` remains `./Tung Chung.mp3`.

## Neck anchors

The 8 original outfits still use `neckX: 0.5`, `neckY: 0.22`, `headScale: 1.0` (they have padded artwork with the neck stump around 22% down).

All 77 Make-You sprites share one consistent layout: a front-facing body with the neck or collar at the very top centre of the image. A sample of 001, 010, 040, 077 and others in each size cluster was inspected. They use one shared default of `neckX: 0.5`, `neckY: 0.05`, `headScale: 1.0`, so a head sits just onto the neck stump or shirt collar. Students can still fine-tune offset, scale, and tilt in the character creator.

## Exported stories and dance canvas

`src/utils/canvasExporter.ts` now uses Chicken Pie (with Fredoka as fallback) for the dance-video captions and for the standalone backup HTML. The exported HTML embeds the Chicken Pie TTF as a base64 `@font-face` so the file still looks right when opened on its own.

## Place names for the 18 Drive photos

| File | Name |
| --- | --- |
| Tung Chung Places (1).jpeg | Hotel swimming pool |
| Tung Chung Places (17).jpeg | Snack street shops |
| Tung Chung Places (18).jpeg | Yat Tung Shopping Centre |
| Tung Chung Places (19).jpeg | Yellow canopy bus terminus |
| Tung Chung Places (20).jpeg | Pink pier promenade |
| Tung Chung Places (21).jpeg | Village courtyard |
| Tung Chung Places (22).jpeg | Wet market butcher stall |
| Tung Chung Places (23).jpeg | Estate covered walkway |
| Tung Chung Places (24).jpeg | Mosque gate at night |
| Tung Chung Places (25).jpeg | Sculpture plaza |
| Tung Chung Places (26).jpeg | Musical fountain at night |
| Tung Chung Places (27).jpeg | Station bus interchange |
| Tung Chung Places (28).jpeg | Tower courtyard |
| Tung Chung Places (29).jpeg | Cafe street stalls |
| Tung Chung Places (30).jpeg | Old village alley |
| Tung Chung Places (31).jpeg | Service alley |
| Tung Chung Places (32).jpeg | Palm garden walk |
| Tung Chung Places (33).jpeg | Street corner bus stop |

## Still missing

- Drive folder photos **Tung Chung Places (2)–(16)** were not available and are not in this package.
