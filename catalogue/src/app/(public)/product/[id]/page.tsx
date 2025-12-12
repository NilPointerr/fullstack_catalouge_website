import { ProductGallery } from "@/components/features/ProductGallery";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Truck, ShieldCheck } from "lucide-react";
import { ProductCard } from "@/components/features/ProductCard";

// Mock Data
const product = {
    id: "1",
    name: "Premium Cotton Shirt",
    brand: "Luxe Basics",
    price: 49.99,
    originalPrice: 69.99,
    discount: 20,
    description: "Crafted from the finest Egyptian cotton, this shirt offers unparalleled comfort and style. Perfect for both casual and formal occasions, it features a modern slim fit and durable stitching.",
    images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1503342217505-b0815a046baf?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1516257984-b1b4d8c9230c?q=80&w=1000&auto=format&fit=crop",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
        { name: "White", class: "bg-white border" },
        { name: "Black", class: "bg-black" },
        { name: "Navy", class: "bg-blue-900" },
    ],
    details: [
        "100% Cotton",
        "Machine wash cold",
        "Slim fit",
        "Made in Italy",
    ],
};

const relatedProducts = Array.from({ length: 4 }).map((_, i) => ({
    id: `rel-${i}`,
    name: `Related Item ${i + 1}`,
    brand: "Luxe Basics",
    price: 39.99 + i * 10,
    images: [
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop",
    ],
    inStock: true,
}));

export default function ProductPage({ params }: { params: { id: string } }) {
    // Use params to fetch data in real app
    console.log(params.id);
    return (
        <div className="container py-8 md:py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {/* Gallery */}
                <ProductGallery images={product.images} />

                {/* Product Info */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-medium text-muted-foreground">{product.brand}</h2>
                        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                        <div className="mt-4 flex items-end gap-4">
                            <span className="text-3xl font-bold">${product.price}</span>
                            {product.originalPrice && (
                                <>
                                    <span className="text-xl text-muted-foreground line-through">
                                        ${product.originalPrice}
                                    </span>
                                    <span className="text-sm font-bold text-destructive">
                                        {product.discount}% OFF
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Selectors */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium mb-2">Color</h3>
                            <div className="flex gap-2">
                                {product.colors.map((color) => (
                                    <button
                                        key={color.name}
                                        className={`h-8 w-8 rounded-full ${color.class} ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium mb-2">Size</h3>
                            <div className="flex gap-2">
                                {product.sizes.map((size) => (
                                    <button
                                        key={size}
                                        className="flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <Button size="lg" className="flex-1">
                            Add to Cart
                        </Button>
                        <Button size="lg" variant="outline" className="px-3">
                            <Heart className="h-5 w-5" />
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
                            {product.description}
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            {product.details.map((detail, i) => (
                                <li key={i}>{detail}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            <div className="mt-16 space-y-8">
                <h2 className="text-2xl font-bold tracking-tight">You might also like</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {relatedProducts.map((prod) => (
                        <ProductCard key={prod.id} product={prod} />
                    ))}
                </div>
            </div>
        </div>
    );
}
