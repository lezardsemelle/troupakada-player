// Builds a single-tune .ods (LibreOffice Calc) file styled after the official RoR sheetbook template
// (https://github.com/rhythms-of-resistance/sheetbook, see its README "Styling guidelines" section):
// same font sizes, same 3-tier vertical border weights (thin between strokes, medium between beats, thick
// between bars), same "Groove" + boxed breaks layout — so the result can be dropped into a local checkout
// of the sheetbook repo and converted to PDF with https://github.com/rhythms-of-resistance/sheetbook-generator
// exactly like any other tune, or hand-finished in LibreOffice (the official contribution workflow).
//
// This only reads src/troupakadaTunes.json (our own tunes) — official RoR tunes already have a real
// hand-made sheet (see their `sheet` field in src/defaultTunes.ts).

import { buildZip } from "./zip.mjs";

export const INSTRUMENT_KEYS = ["lg", "mg", "hg", "re", "ca", "ta", "ag", "ch", "ot"];

// French display names, kept in sync by hand with src/config.ts's `instruments-*` translations (assets/i18n/fr.json).
const INSTRUMENT_NAMES = {
	lg: "Surdo grave",
	mg: "Surdo médium",
	hg: "Surdo aigu",
	re: "Repique",
	ca: "Caixa",
	ta: "Tamborim",
	ag: "Agogô",
	ch: "Chocalho",
	ot: "Voix / Autres"
};

// Stroke abbreviations, kept in sync by hand with src/config.ts's `strokes` map — only the codes actually
// used by src/troupakadaTunes.json today. If a new tune/break uses a stroke code not listed here,
// decodePattern() throws rather than silently rendering a blank or wrong cell.
const STROKES = {
	"X": "X",
	"h": "hd",
	"0": "0",
	"s": "sil",
	"f": "fl",
	"r": "rim",
	"o": "l",
	"a": "h",
	"t": "w",
	".": ".",
	"F": "Hey!"
};

const DEFAULT_SPEED = 100;

function strokeLabel(code) {
	if (!(code in STROKES))
		throw new Error(`Code de frappe inconnu "${code}" — ajoute-le à STROKES dans scripts/lib/odsSheet.mjs (copié depuis src/config.ts).`);
	return STROKES[code];
}

/** Decodes a pattern from troupakadaTunes.json's compressed form (one char per stroke, "@xx" meaning "same as instrument xx"). */
export function decodePattern(compressed) {
	const length = compressed.length ?? 4;
	const time = compressed.time ?? 4;
	const upbeat = compressed.upbeat ?? 0;
	// Left undefined (not defaulted) when absent: a pattern-level override is rare, and the effective tempo
	// falls back to the tune-level `speed` first (see buildTuneSheet) — same precedence as the app itself
	// (tune-info.vue: `tune.value.speed || config.defaultSpeed`), before finally defaulting to DEFAULT_SPEED.
	const speed = compressed.speed;

	const raw = {};
	for (const instr of INSTRUMENT_KEYS)
		raw[instr] = compressed[instr];

	const strokes = {};
	for (const instr of INSTRUMENT_KEYS) {
		const value = raw[instr];
		if (value == null) {
			strokes[instr] = [];
			continue;
		}
		const ref = /^@([a-z]{2})$/.exec(value);
		strokes[instr] = ref ? null : value.split("");
	}
	// Resolve "@xx" references (only ever point at an already-decoded, non-reference instrument in this data set)
	for (const instr of INSTRUMENT_KEYS) {
		if (strokes[instr] === null) {
			const ref = /^@([a-z]{2})$/.exec(raw[instr]);
			strokes[instr] = strokes[ref[1]] ?? [];
		}
	}

	return { length, time, upbeat, speed, displayName: compressed.displayName, strokes };
}

/** If the "Voix / Autres" line contains lyrics, decodes it into a readable mnemonic phrase — the closest thing our
 * data model has to the sheetbook's per-section "Explanations" text. */
function getMnemonic(pattern) {
	const strokes = pattern.strokes.ot;
	if (!strokes || !strokes.some((stroke) => stroke && stroke.trim() !== ""))
		return undefined;
	return strokes.map((stroke) => (stroke && stroke.trim() !== "" ? strokeLabel(stroke) : "")).join(" ").replace(/\s+/g, " ").trim();
}

