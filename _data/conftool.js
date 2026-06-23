/**
 * Fetch conference data from ConfTool REST API
 * This runs at build time to populate schedule/sessions data
 * 
 * Data is cached locally for 24 hours to improve build performance
 * and to handle temporary API unavailability gracefully
 */

require('dotenv').config();
const { DateTime } = require('luxon');
const ConfToolFetcher = require('../lib/conftool-fetcher');

// Timezone the ConfTool export's `session_start` is actually in.
// We observed (May 2026) the export ships values 1h ahead of CDT, which is Eastern.
// Override via env if ConfTool's behavior changes.
const SOURCE_TZ = process.env.CONFTOOL_SOURCE_TZ || 'America/New_York';

// Canonical conference timezone (what we want as the primary display).
const CONFERENCE_TZ = process.env.CONFERENCE_TZ || 'America/Chicago';

// Zones to precompute for multi-timezone display.
// Each entry: [IANA zone, short label]. Primary first.
const DISPLAY_ZONES = [
  ['America/Chicago',     'CT'],   // Central, primary
  ['America/New_York',    'ET'],   // Eastern
  ['America/Los_Angeles', 'PT'],   // Pacific
  ['America/Sao_Paulo',   'BRT'],  // Brazil (Latin America audience)
  ['UTC',                 'UTC']
];

function firstValue(record, keys) {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null && record[key] !== '') {
      return record[key];
    }
  }
  return '';
}

function splitPeople(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }

  return String(value)
    .split(/\s*[,;|]\s*/)
    .map((v) => v.trim())
    .filter(Boolean);
}

/**
 * Strip HTML tags from a string, leaving plain text.
 * Also unescapes common HTML entities first.
 */
