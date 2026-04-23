// Atlante mineralogico esteso:
// - database ampio con gruppi, specie e varieta
// - filtri avanzati
// - scheda tecnica fullscreen con viewer 3D interattivo

const CATEGORY_ORDER = [
  "Silicati",
  "Gemme importanti",
  "Ossidi e idrossidi",
  "Solfuri",
  "Solfati",
  "Carbonati",
  "Fosfati",
  "Alogenuri",
  "Elementi nativi",
  "Minerali rarissimi"
];

const GLOSSARY_DATA = {
  durezza: {
    titolo: "Durezza (scala Mohs)",
    definizione:
      "Misura la resistenza del minerale al graffio su una scala da 1 (talco) a 10 (diamante).",
    esempio: "Corindone = 9, quarzo = 7, gesso = 2."
  },
  densita: {
    titolo: "Densità",
    definizione:
      "Rapporto tra massa e volume (g/cm³). È utile per distinguere minerali con aspetto simile.",
    esempio: "Galena e barite possono essere simili visivamente ma hanno densità diverse."
  },
  sfaldatura: {
    titolo: "Sfaldatura",
    definizione:
      "Tendenza del minerale a rompersi secondo piani cristallografici preferenziali e regolari.",
    esempio: "Miche e calcite mostrano piani di sfaldatura evidenti."
  },
  frattura: {
    titolo: "Frattura",
    definizione:
      "Modo in cui il minerale si rompe quando non segue piani di sfaldatura.",
    esempio: "Il quarzo presenta tipica frattura concoide."
  },
  striscio: {
    titolo: "Striscio",
    definizione:
      "Colore della polvere del minerale ottenuta su piastra di porcellana non smaltata.",
    esempio: "L'ematite può apparire grigia ma lascia striscio rosso-bruno."
  },
  formula: {
    titolo: "Formula chimica",
    definizione:
      "Rappresenta gli elementi presenti e i loro rapporti stechiometrici nel reticolo.",
    esempio: "SiO₂ indica silicio e ossigeno in rapporto 1:2."
  },
  sistema: {
    titolo: "Sistema cristallino",
    definizione:
      "Descrive la simmetria geometrica del reticolo cristallino (cubico, esagonale, monoclino, ecc.).",
    esempio: "Il sistema influenza abito, sfaldatura e proprietà ottiche."
  }
};

const ADV_COMPARE_METRICS = [
  {
    key: "durezza",
    label: "Durezza Mohs",
    max: 10,
    get: (sample) => sample.durezza
  },
  {
    key: "densita",
    label: "Densità (g/cm³)",
    max: 22,
    get: (sample) => sample.densita
  },
  {
    key: "rarita",
    label: "Indice rarità",
    max: 4,
    get: (sample) => rarityToIndex(sample.rarita)
  },
  {
    key: "uso",
    label: "Indice uso gemmologico",
    max: 4,
    get: (sample) => useToIndex(sample.usoTag)
  },
  {
    key: "complessita",
    label: "Complessità formula",
    max: 30,
    get: (sample) => Math.min(30, formulaComplexity(sample.formula))
  }
];

const DEPOSIT_REGIONS = [
  {
    id: "usa-canada",
    nome: "USA · Canada",
    lat: 64.49,
    lng: -110.28,
    zoom: 12,
    descrizione:
      "Distretti con quarzo, turchese, metalli nativi e mineralizzazioni idrotermali estese.",
    minerali: ["Quarzo", "Turchese", "Oro", "Argento", "Ossidiana"]
  },
  {
    id: "ande-colombia",
    nome: "Ande · Colombia",
    lat: 5.53,
    lng: -74.11,
    zoom: 14,
    descrizione:
      "Area chiave per berilli gemmologici, pirite e associazioni idrotermali in rocce metamorfiche.",
    minerali: ["Smeraldo", "Pirite", "Calcite", "Quarzo"]
  },
  {
    id: "brasile",
    nome: "Brasile",
    lat: -20.39,
    lng: -43.50,
    zoom: 13,
    descrizione:
      "Pegmatiti e geodi celebri per quarzo, topazio, tormaline e numerose varietà gemmologiche.",
    minerali: ["Ametista", "Topazio", "Quarzo", "Tormalina", "Acquamarina"]
  },
  {
    id: "alpi-italia",
    nome: "Alpi · Italia",
    lat: 45.94,
    lng: 7.67,
    zoom: 13,
    descrizione:
      "Distretti metamorfici e idrotermali con fluorite, pirite, vesuvianite e specie didatticamente rilevanti.",
    minerali: ["Fluorite", "Pirite", "Vesuvianite", "Dolomite", "Apatite"]
  },
  {
    id: "russia",
    nome: "Russia · Urali",
    lat: 57.31,
    lng: 61.35,
    zoom: 12,
    descrizione:
      "Grandi province metallogeniche con malachite, ematite, diamanti alluvionali e ossidi.",
    minerali: ["Malachite", "Ematite", "Diamante", "Magnetite", "Apatite"]
  },
  {
    id: "myanmar-srilanka",
    nome: "Myanmar · Sri Lanka",
    lat: 22.93,
    lng: 96.51,
    zoom: 13,
    descrizione:
      "Contesti classici per rubino, zaffiro, spinello e minerali rari ad alto valore gemmologico.",
    minerali: ["Rubino", "Zaffiro", "Spinello", "Painite", "Jeremejevite"]
  },
  {
    id: "madagascar",
    nome: "Madagascar",
    lat: -22.68,
    lng: 45.37,
    zoom: 13,
    descrizione:
      "Isola con elevata biodiversità mineralogica: berilli, corindoni, fosfati e specie rarissime.",
    minerali: ["Smeraldo", "Zaffiro", "Rubino", "Grandidierite", "Tanzanite"]
  },
  {
    id: "sudafrica",
    nome: "Sudafrica · Namibia",
    lat: -28.74,
    lng: 24.76,
    zoom: 14,
    descrizione:
      "Province ricche di diamanti, oro, platino e granati associati a intrusioni profonde.",
    minerali: ["Diamante", "Oro", "Platino", "Andradite", "Piropo"]
  }
];

const IMAGE_BANK = [
  "assets/images/agata.jpg",
  "assets/images/ametista.jpg",
  "assets/images/argento.jpg",
  "assets/images/diamante.jpg",
  "assets/images/lapislazzuli.jpg",
  "assets/images/malachite.jpg",
  "assets/images/onice.jpg",
  "assets/images/opale.jpg",
  "assets/images/oro.jpg",
  "assets/images/ossidiana.jpg",
  "assets/images/quartz.jpg",
  "assets/images/rubino.jpg",
  "assets/images/smeraldo.jpg",
  "assets/images/topazio.jpg",
  "assets/images/turchese.jpg",
  "assets/images/zaffiro.jpg"
];

// Mappa immagini specifiche per ogni minerale/gemma generata automaticamente.
// Se presente, evita duplicati e assegna una foto coerente per campione.
const MINERAL_IMAGE_MAP = window.MINERAL_IMAGE_MAP || {};
const MINERAL_CIF_SOURCES = window.MINERAL_CIF_MAP || {};
const MINERAL_CIF_TEXTS = window.MINERAL_CIF_TEXTS || {};
const EASTER_EGG_SEQUENCE = "2011!!!";
const EASTER_EGG_PAGE = "easter-egg.html";
const VISITS_STORAGE_KEY = "atlanteMineralogico.visits.v1";
const VISITS_LOG_LIMIT = 3000;

const CATEGORY_DEFAULTS = {
  "Silicati": {
    classe: "Silicati",
    lucentezza: "Vitrea",
    trasparenza: "Da trasparente a opaca",
    sfaldatura: "Variabile",
    frattura: "Concoide o irregolare",
    striscio: "Bianco",
    origine:
      "Cristallizzazione in ambienti magmatici, metamorfici o idrotermali ricchi in silice.",
    ambiente:
      "Rocce intrusive/effusive, sistemi idrotermali e livelli metamorfici regionali.",
    ritrovamento:
      "Brasile, Russia, USA, Madagascar, Pakistan e principali distretti alpini.",
    usi: "Gemmologia, industria ceramica, abrasivi, collezionismo e didattica.",
    rarita: "non comune",
    usoTag: "misto",
    durezza: "6-7",
    densita: "2.7-3.3"
  },
  "Gemme importanti": {
    classe: "Minerale gemmologico",
    lucentezza: "Vitrea",
    trasparenza: "Da trasparente a translucida",
    sfaldatura: "Variabile",
    frattura: "Concoide o irregolare",
    striscio: "Bianco",
    origine:
      "Formazione in ambienti magmatici, metamorfici e idrotermali con selezione gemmologica.",
    ambiente:
      "Vene idrotermali, pegmatiti, metacarbonati e depositi secondari alluvionali.",
    ritrovamento:
      "Sri Lanka, Madagascar, Brasile, Myanmar, Colombia, Afghanistan, Tanzania.",
    usi: "Alta gioielleria, collezionismo, laboratori gemmologici.",
    rarita: "raro",
    usoTag: "gemmologico",
    durezza: "6-9",
    densita: "2.6-4.1"
  },
  "Ossidi e idrossidi": {
    classe: "Ossidi e idrossidi",
    lucentezza: "Submetallica o metallica",
    trasparenza: "Generalmente opaca",
    sfaldatura: "Debole o assente",
    frattura: "Irregolare",
    striscio: "Da bruno-rossastro a nero",
    origine:
      "Cristallizzazione magmatica e processi di alterazione/ossidazione in ambiente supergeno.",
    ambiente:
      "Rocce ultramafiche, intrusive basiche, zone ossidate di giacimenti metallici.",
    ritrovamento: "Sudafrica, Australia, Brasile, India, Russia, Canada.",
    usi: "Minerali di ferro/titanio/cromo, pigmenti, refrattari e applicazioni tecniche.",
    rarita: "non comune",
    usoTag: "industriale",
    durezza: "5-9",
    densita: "4.0-5.3"
  },
  Solfuri: {
    classe: "Solfuri",
    lucentezza: "Metallica",
    trasparenza: "Opaca",
    sfaldatura: "Variabile",
    frattura: "Irregolare",
    striscio: "Scuro",
    origine:
      "Precipitazione da fluidi idrotermali e processi magmatici con zolfo ridotto.",
    ambiente:
      "Vene idrotermali, giacimenti stratiformi, intrusioni mafico-ultramafiche.",
    ritrovamento: "Peru, Cile, Messico, Cina, USA, Polonia.",
    usi: "Principali minerali metalliferi per Cu, Zn, Pb, Hg, As.",
    rarita: "non comune",
    usoTag: "industriale",
    durezza: "2.5-6.5",
    densita: "4.0-8.2"
  },
  Solfati: {
    classe: "Solfati",
    lucentezza: "Vitrea o sericea",
    trasparenza: "Da trasparente a opaca",
    sfaldatura: "Buona in una o piu direzioni",
    frattura: "Irregolare",
    striscio: "Bianco",
    origine:
      "Precipitazione evaporitica o alterazione ossidativa di minerali solfuri.",
    ambiente:
      "Bacini evaporitici, zone aride, cappelli ossidati di giacimenti metalliferi.",
    ritrovamento: "Spagna, Italia, Iran, USA, Marocco, Messico.",
    usi: "Leganti, industria chimica, perforazione, didattica mineralogica.",
    rarita: "comune",
    usoTag: "industriale",
    durezza: "2-3.5",
    densita: "2.3-4.5"
  },
  Carbonati: {
    classe: "Carbonati",
    lucentezza: "Vitrea",
    trasparenza: "Da trasparente a opaca",
    sfaldatura: "Generalmente perfetta romboedrica",
    frattura: "Irregolare",
    striscio: "Bianco",
    origine: "Precipitazione sedimentaria, metamorfismo e alterazione idrotermale.",
    ambiente:
      "Piattaforme carbonatiche, sistemi idrotermali, zone ossidate di giacimenti.",
    ritrovamento: "Italia, Austria, Marocco, Cina, USA, Namibia.",
    usi: "Cemento, metallurgia, gemmologia ornamentale, geochimica isotopica.",
    rarita: "comune",
    usoTag: "misto",
    durezza: "3-4.5",
    densita: "2.7-3.9"
  },
  Fosfati: {
    classe: "Fosfati",
    lucentezza: "Vitrea",
    trasparenza: "Da trasparente a opaca",
    sfaldatura: "Variabile",
    frattura: "Concoide o irregolare",
    striscio: "Bianco",
    origine:
      "Cristallizzazione magmatica/accessoria o precipitazione secondaria in zone ossidate.",
    ambiente:
      "Pegmatiti, carbonatiti, depositi sedimentari fosfatici e cavita idrotermali.",
    ritrovamento: "Brasile, Russia, Namibia, Canada, Madagascar.",
    usi: "Fertilizzanti, terre rare, collezionismo, gemmologia selettiva.",
    rarita: "non comune",
    usoTag: "misto",
    durezza: "3-5.5",
    densita: "2.9-5.2"
  },
  Alogenuri: {
    classe: "Alogenuri",
    lucentezza: "Vitrea",
    trasparenza: "Da trasparente a translucida",
    sfaldatura: "Perfetta cubica",
    frattura: "Concoide o irregolare",
    striscio: "Bianco",
    origine: "Precipitazione da salamoie in bacini evaporitici.",
    ambiente:
      "Lagune salate, sequenze evaporitiche, bacini endoreici e miniere di sale.",
    ritrovamento: "Germania, Polonia, Cile, Iran, USA, Canada.",
    usi: "Chimica industriale, alimentazione, ottica (fluorite), didattica.",
    rarita: "comune",
    usoTag: "industriale",
    durezza: "2-4",
    densita: "2.1-3.2"
  },
  "Elementi nativi": {
    classe: "Elementi nativi",
    lucentezza: "Metallica",
    trasparenza: "Opaca",
    sfaldatura: "Assente o basale (grafite)",
    frattura: "Uncinata o irregolare",
    striscio: "Metallico/scuro",
    origine:
      "Concentrazione primaria magmatica/idrotermale o accumulo secondario in placers.",
    ambiente:
      "Vene quarzifere aurifere, intrusioni mafiche, depositi alluvionali e fumarole.",
    ritrovamento: "Sudafrica, Russia, Canada, Australia, Cile, USA.",
    usi: "Gioielleria, elettronica, catalisi, materiali refrattari e lubrificanti.",
    rarita: "raro",
    usoTag: "misto",
    durezza: "1-4",
    densita: "2.2-21.4"
  },
  "Minerali rarissimi": {
    classe: "Specie rare",
    lucentezza: "Vitrea",
    trasparenza: "Da trasparente a translucida",
    sfaldatura: "Variabile",
    frattura: "Concoide o irregolare",
    striscio: "Bianco",
    origine:
      "Cristallizzazione in ambienti geochimici ristretti (pegmatiti evolute, metamorfici specifici).",
    ambiente:
      "Pegmatiti litinifere, vene boratiche, contesti ad alta pressione o metasomatici.",
    ritrovamento:
      "Myanmar, Madagascar, Sri Lanka, Tanzania, Namibia, Afghanistan, California.",
    usi: "Ricerca mineralogica, collezionismo scientifico e gemmologia specialistica.",
    rarita: "rarissimo",
    usoTag: "collezionistico",
    durezza: "6-8.5",
    densita: "3.0-4.2"
  }
};

