import { Separator } from "@/components/ui/separator";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";

type SectionDividerProps = {
  className?: string;
};

export function SectionDivider({ className }: SectionDividerProps) {
  return (
    <div className={cn("py-2 sm:py-3", className)} aria-hidden="true">
      <Container>
        <Separator className="bg-gradient-to-r from-transparent via-border to-transparent opacity-70" />
      </Container>
    </div>
  );
}

