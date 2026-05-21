import { type ReactNode } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { modalVariants } from "@/lib/motion";

export function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-3xl border"
            style={{
              background: "var(--card)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            {title && (
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h3
                  style={{
                    fontFamily: "var(--font-apfel-fett)",
                    fontWeight: 800,
                  }}
                  className="text-lg"
                >
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="hover:bg-muted rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
