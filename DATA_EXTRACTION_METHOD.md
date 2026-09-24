# Metodologie: construcția raportului lunar de Sales (desktop) — Dr. Ardeleanu

Acest document descrie exact procesul folosit pentru a digitiza sloide-urile din
prezentarea lunară de Sales trimisă de Larisa Latu (pe 1 a fiecărei luni) și a le
introduce în `sales-desktop.html` — inclusiv tab-urile **Ops-Med**, **Ops-Sales**,
**Pacienți**, **Feedback - QA**, și secțiunile P0 din **Cluster 1/2** și clinicile
individuale. Scopul: să poată fi repetat pentru orice lună viitoare, ideal
automatizat printr-un skill (vezi `SKILL.md` din acest folder pentru workflow-ul
complet, la nivel de repo).

## 0. Structura multi-repo lunară — context organizațional

- **Un repo GitHub nou per lună**, cu aceeași structură ca acest repo
  (`dr-ardeleanu-iunie-2026`), care conține `sales-desktop.html` (raportul web
  desktop) + presentările PDF ale lunii (Sales, EBITDA, Cashflow).
- **Convenție de denumire a repo-ului**: numele lunii se referă la EBITDA/Cashflow,
  NU la Sales — pentru că Sales e mereu "cu o lună înainte" (raport pe luna
  curentă), în timp ce EBITDA și Cashflow au un decalaj de o lună (din cauza
  contabilității). Deci un repo numit după August conține de fapt prezentarea de
  Sales pentru August ȘI prezentările EBITDA/Cashflow pentru **Iulie** (luna
  precedentă). Nu presupune că toate 3 documentele sunt din aceeași lună
  calendaristică — verifică mereu titlul/data din interiorul fiecărui PDF.
- **Desktop vs. mobil**: raportul **desktop** (`sales-desktop.html`, acest fișier)
  **păstrează istoricul complet** — tab-urile de lună din header (Ianuarie,
  Februarie, ...) permit navigarea prin toate lunile anului, cumulate lună de
  lună într-un singur fișier care crește. Raportul **mobil** (fișier separat, nu
  face parte din acest document) arată **doar luna curentă** — nu are istoric de
  navigat. Acest document/skill se ocupă STRICT de varianta desktop.
- **Baseline actual**: versiunea din Iulie 2026 a `sales-desktop.html` e cea mai
  bună variantă disponibilă până acum (toate tab-urile descrise în acest
  document). Orice lună nouă trebuie să **extindă** acest fișier (adaugă luna
  nouă la constantele existente), NU să-l reconstruiască de la zero — structura,
  denumirile, tooltip-urile și convențiile stabilite aici sunt rezultatul mai
  multor runde de corecții cu utilizatorul și trebuie păstrate ca atare, chiar
  dacă vor mai fi rafinate în viitor.

## 1. Unde sunt fișierele

- PDF-urile lunare (prezentările complete) sunt în folderul părinte:
  `/Users/vladardeleanu/Desktop/Sales Montlhy Dr.Ardeleanu/*.pdf`
  (ex: `07-July-2026.pdf`). Un fișier nou apare în fiecare lună.
- Repo-ul cu raportul web (clonă git) e în:
  `/Users/vladardeleanu/Desktop/Sales Montlhy Dr.Ardeleanu/dr-ardeleanu-iunie-2026/`
  Fișierul de editat: `sales-desktop.html`.

## 2. Găsirea slide-urilor relevante în PDF

Slide-urile nu au text selectabil (sunt imagini/tabele vectoriale), dar **titlul**
slide-ului e text normal, deci poate fi găsit cu PyMuPDF:

```python
import fitz, glob
for f in sorted(glob.glob('*.pdf')):
    doc = fitz.open(f)
    for i, page in enumerate(doc):
        text = page.get_text()
        if 'Indicatori de performan' in text:
            print(f, 'page', i+1, text[:60])
```

Caută două titluri:
- `"Wxx | Indicatori de performanță - Medical"` → tab-ul **Ops-Med**
- `"Wxx | Indicatori de performanță - Sales & OPS"` → tab-ul **Ops-Sales**

Numărul paginii variază puțin lună de lună (de obicei pagina 9 pentru Medical,
11 sau 12 pentru Sales & OPS — verifică mereu, nu presupune).

## 3. Randare pagină → imagine (pentru citit valorile)

```python
import fitz
doc = fitz.open('08-August-2026.pdf')
page = doc[PAGE_INDEX]  # 0-based
pix = page.get_pixmap(matrix=fitz.Matrix(3,3))  # zoom 3x e suficient pt. citire inițială
pix.save('opsmed_aug.png')
```

Apoi citește imaginea cu tool-ul Read (suportă imagini). La zoom 3x (≈2160x1215px)
textul e de obicei lizibil clar pentru toate rândurile, CU O EXCEPȚIE importantă:

