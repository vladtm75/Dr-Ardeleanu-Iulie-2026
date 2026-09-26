#!/usr/bin/env python3
"""Extrage datele pentru pachetul CFO (tab-urile Sinteză CFO / Finanțare / Capex din cashflow-report.html)
din Excel-ul lunar de P&L și scrie `cfo-data.js` (ES module: `export const CFO = {...}`).

Rulare:  python3 build_cfo_data.py "P&L IULIE 2026 V1.8.1.xlsx"      (necesită openpyxl)

IMPORTANT — confidențialitate: `cfo-data.js` conține profit net, datorie, capex și dobânzi. E blocat în
.gitignore și NU se publică până nu există protecția (criptarea) raportului. Excel-ul nu se publică niciodată.

Rândurile se caută după ETICHETĂ (coloana A), nu după număr, ca scriptul să supraviețuiască inserării de
rânduri între versiunile Excel-ului. Coloanele de lună se citesc din antetul fiecărei foi (dată + Actual/Buget/RF).
"""
import sys, json, datetime, re
try:
    import openpyxl
except ImportError:
    sys.exit('Lipsește openpyxl:  pip install openpyxl')

SRC = sys.argv[1] if len(sys.argv) > 1 else 'P&L IULIE 2026 V1.8.1.xlsx'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'cfo-data.js'

# Metadate pe proiecte care NU sunt în Excel — de completat / confirmat de Vlad (deschidere, unituri).
PROJECTS = [
    {'key': 'TGV', 'name': 'Târgoviște',      'opened': '2025-08', 'units': 8,    'status': 'deschis'},
    {'key': 'FCS', 'name': 'Focșani',         'opened': '2026-03', 'units': 5,    'status': 'deschis'},
    {'key': 'BRL', 'name': 'Brăila',          'opened': '2026-11', 'units': 11,   'status': 'în construcție'},
    {'key': 'SLT', 'name': 'Slatina',         'opened': None,      'units': None, 'status': 'proiect'},
    {'key': 'CMP', 'name': 'Câmpina',         'opened': None,      'units': None, 'status': 'proiect'},
    {'key': 'CDA', 'name': 'Curtea de Argeș', 'opened': None,      'units': None, 'status': 'proiect'},
]
# eticheta din Excel (Capex) după care se recunoaște fiecare proiect
PROJ_LABEL = {'TGV': 'targoviste', 'FCS': 'focsani', 'BRL': 'braila', 'SLT': 'slatina', 'CMP': 'campina', 'CDA': 'curtea de'}

def norm(s):
    s = str(s or '').strip().lower()
    for a, b in (('ă','a'),('â','a'),('î','i'),('ș','s'),('ş','s'),('ț','t'),('ţ','t')):
        s = s.replace(a, b)
    return re.sub(r'\s+', ' ', s)

wb = openpyxl.load_workbook(SRC, data_only=True, read_only=True)

def load(name, maxr=120, maxc=60):
    return [list(r) for r in wb[name].iter_rows(min_row=1, max_row=maxr, max_col=maxc, values_only=True)]

def month_cols(rows):
    """(index coloană, 'YYYY-MM', tip) din primul rând cu >3 date; tipul din rândul următor.
    Citește DOAR primul bloc de luni: se oprește la primul antet text după începutul datelor (ex. „YTD 2024"),
    ca să nu ia coloanele de comparație din dreapta foii (care au și ele date în antet)."""
    for i, r in enumerate(rows[:6]):
        if sum(isinstance(v, datetime.datetime) for v in r) > 3:
            t = rows[i + 1] if i + 1 < len(rows) else []
            out, started = [], False
            for j, v in enumerate(r):
                if isinstance(v, datetime.datetime):
                    started = True
                    out.append((j, v.strftime('%Y-%m'), str(t[j] if j < len(t) else '').strip()))
                elif started and isinstance(v, str) and v.strip():
                    break
            return out
    raise ValueError('antet de luni negăsit')

