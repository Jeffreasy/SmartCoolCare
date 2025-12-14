import { useEffect, useMemo, useState } from "react";
import { ArrowUpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

        const update = () => setPrefersReducedMotion(mediaQuery.matches);
        update();

        // Support both modern + older browsers
        if (typeof mediaQuery.addEventListener === "function") {
            mediaQuery.addEventListener("change", update);
            return () => mediaQuery.removeEventListener("change", update);
        }

        mediaQuery.addListener(update);
        return () => mediaQuery.removeListener(update);
    }, []);

    useEffect(() => {
        const onScroll = () => setIsVisible(window.scrollY > 500);
        onScroll();

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const animationClasses = useMemo(() => {
        if (prefersReducedMotion) return "";
        return "transition-all duration-300 ease-out";
    }, [prefersReducedMotion]);

    return (
        <div
            className={cn(
                "fixed bottom-32 sm:bottom-24 right-6 z-50",
                animationClasses,
                isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2 pointer-events-none"
            )}
        >
            <Button
                type="button"
                size="icon"
                variant="secondary"
                aria-label="Scroll naar boven"
                className="shadow"
                tabIndex={isVisible ? 0 : -1}
                onClick={() => {
                    window.scrollTo({
                        top: 0,
                        behavior: prefersReducedMotion ? "auto" : "smooth",
                    });
                }}
            >
                <ArrowUpCircle className="h-5 w-5" />
            </Button>
        </div>
    );
}

