# František Homepage

Domovská stránka s přesným časem, svátky, plánovacím kalendářem se státními svátky, týdenní předpovědí počasí a mapou světového času se dnem a nocí.

Je to statická stránka bez serveru, bez sestavování a bez instalace. Funguje v prohlížeči na počítači, tabletu i mobilu.

| Soubor | Obsah |
|---|---|
| `index.html` | kostra stránky |
| `styl.css` | vzhled |
| `app.js` | logika stránky |
| `config.js` | nastavení (viz níže) |
| `data/` | jmenný kalendář a mapa časových pásem (generuje `tools/update-data.mjs`) |
| `favicon-*.png`, `apple-touch-icon.png` | ikony do záložky a na plochu iPhonu |
| `holasovi-strom.webp` | ikona rodinného stromu v záhlaví, odkaz na holasovi.net |

## Co stránka umí

| Část | Obsah |
|---|---|
| Hodiny | čas v Česku; ověření přesnosti hodin zařízení a oprava odchylky |
| Kartičky | den, svátek dnes a zítra, kalendářní týden, den roku, východ a západ slunce, aktuální počasí |
| Plánovací kalendář | 3 měsíce nebo celý rok, čísla týdnů, víkendy, státní svátky (i s tím, zda mají velké obchody otevřeno), narozeniny a svátky vybraných lidí, počet pracovních dní, tipy na prodloužené volno |
| Předpověď na týden | výchozí místo z nastavení; jiné místo hledáním nebo podle polohy zařízení (volba se nepamatuje) |
| Světový čas | mapa časových pásem se dnem a nocí, jedno hlavní město za každé pásmo, detail po najetí nebo kliknutí |
| Změna času | aktuální režim a datum další změny letního/zimního času |
| Vzhled | světlý a tmavý režim podle systému; tlačítkem vedle 24 h / 12 h ho lze přepnout (volba se pamatuje) |
| Rodinný strom | ikona stromu vpravo v záhlaví vede na holasovi.net |

## Přizpůsobení

Nastavení je v souboru `config.js` vedle `index.html`:

- `place` – výchozí místo pro počasí, předpověď a východ/západ slunce (název, tvar „v …“ pro popisky a souřadnice),
- `timeFormat` – `'24h'` nebo `'12h'`,
- `calendarView` – `'3m'` nebo `'year'`,
- `sections` – které sekce zobrazit,
- `people` – lidé, jejichž narozeniny a svátky se ukážou v kalendáři (jméno, den a měsíc narození; svátek se dopočítá podle jména). Soubor je veřejný.

Soubor je volitelný: když chybí, platí výchozí hodnoty (Brno, 24 h, 3 měsíce, všechny sekce). Hodiny, státní svátky a jmenný kalendář jsou vždy české.

## Spuštění

- **Online:** https://frantisek.holasovi.net/ (GitHub Pages z větve `main`, složka `/`; vlastní doména je v souboru `CNAME`).
- **Lokálně:** otevřít `index.html` v prohlížeči (stačí dvojklik); ostatní soubory a složka `data/` musí ležet vedle něj.

## Obnova dat

Jmenný kalendář a data mapy jsou v souborech `data/jmeniny.js` a `data/mapa.js`. Ručně se neupravují, obnovují se příkazy:

```
cd tools
npm install
npm run update-data
```

Je potřeba Node.js 20 nebo novější. Spouští se jen při změně zdrojových dat, ne při běžné úpravě stránky.

## Licence

© 2026 František Holas. Všechna práva vyhrazena.
Použitá díla třetích stran a jejich licence jsou v [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
