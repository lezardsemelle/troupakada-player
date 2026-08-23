import type { RawTune } from "./defaultTunes";
import tunesData from "./troupakadaTunes.json";

/**
 * Morceaux composés par Troup'akada d'Échirolles, séparés du reste de rawTunes (defaultTunes.ts,
 * dérivé du projet upstream ror-player) pour que les mises à jour de ce fichier — notamment via
 * scripts/import-tunes.mjs ou le bouton "Enregistrer" (voir CLAUDE.md) — n'aient jamais à toucher
 * au gros fichier partagé.
 *
 * Le contenu (patterns, et au besoin descriptionFilename/displayName/sheet/video/speed/exampleSong,
 * cf. le type RawTune) vit dans troupakadaTunes.json ; ce fichier se contente d'y ajouter la
 * catégorie "troupakada" pour chacun.
 */
export const troupakadaTunes: Record<string, RawTune> = Object.fromEntries(
	Object.entries(tunesData as Record<string, Omit<RawTune, "categories">>).map(([tuneName, tune]) => [
		tuneName,
		{
			...tune,
			categories: [ "troupakada" ]
		} satisfies RawTune
	])
);
