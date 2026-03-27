// ReRadar — shared nav, math helpers, data utilities

const TOOL_FOOTER_HTML = `
<footer class="tool-footer">
  <div class="tf-left">
    <span class="tf-logo">Re<span>Radar</span></span>
    <a href="/about" class="tf-link">About</a>
    <a href="/privacy" class="tf-link">Privacy</a>
    <a href="/terms" class="tf-link">Terms</a>
    <a href="mailto:hello@reradar.co" class="tf-link">Contact</a>
  </div>
  <div class="tf-copy">© 2026 ReRadar · reradar.co</div>
</footer>`;

const RES_TOOLS = [
  { id:'property-lookup', label:'Property Lookup',    icon:'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5.5" cy="5.5" r="4.2" stroke="currentColor" stroke-width="1.3" fill="none"/><line x1="8.8" y1="8.8" x2="12" y2="12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>' },
  { id:'deal-analyzer',   label:'Deal Analyzer',      icon:'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="1.5" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M4 8l2 2 4-4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
  { id:'brrrr',           label:'BRRRR Calculator',   icon:'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 12.5V5.5l5-3.5 5 3.5v7" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" fill="none"/><rect x="5" y="8" width="4" height="4.5" rx=".5" stroke="currentColor" stroke-width="1.3" fill="none"/></svg>' },
  { id:'str-analyzer',    label:'STR vs LTR',         icon:'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 4.5h11M1.5 7.5h7M1.5 10.5h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>' },
  { id:'neighborhood',    label:'Neighborhood Score', icon:'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M7 4.5v2.8l1.5 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>' },
  { id:'market-timing',   label:'Market Timing',      icon:'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polyline points="1.5,10.5 4,7 6.5,9 9.5,4 12.5,6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>' },
];
const COM_TOOLS = [
  { id:'maturity-radar',  label:'Maturity Radar',     icon:'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="7" cy="7" r="3" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="7" cy="7" r=".9" fill="currentColor"/></svg>' },
  { id:'distress',        label:'Distress Monitor',   icon:'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2.5v4.5l2 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3" fill="none" opacity=".5"/></svg>' },
  { id:'lp-radar',        label:'LP Radar',           icon:'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5" cy="5" r="2.5" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="10.5" cy="4" r="2" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="10.5" cy="10.5" r="2" stroke="currentColor" stroke-width="1.3" fill="none"/></svg>' },
  { id:'market-intel',    label:'Market Intel',       icon:'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="8" width="2.2" height="4.5" rx=".5" fill="currentColor" opacity=".35"/><rect x="5.5" y="5.5" width="2.2" height="7" rx=".5" fill="currentColor" opacity=".65"/><rect x="9.5" y="2.5" width="2.2" height="10" rx=".5" fill="currentColor"/></svg>' },
  { id:'underwriting',    label:'Deal Underwriting',  icon:'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="1.5" width="11" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M4 7h6M4 4.5h6M4 9.5h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>' },
  { id:'ownership',       label:'Ownership Lookup',   icon:'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="4.5" r="2.5" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M1.5 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" fill="none"/></svg>' },
];

function buildSidebar(activeTool) {
  const isRes = RES_TOOLS.some(t => t.id === activeTool);
  const isCom = COM_TOOLS.some(t => t.id === activeTool);

  const makeLinks = (tools, comActive) => tools.map(t => `
    <a href="/tools/${t.id}" class="sidebar-link ${t.id===activeTool?'active'+(comActive?' com-active':''):''}">
      ${t.icon} ${t.label}
      <span class="sl-dot"></span>
    </a>`).join('');

  document.querySelector('.sidebar').innerHTML = `
    <a href="/" class="sidebar-logo">
      <div class="sidebar-logo-mark">
        <svg viewBox="0 0 18 18" fill="none" width="15" height="15">
          <circle cx="9" cy="9" r="3" fill="#1A1714"/>
          <circle cx="9" cy="9" r="6" stroke="#1A1714" stroke-width="1.5" fill="none" opacity=".6"/>
          <circle cx="9" cy="9" r="8.5" stroke="#1A1714" stroke-width="1" fill="none" opacity=".3"/>
        </svg>
      </div>
      <span class="sidebar-logo-text">Re<span>Radar</span></span>
    </a>
    <div class="sidebar-section">
      <div class="sidebar-section-label"><span class="ssl-dot res"></span>Residential</div>
      ${makeLinks(RES_TOOLS, false)}
    </div>
    <hr class="sidebar-divider"/>
    <div class="sidebar-section">
      <div class="sidebar-section-label"><span class="ssl-dot com"></span>Commercial</div>
      ${makeLinks(COM_TOOLS, true)}
    </div>
    <div class="sidebar-footer">
      <a href="/" class="sidebar-back">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Back to home
      </a>
      <div class="sidebar-version">reradar.co · v2026.1</div>
    </div>`;

  // Inject footer
  const mc = document.querySelector('.main-content');
  if (mc && !mc.querySelector('.tool-footer')) {
    mc.insertAdjacentHTML('beforeend', TOOL_FOOTER_HTML);
  }

  // Mobile overlay
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  // Mobile toggle — topbar menu btn
  const menuBtn = document.querySelector('.topbar-menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      document.querySelector('.sidebar').classList.toggle('open');
      overlay.classList.toggle('show');
    });
  }
  overlay.addEventListener('click', () => {
    document.querySelector('.sidebar').classList.remove('open');
    overlay.classList.remove('show');
  });
}

