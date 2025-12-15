/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Product } from "@/lib/api";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Helper to get image URL
    const getImageUrl = (index: number) => {
        if (product.images && product.images.length > index) {
            return product.images[index].image_url;
        }
        return "https://placehold.co/600x800?text=No+Image"; // Fallback
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
                    onClick={(e) => {
                        e.preventDefault();
                        setIsWishlisted(!isWishlisted);
                    }}
                    className="absolute right-2 top-2 rounded-full bg-background/80 p-2 text-foreground backdrop-blur-sm transition-colors hover:bg-background hover:text-red-500"
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
                    <span className="font-bold">${product.base_price.toFixed(2)}</span>
                    {/* Original price / discount logic would go here if available in API */}
                </div>
            </div>
        </div>
    );
}
