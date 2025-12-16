"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FilterPanel } from "@/components/features/FilterPanel";
import { ProductCard } from "@/components/features/ProductCard";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { searchProducts, Product, getCategories, Category, ProductFilters } from "@/lib/api";

export default function CatalogPage() {
    const searchParams = useSearchParams();
    const search = searchParams.get("search") || "";
    const categoriesParam = searchParams.get("categories") || "";
    const colorsParam = searchParams.get("colors") || "";
    const sizesParam = searchParams.get("sizes") || "";
    const maxPriceParam = searchParams.get("max_price");
    
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize filters from URL params
    useEffect(() => {
        // Parse categories from URL
        if (categoriesParam) {
            const categorySlugs = categoriesParam.split(',').map(s => s.trim());
            // We'll set the IDs after categories are loaded
        }
        
        // Parse colors from URL
        if (colorsParam) {
            setSelectedColors(colorsParam.split(',').map(c => c.trim()));
        }
        
        // Parse sizes from URL
        if (sizesParam) {
            setSelectedSizes(sizesParam.split(',').map(s => s.trim()));
        }
        
        // Parse max price from URL
        if (maxPriceParam) {
            const maxPrice = parseInt(maxPriceParam);
            if (!isNaN(maxPrice)) {
                setPriceRange([0, maxPrice]);
            }
        }
    }, []);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
                
                // Set category IDs from URL slugs
                if (categoriesParam) {
                    const categorySlugs = categoriesParam.split(',').map(s => s.trim().toLowerCase());
                    const matchingCategories = data.filter(c => 
                        categorySlugs.includes(c.slug.toLowerCase())
                    );
                    setSelectedCategoryIds(matchingCategories.map(c => c.id));
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, [categoriesParam]);

    // Fetch products with filters
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const filters: ProductFilters = {
                    categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
                    colors: selectedColors.length > 0 ? selectedColors : undefined,
                    sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
                    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
                    maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined,
                };
                
                const data = await searchProducts(search || undefined, undefined, filters);
                setProducts(data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [search, selectedCategoryIds, selectedColors, selectedSizes, priceRange]);

    const getFilterSummary = () => {
        const parts: string[] = [];
        if (selectedCategoryIds.length > 0) {
            const categoryNames = selectedCategoryIds
                .map(id => categories.find(c => c.id === id)?.name)
                .filter(Boolean)
                .join(', ');
            parts.push(categoryNames);
        }
        if (parts.length === 0) {
            return `Showing ${products.length} products`;
        }
        return `Showing ${products.length} products in ${parts.join(', ')}`;
    };

    return (
        <div className="container py-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
                    <p className="text-muted-foreground mt-1">
                        {search 
                            ? `Showing results for "${search}"` 
                            : getFilterSummary()}
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
                        selectedCategoryIds={selectedCategoryIds}
                        selectedColors={selectedColors}
                        selectedSizes={selectedSizes}
                        priceRange={priceRange}
                        onCategoryChange={setSelectedCategoryIds}
                        onColorChange={setSelectedColors}
                        onSizeChange={setSelectedSizes}
                        onPriceChange={setPriceRange}
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
