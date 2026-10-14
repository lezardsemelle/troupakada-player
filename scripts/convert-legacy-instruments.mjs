#!/usr/bin/env node
// Convertit un export JSON "Données brutes" du player qui utilise les anciens identifiants d'instruments
// du player (lg/mg/hg/ca/ch, utilisés jusqu'au 2026-10-14) vers les identifiants ror-player
// (ls/ms/hs/sn/sh), revenus pour pouvoir importer les morceaux RoR sans conversion (voir CLAUDE.md,
// Modification 3). Rarement utile : import-tunes.mjs, le bouton Importer et le chargement des
// brouillons font déjà cette conversion automatiquement.
//
// Usage : node scripts/convert-legacy-instruments.mjs entree.json sortie.json

import { readFileSync, writeFileSync } from "node:fs";
import { translatePattern } from "./lib/tuneData.mjs";

const [, , inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) {
	console.error("Usage: node scripts/convert-legacy-instruments.mjs <entree.json> <sortie.json>");
	process.exit(1);
}

const data = JSON.parse(readFileSync(inputPath, "utf-8"));

// Supporte à la fois { "patterns": { "Morceau": { "Tune": {...} } } } (export du bouton Partager)
// et directement { "Morceau": { "Tune": {...} } } sans l'enveloppe "patterns".
const tunes = data.patterns ?? data;

for (const tuneName of Object.keys(tunes)) {
	for (const patternName of Object.keys(tunes[tuneName]))
		tunes[tuneName][patternName] = translatePattern(tunes[tuneName][patternName]);
}

writeFileSync(outputPath, JSON.stringify(data, null, "\t") + "\n");
console.log(`Converti : ${inputPath} → ${outputPath}`);
