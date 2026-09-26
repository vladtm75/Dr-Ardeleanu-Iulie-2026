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

**`BUDGET_FLAGS`** — obiect pentru a semnala un buget de confirmat (apare pe Buget, Rețea și pagina clinicii). E gol. Bugetele de vânzări 2026 OLT și TGV au fost verificate (2026-09-24/25) contra fișierelor de buget ale fiecărei clinici — raportul le reproduce la leu. **Atenție la sursă:** în modelul de buget, TGV Apr–Dec este identic la leu cu OLT Apr–Dec; bugetul OLT e confirmat ca propriu (fișierul OLT), deci TGV Apr–Dec pare copiat — întrebare deschisă la cine a construit bugetul. Dacă vin cifre corectate, se înlocuiesc în `CD.TGV.budget[2026]`.

## Tab-ul „Sinteză" (CEO) — primul tab, deschis implicit

Un singur ecran pentru un CEO. **Regula de bază: fiecare informație apare o singură dată** (decizie explicită cu Vlad, 2026-09-25) — nu adăuga în Sinteză ce e deja în alt bloc al ei. Patru blocuri, fiecare cu un singur rol:
1. **Banda** (doar rețea): vânzări (contor animat), YoY, organic (LFL), vs buget, inel de progres față de bugetul anual (marcaj = timp scurs), estimare an (= realizat YTD + buget pe lunile rămase — de aceea nu i se mai afișează „vs buget", ar fi identic cu ecartul YTD).
2. **Harta rețelei** (`SxMap`, SVG cu poziții geografice aproximative în `SX_GEO`, Dunărea în `SX_DANUBE`) — singurul loc cu vânzări + vs buget per clinică (culoare + etichetă). Click → pagina clinicii.
3. **„Cine a adus creșterea"** (`SxBridge`, punte/waterfall 2025 → 2026 pe clinici, clinici noi separat, axă trunchiată și marcată) — singurul loc cu creșterea per clinică; dedesubt o singură linie „volum sau valoare" (pacienți unici × venit / pacient).
4. **„Unde intervin"** (`SxOutliers` + `sxOutliers()`) — singura listă de probleme / puncte forte, **doar abateri mari**: clinici vs MTD-ul clusterului și rețea vs media Y-1 și YTD (aceeași direcție) pe Ops-Sales și Ops-Medical; pacienți noi (clinici comparabile, ≥10% YTD pe clinică / ≥5% pe total comparabile); conversie Meta vs medie; feedback (rată de răspuns sub jumătate din rețea; negative ≥2% și minim 3 review-uri). Ordonare și lungimea barei = `sxSev` (de câte ori abaterea depășește pragul Puls: pp/`DEV_PP` sau relativ/`DEV_REL`), ca indicatorii în % și în RON să fie pe aceeași scară. Top 8 pe coloană.

Scorecard-ul pe clinici și lista „atenție / merge bine" au fost scoase intenționat (redundante). Animațiile (clase `sx-*`, keyframes în `<style>`-ul din `App`) se opresc la `prefers-reduced-motion`. Tab-urile se deschid din Sinteză prin `onOpen(tabId)` (cod de clinică sau `opssales` / `opsmed` / `patients` / `feedback`).

## Semnale operaționale pe paginile de clinică

`clinicOpsFlags(code)` (funcție globală) calculează indicatorii Ops-Sales / Ops-Medical ai clinicii cu abatere mare față de clusterul ei — folosită de Sinteză și de `ClinicOpsSignals` (cardul „Semnale operaționale" de pe fiecare clinică, rânduri `SxOutRow` comune cu Sinteza). Pe pagina clinicii acești indicatori apar DOAR în card (nu și în textul „Analiză"); fără abateri → o singură linie; fără date → nimic. Feedback negativ în analiza clinicii: doar la ≥3 review-uri și ≥2%.

**Istoricul 2024–2025** din `CD` rămâne cel sincronizat din Puls (decizie Vlad, 2026-09-25), chiar dacă diferă ușor de fișierele de buget/istoric ale clinicilor (ex. OLT Sep 2024: 374K în Puls vs 350K în fișier).

## Fișiere financiare sursă

`.gitignore` blochează `*.xlsx`, `*.xls`, `*.jsx` — repo-ul e public, iar Excel-urile P&L conțin date financiare complete. Excel-ul `P&L IULIE 2026 V1.8.1.xlsx` stă doar local. Raportul EBITDA (`pl-desktop.html`) e un bundle React compilat; JSX-ul din Iulie nu e în repo și nici pe acest calculator (template-ul din skill-ul `dr-ardeleanu-monthly-fs` e versiunea din Martie, fără concluzii / detalii de cost / split Local Sales-Marketing) — redesign-ul EBITDA așteaptă sursa.

## Pachetul CFO (în raportul de Cashflow)

Destinat doar lui Vlad și Virginiei (raportul EBITDA rămâne pentru Comex și se oprește la EBITDA GROUP). Tab-uri deasupra paginii de Cashflow existente: **Sinteză CFO · Cashflow · Finanțare & datorie · Capex · Acționari**.

**Fișiere**
- `build_cfo_data.py` — extrage datele din Excel-ul lunar de P&L (foile `P&L`, `Cashflow`, `Capex`, `Shareholders`, foile de clinică) și scrie `cfo-data.js`. Rândurile se caută **după etichetă**, coloanele din antetul foii (doar primul bloc de luni). Rulare: `python3 build_cfo_data.py "P&L <LUNA> 2026 V<x>.xlsx"` (necesită `openpyxl`). Metadatele proiectelor (deschidere, unituri) sunt în lista `PROJECTS` din script — nu sunt în Excel.
- `cfo-data.js` — **date confidențiale** (profit net, datorie, capex, dividende). Publicat în clar în repo prin decizia explicită a lui Vlad (2026-09-26), înainte de protecția site-ului — deci vizibil oricui are link-ul și oricui are parola generală. Protecția (criptarea) întregului site e programată pentru o sesiune separată; după ea, fișierul trebuie publicat criptat. Excel-urile rămân blocate în `.gitignore`.
- `cfo-app.js` — punctul de intrare al `cashflow-report.html` (în locul `cashflow-report.js`). Încarcă `cfo-data.js` dacă există (→ tab-urile pachetului); fără el, pagina de Cashflow arată exact ca înainte.
- `cfo-pack.js` — tab-urile noi (htm + React + Recharts din import map, fără build). `cashflow-report.js` primește doar `tabBar` / `active` / `renderOther` (și opțional `hideShareholders`, nefolosit). Secțiunea 07 (distribuții către acționari) **rămâne** în tab-ul Cashflow — decizie Vlad; tab-ul „Acționari" o detaliază.
- La orice modificare a acestor fișiere se incrementează `?v=` din `cashflow-report.html` și din importurile din `cfo-app.js` (cache).

**Reguli de conținut**
- Toate textele sunt calculate din date; fiecare informație apare o singură dată pe tab. Soldul și structura datoriei rămân în tab-ul Cashflow (secțiunea 04) — „Finanțare & datorie" arată doar ce o schimbă (costul de finanțare, trageri, rambursări, proiecția).
- **Ieșiri către acționari** = dividende brute − reinvestit în firmă (quasi-equity DP) + VVA. **VVA** = cheltuieli ale acționarilor puse pe firmă (nu țin de EBITDA clinicilor sau a sediului). Impozitul pe dividende se arată separat. Doar total (nu pe acționar). **Nu există buget** → referința sunt mediana lunară (24 luni), banda P25–P75, 12 luni rulante, media lunară pe ani (RON + EUR din rândul `TOTAL EUR`).
- Costul de finanțare se proiectează pe ritmul ultimelor 3 luni (bugetul e plat); cu graficul de datorie ieșit schema de rambursări, proiecția se poate face pe rate.
- Graficul „Credite trase vs rambursări" are **axă Y întreruptă** (două zone cu scări proprii, marcaj zig-zag) — intenționat, ca rambursările mici să fie lizibile.
- Bugetul folosit e cel brut din Excel (raportul EBITDA neutralizează economia Brăila — diferență mică, menționată în nota tab-ului).

**Probleme cunoscute în Excel-ul de P&L (de corectat la sursă)**
- `Capex`: rândurile „Capex PROPCO / OPCO / Total" sunt cumulative în 2026 și includ și decembrie 2025 — sursa corectă e „Total Investments". Echipamente Opco Sep–Dec au semne alternante (+/−) în buget. Iunie e „Buget" în Capex, dar „Actual" în Cashflow.
- `Cashflow`: tipul „Actiual" (greșeală de tipar) — scriptul îl tratează ca „Actual".
- `Shareholders`: blocul de buget e stricat (#REF!, cu antet de date 2025 repetate); Dec 2024 e marcat „Budget" dar e realizat.
- `Debt`: doar plafoane aprobate, fără solduri trase, dobânzi sau scadențe.
- Pagina de Cashflow existentă are titluri rămase din iunie („Iunie 2026 — Cash Bridge", „Realizat Iun 2026") deși datele merg până în iulie.

## De știut (neactualizat încă)

- **Copia din Puls** (`script.google.com/.../exec?page=monthlynew`) încorporează o versiune mai veche a raportului de vânzări, fără corecțiile și designul de mai sus (ex. încă afișează „OLT — presiune YoY +43.4%" și LFL greșit). Trebuie actualizată în Apps Script de cine îl întreține — nu se actualizează din acest repo.
- **Actuals 2025 Târgoviște (Sep–Dec)** diferă ușor între Puls (sursa raportului), raportul P&L și fișierul de buget (~3K, 0,2%). De stabilit o sursă unică.
