import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { AuthIslandWrapper } from "@/components/providers/AuthIslandWrapper";
import { Button } from "@/components/ui/Button";
import CustomUserButton from "@/components/ui/CustomUserButton";

function NavbarContent() {
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isAuthenticated, isLoading } = useAuth(); // Use new hook directly

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || isMobileMenuOpen
                ? "bg-background/95 backdrop-blur-md border-b border-border py-3"
                : "bg-transparent py-5"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <a href="/" className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                            SmartCool Care
                        </a>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        {!isAuthenticated ? (
                            <>
                                <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                                    <a href="/#features" className="hover:text-foreground transition-colors">Features</a>
                                    <a href="/#pricing" className="hover:text-foreground transition-colors">Pricing</a>
                                </div>
                                <Button asChild variant="default" size="sm">
                                    <a href="/login">
                                        Sign In
                                    </a>
                                </Button>
                            </>
                        ) : (
                            <>
                                <a
                                    href="/dashboard"
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mr-4"
                                >
                                    Dashboard
                                </a>
                                <div className="flex items-center gap-3">
                                    <CustomUserButton />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile Hamburger */}
                    <div className="md:hidden flex items-center">
                        {isAuthenticated && (
                            <div className="mr-4"><CustomUserButton /></div>
                        )}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-muted-foreground hover:text-foreground p-2"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden pt-4 pb-2 animate-in fade-in slide-in-from-top-5 duration-200">
                        <div className="flex flex-col space-y-4 text-center">
                            {!isAuthenticated ? (
                                <>
                                    <a href="/#features" className="text-muted-foreground hover:text-foreground py-2" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                                    <a href="/#pricing" className="text-muted-foreground hover:text-foreground py-2" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
                                    <div className="pt-2 border-t border-border">
                                        <Button asChild className="w-full">
                                            <a href="/login" onClick={() => setIsMobileMenuOpen(false)}>Sign In</a>
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <a href="/dashboard" className="text-muted-foreground hover:text-foreground py-2 font-medium" onClick={() => setIsMobileMenuOpen(false)}>Go to Dashboard</a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default function Navbar({ enableAuth = true }: { enableAuth?: boolean }) {
    if (enableAuth) {
        return (
            <AuthIslandWrapper>
                <NavbarContent />
            </AuthIslandWrapper>
        );
    }
    // Consistent header with provider
    return (
        <AuthIslandWrapper>
            <NavbarContent />
        </AuthIslandWrapper>
    );
}
