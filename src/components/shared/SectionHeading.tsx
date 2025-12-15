import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TEXT_MUTED_LEAD } from "@/lib/styles";

export interface SectionHeadingProps {
    title: ReactNode;
    subtitle?: ReactNode;
    className?: string;
    titleClassName?: string;
    /**
     * If provided, this fully replaces the default subtitle styling.
     * Use this when a section needs a different subtitle style (e.g. no max-width).
     */
    subtitleClassName?: string;
}

export function SectionHeading({
    title,
    subtitle,
    className,
    titleClassName,
    subtitleClassName,
}: SectionHeadingProps) {
    return (
        <div className={cn("text-center space-y-4", className)}>
            <h2
                className={cn(
                    "text-3xl sm:text-4xl lg:text-5xl font-bold text-primary",
                    titleClassName
                )}
            >
                {title}
            </h2>
            {subtitle ? (
                <p
                    className={
                        subtitleClassName ??
                        `${TEXT_MUTED_LEAD} max-w-3xl mx-auto`
                    }
                >
                    {subtitle}
                </p>
            ) : null}
        </div>
    );
}

