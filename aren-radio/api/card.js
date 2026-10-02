const TRACKS = require("../lib/tracks");

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function isSafeHex(value, fallback) {
  return /^#[0-9a-fA-F]{6}$/.test(value || "") ? value : fallback;
}

function fallbackCover() {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#07152F"/>
        <stop offset="0.52" stop-color="#0B1F46"/>
        <stop offset="1" stop-color="#24154D"/>
      </linearGradient>
      <radialGradient id="r" cx="70%" cy="20%" r="70%">
        <stop stop-color="#22D3EE" stop-opacity=".42"/>
        <stop offset="1" stop-color="#22D3EE" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="640" height="640" rx="48" fill="url(#g)"/>
    <rect width="640" height="640" rx="48" fill="url(#r)"/>
    <circle cx="320" cy="320" r="176" fill="none" stroke="#22D3EE" stroke-opacity=".25" stroke-width="2"/>
    <circle cx="320" cy="320" r="112" fill="none" stroke="#6366F1" stroke-opacity=".35" stroke-width="2"/>
    <circle cx="320" cy="320" r="25" fill="#22D3EE"/>
    <text x="320" y="546" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#E6FBFF">AREN RADIO</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

async function getAlbumArtDataUrl(spotifyUrl) {
  try {
    const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`;
    const metaRes = await fetch(oembedUrl, {
      headers: { "User-Agent": "Aren-Radio/1.0" }
    });
    if (!metaRes.ok) return fallbackCover();
    const meta = await metaRes.json();
    if (!meta.thumbnail_url) return fallbackCover();

    const imgRes = await fetch(meta.thumbnail_url, {
      headers: { "User-Agent": "Aren-Radio/1.0" }
    });
    if (!imgRes.ok) return fallbackCover();

    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const buf = Buffer.from(await imgRes.arrayBuffer());
    return `data:${contentType};base64,${buf.toString("base64")}`;
  } catch {
    return fallbackCover();
  }
}

function equalizerBars(accentA, accentB) {
  const bars = [
    {x: 407, h: 35, d: ".78s", delay: "-.21s"},
    {x: 425, h: 57, d: ".96s", delay: "-.64s"},
    {x: 443, h: 43, d: ".72s", delay: "-.31s"},
    {x: 461, h: 72, d: "1.08s", delay: "-.87s"},
    {x: 479, h: 50, d: ".86s", delay: "-.46s"},
    {x: 497, h: 64, d: "1.12s", delay: "-.73s"},
    {x: 515, h: 41, d: ".74s", delay: "-.12s"},
    {x: 533, h: 77, d: "1.02s", delay: "-.55s"},
    {x: 551, h: 54, d: ".82s", delay: "-.39s"},
    {x: 569, h: 68, d: "1.16s", delay: "-.95s"},
    {x: 587, h: 46, d: ".88s", delay: "-.28s"},
    {x: 605, h: 61, d: "1.04s", delay: "-.66s"},
    {x: 623, h: 39, d: ".76s", delay: "-.16s"},
    {x: 641, h: 69, d: "1.10s", delay: "-.80s"},
  ];
  return bars.map((b, i) => `
    <rect class="eq" x="${b.x}" y="${172 - b.h}" width="10" height="${b.h}" rx="5"
      fill="${i % 3 === 0 ? accentB : accentA}"
      style="--dur:${b.d};--delay:${b.delay};transform-origin:${b.x + 5}px 172px"/>
  `).join("");
}

function makeSvg(track, coverDataUrl, accentA, accentB) {
  const title = esc(track.title);
  const artist = esc(track.artist);
  const eyebrow = esc(track.eyebrow);
  const duration = esc(track.duration);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="900" height="240" viewBox="0 0 900 240" fill="none"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  role="img" aria-labelledby="title desc">
  <title id="title">${title} — ${artist}</title>
  <desc id="desc">Aren Radio featured-track card with animated equalizer visualization. Click the card in the GitHub README to open the song on Spotify.</desc>

  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="900" y2="240">
      <stop stop-color="#030712"/>
      <stop offset=".58" stop-color="#07152F"/>
      <stop offset="1" stop-color="#10113A"/>
    </linearGradient>
    <radialGradient id="glowA" cx="0" cy="0" r="1" gradientTransform="translate(650 55) rotate(147) scale(360 220)">
      <stop stop-color="${accentA}" stop-opacity=".18"/>
      <stop offset="1" stop-color="${accentA}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB" cx="0" cy="0" r="1" gradientTransform="translate(770 228) rotate(-150) scale(310 160)">
      <stop stop-color="${accentB}" stop-opacity=".20"/>
      <stop offset="1" stop-color="${accentB}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="900" y2="240">
      <stop stop-color="${accentA}" stop-opacity=".18"/>
      <stop offset=".30" stop-color="${accentA}"/>
      <stop offset=".72" stop-color="${accentB}"/>
      <stop offset="1" stop-color="${accentB}" stop-opacity=".18"/>
    </linearGradient>
    <linearGradient id="wave" x1="392" y1="0" x2="670" y2="0">
      <stop stop-color="${accentA}"/>
      <stop offset=".5" stop-color="#7DD3FC"/>
      <stop offset="1" stop-color="${accentB}"/>
    </linearGradient>
    <filter id="blur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="5"/>
    </filter>
    <clipPath id="card"><rect width="900" height="240" rx="24"/></clipPath>
    <clipPath id="cover"><rect x="24" y="24" width="192" height="192" rx="18"/></clipPath>

    <style>
      @keyframes dash {
        to { stroke-dashoffset: -120; }
      }
      @keyframes pulse {
        0%,100% { transform: scaleY(.34); opacity:.55; }
        50% { transform: scaleY(1); opacity:1; }
      }
      @keyframes breathe {
        0%,100% { opacity:.45; }
        50% { opacity:1; }
      }
      @keyframes scan {
        from { transform: translateX(-220px); }
        to { transform: translateX(1120px); }
      }
      @keyframes drift {
        0%,100% { transform: translateX(0px); }
        50% { transform: translateX(16px); }
      }
      .edge {
        stroke-dasharray: 16 13;
        animation: dash 5.8s linear infinite;
      }
      .eq {
        animation: pulse var(--dur) ease-in-out infinite;
        animation-delay: var(--delay);
        transform-box: fill-box;
      }
      .dot { animation: breathe 1.8s ease-in-out infinite; }
      .scan { animation: scan 8s linear infinite; }
      .drift { animation: drift 9s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce) {
        .edge,.eq,.dot,.scan,.drift { animation: none !important; }
      }
    </style>
  </defs>

  <g clip-path="url(#card)">
    <!-- very subtle album-art atmosphere; the foreground remains crisp -->
    <image href="${coverDataUrl}" x="-18" y="-170" width="430" height="430"
      preserveAspectRatio="xMidYMid slice" opacity=".055" filter="url(#blur)"/>
    <rect width="900" height="240" fill="url(#bg)"/>
    <rect width="900" height="240" fill="url(#glowA)"/>
    <rect width="900" height="240" fill="url(#glowB)"/>

    <!-- faint grid -->
    <g opacity=".065" stroke="${accentA}" stroke-width=".7">
      ${Array.from({length: 17}, (_, i) => `<line x1="${250+i*42}" y1="0" x2="${250+i*42}" y2="240"/>`).join("")}
      ${Array.from({length: 7}, (_, i) => `<line x1="240" y1="${i*40}" x2="900" y2="${i*40}"/>`).join("")}
    </g>

    <!-- moving soft scan -->
    <g class="scan" opacity=".14">
      <rect x="-170" y="0" width="170" height="240" fill="url(#wave)" filter="url(#soft)"/>
    </g>

    <!-- album -->
    <g clip-path="url(#cover)">
      <image href="${coverDataUrl}" x="24" y="24" width="192" height="192" preserveAspectRatio="xMidYMid slice"/>
      <rect x="24" y="24" width="192" height="192" fill="none" stroke="#FFFFFF" stroke-opacity=".12"/>
    </g>

    <!-- copy -->
    <g font-family="Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif">
      <circle class="dot" cx="253" cy="44" r="4.5" fill="${accentA}"/>
      <text x="268" y="49" fill="${accentA}" font-size="12" font-weight="800" letter-spacing="2.5">${eyebrow}</text>

      <text x="250" y="92" fill="#F8FAFC" font-size="31" font-weight="760" letter-spacing="-0.8">${title}</text>
      <text x="251" y="120" fill="#AFC4D9" font-size="17" font-weight="530">${artist}</text>

      <text x="251" y="158" fill="#64748B" font-size="11" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" letter-spacing="1.4">SELECTED BY DEVXOMAR  //  ${duration}</text>

      <rect x="251" y="181" width="180" height="30" rx="15" fill="#071B2E" stroke="${accentA}" stroke-opacity=".35"/>
      <polygon points="269,191 269,201 278,196" fill="${accentA}"/>
      <text x="287" y="201" fill="#DFFAFF" font-size="11" font-weight="700" letter-spacing=".8">OPEN IN SPOTIFY</text>
    </g>

    <!-- equalizer -->
    <g>
      ${equalizerBars(accentA, accentB)}
      <line x1="398" y1="181" x2="671" y2="181" stroke="#163B55" stroke-width="1"/>
      <circle class="drift" cx="419" cy="181" r="3.5" fill="${accentA}" filter="url(#soft)"/>
    </g>

    <!-- signature -->
    <g font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">
      <text x="846" y="203" text-anchor="end" fill="#52677D" font-size="9.5" letter-spacing="1.5">AREN RADIO / 2026</text>
    </g>

    <rect x=".75" y=".75" width="898.5" height="238.5" rx="23.25" fill="none" stroke="#34556E" stroke-opacity=".42"/>
    <rect class="edge" x="2" y="2" width="896" height="236" rx="22" fill="none" stroke="url(#edge)" stroke-width="1.5"/>
  </g>
</svg>`;
}

module.exports = async function handler(req, res) {
  const slug = String((req.query && req.query.track) || "more-than-you-know");
  const track = TRACKS[slug] || TRACKS["more-than-you-know"];

  const accentA = isSafeHex(req.query?.accentA, track.accentA);
  const accentB = isSafeHex(req.query?.accentB, track.accentB);

  const coverDataUrl = await getAlbumArtDataUrl(track.spotifyUrl);
  const svg = makeSvg(track, coverDataUrl, accentA, accentB);

  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=86400");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.status(200).send(svg);
};
