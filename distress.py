"""
Vercel Serverless Function: /api/outreach
Generates personalized outreach emails via Claude API.
"""

from http.server import BaseHTTPRequestHandler
import json, os, re, urllib.request

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200); self._cors(); self.end_headers()

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        try:
            prospect = json.loads(body)
        except:
            self._respond(400, {"error": "Invalid JSON"}); return
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            self._respond(500, {"error": "ANTHROPIC_API_KEY not configured"}); return
        result = self._generate(prospect, api_key)
        self._respond(200, result)

    def _generate(self, p, api_key):
        risk_ctx = ""
        flags = p.get("risk_flags", [])
        if flags: risk_ctx = f"Risk signals: {', '.join(flags)}."
        prompt = f"""You are a senior debt & equity broker at a top CRE capital markets firm.
Write a cold outreach email to a commercial real estate borrower whose CMBS loan is approaching maturity.

LOAN DETAILS:
- Property: {p.get('property_name')}
- Asset Type: {p.get('asset_type')}
- Submarket: {p.get('submarket')}, San Diego
- Borrower: {p.get('borrower')}
- Loan Balance: {p.get('balance_display')}
- Maturity: {p.get('maturity_display')} ({p.get('months_left')} months away)
- Current Rate: {p.get('interest_rate', 0):.2f}%
- Originator: {p.get('originator', '')}
- LTV: {p.get('ltv', 0):.0f}%
- DSCR: {p.get('dscr', 0):.2f}x
- {risk_ctx}

RULES: 150-200 words max. Reference actual loan details. Lead with market insight.
One clear ask: a 20-minute call. Tone: confident, peer-to-peer, not salesy.
End with "Best," and "[Your Name]". Never use "synergy", "leverage" as verb, "reach out".
Return ONLY a JSON object with keys "subject" and "body". No markdown."""

        payload = json.dumps({
            "model": "claude-sonnet-4-20250514",
            "max_tokens": 600,
            "messages": [{"role": "user", "content": prompt}],
        }).encode()
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages", data=payload,
            headers={"Content-Type":"application/json","x-api-key":api_key,"anthropic-version":"2023-06-01"},
            method="POST")
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read())
                text = data["content"][0]["text"].strip()
                text = re.sub(r"^```json\s*","",text); text = re.sub(r"\s*```$","",text)
                return json.loads(text)
        except Exception as e:
            return {
                "subject": f"Re: {p.get('balance_display')} CMBS Maturity — {p.get('maturity_display')}",
                "body": f"Hi [Decision Maker],\n\nI noticed the {p.get('balance_display')} note on {p.get('property_name')} matures in {p.get('maturity_display')}. Happy to walk through refinancing options.\n\nBest,\n[Your Name]",
            }

    def _respond(self, code, data):
        b = json.dumps(data).encode()
        self.send_response(code)
        self.send_header("Content-Type","application/json")
        self._cors(); self.end_headers(); self.wfile.write(b)

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin","*")
        self.send_header("Access-Control-Allow-Methods","POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers","Content-Type")

    def log_message(self, *args): pass
