#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const SCRIPT_PATH = path.join(ROOT, "script.js");
const CIF_DIR = path.join(ROOT, "assets", "cif");
const MAP_PATH = path.join(CIF_DIR, "mineral-cif-map.js");
const REPORT_PATH = path.join(CIF_DIR, "mineral-cif-report.json");
const TEXTS_PATH = path.join(CIF_DIR, "mineral-cif-texts.js");

const NAME_ALIASES = {
  Acquamarina: "beryl",
  Ametista: "quartz",
  Agata: "quartz",
  Alessandrite: "chrysoberyl",
  Almandino: "almandine garnet",
  Amazonite: "microcline",
  Anfiboli: "hornblende",
  Anortite: "anorthite",
  Anidrite: "anhydrite",
  Argento: "silver",
  Arsenopirite: "arsenopyrite",
  Barite: "barite",
  Bauxite: "gibbsite",
  Benitoite: "benitoite",
  Berillo: "beryl",
  Bornite: "bornite",
  Calcopirite: "chalcopyrite",
  Caolinite: "kaolinite",
  Celestina: "celestine",
  Cinnabro: "cinnabar",
  Clorite: "clinochlore",
  Corindone: "corundum",
  Corniola: "quartz",
  Crisoberillo: "chrysoberyl",
  Crisoprasio: "quartz",
  Cromite: "chromite",
  Danburite: "danburite",
  Diaspro: "jasper",
  Dravite: "dravite",
  Elbaite: "elbaite",
  Eliodoro: "beryl",
  Ematite: "hematite",
  Epidoto: "epidote",
  Eudialyte: "eudialyte",
  Feldspati: "orthoclase",
  Fluorite: "fluorite",
  Gesso: "gypsum",
  Giada: "jadeite",
  Giadeite: "jadeite",
  Grafite: "graphite",
  Granati: "almandine garnet",
  Grandidierite: "grandidierite",
  Grossularia: "grossular garnet",
  Halite: "halite",
  Iolite: "cordierite",
  Kunzite: "spodumene",
  Lapislazzuli: "lazurite",
  Larimar: "pectolite",
  Magnesite: "magnesite",
  Magnetite: "magnetite",
  Malachite: "malachite",
  Morganite: "beryl",
  Musgravite: "musgravite",
  Nefelina: "nepheline",
  Nefrite: "actinolite",
  "Occhio di falco": "quartz",
  "Occhio di tigre": "quartz",
  Olivina: "forsterite",
  Onice: "quartz",
  Opale: "opal",
  Orneblenda: "hornblende",
  Oro: "gold",
  Orpimento: "orpiment",
  Ortoclasio: "orthoclase",
  Ossidiana: "quartz",
  Peridoto: "forsterite",
  "Pietra di luna": "adularia",
  Piropo: "pyrope garnet",
  Pirosseni: "pyroxene",
  Platino: "platinum",
  Pirite: "pyrite",
  Quarzo: "quartz",
  Rame: "copper",
  Rodocrosite: "rhodochrosite",
  Rodonite: "rhodonite",
  Rubino: "corundum",
  Rutilo: "rutile",
  Schorl: "schorl",
  Serpentino: "lizardite",
  Sfalerite: "sphalerite",
  Silvite: "sylvite",
  Smeraldo: "beryl",
  Spessartina: "spessartine garnet",
  Spinello: "spinel",
  Sugilite: "sugilite",
  Taaffeite: "taaffeite",
  Tanzanite: "zoisite",
  Topazio: "topaz",
  Topazolite: "andradite",
  Tormalina: "tourmaline",
  Turchese: "turquoise",
  Vivianite: "vivianite",
  Zaffiro: "corundum",
  Zircone: "zircon",
  Zolfo: "sulfur"
};

const NON_CRYSTALLINE_OR_AGGREGATE = new Set([
  "Bauxite",
  "Ossidiana",
  "Lapislazzuli",
  "Opale",
  "Giada",
  "Occhio di falco",
  "Occhio di tigre",
  "Diaspro",
  "Agata",
  "Onice",
  "Corniola",
  "Crisoprasio"
]);

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

function extractRawDefinitionsArray(source) {
  const marker = "const rawDefinitions = [";
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) {
    throw new Error("rawDefinitions non trovato in script.js");
  }

  const start = source.indexOf("[", markerIndex);
  if (start < 0) {
    throw new Error("Array rawDefinitions non valido");
  }

  let depth = 0;
  let inString = false;
  let stringQuote = "";
  let escaped = false;

  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === stringQuote) {
        inString = false;
      }
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      inString = true;
      stringQuote = ch;
      continue;
    }

    if (ch === "[") {
      depth += 1;
      continue;
    }
    if (ch === "]") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, i + 1);
      }
    }
  }

  throw new Error("Impossibile chiudere array rawDefinitions");
}

function readDefinitions() {
  const source = fs.readFileSync(SCRIPT_PATH, "utf8");
  const arrayText = extractRawDefinitionsArray(source);
  const context = {};
  const value = vm.runInNewContext(`(${arrayText})`, context);
  if (!Array.isArray(value)) {
    throw new Error("rawDefinitions non e un array");
  }
  return value;
}

function parseElements(formula) {
  const source = String(formula || "");
  const set = new Set();
  const matches = source.match(/[A-Z][a-z]?/g) || [];
  matches.forEach((token) => set.add(token));
  return set;
}

function scoreEntry(entry, sampleElements, index) {
  if (!sampleElements.size) return 1 / (index + 1);
  const entryElements = parseElements(entry.formula);
  let common = 0;
  sampleElements.forEach((symbol) => {
    if (entryElements.has(symbol)) common += 1;
  });
  const overlap = common / Math.max(1, sampleElements.size);
  return overlap * 10 + (1 / (index + 1));
}

