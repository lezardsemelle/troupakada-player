import { reactiveLocalStorage } from "./localStorage";

const STORAGE_KEY = "troupaFavorites";

export function getFavorites(): string[] {
	try {
		return JSON.parse(reactiveLocalStorage[STORAGE_KEY] ?? "[]");
	} catch {
		return [];
	}
}

export function isFavorite(tuneName: string): boolean {
	return getFavorites().includes(tuneName);
}

export function toggleFavorite(tuneName: string): void {
	const favorites = getFavorites();
	const updated = favorites.includes(tuneName)
		? favorites.filter((name) => name !== tuneName)
		: [...favorites, tuneName];
	reactiveLocalStorage[STORAGE_KEY] = JSON.stringify(updated);
}
