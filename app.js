import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:var(--on-accent)"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const $ = (id) => document.getElementById(id);
const statusEl = $('status');
const LS = (k, v) => { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } };

// ---------- Coop aisles, in walking order ----------
const AISLES = [
  ['fruit', 'Fruit'],
  ['veg', 'Vegetables & herbs'],
  ['bread', 'Bread & baked goods'],
  ['dairy', 'Dairy & eggs'],
  ['meat', 'Meat, fish & veggie'],
  ['ready', 'Ready meals & salads'],
  ['pantry', 'Pantry'],
  ['sweets', 'Sweets & snacks'],
  ['drinks', 'Drinks'],
  ['frozen', 'Frozen'],
  ['home', 'Household & care'],
  ['other', 'Other'],
];
const AISLE_IDX = Object.fromEntries(AISLES.map(([k], i) => [k, i]));

const CATALOG = {
  fruit: 'Bananen|Äpfel Gala|Äpfel Braeburn|Birnen|Clementinen|Orangen|Zitronen|Limetten|Grapefruit|Trauben weiss kernlos|Trauben blau|Kiwi|Mango|Ananas|Avocado|Erdbeeren|Heidelbeeren|Himbeeren|Brombeeren|Kirschen|Aprikosen|Pfirsiche|Nektarinen|Pflaumen|Kaki|Melone|Wassermelone|Granatapfel|Feigen|Datteln Medjool|Datteln getrocknet|Rosinen',
  veg: 'Tomaten|Cherrytomaten|Gurke|Peperoni rot|Peperoni gemischt|Zucchetti|Aubergine|Karotten|Kartoffeln festkochend|Kartoffeln mehligkochend|Süsskartoffeln|Zwiebeln|Rote Zwiebeln|Frühlingszwiebeln|Knoblauch|Ingwer|Lauch|Fenchel|Sellerie|Stangensellerie|Randen gekocht|Broccoli|Blumenkohl|Rosenkohl|Weisskohl|Rotkohl|Spinat|Kopfsalat|Eisbergsalat|Rucola|Nüsslisalat|Babyspinat|Champignons|Radieschen|Mais|Erbsen|Bohnen grün|Kürbis|Petersilie|Dill|Minze|Basilikum|Schnittlauch|Koriander|Chili',
  bread: 'Ruchbrot|Halbweissbrot|Vollkornbrot|Toastbrot|Zopf|Gipfeli|Brötli|Baguette|Fladenbrot|Pita|Tortillas|Knäckebrot|Zwieback',
  dairy: 'Vollmilch|Milch Drink|Laktosefreie Milch|Haferdrink|Rahm|Saurer Halbrahm|Butter|Joghurt nature|Griechischer Joghurt|Fruchtjoghurt|Quark|Hüttenkäse|Mozzarella|Feta|Halloumi|Gruyère|Emmentaler|Appenzeller|Raclettekäse|Parmesan|Reibkäse|Frischkäse|Ricotta|Mascarpone|Eier Freiland 6er|Eier Freiland 10er|Ayran',
  meat: 'Pouletbrust|Poulet ganz|Pouletschenkel|Hackfleisch Rind|Hackfleisch gemischt|Rindsentrecôte|Lammkoteletts|Kalbsbratwurst|Cervelat|Schinken|Trutenbrust Aufschnitt|Salami|Bündnerfleisch|Lachs geräuchert|Lachsfilet|Crevetten|Tofu|Falafel|Planted Chicken',
  ready: 'Lasagne|Gnocchi|Salatbowl|Sushi|Sandwich|Wraps fertig|Suppe',
  pantry: 'Spaghetti|Penne|Fusilli|Lasagneblätter|Basmatireis|Risottoreis|Bulgur|Couscous|Quinoa|Linsen rot|Linsen grün|Kichererbsen Dose|Kidneybohnen|Thunfisch Dose|Pelati Dose|Tomatenpüree|Passata|Olivenöl|Rapsöl|Balsamico|Essig|Salz|Pfeffer|Paprika edelsüss|Kreuzkümmel|Zimt|Bouillon|Mehl|Zucker|Backpulver|Hefe|Haferflocken|Müesli|Cornflakes|Honig|Konfitüre|Nutella|Erdnussbutter|Tahini|Oliven|Senf|Mayonnaise|Ketchup|Sojasauce|Pesto|Kaffee Bohnen|Kaffee Kapseln|Schwarztee|Kräutertee|Grüntee',
  sweets: 'Schokolade Milch|Schokolade dunkel|Guetzli|Chips|Salzstangen|Popcorn|Reiswaffeln|Studentenfutter|Baumnüsse|Mandeln|Haselnüsse|Cashewnüsse|Pistazien|Glace|Gummibärchen|Getreideriegel',
  drinks: 'Mineralwasser still|Mineralwasser mit Kohlensäure|Orangensaft|Apfelsaft|Süssmost|Eistee|Cola|Rivella|Sirup|Bier|Rotwein|Weisswein|Prosecco',
  frozen: 'TK Erbsen|TK Spinat|TK Beeren|TK Gemüsemischung|TK Pommes frites|TK Pizza|TK Fischstäbchen|Blätterteig|Kuchenteig',
  home: 'WC-Papier|Haushaltpapier|Taschentücher|Abfallsäcke 35l|Abfallsäcke 17l|Alufolie|Frischhaltefolie|Backpapier|Gefrierbeutel|Abwaschmittel|Geschirrspültabs|Waschmittel|Weichspüler|Allzweckreiniger|Schwämme|Zahnpasta|Duschgel|Shampoo|Deo|Seife|Wattestäbchen|Batterien',
};

