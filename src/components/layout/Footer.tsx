import { Container } from "./Container";

export function Footer() {
    return (
        <footer className="border-t bg-muted/50 py-12">
            <Container className="flex flex-col items-center gap-4 text-center text-sm text-muted-foreground">
                <p>© 2025 SmartCool Care. Alle rechten voorbehouden.</p>
                <p>Prototype fase – Marktvalidatie Q1 2026</p>
            </Container>
        </footer>
    );
}