**Riscul principal**: rândurile cu numere mici/apropiate din coloanele din dreapta
(ex. rândurile "CT" / "CT P1" din Ops-Med, sau valori cu 1-2 cifre lipite) se pot
citi greșit la zoom normal. **Verifică mereu aceste rânduri cu un crop suplimentar
la zoom mai mare** (6-8x), tăiat strict pe banda de rânduri respectivă:

```python
r = page.rect
clip = fitz.Rect(r.x0, r.y0 + r.height*0.45, r.x1, r.y0 + r.height*0.53)  # ajustează procentele
pix = page.get_pixmap(matrix=fitz.Matrix(7,7), clip=clip)
pix.save('zoom_check.png')
```

Am prins efectiv 2-3 erori de transcriere în lunile Ian-Iul exact în acest fel
(rânduri CT confundate, cluster2 aggregate greșit asignat) — nu skip acest pas.

## 4. Structura tabelelor din slide

### Slide "Indicatori de performanță - Medical"
Două tabele **una lângă alta** ("KPI" și "KPI YTD - generalisti" / denumiri care
au variat lună de lună — Ian-Mai foloseau "KPI MTD Clinica"/"KPI MTD -
generalisti", Iun-Iul foloseau "KPI"/"KPI YTD - generalisti", **conținutul e
identic**, doar titlul din slide diferă — ignoră titlul exact, contează ordinea
rândurilor).

Fiecare din cele 2 tabele e împărțită în **2 blocuri** (Cluster 1: Oltenița,
Giurgiu, Slobozia, Călărași | Cluster 2: Dorobanți, Cotroceni, Târgoviște,
Focșani), fiecare bloc cu propriile coloane **Y-1 AVG / (YTD AVG) / MTD**
urmate de coloanele per clinică.

⚠️ **Capcană importantă**: cele două blocuri (Cluster 1 și Cluster 2) au
**agregate separate** (Y-1/YTD/MTD proprii), NU sunt același total împărțit
vizual în două. Nu presupune că agregatul e comun — citește-l separat pentru
fiecare bloc.

- Ian 2026: NU are coloana "YTD AVG" (doar Y-1 AVG + MTD), și Cluster 2 are doar
  3 clinici (fără Focșani, care se deschide în Martie). Feb+ au toate 8 clinici
  + YTD AVG.
- 16 rânduri în tabelul "KPI" (Clinică), 18 în "KPI generaliști" (vezi
  `MED_KPI_ROWS` / `MED_GEN_ROWS` în cod pentru lista exactă, actualizată).

### Slide "Indicatori de performanță - Sales & OPS"
Aceeași structură (2 tabele side-by-side, fiecare cu 2 blocuri cluster), dar
**un singur tabel de indicatori** (nu 2 ca la Medical) — 19 rânduri de bază,
plus 6 rânduri de "Consimțământ & Date Pacient" (CNP, Email, Acord prelucrare
date, CESGS, API, Speciale Olograf/Digital) care **apar abia din Iunie 2026
înainte** — lunile anterioare nu au aceste rânduri (secțiunea nu se afișează
deloc dacă toate valorile sunt null, vezi `hasConsent` în `OpsSalesTab`).

## 5. Formatul de date din cod

### `MED_KPI` (const, aprox linia 132 din sales-desktop.html)
Obiect indexat pe număr de lună (string: `"1"`...`"7"`), fiecare cu:
```js
{
  "week": "W31",                    // eticheta "Wxx" din titlul slide-ului
  "clinics": ["OLT","GRG",...],     // codurile clinicilor active în luna respectivă
  "kpi": [[...],[...], ...],        // 16 rânduri × N clinici, valori MTD per clinică
  "gen": [[...],[...], ...],        // 18 rânduri × N clinici
  "aggKpi": {"c1":[[y1,ytd,mtd],...], "c2":[...]},  // 16 rânduri, agregat per cluster
  "aggGen": {"c1":[[y1,ytd,mtd],...], "c2":[...]},  // 18 rânduri
}
```
Pentru Ianuarie (fără YTD): tuplul e `[y1, null, mtd]`.
Codurile clinicilor: `OLT,GRG,SLB,CLR` (Cluster 1) + `DRB,CTR,TGV,FCS` (Cluster 2).
Ordinea în array-urile `kpi`/`gen`/`rowsC1`/`rowsC2` respectă mereu ordinea din
`clinics` (cluster 1 complet, apoi cluster 2 complet).

### `OPS_KPI` (const, aprox linia 135)
```js
{
  "week": "W31",
  "clinics": [...],
  "agg": {"c1":[[y1,ytd,mtd],...], "c2":[...]},   // 25 rânduri
  "rowsC1": [[...],...], "rowsC2": [[...],...],   // 25 rânduri × N clinici, per cluster
}
```
Diferă de `MED_KPI`: aici `rowsC1`/`rowsC2` sunt deja separate pe cluster (nu un
singur array de clinici ca la Med) — mai simplu de construit.

