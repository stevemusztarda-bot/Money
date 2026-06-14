// Generator katalogu gier: pobiera PRAWDZIWE dane ze Steam (ceny w PLN, miniaturki,
// oceny, polskie opisy) i zapisuje statyczny src/data/games.js.
// Uruchom:  node scripts/build-games.mjs
import { writeFileSync } from 'node:fs';

const CC = 'pl';
const LANG = 'polish';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 20000);
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { 'Accept-Language': 'pl', 'User-Agent': 'GamePickerBot/1.0 (katalog gier; kontakt: dev@example.com)' },
      });
      clearTimeout(t);
      if (res.ok) return await res.json();
    } catch {
      /* retry */
    }
    await sleep(600 * (i + 1));
  }
  return null;
}

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

async function headOk(url) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(url, { method: 'GET', signal: ctrl.signal, headers: { 'User-Agent': BROWSER_UA } });
    clearTimeout(t);
    return res.ok;
  } catch {
    return false;
  }
}

// Okładka z Wikipedii (działa też dla niedostępnych komercyjnie okładek — pilicense=any)
async function wikiImage(title) {
  const u = `https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=pageimages&piprop=thumbnail&pilicense=any&pithumbsize=460&titles=${encodeURIComponent(title)}`;
  const j = await fetchJson(u);
  const p = j?.query?.pages ? Object.values(j.query.pages)[0] : null;
  return p?.thumbnail?.source || '';
}

// Artwork + bezpośredni link App Store (pewny CDN Apple) — dla gier mobilnych
async function itunesInfo(term) {
  const u = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=software&country=pl&limit=1`;
  const j = await fetchJson(u);
  const a = j?.results?.[0];
  const art = (a?.artworkUrl512 || a?.artworkUrl100 || '').replace('100x100bb', '512x512bb');
  return { image: art, appUrl: a?.trackViewUrl || '' };
}

const clean = (s = '') =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Oficjalne sklepy (bezpośrednie linki / wyszukiwarki sklepu — bez odsprzedawców kluczy)
function buildStores(g) {
  const q = encodeURIComponent(g.title);
  const out = [];
  if (g.platform.includes('pc')) {
    if (g.steam) out.push({ name: 'Steam', url: `https://store.steampowered.com/app/${g.steam}/` });
    out.push({ name: 'Epic Games', url: `https://store.epicgames.com/pl/browse?q=${q}&sortBy=relevancy&sortDir=DESC&count=40` });
  }
  if (g.platform.includes('console')) {
    const cs = g.cs || ['ps', 'xbox']; // domyślnie multiplatform
    if (cs.includes('ps')) out.push({ name: 'PlayStation Store', url: `https://store.playstation.com/pl-pl/search/${q}` });
    if (cs.includes('xbox')) out.push({ name: 'Xbox', url: `https://www.xbox.com/pl-PL/Search/Results?q=${q}` });
    if (cs.includes('nintendo')) out.push({ name: 'Nintendo eShop', url: `https://www.nintendo.com/us/search/?q=${q}&cat=gme` });
  }
  if (g.platform.includes('mobile')) {
    out.push({ name: 'App Store', url: g.appStoreUrl || `https://www.apple.com/pl/search/${q}` });
    out.push({ name: 'Google Play', url: `https://play.google.com/store/search?q=${q}&c=apps` });
  }
  return out;
}

// ——— Pula popularnych gier ze SteamSpy (appid -> oceny) ———
async function steamspyPool() {
  const map = new Map();
  const order = [];
  // Trendujące + najlepsze + 1000 najczęściej posiadanych (popularne, z ocenami)
  const urls = [
    'https://steamspy.com/api.php?request=top100in2weeks',
    'https://steamspy.com/api.php?request=top100forever',
    'https://steamspy.com/api.php?request=all&page=0',
    'https://steamspy.com/api.php?request=all&page=1',
  ];
  for (const url of urls) {
    const j = await fetchJson(url);
    if (!j) continue;
    for (const k of Object.keys(j)) {
      const a = j[k];
      const id = Number(a.appid);
      if (!id) continue;
      if (!map.has(id)) {
        map.set(id, { pos: Number(a.positive) || 0, neg: Number(a.negative) || 0, name: a.name || '' });
        order.push(id);
      }
    }
    await sleep(500);
  }
  return { map, order };
}

