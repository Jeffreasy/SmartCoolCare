import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated, useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import ConvexAuthProvider from "../ConvexAuthProvider";

export default function Navbar({ enableAuth = true }: { enableAuth?: boolean }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const NavContent = () => (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? "bg-slate-950/80 backdrop-blur-md border-b border-white/10 py-3"
                : "bg-transparent py-5"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <a href="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                        SmartCool Care
                    </a>
                </div>

                <div className="flex items-center gap-6">
                    {enableAuth ? (
                        <>
                            <SignedOut>
                                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
                                    <a href="/#features" className="hover:text-white transition-colors">Features</a>
                                    <a href="/#pricing" className="hover:text-white transition-colors">Pricing</a>
                                </div>
                                <a
                                    href="/login"
                                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all border border-white/10 backdrop-blur-sm"
                                >
                                    Sign In
                                </a>
                            </SignedOut>

                            <SignedIn>
                                <a
                                    href="/dashboard"
                                    className="text-sm font-medium text-slate-300 hover:text-white transition-colors mr-4"
                                >
                                    Dashboard
                                </a>
                                <div className="flex items-center gap-3">
                                    <UserButton
                                        afterSignOutUrl="/"
                                        appearance={{
                                            elements: {
                                                avatarBox: "w-9 h-9 border-2 border-white/20"
                                            }
                                        }}
                                    />
                                </div>
                            </SignedIn>
                        </>
                    ) : (
                        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
                            <a href="/" className="hover:text-white transition-colors">Home</a>
                        </div>
                    )}
                </div>
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