is_act = lambda t: norm(t).startswith('act')        # „Actual" (și greșeala „Actiual" din Excel)
is_bud = lambda t: norm(t).startswith('bu')         # „Budget" / „Buget"

def find(rows, label, start=0, exact=False):
    L = norm(label)
    for i in range(start, len(rows)):
        v = norm(rows[i][0] if rows[i] else '')
        if (v == L) if exact else v.startswith(L):
            return i
    raise KeyError(f'rândul „{label}" negăsit')

def series(rows, i, cols):
    return [(round(rows[i][j]) if isinstance(rows[i][j], (int, float)) else None) for j, _, _ in cols]

# ── P&L grup ───────────────────────────────────────────────────────────────
PL = load('P&L', 90)
plc = month_cols(PL)
act = [c for c in plc if is_act(c[2])]
bud = [c for c in plc if is_bud(c[2]) and c[1].startswith('2026')]
PL_ROWS = {
    'sales': 'Total Sales', 'cos': 'Cost of sales', 'doctors': 'Medical Cost', 'staff': 'Staff Cost', 'sga': 'SGA Cost',
    'ebitdaNet': 'EBITDA Network', 'icRent': 'Intercompany Rent', 'ebitdar': 'EBITDAR Network', 'hq': 'NET HQ COST',
    'ebitda': 'EBITDA GROUP', 'vva': 'Other VVA Costs', 'oneoff': 'One off', 'depOpco': 'Depreciation Cost Opco',
    'depPropco': 'Depreciation Cost Propco', 'finOpco': 'Finance Cost & Comissions Opco',
    'finPropco': 'Finance Cost & Comissions Propco', 'taxOpco': 'Tax cost Opco', 'taxPropco': 'Tax cost Propco',
    'net': 'Net Consolidated Income',
}
pl = {'months': [c[1] for c in act], 'budgetMonths': [c[1] for c in bud], 'actual': {}, 'budget': {}}
for k, lab in PL_ROWS.items():
    i = find(PL, lab, exact=(k in ('cos',)))  # „Cost of sales " vs „Cost of sales %"
    if k == 'cos' and norm(PL[i][0]).endswith('%'):
        i = find(PL, 'Cost of sales', start=i + 1)
    pl['actual'][k] = series(PL, i, act)
    pl['budget'][k] = series(PL, i, bud)

# ── Cashflow ───────────────────────────────────────────────────────────────
CF = load('Cashflow', 70)
cfc = month_cols(CF)
CF_ROWS = {
    'cashOpen': 'Cash Opening Balance', 'ebitda': 'GOURP EBITDA', 'vvaPaid': 'VVA paid', 'oneoff': 'One off',
    'taxPaid': 'Taxation effectively paid', 'opCF': 'Net Cash from Operating', 'capexRE': 'CAPEX (RE',
    'capexFit': 'CAPEX (Clinics fitout', 'capexEQ': 'CAPEX (EQ', 'invCF': 'Net Cash from Investing',
    'equity': 'Equity financing', 'euGrant': 'EU grant', 'debtDev': 'Bank Debt injection for development',
    'debtHold': 'Bank Debt injection for holding', 'overdraft': 'Bank Overdraft', 'otherDebt': 'NET Other Debt',
    'dividends': 'NET Dividends payments', 'repay': 'Bank Debt Repayment', 'interest': 'Interest & Comissions Paid',
    'divTax': 'Dividend taxation paid', 'finCF': 'Net Cash from Financing', 'wcCF': 'Cash from Working Capital',
    'cashEnd': 'Cash in hand', 'netDebt': 'Net bank debt', 'totalDebt': 'Total Debt (w/o', 'odAllowance': 'Overdraft bank allowance',
}
cf = {'months': [c[1] for c in cfc], 'type': ['Actual' if is_act(c[2]) else c[2] for c in cfc]}
for k, lab in CF_ROWS.items():
    cf[k] = series(CF, find(CF, lab), cfc)