// Etykieta recenzji w stylu Steam (z % pozytywnych i liczby ocen)
function steamLabel(pct, count) {
  if (count < 10) return pct >= 70 ? 'Pozytywne' : pct >= 40 ? 'Mieszane' : 'Negatywne';
  if (pct >= 95 && count >= 500) return 'Przytłaczająco pozytywne';
  if (pct >= 80) return 'Bardzo pozytywne';
  if (pct >= 70) return 'W większości pozytywne';
  if (pct >= 40) return 'Mieszane';
  if (pct >= 20) return 'W większości negatywne';
  return 'Przytłaczająco negatywne';
}
const mcBucket = (mc) =>
  mc >= 90 ? 'Uniwersalne uznanie' : mc >= 80 ? 'Bardzo pozytywne' : mc >= 70 ? 'W większości pozytywne' : mc >= 50 ? 'Mieszane' : 'Negatywne';

function deriveReview(data, spy, entry) {
  let pct = null;
  let count = 0;
  if (spy) {
    count = (spy.pos || 0) + (spy.neg || 0);
    if (count > 0) pct = Math.round((spy.pos / count) * 100);
  }
  const mc = data?.metacritic?.score ?? null;
  if (pct != null) return { score: pct, label: steamLabel(pct, count) };
  if (mc != null) return { score: mc, label: mcBucket(mc) };
  return { score: entry?.review?.score ?? null, label: entry?.review?.label || '' };
}

const parseYear = (rd) => {
  const m = (rd?.date || '').match(/\d{4}/);
  return m ? Number(m[0]) : null;
};

// Mapowanie gatunków Steam (po polsku) + heurystyka z tekstu na naszą taksonomię
const STEAM_GENRE_MAP = [
  ['akcj', 'action'], ['przygod', 'adventure'], ['rpg', 'rpg'], ['strateg', 'strategy'],
  ['symulac', 'simulation'], ['niezależ', 'indie'], ['casual', 'casual'], ['wyścig', 'racing'],
  ['sport', 'sports'], ['masow', 'mmo'],
];
const KEYWORD_GENRE_MAP = [
  ['roguelik', 'roguelike'], ['rogue-lik', 'roguelike'], ['battle royale', 'battle-royale'],
  ['horror', 'horror'], ['surviv', 'survival'], ['przetrwani', 'survival'],
  ['platformer', 'platformer'], ['platformów', 'platformer'], ['metroidvania', 'platformer'],
  ['puzzle', 'puzzle'], ['logiczn', 'puzzle'], ['moba', 'moba'],
  ['fighting', 'fighting'], ['bijatyk', 'fighting'], ['sandbox', 'sandbox'], ['piaskownic', 'sandbox'],
  ['fps', 'fps'], ['first-person shooter', 'fps'], ['strzelank', 'fps'], ['shooter', 'fps'],
  ['mmorpg', 'mmo'], ['mmo', 'mmo'], ['massively multiplayer', 'mmo'],
  ['soulslike', 'rpg'], ['souls-like', 'rpg'], ['hack and slash', 'action'], ['hack & slash', 'action'],
  ['tower defense', 'strategy'], ['deckbuild', 'strategy'], ['card game', 'strategy'], ['karcian', 'strategy'],
  ['stealth', 'action'], ['visual novel', 'adventure'], ['point-and-click', 'adventure'], ['open world', 'adventure'],
  ['simulator', 'simulation'], ['farming', 'simulation'], ['city builder', 'simulation'], ['racing', 'racing'], ['wyścig', 'racing'],
  ['anime', 'rpg'], ['dungeon crawler', 'rpg'], ['turn-based', 'strategy'],
];
function mapGenres(data, text) {
  const out = new Set();
  const t = (text || '').toLowerCase();
  for (const gobj of data.genres || []) {
    const d = (gobj.description || '').toLowerCase();
    for (const [k, v] of STEAM_GENRE_MAP) if (d.includes(k)) out.add(v);
  }
  for (const [k, v] of KEYWORD_GENRE_MAP) if (t.includes(k)) out.add(v);
  if (out.size === 0) out.add('indie');
  return [...out].slice(0, 4);
}
function mapPlayers(data) {
  const out = new Set();
  for (const c of data.categories || []) {
    const d = (c.description || '').toLowerCase();
    if (d.includes('jednego gracza')) out.add('single');
    if (d.includes('wielu graczy') || d.includes('pvp')) out.add('multi');
    if (d.includes('koopera')) out.add('coop');
  }
  if (out.size === 0) out.add('single');
  return [...out];
}

