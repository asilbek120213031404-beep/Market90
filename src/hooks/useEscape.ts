import { useEffect, useRef } from "react";

/** Escape bosilganda chaqiriladi (modallarni yopish uchun) */
export const useEscape = (onEscape: () => void, enabled = true) => {
  const cb = useRef(onEscape);
  useEffect(() => {
    cb.current = onEscape;
  });

  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") cb.current();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [enabled]);
};
