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
    const getImageUrl = (img: any) => {
        if (!img || !img.image_url) {
            return "https://placehold.co/600x800?text=No+Image";
        }
        const url = img.image_url;
        if (!url || url.trim() === '') {
            return "https://placehold.co/600x800?text=No+Image";
        }
        const trimmedUrl = url.trim();
        if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
            return trimmedUrl;
        }
        // Relative path - prepend backend URL
        const backendUrl = typeof window !== 'undefined'
            ? (process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000')
            : 'http://localhost:8000';
        return `${backendUrl}${trimmedUrl.startsWith('/') ? trimmedUrl : '/' + trimmedUrl}`;
    };

    // Sort images: primary first, then others
    const sortedImages = product.images && product.images.length > 0
        ? [...product.images].sort((a, b) => {
            if (a.is_primary) return -1;
            if (b.is_primary) return 1;
            return 0;
        })
        : [];

    const mainImage = sortedImages.length > 0 ? getImageUrl(sortedImages[0]) : "https://placehold.co/600x800?text=No+Image";
    const hoverImage = sortedImages.length > 1 ? getImageUrl(sortedImages[1]) : mainImage;

    // Calculate stock from variants
    const inStock = product.variants?.some(v => v.stock_quantity > 0) ?? false;

    return (
        <div
            className="group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-border"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link href={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden bg-muted">
                <img
                    src={mainImage}
                    alt={product.name}
                    className={cn(
                        "h-full w-full object-cover transition-all duration-700 ease-out",
                        isHovered && hoverImage !== mainImage ? "opacity-0 scale-110" : "opacity-100 scale-100"
                    )}
                    onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        if (target.src !== "https://placehold.co/600x800?text=No+Image") {
                            target.src = "https://placehold.co/600x800?text=No+Image";
                        }
                    }}
                />
                {hoverImage !== mainImage && (
                    <img
                        src={hoverImage}
                        alt={product.name}
                        className={cn(
                            "absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out",
                            isHovered ? "opacity-100 scale-100" : "opacity-0 scale-110"
                        )}
                        onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement;
                            if (target.src !== "https://placehold.co/600x800?text=No+Image") {
                                target.src = "https://placehold.co/600x800?text=No+Image";
                            }
                        }}
                    />
                )}

                {/* Badges */}
                <div className="absolute left-3 top-3 flex flex-col gap-2 z-10">
                    {/* Placeholder for discount/new badges if added to API later */}
                    {!inStock && (
                        <span className="rounded-md bg-destructive px-2.5 py-1 text-xs font-semibold text-destructive-foreground shadow-md backdrop-blur-sm">
                            OUT OF STOCK
                        </span>
                    )}
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlistToggle}
                    disabled={isLoading}
                    className="absolute right-3 top-3 z-10 rounded-full bg-background/90 p-2.5 text-foreground backdrop-blur-md shadow-md transition-all duration-200 hover:bg-background hover:text-red-500 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <Heart className={cn("h-4 w-4 transition-all duration-200", isWishlisted && "fill-current text-red-500 scale-110")} />
                </button>

                {/* Quick Add (visible on hover) */}
                <div className={cn(
                    "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/95 via-background/80 to-transparent backdrop-blur-sm transition-all duration-300 ease-out",
                    isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                )}>
                    <Button 
                        className="w-full shadow-md hover:shadow-lg transition-shadow duration-200" 
                        size="sm" 
                        disabled={!inStock || isLoading}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleWishlistToggle(e);
                        }}
                    >
                        Quick Add
                    </Button>
                </div>
            </Link>

            <div className="flex flex-1 flex-col p-5">
                <div className="mb-auto">
                    {/* Brand is not in API yet, hiding or using placeholder */}
                    {/* <p className="text-xs text-muted-foreground mb-1">{product.brand}</p> */}
                    <Link href={`/product/${product.id}`} className="font-semibold text-base leading-tight hover:text-primary transition-colors duration-200 line-clamp-2">
                        {product.name}
                    </Link>
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">₹{(product.base_price ?? 0).toFixed(2)}</span>
                    {/* Original price / discount logic would go here if available in API */}
                </div>
            </div>
        </div>
    );
}
