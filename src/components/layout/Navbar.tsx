import { Container } from "./Container";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DemoModal } from "@/components/shared/DemoModal";

const navLinks = [
    { name: "Home", href: "#hero", id: "hero" },
    { name: "Product", href: "#pricing", id: "pricing" },
    { name: "Features", href: "#comparison", id: "comparison" },
    { name: "FAQ", href: "#faq", id: "faq" },
    { name: "Contact", href: "#cta", id: "cta" },
];

export function Navbar() {
    const [open, setOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("hero");
    const [activeHash, setActiveHash] = useState(() =>
        typeof window !== "undefined" ? window.location.hash : ""
    );

    useEffect(() => {
        const sections = document.querySelectorAll("section[id]");
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: "-20% 0px -80% 0px" }
        );

        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const onHashChange = () => setActiveHash(window.location.hash);
        window.addEventListener("hashchange", onHashChange);
        return () => window.removeEventListener("hashchange", onHashChange);
    }, []);

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <Container className="flex h-16 items-center justify-between">
                    <a href="#hero" className="flex items-center gap-2 text-2xl font-bold text-primary">
                        <img
                            src="/Logo Koelkasten.svg"
                            alt="SmartCool Care Logo"
                            className="h-12 w-auto"
                        />
                        <span>SmartCool Care</span>
                    </a>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => {
                            const isActive =
                                activeSection === link.id || activeHash === link.href;

                            return (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document
                                            .querySelector(link.href)
                                            ?.scrollIntoView({ behavior: "smooth" });
                                        window.history.replaceState(null, "", link.href);
                                        setActiveHash(link.href);
                                    }}
                                    className={cn(
                                        "text-sm font-medium text-muted-foreground hover:text-primary transition-colors",
                                        // hover underline effect (exact as requested)
                                        "relative after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-0 after:h-0.5 after:bg-accent after:transition-all after:duration-300 hover:after:w-full",
                                        isActive && "font-bold text-accent after:w-full"
                                    )}
                                >
                                    {link.name}
                                </a>
                            );
                        })}
                        <DemoModal
                            triggerText="Demo Aanvragen"
                            triggerSize="sm"
                            triggerClassName="bg-accent hover:bg-accent/90"
                        />
                    </nav>

                    {/* Mobile nav */}
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <div className="flex flex-col gap-6 mt-8">
                                <a
                                    href="#hero"
                                    className="flex items-center gap-2 text-2xl font-bold text-primary"
                                >
                                    <img
                                        src="/Logo Koelkasten.svg"
                                        alt="SmartCool Care Logo"
                                        className="h-12 w-auto"
                                    />
                                    <span>SmartCool Care</span>
                                </a>
                                <nav className="flex flex-col gap-4">
                                    {navLinks.map((link) => {
                                        const isActive =
                                            activeSection === link.id ||
                                            activeHash === link.href;

                                        return (
                                            <a
                                                key={link.name}
                                                href={link.href}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    document
                                                        .querySelector(link.href)
                                                        ?.scrollIntoView({
                                                            behavior: "smooth",
                                                        });
                                                    window.history.replaceState(
                                                        null,
                                                        "",
                                                        link.href
                                                    );
                                                    setActiveHash(link.href);
                                                    setOpen(false);
                                                }}
                                                className={cn(
                                                    "text-lg font-medium text-muted-foreground hover:text-primary transition-colors",
                                                    // hover underline effect (exact as requested)
                                                    "relative after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-0 after:h-0.5 after:bg-accent after:transition-all after:duration-300 hover:after:w-full",
                                                    isActive &&
                                                        "font-bold text-accent after:w-full"
                                                )}
                                            >
                                                {link.name}
                                            </a>
                                        );
                                    })}
                                </nav>
                                <DemoModal
                                    triggerText="Demo Aanvragen"
                                    triggerClassName="bg-accent hover:bg-accent/90 w-full"
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                </Container>
            </header>
        </>
    );
}
