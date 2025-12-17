"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FilterPanel } from "@/components/features/FilterPanel";
import { ProductCard } from "@/components/features/ProductCard";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, ChevronLeft, ChevronRight, X } from "lucide-react";
import { searchProducts, Product, getCategories, Category, ProductFilters } from "@/lib/api";

const ITEMS_PER_PAGE = 12;

export default function CatalogPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const search = searchParams.get("search") || "";
    const categoriesParam = searchParams.get("categories") || "";
    const categoryParam = searchParams.get("category") || ""; // Support singular 'category' param
    const colorsParam = searchParams.get("colors") || "";
    const sizesParam = searchParams.get("sizes") || "";
    const maxPriceParam = searchParams.get("max_price");
    const pageParam = searchParams.get("page");
    const sortParam = searchParams.get("sort") || "featured";
    
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
    const [sortBy, setSortBy] = useState<string>(sortParam);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const isInitialized = useRef(false);

    // Initialize filters from URL params
    useEffect(() => {
        // Parse page from URL
        if (pageParam) {
            const page = parseInt(pageParam);
            if (!isNaN(page) && page > 0) {
                setCurrentPage(page);
            }
        }
        
        // Parse sort from URL
        setSortBy(sortParam);
        
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

    // Fetch categories and set selected category IDs from URL
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
                
                // Determine which category slugs to use
                // Support both 'category' (singular) and 'categories' (plural) params
                let categorySlugs: string[] = [];
                let shouldNormalizeUrl = false;
                
                if (categoryParam) {
                    // If 'category' param exists, use it (convert to array)
                    categorySlugs = [categoryParam.trim().toLowerCase()];
                    shouldNormalizeUrl = true;
                } else if (categoriesParam) {
                    // Use 'categories' param (comma-separated)
                    categorySlugs = categoriesParam.split(',').map(s => s.trim().toLowerCase());
                }
                
                // Set category IDs from URL slugs
                if (categorySlugs.length > 0) {
                    const matchingCategories = data.filter(c => 
                        categorySlugs.includes(c.slug.toLowerCase())
                    );
                    const categoryIds = matchingCategories.map(c => c.id);
                    setSelectedCategoryIds(categoryIds);
                    
                    // Normalize URL if needed (convert 'category' to 'categories')
                    if (shouldNormalizeUrl && categoryIds.length > 0) {
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete("category");
                        params.set("categories", categorySlugs[0]);
                        // Update URL without causing a reload
                        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
                    }
                } else {
                    setSelectedCategoryIds([]);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, [categoryParam, categoriesParam]);

    // Fetch products with filters and pagination
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const filters: ProductFilters = {
                    categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
                    colors: selectedColors.length > 0 ? selectedColors : undefined,
                    sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
                    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
                    maxPrice: priceRange[1] < 50000 ? priceRange[1] : undefined,
                    sortBy: sortBy !== "featured" ? sortBy : undefined,
                };
                
                const data = await searchProducts(
                    search || undefined, 
                    undefined, 
                    filters,
                    currentPage,
                    ITEMS_PER_PAGE
                );
                setProducts(data.items);
                setTotalPages(data.pages);
                setTotalItems(data.total);
            } catch (error) {
                console.error("Failed to fetch products:", error);
                setProducts([]);
                setTotalPages(1);
                setTotalItems(0);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [search, selectedCategoryIds, selectedColors, selectedSizes, priceRange, currentPage, sortBy]);

    // Mark as initialized after first render
    useEffect(() => {
        isInitialized.current = true;
    }, []);

    // Reset to page 1 when filters change (except page itself)
    // Only reset after initialization (not on initial load from URL)
    useEffect(() => {
        if (isInitialized.current && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [search, selectedCategoryIds, selectedColors, selectedSizes, priceRange, sortBy]);

    // Note: Mobile filter drawer closes automatically when filters are applied via FilterPanel's URL updates

    // Update URL when page changes
    const updatePage = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        
        setCurrentPage(newPage);
        const params = new URLSearchParams(searchParams.toString());
        if (newPage === 1) {
            params.delete("page");
        } else {
            params.set("page", newPage.toString());
        }
        router.push(`${pathname}?${params.toString()}`);
    };

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
            const start = totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
            const end = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);
            return `Showing ${start}-${end} of ${totalItems} products`;
        }
        const start = totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
        const end = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);
        return `Showing ${start}-${end} of ${totalItems} products in ${parts.join(', ')}`;
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            // Show all pages if total is less than max visible
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);
            
            if (currentPage > 3) {
                pages.push("...");
            }
            
            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            
            if (currentPage < totalPages - 2) {
                pages.push("...");
            }
            
            // Always show last page
            pages.push(totalPages);
        }
        
        return pages;
    };

    return (
        <div className="container py-8 md:py-12">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">All Products</h1>
                    <p className="text-muted-foreground text-sm md:text-base">
                        {search 
                            ? `Showing results for "${search}"` 
                            : getFilterSummary()}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="md:hidden shadow-sm hover:shadow-md transition-shadow"
                        onClick={() => setIsMobileFilterOpen(true)}
                    >
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Filters
                    </Button>
                    <select 
                        value={sortBy}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            const newSort = e.target.value;
                            setSortBy(newSort);
                            
                            // Update URL
                            const params = new URLSearchParams(searchParams.toString());
                            if (newSort === "featured") {
                                params.delete("sort");
                            } else {
                                params.set("sort", newSort);
                            }
                            // Reset to page 1 when sort changes
                            params.delete("page");
                            router.push(`${pathname}?${params.toString()}`);
                        }}
                        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                    >
                        <option value="featured">Sort by: Featured</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="newest">Newest Arrivals</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[260px_1fr] gap-6 md:gap-8 lg:gap-12">
                {/* Sidebar Filters - Desktop */}
                <aside className="hidden md:block">
                    <div className="sticky top-24">
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
                    </div>
                </aside>

                {/* Mobile Filter Drawer */}
                {isMobileFilterOpen && (
                    <div className="fixed inset-0 z-50 md:hidden">
                        {/* Backdrop */}
                        <div 
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                            onClick={() => setIsMobileFilterOpen(false)}
                        />
                        {/* Drawer */}
                        <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-background border-r border-border shadow-xl overflow-y-auto">
                            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between z-10">
                                <h2 className="text-lg font-semibold">Filters</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <div className="p-4">
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
                            </div>
                        </div>
                    </div>
                )}

                {/* Product Grid */}
                <div className="space-y-10">
                    {isLoading ? (
                        <div className="text-center py-20">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                            <p className="mt-4 text-muted-foreground">Loading products...</p>
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="col-span-full text-center py-16">
                            <p className="text-lg font-medium text-muted-foreground mb-2">No products found</p>
                            <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
                            {(selectedCategoryIds.length > 0 || selectedColors.length > 0 || selectedSizes.length > 0 || priceRange[1] < 50000 || search) && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedCategoryIds([]);
                                        setSelectedColors([]);
                                        setSelectedSizes([]);
                                        setPriceRange([0, 50000]);
                                        setSortBy("featured");
                                        const params = new URLSearchParams();
                                        if (search) params.set("search", search);
                                        router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`);
                                    }}
                                >
                                    Clear All Filters
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {!isLoading && totalPages > 1 && (
                        <div className="flex flex-col items-center gap-4 pt-4">
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => updatePage(currentPage - 1)}
                                    disabled={currentPage === 1 || isLoading}
                                    className="transition-all hover:shadow-md disabled:hover:shadow-none"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                
                                {getPageNumbers().map((pageNum, idx) => {
                                    if (pageNum === "...") {
                                        return (
                                            <span key={`ellipsis-${idx}`} className="px-3 text-muted-foreground">
                                                ...
                                            </span>
                                        );
                                    }
                                    const page = pageNum as number;
                                    return (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => updatePage(page)}
                                            disabled={isLoading}
                                            className="transition-all hover:shadow-md disabled:hover:shadow-none min-w-[2.5rem]"
                                        >
                                            {page}
                                        </Button>
                                    );
                                })}
                                
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => updatePage(currentPage + 1)}
                                    disabled={currentPage === totalPages || isLoading}
                                    className="transition-all hover:shadow-md disabled:hover:shadow-none"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