const rawDefinitions = [
  // Silicati + campioni base
  {
    nome: "Quarzo",
    categorie: ["Silicati"],
    formula: "SiO2",
    composizione: "Diossido di silicio in reticolo tridimensionale.",
    sistema: "Trigonale",
    durezza: 7,
    densita: 2.65,
    colore: "Incolore, bianco, rosa, grigio",
    rarita: "comune",
    usoTag: "misto",
    curiosita: "Mostra effetto piezoelettrico ed e riferimento per molte varieta gemmologiche."
  },
  {
    nome: "Ametista",
    categorie: ["Silicati", "Gemme importanti"],
    relazione: "varieta",
    gruppo: "Quarzo",
    formula: "SiO2",
    composizione: "Varieta del quarzo con tracce di Fe e centri di colore.",
    sistema: "Trigonale",
    durezza: 7,
    densita: 2.65,
    colore: "Viola",
    rarita: "non comune",
    usoTag: "gemmologico"
  },
  {
    nome: "Topazio",
    categorie: ["Silicati", "Gemme importanti"],
    formula: "Al2SiO4(F,OH)2",
    composizione: "Nesosilicato di alluminio con fluoro e ossidrile.",
    classe: "Silicati (nesosilicati)",
    sistema: "Ortorombico",
    durezza: 8,
    densita: 3.5,
    colore: "Incolore, giallo, azzurro, rosa",
    rarita: "raro",
    usoTag: "gemmologico"
  },
  {
    nome: "Feldspati",
    categorie: ["Silicati"],
    relazione: "gruppo",
    formula: "KAlSi3O8-NaAlSi3O8-CaAl2Si2O8",
    composizione: "Serie di alluminosilicati alcalini e alcalino-terrosi.",
    sistema: "Monoclino/Triclino",
    durezza: "6-6.5",
    densita: "2.55-2.76",
    colore: "Bianco, rosa, grigio",
    rarita: "comune",
    usoTag: "industriale",
    varieta: "Ortoclasio, Albite, Anortite"
  },
  {
    nome: "Ortoclasio",
    categorie: ["Silicati"],
    formula: "KAlSi3O8",
    composizione: "Feldspato potassico.",
    classe: "Silicati (tettosilicati)",
    sistema: "Monoclino",
    durezza: 6,
    densita: 2.56,
    colore: "Bianco, rosa, crema",
    rarita: "comune",
    gruppo: "Feldspati",
    usoTag: "industriale"
  },
  {
    nome: "Albite",
    categorie: ["Silicati"],
    formula: "NaAlSi3O8",
    composizione: "Feldspato sodico.",
    classe: "Silicati (tettosilicati)",
    sistema: "Triclino",
    durezza: "6-6.5",
    densita: 2.62,
    colore: "Bianco, grigio, azzurrino",
    rarita: "comune",
    gruppo: "Feldspati",
    usoTag: "industriale"
  },
  {
    nome: "Anortite",
    categorie: ["Silicati"],
    formula: "CaAl2Si2O8",
    composizione: "Feldspato calcico.",
    classe: "Silicati (tettosilicati)",
    sistema: "Triclino",
    durezza: "6-6.5",
    densita: 2.75,
    colore: "Bianco-grigiastro",
    rarita: "non comune",
    gruppo: "Feldspati",
    usoTag: "industriale"
  },
  {
    nome: "Nefelina",
    categorie: ["Silicati"],
    formula: "(Na,K)AlSiO4",
    composizione: "Feldspatoide sodico-potassico.",
    classe: "Silicati (feldspatoidi)",
    sistema: "Esagonale",
    durezza: "5.5-6",
    densita: 2.6,
    colore: "Bianco, grigio, giallastro",
    rarita: "non comune"
  },
  {
    nome: "Leucite",
    categorie: ["Silicati"],
    formula: "KAlSi2O6",
    composizione: "Feldspatoide potassico.",
    classe: "Silicati (feldspatoidi)",
    sistema: "Tetragonale (pseudo-cubico)",
    durezza: "5.5-6",
    densita: 2.47,
    colore: "Bianco, grigio",
    rarita: "non comune"
  },
  {
    nome: "Sodalite",
    categorie: ["Silicati"],
    formula: "Na8(Al6Si6O24)Cl2",
    composizione: "Feldspatoide contenente cloro.",
    classe: "Silicati (feldspatoidi)",
    sistema: "Cubico",
    durezza: "5.5-6",
    densita: 2.3,
    colore: "Blu, grigio, bianco",
    rarita: "non comune"
  },
  {
    nome: "Lazurite",
    categorie: ["Silicati"],
    formula: "(Na,Ca)8(AlSiO4)6(S,SO4,Cl)2",
    composizione: "Feldspatoide solfato-clorurato, fase blu del lapislazzuli.",
    classe: "Silicati (feldspatoidi)",
    sistema: "Cubico",
    durezza: "5-5.5",
    densita: "2.4-2.5",
    colore: "Blu oltremare",
    rarita: "raro"
  },
  {
    nome: "Olivina",
    categorie: ["Silicati", "Gemme importanti"],
    formula: "(Mg,Fe)2SiO4",
    composizione: "Serie forsterite-fayalite.",
    classe: "Silicati (nesosilicati)",
    sistema: "Ortorombico",
    durezza: "6.5-7",
    densita: "3.2-4.4",
    colore: "Verde oliva",
    rarita: "non comune",
    usoTag: "misto"
  },
  {
    nome: "Granati",
    categorie: ["Silicati"],
    relazione: "gruppo",
    formula: "X3Y2(SiO4)3",
    composizione: "Nesosilicati con serie isomorfe complesse.",
    sistema: "Cubico",
    durezza: "6.5-7.5",
    densita: "3.5-4.3",
    colore: "Rosso, verde, arancio, bruno",
    rarita: "non comune",
    varieta: "Almandino, Piropo, Grossularia, Andradite, Spessartina"
  },
  {
    nome: "Almandino",
    categorie: ["Silicati"],
    formula: "Fe3Al2(SiO4)3",
    composizione: "Granato ferrifero-alluminifero.",
    classe: "Silicati (nesosilicati)",
    sistema: "Cubico",
    durezza: "7-7.5",
    densita: "3.95-4.3",
    colore: "Rosso scuro",
    rarita: "non comune",
    gruppo: "Granati"
  },
  {
    nome: "Piropo",
    categorie: ["Silicati"],
    formula: "Mg3Al2(SiO4)3",
    composizione: "Granato magnesiaco.",
    classe: "Silicati (nesosilicati)",
    sistema: "Cubico",
    durezza: "7-7.5",
    densita: "3.58-3.65",
    colore: "Rosso porpora",
    rarita: "non comune",
    gruppo: "Granati"
  },
  {
    nome: "Grossularia",
    categorie: ["Silicati"],
    formula: "Ca3Al2(SiO4)3",
    composizione: "Granato calcio-alluminifero.",
    classe: "Silicati (nesosilicati)",
    sistema: "Cubico",
    durezza: "6.5-7.5",
    densita: "3.5-3.7",
    colore: "Verde, giallo, bruno",
    rarita: "non comune",
    gruppo: "Granati"
  },
  {
    nome: "Andradite",
    categorie: ["Silicati"],
    formula: "Ca3Fe2(SiO4)3",
    composizione: "Granato calcio-ferrico.",
    classe: "Silicati (nesosilicati)",
    sistema: "Cubico",
    durezza: "6.5-7",
    densita: "3.8-3.9",
    colore: "Verde, bruno, nero",
    rarita: "non comune",
    gruppo: "Granati"
  },
  {
    nome: "Spessartina",
    categorie: ["Silicati"],
    formula: "Mn3Al2(SiO4)3",
    composizione: "Granato manganesifero.",
    classe: "Silicati (nesosilicati)",
    sistema: "Cubico",
    durezza: "6.5-7.5",
    densita: "4.1-4.3",
    colore: "Arancio-rosso",
    rarita: "raro",
    gruppo: "Granati"
  },
  {
    nome: "Epidoto",
    categorie: ["Silicati"],
    formula: "Ca2(Al,Fe)3(SiO4)(Si2O7)O(OH)",
    composizione: "Sorosilicato calcio-alluminio-ferro.",
    classe: "Silicati (sorosilicati)",
    sistema: "Monoclino",
    durezza: "6-7",
    densita: "3.3-3.5",
    colore: "Verde pistacchio",
    rarita: "non comune"
  },
  {
    nome: "Zoisite",
    categorie: ["Silicati"],
    formula: "Ca2Al3(SiO4)(Si2O7)O(OH)",
    composizione: "Sorosilicato calcio-alluminio.",
    classe: "Silicati (sorosilicati)",
    sistema: "Ortorombico",
    durezza: "6-7",
    densita: "3.3-3.4",
    colore: "Verde, grigio, blu (varieta tanzanite)",
    rarita: "non comune"
  },
  {
    nome: "Vesuvianite",
    categorie: ["Silicati"],
    formula: "Ca10(Mg,Fe)2Al4(SiO4)5(Si2O7)2(OH,F)4",
    composizione: "Silicato complesso calcico.",
    classe: "Silicati (sorosilicati)",
    sistema: "Tetragonale",
    durezza: "6.5-7",
    densita: "3.3-3.5",
    colore: "Verde, bruno, giallo",
    rarita: "raro"
  },
  {
    nome: "Tormalina",
    categorie: ["Silicati"],
    relazione: "gruppo",
    formula: "Ciclosilicati boriferi complessi",
    composizione: "Gruppo borosilicatico con ampia sostituzione ionica.",
    sistema: "Trigonale",
    durezza: "7-7.5",
    densita: "3.0-3.3",
    colore: "Quasi tutti i colori",
    rarita: "non comune",
    varieta: "Elbaite, Dravite, Schorl"
  },
  {
    nome: "Elbaite",
    categorie: ["Silicati", "Gemme importanti"],
    relazione: "varieta",
    gruppo: "Tormalina",
    formula: "Na(Li,Al)3Al6(BO3)3Si6O18(OH)4",
    composizione: "Tormalina litinifera spesso policroma.",
    classe: "Silicati (ciclosilicati)",
    sistema: "Trigonale",
    durezza: "7-7.5",
    densita: "3.0-3.1",
    colore: "Verde, rosa, blu, policromo",
    rarita: "raro",
    usoTag: "gemmologico"
  },
  {
    nome: "Dravite",
    categorie: ["Silicati"],
    formula: "NaMg3Al6(BO3)3Si6O18(OH)4",
    composizione: "Tormalina magnesiaca.",
    classe: "Silicati (ciclosilicati)",
    sistema: "Trigonale",
    durezza: "7-7.5",
    densita: "3.0-3.1",
    colore: "Bruno, giallo-bruno",
    rarita: "non comune",
    gruppo: "Tormalina"
  },
  {
    nome: "Schorl",
    categorie: ["Silicati"],
    formula: "NaFe3Al6(BO3)3Si6O18(OH)4",
    composizione: "Tormalina ferrifera.",
    classe: "Silicati (ciclosilicati)",
    sistema: "Trigonale",
    durezza: "7-7.5",
    densita: "3.1-3.3",
    colore: "Nero",
    rarita: "comune",
    gruppo: "Tormalina"
  },
  {
    nome: "Berillo",
    categorie: ["Silicati"],
    relazione: "gruppo",
    formula: "Be3Al2(Si6O18)",
    composizione: "Ciclosilicato di berillio e alluminio.",
    classe: "Silicati (ciclosilicati)",
    sistema: "Esagonale",
    durezza: "7.5-8",
    densita: "2.63-2.9",
    colore: "Verde, azzurro, rosa, giallo",
    rarita: "raro",
    varieta: "Acquamarina, Morganite, Eliodoro, Smeraldo"
  },
  {
    nome: "Topazolite",
    categorie: ["Silicati", "Gemme importanti"],
    relazione: "varieta",
    gruppo: "Andradite",
    formula: "Ca3Fe2(SiO4)3",
    composizione: "Varieta gialla della andradite.",
    classe: "Silicati (nesosilicati)",
    sistema: "Cubico",
    durezza: "6.5-7",
    densita: "3.8-3.9",
    colore: "Giallo dorato",
    rarita: "raro",
    usoTag: "gemmologico"
  },
  {
    nome: "Pirosseni",
    categorie: ["Silicati"],
    relazione: "gruppo",
    formula: "XY(Si,Al)2O6",
    composizione: "Inosilicati a catena singola.",
    classe: "Silicati (inosilicati)",
    sistema: "Monoclino/Ortorombico",
    durezza: "5-6.5",
    densita: "3.2-3.6",
    colore: "Verde scuro, nero, bruno",
    rarita: "comune",
    varieta: "Augite, Diopside, Enstatite"
  },
  {
    nome: "Augite",
    categorie: ["Silicati"],
    formula: "(Ca,Na)(Mg,Fe,Al,Ti)(Si,Al)2O6",
    composizione: "Pirosseno calcico-ferromagnesiaco.",
    classe: "Silicati (inosilicati)",
    sistema: "Monoclino",
    durezza: "5.5-6",
    densita: "3.2-3.6",
    colore: "Verde scuro, nero",
    rarita: "comune",
    gruppo: "Pirosseni"
  },
  {
    nome: "Diopside",
    categorie: ["Silicati", "Gemme importanti"],
    formula: "CaMgSi2O6",
    composizione: "Pirosseno calcico-magnesiaco.",
    classe: "Silicati (inosilicati)",
    sistema: "Monoclino",
    durezza: "5.5-6.5",
    densita: "3.2-3.4",
    colore: "Verde",
    rarita: "non comune",
    gruppo: "Pirosseni",
    usoTag: "misto"
  },
  {
    nome: "Enstatite",
    categorie: ["Silicati"],
    formula: "Mg2Si2O6",
    composizione: "Pirosseno ortorombico magnesiaco.",
    classe: "Silicati (inosilicati)",
    sistema: "Ortorombico",
    durezza: "5-6",
    densita: "3.1-3.3",
    colore: "Bruno, verde, grigio",
    rarita: "non comune",
    gruppo: "Pirosseni"
  },
  {
    nome: "Anfiboli",
    categorie: ["Silicati"],
    relazione: "gruppo",
    formula: "A0-1B2C5T8O22(OH)2",
    composizione: "Inosilicati a doppia catena.",
    classe: "Silicati (inosilicati)",
    sistema: "Monoclino/Ortorombico",
    durezza: "5-6",
    densita: "2.9-3.4",
    colore: "Verde, nero, grigio",
    rarita: "comune",
    varieta: "Orneblenda, Tremolite, Actinolite"
  },
  {
    nome: "Orneblenda",
    categorie: ["Silicati"],
    formula: "(Ca,Na)2-3(Mg,Fe,Al)5(Al,Si)8O22(OH)2",
    composizione: "Anfibolo complesso tipico delle rocce metamorfiche e ignee.",
    classe: "Silicati (inosilicati)",
    sistema: "Monoclino",
    durezza: "5-6",
    densita: "3.0-3.4",
    colore: "Nero, verde scuro",
    rarita: "comune",
    gruppo: "Anfiboli"
  },
  {
    nome: "Tremolite",
    categorie: ["Silicati"],
    formula: "Ca2Mg5Si8O22(OH)2",
    composizione: "Anfibolo magnesiaco.",
    classe: "Silicati (inosilicati)",
    sistema: "Monoclino",
    durezza: "5-6",
    densita: "2.9-3.1",
    colore: "Bianco, verde pallido",
    rarita: "non comune",
    gruppo: "Anfiboli"
  },
  {
    nome: "Actinolite",
    categorie: ["Silicati"],
    formula: "Ca2(Mg,Fe)5Si8O22(OH)2",
    composizione: "Anfibolo ferro-magnesiaco.",
    classe: "Silicati (inosilicati)",
    sistema: "Monoclino",
    durezza: "5-6",
    densita: "3.0-3.2",
    colore: "Verde",
    rarita: "non comune",
    gruppo: "Anfiboli"
  },
  {
    nome: "Talco",
    categorie: ["Silicati"],
    formula: "Mg3Si4O10(OH)2",
    composizione: "Fillosilicato magnesiaco.",
    classe: "Silicati (fillosilicati)",
    sistema: "Monoclino/Triclino",
    durezza: 1,
    densita: "2.7-2.8",
    colore: "Bianco, verde pallido",
    rarita: "comune",
    usoTag: "industriale"
  },
  {
    nome: "Serpentino",
    categorie: ["Silicati"],
    formula: "(Mg,Fe)3Si2O5(OH)4",
    composizione: "Gruppo di fillosilicati idrati.",
    classe: "Silicati (fillosilicati)",
    sistema: "Monoclino/Ortorombico",
    durezza: "2.5-4",
    densita: "2.5-2.7",
    colore: "Verde, giallo-verde",
    rarita: "comune"
  },
  {
    nome: "Caolinite",
    categorie: ["Silicati"],
    formula: "Al2Si2O5(OH)4",
    composizione: "Fillosilicato alluminifero.",
    classe: "Silicati (fillosilicati)",
    sistema: "Triclino",
    durezza: "2-2.5",
    densita: "2.6-2.63",
    colore: "Bianco",
    rarita: "comune",
    usoTag: "industriale"
  },
  {
    nome: "Illite",
    categorie: ["Silicati"],
    formula: "K0.65Al2(Al0.65Si3.35)O10(OH)2",
    composizione: "Fillosilicato potassico delle argille.",
    classe: "Silicati (fillosilicati)",
    sistema: "Monoclino",
    durezza: "1-2",
    densita: "2.6-2.9",
    colore: "Grigio, verde pallido",
    rarita: "comune",
    usoTag: "industriale"
  },
  {
    nome: "Clorite",
    categorie: ["Silicati"],
    formula: "(Mg,Fe,Al)6(Si,Al)4O10(OH)8",
    composizione: "Gruppo di fillosilicati idrati.",
    classe: "Silicati (fillosilicati)",
    sistema: "Monoclino/Triclino",
    durezza: "2-2.5",
    densita: "2.6-3.3",
    colore: "Verde",
    rarita: "comune"
  },

  // Gemme importanti
  {
    nome: "Diamante",
    categorie: ["Gemme importanti", "Elementi nativi"],
    formula: "C",
    composizione: "Carbonio in reticolo covalente tetraedrico.",
    classe: "Elementi nativi",
    sistema: "Cubico",
    durezza: 10,
    densita: 3.52,
    colore: "Incolore, giallo, blu, rosa",
    lucentezza: "Adamantina",
    rarita: "raro",
    usoTag: "misto",
    curiosita: "Riferimento massimo della scala Mohs e ottimo conduttore termico."
  },
  {
    nome: "Acquamarina",
    categorie: ["Gemme importanti", "Silicati"],
    relazione: "varieta",
    gruppo: "Berillo",
    formula: "Be3Al2(Si6O18)",
    composizione: "Varieta blu-verde del berillo con Fe2+.",
    classe: "Silicati (ciclosilicati)",
    sistema: "Esagonale",
    durezza: "7.5-8",
    densita: "2.68-2.74",
    colore: "Azzurro, verde-azzurro",
    rarita: "raro",
    usoTag: "gemmologico"
  },
  {
    nome: "Morganite",
    categorie: ["Gemme importanti", "Silicati"],
    relazione: "varieta",
    gruppo: "Berillo",
    formula: "Be3Al2(Si6O18)",
    composizione: "Varieta rosa del berillo con Mn.",
    classe: "Silicati (ciclosilicati)",
    sistema: "Esagonale",
    durezza: "7.5-8",
    densita: "2.71-2.9",
    colore: "Rosa pesca",
    rarita: "raro",
    usoTag: "gemmologico"
  },
  {
    nome: "Eliodoro",
    categorie: ["Gemme importanti", "Silicati"],
    relazione: "varieta",
    gruppo: "Berillo",
    formula: "Be3Al2(Si6O18)",
    composizione: "Varieta gialla del berillo.",
    classe: "Silicati (ciclosilicati)",
    sistema: "Esagonale",
    durezza: "7.5-8",
    densita: "2.7-2.9",
    colore: "Giallo dorato",
    rarita: "raro",
    usoTag: "gemmologico"
  },
  {
    nome: "Smeraldo",
    categorie: ["Gemme importanti", "Silicati"],
    relazione: "varieta",
    gruppo: "Berillo",
    formula: "Be3Al2(Si6O18)",
    composizione: "Varieta verde del berillo con Cr e/o V.",
    classe: "Silicati (ciclosilicati)",
    sistema: "Esagonale",
    durezza: "7.5-8",
    densita: "2.67-2.78",
    colore: "Verde intenso",
    rarita: "raro",
    usoTag: "gemmologico"
  },
  {
    nome: "Rubino",
    categorie: ["Gemme importanti", "Ossidi e idrossidi"],
    relazione: "varieta",
    gruppo: "Corindone",
    formula: "Al2O3",
    composizione: "Varieta rossa del corindone con Cr.",
    classe: "Ossidi",
    sistema: "Trigonale",
    durezza: 9,
    densita: 4,
    colore: "Rosso",
    rarita: "raro",
    usoTag: "gemmologico"
  },
  {
    nome: "Zaffiro",
    categorie: ["Gemme importanti", "Ossidi e idrossidi"],
    relazione: "varieta",
    gruppo: "Corindone",
    formula: "Al2O3",
    composizione: "Varieta non rossa del corindone, spesso blu (Fe-Ti).",
    classe: "Ossidi",
    sistema: "Trigonale",
    durezza: 9,
    densita: "3.95-4.03",
    colore: "Blu, giallo, rosa, incolore",
    rarita: "raro",
    usoTag: "gemmologico"
  },
  {
    nome: "Tanzanite",
    categorie: ["Gemme importanti", "Silicati"],
    relazione: "varieta",
    gruppo: "Zoisite",
    formula: "Ca2Al3(SiO4)(Si2O7)O(OH)",
    composizione: "Varieta blu-violetta della zoisite.",
    classe: "Silicati (sorosilicati)",
    sistema: "Ortorombico",
    durezza: "6-6.5",
    densita: "3.3-3.4",
    colore: "Blu-viola",
    rarita: "raro",
    usoTag: "gemmologico"
  },
  {
    nome: "Iolite",
    categorie: ["Gemme importanti", "Silicati"],
    formula: "Mg2Al4Si5O18",
    composizione: "Cordierite gemmologica.",
    classe: "Silicati (ciclosilicati)",
    sistema: "Ortorombico",
    durezza: "7-7.5",
    densita: "2.58-2.66",
    colore: "Blu violetto",
    rarita: "raro",
    usoTag: "gemmologico"
  },
  {
    nome: "Peridoto",
    categorie: ["Gemme importanti", "Silicati"],
    relazione: "varieta",
    gruppo: "Olivina",
    formula: "(Mg,Fe)2SiO4",
    composizione: "Varieta gemmologica verde dell'olivina.",
    classe: "Silicati (nesosilicati)",
    sistema: "Ortorombico",
    durezza: "6.5-7",
    densita: "3.2-3.5",
    colore: "Verde oliva",
    rarita: "non comune",
    usoTag: "gemmologico"
  },
  {
    nome: "Spinello",
    categorie: ["Gemme importanti", "Ossidi e idrossidi"],
    formula: "MgAl2O4",
    composizione: "Ossido di magnesio e alluminio.",
    classe: "Ossidi",
    sistema: "Cubico",
    durezza: 8,
    densita: "3.5-4.1",
    colore: "Rosso, blu, nero, rosa",
    rarita: "raro",
    usoTag: "gemmologico"
  },
  {
    nome: "Zircone",
    categorie: ["Gemme importanti", "Silicati"],
    formula: "ZrSiO4",
    composizione: "Nesosilicato di zirconio.",
    classe: "Silicati (nesosilicati)",
    sistema: "Tetragonale",
    durezza: "6.5-7.5",
    densita: "4.6-4.7",
    colore: "Bruno, giallo, incolore, blu",
    rarita: "raro",
    usoTag: "gemmologico"
  },
  {
    nome: "Crisoberillo",
    categorie: ["Gemme importanti", "Ossidi e idrossidi"],
    formula: "BeAl2O4",
    composizione: "Ossido di berillio e alluminio.",
    classe: "Ossidi",
    sistema: "Ortorombico",
    durezza: "8.5",
    densita: "3.7-3.8",
    colore: "Giallo, verde, bruno",
    rarita: "raro",
    usoTag: "gemmologico"
  },
  {
    nome: "Alessandrite",
    categorie: ["Gemme importanti", "Ossidi e idrossidi"],
    relazione: "varieta",
    gruppo: "Crisoberillo",
    formula: "BeAl2O4",
    composizione: "Varieta cromifera con cambio di colore.",
    classe: "Ossidi",
    sistema: "Ortorombico",
    durezza: "8.5",
    densita: "3.7-3.8",
    colore: "Verde a luce diurna, rosso in luce calda",
    rarita: "rarissimo",
    usoTag: "gemmologico"
  },
  {
    nome: "Kunzite",
    categorie: ["Gemme importanti", "Silicati"],
    formula: "LiAlSi2O6",
    composizione: "Varieta rosa di spodumene.",
    classe: "Silicati (inosilicati)",
    sistema: "Monoclino",
    durezza: "6.5-7",
    densita: "3.1-3.2",
    colore: "Rosa-lilla",
    rarita: "raro",
    usoTag: "gemmologico"
  },
  {
    nome: "Rodonite",
    categorie: ["Gemme importanti", "Silicati"],
    formula: "MnSiO3",
    composizione: "Pirossenoide manganesifero.",
    classe: "Silicati (inosilicati)",
    sistema: "Triclino",
    durezza: "5.5-6.5",
    densita: "3.4-3.7",
    colore: "Rosa con venature nere",
    rarita: "non comune",
    usoTag: "decorativo"
  },
  {
    nome: "Rodocrosite",
    categorie: ["Carbonati", "Gemme importanti"],
    formula: "MnCO3",
    composizione: "Carbonato di manganese.",
    classe: "Carbonati",
    sistema: "Trigonale",
    durezza: "3.5-4",
    densita: "3.5-3.7",
    colore: "Rosa, rosso lampone",
    rarita: "raro",
    usoTag: "misto"
  },
  {
    nome: "Prehnite",
    categorie: ["Gemme importanti", "Silicati"],
    formula: "Ca2Al(AlSi3O10)(OH)2",
    composizione: "Silicato idrato di calcio e alluminio.",
    classe: "Silicati (fillosilicati)",
    sistema: "Ortorombico",
    durezza: "6-6.5",
    densita: "2.8-2.95",
    colore: "Verde chiaro",
    rarita: "non comune",
    usoTag: "gemmologico"
  },
  {
    nome: "Sugilite",
    categorie: ["Gemme importanti", "Silicati"],
    formula: "KNa2(Fe,Mn,Al)2Li3Si12O30",
    composizione: "Ciclosilicato complesso litinifero.",
    classe: "Silicati (ciclosilicati)",
    sistema: "Esagonale",
    durezza: "5.5-6.5",
    densita: "2.7-2.8",
    colore: "Viola intenso",
    rarita: "raro",
    usoTag: "gemmologico"
  },
  {
    nome: "Giada",
    categorie: ["Gemme importanti"],
    relazione: "gruppo",
    formula: "Gruppo ornamentale: giadeite + nefrite",
    composizione: "Termine commerciale che include due specie distinte.",
    sistema: "Monoclino",
    durezza: "6-7",
    densita: "2.9-3.4",
    colore: "Verde, bianco, lavanda",
    rarita: "raro",
    usoTag: "gemmologico",
    varieta: "Giadeite, Nefrite"
  },
  {
    nome: "Giadeite",
    categorie: ["Gemme importanti", "Silicati"],
    formula: "NaAlSi2O6",
    composizione: "Pirosseno sodico-alluminifero.",
    classe: "Silicati (inosilicati)",
    sistema: "Monoclino",
    durezza: "6.5-7",
    densita: "3.3-3.4",
    colore: "Verde smeraldo, bianco, lavanda",
    rarita: "raro",
    usoTag: "gemmologico",
    gruppo: "Giada"
  },
  {
    nome: "Nefrite",
    categorie: ["Gemme importanti", "Silicati"],
    formula: "Ca2(Mg,Fe)5Si8O22(OH)2",
    composizione: "Aggregato microfibroso di anfibolo.",
    classe: "Silicati (inosilicati)",
    sistema: "Monoclino",
    durezza: "6-6.5",
    densita: "2.9-3.1",
    colore: "Verde, crema, bianco",
    rarita: "raro",
    usoTag: "gemmologico",
    gruppo: "Giada"
  },
  {
    nome: "Pietra di luna",
    categorie: ["Gemme importanti", "Silicati"],
    relazione: "varieta",
    gruppo: "Feldspati",
    formula: "KAlSi3O8",
    composizione: "Varieta feldspatica con adularescenza.",
    classe: "Silicati (tettosilicati)",
    sistema: "Monoclino",
    durezza: "6-6.5",
    densita: "2.55-2.63",
    colore: "Bianco, grigio, pesca",
    rarita: "non comune",
    usoTag: "gemmologico"
  },
  {
    nome: "Labradorite",
    categorie: ["Gemme importanti", "Silicati"],
    formula: "(Ca,Na)(Al,Si)4O8",
    composizione: "Plagioclasio sodico-calcico.",
    classe: "Silicati (tettosilicati)",
    sistema: "Triclino",
    durezza: "6-6.5",
    densita: "2.68-2.72",
    colore: "Grigio con labradorescenza blu/verde",
    rarita: "non comune",
    usoTag: "gemmologico"
  },
  {
    nome: "Occhio di tigre",
    categorie: ["Gemme importanti", "Silicati"],
    relazione: "varieta",
    gruppo: "Quarzo",
    formula: "SiO2",
    composizione: "Quarzo fibroso con effetto chatoyant.",
    sistema: "Trigonale",
    durezza: 7,
    densita: 2.64,
    colore: "Bruno dorato",
    rarita: "non comune",
    usoTag: "gemmologico"
  },
  {
    nome: "Occhio di falco",
    categorie: ["Gemme importanti", "Silicati"],
    relazione: "varieta",
    gruppo: "Quarzo",
    formula: "SiO2",
    composizione: "Varieta blu-grigia dell'occhio di tigre.",
    sistema: "Trigonale",
    durezza: 7,
    densita: 2.64,
    colore: "Blu-grigio",
    rarita: "non comune",
    usoTag: "gemmologico"
  },
  {
    nome: "Amazonite",
    categorie: ["Gemme importanti", "Silicati"],
    relazione: "varieta",
    gruppo: "Feldspati",
    formula: "KAlSi3O8",
    composizione: "Varieta verde del microclino.",
    classe: "Silicati (tettosilicati)",
    sistema: "Triclino",
    durezza: "6-6.5",
    densita: "2.56-2.58",
    colore: "Verde acqua",
    rarita: "non comune",
    usoTag: "gemmologico"
  },
  {
    nome: "Larimar",
    categorie: ["Gemme importanti", "Silicati"],
    formula: "NaCa2Si3O8(OH)",
    composizione: "Varieta blu della pectolite.",
    classe: "Silicati (inosilicati)",
    sistema: "Triclino",
    durezza: "4.5-5",
    densita: "2.7-2.9",
    colore: "Azzurro cielo",
    rarita: "raro",
    usoTag: "gemmologico"
  },
  {
    nome: "Charoite",
    categorie: ["Gemme importanti", "Silicati"],
    formula: "K(Ca,Na)2Si4O10(OH,F)·H2O",
    composizione: "Silicato complesso a struttura fibrosa.",
    classe: "Silicati",
    sistema: "Monoclino",
    durezza: "5-6",
    densita: "2.5-2.8",
    colore: "Viola lavanda",
    rarita: "raro",
    usoTag: "gemmologico"
  },
  {
    nome: "Diaspro",
    categorie: ["Gemme importanti", "Silicati"],
    relazione: "varieta",
    gruppo: "Quarzo",
    formula: "SiO2",
    composizione: "Calcedonio opaco con impurita diffuse.",
    sistema: "Trigonale microcristallino",
    durezza: "6.5-7",
    densita: "2.58-2.9",
    colore: "Rosso, giallo, verde, multicolore",
    rarita: "comune",
    usoTag: "decorativo"
  },
  {
    nome: "Corniola",
    categorie: ["Gemme importanti", "Silicati"],
    relazione: "varieta",
    gruppo: "Calcedonio",
    formula: "SiO2",
    composizione: "Calcedonio rosso-arancio con ossidi di ferro.",
    sistema: "Trigonale microcristallino",
    durezza: "6.5-7",
    densita: "2.58-2.64",
    colore: "Arancio-rosso",
    rarita: "non comune",
    usoTag: "gemmologico"
  },
  {
    nome: "Crisoprasio",
    categorie: ["Gemme importanti", "Silicati"],
    relazione: "varieta",
    gruppo: "Calcedonio",
    formula: "SiO2",
    composizione: "Calcedonio verde con nichel.",
    sistema: "Trigonale microcristallino",
    durezza: "6.5-7",
    densita: "2.6-2.65",
    colore: "Verde mela",
    rarita: "raro",
    usoTag: "gemmologico"
  },
  {
    nome: "Turchese",
    categorie: ["Gemme importanti", "Fosfati"],
    formula: "CuAl6(PO4)4(OH)8·4H2O",
    composizione: "Fosfato idrato di rame e alluminio.",
    classe: "Fosfati",
    sistema: "Triclino",
    durezza: "5-6",
    densita: "2.6-2.9",
    colore: "Azzurro, verde-azzurro",
    rarita: "raro",
    usoTag: "gemmologico"
  },
  {
    nome: "Opale",
    categorie: ["Gemme importanti"],
    formula: "SiO2·nH2O",
    composizione: "Silice amorfa idrata (mineraloide).",
    classe: "Mineraloide",
    sistema: "Amorfo",
    durezza: "5-6.5",
    densita: "1.9-2.3",
    colore: "Bianco, nero, iridescente",
    rarita: "raro",
    usoTag: "gemmologico"
  },
  {
    nome: "Onice",
    categorie: ["Gemme importanti", "Silicati"],
    formula: "SiO2",
    composizione: "Calcedonio bandato a strati paralleli.",
    classe: "Silicati (tettosilicati)",
    sistema: "Trigonale microcristallino",
    durezza: "6.5-7",
    densita: "2.55-2.65",
    colore: "Nero, bianco, bruno",
    rarita: "non comune",
    usoTag: "gemmologico"
  },
  {
    nome: "Agata",
    categorie: ["Gemme importanti", "Silicati"],
    formula: "SiO2",
    composizione: "Calcedonio bandato concentrico.",
    classe: "Silicati (tettosilicati)",
    sistema: "Trigonale microcristallino",
    durezza: "6.5-7",
    densita: "2.58-2.64",
    colore: "Multicolore a bande",
    rarita: "non comune",
    usoTag: "gemmologico"
  },
  {
    nome: "Lapislazzuli",
    categorie: ["Gemme importanti", "Silicati"],
    formula: "Roccia con lazurite dominante",
    composizione: "Aggregato di lazurite, calcite, pirite.",
    classe: "Roccia ornamentale",
    sistema: "Aggregato policristallino",
    durezza: "5-5.5",
    densita: "2.7-2.9",
    colore: "Blu oltremare",
    rarita: "raro",
    usoTag: "gemmologico"
  },
  {
    nome: "Ossidiana",
    categorie: ["Gemme importanti"],
    formula: "Vetro vulcanico siliceo",
    composizione: "Materiale amorfo ricco in silice.",
    classe: "Vetro naturale",
    sistema: "Amorfo",
    durezza: "5-5.5",
    densita: "2.3-2.6",
    colore: "Nero, bruno, mogano",
    rarita: "non comune",
    usoTag: "decorativo"
  },
  {
    nome: "Malachite",
    categorie: ["Gemme importanti", "Carbonati"],
    formula: "Cu2CO3(OH)2",
    composizione: "Carbonato basico di rame.",
    classe: "Carbonati",
    sistema: "Monoclino",
    durezza: "3.5-4",
    densita: "3.6-4.0",
    colore: "Verde bandeggiato",
    rarita: "non comune",
    usoTag: "decorativo"
  },

  // Ossidi e idrossidi
  {
    nome: "Ematite",
    categorie: ["Ossidi e idrossidi"],
    formula: "Fe2O3",
    composizione: "Ossido ferrico.",
    sistema: "Trigonale",
    durezza: "5-6.5",
    densita: "4.9-5.3",
    colore: "Nero-acciaio, rosso bruno",
    rarita: "comune",
    usoTag: "industriale"
  },
  {
    nome: "Magnetite",
    categorie: ["Ossidi e idrossidi"],
    formula: "Fe3O4",
    composizione: "Ossido misto ferroso-ferrico.",
    sistema: "Cubico",
    durezza: "5.5-6.5",
    densita: "5.1-5.2",
    colore: "Nero",
    rarita: "comune",
    usoTag: "industriale"
  },
  {
    nome: "Corindone",
    categorie: ["Ossidi e idrossidi"],
    formula: "Al2O3",
    composizione: "Ossido di alluminio.",
    sistema: "Trigonale",
    durezza: 9,
    densita: "3.98-4.1",
    colore: "Incolore, blu, rosso, giallo",
    rarita: "non comune",
    usoTag: "misto",
    varieta: "Rubino e Zaffiro"
  },
  {
    nome: "Cromite",
    categorie: ["Ossidi e idrossidi"],
    formula: "FeCr2O4",
    composizione: "Ossido di ferro e cromo.",
    sistema: "Cubico",
    durezza: "5.5",
    densita: "4.5-4.8",
    colore: "Nero-bruno",
    rarita: "non comune",
    usoTag: "industriale"
  },
  {
    nome: "Ilmenite",
    categorie: ["Ossidi e idrossidi"],
    formula: "FeTiO3",
    composizione: "Ossido di ferro e titanio.",
    sistema: "Trigonale",
    durezza: "5-6",
    densita: "4.7-4.8",
    colore: "Nero",
    rarita: "non comune",
    usoTag: "industriale"
  },
  {
    nome: "Rutilo",
    categorie: ["Ossidi e idrossidi"],
    formula: "TiO2",
    composizione: "Ossido di titanio.",
    sistema: "Tetragonale",
    durezza: "6-6.5",
    densita: "4.2-4.3",
    colore: "Rosso-bruno, nero, giallo",
    rarita: "non comune",
    usoTag: "industriale"
  },
  {
    nome: "Goethite",
    categorie: ["Ossidi e idrossidi"],
    formula: "FeO(OH)",
    composizione: "Idrossido di ferro.",
    sistema: "Ortorombico",
    durezza: "5-5.5",
    densita: "3.3-4.3",
    colore: "Bruno-giallastro",
    rarita: "comune",
    usoTag: "industriale"
  },
  {
    nome: "Bauxite",
    categorie: ["Ossidi e idrossidi"],
    formula: "Miscela di Al(OH)3 e AlO(OH)",
    composizione: "Roccia residuale ricca in idrossidi di alluminio.",
    classe: "Idrossidi (aggregato)",
    sistema: "Aggregato",
    durezza: "1-3",
    densita: "2.0-2.6",
    colore: "Rosso, bruno, giallo",
    rarita: "comune",
    usoTag: "industriale"
  },

  // Solfuri
  {
    nome: "Pirite",
    categorie: ["Solfuri"],
    formula: "FeS2",
    composizione: "Disolfuro di ferro.",
    sistema: "Cubico",
    durezza: "6-6.5",
    densita: "4.9-5.2",
    colore: "Giallo ottone",
    rarita: "comune",
    usoTag: "industriale"
  },
  {
    nome: "Galena",
    categorie: ["Solfuri"],
    formula: "PbS",
    composizione: "Solfuro di piombo.",
    sistema: "Cubico",
    durezza: "2.5-2.75",
    densita: "7.4-7.6",
    colore: "Grigio piombo",
    rarita: "non comune",
    usoTag: "industriale"
  },
  {
    nome: "Sfalerite",
    categorie: ["Solfuri"],
    formula: "ZnS",
    composizione: "Solfuro di zinco.",
    sistema: "Cubico",
    durezza: "3.5-4",
    densita: "3.9-4.1",
    colore: "Bruno, giallo, nero",
    rarita: "non comune",
    usoTag: "industriale"
  },
  {
    nome: "Calcopirite",
    categorie: ["Solfuri"],
    formula: "CuFeS2",
    composizione: "Solfuro di rame e ferro.",
    sistema: "Tetragonale",
    durezza: "3.5-4",
    densita: "4.1-4.3",
    colore: "Giallo ottone",
    rarita: "non comune",
    usoTag: "industriale"
  },
  {
    nome: "Bornite",
    categorie: ["Solfuri"],
    formula: "Cu5FeS4",
    composizione: "Solfuro complesso di rame e ferro.",
    sistema: "Ortorombico",
    durezza: "3-3.25",
    densita: "4.9-5.3",
    colore: "Bruno-violaceo iridescente",
    rarita: "non comune",
    usoTag: "industriale"
  },
  {
    nome: "Cinnabro",
    categorie: ["Solfuri"],
    formula: "HgS",
    composizione: "Solfuro di mercurio.",
    sistema: "Trigonale",
    durezza: "2-2.5",
    densita: "8.0-8.2",
    colore: "Rosso cinabro",
    rarita: "raro",
    usoTag: "collezionistico"
  },
  {
    nome: "Realgar",
    categorie: ["Solfuri"],
    formula: "As4S4",
    composizione: "Solfuro di arsenico.",
    sistema: "Monoclino",
    durezza: "1.5-2",
    densita: "3.5-3.6",
    colore: "Rosso-arancio",
    rarita: "raro",
    usoTag: "collezionistico"
  },
  {
    nome: "Orpimento",
    categorie: ["Solfuri"],
    formula: "As2S3",
    composizione: "Solfuro di arsenico.",
    sistema: "Monoclino",
    durezza: "1.5-2",
    densita: "3.4-3.5",
    colore: "Giallo limone",
    rarita: "raro",
    usoTag: "collezionistico"
  },
  {
    nome: "Arsenopirite",
    categorie: ["Solfuri"],
    formula: "FeAsS",
    composizione: "Solfarseniuro di ferro.",
    sistema: "Monoclino",
    durezza: "5.5-6",
    densita: "5.9-6.2",
    colore: "Bianco acciaio",
    rarita: "non comune",
    usoTag: "industriale"
  },

  // Solfati
  {
    nome: "Gesso",
    categorie: ["Solfati"],
    formula: "CaSO4·2H2O",
    composizione: "Solfato idrato di calcio.",
    sistema: "Monoclino",
    durezza: 2,
    densita: 2.3,
    colore: "Bianco, grigio",
    rarita: "comune",
    usoTag: "industriale"
  },
  {
    nome: "Anidrite",
    categorie: ["Solfati"],
    formula: "CaSO4",
    composizione: "Solfato anidro di calcio.",
    sistema: "Ortorombico",
    durezza: "3-3.5",
    densita: "2.9-3.0",
    colore: "Bianco, grigio, bluastro",
    rarita: "comune",
    usoTag: "industriale"
  },
  {
    nome: "Barite",
    categorie: ["Solfati"],
    formula: "BaSO4",
    composizione: "Solfato di bario.",
    sistema: "Ortorombico",
    durezza: "3-3.5",
    densita: "4.3-4.6",
    colore: "Bianco, giallo, azzurro",
    rarita: "non comune",
    usoTag: "industriale"
  },
  {
    nome: "Celestina",
    categorie: ["Solfati"],
    formula: "SrSO4",
    composizione: "Solfato di stronzio.",
    sistema: "Ortorombico",
    durezza: "3-3.5",
    densita: "3.9-4.0",
    colore: "Azzurro chiaro",
    rarita: "non comune",
    usoTag: "industriale"
  },
  {
    nome: "Alunite",
    categorie: ["Solfati"],
    formula: "KAl3(SO4)2(OH)6",
    composizione: "Solfato basico di alluminio e potassio.",
    sistema: "Trigonale",
    durezza: "3.5-4",
    densita: "2.6-2.9",
    colore: "Bianco, giallastro",
    rarita: "non comune",
    usoTag: "industriale"
  },

  // Carbonati
  {
    nome: "Calcite",
    categorie: ["Carbonati"],
    formula: "CaCO3",
    composizione: "Carbonato di calcio.",
    sistema: "Trigonale",
    durezza: 3,
    densita: 2.71,
    colore: "Incolore, bianco, giallo",
    rarita: "comune",
    usoTag: "misto"
  },
  {
    nome: "Dolomite",
    categorie: ["Carbonati"],
    formula: "CaMg(CO3)2",
    composizione: "Carbonato doppio di calcio e magnesio.",
    sistema: "Trigonale",
    durezza: "3.5-4",
    densita: "2.84-2.9",
    colore: "Bianco, rosa, grigio",
    rarita: "comune",
    usoTag: "industriale"
  },
  {
    nome: "Magnesite",
    categorie: ["Carbonati"],
    formula: "MgCO3",
    composizione: "Carbonato di magnesio.",
    sistema: "Trigonale",
    durezza: "3.5-4.5",
    densita: "3.0-3.1",
    colore: "Bianco, grigio",
    rarita: "non comune",
    usoTag: "industriale"
  },
  {
    nome: "Siderite",
    categorie: ["Carbonati"],
    formula: "FeCO3",
    composizione: "Carbonato di ferro.",
    sistema: "Trigonale",
    durezza: "3.5-4.5",
    densita: "3.8-3.9",
    colore: "Bruno, giallo bruno",
    rarita: "non comune",
    usoTag: "industriale"
  },

  // Fosfati
  {
    nome: "Apatite",
    categorie: ["Fosfati"],
    formula: "Ca5(PO4)3(F,Cl,OH)",
    composizione: "Fosfato calcio-alogeno.",
    sistema: "Esagonale",
    durezza: 5,
    densita: "3.1-3.2",
    colore: "Verde, blu, giallo",
    rarita: "non comune",
    usoTag: "misto"
  },
  {
    nome: "Monazite",
    categorie: ["Fosfati"],
    formula: "(Ce,La,Nd,Th)PO4",
    composizione: "Fosfato di terre rare.",
    sistema: "Monoclino",
    durezza: "5-5.5",
    densita: "4.6-5.4",
    colore: "Bruno, giallo, rossastro",
    rarita: "raro",
    usoTag: "industriale"
  },
  {
    nome: "Vivianite",
    categorie: ["Fosfati"],
    formula: "Fe3(PO4)2·8H2O",
    composizione: "Fosfato idrato di ferro.",
    sistema: "Monoclino",
    durezza: "1.5-2",
    densita: "2.6-2.7",
    colore: "Blu-verde",
    rarita: "raro",
    usoTag: "collezionistico"
  },

  // Alogenuri
  {
    nome: "Halite",
    categorie: ["Alogenuri"],
    formula: "NaCl",
    composizione: "Cloruro di sodio.",
    sistema: "Cubico",
    durezza: "2-2.5",
    densita: 2.17,
    colore: "Incolore, bianco",
    rarita: "comune",
    usoTag: "industriale"
  },
  {
    nome: "Fluorite",
    categorie: ["Alogenuri", "Gemme importanti"],
    formula: "CaF2",
    composizione: "Fluoruro di calcio.",
    sistema: "Cubico",
    durezza: 4,
    densita: 3.18,
    colore: "Viola, verde, blu, incolore",
    rarita: "non comune",
    usoTag: "misto"
  },
  {
    nome: "Silvite",
    categorie: ["Alogenuri"],
    formula: "KCl",
    composizione: "Cloruro di potassio.",
    sistema: "Cubico",
    durezza: 2,
    densita: 1.99,
    colore: "Incolore, biancastro",
    rarita: "comune",
    usoTag: "industriale"
  },

  // Elementi nativi
  {
    nome: "Oro",
    categorie: ["Elementi nativi"],
    formula: "Au",
    composizione: "Elemento nativo aureo con possibili tracce di Ag/Cu.",
    sistema: "Cubico",
    durezza: "2.5-3",
    densita: 19.3,
    colore: "Giallo metallico",
    rarita: "raro",
    usoTag: "misto"
  },
  {
    nome: "Argento",
    categorie: ["Elementi nativi"],
    formula: "Ag",
    composizione: "Elemento nativo argenteo.",
    sistema: "Cubico",
    durezza: "2.5-3",
    densita: 10.5,
    colore: "Argenteo",
    rarita: "raro",
    usoTag: "misto"
  },
  {
    nome: "Rame",
    categorie: ["Elementi nativi"],
    formula: "Cu",
    composizione: "Elemento nativo rameico.",
    sistema: "Cubico",
    durezza: "2.5-3",
    densita: 8.96,
    colore: "Rosso metallico",
    rarita: "non comune",
    usoTag: "industriale"
  },
  {
    nome: "Platino",
    categorie: ["Elementi nativi"],
    formula: "Pt",
    composizione: "Elemento nativo platinoide.",
    sistema: "Cubico",
    durezza: "4-4.5",
    densita: 21.45,
    colore: "Grigio argenteo",
    rarita: "raro",
    usoTag: "misto"
  },
  {
    nome: "Zolfo",
    categorie: ["Elementi nativi"],
    formula: "S",
    composizione: "Elemento nativo in molecole S8.",
    sistema: "Ortorombico",
    durezza: "1.5-2.5",
    densita: "2.0-2.1",
    colore: "Giallo",
    rarita: "non comune",
    usoTag: "industriale"
  },
  {
    nome: "Grafite",
    categorie: ["Elementi nativi"],
    formula: "C",
    composizione: "Carbonio in struttura planare esagonale.",
    sistema: "Esagonale",
    durezza: "1-2",
    densita: "2.1-2.3",
    colore: "Grigio scuro, nero",
    rarita: "comune",
    usoTag: "industriale"
  },

  // Minerali rarissimi
  {
    nome: "Painite",
    categorie: ["Minerali rarissimi"],
    formula: "CaZrAl9O15(BO3)",
    composizione: "Borato complesso contenente zirconio e alluminio.",
    classe: "Borati",
    sistema: "Esagonale",
    durezza: 8,
    densita: "4.0-4.1",
    colore: "Rosso-bruno",
    rarita: "rarissimo",
    usoTag: "collezionistico"
  },
  {
    nome: "Benitoite",
    categorie: ["Minerali rarissimi", "Silicati"],
    formula: "BaTiSi3O9",
    composizione: "Silicato di bario e titanio.",
    classe: "Silicati (ciclosilicati)",
    sistema: "Trigonale",
    durezza: "6-6.5",
    densita: "3.6-3.7",
    colore: "Blu zaffiro",
    rarita: "rarissimo",
    usoTag: "collezionistico"
  },
  {
    nome: "Grandidierite",
    categorie: ["Minerali rarissimi", "Silicati"],
    formula: "(Mg,Fe)Al3(BO3)(SiO4)O2",
    composizione: "Borato-silicato di Mg, Fe e Al.",
    classe: "Sorosilicati",
    sistema: "Ortorombico",
    durezza: "7-7.5",
    densita: "2.8-3.0",
    colore: "Blu verde",
    rarita: "rarissimo",
    usoTag: "collezionistico"
  },
  {
    nome: "Musgravite",
    categorie: ["Minerali rarissimi"],
    formula: "(Mg,Fe,Zn)2BeAl6O12",
    composizione: "Ossido complesso del gruppo taaffeite.",
    classe: "Ossidi",
    sistema: "Trigonale",
    durezza: "8-8.5",
    densita: "3.6-3.7",
    colore: "Verde-grigio, porpora",
    rarita: "rarissimo",
    usoTag: "collezionistico"
  },
  {
    nome: "Taaffeite",
    categorie: ["Minerali rarissimi"],
    formula: "BeMg3Al8O16",
    composizione: "Ossido di Be-Mg-Al.",
    classe: "Ossidi",
    sistema: "Esagonale",
    durezza: "8-8.5",
    densita: "3.6-3.7",
    colore: "Lilla, rosa-grigio",
    rarita: "rarissimo",
    usoTag: "collezionistico"
  },
  {
    nome: "Jeremejevite",
    categorie: ["Minerali rarissimi"],
    formula: "Al6B5O15(F,OH)3",
    composizione: "Borato di alluminio fluorurato/idrossilato.",
    classe: "Borati",
    sistema: "Esagonale",
    durezza: "6.5-7.5",
    densita: "3.3-3.4",
    colore: "Azzurro pallido, incolore",
    rarita: "rarissimo",
    usoTag: "collezionistico"
  },
  {
    nome: "Eudialyte",
    categorie: ["Minerali rarissimi", "Silicati"],
    formula: "Na15Ca6(Fe,Mn)3Zr3Si(Si25O73)(O,OH,H2O)3(Cl,OH)2",
    composizione: "Silicato complesso sodico-calcico con zirconio.",
    classe: "Silicati (ciclosilicati)",
    sistema: "Trigonale",
    durezza: "5-6",
    densita: "2.8-3.1",
    colore: "Rosso lampone",
    rarita: "raro",
    usoTag: "collezionistico"
  },
  {
    nome: "Danburite",
    categorie: ["Minerali rarissimi", "Silicati"],
    formula: "CaB2(SiO4)2",
    composizione: "Boratosilicato di calcio.",
    classe: "Silicati (sorosilicati)",
    sistema: "Ortorombico",
    durezza: "7-7.5",
    densita: "3.0-3.1",
    colore: "Incolore, giallo, rosa",
    rarita: "raro",
    usoTag: "gemmologico"
  },
  {
    nome: "Petalite",
    categorie: ["Minerali rarissimi", "Silicati"],
    formula: "LiAlSi4O10",
    composizione: "Tettosilicato di litio e alluminio.",
    classe: "Silicati (tettosilicati)",
    sistema: "Monoclino",
    durezza: "6-6.5",
    densita: "2.4-2.5",
    colore: "Incolore, grigio, rosa",
    rarita: "raro",
    usoTag: "industriale"
  },
  {
    nome: "Scapolite",
    categorie: ["Minerali rarissimi", "Silicati"],
    formula: "(Na,Ca)4Al3(Al,Si)3Si6O24(Cl,CO3,SO4)",
    composizione: "Serie isomorfa marialite-meionite.",
    classe: "Silicati (tettosilicati)",
    sistema: "Tetragonale",
    durezza: "5-6",
    densita: "2.5-2.7",
    colore: "Giallo, viola, incolore",
    rarita: "raro",
    usoTag: "collezionistico"
  },
  {
    nome: "Kyanite",
    categorie: ["Minerali rarissimi", "Silicati"],
    formula: "Al2SiO5",
    composizione: "Polimorfo ad alta pressione dell'Al2SiO5.",
    classe: "Silicati (nesosilicati)",
    sistema: "Triclino",
    durezza: "4.5-7",
    densita: "3.5-3.7",
    colore: "Blu, grigio, verde",
    rarita: "raro",
    usoTag: "collezionistico"
  },
  {
    nome: "Andalusite",
    categorie: ["Minerali rarissimi", "Silicati"],
    formula: "Al2SiO5",
    composizione: "Polimorfo dell'Al2SiO5 stabile a P intermedie.",
    classe: "Silicati (nesosilicati)",
    sistema: "Ortorombico",
    durezza: "6.5-7.5",
    densita: "3.1-3.2",
    colore: "Bruno, verde, rosato",
    rarita: "raro",
    usoTag: "collezionistico"
  },
  {
    nome: "Sillimanite",
    categorie: ["Minerali rarissimi", "Silicati"],
    formula: "Al2SiO5",
    composizione: "Polimorfo ad alta temperatura dell'Al2SiO5.",
    classe: "Silicati (nesosilicati)",
    sistema: "Ortorombico",
    durezza: "6.5-7.5",
    densita: "3.2-3.3",
    colore: "Bianco, grigio, verde",
    rarita: "raro",
    usoTag: "industriale"
  }
];