function stripHtml(value) {
  if (!value) return '';
  return String(value)
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Reformat a ConfTool authors string from "Last, First; Last2, First2"
 * to "First Last, First2 Last2".
 */
function formatAuthors(value) {
  if (!value) return '';
  return String(value)
    .split(/\s*;\s*/)
    .map(name => {
      const parts = name.split(/\s*,\s*/);
      if (parts.length >= 2) {
        return `${parts[1].trim()} ${parts[0].trim()}`;
      }
      return name.trim();
    })
    .join(', ');
}

function collectMatchingValues(record, pattern) {
  return Object.keys(record)
    .filter((key) => pattern.test(key))
    .sort()
    .map((key) => record[key])
    .filter((value) => value !== undefined && value !== null && value !== '');
}

// ConfTool 2026 topic taxonomy. Authors pick from a fixed list across 6
// categories. ConfTool's papers export ships each value WITHOUT the
// "Category:" prefix, so we use a hardcoded value→category lookup to
// reconstruct the grouping. Source: ConfTool admin Topics page (2026-05-22).
const TOPIC_CATEGORIES = [
  { key: 'Language',     label: 'Language of Presentation', short: 'Lang',   slug: 'lang' },
  { key: 'Geography',    label: 'Geography',                short: 'Geo',    slug: 'geo' },
  { key: 'Temporal',     label: 'Temporal',                 short: 'Era',    slug: 'time' },
  { key: 'Topics',       label: 'Topical area',             short: 'Theme',  slug: 'topical' },
  { key: 'Methods',      label: 'Methods',                  short: 'Method', slug: 'method' },
  { key: 'Disc./Fields', label: 'Disciplines & Fields',     short: 'Field',  slug: 'field' }
];
const CATEGORY_BY_KEY = Object.fromEntries(TOPIC_CATEGORIES.map((c) => [c.key, c]));
const UNCATEGORIZED = { key: 'Uncategorized', label: 'Other', short: 'Other', slug: 'other' };

const TOPIC_TAXONOMY = {
  'Language': ['English', 'Spanish'],
  'Geography': [
    'Africa', 'Asia', 'Australia/Oceania', 'Europe', 'North America',
    'South America', 'Comparative (2 or more geographical areas)', 'Global'
  ],
  'Temporal': [
    'BCE-4th Century', '5th-14th Century', '15th-17th Century',
    '18th Century', '19th Century', '20th Century', 'Contemporary'
  ],
  'Topics': [
    'Collaborations for Community',
    'Computational Creativity',
    'Critical making',
    'Digital cultural heritage',
    'Digital surveillance',
    'Digital humanities tools and infrastructures',
    'Digital librarianship',
    'Digital media, art, literature, history, music, film, and games',
    'Digital public humanities',
    'Environmental humanities and climate justice',
    'Humanistic and ethical approaches to data science and data visualization',
    'Humanistic research on digital objects and cultures',
    'Humanities knowledge infrastructures',
    'Union, labor and organization in digital humanities',
    'Machine learning, including AI and LLMs and their implications',
    'Multilingualism in digital humanities',
    'Multimodal scholarship',
    'Resource creation, curation, and engagement',
    'Use of digital technologies to write, publish, and review scholarship'
  ],
  'Methods': [
    '3d printing, critical making',
    'artificial intelligence and machine learning',
    'copyright, licensing, and permissions standards, systems, and processes',
    'crowdsourcing',
    'cultural analytics',
    'curricular and pedagogical development and analysis',
    'database creation, management, and analysis',
    'digital activism and advocacy',
    'digital archiving and preservation',
    'digital art production and analysis',
    'digital ecologies and digital communities, creation, management, and analysis',
    'digital humanities and/in libraries',
    'digital libraries creation, management, and analysis',
    'digital publishing projects, systems, and methods',
    'digital research infrastructures development and analysis',
    'digital storytelling',
    'digitization (2D and 3D)',
    'electronic literature, production and analysis',
    'embodied, wearable & haptic technologies development and analysis',
    'information retrieval and querying algorithms and methods',
    'linked (open) data',
    'media archaeology',
    'meta-criticism (reflections on digital humanities and humanities computing)',
    'metadata standards, systems, and methods',
    'machine learning and natural language processing',
    'network analysis and graphs theory and application',
    'open access methods and open educational resources (OER)',
    'optical character recognition and handwriting recognition',
    'physical & minimal computing',
    'postcolonial, decolonial, and anticolonial approaches',
    'project design, organization, and management',
    'public humanities collaborations and methods',
    'scholarly editing and editions development, analysis, and methods',
    'social media analysis and methods',
    'software development, systems, analysis, and methods',
    'spatial and spatio-temporal analysis, modeling, and visualization',
    'speech processing analysis and methods',
    'text encoding and markup language creation, deployment, and analysis',
    'text mining and analysis',
    'user experience design and analysis',
    'virtual and augmented reality creation, systems, and analysis'
  ],
  'Disc./Fields': [
    'African American/Black Studies', 'African/Africana Studies', 'Anthropology',
    'Arab Studies', 'Arab American Studies', 'Archaeology', 'Architecture',
    'Art history', 'Asian American Studies', 'Book and Print history',
    'Caribbean Studies', 'Central American Studies', 'Chicano/a/x Studies',
    'Cognitive Sciences and psychology', 'Communication studies',
    'Comparative and World Literature', 'Computer science',
    'Critical Race and Ethnic Studies', 'Cultural studies',
    'Data science/data studies', 'Design studies', 'Disability studies',
    'East Asian Studies', 'Education/Pedagogy',
    'Environmental, ocean, and waterways studies', 'Ethnography',
    'Ethnic studies', 'Experimental Humanities', 'Feminist studies',
    'Film and cinema arts studies',
    'First Nations, Native American, and Indigenous studies',
    'Folklore studies', 'Galleries and Museum studies', 'Game studies',
    'Gender and sexuality studies', 'Geography and Geo-Humanities',
    'Hemispheric studies', 'Hispanic Studies', 'History', 'Informatics',
    'Labor, Infrastructure, and Critical University Studies',
    'Latino/a/x/e Studies', 'Latin American studies', 'Law and legal studies',
    'Library and Information Science', 'Linguistics and Language Acquisition',
    'Literacy, composition, and creative writing', 'Literary studies',
    'Mathematics and Statistics', 'Media studies',
    'Multilingualism and translanguaging', 'Modern Languages',
    'Musicology and Sound Studies', 'Performance studies: Dance & Theatre',
    'Philosophy', 'Political science', 'LGBTQIA+ and Queer Studies',
    'Science, Technology, and Society', 'Sociology', 'South American Studies',
    'South Asian Studies', 'Theology and religious studies',
    'Border and Transborder studies', 'Transatlantic studies',
    'Translation studies'
  ]
};

// Reverse index: lowercased topic value → canonical category key. Lowercasing
// is defensive — ConfTool occasionally renormalizes case between admin and API.
const TOPIC_VALUE_TO_CATEGORY = {};
for (const [cat, values] of Object.entries(TOPIC_TAXONOMY)) {
  for (const v of values) {
    TOPIC_VALUE_TO_CATEGORY[v.toLowerCase()] = cat;
  }
}

// Flat list of every known topic value, sorted longest-first. We do greedy
// longest-match parsing because ConfTool's papers export joins all of a paper's
// topics into one comma-separated string AND some topic values contain commas
// internally (e.g., "Digital media, art, literature, history, music, film, and
// games" is ONE topic). Naive comma splitting destroys those; only matching
// against the known taxonomy can disambiguate.
const KNOWN_TOPICS_INDEX = Object.values(TOPIC_TAXONOMY)
  .flat()
  .map((t) => ({ lower: t.toLowerCase(), original: t }))
  .sort((a, b) => b.lower.length - a.lower.length);

// Map a topic value back to its category. Looks up against the known taxonomy
// first; falls back to "Category: Value" prefix parsing (in case ConfTool ever
// changes export format) and finally to uncategorized.
function parseTopicCategory(topic) {
  if (!topic || typeof topic !== 'string') return { category: null, value: String(topic || '') };
  const trimmed = topic.trim();
  const cat = TOPIC_VALUE_TO_CATEGORY[trimmed.toLowerCase()];
  if (cat) return { category: cat, value: trimmed };
  const m = trimmed.match(/^([^:]{1,40}?)\s*:\s*(.+)$/);
  if (m) return { category: m[1].trim(), value: m[2].trim() };
  return { category: null, value: trimmed };
}

// ConfTool's REST export HTML-escapes field values ("Dance &amp; Theatre")
// while the taxonomy above stores unescaped strings — decode before any
// matching or the longest-match misses and the fallback splitter slices
// "&amp;" at its semicolon, producing mangled and phantom topics.
function decodeEntities(s) {
  // Loop until stable: some values are double-encoded ("scene &amp;amp; object"),
  // so a single pass leaves a residual "&amp;" that re-escapes in the HTML output.
  let prev;
  do {
    prev = s;
    s = s
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&');
  } while (s !== prev);
  return s;
}

// Topic-specific splitter. ConfTool's papers export joins each paper's topics
// into one comma-separated string AND some topic values contain commas
// internally (e.g., "Digital media, art, literature, history, music, film, and
// games" is ONE topic). We use greedy longest-match against the known
// taxonomy — at each position, try to match the longest known topic value
// (case-insensitive); if no match, fall back to splitting on the next comma so
// unknown values don't swallow the rest of the string.
function splitTopics(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((v) => decodeEntities(String(v).trim())).filter(Boolean);
  }
  let str = decodeEntities(String(value).trim());
  const out = [];
  while (str.length > 0) {
    const lowerStr = str.toLowerCase();
    let matched = false;
    for (const { lower, original } of KNOWN_TOPICS_INDEX) {
      if (lowerStr.startsWith(lower)) {
        const after = str[lower.length] || '';
        if (after === '' || /[,;|]/.test(after) || /\s/.test(after)) {
          out.push(original);
          str = str.slice(lower.length).replace(/^[,;|\s]+/, '');
          matched = true;
          break;
        }
      }
    }
    if (!matched) {
      const next = str.search(/[,;|]/);
      if (next === -1) {
        const remaining = str.trim();
        if (remaining) out.push(remaining);
        break;
      }
      const fragment = str.slice(0, next).trim();
      if (fragment) out.push(fragment);
      str = str.slice(next + 1).trim();
    }
  }
  return out;
}

