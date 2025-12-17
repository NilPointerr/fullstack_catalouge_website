"use client";

import { ProductCard } from "@/components/features/ProductCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { getWishlist, WishlistItem, Product } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { ArrowLeft } from "lucide-react";

export default function WishlistPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWishlist = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getWishlist();
            setWishlistItems(data);
        } catch (err: any) {
            console.error("Failed to fetch wishlist:", err);
            setError(err.response?.data?.detail || "Failed to load wishlist");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        fetchWishlist();
    }, [isAuthenticated, router, fetchWishlist]);

    // Refresh wishlist when page becomes visible (user navigates back)
    useEffect(() => {
        if (!isAuthenticated) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchWishlist();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isAuthenticated, fetchWishlist]);

    if (!isAuthenticated) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="container py-8">
                <div className="text-center">Loading wishlist...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-8">
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                    {error}
                </div>
            </div>
        );
    }

    const products = wishlistItems.map(item => item.product);

    return (
        <div className="container py-8">
            {/* Back Button - Mobile */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="mb-6 md:hidden -ml-2"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>
            
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
                <p className="text-muted-foreground">
                    {products.length} {products.length === 1 ? 'item' : 'items'}
                </p>
            </div>

            {products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard 
                            key={product.id} 
                            product={product}
                            onWishlistChange={fetchWishlist}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
                    <p className="text-muted-foreground mb-6">
                        Save items you love to your wishlist to revisit them later.
                    </p>
                    <Button asChild>
                        <Link href="/catalog">Start Shopping</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
