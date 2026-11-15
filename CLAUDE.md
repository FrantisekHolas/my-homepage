# František Homepage – pravidla projektu

Osobní domovská stránka Františka Holase: přesný čas, svátky (jmenný kalendář) a státní svátky, plánovací kalendář, týdenní předpověď počasí a mapa světového času se dnem a nocí. Zveřejněno přes GitHub Pages z větve `main` (kořen repozitáře).

## Struktura

| Soubor | Účel |
|---|---|
| `index.html` | kostra stránky (HTML); načítá `styl.css` a skripty v pořadí `config.js` → `data/jmeniny.js` → `data/mapa.js` → `app.js` |
| `styl.css` | vzhled stránky (světlý i tmavý režim) |
| `app.js` | logika stránky; výchozí nastavení `DEFAULTS` |
| `config.js` | volitelné nastavení (místo, formát času, výchozí pohled kalendáře, sekce, lidé s narozeninami a svátky); výchozí hodnoty v `app.js` (`DEFAULTS`) musí odpovídat `config.js`, jen `people` je v `DEFAULTS` prázdné |
| `data/jmeniny.js`, `data/mapa.js` | jmenný kalendář (`window.HOMEPAGE_JMENINY`) a mapa pevniny s časovými pásmy (`window.HOMEPAGE_MAPA`); generuje je `tools/update-data.mjs`, ručně neupravovat |
| `tools/update-data.mjs` | obnoví soubory v `data/` |
| `favicon-32.png`, `favicon-64.png` | ikony do záložky: lístek Františka z rodinného stromu holasovi.net se zlatým F |
| `THIRD_PARTY_NOTICES.md` | licence cizích dat a služeb; doplnit při každém novém cizím zdroji |
| `.nojekyll` | GitHub Pages soubory nepřevádí přes Jekyll |
| `CNAME` | vlastní doména `frantisek.holasovi.net`; spravuje ji GitHub (Settings → Pages), ručně neměnit ani nemazat |
| `apple-touch-icon.png` | ikona pro plochu iPhonu/iPadu (180 × 180, čtverec bez průhlednosti, stejný lístek) |
| `holasovi-strom.webp` | ikona rodinného stromu vpravo v záhlaví za přepínačem režimu, odkaz na https://holasovi.net (96 × 96, zmenšená ikona holasovi.net) |
| `.github/workflows/zverejneni.yml` | zveřejnění na GitHub Pages: web se sestaví z repozitáře bez `README.md`, `CLAUDE.md`, `THIRD_PARTY_NOTICES.md`, `tools/` a nastavení repozitáře (seznam `VYNECHAT`); nový soubor, který na web nepatří, doplnit do seznamu |

## Pravidla

