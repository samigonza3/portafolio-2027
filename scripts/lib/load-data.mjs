// Carga los módulos TypeScript de src/data (seo, posts, faqs, herramientas)
// desde Node, compilándolos al vuelo con esbuild (ya viene con Vite).
import { build } from 'esbuild';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

export async function loadData() {
  const out = mkdtempSync(join(tmpdir(), 'seo-data-'));
  try {
    await build({
      absWorkingDir: ROOT,
      entryPoints: {
        seo: 'src/data/seo.ts',
        posts: 'src/data/posts.ts',
        faqs: 'src/data/faqs.ts',
        herramientas: 'src/data/herramientas.ts',
        contacto: 'src/data/contacto.ts',
      },
      bundle: true,
      format: 'esm',
      platform: 'node',
      outdir: out,
      outExtension: { '.js': '.mjs' },
      logLevel: 'silent',
    });
    const load = (n) => import(pathToFileURL(join(out, `${n}.mjs`)).href);
    const [seo, posts, faqs, herramientas, contacto] = await Promise.all(
      ['seo', 'posts', 'faqs', 'herramientas', 'contacto'].map(load)
    );
    return { seo, posts: posts.posts, faqs, herramientas: herramientas.herramientas, contacto: contacto.CONTACTO };
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
}

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Páginas que deben aparecer en sitemap.xml y llms.txt.
export function indexablePages(seo) {
  return seo.PAGES.filter((p) => !p.noindex && !p.canonicalPath);
}
