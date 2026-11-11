import { supabase } from "./supabase";

const BUCKET = "product-images";
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB — bucket chegarasi bilan bir xil (siqilgandan keyingi hajm)
const MAX_INPUT_SIZE = 25 * 1024 * 1024; // 25 MB — siqishdan oldingi asl fayl chegarasi
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const MAX_DIMENSION = 1200; // uzun tomon, px
const QUALITY = 0.8;

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * Rasmni brauzerda kichraytiradi va WebP (bo'lmasa JPEG) ga siqadi.
 * GIF (animatsiya buzilmasligi uchun) va siqish foyda bermagan holatda asl fayl qaytadi.
 */
export const compressImage = async (file: File): Promise<Blob> => {
  if (file.type === "image/gif") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file; // brauzer o'qiy olmasa — asl faylni yuboramiz
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let blob = await canvasToBlob(canvas, "image/webp", QUALITY);
  // Ba'zi eski brauzerlar WebP o'rniga PNG qaytaradi — JPEG ga o'tamiz
  if (!blob || blob.type !== "image/webp") {
    blob = await canvasToBlob(canvas, "image/jpeg", QUALITY);
  }

  return blob && blob.size < file.size ? blob : file;
};

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** Rasmni siqib, Supabase Storage'ga yuklaydi va ochiq URL qaytaradi */
export const uploadProductImage = async (file: File): Promise<string> => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Faqat JPG, PNG, WEBP yoki GIF rasm yuklash mumkin");
  }
  if (file.size > MAX_INPUT_SIZE) {
    throw new Error("Rasm hajmi 25 MB dan oshmasligi kerak");
  }

  const data = await compressImage(file);
  if (data.size > MAX_SIZE) {
    throw new Error("Rasm hajmi 5 MB dan oshmasligi kerak");
  }

  const contentType = data.type || file.type;
  const path = `${crypto.randomUUID()}.${EXT_BY_TYPE[contentType] ?? "jpg"}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, data, { cacheControl: "31536000", contentType });
  if (error) throw new Error(error.message);

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
};