function normalize(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function slugify(text) {
  return normalize(text)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function hashString(text) {
  let hash = 2166136261;
  for (const char of String(text)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function makeRng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function extractAverage(value, fallback = 0) {
  if (typeof value === "number") return value;
  const matches = String(value || "").match(/\d+(\.\d+)?/g);
  if (!matches || !matches.length) return fallback;
  const nums = matches.map(Number);
  return nums.reduce((sum, item) => sum + item, 0) / nums.length;
}

function formatValue(value, digits = 2) {
  if (typeof value === "number") {
    const fixed = Number(value.toFixed(digits));
    return String(fixed);
  }
  return String(value);
}

function rarityToIndex(rarity) {
  const value = normalize(rarity);
  if (value.includes("rarissim")) return 4;
  if (value.includes("raro")) return 3;
  if (value.includes("non comune")) return 2;
  return 1;
}

function useToIndex(useTag) {
  const value = normalize(useTag);
  if (value.includes("gemmologic")) return 4;
  if (value.includes("misto")) return 3;
  if (value.includes("collezionistic")) return 2.5;
  return 2;
}

function applyItalianAccents(value) {
  if (value === null || value === undefined) return "";

  let text = String(value)
    .replace(/Â·/g, "·")
    .replace(/Â³/g, "³");

  const replacements = [
    ["proprieta", "proprietà"],
    ["densita", "densità"],
    ["rarita", "rarità"],
    ["varieta", "varietà"],
    ["cavita", "cavità"],
    ["piu", "più"]
  ];

  replacements.forEach(([plain, accented]) => {
    const regex = new RegExp(`\\b${plain}\\b`, "gi");
    text = text.replace(regex, (match) => {
      if (match === match.toUpperCase()) return accented.toUpperCase();
      if (match[0] === match[0].toUpperCase()) {
        return accented.charAt(0).toUpperCase() + accented.slice(1);
      }
      return accented;
    });
  });

  text = text
    .replace(/\be utile\b/g, "è utile")
    .replace(/\bE utile\b/g, "È utile")
    .replace(/\be mostrata\b/g, "è mostrata")
    .replace(/\bE mostrata\b/g, "È mostrata")
    .replace(/\bnon e\b/g, "non è")
    .replace(/\bNon e\b/g, "Non è")
    .replace(/\be riferimento\b/g, "è riferimento")
    .replace(/\bE riferimento\b/g, "È riferimento");

  return text;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatChemicalFormula(value) {
  const source = applyItalianAccents(value || "");
  const escaped = escapeHtml(source);
  return escaped.replace(/([A-Za-z\)\]])(\d+(\.\d+)?)/g, "$1<sub>$2</sub>");
}

const SUBSCRIPT_DIGITS = {
  0: "₀",
  1: "₁",
  2: "₂",
  3: "₃",
  4: "₄",
  5: "₅",
  6: "₆",
  7: "₇",
  8: "₈",
  9: "₉"
};

function formatChemicalFormulaText(value) {
  const source = applyItalianAccents(value || "");
  return source.replace(/([A-Za-z\)\]])(\d+(\.\d+)?)/g, (_, atom, digits) => {
    const lowered = digits
      .split("")
      .map((char) => SUBSCRIPT_DIGITS[char] || char)
      .join("");
    return `${atom}${lowered}`;
  });
}

function formulaComplexity(formula) {
  const counts = parseFormulaToCounts(formula);
  const byCounts = Object.values(counts).reduce((sum, value) => sum + value, 0);
  if (byCounts > 0) return byCounts;
  return String(formula || "").replace(/[^A-Za-z]/g, "").length;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeQuizHint(hint, answerName) {
  let text = applyItalianAccents(hint || "");
  if (!text) return "";

  const answer = String(answerName || "").trim();
  if (answer) {
    const rx = new RegExp(`\\b${escapeRegExp(answer)}\\b\\s*[:\\-–—]?\\s*`, "gi");
    text = text.replace(rx, "");
  }

  return text
    .replace(/^\s*[:\-–—,;]+\s*/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function inferColorTag(colorText) {
  const text = normalize(colorText);
  if (text.includes("verde")) return "Verde";
  if (text.includes("blu") || text.includes("azzur")) return "Blu/Azzurro";
  if (text.includes("rosso") || text.includes("porpora")) return "Rosso";
  if (text.includes("viola") || text.includes("lilla")) return "Viola";
  if (text.includes("giallo") || text.includes("dorato")) return "Giallo";
  if (text.includes("nero")) return "Nero";
  if (text.includes("rosa")) return "Rosa";
  if (text.includes("argenteo")) return "Argenteo";
  if (text.includes("incolore") || text.includes("bianco")) return "Incolore/Bianco";
  if (text.includes("multicolore") || text.includes("iridescente")) return "Multicolore";
  return "Variabile";
}

function pickImageByColorTag(colorTag, seed) {
  const pools = {
    Verde: ["assets/images/smeraldo.jpg", "assets/images/malachite.jpg"],
    "Blu/Azzurro": ["assets/images/zaffiro.jpg", "assets/images/lapislazzuli.jpg", "assets/images/turchese.jpg"],
    Rosso: ["assets/images/rubino.jpg"],
    Viola: ["assets/images/ametista.jpg"],
    Giallo: ["assets/images/topazio.jpg", "assets/images/oro.jpg"],
    Nero: ["assets/images/onice.jpg", "assets/images/ossidiana.jpg"],
    Rosa: ["assets/images/smeraldo.jpg", "assets/images/agata.jpg"],
    Argenteo: ["assets/images/argento.jpg"],
    "Incolore/Bianco": ["assets/images/diamante.jpg", "assets/images/quartz.jpg"],
    Multicolore: ["assets/images/opale.jpg", "assets/images/agata.jpg"],
    Variabile: IMAGE_BANK
  };
  const selected = pools[colorTag] || IMAGE_BANK;
  return selected[seed % selected.length];
}

function canonicalClassName(value) {
  const text = normalize(value);
  if (text.includes("silicat")) return "Silicati";
  if (text.includes("ossid")) return "Ossidi";
  if (text.includes("solfur")) return "Solfuri";
  if (text.includes("solfat")) return "Solfati";
  if (text.includes("carbonat")) return "Carbonati";
  if (text.includes("fosfat")) return "Fosfati";
  if (text.includes("alogenur")) return "Alogenuri";
  if (text.includes("element")) return "Elementi nativi";
  if (text.includes("borat")) return "Borati";
  if (text.includes("mineraloide")) return "Mineraloidi";
  if (text.includes("vetro")) return "Vetri naturali";
  if (text.includes("roccia")) return "Rocce ornamentali";
  return String(value || "Classe non specificata").split("(")[0].trim();
}

function createSample(def) {
  const primaryCategory = def.categorie?.[0] || "Silicati";
  const primaryDefaults = CATEGORY_DEFAULTS[primaryCategory] || CATEGORY_DEFAULTS["Silicati"];
  const scientificCategory =
    primaryCategory === "Gemme importanti" && def.categorie?.[1]
      ? def.categorie[1]
      : primaryCategory;
  const defaults =
    CATEGORY_DEFAULTS[scientificCategory] ||
    primaryDefaults ||
    CATEGORY_DEFAULTS["Silicati"];
  const seed = hashString(def.nome);
  const colorTag = inferColorTag(def.colore || defaults.colore || "Variabile");
  const fallbackImage = pickImageByColorTag(colorTag, seed);
  const hardnessLabel = formatValue(def.durezza ?? defaults.durezza);
  const densityLabel = formatValue(def.densita ?? defaults.densita);
  const hardnessValue = extractAverage(def.durezza ?? defaults.durezza, 0);
  const densityValue = extractAverage(def.densita ?? defaults.densita, 0);
  const rawQuizHint = applyItalianAccents(
    def.quizHint ||
    `Formula ${def.formula || "variabile"}, classe ${canonicalClassName(
      def.classe || defaults.classe
    )}, durezza Mohs ${hardnessLabel}.`
  );

  return {
    id: slugify(def.nome),
    nome: def.nome,
    categorie: def.categorie || [primaryCategory],
    classe: applyItalianAccents(def.classe || defaults.classe),
    tipo:
      applyItalianAccents(def.tipo) ||
      (def.relazione === "gruppo"
        ? "Gruppo mineralogico"
        : def.relazione === "varieta"
          ? "Variet\u00e0 gemmologica"
          : "Specie mineralogica"),
    relazione: def.relazione || "specie",
    gruppo: def.gruppo || "",
    formula: applyItalianAccents(def.formula || "Composizione variabile"),
    composizione: applyItalianAccents(
      def.composizione || `Composizione prevalente: ${def.formula || "non specificata"}.`
    ),
    sistema: applyItalianAccents(def.sistema || defaults.sistema || "Variabile"),
    colore: applyItalianAccents(def.colore || defaults.colore || "Variabile"),
    lucentezza: applyItalianAccents(def.lucentezza || defaults.lucentezza),
    trasparenza: applyItalianAccents(def.trasparenza || defaults.trasparenza),
    durezza: hardnessValue,
    durezzaLabel: hardnessLabel,
    densita: densityValue,
    densitaLabel: densityLabel,
    sfaldatura: applyItalianAccents(def.sfaldatura || defaults.sfaldatura),
    frattura: applyItalianAccents(def.frattura || defaults.frattura),
    striscio: applyItalianAccents(def.striscio || defaults.striscio),
    origine: applyItalianAccents(def.origine || defaults.origine),
    ambiente: applyItalianAccents(def.ambiente || defaults.ambiente),
    ritrovamento: applyItalianAccents(def.ritrovamento || defaults.ritrovamento),
    usi: applyItalianAccents(
      def.usi || (primaryCategory === "Gemme importanti" ? primaryDefaults.usi : defaults.usi)
    ),
    curiosita: applyItalianAccents(
      def.curiosita ||
      `Il campione ${def.nome} e utile per la didattica di ${canonicalClassName(
        def.classe || defaults.classe
      ).toLowerCase()}.`
    ),
    varieta: applyItalianAccents(
      def.varieta ||
      (def.relazione === "varieta"
        ? `Varieta del gruppo/specie ${def.gruppo || "di riferimento"}.`
        : "Non specificate")
    ),
    simili: Array.isArray(def.simili) ? def.simili.map((item) => applyItalianAccents(item)) : [],
    rarita: applyItalianAccents(def.rarita || primaryDefaults.rarita || defaults.rarita),
    usoTag: def.usoTag || defaults.usoTag,
    colorTag,
    image: def.image || MINERAL_IMAGE_MAP[def.nome] || fallbackImage,
    fallbackImage,
    alt: def.alt || `Campione di ${def.nome}`,
    quizHint: sanitizeQuizHint(rawQuizHint, def.nome)
  };
}

const catalog = rawDefinitions.map(createSample);
const catalogById = new Map(catalog.map((sample) => [sample.id, sample]));
const catalogByName = new Map(catalog.map((sample) => [normalize(sample.nome), sample]));

for (const sample of catalog) {
  if (sample.simili.length) continue;
  const related = catalog
    .filter((candidate) => candidate.id !== sample.id && candidate.categorie.some((cat) => sample.categorie.includes(cat)))
    .slice(0, 4)
    .map((candidate) => candidate.nome);
  sample.simili = related;
}

const analyzedProperties = [
  "nome",
  "categoria",
  "classe",
  "formula",
  "composizione",
  "sistema",
  "durezza",
  "densita",
  "colore",
  "lucentezza",
  "trasparenza",
  "sfaldatura",
  "frattura",
  "striscio",
  "origine",
  "ambiente",
  "ritrovamento",
  "usi",
  "curiosita",
  "varieta",
  "simili"
];

const state = {
  query: "",
  category: "all",
  color: "all",
  rarity: "all",
  use: "all",
  hardnessMin: 0,
  letter: "all"
};

const cardContainer = document.getElementById("catalog-categories");
const metalCardGrid = document.getElementById("metal-cards-grid");
const comparisonBody = document.getElementById("comparison-body");
const galleryGrid = document.getElementById("gallery-grid");
const alphaIndex = document.getElementById("alpha-index");
const catalogMeta = document.getElementById("catalog-meta");

const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const colorFilter = document.getElementById("color-filter");
const rarityFilter = document.getElementById("rarity-filter");
const useFilter = document.getElementById("use-filter");
const hardnessFilter = document.getElementById("hardness-filter");
const hardnessOutput = document.getElementById("hardness-output");
const resetFilters = document.getElementById("reset-filters");
const activeFiltersBadge = document.getElementById("active-filters");

const detailModal = document.getElementById("detail-modal");
const modalContent = document.getElementById("modal-content");
const modalClose = document.getElementById("modal-close");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = document.getElementById("lightbox-close");

const statSamples = document.getElementById("stat-samples");
const statProperties = document.getElementById("stat-properties");
const statClasses = document.getElementById("stat-classes");

const quizQuestion = document.getElementById("quiz-question");
const quizOptions = document.getElementById("quiz-options");
const quizFeedback = document.getElementById("quiz-feedback");
const quizProgress = document.getElementById("quiz-progress");
const quizScore = document.getElementById("quiz-score");
const quizNext = document.getElementById("quiz-next");

const glossaryCloud = document.getElementById("glossary-cloud");
const glossaryDetail = document.getElementById("glossary-detail");

const compareA = document.getElementById("compare-a");
const compareB = document.getElementById("compare-b");
const compareC = document.getElementById("compare-c");
const compareCards = document.getElementById("compare-cards");
const compareBars = document.getElementById("compare-bars");

const depositsMap = document.getElementById("deposits-map");
const depositsDetail = document.getElementById("deposits-detail");

const quizState = {
  rounds: [],
  index: 0,
  score: 0,
  locked: false
};

const filterFields = {
  query: document.querySelector('.field[data-filter="query"]'),
  category: document.querySelector('.field[data-filter="category"]'),
  color: document.querySelector('.field[data-filter="color"]'),
  rarity: document.querySelector('.field[data-filter="rarity"]'),
  use: document.querySelector('.field[data-filter="use"]'),
  hardness: document.querySelector('.field[data-filter="hardness"]')
};

const compareState = {
  a: "",
  b: "",
  c: ""
};

let activeGlossaryKey = Object.keys(GLOSSARY_DATA)[0] || "";
let activeDepositId = "";
const depositsMapState = {
  map: null,
  markers: new Map(),
  ready: false
};

const techViewer = {
  renderer: null,
  scene: null,
  camera: null,
  frameId: 0,
  resizeHandler: null,
  rootGroup: null,
  cleanupFns: [],
  resizeObserver: null,
  initToken: 0
};

const cifStructureCache = new Map();
const easterEggState = {
  enabled: false,
  buffer: "",
  lastTriggerTs: 0
};

function updateHeroStats() {
  const classCount = new Set(catalog.map((sample) => canonicalClassName(sample.classe))).size;
  statSamples.textContent = String(catalog.length);
  statProperties.textContent = String(analyzedProperties.length);
  statClasses.textContent = String(classCount);
}

function getFilteredSamples(ignoreLetter = false) {
  return catalog.filter((sample) => {
    const queryMatch = normalize(sample.nome).includes(normalize(state.query));
    const categoryMatch =
      state.category === "all" || sample.categorie.includes(state.category);
    const colorMatch = state.color === "all" || sample.colorTag === state.color;
    const rarityMatch = state.rarity === "all" || sample.rarita === state.rarity;
    const useMatch = state.use === "all" || sample.usoTag === state.use;
    const hardnessMatch = sample.durezza >= state.hardnessMin;
    const letterMatch =
      ignoreLetter ||
      state.letter === "all" ||
      normalize(sample.nome).startsWith(normalize(state.letter));

    return queryMatch && categoryMatch && colorMatch && rarityMatch && useMatch && hardnessMatch && letterMatch;
  });
}

function sortByName(list) {
  return [...list].sort((a, b) => a.nome.localeCompare(b.nome, "it"));
}

function buildCard(sample) {
  return `
    <article class="mineral-card tilt-card" data-id="${sample.id}">
      <img src="${sample.image}" data-fallback="${sample.fallbackImage}" alt="${sample.alt}" loading="lazy">
      <div class="card-body">
        <div class="card-top">
          <h3>${sample.nome}</h3>
          <span class="chip">${sample.tipo}</span>
        </div>
        <p>${sample.composizione}</p>
        <ul class="card-facts">
          <li><strong>Categoria:</strong> ${sample.categorie[0]}</li>
          <li><strong>Formula:</strong> <span class="formula-inline">${formatChemicalFormula(sample.formula)}</span></li>
          <li><strong>Mohs:</strong> ${sample.durezzaLabel}</li>
          <li><strong>Densità:</strong> ${sample.densitaLabel} g/cm³</li>
        </ul>
        <button class="button button-ghost" type="button" data-open="${sample.id}">
          Apri scheda completa
        </button>
      </div>
    </article>
  `;
}

function bindImageFallbacks(root = document) {
  const images = root.querySelectorAll("img[data-fallback]");
  images.forEach((img) => {
    if (img.dataset.fallbackBound === "1") return;
    img.dataset.fallbackBound = "1";
    img.addEventListener(
      "error",
      () => {
        const fallback = img.dataset.fallback;
        if (!fallback) return;
        if (img.dataset.fallbackActive === "1") return;
        img.dataset.fallbackActive = "1";
        img.src = fallback;
      },
      { once: true }
    );
  });
}

function renderAlphaIndex(baseList) {
  const letters = [...new Set(baseList.map((sample) => normalize(sample.nome).charAt(0).toUpperCase()))].sort();
  const buttons = [
    `<button type="button" data-letter="all" class="${state.letter === "all" ? "active" : ""}">Tutte</button>`
  ];
  for (const letter of letters) {
    buttons.push(
      `<button type="button" data-letter="${letter}" class="${state.letter === letter ? "active" : ""}">${letter}</button>`
    );
  }
  alphaIndex.innerHTML = buttons.join("");
}

function renderCatalogSections() {
  updateFilterVisualState();

  const baseList = getFilteredSamples(true);
  renderAlphaIndex(baseList);

  const list = sortByName(getFilteredSamples(false));
  catalogMeta.textContent = `${list.length} campioni corrispondenti ai filtri correnti.`;

  if (!list.length) {
    cardContainer.innerHTML = `
      <article class="panel">
        <h3>Nessun risultato</h3>
        <p>Prova ad allentare i filtri o reimpostare la ricerca per visualizzare il catalogo.</p>
      </article>
    `;
    renderComparisonTable([]);
    return;
  }

  if (state.category !== "all") {
    cardContainer.innerHTML = `
      <details class="category-block" open>
        <summary>
          <span>${state.category}</span>
          <span class="category-count">${list.length}</span>
        </summary>
        <div class="category-inner">
          <div class="cards-grid">${list.map(buildCard).join("")}</div>
        </div>
      </details>
    `;
  } else {
    const grouped = new Map(CATEGORY_ORDER.map((category) => [category, []]));
    for (const sample of list) {
      const key = sample.categorie[0];
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(sample);
    }

    const sections = [];
    CATEGORY_ORDER.forEach((category, index) => {
      const samples = grouped.get(category) || [];
      if (!samples.length) return;
      sections.push(`
        <details class="category-block" ${index < 2 ? "open" : ""}>
          <summary>
            <span>${category}</span>
            <span class="category-count">${samples.length}</span>
          </summary>
          <div class="category-inner">
            <div class="cards-grid">${samples.map(buildCard).join("")}</div>
          </div>
        </details>
      `);
    });
    cardContainer.innerHTML = sections.join("");
  }

  bindImageFallbacks(cardContainer);
  attachTiltEffect();
  renderComparisonTable(list.filter((sample) => sample.relazione !== "gruppo"));
}

function updateHardnessTrack() {
  const min = Number(hardnessFilter.min || 0);
  const max = Number(hardnessFilter.max || 10);
  const value = Number(hardnessFilter.value || state.hardnessMin || 0);
  const safeRatio = max > min ? (value - min) / (max - min) : 0;
  const percent = Math.max(0, Math.min(100, safeRatio * 100));
  hardnessFilter.style.setProperty("--range-percent", `${percent}%`);
}

function updateFilterVisualState() {
  const activeMap = {
    query: state.query.trim().length > 0,
    category: state.category !== "all",
    color: state.color !== "all",
    rarity: state.rarity !== "all",
    use: state.use !== "all",
    hardness: state.hardnessMin > 0
  };

  Object.entries(filterFields).forEach(([key, node]) => {
    if (!node) return;
    node.classList.toggle("is-active", Boolean(activeMap[key]));
  });

  const activeCount = Object.values(activeMap).filter(Boolean).length;
  if (activeFiltersBadge) {
    activeFiltersBadge.innerHTML = `<strong>${activeCount}</strong> ${
      activeCount === 1 ? "filtro attivo" : "filtri attivi"
    }`;
    activeFiltersBadge.classList.toggle("has-active", activeCount > 0);
  }

  resetFilters.classList.toggle("has-active", activeCount > 0);
  updateHardnessTrack();
}

function renderMetalSection() {
  const metallic = sortByName(
    catalog.filter((sample) => sample.categorie[0] === "Elementi nativi")
  );
  metalCardGrid.innerHTML = metallic.map(buildCard).join("");
  bindImageFallbacks(metalCardGrid);
  attachTiltEffect();
}

function renderComparisonTable(list) {
  const rows = sortByName(list).slice(0, 70);
  comparisonBody.innerHTML = rows
    .map(
      (sample) => `
      <tr>
        <td class="comparison-col-name">${sample.nome}</td>
        <td class="comparison-col-category">${sample.categorie[0]}</td>
        <td class="comparison-col-formula"><span class="formula-inline">${formatChemicalFormula(sample.formula)}</span></td>
        <td class="comparison-col-mohs">${sample.durezzaLabel}</td>
        <td class="comparison-col-density">${sample.densitaLabel}</td>
        <td class="comparison-col-system">${sample.sistema}</td>
        <td class="comparison-col-color">${sample.colore}</td>
      </tr>
    `
    )
    .join("");
}

function getSelectableSamples() {
  return sortByName(catalog.filter((sample) => sample.relazione !== "gruppo"));
}

function setGlossaryTerm(termKey) {
  if (!glossaryDetail || !GLOSSARY_DATA[termKey]) return;
  activeGlossaryKey = termKey;
  const data = GLOSSARY_DATA[termKey];
  glossaryDetail.innerHTML = `
    <h3>${data.titolo}</h3>
    <p>${data.definizione}</p>
    <p><strong>Esempio didattico:</strong> ${data.esempio}</p>
  `;
  glossaryCloud?.querySelectorAll(".glossary-chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.term === termKey);
  });
}

function renderGlossary() {
  if (!glossaryCloud || !glossaryDetail) return;
  const chips = Object.entries(GLOSSARY_DATA)
    .map(
      ([key, data]) =>
        `<button class="glossary-chip ${key === activeGlossaryKey ? "active" : ""}" type="button" data-term="${key}">${data.titolo}</button>`
    )
    .join("");
  glossaryCloud.innerHTML = chips;
  setGlossaryTerm(activeGlossaryKey);
}

function applyInlineGlossaryTooltips() {
  document.querySelectorAll(".glossary-inline[data-term]").forEach((node) => {
    const key = node.dataset.term;
    const data = GLOSSARY_DATA[key];
    if (!data) return;
    const text = `${data.titolo}: ${data.definizione}`;
    node.title = text;
    node.setAttribute("aria-label", text);
  });
}

function fillAdvancedCompareSelects() {
  if (!compareA || !compareB || !compareC) return;
  const options = getSelectableSamples();
  const optionMarkup = options
    .map((sample) => `<option value="${sample.id}">${sample.nome}</option>`)
    .join("");

  compareA.innerHTML = optionMarkup;
  compareB.innerHTML = optionMarkup;
  compareC.innerHTML = `<option value="">Nessun terzo campione</option>${optionMarkup}`;

  const fallbackDefaults = ["Quarzo", "Diamante", "Pirite"]
    .map((name) => catalogByName.get(normalize(name)))
    .filter(Boolean)
    .map((sample) => sample.id);

  compareState.a = compareState.a || fallbackDefaults[0] || options[0]?.id || "";
  compareState.b = compareState.b || fallbackDefaults[1] || options[1]?.id || compareState.a;
  compareState.c = compareState.c || fallbackDefaults[2] || "";

  compareA.value = compareState.a;
  compareB.value = compareState.b;
  compareC.value = compareState.c;
}

function renderAdvancedCompare() {
  if (!compareCards || !compareBars) return;

  const ids = [compareState.a, compareState.b, compareState.c].filter(Boolean);
  const samples = [...new Map(ids.map((id) => [id, catalogById.get(id)])).values()].filter(Boolean);

  if (samples.length < 2) {
    compareCards.innerHTML = `
      <article class="panel">
        <h3>Seleziona almeno due campioni</h3>
        <p>Il confronto avanzato mostra differenze quantitative tra minerali e gemme.</p>
      </article>
    `;
    compareBars.innerHTML = "";
    return;
  }

  compareCards.innerHTML = samples
    .map(
      (sample, index) => `
      <article class="compare-card">
        <h3>${sample.nome}</h3>
        <p><span class="formula-inline">${formatChemicalFormula(sample.formula)}</span></p>
        <div class="compare-meta">
          <span><strong>Classe:</strong> ${canonicalClassName(sample.classe)}</span>
          <span><strong>Mohs:</strong> ${sample.durezzaLabel}</span>
          <span><strong>Densità:</strong> ${sample.densitaLabel} g/cm³</span>
          <span><strong>Rarità:</strong> ${sample.rarita}</span>
        </div>
        <button class="button button-ghost" type="button" data-open="${sample.id}">
          Apri scheda ${index + 1}
        </button>
      </article>
    `
    )
    .join("");

  compareBars.innerHTML = ADV_COMPARE_METRICS.map((metric) => {
    const bars = samples
      .map((sample, sampleIndex) => {
        const raw = Number(metric.get(sample));
        const safeRaw = Number.isFinite(raw) ? raw : 0;
        const percent = Math.max(2, Math.min(100, (safeRaw / metric.max) * 100));
        const colorClass = ["a", "b", "c"][sampleIndex] || "a";
        return `
          <div class="compare-bar-wrap">
            <span class="compare-bar-badge ${colorClass}">
              ${sample.nome}: ${formatValue(safeRaw, 2)}
            </span>
            <div class="compare-bar ${colorClass}" style="width:${percent}%"></div>
          </div>
        `;
      })
      .join("");

    return `
      <div class="compare-row">
        <div class="compare-label">${metric.label}</div>
        <div class="compare-track">${bars}</div>
      </div>
    `;
  }).join("");
}

function getActiveDepositRegion() {
  return DEPOSIT_REGIONS.find((entry) => entry.id === activeDepositId) || null;
}

function setMarkerActiveState() {
  depositsMapState.markers.forEach((entry, id) => {
    const active = id === activeDepositId;
    entry.marker.setStyle({
      radius: active ? 8 : 6,
      weight: active ? 2 : 1.5,
      color: active ? "#8ef8df" : "#9bd6ff",
      fillColor: active ? "#65d3c2" : "#66b7eb",
      fillOpacity: active ? 0.95 : 0.88
    });
    const tooltipEl = entry.marker.getTooltip()?.getElement();
    if (tooltipEl) {
      tooltipEl.classList.toggle("is-active", active);
    }
  });
}

function focusDepositRegion(id, withAnimation = true) {
  const region = DEPOSIT_REGIONS.find((entry) => entry.id === id);
  if (!region || !depositsMapState.map) return;

  activeDepositId = id;
  setMarkerActiveState();
  depositsMapState.map.flyTo([region.lat, region.lng], region.zoom || 12, {
    animate: withAnimation,
    duration: withAnimation ? 2.4 : 0,
    easeLinearity: 0.2
  });
  renderDepositDetail();
}

function resetDepositsView(withAnimation = true) {
  if (!depositsMapState.map) return;
  activeDepositId = "";
  setMarkerActiveState();
  depositsMapState.map.flyTo([17, 6], 2, {
    animate: withAnimation,
    duration: withAnimation ? 1.8 : 0,
    easeLinearity: 0.25
  });
  renderDepositDetail();
}

function initDepositsMap() {
  if (!depositsMap || depositsMapState.ready) return;

  if (typeof window.L === "undefined") {
    depositsMap.innerHTML = `<div class="deposits-map-fallback">Impossibile caricare la mappa satellitare.</div>`;
    return;
  }

  const map = window.L.map(depositsMap, {
    zoomControl: true,
    minZoom: 2,
    maxZoom: 18,
    worldCopyJump: true
  }).setView([17, 6], 2);

  window.L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution:
        '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics, and the GIS User Community'
    }
  ).addTo(map);

  DEPOSIT_REGIONS.forEach((region) => {
    const marker = window.L.circleMarker([region.lat, region.lng], {
      radius: 6,
      weight: 1.5,
      color: "#9bd6ff",
      fillColor: "#66b7eb",
      fillOpacity: 0.88
    }).addTo(map);

    marker.bindTooltip(region.nome, {
      permanent: true,
      direction: "top",
      offset: [0, -10],
      className: "deposits-tooltip"
    });

    marker.on("click", () => focusDepositRegion(region.id, true));
    depositsMapState.markers.set(region.id, { marker });
  });

  depositsMapState.map = map;
  depositsMapState.ready = true;
  setMarkerActiveState();
  renderDepositDetail();
}

function renderDepositsMap() {
  initDepositsMap();
  if (!depositsMapState.map) return;
  if (activeDepositId && !getActiveDepositRegion()) {
    activeDepositId = "";
  }

  if (activeDepositId) {
    focusDepositRegion(activeDepositId, false);
  } else {
    resetDepositsView(false);
  }
  setTimeout(() => depositsMapState.map?.invalidateSize(), 40);
}

function renderDepositDetail() {
  if (!depositsDetail) return;
  const region = DEPOSIT_REGIONS.find((entry) => entry.id === activeDepositId);
  if (!region) {
    depositsDetail.innerHTML = `
      <h3>Seleziona una località</h3>
      <p>Vista iniziale globale attiva. Clicca un marker sulla mappa per avviare lo zoom animato sul distretto selezionato.</p>
      <p class="catalog-meta">Dopo lo zoom puoi aprire la scheda tecnica di un minerale rappresentativo.</p>
    `;
    return;
  }

  const tags = region.minerali
    .map((name) => {
      const sample = catalogByName.get(normalize(name));
      if (!sample) return `<span class="chip">${name}</span>`;
      return `<button type="button" data-open="${sample.id}">${sample.nome}</button>`;
    })
    .join("");

  depositsDetail.innerHTML = `
    <h3>${region.nome}</h3>
    <p>${region.descrizione}</p>
    <p><strong>Minerali rappresentativi:</strong></p>
    <div class="deposits-tags">${tags}</div>
    <p class="catalog-meta">Clicca un marker sulla mappa e poi seleziona un minerale per aprire la scheda tecnica completa.</p>
    <button type="button" class="button button-ghost" data-map-reset>Vista globale</button>
  `;
}

function renderGallery() {
  const visibleCount = 32;
  const species = catalog.filter((sample) => sample.relazione !== "gruppo");
  const picks = [];
  const seen = new Set();

  // Copertura minima: almeno un campione per categoria principale.
  CATEGORY_ORDER.forEach((category) => {
    const options = species.filter((sample) => sample.categorie[0] === category);
    if (!options.length) return;
    const chosen = options[Math.floor(Math.random() * options.length)];
    seen.add(chosen.id);
    picks.push(chosen);
  });

  // Riempimento: campioni aggiuntivi casuali per evitare galleria sempre identica.
  const shuffled = shuffle(species);
  shuffled.forEach((sample) => {
    if (picks.length >= visibleCount) return;
    if (seen.has(sample.id)) return;
    seen.add(sample.id);
    picks.push(sample);
  });

  galleryGrid.innerHTML = picks
    .slice(0, visibleCount)
    .map(
      (sample) => `
      <figure class="gallery-item" data-lightbox="${sample.id}">
        <img src="${sample.image}" data-fallback="${sample.fallbackImage}" alt="${sample.alt}" loading="lazy">
        <figcaption>${sample.nome}</figcaption>
      </figure>
    `
    )
    .join("");
  bindImageFallbacks(galleryGrid);
}

function buildRelatedButtons(sample) {
  const related = sample.simili
    .map((name) => catalogByName.get(normalize(name)))
    .filter(Boolean)
    .slice(0, 8);

  if (!related.length) {
    return "<p>Nessun collegamento diretto disponibile per questo campione.</p>";
  }

  return `
    <div class="related-list">
      ${related
        .map(
          (entry) => `<button type="button" data-related="${entry.id}">${entry.nome}</button>`
        )
        .join("")}
    </div>
  `;
}

function openDetailModal(id) {
  const sample = catalogById.get(id);
  if (!sample) return;

  modalContent.innerHTML = `
    <article class="tech-modal">
      <header class="tech-header">
        <div>
          <p class="eyebrow">${sample.categorie.join(" · ")}</p>
          <h2 class="tech-title">${sample.nome}</h2>
          <p class="tech-subtitle">${sample.tipo}. Classe: ${sample.classe}.</p>
        </div>
        <div class="tech-badges">
          <span class="tech-badge">Mohs ${sample.durezzaLabel}</span>
          <span class="tech-badge">Densit\u00e0 ${sample.densitaLabel} g/cm\u00b3</span>
          <span class="tech-badge">Rarit\u00e0 ${sample.rarita}</span>
          <span class="tech-badge">Uso ${sample.usoTag}</span>
        </div>
      </header>
      <div class="tech-body">
        <section class="panel tech-visual">
          <div class="tech-viewer-stage">
            <canvas id="tech-canvas"></canvas>
          </div>
          <p class="tech-viewer-note">
            Modello atomico 3D interattivo: trascina per ruotare, usa la rotella per zoom, doppio click per ripristinare.
          </p>
          <div class="tech-legend" id="tech-legend" hidden></div>
          <figure class="tech-reference">
            <img src="${sample.image}" data-fallback="${sample.fallbackImage}" alt="${sample.alt}" loading="lazy">
            <figcaption>Riferimento fotografico ad alta leggibilit\u00e0 del campione.</figcaption>
          </figure>
        </section>
        <section class="tech-data">
          <article class="panel">
            <h3>Propriet\u00e0 fisico-chimiche</h3>
            <dl class="tech-grid">
              <div><dt>Formula</dt><dd class="formula-value">${formatChemicalFormula(sample.formula)}</dd></div>
              <div><dt>Composizione</dt><dd>${sample.composizione}</dd></div>
              <div><dt>Sistema cristallino</dt><dd>${sample.sistema}</dd></div>
              <div><dt>Durezza Mohs</dt><dd>${sample.durezzaLabel}</dd></div>
              <div><dt>Densit\u00e0</dt><dd>${sample.densitaLabel} g/cm\u00b3</dd></div>
              <div><dt>Colore</dt><dd>${sample.colore}</dd></div>
              <div><dt>Lucentezza</dt><dd>${sample.lucentezza}</dd></div>
              <div><dt>Trasparenza</dt><dd>${sample.trasparenza}</dd></div>
              <div><dt>Sfaldatura</dt><dd>${sample.sfaldatura}</dd></div>
              <div><dt>Frattura</dt><dd>${sample.frattura}</dd></div>
              <div><dt>Striscio</dt><dd>${sample.striscio}</dd></div>
              <div><dt>Relazione</dt><dd>${sample.relazione}${sample.gruppo ? ` (${sample.gruppo})` : ""}</dd></div>
            </dl>
          </article>
          <article class="panel tech-rich">
            <h3>Contesto geologico e applicazioni</h3>
            <p><strong>Origine/formazione:</strong> ${sample.origine}</p>
            <p><strong>Ambiente geologico:</strong> ${sample.ambiente}</p>
            <p><strong>Localit\u00e0 principali:</strong> ${sample.ritrovamento}</p>
            <p><strong>Usi:</strong> ${sample.usi}</p>
            <p><strong>Curiosit\u00e0:</strong> ${sample.curiosita}</p>
          </article>
          <article class="panel tech-rich">
            <h3>Variet\u00e0 e collegamenti</h3>
            <p><strong>Variet\u00e0 / sottotipi:</strong> ${sample.varieta}</p>
            <p><strong>Minerali simili:</strong></p>
            ${buildRelatedButtons(sample)}
          </article>
        </section>
      </div>
    </article>
  `;

  detailModal.showModal();
  bindImageFallbacks(modalContent);
  initTechViewer(sample);
}

function openLightbox(id) {
  const sample = catalogById.get(id);
  if (!sample) return;
  lightboxImage.src = sample.image;
  lightboxImage.dataset.fallback = sample.fallbackImage;
  lightboxImage.dataset.fallbackBound = "0";
  lightboxImage.dataset.fallbackActive = "0";
  bindImageFallbacks(lightbox);
  lightboxImage.alt = sample.alt;
  lightboxCaption.innerHTML = `${sample.nome} · <span class="formula-inline">${formatChemicalFormula(sample.formula)}</span> · Mohs ${sample.durezzaLabel} · ${sample.colore}`;
  lightbox.showModal();
}

const ELEMENT_STYLE = {
  H: { color: 0xf5f8ff, r: 0.18 },
  C: { color: 0x364453, r: 0.28 },
  O: { color: 0xff6b6b, r: 0.30 },
  Na: { color: 0x7fa5ff, r: 0.34 },
  Mg: { color: 0x7de1ff, r: 0.33 },
  Al: { color: 0xb9c7d9, r: 0.34 },
  Si: { color: 0xf4ca84, r: 0.35 },
  P: { color: 0xffb05a, r: 0.33 },
  S: { color: 0xffd95c, r: 0.33 },
  Cl: { color: 0x64d98f, r: 0.33 },
  K: { color: 0xc197ff, r: 0.38 },
  Ca: { color: 0x7deef0, r: 0.37 },
  Ti: { color: 0xaec2d8, r: 0.36 },
  Cr: { color: 0x66d483, r: 0.35 },
  Mn: { color: 0xe38ca9, r: 0.36 },
  Fe: { color: 0xd89064, r: 0.36 },
  Co: { color: 0x8ba8ff, r: 0.34 },
  Ni: { color: 0x8cb5a5, r: 0.34 },
  Cu: { color: 0xe99f7f, r: 0.37 },
  Zn: { color: 0xb8c9e0, r: 0.35 },
  As: { color: 0xa9b8c5, r: 0.36 },
  Sr: { color: 0x95d0ff, r: 0.39 },
  Zr: { color: 0x9dc0e4, r: 0.36 },
  Ba: { color: 0x89e2e0, r: 0.42 },
  La: { color: 0x8eb7ff, r: 0.40 },
  Ce: { color: 0x80b1ff, r: 0.40 },
  Nd: { color: 0x9c95ff, r: 0.40 },
  Th: { color: 0x6fc7ff, r: 0.41 },
  Hg: { color: 0xc3d7ea, r: 0.39 },
  Pb: { color: 0x788a9e, r: 0.42 },
  Be: { color: 0xa8efcf, r: 0.30 },
  Li: { color: 0xff9fd2, r: 0.31 },
  B: { color: 0x5fd1bb, r: 0.28 },
  Ag: { color: 0xd5dfec, r: 0.40 },
  Au: { color: 0xf4ca84, r: 0.42 },
  Pt: { color: 0xc9d9e8, r: 0.41 },
  F: { color: 0x7ee6c4, r: 0.30 }
};

const KNOWN_SYMBOLS = new Set(Object.keys(ELEMENT_STYLE));

function parseCifNumber(value) {
  const cleaned = String(value || "")
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\([^)]+\)/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeFractional(value) {
  const normalized = value % 1;
  return normalized < 0 ? normalized + 1 : normalized;
}

function parseSymmetryExpression(expr, x, y, z) {
  let source = String(expr || "").replace(/\s+/g, "");
  if (!source) return 0;
  if (!/^[+-]/.test(source)) source = `+${source}`;
  const parts = source.match(/[+-][^+-]+/g) || [];
  let total = 0;

  parts.forEach((part) => {
    const sign = part[0] === "-" ? -1 : 1;
    const term = part.slice(1);
    if (!term) return;

    if (term === "x") {
      total += sign * x;
      return;
    }
    if (term === "y") {
      total += sign * y;
      return;
    }
    if (term === "z") {
      total += sign * z;
      return;
    }

    if (term.includes("/")) {
      const [num, den] = term.split("/");
      const n = Number(num);
      const d = Number(den);
      if (Number.isFinite(n) && Number.isFinite(d) && d !== 0) {
        total += sign * (n / d);
      }
      return;
    }

    const numeric = Number(term);
    if (Number.isFinite(numeric)) {
      total += sign * numeric;
    }
  });

  return normalizeFractional(total);
}

function tokenizeCifRow(rowLine) {
  return String(rowLine || "").match(/'(?:[^']|'')*'|"(?:[^"]|"")*"|[^\s]+/g) || [];
}

