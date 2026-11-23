# Changes — Special People in a Special Place: Tung Chung!

## Save My Story uploads only, with a separate Download PDF button

- **Save My Story** now waits for a confirmed Google Drive upload of the story PDF only (`Name_Class_Tung Chung.pdf`). It no longer opens or downloads the PDF as part of saving, because on iPad that could leave the website and cancel the upload.
- The button shows **Uploading to Google Drive...** after the pages are rendered, then a green **Saved to Google Drive** message or a red error. Stay on the page until the Saved message appears.
- A separate **Download PDF** button is always available on page 12. It keeps a copy on the iPad and does not send anything to Drive. The download opens in a new tab if needed, so the game page stays open.
- Drive upload now succeeds only when Apps Script returns `{ status: "ok" }`. Extra text or link files are not sent.

## Classroom play fixes (cover, places, drawing, PDF)

- **Places slider:** The place picker keeps a visible scrollbar and has left/right arrow buttons. The scrollbar is no longer hidden on that strip. Place names themselves are unchanged.
- **Adjective vocab cards:** Tapping the selected word on an adjective wheel now reliably opens the vocab card (the wheel no longer steals a tap as a drag). A tappable adjective box with a "?" sits next to **Draw Thing!** on pages 1–11. The sporty and nerdy definitions were not rewritten.
- **Fill tool:** Fill closes the freehand shape you drew, fills it with the chosen colour, and draws a **black outline** around that shape. It does not stamp a circle.
- **Drawing cursor:** On a mouse or stylus, the face/object canvas shows a dark brush cursor with a light halo, sized to the brush, so the pointer is visible on the pale pad.
- **Save as PDF:** Save My Story downloads a real PDF named `{Student Name}_{Student Class}_Tung Chung.pdf` (not HTML or loose images). The PDF starts with an opening page that shows the student's Name and Class, then the 12 story pages. The existing Apps Script payload still includes the PNG pages, and also adds `pdfBase64`, `pdfFileName`, `studentClass`, and `mimeType` without renaming or removing the old fields. The current Apps Script may ignore the new PDF fields until it is updated to save a `.pdf` file.
- **Name and Class:** The cover has **Name: _______________** and **Class: ___** fields. Those values appear on the PDF opening page and in the filename.
- **Cover characters:** The three bouncing preview characters stand on the wooden boardwalk path (slightly left of centre through the deck), and the bounce is anchored at their feet so they no longer look like they are flying.


This update wires Charlie's real Drive assets into the Vite + React storybook so it can be played with the full set of bodies, places, music, and the Chicken Pie font.

## Assets added

- **Fonts:** `CHICKEN Pie.ttf` and `CHICKEN Pie.otf` are now in `src/` (so `src/index.css` `@font-face` can load them) and in `public/` (for exported HTML or any canvas/public path). UI text already used `'Chicken Pie', 'Fredoka', sans-serif`; the face was not loading because the font files were missing from the original zip.
- **Music:** Replaced the short 257 KB stand-in at `public/Tung Chung.mp3` with the full 999.2 KB Drive track. The dance-song path is unchanged (`./Tung Chung.mp3`).
- **Bodies:** Copied all 77 Make-You sprites (`001.png`–`077.png`) into `public/make-you-bodies/`. The original 8 named outfits (Red Star Tunic, Sunny Overalls, etc.) are kept at the start of the list.
- **Places:** Copied all 18 Drive photos that were in the folder (`Tung Chung Places (1).jpeg` and `(17)`–`(33).jpeg`) into `public/Tung Chung Places/`. Photos 2–16 were not in the Drive folder and were not invented. The original illustrated backgrounds for Ngong Ping 360, Tung Chung Park, and Tung Chung Fort are kept. The illustrated Waterfront Promenade image and the Snack street shops photo were later removed (see below).

## Config

`public/config.js` and the fallbacks in `src/utils/storyHelpers.ts` now ship:

- **85 bodies:** the 8 original outfits, then all 77 Make-You sprites, each with a short English outfit name.
- **20 places:** the 3 remaining illustrated backgrounds (Ngong Ping 360, Tung Chung Park, Tung Chung Fort), then 17 Drive photos with their real Tung Chung names (see below). Snack street shops and the illustrated Waterfront Promenade were removed.
- `danceSongUrl` remains `./Tung Chung.mp3`.

## Neck anchors

The 8 original outfits still use `neckX: 0.5`, `neckY: 0.22`, `headScale: 1.0` (they have padded artwork with the neck stump around 22% down).

All 77 Make-You sprites share one consistent layout: a front-facing body with the neck or collar at the very top centre of the image. A sample of 001, 010, 040, 077 and others in each size cluster was inspected. They use one shared default of `neckX: 0.5`, `neckY: 0.05`, `headScale: 1.0`, so a head sits just onto the neck stump or shirt collar. Students can still fine-tune offset, scale, and tilt in the character creator.

## Exported stories and dance canvas

`src/utils/canvasExporter.ts` now uses Chicken Pie (with Fredoka as fallback) for the dance-video captions and for the standalone backup HTML. The exported HTML embeds the Chicken Pie TTF as a base64 `@font-face` so the file still looks right when opened on its own.

## Place names

The illustrated Waterfront Promenade (`tung-chung-promenade.jpg`) and Snack street shops (`Tung Chung Places (17).jpeg`) were removed, both the image files and their place entries. The remaining places were renamed to their real Tung Chung names. There are now 20 places in total.

| File | Name |
| --- | --- |
| ngong-ping-cable-car.jpg | Ngong Ping 360 & Bay |
| tung-chung-park.jpg | Tung Chung Park |
| tung-chung-fort.jpg | Tung Chung Fort |
| Tung Chung Places (1).jpeg | Caribbean Coast Swimming Pool |
| Tung Chung Places (18).jpeg | Yat Tung Shopping Centre |
| Tung Chung Places (19).jpeg | Tung Chung Ferry Pier |
| Tung Chung Places (20).jpeg | Tung Chung Promenade |
| Tung Chung Places (21).jpeg | Chui Kwan Drive |
| Tung Chung Places (22).jpeg | Mun Tung Wet Market |
| Tung Chung Places (23).jpeg | Mun Tung Estate |
| Tung Chung Places (24).jpeg | Masjid Ismail |
| Tung Chung Places (25).jpeg | Caribbean Coast |
| Tung Chung Places (26).jpeg | Citygate Fountain |
| Tung Chung Places (27).jpeg | Cheung Tung Bus Terminal |
| Tung Chung Places (28).jpeg | Yu Nga Court |
| Tung Chung Places (29).jpeg | Yat Tung Market Food Stalls |
| Tung Chung Places (30).jpeg | Ma Wan Chung |
| Tung Chung Places (31).jpeg | Yat Tung Estate |
| Tung Chung Places (32).jpeg | Outside Yat Tung Estate |
| Tung Chung Places (33).jpeg | Yat Tung Estate Bus Terminal |

## Drawing tools

The drawing pad (for faces and objects) now has two paint tools plus the eraser: **Pencil** is the default freehand stroke, and **Fill** closes the shape you just drew and fills its interior with the selected colour. Fill does not stamp a circle; the existing face-only Quick Face Base remains a separate convenience.

## Adjective vocab cards

Tapping the selected personality word in the yellow centre of an adjective wheel (a tap, not a drag, and not the chevrons) opens a vocab card with a short definition and a kawaii illustration from `public/vocab-cards/`.

## Still missing

- Drive folder photos **Tung Chung Places (2)–(16)** were not available and are not in this package.
