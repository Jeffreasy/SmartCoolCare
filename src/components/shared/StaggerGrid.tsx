import type { ReactNode } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { staggerContainer } from "@/lib/animations/variants";
import { cn } from "@/lib/utils";

export type StaggerGridProps = Omit<HTMLMotionProps<"div">, "variants"> & {
    children: ReactNode;
    className?: string;
};

export function StaggerGrid({ children, className, ...props }: StaggerGridProps) {
    const shouldReduceMotion = useReducedMotion();

    const variants = shouldReduceMotion
        ? {
              hidden: { opacity: 1 },
              visible: { opacity: 1 },
          }
        : staggerContainer;

    return (
        <motion.div {...props} variants={variants} className={cn(className)}>
            {children}
        </motion.div>
    );
}