const KEYWORDS = {
  fruit: 'banan muz apfel äpfel elma birne armut clementin mandalina orange portakal zitron limon limette grapefruit traube üzüm kiwi mango ananas avoca avoka erdbeer çilek beere himbeer heidelbeer kirsch kiraz aprikos kayısı pfirsich şeftali nektarin pflaum zwetschg erik kaki persimon trabzon melone kavun wassermelone karpuz granatapfel nar feige incir dattel hurma rosine',
  veg: 'tomat domates gurke salatalık peperoni biber zucchet kabak auberg patlıcan karotte rüebli havuç kartoffel patates süsskartoffel zwiebel soğan knoblauch sarımsak ingwer zencefil lauch pırasa fenchel rezene sellerie kereviz rande pancar broccoli brokoli blumenkohl karnabahar kohl lahana spinat ıspanak salat marul rucola roka nüssli champignon mantar pilz radies turp mais mısır erbse bezelye kürbis petersil maydanoz dill dereotu minze nane basilik fesleğen schnittlauch koriander chili',
  bread: 'brot ekmek toast zopf gipfeli brötli baguette fladen pide pita tortilla wrap lavaş knäcke zwieback simit',
  dairy: 'milch süt rahm krema butter tereyağ joghurt jogurt yoğurt skyr quark kefir käse peynir mozzarell feta halloumi hellim gruy emmental appenzell raclette parmesan parmigiano ricotta mascarpone philadelphia chavroux eier yumurta ayran kaymak labne',
  meat: 'poulet huhn tavuk hack kıyma rind dana lamm kuzu kalb wurst sucuk cervelat schinken salami bündner mostbröckli trutenbrust lachs somon fisch balık crevett karides tofu falafel planted fleisch',
  ready: 'lasagne gnocchi kimchi bowl salatbowl sushi sandwich',
  pantry: 'spaghetti penne fusilli pasta makarna reis pirinç bulgur couscous kuskus quinoa fregola linse mercimek kichererbse nohut bohnen fasulye kidney pelati passata sugo tomatenpüree salça öl yağ olivenöl zeytinyağ balsam essig sirke salz tuz pfeffer paprika pul kreuzkümmel kimyon zimt tarçın bouillon brühe mehl un zucker şeker backpulver hefe maya hafer yulaf müesli granola cornflakes honig bal konfitür reçel nutella erdnussbutter tahin oliv zeytin senf hardal mayo ketchup soja pesto kaffee kahve nespresso tee çay kerne',
  sweets: 'schokolade çikolata chocolate guetzli keks bisküvi chips cips salzstang popcorn reiswaffel maiswaffel studentenfutter nuss nüss ceviz mandel badem fındık cashew pistazi fıstık macadamia pekan erdnüss glace dondurma gummi riegel lokum helva tiramisu',
  drinks: 'wasser su mineral evian saft suyu most eistee cola rivella sirup bier bira wein şarap prosecco soda',
  frozen: 'tk tiefkühl donuk pommes pizza fischstäbchen blätterteig teig',
  home: 'wc tuvalet papier kağıt taschentuch peçete abfall müll çöp folie backpapier beutel poşet abwasch bulaşık geschirr tabs waschmittel deterjan weichspüler reiniger desinfektion schwamm sünger zahnpasta diş dusch shower shampoo şampuan deo seife sabun watte batterie pil pampers labello rasier',
};

