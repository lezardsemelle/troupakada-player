export type MaestrationSign = {
	id: string;
	label: string;
	/** Shown if no photo exists yet for this gesture in assets/maestration/ (see getSignImageUrl()). */
	svgFallback: string;
};

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
 * The vocabulary of maestration gestures shared across tunes. Real photos are added progressively to
 * assets/maestration/; until a photo exists for a given gesture, getSignImageUrl() returns undefined and
 * the UI falls back to svgFallback below.
 */
export const standardSigns: MaestrationSign[] = [
	{
		id: "tourne",
		label: "Tourne",
		svgFallback: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor">
			<circle cx="20" cy="20" r="16" stroke-width="2"/>
			<path d="M20 4 A16 16 0 0 1 36 20" stroke-width="2" marker-end="url(#arr)"/>
		</svg>`
	},
	{
		id: "break",
		label: "Break",
		svgFallback: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor">
			<rect x="8" y="10" width="24" height="20" rx="3" stroke-width="2"/>
			<line x1="20" y1="10" x2="20" y2="30" stroke-width="2"/>
		</svg>`
	},
	{
		id: "fin",
		label: "Fin",
		svgFallback: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor">
			<line x1="8" y1="20" x2="32" y2="20" stroke-width="3" stroke-linecap="round"/>
			<line x1="30" y1="12" x2="30" y2="28" stroke-width="3" stroke-linecap="round"/>
		</svg>`
	}
	// Compléter selon le répertoire Troup'akada
];

export function getSignById(id: string): MaestrationSign | undefined {
	return standardSigns.find((sign) => sign.id === id);
}

/**
 * Association geste ↔ morceau. À compléter avec Troup'akada — pour l'instant seul Afoxé a un exemple,
 * les autres morceaux n'affichent simplement pas de section "Gestes".
 */
export const tunesMaestration: TuneMaestration[] = [
	{
		tuneId: "Afoxe",
		signs: ["tourne", "break", "fin"].map((id) => getSignById(id)!)
	}
];

export function getMaestrationForTune(tuneId: string): MaestrationSign[] | undefined {
	return tunesMaestration.find((t) => t.tuneId === tuneId)?.signs;
}
