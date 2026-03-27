// ReRadar Residential — shared nav, helpers, live data

const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='3' fill='%232D4A3E'/%3E%3Ccircle cx='16' cy='16' r='4' fill='%23F5F0E8'/%3E%3Ccircle cx='16' cy='16' r='8' stroke='%23F5F0E8' stroke-width='1.5' fill='none' opacity='.6'/%3E%3Ccircle cx='16' cy='16' r='13' stroke='%23F5F0E8' stroke-width='1' fill='none' opacity='.3'/%3E%3C/svg%3E";

const TOOLS = [
  { id:'property-lookup', label:'Property Lookup',    icon:'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5.5" cy="5.5" r="4.2" stroke="currentColor" stroke-width="1.3" fill="none"/><line x1="8.8" y1="8.8" x2="12" y2="12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>' },
  { id:'deal-analyzer',   label:'Deal Analyzer',      icon:'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="1.5" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M4 8l2 2 4-4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
  { id:'brrrr',           label:'BRRRR Calculator',   icon:'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 12.5V5.5l5-3.5 5 3.5v7" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" fill="none"/><rect x="5" y="8" width="4" height="4.5" rx=".5" stroke="currentColor" stroke-width="1.3" fill="none"/></svg>' },
  { id:'str-analyzer',    label:'STR vs LTR',         icon:'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 4.5h11M1.5 7.5h7M1.5 10.5h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>' },
  { id:'neighborhood',    label:'Neighborhood Score', icon:'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M7 4.5v2.8l1.5 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>' },
  { id:'market-timing',   label:'Market Timing',      icon:'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polyline points="1.5,10.5 4,7 6.5,9 9.5,4 12.5,6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>' },
];

function buildSidebar(activeId) {
  const nav = document.querySelector('.sidebar');
  if (!nav) return;
  nav.innerHTML = `
    <a href="/" class="sb-logo">
      <div class="sb-logo-mark">
        <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
          <circle cx="10" cy="10" r="3" fill="#F5F0E8"/>
          <circle cx="10" cy="10" r="6.5" stroke="#F5F0E8" stroke-width="1.3" fill="none" opacity=".6"/>
          <circle cx="10" cy="10" r="9.5" stroke="#F5F0E8" stroke-width="1" fill="none" opacity=".3"/>
        </svg>
      </div>
      <span class="sb-logo-text">Re<em>Radar</em></span>
    </a>
    <div class="sb-section">
      <div class="sb-section-label">Residential tools</div>
      ${TOOLS.map(t => `
        <a href="/tools/${t.id}" class="sb-link${t.id===activeId?' active':''}">
          ${t.icon} ${t.label}
        </a>`).join('')}
    </div>
    <div class="sb-footer">
      <a href="/" class="sb-back">
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Home
      </a>
    </div>`;

  // Footer
  const mc = document.querySelector('.main-content');
  if (mc && !mc.querySelector('.tool-footer')) {
    mc.insertAdjacentHTML('beforeend', `
      <footer class="tool-footer">
        <div class="tf-left">
          <span class="tf-logo">Re<em>Radar</em></span>
          <a href="/about" class="tf-link">About</a>
          <a href="/privacy" class="tf-link">Privacy</a>
          <a href="/terms" class="tf-link">Terms</a>
          <a href="mailto:hello@reradar.co" class="tf-link">Contact</a>
        </div>
        <div class="tf-copy">© 2026 ReRadar · reradar.co</div>
      </footer>`);
  }

  // Mobile overlay
  let ov = document.getElementById('__sbOv');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = '__sbOv';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(28,43,36,.35);z-index:190;display:none;backdrop-filter:blur(2px);';
    ov.onclick = closeSidebar;
    document.body.appendChild(ov);
  }
}

function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
  const ov = document.getElementById('__sbOv');
  if (ov) ov.style.display = document.querySelector('.sidebar').classList.contains('open') ? 'block' : 'none';
}
function closeSidebar() {
  document.querySelector('.sidebar').classList.remove('open');
  const ov = document.getElementById('__sbOv');
  if (ov) ov.style.display = 'none';
}

// Live FRED mortgage rate
async function fetchRate() {
  try {
    const r = await fetch('https://fred.stlouisfed.org/graph/fredgraph.csv?id=MORTGAGE30US');
    const t = await r.text();
    const lines = t.trim().split('\n');
    const val = parseFloat(lines[lines.length-1].split(',')[1]);
    return isFinite(val) ? val : 7.24;
  } catch { return 7.24; }
}

// Helpers
const fmt = n => '$' + Math.abs(Math.round(n)).toLocaleString();
const fmtSign = n => (n>=0?'+':'−') + '$' + Math.abs(Math.round(n)).toLocaleString();
const pct = (n,d=1) => (isFinite(n)?Math.abs(n).toFixed(d):'—')+'%';
const pctSign = (n,d=1) => (n>=0?'+':'−')+Math.abs(n).toFixed(d)+'%';

function calcMortgage(principal, rate, years) {
  if (!rate) return principal / (years * 12);
  const r = rate/12, n = years*12;
  return principal * (r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1);
}
function calcIRR(cfs) {
  let r = 0.1;
  for (let i=0;i<1000;i++) {
    let npv=0,dnpv=0;
    cfs.forEach((c,t)=>{npv+=c/Math.pow(1+r,t);dnpv-=t*c/Math.pow(1+r,t+1);});
    const nr = r - npv/dnpv;
    if (Math.abs(nr-r)<1e-8){r=nr;break;}
    r = isFinite(nr)?nr:r+.01;
  }
  return r*100;
}
function annualDepr(price) { return (price*0.8)/27.5; }
function colorClass(v,good,bad) { return v>=good?'good':v<=bad?'bad':'ok'; }