function parseCifStructure(cifText) {
  const lines = String(cifText || "").split(/\r?\n/);
  const cell = {
    a: null,
    b: null,
    c: null,
    alpha: null,
    beta: null,
    gamma: null
  };
  const symOps = [];
  const atomSites = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line || line.startsWith("#")) continue;

    if (line.startsWith("_cell_length_a")) cell.a = parseCifNumber(line.split(/\s+/).slice(1).join(" "));
    if (line.startsWith("_cell_length_b")) cell.b = parseCifNumber(line.split(/\s+/).slice(1).join(" "));
    if (line.startsWith("_cell_length_c")) cell.c = parseCifNumber(line.split(/\s+/).slice(1).join(" "));
    if (line.startsWith("_cell_angle_alpha")) cell.alpha = parseCifNumber(line.split(/\s+/).slice(1).join(" "));
    if (line.startsWith("_cell_angle_beta")) cell.beta = parseCifNumber(line.split(/\s+/).slice(1).join(" "));
    if (line.startsWith("_cell_angle_gamma")) cell.gamma = parseCifNumber(line.split(/\s+/).slice(1).join(" "));

    if (line === "loop_") {
      const headers = [];
      let j = i + 1;
      while (j < lines.length) {
        const headerLine = lines[j].trim();
        if (headerLine.startsWith("_")) {
          headers.push(headerLine);
          j += 1;
          continue;
        }
        break;
      }
      if (!headers.length) continue;

      const rows = [];
      while (j < lines.length) {
        const rowLine = lines[j].trim();
        if (!rowLine || rowLine.startsWith("#")) {
          j += 1;
          continue;
        }
        if (rowLine === "loop_" || rowLine.startsWith("_") || rowLine.startsWith("data_")) {
          break;
        }
        rows.push({
          raw: rowLine,
          tokens: tokenizeCifRow(rowLine)
        });
        j += 1;
      }

      const symIdx = headers.findIndex(
        (header) =>
          header === "_space_group_symop_operation_xyz" ||
          header === "_symmetry_equiv_pos_as_xyz"
      );
      if (symIdx >= 0) {
        rows.forEach(({ raw, tokens }) => {
          let op = "";
          if (headers.length === 1) {
            op = raw;
          } else {
            op = tokens[symIdx] || "";
          }
          const normalized = String(op).replace(/^['"]|['"]$/g, "").trim();
          if (normalized) {
            symOps.push(normalized);
          }
        });
      }

      if (
        headers.includes("_atom_site_fract_x") &&
        headers.includes("_atom_site_fract_y") &&
        headers.includes("_atom_site_fract_z")
      ) {
        const ix = headers.indexOf("_atom_site_fract_x");
        const iy = headers.indexOf("_atom_site_fract_y");
        const iz = headers.indexOf("_atom_site_fract_z");
        const ilabel = headers.indexOf("_atom_site_label");
        const isymbol = headers.indexOf("_atom_site_type_symbol");

        rows.forEach(({ tokens }) => {
          const fx = parseCifNumber(tokens[ix]);
          const fy = parseCifNumber(tokens[iy]);
          const fz = parseCifNumber(tokens[iz]);
          if (![fx, fy, fz].every((value) => Number.isFinite(value))) return;

          const rawLabel = isymbol >= 0 ? tokens[isymbol] : tokens[ilabel];
          const symbolMatch = String(rawLabel || "").match(/[A-Z][a-z]?/);
          if (!symbolMatch) return;

          atomSites.push({
            symbol: symbolMatch[0],
            x: normalizeFractional(fx),
            y: normalizeFractional(fy),
            z: normalizeFractional(fz)
          });
        });
      }

      i = j - 1;
    }
  }

  if (!symOps.length) {
    symOps.push("x,y,z");
  }

  const completeCell = Object.values(cell).every((value) => Number.isFinite(value));
  if (!completeCell || !atomSites.length) {
    return null;
  }

  const expanded = [];
  const seen = new Set();
  atomSites.forEach((site) => {
    symOps.forEach((opRaw) => {
      const [ex, ey, ez] = opRaw.split(",").map((value) => value?.trim());
      if (!(ex && ey && ez)) return;
      const nx = parseSymmetryExpression(ex, site.x, site.y, site.z);
      const ny = parseSymmetryExpression(ey, site.x, site.y, site.z);
      const nz = parseSymmetryExpression(ez, site.x, site.y, site.z);
      if (![nx, ny, nz].every((value) => Number.isFinite(value))) return;
      const key = `${site.symbol}-${nx.toFixed(4)}-${ny.toFixed(4)}-${nz.toFixed(4)}`;
      if (seen.has(key)) return;
      seen.add(key);
      expanded.push({ symbol: site.symbol, x: nx, y: ny, z: nz });
    });
  });

  if (!expanded.length && atomSites.length) {
    atomSites.forEach((site) => {
      expanded.push({ symbol: site.symbol, x: site.x, y: site.y, z: site.z });
    });
  }

  return {
    cell,
    atoms: expanded
  };
}

