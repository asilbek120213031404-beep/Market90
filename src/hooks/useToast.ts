import { useCallback, useEffect, useRef, useState } from "react";

export interface Toast {
  type: "success" | "error";
  msg: string;
}

/**
 * Vaqtinchalik xabar. Taymer komponent yopilganda bekor qilinadi,
 * shuning uchun `onDone` (masalan navigate) sahifadan chiqib ketilgach ishlamaydi.
 */
export const useToast = (duration = 3000) => {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const showToast = useCallback(
    (t: Toast, onDone?: () => void) => {
      window.clearTimeout(timer.current);
      setToast(t);
      timer.current = window.setTimeout(() => {
        setToast(null);
        onDone?.();
      }, duration);
    },
    [duration]
  );

  return { toast, showToast };
};