// Stałe okresy wyprzedaży (do zakładki Promocje)
const SALE_PERIODS = [
  { name: 'Steam — Wyprzedaż Letnia', when: 'koniec czerwca – początek lipca', store: 'Steam', icon: '☀️' },
  { name: 'Steam — Wyprzedaż Jesienna', when: 'koniec listopada (Black Friday)', store: 'Steam', icon: '🍂' },
  { name: 'Steam — Wyprzedaż Zimowa', when: 'koniec grudnia – początek stycznia', store: 'Steam', icon: '❄️' },
  { name: 'Steam — Wyprzedaż Wiosenna', when: 'marzec', store: 'Steam', icon: '🌸' },
  { name: 'PlayStation — Days of Play', when: 'czerwiec', store: 'PlayStation', icon: '🎮' },
  { name: 'Xbox — Ultimate Game Sale', when: 'lipiec', store: 'Xbox', icon: '🟢' },
  { name: 'Epic Games — Mega Wyprzedaż', when: 'maj – czerwiec', store: 'Epic', icon: '🛒' },
  { name: 'Epic Games — darmowa gra co tydzień', when: 'co czwartek', store: 'Epic', icon: '🎁' },
];

// Promocje i nadchodzące premiery (Steam featuredcategories)
async function fetchFeatured() {
  const j = await fetchJson(`https://store.steampowered.com/api/featuredcategories?cc=${CC}&l=${LANG}`);
  const upcoming = (j?.coming_soon?.items || []).slice(0, 12).map((it) => ({
    title: it.name,
    image: it.header_image || it.large_capsule_image || '',
    store: `https://store.steampowered.com/app/${it.id}/`,
  }));
  const featuredDeals = (j?.specials?.items || []).slice(0, 12).map((it) => ({
    title: it.name,
    image: it.large_capsule_image || it.header_image || '',
    discount: it.discount_percent || 0,
    price: it.final_price != null ? Math.round(it.final_price / 100) : null,
    priceOld: it.original_price != null ? Math.round(it.original_price / 100) : null,
    store: `https://store.steampowered.com/app/${it.id}/`,
  }));

  // Wyróżniona premiera — GTA VI (najbardziej oczekiwana gra)
  const gtaImg = (await wikiImage('Grand Theft Auto VI')) || 'https://upload.wikimedia.org/wikipedia/en/4/46/Grand_Theft_Auto_VI.png';
  const featuredPremiere = {
    title: 'Grand Theft Auto VI',
    image: gtaImg,
    when: 'Oczekiwana premiera: 2026',
    tags: ['Akcja', 'Open World', 'Najbardziej oczekiwana'],
    description:
      'Powrót do Vice City w największej i najbardziej wyczekiwanej produkcji Rockstar Games. Nowy rozdział serii GTA.',
    platform: ['console', 'pc'],
    store: 'https://www.rockstargames.com/VI',
  };

  return { upcoming, featuredDeals, featuredPremiere };
}

async function enrich(entry, spyEntry) {
  const g = { ...entry };
  if (entry.steam) {
    const det = await fetchJson(
      `https://store.steampowered.com/api/appdetails?appids=${entry.steam}&cc=${CC}&l=${LANG}&filters=basic,price_overview,metacritic,genres,categories,release_date,content_descriptors`
    );
    const node = det?.[entry.steam];
    const data = node?.success ? node.data : null;
    if (!data) {
      if (entry.bulk) return null; // nieznane appid z puli — pomiń
    } else {
      const adult = (data.content_descriptors?.ids || []).some((id) => [1, 3, 4].includes(id));
      if (entry.bulk && (data.type !== 'game' || adult)) return null;
      g.title = entry.bulk ? data.name || entry.title : entry.title || data.name;
      // Stabilny, kanoniczny URL okładki (z ID) — pewniejszy niż header_image z hashem/?t=
      g.image = `https://cdn.akamai.steamstatic.com/steam/apps/${entry.steam}/header.jpg`;
      g.description = clean(data.short_description) || entry.description || '';
      const po = data.price_overview;
      if (data.is_free) g.price = 0;
      else if (po?.final != null) {
        g.price = Math.round(po.final / 100);
        if (po.discount_percent > 0) {
          g.discount = po.discount_percent;
          g.priceOld = Math.round(po.initial / 100);
        }
      } else if (entry.price != null) g.price = entry.price;
      g.platform = entry.platform || ['pc'];
      g.genre = entry.genre || mapGenres(data, `${data.name} ${data.short_description}`);
      g.players = entry.players || mapPlayers(data);
      g.year = entry.year || parseYear(data.release_date);
      g.comingSoon = !!data.release_date?.coming_soon;
      const rv = deriveReview(data, spyEntry, entry);
      g.review = rv;
      if (rv.score != null) g.rating = Math.round((rv.score / 10) * 10) / 10;
    }
  } else if (!entry.image) {
    // Miniaturka dla wpisów spoza Steam (Nintendo: stały URL; mobile: App Store)
    if (entry.src === 'itunes') {
      const info = await itunesInfo(entry.q || entry.title);
      g.image = info.image;
      g.appStoreUrl = info.appUrl;
    } else {
      g.image = await wikiImage(entry.q || entry.title);
    }
    await sleep(150);
  }

  if (!g.platform) g.platform = ['pc'];
  if (!g.genre || g.genre.length === 0) g.genre = ['indie'];
  if (!g.players || g.players.length === 0) g.players = ['single'];
  g.stores = buildStores(g);
  g.tags = buildTags(g);
  if (g.price == null) g.price = 0;
  if (g.rating == null) g.rating = entry.rating ?? 7.5;
  if (g.discount == null) g.discount = 0;
  if (g.priceOld == null) g.priceOld = null;
  if (g.comingSoon == null) g.comingSoon = false;
  return g;
}

