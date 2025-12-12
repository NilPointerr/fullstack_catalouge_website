"use client";

import { ProductCard } from "@/components/features/ProductCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Mock Data (in real app, fetch from store/API)
const wishlistProducts = Array.from({ length: 4 }).map((_, i) => ({
    id: `wish-${i}`,
    name: `Wishlist Item ${i + 1}`,
    brand: "Luxe Basics",
    price: 49.99 + i * 10,
    images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1503342217505-b0815a046baf?q=80&w=1000&auto=format&fit=crop",
    ],
    inStock: true,
}));

export default function WishlistPage() {
    return (
        <div className="container py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
                <p className="text-muted-foreground">
                    {wishlistProducts.length} items
                </p>
            </div>

            {wishlistProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {wishlistProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
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