function fractionalToCartesian(frac, cell) {
  const alpha = (cell.alpha * Math.PI) / 180;
  const beta = (cell.beta * Math.PI) / 180;
  const gamma = (cell.gamma * Math.PI) / 180;

  const ax = cell.a;
  const ay = 0;
  const az = 0;

  const bx = cell.b * Math.cos(gamma);
  const by = cell.b * Math.sin(gamma);
  const bz = 0;

  const cx = cell.c * Math.cos(beta);
  const cy = (cell.c * (Math.cos(alpha) - Math.cos(beta) * Math.cos(gamma))) / Math.sin(gamma);
  const cz = Math.sqrt(Math.max(cell.c * cell.c - cx * cx - cy * cy, 0));

  return new THREE.Vector3(
    frac.x * ax + frac.y * bx + frac.z * cx,
    frac.x * ay + frac.y * by + frac.z * cy,
    frac.x * az + frac.y * bz + frac.z * cz
  );
}

function hexColorIntToCss(value) {
  return `#${Number(value || 0).toString(16).padStart(6, "0")}`;
}

function buildLegendForElements(symbols) {
  const legend = document.getElementById("tech-legend");
  if (!legend) return;
  if (!symbols.length) {
    legend.hidden = true;
    legend.innerHTML = "";
    return;
  }

  const unique = [...new Set(symbols)];
  legend.hidden = false;
  legend.innerHTML = `
    <p class="tech-legend-title">Legenda atomi (struttura CIF)</p>
    <div class="tech-legend-list">
      ${unique
        .map((symbol) => {
          const style = ELEMENT_STYLE[symbol] || { color: 0x9bc7ec };
          return `
            <span class="tech-legend-item">
              <span class="tech-legend-dot" style="background:${hexColorIntToCss(style.color)}"></span>
              ${symbol}
            </span>
          `;
        })
        .join("")}
    </div>
  `;
}

