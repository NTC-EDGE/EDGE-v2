import type { SpreadsheetTemplateConfig, DropdownFieldValidation } from "./spreadsheetTemplates";

function normalizeHeaderSlug(raw: string): string {
  if (!raw || typeof raw !== "string") return "";
  return raw
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s*\[[^\]]*\]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function unescapeXml(str: string): string {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, "&");
}

export function getExcelColumnLetter(colIndexZeroBased: number): string {
  let temp = colIndexZeroBased + 1;
  let letter = "";
  while (temp > 0) {
    const mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }
  return letter;
}

export function parseExcelColumnLetters(colLetters: string): number {
  let col = 0;
  const upper = colLetters.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    col = col * 26 + (upper.charCodeAt(i) - 64);
  }
  return col - 1;
}

function encodeUtf8(str: string): Uint8Array {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(str);
  }
  const utf8: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let charcode = str.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(
        0xe0 | (charcode >> 12),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    } else {
      i++;
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
  }
  return new Uint8Array(utf8);
}

function decodeUtf8(bytes: Uint8Array): string {
  if (typeof TextDecoder !== "undefined") {
    return new TextDecoder("utf-8").decode(bytes);
  }
  let out = "";
  let i = 0;
  while (i < bytes.length) {
    const c = bytes[i] ?? 0;
    if (c < 128) {
      out += String.fromCharCode(c);
      i++;
    } else if (c > 191 && c < 224) {
      const c2 = bytes[i + 1] ?? 0;
      out += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
      i += 2;
    } else {
      const c2 = bytes[i + 1] ?? 0;
      const c3 = bytes[i + 2] ?? 0;
      out += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      i += 3;
    }
  }
  return out;
}

// ── CRC32 Table & Calculation ───────────────────────────────────────────────
const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i] ?? 0;
    const tableVal = CRC32_TABLE[(crc ^ b) & 0xff] ?? 0;
    crc = (crc >>> 8) ^ tableVal;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// ── RFC 1951 Stored Deflate Encoder (Method 8) ──────────────────────────────
function deflateStored(raw: Uint8Array): Uint8Array {
  const maxBlock = 65535;
  const numBlocks = Math.max(1, Math.ceil(raw.length / maxBlock));
  const out = new Uint8Array(raw.length + numBlocks * 5);
  let inOffset = 0;
  let outOffset = 0;

  for (let b = 0; b < numBlocks; b++) {
    const isFinal = b === numBlocks - 1;
    const blockLen = Math.min(maxBlock, raw.length - inOffset);
    const nlen = (~blockLen) & 0xffff;

    out[outOffset++] = isFinal ? 0x01 : 0x00;
    out[outOffset++] = blockLen & 0xff;
    out[outOffset++] = (blockLen >>> 8) & 0xff;
    out[outOffset++] = nlen & 0xff;
    out[outOffset++] = (nlen >>> 8) & 0xff;

    out.set(raw.subarray(inOffset, inOffset + blockLen), outOffset);
    inOffset += blockLen;
    outOffset += blockLen;
  }

  return out;
}

// ── Minimal ZIP Writer (Method 8 Deflate) ───────────────────────────────────
interface ZipFileEntry {
  name: string;
  content: string;
}

