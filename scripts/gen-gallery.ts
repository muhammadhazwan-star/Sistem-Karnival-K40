import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const GAL_DIR = '/home/z/my-project/public/images/gallery';

const prompts: { name: string; prompt: string }[] = [
  { name: 'gallery-3.jpg', prompt: 'Elegant traditional attire displayed at a cultural celebration event, warm golden ambiance, maroon and gold decor, celebratory mood, high quality, no text.' },
  { name: 'gallery-4.jpg', prompt: 'A family celebration moment at a festive event, warm golden evening light, maroon and gold decorations, happy candid atmosphere, high quality, no text.' },
  { name: 'gallery-5.jpg', prompt: 'A group reunion celebration at an elegant event venue, smiling, maroon and gold decor, warm evening lighting, high quality, no text.' },
  { name: 'gallery-6.jpg', prompt: 'Happy children enjoying activities at a colorful festive carnival zone, joyful expressions, festive decorations, warm golden light, high quality, no text.' },
  { name: 'gallery-7.jpg', prompt: 'A vibrant community gathering at a festive celebration event, diverse group celebrating together, maroon and gold festive decor, warm atmosphere, high quality, no text.' },
  { name: 'gallery-8.jpg', prompt: 'An elegant anniversary gala banquet hall beautifully decorated with maroon and gold ornaments, golden chandeliers, table settings, festive evening atmosphere, no people, high quality, no text.' },
  { name: 'gallery-9.jpg', prompt: 'A distinguished speaker giving a speech at a formal anniversary dinner gala on stage, warm spotlight, elegant decor background, prestigious atmosphere, high quality, no text.' },
  { name: 'gallery-10.jpg', prompt: 'An award ceremony on stage at an elegant gala, golden trophy, maroon and gold stage decor, warm lighting, high quality, no text.' },
  { name: 'gallery-pending-1.jpg', prompt: 'A visitor taking a photo at an exhibition booth during a festive celebration, warm golden lighting, maroon and gold decor, candid moment, high quality, no text.' },
  { name: 'gallery-pending-2.jpg', prompt: 'A bustling food court area at a festive celebration event, maroon and gold decorations, warm evening atmosphere, people enjoying food, high quality, no text.' },
];

async function genOne(name: string, prompt: string) {
  const out = path.join(GAL_DIR, name);
  if (fs.existsSync(out)) { console.log('skip', name); return; }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const zai = await ZAI.create();
      const res = await zai.images.generations.create({ prompt, size: '1024x1024' });
      fs.writeFileSync(out, Buffer.from(res.data[0].base64, 'base64'));
      console.log('✓', name);
      return;
    } catch (e: any) {
      console.log(`✗ ${name} attempt ${attempt}:`, e.message?.slice(0, 80));
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

async function main() {
  for (const p of prompts) {
    await genOne(p.name, p.prompt);
  }
  console.log('🎉 Done!');
}
main();
