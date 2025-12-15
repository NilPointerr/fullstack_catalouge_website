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
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tight">LUXE</span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                pathname === link.href ? "text-foreground" : "text-muted-foreground"
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
                            className="h-9 w-56 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    )}
                    <button
                        type="button"
                        className="rounded-full p-2 hover:bg-accent"
                        onClick={() => setIsSearchOpen((prev) => !prev)}
                        aria-label="Search"
                    >
                        <Search className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                    </button>
                </form>

                    {/* Theme Toggle */}
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="rounded-full p-2 hover:bg-accent"
                    >
                        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 top-2" />
                        <span className="sr-only">Toggle theme</span>
                    </button>

                    {/* Wishlist */}
                    <Link href="/wishlist">
                        <Heart className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                    </Link>

                    {/* User Menu */}
                    {user ? (
                        <div className="relative">
                            <button
                                className="flex items-center gap-2 rounded-full p-2 hover:bg-accent"
                                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                                aria-label="User menu"
                            >
                                <User className="h-5 w-5" />
                            </button>
                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-44 rounded-md border bg-background shadow-lg p-2 space-y-1">
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <UserCircle2 className="h-4 w-4" />
                                        My Profile
                                    </Link>
                                    <button
                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left"
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
                        <Link href="/login" className="text-sm font-medium hover:underline">
                            Login
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t p-4 space-y-4 bg-background">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="block text-sm font-medium"
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
