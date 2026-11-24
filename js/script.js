/* ======================================================================
   script.js — all the JavaScript for the website, in one file.

   Sections (search for the "SECTION" word to jump between them):
     1. SETUP        — where this page lives (index.html or pages/…)
     2. HELPERS      — small helper functions
     3. DATA         — news, announcements and the academic calendar  ← edit these
     4. SEARCH INDEX — what the header search box can find
     5. LAYOUT       — header, menus, search, settings panel, toast, portal notice
     6. PAGES        — popups, filters, calendar, downloads, contact form
   ====================================================================== */

/* SECTION 1 — SETUP ----------------------------------------------------- */
// '' on index.html, '../' on pages inside pages/  (set by <body data-root="…"> in each page)
const ROOT = document.body.dataset.root || '';

/* SECTION 2 — HELPERS --------------------------------------------------- */
// Escape text for use inside HTML
function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Join arrays of HTML strings; false / null / undefined print nothing
function J(value) {
  if (Array.isArray(value)) return value.map(J).join('');
  return value === false || value === null || value === undefined || value === true ? '' : String(value);
}

// Build one HTML attribute:  attr('aria-expanded', true) -> ' aria-expanded="true"'
function attr(name, value) {
  const stringy = /^(aria-|data-)/.test(name);
  if (value === null || value === undefined) return '';
  if (value === false) return stringy ? ` ${name}="false"` : '';
  if (value === true) return stringy ? ` ${name}="true"` : ` ${name}`;
  return ` ${name}="${esc(value)}"`;
}

// {backgroundImage: 'url(x)'} -> 'background-image:url(x)'
function css(styles) {
  return Object.entries(styles || {})
    .map(([k, v]) => `${k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}:${v}`)
    .join(';');
}

// Turn an HTML string into a DOM element
function htmlToElement(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild;
}

// Lock page scrolling while a modal is open
function lockScroll(locked) {
  document.body.style.overflow = locked ? 'hidden' : '';
}