function buildTags(g) {
  const tags = [];
  if (g.price === 0) tags.push('Darmowa');
  for (const id of g.genre.slice(0, 2)) {
    const lbl = GENRES.find((x) => x.id === id)?.label;
    if (lbl) tags.push(lbl);
  }
  if (g.players?.includes('coop')) tags.push('Kooperacja');
  else if (g.players?.includes('multi')) tags.push('Multiplayer');
  return [...new Set(tags)].slice(0, 4);
}

// ——— Taksonomia gatunków (PL) ———
const GENRES = [
  { id: 'action', label: 'Akcja', icon: '⚔️' },
  { id: 'rpg', label: 'RPG', icon: '🧙' },
  { id: 'fps', label: 'Strzelanki', icon: '🎯' },
  { id: 'strategy', label: 'Strategia', icon: '♟️' },
  { id: 'indie', label: 'Indie', icon: '🎮' },
  { id: 'simulation', label: 'Symulacja', icon: '🌾' },
  { id: 'sandbox', label: 'Sandbox', icon: '🏗️' },
  { id: 'survival', label: 'Survival', icon: '🏕️' },
  { id: 'horror', label: 'Horror', icon: '👻' },
  { id: 'adventure', label: 'Przygodowa', icon: '🗺️' },
  { id: 'platformer', label: 'Platformówka', icon: '🏃' },
  { id: 'puzzle', label: 'Logiczna', icon: '🧩' },
  { id: 'roguelike', label: 'Roguelike', icon: '☠️' },
  { id: 'racing', label: 'Wyścigi', icon: '🏎️' },
  { id: 'sports', label: 'Sportowa', icon: '⚽' },
  { id: 'fighting', label: 'Bijatyka', icon: '🥊' },
  { id: 'battle-royale', label: 'Battle Royale', icon: '🪂' },
  { id: 'mmo', label: 'MMO', icon: '🌐' },
  { id: 'moba', label: 'MOBA', icon: '🛡️' },
  { id: 'competitive', label: 'Kompetytywny', icon: '🏆' },
  { id: 'party', label: 'Imprezowa', icon: '🎉' },
  { id: 'casual', label: 'Casual', icon: '😊' },
];

