import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const NAMES_FILE = path.join(ROOT, "mineral_names.txt");
const OUT_MAP_FILE = path.join(ROOT, "assets", "mineral-image-map.js");
const CONCURRENCY = 2;
const THUMB_SIZE = 1200;
const FORCE_IMAGE_URLS = {
  Alunite: "https://upload.wikimedia.org/wikipedia/commons/4/46/Alunite_-_USGS_Mineral_Specimens_015.jpg",
  Caolinite: "https://upload.wikimedia.org/wikipedia/commons/4/40/Kaolinite_from_Twiggs_County_in_Georgia_in_USA.jpg",
  Clorite: "https://upload.wikimedia.org/wikipedia/commons/9/95/Quartz-Chlorite-Group-139575.jpg",
  Diamante: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Rough_Diamond.jpg",
  Gesso: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Gypse_Caresse.jpg",
  Illite: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Illite.jpg/1280px-Illite.jpg",
  Labradorite: "https://upload.wikimedia.org/wikipedia/commons/3/38/Labradorite_polie_3%28Madagascar%29.jpg",
  Magnesite: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Magnesite-121892.jpg",
  Orneblenda: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Hornblende-57342.jpg",
  "Pietra di luna": "https://commons.wikimedia.org/wiki/Special:FilePath/Raw%20Moonstone.jpg",
  Turchese: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Turquoise-40031.jpg"
};

const TITLE_OVERRIDES = {
  Acquamarina: ["Acquamarina", "Aquamarine"],
  Alessandrite: ["Alessandrite", "Alexandrite"],
  Amazonite: ["Amazonite"],
  Ametista: ["Ametista", "Amethyst"],
  Anfiboli: ["Amphibole"],
  Argento: ["Argento", "Silver"],
  Barite: ["Barite", "Baryte"],
  Berillo: ["Berillo", "Beryl"],
  Cinnabro: ["Cinnabro", "Cinnabar"],
  Corniola: ["Corniola", "Carnelian"],
  Crisoberillo: ["Crisoberillo", "Chrysoberyl"],
  Crisoprasio: ["Crisoprasio", "Chrysoprase"],
  Diamante: ["Diamante", "Diamond"],
  Feldspati: ["Feldspato", "Feldspar"],
  Fluorite: ["Fluorite", "Fluorite (mineral)"],
  Giada: ["Giada", "Jade"],
  Giadeite: ["Giadeite", "Jadeite"],
  Grafite: ["Grafite", "Graphite"],
  Granati: ["Granato", "Garnet"],
  Iolite: ["Iolite", "Cordierite"],
  Kyanite: ["Cianite", "Kyanite"],
  Lapislazzuli: ["Lapislazzuli", "Lapis lazuli"],
  Morganite: ["Morganite"],
  Nefrite: ["Nefrite", "Nephrite"],
  "Occhio di falco": ["Occhio di falco", "Hawk's eye"],
  "Occhio di tigre": ["Occhio di tigre", "Tiger's eye"],
  Onice: ["Onice", "Onyx"],
  Orneblenda: ["Orneblenda", "Hornblende"],
  Oro: ["Oro", "Gold"],
  Peridoto: ["Peridoto", "Peridot"],
  "Pietra di luna": ["Pietra di luna", "Moonstone (gemstone)"],
  Pirosseni: ["Pirosseno", "Pyroxene"],
  Quarzo: ["Quarzo", "Quartz"],
  Rodocrosite: ["Rodocrosite", "Rhodochrosite"],
  Rodonite: ["Rodonite", "Rhodonite"],
  Rubino: ["Rubino", "Ruby"],
  Sfalerite: ["Sfalerite", "Sphalerite"],
  Silvite: ["Silvite", "Sylvite"],
  Smeraldo: ["Smeraldo", "Emerald"],
  Spinello: ["Spinello", "Spinel"],
  Tanzanite: ["Tanzanite", "Zoisite (blue variety)"],
  Topazio: ["Topazio", "Topaz"],
  Turchese: ["Turchese", "Turquoise"],
  Zaffiro: ["Zaffiro", "Sapphire"]
};