// Try the two field shapes ConfTool can use for topics on the papers export:
// a single `topics` field with `;`-separated values, or numbered `topic_1`,
// `topic_2`, ... keys.
function normalizeTopics(paper) {
  if (!paper || typeof paper !== 'object') return [];

  if (paper.topics) {
    return splitTopics(paper.topics);
  }

  const numbered = Object.keys(paper)
    .filter((k) => /^topic_\d+$/i.test(k))
    .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]))
    .map((k) => paper[k])
    .filter((v) => v !== undefined && v !== null && v !== '')
    .map((v) => decodeEntities(String(v).trim()))
    .filter(Boolean);

  return numbered;
}

// Group a paper's topics by their category. Returns category groups in admin
// order, dropping empty categories. Each item carries a running `idx` (1-based)
// across the whole paper so templates can truncate the visible chips.
function groupPaperTopics(topics) {
  if (!topics || topics.length === 0) return { groups: [], count: 0 };
  const byCat = {};
  for (const t of topics) {
    const { category, value } = parseTopicCategory(t);
    const key = category || 'Uncategorized';
    if (!byCat[key]) byCat[key] = [];
    byCat[key].push(value);
  }
  const groups = [];
  let idx = 0;
  for (const cat of TOPIC_CATEGORIES) {
    if (byCat[cat.key]) {
      const items = byCat[cat.key].map((value) => ({ value, idx: ++idx }));
      groups.push({ ...cat, items });
    }
  }
  if (byCat['Uncategorized']) {
    const items = byCat['Uncategorized'].map((value) => ({ value, idx: ++idx }));
    groups.push({ ...UNCATEGORIZED, items });
  }
  return { groups, count: idx };
}