### Etichete rânduri: `MED_KPI_ROWS`, `MED_GEN_ROWS`, `OPS_ROWS`
Array de tupluri `[label, type, isPct]`. **`isPct` e sursa de adevăr** pentru
formatarea "%" — NU te baza pe litera "F"/"D" din slide (e inconsecventă: unele
rânduri "F" nu sunt procente, unele rânduri "D" SUNT procente, vezi comentariile
din cod). Dacă adaugi un rând nou, verifică manual dacă valorile din slide au
"%" și setează `isPct` explicit.

**Convenție de denumire**: fără "%" în fața numelui (e redundant, valoarea deja
arată %). Dacă redenumirea creează coliziune cu un rând existent (ex. rândul
brut "Anulate / nepr." vs rândul-rată), adaugă un sufix disambiguant de tipul
`" (rată)"`.

## 6. Rânduri calculate live (NU sunt din slide)

Câteva rânduri sunt calculate în JS, nu digitizate:
- **Feedback Negativ** = Feedback total − Feedback pozitiv (Ops-Sales, în `OpsSalesTab`)
- **Programări pierdute** + rata ei = Anulate − Reprogramate, / Programări totale (Ops-Sales, `FunnelSection`)
- **Plan tratament / P1** și **RX / P1** (Ops-Med, `OpsMedTab`, ambele tabele KPI Clinică + KPI Generaliști)

**Rata de achiziție a pacienților noi** (Ops-Sales, blocul "Achiziție și Retenție Pacienți" din
`OpsSalesTab`) e o excepție notabilă: folosește direct valoarea digitizată din slide (rândul
"Achizitie pacienti", idx7 din `MED_KPI_ROWS`), NU un recalcul live Pacienți înregistrați / Pacienți
(vizite) — media Y-1 AVG / YTD AVG a unui raport-de-sume nu e egală cu media Y-1/YTD a rapoartelor
lunare individuale (verificat: digitizat 66% vs. calcul live 62%, sistematic pe toate lunile Ian-Iul
2026, doar la Cluster 2). MTD e identic în ambele variante (un singur raport, fără ambiguitate de
mediere). Rândurile "Pacienti (vizite)" și "Pacienți înregistrați" din bloc rămân valori brute
afișate ca atare, doar pentru context.

Aceste calcule se fac automat din datele digitizate existente (`diffArr`,
`pctOfArr`, helper-e definite în cod) — **nu trebuie recalculate manual** la
adăugarea unei luni noi, funcționează automat pe orice lună nouă adăugată în
`MED_KPI`/`OPS_KPI`, cu condiția ca rândurile-sursă să aibă date.

## 6.5. Funnel de pacienți — terminologie și cei doi numitori (IMPORTANT, ține minte la orice indicator "% Noi"/"Achiziție")

Clarificat cu utilizatorul pe mai multe runde (vezi și comentariile din cod, tab-ul
**Pacienți**) — funnel-ul complet, de la vizită la pacient inactiv:

```
VIZITE ─▶ PACIENȚI UNICI ≈ P0 (înregistrați în sistem) ─▶ P1 = PACIENȚI NOI
       (prima programare) ─▶ P2 = PACIENT ACTIV (a venit și la a 2-a programare)
       ─▶ PACIENT INACTIV (nu a mai venit în clinică de peste 9 luni)
```