function getCandidates(name) {
  const override = TITLE_OVERRIDES[name] || [];
  return [...new Set([name, ...override])];
}

async function fetchJson(url) {
  const maxAttempts = 4;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "MineraliParagemmeSchoolProject/1.0 (educational)"
        }
      });
      if (response.ok) return response.json();
      if (response.status === 429 || response.status === 503) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
        continue;
      }
      return null;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
    }
  }
  return null;
}

async function pageThumb(lang, title) {
  const url =
    `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages` +
    `&piprop=thumbnail&pithumbsize=${THUMB_SIZE}&titles=${encodeURIComponent(title)}&origin=*`;
  const data = await fetchJson(url);
  if (!data?.query?.pages) return null;
  const pages = Object.values(data.query.pages);
  for (const page of pages) {
    const src = page?.thumbnail?.source;
    if (src) return src;
  }
  return null;
}

async function searchTitles(lang, query) {
  const url =
    `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&list=search` +
    `&srsearch=${encodeURIComponent(query)}&srlimit=6&origin=*`;
  const data = await fetchJson(url);
  return data?.query?.search?.map((entry) => entry.title) || [];
}

async function commonsImage(query) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json" +
    "&generator=search&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|mime" +
    `&gsrsearch=${encodeURIComponent(query)}&origin=*`;
  const data = await fetchJson(url);
  const pages = Object.values(data?.query?.pages || {});
  for (const page of pages) {
    const info = page?.imageinfo?.[0];
    if (!info?.url) continue;
    if (!/\.svg($|\?)/i.test(info.url)) return info.url;
  }
  return null;
}

async function findBestImageUrl(name) {
  if (FORCE_IMAGE_URLS[name]) return FORCE_IMAGE_URLS[name];
  const candidates = getCandidates(name);

  for (const title of candidates) {
    const image = await pageThumb("it", title);
    if (image) return image;
  }
  for (const title of candidates) {
    const image = await pageThumb("en", title);
    if (image) return image;
  }

  for (const query of candidates) {
    const itTitles = await searchTitles("it", `${query} minerale`);
    for (const title of itTitles) {
      const image = await pageThumb("it", title);
      if (image) return image;
    }
  }

  for (const query of candidates) {
    const enTitles = await searchTitles("en", `${query} mineral`);
    for (const title of enTitles) {
      const image = await pageThumb("en", title);
      if (image) return image;
    }
  }

  for (const query of candidates) {
    const itTitles = await searchTitles("it", query);
    for (const title of itTitles) {
      const image = await pageThumb("it", title);
      if (image) return image;
    }
  }

  for (const query of candidates) {
    const enTitles = await searchTitles("en", query);
    for (const title of enTitles) {
      const image = await pageThumb("en", title);
      if (image) return image;
    }
  }

  for (const query of candidates) {
    const image = await commonsImage(`${query} mineral specimen crystal`);
    if (image) return image;
  }

  return null;
}

async function runPool(names, worker, concurrency) {
  const results = [];
  let index = 0;

  async function runWorker() {
    while (index < names.length) {
      const current = names[index];
      index += 1;
      const imageUrl = await worker(current);
      results.push({ name: current, imageUrl });
      console.log(`[${imageUrl ? "OK" : "MISS"}] ${current}`);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => runWorker()));
  return results;
}

async function main() {
  const namesRaw = await fs.readFile(NAMES_FILE, "utf8");
  const names = namesRaw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const results = await runPool(names, findBestImageUrl, CONCURRENCY);
  const map = {};

  results.forEach(({ name, imageUrl }) => {
    if (imageUrl) map[name] = imageUrl;
  });

  const misses = results.filter((item) => !item.imageUrl).map((item) => item.name);
  const js = `window.MINERAL_IMAGE_MAP = ${JSON.stringify(map, null, 2)};\n`;
  await fs.writeFile(OUT_MAP_FILE, js, "utf8");

  console.log("");
  console.log(`Immagini risolte: ${Object.keys(map).length}/${names.length}`);
  if (misses.length) {
    console.log("Minerali senza immagine trovata:");
    misses.forEach((name) => console.log(`- ${name}`));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
