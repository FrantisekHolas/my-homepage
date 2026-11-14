# Použitá díla třetích stran

Stránka `index.html` obsahuje nebo používá následující cizí díla. Vlastní kód stránky je © 2026 František Holas.

## Data vložená do stránky

### Jmenný kalendář: namedays-cs 3.0.0
Zdroj: https://github.com/OzzyCzech/namedays-cs · licence MIT

```
MIT License

Copyright (c) Roman Ožana <roman@ozana.cz> (https://ozana.cz/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Mapa pevniny: Natural Earth přes world-atlas 2.0.2
Tečková mapa ve stránce je odvozená z vrstvy pevniny Natural Earth 1:50m (volné dílo, public domain, https://www.naturalearthdata.com/), převzaté z balíčku world-atlas (licence ISC):

```
Copyright 2013-2019 Michael Bostock

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
```

### Časová pásma na mapě: @photostructure/tz-lookup 11.8.0
Přiřazení časového pásma každé tečce mapy. Licence CC0 1.0 (volné dílo): https://github.com/photostructure/tz-lookup

## Služby volané z prohlížeče návštěvníka

| Služba | Účel | Podmínky |
|---|---|---|
| Open-Meteo (api.open-meteo.com, geocoding-api.open-meteo.com) | počasí, předpověď, hledání míst | data CC BY 4.0, zdarma pro nekomerční použití: https://open-meteo.com/en/terms |
| time.akamai.com, záložně worldtimeapi.org a timeapi.io | ověření přesnosti hodin | veřejně dostupné časové služby |

## Ostatní

- Výpočet východu a západu slunce podle algoritmu NOAA Solar Calculator (U.S. National Oceanic and Atmospheric Administration).
- Státní a ostatní svátky podle zákona č. 245/2000 Sb. (úřední dílo, nechráněné autorským zákonem).

Nástroje ve složce `tools/` používají navíc topojson-client 3.1.0 (licence ISC, © Michael Bostock); do stránky se nevkládá.