function buildZipArchive(files: ZipFileEntry[]): Uint8Array {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encodeUtf8(file.name);
    const rawBytes = encodeUtf8(file.content);
    const compressedBytes = deflateStored(rawBytes);
    const crc = crc32(rawBytes);

    // Local file header (30 bytes + name)
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true); // signature
    lv.setUint16(4, 20, true); // version needed (2.0)
    lv.setUint16(6, 0, true); // flags
    lv.setUint16(8, 8, true); // compression method: 8 (DEFLATE)
    lv.setUint16(10, 0, true); // mod time
    lv.setUint16(12, 0x21, true); // mod date
    lv.setUint32(14, crc, true);
    lv.setUint32(18, compressedBytes.length, true);
    lv.setUint32(22, rawBytes.length, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // extra length
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, compressedBytes);

    // Central directory header (46 bytes + name)
    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(centralHeader.buffer);
    cv.setUint32(0, 0x02014b50, true); // signature
    cv.setUint16(4, 20, true); // version made by
    cv.setUint16(6, 20, true); // version needed
    cv.setUint16(8, 0, true); // flags
    cv.setUint16(10, 8, true); // compression method: 8 (DEFLATE)
    cv.setUint16(12, 0, true); // mod time
    cv.setUint16(14, 0x21, true); // mod date
    cv.setUint32(16, crc, true);
    cv.setUint32(20, compressedBytes.length, true);
    cv.setUint32(24, rawBytes.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true); // extra length
    cv.setUint16(32, 0, true); // comment length
    cv.setUint16(34, 0, true); // disk number
    cv.setUint16(36, 0, true); // internal attrs
    cv.setUint32(38, 0, true); // external attrs
    cv.setUint32(42, offset, true); // local header offset
    centralHeader.set(nameBytes, 46);

    centralParts.push(centralHeader);
    offset += localHeader.length + compressedBytes.length;
  }

  let centralSize = 0;
  for (const cp of centralParts) {
    centralSize += cp.length;
  }

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true); // EOCD signature
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  const totalLen = offset + centralSize + eocd.length;
  const result = new Uint8Array(totalLen);
  let pos = 0;
  for (const lp of localParts) {
    result.set(lp, pos);
    pos += lp.length;
  }
  for (const cp of centralParts) {
    result.set(cp, pos);
    pos += cp.length;
  }
  result.set(eocd, pos);
  return result;
}

// ── Clean Header Display for Excel ──────────────────────────────────────────
function getCleanDisplayHeader(rawHeader: string): string {
  // Strip "(Options: ...)" or "(Male | Female)" from the visual header in .xlsx since the cell has a real Excel dropdown
  if (rawHeader.includes("|") || /options:/i.test(rawHeader)) {
    return rawHeader
      .replace(/\s*\([^)]*options[^)]*\)/gi, "")
      .replace(/\s*\([^)]*\|[^)]*\)/g, "")
      .trim();
  }
  return rawHeader.trim();
}