function parseSearchEntries(html) {
  const entries = [];
  const regex = /<a href="(\d{7})\.html">[\s\S]*?<a href="\1\.cif">CIF<\/a><\/td><td>([^<]*)<\/td>/g;
  let match;
  while ((match = regex.exec(html))) {
    entries.push({
      id: match[1],
      formula: match[2].replace(/&nbsp;/g, " ").trim()
    });
  }
  return entries;
}

async function fetchSearchEntries(query, cache) {
  const key = normalize(query);
  if (cache.has(key)) return cache.get(key);

  const url = `https://www.crystallography.net/cod/result?text=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "codex-mineral-cif-builder/1.0"
    }
  });
  if (!response.ok) {
    throw new Error(`Errore ricerca COD (${response.status}) per: ${query}`);
  }
  const html = await response.text();
  const entries = parseSearchEntries(html);
  cache.set(key, entries);
  return entries;
}

async function ensureCifDownloaded(id, sampleName, filesCache) {
  if (filesCache.has(id)) return filesCache.get(id);

  const fileName = `${slugify(sampleName)}_${id}.cif`;
  const filePath = path.join(CIF_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    const url = `https://www.crystallography.net/cod/${id}.cif`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "codex-mineral-cif-builder/1.0"
      }
    });
    if (!response.ok) {
      throw new Error(`Download CIF fallito (${response.status}) per COD ${id}`);
    }
    const cifText = await response.text();
    fs.writeFileSync(filePath, cifText, "utf8");
  }

  const relative = `assets/cif/${fileName}`.replace(/\\/g, "/");
  filesCache.set(id, relative);
  return relative;
}

function chooseQuery(def) {
  const direct = NAME_ALIASES[def.nome];
  if (direct) return direct;
  if (def.relazione === "gruppo" && def.gruppo && NAME_ALIASES[def.gruppo]) {
    return NAME_ALIASES[def.gruppo];
  }
  if (def.relazione === "gruppo" && def.gruppo) {
    return def.gruppo;
  }
  return def.nome;
}

async function build() {
  if (!fs.existsSync(CIF_DIR)) {
    fs.mkdirSync(CIF_DIR, { recursive: true });
  }

  const definitions = readDefinitions();
  const searchCache = new Map();
  const fileByCodId = new Map();
  const map = {};
  const report = [];

  console.log(`Campioni trovati: ${definitions.length}`);

  for (let i = 0; i < definitions.length; i += 1) {
    const def = definitions[i];
    const name = def.nome;
    const query = chooseQuery(def);
    const sampleElements = parseElements(def.formula);
    const entry = {
      nome: name,
      query,
      codId: null,
      status: "pending",
      note: ""
    };

    try {
      const results = await fetchSearchEntries(query, searchCache);
      if (!results.length) {
        entry.status = "missing";
        entry.note = "Nessun risultato COD";
        report.push(entry);
        console.log(`[${i + 1}/${definitions.length}] ${name}: nessun CIF`);
        continue;
      }

      let best = null;
      results.forEach((candidate, index) => {
        const score = scoreEntry(candidate, sampleElements, index);
        if (!best || score > best.score) {
          best = { ...candidate, score };
        }
      });

      if (!best) {
        entry.status = "missing";
        entry.note = "Nessun candidato valido";
        report.push(entry);
        console.log(`[${i + 1}/${definitions.length}] ${name}: candidato CIF non trovato`);
        continue;
      }

      const cifPath = await ensureCifDownloaded(best.id, name, fileByCodId);
      const representative = query;
      const noteParts = [
        `COD ${best.id}`,
        NON_CRYSTALLINE_OR_AGGREGATE.has(name)
          ? "materiale aggregato/non pienamente cristallino: uso struttura rappresentativa"
          : "struttura CIF diretta"
      ];

      map[name] = {
        path: cifPath,
        codId: best.id,
        representative,
        note: noteParts.join(" · ")
      };

      entry.codId = best.id;
      entry.status = "ok";
      entry.note = map[name].note;
      report.push(entry);
      console.log(`[${i + 1}/${definitions.length}] ${name}: ${best.id}`);
      await new Promise((resolve) => setTimeout(resolve, 180));
    } catch (error) {
      entry.status = "error";
      entry.note = String(error.message || error);
      report.push(entry);
      console.log(`[${i + 1}/${definitions.length}] ${name}: errore -> ${entry.note}`);
      await new Promise((resolve) => setTimeout(resolve, 220));
    }
  }

  const mapFile = `window.MINERAL_CIF_MAP = ${JSON.stringify(map, null, 2)};\n`;
  fs.writeFileSync(MAP_PATH, mapFile, "utf8");
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");

  const uniquePaths = [...new Set(Object.values(map).map((entry) => entry.path))];
  const textMap = {};
  uniquePaths.forEach((relativePath) => {
    const absolute = path.join(ROOT, relativePath);
    if (!fs.existsSync(absolute)) return;
    textMap[relativePath] = fs.readFileSync(absolute, "utf8");
  });
  const textFile = `window.MINERAL_CIF_TEXTS = ${JSON.stringify(textMap)};\n`;
  fs.writeFileSync(TEXTS_PATH, textFile, "utf8");

  const ok = report.filter((item) => item.status === "ok").length;
  const missing = report.filter((item) => item.status === "missing").length;
  const error = report.filter((item) => item.status === "error").length;
  console.log(`\nCompletato. OK: ${ok}, missing: ${missing}, error: ${error}`);
  console.log(`Mappa: ${MAP_PATH}`);
  console.log(`Report: ${REPORT_PATH}`);
  console.log(`Testi CIF inline: ${TEXTS_PATH}`);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
