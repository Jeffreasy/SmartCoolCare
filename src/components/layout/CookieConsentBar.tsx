import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";

export function CookieConsentBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70"
      role="region"
      aria-label="Cookie toestemming"
    >
      <Container className="py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            We gebruiken cookies voor basisfunctionaliteit.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              size="sm"
              className="bg-accent hover:bg-accent/90"
              aria-label="Cookies accepteren"
              onClick={() => setVisible(false)}
            >
              Accepteren
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              aria-label="Cookies weigeren"
              onClick={() => setVisible(false)}
            >
              Weigeren
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}

