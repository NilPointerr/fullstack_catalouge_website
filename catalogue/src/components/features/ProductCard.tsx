/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Product, addToWishlist, removeFromWishlist, getWishlist } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";

interface ProductCardProps {
    product: Product;
    onWishlistChange?: () => void;
}

export function ProductCard({ product, onWishlistChange }: ProductCardProps) {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [isHovered, setIsHovered] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Check if product is in wishlist on mount
    useEffect(() => {
        const checkWishlistStatus = async () => {
            if (!isAuthenticated) return;
            try {
                const wishlist = await getWishlist();
                const inWishlist = wishlist.some(item => item.product_id === product.id);
                setIsWishlisted(inWishlist);
            } catch (error) {
                console.error("Failed to check wishlist status:", error);
            }
        };
        checkWishlistStatus();
    }, [isAuthenticated, product.id]);

    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        setIsLoading(true);
        try {
            if (isWishlisted) {
                await removeFromWishlist(product.id);
                setIsWishlisted(false);
                // Refresh wishlist if callback provided (e.g., on wishlist page)
                if (onWishlistChange) {
                    onWishlistChange();
                }
            } else {
                await addToWishlist(product.id);
                setIsWishlisted(true);
                // Refresh wishlist if callback provided
                if (onWishlistChange) {
                    onWishlistChange();
                }
            }
        } catch (error: any) {
            console.error("Failed to update wishlist:", error);
            const errorMessage = error.response?.data?.detail || "Failed to update wishlist";
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to get image URL - prepend backend URL if relative path
    const getImageUrl = (index: number) => {
        if (!product.images || product.images.length === 0) {
            return "https://placehold.co/600x800?text=No+Image";
        }
        if (index >= product.images.length) {
            return "https://placehold.co/600x800?text=No+Image";
        }
        const url = product.images[index].image_url;
        if (!url) return "https://placehold.co/600x800?text=No+Image";
        if (url.startsWith("http://") || url.startsWith("https://")) {
            return url;
        }
        // Relative path - prepend backend URL
        const backendUrl = typeof window !== 'undefined'
            ? (process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000')
            : 'http://localhost:8000';
        return `${backendUrl}${url.startsWith('/') ? url : '/' + url}`;
    };

    const mainImage = getImageUrl(0);
    const hoverImage = getImageUrl(1);

    // Calculate stock from variants
    const inStock = product.variants?.some(v => v.stock_quantity > 0) ?? false;

    return (
        <div
            className="group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link href={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden bg-muted">
                <img
                    src={mainImage}
                    alt={product.name}
                    className={cn(
                        "h-full w-full object-cover transition-all duration-500",
                        isHovered && hoverImage !== mainImage ? "opacity-0" : "opacity-100"
                    )}
                />
                {hoverImage !== mainImage && (
                    <img
                        src={hoverImage}
                        alt={product.name}
                        className={cn(
                            "absolute inset-0 h-full w-full object-cover transition-all duration-500",
                            isHovered ? "opacity-100 scale-105" : "opacity-0"
                        )}
                    />
                )}

                {/* Badges */}
                <div className="absolute left-2 top-2 flex flex-col gap-1">
                    {/* Placeholder for discount/new badges if added to API later */}
                    {!inStock && (
                        <span className="rounded bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">
                            OUT OF STOCK
                        </span>
                    )}
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlistToggle}
                    disabled={isLoading}
                    className="absolute right-2 top-2 rounded-full bg-background/80 p-2 text-foreground backdrop-blur-sm transition-colors hover:bg-background hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Heart className={cn("h-4 w-4", isWishlisted && "fill-current text-red-500")} />
                </button>

                {/* Quick Add (visible on hover) */}
                <div className={cn(
                    "absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300",
                    isHovered ? "translate-y-0" : "translate-y-full"
                )}>
                    <Button className="w-full" size="sm" disabled={!inStock}>
                        Quick Add
                    </Button>
                </div>
            </Link>

            <div className="flex flex-1 flex-col p-4">
                <div className="mb-auto">
                    {/* Brand is not in API yet, hiding or using placeholder */}
                    {/* <p className="text-xs text-muted-foreground">{product.brand}</p> */}
                    <Link href={`/product/${product.id}`} className="font-medium hover:underline">
                        {product.name}
                    </Link>
                </div>
                <div className="mt-2 flex items-center gap-2">
                    <span className="font-bold">${(product.base_price ?? 0).toFixed(2)}</span>
                    {/* Original price / discount logic would go here if available in API */}
                </div>
            </div>
        </div>
    );
}
