#!/usr/bin/env node
// Génère un fichier .ods (LibreOffice Calc) pour un morceau Troup'akada, au gabarit du sheetbook RoR
// officiel (voir scripts/lib/odsSheet.mjs pour les détails de style). Le fichier peut ensuite être :
//   - ouvert et peaufiné à la main dans LibreOffice Calc (flux de contribution officiel du RoR sheetbook)
//   - déposé dans une copie locale de https://github.com/rhythms-of-resistance/sheetbook et converti en
//     PDF avec https://github.com/rhythms-of-resistance/sheetbook-generator (nom de fichier sans espaces
//     recommandé pour correspondre à leurs conventions, ex. "techno.ods")
//
// Usage : node scripts/generate-tune-sheet.mjs <NomDuMorceau> [fichier-sortie.ods]
//   NomDuMorceau doit être une clé de src/troupakadaTunes.json (ex. "Techno", "Rap", "Olodum", "Samba Troupakada")

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildTuneSheet } from "./lib/odsSheet.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const dataPath = join(scriptDir, "..", "src", "troupakadaTunes.json");

const [, , tuneName, outputArg] = process.argv;
if (!tuneName) {
	console.error("Usage: node scripts/generate-tune-sheet.mjs <NomDuMorceau> [fichier-sortie.ods]");
	process.exit(1);
}

const data = JSON.parse(readFileSync(dataPath, "utf-8"));
const tune = data[tuneName];
if (!tune) {
	console.error(`Morceau "${tuneName}" introuvable dans ${dataPath}.`);
	console.error(`Morceaux disponibles : ${Object.keys(data).join(", ")}`);
	process.exit(1);
}

const outputPath = outputArg || `${tuneName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.ods`;

// Les associations geste ↔ morceau (src/maestrationSigns.ts) ne sont pas encore renseignées — voir
// CLAUDE.md. Une fois qu'elles le seront, cette ligne pourra être remplie sans changer odsSheet.mjs.
const maestrationLabel = undefined;

const zipBuffer = buildTuneSheet(tuneName, tune, maestrationLabel);
writeFileSync(outputPath, zipBuffer);

console.log(`Écrit ${outputPath} (${zipBuffer.length} octets).`);
