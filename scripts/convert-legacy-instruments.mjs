#!/usr/bin/env node
// Convertit un export JSON "Raw (uncompressed)" du player (voir README, section Share) qui utilise
// les anciens noms d'instruments ror-player (ls/ms/hs/sn/sh) vers les noms batucada Troup'akada
// (lg/mg/hg/ca/ch) introduits par le renommage des instruments (voir CLAUDE.md, Modification 3).
//
// Usage : node scripts/convert-legacy-instruments.mjs entree.json sortie.json

import { readFileSync, writeFileSync } from "node:fs";

const INSTRUMENT_MAP = {
	ls: "lg", // Surdo grave
	ms: "mg", // Surdo médium
	hs: "hg", // Surdo aigu
	sn: "ca", // Caixa
	sh: "ch"  // Chocalho
	// re, ta, ag, ot : identifiants inchangés, pas besoin d'entrée ici
};

function translateKey(key) {
	return INSTRUMENT_MAP[key] ?? key;
}

// Une valeur de frappe est soit une suite de frappes ("X  X..."), soit une référence à un autre
// instrument du même pattern ("@ls") — dans les deux cas, seule la clé d'instrument doit changer.
function translateStrokeValue(value) {
	if (typeof value !== "string")
		return value;

	const reference = value.match(/^@([a-z]{2})$/);
	return reference ? `@${translateKey(reference[1])}` : value;
}

function translatePattern(pattern) {
	const result = {};
	for (const [key, value] of Object.entries(pattern))
		result[translateKey(key)] = translateStrokeValue(value);
	return result;
}

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
