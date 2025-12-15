import { useMemo, useRef, useState, type ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMediaQuery } from "@react-hook/media-query";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const demoFormSchema = z.object({
  name: z.string().min(2, "Naam moet minstens 2 karakters hebben"),
  company: z.string().min(2, "Bedrijf moet minstens 2 karakters hebben"),
  email: z.string().email("Ongeldig e-mailadres"),
  phone: z.string().optional(),
  message: z.string().optional(),
});

export type DemoModalFormValues = z.infer<typeof demoFormSchema>;

export type DemoModalProps = {
  triggerText?: string;
  triggerVariant?: ComponentProps<typeof Button>["variant"];
  triggerSize?: ComponentProps<typeof Button>["size"];
  triggerClassName?: string;
  onTriggerClick?: () => void;
  tierName?: "BASIS" | "PRO" | "ELITE";
};

const tierModalContent = {
  BASIS: {
    title: "Start met BASIS",
    description: "Test 1 week gratis in jouw keuken. Geen verplichtingen.",
  },
  PRO: {
    title: "Vraag Gratis Proefinstallatie",
    description: "Installeer op jullie medicatiekoelkast. Gratis pilot van 2 weken.",
  },
  ELITE: {
    title: "Plan Persoonlijk Adviesgesprek",
    description: "Persoonlijk advies voor vaccin-/medicatieopslag. Inclusief compliance-scan.",
  },
};

export function DemoModal({
  triggerText = "Gratis Demo Aanvragen",
  triggerVariant = "default",
  triggerSize = "lg",
  triggerClassName,
  onTriggerClick,
  tierName,
}: DemoModalProps) {
  const modalContent = tierName ? tierModalContent[tierName] : {
    title: "Gratis Demo Aanvragen",
    description: "Laat je gegevens achter en ontvang een demo van SmartCool Care.",
  };
  
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const { toast } = useToast();

  const form = useForm<DemoModalFormValues>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: { name: "", company: "", email: "", phone: "", message: "" },
  });

  const trigger = useMemo(
    () => (
      <Button
        variant={triggerVariant}
        size={triggerSize}
        className={cn("font-semibold", triggerClassName)}
        onClick={onTriggerClick}
      >
        {triggerText}
      </Button>
    ),
    [onTriggerClick, triggerClassName, triggerSize, triggerText, triggerVariant]
  );

  async function onSubmit(values: DemoModalFormValues) {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data: unknown = await response.json().catch(() => null);
      const errorMessage =
        typeof data === "object" && data && "error" in data && typeof data.error === "string"
          ? data.error
          : null;

      const ok =
        response.ok &&
        typeof data === "object" &&
        data !== null &&
        "ok" in data &&
        data.ok === true;

      if (!ok) {
        throw new Error(errorMessage ?? `Request failed (${response.status})`);
      }

      toast({
        title: "Aanvraag ontvangen!",
        description:
          "We nemen binnen 24 uur contact op. Bedankt voor je interesse in SmartCool Care.",
        duration: 5000,
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      toast({
        title: "Er ging iets mis",
        description:
          error instanceof Error && error.message
            ? error.message
            : "Probeer het later opnieuw.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  const content = (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Vul het formulier in en wij nemen binnen 24 uur contact op.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Naam</FormLabel>
                <FormControl>
                  <Input placeholder="Jouw naam" autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bedrijf / Instelling</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Naam organisatie"
                    autoComplete="organization"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="jouw@email.nl"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefoon (optioneel)</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="+31 6 12345678"
                    autoComplete="tel"
                    inputMode="tel"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bericht (optioneel)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Vertel ons over jouw situatie..."
                    className="min-h-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full font-semibold"
            disabled={isSubmitting}
            aria-label="Verstuur aanvraag"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Versturen..." : "Verstuur"}
          </Button>
        </form>
      </Form>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{modalContent.title}</DialogTitle>
            <DialogDescription>
              {modalContent.description}
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto rounded-t-2xl pb-10"
      >
        <SheetHeader className="pr-8">
          <SheetTitle>{modalContent.title}</SheetTitle>
          <SheetDescription>
            {modalContent.description}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4">{content}</div>
      </SheetContent>
    </Sheet>
  );
}