function normalizePapers(record, paperById = {}) {
  // New-style: p{N}_title fields from sessions export with presentations option
  const newStyleKeys = Object.keys(record)
    .filter((key) => /^p\d+_title$/i.test(key))
    .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));

  if (newStyleKeys.length > 0) {
    return newStyleKeys
      .map((titleKey) => {
        const n = titleKey.match(/\d+/)[0];
        const title = record[titleKey];
        if (!title) return null;
        const id = String(record[`p${n}_paperID`] || '');
        const authors = formatAuthors(record[`p${n}_authors`] || '');
        const paper = paperById[id] || {};
        const keywords = paper.keywords ? splitPeople(paper.keywords) : [];
        const topics = normalizeTopics(paper);
        const grouped = groupPaperTopics(topics);
        const abstractPlain = stripHtml(paper.abstract_plain || '');
        const abstract = paper.abstract ? String(paper.abstract) : '';
        return {
          title: decodeEntities(String(title)), authors, id, keywords, topics,
          topicGroups: grouped.groups, topicCount: grouped.count,
          abstract, abstractPlain
        };
      })
      .filter(Boolean);
  }

  // Legacy-style: paper_title{N} / presentation_title{N} etc.
  const titleMatches = Object.keys(record)
    .filter((key) => /paper.*title|presentation.*title|contribution.*title|talk.*title/i.test(key))
    .sort();

  const papers = [];
  for (const titleKey of titleMatches) {
    const index = titleKey.match(/(\d+)/)?.[1] || '';
    const authorKeyCandidates = [
      `paper_author${index}`, `paper_authors${index}`,
      `presentation_author${index}`, `presentation_authors${index}`,
      `contribution_author${index}`, `contribution_authors${index}`,
      `talk_author${index}`, `talk_authors${index}`
    ];
    const paperTitle = record[titleKey];
    const paperAuthors = firstValue(record, authorKeyCandidates);
    const paperId = firstValue(record, [`paper_id${index}`, `submission_id${index}`, `paper_number${index}`]);
    const paper = paperById[String(paperId)] || {};
    const keywords = paper.keywords ? splitPeople(paper.keywords) : [];
    const topics = normalizeTopics(paper);
    const grouped = groupPaperTopics(topics);
    const abstractPlain = stripHtml(paper.abstract_plain || '');
    const abstract = paper.abstract ? String(paper.abstract) : '';
    if (paperTitle) {
      papers.push({
        title: decodeEntities(String(paperTitle)),
        authors: formatAuthors(paperAuthors || ''),
        id: String(paperId || ''),
        keywords,
        topics,
        topicGroups: grouped.groups,
        topicCount: grouped.count,
        abstract,
        abstractPlain
      });
    }
  }
  return papers;
}