// ——— Seed: kuratorowane platformy/gatunki, dane pobierane ze Steam ———
// p: platform, gr: genre, pl: players, y: year
const P = { pc: 'pc', con: 'console', mob: 'mobile' };
const SEED = [
  // PC + konsola (Steam)
  { steam: 1086940, title: "Baldur's Gate 3", p: ['pc', 'console'], gr: ['rpg', 'strategy', 'adventure'], pl: ['single', 'coop'], y: 2023 },
  { steam: 1091500, title: 'Cyberpunk 2077', p: ['pc', 'console'], gr: ['action', 'rpg'], pl: ['single'], y: 2020 },
  { steam: 1245620, title: 'Elden Ring', p: ['pc', 'console'], gr: ['action', 'rpg'], pl: ['single', 'coop'], y: 2022 },
  { steam: 1145360, title: 'Hades', p: ['pc', 'console', 'mobile'], gr: ['action', 'roguelike', 'indie'], pl: ['single'], y: 2020 },
  { steam: 413150, title: 'Stardew Valley', p: ['pc', 'console', 'mobile'], gr: ['simulation', 'indie', 'casual'], pl: ['single', 'coop'], y: 2016 },
  { steam: 367520, title: 'Hollow Knight', p: ['pc', 'console'], gr: ['platformer', 'indie', 'action'], pl: ['single'], y: 2017 },
  { steam: 292030, title: 'The Witcher 3', p: ['pc', 'console'], gr: ['rpg', 'action', 'adventure'], pl: ['single'], y: 2015 },
  { steam: 1174180, title: 'Red Dead Redemption 2', p: ['pc', 'console'], gr: ['action', 'adventure'], pl: ['single', 'multi'], y: 2019 },
  { steam: 1426210, title: 'It Takes Two', p: ['pc', 'console'], gr: ['adventure', 'platformer'], pl: ['coop'], y: 2021 },
  { steam: 105600, title: 'Terraria', p: ['pc', 'console', 'mobile'], gr: ['sandbox', 'survival', 'indie'], pl: ['single', 'coop'], y: 2011 },
  { steam: 588650, title: 'Dead Cells', p: ['pc', 'console', 'mobile'], gr: ['roguelike', 'platformer', 'indie'], pl: ['single'], y: 2018 },
  { steam: 632470, title: 'Disco Elysium', p: ['pc', 'console'], gr: ['rpg', 'indie', 'adventure'], pl: ['single'], y: 2019 },
  { steam: 646570, title: 'Slay the Spire', p: ['pc', 'console', 'mobile'], gr: ['strategy', 'roguelike', 'indie'], pl: ['single'], y: 2019 },
  { steam: 1794680, title: 'Vampire Survivors', p: ['pc', 'console', 'mobile'], gr: ['roguelike', 'casual', 'indie'], pl: ['single'], y: 2022 },
  { steam: 264710, title: 'Subnautica', p: ['pc', 'console'], gr: ['survival', 'adventure', 'simulation'], pl: ['single'], y: 2018 },
  { steam: 268910, title: 'Cuphead', p: ['pc', 'console'], gr: ['platformer', 'action', 'indie'], pl: ['single', 'coop'], y: 2017 },
  { steam: 504230, title: 'Celeste', p: ['pc', 'console'], gr: ['platformer', 'indie'], pl: ['single'], y: 2018 },
  { steam: 620, title: 'Portal 2', p: ['pc', 'console'], gr: ['puzzle', 'adventure'], pl: ['single', 'coop'], y: 2011 },
  { steam: 1623730, title: 'Palworld', p: ['pc', 'console'], gr: ['survival', 'sandbox', 'action'], pl: ['single', 'coop', 'multi'], y: 2024, cs: ['xbox'] },
  { steam: 1332010, title: 'Stray', p: ['pc', 'console'], gr: ['adventure', 'indie'], pl: ['single'], y: 2022 },
  { steam: 814380, title: 'Sekiro: Shadows Die Twice', p: ['pc', 'console'], gr: ['action', 'adventure'], pl: ['single'], y: 2019 },
  { steam: 374320, title: 'Dark Souls III', p: ['pc', 'console'], gr: ['action', 'rpg'], pl: ['single'], y: 2016 },
  { steam: 1593500, title: 'God of War', p: ['pc', 'console'], gr: ['action', 'adventure'], pl: ['single'], y: 2022, cs: ['ps'] },
  { steam: 1817070, title: "Marvel's Spider-Man Remastered", p: ['pc', 'console'], gr: ['action', 'adventure'], pl: ['single'], y: 2022, cs: ['ps'] },
  { steam: 1151640, title: 'Horizon Zero Dawn', p: ['pc', 'console'], gr: ['action', 'rpg', 'adventure'], pl: ['single'], y: 2020, price: 120, cs: ['ps'] },
  { steam: 2215430, title: 'Ghost of Tsushima', p: ['pc', 'console'], gr: ['action', 'adventure'], pl: ['single', 'coop'], y: 2024, cs: ['ps'] },
  { steam: 1888930, title: 'The Last of Us Part I', p: ['pc', 'console'], gr: ['action', 'adventure', 'horror'], pl: ['single'], y: 2023, cs: ['ps'] },
  { steam: 2050650, title: 'Resident Evil 4', p: ['pc', 'console'], gr: ['horror', 'action'], pl: ['single'], y: 2023 },
  { steam: 990080, title: 'Hogwarts Legacy', p: ['pc', 'console'], gr: ['rpg', 'adventure', 'action'], pl: ['single'], y: 2023 },
  { steam: 489830, title: 'The Elder Scrolls V: Skyrim', p: ['pc', 'console'], gr: ['rpg', 'adventure'], pl: ['single'], y: 2016 },
  { steam: 275850, title: "No Man's Sky", p: ['pc', 'console'], gr: ['survival', 'sandbox', 'adventure'], pl: ['single', 'coop'], y: 2016 },
  { steam: 582010, title: 'Monster Hunter: World', p: ['pc', 'console'], gr: ['action', 'rpg'], pl: ['single', 'coop'], y: 2018 },
  { steam: 1716740, title: 'Starfield', p: ['pc', 'console'], gr: ['rpg', 'adventure'], pl: ['single'], y: 2023, cs: ['xbox'] },
  { steam: 271590, title: 'Grand Theft Auto V', p: ['pc', 'console'], gr: ['action', 'adventure'], pl: ['single', 'multi'], y: 2015, price: 149 },
  { steam: 1551360, title: 'Forza Horizon 5', p: ['pc', 'console'], gr: ['racing', 'simulation'], pl: ['single', 'multi'], y: 2021 },
  { steam: 1172620, title: 'Sea of Thieves', p: ['pc', 'console'], gr: ['adventure', 'action'], pl: ['coop', 'multi'], y: 2018 },
  { steam: 553850, title: 'HELLDIVERS 2', p: ['pc', 'console'], gr: ['action', 'fps'], pl: ['coop', 'multi'], y: 2024, cs: ['ps'] },
  { steam: 322330, title: "Don't Starve Together", p: ['pc', 'console'], gr: ['survival', 'indie'], pl: ['coop', 'multi'], y: 2016 },
  { steam: 739630, title: 'Phasmophobia', p: ['pc', 'console'], gr: ['horror', 'survival'], pl: ['coop', 'multi'], y: 2020 },
  { steam: 648800, title: 'Raft', p: ['pc'], gr: ['survival', 'adventure'], pl: ['single', 'coop'], y: 2022 },
  { steam: 252490, title: 'Rust', p: ['pc', 'console'], gr: ['survival', 'sandbox'], pl: ['multi'], y: 2018 },
  { steam: 294100, title: 'RimWorld', p: ['pc', 'console'], gr: ['simulation', 'strategy'], pl: ['single'], y: 2018 },
  { steam: 427520, title: 'Factorio', p: ['pc'], gr: ['simulation', 'strategy'], pl: ['single', 'coop'], y: 2020 },
  { steam: 526870, title: 'Satisfactory', p: ['pc'], gr: ['simulation', 'sandbox'], pl: ['single', 'coop'], y: 2024 },
  { steam: 289070, title: "Sid Meier's Civilization VI", p: ['pc', 'console', 'mobile'], gr: ['strategy', 'simulation'], pl: ['single', 'multi'], y: 2016 },
  { steam: 255710, title: 'Cities: Skylines', p: ['pc', 'console'], gr: ['simulation', 'strategy'], pl: ['single'], y: 2015 },
  { steam: 1158310, title: 'Crusader Kings III', p: ['pc', 'console'], gr: ['strategy', 'simulation'], pl: ['single', 'multi'], y: 2020 },
  { steam: 4000, title: "Garry's Mod", p: ['pc'], gr: ['sandbox', 'indie'], pl: ['single', 'multi'], y: 2006 },
  { steam: 391540, title: 'Undertale', p: ['pc', 'console', 'mobile'], gr: ['rpg', 'indie'], pl: ['single'], y: 2015 },
  { steam: 250900, title: 'The Binding of Isaac: Rebirth', p: ['pc', 'console', 'mobile'], gr: ['roguelike', 'action', 'indie'], pl: ['single'], y: 2014 },
  // Free-to-play (Steam)
  { steam: 730, title: 'Counter-Strike 2', p: ['pc'], gr: ['fps', 'competitive'], pl: ['multi'], y: 2023 },
  { steam: 570, title: 'Dota 2', p: ['pc'], gr: ['moba', 'strategy', 'competitive'], pl: ['multi'], y: 2013 },
  { steam: 1172470, title: 'Apex Legends', p: ['pc', 'console'], gr: ['battle-royale', 'fps'], pl: ['multi'], y: 2020 },
  { steam: 578080, title: 'PUBG: BATTLEGROUNDS', p: ['pc', 'console', 'mobile'], gr: ['battle-royale', 'fps'], pl: ['multi'], y: 2017 },
  { steam: 230410, title: 'Warframe', p: ['pc', 'console'], gr: ['action', 'mmo', 'fps'], pl: ['coop', 'multi'], y: 2013 },
  { steam: 1085660, title: 'Destiny 2', p: ['pc', 'console'], gr: ['fps', 'mmo', 'action'], pl: ['coop', 'multi'], y: 2019 },
  { steam: 1097150, title: 'Fall Guys', p: ['pc', 'console', 'mobile'], gr: ['party', 'platformer', 'battle-royale'], pl: ['multi'], y: 2020 },
  { steam: 2767030, title: 'Marvel Rivals', p: ['pc', 'console'], gr: ['fps', 'competitive'], pl: ['multi'], y: 2024 },
  { steam: 1599340, title: 'Lost Ark', p: ['pc'], gr: ['mmo', 'rpg', 'action'], pl: ['multi'], y: 2022 },
  { steam: 945360, title: 'Among Us', p: ['pc', 'console', 'mobile'], gr: ['party', 'casual'], pl: ['multi'], y: 2018 },
  { steam: 1240440, title: 'Halo Infinite', p: ['pc', 'console'], gr: ['fps', 'competitive'], pl: ['single', 'multi'], y: 2021, cs: ['xbox'] },

  // Wyłączne Nintendo — dane ręczne, miniaturki z Wikipedii (src: 'wiki')
  { title: 'The Legend of Zelda: Tears of the Kingdom', cs: ['nintendo'], image: 'https://upload.wikimedia.org/wikipedia/en/f/fb/The_Legend_of_Zelda_Tears_of_the_Kingdom_cover.jpg', p: ['console'], gr: ['adventure', 'action', 'rpg'], pl: ['single'], y: 2023, price: 279, rating: 9.6, review: { score: 96, label: 'Uniwersalne uznanie' }, description: 'Genialna przygoda w Hyrule z nieskończonymi możliwościami tworzenia i eksploracji.' },
  { title: 'The Legend of Zelda: Breath of the Wild', cs: ['nintendo'], image: 'https://upload.wikimedia.org/wikipedia/en/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg', p: ['console'], gr: ['adventure', 'action', 'rpg'], pl: ['single'], y: 2017, price: 229, rating: 9.7, review: { score: 97, label: 'Uniwersalne uznanie' }, description: 'Otwarty świat Hyrule, który zdefiniował na nowo gatunek gier przygodowych.' },
  { title: 'Super Mario Odyssey', cs: ['nintendo'], image: 'https://upload.wikimedia.org/wikipedia/en/8/8d/Super_Mario_Odyssey.jpg', p: ['console'], gr: ['platformer', 'adventure'], pl: ['single', 'coop'], y: 2017, price: 229, rating: 9.7, review: { score: 97, label: 'Uniwersalne uznanie' }, description: 'Kolorowa platformowa przygoda Mario z czapką Cappy w roli głównej.' },
  { title: 'Mario Kart 8 Deluxe', cs: ['nintendo'], image: 'https://upload.wikimedia.org/wikipedia/en/b/b5/MarioKart8Boxart.jpg', p: ['console'], gr: ['racing', 'party'], pl: ['single', 'multi'], y: 2017, price: 229, rating: 9.2, review: { score: 92, label: 'Bardzo pozytywne' }, description: 'Najlepsza imprezowa gra wyścigowa — szalone tory i bronie dla całej ekipy.' },
  { title: 'Animal Crossing: New Horizons', cs: ['nintendo'], image: 'https://upload.wikimedia.org/wikipedia/en/1/1f/Animal_Crossing_New_Horizons.jpg', p: ['console'], gr: ['simulation', 'casual'], pl: ['single', 'multi'], y: 2020, price: 229, rating: 9.0, review: { score: 90, label: 'Bardzo pozytywne' }, description: 'Relaksująca symulacja życia na własnej bezludnej wyspie.' },
  { title: 'Super Smash Bros. Ultimate', cs: ['nintendo'], image: 'https://upload.wikimedia.org/wikipedia/en/5/50/Super_Smash_Bros._Ultimate.jpg', p: ['console'], gr: ['fighting', 'party'], pl: ['single', 'multi'], y: 2018, price: 249, rating: 9.3, review: { score: 93, label: 'Uniwersalne uznanie' }, description: 'Ogromna bijatyka z dziesiątkami kultowych postaci z gier.' },
  // Mobilne — dane ręczne, miniaturki z App Store (src: 'itunes')
  { title: 'Genshin Impact', src: 'itunes', q: 'Genshin Impact', p: ['mobile', 'pc', 'console'], gr: ['rpg', 'action', 'adventure'], pl: ['single', 'coop'], y: 2020, price: 0, rating: 8.4, review: { score: 84, label: 'Bardzo pozytywne' }, description: 'Darmowe anime-RPG z rozległym otwartym światem. Grywalne bez płacenia.' },
  { title: 'Clash Royale', src: 'itunes', q: 'Clash Royale', p: ['mobile'], gr: ['strategy', 'competitive', 'casual'], pl: ['multi'], y: 2016, price: 0, rating: 7.8, review: { score: 78, label: 'Pozytywne' }, description: 'Szybkie bitwy karciane 1v1. Idealne na krótkie sesje na telefonie.' },
  { title: 'Monument Valley', src: 'itunes', q: 'Monument Valley', p: ['mobile'], gr: ['puzzle', 'indie', 'casual'], pl: ['single'], y: 2014, price: 16, rating: 9.0, review: { score: 90, label: 'Bardzo pozytywne' }, description: 'Artystyczna gra logiczna z niemożliwą architekturą. Pozycja obowiązkowa.' },
  { title: 'Pokémon GO', src: 'itunes', q: 'Pokemon GO', p: ['mobile'], gr: ['adventure', 'casual'], pl: ['multi'], y: 2016, price: 0, rating: 7.5, review: { score: 75, label: 'Pozytywne' }, description: 'Łap Pokémony w prawdziwym świecie dzięki rozszerzonej rzeczywistości.' },
];

