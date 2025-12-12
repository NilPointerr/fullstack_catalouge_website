/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";

interface ProductFormProps {
    initialData?: {
        name?: string;
        brand?: string;
        price?: number;
        stock?: number;
        category?: string;
        description?: string;
        images?: string[];
    };
}

export function ProductForm({ initialData }: ProductFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState<string[]>(initialData?.images || []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Mock API call
        setTimeout(() => {
            setIsLoading(false);
            router.push("/admin/products");
            router.refresh();
        }, 1000);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            // Mock upload - create object URLs
            const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
            setImages([...images, ...newImages]);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input id="name" defaultValue={initialData?.name} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="brand">Brand</Label>
                        <Input id="brand" defaultValue={initialData?.brand} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price</Label>
                            <Input id="price" type="number" min="0" step="0.01" defaultValue={initialData?.price} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock</Label>
                            <Input id="stock" type="number" min="0" defaultValue={initialData?.stock} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <select
                            id="category"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            defaultValue={initialData?.category}
                        >
                            <option value="men">Men</option>
                            <option value="women">Women</option>
                            <option value="kids">Kids</option>
                            <option value="accessories">Accessories</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" defaultValue={initialData?.description} className="min-h-[150px]" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Product Images</Label>
                        <div className="grid grid-cols-3 gap-4">
                            {images.map((image, index) => (
                                <div key={index} className="relative aspect-square rounded-md border overflow-hidden group">
                                    <img src={image} alt={`Product ${index}`} className="h-full w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            <label className="flex flex-col items-center justify-center aspect-square rounded-md border border-dashed cursor-pointer hover:bg-muted/50 transition-colors">
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-xs text-muted-foreground">Upload Image</span>
                                <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Variants</Label>
                        <div className="rounded-md border p-4">
                            <p className="text-sm text-muted-foreground text-center">
                                Variant management (Size/Color) would go here.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : initialData ? "Update Product" : "Create Product"}
                </Button>
            </div>
        </form>
    );
}
