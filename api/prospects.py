"""
Vercel Serverless Function: /api/prospects
Screens CMBS loans maturing in the next 0-24 months across San Diego.
"""

from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json
from datetime import datetime, timedelta
import uuid

ASSET_TYPE_MAP = {
    "MF":  ["multifamily", "apartment", "residential"],
    "RTL": ["retail", "shopping", "mall", "strip"],
    "OFF": ["office"],
    "IND": ["industrial", "warehouse", "storage", "flex"],
    "HTL": ["hotel", "hospitality", "motel"],
}

DEMO_LOANS = [
    {"propertyName":"Westfield UTC Mall","propertyType":"Retail","submarket":"University City","borrower":"Unibail-Rodamco-Westfield","currentBalance":312000000,"maturityDate":"2026-08-01","interestRate":4.85,"originator":"Wells Fargo","ltv":68.0,"dscr":1.18,"occupancy":91.0},
    {"propertyName":"Sorrento Valley Office Campus","propertyType":"Office","submarket":"Sorrento Valley","borrower":"Blackstone Real Estate Partners","currentBalance":145000000,"maturityDate":"2026-06-01","interestRate":4.50,"originator":"Citibank","ltv":79.0,"dscr":1.05,"occupancy":78.0},
    {"propertyName":"Mission Valley Apartments Phase II","propertyType":"Multifamily","submarket":"Mission Valley","borrower":"Fairfield Residential","currentBalance":67000000,"maturityDate":"2027-03-01","interestRate":3.95,"originator":"Freddie Mac","ltv":72.0,"dscr":1.32,"occupancy":95.0},
    {"propertyName":"Miramar Industrial Portfolio","propertyType":"Industrial","submarket":"Miramar","borrower":"Prologis","currentBalance":203000000,"maturityDate":"2027-01-01","interestRate":4.10,"originator":"MetLife","ltv":55.0,"dscr":1.65,"occupancy":99.0},
    {"propertyName":"Balboa Ave Self-Storage Portfolio","propertyType":"Industrial","submarket":"Kearny Mesa","borrower":"StorWest Properties","currentBalance":28000000,"maturityDate":"2026-11-01","interestRate":5.20,"originator":"JPMorgan","ltv":61.0,"dscr":1.45,"occupancy":93.0},
    {"propertyName":"Pacific Beach Retail Strip","propertyType":"Retail","submarket":"Pacific Beach","borrower":"Pacific Realty Trust","currentBalance":14000000,"maturityDate":"2027-02-01","interestRate":5.75,"originator":"Bridge Bank","ltv":58.0,"dscr":1.28,"occupancy":89.0},
    {"propertyName":"Otay Ranch Apartments","propertyType":"Multifamily","submarket":"Chula Vista","borrower":"Greystar Real Estate","currentBalance":89000000,"maturityDate":"2027-09-01","interestRate":3.75,"originator":"Fannie Mae","ltv":65.0,"dscr":1.41,"occupancy":96.0},
    {"propertyName":"Carlsbad Outlet Center","propertyType":"Retail","submarket":"Carlsbad","borrower":"Simon Property Group","currentBalance":178000000,"maturityDate":"2026-09-01","interestRate":4.65,"originator":"Goldman Sachs","ltv":71.0,"dscr":1.22,"occupancy":94.0},
    {"propertyName":"Del Mar Heights Office","propertyType":"Office","submarket":"Del Mar Heights","borrower":"Irvine Company","currentBalance":52000000,"maturityDate":"2026-12-01","interestRate":4.30,"originator":"Deutsche Bank","ltv":66.0,"dscr":1.15,"occupancy":82.0},
    {"propertyName":"Rancho Bernardo Business Park","propertyType":"Industrial","submarket":"Rancho Bernardo","borrower":"Longpoint Realty Partners","currentBalance":41000000,"maturityDate":"2027-04-01","interestRate":4.55,"originator":"Prudential","ltv":60.0,"dscr":1.55,"occupancy":97.0},
]

def normalize(raw, months_window):
    ptype = raw.get("propertyType","").lower()
    asset_type = "OTH"
    for code, kws in ASSET_TYPE_MAP.items():
        if any(k in ptype for k in kws):
            asset_type = code
            break
    bal = raw.get("currentBalance", 0)
    try:
        maturity = datetime.strptime(raw["maturityDate"][:10], "%Y-%m-%d")
    except:
        return None
    months_left = max(0, int((maturity - datetime.now()).days / 30))
    if months_left > months_window:
        return None
    urgency = "watch"
    if months_left <= 6: urgency = "hot"
    elif months_left <= 12: urgency = "warm"
    ltv = float(raw.get("ltv", 0) or 0)
    dscr = float(raw.get("dscr", 0) or 0)
    occ = float(raw.get("occupancy", 0) or 0)
    risk_flags = []
    if ltv > 75: risk_flags.append("High LTV")
    if 0 < dscr < 1.20: risk_flags.append("Thin DSCR")
    if 0 < occ < 85: risk_flags.append("Low Occupancy")
    if asset_type == "OFF": risk_flags.append("Office Headwinds")
    score = (24 - months_left) * 3 + (ltv / 10) + len(risk_flags) * 5
    return {
        "id": str(uuid.uuid4()),
        "property_name": raw.get("propertyName","Unknown"),
        "asset_type": asset_type,
        "submarket": raw.get("submarket","San Diego"),
        "borrower": raw.get("borrower","Unknown"),
        "balance": bal,
        "balance_display": f"${bal/1e6:.1f}M",
        "maturity_display": maturity.strftime("%b %Y"),
        "months_left": months_left,
        "interest_rate": float(raw.get("interestRate",0) or 0),
        "originator": raw.get("originator",""),
        "ltv": ltv, "dscr": dscr, "occupancy": occ,
        "urgency": urgency, "risk_flags": risk_flags, "score": score,
    }

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        qs = parse_qs(parsed.query)
        months = int(qs.get("months",["24"])[0])
        min_bal = float(qs.get("min_balance",["5"])[0]) * 1_000_000
        prospects = []
        for raw in DEMO_LOANS:
            loan = normalize(raw, months)
            if loan and loan["balance"] >= min_bal:
                prospects.append(loan)
        prospects.sort(key=lambda x: x["score"], reverse=True)
        body = json.dumps({"prospects": prospects, "count": len(prospects)})
        self.send_response(200)
        self.send_header("Content-Type","application/json")
        self.send_header("Access-Control-Allow-Origin","*")
        self.end_headers()
        self.wfile.write(body.encode())
    def log_message(self, *args): pass
