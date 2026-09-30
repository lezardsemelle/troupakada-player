// Désactivé en dev (yarn dev-server) : le service worker met en cache la page et les modules
// servis par Vite, et republie un message "nouvelle version" à chaque changement de fichier —
// perturbant en plein travail dans Composer (constaté : bannière de rafraîchissement intempestive
// pendant une session d'édition). Vite gère déjà son propre rechargement à chaud, pas besoin d'une
// couche de cache par-dessus en développement.
const enable = import.meta.env.PROD && (!process?.env?.DISABLE_SW || process.env.DISABLE_SW === "false");

const UPDATE_CHECK_INTERVAL = 30 * 60 * 1000;
const UPDATE_CHECK_MIN_DELAY = 5 * 60 * 1000;

/**
 * Le service worker ne compare la page en cache à la version en ligne (et n'envoie "bb-refresh", qui
 * affiche le bandeau de mise à jour) que lorsque la page est redemandée. Une appli installée peut rester
 * ouverte en arrière-plan des jours sans rechargement : on redemande donc la page régulièrement, et à
 * chaque retour au premier plan, pour que l'alerte finisse par arriver.
 */
function watchForUpdates(registration: ServiceWorkerRegistration): void {
	let lastCheck = Date.now();

	const check = () => {
		lastCheck = Date.now();
		void registration.update().catch(() => undefined);
		void fetch("./", { cache: "no-cache" }).catch(() => undefined);
	};

	setInterval(check, UPDATE_CHECK_INTERVAL);
	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState === "visible" && Date.now() - lastCheck > UPDATE_CHECK_MIN_DELAY)
			check();
	});
}

export function registerServiceWorker(): void {
	if("serviceWorker" in navigator) {
		if(enable) {
			navigator.serviceWorker.register("./sw.js").then((registration) => {
				watchForUpdates(registration);
			}).catch((err) => {
				// eslint-disable-next-line no-console
				console.error("Error registering service worker", err.stack || err);
			});
		} else {
			void navigator.serviceWorker.getRegistrations().then(function(registrations) {
				for(const registration of registrations) {
					void registration.unregister();
				}
			});
		}
	} else {
		// eslint-disable-next-line no-console
		console.warn("Service worker not supported by browser");
	}
}