// ── Generate OpenXML .xlsx Workbook Bytes with Native DataValidations ───────
export function generateXlsxBytes(config: SpreadsheetTemplateConfig): Uint8Array {
  const cleanHeaders = config.headers.map(getCleanDisplayHeader);
  const dropdownMap = new Map<number, DropdownFieldValidation>();

  const validations = config.dropdownValidations || [];
  for (let colIdx = 0; colIdx < config.headers.length; colIdx++) {
    const rawH = config.headers[colIdx] || "";
    const cleanH = cleanHeaders[colIdx] || "";
    const hSlug = normalizeHeaderSlug(cleanH);

    const matchedDv = validations.find((dv) => {
      const dvHeaderSlug = normalizeHeaderSlug(dv.header);
      const dvLabelSlug = normalizeHeaderSlug(dv.label);
      return (
        dv.header === rawH ||
        dv.header === cleanH ||
        (hSlug.length > 0 && (dvHeaderSlug === hSlug || dvLabelSlug === hSlug))
      );
    });

    if (matchedDv && matchedDv.allowedOptions.length > 0) {
      dropdownMap.set(colIdx, matchedDv);
    }
  }

  // Build Sheet 2 (DropdownLists) columns for each dropdown validation
  const dropdownCols: Array<{
    sheet1ColIdx: number;
    dv: DropdownFieldValidation;
    listColIndex: number;
  }> = [];
  let listIdx = 0;
  for (const [colIdx, dv] of dropdownMap.entries()) {
    dropdownCols.push({
      sheet1ColIdx: colIdx,
      dv,
      listColIndex: listIdx++,
    });
  }

  let maxDropdownRows = 0;
  for (const dc of dropdownCols) {
    if (dc.dv.allowedOptions.length > maxDropdownRows) {
      maxDropdownRows = dc.dv.allowedOptions.length;
    }
  }

  const sheet2RowsXml: string[] = [];
  for (let r = 0; r < maxDropdownRows; r++) {
    const rowNum = r + 1;
    const cellsXml: string[] = [];
    for (const dc of dropdownCols) {
      const optVal = dc.dv.allowedOptions[r];
      if (optVal !== undefined) {
        const colLet = getExcelColumnLetter(dc.listColIndex);
        cellsXml.push(
          `<c r="${colLet}${rowNum}" t="inlineStr"><is><t>${escapeXml(optVal)}</t></is></c>`
        );
      }
    }
    sheet2RowsXml.push(`<row r="${rowNum}">${cellsXml.join("")}</row>`);
  }

  const sheet2Xml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<sheetData>${sheet2RowsXml.join("")}</sheetData>` +
    `</worksheet>`;

  // Build Sheet 1 (Applicants)
  const colsXmlParts: string[] = [];
  for (let c = 0; c < cleanHeaders.length; c++) {
    const hText = cleanHeaders[c] || "";
    const s1Text = config.sampleRows[0]?.[c] || "";
    const s2Text = config.sampleRows[1]?.[c] || "";
    const maxLen = Math.max(hText.length, s1Text.length, s2Text.length, 14);
    const width = Math.min(48, Math.max(16, maxLen + 5));
    colsXmlParts.push(
      `<col min="${c + 1}" max="${c + 1}" width="${width}" customWidth="1"/>`
    );
  }

  const sheet1RowsXml: string[] = [];

  // Row 1: Styled Header Row (style s="1")
  const headerCellsXml: string[] = [];
  for (let c = 0; c < cleanHeaders.length; c++) {
    const colLet = getExcelColumnLetter(c);
    const hText = cleanHeaders[c] || "";
    headerCellsXml.push(
      `<c r="${colLet}1" s="1" t="inlineStr"><is><t>${escapeXml(hText)}</t></is></c>`
    );
  }
  sheet1RowsXml.push(`<row r="1" ht="26" customHeight="1">${headerCellsXml.join("")}</row>`);

  // Sample Rows (style s="2" text format)
  for (let rIdx = 0; rIdx < config.sampleRows.length; rIdx++) {
    const rowData = config.sampleRows[rIdx] || [];
    const rowNum = rIdx + 2;
    const rowCellsXml: string[] = [];
    for (let c = 0; c < cleanHeaders.length; c++) {
      const colLet = getExcelColumnLetter(c);
      const cellVal = rowData[c] ?? "";
      rowCellsXml.push(
        `<c r="${colLet}${rowNum}" s="2" t="inlineStr"><is><t>${escapeXml(cellVal)}</t></is></c>`
      );
    }
    sheet1RowsXml.push(`<row r="${rowNum}" ht="20" customHeight="1">${rowCellsXml.join("")}</row>`);
  }

  // Pre-format blank rows 4..50 as text cells (style s="2") so phone numbers / zip codes retain leading zeros
  for (let rowNum = config.sampleRows.length + 2; rowNum <= 50; rowNum++) {
    const blankCellsXml: string[] = [];
    for (let c = 0; c < cleanHeaders.length; c++) {
      const colLet = getExcelColumnLetter(c);
      blankCellsXml.push(`<c r="${colLet}${rowNum}" s="2"/>`);
    }
    sheet1RowsXml.push(`<row r="${rowNum}" ht="20">${blankCellsXml.join("")}</row>`);
  }

  // Build <dataValidations> for all dropdown columns (rows 2..500)
  const dataValidationItemsXml: string[] = [];
  for (const dc of dropdownCols) {
    const targetColLet = getExcelColumnLetter(dc.sheet1ColIdx);
    const listColLet = getExcelColumnLetter(dc.listColIndex);
    const numOpts = dc.dv.allowedOptions.length;
    const cleanFieldLabel = getCleanDisplayHeader(dc.dv.label || dc.dv.header);
    const previewOpts = dc.dv.allowedOptions.slice(0, 6).join(", ") + (numOpts > 6 ? ", ..." : "");
    const promptMsg = `Allowed values: ${previewOpts}`.slice(0, 240);
    const errorMsg = `Value must match one of the allowed options for "${cleanFieldLabel}". Please select from the dropdown arrow.`.slice(0, 240);

    dataValidationItemsXml.push(
      `<dataValidation type="list" errorStyle="stop" allowBlank="1" showInputMessage="1" showErrorMessage="1" ` +
        `errorTitle="Invalid ${escapeXml(cleanFieldLabel.slice(0, 24))}" ` +
        `error="${escapeXml(errorMsg)}" ` +
        `promptTitle="${escapeXml(cleanFieldLabel.slice(0, 32))}" ` +
        `prompt="${escapeXml(promptMsg)}" ` +
        `sqref="${targetColLet}2:${targetColLet}500">` +
        `<formula1>DropdownLists!$${listColLet}$1:$${listColLet}$${numOpts}</formula1>` +
        `</dataValidation>`
    );
  }

  const dataValidationsXml =
    dataValidationItemsXml.length > 0
      ? `<dataValidations count="${dataValidationItemsXml.length}">${dataValidationItemsXml.join("")}</dataValidations>`
      : "";

  const sheet1Xml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<sheetViews><sheetView tabSelected="1" workbookViewId="0">` +
    `<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>` +
    `</sheetView></sheetViews>` +
    `<cols>${colsXmlParts.join("")}</cols>` +
    `<sheetData>${sheet1RowsXml.join("")}</sheetData>` +
    dataValidationsXml +
    `</worksheet>`;

  const stylesXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<fonts count="2">` +
    `<font><sz val="11"/><color rgb="FF0F172A"/><name val="Calibri"/></font>` +
    `<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>` +
    `</fonts>` +
    `<fills count="3">` +
    `<fill><patternFill patternType="none"/></fill>` +
    `<fill><patternFill patternType="gray125"/></fill>` +
    `<fill><patternFill patternType="solid"><fgColor rgb="FF0F2C59"/><bgColor indexed="64"/></patternFill></fill>` +
    `</fills>` +
    `<borders count="2">` +
    `<border><left/><right/><top/><bottom/><diagonal/></border>` +
    `<border>` +
    `<left style="thin"><color rgb="FFCBD5E1"/></left>` +
    `<right style="thin"><color rgb="FFCBD5E1"/></right>` +
    `<top style="thin"><color rgb="FFCBD5E1"/></top>` +
    `<bottom style="thin"><color rgb="FFCBD5E1"/></bottom>` +
    `<diagonal/>` +
    `</border>` +
    `</borders>` +
    `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
    `<cellXfs count="3">` +
    `<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>` +
    `<xf numFmtId="49" fontId="1" fillId="2" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>` +
    `<xf numFmtId="49" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>` +
    `</cellXfs>` +
    `</styleSheet>`;

  const workbookXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ` +
    `xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
    `<sheets>` +
    `<sheet name="Applicants" sheetId="1" r:id="rId1"/>` +
    `<sheet name="DropdownLists" sheetId="2" state="hidden" r:id="rId2"/>` +
    `</sheets>` +
    `</workbook>`;

  const workbookRelsXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
    `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>` +
    `<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
    `</Relationships>`;

  const rootRelsXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
    `</Relationships>`;

  const contentTypesXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
    `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
    `<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
    `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
    `</Types>`;

  return buildZipArchive([
    { name: "[Content_Types].xml", content: contentTypesXml },
    { name: "_rels/.rels", content: rootRelsXml },
    { name: "xl/workbook.xml", content: workbookXml },
    { name: "xl/_rels/workbook.xml.rels", content: workbookRelsXml },
    { name: "xl/styles.xml", content: stylesXml },
    { name: "xl/worksheets/sheet1.xml", content: sheet1Xml },
    { name: "xl/worksheets/sheet2.xml", content: sheet2Xml },
  ]);
}

