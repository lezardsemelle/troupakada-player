// Logique partagée pour fusionner des données de morceau/pattern dans src/troupakadaTunes.json.
// Utilisée à la fois par scripts/import-tunes.mjs (CLI) et par le plugin Vite du bouton
// "Enregistrer" (vite.config.ts), pour ne pas dupliquer la validation entre les deux.

export const VALID_INSTRUMENTS = new Set([ "lg", "mg", "hg", "re", "ca", "ta", "ag", "ch", "ot" ]);
export const VALID_PATTERN_PROPERTIES = new Set([ "length", "time", "speed", "upbeat", "loop", "displayName", "volumeHack" ]);

const INSTRUMENT_MAP = {
	ls: "lg", // Surdo grave
	ms: "mg", // Surdo médium
	hs: "hg", // Surdo aigu
	sn: "ca", // Caixa
	sh: "ch"  // Chocalho
	// re, ta, ag, ot : identifiants inchangés
};

function translateKey(key) {
	return INSTRUMENT_MAP[key] ?? key;
}

function translateStrokeValue(value) {
	if (typeof value !== "string")
		return value;

	const reference = value.match(/^@([a-z]{2})$/);
	return reference ? `@${translateKey(reference[1])}` : value;
}

// Convertit un pattern venant d'un ancien export (noms d'instruments ror-player d'origine) vers
// la nomenclature batucada Troup'akada. Sans effet si le pattern utilise déjà les nouveaux noms.
export function translatePattern(pattern) {
	const result = {};
	for (const [key, value] of Object.entries(pattern))
		result[translateKey(key)] = translateStrokeValue(value);
	return result;
}

// Repère les clés qui ne sont ni un instrument connu ni une propriété de pattern connue, pour
// attraper les fautes de frappe ou les anciens noms d'instruments oubliés avant d'écrire le fichier.
export function findUnknownKeys(tuneName, patternName, pattern) {
	return Object.keys(pattern).filter((key) => !VALID_INSTRUMENTS.has(key) && !VALID_PATTERN_PROPERTIES.has(key))
		.map((key) => `${tuneName} – ${patternName} : clé inconnue "${key}"`);
}

/**
 * Fusionne les morceaux d'un export (format "patterns": { tuneName: { patternName: {...} } },
 * ou directement { tuneName: {...} } sans l'enveloppe) dans les données actuelles.
 * Retourne { data, addedTunes, updatedPatterns, errors }. N'écrit rien sur le disque.
 * Si `errors` n'est pas vide, `data` est inchangé (identique à `current`).
 */
export function mergeTuneData(current, exported) {
	const importedTunes = exported.patterns ?? exported;

	const data = structuredClone(current);
	const addedTunes = [];
	const updatedPatterns = [];
	const errors = [];

	const translated = Object.fromEntries(
		Object.entries(importedTunes).map(([tuneName, patterns]) => [
			tuneName,
			Object.fromEntries(Object.entries(patterns).map(([patternName, pattern]) => {
				const translatedPattern = translatePattern(pattern);
				errors.push(...findUnknownKeys(tuneName, patternName, translatedPattern));
				return [patternName, translatedPattern];
			}))
		])
	);

	if (errors.length > 0)
		return { data: current, addedTunes, updatedPatterns, errors };

	for (const [tuneName, patterns] of Object.entries(translated)) {
		if (!data[tuneName]) {
			// Nouveau morceau : { patterns: {...} } — la place est laissée pour d'autres champs de
			// RawTune (descriptionFilename, displayName, sheet, video, speed, exampleSong...) que ce
			// mécanisme n'écrit jamais lui-même (ce sont des modifications manuelles, pas via l'UI).
			data[tuneName] = { patterns };
			addedTunes.push(tuneName);
		} else {
			if (!data[tuneName].patterns)
				data[tuneName].patterns = {};

			for (const [patternName, pattern] of Object.entries(patterns)) {
				// Fusion champ par champ, pas un remplacement : compressPattern() (utilisée par le
				// bouton "Enregistrer" et par Partager) ne renvoie que les instruments/propriétés qui
				// diffèrent de l'original — un pattern déjà existant doit garder ses autres champs.
				data[tuneName].patterns[patternName] = { ...(data[tuneName].patterns[patternName] ?? {}), ...pattern };
				updatedPatterns.push(`${tuneName} – ${patternName}`);
			}
		}
	}

	return { data, addedTunes, updatedPatterns, errors };
}

/**
 * Supprime un break (`patternName` fourni) ou un morceau entier (`patternName` omis/null, tous
 * ses breaks disparaissent avec lui) de `current`. Si supprimer un break laisse le morceau sans
 * aucun pattern, le morceau entier est retiré aussi (pas d'entrée fantôme dans le fichier).
 * Retourne { data, errors }. N'écrit rien sur le disque. Si `errors` n'est pas vide, `data` est
 * inchangé (identique à `current`).
 */
export function removeTuneOrPattern(current, tuneName, patternName) {
	const data = structuredClone(current);
	const errors = [];

	if (!data[tuneName]) {
		errors.push(`Le morceau "${tuneName}" n'existe pas dans troupakadaTunes.json.`);
		return { data: current, errors };
	}

	if (patternName == null) {
		delete data[tuneName];
		return { data, errors };
	}

	if (!data[tuneName].patterns || !(patternName in data[tuneName].patterns)) {
		errors.push(`Le break "${patternName}" n'existe pas dans le morceau "${tuneName}" de troupakadaTunes.json.`);
		return { data: current, errors };
	}

	delete data[tuneName].patterns[patternName];
	if (Object.keys(data[tuneName].patterns).length === 0)
		delete data[tuneName];

	return { data, errors };
}
