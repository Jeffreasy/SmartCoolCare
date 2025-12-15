import type { ReactNode } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { fadeInUp } from "@/lib/animations/variants";
import { cn } from "@/lib/utils";

export type FadeInUpBlockProps = Omit<HTMLMotionProps<"div">, "variants"> & {
    children: ReactNode;
    className?: string;
};

export function FadeInUpBlock({ children, className, ...props }: FadeInUpBlockProps) {
    const shouldReduceMotion = useReducedMotion();

    const variants = shouldReduceMotion
        ? {
              hidden: { opacity: 1, y: 0 },
              visible: { opacity: 1, y: 0 },
          }
        : fadeInUp;

    return (
        <motion.div {...props} variants={variants} className={cn(className)}>
            {children}
        </motion.div>
    );
}