// Keep Tab inside a modal (wraps from last to first control and back)
function trapTab(event, container, selector = 'button, a[href], input, select, textarea') {
  if (event.key !== 'Tab') return;
  const items = Array.from(container.querySelectorAll(selector)).filter((el) => el.offsetParent !== null);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

// Link to a page:  ''  -> index.html,  'bsit' -> pages/bsit.html   (ROOT adds the "../" when you are inside pages/)
function pageUrl(route) {
  return route ? `${ROOT}pages/${route}.html` : `${ROOT}index.html`;
}

// Is this link the page we are on? (compares real addresses, so ../index.html and index.html both match the home page)
function samePage(url) {
  const clean = (path) => path.replace(/index\.html$/, '');
  return clean(new URL(url, window.location.href).pathname) === clean(window.location.pathname);
}

/* SECTION 3 — DATA ------------------------------------------------------ */
/* =====================================================================
   DATA — edit news, announcements and the academic calendar here.

   • events          → News & Events and Latest Announcements (home, announcements.html, news.html)
   • calendarEvents  → Academic Calendar (calendar.html)
   Dates use YYYY-MM-DD.  kind: 'announcement' | 'news'.  photo: image path or URL ('' = logo placeholder).
   Everything below the data arrays is helper code used by the pages.
   ===================================================================== */

const events = [
  {
    kind: `announcement`,
    start: `2026-08-03`,
    end: `2026-08-14`,
    tag: `Enrollment`,
    title: `HIED Enrollment for SY 2026–2027`,
    desc: `Enrollment for incoming and continuing Higher Education students runs from August 3 to 14, 2026.`,
    photo: `https://images.unsplash.com/photo-1781039229695-2f29da1efd6c?w=900&h=560&fit=crop&auto=format&q=80`,
  },
  {
    kind: `announcement`,
    start: `2026-08-17`,
    tag: `Classes`,
    title: `Opening of Classes, SY 2026–2027 (First Trimester)`,
    desc: `Classes for the First Trimester of the new school year officially begin on August 17, 2026.`,
    photo: `https://images.unsplash.com/photo-1663162551013-8bb8ab151e11?w=900&h=560&fit=crop&auto=format&q=80`,
  },
  {
    kind: `announcement`,
    start: `2026-09-17`,
    tag: `Students`,
    title: `HIED Socialization`,
    desc: `A gathering for Higher Education students to connect with peers, organizations and the college community.`,
    photo: `https://images.unsplash.com/photo-1758270704763-22072a90d3b6?w=900&h=560&fit=crop&auto=format&q=80`,
  },
  {
    kind: `announcement`,
    start: `2026-10-01`,
    end: `2026-10-03`,
    tag: `Examinations`,
    title: `HIED Midterm Examination — First Trimester`,
    desc: `Midterm examinations for the First Trimester are scheduled from October 1 to 3, 2026.`,
    photo: `https://images.unsplash.com/photo-1758270704025-0e1a1793e1ca?w=900&h=560&fit=crop&auto=format&q=80`,
  },
  {
    kind: `news`,
    start: `2026-07-01`,
    end: `2026-08-01`,
    tag: `Outreach`,
    title: `Balik Eskwela Balik Pag-Asa Donation Drive`,
    desc: `The community-wide donation drive begins on July 1, culminates on July 31, and distribution follows on August 1.`,
    photo: `https://images.unsplash.com/photo-1593113616828-6f22bca04804?w=900&h=560&fit=crop&auto=format&q=80`,
  },
  {
    kind: `news`,
    start: `2026-07-17`,
    tag: `Faith`,
    title: `School Wide Mass — Jubilarian Thanksgiving Mass`,
    desc: `The DLSJBC community gathers to give thanks with this year’s jubilarians.`,
    photo: `https://images.unsplash.com/photo-1476900164809-ff19b8ae5968?w=900&h=560&fit=crop&auto=format&q=80`,
  },
  {
    kind: `news`,
    start: `2026-07-18`,
    tag: `Celebration`,
    title: `Academes Night`,
    desc: `A night of recognition celebrating excellence as part of Araw ng Mangagoy.`,
    photo: `images/news/academes-night.jpg`,
  },
  {
    kind: `news`,
    start: `2026-07-19`,
    tag: `Community`,
    title: `Araw ng Mangagoy`,
    desc: `DLSJBC joins the Mangagoy community in its annual day of celebration.`,
    photo: `https://images.unsplash.com/photo-1746090303347-948370d92e9b?w=900&h=560&fit=crop&auto=format&q=80`,
  },
  {
    kind: `news`,
    start: `2026-08-17`,
    tag: `Welcome`,
    title: `Hugyaw sa Sinugdanan 2026 (HIED Welcome Program)`,
    desc: `A new beginning and a shared vision: the Higher Education welcome program for the new school year.`,
    photo: `images/news/hugyaw.jpg`,
  },
  {
    kind: `news`,
    start: `2026-09-11`,
    tag: `Faith`,
    title: `Schoolwide Mass`,
    desc: `The whole school community comes together for Mass.`,
    photo: `https://images.unsplash.com/photo-1495667496513-9068843d7679?w=900&h=560&fit=crop&auto=format&q=80`,
  },
  {
    kind: `news`,
    start: `2026-09-18`,
    tag: `Community`,
    title: `Bislig Charter Day`,
    desc: `DLSJBC joins the city of Bislig in celebrating its Charter Day.`,
    photo: `https://images.unsplash.com/photo-1581513118044-696c147c1a66?w=900&h=560&fit=crop&auto=format&q=80`,
  },
  {
    kind: `news`,
    start: `2026-10-01`,
    tag: `Faith`,
    title: `Rosary Month and Share a Blessing Launching Activity`,
    desc: `The Holy Rosary Month opens with the Share a Blessing launching activity.`,
    photo: `images/news/rosary-month.jpg`,
  },
  {
    kind: `news`,
    start: `2026-10-05`,
    tag: `Recognition`,
    title: `World Teachers’ Day`,
    desc: `Honoring teachers and their dedication to the formation of every Lasallian.`,
    photo: `https://images.unsplash.com/photo-1758270704925-fa59d93119c1?w=900&h=560&fit=crop&auto=format&q=80`,
  },
  {
    kind: `news`,
    start: `2026-10-30`,
    tag: `Faith`,
    title: `Rosary Month Culminating Activity`,
    desc: `The community closes the Holy Rosary Month with a culminating activity.`,
    photo: `https://images.unsplash.com/photo-1476873282730-9018f17bdf4e?w=900&h=560&fit=crop&auto=format&q=80`,
  },
];
const MONTHS_SHORT = [
  `Jan`,
  `Feb`,
  `Mar`,
  `Apr`,
  `May`,
  `Jun`,
  `Jul`,
  `Aug`,
  `Sep`,
  `Oct`,
  `Nov`,
  `Dec`,
];
const splitDate = (e) => ({
  y: e.slice(0, 4),
  m: MONTHS_SHORT[Number(e.slice(5, 7)) - 1],
  d: e.slice(8),
});
const MONTHS_FULL = [
  `January`,
  `February`,
  `March`,
  `April`,
  `May`,
  `June`,
  `July`,
  `August`,
  `September`,
  `October`,
  `November`,
  `December`,
];
function formatEventDate(e) {
  let t = splitDate(e.start),
    n = (e) => MONTHS_FULL[Number(e.slice(5, 7)) - 1];
  if (!e.end || e.end === e.start) return `${n(e.start)} ${Number(t.d)}, ${t.y}`;
  let r = splitDate(e.end);
  return `${n(e.start)} ${Number(t.d)} – ${n(e.end)} ${Number(r.d)}, ${r.y}`;
}
const getEventsByKind = (e) =>
  events.filter((t) => t.kind === e).sort((e, t) => (e.start < t.start ? 1 : -1));
// Local photos are written relative to the project folder (images/news/…); ROOT adds the right "../" for the page you are on.
for (const item of events) {
  if (item.photo && !/^(https?:)?\/\//.test(item.photo)) item.photo = ROOT + item.photo;
}

const upcomingAnnouncements = getEventsByKind(`announcement`)
  .reverse()
  .map((e) => ({
    month: splitDate(e.start).m.toUpperCase(),
    day: splitDate(e.start).d,
    title: e.title,
    desc: formatEventDate(e),
    src: e,
  }));
const newsGallery = getEventsByKind(`news`)
  .filter((e) => e.photo?.startsWith(`${ROOT}images/news/`))
  .map((e) => ({
    date: formatEventDate(e),
    title: e.title,
    desc: e.desc,
    img: e.photo,
    src: e,
  }));



const TERM_LABELS = [
  `1st Term: August – November`,
  `2nd Term: December – March`,
  `3rd Term: April – July`,
];
const calendarEvents = [
  {
    start: `2026-07-01`,
    end: `2026-07-01`,
    title: `Launching of the Balik Eskwela Balik Pag-Asa Donation Drive`,
  },
  {
    start: `2026-07-17`,
    end: `2026-07-17`,
    title: `School Wide Mass — Jubilarian Thanksgiving Mass`,
  },
  {
    start: `2026-07-18`,
    end: `2026-07-18`,
    title: `Academes Night`,
  },
  {
    start: `2026-07-19`,
    end: `2026-07-19`,
    title: `Araw ng Mangagoy`,
  },
  {
    start: `2026-07-31`,
    end: `2026-07-31`,
    title: `Culminating Activity — Balik Eskwela Balik Pag-Asa Donation Drive`,
  },
  {
    start: `2026-08-01`,
    end: `2026-08-01`,
    title: `Distribution — Balik-Eskwela Balik Pag-Asa Donation Drive`,
  },
  {
    start: `2026-08-01`,
    end: `2026-08-01`,
    title: `The Rock Radio Hip-Hop Dance Contest`,
  },
  {
    start: `2026-08-03`,
    end: `2026-08-14`,
    title: `HIED Enrollment for SY 2026-2027`,
  },
  {
    start: `2026-08-17`,
    end: `2026-08-17`,
    title: `HIED Opening of Classes SY 2026-2027 (First Trimester)`,
  },
  {
    start: `2026-08-17`,
    end: `2026-08-17`,
    title: `Hugyaw sa Sinugdanan 2026 (HIED Welcome Program)`,
  },
  {
    start: `2026-08-21`,
    end: `2026-08-21`,
    title: `Ninoy Aquino Day`,
  },
  {
    start: `2026-08-31`,
    end: `2026-08-31`,
    title: `National Heroes Day`,
  },
  {
    start: `2026-09-11`,
    end: `2026-09-11`,
    title: `Schoolwide Mass`,
  },
  {
    start: `2026-09-17`,
    end: `2026-09-17`,
    title: `HIED Socialization`,
  },
  {
    start: `2026-09-18`,
    end: `2026-09-18`,
    title: `Bislig Charter Day`,
  },
  {
    start: `2026-10-01`,
    end: `2026-10-01`,
    title: `Rosary Month and Share a Blessing Launching Activity`,
  },
  {
    start: `2026-10-01`,
    end: `2026-10-03`,
    title: `HIED Midterm Examination — First Trimester`,
  },
  {
    start: `2026-10-05`,
    end: `2026-10-05`,
    title: `World Teachers' Day`,
  },
  {
    start: `2026-10-30`,
    end: `2026-10-30`,
    title: `Rosary Month Culminating Activity`,
  },
];
const pad2 = (e) => String(e).padStart(2, `0`);
const toIsoDate = (e, t, n) => `${e}-${pad2(t + 1)}-${pad2(n)}`;
const TERMS = [
  {
    name: `1st Term`,
    range: `Aug – Nov`,
  },
  {
    name: `2nd Term`,
    range: `Dec – Mar`,
  },
  {
    name: `3rd Term`,
    range: `Apr – Jul`,
  },
];
function formatCalendarRange(e) {
  let t = new Date(e.start + `T00:00:00`),
    n = new Date(e.end + `T00:00:00`);
  return e.start === e.end
    ? ((e) => `${MONTHS_FULL[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`)(t)
    : `${MONTHS_FULL[t.getMonth()].slice(0, 3)} ${t.getDate()} – ${MONTHS_FULL[n.getMonth()].slice(0, 3)} ${n.getDate()}, ${n.getFullYear()}`;
}
const REGULAR_HOLIDAY = `Regular holiday`;
const SPECIAL_HOLIDAY = `Special non-working day`;
function getEasterDate(e) {
  let t = e % 19,
    n = Math.floor(e / 100),
    r = e % 100,
    i = Math.floor(n / 4),
    a = n % 4,
    o = Math.floor((n + 8) / 25),
    s = Math.floor((n - o + 1) / 3),
    c = (19 * t + n - i - s + 15) % 30,
    l = Math.floor(r / 4),
    u = r % 4,
    d = (32 + 2 * a + 2 * l - c - u) % 7,
    f = Math.floor((t + 11 * c + 22 * d) / 451),
    p = Math.floor((c + d - 7 * f + 114) / 31),
    m = ((c + d - 7 * f + 114) % 31) + 1;
  return new Date(e, p - 1, m);
}
const dateToIso = (e) => toIsoDate(e.getFullYear(), e.getMonth(), e.getDate());
function getHolidays(e) {
  let t = getEasterDate(e),
    n = (n) => dateToIso(new Date(e, t.getMonth(), t.getDate() + n)),
    r = new Date(e, 7, 31);
  for (; r.getDay() !== 1;) r.setDate(r.getDate() - 1);
  let i = (e, t, n) => ({
    start: e,
    end: e,
    title: t,
    holiday: n,
  });
  return [
    i(toIsoDate(e, 0, 1), `New Year's Day`, REGULAR_HOLIDAY),
    i(n(-3), `Maundy Thursday`, REGULAR_HOLIDAY),
    i(n(-2), `Good Friday`, REGULAR_HOLIDAY),
    i(n(-1), `Black Saturday`, SPECIAL_HOLIDAY),
    i(toIsoDate(e, 3, 9), `Araw ng Kagitingan (Day of Valor)`, REGULAR_HOLIDAY),
    i(toIsoDate(e, 4, 1), `Labor Day`, REGULAR_HOLIDAY),
    i(toIsoDate(e, 5, 12), `Independence Day`, REGULAR_HOLIDAY),
    i(toIsoDate(e, 7, 21), `Ninoy Aquino Day`, SPECIAL_HOLIDAY),
    i(dateToIso(r), `National Heroes Day`, REGULAR_HOLIDAY),
    i(toIsoDate(e, 10, 1), `All Saints' Day`, SPECIAL_HOLIDAY),
    i(toIsoDate(e, 10, 2), `All Souls' Day`, SPECIAL_HOLIDAY),
    i(toIsoDate(e, 10, 30), `Bonifacio Day`, REGULAR_HOLIDAY),
    i(toIsoDate(e, 11, 8), `Feast of the Immaculate Conception`, SPECIAL_HOLIDAY),
    i(toIsoDate(e, 11, 24), `Christmas Eve`, SPECIAL_HOLIDAY),
    i(toIsoDate(e, 11, 25), `Christmas Day`, REGULAR_HOLIDAY),
    i(toIsoDate(e, 11, 30), `Rizal Day`, REGULAR_HOLIDAY),
    i(toIsoDate(e, 11, 31), `New Year's Eve`, SPECIAL_HOLIDAY),
  ];
}
const baseCalendarEvents = calendarEvents.filter(
  (e) => ![`Ninoy Aquino Day`, `National Heroes Day`].includes(e.title),
);
const getTermIndex = (e) => (e >= 7 && e <= 10 ? 0 : e === 11 || e <= 2 ? 1 : 2);

/* SECTION 4 — SEARCH INDEX ---------------------------------------------- */
const SEARCH_QUICK_LINKS = [
  {
    "title": "About the College of Computer Studies",
    "section": "About CCS",
    "route": "about",
    "text": ""
  },
  {
    "title": "BSIT and BSCS programs",
    "section": "Programs",
    "route": "bsit",
    "text": ""
  },
  {
    "title": "Academic Calendar",
    "section": "Resources",
    "route": "calendar",
    "text": ""
  },
  {
    "title": "Latest Announcements",
    "section": "News & Announcements",
    "route": "announcements",
    "text": ""
  },
  {
    "title": "Contact Us",
    "section": "Phone, email and campus map",
    "route": "contact",
    "text": ""
  }
];

const SEARCH_INDEX = [
 {
  "title": "College of Computer Studies",
  "section": "About CCS",
  "route": "about",
  "text": "College of Computer Studies About CCS BSCS and BSIT — forming competent, innovative, and ethical computing professionals."
 },
 {
  "title": "Overview",
  "section": "College of Computer Studies",
  "route": "about",
  "anchor": "Overview",
  "text": "Overview The College of Computer Studies (CCS) is committed to developing competent, innovative, and ethically responsible computing professionals equipped with the knowledge, technical skills, and values needed to thrive in the rapidly evolving digital world. Through quality instruction, experiential learning, research, and community engagement, the College prepares students to become globally competitive graduates capable of addressing real-world challenges through technology."
 },
 {
  "title": "Vision",
  "section": "College of Computer Studies",
  "route": "about",
  "anchor": "Vision",
  "text": "Vision De La Salle John Bosco is a leading Lasallian educational institution inspired by the life and teachings of Jesus Christ in providing a nurturing learning environment for the holistic formation of the members of the community and partners."
 },
 {
  "title": "Mission",
  "section": "College of Computer Studies",
  "route": "about",
  "anchor": "Mission",
  "text": "Mission Animated by the Lasallian core values, De La Salle John Bosco College promotes the advancement of academic, research and technological excellence, culture of innovation, and vocation and sustainable community engagement."
 },
 {
  "title": "Departmental Objectives",
  "section": "College of Computer Studies",
  "route": "about",
  "anchor": "Departmental Objectives",
  "text": "Departmental Objectives Provide relevant and responsive academic programs imbued with the skills, attitudes and values needed to develop qualified, highly trained and professionalized Filipino Lasallian graduates dedicated to the service of others. Instill appreciation of the Lasallian values of self-actualization and the continuous quest for the fulfillment of each student’s dreams and vision. Dedicate the student’s Lasallian education to the transformation of a just and humane environment, enabling them to be of service to their own school and community."
 },
 {
  "title": "Provide relevant and responsive academic programs imbued with the skills, attitudes and values needed to develop qualified, highly trained and professionalized Filipino Lasallian graduates dedicated to the service of others.",
  "section": "College of Computer Studies › Departmental Objectives",
  "route": "about",
  "anchor": "Departmental Objectives",
  "text": "Provide relevant and responsive academic programs imbued with the skills, attitudes and values needed to develop qualified, highly trained and professionalized Filipino Lasallian graduates dedicated to the service of others."
 },
 {
  "title": "Instill appreciation of the Lasallian values of self-actualization and the continuous quest for the fulfillment of each student’s dreams and vision.",
  "section": "College of Computer Studies › Departmental Objectives",
  "route": "about",
  "anchor": "Departmental Objectives",
  "text": "Instill appreciation of the Lasallian values of self-actualization and the continuous quest for the fulfillment of each student’s dreams and vision."
 },
 {
  "title": "Dedicate the student’s Lasallian education to the transformation of a just and humane environment, enabling them to be of service to their own school and community.",
  "section": "College of Computer Studies › Departmental Objectives",
  "route": "about",
  "anchor": "Departmental Objectives",
  "text": "Dedicate the student’s Lasallian education to the transformation of a just and humane environment, enabling them to be of service to their own school and community."
 },
 {
  "title": "Program Outcomes",
  "section": "College of Computer Studies",
  "route": "about",
  "anchor": "Program Outcomes",
  "text": "Program Outcomes After completion of the program, graduates are expected to: Perform computing-related tasks effectively and efficiently in accordance with industry standards in the development, management, and maintenance of computer-based systems. Undertake roles and responsibilities in software development, networking, database management, technical support, and system administration in business, government, and private organizations following recognized competency standards. Analyze computing problems, identify technical issues, and implement appropriate solutions through proper system design, programming, troubleshooting, and application of technological tools."
 },
 {
  "title": "Perform computing-related tasks effectively and efficiently in accordance with industry standards in the development, management, and maintenance of computer-based systems.",
  "section": "College of Computer Studies › Program Outcomes",
  "route": "about",
  "anchor": "Program Outcomes",
  "text": "Perform computing-related tasks effectively and efficiently in accordance with industry standards in the development, management, and maintenance of computer-based systems."
 },
 {
  "title": "Undertake roles and responsibilities in software development, networking, database management, technical support, and system administration in business, government, and private organizations following recognized competency standards.",
  "section": "College of Computer Studies › Program Outcomes",
  "route": "about",
  "anchor": "Program Outcomes",
  "text": "Undertake roles and responsibilities in software development, networking, database management, technical support, and system administration in business, government, and private organizations following recognized competency standards."
 },
 {
  "title": "Analyze computing problems, identify technical issues, and implement appropriate solutions through proper system design, programming, troubleshooting, and application of technological tools.",
  "section": "College of Computer Studies › Program Outcomes",
  "route": "about",
  "anchor": "Program Outcomes",
  "text": "Analyze computing problems, identify technical issues, and implement appropriate solutions through proper system design, programming, troubleshooting, and application of technological tools."
 },
 {
  "title": "Academic Services",
  "section": "College of Computer Studies",
  "route": "about",
  "anchor": "Academic Services",
  "text": "Academic Services Academic Advising Research and Capstone Advising Internship / OJT Coordination Student Organization Support Industry Linkages Facilities: Computer Laboratories, Programming Laboratory, Networking Laboratory, Internet-Enabled Learning Environment"
 },
 {
  "title": "Academic Advising",
  "section": "College of Computer Studies › Academic Services",
  "route": "about",
  "anchor": "Academic Services",
  "text": "Academic Advising"
 },
 {
  "title": "Research and Capstone Advising",
  "section": "College of Computer Studies › Academic Services",
  "route": "about",
  "anchor": "Academic Services",
  "text": "Research and Capstone Advising"
 },
 {
  "title": "Internship / OJT Coordination",
  "section": "College of Computer Studies › Academic Services",
  "route": "about",
  "anchor": "Academic Services",
  "text": "Internship / OJT Coordination"
 },
 {
  "title": "Student Organization Support",
  "section": "College of Computer Studies › Academic Services",
  "route": "about",
  "anchor": "Academic Services",
  "text": "Student Organization Support"
 },
 {
  "title": "Industry Linkages",
  "section": "College of Computer Studies › Academic Services",
  "route": "about",
  "anchor": "Academic Services",
  "text": "Industry Linkages"
 },
 {
  "title": "Facilities: Computer Laboratories, Programming Laboratory, Networking Laboratory, Internet-Enabled Learning Environment",
  "section": "College of Computer Studies › Academic Services",
  "route": "about",
  "anchor": "Academic Services",
  "text": "Facilities: Computer Laboratories, Programming Laboratory, Networking Laboratory, Internet-Enabled Learning Environment"
 },
 {
  "title": "Excellence & Accreditation",
  "section": "College of Computer Studies",
  "route": "about",
  "anchor": "Excellence & Accreditation",
  "text": "Excellence & Accreditation The College delivers quality education through competent faculty, updated curricula, industry-relevant instruction, and continuous program improvement, aligning its academic programs with the standards and policies of the Commission on Higher Education (CHED). CHED-recognized degree programs Outcomes-Based Education (OBE) implementation Industry-aligned curriculum Qualified and competent faculty Modern computer laboratories Internship and industry partnerships Research and extension initiatives"
 },
 {
  "title": "CHED-recognized degree programs",
  "section": "College of Computer Studies › Excellence & Accreditation",
  "route": "about",
  "anchor": "Excellence & Accreditation",
  "text": "CHED-recognized degree programs"
 },
 {
  "title": "Outcomes-Based Education (OBE) implementation",
  "section": "College of Computer Studies › Excellence & Accreditation",
  "route": "about",
  "anchor": "Excellence & Accreditation",
  "text": "Outcomes-Based Education (OBE) implementation"
 },
 {
  "title": "Industry-aligned curriculum",
  "section": "College of Computer Studies › Excellence & Accreditation",
  "route": "about",
  "anchor": "Excellence & Accreditation",
  "text": "Industry-aligned curriculum"
 },
 {
  "title": "Qualified and competent faculty",
  "section": "College of Computer Studies › Excellence & Accreditation",
  "route": "about",
  "anchor": "Excellence & Accreditation",
  "text": "Qualified and competent faculty"
 },
 {
  "title": "Modern computer laboratories",
  "section": "College of Computer Studies › Excellence & Accreditation",
  "route": "about",
  "anchor": "Excellence & Accreditation",
  "text": "Modern computer laboratories"
 },
 {
  "title": "Internship and industry partnerships",
  "section": "College of Computer Studies › Excellence & Accreditation",
  "route": "about",
  "anchor": "Excellence & Accreditation",
  "text": "Internship and industry partnerships"
 },
 {
  "title": "Research and extension initiatives",
  "section": "College of Computer Studies › Excellence & Accreditation",
  "route": "about",
  "anchor": "Excellence & Accreditation",
  "text": "Research and extension initiatives"
 },
 {
  "title": "Industry & Institutional Partners",
  "section": "College of Computer Studies",
  "route": "about",
  "anchor": "Industry & Institutional Partners",
  "text": "Industry & Institutional Partners Technical Education and Skills Development Authority (TESDA) Department of Information and Communications Technology (DICT) Philippine Society of Information Technology Educators (PSITE)"
 },
 {
  "title": "Technical Education and Skills Development Authority (TESDA)",
  "section": "College of Computer Studies › Industry & Institutional Partners",
  "route": "about",
  "anchor": "Industry & Institutional Partners",
  "text": "Technical Education and Skills Development Authority (TESDA)"
 },
 {
  "title": "Department of Information and Communications Technology (DICT)",
  "section": "College of Computer Studies › Industry & Institutional Partners",
  "route": "about",
  "anchor": "Industry & Institutional Partners",
  "text": "Department of Information and Communications Technology (DICT)"
 },
 {
  "title": "Philippine Society of Information Technology Educators (PSITE)",
  "section": "College of Computer Studies › Industry & Institutional Partners",
  "route": "about",
  "anchor": "Industry & Institutional Partners",
  "text": "Philippine Society of Information Technology Educators (PSITE)"
 },
 {
  "title": "Bachelor of Science in Information Technology (BSIT)",
  "section": "Programs",
  "route": "bsit",
  "text": "Bachelor of Science in Information Technology (BSIT) Programs The BSIT program prepares students to design, implement, manage, and maintain information systems and technology infrastructures."
 },
 {
  "title": "Bachelor of Science in Computer Science (BSCS)",
  "section": "Programs",
  "route": "bscs",
  "text": "Bachelor of Science in Computer Science (BSCS) Programs The BSCS program focuses on the study of computing theories, algorithms, software development, artificial intelligence, data science, cybersecurity, and emerging technologies."
 },
 {
  "title": "Faculty & Staff",
  "section": "Faculty & Staff",
  "route": "faculty",
  "text": "Faculty & Staff Faculty & Staff The College delivers quality education through competent faculty and continuous program improvement."
 },
 {
  "title": "Our Faculty",
  "section": "Faculty & Staff",
  "route": "faculty",
  "anchor": "Our Faculty",
  "text": "Our Faculty CCS is served by qualified and competent faculty who provide instruction, academic advising, research and capstone advising, and internship / OJT coordination."
 },
 {
  "title": "Academic Services & Faculty Responsibilities",
  "section": "Faculty & Staff",
  "route": "faculty",
  "anchor": "Academic Services & Faculty Responsibilities",
  "text": "Academic Services & Faculty Responsibilities Our faculty members extend their expertise beyond the classroom to provide comprehensive support across key areas: Academic Advising Guiding students through curriculum mapping, degree progression, retention standards, and career path alignment. Research and Capstone Advising Mentoring student groups through system development lifecycles, rigorous software engineering methodologies, and applied computing research. Internship / OJT Coordination Bridging classroom theory with industry practice by monitoring On-the-Job Training performance and liaising with corporate partners. Student Organization Support Advising student tech communities, coding clubs, and extracurricular initiatives to foster leadership and peer collaboration. Industry Linkages Forging strategic partnerships to keep curriculum."
 },
 {
  "title": "Academic Advising",
  "section": "Faculty & Staff › Academic Services & Faculty Responsibilities",
  "route": "faculty",
  "anchor": "Academic Services & Faculty Responsibilities",
  "text": "Academic Advising Guiding students through curriculum mapping, degree progression, retention standards, and career path alignment."
 },
 {
  "title": "Research and Capstone Advising",
  "section": "Faculty & Staff › Academic Services & Faculty Responsibilities",
  "route": "faculty",
  "anchor": "Academic Services & Faculty Responsibilities",
  "text": "Research and Capstone Advising Mentoring student groups through system development lifecycles, rigorous software engineering methodologies, and applied computing research."
 },
 {
  "title": "Internship / OJT Coordination",
  "section": "Faculty & Staff › Academic Services & Faculty Responsibilities",
  "route": "faculty",
  "anchor": "Academic Services & Faculty Responsibilities",
  "text": "Internship / OJT Coordination Bridging classroom theory with industry practice by monitoring On-the-Job Training performance and liaising with corporate partners."
 },
 {
  "title": "Student Organization Support",
  "section": "Faculty & Staff › Academic Services & Faculty Responsibilities",
  "route": "faculty",
  "anchor": "Academic Services & Faculty Responsibilities",
  "text": "Student Organization Support Advising student tech communities, coding clubs, and extracurricular initiatives to foster leadership and peer collaboration."
 },
 {
  "title": "Industry Linkages",
  "section": "Faculty & Staff › Academic Services & Faculty Responsibilities",
  "route": "faculty",
  "anchor": "Academic Services & Faculty Responsibilities",
  "text": "Industry Linkages Forging strategic partnerships to keep curriculum."
 },
 {
  "title": "Glogerlie Jumandos",
  "section": "Faculty & Staff › Dean, College of Computer Studies",
  "route": "faculty",
  "text": "Glogerlie Jumandos Dean, College of Computer Studies"
 },
 {
  "title": "Ronalyn Goyo",
  "section": "Faculty & Staff › Program In-Charge, College of Computer Studies",
  "route": "faculty",
  "text": "Ronalyn Goyo Program In-Charge, College of Computer Studies"
 },
 {
  "title": "Lawrence Albert Libar",
  "section": "Faculty & Staff › Faculty",
  "route": "faculty",
  "text": "Lawrence Albert Libar Faculty"
 },
 {
  "title": "Student Portal (LMS)",
  "section": "Students",
  "route": "student-portal",
  "text": "Student Portal (LMS) Students Access your online classes, learning materials, grades and announcements through the DLSJBC student portal."
 },
 {
  "title": "What You Can Do",
  "section": "Student Portal (LMS)",
  "route": "student-portal",
  "anchor": "What You Can Do",
  "text": "What You Can Do View enrolled subjects and course materials Submit activities and take online assessments Check grades and academic standing Receive class and college announcements"
 },
 {
  "title": "View enrolled subjects and course materials",
  "section": "Student Portal (LMS) › What You Can Do",
  "route": "student-portal",
  "anchor": "What You Can Do",
  "text": "View enrolled subjects and course materials"
 },
 {
  "title": "Submit activities and take online assessments",
  "section": "Student Portal (LMS) › What You Can Do",
  "route": "student-portal",
  "anchor": "What You Can Do",
  "text": "Submit activities and take online assessments"
 },
 {
  "title": "Check grades and academic standing",
  "section": "Student Portal (LMS) › What You Can Do",
  "route": "student-portal",
  "anchor": "What You Can Do",
  "text": "Check grades and academic standing"
 },
 {
  "title": "Receive class and college announcements",
  "section": "Student Portal (LMS) › What You Can Do",
  "route": "student-portal",
  "anchor": "What You Can Do",
  "text": "Receive class and college announcements"
 },
 {
  "title": "Need Help Signing In?",
  "section": "Student Portal (LMS)",
  "route": "student-portal",
  "anchor": "Need Help Signing In?",
  "text": "Need Help Signing In? Use your student ID and the password issued by the registrar. If you forgot your password or cannot log in, email info@dlsjbc.edu.ph or call (086) 853 3415."
 },
 {
  "title": "Course Offerings & Class Schedules",
  "section": "Students",
  "route": "courses",
  "text": "Course Offerings & Class Schedules Students Review the subjects offered each term and the latest class schedules for A.Y. 2026–2027."
 },
 {
  "title": "Academic Terms",
  "section": "Course Offerings & Class Schedules",
  "route": "courses",
  "anchor": "Academic Terms",
  "text": "Academic Terms 1st Term: August – November 2nd Term: December – March 3rd Term: April – July"
 },
 {
  "title": "1st Term: August – November",
  "section": "Course Offerings & Class Schedules › Academic Terms",
  "route": "courses",
  "anchor": "Academic Terms",
  "text": "1st Term: August – November"
 },
 {
  "title": "2nd Term: December – March",
  "section": "Course Offerings & Class Schedules › Academic Terms",
  "route": "courses",
  "anchor": "Academic Terms",
  "text": "2nd Term: December – March"
 },
 {
  "title": "3rd Term: April – July",
  "section": "Course Offerings & Class Schedules › Academic Terms",
  "route": "courses",
  "anchor": "Academic Terms",
  "text": "3rd Term: April – July"
 },
 {
  "title": "Course Offerings",
  "section": "Course Offerings & Class Schedules",
  "route": "courses",
  "anchor": "Course Offerings",
  "text": "Course Offerings The Course Outline & Prospectus for BSCS and BSIT will be available soon."
 },
 {
  "title": "Class Schedules",
  "section": "Course Offerings & Class Schedules",
  "route": "courses",
  "anchor": "Class Schedules",
  "text": "Class Schedules Official section schedules are posted on the Latest Announcements page at the start of every term. Students are advised to confirm their schedules with their program chair."
 },
 {
  "title": "Forms & Requirements",
  "section": "Students",
  "route": "forms",
  "text": "Forms & Requirements Students Common forms and documents needed for CCS student transactions."
 },
 {
  "title": "Enrollment Requirements",
  "section": "Forms & Requirements",
  "route": "forms",
  "anchor": "Enrollment Requirements",
  "text": "Enrollment Requirements Accomplished enrollment form Report card / Transcript of Records Certificate of good moral character PSA birth certificate (new students) 2x2 ID pictures"
 },
 {
  "title": "Accomplished enrollment form",
  "section": "Forms & Requirements › Enrollment Requirements",
  "route": "forms",
  "anchor": "Enrollment Requirements",
  "text": "Accomplished enrollment form"
 },
 {
  "title": "Report card / Transcript of Records",
  "section": "Forms & Requirements › Enrollment Requirements",
  "route": "forms",
  "anchor": "Enrollment Requirements",
  "text": "Report card / Transcript of Records"
 },
 {
  "title": "Certificate of good moral character",
  "section": "Forms & Requirements › Enrollment Requirements",
  "route": "forms",
  "anchor": "Enrollment Requirements",
  "text": "Certificate of good moral character"
 },
 {
  "title": "PSA birth certificate (new students)",
  "section": "Forms & Requirements › Enrollment Requirements",
  "route": "forms",
  "anchor": "Enrollment Requirements",
  "text": "PSA birth certificate (new students)"
 },
 {
  "title": "2x2 ID pictures",
  "section": "Forms & Requirements › Enrollment Requirements",
  "route": "forms",
  "anchor": "Enrollment Requirements",
  "text": "2x2 ID pictures"
 },
 {
  "title": "Common Student Forms",
  "section": "Forms & Requirements",
  "route": "forms",
  "anchor": "Common Student Forms",
  "text": "Common Student Forms Change of subject / adding and dropping form Leave of absence request Request for certification or records Shifting of program form Practicum / OJT endorsement request"
 },
 {
  "title": "Change of subject / adding and dropping form",
  "section": "Forms & Requirements › Common Student Forms",
  "route": "forms",
  "anchor": "Common Student Forms",
  "text": "Change of subject / adding and dropping form"
 },
 {
  "title": "Leave of absence request",
  "section": "Forms & Requirements › Common Student Forms",
  "route": "forms",
  "anchor": "Common Student Forms",
  "text": "Leave of absence request"
 },
 {
  "title": "Request for certification or records",
  "section": "Forms & Requirements › Common Student Forms",
  "route": "forms",
  "anchor": "Common Student Forms",
  "text": "Request for certification or records"
 },
 {
  "title": "Shifting of program form",
  "section": "Forms & Requirements › Common Student Forms",
  "route": "forms",
  "anchor": "Common Student Forms",
  "text": "Shifting of program form"
 },
 {
  "title": "Practicum / OJT endorsement request",
  "section": "Forms & Requirements › Common Student Forms",
  "route": "forms",
  "anchor": "Common Student Forms",
  "text": "Practicum / OJT endorsement request"
 },
 {
  "title": "Where to Submit",
  "section": "Forms & Requirements",
  "route": "forms",
  "anchor": "Where to Submit",
  "text": "Where to Submit Submit forms to the CCS office or the Registrar during office hours, Monday to Friday."
 },
 {
  "title": "Latest Announcements",
  "section": "News & Announcements",
  "route": "announcements",
  "text": "Latest Announcements News & Announcements Official notices for Higher Education students, based on the school calendar."
 },
 {
  "title": "News & Events",
  "section": "News & Announcements",
  "route": "news",
  "text": "News & Events News & Announcements Activities and celebrations from the DLSJBC school calendar."
 },
 {
  "title": "Downloads & Guidelines",
  "section": "Resources",
  "route": "downloads",
  "text": "Downloads & Guidelines Resources Handbooks, guidelines and templates for CCS students."
 },
 {
  "title": "Academic Calendar",
  "section": "Resources",
  "route": "calendar",
  "text": "Academic Calendar Resources Browse the school calendar and Philippine holidays for any month and year."
 },
 {
  "title": "Contact Us",
  "section": "Contact Us",
  "route": "contact",
  "text": "Contact Us Contact Us Questions about admissions, programs or student services? Reach out and the right office will get back to you."
 },
 {
  "title": "Bachelor of Science in Information Technology (BSIT)",
  "section": "Programs",
  "route": "bsit",
  "text": "BSIT Bachelor of Science in Information Technology (BSIT) The Bachelor of Science in Information Technology (BSIT) program focuses on the installation, operation, customization, development, maintenance, and administration of computing technologies and infrastructure. It prepares students to evaluate organizational needs and design, implement, and manage practical IT solutions to support business processes and end-user goals. Students gain hands-on experience in software development, web and mobile systems, database administration, networking, and information security, ensuring they are equipped to meet the evolving technology demands of modern industries."
 },
 {
  "title": "BSIT Program Overview",
  "section": "Programs",
  "route": "bsit",
  "anchor": "Program Overview",
  "text": "The Bachelor of Science in Information Technology (BSIT) program focuses on the installation, operation, customization, development, maintenance, and administration of computing technologies and infrastructure. It prepares students to evaluate organizational needs and design, implement, and manage practical IT solutions to support business processes and end-user goals. Students gain hands-on experience in software development, web and mobile systems, database administration, networking, and information security, ensuring they are equipped to meet the evolving technology demands of modern industries."
 },
 {
  "title": "Systems Integration & Infrastructure",
  "section": "BSIT › Program Highlights",
  "route": "bsit",
  "anchor": "Program Highlights",
  "text": "Systems Integration & Infrastructure Planning, configuring, and managing network and cloud-based environments."
 },
 {
  "title": "Full-Stack & Mobile App Development",
  "section": "BSIT › Program Highlights",
  "route": "bsit",
  "anchor": "Program Highlights",
  "text": "Full-Stack & Mobile App Development Designing end-to-end applications tailored for enterprise and mobile platforms."
 },
 {
  "title": "Database & Information Management",
  "section": "BSIT › Program Highlights",
  "route": "bsit",
  "anchor": "Program Highlights",
  "text": "Database & Information Management Structuring, securing, and querying data for business intelligence and operations."
 },
 {
  "title": "Cybersecurity & IT Governance",
  "section": "BSIT › Program Highlights",
  "route": "bsit",
  "anchor": "Program Highlights",
  "text": "Cybersecurity & IT Governance Implementing security policies, patch management protocols, and risk mitigation strategies."
 },
 {
  "title": "Capstone & OJT",
  "section": "BSIT › Program Highlights",
  "route": "bsit",
  "anchor": "Program Highlights",
  "text": "Capstone & OJT Applying technical skillsets through industry-standard capstone projects and real-world internship experiences."
 },
 {
  "title": "Software / Systems Developer",
  "section": "BSIT › Career Opportunities",
  "route": "bsit",
  "anchor": "Career Opportunities",
  "text": "Software / Systems Developer career job"
 },
 {
  "title": "Web and Mobile Application Developer",
  "section": "BSIT › Career Opportunities",
  "route": "bsit",
  "anchor": "Career Opportunities",
  "text": "Web and Mobile Application Developer career job"
 },
 {
  "title": "Database Administrator",
  "section": "BSIT › Career Opportunities",
  "route": "bsit",
  "anchor": "Career Opportunities",
  "text": "Database Administrator career job"
 },
 {
  "title": "Network & Systems Administrator",
  "section": "BSIT › Career Opportunities",
  "route": "bsit",
  "anchor": "Career Opportunities",
  "text": "Network & Systems Administrator career job"
 },
 {
  "title": "IT Security & Information Analyst",
  "section": "BSIT › Career Opportunities",
  "route": "bsit",
  "anchor": "Career Opportunities",
  "text": "IT Security & Information Analyst career job"
 },
 {
  "title": "UI/UX Designer & Usability Analyst",
  "section": "BSIT › Career Opportunities",
  "route": "bsit",
  "anchor": "Career Opportunities",
  "text": "UI/UX Designer & Usability Analyst career job"
 },
 {
  "title": "IT Project Coordinator / OJT Specialist",
  "section": "BSIT › Career Opportunities",
  "route": "bsit",
  "anchor": "Career Opportunities",
  "text": "IT Project Coordinator / OJT Specialist career job"
 },
 {
  "title": "Technical Support & Systems Consultant",
  "section": "BSIT › Career Opportunities",
  "route": "bsit",
  "anchor": "Career Opportunities",
  "text": "Technical Support & Systems Consultant career job"
 },
 {
  "title": "Bachelor of Science in Computer Science (BSCS)",
  "section": "Programs",
  "route": "bscs",
  "text": "BSCS Bachelor of Science in Computer Science (BSCS) The Bachelor of Science in Computer Science (BSCS) program focuses on the algorithmic principles, mathematical foundations, and theoretical concepts that drive modern computing systems. It emphasizes software design, algorithm analysis, computer architecture, and intelligent systems engineering. Students learn to solve complex computational problems, optimize hardware-software performance, and build innovative computing technologies—ranging from machine learning models and computer graphics to distributed networks and systems software."
 },
 {
  "title": "BSCS Program Overview",
  "section": "Programs",
  "route": "bscs",
  "anchor": "Program Overview",
  "text": "The Bachelor of Science in Computer Science (BSCS) program focuses on the algorithmic principles, mathematical foundations, and theoretical concepts that drive modern computing systems. It emphasizes software design, algorithm analysis, computer architecture, and intelligent systems engineering. Students learn to solve complex computational problems, optimize hardware-software performance, and build innovative computing technologies—ranging from machine learning models and computer graphics to distributed networks and systems software."
 },
 {
  "title": "Algorithms & Data Structures",
  "section": "BSCS › Program Highlights",
  "route": "bscs",
  "anchor": "Program Highlights",
  "text": "Algorithms & Data Structures Designing efficient computational procedures and logic structures."
 },
 {
  "title": "Software Engineering & System Architecture",
  "section": "BSCS › Program Highlights",
  "route": "bscs",
  "anchor": "Program Highlights",
  "text": "Software Engineering & System Architecture Applying systematic lifecycles, patterns, and low-level memory management to system design."
 },
 {
  "title": "Artificial Intelligence & Data Science",
  "section": "BSCS › Program Highlights",
  "route": "bscs",
  "anchor": "Program Highlights",
  "text": "Artificial Intelligence & Data Science Building intelligent systems, computer vision applications, and data-driven prediction models."
 },
 {
  "title": "Computer Architecture & Low-Level Computing",
  "section": "BSCS › Program Highlights",
  "route": "bscs",
  "anchor": "Program Highlights",
  "text": "Computer Architecture & Low-Level Computing Understanding digital logic gates, hardware abstraction, and operating system mechanics."
 },
 {
  "title": "Computing Research",
  "section": "BSCS › Program Highlights",
  "route": "bscs",
  "anchor": "Program Highlights",
  "text": "Computing Research Conducting empirical research, theoretical modeling, and experimental evaluations."
 },
 {
  "title": "Software Architect / Software Engineer",
  "section": "BSCS › Career Opportunities",
  "route": "bscs",
  "anchor": "Career Opportunities",
  "text": "Software Architect / Software Engineer career job"
 },
 {
  "title": "AI / Machine Learning Engineer",
  "section": "BSCS › Career Opportunities",
  "route": "bscs",
  "anchor": "Career Opportunities",
  "text": "AI / Machine Learning Engineer career job"
 },
 {
  "title": "Data Scientist & Analytics Specialist",
  "section": "BSCS › Career Opportunities",
  "route": "bscs",
  "anchor": "Career Opportunities",
  "text": "Data Scientist & Analytics Specialist career job"
 },
 {
  "title": "Algorithms / Embedded Systems Developer",
  "section": "BSCS › Career Opportunities",
  "route": "bscs",
  "anchor": "Career Opportunities",
  "text": "Algorithms / Embedded Systems Developer career job"
 },
 {
  "title": "Cybersecurity Researcher / Ethical Hacker",
  "section": "BSCS › Career Opportunities",
  "route": "bscs",
  "anchor": "Career Opportunities",
  "text": "Cybersecurity Researcher / Ethical Hacker career job"
 },
 {
  "title": "Game Developer & Graphics Programmer",
  "section": "BSCS › Career Opportunities",
  "route": "bscs",
  "anchor": "Career Opportunities",
  "text": "Game Developer & Graphics Programmer career job"
 },
 {
  "title": "Systems Software Developer",
  "section": "BSCS › Career Opportunities",
  "route": "bscs",
  "anchor": "Career Opportunities",
  "text": "Systems Software Developer career job"
 },
 {
  "title": "Academic Researcher & Computing Educator",
  "section": "BSCS › Career Opportunities",
  "route": "bscs",
  "anchor": "Career Opportunities",
  "text": "Academic Researcher & Computing Educator career job"
 },
 {
  "title": "Student Handbook",
  "section": "Resources › Downloads & Guidelines",
  "route": "downloads",
  "text": "Student Handbook The college’s policies, student rights and responsibilities, code of conduct, and academic regulations that every CCS student should know. download"
 },
 {
  "title": "CCS Curriculum Checklists (BSIT, BSCS)",
  "section": "Resources › Downloads & Guidelines",
  "route": "downloads",
  "text": "CCS Curriculum Checklists (BSIT, BSCS) Subject-by-subject checklists for the BSIT and BSCS programs, used to track completed and remaining courses toward graduation. download"
 },
 {
  "title": "Capstone / Thesis Guidelines",
  "section": "Resources › Downloads & Guidelines",
  "route": "downloads",
  "text": "Capstone / Thesis Guidelines Requirements, formatting and defense procedures for capstone projects and thesis work, including adviser and panel guidance. download"
 },
 {
  "title": "Practicum (OJT) Guidelines",
  "section": "Resources › Downloads & Guidelines",
  "route": "downloads",
  "text": "Practicum (OJT) Guidelines Requirements, hours, documentation and evaluation procedures for the internship / On-the-Job Training program. download"
 },
 {
  "title": "Laboratory Rules and Regulations",
  "section": "Resources › Downloads & Guidelines",
  "route": "downloads",
  "text": "Laboratory Rules and Regulations Proper use, safety and conduct policies for the computer, programming and networking laboratories. download"
 },
 {
  "title": "Phone: (086) 853 3415",
  "section": "Contact Us",
  "route": "contact",
  "text": "phone telephone call number contact (086) 853 3415"
 },
 {
  "title": "Email: info@dlsjbc.edu.ph",
  "section": "Contact Us",
  "route": "contact",
  "text": "email mail info@dlsjbc.edu.ph contact"
 },
 {
  "title": "Address: La Salle Drive, Mangagoy, Bislig",
  "section": "Contact Us",
  "route": "contact",
  "text": "address location where map campus La Salle Drive Mangagoy Bislig Philippines 8311 visit"
 },
 {
  "title": "Campus map",
  "section": "Contact Us",
  "route": "contact",
  "anchor": "Campus map",
  "text": "campus map layout directions location"
 },
 {
  "title": "Student Portal (LMS)",
  "section": "Students",
  "route": "student-portal",
  "text": "student portal lms login grades online classes password"
 },
 {
  "title": "Enrollment",
  "section": "Latest Announcements",
  "route": "announcements",
  "text": "enrollment enroll admission register registration apply"
 }
];

/* SECTION 5 — LAYOUT ---------------------------------------------------- */
/* =====================================================================
   layout.js — everything that is the same on every page:
   header & navigation, search box, settings panel, toast messages,
   student-portal notice, keyboard navigation.

   The HTML for the header, nav and footer lives in each .html file.
   This script only adds behaviour to it.
   ===================================================================== */
(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  // Shared with pages.js
  const CCS = (window.CCS = window.CCS || {});

  /* ------------------------------------------------------------------
     1. Settings (text size, high contrast, reduce motion) — saved in localStorage
     ------------------------------------------------------------------ */
  const DEFAULT_SETTINGS = { text: 'default', motion: false, contrast: false };

  function loadSettings() {
    try {
      const saved = { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem('ccs-settings') || '{}') };
      if (saved.text !== 'default' && saved.text !== 'large') saved.text = 'large';
      return saved;
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function applySettings(settings) {
    const html = document.documentElement;
    if (settings.text === 'default') html.removeAttribute('data-text');
    else html.setAttribute('data-text', settings.text);
    html.classList.toggle('reduce-motion', settings.motion);
    html.classList.toggle('high-contrast', settings.contrast);
    try {
      localStorage.setItem('ccs-settings', JSON.stringify(settings));
    } catch {
      /* storage can be blocked (private mode) — settings then last for this page only */
    }
  }

  let settings = loadSettings();
  applySettings(settings);

  /* ------------------------------------------------------------------
     2. Toast message (bottom of the screen, disappears after 4 seconds)
     ------------------------------------------------------------------ */
  let toastTimer;
  function showToast(message) {
    const region = $('[role="status"][aria-live]');
    window.clearTimeout(toastTimer);
    region.innerHTML = message
      ? `<div class="toast"><span class="settings-panel__switch-text">${esc(message)}</span><button aria-label="Dismiss message" class="toast__dismiss">✕</button></div>`
      : '';
    if (message) toastTimer = window.setTimeout(() => (region.innerHTML = ''), 4000);
  }
  $('[role="status"][aria-live]').addEventListener('click', (event) => {
    if (event.target.closest('button')) showToast(null);
  });
  CCS.showToast = showToast;

  /* ------------------------------------------------------------------
     3. Overlay helper — settings panel and portal notice share the same pattern
     ------------------------------------------------------------------ */
  function makeOverlay(name, { onOpen, onKeydown } = {}) {
    const overlay = $(`[data-overlay="${name}"]`);
    const dialog = $('[role="dialog"], [role="alertdialog"]', overlay);
    let returnFocus = null;

    function open() {
      returnFocus = document.activeElement;
      overlay.hidden = false;
      if (onOpen) onOpen();
      $('button', dialog)?.focus();
    }
    function close() {
      if (overlay.hidden) return;
      overlay.hidden = true;
      returnFocus?.focus();
    }
    overlay.addEventListener('click', (event) => {
      if (!dialog.contains(event.target)) close(); // click on the dark backdrop
    });
    dialog.addEventListener('keydown', (event) => onKeydown && onKeydown(event, dialog));
    return { overlay, dialog, open, close, isOpen: () => !overlay.hidden };
  }

  /* ---- Settings panel ---- */

  function syncSettingsPanel() {
    const panel = settingsPanel.dialog;
    $$('[role="radio"]', panel).forEach((button, index) => {
      const value = ['default', 'large'][index];
      const selected = settings.text === value;
      button.setAttribute('aria-checked', String(selected));
      button.classList.toggle('is-selected', selected);
    });
    $$('[role="switch"]', panel).forEach((button, index) => {
      const key = ['contrast', 'motion'][index];
      const on = settings[key];
      button.setAttribute('aria-checked', String(on));
      button.classList.toggle('is-on', on);
    });
  }

  function changeSettings(next) {
    settings = next;
    applySettings(settings);
    syncSettingsPanel();
  }

  const settingsPanel = makeOverlay('settings', {
    onOpen: syncSettingsPanel,
    onKeydown: (event, dialog) => trapTab(event, dialog, 'button, a[href], input'),
  });
  settingsPanel.dialog.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.getAttribute('aria-label') === 'Close settings') return settingsPanel.close();
    if (button.getAttribute('role') === 'radio') {
      const index = $$('[role="radio"]', settingsPanel.dialog).indexOf(button);
      return changeSettings({ ...settings, text: ['default', 'large'][index] });
    }
    if (button.getAttribute('role') === 'switch') {
      const key = ['contrast', 'motion'][$$('[role="switch"]', settingsPanel.dialog).indexOf(button)];
      return changeSettings({ ...settings, [key]: !settings[key] });
    }
    if (button.textContent.trim() === 'Reset') {
      changeSettings({ ...DEFAULT_SETTINGS });
      showToast('Settings were reset to default.');
    }
  });
  $$('button[aria-label="Settings"]').forEach((button) =>
    button.addEventListener('click', settingsPanel.open)
  );

  /* ---- Student portal notice ---- */
  const portalNotice = makeOverlay('portal', {
    onKeydown: (event) => event.key === 'Tab' && event.preventDefault(),
  });
  portalNotice.dialog.addEventListener('click', (event) => {
    if (event.target.closest('button')) portalNotice.close();
  });
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-portal]')) portalNotice.open();
  });
  CCS.openPortalNotice = portalNotice.open;

  /* ------------------------------------------------------------------
     4. Header height (used to keep the mobile nav under the header)
     ------------------------------------------------------------------ */
  const header = $('header');
  const setHeaderHeight = () =>
    document.documentElement.style.setProperty('--hdr', `${header.getBoundingClientRect().height}px`);
  setHeaderHeight();
  if ('ResizeObserver' in window) new ResizeObserver(setHeaderHeight).observe(header);

  /* ------------------------------------------------------------------
     5. Navigation: current page highlight, mobile menu, dropdown menus
     ------------------------------------------------------------------ */
  const nav = $('nav');
  const navList = $('ul', nav);
  const ACTIVE = 'is-active';

  // Highlight the item for the current page
  $$('li.site-nav__item', navList).forEach((item) => {
    const link = $(':scope > a[data-nav-top]', item);
    const menuButton = $(':scope > button[data-nav-top]', item);
    const inMenu = $$('[data-dropdown] a', item).some((a) => samePage(a.getAttribute('href')));
    if (link && samePage(link.getAttribute('href'))) link.classList.add(ACTIVE);
    if (menuButton && inMenu) menuButton.classList.add(ACTIVE);
    if (menuButton && inMenu) menuButton.dataset.current = '';
  });

  // Mobile menu button
  const menuToggle = $('button[aria-label="Toggle menu"]');
  function setMobileMenu(open) {
    navList.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    $('[data-icon="menu"]', menuToggle).toggleAttribute('hidden', open);
    $('[data-icon="close"]', menuToggle).toggleAttribute('hidden', !open);
  }
  menuToggle.addEventListener('click', () => setMobileMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));

  // Dropdown menus (only one open at a time)
  let openMenu = null;
  function setOpenMenu(label) {
    openMenu = label;
    $$('li.site-nav__item', navList).forEach((item) => {
      const button = $(':scope > button[data-nav-top]', item);
      const panel = $('[data-dropdown]', item);
      if (!button || !panel) return;
      const isOpen = button.dataset.hasMenu === label;
      panel.hidden = !isOpen;
      button.setAttribute('aria-expanded', String(isOpen));
      $('svg', button)?.classList.toggle('is-open', isOpen);
      button.classList.toggle(ACTIVE, isOpen || 'current' in button.dataset);
    });
  }
  navList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-nav-top]');
    if (button) setOpenMenu(openMenu === button.dataset.hasMenu ? null : button.dataset.hasMenu);
  });
  // Clicking anywhere outside the open menu's own item closes it
  document.addEventListener('mousedown', (event) => {
    if (!openMenu) return;
    const openItem = $$('li.site-nav__item', navList).find((li) => $(':scope > button[data-nav-top]', li)?.dataset.hasMenu === openMenu);
    if (!openItem || !openItem.contains(event.target)) setOpenMenu(null);
  });

  // Keyboard: arrows move between menu items (same behaviour as before)
  nav.addEventListener('keydown', (event) => {
    const target = event.target;
    const tops = $$('[data-nav-top]', nav).filter((el) => el.offsetParent !== null);
    const item = target.closest('li');
    const goTop = (index) => {
      setOpenMenu(null);
      tops[(index + tops.length) % tops.length]?.focus();
    };
    if (target.hasAttribute('data-nav-top')) {
      const index = tops.indexOf(target);
      if (event.key === 'ArrowRight') (event.preventDefault(), goTop(index + 1));
      else if (event.key === 'ArrowLeft') (event.preventDefault(), goTop(index - 1));
      else if (event.key === 'Home') (event.preventDefault(), goTop(0));
      else if (event.key === 'End') (event.preventDefault(), goTop(tops.length - 1));
      else if (event.key === 'ArrowDown' && target.dataset.hasMenu) {
        event.preventDefault();
        setOpenMenu(target.dataset.hasMenu);
        requestAnimationFrame(() => $('[data-nav-sub]', item)?.focus());
      }
    } else if (target.hasAttribute('data-nav-sub') && item) {
      const subs = $$('[data-nav-sub]', item);
      const index = subs.indexOf(target);
      const top = $('[data-nav-top]', item);
      if (event.key === 'ArrowDown') (event.preventDefault(), subs[(index + 1) % subs.length].focus());
      else if (event.key === 'ArrowUp') (event.preventDefault(), index === 0 ? top?.focus() : subs[index - 1].focus());
      else if (event.key === 'Escape') (event.preventDefault(), setOpenMenu(null), top?.focus());
      else if (event.key === 'ArrowRight' && top) (event.preventDefault(), goTop(tops.indexOf(top) + 1));
      else if (event.key === 'ArrowLeft' && top) (event.preventDefault(), goTop(tops.indexOf(top) - 1));
    }
  });

  // Keyboard focus on the header/nav scrolls back to the top on desktop
  function scrollToTopOnFocus(event) {
    if (
      window.matchMedia('(min-width: 768px)').matches &&
      event.target.matches(':focus-visible') &&
      window.scrollY > 0
    )
      window.scrollTo({ top: 0 });
  }
  header.addEventListener('focusin', scrollToTopOnFocus);
  nav.addEventListener('focusin', scrollToTopOnFocus);

  /* ------------------------------------------------------------------
     6. Search box (desktop one in the header, mobile one in the menu)
     ------------------------------------------------------------------ */
  // Index = static entries (search-index.js) + news/announcements/calendar from data.js
  function buildSearchEntries() {
    const entries = SEARCH_INDEX.slice();
    for (const item of events)
      entries.push({
        title: item.title,
        section: `${item.kind === 'news' ? 'News & Events' : 'Announcements'} › ${formatEventDate(item)}`,
        route: item.kind === 'news' ? 'news' : 'announcements',
        text: `${item.title} ${item.desc} ${item.tag} ${formatEventDate(item)}`,
      });
    for (const item of calendarEvents)
      entries.push({
        title: item.title,
        section: 'Academic Calendar',
        route: 'calendar',
        text: `${item.title} ${item.start} calendar schedule date`,
      });
    return entries;
  }
  let searchEntries = null;

  function searchSite(query, limit = 8) {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    searchEntries = searchEntries || buildSearchEntries();
    const seen = new Set();
    const scored = [];
    for (const entry of searchEntries) {
      const title = entry.title.toLowerCase();
      const text = entry.text.toLowerCase();
      const section = entry.section.toLowerCase();
      if (!words.every((w) => title.includes(w) || text.includes(w) || section.includes(w))) continue;
      let score = 0;
      for (const w of words) {
        if (title === w) score += 12;
        else if (title.startsWith(w)) score += 8;
        else if (title.includes(w)) score += 6;
        else if (section.includes(w)) score += 3;
        else score += 1;
      }
      const key = `${entry.route}|${entry.title}`;
      if (seen.has(key)) continue;
      seen.add(key);
      scored.push({ entry, score });
    }
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.entry);
  }

  const search = { query: '', open: false, active: -1 }; // -1 = nothing highlighted yet
  const searchResults = () => (search.query.trim() ? searchSite(search.query) : SEARCH_QUICK_LINKS);

  const searchBoxes = $$('input[role="combobox"]').map((input) => ({
    input,
    box: input.parentElement,
    id: input.closest('nav') ? 'm' : 'd', // d = desktop (header), m = mobile (menu)
    icon: $('svg', input.parentElement),
  }));

  function renderSearch() {
    const results = searchResults();
    const used = search.open || search.query;
    for (const { input, box, id, icon } of searchBoxes) {
      if (input.value !== search.query) input.value = search.query;
      input.classList.toggle('is-used', !!used);
      icon.classList.toggle('is-used', !!used); // the magnifier hides while you use the box
      input.setAttribute('aria-expanded', String(search.open));
      if (search.open && results[search.active]) input.setAttribute('aria-activedescendant', `site-search-opt-${id}-${search.active}`);
      else input.removeAttribute('aria-activedescendant');

      $('ul', box)?.remove();
      if (!search.open) continue;
      const list = `<ul id="site-search-results-${esc(id)}" role="listbox" class="search-results ${id === 'm' ? 'search-results--mobile' : 'search-results--desktop'}">${J(
        !search.query.trim() &&
          `<li role="presentation" class="search-results__heading">Quick links · start typing to search</li>`
      )}${J(
        results.length === 0 &&
          `<li class="search-results__empty">No results for “${esc(search.query)}”. Try another keyword, such as BSIT, enrollment or calendar.</li>`
      )}${J(
        results.map(
          (entry, index) =>
            `<li id="site-search-opt-${esc(id)}-${index}" role="option" aria-selected="${index === search.active}"><button type="button" tabindex="-1" class="search-results__option${index === search.active ? ' is-active' : ''}"><div class="search-results__title">${esc(entry.title)}</div><div class="search-results__section">${esc(entry.section)}</div></button></li>`
        )
      )}</ul>`;
      box.insertAdjacentHTML('beforeend', list);
    }
  }

  // Open a search result: remember which heading to scroll to, then go to that page
  function scrollToStoredAnchor() {
    const anchor = sessionStorage.getItem('ccs-anchor');
    sessionStorage.removeItem('ccs-anchor');
    if (!anchor) return;
    setTimeout(() => {
      $$('h2, h3')
        .find((h) => h.textContent?.trim().startsWith(anchor))
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }
  function openResult(entry) {
    search.open = false;
    search.query = '';
    search.active = -1;
    setMobileMenu(false);
    renderSearch();
    if (entry.anchor) sessionStorage.setItem('ccs-anchor', entry.anchor);
    const file = pageUrl(entry.route);
    if (samePage(file)) scrollToStoredAnchor();
    else window.location.href = file;
  }

  for (const { input, box } of searchBoxes) {
    input.addEventListener('input', () => {
      search.query = input.value;
      search.active = 0;
      search.open = true;
      renderSearch();
    });
    input.addEventListener('focus', () => {
      search.open = true;
      renderSearch();
    });
    box.addEventListener('focusout', (event) => {
      if (!box.contains(event.relatedTarget)) {
        search.open = false;
        renderSearch();
      }
    });
    box.addEventListener('click', (event) => {
      const option = event.target.closest('li[role="option"]');
      if (!option) return;
      const index = $$('li[role="option"]', box).indexOf(option);
      const entry = searchResults()[index];
      if (entry) openResult(entry);
    });
    input.addEventListener('keydown', (event) => {
      const count = searchResults().length;
      if (event.key === 'ArrowDown' && count) {
        event.preventDefault();
        search.open = true;
        search.active = Math.min(search.active + 1, count - 1);
        renderSearch();
      } else if (event.key === 'ArrowUp' && count && search.active > 0) {
        event.preventDefault();
        search.active -= 1;
        renderSearch();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const entry = searchResults()[search.active];
        if (entry) openResult(entry);
        else {
          search.open = true;
          renderSearch();
        }
      } else if (event.key === 'Escape') {
        if (search.open) {
          event.stopPropagation();
          search.open = false;
          renderSearch();
        } else $('button[aria-label="Settings"]')?.focus();
      }
    });
  }
  document.addEventListener('mousedown', (event) => {
    if (search.open && !searchBoxes.some(({ box }) => box.contains(event.target))) {
      search.open = false;
      renderSearch();
    }
  });

  /* ------------------------------------------------------------------
     7. Escape closes whatever is open
     ------------------------------------------------------------------ */
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    setOpenMenu(null);
    settingsPanel.close();
    portalNotice.close();
    if (search.open) {
      search.open = false;
      renderSearch();
    }
  });

  /* ------------------------------------------------------------------
     8. Arrow-key navigation: arrow keys move focus to the nearest control
     ------------------------------------------------------------------ */
  const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function handleArrowKeys(event) {
    const direction = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }[event.key];
    if (!direction || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const horizontal = direction === 'left' || direction === 'right';
    const current = document.activeElement;
    if (!current || current === document.body || current.id === 'main-content') return;
    const tag = current.tagName;
    if (tag === 'SELECT' || tag === 'TEXTAREA' || current.isContentEditable) return;
    if (tag === 'INPUT' && !['checkbox', 'radio', 'button', 'submit'].includes(current.type) && current.value) return;

    const scope = Array.from(document.querySelectorAll('[role="dialog"][aria-modal="true"]')).filter((d) => !d.closest('[hidden]')).pop() ?? document;
    const from = current.getBoundingClientRect();
    let best = null;
    let bestScore = Infinity;
    for (const el of Array.from(scope.querySelectorAll(FOCUSABLE))) {
      if (el === current || el.classList.contains('skip-link') || current.contains(el) || el.contains(current)) continue;
      const to = el.getBoundingClientRect();
      if (to.width < 2 || to.height < 2 || getComputedStyle(el).visibility === 'hidden') continue;
      let gap, offAxis;
      if (direction === 'right') {
        if (to.left + to.width / 2 <= from.left + from.width / 2 + 2) continue;
        gap = Math.max(0, to.left - from.right);
        offAxis = Math.max(0, Math.max(to.top - from.bottom, from.top - to.bottom));
      } else if (direction === 'left') {
        if (to.left + to.width / 2 >= from.left + from.width / 2 - 2) continue;
        gap = Math.max(0, from.left - to.right);
        offAxis = Math.max(0, Math.max(to.top - from.bottom, from.top - to.bottom));
      } else if (direction === 'down') {
        if (to.top + to.height / 2 <= from.top + from.height / 2 + 2) continue;
        gap = Math.max(0, to.top - from.bottom);
        offAxis = Math.max(0, Math.max(to.left - from.right, from.left - to.right));
      } else {
        if (to.top + to.height / 2 >= from.top + from.height / 2 - 2) continue;
        gap = Math.max(0, from.top - to.bottom);
        offAxis = Math.max(0, Math.max(to.left - from.right, from.left - to.right));
      }
      const centerOffset = horizontal
        ? to.top + to.height / 2 - (from.top + from.height / 2)
        : to.left + to.width / 2 - (from.left + from.width / 2);
      const score = gap + offAxis * 3 + Math.abs(centerOffset) * 0.25;
      if (score < bestScore) {
        bestScore = score;
        best = el;
      }
    }
    if (best) {
      event.preventDefault();
      best.focus();
    }
  }
  document.addEventListener('keydown', handleArrowKeys);

  /* ------------------------------------------------------------------
     9. When a search result sent you to a heading on this page, scroll to it
     ------------------------------------------------------------------ */
  scrollToStoredAnchor();

  CCS.settings = () => settings;
  CCS.scrollToStoredAnchor = scrollToStoredAnchor;
})();

