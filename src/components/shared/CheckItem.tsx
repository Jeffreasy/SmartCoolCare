import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckItemProps {
    children: React.ReactNode;
    className?: string;
}

export function CheckItem({ children, className }: CheckItemProps) {
    return (
        <div className={cn("flex items-start gap-3", className)}>
            <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">{children}</span>
        </div>
    );
}
