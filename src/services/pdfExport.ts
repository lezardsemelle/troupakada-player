import jsPDF from "jspdf";
import config from "../config";
import { getLocalizedDisplayName } from "./i18n";
import { Pattern } from "../state/pattern";
import { getPatternFromState, State } from "../state/state";
import { PatternReference } from "../state/song";
import { getMaestrationForTune } from "../maestrationSigns";

const CELL_WIDTH = 22;
const CELL_HEIGHT = 26;
const LABEL_WIDTH = 110;
const HEADER_HEIGHT = 26;

/** Renders the note grid of a pattern (one row per instrument that is actually used) to an off-screen canvas. */
function renderNotesGrid(pattern: Pattern): HTMLCanvasElement {
	const instruments = config.instrumentKeys.filter((instr) => (pattern[instr] || []).some((stroke) => stroke && stroke.trim() !== ""));
	const columns = pattern.length * pattern.time + pattern.upbeat;

	const scale = 2; // Render at a higher resolution for crisper text once embedded in the PDF
	const width = LABEL_WIDTH + columns * CELL_WIDTH;
	const height = HEADER_HEIGHT + instruments.length * CELL_HEIGHT;

	const canvas = document.createElement("canvas");
	canvas.width = width * scale;
	canvas.height = height * scale;

	const ctx = canvas.getContext("2d")!;
	ctx.scale(scale, scale);
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, width, height);
	ctx.textBaseline = "middle";

	// Beat numbers, one per group of `pattern.time` columns (grouping the grid visually by beat)
	ctx.fillStyle = "#000";
	ctx.font = "12px sans-serif";
	ctx.textAlign = "left";
	let beat = 1;
	for (let i = pattern.upbeat; i < columns; i += pattern.time) {
		ctx.fillText(String(beat), LABEL_WIDTH + i * CELL_WIDTH + 3, HEADER_HEIGHT / 2);
		beat++;
	}

	instruments.forEach((instr, row) => {
		const y = HEADER_HEIGHT + row * CELL_HEIGHT;

		ctx.textAlign = "left";
		ctx.font = "bold 12px sans-serif";
		ctx.fillStyle = "#000";
		ctx.fillText(config.instruments[instr].name(), 0, y + CELL_HEIGHT / 2);

		ctx.textAlign = "center";
		ctx.font = "13px sans-serif";
		for (let i = 0; i < columns; i++) {
			const x = LABEL_WIDTH + i * CELL_WIDTH;

			if ((i - pattern.upbeat) % pattern.time === 0 && i > 0) {
				ctx.strokeStyle = "#bbb";
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(x, y);
				ctx.lineTo(x, y + CELL_HEIGHT);
				ctx.stroke();
			}

			const stroke = pattern[instr][i];
			if (stroke && stroke.trim() !== "") {
				ctx.fillStyle = "#000";
				ctx.fillText(config.strokes[stroke] ?? stroke, x + CELL_WIDTH / 2, y + CELL_HEIGHT / 2);
			}
		}

		ctx.strokeStyle = "#ddd";
		ctx.lineWidth = 0.5;
		ctx.beginPath();
		ctx.moveTo(0, y + CELL_HEIGHT);
		ctx.lineTo(width, y + CELL_HEIGHT);
		ctx.stroke();
	});

	return canvas;
}

/** If the “Voix / Autres” line contains lyrics, decodes it into a readable mnemonic phrase. */
function getMnemonic(pattern: Pattern): string | undefined {
	const strokes = pattern.ot;
	if (!strokes || !strokes.some((stroke) => stroke && stroke.trim() !== ""))
		return undefined;

	return strokes.map((stroke) => (stroke && stroke.trim() !== "" ? (config.strokes[stroke] ?? stroke) : "")).join(" ").replace(/\s+/g, " ").trim();
}

function renderPatternToPdf(title: string, tuneName: string, pattern: Pattern): jsPDF {
	const doc = new jsPDF();

	doc.setFontSize(18);
	doc.text(title, 20, 20);
	doc.setFontSize(11);
	doc.text(`Tempo : ${pattern.speed} BPM — ${pattern.time}/4`, 20, 28);

	const canvas = renderNotesGrid(pattern);
	const imgWidth = 170;
	const imgHeight = imgWidth * canvas.height / canvas.width;
	doc.addImage(canvas.toDataURL("image/png"), "PNG", 20, 36, imgWidth, imgHeight);

	let y = 36 + imgHeight + 10;

	const mnemonic = getMnemonic(pattern);
	if (mnemonic) {
		doc.setFontSize(11);
		doc.setFont("helvetica", "italic");
		const lines = doc.splitTextToSize(mnemonic, imgWidth);
		doc.text(lines, 20, y);
		doc.setFont("helvetica", "normal");
		y += lines.length * 6 + 6;
	}

	const signs = getMaestrationForTune(tuneName);
	if (signs && signs.length > 0) {
		doc.setFontSize(11);
		doc.text(`Gestes : ${signs.map((sign) => sign.label).join(", ")}`, 20, y);
	}

	return doc;
}

/** Exports a single pattern (the main tune or one of its breaks) as a printable PDF sheet. */
export function exportPatternToPdf(state: State, [tuneName, patternName]: PatternReference): void {
	const pattern = getPatternFromState(state, tuneName, patternName);
	if (!pattern)
		return;

	const tune = state.tunes[tuneName];
	const tuneTitle = getLocalizedDisplayName(tune.displayName || tuneName);
	const patternTitle = getLocalizedDisplayName(pattern.displayName || patternName);
	const title = patternName === "Tune" ? tuneTitle : `${tuneTitle} – ${patternTitle}`;

	renderPatternToPdf(title, tuneName, pattern).save(`${title}.pdf`);
}
