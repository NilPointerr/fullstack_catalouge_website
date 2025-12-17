"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Category } from "@/lib/api";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface FilterPanelProps {
    categories: Category[];
    selectedCategoryIds: number[];
    selectedColors: string[];
    selectedSizes: string[];
    priceRange: [number, number];
    onCategoryChange: (categoryIds: number[]) => void;
    onColorChange: (colors: string[]) => void;
    onSizeChange: (sizes: string[]) => void;
    onPriceChange: (range: [number, number]) => void;
}

const AVAILABLE_COLORS = [
    { name: "Black", value: "black", class: "bg-black" },
    { name: "White", value: "white", class: "bg-white border" },
    { name: "Blue", value: "blue", class: "bg-blue-500" },
    { name: "Red", value: "red", class: "bg-red-500" },
    { name: "Green", value: "green", class: "bg-green-500" },
    { name: "Yellow", value: "yellow", class: "bg-yellow-500" },
];

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export function FilterPanel({
    categories,
    selectedCategoryIds,
    selectedColors,
    selectedSizes,
    priceRange,
    onCategoryChange,
    onColorChange,
    onSizeChange,
    onPriceChange,
}: FilterPanelProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const handleCategoryToggle = (categoryId: number) => {
        const newSelected = selectedCategoryIds.includes(categoryId)
            ? selectedCategoryIds.filter(id => id !== categoryId)
            : [...selectedCategoryIds, categoryId];
        onCategoryChange(newSelected);
        
        // Update URL - preserve all existing params (including search)
        const params = new URLSearchParams(searchParams.toString());
        if (newSelected.length > 0) {
            const categorySlugs = newSelected
                .map(id => categories.find(c => c.id === id)?.slug)
                .filter(Boolean)
                .join(',');
            params.set("categories", categorySlugs);
        } else {
            params.delete("categories");
        }
        // Reset to page 1 when filters change
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleColorToggle = (color: string) => {
        const newSelected = selectedColors.includes(color)
            ? selectedColors.filter(c => c !== color)
            : [...selectedColors, color];
        onColorChange(newSelected);
        
        // Update URL - preserve all existing params (including search)
        const params = new URLSearchParams(searchParams.toString());
        if (newSelected.length > 0) {
            params.set("colors", newSelected.join(','));
        } else {
            params.delete("colors");
        }
        // Reset to page 1 when filters change
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleSizeToggle = (size: string) => {
        const newSelected = selectedSizes.includes(size)
            ? selectedSizes.filter(s => s !== size)
            : [...selectedSizes, size];
        onSizeChange(newSelected);
        
        // Update URL - preserve all existing params (including search)
        const params = new URLSearchParams(searchParams.toString());
        if (newSelected.length > 0) {
            params.set("sizes", newSelected.join(','));
        } else {
            params.delete("sizes");
        }
        // Reset to page 1 when filters change
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMax = parseInt(e.target.value);
        const newRange: [number, number] = [priceRange[0], newMax];
        onPriceChange(newRange);
        
        // Update URL - preserve all existing params (including search)
        const params = new URLSearchParams(searchParams.toString());
        params.set("max_price", newMax.toString());
        // Reset to page 1 when filters change
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleClearAll = () => {
        onCategoryChange([]);
        onColorChange([]);
        onSizeChange([]);
        onPriceChange([0, 1000]);
        // Preserve search param if it exists
        const params = new URLSearchParams(searchParams.toString());
        params.delete("categories");
        params.delete("colors");
        params.delete("sizes");
        params.delete("max_price");
        params.delete("page");
        // If only search param remains, keep it; otherwise go to base catalog
        if (params.get("search")) {
            router.push(`${pathname}?${params.toString()}`);
        } else {
            router.push(pathname);
        }
    };

    return (
        <div className="space-y-8 rounded-lg border border-border/50 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="text-lg font-semibold tracking-tight">Filters</h3>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    onClick={handleClearAll}
                >
                    Clear All
                </Button>
            </div>

            {/* Categories */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Category</h4>
                <div className="space-y-2.5">
                    {categories.map((category) => (
                        <label 
                            key={category.id} 
                            className="flex items-center gap-3 text-sm cursor-pointer group hover:text-foreground transition-colors"
                        >
                            <input 
                                type="checkbox" 
                                className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer transition-all" 
                                checked={selectedCategoryIds.includes(category.id)}
                                onChange={() => handleCategoryToggle(category.id)}
                            />
                            <span className="select-none">{category.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Price Range</h4>
                <div className="px-1">
                    <input 
                        type="range" 
                        min="0" 
                        max="1000" 
                        value={priceRange[1]}
                        onChange={handlePriceChange}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0" 
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 font-medium">
                        <span>${priceRange[0]}</span>
                        <span className="text-foreground font-semibold">${priceRange[1]}</span>
                    </div>
                </div>
            </div>

            {/* Colors */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Color</h4>
                <div className="flex flex-wrap gap-2.5">
                    {AVAILABLE_COLORS.map((color) => (
                        <button
                            key={color.value}
                            onClick={() => handleColorToggle(color.value)}
                            className={`h-8 w-8 rounded-full ${color.class} ring-offset-2 focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 hover:scale-110 ${
                                selectedColors.includes(color.value) 
                                    ? 'ring-2 ring-primary ring-offset-2 scale-110 shadow-md' 
                                    : 'ring-1 ring-border/50'
                            }`}
                            title={color.name}
                            aria-label={`Filter by ${color.name} color`}
                        />
                    ))}
                </div>
            </div>

            {/* Sizes */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Size</h4>
                <div className="grid grid-cols-3 gap-2.5">
                    {AVAILABLE_SIZES.map((size) => (
                        <button
                            key={size}
                            onClick={() => handleSizeToggle(size)}
                            className={`rounded-md border px-3 py-2 text-xs font-semibold transition-all duration-200 hover:shadow-sm ${
                                selectedSizes.includes(size)
                                    ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105'
                                    : 'bg-background hover:bg-accent hover:text-accent-foreground border-input'
                            }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
