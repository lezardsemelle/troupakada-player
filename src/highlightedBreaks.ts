import defaultTunes from "./defaultTunes";
import rawHighlightedBreaks from "./highlightedBreaks.json";

/**
 * Une sélection de breaks à mettre en avant dans "Écouter" — une page dédiée qui les liste comme
 * les patterns d'un morceau normal (voir ui/listen/highlighted-breaks-info.vue, même principe que
 * le pseudo-morceau officiel RoR "General Breaks"/"Breaks Généraux"), qu'ils viennent du
 * répertoire RoR officiel ou de Troup'akada — une simple référence {tuneName, patternName}, jamais
 * une copie des données du break : si son contenu change (via Composer/Enregistrer), la référence
 * reste valide sans rien à retoucher ici. Elle ne casse que si le morceau/break référencé est
 * renommé ou supprimé — dans ce cas l'entrée est simplement ignorée (avec une erreur en console),
 * voir plus bas.
 */

/** Valeur de route spéciale (pas un vrai nom de morceau) pour naviguer vers la page dédiée. */
export const HIGHLIGHTED_BREAKS_TUNE_NAME = "__highlighted-breaks";
export type HighlightedBreak = {
	tuneName: string;
	patternName: string;
	/**
	 * Nom personnalisé affiché à la place de "NomMorceau (NomBreak)" — utile quand le morceau
	 * source n'est pas pertinent à montrer (ex. un break isolé pris à un morceau que Troup'akada ne
	 * joue pas par ailleurs).
	 */
	name?: string;
	/** Nom de dossier sous assets/breakDescriptions/, même principe que descriptionFilename pour un morceau. */
	descriptionFilename?: string;
};

export const highlightedBreaks: HighlightedBreak[] = (rawHighlightedBreaks as HighlightedBreak[]).filter((entry) => {
	if (!defaultTunes[entry.tuneName]?.patterns[entry.patternName]) {
		// eslint-disable-next-line no-console
		console.error(`Break inconnu dans highlightedBreaks.json : ${entry.patternName} (${entry.tuneName})`);
		return false;
	}
	return true;
});

/** Identifiant stable d'un break mis en avant, utilisé pour naviguer vers lui individuellement
 * (route "patternName" sur le pseudo-morceau HIGHLIGHTED_BREAKS_TUNE_NAME). Ne dépend ni de l'ordre
 * de la liste ni du nom personnalisé, seulement de la référence morceau/break elle-même. */
export function getHighlightedBreakKey(entry: Pick<HighlightedBreak, "tuneName" | "patternName">): string {
	return `${entry.tuneName}//${entry.patternName}`;
}