// Parse "YYYY-MM-DD[ HH:MM[:SS]]" (and a few looser variants) into a luxon DateTime
// anchored in SOURCE_TZ. Returns null if we can't parse.
function parseInSourceZone(raw) {
  if (!raw) return null;
  const str = String(raw).trim();
  const formats = [
    'yyyy-MM-dd HH:mm:ss',
    'yyyy-MM-dd HH:mm',
    'yyyy-MM-dd\'T\'HH:mm:ss',
    'yyyy-MM-dd\'T\'HH:mm',
    'yyyy-MM-dd'
  ];
  for (const fmt of formats) {
    const dt = DateTime.fromFormat(str, fmt, { zone: SOURCE_TZ });
    if (dt.isValid) return dt;
  }
  // Last resort: ISO with offset (preserves whatever offset is embedded).
  const iso = DateTime.fromISO(str, { setZone: true });
  if (iso.isValid) return iso;
  return null;
}

function parseSessionStart(record, locale = 'en-US') {
  const raw = firstValue(record, ['session_start', 'start_date', 'date', 'session_date', 'form_date', 'day']);
  const dt = parseInSourceZone(raw);
  if (!dt) {
    return { date: raw ? String(raw) : '', time: '', iso: '', dt: null };
  }
  // Format the date label in the conference zone so weekday lines up with primary-zone day.
  const inConf = dt.setZone(CONFERENCE_TZ);
  const dateDisplay = inConf.setLocale(locale).toFormat('cccc, LLLL d, yyyy');
  return {
    date: dateDisplay,
    time: inConf.toFormat('HH:mm'),
    iso: inConf.toFormat('yyyy-MM-dd'),
    dt
  };
}

function parseSessionEnd(record) {
  const raw = firstValue(record, ['session_end', 'end_time', 'session_end_time']);
  return parseInSourceZone(raw);
}

// Build the per-zone time strings for one session.
function buildZoneTimes(startDt, endDt) {
  const times = {};
  for (const [zone, label] of DISPLAY_ZONES) {
    const s = startDt ? startDt.setZone(zone).toFormat('HH:mm') : '';
    const e = endDt ? endDt.setZone(zone).toFormat('HH:mm') : '';
    times[label] = {
      zone,
      label,
      start: s,
      end: e,
      range: s && e ? `${s}–${e}` : (s || e)
    };
  }
  return times;
}

