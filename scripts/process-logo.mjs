import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const brandDir = path.join(__dirname, '..', 'public', 'brand');
const src = path.join(brandDir, 'logo no background.png');

async function processLogo() {
  console.log('Loading source logo...');
  const original = sharp(src);
  const meta = await original.metadata();
  console.log(`Source: ${meta.width}x${meta.height}, ${meta.channels} channels`);

  // Step 1: Upscale 4x for quality
  const scale = 4;
  const w = meta.width * scale;
  const h = meta.height * scale;

  const upscaled = await sharp(src)
    .resize(w, h, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  console.log(`Upscaled to ${w}x${h}`);

  // Step 2: Create BOLD version by compositing shifted copies
  // This effectively dilates/thickens all strokes
  const offsets = [
    [0, 0], [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [-1, -1], [1, -1], [-1, 1],
    [2, 0], [-2, 0], [0, 2], [0, -2],
  ];

  // Start with a blank transparent canvas
  let composites = offsets.map(([x, y]) => ({
    input: upscaled,
    left: Math.max(0, x + 2), // offset + padding
    top: Math.max(0, y + 2),
    blend: 'over',
  }));

  // Create bold dark version (for light backgrounds)
  const boldDark = await sharp({
    create: {
      width: w + 4,
      height: h + 4,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    }
  })
    .composite(composites)
    .png()
    .toBuffer();

  // Trim transparent edges and save
  const boldDarkTrimmed = await sharp(boldDark)
    .trim()
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  const boldDarkMeta = await sharp(boldDarkTrimmed).metadata();
  await sharp(boldDarkTrimmed).toFile(path.join(brandDir, 'logo-bold-dark.png'));
  console.log(`Bold dark: ${boldDarkMeta.width}x${boldDarkMeta.height} → logo-bold-dark.png`);

  // Step 3: Create BOLD LIGHT version (for dark backgrounds)
  // Negate the RGB channels while preserving alpha
  const boldLightBuffer = await sharp(boldDark)
    .negate({ alpha: false })
    .trim()
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  const boldLightMeta = await sharp(boldLightBuffer).metadata();
  await sharp(boldLightBuffer).toFile(path.join(brandDir, 'logo-bold-light.png'));
  console.log(`Bold light: ${boldLightMeta.width}x${boldLightMeta.height} → logo-bold-light.png`);

  // Step 4: Create BOLD LINEN version (warm off-white, brand color #ECE9E7)
  // Start from the bold dark, extract alpha, colorize to linen
  const { data: boldData, info: boldInfo } = await sharp(boldDark)
    .trim()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const linenR = 0xEC, linenG = 0xE9, linenB = 0xE7;
  const linenPixels = Buffer.alloc(boldData.length);

  for (let i = 0; i < boldData.length; i += 4) {
    // Use the alpha from original, but set RGB to linen color
    // Weight the alpha by how dark the original pixel is (darker = more opaque)
    const origAlpha = boldData[i + 3];
    linenPixels[i] = linenR;
    linenPixels[i + 1] = linenG;
    linenPixels[i + 2] = linenB;
    linenPixels[i + 3] = origAlpha;
  }

  await sharp(linenPixels, {
    raw: { width: boldInfo.width, height: boldInfo.height, channels: 4 }
  })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(brandDir, 'logo-bold-linen.png'));

  console.log(`Bold linen: ${boldInfo.width}x${boldInfo.height} → logo-bold-linen.png`);

  // Step 5: Create BOLD GOLD version (brand brass #BCA28A for dark bg accent)
  const goldR = 0xBC, goldG = 0xA2, goldB = 0x8A;
  const goldPixels = Buffer.alloc(boldData.length);

  for (let i = 0; i < boldData.length; i += 4) {
    goldPixels[i] = goldR;
    goldPixels[i + 1] = goldG;
    goldPixels[i + 2] = goldB;
    goldPixels[i + 3] = boldData[i + 3];
  }

  await sharp(goldPixels, {
    raw: { width: boldInfo.width, height: boldInfo.height, channels: 4 }
  })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(brandDir, 'logo-bold-gold.png'));

  console.log(`Bold gold: ${boldInfo.width}x${boldInfo.height} → logo-bold-gold.png`);

  console.log('\nAll logo variants generated successfully!');
}

processLogo().catch(console.error);
