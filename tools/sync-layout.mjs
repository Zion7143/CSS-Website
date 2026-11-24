// Copies the HEADER and FOOTER blocks from index.html into every page inside pages/,
// so you only have to edit them once (in index.html).   Run:  npm run sync
// Links are adjusted automatically (pages/about.html -> about.html, images/… -> ../images/…).
import fs from 'fs';

const source = fs.readFileSync('index.html', 'utf8');
const block = (name) => source.match(new RegExp(`<!-- ${name} START[\\s\\S]*?<!-- ${name} END -->`))?.[0];
const blocks = ['HEADER', 'FOOTER'].map((name) => ({ name, html: block(name) }));
if (blocks.some((b) => !b.html)) throw new Error('index.html must contain the HEADER and FOOTER START/END comments.');

// index.html links -> links that work from inside pages/
const forPages = (html) =>
  html
    .replace(/href="pages\/([a-z-]+\.html)"/g, 'href="$1"')
    .replace(/href="index\.html"/g, 'href="../index.html"')
    .replace(/(src|href)="(images|downloads|css|js)\//g, '$1="../$2/')
    .replace(/url\((["']?)(images|downloads)\//g, 'url($1../$2/');

for (const file of fs.readdirSync('pages').filter((f) => f.endsWith('.html'))) {
  const path = `pages/${file}`;
  let page = fs.readFileSync(path, 'utf8');
  for (const { name, html } of blocks)
    page = page.replace(new RegExp(`<!-- ${name} START[\\s\\S]*?<!-- ${name} END -->`), () => forPages(html));
  fs.writeFileSync(path, page);
  console.log('updated', path);
}
