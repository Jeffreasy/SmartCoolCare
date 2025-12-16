import { Container } from "./Container";

export function Footer() {
    return (
        <footer className="border-t bg-muted/50 py-12">
            <Container className="flex flex-col items-center gap-6 text-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <img
                        src="/Logo Koelkasten.svg"
                        alt="SmartCool Care Logo"
                        className="h-14 w-auto"
                    />
                    <span className="text-lg font-semibold text-foreground">SmartCool Care</span>
                </div>
                <div className="flex flex-col gap-2">
                    <p>© 2025 SmartCool Care. Alle rechten voorbehouden.</p>
                    <p>Prototype fase – Marktvalidatie Q1 2026</p>
                </div>
            </Container>
        </footer>
    );
}