/* SECTION 6 — PAGES ----------------------------------------------------- */
/* =====================================================================
   pages.js — behaviour for individual pages.
   The page decides what to run from <body data-page="...">.

     home            → announcements + news lists, photo/detail popups
     announcements   → month/year filters, popups   (data from data.js)
     news            → month/year filters, popups   (data from data.js)
     calendar        → month grid, holidays, term buttons
     downloads       → PDF preview popup
     contact         → form validation, confirm dialog, full-size map

   The HTML structure of every popup is a template function below
   (eventModalHTML, confirmDialogHTML …) — edit those to change a popup.
   ===================================================================== */
(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const page = document.body.dataset.page;
  const overlayRoot = $('#overlay-root');

  /* ------------------------------------------------------------------
     Templates (HTML strings).  Values are escaped with esc().
     ------------------------------------------------------------------ */

  // Popup with the details of one news item / announcement
  function eventModalHTML({
    item: item,
    onClose: t
  }) {
    let date = splitDate(item.start);
    return `<div class="event-modal"><div role="dialog" aria-modal="true"${attr('aria-label', item.title)} class="event-modal__dialog"><div class="event-modal__photo">${J(item.photo ? `<img${attr('src', item.photo)}${attr('alt', item.title)} class="program-photo__image">` : `<div class="event-modal__placeholder"><img src="${ROOT}images/home/logo.png" alt="" class="event-modal__placeholder-logo"></div>`)}<div class="event-modal__date"><div class="event-modal__day">${esc(date.d)}</div><div class="event-modal__month">${esc(date.m.toUpperCase())}</div></div><button aria-label="Close" class="event-modal__close"><svg class="icon-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr('stroke-width', 2.4)}><path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6L6 18"></path></svg></button></div><div class="event-modal__body"><div class="event-modal__tags"><span class="event-modal__tag">${esc(item.tag)}</span><span class="event-modal__kind">${esc(item.kind === `news` ? `News & Events` : `Announcement`)}</span></div><h2 class="event-modal__heading">${esc(item.title)}</h2><div class="event-modal__when"><svg class="event-modal__when-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr('stroke-width', 1.8)}><circle cx="12" cy="12" r="9"></circle><path stroke-linecap="round" stroke-linejoin="round" d="M12 7v5l3 2"></path></svg>${esc(formatEventDate(item))}</div><p class="event-modal__description">${esc(item.desc)}</p><div class="event-modal__actions"><a${attr('href', item.kind === `news` ? `news.html` : `announcements.html`)} class="event-modal__primary">See all ${esc(item.kind === `news` ? `news & events` : `announcements`)}</a><button class="event-modal__secondary">Close</button></div></div></div></div>`;
  }

  // One card in the News / Announcements lists
  function eventCardHTML({
    item: item,
    onOpen: t
  }) {
    let date = splitDate(item.start);
    return `<article class="event-card"><div class="event-card__photo">${J(item.photo ? `<img${attr('src', item.photo)}${attr('alt', item.title)} loading="lazy" class="program-photo__image">` : `<div class="event-card__placeholder"><img src="${ROOT}images/home/logo.png" alt="" class="event-card__placeholder-logo"><span class="event-card__placeholder-text">Photo to be attached</span></div>`)}<div class="event-card__date"><div class="event-card__day">${esc(date.d)}</div><div class="event-card__month">${esc(date.m.toUpperCase())}</div></div><span class="event-card__tag">${esc(item.tag)}</span></div><div class="event-card__body"><h3 class="event-card__title"><button type="button" aria-haspopup="dialog" class="event-card__title-button">${esc(item.title)}</button></h3><p class="event-card__description">${esc(item.desc)}</p><div class="event-card__footer">${esc(formatEventDate(item))}</div></div></article>`;
  }

  // The whole News / Announcements page content (filters + month groups)
  function eventListHTML({
    kind: kind
  }, state) {
    let MONTH_NAMES = [`January`, `February`, `March`, `April`, `May`, `June`, `July`, `August`, `September`, `October`, `November`, `December`],
      kindEvents = getEventsByKind(kind),
      year = state.year,
      month = state.month,
      yearEvents = kindEvents.filter(e => e.start.startsWith(String(year))),
      countForMonth = e => yearEvents.filter(t => Number(t.start.slice(5, 7)) - 1 === e).length,
      groups = MONTH_NAMES.map((e, t) => ({
        m: t,
        name: e,
        items: yearEvents.filter(e => Number(e.start.slice(5, 7)) - 1 === t)
      })).filter(e => e.items.length > 0 && (month === null || e.m === month)).reverse(),
      years = Array.from({
        length: 138
      }, (e, t) => 1963 + t);
    return `<div class="stack-8"><div class="event-filter" role="group" aria-label="Browse by month and year"><label class="event-filter__label">Month<select data-act="month"${attr('value', month ?? ``)} class="event-filter__select event-filter__select--month${month === null ? `` : ` is-filtered`}"><option value="">Select a month</option>${J(MONTH_NAMES.map((e, t) => `<option${attr('value', t)}>${esc(e)}${esc(countForMonth(t) > 0 ? ` (${countForMonth(t)})` : ``)}</option>`))}</select></label><label class="event-filter__label">Year<select data-act="year"${attr('value', year)} class="event-filter__select event-filter__select--year">${J(years.map(e => `<option${attr('value', e)}>${esc(e)}</option>`))}</select></label><button data-act="all"${attr('aria-pressed', month === null)} class="event-filter__all${month === null ? ` is-active` : ``}"><span class="event-filter__all-label">${J(month === null && `<svg class="icon-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr('stroke-width', 3)}><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>`)}All-Year Round Events</span><span class="event-filter__count${month === null ? ` is-active` : ``}">${esc(yearEvents.length)}</span></button></div>${J(groups.length === 0 && `<div class="event-list__empty"><div class="event-list__empty-icon"><svg class="icon-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr('stroke-width', 1.8)}><path stroke-linecap="round" stroke-linejoin="round" d="M8 3v3M16 3v3M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1zM9 14h6"></path></svg></div><h3 class="event-list__empty-title">No ${esc(kind === `news` ? `news or events` : `announcements`)} found</h3><p class="portal-notice__hint">Nothing was posted for ${esc(month === null ? year : `${MONTH_NAMES[month]} ${year}`)}.</p><div class="event-list__empty-actions">${J(month !== null && `<button data-act="all" class="event-list__empty-primary">Show all of ${esc(year)}</button>`)}<button data-act="reset" class="event-modal__secondary">Reset filters</button></div></div>`)}${J(groups.map(e => `<section class="event-list__month"><div class="event-list__month-header"><span class="event-list__month-bar"></span><h2 class="event-list__month-title">${esc(e.name)} ${esc(year)}</h2><span class="event-list__month-count">${esc(e.items.length)} ${esc(e.items.length === 1 ? `post` : `posts`)}</span><span class="event-list__month-line"></span></div><div class="event-list__grid">${J(e.items.map(e => eventCardHTML({ item: e })))}</div></section>`))}</div>`;
  }

  // The whole Academic Calendar (term buttons, month grid, event list)
  function calendarHTML(state) {
    let view = state.view,
      selectedDay = state.selectedDay,
      pickerOpen = state.pickerOpen,
      pickerYear = state.pickerYear,
      {
        y: year,
        m: month
      } = view,
      holidaysByDate = new Map();
    for (let e of [year - 1, year, year + 1]) for (let t of getHolidays(e)) holidaysByDate.set(t.start, [...(holidaysByDate.get(t.start) ?? []), t]);
    let eventsOn = e => [...baseCalendarEvents.filter(t => t.start <= e && t.end >= e), ...(holidaysByDate.get(e) ?? [])],
      firstWeekday = new Date(year, month, 1).getDay();
    new Date(year, month + 1, 0).getDate();
    let cells = Array.from({
        length: 42
      }, (e, t) => {
        let n = new Date(year, month, 1 - firstWeekday + t);
        return {
          k: dateToIso(n),
          d: n.getDate(),
          y: n.getFullYear(),
          m: n.getMonth(),
          inMonth: n.getMonth() === month
        };
      }),
      monthDays = cells.filter(e => e.inMonth).map(e => e.k),
      monthEvents = [...baseCalendarEvents.filter(e => e.start <= monthDays[monthDays.length - 1] && e.end >= monthDays[0]), ...monthDays.flatMap(e => holidaysByDate.get(e) ?? [])].sort((e, t) => e.start < t.start ? -1 : e.start > t.start ? 1 : 0),
      listEvents = selectedDay ? eventsOn(selectedDay) : monthEvents,
      today = dateToIso(new Date()),
      termIndex = getTermIndex(month),
      focusDay = selectedDay ?? (monthDays.includes(today) ? today : monthDays[0]);
    return `<div><div class="calendar__terms">${J(TERMS.map((e, t) => `<button type="button" data-act="term" data-index="${t}"${attr('aria-pressed', t === termIndex)} class="calendar__term calendar__term--${t + 1}${t === termIndex ? ` is-selected` : ``}">${esc(e.name)}: ${esc(e.range)}</button>`))}<span class="calendar__legend-event"><span class="calendar__legend-dot"></span>School event</span><span class="calendar__legend-holiday"><span class="calendar__legend-dot--holiday"></span>Holiday</span></div><div class="calendar__layout"><div class="calendar__panel"${attr('tabindex', 0)}><div class="calendar__toolbar"><button data-act="prev-month" aria-label="Previous month" class="calendar__nav-button"><svg class="icon-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr('stroke-width', 2.4)}><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg></button><button data-act="toggle-picker"${attr('aria-expanded', pickerOpen)} class="calendar__title-button">${esc(MONTHS_FULL[month])} ${esc(year)}<svg class="calendar__chevron${pickerOpen ? ` is-open` : ``}" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr('stroke-width', 2.4)}><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"></path></svg></button><button data-act="next-month" aria-label="Next month" class="calendar__nav-button"><svg class="icon-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr('stroke-width', 2.4)}><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg></button><button data-act="today" class="calendar__today">Today</button></div>${J(pickerOpen && `<div class="calendar__picker"><div class="calendar__picker-header"><button data-act="prev-year" aria-label="Previous year" class="calendar__picker-nav">‹</button><span class="faculty-card__name">${esc(pickerYear)}</span><button data-act="next-year" aria-label="Next year" class="calendar__picker-nav">›</button></div><div class="calendar__picker-months">${J(MONTHS_FULL.map((e, t) => `<button data-act="pick-month" data-index="${t}" class="calendar__month${pickerYear === year && t === month ? ` is-selected` : ``}">${esc(e.slice(0, 3))}</button>`))}</div></div>`)}<div class="calendar__weekdays">${J([`SUN`, `MON`, `TUE`, `WED`, `THU`, `FRI`, `SAT`].map(e => `<div class="calendar__weekday">${esc(e)}</div>`))}</div><div class="calendar__days">${J(cells.map(e => {
      let t = eventsOn(e.k),
        i = selectedDay === e.k,
        a = t.some(e => e.holiday),
        o = i ? `is-selected` : e.inMonth ? t.length ? a && t.every(e => e.holiday) ? `is-holiday` : `has-events` : `is-empty` : `is-outside`;
      return `<button type="button"${attr('data-day', e.k)}${attr('tabindex', e.k === focusDay ? 0 : -1)} class="calendar__day ${o}${e.k === today && !i ? ` is-today` : ``}"><div class="calendar__day-number calendar__day-number--${a && t.every(e => e.holiday) ? `holiday` : t.length ? `events` : `muted`}">${esc(e.d)}</div>${J(t.slice(0, 2).map((e, t) => `<span${attr('title', e.title)} class="calendar__pill calendar__pill--${e.holiday ? `holiday` : t % 2 ? `alt` : `event`}">${esc(e.title)}</span>`))}${J(t.length > 2 && `<span class="calendar__more">+${esc(t.length - 2)} more</span>`)}${J(t.length > 0 && `<span class="calendar__dot${t.some(e => !e.holiday) ? `` : ` calendar__dot--holiday`}"></span>`)}</button>`;
    }))}</div><p class="calendar__hint">Use the ‹ › buttons (or Page Up / Page Down) to change months, and the arrow keys to move between dates. Click a faded date to jump to its month.</p></div><div class="calendar__side"><div class="calendar__side-inner"><div class="calendar__side-header"><span class="contact-form__bar"></span><h2 class="calendar__side-title">${esc(selectedDay ? formatCalendarRange({
      start: selectedDay,
      end: selectedDay,
      title: ``
    }) : `${MONTHS_FULL[month]} ${year}`)}</h2>${J(selectedDay && `<button data-act="whole-month" class="calendar__show-all">Show whole month</button>`)}</div><div${attr('tabindex', 0)} role="region" aria-label="Events and holidays this month" class="calendar__events">${J(listEvents.length === 0 && `<div class="calendar__empty"><div class="calendar__empty-icon"><svg class="icon-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr('stroke-width', 1.8)}><path stroke-linecap="round" stroke-linejoin="round" d="M8 3v3M16 3v3M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z"></path></svg></div>No events listed for ${esc(selectedDay ? `this day` : `this month`)}.${J(selectedDay && `<div><button data-act="whole-month" class="calendar__empty-action">Show whole month</button></div>`)}</div>`)}${J(listEvents.map((e, t) => {
      let n = new Date(e.start + `T00:00:00`);
      return `<div class="calendar__event"><div class="calendar__badge${e.holiday ? ` calendar__badge--holiday` : ``}"><div class="event-card__day">${esc(pad2(n.getDate()))}</div><div class="event-modal__month">${esc(MONTHS_FULL[n.getMonth()].slice(0, 3).toUpperCase())}</div></div><div class="calendar__event-body"><div class="calendar__event-title">${esc(e.title)}</div><div class="calendar__event-date">${esc(e.holiday ? e.holiday : formatCalendarRange(e))}</div></div></div>`;
    }))}</div></div></div></div><p class="calendar__note">Dates are subject to change by official announcement. Holidays follow the Philippine national calendar; movable Islamic and Chinese holidays are announced yearly and are not listed.</p></div>`;
  }

  // PDF preview popup (Downloads page)
  function downloadPreviewHTML(state) {
    let previewItem = state.previewItem;
    return `<div class="stack-10">${J(previewItem && `<div class="pdf-preview"><div role="dialog" aria-modal="true" aria-label="Preview of ${esc(previewItem.title)}" class="pdf-preview__dialog"><div class="pdf-preview__header"><h2 class="pdf-preview__heading">${esc(previewItem.title)}</h2><a${attr('href', previewItem.file)} download class="pdf-preview__open">Download</a><button autofocus aria-label="Close preview" class="pdf-preview__close"><svg class="icon-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr('stroke-width', 2.4)}><path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6L6 18"></path></svg></button></div><iframe${attr('src', previewItem.file)} title="Preview of ${esc(previewItem.title)}" class="pdf-preview__frame"></iframe></div></div>`)}</div>`;
  }

  // "Confirm to send message?" popup (Contact page)
  function confirmDialogHTML({
    vals: values,
    onConfirm: t,
    onCancel: n
  }) {
    let rows = [[`About`, values.topic], [`Name`, `${values.first} ${values.last}`], [`Email`, values.email], [`Phone`, values.phone], [`Program`, values.program]];
    return `<div class="event-modal"><div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" class="confirm-dialog"><div class="confirm-dialog__header"><h2 id="confirm-title" class="confirm-dialog__heading">Confirm to send message?</h2></div><div class="portal-notice__body"><p class="confirm-dialog__intro">Please check your details. The form will be confirmed on this website. No Outlook or email tab will open.</p><dl class="confirm-dialog__details">${J(rows.map(([e, t]) => `<div class="footer-follow-us__row"><dt class="confirm-dialog__label">${esc(e)}</dt><dd class="confirm-dialog__value">${esc(t)}</dd></div>`))}</dl><div class="confirm-dialog__message">${esc(values.message)}</div><div class="confirm-dialog__actions"><button type="button" class="event-modal__secondary">No, go back</button><button type="button" data-confirm class="confirm-dialog__confirm">Yes, confirm message</button></div></div></div></div>`;
  }

  // Full-size campus map (Contact page)
  const campusMapHTML = () =>
    `<div class="map-viewer" role="dialog" aria-label="DLSJBC campus map, full size"><div class="map-viewer__bar"><button id="map-return" data-on-dark class="map-viewer__return"><svg class="icon-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>Return</button><span class="map-viewer__title">De La Salle John Bosco College – Campus Layout</span></div><div class="map-viewer__scroll"><img src="${ROOT}images/contact/campus-map.jpg" alt="DLSJBC campus layout map, full size" class="map-viewer__image"></div></div>`;

  // Home page lists
  const homeAnnouncementHTML = (item) =>
    `<button type="button" aria-haspopup="dialog" class="home-announcement"><div class="home-announcement__date"><div class="home-announcement__month">${esc(item.month)}</div><div class="home-announcement__day">${esc(item.day)}</div></div><div><p class="home-announcement__title">${esc(item.title)}</p><p class="home-card-programs__cta-text">${esc(item.desc)}</p></div></button>`;

  const homeNewsHTML = (item) =>
    `<button type="button" aria-haspopup="dialog" class="home-announcement"><img${attr('src', item.img)}${attr('alt', item.title)} class="home-news-item__image"><div class="calendar__event-body"><p class="home-news-item__date">${esc(item.date)}</p><p class="home-announcement__title">${esc(item.title)}</p><p class="home-news-item__description">${esc(item.desc)}</p></div></button>`;

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */

  // Show a popup. Handles Escape, Tab trapping, scroll lock and returning focus.
  // `onBackdrop` decides whether a click closes it (default: click outside the dialog).
  function showPopup(html, { focus, tabSelector = 'button, a[href]', closeOn } = {}) {
    const previousFocus = document.activeElement;
    overlayRoot.innerHTML = `<div>${html}</div>`; // fresh wrapper each time, so old listeners disappear with it
    const dialog = $('[role="dialog"], [role="alertdialog"]', overlayRoot);
    const overlay = dialog.parentElement; // the dark backdrop around the dialog
    lockScroll(true);

    function close() {
      document.removeEventListener('keydown', onKeydown);
      overlayRoot.innerHTML = '';
      lockScroll(false);
      previousFocus?.focus?.();
    }
    function onKeydown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close();
      } else trapTab(event, dialog, tabSelector);
    }
    document.addEventListener('keydown', onKeydown);
    overlay.addEventListener('click', (event) => {
      if (!dialog.contains(event.target)) return close(); // click on the backdrop
      if (closeOn && closeOn(event)) close();
    });
    (focus ? $(focus, dialog) : $('button', dialog))?.focus();
    return { overlay, dialog, close };
  }

  const openEventModal = (item) =>
    showPopup(eventModalHTML({ item }), { closeOn: (e) => e.target.closest('button, a') });

  // Re-draw a container and keep keyboard focus on the same control
  function rerender(root, html) {
    const active = document.activeElement;
    let selector = null;
    if (active && root.contains(active)) {
      if (active.dataset.day) selector = `[data-day="${active.dataset.day}"]`;
      else if (active.dataset.act)
        selector = `[data-act="${active.dataset.act}"]` + (active.dataset.index ? `[data-index="${active.dataset.index}"]` : '');
    }
    root.innerHTML = html;
    if (selector) $(selector, root)?.focus();
  }

  /* ------------------------------------------------------------------
     HOME — lists built from data.js
     ------------------------------------------------------------------ */
  function initHome() {
    const annBox = $('[data-home-announcements]');
    const newsBox = $('[data-home-news]');
    if (annBox) {
      annBox.innerHTML = upcomingAnnouncements.map(homeAnnouncementHTML).join('');
      annBox.addEventListener('click', (event) => {
        const index = $$('button', annBox).indexOf(event.target.closest('button'));
        if (index >= 0) openEventModal(upcomingAnnouncements[index].src);
      });
    }
    if (newsBox) {
      newsBox.innerHTML = newsGallery.map(homeNewsHTML).join('');
      newsBox.addEventListener('click', (event) => {
        const index = $$('button', newsBox).indexOf(event.target.closest('button'));
        if (index >= 0) openEventModal(newsGallery[index].src);
      });
    }
  }

  /* ------------------------------------------------------------------
     NEWS & ANNOUNCEMENTS — filter by month and year
     ------------------------------------------------------------------ */
  function initEventList(kind) {
    const root = $('#page-root');
    const kindEvents = getEventsByKind(kind);
    const firstYear = Number((kindEvents[0]?.start ?? '2026').slice(0, 4));
    const state = { year: firstYear, month: null, openItem: null };
    let visible = [];

    function render() {
      rerender(root, eventListHTML({ kind }, state));
      $('[data-act="month"]', root).value = state.month === null ? '' : String(state.month);
      $('[data-act="year"]', root).value = String(state.year);
      // Same order as the cards on screen, so a click can find its item
      const inYear = kindEvents.filter((e) => e.start.startsWith(String(state.year)));
      visible = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
        .filter((m) => state.month === null || m === state.month)
        .flatMap((m) => inYear.filter((e) => Number(e.start.slice(5, 7)) - 1 === m));
    }
    root.addEventListener('change', (event) => {
      const act = event.target.dataset.act;
      if (act === 'month') state.month = event.target.value === '' ? null : Number(event.target.value);
      else if (act === 'year') state.year = Number(event.target.value);
      else return;
      render();
    });
    root.addEventListener('click', (event) => {
      const button = event.target.closest('[data-act]');
      if (button && (button.dataset.act === 'all' || button.dataset.act === 'reset')) {
        state.month = null;
        if (button.dataset.act === 'reset') state.year = firstYear;
        return render();
      }
      const card = event.target.closest('article');
      if (card) {
        const item = visible[$$('article', root).indexOf(card)];
        if (item) openEventModal(item);
      }
    });
    render();
  }

  /* ------------------------------------------------------------------
     ACADEMIC CALENDAR
     ------------------------------------------------------------------ */
  function initCalendar() {
    const root = $('#page-root');
    const state = { view: { y: 2026, m: 9 }, selectedDay: null, pickerOpen: false, pickerYear: 2026 };

    const render = () => rerender(root, calendarHTML(state));
    function goTo(y, m) {
      state.view = { y, m };
      state.selectedDay = null;
      state.pickerOpen = false;
    }
    function changeMonth(delta) {
      const d = new Date(state.view.y, state.view.m + delta, 1);
      state.view = { y: d.getFullYear(), m: d.getMonth() };
      state.selectedDay = null;
    }

    root.addEventListener('click', (event) => {
      const dayButton = event.target.closest('[data-day]');
      if (dayButton) {
        const [y, m] = dayButton.dataset.day.split('-').map(Number);
        const inMonth = y === state.view.y && m - 1 === state.view.m;
        if (inMonth) state.selectedDay = state.selectedDay === dayButton.dataset.day ? null : dayButton.dataset.day;
        else goTo(y, m - 1);
        return render();
      }
      const button = event.target.closest('[data-act]');
      if (!button) return;
      const index = Number(button.dataset.index);
      switch (button.dataset.act) {
        case 'prev-month': changeMonth(-1); break;
        case 'next-month': changeMonth(1); break;
        case 'today': { const now = new Date(); goTo(now.getFullYear(), now.getMonth()); break; }
        case 'toggle-picker': state.pickerYear = state.view.y; state.pickerOpen = !state.pickerOpen; break;
        case 'prev-year': state.pickerYear -= 1; break;
        case 'next-year': state.pickerYear += 1; break;
        case 'pick-month': goTo(state.pickerYear, index); break;
        case 'whole-month': state.selectedDay = null; break;
        case 'term': {
          const year = state.view.m >= 7 ? state.view.y : state.view.y - 1;
          goTo(index === 2 ? year + 1 : year, [7, 11, 3][index]);
          break;
        }
        default: return;
      }
      render();
    });

    // Keyboard: arrows move between days; PageUp/PageDown change month; Escape closes the month picker
    root.addEventListener('keydown', (event) => {
      const dayButton = event.target.closest('[data-day]');
      const steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      if (dayButton && (event.key in steps || event.key === 'Home' || event.key === 'End')) {
        const date = new Date(dayButton.dataset.day + 'T00:00:00');
        let move;
        if (event.key in steps) move = steps[event.key];
        else if (event.key === 'Home') move = -date.getDay();
        else move = 6 - date.getDay();
        event.preventDefault();
        event.stopPropagation();
        date.setDate(date.getDate() + move);
        const iso = dateToIso(date);
        const inView = date.getFullYear() === state.view.y && date.getMonth() === state.view.m;
        // Same month and nothing selected: just move focus — no need to redraw the grid
        if (inView && state.selectedDay === null) return $(`[data-day="${iso}"]`, root)?.focus();
        if (!inView) state.view = { y: date.getFullYear(), m: date.getMonth() };
        state.selectedDay = null;
        root.innerHTML = calendarHTML(state);
        requestAnimationFrame(() => $(`[data-day="${iso}"]`, root)?.focus());
        return;
      }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') (event.preventDefault(), changeMonth(-1), render());
      else if (event.key === 'ArrowRight' || event.key === 'PageDown') (event.preventDefault(), changeMonth(1), render());
      else if (event.key === 'Escape' && state.pickerOpen) (state.pickerOpen = false, render());
    });
    render();
  }

  /* ------------------------------------------------------------------
     DOWNLOADS — PDF preview popup
     ------------------------------------------------------------------ */
  function initDownloads() {
    const root = $('#page-root');
    root.addEventListener('click', (event) => {
      const button = event.target.closest('button[aria-label^="Preview "]');
      if (!button) return;
      const item = {
        title: button.getAttribute('aria-label').replace(/^Preview /, ''),
        file: $('a[download]', button.closest('li')).getAttribute('href'),
      };
      showPopup(downloadPreviewHTML({ previewItem: item }), {
        focus: 'button[aria-label="Close preview"]',
        tabSelector: 'button, a[href]',
        closeOn: (e) => e.target.closest('button[aria-label="Close preview"]'),
      });
    });
  }

  /* ------------------------------------------------------------------
     CONTACT — validation, confirm dialog, success message, full-size map
     ------------------------------------------------------------------ */
  const EMPTY_FORM = { topic: 'General concern', first: '', last: '', email: '', phone: '', program: '', message: '' };

  // "09171234567" -> "0917 123 4567"
  function formatPhone(value) {
    const plus = value.trim().startsWith('+');
    const digits = value.replace(/\D/g, '').slice(0, 13);
    return plus
      ? '+' + digits.replace(/^(\d{2})(\d{0,3})(\d{0,3})(\d{0,4}).*/, (m, a, b, c, d) => [a, b, c, d].filter(Boolean).join(' '))
      : digits.replace(/^(\d{0,4})(\d{0,3})(\d{0,4}).*/, (m, a, b, c) => [a, b, c].filter(Boolean).join(' '));
  }

  // Returns { fieldName: 'error message' } — an empty object means the form is valid
  function validateContactForm(values) {
    const errors = {};
    if (!values.first.trim()) errors.first = 'First name is required.';
    if (!values.last.trim()) errors.last = 'Last name is required.';
    if (!values.email.trim()) errors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
      errors.email = 'Invalid input. Enter a valid email, like name@example.com.';
    const phone = values.phone.trim();
    if (!phone) errors.phone = 'Phone number is required.';
    else {
      const digits = phone.replace(/\D/g, '').length;
      if (!/^\+?[0-9\s-]+$/.test(phone) || digits < 10 || digits > 13)
        errors.phone = 'Invalid input. Enter a phone number using digits only (10 to 13 digits).';
    }
    if (!values.program.trim()) errors.program = 'Program of interest is required.';
    if (!values.message.trim()) errors.message = 'Message is required.';
    return errors;
  }

  function initContact() {
    const form = $('form', $('#page-root'));
    const pristineForm = form.innerHTML; // used by "Send another message"
    const touched = {};
    let submitted = false;

    const readValues = () => Object.fromEntries(Object.keys(EMPTY_FORM).map((name) => [name, form.elements.namedItem(name)?.value ?? '']));

    // Show or hide the error text under each field (and the red summary box)
    function showErrors() {
      const errors = validateContactForm(readValues());
      for (const name of Object.keys(EMPTY_FORM)) {
        const input = form.elements.namedItem(name);
        if (!input || name === 'topic') continue;
        const message = touched[name] || submitted ? errors[name] : undefined;
        const field = $(`label[for="${name}"]`, form).parentElement;
        $(`#${name}-err`, field)?.remove();
        input.classList.remove('has-error');
        input.setAttribute('aria-invalid', String(!!message));
        if (message) {
          input.classList.add('has-error');
          field.insertAdjacentHTML('beforeend', `<p id="${name}-err" role="alert" class="form-error">${esc(message)}</p>`);
          input.setAttribute('aria-describedby', name === 'phone' ? 'phone-err phone-hint' : `${name}-err`);
        } else if (name === 'phone') input.setAttribute('aria-describedby', 'phone-hint');
        else input.removeAttribute('aria-describedby');
      }
      $('[data-banner]', form)?.remove();
      const count = Object.keys(errors).length;
      if (submitted && count > 0)
        $('p', form).insertAdjacentHTML('afterend', `<div data-banner role="alert" class="form-summary">Please fix ${count} ${count === 1 ? 'field' : 'fields'} below before sending.</div>`);
    }

    form.addEventListener('input', (event) => {
      if (event.target.name === 'phone') event.target.value = formatPhone(event.target.value);
      showErrors();
    });
    form.addEventListener('change', showErrors);
    form.addEventListener('focusout', (event) => {
      if (event.target.name) {
        touched[event.target.name] = true;
        showErrors();
      }
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitted = true;
      showErrors();
      const firstError = Object.keys(validateContactForm(readValues()))[0];
      if (firstError) return requestAnimationFrame(() => form.elements.namedItem(firstError)?.focus());
      askToConfirm();
    });

    function askToConfirm() {
      const values = readValues();
      const popup = showPopup(confirmDialogHTML({ vals: values }), { focus: '[data-confirm]', tabSelector: 'button' });
      popup.dialog.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;
        popup.close();
        if (button.hasAttribute('data-confirm')) showThanks(values.first);
      });
    }

    // After confirming: thank-you message in place of the form
    function showThanks(firstName) {
      form.innerHTML = `<h2 class="contact-form__heading"><span class="contact-form__bar"></span>Send us a message</h2><div role="status" class="contact-thanks"><div class="contact-thanks__badge"><svg class="contact-thanks__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg></div><h3 class="contact-card__title">Thank you, ${esc(firstName)}!</h3><p class="contact-thanks__message">Thank you for contacting the College of Computer Studies. Your message has been confirmed successfully, and the information you entered has been cleared from this browser tab for your privacy.</p><p class="contact-thanks__note">Please keep your inquiry details for your records. For urgent concerns, contact <a href="mailto:info@dlsjbc.edu.ph" class="contact-thanks__link">info@dlsjbc.edu.ph</a> or call <a href="tel:0868533415" class="contact-thanks__link">(086) 853 3415</a>.</p><button type="button" data-again class="contact-thanks__again">Send another message</button></div>`;
      $('[role="status"]', form).scrollIntoView({ block: 'nearest' });
    }
    form.addEventListener('click', (event) => {
      if (!event.target.closest('[data-again]')) return;
      form.innerHTML = pristineForm;
      submitted = false;
      for (const key of Object.keys(touched)) delete touched[key];
      const heading = $('h2', form); // keep keyboard users in the form without triggering validation
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    });

    // "View campus map" scrolls to the map; "Open full size" shows it full screen
    $('a[href="#campus-map"]').addEventListener('click', (event) => {
      event.preventDefault();
      document.getElementById('campus-map')?.scrollIntoView({ behavior: 'smooth' });
    });
    document.querySelectorAll('[data-map-open]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        showPopup(campusMapHTML(), {
          focus: '#map-return',
          closeOn: (e) => e.target.closest('#map-return') || (e.target.closest('.map-viewer__scroll') && !e.target.closest('img')),
        });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  if (page === 'home') initHome();
  if (page === 'announcements') initEventList('announcement');
  if (page === 'news') initEventList('news');
  if (page === 'calendar') initCalendar();
  if (page === 'downloads') initDownloads();
  if (page === 'contact') initContact();
})();