- Stránka je bez sestavování a bez knihoven z CDN: jen soubory v tabulce výše. Skripty jsou klasické (`<script src>`, ne moduly ES) a odkazy relativní, aby stránka šla otevřít i dvojklikem na `index.html` bez serveru. Logiku nedělit do dalších souborů; nový soubor jen s dobrým důvodem a s doplněním této tabulky.
- Data v `data/` se mění jen přes `tools/update-data.mjs`, ne ručně. Když se datový soubor nenačte, stránka nesmí spadnout (jmeniny prázdné, mapa prázdná, hodiny běží).
- Název stránky „František Homepage“ (záložka, záhlaví, `apple-mobile-web-app-title` pro název na ploše iPhonu, protože záložka se každou sekundu přepisuje podle hodin).
- Externí služby jen bez klíčů a s povoleným voláním z prohlížeče (CORS): Open-Meteo (počasí, předpověď, hledání míst; zdarma jen nekomerčně, uvádět CC BY 4.0), time.akamai.com se zálohou worldtimeapi.org a timeapi.io. Žádné API klíče ani tokeny v repozitáři – repozitář je veřejný.
- Stránka musí fungovat i bez sítě (hodiny, kalendář, mapa) a na iPhonu/iPadu (Safari); chyba v jedné části nesmí zastavit hodiny.
- Texty česky. Nepřebírat texty z cas-presny.cz. Schválené znění hlavních textů: „Aktuální čas v České republice“, „Platí zimní čas (SEČ, UTC+1)“, „Hodiny tohoto zařízení se předbíhají/zpožďují o … (přesnost ±…)“, kartičky Dnes / Svátek / Týden / Den v roce / Slunce v Brně (východ – západ) / Počasí v Brně, sekce Plánovací kalendář (seznam pod ním: Události ve zvoleném období) / Předpověď na týden / Světový čas / Změna času, patička „Vytvořil František Holas“.
- Obchody o státních svátcích podle zákona č. 223/2016 Sb. (prodejny nad 200 m²): zavřeno 1. 1., Velikonoční pondělí, 8. 5., 28. 9., 28. 10., 25. a 26. 12., Štědrý den od 12:00; ostatní státní svátky otevřeno. Kalendář: zavřeno = plná buňka, otevřeno = rámeček, Štědrý den = půl buňky. V Událostech štítek „obchody zavřené / otevřené / zavřené od 12:00“ a poznámka o výjimkách, v kartičce Dnes štítek „Dnes/Zítra velké obchody zavřené“. Při změně zákona upravit `SHOPS_CLOSED` a `shopsOf()`.
- Barvy jen přes CSS proměnné, světlý i tmavý režim. Režim je výchozí podle systému; tlačítko vedle 24 h / 12 h ho ručně přepne (localStorage `pc_theme`, shoda se systémem volbu smaže; malý skript v `<head>` ho nastaví ještě před vykreslením). Tmavé proměnné jsou ve `styl.css` dvakrát (media query a `:root[data-theme="dark"]`) – měnit obě. Rozložení musí fungovat od šířky 360 px (záhlaví na jednom řádku).
- Lidé v `config.js` (`people`): narozeniny jen den a měsíc, věk se nikde nezobrazuje. Pro jmeniny používat výhradně slovo **svátek**; státní svátky v souhrnu a legendě označovat „státní svátek“. Svátek se dopočítá z jmenného kalendáře podle `firstName` (jinak prvního slova `name`), lze ho zadat ručně (`nameday`) nebo vypnout (`false`). V kalendáři tečka vlevo nahoře u čísla dne (narozeniny `--bday`, svátek `--nday`), seznam pod kalendářem se jmenuje „Události ve zvoleném období“ a má řádky „Narozeniny – jméno“ / „Svátek – jméno“. Kdo má narozeniny 29. 2., slaví v nepřestupném roce 28. 2.

## Testování před commitem

V headless Chromiu (Playwright) s podvrženými odpověďmi Open-Meteo a time.akamai.com:
- žádné chyby JavaScriptu; počítač 1280 px, mobil 390 px a 360 px, světlý i tmavý režim podle systému i ručně přepnutý (ručně tmavý musí vypadat stejně jako tmavý podle systému, včetně mapy),
- bez sítě: hodiny běží, místo počasí je srozumitelná hláška,
- `config.js` výchozí, chybějící, s jiným místem a s neplatnými souřadnicemi,
- lidé: dopočet svátku, přezdívka s `firstName`, ruční a vypnutý svátek, neplatné datum a chybějící jméno (jen varování v konzoli), 29. 2. v přestupném i nepřestupném roce,
- u kalendáře kontrola svátků a počtu pracovních dní (2026: 250, 2027: 252), obchody o svátcích (23.–26. 12., Velikonoce, otevřený svátek 17. 11.), u mapy bez překryvů bublin měst.

## Nasazení

Commit do `main` a push; úloha GitHub Actions „Zveřejnění webu“ stránku zveřejní zhruba do minuty (v Settings → Pages je Source: GitHub Actions): https://frantisek.holasovi.net/ (původní adresa frantisekholas.github.io/my-homepage/ na ni přesměrovává).

DNS (u správce domény holasovi.net): CNAME `frantisek` → `frantisekholas.github.io`, TXT `_github-pages-challenge-FrantisekHolas` pro ověření domény na GitHubu – oba záznamy ponechat.
