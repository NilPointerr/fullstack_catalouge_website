"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Heart, User, Menu, X, Sun, Moon, LogOut, UserCircle2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { user, logout } = useAuthStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Catalog", href: "/catalog" },
        { name: "Showroom", href: "/showroom" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
            <div className="container flex h-16 items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="text-xl font-bold tracking-tight transition-colors group-hover:text-primary">LUXE</span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-all duration-200 relative",
                                pathname === link.href 
                                    ? "text-foreground after:absolute after:bottom-[-1.5rem] after:left-0 after:right-0 after:h-0.5 after:bg-primary" 
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Search */}
                <form
                    className="relative hidden md:flex items-center gap-2"
                    onSubmit={(e: FormEvent) => {
                        e.preventDefault();
                        if (searchTerm.trim()) {
                            router.push(`/catalog?search=${encodeURIComponent(searchTerm.trim())}`);
                            setIsSearchOpen(false);
                        }
                    }}
                >
                    {isSearchOpen && (
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search products..."
                            className="h-9 w-56 rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 opacity-100 translate-x-0"
                        />
                    )}
                    <button
                        type="button"
                        className="rounded-full p-2 hover:bg-accent transition-colors duration-200"
                        onClick={() => setIsSearchOpen((prev) => !prev)}
                        aria-label="Search"
                    >
                        <Search className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                    </button>
                </form>

                    {/* Theme Toggle */}
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="rounded-full p-2 hover:bg-accent transition-colors duration-200"
                    >
                        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 top-2" />
                        <span className="sr-only">Toggle theme</span>
                    </button>

                    {/* Wishlist */}
                    <Link href="/wishlist" className="rounded-full p-2 hover:bg-accent transition-colors duration-200">
                        <Heart className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                    </Link>

                    {/* User Menu */}
                    {user ? (
                        <div className="relative">
                            <button
                                className="flex items-center gap-2 rounded-full p-2 hover:bg-accent transition-colors duration-200"
                                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                                aria-label="User menu"
                            >
                                <User className="h-5 w-5" />
                            </button>
                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-44 rounded-lg border border-border/50 bg-background shadow-lg p-2 space-y-1 opacity-100 translate-y-0 transition-all duration-200">
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors duration-200"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <UserCircle2 className="h-4 w-4" />
                                        My Profile
                                    </Link>
                                    <button
                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left transition-colors duration-200"
                                        onClick={() => {
                                            logout();
                                            setIsUserMenuOpen(false);
                                            router.push("/login");
                                        }}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors duration-200">
                            Login
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden rounded-full p-2 hover:bg-accent transition-colors duration-200"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-border/50 p-4 space-y-3 bg-background transition-all duration-200">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "block text-sm font-medium py-2 px-2 rounded-md transition-colors duration-200",
                                pathname === link.href 
                                    ? "text-foreground bg-accent" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
}