/** Whether every instrument in this row is one of the three Surdos — grouped without a free line between them, per the style guide. */
function isSurdoRow(row) {
	return row.instruments.every((instr) => instr === "lg" || instr === "mg" || instr === "hg");
}

/** "Surdos" when all three play identically (matches the official sheetbook's "All Surdos"), otherwise the joined instrument names. */
function getRowLabel(row) {
	if (isSurdoRow(row) && row.instruments.length === 3)
		return "Surdos";
	return row.instruments.map((instr) => INSTRUMENT_NAMES[instr]).join(" + ");
}

/** Groups instruments that play the exact same stroke sequence into one row, and drops instruments that don't play at all. */
function getInstrumentRows(pattern) {
	const rows = [];
	for (const instr of INSTRUMENT_KEYS) {
		const strokes = pattern.strokes[instr] || [];
		if (!strokes.some((stroke) => stroke && stroke.trim() !== ""))
			continue;

		const key = strokes.join(" ");
		const existingRow = rows.find((row) => row.strokes.join(" ") === key);
		if (existingRow)
			existingRow.instruments.push(instr);
		else
			rows.push({ instruments: [instr], strokes });
	}
	return rows;
}

function escapeXml(text) {
	return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&apos;" })[c]);
}

// Weights taken from the sheetbook README's "Styling guidelines" section, except BORDER_BEAT: at the
// official 0.75pt it's barely distinguishable from BORDER_THIN on screen at normal LibreOffice zoom (confirmed
// on a real soffice-rendered PDF) — bumped up for on-screen readability, at the cost of no longer matching
// the official sheetbook pixel-for-pixel.
const BORDER_THIN = "0.05pt solid #969696"; // between individual strokes
const BORDER_BEAT = "1.25pt solid #000000"; // between beats
const BORDER_BAR = "1.75pt solid #000000"; // between bars (every 4 beats), and under the beat-number row
const BORDER_BOX = "0.75pt solid #000000"; // box around a break
const BORDER_TITLE = "2.5pt double #000000"; // under the tune name

/** Collects table-cell and table-row automatic-styles by a dedupe key, so identical ones only get one <style:style>. */
class StyleSheet {
	constructor() {
		this.byKey = new Map();
		this.rowByKey = new Map();
		this.counter = 0;
		this.rowCounter = 0;
	}

	cellStyle(key, propsXml) {
		let entry = this.byKey.get(key);
		if (!entry) {
			entry = { name: `ce${++this.counter}`, propsXml };
			this.byKey.set(key, entry);
		}
		return entry.name;
	}

	/** A row style with an explicit height — needed for a row with no text in it, since an unstyled empty
	 * cell's auto-height calculation (which normally derives row height from its text's font size) has
	 * nothing to measure and collapses to a near-zero height instead (confirmed on a real rendered PDF). */
	rowStyle(key, heightCm) {
		let entry = this.rowByKey.get(key);
		if (!entry) {
			entry = { name: `ro${++this.rowCounter}`, heightCm };
			this.rowByKey.set(key, entry);
		}
		return entry.name;
	}

	toXml() {
		const cellStyles = [...this.byKey.values()]
			.map(({ name, propsXml }) => `<style:style style:name="${name}" style:family="table-cell" style:parent-style-name="Default"><style:table-cell-properties ${propsXml.cell ?? ""}/><style:text-properties ${propsXml.text ?? ""}/><style:paragraph-properties ${propsXml.para ?? ""}/></style:style>`)
			.join("");
		const rowStyles = [...this.rowByKey.values()]
			.map(({ name, heightCm }) => `<style:style style:name="${name}" style:family="table-row"><style:table-row-properties style:row-height="${heightCm}cm"/></style:style>`)
			.join("");
		return cellStyles + rowStyles;
	}
}

function cell(styleName, text) {
	if (text == null || text === "")
		return `<table:table-cell table:style-name="${styleName}"/>`;
	return `<table:table-cell table:style-name="${styleName}" office:value-type="string"><text:p>${escapeXml(text)}</text:p></table:table-cell>`;
}

