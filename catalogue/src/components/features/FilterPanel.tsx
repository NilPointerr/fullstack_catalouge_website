"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Category } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";

interface FilterPanelProps {
    categories: Category[];
    selectedCategoryId?: number;
    onCategoryChange?: (categoryId: number | undefined) => void;
}

export function FilterPanel({ categories, selectedCategoryId, onCategoryChange }: FilterPanelProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleCategoryClick = (category: Category) => {
        if (selectedCategoryId === category.id) {
            // Deselect
            if (onCategoryChange) {
                onCategoryChange(undefined);
            }
            const params = new URLSearchParams(searchParams.toString());
            params.delete("category");
            router.push(`/catalog?${params.toString()}`);
        } else {
            // Select
            if (onCategoryChange) {
                onCategoryChange(category.id);
            }
            const params = new URLSearchParams(searchParams.toString());
            params.set("category", category.slug);
            router.push(`/catalog?${params.toString()}`);
        }
    };

    const handleClearAll = () => {
        if (onCategoryChange) {
            onCategoryChange(undefined);
        }
        router.push("/catalog");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-0 text-muted-foreground"
                    onClick={handleClearAll}
                >
                    Clear All
                </Button>
            </div>

            {/* Categories */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium">Category</h4>
                <div className="space-y-2">
                    {categories.map((category) => (
                        <label 
                            key={category.id} 
                            className="flex items-center gap-2 text-sm cursor-pointer"
                            onClick={() => handleCategoryClick(category)}
                        >
                            <input 
                                type="checkbox" 
                                className="rounded border-gray-300" 
                                checked={selectedCategoryId === category.id}
                                onChange={() => handleCategoryClick(category)}
                            />
                            {category.name}
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium">Price Range</h4>
                <div className="px-2">
                    {/* Placeholder for Slider */}
                    <input type="range" min="0" max="1000" className="w-full" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                        <span>$0</span>
                        <span>$1000</span>
                    </div>
                </div>
            </div>

            {/* Colors */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium">Color</h4>
                <div className="flex flex-wrap gap-2">
                    {["bg-black", "bg-white border", "bg-blue-500", "bg-red-500", "bg-green-500", "bg-yellow-500"].map((color, i) => (
                        <button
                            key={i}
                            className={`h-6 w-6 rounded-full ${color} ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
                        />
                    ))}
                </div>
            </div>

            {/* Sizes */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium">Size</h4>
                <div className="grid grid-cols-3 gap-2">
                    {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                        <button
                            key={size}
                            className="rounded border px-2 py-1 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
