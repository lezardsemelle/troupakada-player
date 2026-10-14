/**
 * Le player a utilisé un temps ses propres identifiants d'instruments (lg/mg/hg/ca/ch) avant de revenir
 * à ceux de ror-player (ls/ms/hs/sn/sh) le 2026-10-14, pour importer les morceaux RoR sans conversion
 * (voir CLAUDE.md, Modification 3). Les brouillons Composer, liens de partage, réglages de lecture et
 * morceaux de troupakadaTunes.json écrits pendant cette période sont convertis ici au chargement.
 *
 * Même table que INSTRUMENT_MAP dans scripts/lib/tuneData.mjs.
 */
const LEGACY_INSTRUMENTS: Record<string, string> = {
	lg: "ls", // Surdo grave
	mg: "ms", // Surdo médium
	hg: "hs", // Surdo aigu
	ca: "sn", // Caixa
	ch: "sh" // Chocalho
};

const isObject = (value: unknown): value is Record<string, unknown> => (
	value != null && typeof value === "object" && !Array.isArray(value)
);

function renameKeys<T>(record: T): T {
	if (!isObject(record))
		return record;
	return Object.fromEntries(Object.entries(record).map(([key, value]) => [LEGACY_INSTRUMENTS[key] ?? key, value])) as T;
}

/** "@lg" (export brut) ou "@lg…" suivi d'un diff (export compressé) → "@ls…" */
function renameReference(value: unknown): unknown {
	if (typeof value !== "string")
		return value;
	const m = /^@([a-z]{2})/.exec(value);
	return m && LEGACY_INSTRUMENTS[m[1]] ? `@${LEGACY_INSTRUMENTS[m[1]]}${value.slice(3)}` : value;
}

/** Convertit un pattern (brut ou compressé) utilisant les anciens identifiants. Sans effet sinon. */
export function migrateLegacyPattern<T>(pattern: T): T {
	if (!isObject(pattern))
		return pattern;
	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(pattern)) {
		if (key === "volumeHack")
			result[key] = renameKeys(value);
		else
			result[LEGACY_INSTRUMENTS[key] ?? key] = renameReference(value);
	}
	return result as T;
}

/** Dans un morceau du répertoire (songs), les parts sont des enregistrements par instrument, à toute profondeur. */
function migrateSongValue(value: unknown): unknown {
	if (Array.isArray(value))
		return value.map(migrateSongValue);
	if (isObject(value))
		return Object.fromEntries(Object.entries(value).map(([key, v]) => [LEGACY_INSTRUMENTS[key] ?? key, migrateSongValue(v)]));
	return value;
}

function migratePlaybackSettings(settings: unknown): unknown {
	if (!isObject(settings))
		return settings;
	return {
		...settings,
		...(Array.isArray(settings.headphones) ? { headphones: settings.headphones.map((i) => LEGACY_INSTRUMENTS[i as string] ?? i) } : {}),
		...(settings.mute ? { mute: renameKeys(settings.mute) } : {}),
		...(settings.volumes ? { volumes: renameKeys(settings.volumes) } : {})
	};
}

/** Convertit un état compressé (stockage local, lien de partage, Importer) utilisant les anciens identifiants. */
export function migrateLegacyState<T>(state: T): T {
	if (!isObject(state))
		return state;
	const result: Record<string, unknown> = { ...state };
	if (isObject(state.patterns)) {
		result.patterns = Object.fromEntries(Object.entries(state.patterns).map(([tuneName, patterns]) => [
			tuneName,
			isObject(patterns) ? Object.fromEntries(Object.entries(patterns).map(([name, p]) => [name, migrateLegacyPattern(p)])) : patterns
		]));
	}
	if (state.songs != null)
		result.songs = migrateSongValue(state.songs);
	if (state.playbackSettings != null)
		result.playbackSettings = migratePlaybackSettings(state.playbackSettings);
	return result as T;
}