function buildCellFrameGroup(cell, scale, center) {
  const alpha = (cell.alpha * Math.PI) / 180;
  const beta = (cell.beta * Math.PI) / 180;
  const gamma = (cell.gamma * Math.PI) / 180;

  const a = new THREE.Vector3(cell.a, 0, 0);
  const b = new THREE.Vector3(cell.b * Math.cos(gamma), cell.b * Math.sin(gamma), 0);
  const cx = cell.c * Math.cos(beta);
  const cy = (cell.c * (Math.cos(alpha) - Math.cos(beta) * Math.cos(gamma))) / Math.sin(gamma);
  const cz = Math.sqrt(Math.max(cell.c * cell.c - cx * cx - cy * cy, 0));
  const c = new THREE.Vector3(cx, cy, cz);

  const o = new THREE.Vector3(0, 0, 0).sub(center).multiplyScalar(scale);
  const va = a.clone().sub(center).multiplyScalar(scale);
  const vb = b.clone().sub(center).multiplyScalar(scale);
  const vc = c.clone().sub(center).multiplyScalar(scale);
  const vab = a.clone().add(b).sub(center).multiplyScalar(scale);
  const vac = a.clone().add(c).sub(center).multiplyScalar(scale);
  const vbc = b.clone().add(c).sub(center).multiplyScalar(scale);
  const vabc = a.clone().add(b).add(c).sub(center).multiplyScalar(scale);

  const edges = [
    [o, va], [o, vb], [o, vc],
    [va, vab], [va, vac],
    [vb, vab], [vb, vbc],
    [vc, vac], [vc, vbc],
    [vab, vabc], [vac, vabc], [vbc, vabc]
  ];

  const positions = [];
  edges.forEach(([p1, p2]) => {
    positions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({
    color: 0xa8d7ff,
    transparent: true,
    opacity: 0.35
  });
  return new THREE.LineSegments(geometry, material);
}

function buildCifCrystalGroup(structure, sample) {
  const group = new THREE.Group();
  const atomGroup = new THREE.Group();
  const bondGroup = new THREE.Group();

  const cartesianAtoms = structure.atoms.map((atom) => ({
    symbol: atom.symbol,
    style: ELEMENT_STYLE[atom.symbol] || { color: 0x9bc7ec, r: 0.32 },
    pos: fractionalToCartesian(atom, structure.cell)
  }));

  const bbox = new THREE.Box3();
  cartesianAtoms.forEach((entry) => bbox.expandByPoint(entry.pos));
  const center = bbox.getCenter(new THREE.Vector3());
  const size = bbox.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 1);
  const scale = 3.1 / maxDim;

  const materialCache = new Map();
  cartesianAtoms.forEach((entry) => {
    if (!materialCache.has(entry.symbol)) {
      materialCache.set(
        entry.symbol,
        new THREE.MeshPhysicalMaterial({
          color: entry.style.color,
          metalness: sample.categorie[0] === "Elementi nativi" ? 0.42 : 0.1,
          roughness: 0.26,
          clearcoat: 1,
          clearcoatRoughness: 0.1
        })
      );
    }
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.07 + entry.style.r * 0.16, 16, 16),
      materialCache.get(entry.symbol)
    );
    sphere.position.copy(entry.pos.clone().sub(center).multiplyScalar(scale));
    atomGroup.add(sphere);
  });

  const bondMaterial = new THREE.MeshStandardMaterial({
    color: 0x8fb7db,
    metalness: 0.18,
    roughness: 0.38,
    transparent: true,
    opacity: 0.72
  });

  const maxNeighborsPerAtom = 6;
  const neighborCount = new Array(cartesianAtoms.length).fill(0);
  let bondsAdded = 0;
  const maxBonds = Math.min(900, Math.max(260, cartesianAtoms.length * 6));

  for (let i = 0; i < cartesianAtoms.length; i += 1) {
    if (neighborCount[i] >= maxNeighborsPerAtom) continue;

    for (let j = i + 1; j < cartesianAtoms.length; j += 1) {
      if (neighborCount[j] >= maxNeighborsPerAtom) continue;
      if (bondsAdded >= maxBonds) break;

      const a = cartesianAtoms[i];
      const b = cartesianAtoms[j];
      const dist = a.pos.distanceTo(b.pos);
      if (dist < 0.65) continue;

      const radiusSum = (a.style.r || 0.32) + (b.style.r || 0.32);
      const maxDist = 0.42 + radiusSum * 2.0;
      if (dist > maxDist) continue;

      const pa = a.pos.clone().sub(center).multiplyScalar(scale);
      const pb = b.pos.clone().sub(center).multiplyScalar(scale);
      bondGroup.add(createBondMesh(pa, pb, bondMaterial));
      neighborCount[i] += 1;
      neighborCount[j] += 1;
      bondsAdded += 1;

      if (neighborCount[i] >= maxNeighborsPerAtom) break;
    }
  }

  const cellFrame = buildCellFrameGroup(structure.cell, scale, center);
  group.add(cellFrame);
  group.add(bondGroup);
  group.add(atomGroup);
  return group;
}

