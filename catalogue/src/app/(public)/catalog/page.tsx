import { FilterPanel } from "@/components/features/FilterPanel";
import { ProductCard } from "@/components/features/ProductCard";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

// Mock Data
const products = Array.from({ length: 12 }).map((_, i) => ({
    id: `prod-${i}`,
    name: `Premium Cotton Shirt ${i + 1}`,
    brand: "Luxe Basics",
    price: 49.99 + i * 10,
    originalPrice: i % 3 === 0 ? 69.99 + i * 10 : undefined,
    discount: i % 3 === 0 ? 20 : undefined,
    images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1503342217505-b0815a046baf?q=80&w=1000&auto=format&fit=crop",
    ],
    inStock: true,
    isNew: i < 4,
}));

export default function CatalogPage() {
    return (
        <div className="container py-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
                    <p className="text-muted-foreground mt-1">
                        Showing 1-12 of 100 products
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="md:hidden">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Filters
                    </Button>
                    <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        <option>Sort by: Featured</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                        <option>Newest Arrivals</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
                {/* Sidebar Filters */}
                <aside className="hidden md:block">
                    <FilterPanel />
                </aside>

                {/* Product Grid */}
                <div className="space-y-8">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center gap-2">
                        <Button variant="outline" disabled>Previous</Button>
                        <Button variant="outline" className="bg-primary text-primary-foreground">1</Button>
                        <Button variant="outline">2</Button>
                        <Button variant="outline">3</Button>
                        <Button variant="outline">Next</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
