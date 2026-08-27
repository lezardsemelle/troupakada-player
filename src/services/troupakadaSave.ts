export type TroupakadaFileResult = { ok: true } | { ok: false; errors: string[] };

async function postTroupakada(path: string, body: object): Promise<TroupakadaFileResult> {
	try {
		const response = await fetch(`/__troupakada/${path}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body)
		});
		const result = await response.json();
		if (!response.ok)
			return { ok: false, errors: result.errors || [response.statusText] };
		return { ok: true };
	} catch (e: any) {
		return { ok: false, errors: [e.message] };
	}
}

/**
 * Supprime un break (si `patternName` est fourni) ou un morceau entier (si `patternName` est
 * omis, tous ses breaks disparaissent avec lui) de src/troupakadaTunes.json, via le serveur de
 * dev (voir scripts/vite-plugin-save-tune.ts). Sans effet en production : il n'y a pas de serveur
 * pour recevoir la requête (comme pour le bouton "Enregistrer", voir pattern-player.vue).
 */
export function deleteFromTroupakadaTunes(tuneName: string, patternName?: string): Promise<TroupakadaFileResult> {
	return postTroupakada("delete-pattern", { tuneName, patternName });
}