// ── Pure TypeScript RFC 1951 Inflate (Decompresses .xlsx files saved by Excel) ─
function inflateRaw(compressed: Uint8Array): Uint8Array {
  let bitPos = 0;
  const out: number[] = [];

  const readBits = (n: number): number => {
    let val = 0;
    for (let i = 0; i < n; i++) {
      const byteIdx = bitPos >>> 3;
      const bitIdx = bitPos & 7;
      const b = compressed[byteIdx] ?? 0;
      val |= ((b >>> bitIdx) & 1) << i;
      bitPos++;
    }
    return val;
  };

  interface HuffmanTree {
    counts: Uint16Array;
    symbols: Uint16Array;
  }

  const buildHuffman = (lengths: number[]): HuffmanTree => {
    const counts = new Uint16Array(16);
    for (const len of lengths) {
      if (len > 0 && len < 16) counts[len]++;
    }
    const offsets = new Uint16Array(16);
    let sum = 0;
    for (let i = 1; i < 16; i++) {
      offsets[i] = sum;
      sum += counts[i] ?? 0;
    }
    const symbols = new Uint16Array(lengths.length);
    for (let i = 0; i < lengths.length; i++) {
      const len = lengths[i] ?? 0;
      if (len > 0) {
        const off = offsets[len] ?? 0;
        symbols[off] = i;
        offsets[len] = off + 1;
      }
    }
    return { counts, symbols };
  };

  const decodeSymbol = (tree: HuffmanTree): number => {
    let code = 0;
    let first = 0;
    let index = 0;
    for (let len = 1; len < 16; len++) {
      code |= readBits(1);
      const count = tree.counts[len] ?? 0;
      if (code - count < first) {
        return tree.symbols[index + (code - first)] ?? 0;
      }
      index += count;
      first += count;
      first <<= 1;
      code <<= 1;
    }
    return 0;
  };

  const fixedLitLengths: number[] = [];
  for (let i = 0; i <= 143; i++) fixedLitLengths.push(8);
  for (let i = 144; i <= 255; i++) fixedLitLengths.push(9);
  for (let i = 256; i <= 279; i++) fixedLitLengths.push(7);
  for (let i = 280; i <= 287; i++) fixedLitLengths.push(8);
  const fixedLitTree = buildHuffman(fixedLitLengths);

  const fixedDistLengths: number[] = [];
  for (let i = 0; i < 32; i++) fixedDistLengths.push(5);
  const fixedDistTree = buildHuffman(fixedDistLengths);

  const lengthBase = [
    3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
    35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258,
  ];
  const lengthExtra = [
    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2,
    3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0,
  ];
  const distBase = [
    1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
    257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577,
  ];
  const distExtra = [
    0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6,
    7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13,
  ];
  const clOrder = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

  let bfinal = 0;
  while (!bfinal && (bitPos >>> 3) < compressed.length) {
    bfinal = readBits(1);
    const btype = readBits(2);

    if (btype === 0) {
      // Align to next byte boundary
      if ((bitPos & 7) !== 0) {
        bitPos = (bitPos + 7) & ~7;
      }
      const bytePos = bitPos >>> 3;
      const len = (compressed[bytePos] ?? 0) | ((compressed[bytePos + 1] ?? 0) << 8);
      bitPos += 32; // skip len and nlen
      const dataStart = bitPos >>> 3;
      for (let i = 0; i < len; i++) {
        out.push(compressed[dataStart + i] ?? 0);
      }
      bitPos += len * 8;
    } else if (btype === 1 || btype === 2) {
      let litTree = fixedLitTree;
      let distTree = fixedDistTree;

      if (btype === 2) {
        const hlit = readBits(5) + 257;
        const hdist = readBits(5) + 1;
        const hclen = readBits(4) + 4;
        const clLengths = new Array<number>(19).fill(0);
        for (let i = 0; i < hclen; i++) {
          const idx = clOrder[i] ?? 0;
          clLengths[idx] = readBits(3);
        }
        const clTree = buildHuffman(clLengths);
        const allLengths: number[] = [];
        while (allLengths.length < hlit + hdist) {
          const sym = decodeSymbol(clTree);
          if (sym < 16) {
            allLengths.push(sym);
          } else if (sym === 16) {
            const repeat = readBits(2) + 3;
            const prev = allLengths[allLengths.length - 1] ?? 0;
            for (let r = 0; r < repeat; r++) allLengths.push(prev);
          } else if (sym === 17) {
            const repeat = readBits(3) + 3;
            for (let r = 0; r < repeat; r++) allLengths.push(0);
          } else if (sym === 18) {
            const repeat = readBits(7) + 11;
            for (let r = 0; r < repeat; r++) allLengths.push(0);
          }
        }
        litTree = buildHuffman(allLengths.slice(0, hlit));
        distTree = buildHuffman(allLengths.slice(hlit, hlit + hdist));
      }

      while (true) {
        const sym = decodeSymbol(litTree);
        if (sym === 256) break;
        if (sym < 256) {
          out.push(sym);
        } else {
          const lenIdx = sym - 257;
          const length = (lengthBase[lenIdx] ?? 3) + readBits(lengthExtra[lenIdx] ?? 0);
          const distSym = decodeSymbol(distTree);
          const dist = (distBase[distSym] ?? 1) + readBits(distExtra[distSym] ?? 0);
          const startPos = out.length - dist;
          for (let i = 0; i < length; i++) {
            out.push(out[startPos + i] ?? 0);
          }
        }
      }
    } else {
      break;
    }
  }

  return new Uint8Array(out);
}