async function main() {
  console.log('▸ Pobieram listy popularnych gier (SteamSpy)…');
  const { map: spy, order: spyOrder } = await steamspyPool();
  console.log(`  SteamSpy: ${spyOrder.length} kandydatów`);

  const curatedSteam = new Map();
  const curatedNonSteam = [];
  for (const s of SEED) {
    const base = {
      steam: s.steam || null, title: s.title, platform: s.p, genre: s.gr, players: s.pl,
      year: s.y, price: s.price ?? null, rating: s.rating ?? null, image: s.image || '',
      description: s.description || '', review: s.review || null, src: s.src || null, q: s.q || null, cs: s.cs || null,
    };
    if (s.steam) curatedSteam.set(s.steam, base);
    else curatedNonSteam.push(base);
  }

  const CAP = 280; // łączny limit gier ze Steam
  const order = [...curatedSteam.keys()];
  for (const id of spyOrder) {
    if (order.length >= CAP) break;
    if (!curatedSteam.has(id)) order.push(id);
  }
  console.log(`▸ Pobieram dane Steam dla ${order.length} gier (to potrwa kilka minut)…`);

  const out = [];
  let n = 0;
  for (const appid of order) {
    const override = curatedSteam.get(appid);
    const entry = override ? { ...override, steam: appid } : { steam: appid, title: spy.get(appid)?.name || '', bulk: true };
    const g = await enrich(entry, spy.get(appid));
    n++;
    if (g) out.push(g);
    if (n % 20 === 0) console.log(`  …${n}/${order.length} (zebrano ${out.length})`);
    await sleep(350);
  }
  for (const e of curatedNonSteam) {
    const g = await enrich(e, null);
    if (g) out.push(g);
  }
  out.forEach((g, i) => (g.id = i + 1));

  console.log('▸ Pobieram promocje i nadchodzące premiery…');
  const { upcoming, featuredDeals, featuredPremiere } = await fetchFeatured();

  const file = `// WYGENEROWANE przez scripts/build-games.mjs — prawdziwe dane ze Steam (ceny w PLN).
// Aby zaktualizować: node scripts/build-games.mjs
export const games = ${serialize(out)};

export const genres = ${JSON.stringify(GENRES, null, 2)};

export const PLATFORM_META = {
  pc: { icon: "🖥️", label: "PC" },
  mobile: { icon: "📱", label: "Mobile" },
  console: { icon: "🎮", label: "Konsola" },
};

export const PLAYER_META = {
  single: { icon: "👤", label: "Solo" },
  coop: { icon: "🤝", label: "Kooperacja" },
  multi: { icon: "🌐", label: "Multiplayer" },
};

export const SORT_OPTIONS = [
  { id: "rating", label: "Najwyżej oceniane" },
  { id: "price-asc", label: "Cena: rosnąco" },
  { id: "price-desc", label: "Cena: malejąco" },
  { id: "year", label: "Najnowsze" },
  { id: "name", label: "Nazwa A–Z" },
];

export const salePeriods = ${JSON.stringify(SALE_PERIODS, null, 2)};

export const upcoming = ${JSON.stringify(upcoming, null, 2)};

export const featuredDeals = ${JSON.stringify(featuredDeals, null, 2)};

export const featuredPremiere = ${JSON.stringify(featuredPremiere, null, 2)};
`;
  writeFileSync(new URL('../src/data/games.js', import.meta.url), file);
  const onSale = out.filter((g) => g.discount > 0).length;
  console.log(`\n✅ ${out.length} gier (${onSale} z promocją), ${featuredDeals.length} ofert Steam, ${upcoming.length} nadchodzących → src/data/games.js`);
}

function serialize(arr) {
  const items = arr.map((g) => {
    const o = {
      id: g.id,
      title: g.title,
      platform: g.platform,
      genre: g.genre,
      players: g.players,
      price: g.price,
      priceOld: g.priceOld ?? null,
      discount: g.discount ?? 0,
      rating: g.rating,
      year: g.year,
      comingSoon: g.comingSoon ?? false,
      image: g.image,
      description: g.description,
      review: g.review,
      tags: g.tags,
      steam: g.steam || null,
      cs: g.cs || null,
      appStoreUrl: g.appStoreUrl || null,
    };
    return '  ' + JSON.stringify(o);
  });
  return '[\n' + items.join(',\n') + ',\n]';
}

main();
