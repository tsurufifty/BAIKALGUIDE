import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { Locale } from '@/i18n/routing';
import { getRouteBySlug } from '@/lib/api';
import type { BlockNode } from '@/lib/types';

export const dynamic = 'force-dynamic';

function blocksToText(blocks?: BlockNode[] | null): string {
  if (!blocks) return '';
  return blocks
    .map((b) => (b.children ?? []).map((c) => c.text ?? '').join(''))
    .filter(Boolean)
    .join('\n\n');
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(' ')) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    lines.push(line);
  }
  return lines;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale, slug } = await params;
  const route = await getRouteBySlug(locale as Locale, slug);
  if (!route) return new Response('Not found', { status: 404 });

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  // Embed a Cyrillic-capable font; fall back to Helvetica (Latin only) if absent.
  let font: PDFFont;
  let bold: PDFFont;
  try {
    const dir = path.join(process.cwd(), 'public', 'fonts');
    font = await pdf.embedFont(await readFile(path.join(dir, 'Montserrat-Regular.ttf')), { subset: true });
    bold = await pdf.embedFont(await readFile(path.join(dir, 'Montserrat-SemiBold.ttf')), { subset: true });
  } catch {
    font = await pdf.embedFont(StandardFonts.Helvetica);
    bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  }

  const page = pdf.addPage([595, 842]); // A4
  const margin = 56;
  const maxWidth = 595 - margin * 2;
  let y = 786;
  const green = rgb(0.12, 0.3, 0.23);
  const dark = rgb(0.1, 0.1, 0.1);

  page.drawText(route.title, { x: margin, y, size: 24, font: bold, color: green });
  y -= 34;

  const meta = [route.duration, route.season, route.difficulty].filter(Boolean).join('  ·  ');
  page.drawText(meta, { x: margin, y, size: 11, font, color: rgb(0.5, 0.5, 0.5) });
  y -= 30;

  for (const line of wrap(blocksToText(route.description), font, 12, maxWidth)) {
    if (y < margin) break;
    page.drawText(line, { x: margin, y, size: 12, font, color: dark, lineHeight: 16 });
    y -= 18;
  }

  page.drawText('baikal-guide.ru', { x: margin, y: 32, size: 9, font, color: rgb(0.6, 0.6, 0.6) });

  const bytes = await pdf.save();
  return new Response(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${slug}.pdf"`,
    },
  });
}
