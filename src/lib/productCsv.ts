import type { Product } from "../data/products";
import type { TableInsert, TableUpdate } from "../types/helpers";
import { calcProfit, formatDate } from "./format";
import { parseCSV, toCSV } from "./csv";

type ImportKey = "id" | "name" | "description" | "category" | "image_url" | "cost_price" | "selling_price";

/** Import qilinadigan ustunlar: sarlavha o'zbekcha nomi yoki inglizcha kaliti bilan taniladi */
const IMPORT_COLUMNS: { key: ImportKey; label: string }[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Nomi" },
  { key: "description", label: "Tavsif" },
  { key: "category", label: "Kategoriya" },
  { key: "image_url", label: "Rasm URL" },
  { key: "cost_price", label: "Tan narxi" },
  { key: "selling_price", label: "Sotish narxi" },
];

/** Faqat ma'lumot uchun — importda e'tiborga olinmaydi */
const INFO_HEADERS = ["Foyda %", "Qo'shilgan vaqti"];

export const productsToCSV = (products: Product[]) =>
  toCSV(
    [...IMPORT_COLUMNS.map((c) => c.label), ...INFO_HEADERS],
    products.map((p) => [
      p.id,
      p.name,
      p.description ?? "",
      p.category,
      p.image_url ?? "",
      p.cost_price,
      p.selling_price,
      calcProfit(p.cost_price, p.selling_price)?.pct ?? "",
      formatDate(p.created_at),
    ])
  );

export interface ImportResult {
  inserts: TableInsert<"products">[];
  updates: { id: string; name: string; changes: TableUpdate<"products"> }[];
  unchanged: number;
  errors: string[];
}

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

/** "12 500" / "12500,00" → 12500; noto'g'ri bo'lsa null */
const parsePrice = (raw: string) => {
  const n = Number(raw.replace(/[\s ']/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
};

/**
 * CSV matnidan import rejasini tuzadi.
 * ID bor qator — mavjud mahsulotni yangilaydi (faqat fayldagi ustunlar, faqat o'zgarganlari).
 * ID bo'sh qator — yangi mahsulot (nomi, kategoriya va ikkala narx majburiy).
 */
export const planImport = (text: string, products: Product[], categories: string[]): ImportResult => {
  const result: ImportResult = { inserts: [], updates: [], unchanged: 0, errors: [] };
  const rows = parseCSV(text);
  if (rows.length < 2) {
    result.errors.push("Faylda ma'lumot yo'q (sarlavha va kamida bitta qator kerak)");
    return result;
  }

  // Sarlavha → ustun indeksi
  const colIndex = new Map<ImportKey, number>();
  rows[0].forEach((h, i) => {
    const col = IMPORT_COLUMNS.find((c) => normalize(c.label) === normalize(h) || c.key === normalize(h));
    if (col && !colIndex.has(col.key)) colIndex.set(col.key, i);
  });
  if (!colIndex.has("id") && !colIndex.has("name")) {
    result.errors.push(`Sarlavhada "ID" yoki "Nomi" ustuni topilmadi`);
    return result;
  }

  const byId = new Map(products.map((p) => [p.id.toLowerCase(), p]));
  const categorySet = new Set(categories);
  const seenIds = new Set<string>();

  rows.slice(1).forEach((row, idx) => {
    const line = idx + 2;
    const get = (key: ImportKey) => {
      const i = colIndex.get(key);
      return i === undefined ? undefined : (row[i] ?? "").trim();
    };
    const rowErrors: string[] = [];
    const fail = (msg: string) => rowErrors.push(`${line}-qator: ${msg}`);

    const fields: TableUpdate<"products"> = {};
    const name = get("name");
    if (name !== undefined) {
      if (name) fields.name = name;
      else fail("nomi bo'sh");
    }
    const category = get("category");
    if (category !== undefined) {
      if (categorySet.has(category)) fields.category = category;
      else fail(category ? `"${category}" kategoriyasi mavjud emas` : "kategoriya bo'sh");
    }
    const description = get("description");
    if (description !== undefined) fields.description = description || null;
    const image = get("image_url");
    if (image !== undefined) fields.image_url = image || null;
    for (const key of ["cost_price", "selling_price"] as const) {
      const raw = get(key);
      if (raw === undefined) continue;
      const price = parsePrice(raw);
      if (price === null) fail(`${key === "cost_price" ? "tan narxi" : "sotish narxi"} noto'g'ri ("${raw}")`);
      else fields[key] = price;
    }

    const rawId = get("id");
    if (rawId) {
      const id = rawId.toLowerCase();
      const existing = byId.get(id);
      if (!existing) fail(`ID ${rawId} bo'yicha mahsulot topilmadi`);
      else if (seenIds.has(id)) fail(`ID ${id} faylda takrorlangan`);
      if (rowErrors.length || !existing) {
        result.errors.push(...rowErrors);
        return;
      }
      seenIds.add(id);

      const changes = Object.fromEntries(
        Object.entries(fields).filter(([k, v]) => existing[k as keyof Product] !== v)
      ) as TableUpdate<"products">;
      if (Object.keys(changes).length) result.updates.push({ id, name: existing.name, changes });
      else result.unchanged++;
      return;
    }

    if (!fields.name && name === undefined) fail("nomi kiritilmagan");
    if (!fields.category && category === undefined) fail("kategoriya kiritilmagan");
    if (fields.cost_price === undefined && get("cost_price") === undefined) fail("tan narxi kiritilmagan");
    if (fields.selling_price === undefined && get("selling_price") === undefined) fail("sotish narxi kiritilmagan");
    if (rowErrors.length) {
      result.errors.push(...rowErrors);
      return;
    }
    result.inserts.push({
      name: fields.name!,
      category: fields.category!,
      description: fields.description ?? null,
      image_url: fields.image_url ?? null,
      cost_price: fields.cost_price!,
      selling_price: fields.selling_price!,
    });
  });

  return result;
};
