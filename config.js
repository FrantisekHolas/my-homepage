// Nastavení stránky My Homepage
// ---------------------------------------------------------------
// Soubor je volitelný. Když chybí, stránka použije výchozí hodnoty
// (Brno, 24hodinový čas, kalendář na 3 měsíce, všechny sekce).
// Po úpravě stačí stránku v prohlížeči obnovit.
//
// Souřadnice místa zjistíte v mapách: pravým tlačítkem na místo
// se zobrazí zeměpisná šířka a délka (např. 49.1951, 16.6068).

window.MY_HOMEPAGE_CONFIG = {

  // Místo pro kartičky „Slunce“ a „Počasí“ a pro týdenní předpověď
  place: {
    name: 'Brno',     // název, který se zobrazí na stránce
    nameIn: 'v Brně', // tvar pro popisky „Slunce v Brně“, „Počasí v Brně“ (nepovinné)
    lat: 49.1951,     // zeměpisná šířka (sever kladně)
    lon: 16.6068,     // zeměpisná délka (východ kladně)
  },

  // Výchozí formát času: '24h' nebo '12h'
  // (návštěvník si ho může přepnout, volbu si pak pamatuje jeho prohlížeč)
  timeFormat: '24h',

  // Výchozí pohled plánovacího kalendáře: '3m' (3 měsíce) nebo 'year' (celý rok)
  calendarView: '3m',

  // Které sekce zobrazit: true = zobrazit, false = skrýt
  sections: {
    calendar: true,     // plánovací kalendář se svátky
    forecast: true,     // předpověď na týden
    worldMap: true,     // mapa světového času
    timeChange: true,   // změna letního a zimního času
  },
};
