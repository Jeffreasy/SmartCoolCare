import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: React.ReactNode;
}

export default function MobileDrawer({
    isOpen,
    onClose,
    children,
    title
}: MobileDrawerProps) {
    const [mount, setMount] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setMount(true);
            document.body.style.overflow = "hidden";
        } else {
            const timer = setTimeout(() => setMount(false), 300); // Wait for exit animation
            document.body.style.overflow = "unset";
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!mount) return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-[99999] flex items-end justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            onClick={onClose}
        >
            <div
                className={`
                    w-full max-h-[92vh] bg-slate-900/95 border-t border-white/10 rounded-t-2xl shadow-2xl flex flex-col 
                    transform transition-transform duration-300 ease-out
                    ${isOpen ? "translate-y-0" : "translate-y-full"}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drag Handle Area */}
                <div className="w-full flex justify-center pt-3 pb-2 shrink-0" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-slate-700/50 rounded-full" />
                </div>

                {/* Header */}
                {(title) && (
                    <div className="px-5 pb-4 shrink-0 flex justify-between items-center border-b border-white/5">
                        <div className="text-lg font-bold text-white">{title}</div>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-slate-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-5 py-4 pb-12 custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
