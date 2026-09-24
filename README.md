# Dr. Ardeleanu - Rezultate Financiare Iulie 2026

Raport de grup consolidat: Vanzari, P&L si Cashflow. Toate rapoartele sunt gazduite in acest repo, in spatele unui singur gate de parola pe pagina principala.

Publicat prin GitHub Pages: https://biancabajenaru.github.io/Dr.Ardeleanu-Overview/

## Continut

| Fisier | Raport | Sursa originala |
|---|---|---|
| `index.html` | Landing page + gate de parola (sessionStorage `reportsAuth`) | — |
| `sales-mobile.html` / `sales-desktop.html` | Analiza vanzari Iulie 2026 | vladtm75/raport-sales-dr-ardeleanu |
| `pl-mobile.html` / `pl-desktop.html` | Analiza P&L / EBITDA Iulie 2026 | biancabajenaru/Dashboard_July |
| `cashflow-summary.html` / `cashflow-report.html` + `cashflow-report.js` | Cashflow & Treasury Iulie 2026 | acest repo |

Fiecare pagina de raport verifica `sessionStorage.reportsAuth` si redirectioneaza catre `index.html` daca nu s-a introdus parola.

Sursa datelor: PL IULIE 2026 V1.8.1.xlsx (sheet Cashflow, coloana Iulie 2026).
Actualizat: 10.09.2026 (EBITDA + Cashflow Iulie 2026; Sales ramane Iulie 2026).

Arhiva lunara: `pl-desktop-<luna>-2026.html` si `cashflow-report-<luna>-2026.html` (+ `.js`), accesibile prin `index.html?next=<fisier>`.

Manual de actualizare lunara: vezi `MANUAL_ACTUALIZARE_LUNARA.md`.
