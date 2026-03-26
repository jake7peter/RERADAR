// ReRadar v2 — Shared sidebar navigation
// Include this script on every tool page

function buildSidebar(activeTool) {
  const resTools = [
    { id: 'property-lookup', label: 'Property Lookup', icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.3" fill="none"/><line x1="9.5" y1="9.5" x2="12.5" y2="12.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>` },
    { id: 'deal-analyzer', label: 'Deal Analyzer', icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="1.5" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M4 8l2 2 4-4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    { id: 'brrrr', label: 'BRRRR Calculator', icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 12V5.5l5-3.5 5 3.5V12" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" fill="none"/><rect x="5" y="8" width="4" height="4" rx=".5" stroke="currentColor" stroke-width="1.3" fill="none"/></svg>` },
    { id: 'str-analyzer', label: 'STR vs LTR', icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 4.5h11M1.5 7h7M1.5 9.5h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>` },
    { id: 'neighborhood', label: 'Neighborhood Score', icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M7 4.5v2.5l1.5 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>` },
    { id: 'market-timing', label: 'Market Timing', icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polyline points="1.5,10.5 4,7.5 6.5,9 9.5,4.5 12.5,6.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>` },
  ];
  const comTools = [
    { id: 'maturity-radar', label: 'Maturity Radar', icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="7" cy="7" r="3" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="7" cy="7" r=".8" fill="currentColor"/></svg>` },
    { id: 'distress', label: 'Distress Monitor', icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2.5v4.5l2 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3" fill="none" opacity=".5"/></svg>` },
    { id: 'lp-radar', label: 'LP Radar', icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5" cy="5" r="2.5" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="10.5" cy="4" r="2" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="10.5" cy="10.5" r="2" stroke="currentColor" stroke-width="1.3" fill="none"/></svg>` },
    { id: 'market-intel', label: 'Market Intel', icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="8" width="2" height="4.5" rx=".5" fill="currentColor" opacity=".4"/><rect x="5.5" y="5.5" width="2" height="7" rx=".5" fill="currentColor" opacity=".7"/><rect x="9.5" y="2.5" width="2" height="10" rx=".5" fill="currentColor"/></svg>` },
    { id: 'underwriting', label: 'Deal Underwriting', icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="1.5" width="11" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M4 7h6M4 4.5h6M4 9.5h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>` },
    { id: 'ownership', label: 'Ownership Lookup', icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="4.5" r="2.5" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M1.5 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" fill="none"/></svg>` },
  ];

  const isRes = resTools.some(t => t.id === activeTool);
  const isCom = comTools.some(t => t.id === activeTool);

  const resLinks = resTools.map(t => `
    <a href="/tools/${t.id}" class="sidebar-link ${t.id === activeTool ? 'active' : ''}">
      ${t.icon} ${t.label}
    </a>`).join('');

  const comLinks = comTools.map(t => `
    <a href="/tools/${t.id}" class="sidebar-link ${t.id === activeTool ? 'active com-active' : ''}">
      ${t.icon} ${t.label}
    </a>`).join('');

  const html = `
    <a href="/" class="sidebar-logo">
      <div class="sidebar-logo-mark">
        <svg viewBox="0 0 18 18" fill="none" width="16" height="16">
          <circle cx="9" cy="9" r="3" fill="#1A1714"/>
          <circle cx="9" cy="9" r="6" stroke="#1A1714" stroke-width="1.5" fill="none" opacity=".6"/>
          <circle cx="9" cy="9" r="8.5" stroke="#1A1714" stroke-width="1" fill="none" opacity=".3"/>
        </svg>
      </div>
      <span class="sidebar-logo-text">Re<span>Radar</span></span>
    </a>

    <div class="sidebar-section">
      <div class="sidebar-section-label">
        <span class="ssl-dot res"></span> Residential
      </div>
      ${resLinks}
    </div>

    <hr class="sidebar-divider"/>

    <div class="sidebar-section">
      <div class="sidebar-section-label">
        <span class="ssl-dot com"></span> Commercial
      </div>
      ${comLinks}
    </div>

    <hr class="sidebar-divider"/>
    <a href="/" class="sidebar-back">← Back to home</a>
  `;

  document.querySelector('.sidebar').innerHTML = html;

  // Mobile toggle
  document.querySelector('.sidebar-toggle').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('open');
  });
}

// Helpers used across all tools
const fmt   = n => '$' + Math.abs(Math.round(n)).toLocaleString();
const fmtM  = n => n >= 1e6 ? '$' + (n/1e6).toFixed(2) + 'M' : fmt(n);
const fmtSign = n => (n >= 0 ? '+' : '−') + '$' + Math.abs(Math.round(n)).toLocaleString();
const pct   = (n, d=1) => (n >= 0 ? '' : '−') + Math.abs(n).toFixed(d) + '%';
const pctSign = (n, d=1) => (n >= 0 ? '+' : '−') + Math.abs(n).toFixed(d) + '%';

// Mortgage payment calculator
function calcMortgage(principal, annualRate, termYears) {
  if (annualRate === 0) return principal / (termYears * 12);
  const r = annualRate / 12;
  const n = termYears * 12;
  return principal * (r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1);
}

// IRR using Newton's method
function calcIRR(cashflows) {
  let r = 0.1;
  for (let i = 0; i < 1000; i++) {
    let npv = 0, dnpv = 0;
    cashflows.forEach((c, t) => {
      npv  += c / Math.pow(1+r, t);
      dnpv -= t * c / Math.pow(1+r, t+1);
    });
    const nr = r - npv/dnpv;
    if (Math.abs(nr - r) < 1e-8) { r = nr; break; }
    r = nr;
  }
  return r * 100;
}

// Depreciation (residential: 27.5yr straight line on structure = 80% of value)
function annualDepreciation(purchasePrice) {
  return (purchasePrice * 0.8) / 27.5;
}

// FRED API - fetch current 30yr mortgage rate
async function fetchMortgageRate() {
  try {
    const res = await fetch('https://fred.stlouisfed.org/graph/fredgraph.csv?id=MORTGAGE30US&vintage_date=2026-03-26');
    const text = await res.text();
    const lines = text.trim().split('\n');
    const last = lines[lines.length - 1].split(',');
    return parseFloat(last[1]);
  } catch(e) { return 7.24; } // fallback
}

// Color class helpers
function colorClass(val, goodThreshold, badThreshold) {
  if (val >= goodThreshold) return 'good';
  if (val <= badThreshold) return 'bad';
  return 'ok';
}