/** A cell merged across `span` columns (ODF requires one `covered-table-cell` placeholder per extra column). */
function spannedCell(styleName, text, span) {
	if (span <= 1)
		return cell(styleName, text);
	const valueAttrs = text ? ` office:value-type="string"` : "";
	const content = text ? `<text:p>${escapeXml(text)}</text:p>` : "";
	return `<table:table-cell table:style-name="${styleName}" table:number-columns-spanned="${span}"${valueAttrs}>${content}</table:table-cell>${"<table:covered-table-cell/>".repeat(span - 1)}`;
}

// Above this many columns, a pattern gets wrapped into several stacked printed bands instead of one very wide
// row. At the nominal 0.65cm column width (see colStroke below) and a 4cm label column, roughly 36 columns
// fit an A4-landscape page at 100% scale — beyond that, LibreOffice's "fit to page width" print scaling has
// to shrink the page, and since that scaling is uniform (not width-only), it also crushes row heights, making
// blank separator rows collapse to invisible (confirmed on a real soffice-rendered PDF). Keeping bands close
// to that natural width means only mild, harmless scaling is ever needed.
const MAX_COLS_PER_ROW = 48;

function getBands(pattern, columns) {
	const barSize = 4 * pattern.time;
	if (columns <= MAX_COLS_PER_ROW || barSize <= 0)
		return [{ start: 0, length: columns }];

	const numBands = Math.ceil(columns / MAX_COLS_PER_ROW);
	const bandCols = Math.ceil(columns / numBands / barSize) * barSize;
	const bands = [];
	for (let start = 0; start < columns; start += bandCols)
		bands.push({ start, length: Math.min(bandCols, columns - start) });
	return bands;
}

/**
 * Renders one pattern (the main groove or a break) as ODS rows: a beat-number header row followed by one
 * row per (merged) instrument, repeated once per band if the pattern is too wide for one printed row (see
 * getBands()). If `boxed` is set, a 0.75pt border is drawn around the whole section (as the sheetbook does
 * for breaks).
 */
