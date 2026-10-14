import { expect, test } from "vitest";
import { extendStateFromCompressed, normalizeState } from "../state";
import { troupakadaTunes } from "../../troupakadaTunes";

test('un brouillon enregistré avec les anciens identifiants (lg/mg/hg/ca/ch) est relu', () => {
	const state = normalizeState();
	const errors = extendStateFromCompressed(state, {
		patterns: {
			"Morceau test": {
				"Tune": { lg: "X   X   ", mg: "@lg", ca: "....", ch: "X X X X ", length: 2 } as any
			}
		},
		playbackSettings: { headphones: ["mg"], mute: { ca: true }, volumes: { lg: 0.3 } } as any
	}, null, null, true, true, true);

	expect(errors).toEqual([]);
	const pattern = state.tunes["Morceau test"].patterns["Tune"];
	expect(pattern.ls[0]).toBe("X");
	expect(pattern.ms[4]).toBe("X");
	expect(pattern.sn[0]).toBe(".");
	expect(pattern.sh[2]).toBe("X");
	expect(state.playbackSettings.headphones).toEqual(["ms"]);
	expect(state.playbackSettings.mute.sn).toBe(true);
	expect(state.playbackSettings.volumes.ls).toBe(0.3);
});

test('un export RoR compressé (ls/ms/sn…) se charge sans conversion', () => {
	const state = normalizeState();
	const errors = extendStateFromCompressed(state, {
		patterns: { "Export RoR": { "Tune": { ls: "!%!X-$X X", sn: "X..X", hs: "@ls'!X", length: 16 } } }
	}, null, null, true, false, true);

	expect(errors).toEqual([]);
	const pattern = state.tunes["Export RoR"].patterns["Tune"];
	expect(pattern.ls[4]).toBe("X");
	expect(pattern.sn[0]).toBe("X");
	expect(pattern.hs[4]).toBe("X");
});

test('les morceaux de troupakadaTunes.json encore en anciens identifiants sont convertis', () => {
	for (const tune of Object.values(troupakadaTunes)) {
		for (const pattern of Object.values(tune.patterns)) {
			for (const key of ["lg", "mg", "hg", "ca", "ch"])
				expect(pattern).not.toHaveProperty(key);
		}
	}
});
