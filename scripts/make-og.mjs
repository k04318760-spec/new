/**
 * Generates public/og.png - the card that appears when she sends the link
 * on WhatsApp. Deliberately says nothing: a preview reading "Happy Birthday"
 * would spoil the entire thing before he taps.
 *
 * Run once: node scripts/make-og.mjs
 */
import sharp from 'sharp'

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e8c39e" stop-opacity="0.13"/>
      <stop offset="100%" stop-color="#e8c39e" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="50%" cy="50%" r="72%">
      <stop offset="55%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.55"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="#0a0908"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- a lens, closed -->
  <circle cx="600" cy="300" r="86" fill="none" stroke="#e8c39e" stroke-width="3" opacity="0.85"/>
  <circle cx="600" cy="300" r="27" fill="#e8c39e" opacity="0.9"/>
  <circle cx="600" cy="300" r="128" fill="none" stroke="#e8c39e" stroke-width="1" opacity="0.22"/>

  <!-- three dots: someone is typing -->
  <circle cx="566" cy="470" r="7" fill="#e8c39e" opacity="0.75"/>
  <circle cx="600" cy="470" r="7" fill="#e8c39e" opacity="0.5"/>
  <circle cx="634" cy="470" r="7" fill="#e8c39e" opacity="0.3"/>

  <rect width="1200" height="630" fill="url(#vig)"/>
</svg>`

await sharp(Buffer.from(svg)).png().toFile('public/og.png')
console.log('  wrote public/og.png')
