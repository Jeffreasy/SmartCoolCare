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
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setMount(true);
            document.body.style.overflow = "hidden";
        } else {
            const timer = setTimeout(() => setMount(false), 300); // Wait for exit animation
            document.body.style.overflow = "unset";
            return () => clearTimeout(timer);
        }

        // Cleanup: ensure we unlock scroll if we unmount while open
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const handleTouchStart = (e: React.TouchEvent) => {
        setStartY(e.touches[0].clientY);
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const diff = e.touches[0].clientY - startY;
        if (diff > 0) {
            setCurrentY(diff); // Only allow dragging down
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        if (currentY > 150) {
            // If dragged down more than 150px, close
            onClose();
        }
        // Reset position
        setCurrentY(0);
    };

    if (!mount) return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-[99999] flex items-end justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            onClick={onClose}
        >
            <div
                className={`
                    w-full max-h-[92vh] bg-card/95 border-t border-border/50 rounded-t-2xl shadow-2xl flex flex-col 
                    transform transition-transform duration-300 ease-out
                `}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ transform: isOpen ? `translateY(${Math.max(0, currentY)}px)` : 'translateY(100%)' }}
            >
                {/* Drag Handle Area */}
                <div className="w-full flex justify-center pt-3 pb-2 shrink-0 cursor-grab active:cursor-grabbing" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-muted rounded-full" />
                </div>

                {/* Header */}
                {(title) && (
                    <div className="px-5 pb-4 shrink-0 flex justify-between items-center border-b border-border/10">
                        <div className="text-lg font-bold text-foreground">{title}</div>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-muted-foreground hover:text-foreground"
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