function renderPatternRows(styles, pattern, boxed) {
	const columns = pattern.length * pattern.time + pattern.upbeat;
	const rows = getInstrumentRows(pattern);
	const bands = getBands(pattern, columns);
	const xml = [];

	const borderFor = (i) => {
		if (i === 0 || bands.some((band) => band.start === i)) return null;
		if ((i - pattern.upbeat) % (4 * pattern.time) === 0) return BORDER_BAR;
		if ((i - pattern.upbeat) % pattern.time === 0) return BORDER_BEAT;
		return BORDER_THIN;
	};

	let beat = 1;
	bands.forEach((band, bandIndex) => {
		const bandEnd = band.start + band.length;
		const isLastBand = bandIndex === bands.length - 1;

		// Beat number row: one cell merged across each whole beat (so the number sits centered over its beat,
		// not just its first sub-column), no vertical dividers, just a bottom border under the whole row. Starts
		// with an empty cell matching the label column, so it lines up with the instrument rows below it.
		const headerCells = ["<table:table-cell/>"];
		for (let i = band.start; i < bandEnd;) {
			const span = i < pattern.upbeat ? Math.min(pattern.upbeat - i, bandEnd - i) : Math.min(pattern.time, bandEnd - i);
			const isUpbeatGroup = i < pattern.upbeat;
			const isFirst = i === 0;
			const isLast = i + span === columns;
			// The header's bottom border is specified at 1.75pt (same weight as a bar divider), not the 0.75pt beat weight
			const borderParts = [`fo:border-bottom="${BORDER_BAR}"`];
			if (boxed) {
				borderParts.push(`fo:border-top="${BORDER_BOX}"`);
				if (isFirst) borderParts.push(`fo:border-left="${BORDER_BOX}"`);
				if (isLast) borderParts.push(`fo:border-right="${BORDER_BOX}"`);
			}
			const style = styles.cellStyle(`header|${boxed}|${isFirst}|${isLast}`, {
				cell: borderParts.join(" "),
				text: "fo:font-size=\"9pt\" style:font-name=\"Arial\"",
				para: "fo:text-align=\"center\""
			});
			headerCells.push(spannedCell(style, isUpbeatGroup ? "" : String(beat++), span));
			i += span;
		}
		xml.push(`<table:table-row>${headerCells.join("")}</table:table-row>`);

		rows.forEach((row, rowIndex) => {
			const isLastRow = rowIndex === rows.length - 1;
			const labelStyle = styles.cellStyle(`label|${boxed}`, {
				cell: boxed ? `fo:border-left="${BORDER_BOX}"${isLastBand && isLastRow ? ` fo:border-bottom="${BORDER_BOX}"` : ""}` : "",
				text: "fo:font-size=\"9pt\" style:font-name=\"Arial\"",
				para: "fo:text-align=\"start\""
			});
			const label = getRowLabel(row);
			const cells = [cell(labelStyle, label)];

			for (let i = band.start; i < bandEnd; i++) {
				const isLastCol = i === bandEnd - 1;
				const border = borderFor(i);
				const key = `stroke|${border}|${boxed && isLastBand && isLastRow}|${boxed && isLastCol}`;
				const style = styles.cellStyle(key, {
					cell: `${border ? `fo:border-left="${border}"` : ""}${boxed && isLastBand && isLastRow ? ` fo:border-bottom="${BORDER_BOX}"` : ""}${boxed && isLastCol ? ` fo:border-right="${BORDER_BOX}"` : ""}`,
					text: "fo:font-size=\"9pt\" style:font-name=\"Arial\"",
					para: "fo:text-align=\"center\""
				});
				const stroke = row.strokes[i];
				cells.push(cell(style, stroke && stroke.trim() !== "" ? strokeLabel(stroke) : ""));
			}

			xml.push(`<table:table-row>${cells.join("")}</table:table-row>`);

			// "One free line separating different instruments, Surdos are grouped together without free lines" —
			// only applies to the Groove (breaks explicitly get "No free lines" per the style guide).
			if (!boxed && !isLastRow && !(isSurdoRow(row) && isSurdoRow(rows[rowIndex + 1])))
				xml.push(blankRow(styles));
		});

		if (!isLastBand)
			xml.push(blankRow(styles));
	});

	const mnemonic = getMnemonic(pattern);
	if (mnemonic) {
		const lastBandLength = bands[bands.length - 1].length;
		const mnemonicStyle = styles.cellStyle(`mnemonic|${boxed}`, {
			text: "fo:font-size=\"9pt\" style:font-name=\"Arial\" fo:font-style=\"italic\"",
			para: "fo:text-align=\"end\""
		});
		// Spans the last band's own width so the right-aligned text lines up with its grid's right edge.
		xml.push(`<table:table-row>${spannedCell(mnemonicStyle, mnemonic, lastBandLength + 1)}</table:table-row>`);
	}

	return xml.join("");
}

function textRow(styles, text, key, fontSize, bold) {
	const style = styles.cellStyle(key, {
		text: `fo:font-size="${fontSize}pt" style:font-name="Arial"${bold ? " fo:font-weight=\"bold\"" : ""}`,
		para: "fo:text-align=\"start\""
	});
	return `<table:table-row>${cell(style, text)}</table:table-row>`;
}

function blankRow(styles) {
	const rowStyle = styles.rowStyle("blank", 0.35);
	return `<table:table-row table:style-name="${rowStyle}"><table:table-cell/></table:table-row>`;
}

