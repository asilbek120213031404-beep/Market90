import { supabase } from "./supabase";

const BUCKET = "product-images";
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB — bucket chegarasi bilan bir xil
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/** Rasmni Supabase Storage'ga yuklaydi va ochiq URL qaytaradi */
export const uploadProductImage = async (file: File): Promise<string> => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Faqat JPG, PNG, WEBP yoki GIF rasm yuklash mumkin");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("Rasm hajmi 5 MB dan oshmasligi kerak");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "31536000", contentType: file.type });
  if (error) throw new Error(error.message);

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
};