// ── Read ZIP Entries from .xlsx Bytes ───────────────────────────────────────
function readZipEntries(zipBytes: Uint8Array): Map<string, string> {
  const entries = new Map<string, string>();
  const view = new DataView(zipBytes.buffer, zipBytes.byteOffset, zipBytes.byteLength);

  // Locate End of Central Directory (EOCD)
  let eocdOffset = -1;
  for (let i = zipBytes.length - 22; i >= Math.max(0, zipBytes.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) {
    return entries;
  }

  const totalEntries = view.getUint16(eocdOffset + 10, true);
  let cdOffset = view.getUint32(eocdOffset + 16, true);

  for (let e = 0; e < totalEntries && cdOffset + 46 <= zipBytes.length; e++) {
    if (view.getUint32(cdOffset, true) !== 0x02014b50) break;

    const method = view.getUint16(cdOffset + 10, true);
    const compSize = view.getUint32(cdOffset + 20, true);
    const nameLen = view.getUint16(cdOffset + 28, true);
    const extraLen = view.getUint16(cdOffset + 30, true);
    const commentLen = view.getUint16(cdOffset + 32, true);
    const localHeaderOffset = view.getUint32(cdOffset + 42, true);

    const nameBytes = zipBytes.subarray(cdOffset + 46, cdOffset + 46 + nameLen);
    const fileName = decodeUtf8(nameBytes);

    cdOffset += 46 + nameLen + extraLen + commentLen;

    if (
      fileName === "xl/sharedStrings.xml" ||
      fileName === "xl/worksheets/sheet1.xml"
    ) {
      if (localHeaderOffset + 30 <= zipBytes.length) {
        const localNameLen = view.getUint16(localHeaderOffset + 26, true);
        const localExtraLen = view.getUint16(localHeaderOffset + 28, true);
        const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen;
        const compData = zipBytes.subarray(dataStart, dataStart + compSize);

        if (method === 0) {
          entries.set(fileName, decodeUtf8(compData));
        } else if (method === 8) {
          const decompressed = inflateRaw(compData);
          entries.set(fileName, decodeUtf8(decompressed));
        }
      }
    }
  }

  return entries;
}

function excelSerialToIsoDate(serial: number): string {
  const utcDays = Math.round(serial);
  const ms = Date.UTC(1899, 11, 30) + utcDays * 86400000;
  const d = new Date(ms);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isXlsxBinary(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04
  );
}

export function extractCsvFromXlsxBytes(xlsxBytes: Uint8Array): string {
  const entries = readZipEntries(xlsxBytes);
  const sheetXml = entries.get("xl/worksheets/sheet1.xml");
  if (!sheetXml) return "";

  // Parse sharedStrings.xml if present
  const sharedStrings: string[] = [];
  const sharedStringsXml = entries.get("xl/sharedStrings.xml");
  if (sharedStringsXml) {
    const siMatches = sharedStringsXml.match(/<si[\s>][\s\S]*?<\/si>/g) || [];
    for (const siBlock of siMatches) {
      const tMatches = siBlock.match(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g) || [];
      const combined = tMatches
        .map((tTag) => {
          const inner = tTag.replace(/^<t(?:\s[^>]*)?>/, "").replace(/<\/t>$/, "");
          return unescapeXml(inner);
        })
        .join("");
      sharedStrings.push(combined);
    }
  }

  // Parse rows in sheet1.xml
  const rowMatches = sheetXml.match(/<row[\s>][\s\S]*?<\/row>/g) || [];
  const parsedGrid: string[][] = [];
  let maxCols = 0;

  for (const rowBlock of rowMatches) {
    const cellMatches = rowBlock.match(/<c(?:\s[^>]*)?(?:\/>|>[\s\S]*?<\/c>)/g) || [];
    const rowCells: string[] = [];

    for (let cIdx = 0; cIdx < cellMatches.length; cIdx++) {
      const cellXml = cellMatches[cIdx] || "";
      if (cellXml.endsWith("/>")) continue;

      const refMatch = cellXml.match(/\br="([A-Za-z]+)\d+"/);
      const colPos = refMatch && refMatch[1] ? parseExcelColumnLetters(refMatch[1]) : cIdx;

      const typeMatch = cellXml.match(/\bt="([^"]+)"/);
      const cellType = typeMatch ? typeMatch[1] : "";

      let cellValue = "";
      if (cellType === "inlineStr") {
        const tMatch = cellXml.match(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/);
        cellValue = tMatch && tMatch[1] !== undefined ? unescapeXml(tMatch[1]) : "";
      } else {
        const vMatch = cellXml.match(/<v(?:\s[^>]*)?>([\s\S]*?)<\/v>/);
        const rawV = vMatch && vMatch[1] !== undefined ? unescapeXml(vMatch[1].trim()) : "";
        if (cellType === "s") {
          const ssIdx = parseInt(rawV, 10);
          cellValue = !isNaN(ssIdx) ? (sharedStrings[ssIdx] ?? "") : rawV;
        } else if (cellType === "b") {
          cellValue = rawV === "1" ? "Yes" : "No";
        } else {
          cellValue = rawV;
        }
      }

      while (rowCells.length <= colPos) {
        rowCells.push("");
      }
      rowCells[colPos] = cellValue.trim();
    }

    if (rowCells.length > maxCols) {
      maxCols = rowCells.length;
    }
    if (rowCells.some((c) => c.length > 0)) {
      parsedGrid.push(rowCells);
    }
  }

  if (parsedGrid.length === 0) return "";

  // Check if any date columns contain Excel numeric serial dates (e.g. 34831 -> 1995-05-12)
  const headerRow = parsedGrid[0] || [];
  const dateColIndices = new Set<number>();
  for (let c = 0; c < headerRow.length; c++) {
    const hLower = (headerRow[c] || "").toLowerCase();
    if (hLower.includes("date") || hLower.includes("birth") || hLower.includes("expiry")) {
      dateColIndices.add(c);
    }
  }

  const escapeCsvCell = (val: string): string => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const csvLines = parsedGrid.map((row, rIdx) => {
    const padded: string[] = [];
    for (let c = 0; c < maxCols; c++) {
      let val = row[c] ?? "";
      if (rIdx > 0 && dateColIndices.has(c) && /^\d{5}$/.test(val)) {
        const num = parseInt(val, 10);
        if (num >= 10000 && num <= 65000) {
          val = excelSerialToIsoDate(num);
        }
      }
      padded.push(escapeCsvCell(val));
    }
    return padded.join(",");
  });

  return csvLines.join("\r\n");
}