function norm(s) {
  return String(s).toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/ß/g, 'ss').normalize('NFD').replace(/[̀-ͯ]/g, '');
}
const kwList = [];
for (const [aisle, words] of Object.entries(KEYWORDS)) for (const w of words.split(' ')) kwList.push([norm(w), aisle]);
kwList.sort((a, b) => b[0].length - a[0].length);
const catalogAisle = new Map();
for (const [aisle, names] of Object.entries(CATALOG)) for (const n of names.split('|')) catalogAisle.set(norm(n), aisle);
function guessAisle(name) {
  const n = norm(name);
  if (catalogAisle.has(n)) return catalogAisle.get(n);
  const words = n.split(/[^a-z0-9]+/).filter(Boolean);
  for (const [k, aisle] of kwList) {
    if (k.length < 2) continue;
    if (words.some(w => w === k || (k.length >= 4 && w.startsWith(k)) || (w.length >= 6 && k.length >= 5 && w.includes(k)))) return aisle;
  }
  return 'other';
}

// ---------- purchase habits ----------
const DAY = 86400000;
const todayStr = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
function dueInfo(it) {
  const b = [...new Set(it.bought || [])].sort();
  if (b.length < 2) return null;
  const ts = b.map(d => Date.parse(d + 'T12:00:00'));
  const avg = (ts[ts.length - 1] - ts[0]) / (ts.length - 1) / DAY;
  const since = (Date.now() - ts[ts.length - 1]) / DAY;
  return { every: Math.max(1, Math.round(avg)), due: since >= avg * 0.9 - 0.5 };
}
const isDue = (it) => !!(it.done && dueInfo(it)?.due);

// ---------- state ----------
// server rows + an outbox of changes not yet confirmed (so ticking works without signal in the store)
let server = new Map((LS('server') || []).map(r => [r.id, r]));
let outbox = LS('outbox') || {}; // id -> {op:'upsert', row} | {op:'delete'}
let items = [];
let me = { email: null, name: '' };
let memberNames = LS('memberNames') || {};
let sb = null, channel = null, localOnly = false;
let shop = LS('shop') || { on: false, ids: [] };
let hideDone = LS('hideDone') === true;
const recentTicks = new Set();
let wakeLock = null;
const saveShop = () => LS('shop', shop);

function rebuild() {
  const m = new Map(server);
  for (const [id, op] of Object.entries(outbox)) {
    if (op.op === 'delete') m.delete(id); else m.set(id, { ...(m.get(id) || {}), ...op.row });
  }
  items = [...m.values()];
}
const aisleOf = (it) => (it.aisle && it.aisle in AISLE_IDX) ? it.aisle : guessAisle(it.name);
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
const find = (id) => items.find(x => x.id === id);

