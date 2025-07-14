// components/Modal.tsx
import { ReactNode, useEffect } from "react";

export default function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/40 backdrop-blur-sm
      "
      onClick={onClose}             /* close on backdrop click */
    >
      <div
        className="
          w-full max-w-4xl max-h-[90vh] overflow-y-auto
          bg-white text-gray-900 rounded-xl shadow-xl
          p-8
        "
        onClick={(e) => e.stopPropagation()}   /* keep clicks inside */
      >
        {children}
      </div>
    </div>
  );
}