function getCifConfigForSample(sample) {
  const direct =
    MINERAL_CIF_SOURCES?.[sample.nome] ||
    MINERAL_CIF_SOURCES?.[normalize(sample.nome)] ||
    null;
  if (!direct) return null;

  if (typeof direct === "string") {
    return {
      path: direct,
      codId: "",
      representative: sample.nome,
      note: ""
    };
  }

  if (typeof direct === "object" && direct.path) {
    return {
      path: direct.path,
      codId: String(direct.codId || ""),
      representative: String(direct.representative || sample.nome),
      note: String(direct.note || "")
    };
  }

  return null;
}

async function loadCifStructureForSample(sample) {
  const config = getCifConfigForSample(sample);
  if (!config?.path) return null;
  if (cifStructureCache.has(config.path)) return cifStructureCache.get(config.path);

  const inlineText =
    typeof MINERAL_CIF_TEXTS?.[config.path] === "string"
      ? MINERAL_CIF_TEXTS[config.path]
      : null;

  const promise = (inlineText
    ? Promise.resolve(inlineText)
    : fetch(config.path).then((response) => {
        if (!response.ok) {
          throw new Error(`CIF non trovato: ${response.status}`);
        }
        return response.text();
      }))
    .then((text) => parseCifStructure(text))
    .catch(() => null);

  cifStructureCache.set(config.path, promise);
  return promise;
}

function parseNumberAt(text, start) {
  let i = start;
  let raw = "";
  while (i < text.length) {
    const ch = text[i];
    if ((ch >= "0" && ch <= "9") || ch === ".") {
      raw += ch;
      i += 1;
    } else {
      break;
    }
  }
  const parsed = raw ? Number(raw) : null;
  return {
    value: Number.isFinite(parsed) && parsed > 0 ? parsed : null,
    next: i
  };
}

function mergeCounts(target, source, factor = 1) {
  for (const [symbol, value] of Object.entries(source)) {
    if (!KNOWN_SYMBOLS.has(symbol)) continue;
    target[symbol] = (target[symbol] || 0) + value * factor;
  }
}

function parseFormulaChunk(chunk) {
  const stack = [{}];
  let i = 0;
  while (i < chunk.length) {
    const ch = chunk[i];

    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push({});
      i += 1;
      continue;
    }

    if (ch === ")" || ch === "]" || ch === "}") {
      const group = stack.pop() || {};
      const parsed = parseNumberAt(chunk, i + 1);
      mergeCounts(stack[stack.length - 1], group, parsed.value || 1);
      i = parsed.next;
      continue;
    }

    if (ch >= "A" && ch <= "Z") {
      let symbol = ch;
      if (i + 1 < chunk.length && chunk[i + 1] >= "a" && chunk[i + 1] <= "z") {
        symbol += chunk[i + 1];
        i += 1;
      }
      const parsed = parseNumberAt(chunk, i + 1);
      const value = parsed.value || 1;
      if (KNOWN_SYMBOLS.has(symbol)) {
        stack[stack.length - 1][symbol] = (stack[stack.length - 1][symbol] || 0) + value;
      }
      i = parsed.next;
      continue;
    }

    i += 1;
  }

  while (stack.length > 1) {
    const group = stack.pop();
    mergeCounts(stack[0], group, 1);
  }
  return stack[0];
}

function parseFormulaToCounts(formula) {
  const source = String(formula || "");
  const cleaned = source
    .replace(/\s+/g, "")
    .replace(/:/g, "")
    .replace(/·/g, "+")
    .replace(/\*/g, "+");

  if (!/[A-Z]/.test(cleaned)) return {};

  const chunks = cleaned.split(/[+/]/).filter(Boolean);
  const counts = {};
  chunks.forEach((chunk) => mergeCounts(counts, parseFormulaChunk(chunk), 1));
  return counts;
}

function getFallbackCounts(sample) {
  const byCategory = {
    Silicati: { Si: 6, O: 14, Al: 2, Mg: 2 },
    "Gemme importanti": { C: 2, Al: 2, O: 6, Si: 2 },
    "Ossidi e idrossidi": { Fe: 3, O: 4, Al: 2 },
    Solfuri: { Fe: 2, S: 4, Cu: 1 },
    Solfati: { S: 2, O: 8, Ca: 2 },
    Carbonati: { C: 2, O: 6, Ca: 2 },
    Fosfati: { P: 2, O: 8, Ca: 2 },
    Alogenuri: { Na: 2, Cl: 2, Ca: 1, F: 2 },
    "Elementi nativi": { Au: 2, Ag: 2, Cu: 1, C: 1 },
    "Minerali rarissimi": { Be: 1, Al: 3, Si: 4, O: 10 }
  };
  return byCategory[sample.categorie[0]] || { Si: 4, O: 8, Al: 2 };
}

function compositionToAtomList(sample) {
  const counts = parseFormulaToCounts(sample.formula);
  const atomCounts = Object.keys(counts).length ? counts : getFallbackCounts(sample);

  let items = Object.entries(atomCounts).map(([symbol, count]) => ({
    symbol,
    count: Math.max(1, Math.round(count))
  }));

  let total = items.reduce((sum, item) => sum + item.count, 0);
  const maxAtoms = sample.relazione === "gruppo" ? 58 : 46;

  if (total > maxAtoms) {
    const ratio = maxAtoms / total;
    items = items.map((item) => ({
      symbol: item.symbol,
      count: Math.max(1, Math.floor(item.count * ratio))
    }));
    total = items.reduce((sum, item) => sum + item.count, 0);
  }

  if (total < 18) {
    const scale = Math.min(3, Math.ceil(18 / Math.max(1, total)));
    items = items.map((item) => ({
      symbol: item.symbol,
      count: item.count * scale
    }));
  }

  return items.flatMap((item) =>
    Array.from({ length: item.count }, () => ({
      symbol: item.symbol,
      style: ELEMENT_STYLE[item.symbol] || { color: 0x9bc7ec, r: 0.32 }
    }))
  );
}

function createBondMesh(a, b, material) {
  const direction = new THREE.Vector3().subVectors(b, a);
  const length = direction.length();
  const midpoint = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, length, 10), material);
  mesh.position.copy(midpoint);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return mesh;
}

function buildAtomicStructureGroup(sample) {
  const seed = hashString(sample.id);
  const rng = makeRng(seed);
  const atoms = compositionToAtomList(sample);
  const group = new THREE.Group();
  const atomGroup = new THREE.Group();
  const bondGroup = new THREE.Group();
  const shellGroup = new THREE.Group();
  const points = [];

  const n = atoms.length;
  for (let i = 0; i < n; i += 1) {
    const t = (i + 0.5) / n;
    const phi = Math.acos(1 - 2 * t);
    const theta = (Math.PI * (3 - Math.sqrt(5))) * (i + 1) + rng() * 0.35;
    const radius = 0.55 + 1.65 * Math.pow(t, 0.62) + rng() * 0.17;
    points.push(
      new THREE.Vector3(
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi)
      )
    );
  }

  atoms.forEach((atom, index) => {
    const material = new THREE.MeshPhysicalMaterial({
      color: atom.style.color,
      metalness: sample.categorie[0] === "Elementi nativi" ? 0.52 : 0.14,
      roughness: 0.28,
      clearcoat: 1,
      clearcoatRoughness: 0.12
    });
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.12 + atom.style.r * 0.25, 18, 18),
      material
    );
    sphere.position.copy(points[index]);
    atomGroup.add(sphere);
  });

  const bondMaterial = new THREE.MeshStandardMaterial({
    color: 0x8cb2d6,
    metalness: 0.25,
    roughness: 0.4,
    transparent: true,
    opacity: 0.82
  });

  const edges = new Set();
  for (let i = 0; i < points.length; i += 1) {
    const distances = [];
    for (let j = 0; j < points.length; j += 1) {
      if (i === j) continue;
      distances.push({ j, d: points[i].distanceTo(points[j]) });
    }
    distances.sort((a, b) => a.d - b.d);

    let links = 0;
    for (const candidate of distances) {
      if (candidate.d > 1.35) break;
      const a = Math.min(i, candidate.j);
      const b = Math.max(i, candidate.j);
      const key = `${a}-${b}`;
      if (edges.has(key)) continue;
      edges.add(key);
      bondGroup.add(createBondMesh(points[a], points[b], bondMaterial));
      links += 1;
      if (links >= 3) break;
    }
  }

  const shellCount = sample.relazione === "gruppo" ? 3 : 2;
  for (let s = 0; s < shellCount; s += 1) {
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(1.35 + s * 0.55, 0.013, 12, 110),
      new THREE.MeshBasicMaterial({
        color: 0x9fd7ff,
        transparent: true,
        opacity: 0.22
      })
    );
    torus.rotation.x = Math.PI * (0.25 + s * 0.23);
    torus.rotation.y = Math.PI * (0.2 + s * 0.31);
    shellGroup.add(torus);
  }

  group.add(shellGroup);
  group.add(bondGroup);
  group.add(atomGroup);
  return group;
}

function disposeTechViewer() {
  if (techViewer.frameId) cancelAnimationFrame(techViewer.frameId);
  if (techViewer.resizeHandler) window.removeEventListener("resize", techViewer.resizeHandler);
  if (techViewer.resizeObserver) techViewer.resizeObserver.disconnect();
  if (Array.isArray(techViewer.cleanupFns)) {
    techViewer.cleanupFns.forEach((fn) => fn());
  }
  if (techViewer.renderer) techViewer.renderer.dispose();
  techViewer.renderer = null;
  techViewer.scene = null;
  techViewer.camera = null;
  techViewer.frameId = 0;
  techViewer.resizeHandler = null;
  techViewer.rootGroup = null;
  techViewer.cleanupFns = [];
  techViewer.resizeObserver = null;
}