function toRow(it) {
  return { id: it.id, name: it.name, done: !!it.done, ord: it.ord ?? 0, aisle: aisleOf(it), bought: it.bought || [], updated_by: me.email, updated_at: new Date().toISOString() };
}
function change(id, data) {
  if (data === null) outbox[id] = { op: 'delete' };
  else { const cur = find(id) || { id }; outbox[id] = { op: 'upsert', row: toRow({ ...cur, ...data, id }) }; }
  LS('outbox', outbox);
  rebuild(); render();
  flush();
}
function changeMany(list) {
  for (const it of list) outbox[it.id] = { op: 'upsert', row: toRow(it) };
  LS('outbox', outbox);
  rebuild(); render();
  flush();
}

let flushing = false;
async function flush() {
  if (localOnly) { LS('server', [...rebuildLocal()]); return; }
  if (!sb || flushing) return;
  flushing = true;
  try {
    const entries = Object.entries(outbox);
    const ups = entries.filter(([, o]) => o.op === 'upsert').map(([, o]) => o.row);
    const dels = entries.filter(([, o]) => o.op === 'delete').map(([id]) => id);
    if (ups.length) {
      const { error } = await sb.from('items').upsert(ups);
      if (error) throw error;
      for (const r of ups) { server.set(r.id, r); if (outbox[r.id]?.row === r) delete outbox[r.id]; }
    }
    if (dels.length) {
      const { error } = await sb.from('items').delete().in('id', dels);
      if (error) throw error;
      for (const id of dels) { server.delete(id); if (outbox[id]?.op === 'delete') delete outbox[id]; }
    }
    LS('outbox', outbox); LS('server', [...server.values()]);
    if (statusEl.dataset.offline) { statusEl.textContent = ''; delete statusEl.dataset.offline; }
  } catch (e) {
    const n = Object.keys(outbox).length;
    if (e && (e.code === '42501' || /row-level security/i.test(e.message || ''))) {
      statusEl.textContent = "Your email isn't on the family list yet. Ask whoever set up the app to add you.";
    } else if (n) {
      statusEl.textContent = `No connection. ${n} change${n > 1 ? 's' : ''} will sync when you're back online.`;
      statusEl.dataset.offline = '1';
    }
  } finally { flushing = false; }
}
// local-only mode (no Supabase configured): the outbox is the truth
function rebuildLocal() { for (const [id, o] of Object.entries(outbox)) { if (o.op === 'delete') server.delete(id); else server.set(id, o.row); } outbox = {}; LS('outbox', outbox); return server.values(); }
window.addEventListener('online', flush);
setInterval(() => { if (Object.keys(outbox).length) flush(); }, 15000);

// ---------- rendering ----------
const aisleOptions = AISLES.map(([k, label]) => `<option value="${k}">${label}</option>`).join('');
const nameFor = (email) => memberNames[email] || (email ? email.split('@')[0] : 'someone');

