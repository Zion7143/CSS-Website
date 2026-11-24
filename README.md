# CCS Website — HTML + CSS + JavaScript

College of Computer Studies, De La Salle John Bosco College.
Each kind of file has one job:

| | Files | Job |
|---|---|---|
| **HTML** | `index.html`, `pages/*.html` | **Structure and content only** — headings, text, links, images. The only styling hook is a meaningful class name, e.g. `class="site-header__logo"`. |
| **CSS** | `css/style.css` (built) ← `tools/design.css` (source) | **All of the design.** Every class name used in the HTML is defined here (colors, spacing, fonts, layout, hover effects, mobile layout). |
| **JavaScript** | `js/script.js` | **Behaviour** — menus, search, settings panel, popups, filters, calendar, form validation. |

```
ccs-website/
├── index.html          ← the Home page
├── pages/              ← all the other pages
├── css/style.css       ← the stylesheet the pages load (generated — see "Changing the design")
├── js/script.js        ← all the interactivity
├── images/             ← home/ (logo, hero)  contact/ (campus map, email photo)  news/  faculty/  programs/
├── downloads/          ← the PDF files
└── tools/              ← design.css (the CSS source) and optional helpers
```

## Run it
Double-click `index.html`. (For the Google font you need internet; without it a default font is used.)

## Changing the design
The look lives in **`tools/design.css`**. Each rule is a class from the HTML with its styling written as Tailwind utilities:

```css
.site-nav__link {
  @apply flex items-center px-4 py-3 text-sm font-medium transition-colors hover:bg-black/15;
}
```
To change something: find the class (Ctrl+F the name you see in the HTML, e.g. `site-nav__link`), edit its values, then rebuild:
```bash
npm install        # first time only (needs Node.js)
npm run css        # rebuilds css/style.css      (or: npm run watch  — rebuilds every time you save)
```
`css/style.css` is generated from `tools/design.css`, so make your edits in `tools/design.css`.
(You may use plain CSS properties in any rule too: `.site-nav__link { background: #123; }`.)

`tools/design.css` sections: **1** base & accessibility (plain CSS) · **2** components (one rule per class, grouped by block) · **3** states that JavaScript switches on/off · **4** high-contrast mode.

### How the class names work
Names follow `block__element`: `site-header` is a block, `site-header__logo` is a part of it, `calendar__day--…` / `event-card …` are variations.
State classes are added by JavaScript: `is-active`, `is-open`, `is-selected`, `is-on`, `is-used`, `is-filtered`, `is-today`, `has-error`, … Their look is in section 3 of `tools/design.css`.

## Where to edit things
| I want to change… | Edit |
|---|---|
| Page text, headings, faculty names, program details, downloads list | the page's `.html` file |
| Colors, fonts, spacing, hover effects, mobile layout of anything | `tools/design.css`, then `npm run css` |
| **News & announcements** (home, announcements, news pages) | `js/script.js` → SECTION 3 (DATA) → `events` |
| **Academic calendar** events | `js/script.js` → SECTION 3 (DATA) → `calendarEvents` |
| Menu items, header, footer | the `HEADER` / `FOOTER` block in `index.html`, then run `npm run sync` (copies it to every page) |
| What the search box can find | `js/script.js` → SECTION 4 (SEARCH INDEX) — news and calendar are added automatically |
| Popups (news details, confirm message, map, PDF preview) | the template functions in SECTION 6 (PAGES) of `js/script.js`; their styling is in `tools/design.css` |
| Logo and hero photo | `images/home/logo.png`, `images/home/hero-bg.jpg` |
| Background photos of the three Contact-page cards | `tools/design.css` → search `contact-card__photo--` (they are CSS, so paths start with `../images/…`) |
| Campus map and Email-card photo | `images/contact/campus-map.jpg`, `images/contact/email-us.jpg` |
| Other photos / PDFs | `images/news/`, `images/faculty/`, `images/programs/`, `downloads/` — keep the file names, or update the `src` / `href` in the HTML |

Dates in the data use `YYYY-MM-DD`. `kind` is `'announcement'` or `'news'`. News photos are written like `images/news/photo.jpg`
(the script adds the right `../` for the page you're on); online `https://…` links also work.
Paths inside `pages/*.html` start with `../` (for example `../images/home/logo.png`) because those pages are one folder deeper than `index.html`.

## Host it on GitHub Pages
1. Create a **public** repository on github.com.
2. Upload the **contents** of this folder (drag everything in; `index.html` must be at the top level).
3. **Settings → Pages → Deploy from a branch → main → / (root) → Save.**
4. Your site appears at `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.

## About `js/script.js`
One plain script (not an ES module, so it also works when opened straight from a folder), in six sections:
1. **SETUP** — knows whether it is on `index.html` or inside `pages/`
2. **HELPERS** — escape text, build attributes, focus trap, page links
3. **DATA** — news, announcements, calendar + date helpers
4. **SEARCH INDEX** — entries for the header search
5. **LAYOUT** — shared by all pages: menus, search, settings (text size / high contrast / reduce motion), toast, student-portal notice, arrow-key navigation
6. **PAGES** — per-page behaviour, chosen by `<body data-page="…">`

The popups and lists that JavaScript builds (news cards, calendar, search results…) use the same class names as the HTML pages, so all styling stays in one place.

## Notes
- The header and footer are written into every page (so each page is complete HTML). Change them in `index.html`, then run `npm run sync`.
- The news, announcements and calendar pages (and the home-page lists) are filled by JavaScript from the data in `js/script.js`; without JavaScript they show a short notice.
- Some news photos in the data are online (Unsplash) links; replace them with your own files when ready.
- The PDFs in `downloads/` are placeholders until the Registrar provides the official files (keep the same file names).