/** Builds the .ods file (as a Buffer) for one tune: title, tempo/gestures, the "Groove", then each break boxed, in order. */
export function buildTuneSheet(tuneName, tuneData, maestrationLabel) {
	const styles = new StyleSheet();
	const patterns = Object.entries(tuneData.patterns ?? {}).map(([name, compressed]) => [name, decodePattern(compressed)]);
	// The table only needs as many `colStroke` column definitions as the widest actual printed band (post-wrap,
	// see getBands()) — declaring more (e.g. a pattern's raw pre-wrap column count) would make LibreOffice's
	// "fit to page width" print scaling shrink everything down to that unused width for nothing.
	const columnCount = Math.max(1, ...patterns.flatMap(([, pattern]) => {
		const columns = pattern.length * pattern.time + pattern.upbeat;
		return getBands(pattern, columns).map((band) => band.length);
	}));

	const titleStyle = styles.cellStyle("title", {
		cell: `fo:border-bottom="${BORDER_TITLE}"`,
		text: "fo:font-size=\"18pt\" fo:font-weight=\"bold\" style:font-name=\"Arial\"",
		para: "fo:text-align=\"start\""
	});

	const body = [];
	body.push(`<table:table-row>${cell(titleStyle, tuneData.displayName || tuneName)}</table:table-row>`);

	const mainPattern = patterns.find(([name]) => name === "Tune")?.[1];
	if (mainPattern) {
		const speed = mainPattern.speed ?? tuneData.speed ?? DEFAULT_SPEED;
		body.push(textRow(styles, `Tempo : ${speed} BPM — ${mainPattern.time}/4`, "tempo", 11, false));
	}
	if (maestrationLabel)
		body.push(textRow(styles, `Gestes : ${maestrationLabel}`, "gestes", 11, false));
	body.push(blankRow(styles));

	for (const [patternName, pattern] of patterns) {
		const isMainTune = patternName === "Tune";
		body.push(textRow(styles, isMainTune ? "Groove" : (pattern.displayName || patternName), isMainTune ? "groove-heading" : "break-heading", isMainTune ? 12 : 10, true));
		body.push(renderPatternRows(styles, pattern, !isMainTune));
		body.push(blankRow(styles));
	}

	const columnsXml = `<table:table-column table:style-name="colLabel"/><table:table-column table:style-name="colStroke" table:number-columns-repeated="${columnCount}"/>`;

	const content = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" office:version="1.3">
<office:automatic-styles>
<style:style style:name="colLabel" style:family="table-column"><style:table-column-properties style:column-width="4cm"/></style:style>
<style:style style:name="colStroke" style:family="table-column"><style:table-column-properties style:column-width="0.65cm"/></style:style>
${styles.toXml()}
</office:automatic-styles>
<office:body><office:spreadsheet><table:table table:name="${escapeXml(tuneName)}">
${columnsXml}
${body.join("\n")}
</table:table></office:spreadsheet></office:body>
</office:document-content>`;

	// A4 landscape, scaled to fit exactly 1 page wide (loext:scale-to-X) regardless of column count — the same
	// "fit width, let height flow" trick the official sheetbook uses (fo:page-width 148mm / scale-to-X 1 /
	// scale-to-Y 4 on A6 landscape in funk.ods, whose Groove doesn't fit one page — confirmed by inspecting a
	// real official .ods, not just the styling guide text). scale-to-Y caps how many pages tall it may spill
	// onto; 10 comfortably covers our longest tune (Rap's 192-column Groove) without visibly shrinking shorter ones.
	const stylesXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:loext="urn:org:documentfoundation:names:experimental:office:xmlns:loext:1.0" office:version="1.3">
<office:styles><style:style style:name="Default" style:family="table-cell"/></office:styles>
<office:automatic-styles><style:page-layout style:name="pm1"><style:page-layout-properties fo:page-width="297mm" fo:page-height="210mm" style:print-orientation="landscape" fo:margin="10mm" loext:scale-to-X="1" loext:scale-to-Y="10"/></style:page-layout></office:automatic-styles>
<office:master-styles><style:master-page style:name="Default" style:page-layout-name="pm1"/></office:master-styles>
</office:document-styles>`;

	const metaXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"><office:meta/></office:document-meta>`;

	const manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3">
<manifest:file-entry manifest:full-path="/" manifest:version="1.3" manifest:media-type="application/vnd.oasis.opendocument.spreadsheet"/>
<manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
<manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
<manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`;

	return buildZip([
		{ name: "mimetype", data: "application/vnd.oasis.opendocument.spreadsheet" },
		{ name: "META-INF/manifest.xml", data: manifestXml },
		{ name: "content.xml", data: content },
		{ name: "styles.xml", data: stylesXml },
		{ name: "meta.xml", data: metaXml }
	]);
}