- **VIZITE** = numărul total de programări/vizite dintr-o lună (rândul "Pacienți
  (vizite)" din `MED_KPI`, `kpi[4]`). **Un pacient unic poate avea mai multe
  vizite în aceeași lună** → VIZITE ≥ PACIENȚI UNICI, aproape mereu strict mai
  mare.
- **PACIENȚI UNICI** = numărul de pacienți distincți cu cel puțin o vizită în
  lună. La nivel de rețea corespunde rândului "Pacienți lunari" din tabelul
  "New_ratio" (`PATIENTS_MONTHLY.lunari`, tab Pacienți) — **nu există per
  clinică nicăieri în prezentări**, doar la nivel de rețea.
- **P0** = pacienți înregistrați în sistem (lead/formular/CRM/recepție) —
  stadiul inițial, digitizat per clinică în tabelul "Pacienti inregistrati in
  sistem (P0)" (`PATIENTS_P0_CLINICS_18`, tab Pacienți). Aproximează Pacienți
  Unici, dar nu sunt garantat identice (P0 e un eveniment de înregistrare, nu
  neapărat sincron cu vizita). **Are și un total de rețea**: rândul "Pacienți
  noi" din tabelul "New_ratio" (`PATIENTS_MONTHLY.noi`) — vezi corecția de mai
  jos, NU e P1 cum am presupus inițial, e P0 agregat pe toată rețeaua.
- **P1 (pacienți noi la prima programare)** = pacientul a venit efectiv la
  prima programare — digitizat DOAR per clinică, în MED_KPI (`kpi[8]`). **Nu
  are total de rețea digitizat nicăieri în prezentări** — nu-l confunda cu
  `PATIENTS_MONTHLY.noi` (vezi corecția de mai jos).
- **P2 (pacient activ)** = a venit și la a doua programare — nu e încă
  digitizat separat în app.
- **Pacient inactiv** = nu a mai revenit în clinică de peste 9 luni — nu e
  încă digitizat separat în app.

**CORECȚIE IMPORTANTĂ** (greșeală inițială, corectată de utilizator): am
presupus inițial că rândul "Pacienți noi" din tabelul de rețea "New_ratio"
(`PATIENTS_MONTHLY.noi`) e P1 (pacientul care a și efectuat prima vizită).
**E greșit** — verificat: `noi[lună]` ≈ SUMA P0 per clinică (`PATIENTS_P0_CLINICS_18`)
pe aceeași lună, cu diferențe de doar 0-7 unități (rotunjiri între cele două
slide-uri sursă) pe toate cele 7 luni verificate. Deci `PATIENTS_MONTHLY.noi`
e **P0 agregat pe toată rețeaua**, NU P1. P1 rămâne disponibil DOAR per
clinică (MED_KPI `kpi[8]`), fără niciun total de rețea în prezentări.
Cardul KPI "Pacienți Înregistrați (P0)" din tab-ul Pacienți (fostul, greșit
etichetat "Pacienți Noi (P1)") folosește `noi[ei]` — corect etichetat acum ca
P0, nu P1. La fel, "Rata de Atragere a Pacienților Noi" (cardul KPI, fostul
"% Noi/Recurenți") = `noiRatio` = P0(rețea)/Pacienți Unici, digitizat direct
din New_ratio — NU P1/Pacienți Unici cum am presupus inițial.

**De ce diferă procentele "% Noi" la nivel de rețea vs. per clinică** (a fost
sursă de confuzie, vezi și discuția din tab Pacienți): era, de fapt, o
diferență de NUMITOR combinată cu presupunerea greșită de mai sus despre
numărător. O coloană inițială "% Noi/Vizite" per clinică (tab Pacienți)
împărțea P1 la **VIZITE** (numitor mare, include vizite repetate ale
aceluiași pacient în lună) — un indicator real (P1), dar cu numitor diferit
de "Rata de Atragere" de la nivel de rețea (care e P0/Pacienți Unici, nu
P1/Pacienți Unici cum am crezut). **A fost ELIMINATĂ** din tabelul per-clinică
P0 (cerere explicită a utilizatorului — "e total misleading" să pui un
indicator bazat pe Vizite/P1 lângă un tabel bazat pe P0/pacient). Per clinică
nu există altă alternativă digitizată pentru P0/Pacienți Unici (Pacienți
Unici nu e digitizat per clinică în nicio prezentare) — deci per clinică a
rămas doar tabelul P0 brut (fără coloană de rată), iar rata unificată
(P0/Pacienți Unici) se vede DOAR la nivel de rețea, în cardul KPI "Rata de
Atragere a Pacienților Noi".

**Regulă de aplicat**: la orice indicator nou legat de "pacienți noi"/"rată
achiziție"/"% conversie" per clinică sau per rețea, verifică explicit ce
numitor foloseşte (Vizite vs. Pacienți unici vs. P0) înainte de a-l compara
cu un alt indicator similar — și adaugă un hover tip (`InfoTip` în tab-ul
Pacienți, `IndicatorLabel` în Ops-Med/Ops-Sales) care spune exact numărătorul
și numitorul folosite, dacă există risc de confuzie cu un indicator asemănător
din altă secțiune.

## 6.6. YTD YoY pe ferestre inegale (bug prins de utilizator — "arată prea bine")

Ian 25 nu există în nicio prezentare (§6.5). Un YTD YoY "naiv" — sumă
Ian26→luna curentă (N luni) vs. sumă Ian25→luna curentă (N-1 luni, pentru că
indexul Ian25 e clamped la 0/Feb25) — compară mai multe luni din 2026 cu mai
puține din 2025, ceea ce **infla artificial creșterea** (verificat: Oltenița
Iunie arăta ~+20% YoY înainte de fix, ~+1% după — diferența e exact luna
Ianuarie 26 fără corespondent în 2025). Bug-ul exista identic, copy-paste, în
3 locuri (`PatientsTab`, `ClusterTab`, `ClinicTab`).

**Fix**: `p0YtdPair(arr, ei)` (definit lângă `p0YtdSum`) calculează ambele
sume pe o **fereastră de lungime egală**, ancorată să se termine în luna
curentă, folosind doar câte luni sunt disponibile efectiv pe partea 2025
(sacrifică Ianuarie și din 2026 dacă Ian25 lipsește, nu doar din 2025).
Totalurile AFIȘATE ("YTD: 1,145") rămân sume reale Ian→curent (nu se schimbă)
— doar procentul YoY de lângă ele folosește fereastra egală. E o discrepanță
minoră acceptată (total afișat pe bază Ian, procent calculat pe bază Feb),
mai bună decât alternativele (creștere inflată sau total afișat incorect
etichetat "YTD" dar calculat de fapt din Feb).

**Regulă generală**: la orice raport YoY pe fereastră cumulată (YTD, trailing
N luni) unde o parte din comparație are istoric mai scurt/lipsă, verifică
explicit că AMBELE părți acoperă același număr de perioade înainte de a
împărți — un index clamped/paddat silențios introduce exact acest bug, fără
să crape și fără să pară greșit la prima vedere (arată doar "prea bine").

## 7. Grupuri colapsabile — pattern de UI (nu necesită modificări la date noi)

Indicatorii bruți sunt grupați și colapsați implicit sub un rând-rată ancoră
(definite în `OpsMedTab`/`OpsSalesTab` ca `{id, hideIndices:[...], anchorIndex}`).
Acestea sunt fixe pe structura rândurilor, NU depind de lună — nu trebuie
actualizate când adaugi o lună nouă, doar dacă schimbi structura rândurilor
(adaugi/ștergi/reordonezi un rând).

## 8. Pași pentru a adăuga o lună nouă (ex. August = luna 8)

1. Găsește PDF-ul lunii (`08-August-2026.pdf` sau similar) în folderul părinte.
2. Găsește paginile celor 2 slide-uri (Medical + Sales & OPS) — vezi pasul 2.
3. Randează + citește + verifică (pașii 3-4) pentru ambele slide-uri.
4. Construiește manual (sau prin skill) intrarea `MED_KPI["8"] = {...}` și
   `OPS_KPI["8"] = {...}`, respectând formatul din secțiunea 5.
5. Adaugă intrările în `sales-desktop.html`, la constantele `MED_KPI` și
   `OPS_KPI` (caută-le cu grep, sunt pe o singură linie lungă per const — adaugă
   noua cheie de lună înainte de `}` final al obiectului).
6. **Nu e nevoie să modifici** `ACT_MO`, `LAST_ACT`, lista de tab-uri de lună,
   sau grupurile colapsabile — acestea sunt deja dinamice / independente de
   datele Ops-Med/Ops-Sales (`LAST_ACT` e calculat din datele de vânzări `NET`,
   complet separat).
7. Verifică balansul acoladelor/parantezelor (script Python rapid, vezi mai jos)
   înainte de a considera modificarea completă.
8. Testează local (deschide `index.html`, login, Ops-Med + Ops-Sales, verifică
   luna nouă apare corect, inclusiv grupurile colapsabile și outlier-ii).

### Script rapid de verificare balans
```bash
python3 - <<'EOF'
s = open('sales-desktop.html').read()
for ch,pair in [('{','}'),('(',')'),('[',']')]:
    print(ch, s.count(ch), pair, s.count(pair))
EOF
```
Cele 3 perechi trebuie să aibă numere egale.

## 9. Convenții de design / UI implementate (toate modificările "cosmetice")

Acestea nu au legătură cu datele lunare — sunt regulile vizuale stabilite pentru
tab-urile Ops-Med și Ops-Sales, valabile pentru orice secțiune nouă adăugată pe
viitor. Toate sunt implementate în componente **partajate** (`SectionBanner`,
`MedIndicatorSection`, `MedClusterTable`), deci o modificare acolo se propagă
automat la ambele tab-uri.

**Titluri de secțiune vizibile** (`SectionBanner`): bară full-width cu gradient
amber discret, bordură stângă amber 4px, titlu bold 15px serif (Playfair
Display) + notă mică sub el. Înainte, titlurile erau text inline mic (12px) și
se pierdeau vizual lângă header-ele de cluster (care sunt bare colorate solide,
foarte vizibile) — de-asta am mărit contrastul intenționat.

**Un tabel per cluster, side-by-side** (`MedClusterTable`): Cluster 1 (Oltenița,
Giurgiu, Slobozia, Călărași — header burgundy) și Cluster 2 (Dorobanți,
Cotroceni, Târgoviște, Focșani — header olive), fiecare cu propriile coloane
Y-1 AVG/YTD AVG/MTD + coloane per clinică. Afișate unul lângă altul (flex row,
fără wrap) pentru comparație directă rând-cu-rând.

**Fără accent albastru pe rândurile %**: am încercat inițial să evidențiem
rândurile-procent cu text/fundal albastru, dar când majoritatea rândurilor
dintr-o secțiune erau procente (ex. Ops-Sales), albastrul devenea zgomot vizual
și reducea lizibilitatea. Am eliminat complet — toate etichetele sunt text
normal (`P.text`), punct-indicator mereu olive.

**Outlier highlighting per cluster** (nu combinat pe ambele clustere): pentru
fiecare rând-procent, valoarea cea mai mare din cluster → chenar amber
(`#FEF3C7`/`#92400E`), cea mai mică → chenar roșu (`#FEE2E2`/`#B91C1C`).
Calculat separat per Cluster 1 și Cluster 2 (altfel un clinică cu valoare
proastă în Cluster 1 putea "ascunde" în spatele unei valori și mai proaste din
Cluster 2, și nu se evidenția deloc).

**Semantică "invert"** pentru metrici unde mai mare = mai rău (ex. "Programări
pierdute", rata ei): se pasează `invertRows` (Set de indici de rând) la
`MedIndicatorSection` → culorile se inversează la roșu (nefavorabil, valoarea
cea mai mare) / verde (favorabil, cea mai mică), cu legendă dedicată sub tabel.

**Grupuri colapsabile** (`groups` prop pe `MedIndicatorSection`): fiecare grup
e `{id, hideIndices:[...], anchorIndex}`. Rândurile brute (D) se ascund
complet, rămâne vizibil doar rândul-rată-ancoră. Toggle-ul e o iconiță mică
(▸, cu numărul de rânduri ascunse) plasată **direct pe rândul-ancoră**, în
partea dreaptă a celulei de etichetă — NU în header-ul secțiunii (asta a fost
o iterație: inițial toggle-ul textual era în banner, apoi mutat inline pe rând
pentru consecvență cu restul tabelului). **Implicit toate grupurile sunt
colapsate** la intrarea pe tab (`useState(() => new Set())` = set vid = toate
închise).

**Fundal distinct pentru rândurile dezvăluite**: când un grup e expandat,
rândurile brute revelate au fundal amber-tinted (`#FBF3E4`) + bordură stângă
amber + punct amber, ca să se distingă vizual de rândurile mereu vizibile
(care rămân alb/gri alternant normal). Rândul-ancoră NU se colorează (nu e
"rând suplimentar", e mereu vizibil).

**Mod compact** (`compact` prop): folosit doar la secțiunea Funnel (Ops-Sales),
unde spațiul e limitat — font mai mic, padding redus, `table-layout: fixed` cu
coloana Indicator limitată la 27% lățime, ca cele 2 tabele cluster să încapă
side-by-side fără scroll orizontal.

**Convenții de etichete**:
- Fără "%" în fața numelui (redundant, valoarea deja arată %).
- Coliziuni de nume rezolvate cu sufix `" (rată)"`, nu cu prefix.
- `key` pe `<tr>` e index-ul rândului (`ri`), NU eticheta — ca să nu crape
  React când două rânduri au aceeași etichetă (ex. "Programări pierdute" —
  varianta brută și varianta-rată au literalmente același text).

**Secțiuni dedicate pentru indicatori "outlier" din structura tabelului**:
indicatori care nu se încadrează în fluxul principal (ex. "TBI / BT (credite)"
în Ops-Sales) au fost scoși într-o secțiune proprie la finalul tab-ului
("Credite"), în loc să rămână inline și să întrerupă gruparea logică a
celorlalți indicatori.

## 10. Idee pentru skill

Un skill ideal ar automatiza pașii 2-6: primește luna țintă → găsește PDF-ul →
identifică paginile → randează crop-urile relevante → (aici probabil tot
necesită un ochi uman/AI care "citește" imaginea, partea grea de automatizat
100%) → generează blocul JS `MED_KPI["N"]`/`OPS_KPI["N"]` → inserează în fișier
→ verifică balansul → raportează ce a fost adăugat pentru verificare manuală.

Partea de citire a valorilor din imagine rămâne cel mai fragil pas — orice
skill ar trebui să includă explicit pasul de verificare cu zoom (secțiunea 3)
pentru rândurile cu numere mici/apropiate, altfel riscă erori de transcriere
silențioase.

## 11. Tab "Feedback - QA" — slide "Wxx | Feedback pacient" (2 slide-uri)

Capitol nou (între Categorii și Pacienți), sursă: 2 slide-uri consecutive cu
titlul `"Wxx | Feedback pacient"` (căutare text simplă, ca la celelalte
sloide). Găsite în toate cele 7 PDF-uri disponibile.

**Slide 1** are 3 blocuri:
- Tabel "By Clinic Monthly (YTD)" — `#No.` (total feedback) și `#Neg`
  (feedback negativ) per clinică, fereastră glisantă (Iulie: Iul25→Iul26, 12
  luni — **cu o lacună reală la Aug25**, coloană complet absentă din tabel,
  nu valoare zero; verificată vizual, nu e eroare de citire). La fel ca la
  P0, verifică suma clinicilor pe fiecare lună = rândul "Grand Total" — DAR
  aici Grand Total conține și o categorie "Null" (feedback neatribuit unei
  clinici) care nu apare defalcat nicăieri, deci suma clinicilor individuale
  va fi puțin sub Grand Total (diferența = rândul "Null").
- Grafic "Google reviews" + grafic "Negative feedback trend (0-3 stars)" —
  **redundante** cu tabelul de mai jos, nu au fost digitizate separat (sumele
  pe clinici din "By Clinic Monthly" + tabelul "Feedback to Google" oferă
  aceleași cifre, verificat prin încrucișare, mai fiabil decât citirea unui
  bar chart mic).
- Tabel "Feedback to Google" — `#Positive`, `My Business` (= recenzii
  Google), `Feedback t..` (= % = My Business/#Positive) — fereastră mult mai
  lungă (Iul24→Iul26), **fără lacune**, deci digitizabil integral pe toată
  fereastra de 18 luni folosită în restul aplicației (Feb25→Iul26).
  ⚠️ **Capcană de aliniere coloane**: sunt 25 de coloane lunare — verifică
  mereu poziția exactă din header înainte de a mapa valorile (am greșit
  inițial cu un offset de 1 lună, corectat prin verificare încrucișată:
  My Business + #Neg rețea trebuie să fie ≈ #No. rețea din tabelul per-clinică
  pentru aceeași lună).

**Slide 2** are 2 blocuri:
- Tabel "medic" — satisfacție/feedback per medic, **fereastră cumulată/lifetime**
  (Grand Total mult peste orice o lună individuală din slide 1) — listăm DOAR
  medicii cu `#Negative ≥ 1` (o mică parte din ~100+ medici), cerință explicită
  să fie vizibili distinct. Sortați descrescător după satisfacție.
  ⚠️ Suma `#Negative` a medicilor listați poate fi cu 1 peste Grand Total-ul
  slide-ului (verificat de 2 ori cu zoom, nu e eroare) — vezi capcana de mai jos.
- Panou "Messages" — feed de activitate recentă cu text integral al
  review-urilor negative, cu coloane `clinica (grupare)`, `clinica`, `medic`,
  `pacient`, `Mesaj`, `Data`. **Doar pentru luna cea mai recentă din prezentare**
  (nu istoric) — digitizat doar pentru Iulie 2026, UI-ul arată un mesaj de
  fallback pentru celelalte luni.
  ⚠️ **Capcană reală în sursă, nu de citire**: un rând poate avea un nume de
  MEDIC în coloana "clinica" (ex. "Rau Ioana" în loc de o clinică reală) —
  probabil același review atribuit la 2 furnizori diferiți în sistemul lor.
  Nu "corecta" acest gen de anomalie — păstreaz-o exact ca în sursă și
  documentează-o (explică discrepanța de 1 de la punctul anterior).

## 12. Tab "Pacienți" — toate sursele de date (capitolul "Marketing & Acquisition | Pacienți")

Tab poziționat imediat după "Categorii" (înainte de Ops-Sales). Terminologia
funnel-ului (P0/P1/P2/Vizite/Pacienți Unici) e descrisă complet în §6.5 — citește
acea secțiune înainte de a adăuga sau explica orice indicator nou aici.

**Surse, 4 slide-uri diferite, fiecare cu propria fereastră glisantă**:

1. **"Pacienți și Vizite | Acquisition & Retention per Clinic"** — 2 tabele:
   - "Pacienti inregistrati in sistem (P0)" — per clinică, fereastră 12-14 luni.
     → `PATIENTS_P0_CLINICS_18` (aliniat pe 18 luni, Feb25→Iul26, cu null-uri
     pentru lunile/clinicile fără date). "Total"/"Grand Total" din slide = MEDIA
     lunară a clinicilor disponibile (NU sumă) — verificat rând cu rând.
   - "New_ratio (YTD)" — rețea, rânduri "Pacienți lunari" (= Pacienți Unici),
     "Pacienți noi" (= P0 agregat rețea, NU P1 — vezi corecția din §6.5),
     "% Noi/Recurenți". → `PATIENTS_MONTHLY.{lunari,noi,noiRatio}`.
2. **"Canale de achiziție pacienți"** — Acquisition Split, digitizat SEPARAT
   pentru MTD și YTD (nu se poate reconstitui YTD din suma MTD-urilor — sunt
   cumulate separat în sursă). → `PATIENTS_CHANNELS` (MTD) / `PATIENTS_CHANNELS_YTD`,
   un obiect per lună (Ian-Iul, se extinde manual, fără fereastră glisantă —
   fiecare lună trebuie digitizată din propria prezentare). Cardul are un toggle
   local MTD/YTD (`chMode`, separat de toggle-ul global Month/YTD din header —
   vezi §14 despre de ce toggle-ul global NU se aplică pe acest tab).
3. **"Life time value"** — LTV per canal de achiziție, fereastră rolling 3 ani,
   NU variază semnificativ lună de lună — digitizat o singură dată (ultimul
   instantaneu disponibil), NU per lună selectată. → `PATIENTS_LTV`. Nu necesită
   actualizare lunară dacă nu s-a schimbat vizibil în slide.
4. **"Marketing & Acquisition | Leads & Conversion"** → sub-slide-uri per canal:
   `"Wxx | Facebook"`, `"Wxx | Call Center"`, `"Wxx | Social"` (căutare text,
   ca la celelalte). Fiecare are 2 grafice: "Leeds_trend (YTD)" (leads absolute)
   + "Conversion_trend (YTD)" (% leads→pacienți), fereastră 13-14 luni. Doar
   **Facebook** digitizat până acum (cel mai important canal, META) →
   `PATIENTS_FB_LEADS_18` / `PATIENTS_FB_CONV_18`. Call Center/Social nu sunt
   încă digitizate — repetă aceeași metodă dacă se cere.
   ⚠️ **Capcană de revizuire cross-lună**: valorile se pot revizui între
   prezentări (ex. Apr26: 1077 leads în raportul propriu de Aprilie vs. 1107 în
   fereastra din Iulie — atribuire întârziată de leads, comportament normal).
   Folosește valorile din PREZENTAREA CEA MAI RECENTĂ pentru toată seria
   istorică (cea mai completă/corectată sursă), nu valorile "originale" din
   prezentarea lunii respective.

**KPI-uri de sus** (ordine, stabilită explicit cu utilizatorul — NU reordona
fără cerere explicită): 1) **Rata de Atragere a Pacienților Noi** (P0
rețea/Pacienți Unici, `hi`=evidențiat — e indicatorul cu prioritate maximă
pentru utilizator), 2) **Pacienți Înregistrați (P0)**, 3) **Pacienți Unici
(lunari)**. Toate 3 au tooltip (`InfoTip`) care leagă explicit numărătorul/
numitorul de terminologia funnel-ului din §6.5, ca să nu se confunde cu
indicatori asemănători din alte secțiuni.