# ── Capex ──────────────────────────────────────────────────────────────────
CX = load('Capex', 70)
cxc = month_cols(CX)
capex = {'months': [c[1] for c in cxc], 'type': [c[2] for c in cxc], 'projects': [], 'operational': {}}
def proj_row(prefix, key):
    for i, r in enumerate(CX):
        v = norm(r[0] if r else '')
        if v.startswith(norm(prefix)) and PROJ_LABEL[key] in v:
            return i
    return None
for p in PROJECTS:
    k = p['key']; d = dict(p)
    for part, prefix in (('re', 'Asset Purchase'), ('fit', 'Fitout, Planning & Others'), ('eq', 'Equipment')):
        i = proj_row(prefix, k)
        d[part] = series(CX, i, cxc) if i is not None else [None] * len(cxc)
    capex['projects'].append(d)
capex['operational']['fit'] = series(CX, find(CX, 'Fitout Planning & Upgrades'), cxc)
capex['operational']['eq'] = series(CX, find(CX, 'Equipment Operational'), cxc)
capex['operational']['reOther'] = series(CX, find(CX, 'Asset Purchase - Others'), cxc)
# „Total Investments" = rândul corect (rândurile Capex PROPCO/OPCO/Total sunt cumulative în 2026 în Excel)
capex['total'] = series(CX, find(CX, 'Total Investments'), cxc)
capex['budget2026'] = series(CX, find(CX, 'Buget Capex 2026'), cxc)
capex['depTotal'] = series(CX, find(CX, 'Total Depreciation'), cxc)

# ── Acționari: dividende, reinvestire (DP), VVA, impozit pe dividende ─────────────────
# Foaia are un al doilea bloc de „Budget" stricat (#REF!, cu antet de date 2025 repetate) — se citește doar primul
# bloc, oprit la prima lună care se repetă. Dec 2024 e marcat „Budget" în Excel, dar conține realizat.
SH = load('Shareholders', 40)
shc, seen = [], set()
for j, m, t in month_cols(SH):
    if m in seen: break
    seen.add(m); shc.append((j, m, t))
SH_ROWS = {'dp': 'Quasi equity financing', 'divGross': 'Shareholders Dividends', 'divNet': 'Net Dividend paid',
           'vva': 'Shareholdes VVA', 'total': 'TOTAL RON', 'totalEUR': 'TOTAL EUR', 'divTax': 'Dividend tax'}
sh = {'months': [c[1] for c in shc]}
for k, lab in SH_ROWS.items():
    sh[k] = series(SH, find(SH, lab), shc)

# ── Clinici: vânzări + EBITDAR lunar (pentru payback / randament pe proiecte deschise) ─────────
clinics = {}
for code in ('OLT', 'GRG', 'SLB', 'CLR', 'DRB', 'CTR', 'TGV', 'FCS', 'BRL'):
    S = load(code, 60)
    sc = month_cols(S); sa = [c for c in sc if is_act(c[2])]
    clinics[code] = {'months': [c[1] for c in sa], 'sales': series(S, find(S, 'Sales'), sa), 'ebitdar': series(S, find(S, 'EBITDAR'), sa)}

out = {
    'meta': {'source': SRC.split('/')[-1], 'generated': datetime.date.today().isoformat(),
             'plActualThrough': pl['months'][-1],
             'capexActualThrough': max((m for m, t in zip(capex['months'], capex['type']) if is_act(t)), default=None),
             'cashActualThrough': max((m for m, t in zip(cf['months'], cf['type']) if is_act(t)), default=None)},
    'pl': pl, 'cf': cf, 'capex': capex, 'clinics': clinics, 'sh': sh,
}
with open(OUT, 'w', encoding='utf-8') as f:
    f.write('// GENERAT de build_cfo_data.py din ' + out['meta']['source'] + ' — CONFIDENȚIAL, nu se publică necriptat.\n')
    f.write('export const CFO = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(f"OK → {OUT} · P&L actual până la {out['meta']['plActualThrough']} · capex actual până la {out['meta']['capexActualThrough']} · cashflow actual până la {out['meta']['cashActualThrough']}")
