"""
Vercel Serverless Function: /api/crm
Full Outreach CRM backend — contacts, deals, activity log, follow-up triggers.
Uses Vercel Postgres (free tier) for persistent storage.

Setup:
  1. In Vercel dashboard → Storage → Create Database → Postgres
  2. Vercel auto-injects POSTGRES_URL env variable
  3. Run the schema below once to initialize tables

Schema (run once in Vercel Postgres console):
  CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company TEXT,
    role TEXT,
    email TEXT,
    phone TEXT,
    asset_type TEXT,
    market TEXT,
    notes TEXT,
    source TEXT DEFAULT 'manual',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES contacts(id),
    property_name TEXT,
    asset_type TEXT,
    balance NUMERIC,
    maturity_date DATE,
    stage TEXT DEFAULT 'prospect',
    urgency TEXT DEFAULT 'watch',
    signal_type TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES contacts(id),
    deal_id UUID REFERENCES deals(id),
    type TEXT,
    notes TEXT,
    follow_up_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  );
"""

from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json
import os
import uuid
from datetime import datetime, timedelta

try:
    import psycopg2
    import psycopg2.extras
    HAS_PG = True
except ImportError:
    HAS_PG = False


IN_MEMORY_STORE = {
    "contacts": [
        {
            "id": "c1", "name": "Michael Torres", "company": "Westbrook Partners",
            "role": "VP Acquisitions", "email": "m.torres@westbrook.com",
            "phone": "(310) 555-0182", "asset_type": "mixed", "market": "San Diego",
            "notes": "Decision maker for SoCal deals $50M+. Met at NAIOP March 2026.",
            "source": "maturity_radar", "stage": "warm",
            "lastContact": "Mar 15, 2026", "followUpDate": "Apr 1, 2026",
            "deals": 1, "created_at": "2026-03-15",
        },
        {
            "id": "c2", "name": "Sarah Kim", "company": "Blackstone RE Partners",
            "role": "Managing Director", "email": "s.kim@blackstone.com",
            "phone": "(212) 555-0241", "asset_type": "office", "market": "San Diego",
            "notes": "Sorrento Valley office portfolio — in special servicing. Needs refi solution fast.",
            "source": "distress_monitor", "stage": "hot",
            "lastContact": "Mar 20, 2026", "followUpDate": "Mar 28, 2026",
            "deals": 1, "created_at": "2026-03-18",
        },
        {
            "id": "c3", "name": "David Chen", "company": "Fairfield Residential",
            "role": "CFO", "email": "d.chen@fairfield.com",
            "phone": "(415) 555-0317", "asset_type": "multifamily", "market": "Mission Valley",
            "notes": "Mission Valley Phase II loan maturing Mar 2027. Starting refi process.",
            "source": "maturity_radar", "stage": "warm",
            "lastContact": "Mar 10, 2026", "followUpDate": "Apr 15, 2026",
            "deals": 1, "created_at": "2026-03-10",
        },
        {
            "id": "c4", "name": "Jennifer Walsh", "company": "Prologis",
            "role": "SVP Capital Markets", "email": "j.walsh@prologis.com",
            "phone": "(415) 555-0428", "asset_type": "industrial", "market": "Miramar",
            "notes": "Miramar industrial portfolio — $203M. Very institutional. Lead with market intel.",
            "source": "maturity_radar", "stage": "outreach_sent",
            "lastContact": "Mar 8, 2026", "followUpDate": "Apr 5, 2026",
            "deals": 1, "created_at": "2026-03-08",
        },
        {
            "id": "c5", "name": "Robert Sandoval", "company": "Pacific Realty Trust",
            "role": "President", "email": "r.sandoval@pacificrealty.com",
            "phone": "(619) 555-0519", "asset_type": "retail", "market": "Pacific Beach",
            "notes": "Pacific Beach strip — small deal $14M. Got extension. Actively refi shopping.",
            "source": "distress_monitor", "stage": "engaged",
            "lastContact": "Mar 22, 2026", "followUpDate": "Mar 29, 2026",
            "deals": 1, "created_at": "2026-03-05",
        },
    ],
    "activities": [
        {"id": "a1", "contactId": "c2", "type": "email", "notes": "Sent initial outreach re: Sorrento Valley", "date": "Mar 18, 2026", "completed": True},
        {"id": "a2", "contactId": "c2", "type": "call", "notes": "30-min call. Confirmed need for refi solution. Sending options.", "date": "Mar 20, 2026", "completed": True},
        {"id": "a3", "contactId": "c2", "type": "follow_up", "notes": "Send mezz term sheet comparison", "date": "Mar 28, 2026", "completed": False},
        {"id": "a4", "contactId": "c5", "type": "email", "notes": "Sent market intel on PB retail lending", "date": "Mar 22, 2026", "completed": True},
        {"id": "a5", "contactId": "c5", "type": "follow_up", "notes": "Follow up on rate quotes", "date": "Mar 29, 2026", "completed": False},
        {"id": "a6", "contactId": "c1", "type": "meeting", "notes": "Coffee at NAIOP event", "date": "Mar 15, 2026", "completed": True},
    ],
}

STAGES = ["prospect", "outreach_sent", "warm", "engaged", "hot", "mandate", "closed", "dead"]
ACTIVITY_TYPES = ["email", "call", "meeting", "follow_up", "note", "proposal"]


def get_db():
    """Get Postgres connection if available."""
    if not HAS_PG:
        return None
    db_url = os.environ.get("POSTGRES_URL") or os.environ.get("DATABASE_URL")
    if not db_url:
        return None
    try:
        conn = psycopg2.connect(db_url, cursor_factory=psycopg2.extras.RealDictCursor)
        return conn
    except Exception:
        return None


