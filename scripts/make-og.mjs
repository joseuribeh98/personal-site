// Run: node scripts/make-og.mjs → public/og-default.png (1200×630)
import sharp from 'sharp';

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#f5f1e8"/>
  <rect x="0" y="0" width="14" height="630" fill="#b5482a"/>
  <text x="90" y="250" font-family="Georgia, serif" font-size="72" fill="#1b1713">Jose Uribe</text>
  <text x="90" y="330" font-family="Georgia, serif" font-size="44" fill="#5f574c">I build the site that replaces</text>
  <text x="90" y="386" font-family="Georgia, serif" font-size="44" fill="#5f574c">your WordPress.</text>
  <text x="90" y="540" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="#8c8476" letter-spacing="4">JOSEURIBE.DEV · CALI, COLOMBIA · US EASTERN HOURS</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og-default.png');
console.log('public/og-default.png written');
