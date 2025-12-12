"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Tags,
    Users,
    Settings,
    LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        // In a real app, we would check the token validity and role here
        // For now, simple client-side check
        if (!isAuthenticated) {
            router.push("/login");
        } else if (user?.role !== "admin") {
            // router.push("/"); // Redirect non-admins
        }
    }, [isMounted, isAuthenticated, user, router]);

    if (!isMounted) return null;

    const sidebarLinks = [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Products", href: "/admin/products", icon: Package },
        { name: "Categories", href: "/admin/categories", icon: Tags },
        { name: "Customers", href: "/admin/customers", icon: Users },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-muted/40">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
                <div className="flex h-16 items-center border-b px-6">
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                        <span>LUXE Admin</span>
                    </Link>
                </div>
                <nav className="flex flex-col gap-2 px-4 py-6">
                    {sidebarLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                                    pathname === link.href
                                        ? "bg-muted text-primary"
                                        : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="mt-auto p-4 border-t">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                            logout();
                            router.push("/login");
                        }}
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 sm:ml-64">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