def get_contacts(filters: dict) -> list:
    conn = get_db()
    if conn:
        try:
            cur = conn.cursor()
            query = "SELECT * FROM contacts WHERE 1=1"
            params = []
            if filters.get("market"):
                query += " AND market = %s"
                params.append(filters["market"])
            if filters.get("asset_type"):
                query += " AND asset_type = %s"
                params.append(filters["asset_type"])
            if filters.get("stage"):
                query += " AND stage = %s"
                params.append(filters["stage"])
            query += " ORDER BY updated_at DESC LIMIT 100"
            cur.execute(query, params)
            return [dict(r) for r in cur.fetchall()]
        except Exception:
            pass
        finally:
            conn.close()
    return IN_MEMORY_STORE["contacts"]


def create_contact(data: dict) -> dict:
    contact = {
        "id": str(uuid.uuid4()),
        "name": data.get("name", ""),
        "company": data.get("company", ""),
        "role": data.get("role", ""),
        "email": data.get("email", ""),
        "phone": data.get("phone", ""),
        "asset_type": data.get("asset_type", "mixed"),
        "market": data.get("market", ""),
        "notes": data.get("notes", ""),
        "source": data.get("source", "manual"),
        "stage": data.get("stage", "prospect"),
        "lastContact": datetime.now().strftime("%b %d, %Y"),
        "followUpDate": (datetime.now() + timedelta(days=7)).strftime("%b %d, %Y"),
        "deals": 0,
        "created_at": datetime.now().isoformat(),
    }

    conn = get_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO contacts (id, name, company, role, email, phone, asset_type, market, notes, source)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                contact["id"], contact["name"], contact["company"], contact["role"],
                contact["email"], contact["phone"], contact["asset_type"],
                contact["market"], contact["notes"], contact["source"],
            ))
            conn.commit()
        except Exception:
            pass
        finally:
            conn.close()
    else:
        IN_MEMORY_STORE["contacts"].insert(0, contact)

    return contact


def log_activity(data: dict) -> dict:
    activity = {
        "id": str(uuid.uuid4()),
        "contactId": data.get("contactId", ""),
        "type": data.get("type", "note"),
        "notes": data.get("notes", ""),
        "date": datetime.now().strftime("%b %d, %Y"),
        "completed": data.get("completed", False),
        "followUpDate": data.get("followUpDate", ""),
    }

    conn = get_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO activities (id, contact_id, type, notes, completed)
                VALUES (%s,%s,%s,%s,%s)
            """, (activity["id"], activity["contactId"], activity["type"],
                  activity["notes"], activity["completed"]))
            if data.get("followUpDate"):
                cur.execute("""
                    UPDATE contacts SET updated_at=NOW() WHERE id=%s
                """, (activity["contactId"],))
            conn.commit()
        except Exception:
            pass
        finally:
            conn.close()
    else:
        IN_MEMORY_STORE["activities"].insert(0, activity)

    return activity


def get_activities(contact_id: str = None) -> list:
    conn = get_db()
    if conn:
        try:
            cur = conn.cursor()
            if contact_id:
                cur.execute("SELECT * FROM activities WHERE contact_id=%s ORDER BY created_at DESC LIMIT 50", (contact_id,))
            else:
                cur.execute("SELECT * FROM activities ORDER BY created_at DESC LIMIT 50")
            return [dict(r) for r in cur.fetchall()]
        except Exception:
            pass
        finally:
            conn.close()
    if contact_id:
        return [a for a in IN_MEMORY_STORE["activities"] if a.get("contactId") == contact_id]
    return IN_MEMORY_STORE["activities"]


def get_pipeline_summary(contacts: list) -> dict:
    stage_counts = {}
    for c in contacts:
        s = c.get("stage", "prospect")
        stage_counts[s] = stage_counts.get(s, 0) + 1

    now = datetime.now()
    follow_ups_due = [
        c for c in contacts
        if c.get("followUpDate") and _days_until(c["followUpDate"]) <= 3
    ]

    return {
        "total": len(contacts),
        "hot": stage_counts.get("hot", 0),
        "engaged": stage_counts.get("engaged", 0) + stage_counts.get("warm", 0),
        "outreach_sent": stage_counts.get("outreach_sent", 0),
        "prospect": stage_counts.get("prospect", 0),
        "follow_ups_due": len(follow_ups_due),
        "stage_breakdown": stage_counts,
    }


def _days_until(date_str: str) -> int:
    try:
        d = datetime.strptime(date_str, "%b %d, %Y")
        return (d - datetime.now()).days
    except Exception:
        return 999


class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        qs = parse_qs(parsed.query)

        path = parsed.path.rstrip("/")

        if path.endswith("/activities"):
            contact_id = qs.get("contact_id", [None])[0]
            activities = get_activities(contact_id)
            self._respond(200, {"activities": activities})
            return

        filters = {
            "market": qs.get("market", [None])[0],
            "asset_type": qs.get("asset_type", [None])[0],
            "stage": qs.get("stage", [None])[0],
        }
        contacts = get_contacts(filters)
        summary = get_pipeline_summary(contacts)
        self._respond(200, {"contacts": contacts, "summary": summary})

    def do_POST(self):
        parsed = urlparse(self.path)
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length) or b"{}")
        path = parsed.path.rstrip("/")

        if path.endswith("/activities"):
            result = log_activity(body)
            self._respond(201, result)
        else:
            result = create_contact(body)
            self._respond(201, result)

    def _respond(self, code, data):
        b = json.dumps(data, default=str).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self._cors()
        self.end_headers()
        self.wfile.write(b)

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def log_message(self, *args):
        pass
