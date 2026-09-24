# Manual de actualizare lunară — Dr.Ardeleanu-Overview

Repo static pe GitHub Pages, fără build step. Adresa: https://biancabajenaru.github.io/Dr.Ardeleanu-Overview/

## Unde stau datele în fiecare raport

| Raport | Fișier | Unde sunt datele | Efort lunar |
|---|---|---|---|
| Cashflow desktop | `cashflow-report.js` | `const DATA = [...]` (linii ~34–48), **un rând per lună** | mic — adaugi un rând |
| Cashflow mobil | `cashflow-summary.html` | cifre scrise direct în markup | mediu — editezi manual |
| P&L desktop | `pl-desktop.html` | blocuri `G`, `CLINICS`, `CLUSTERS`, `OTH_DETAIL`, `ACCT_NOTE`, `BRL_HOLD_FAV`, `LFL_CLINICS` (toate în primele ~2650 linii; randarea vine după) | se **regenerează** cu skill-ul `dr-ardeleanu-monthly-fs` |
| P&L mobil | `pl-mobile.html` | cifre în markup | idem — se regenerează |
| Sales desktop | `sales-desktop.html` | ~15 blocuri: `CD`, `NET`, `MED_KPI`, `OPS_KPI`, `CAT_DATA`, `PATIENTS_*`, `FEEDBACK_*` (unele JSON pe o singură linie de ~17KB) | mare — se regenerează |
| Sales mobil | `sales-mobile.html` | date + hero-ul ca imagine base64 pe o singură linie de 132KB | se regenerează, nu se editează manual |

`cashflow-report.html` este doar un shell care încarcă `cashflow-report.js`. Randarea (graficele, KPI-urile, waterfall-ul) se recalculează singură din date — nu se atinge.

## Fluxul lunar (pattern-ul lui Vlad, deja vizibil în repo)

**1. Arhivează luna curentă** înainte de a o înlocui:
```
pl-desktop.html        →  pl-desktop-jun-2026.html
cashflow-report.js     →  cashflow-report-jun-2026.js
cashflow-report.html   →  cashflow-report-jun-2026.html   (schimbă în el src-ul către .js-ul arhivat)
```

**2. Actualizează versiunea curentă** cu datele lunii noi (vezi tabelul de mai sus).

**3. `index.html` — 3 locuri de atins:**
- `var ALLOWED = [...]` (linia ~454) — adaugă numele fișierelor arhivate noi
- harta `TITLES` (liniile ~477–491) — adaugă titlul arhivei: `"pl-desktop-jun-2026.html":"P&L / EBITDA · Iunie 2026 (desktop, arhivă)"`
- titlurile lunii pe cele 3 carduri + `og:description`

**4. Cache-buster (ușor de uitat!)** — în `cashflow-report.html`, linia 74:
`<script type="module" src="cashflow-report.js?v=20260807c">`
Schimbă `v=` la fiecare update, altfel browserele care au deschis raportul înainte servesc JS-ul vechi din cache.

**5. Imaginile OG** — `OG_Sales_*.jpg`, `OG_PL_*.jpg`, `OG_Cashflow_*.jpg` (1200×630) plus textul `og:description` din fiecare pagină. Dacă nu le regenerezi, preview-ul de link din WhatsApp rămâne cu cifrele lunii trecute.

**6. Parola** — `var HOME_PW = "ArdeleanuIulie";` în `index.html`, linia 453. Text în clar, fără hash.

## Chei de partajare per raport

Fiecare pereche desktop+mobil are o cheie proprie (link de forma `fisier.html#k=cheie`). Cheile actuale, din `SHARE` la finalul `index.html`:
`sales-b5d403`, `ebitda-2530ec`, `cashflow-3d1ee8`.

Ca să **revoci** un link deja trimis: generează cheie nouă + hash-ul ei
```
python3 -c "import hashlib; print(hashlib.sha256(b'cheie-noua').hexdigest())"
```
apoi înlocuiește `O` (hash-ul) în ambele fișiere ale raportului **și** `key` în `SHARE` din `index.html`.

## De reținut

- Arhivele lunare **nu apar** pe pagina principală — sunt accesibile doar prin link direct (`index.html?next=pl-desktop-may-2026.html`). Dacă vrei o secțiune „Arhivă" pe index, trebuie adăugată.
- `.nojekyll` trebuie să existe în rădăcină, altfel GitHub Pages poate ignora fișiere.
- Repo public = codul e vizibil oricui, inclusiv parola. Gate-ul ține oaspeții departe de pagină, nu e securitate reală.
