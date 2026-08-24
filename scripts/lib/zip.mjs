// Minimal ZIP writer (STORE method only, no compression) — used to package an .ods file (which is just
// a ZIP of XML files) without needing an external dependency or the `zip` binary. Uncompressed entries are
// perfectly valid ZIP/ODF; the sheets we generate are small text, so the size cost doesn't matter.

const CRC_TABLE = (() => {
	const table = new Uint32Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++)
			c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
		table[n] = c >>> 0;
	}
	return table;
})();

function crc32(buffer) {
	let crc = 0xffffffff;
	for (let i = 0; i < buffer.length; i++)
		crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
	return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Builds a ZIP file (as a Buffer) from a list of { name, data } entries, in the given order.
 * `data` can be a Buffer or a string (encoded as UTF-8).
 */
export function buildZip(entries) {
	const localParts = [];
	const centralParts = [];
	let offset = 0;

	for (const { name, data } of entries) {
		const content = Buffer.isBuffer(data) ? data : Buffer.from(data, "utf-8");
		const nameBuf = Buffer.from(name, "utf-8");
		const crc = crc32(content);

		const localHeader = Buffer.alloc(30);
		localHeader.writeUInt32LE(0x04034b50, 0);
		localHeader.writeUInt16LE(20, 4); // version needed
		localHeader.writeUInt16LE(0, 6); // flags
		localHeader.writeUInt16LE(0, 8); // method: store
		localHeader.writeUInt16LE(0, 10); // mod time
		localHeader.writeUInt16LE(0, 12); // mod date
		localHeader.writeUInt32LE(crc, 14);
		localHeader.writeUInt32LE(content.length, 18); // compressed size
		localHeader.writeUInt32LE(content.length, 22); // uncompressed size
		localHeader.writeUInt16LE(nameBuf.length, 26);
		localHeader.writeUInt16LE(0, 28); // extra length

		localParts.push(localHeader, nameBuf, content);

		const centralHeader = Buffer.alloc(46);
		centralHeader.writeUInt32LE(0x02014b50, 0);
		centralHeader.writeUInt16LE(20, 4); // version made by
		centralHeader.writeUInt16LE(20, 6); // version needed
		centralHeader.writeUInt16LE(0, 8); // flags
		centralHeader.writeUInt16LE(0, 10); // method: store
		centralHeader.writeUInt16LE(0, 12); // mod time
		centralHeader.writeUInt16LE(0, 14); // mod date
		centralHeader.writeUInt32LE(crc, 16);
		centralHeader.writeUInt32LE(content.length, 20);
		centralHeader.writeUInt32LE(content.length, 24);
		centralHeader.writeUInt16LE(nameBuf.length, 28);
		centralHeader.writeUInt16LE(0, 30); // extra length
		centralHeader.writeUInt16LE(0, 32); // comment length
		centralHeader.writeUInt16LE(0, 34); // disk number start
		centralHeader.writeUInt16LE(0, 36); // internal attrs
		centralHeader.writeUInt32LE(0, 38); // external attrs
		centralHeader.writeUInt32LE(offset, 42); // local header offset

		centralParts.push(centralHeader, nameBuf);

		offset += localHeader.length + nameBuf.length + content.length;
	}

	const centralDirectory = Buffer.concat(centralParts);
	const centralDirectoryOffset = offset;

	const end = Buffer.alloc(22);
	end.writeUInt32LE(0x06054b50, 0);
	end.writeUInt16LE(0, 4); // disk number
	end.writeUInt16LE(0, 6); // disk with central dir
	end.writeUInt16LE(entries.length, 8); // entries on this disk
	end.writeUInt16LE(entries.length, 10); // total entries
	end.writeUInt32LE(centralDirectory.length, 12); // central dir size
	end.writeUInt32LE(centralDirectoryOffset, 16); // central dir offset
	end.writeUInt16LE(0, 20); // comment length

	return Buffer.concat([...localParts, centralDirectory, end]);
}
