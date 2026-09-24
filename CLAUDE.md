# CLAUDE.md — Rezultate Financiare Iulie 2026

Repo static (`vladtm75/Dr-Ardeleanu-Iulie-2026`, branch `main`), publicat prin GitHub Pages (`https://vladtm75.github.io/Dr-Ardeleanu-Iulie-2026/`), fără build step — fiecare `.html` e servit ca atare. Vezi [README.md](README.md) pentru harta fișier→raport.

## Autentificare — două nivele

**1. Parola generală a site-ului** (`index.html`)
- Parolă unică în clar în JS: `var HOME_PW = "ArdeleanuIulie";` — potrivire directă cu inputul, fără hash.
- La succes: `sessionStorage.setItem('reportsAuth','1')`.
- `index.html` acceptă `?next=<fisier>` (validat contra unei liste albe `ALLOWED` din același script) pentru a redirecta spre raportul cerut după deblocare, cu titlu contextual din harta `TITLES`.
- Fiecare pagină de raport are în `<head>` un guard care verifică `sessionStorage.reportsAuth==="1"`; dacă lipsește, redirect la `index.html?next=<fisier-curent>`.

**2. Cheie de partajare per-raport** (adăugat 2026-08-16)
- Fiecare din cele 3 perechi desktop+mobil (Sales, EBITDA/P&L, Cashflow) are propria cheie secretă și propriul hash SHA-256, verificate **doar în browser** (nimic nu se trimite pe server):
  | Raport | localStorage key (`LK`) | Fișiere care împart cheia |
  |---|---|---|
  | Sales | `adcAuthSales` | `sales-desktop.html`, `sales-mobile.html` |
  | EBITDA / P&L | `adcAuthEbitda` | `pl-desktop.html`, `pl-mobile.html` |
  | Cashflow | `adcAuthCashflow` | `cashflow-report.html`, `cashflow-summary.html` |
- Linkul de partajare are forma `<fisier>.html#k=<cheie-in-clar>`. Scriptul din `<head>`-ul fiecărei pagini de raport:
  1. lasă acces liber dacă `sessionStorage.reportsAuth==='1'` (parola generală deja introdusă),
  2. lasă acces liber dacă `localStorage[LK]` conține deja hash-ul corect (raport deblocat anterior pe acest device),
  3. altfel, dacă URL-ul are `#k=...`, calculează SHA-256 al cheii și-l compară cu hash-ul `O` scris în script; la match salvează hash-ul în `localStorage[LK]`, curăță `#k=` din bara de adrese și afișează pagina; la nepotrivire redirectă la `index.html?next=...`.
  4. altfel redirectă la `index.html?next=...`.
- Pe `index.html`, fiecare card (Sales/EBITDA/Cashflow) are un buton **„Partajează doar acest raport"** (`.share-btn`, `data-share="sales|ebitda|cashflow"`). Un obiect `SHARE` din scriptul de la finalul `index.html` mapează fiecare la `{url, key}` (cheia e în clar acolo — codul e oricum vizibil oricui în view-source, deci nu există niciun beneficiu de securitate ascunzând-o din CLAUDE.md).
- **Revocare**: pentru a invalida un link partajat deja trimis, generează o cheie nouă + hash-ul ei SHA-256 (`python3 -c "import hashlib; print(hashlib.sha256(b'noua-cheie').hexdigest())"`), apoi înlocuiește atât `O`/`LK` din cele 2 fișiere ale raportului respectiv, cât și `key` din `SHARE` din `index.html`. Vechile linkuri nu vor mai da match pe noul hash.
- Cele 2 fișiere ale unei perechi desktop/mobil au **același** `O`/`LK` intenționat — o singură cheie deblochează ambele variante (localStorage e per-origine, nu per-fișier).

## Open Graph / preview WhatsApp

Toate cele 6 pagini de raport (desktop + mobil) au acum meta-tag-uri OG complete în `<head>` (`og:title`, `og:description`, `og:image` 1200×630, `twitter:*`), fiecare trimițând spre o imagine dedicată la rădăcina repo-ului (`OG_Sales_Jul2026.jpg`, `OG_PL_Jul2026.png`, `OG_Cashflow_Jul2026.jpg`). Desktop și mobil pentru același raport folosesc aceeași imagine/descriere. Când actualizezi un raport cu date noi dintr-o lună nouă, actualizează și imaginea OG + textul `og:description` (cifrele cheie) — altfel preview-ul de link rămâne cu numerele vechi.

## Layout butoane pe `index.html`

Pe fiecare card, cele două link-uri (`.btn-main` = desktop, `.btn-mobile` = mobil) sunt grupate într-un `.actions-row`:
- **≥760px** (`@media(min-width:760px)`): stau unul lângă altul pe același rând; eticheta `.btn-main` se scurtează automat la „🖥️ Desktop" (span `.lbl-short`) ca să încapă — textul lung „🖥️ Deschide raportul desktop" (`.lbl-full`) e ascuns.
- **<760px** (telefon): rămân stivuite ca înainte, cu `.btn-mobile` promovat vizual (`order:-1`, fundal olive) și `.btn-main` demotat la contur — comportamentul original, neschimbat.

