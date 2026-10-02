import type { Category } from "./config";
import overrides from "./repertoireCategories.json";

/**
 * Catégories du répertoire de Troup'akada et des groupes amis (Combatucada, Les Frappas). Un morceau
 * peut appartenir à plusieurs d'entre elles ; en développement, Composer les règle par cases à cocher
 * (voir src/ui/compose/pattern-list.vue). Même liste que REPERTOIRE_CATEGORIES (scripts/lib/tuneData.mjs).
 */
export const REPERTOIRE_CATEGORIES = [ "troupakada", "combatucada", "frappas" ] as const satisfies ReadonlyArray<Category>;
export type RepertoireCategory = typeof REPERTOIRE_CATEGORIES[number];

export function isRepertoireCategory(category: Category): category is RepertoireCategory {
	return (REPERTOIRE_CATEGORIES as ReadonlyArray<Category>).includes(category);
}

/**
 * Remplace les catégories du répertoire de `categories` par `selected`, sans toucher aux autres
 * (common, easy, western...).
 */
export function withRepertoireCategories(categories: ReadonlyArray<Category> | undefined, selected: ReadonlyArray<RepertoireCategory>): Category[] {
	return [
		...REPERTOIRE_CATEGORIES.filter((category) => selected.includes(category)),
		...(categories ?? []).filter((category) => !isRepertoireCategory(category))
	];
}

/**
 * Catégories du répertoire choisies pour des morceaux RoR officiels (defaultTunes.ts), par nom de
 * morceau. Tenues à part pour ne pas avoir à réécrire defaultTunes.ts depuis Composer (plugin
 * scripts/vite-plugin-save-tune.ts) et limiter les conflits avec ror-player upstream. Une entrée
 * remplace les catégories du répertoire écrites dans defaultTunes.ts pour ce morceau (ex. Afoxé).
 * Les morceaux de troupakadaTunes.json portent les leurs directement dans leur champ "categories".
 */
export const repertoireCategoryOverrides = overrides as Record<string, RepertoireCategory[]>;