async function initTechViewer(sample) {
  disposeTechViewer();
  techViewer.initToken += 1;
  const initToken = techViewer.initToken;

  const canvas = document.getElementById("tech-canvas");
  const stage = canvas?.parentElement;
  if (!canvas || !stage) return;

  const note = modalContent.querySelector(".tech-viewer-note");
  const legend = modalContent.querySelector("#tech-legend");
  if (legend) {
    legend.hidden = true;
    legend.innerHTML = "";
  }
  if (!window.THREE) {
    if (note) {
      note.textContent =
        "Modello atomico 3D non disponibile in questo ambiente: è mostrata la fotografia tecnica di riferimento.";
    }
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 1.1, 5.8);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));

  scene.add(new THREE.AmbientLight(0xffffff, 0.75));

  const keyLight = new THREE.DirectionalLight(0x9ee8ff, 1.1);
  keyLight.position.set(4.5, 3.8, 5.5);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0xffc68b, 0.95, 18);
  fillLight.position.set(-3.2, -1.2, 3.8);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x7fb4ff, 0.7);
  rimLight.position.set(-4.5, 2.2, -3.5);
  scene.add(rimLight);

  const cifConfig = getCifConfigForSample(sample);
  if (note && cifConfig?.path) {
    note.textContent = "Caricamento struttura cristallografica CIF...";
  }

  let rootGroup = buildAtomicStructureGroup(sample);
  let usedCif = false;
  let usedCifMeta = null;
  if (cifConfig?.path) {
    const cifStructure = await loadCifStructureForSample(sample);
    if (techViewer.initToken !== initToken) {
      renderer.dispose();
      return;
    }
    if (cifStructure) {
      rootGroup = buildCifCrystalGroup(cifStructure, sample);
      buildLegendForElements(cifStructure.atoms.map((atom) => atom.symbol));
      usedCif = true;
      usedCifMeta = cifConfig;
    }
  }
  scene.add(rootGroup);

  const interaction = {
    dragging: false,
    lastX: 0,
    lastY: 0,
    yaw: 0,
    pitch: 0.14,
    distance: 5.8,
    targetDistance: 5.8
  };

  const pedestal = new THREE.Mesh(
    new THREE.TorusGeometry(2.05, 0.08, 20, 120),
    new THREE.MeshStandardMaterial({
      color: 0x85a4bf,
      metalness: 0.35,
      roughness: 0.42,
      transparent: true,
      opacity: 0.38
    })
  );
  pedestal.rotation.x = Math.PI / 2;
  pedestal.position.y = -1.55;
  scene.add(pedestal);

  function resize() {
    const rect = stage.getBoundingClientRect();
    const width = Math.max(2, Math.floor(rect.width));
    const height = Math.max(2, Math.floor(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function onPointerDown(event) {
    interaction.dragging = true;
    interaction.lastX = event.clientX;
    interaction.lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    if (!interaction.dragging) return;
    const dx = event.clientX - interaction.lastX;
    const dy = event.clientY - interaction.lastY;
    interaction.lastX = event.clientX;
    interaction.lastY = event.clientY;
    interaction.yaw += dx * 0.0105;
    interaction.pitch = clamp(interaction.pitch + dy * 0.0075, -1.1, 1.1);
  }

  function onPointerUp(event) {
    interaction.dragging = false;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  }

  function onWheel(event) {
    event.preventDefault();
    interaction.targetDistance = clamp(
      interaction.targetDistance + event.deltaY * 0.008,
      2.25,
      9.2
    );
  }

  function onDoubleClick() {
    interaction.yaw = 0;
    interaction.pitch = 0.14;
    interaction.targetDistance = 5.8;
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("dblclick", onDoubleClick);

  function animate() {
    rootGroup.rotation.y += 0.0022;
    interaction.distance += (interaction.targetDistance - interaction.distance) * 0.1;
    camera.position.set(
      Math.sin(interaction.yaw) * interaction.distance * Math.cos(interaction.pitch),
      0.6 + Math.sin(interaction.pitch) * interaction.distance,
      Math.cos(interaction.yaw) * interaction.distance * Math.cos(interaction.pitch)
    );
    camera.lookAt(0, 0.15, 0);
    renderer.render(scene, camera);
    techViewer.frameId = requestAnimationFrame(animate);
  }

  resize();
  // Dopo showModal il layout puo stabilizzarsi un frame dopo:
  // forziamo piu resize per evitare canvas 0x0 e viewer vuoto.
  requestAnimationFrame(resize);
  setTimeout(resize, 80);
  setTimeout(resize, 220);
  animate();

  techViewer.resizeHandler = resize;
  techViewer.renderer = renderer;
  techViewer.scene = scene;
  techViewer.camera = camera;
  techViewer.rootGroup = rootGroup;
  techViewer.cleanupFns = [
    () => canvas.removeEventListener("pointerdown", onPointerDown),
    () => canvas.removeEventListener("pointermove", onPointerMove),
    () => canvas.removeEventListener("pointerup", onPointerUp),
    () => canvas.removeEventListener("pointercancel", onPointerUp),
    () => canvas.removeEventListener("wheel", onWheel),
    () => canvas.removeEventListener("dblclick", onDoubleClick)
  ];

  window.addEventListener("resize", resize);
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => resize());
    ro.observe(stage);
    techViewer.resizeObserver = ro;
  }

  if (note) {
    if (usedCif && usedCifMeta) {
      const codLabel = usedCifMeta.codId ? `COD ${usedCifMeta.codId}` : "CIF reale";
      const repLabel =
        usedCifMeta.representative && usedCifMeta.representative !== sample.nome
          ? ` (${usedCifMeta.representative})`
          : "";
      note.textContent =
        `${codLabel}${repLabel}: trascina per ruotare, usa la rotella per zoom, doppio click per ripristinare.`;
    } else if (cifConfig?.path) {
      note.textContent =
        "CIF disponibile ma non caricato correttamente: visualizzazione atomica procedurale di fallback.";
    } else {
      note.textContent =
        "Modello atomico 3D interattivo: trascina per ruotare, usa la rotella per zoom, doppio click per ripristinare.";
    }
  }
}

function attachTiltEffect() {
  const cards = document.querySelectorAll(".tilt-card");
  cards.forEach((card) => {
    if (card.dataset.tiltBound === "1") return;
    card.dataset.tiltBound = "1";

    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 10;
      const rotateX = (0.5 - y) * 8;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    });
  });
}

function activateReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // Con sezioni molto alte (es. catalogo esteso), un threshold alto
        // puo impedire l'attivazione: basta un'intersezione minima.
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.01,
      rootMargin: "0px 0px -8% 0px"
    }
  );
  document.querySelectorAll(".section-reveal").forEach((section) => observer.observe(section));
}

function addHeroParallax() {
  const hero = document.querySelector(".hero");
  const labels = document.querySelectorAll(".floating-label");
  if (!hero || !labels.length) return;

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    labels.forEach((label, index) => {
      const factor = (index + 1) * 7;
      label.style.transform = `translate3d(${x * factor}px, ${y * factor}px, 0)`;
    });
  });

  hero.addEventListener("mouseleave", () => {
    labels.forEach((label) => {
      label.style.transform = "translate3d(0, 0, 0)";
    });
  });
}

function initHeroCrystalScene() {
  if (!window.THREE) return;
  const canvas = document.getElementById("crystal-canvas");
  const container = canvas?.parentElement;
  if (!canvas || !container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.2, 7);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));

  const crystal = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.1, 1),
    new THREE.MeshPhysicalMaterial({
      color: 0x7ce5ff,
      roughness: 0.22,
      metalness: 0.1,
      transmission: 0.62,
      thickness: 1.4,
      clearcoat: 1,
      clearcoatRoughness: 0.2
    })
  );

  const wire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.16, 1),
    new THREE.MeshBasicMaterial({
      color: 0xffd5a5,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    })
  );

  scene.add(crystal, wire);
  scene.add(new THREE.AmbientLight(0xffffff, 0.85));

  const key = new THREE.DirectionalLight(0x9be8ff, 1.3);
  key.position.set(5, 4, 6);
  scene.add(key);

  const fill = new THREE.PointLight(0xffc581, 1, 18);
  fill.position.set(-3, -2, 5);
  scene.add(fill);

  const pointer = { x: 0, y: 0 };

  function resize() {
    const rect = container.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }

  function onPointerMove(event) {
    const hero = document.querySelector(".hero");
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  }

  function animate() {
    crystal.rotation.y += 0.004;
    crystal.rotation.x += 0.0014;
    wire.rotation.y -= 0.0026;
    wire.rotation.x += 0.0011;

    const targetY = pointer.x * 0.28;
    const targetX = pointer.y * 0.16;
    crystal.rotation.y += (targetY - crystal.rotation.y) * 0.015;
    crystal.rotation.x += (targetX - crystal.rotation.x) * 0.01;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  resize();
  animate();

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointerMove);
}

function randomFrom(list, limit = 1) {
  const copy = [...list];
  const picked = [];
  while (copy.length && picked.length < limit) {
    const idx = Math.floor(Math.random() * copy.length);
    picked.push(copy.splice(idx, 1)[0]);
  }
  return picked;
}

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuizRounds(total = 10) {
  const pool = catalog.filter((sample) => sample.relazione !== "gruppo");
  const base = randomFrom(pool, Math.min(total, pool.length));

  return base.map((target) => {
    const sameClass = pool.filter(
      (candidate) => candidate.id !== target.id && canonicalClassName(candidate.classe) === canonicalClassName(target.classe)
    );
    const distractorPool = sameClass.length >= 3 ? sameClass : pool.filter((candidate) => candidate.id !== target.id);
    const distractors = randomFrom(distractorPool, 3).map((item) => item.nome);
    const formulaText = formatChemicalFormulaText(target.formula);
    const questionHint =
      sanitizeQuizHint(target.quizHint, target.nome) ||
      `Formula ${formulaText}, classe ${canonicalClassName(target.classe)}, durezza Mohs ${target.durezzaLabel}.`;

    return {
      answer: target.nome,
      question: `Quale campione corrisponde alla descrizione: ${formatChemicalFormulaText(questionHint)}`,
      explanation: `${target.nome}: formula ${formulaText}, classe ${canonicalClassName(
        target.classe
      )}, durezza Mohs ${target.durezzaLabel}, sistema ${target.sistema}.`,
      options: shuffle([target.nome, ...distractors])
    };
  });
}

function getQuizEvaluation(score, total) {
  const percent = (score / total) * 100;
  if (percent >= 90) return "Eccellente: riconoscimento mineralogico molto accurato.";
  if (percent >= 75) return "Ottimo: buona padronanza dei criteri diagnostici.";
  if (percent >= 55) return "Discreto: rivedere relazioni tra classe, formula e durezza.";
  return "Da consolidare: consigliato ripassare proprietà fisiche e gruppi mineralogici.";
}

function renderQuizRound() {
  const round = quizState.rounds[quizState.index];
  if (!round) {
    const total = quizState.rounds.length;
    quizQuestion.textContent = `Quiz completato. Punteggio finale: ${quizState.score}/${total}.`;
    quizOptions.innerHTML = "";
    quizFeedback.className = "quiz-feedback";
    quizFeedback.textContent = getQuizEvaluation(quizState.score, total);
    quizProgress.textContent = `Domanda ${total}/${total}`;
    quizNext.textContent = "Ricomincia";
    quizNext.disabled = false;
    return;
  }

  quizState.locked = false;
  quizQuestion.textContent = round.question;
  quizOptions.innerHTML = round.options
    .map(
      (option) => `
      <button class="button button-ghost" type="button" data-option="${option}">
        ${option}
      </button>
    `
    )
    .join("");
  quizFeedback.className = "quiz-feedback";
  quizFeedback.textContent = "Seleziona la risposta e verifica subito il riscontro didattico.";
  quizProgress.textContent = `Domanda ${quizState.index + 1}/${quizState.rounds.length}`;
  quizScore.textContent = `Punteggio: ${quizState.score}`;
  quizNext.disabled = true;
  quizNext.textContent = "Prossima domanda";
}

function handleQuizAnswer(button) {
  if (quizState.locked) return;
  quizState.locked = true;

  const round = quizState.rounds[quizState.index];
  const selected = button.dataset.option;
  const correct = selected === round.answer;
  if (correct) quizState.score += 1;

  [...quizOptions.querySelectorAll("button")].forEach((item) => {
    const isCorrect = item.dataset.option === round.answer;
    item.classList.toggle("correct", isCorrect);
    item.classList.toggle("wrong", item === button && !isCorrect);
    item.disabled = true;
  });

  quizScore.textContent = `Punteggio: ${quizState.score}`;
  quizFeedback.className = `quiz-feedback ${correct ? "ok" : "ko"}`;
  quizFeedback.textContent = correct
    ? `Risposta corretta. ${round.explanation}`
    : `Risposta non corretta. Soluzione: ${round.answer}. ${round.explanation}`;
  quizNext.disabled = false;
}

function resetQuiz() {
  quizState.rounds = buildQuizRounds(10);
  quizState.index = 0;
  quizState.score = 0;
  renderQuizRound();
}

function triggerEasterEgg() {
  const pageUrl = new URL(EASTER_EGG_PAGE, window.location.href);
  pageUrl.searchParams.set("unlock", "2011");
  pageUrl.searchParams.set("t", String(Date.now()));
  const tab = window.open(pageUrl.href, "_blank");
  if (tab) {
    try {
      tab.focus();
    } catch (_) {
      // no-op
    }
  } else {
    window.alert("Pop-up bloccato: abilita i pop-up per aprire l'easter egg in una nuova scheda.");
  }
}

function initEasterEgg() {
  if (easterEggState.enabled) return;
  easterEggState.enabled = true;

  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === "Backspace") {
      easterEggState.buffer = easterEggState.buffer.slice(0, -1);
      return;
    }
    if (event.key.length !== 1) return;

    const char = event.key;
    if (!/[0-9!]/.test(char)) {
      easterEggState.buffer = "";
      return;
    }

    easterEggState.buffer = (easterEggState.buffer + char).slice(-EASTER_EGG_SEQUENCE.length);
    if (easterEggState.buffer !== EASTER_EGG_SEQUENCE) return;

    const now = Date.now();
    if (now - easterEggState.lastTriggerTs < 900) return;
    easterEggState.lastTriggerTs = now;
    easterEggState.buffer = "";
    triggerEasterEgg();
  });
}

function readVisitStore() {
  const fallback = { count: 0, entries: [] };
  try {
    const raw = localStorage.getItem(VISITS_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    const count = Number(parsed?.count);
    const entries = Array.isArray(parsed?.entries) ? parsed.entries : [];
    return {
      count: Number.isFinite(count) && count >= 0 ? count : entries.length,
      entries
    };
  } catch (_error) {
    return fallback;
  }
}

function registerVisit() {
  try {
    const now = new Date();
    const store = readVisitStore();
    store.count += 1;
    store.entries.push({
      index: store.count,
      timestamp: now.toISOString(),
      pagina: "index.html",
      titolo: document.title
    });

    if (store.entries.length > VISITS_LOG_LIMIT) {
      store.entries = store.entries.slice(store.entries.length - VISITS_LOG_LIMIT);
    }

    localStorage.setItem(VISITS_STORAGE_KEY, JSON.stringify(store));
  } catch (_error) {
    // localStorage può essere disabilitato: in tal caso non interrompiamo il sito.
  }
}

function fillSelectOptions() {
  categoryFilter.insertAdjacentHTML(
    "beforeend",
    CATEGORY_ORDER.map((category) => `<option value="${category}">${category}</option>`).join("")
  );

  const colors = [...new Set(catalog.map((sample) => sample.colorTag))]
    .sort((a, b) => a.localeCompare(b, "it"));
  colorFilter.insertAdjacentHTML(
    "beforeend",
    colors.map((color) => `<option value="${color}">${color}</option>`).join("")
  );
}

function setupEvents() {
  searchInput.addEventListener("input", () => {
    state.query = searchInput.value.trim();
    renderCatalogSections();
  });

  categoryFilter.addEventListener("change", () => {
    state.category = categoryFilter.value;
    renderCatalogSections();
  });

  colorFilter.addEventListener("change", () => {
    state.color = colorFilter.value;
    renderCatalogSections();
  });

  rarityFilter.addEventListener("change", () => {
    state.rarity = rarityFilter.value;
    renderCatalogSections();
  });

  useFilter.addEventListener("change", () => {
    state.use = useFilter.value;
    renderCatalogSections();
  });

  hardnessFilter.addEventListener("input", () => {
    state.hardnessMin = Number(hardnessFilter.value);
    hardnessOutput.textContent = String(state.hardnessMin);
    renderCatalogSections();
  });

  resetFilters.addEventListener("click", () => {
    state.query = "";
    state.category = "all";
    state.color = "all";
    state.rarity = "all";
    state.use = "all";
    state.hardnessMin = 0;
    state.letter = "all";

    searchInput.value = "";
    categoryFilter.value = "all";
    colorFilter.value = "all";
    rarityFilter.value = "all";
    useFilter.value = "all";
    hardnessFilter.value = "0";
    hardnessOutput.textContent = "0";
    renderCatalogSections();
  });

  alphaIndex.addEventListener("click", (event) => {
    const button = event.target.closest("[data-letter]");
    if (!button) return;
    state.letter = button.dataset.letter;
    renderCatalogSections();
  });

  glossaryCloud?.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-term]");
    if (!chip) return;
    setGlossaryTerm(chip.dataset.term);
  });

  const onAdvancedCompareChange = () => {
    compareState.a = compareA?.value || "";
    compareState.b = compareB?.value || "";
    compareState.c = compareC?.value || "";
    renderAdvancedCompare();
  };

  compareA?.addEventListener("change", onAdvancedCompareChange);
  compareB?.addEventListener("change", onAdvancedCompareChange);
  compareC?.addEventListener("change", onAdvancedCompareChange);

  compareCards?.addEventListener("click", (event) => {
    const target = event.target.closest("[data-open]");
    if (!target) return;
    openDetailModal(target.dataset.open);
  });

  let mapResizeRaf = 0;
  window.addEventListener("resize", () => {
    if (!depositsMapState.map) return;
    cancelAnimationFrame(mapResizeRaf);
    mapResizeRaf = requestAnimationFrame(() => {
      depositsMapState.map?.invalidateSize();
      if (activeDepositId) {
        focusDepositRegion(activeDepositId, false);
      }
    });
  });

  depositsDetail?.addEventListener("click", (event) => {
    const resetButton = event.target.closest("[data-map-reset]");
    if (resetButton) {
      resetDepositsView(true);
      return;
    }

    const target = event.target.closest("[data-open]");
    if (!target) return;
    openDetailModal(target.dataset.open);
  });

  cardContainer.addEventListener("click", (event) => {
    const target = event.target.closest("[data-open]");
    if (!target) return;
    openDetailModal(target.dataset.open);
  });

  metalCardGrid.addEventListener("click", (event) => {
    const target = event.target.closest("[data-open]");
    if (!target) return;
    openDetailModal(target.dataset.open);
  });

  modalContent.addEventListener("click", (event) => {
    const button = event.target.closest("[data-related]");
    if (!button) return;
    openDetailModal(button.dataset.related);
  });

  modalClose.addEventListener("click", () => detailModal.close());
  detailModal.addEventListener("click", (event) => {
    if (event.target === detailModal) detailModal.close();
  });
  detailModal.addEventListener("close", disposeTechViewer);

  galleryGrid.addEventListener("click", (event) => {
    const target = event.target.closest("[data-lightbox]");
    if (!target) return;
    openLightbox(target.dataset.lightbox);
  });

  lightboxClose.addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  quizOptions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-option]");
    if (!button) return;
    handleQuizAnswer(button);
  });

  quizNext.addEventListener("click", () => {
    if (quizState.index >= quizState.rounds.length) {
      resetQuiz();
      return;
    }
    quizState.index += 1;
    renderQuizRound();
  });
}

function init() {
  registerVisit();
  updateHeroStats();
  fillSelectOptions();
  fillAdvancedCompareSelects();
  renderGlossary();
  applyInlineGlossaryTooltips();
  updateHardnessTrack();
  renderCatalogSections();
  renderAdvancedCompare();
  renderDepositsMap();
  renderMetalSection();
  renderGallery();
  resetQuiz();
  initEasterEgg();
  setupEvents();
  activateReveal();
}

init();