function normalizeSession(record, paperById = {}, locale = 'en-US') {
  const { date: parsedDate, time: parsedTime, iso, dt: startDt } = parseSessionStart(record, locale);
  const endDt = parseSessionEnd(record);
  const date = parsedDate || firstValue(record, ['date', 'session_date', 'form_date', 'start_date', 'day']);
  const time = parsedTime || firstValue(record, ['time', 'session_time', 'time_range', 'slot', 'start_time']);
  const endTime = endDt ? endDt.setZone(CONFERENCE_TZ).toFormat('HH:mm') : '';
  const zoneTimes = buildZoneTimes(startDt, endDt);
  const rawTitle = firstValue(record, ['title', 'session_title', 'name', 'session', 'event_title']);
  // Strip leading scheduling code (e.g. "D1-S3-Z1: ") for clean display
  const title = rawTitle ? rawTitle.replace(/^[A-Z0-9][\w-]*:\s+/, '') : rawTitle;
  const subtitle = firstValue(record, ['subtitle', 'sub_title']);
  const location = firstValue(record, ['virtual_location', 'location', 'room', 'session_room']);
  const locationUrl = firstValue(record, ['virtual_location_url', 'location_url', 'zoom_link', 'zoom_url', 'join_url']);
  const sessionInfo = stripHtml(firstValue(record, ['session_info', 'description', 'abstract', 'notes']) || '');
  const sessionUrl = firstValue(record, ['session_url', 'url', 'details_url']);

  // Creative Presentation sessions carry a "-CP" marker in their session code
  // (e.g. "D1-S6-Z1-CP1") — these are the lightning-talk sessions.
  const shortCode = firstValue(record, ['session_short', 'short', 'session_code']) || rawTitle || '';
  const isLightning = /(?:^|[-_])CP\d*/i.test(shortCode);

  // Keynote sessions — flagged so the program can mark the accessibility services
  // confirmed for them (ASL + live Spanish/English interpretation). Detected from
  // the session title; if ConfTool labels keynotes differently, widen this test.
  const isKeynote = /keynote|charla magistral|conferencia magistral|plenary/i.test(String(rawTitle || ''));

  const chairFields = collectMatchingValues(record, /chair|moderator/i);
  const chairs = chairFields.flatMap(splitPeople);

  const speakers = splitPeople(firstValue(record, ['speakers', 'speaker', 'presenters', 'presenter']));
  const papers = normalizePapers(record, paperById);

  // Primary display: conference timezone (CDT in June).
  const primary = zoneTimes['CT'] || { start: time, end: endTime, range: time };
  const displayTime = primary.range || (primary.start && primary.end ? `${primary.start}–${primary.end}` : primary.start || 'Time TBA');

  // SECURITY: Zoom/meeting join links live in ConfTool behind login and must
  // NEVER render on the PUBLIC program page. Strip any URL-shaped value no
  // matter which ConfTool field carried it. Conservative match (only "://" or
  // a leading "www.") so plain room labels like "Zoom Room A" survive intact.
  // To re-enable public links later, revert location/locationUrl/sessionUrl below.
  const looksLikeUrl = (v) => /:\/\/|(^|\s)www\./i.test(String(v || ''));
  const safeLocation = looksLikeUrl(location) ? '' : location;

  return {
    dateDisplay: date || 'Date TBA',
    timeDisplay: displayTime,
    startISO: iso || '',
    startTime: primary.start || time || '',
    endTime: primary.end || endTime || '',
    startUTC: startDt ? startDt.toUTC().toISO() : '',
    endUTC: endDt ? endDt.toUTC().toISO() : '',
    sourceTZ: SOURCE_TZ,
    conferenceTZ: CONFERENCE_TZ,
    zoneTimes,
    title: decodeEntities(title || subtitle || 'Untitled session'),
    subtitle,
    location: safeLocation,
    locationUrl: '',
    chairs,
    speakers,
    sessionInfo,
    sessionUrl: '',
    isLightning,
    isKeynote,
    papers,
    raw: record
  };
}

function sortSessions(a, b) {
  // Sort by real UTC moment when available — falls back to ISO date + HH:MM otherwise.
  const aKey = a.startUTC || `${a.startISO || ''}T${a.startTime || ''}`;
  const bKey = b.startUTC || `${b.startISO || ''}T${b.startTime || ''}`;
  return String(aKey).localeCompare(String(bKey));
}

