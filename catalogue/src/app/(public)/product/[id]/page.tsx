"use client";

import { ProductGallery } from "@/components/features/ProductGallery";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Truck, ShieldCheck } from "lucide-react";
import { ProductCard } from "@/components/features/ProductCard";
import { useEffect, useState } from "react";
import { getProduct, searchProducts, Product, addToWishlist, removeFromWishlist, getWishlist } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const id = params?.id as string;
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const [productData, allProducts] = await Promise.all([
                    getProduct(id),
                    searchProducts("")
                ]);
                setProduct(productData);
                // Filter out current product and take 4
                setRelatedProducts(allProducts.filter(p => p.id !== productData.id).slice(0, 4));
            } catch (error) {
                console.error("Failed to fetch product data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Check if product is in wishlist
    useEffect(() => {
        const checkWishlistStatus = async () => {
            if (!isAuthenticated || !product) return;
            try {
                const wishlist = await getWishlist();
                const inWishlist = wishlist.some(item => item.product_id === product.id);
                setIsWishlisted(inWishlist);
            } catch (error) {
                console.error("Failed to check wishlist status:", error);
            }
        };
        checkWishlistStatus();
    }, [isAuthenticated, product]);

    const handleWishlistToggle = async () => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        if (!product) return;

        setIsWishlistLoading(true);
        try {
            if (isWishlisted) {
                await removeFromWishlist(product.id);
                setIsWishlisted(false);
            } else {
                await addToWishlist(product.id);
                setIsWishlisted(true);
            }
        } catch (error: any) {
            console.error("Failed to update wishlist:", error);
            const errorMessage = error.response?.data?.detail || "Failed to update wishlist";
            alert(errorMessage);
        } finally {
            setIsWishlistLoading(false);
        }
    };

    if (isLoading) {
        return <div className="container py-12 text-center">Loading product...</div>;
    }

    if (!product) {
        return <div className="container py-12 text-center">Product not found.</div>;
    }

    // Helper to get image URLs - prepend backend URL if relative path
    const getImageUrl = (url: string) => {
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
    
    const imageUrls = product.images.length > 0 
        ? product.images.map(img => getImageUrl(img.image_url))
        : ["https://placehold.co/600x800?text=No+Image"];

    return (
        <div className="container py-8 md:py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {/* Gallery */}
                <ProductGallery images={imageUrls} />

                {/* Product Info */}
                <div className="space-y-6">
                    <div>
                        {/* Brand not in API yet */}
                        {/* <h2 className="text-lg font-medium text-muted-foreground">{product.brand}</h2> */}
                        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                        <div className="mt-4 flex items-end gap-4">
                            <span className="text-3xl font-bold">${(product.base_price ?? 0).toFixed(2)}</span>
                            {/* Original price / discount logic if available */}
                        </div>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Selectors - Placeholder as variants logic is complex */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium mb-2">Variants</h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map((variant) => (
                                        <div key={variant.id} className="border rounded-md p-2 text-sm">
                                            {variant.size && <span>Size: {variant.size} </span>}
                                            {variant.color && <span>Color: {variant.color} </span>}
                                            <span className="text-muted-foreground">({variant.stock_quantity} in stock)</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4">
                        <Button size="lg" className="flex-1">
                            Add to Cart
                        </Button>
                        <Button 
                            size="lg" 
                            variant="outline" 
                            className={cn("px-3", isWishlisted && "text-red-500")}
                            onClick={handleWishlistToggle}
                            disabled={isWishlistLoading}
                        >
                            <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
                        </Button>
                        <Button size="lg" variant="ghost" className="px-3">
                            <Share2 className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span>Free Shipping over $100</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                            <span>2 Year Warranty</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-4 pt-4">
                        <h3 className="font-semibold">Description</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {product.description || "No description available."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div className="mt-16 space-y-8">
                    <h2 className="text-2xl font-bold tracking-tight">You might also like</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {relatedProducts.map((prod) => (
                            <ProductCard key={prod.id} product={prod} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
