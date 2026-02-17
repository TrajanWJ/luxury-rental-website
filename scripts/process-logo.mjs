import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const brandDir = path.join(__dirname, '..', 'public', 'brand');
const src = path.join(brandDir, 'logo no background.png');

async function processLogo() {
  console.log('Loading source logo...');
  const meta = await sharp(src).metadata();
  console.log(`Source: ${meta.width}x${meta.height}`);

  // Step 1: Upscale 3x with lanczos for crisp edges
  const scale = 3;
  const w = meta.width * scale;
  const h = meta.height * scale;

  const upscaled = await sharp(src)
    .resize(w, h, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  console.log(`Upscaled to ${w}x${h}`);

  // Step 2: Gentle boldening — composite only cardinal offsets (1px each)
  // This adds ~1px of stroke weight without blobbing details
  const offsets = [
    [0, 0],   // original center
    [1, 0],   // right
    [-1, 0],  // left
    [0, 1],   // down
    [0, -1],  // up
  ];

  const pad = 2; // padding to avoid clipping
  const composites = offsets.map(([x, y]) => ({
    input: upscaled,
    left: x + pad,
    top: y + pad,
    blend: 'over',
  }));

  const boldRaw = await sharp({
    create: {
      width: w + pad * 2,
      height: h + pad * 2,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    }
  })
    .composite(composites)
    .png()
    .toBuffer();

  // Step 3: Sharpen to restore crispness after the slight spread
  const boldSharp = await sharp(boldRaw)
    .sharpen({ sigma: 0.8, m1: 1.5, m2: 0.5 })
    .trim()
    .png({ compressionLevel: 9 })
    .toBuffer();

  const boldMeta = await sharp(boldSharp).metadata();
  console.log(`Bold base: ${boldMeta.width}x${boldMeta.height}`);

  // Save bold dark (for light backgrounds)
  await sharp(boldSharp).toFile(path.join(brandDir, 'logo-bold-dark.png'));
  console.log('→ logo-bold-dark.png');

  // Step 4: Create light version (negate RGB, keep alpha)
  await sharp(boldSharp)
    .negate({ alpha: false })
    .png({ compressionLevel: 9 })
    .toFile(path.join(brandDir, 'logo-bold-light.png'));
  console.log('→ logo-bold-light.png');

  // Step 5: Colorize to linen (#ECE9E7) and gold (#BCA28A)
  const { data, info } = await sharp(boldSharp)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const colorize = (r, g, b, name) => {
    const pixels = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i += 4) {
      pixels[i] = r;
      pixels[i + 1] = g;
      pixels[i + 2] = b;
      pixels[i + 3] = data[i + 3]; // preserve alpha
    }
    return sharp(pixels, {
      raw: { width: info.width, height: info.height, channels: 4 }
    })
      .png({ compressionLevel: 9 })
      .toFile(path.join(brandDir, name));
  };

  await colorize(0xEC, 0xE9, 0xE7, 'logo-bold-linen.png');
  console.log('→ logo-bold-linen.png');

  await colorize(0xBC, 0xA2, 0x8A, 'logo-bold-gold.png');
  console.log('→ logo-bold-gold.png');

  // Step 6: Also create a "charcoal" version — the darkest brand color (#2B2B2B)
  // for maximum contrast on light backgrounds
  await colorize(0x2B, 0x2B, 0x2B, 'logo-bold-charcoal.png');
  console.log('→ logo-bold-charcoal.png');

  console.log('\nDone! All variants generated.');
}

processLogo().catch(console.error);
