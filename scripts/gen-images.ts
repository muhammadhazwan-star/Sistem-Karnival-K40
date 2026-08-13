import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images';
const GAL_DIR = '/home/z/my-project/public/images/gallery';

async function gen(prompt: string, size: string, outPath: string) {
  try {
    const zai = await ZAI.create();
    const res = await zai.images.generations.create({ prompt, size });
    const b64 = res.data[0].base64;
    fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
    console.log('✓', outPath);
    return true;
  } catch (e: any) {
    console.error('✗', outPath, '-', e.message?.slice(0, 120));
    return false;
  }
}

async function main() {
  if (!fs.existsSync(GAL_DIR)) fs.mkdirSync(GAL_DIR, { recursive: true });

  // Skip hero if already exists
  if (!fs.existsSync(path.join(OUT_DIR, 'hero-gala.jpg'))) {
    await gen(
      `A premium elegant celebration poster background, deep maroon and burgundy red background with subtle gradients, prominent metallic gold accents, elegant flowing golden ribbons, gold confetti sparkles and soft bokeh circles, soft glowing evening atmosphere, premium prestigious grand celebratory mood, sophisticated ornamental elegance, high quality, cinematic lighting, symmetrical composition with empty center, ornamental filigree at edges, no text, no words, no letters. Wide cinematic banner.`,
      '1344x768',
      path.join(OUT_DIR, 'hero-gala.jpg')
    );
  } else {
    console.log('skip hero (exists)');
  }

  // Venue atmosphere
  if (!fs.existsSync(path.join(OUT_DIR, 'venue.jpg'))) {
    await gen(
      `A grand elegant evening banquet hall venue interior decorated for an anniversary celebration, warm golden lighting, ornamental decorations, maroon and gold color scheme, chandeliers, festive atmosphere, no people, cinematic wide shot, luxurious, high quality.`,
      '1344x768',
      path.join(OUT_DIR, 'venue.jpg')
    );
  }

  // Gallery photos — generic, celebratory, no people-specific triggers
  const galleryPrompts = [
    `A festive celebration scene at an elegant evening event, warm golden lighting, maroon and gold decorations, joyful atmosphere, bokeh lights, high quality, no text.`,
    `Elegant traditional attire displayed at a cultural celebration event, warm golden ambiance, maroon and gold decor, celebratory mood, high quality, no text.`,
    `A family celebration moment at a festive event, warm golden evening light, maroon and gold decorations, happy candid atmosphere, high quality, no text.`,
    `A group reunion celebration at an elegant event venue, smiling, maroon and gold decor, warm evening lighting, high quality, no text.`,
    `Happy children enjoying activities at a colorful festive carnival zone, joyful expressions, festive decorations, warm golden light, high quality, no text.`,
    `A vibrant community gathering at a festive celebration event, diverse group celebrating together, maroon and gold festive decor, warm atmosphere, high quality, no text.`,
    `An elegant anniversary gala banquet hall beautifully decorated with maroon and gold ornaments, golden chandeliers, table settings, festive evening atmosphere, no people, high quality, no text.`,
    `A distinguished speaker giving a speech at a formal anniversary dinner gala on stage, warm spotlight, elegant decor background, prestigious atmosphere, high quality, no text.`,
    `An award ceremony on stage at an elegant gala, golden trophy, maroon and gold stage decor, warm lighting, high quality, no text.`,
    `A music group performing on stage at an anniversary celebration gala, warm stage lighting, elegant maroon and gold backdrop, festive atmosphere, high quality, no text.`,
  ];

  for (let i = 0; i < galleryPrompts.length; i++) {
    const out = path.join(GAL_DIR, `gallery-${i + 1}.jpg`);
    if (fs.existsSync(out)) { console.log('skip', out); continue; }
    await gen(galleryPrompts[i], '1024x1024', out);
  }

  // Pending gallery photos
  await gen(
    `A visitor taking a photo at an exhibition booth during a festive celebration, warm golden lighting, maroon and gold decor, candid moment, high quality, no text.`,
    '1024x1024',
    path.join(GAL_DIR, 'gallery-pending-1.jpg')
  );
  await gen(
    `A bustling food court area at a festive celebration event, maroon and gold decorations, warm evening atmosphere, people enjoying food, high quality, no text.`,
    '1024x1024',
    path.join(GAL_DIR, 'gallery-pending-2.jpg')
  );

  console.log('🎉 Done!');
}

main().catch((e) => { console.error(e); process.exit(1); });
