# CLAUDE.md — Rezultate Financiare Iulie 2026

Repo static, publicat prin GitHub Pages (`https://biancabajenaru.github.io/Dr.Ardeleanu-Overview/`), fără build step — fiecare `.html` e servit ca atare. Vezi [README.md](README.md) pentru harta fișier→raport.

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
