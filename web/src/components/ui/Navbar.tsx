import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated, useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
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
                ? "bg-slate-950/95 backdrop-blur-md border-b border-white/10 py-3"
                : "bg-transparent py-5"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <a href="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                            SmartCool Care
                        </a>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        {enableAuth ? (
                            <>
                                <SignedOut>
                                    <div className="flex items-center gap-6 text-sm font-medium text-slate-300">
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
                            <div className="flex items-center gap-6 text-sm font-medium text-slate-300">
                                <a href="/" className="hover:text-white transition-colors">Home</a>
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
                            className="text-slate-300 hover:text-white p-2"
                        >
                            {isMobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
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
                                        <a href="/#features" className="text-slate-300 hover:text-white py-2" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                                        <a href="/#pricing" className="text-slate-300 hover:text-white py-2" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
                                        <div className="pt-2 border-t border-white/5">
                                            <a href="/login" className="block w-full py-3 bg-indigo-600 rounded-lg text-white font-medium" onClick={() => setIsMobileMenuOpen(false)}>Sign In</a>
                                        </div>
                                    </SignedOut>
                                    <SignedIn>
                                        <a href="/dashboard" className="text-slate-300 hover:text-white py-2 font-medium" onClick={() => setIsMobileMenuOpen(false)}>Go to Dashboard</a>
                                    </SignedIn>
                                </>
                            ) : (
                                <a href="/" className="text-slate-300 hover:text-white py-2" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
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
