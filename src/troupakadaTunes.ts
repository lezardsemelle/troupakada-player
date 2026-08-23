import type { RawTune } from "./defaultTunes";
import tunesData from "./troupakadaTunes.json";

/**
 * Morceaux composés par Troup'akada d'Échirolles, séparés du reste de rawTunes (defaultTunes.ts,
 * dérivé du projet upstream ror-player) pour que les mises à jour de ce fichier — notamment via
 * scripts/import-tunes.mjs — n'aient jamais à toucher au gros fichier partagé.
 *
 * Le contenu des morceaux (patterns) vit dans troupakadaTunes.json ; ce fichier se contente d'y
 * ajouter la catégorie "troupakada" pour chacun.
 */
export const troupakadaTunes: Record<string, RawTune> = Object.fromEntries(
	Object.entries(tunesData as Record<string, RawTune["patterns"]>).map(([tuneName, patterns]) => [
		tuneName,
		{
			categories: [ "troupakada" ],
			patterns
		} satisfies RawTune
	])
);
