export type MaestrationSign = {
	id: string;
	label: string;
	/** Shown if no photo exists yet for this gesture in assets/maestration/ (see getSignImageUrl()). Falls back to defaultSignSvg if unset. */
	svgFallback?: string;
};

/** Generic placeholder icon used when a gesture has neither a photo nor its own svgFallback. */
export const defaultSignSvg = `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor">
	<circle cx="20" cy="20" r="16" stroke-width="2"/>
	<path d="M14 24 Q20 30 26 24" stroke-width="2" stroke-linecap="round"/>
	<circle cx="14" cy="16" r="1.5" fill="currentColor"/>
	<circle cx="26" cy="16" r="1.5" fill="currentColor"/>
</svg>`;

export type TuneMaestration = {
	tuneId: string;
	signs: MaestrationSign[];
};

/**
 * Photos of maestration gestures, named after the gesture id (assets/maestration/<id>.jpg|jpeg|png|svg).
 * Loaded via import.meta.glob (like the i18n and tune description assets) rather than a plain runtime path,
 * because the production build packs everything into a single HTML file (see vite-plugin-singlefile in
 * vite.config.ts) — a raw "assets/maestration/x.jpg" string would 404 once built, since nothing is served
 * from that path anymore. This also means the fallback SVG can be selected at build time instead of having
 * to react to an <img> load failure at runtime.
 */
const maestrationImages = import.meta.glob<{ default: string }>("../assets/maestration/*.{jpg,jpeg,png,svg}", { eager: true });

export function getSignImageUrl(signId: string): string | undefined {
	const path = Object.keys(maestrationImages).find((p) => new RegExp(`/${signId}\\.[^./]+$`).test(p));
	return path ? maestrationImages[path].default : undefined;
}

/**
 * The vocabulary of maestration gestures used by Troup'akada, transcribed from the reference sheet made by
 * Natacha (maestro). All 18 have a real photo in assets/maestration/ (imported via getSignImageUrl()), so
 * svgFallback is unused here in practice — kept optional on the type for gestures added later without a photo yet.
 */
export const standardSigns: MaestrationSign[] = [
	{ id: "x4-doux-fort", label: "X4 – De doux à fort" },
	{ id: "silence-4", label: "4 temps de silence" },
	{ id: "silence-8", label: "8 temps de silence" },
	{ id: "accelerer", label: "Accélérer" },
	{ id: "arret-immediat", label: "Arrêt immédiat" },
	{ id: "baguette-magique-surdos", label: "Baguette magique surdos" },
	{ id: "break-bra", label: "Break Bra" },
	{ id: "break-chante", label: "Break chanté" },
	{ id: "break-tambourine", label: "Break tambourine" },
	{ id: "changement-tourne", label: "Changement de tourne" },
	{ id: "encore", label: "Encore" },
	{ id: "vague-boucle", label: "La vague – En boucle" },
	{ id: "break-loup-garou", label: "Break Loup-garou" },
	{ id: "volume", label: "Monter / Descendre le volume" },
	{ id: "bloc", label: "On se met en bloc" },
	{ id: "ralentir", label: "Ralentir" },
	{ id: "stop", label: "Stop" },
	{ id: "autres-instrus", label: "Tous les autres instrus" }
	// Compléter si Natacha ajoute d'autres gestes au répertoire
];

export function getSignById(id: string): MaestrationSign | undefined {
	return standardSigns.find((sign) => sign.id === id);
}

/**
 * Association geste ↔ morceau. Pas encore renseignée : le vocabulaire de gestes ci-dessus vient de la
 * fiche de Natacha, mais quels gestes s'appliquent à quel morceau reste à définir avec Troup'akada. Tant
 * qu'un morceau n'a pas d'entrée ici, sa section "Gestes" ne s'affiche simplement pas (cf. maestration-signs.vue).
 */
export const tunesMaestration: TuneMaestration[] = [];

export function getMaestrationForTune(tuneId: string): MaestrationSign[] | undefined {
	return tunesMaestration.find((t) => t.tuneId === tuneId)?.signs;
}
