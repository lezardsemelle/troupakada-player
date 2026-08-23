// Désactivé en dev (yarn dev-server) : le service worker met en cache la page et les modules
// servis par Vite, et republie un message "nouvelle version" à chaque changement de fichier —
// perturbant en plein travail dans Composer (constaté : bannière de rafraîchissement intempestive
// pendant une session d'édition). Vite gère déjà son propre rechargement à chaud, pas besoin d'une
// couche de cache par-dessus en développement.
const enable = import.meta.env.PROD && (!process?.env?.DISABLE_SW || process.env.DISABLE_SW === "false");

export function registerServiceWorker(): void {
	if("serviceWorker" in navigator) {
		if(enable) {
			navigator.serviceWorker.register("./sw.js").catch((err) => {
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
