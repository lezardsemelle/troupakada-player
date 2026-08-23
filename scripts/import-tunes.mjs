#!/usr/bin/env node
// Fusionne un export "Données brutes (non compressées)" du bouton Partager du player dans
// src/troupakadaTunes.json — le fichier qui sert de source de vérité pour les morceaux composés
// par Troup'akada (voir src/troupakadaTunes.ts). Traduit au passage les anciens noms d'instruments
// (ls/ms/hs/sn/sh) si le fichier en contient encore (voir CLAUDE.md, Modification 3).
//
// Usage : node scripts/import-tunes.mjs export.json
//
// Pour chaque morceau présent dans l'export :
//   - s'il n'existe pas encore dans troupakadaTunes.json, il est ajouté en entier
//   - s'il existe déjà, ses patterns sont fusionnés un par un (un pattern du même nom est
//     remplacé, les autres patterns existants du morceau sont conservés tels quels)
// Les morceaux déjà présents dans troupakadaTunes.json mais absents de l'export ne sont pas touchés.
//
// Voir aussi : le bouton "Enregistrer" dans Composer (vite.config.ts, plugin troupakadaSavePlugin)
// fait la même fusion directement depuis le navigateur, sans passer par ce script.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mergeTuneData } from "./lib/tuneData.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const dataPath = join(scriptDir, "..", "src", "troupakadaTunes.json");

const [, , inputPath] = process.argv;
if (!inputPath) {
	console.error("Usage: node scripts/import-tunes.mjs <export.json>");
	process.exit(1);
}

const exported = JSON.parse(readFileSync(inputPath, "utf-8"));
const current = JSON.parse(readFileSync(dataPath, "utf-8"));

const { data, addedTunes, updatedPatterns, errors } = mergeTuneData(current, exported);

if (errors.length > 0) {
	console.error("Import annulé, clés inattendues trouvées (fichier non modifié) :");
	for (const message of errors)
		console.error(`  - ${message}`);
	process.exit(1);
}

writeFileSync(dataPath, JSON.stringify(data, null, "\t") + "\n");

if (addedTunes.length > 0)
	console.log(`Nouveaux morceaux : ${addedTunes.join(", ")}`);
if (updatedPatterns.length > 0)
	console.log(`Patterns mis à jour : ${updatedPatterns.join(", ")}`);
if (addedTunes.length === 0 && updatedPatterns.length === 0)
	console.log("Rien à importer.");

console.log("\n✅ src/troupakadaTunes.json mis à jour. Recharge la page (yarn dev-server déjà lancé) pour voir le résultat.");