function row(it) {
  const li = document.createElement('li');
  li.dataset.id = it.id;
  if (it.done) li.className = 'done';
  li.innerHTML = `<button class="tick" type="button" aria-label="${it.done ? 'Mark as needed' : 'Mark as in the cart'}">${TICK}</button>
    <div class="txt"><span class="name" role="textbox" aria-label="Item name" spellcheck="false"></span><span class="meta"></span></div>
    ${isDue(it) ? `<span class="badge" title="You usually buy this every ${dueInfo(it).every} days">due</span>` : ''}
    <select class="aisle" aria-label="Aisle">${aisleOptions}</select>
    <button class="del" type="button" aria-label="Delete item">×</button>`;
  const name = li.querySelector('.name');
  name.textContent = it.name;
  if (!it.done && it.updated_by && me.email && it.updated_by !== me.email) li.querySelector('.meta').textContent = 'Added by ' + nameFor(it.updated_by);
  name.contentEditable = 'plaintext-only';
  if (name.contentEditable !== 'plaintext-only') name.contentEditable = 'true';

  li.querySelector('.tick').addEventListener('click', () => {
    const t = todayStr();
    let bought = [...(it.bought || [])];
    if (!it.done) {
      if (!bought.includes(t)) bought.push(t);
      bought = bought.slice(-20);
      recentTicks.add(it.id);
      if (shop.on && !shop.ids.includes(it.id)) { shop.ids.push(it.id); saveShop(); }
    } else if (recentTicks.has(it.id)) {
      bought = bought.filter(d => d !== t);
      recentTicks.delete(it.id);
      if (shop.on) { shop.ids = shop.ids.filter(x => x !== it.id); saveShop(); }
    }
    change(it.id, { done: !it.done, bought });
  });
  const commit = () => {
    const v = name.textContent.replace(/\s+/g, ' ').trim();
    if (!v) return change(it.id, null);
    if (v !== it.name) change(it.id, { name: v });
  };
  name.addEventListener('blur', commit);
  name.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); name.blur(); } if (e.key === 'Escape') { name.textContent = it.name; name.blur(); } });
  const sel = li.querySelector('.aisle');
  sel.value = aisleOf(it);
  sel.addEventListener('change', () => { sel.blur(); change(it.id, { aisle: sel.value }); });
  const del = li.querySelector('.del');
  del.addEventListener('pointerdown', e => e.preventDefault());
  del.addEventListener('click', () => change(it.id, null));
  return li;
}
function head(label, n) {
  const li = document.createElement('li');
  li.className = 'aisle-head';
  li.innerHTML = '<span></span><span class="n"></span>';
  li.firstChild.textContent = label; li.lastChild.textContent = n;
  return li;
}

let lastDone = new Map();
function render() {
  const active = document.activeElement;
  const editingId = active && (active.classList.contains('name') || active.classList.contains('aisle')) ? active.closest('li').dataset.id : null;
  const q = norm($('search').value.trim());
  const sorted = [...items].sort((a, b) => (AISLE_IDX[aisleOf(a)] - AISLE_IDX[aisleOf(b)]) || ((a.ord ?? 0) - (b.ord ?? 0)));
  const allTodo = sorted.filter(x => !x.done).length, allDone = sorted.length - allTodo;
  const shown = q ? sorted.filter(x => norm(x.name).includes(q)) : sorted;
  const todo = shown.filter(x => !x.done), done = shown.filter(x => x.done);

  document.body.classList.toggle('shopping', shop.on);
  const tripDone = shop.on ? shop.ids.map(find).filter(x => x && x.done).reverse() : [];
  for (const [el, list] of [[$('todo'), todo], [$('done'), shop.on ? tripDone : (hideDone && !q ? [] : done)]]) {
    const keep = editingId ? el.querySelector(`li[data-id="${CSS.escape(editingId)}"]`) : null;
    const nodes = [];
    let cur = null;
    for (const it of list) {
      const a = aisleOf(it);
      if (a !== cur && !(shop.on && el.id === 'done')) { cur = a; nodes.push(head(AISLES[AISLE_IDX[a]][1], list.filter(x => aisleOf(x) === a).length)); }
      if (keep && it.id === editingId) { nodes.push(keep); continue; }
      const li = row(it);
      if (lastDone.has(it.id) && lastDone.get(it.id) !== it.done) li.classList.add('leaving');
      nodes.push(li);
    }
    el.replaceChildren(...nodes);
  }
  lastDone = new Map(items.map(x => [x.id, x.done]));
  if (!todo.length) $('todo').innerHTML = q ? '<li class="empty">No match in To buy.</li>' : '<li class="empty">Nothing to buy. Untick an item below when you run out of it.</li>';
  if (!shop.on) {
    if (hideDone && done.length && !q) $('done').innerHTML = `<li class="hidden-note">${done.length} item${done.length > 1 ? 's' : ''} hidden</li>`;
    else if (!done.length) $('done').innerHTML = q ? '<li class="empty">No match here either. Press Enter to put it on the list.</li>' : '<li class="empty">Tick items here as they go into the cart.</li>';
  }
  $('count').innerHTML = `<b>${allTodo}</b> to buy · ${allDone} got`;
  $('toggleDone').textContent = hideDone ? 'Show' : 'Hide';
  $('toggleDone').setAttribute('aria-expanded', String(!hideDone));

  $('progress').hidden = !shop.on;
  $('doneLabel').textContent = shop.on ? 'Got it this trip' : 'In the cart';
  if (shop.on) {
    const total = allTodo + tripDone.length;
    $('leftN').textContent = allTodo;
    $('totalN').textContent = total;
    $('pfill').style.width = total ? (100 * tripDone.length / total) + '%' : '0%';
    if (!allTodo) $('todo').innerHTML = '<li class="empty">Everything is in the cart. Tap Finish when you\'re done.</li>';
    if (!tripDone.length) $('done').innerHTML = '<li class="empty">Items you tick show up here. Tap one again to undo.</li>';
  }
  $('startShop').disabled = !allTodo;
  $('startShop').textContent = allTodo ? `Start shopping · ${allTodo} item${allTodo > 1 ? 's' : ''}` : 'Untick what you need, then start shopping';
  const dueItems = items.filter(isDue);
  $('dueBar').hidden = shop.on || !dueItems.length;
  if (dueItems.length) $('dueText').innerHTML = `<b>${dueItems.length}</b> item${dueItems.length > 1 ? 's are' : ' is'} usually due about now, going by how often you buy ${dueItems.length > 1 ? 'them' : 'it'}. They're marked <b>due</b> below.`;
  sharePresence(allTodo);
}

