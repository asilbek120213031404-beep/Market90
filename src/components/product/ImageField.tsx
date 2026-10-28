import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { uploadProductImage } from "../../lib/storage";

/**
 * Rasm maydoni: URL kiritish yoki fayl yuklash (Supabase Storage).
 * `showPreview` bo'lsa, katta oldindan ko'rish chiqadi.
 */
const ImageField = ({
  id,
  value,
  onChange,
  inputClassName,
  isDark,
  showPreview = false,
}: {
  id?: string;
  value: string;
  onChange: (url: string) => void;
  inputClassName: string;
  isDark: boolean;
  showPreview?: boolean;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      onChange(await uploadProductImage(file));
      setPreviewError(false);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          id={id}
          type="url"
          placeholder="https://example.com/image.jpg"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setPreviewError(false);
          }}
          className={inputClassName}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          title="Kompyuterdan rasm yuklash"
          className={`shrink-0 flex items-center gap-1.5 px-3 rounded-xl text-sm font-semibold border transition-colors
            disabled:opacity-60 disabled:cursor-wait
            ${isDark
              ? "border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600"
              : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
            }`}
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          <span className="hidden sm:inline">{uploading ? "Yuklanmoqda" : "Yuklash"}</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {uploadError && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
          <X size={13} /> {uploadError}
        </p>
      )}

      {showPreview && value && !previewError && (
        <div className={`mt-3 rounded-xl overflow-hidden h-40 border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
          <img
            src={value}
            alt="preview"
            className="w-full h-full object-cover"
            onError={() => setPreviewError(true)}
          />
        </div>
      )}
      {value && previewError && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
          <X size={13} /> Rasm yuklanmadi — URL ni tekshiring
        </p>
      )}
    </div>
  );
};

export default ImageField;
