"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FilterPanel } from "@/components/features/FilterPanel";
import { ProductCard } from "@/components/features/ProductCard";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { searchProducts, Product, getCategories, Category } from "@/lib/api";

export default function CatalogPage() {
    const searchParams = useSearchParams();
    const search = searchParams.get("search") || "";
    const categoryParam = searchParams.get("category") || "";
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
                
                // Find category by slug from URL
                if (categoryParam) {
                    const category = data.find(c => c.slug.toLowerCase() === categoryParam.toLowerCase());
                    if (category) {
                        setSelectedCategoryId(category.id);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, [categoryParam]);

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const data = await searchProducts(search || undefined, selectedCategoryId);
                setProducts(data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [search, selectedCategoryId]);

    return (
        <div className="container py-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
                    <p className="text-muted-foreground mt-1">
                        {search 
                            ? `Showing results for "${search}"` 
                            : categoryParam
                            ? `Showing ${products.length} products in ${categoryParam}`
                            : `Showing ${products.length} products`}
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
                    <FilterPanel 
                        categories={categories}
                        selectedCategoryId={selectedCategoryId}
                        onCategoryChange={setSelectedCategoryId}
                    />
                </aside>

                {/* Product Grid */}
                <div className="space-y-8">
                    {isLoading ? (
                        <div className="text-center py-12">Loading products...</div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                            {products.length === 0 && (
                                <div className="col-span-full text-center text-muted-foreground">
                                    No products found.
                                </div>
                            )}
                        </div>
                    )}

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
