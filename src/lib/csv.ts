/**
 * CSV yordamchilari. Excel (o'zbek/rus lokali) ";" ajratgichni kutadi,
 * BOM esa kirill/lotin harflari to'g'ri ochilishi uchun kerak.
 */

const DELIMITER = ";";

const escapeCell = (value: unknown) => {
  const s = value == null ? "" : String(value);
  return /[";\n\r,]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const toCSV = (headers: string[], rows: unknown[][]) =>
  "﻿" +
  [headers, ...rows].map((row) => row.map(escapeCell).join(DELIMITER)).join("\r\n");

export const downloadFile = (content: string, filename: string, type = "text/csv;charset=utf-8") => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/** CSV matnini qatorlarga ajratadi; ajratgich (";" yoki ",") avtomatik aniqlanadi */
export const parseCSV = (text: string): string[][] => {
  const src = text.replace(/^﻿/, "");
  const firstLine = src.split(/\r?\n/, 1)[0] ?? "";
  const delim =
    (firstLine.match(/;/g)?.length ?? 0) >= (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else inQuotes = false;
      } else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === delim) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
};