module.exports = async function() {
  const sharedSecret = process.env.CONFTOOL_SHARED_SECRET;
  const restUrl = process.env.CONFTOOL_REST_URL || 'https://www.conftool.pro/ach2026/rest.php';

  if (!sharedSecret) {
    console.warn('⚠️  CONFTOOL_SHARED_SECRET not set. Skipping ConfTool data fetch.');
    return { sessions: [], rawSessions: null, isConfigured: false };
  }

  try {
    const fetcher = new ConfToolFetcher(sharedSecret, restUrl);
    const data = await fetcher.fetchMultiple([
      {
        key: 'sessionsExport',
        exportSelect: 'sessions',
        extraParams: {
          'form_export_sessions_options[]': ['presentations', 'all']
        }
      },
      {
        key: 'papersExport',
        exportSelect: 'papers',
        extraParams: {
          'form_export_papers_options[]': ['abstracts', 'session'],
          'form_status': 'p'
        }
      }
    ]);
    const papersArr = Array.isArray(data.papersExport?.records) ? data.papersExport.records : [];
    const sessions = Array.isArray(data.sessionsExport?.records) ? data.sessionsExport.records : [];

    // SAFETY: if ConfTool returned no data (transient API hiccup, rate limit,
    // wrong secret, etc.) fail the build so Netlify retains the previous
    // successful deploy. Without this, a flaky API silently produces a
    // "Schedule data is being loaded" page in production.
    if (sessions.length === 0 || papersArr.length === 0) {
      const msg = `ConfTool returned no data (sessions: ${sessions.length}, papers: ${papersArr.length}). Failing build to preserve previous deploy.`;
      console.error('❌', msg);
      // Throw outside the try/catch by deferring to a microtask — actually,
      // simpler: throw a sentinel that the catch rethrows.
      const err = new Error(msg);
      err.__conftoolEmpty = true;
      throw err;
    }

    const paperById = Object.fromEntries(papersArr.map((p) => [String(p.paperID), p]));

    const normalizedSessions = sessions.map((r) => normalizeSession(r, paperById, 'en-US')).sort(sortSessions);
    const normalizedSessionsEs = sessions.map((r) => normalizeSession(r, paperById, 'es-ES')).sort(sortSessions);

    const totalPapers = normalizedSessions.reduce((sum, s) => sum + s.papers.length, 0);
    const uniqueDays = new Set(normalizedSessions.map(s => s.startISO).filter(Boolean)).size;

    // Panel vs solo session breakdown
    const panelCount = normalizedSessions.filter(s => s.papers.length >= 2).length;
    const soloCount  = normalizedSessions.filter(s => s.papers.length === 1).length;

    // Bilingual/Spanish session detection via accented characters common in Spanish
    const spanishChars = /[áéíóúüñÁÉÍÓÚÜÑ]/;
    const spanishCount = normalizedSessions.filter(s =>
      spanishChars.test(s.title) ||
      s.papers.some(p => spanishChars.test(p.title) || spanishChars.test(p.authors))
    ).length;

    // Keyword frequency across all papers
    const kwFreq = {};
    normalizedSessions.forEach(s =>
      s.papers.forEach(p =>
        p.keywords.forEach(k => {
          const kl = k.toLowerCase().trim();
          if (kl) kwFreq[kl] = (kwFreq[kl] || 0) + 1;
        })
      )
    );
    const kwAcronyms = { ai: 'AI', ml: 'ML', nlp: 'NLP', dh: 'DH', api: 'API', gis: 'GIS', ocr: 'OCR' };
    const topKeywords = Object.entries(kwFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([kw, count]) => ({ kw: kwAcronyms[kw] ?? kw, count }));

    // Full keyword list sized for tag-cloud display (font-size 0.75rem → 1.4rem
    // linearly between single-paper and most-popular keyword).
    const sortedKeywords = Object.entries(kwFreq).sort((a, b) => b[1] - a[1]);
    const maxKwCount = sortedKeywords.length ? sortedKeywords[0][1] : 1;
    const allKeywords = sortedKeywords.map(([kw, count]) => ({
      kw: kwAcronyms[kw] ?? kw,
      count,
      sizeRem: maxKwCount > 1
        ? +(0.75 + ((count - 1) / (maxKwCount - 1)) * 0.65).toFixed(3)
        : 1
    }));

    // Topic frequency across all papers (controlled vocabulary from ConfTool)
    const topicFreq = {};
    normalizedSessions.forEach(s =>
      s.papers.forEach(p =>
        (p.topics || []).forEach(t => {
          const tl = String(t).trim();
          if (tl) topicFreq[tl] = (topicFreq[tl] || 0) + 1;
        })
      )
    );
    const sortedTopics = Object.entries(topicFreq).sort((a, b) => b[1] - a[1]);
    const maxTopicCount = sortedTopics.length ? sortedTopics[0][1] : 1;
    const allTopics = sortedTopics.map(([topic, count]) => {
      const { category } = parseTopicCategory(topic);
      const catInfo = (category && CATEGORY_BY_KEY[category]) || UNCATEGORIZED;
      return {
        topic,
        count,
        slug: catInfo.slug,
        sizeRem: maxTopicCount > 1
          ? +(0.75 + ((count - 1) / (maxTopicCount - 1)) * 0.65).toFixed(3)
          : 1
      };
    });

    // Group topics by category, keeping admin's display order. Each entry
    // carries the prettified label, short label, and CSS slug for chip styling.
    const topicsByCategoryMap = {};
    for (const item of allTopics) {
      const { category, value } = parseTopicCategory(item.topic);
      const key = category || 'Uncategorized';
      if (!topicsByCategoryMap[key]) topicsByCategoryMap[key] = [];
      topicsByCategoryMap[key].push({ ...item, value, fullTopic: item.topic });
    }
    const categoryEntries = [];
    for (const cat of TOPIC_CATEGORIES) {
      if (!topicsByCategoryMap[cat.key]) continue;
      const items = topicsByCategoryMap[cat.key].sort((a, b) => b.count - a.count);
      categoryEntries.push({
        ...cat,
        items,
        totalCount: items.reduce((sum, i) => sum + i.count, 0),
        distinctCount: items.length
      });
    }
    if (topicsByCategoryMap['Uncategorized']) {
      const items = topicsByCategoryMap['Uncategorized'].sort((a, b) => b.count - a.count);
      categoryEntries.push({
        ...UNCATEGORIZED,
        items,
        totalCount: items.reduce((sum, i) => sum + i.count, 0),
        distinctCount: items.length
      });
    }

    // Keyword tier diagnostic (helps tune the tag-cloud threshold)
    const tiers = { '5+': 0, '3-4': 0, '2': 0, '1': 0 };
    for (const c of Object.values(kwFreq)) {
      if (c >= 5) tiers['5+']++;
      else if (c >= 3) tiers['3-4']++;
      else if (c === 2) tiers['2']++;
      else tiers['1']++;
    }

    console.log(`✅ ConfTool data ready: ${sessions.length} sessions, ${totalPapers} papers — source TZ ${SOURCE_TZ} → conference TZ ${CONFERENCE_TZ}`);
    console.log(`   📊 Keywords: ${Object.keys(kwFreq).length} unique across ${totalPapers} papers (${tiers['5+']} on 5+ papers, ${tiers['3-4']} on 3-4, ${tiers['2']} on 2, ${tiers['1']} on 1)`);
    console.log(`   🏷  Topics: ${Object.keys(topicFreq).length} unique across ${totalPapers} papers`);

    return {
      sessions,
      normalizedSessions,
      normalizedSessionsEs,
      rawSessions: null,
      fetchedAt: new Date().toISOString(),
      source: 'ConfTool REST API',
      restUrl,
      sourceTZ: SOURCE_TZ,
      conferenceTZ: CONFERENCE_TZ,
      displayZones: DISPLAY_ZONES.map(([zone, label]) => ({ zone, label })),
      isConfigured: true,
      totalPapers,
      totalSessions: normalizedSessions.length,
      uniqueDays,
      panelCount,
      soloCount,
      spanishCount,
      topKeywords,
      allKeywords,
      maxKwCount,
      totalKeywords: Object.keys(kwFreq).length,
      allTopics,
      categoryEntries,
      totalTopics: Object.keys(topicFreq).length
    };
  } catch (error) {
    // Re-throw the empty-data sentinel so the build fails and Netlify retains
    // the previous good deploy. Other errors (parse issues, etc.) are caught
    // and rendered as a soft warning on the page.
    if (error && error.__conftoolEmpty) {
      throw error;
    }
    console.error('❌ Error setting up ConfTool fetcher:', error.message);
    return {
      sessions: [],
      normalizedSessions: [],
      rawSessions: null,
      error: error.message,
      isConfigured: false
    };
  }
};