## 13. P0 în tab-urile Cluster/Clinică — poziționare și tip de grafic

Convenții stabilite explicit cu utilizatorul (nu reveni la varianta veche):

- **Poziție**: cardul P0 ("Pacienți înregistrați (P0) per clinică" în
  Cluster 1/2, "Pacienți înregistrați (P0)" în clinicile individuale) vine
  **imediat după** cardul "Vânzări pe Categorii" (`CatMixCard`), NU înainte de
  tabelul Performance ca în versiunea inițială.
- **Tip grafic — BARE, nu linii**: în Cluster 1/2 (multi-clinică), liniile se
  suprapuneau prea mult (valori P0 apropiate între clinici) — convertit la
  `BarChart` grupat (`barCategoryGap`, câte un `<Bar>` per clinică, fără
  `stackId`). În clinicile individuale (o singură serie), s-a adăugat un al
  doilea `<Bar>` pentru **P0 anul trecut** (aceeași lună, an-1) alături de P0
  anul curent, pentru comparație vizuală directă — NU doar o linie simplă ca
  înainte.
- Aceste convenții se aplică la ORICE alt grafic nou adăugat cu date similare
  (valori apropiate între entități comparate → bare, nu linii; comparație
  an-peste-an → bare grupate side-by-side, nu linie separată pe alt an).