// ---------- presence: who has the list open / is shopping ----------
let lastPresence = '';
function sharePresence(left) {
  if (!channel) return;
  const p = { email: me.email, shopping: !!shop.on, left: shop.on ? left : null };
  const j = JSON.stringify(p);
  if (j !== lastPresence) { lastPresence = j; channel.track(p).catch(() => {}); }
}
function renderPeers() {
  const state = channel ? channel.presenceState() : {};
  const byEmail = new Map();
  for (const metas of Object.values(state)) for (const m of metas) {
    if (!m.email || m.email === me.email) continue;
    const prev = byEmail.get(m.email);
    if (!prev || m.shopping) byEmail.set(m.email, m);
  }
  const box = $('peers');
  box.replaceChildren(...[...byEmail.values()].map(m => {
    const el = document.createElement('span');
    el.className = 'peer' + (m.shopping ? ' shopping' : '');
    el.style.paddingLeft = '10px';
    if (m.shopping) { const b = document.createElement('b'); b.textContent = nameFor(m.email) + ' is shopping'; el.append(b); if (typeof m.left === 'number') el.append(` · ${m.left} left`); }
    else el.textContent = nameFor(m.email) + ' has the list open';
    return el;
  }));
  box.hidden = !byEmail.size;
}

// ---------- controls ----------
$('search').addEventListener('input', render);
$('search').addEventListener('keydown', e => { if (e.key === 'Enter') { $('newItem').value = $('search').value; $('search').value = ''; $('addForm').requestSubmit(); } });
const maxOrd = () => items.reduce((m, x) => Math.max(m, x.ord ?? 0), 0);

