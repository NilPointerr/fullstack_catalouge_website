/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Product {
    id: string;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    images: string[];
    inStock: boolean;
    isNew?: boolean;
}

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);

    return (
        <div
            className="group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link href={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden bg-muted">
                <img
                    src={product.images[0]}
                    alt={product.name}
                    className={cn(
                        "h-full w-full object-cover transition-all duration-500",
                        isHovered && product.images[1] ? "opacity-0" : "opacity-100"
                    )}
                />
                {product.images[1] && (
                    <img
                        src={product.images[1]}
                        alt={product.name}
                        className={cn(
                            "absolute inset-0 h-full w-full object-cover transition-all duration-500",
                            isHovered ? "opacity-100 scale-105" : "opacity-0"
                        )}
                    />
                )}

                {/* Badges */}
                <div className="absolute left-2 top-2 flex flex-col gap-1">
                    {product.discount && (
                        <span className="rounded bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">
                            -{product.discount}%
                        </span>
                    )}
                    {product.isNew && (
                        <span className="rounded bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                            NEW
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
                    <Button className="w-full" size="sm">
                        Quick Add
                    </Button>
                </div>
            </Link>

            <div className="flex flex-1 flex-col p-4">
                <div className="mb-auto">
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                    <Link href={`/product/${product.id}`} className="font-medium hover:underline">
                        {product.name}
                    </Link>
                </div>
                <div className="mt-2 flex items-center gap-2">
                    <span className="font-bold">${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                            ${product.originalPrice.toFixed(2)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
