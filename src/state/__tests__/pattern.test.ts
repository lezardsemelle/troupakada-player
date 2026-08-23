import { expect, test } from "vitest";
import { normalizePattern } from "../pattern";

test('normalizePattern', () => {
	expect(normalizePattern()).toEqual({
		length: 4,
		time: 4,
		speed: 100,
		upbeat: 0,
		loop: false,
		lg: [],
		mg: [],
		hg: [],
		re: [],
		ca: [],
		ta: [],
		ag: [],
		ch: [],
		ot: []
	});

	// Test legacy volume hack
	expect(normalizePattern({
		volumeHack: { 1: 0.1, 2: 0.2 }
	})).toMatchObject({
		volumeHack: {
			lg: { 1: 0.1, 2: 0.2 },
			mg: { 1: 0.1, 2: 0.2 },
			hg: { 1: 0.1, 2: 0.2 },
			re: { 1: 0.1, 2: 0.2 },
			ca: { 1: 0.1, 2: 0.2 },
			ta: { 1: 0.1, 2: 0.2 },
			ag: { 1: 0.1, 2: 0.2 },
			ch: { 1: 0.1, 2: 0.2 },
			ot: { 1: 0.1, 2: 0.2 }
		}
	});
});