const importPanel = $('importPanel'), pickPanel = $('pickPanel');
const showImport = (open) => { importPanel.hidden = !open; $('openImport').setAttribute('aria-expanded', String(open)); if (open) { showPick(false); $('importText').focus(); } };
$('openImport').addEventListener('click', () => showImport(importPanel.hidden));
$('cancelImport').addEventListener('click', () => showImport(false));
$('doImport').addEventListener('click', () => {
  const needed = $('importNeeded').checked;
  const have = new Set(items.map(x => norm(x.name)));
  let ord = maxOrd();
  const added = [];
  for (let line of $('importText').value.split(/\r?\n/)) {
    line = line.replace(/^\s*(?:[-*•◦▪‣·–—]|\[[ xX✓]?\]|[☐☑✓✔○●◯]|\d+[.)])\s*/, '').trim();
    if (!line || have.has(norm(line))) continue;
    have.add(norm(line));
    added.push({ id: newId(), name: line, done: !needed, ord: ++ord, aisle: guessAisle(line), bought: [] });
  }
  showImport(false);
  if (!added.length) { statusEl.textContent = 'Nothing new to add. Those items are already on the list.'; return; }
  $('importText').value = '';
  statusEl.textContent = `Added ${added.length} item${added.length > 1 ? 's' : ''}.`;
  changeMany(added);
});

const picked = new Set();
function drawPicker() {
  const have = new Set(items.map(x => norm(x.name)));
  const wrap = $('pickList');
  wrap.replaceChildren();
  for (const [k, label] of AISLES) {
    if (!CATALOG[k]) continue;
    const h = document.createElement('div'); h.className = 'pick-head'; h.textContent = label;
    const chips = document.createElement('div'); chips.className = 'chips';
    for (const n of CATALOG[k].split('|')) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.textContent = n;
      if (have.has(norm(n))) { b.classList.add('have'); b.disabled = true; b.title = 'Already on your list'; }
      else {
        b.setAttribute('aria-pressed', String(picked.has(n)));
        b.addEventListener('click', () => { picked.has(n) ? picked.delete(n) : picked.add(n); b.setAttribute('aria-pressed', String(picked.has(n))); updatePickBtn(); });
      }
      chips.append(b);
    }
    wrap.append(h, chips);
  }
  updatePickBtn();
}
function updatePickBtn() { const n = picked.size; $('doPick').textContent = `Add ${n} item${n === 1 ? '' : 's'}`; $('doPick').disabled = n === 0; }
function showPick(open) { pickPanel.hidden = !open; $('openPick').setAttribute('aria-expanded', String(open)); if (open) { showImport(false); drawPicker(); } }
$('openPick').addEventListener('click', () => showPick(pickPanel.hidden));
$('cancelPick').addEventListener('click', () => showPick(false));
$('doPick').addEventListener('click', () => {
  const needed = $('pickNeeded').checked;
  let ord = maxOrd();
  const added = [...picked].map(n => ({ id: newId(), name: n, done: !needed, ord: ++ord, aisle: catalogAisle.get(norm(n)), bought: [] }));
  picked.clear(); showPick(false);
  statusEl.textContent = `Added ${added.length} item${added.length > 1 ? 's' : ''}.`;
  changeMany(added);
});

async function keepAwake() { try { if (navigator.wakeLock) wakeLock = await navigator.wakeLock.request('screen'); } catch (e) {} }
document.addEventListener('visibilitychange', () => { if (shop.on && document.visibilityState === 'visible') keepAwake(); if (document.visibilityState === 'visible') flush(); });
$('startShop').addEventListener('click', () => { shop = { on: true, ids: [] }; saveShop(); $('search').value = ''; keepAwake(); render(); window.scrollTo(0, 0); });
$('endShop').addEventListener('click', () => { shop = { on: false, ids: [] }; saveShop(); try { wakeLock && wakeLock.release(); } catch (e) {} wakeLock = null; render(); });
$('dueAdd').addEventListener('click', () => {
  const list = items.filter(isDue).map(it => ({ ...it, done: false }));
  changeMany(list);
  statusEl.textContent = `Moved ${list.length} item${list.length > 1 ? 's' : ''} to To buy.`;
});
$('toggleDone').addEventListener('click', () => { hideDone = !hideDone; LS('hideDone', hideDone); render(); });
$('addForm').addEventListener('submit', e => {
  e.preventDefault();
  const input = $('newItem');
  const v = input.value.trim();
  if (!v) return;
  change(newId(), { name: v, done: false, ord: maxOrd() + 1, aisle: guessAisle(v), bought: [] });
  input.value = '';
  input.focus();
});

