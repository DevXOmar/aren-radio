# DXO Radio — setup

A no-secret, animated GitHub README music card for:

**More Than You Know — Axwell /\ Ingrosso**

Spotify track:
https://open.spotify.com/track/61ZUgMJI771PlKXdT9OXwF

## What this does

- Renders a pure SVG card from `/api/card`.
- Pulls the official Spotify thumbnail through Spotify's public oEmbed endpoint at request time.
- Embeds the artwork into the SVG as base64, so the final card is self-contained.
- Animates the cyan/indigo border, equalizer bars, scan light, signal dot, and progress marker.
- Does **not** autoplay copyrighted audio inside GitHub; GitHub READMEs cannot do that.
- Clicking the card can open your DXO Radio landing page, which contains the official Spotify embed player.

## Deploy on Vercel

### Option A — easiest: GitHub + Vercel

1. Create a new GitHub repository named `dxo-radio`.
2. Upload the contents of this folder to the repo root.
3. Go to Vercel and choose **Add New → Project**.
4. Import the `dxo-radio` repository.
5. Framework preset: **Other**.
6. Leave build command, output directory, and environment variables empty.
7. Deploy.
8. Open:
   `https://YOUR-PROJECT.vercel.app/api/card?track=more-than-you-know`
9. You should see the animated SVG.

### Option B — Vercel CLI

```bash
npm i -g vercel
cd dxo-radio
vercel
vercel --prod
```

No Spotify credentials are required for this fixed featured-track version.

## Put it in DevXOmar/DevXOmar README.md

Replace `YOUR-VERCEL-PROJECT` with the actual Vercel project domain.

```html
## 🎧 DXO // Featured Track

<p align="center">
  <a href="https://YOUR-VERCEL-PROJECT.vercel.app/">
    <img
      src="https://YOUR-VERCEL-PROJECT.vercel.app/api/card?track=more-than-you-know"
      width="100%"
      alt="DXO Radio — More Than You Know by Axwell /\\ Ingrosso"
    />
  </a>
</p>

<p align="center">
  <sub>More Than You Know · Axwell /\ Ingrosso · click the card to open on Spotify</sub>
</p>
```

## Change the colors from the README URL

Optional query params:

```text
?track=more-than-you-know&accentA=%2322D3EE&accentB=%236366F1
```

The defaults already match Omar's Midnight Navy × Electric Cyan × Indigo profile theme.

## Add another song later

Open `lib/tracks.js` and add:

```js
"another-song": {
  title: "Song Name",
  artist: "Artist Name",
  spotifyUrl: "https://open.spotify.com/track/...",
  duration: "03:45",
  eyebrow: "DXO // FEATURED TRACK",
  accentA: "#22D3EE",
  accentB: "#6366F1",
  warm: "#F59E0B"
}
```

Then use:

```text
/api/card?track=another-song
```

No design changes are required.

## Local preview

If you have the Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

Open:
`http://localhost:3000`

The preview page is under `public/index.html`.

## Files

```text
dxo-radio/
├── api/
│   └── card.js
├── lib/
│   └── tracks.js
├── public/
│   └── index.html
├── .gitignore
├── package.json
├── vercel.json
├── README_DEPLOY.md
└── README_SNIPPET.md
```


## Actual audio

GitHub profile READMEs cannot embed a working audio player or iframe. The root page of this Vercel project therefore includes Spotify's official embedded player for the selected song. The README card links to that page.

So the experience is:

```text
GitHub profile
   ↓ click animated DXO Radio card
DXO Radio Vercel page
   ↓
official Spotify embedded player
```