## 14. Toggle global Month/YTD (header) — NU se aplică pe Pacienți/Feedback-QA

Toggle-ul din header (dreapta sus, lângă "ACTUAL Iul 2026") controlează prop-ul
`period`, pasat explicit doar tab-urilor bazate pe venituri (Rețea, Buget,
Categorii, Cluster, Clinică — toate au sumă/YTD de RON, unde Month vs. YTD are
sens). **Pacienți și Feedback-QA NU primesc acest prop deloc** (verifică
semnătura funcției — `function PatientsTab()`, `function FeedbackTab()`, fără
`{period}`) — intenționat, pentru că aceste tab-uri arată numere de
pacienți/feedback pe lună, nu sume cumulabile în sensul financiar. Clic pe
toggle-ul global nu produce erori pe aceste tab-uri, doar nu are efect vizibil.
Tab-ul Pacienți are propriul toggle LOCAL MTD/YTD (butoane `MTD`/`YTD` în
cardul "Canale de achiziție pacienți", stare `chMode`) — acesta funcționează
independent și are date reale pe ambele poziții (`PATIENTS_CHANNELS` vs.
`PATIENTS_CHANNELS_YTD`). Dacă adaugi vreodată o secțiune nouă pe Pacienți/
Feedback-QA care ar beneficia de un toggle MTD/YTD, urmează acest pattern local
(nu conecta la `period`-ul global, ar cere refactorizarea semnăturii funcției
și verificarea că restul tab-ului nu se rupe).
