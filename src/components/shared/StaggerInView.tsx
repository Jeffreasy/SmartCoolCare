import type { ReactNode } from "react";
import { motion, useReducedMotion, type HTMLMotionProps, type ViewportOptions } from "framer-motion";
import { staggerContainer } from "@/lib/animations/variants";
import { cn } from "@/lib/utils";

export type StaggerInViewProps = Omit<
    HTMLMotionProps<"div">,
    "initial" | "whileInView" | "variants" | "viewport"
> & {
    children: ReactNode;
    className?: string;
    viewport?: ViewportOptions;
};

export function StaggerInView({ children, className, viewport, ...props }: StaggerInViewProps) {
    const shouldReduceMotion = useReducedMotion();

    const variants = shouldReduceMotion
        ? {
              hidden: { opacity: 1 },
              visible: { opacity: 1 },
          }
        : staggerContainer;

    return (
        <motion.div
            {...props}
            initial="hidden"
            whileInView="visible"
            viewport={viewport ?? { once: true, margin: "-100px" }}
            variants={variants}
            className={cn(className)}
        >
            {children}
        </motion.div>
    );
}
