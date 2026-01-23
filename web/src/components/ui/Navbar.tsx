import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated, useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import ConvexAuthProvider from "../ConvexAuthProvider";

export default function Navbar({ enableAuth = true }: { enableAuth?: boolean }) {
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const NavContent = () => (
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
                        {enableAuth ? (
                            <>
                                <SignedOut>
                                    <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                                        <a href="/#features" className="hover:text-foreground transition-colors">Features</a>
                                        <a href="/#pricing" className="hover:text-foreground transition-colors">Pricing</a>
                                    </div>
                                    <a
                                        href="/login"
                                        className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-foreground text-sm font-medium transition-all border border-border backdrop-blur-sm"
                                    >
                                        Sign In
                                    </a>
                                </SignedOut>

                                <SignedIn>
                                    <a
                                        href="/dashboard"
                                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mr-4"
                                    >
                                        Dashboard
                                    </a>
                                    <div className="flex items-center gap-3">
                                        <UserButton
                                            afterSignOutUrl="/"
                                            appearance={{
                                                elements: {
                                                    avatarBox: "w-9 h-9 border-2 border-border"
                                                }
                                            }}
                                        />
                                    </div>
                                </SignedIn>
                            </>
                        ) : (
                            <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                                <a href="/" className="hover:text-foreground transition-colors">Home</a>
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger */}
                    <div className="md:hidden flex items-center">
                        {enableAuth && (
                            <SignedIn>
                                <div className="mr-4"><UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-8 h-8" } }} /></div>
                            </SignedIn>
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
                            {enableAuth ? (
                                <>
                                    <SignedOut>
                                        <a href="/#features" className="text-muted-foreground hover:text-foreground py-2" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                                        <a href="/#pricing" className="text-muted-foreground hover:text-foreground py-2" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
                                        <div className="pt-2 border-t border-border">
                                            <a href="/login" className="block w-full py-3 bg-primary rounded-lg text-primary-foreground font-medium" onClick={() => setIsMobileMenuOpen(false)}>Sign In</a>
                                        </div>
                                    </SignedOut>
                                    <SignedIn>
                                        <a href="/dashboard" className="text-muted-foreground hover:text-foreground py-2 font-medium" onClick={() => setIsMobileMenuOpen(false)}>Go to Dashboard</a>
                                    </SignedIn>
                                </>
                            ) : (
                                <a href="/" className="text-muted-foreground hover:text-foreground py-2" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );

    if (enableAuth) {
        return (
            <ConvexAuthProvider>
                <NavContent />
            </ConvexAuthProvider>
        );
    }

    return <NavContent />;
}