// ---------- sign-in + sync ----------
function showApp() { $('signin').hidden = true; $('app').hidden = false; rebuild(); render(); if (shop.on) keepAwake(); }
function showSignin() { $('app').hidden = true; $('signin').hidden = false; }

async function startSync() {
  $('whoami').textContent = me.email ? 'Signed in as ' + me.email + '.' : '';
  const { data: mem } = await sb.from('members').select('email, display_name');
  if (mem) { for (const m of mem) memberNames[m.email] = m.display_name || m.email.split('@')[0]; LS('memberNames', memberNames); }
  if (mem && !mem.some(m => m.email.toLowerCase() === (me.email || '').toLowerCase())) {
    statusEl.textContent = "Your email isn't on the family list yet. Ask whoever set up the app to add you.";
  }
  const load = async () => {
    const { data, error } = await sb.from('items').select('*');
    if (error) { statusEl.textContent = 'Showing the last saved copy. Pull down or reopen the app to retry.'; return; }
    server = new Map(data.map(r => [r.id, r]));
    LS('server', data);
    if (statusEl.textContent.startsWith('Loading')) statusEl.textContent = '';
    rebuild(); render();
    flush();
  };
  channel = sb.channel('list', { config: { presence: { key: me.email || 'anon' } } });
  channel
    .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, (p) => {
      if (p.eventType === 'DELETE') server.delete(p.old.id); else server.set(p.new.id, p.new);
      LS('server', [...server.values()]);
      rebuild(); render();
    })
    .on('presence', { event: 'sync' }, renderPeers)
    .subscribe((st) => { if (st === 'SUBSCRIBED') { lastPresence = ''; render(); load(); } });
  await load();
}

async function boot() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    localOnly = true;
    $('signOut').hidden = true;
    statusEl.textContent = 'Sync is not set up yet, so the list is saved on this phone only.';
    showApp();
    return;
  }
  showApp(); // show the cached list immediately, even offline
  let createClient;
  try { ({ createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm')); }
  catch (e) { statusEl.textContent = 'Offline. Showing the last saved copy; changes sync when you reconnect.'; return; }
  sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { showSignin(); return; }
  me.email = session.user.email;
  startSync();
}

let pendingEmail = '';
$('emailForm').addEventListener('submit', async e => {
  e.preventDefault();
  $('signinErr').textContent = '';
  pendingEmail = $('email').value.trim().toLowerCase();
  $('sendCode').disabled = true;
  const { error } = await sb.auth.signInWithOtp({ email: pendingEmail, options: { shouldCreateUser: true } });
  $('sendCode').disabled = false;
  if (error) { $('signinErr').textContent = error.message.includes('rate') ? 'Too many codes asked for. Wait a few minutes and try again.' : error.message; return; }
  $('emailForm').hidden = true; $('codeForm').hidden = false;
  $('codeHint').textContent = `We sent a code to ${pendingEmail}. Enter it here.`;
  $('code').focus();
});
$('codeForm').addEventListener('submit', async e => {
  e.preventDefault();
  $('signinErr').textContent = '';
  const { data, error } = await sb.auth.verifyOtp({ email: pendingEmail, token: $('code').value.trim(), type: 'email' });
  if (error) { $('signinErr').textContent = "That code didn't work. Check it, or ask for a new one."; return; }
  me.email = data.user.email;
  showApp(); startSync();
});
$('backToEmail').addEventListener('click', () => { $('codeForm').hidden = true; $('emailForm').hidden = false; });
$('signOut').addEventListener('click', async () => {
  if (sb) await sb.auth.signOut();
  localStorage.removeItem('server'); localStorage.removeItem('outbox');
  server = new Map(); outbox = {};
  location.reload();
});

boot();