// ── DATA ATTRIBUTION BAR ──
function dataBar(sources, date) {
  return `<div class="data-bar">
    <span class="data-bar-label">Sources</span>
    <div class="data-bar-sources">
      ${sources.map((s,i) => `${i>0?'<span class="data-bar-dot"></span>':''}<span>${s}</span>`).join('')}
    </div>
    <span class="data-bar-date">As of ${date || 'March 2026'}</span>
  </div>`;
}

// ── MARKET SEARCH ──
function buildMarketSearch(placeholder, onInput) {
  return `<div class="market-search">
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style="color:var(--text3);flex-shrink:0">
      <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.3" fill="none"/>
      <line x1="10.2" y1="10.2" x2="13.5" y2="13.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    </svg>
    <input id="mktSearch" type="text" placeholder="${placeholder||'Search any market, city, or zip...'}"
      oninput="${onInput||'liveFilter(this.value)'}"/>
    <span class="search-count" id="searchCount"></span>
    <button class="search-clear" onclick="clearSearch()">Clear</button>
  </div>`;
}

function liveFilter(q) {
  const query = q.toLowerCase().trim();
  const rows = document.querySelectorAll('[data-searchable]');
  let n = 0;
  rows.forEach(r => {
    const match = !query || r.dataset.searchable.toLowerCase().includes(query);
    r.style.display = match ? '' : 'none';
    if (match) n++;
  });
  const el = document.getElementById('searchCount');
  if (el) el.textContent = query ? `${n} result${n!==1?'s':''}` : '';
}

function clearSearch() {
  const inp = document.getElementById('mktSearch');
  if (inp) { inp.value = ''; liveFilter(''); }
}

// ── MATH HELPERS ──
const fmt     = n => '$' + Math.abs(Math.round(n)).toLocaleString();
const fmtM    = n => n>=1e9 ? '$'+(n/1e9).toFixed(2)+'B' : n>=1e6 ? '$'+(n/1e6).toFixed(2)+'M' : fmt(n);
const fmtSign = n => (n>=0?'+':'−')+'$'+Math.abs(Math.round(n)).toLocaleString();
const pct     = (n,d=1) => (isFinite(n)?Math.abs(n).toFixed(d):'—')+'%';
const pctSign = (n,d=1) => (n>=0?'+':'−')+Math.abs(n).toFixed(d)+'%';

function calcMortgage(principal, annualRate, termYears) {
  if (!annualRate) return principal / (termYears * 12);
  const r = annualRate / 12, n = termYears * 12;
  return principal * (r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1);
}

function calcIRR(cfs) {
  let r = 0.1;
  for (let i = 0; i < 1000; i++) {
    let npv = 0, dnpv = 0;
    cfs.forEach((c,t) => { npv+=c/Math.pow(1+r,t); dnpv-=t*c/Math.pow(1+r,t+1); });
    const nr = r - npv/dnpv;
    if (Math.abs(nr-r) < 1e-8) { r=nr; break; }
    r = isFinite(nr) ? nr : r + 0.01;
  }
  return r * 100;
}

function annualDepreciation(price) { return (price * 0.8) / 27.5; }

// ── LIVE DATA ──
async function fetchMortgageRate() {
  try {
    const r = await fetch('https://fred.stlouisfed.org/graph/fredgraph.csv?id=MORTGAGE30US');
    const t = await r.text();
    const lines = t.trim().split('\n');
    const val = parseFloat(lines[lines.length-1].split(',')[1]);
    return isFinite(val) ? val : 7.24;
  } catch { return 7.24; }
}

function colorClass(v, good, bad) {
  return v >= good ? 'good' : v <= bad ? 'bad' : 'ok';
}