Butonul `.share-btn` stă mereu sub `.actions-row`, pe rândul lui, indiferent de lățimea ecranului.

## Antetul de rețea din `sales-mobile.html` — generat

Blocul de sus din fiecare vedere a cardului mobil (Lună / YTD: card rețea cu evoluția lunară, 3 indicatori, split comparabile vs noi, progres față de bugetul anual, analiza „Puncte forte / De urmărit") este **generat** din datele din `sales-desktop.html` (`CD`, `NET`, `ACT_MO`) de scriptul `build_mobile_head.py`, între markerii `<!-- NET-HEAD:month -->` / `<!-- NET-HEAD:ytd -->`. Nu edita manual acel bloc: după actualizarea datelor în desktop, rulează `python3 build_mobile_head.py` (idempotent). Restul cardului (rândurile per clinică, hero-ul/OG) rămâne pe fluxul skill-ului `dr-ardeleanu-sales-mobile`.

## `sales-desktop.html` — convenții introduse în Sept 2026 (raportul de August)

**Comentarii calculate din date, nu text fix.** Analiza de pe Rețea, Categorii, Pacienți, Feedback, Clustere și Clinici („Puncte forte / De urmărit") se construiește la randare din `CD`, `NET`, `CAT_DATA`, `PATIENTS_*`, `FEEDBACK_*`, `OPS_KPI`, `MED_KPI`. La o lună nouă nu se rescrie niciun text — se actualizează doar datele și `ACT_MO`. Nu reintroduce alerte cu nume de clinici scrise de mână.

**Componente comune de antet** (definite înainte de `NetworkTab`): `HeadTile` (indicator cu explicație), `InsightCol` / `InsightPanel` (analiza pe două coloane). Layout-ul card principal + 3 indicatori folosește clasele CSS `.net-head` / `.net-hero` (4 coloane desktop, card pe tot rândul + 3 indicatori sub 1000px, o coloană sub 680px). Paginile noi de antet trebuie să le refolosească, ca aspectul să rămână unitar.

**Tooltip-uri (`.da-info`).** Conținutul stă în `.da-info-tip` (ascuns, `display:none`), dar e desenat de scriptul de la finalul paginii într-un strat unic `#da-tip-layer` cu `position:fixed` — ca să nu fie tăiat de `overflow` sau acoperit de casete vecine. Nu schimba `.da-info-tip` înapoi în poziționare absolută vizibilă.

**Evidențiere Ops-Sales / Ops-Med = regula Puls** (dedusă din valorile afișate în Puls — codul Puls nu e accesibil): funcția `bigDev` + constantele `DEV_PP = 10` (pp la indicatori %) și `DEV_REL = 0.40` (relativ). Clinica se compară cu MTD-ul clusterului (doar rânduri-rată/medie, nu sume); MTD se colorează doar dacă deviază în aceeași direcție față de AMBELE medii Y-1 și YTD (pe orice rând). Consimțământ: `CONSENT_RULES` (CNP < 100% și Email < 95% = roșu; Acord date / CESGS / API / Olograf la ±5pp). „Plan tratament" nu mai e în KPI Clinică — e în secțiunea „Consimțământ & Date Pacient" din Ops-Med, lângă API și Olograf. Aceeași regulă alimentează „indicatorii operaționali" din analiza fiecărei clinici.

**LFL.** Creșterea LFL pe an complet (FY 24/23, FY 25/24) se calculează doar pe clinicile cu 12 luni complete în AMBII ani comparați (altfel o clinică deschisă în anul de bază umflă creșterea). Clinicile noi (TGV, FCS) sunt excluse din orice comparație YoY pe clinică (afișate „nou").

**Ramp-up.** Rândurile Dr. Ardeleanu se recalculează din `CD`: 2026 = estimare (realizat Ian–luna curentă + buget pentru lunile rămase, marcat „e"); o clinică fără vânzări încă (Brăila) = doar buget (marcat „b"); CA/unit = vânzări ultimele 12 luni / unituri. Rândurile concurenței rămân valori fixe din bilanțuri.

**`BUDGET_FLAGS`** — obiect pentru a semnala un buget de confirmat (apare pe Buget, Rețea și pagina clinicii). E gol: bugetul TGV (Apr–Dec identic cu OLT) a fost verificat pe 2026-09-24 contra fișierului de buget (rândul Budget 2026, total 5.659.125) și e corect.

## De știut (neactualizat încă)

- **Copia din Puls** (`script.google.com/.../exec?page=monthlynew`) încorporează o versiune mai veche a raportului de vânzări, fără corecțiile și designul de mai sus (ex. încă afișează „OLT — presiune YoY +43.4%" și LFL greșit). Trebuie actualizată în Apps Script de cine îl întreține — nu se actualizează din acest repo.
- **Actuals 2025 Târgoviște (Sep–Dec)** diferă ușor între Puls (sursa raportului), raportul P&L și fișierul de buget (~3K, 0,2%). De stabilit o sursă unică.
