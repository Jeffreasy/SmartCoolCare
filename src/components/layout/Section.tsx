import { Container } from "./Container";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
    id?: string;
    children: ReactNode;
    className?: string;
    background?: string;
}

export function Section({ id, children, className, background }: SectionProps) {
    return (
        <section
            id={id}
            className={cn(
                "py-16 lg:py-24 scroll-mt-20 md:scroll-mt-24",
                background,
                className
            )}
        >
            <Container>{children}</Container>
        </section>
    );
}
