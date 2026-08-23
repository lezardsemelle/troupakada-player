import type { Plugin } from "vite";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
// @ts-expect-error pas de types pour ce petit module JS partagé avec les scripts CLI
import { mergeTuneData } from "./lib/tuneData.mjs";

const dataPath = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "troupakadaTunes.json");

/**
 * Sert le bouton "Enregistrer" du lecteur de pattern (src/ui/pattern-player/pattern-player.vue) :
 * reçoit un pattern modifié en Composer et l'écrit directement dans src/troupakadaTunes.json,
 * sans passer par un export manuel + scripts/import-tunes.mjs.
 *
 * N'existe qu'en développement (`apply: "serve"`) : un build de production n'a pas de serveur
 * pour recevoir cette requête, et n'a de toute façon pas accès au système de fichiers du poste.
 */
export default function troupakadaSaveTunePlugin(): Plugin {
	return {
		name: "troupakada-save-tune",
		apply: "serve",
		configureServer(server) {
			server.middlewares.use("/__troupakada/save-pattern", (req, res) => {
				if (req.method !== "POST") {
					res.statusCode = 405;
					res.end("Method not allowed");
					return;
				}

				let body = "";
				req.on("data", (chunk) => { body += chunk; });
				req.on("end", () => {
					res.setHeader("Content-Type", "application/json");
					try {
						const { tuneName, patternName, pattern } = JSON.parse(body);
						if (typeof tuneName !== "string" || typeof patternName !== "string" || typeof pattern !== "object" || pattern === null)
							throw new Error("Requête invalide : tuneName, patternName et pattern sont requis.");

						const current = JSON.parse(readFileSync(dataPath, "utf-8"));
						const { data, errors } = mergeTuneData(current, { patterns: { [tuneName]: { [patternName]: pattern } } });

						if (errors.length > 0) {
							res.statusCode = 400;
							res.end(JSON.stringify({ errors }));
							return;
						}

						writeFileSync(dataPath, JSON.stringify(data, null, "\t") + "\n");

						res.statusCode = 200;
						res.end(JSON.stringify({ ok: true }));
					} catch (e: any) {
						res.statusCode = 400;
						res.end(JSON.stringify({ errors: [e.message] }));
					}
				});
			});
		}
	};
}
