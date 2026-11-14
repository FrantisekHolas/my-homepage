// Nastavení stránky František Homepage
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

  // Narozeniny a svátky lidí: v kalendáři tečka u data, v seznamu „Události ve zvoleném období“ jméno (věk se nikde neukazuje)
  //   name      – jak se má osoba zobrazit (může být i přezdívka)
  //   birthday  – den a měsíc narození, např. '3.4.' (rok se nezadává)
  //   firstName – občanské jméno, podle kterého se dopočítá svátek (když se liší od name)
  //   nameday   – svátek zadaný ručně, např. '23.4.', nebo false = svátek neukazovat
  // Pozor: tento soubor je veřejný (repozitář i web).
  people: [
    { name: 'Věrka',     firstName: 'Věra',     birthday: '9.12.' },
    { name: 'Luky',      firstName: 'Lukáš',    birthday: '2.9.' },
    { name: 'Ráďa',      firstName: 'Radim',    birthday: '16.11.' },
    { name: 'Kristýnka', firstName: 'Kristýna', birthday: '14.8.' },
    { name: 'František',                        birthday: '2.6.' },
  ],
};
