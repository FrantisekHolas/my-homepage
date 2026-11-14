# My Homepage – pravidla projektu

Osobní domovská stránka Františka Holase: přesný čas, svátky (jmenný kalendář) a státní svátky, plánovací kalendář, týdenní předpověď počasí a mapa světového času se dnem a nocí. Zveřejněno přes GitHub Pages z větve `main` (kořen repozitáře).

## Struktura

| Soubor | Účel |
|---|---|
| `index.html` | celá stránka: HTML, CSS i JS v jednom souboru, bez sestavování |
| `config.js` | volitelné nastavení (místo, formát času, výchozí pohled kalendáře, sekce, lidé s narozeninami a svátky); výchozí hodnoty v `index.html` (`DEFAULTS`) musí odpovídat `config.js`, jen `people` je v `DEFAULTS` prázdné |
| `tools/update-data.mjs` | obnoví data vložená v `index.html` mezi značkami `/*DATA:NAMES*/…/*END:NAMES*/` a `/*DATA:GRID*/…/*END:GRID*/` |
| `THIRD_PARTY_NOTICES.md` | licence cizích dat a služeb; doplnit při každém novém cizím zdroji |
| `.nojekyll` | GitHub Pages soubory nepřevádí přes Jekyll |
| `CNAME` | vlastní doména `frantisek.holasovi.net`; spravuje ji GitHub (Settings → Pages), ručně neměnit ani nemazat |

## Pravidla

- Stránka zůstává jeden soubor bez sestavování a bez knihoven z CDN. Vložená data se mění jen přes `tools/update-data.mjs`, ne ručně.
- Externí služby jen bez klíčů a s povoleným voláním z prohlížeče (CORS): Open-Meteo (počasí, předpověď, hledání míst; zdarma jen nekomerčně, uvádět CC BY 4.0), time.akamai.com se zálohou worldtimeapi.org a timeapi.io. Žádné API klíče ani tokeny v repozitáři – repozitář je veřejný.
- Stránka musí fungovat i bez sítě (hodiny, kalendář, mapa) a na iPhonu/iPadu (Safari); chyba v jedné části nesmí zastavit hodiny.
- Texty česky. Nepřebírat texty z cas-presny.cz. Schválené znění hlavních textů: „Aktuální čas v České republice“, „Platí zimní čas (SEČ, UTC+1)“, „Hodiny tohoto zařízení se předbíhají/zpožďují o … (přesnost ±…)“, kartičky Dnes / Svátek / Týden / Den v roce / Slunce v Brně (východ – západ) / Počasí v Brně, sekce Plánovací kalendář (seznam pod ním: Události ve zvoleném období) / Předpověď na týden / Světový čas / Změna času, patička „Vytvořil František Holas“.
- Barvy jen přes CSS proměnné, světlý i tmavý režim. Rozložení musí fungovat od šířky 360 px.
- Lidé v `config.js` (`people`): narozeniny jen den a měsíc, věk se nikde nezobrazuje. Pro jmeniny používat výhradně slovo **svátek**; státní svátky v souhrnu a legendě označovat „státní svátek“. Svátek se dopočítá z jmenného kalendáře podle `firstName` (jinak prvního slova `name`), lze ho zadat ručně (`nameday`) nebo vypnout (`false`). V kalendáři tečka vlevo nahoře u čísla dne (narozeniny `--bday`, svátek `--nday`), seznam pod kalendářem se jmenuje „Události ve zvoleném období“ a má řádky „Narozeniny – jméno“ / „Svátek – jméno“. Kdo má narozeniny 29. 2., slaví v nepřestupném roce 28. 2.

## Testování před commitem

V headless Chromiu (Playwright) s podvrženými odpověďmi Open-Meteo a time.akamai.com:
- žádné chyby JavaScriptu; počítač 1280 px, mobil 390 px, světlý i tmavý režim,
- bez sítě: hodiny běží, místo počasí je srozumitelná hláška,
- `config.js` výchozí, chybějící, s jiným místem a s neplatnými souřadnicemi,
- lidé: dopočet svátku, přezdívka s `firstName`, ruční a vypnutý svátek, neplatné datum a chybějící jméno (jen varování v konzoli), 29. 2. v přestupném i nepřestupném roce,
- u kalendáře kontrola svátků a počtu pracovních dní (2026: 250, 2027: 252), u mapy bez překryvů bublin měst.

## Nasazení

Commit do `main` a push; GitHub Pages stránku zveřejní zhruba do minuty: https://frantisek.holasovi.net/ (původní adresa frantisekholas.github.io/my-homepage/ na ni přesměrovává).

DNS (u správce domény holasovi.net): CNAME `frantisek` → `frantisekholas.github.io`, TXT `_github-pages-challenge-FrantisekHolas` pro ověření domény na GitHubu – oba záznamy ponechat.
