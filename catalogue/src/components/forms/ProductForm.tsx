/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import { api } from "@/lib/api";
import { getCategories, Category } from "@/lib/api";

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

interface ImageFile {
    file: File;
    preview: string;
}

export function ProductForm({ initialData }: ProductFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // Load categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const cats = await getCategories();
                setCategories(cats);
            } catch (error) {
                console.error("Failed to load categories:", error);
            }
        };
        loadCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        const description = formData.get("description") as string;
        const base_price = parseFloat(formData.get("price") as string);
        const category_id = parseInt(formData.get("category") as string) || null;
        const is_active = true;

        // Prepare variants (simplified - can be enhanced later)
        const variants = JSON.stringify([
            {
                sku: `${slug}-default`,
                size: "M",
                color: "Default",
                stock_quantity: parseInt(formData.get("stock") as string) || 0,
            }
        ]);

        // Create FormData for multipart upload
        const uploadFormData = new FormData();
        uploadFormData.append("name", name);
        uploadFormData.append("slug", slug);
        uploadFormData.append("description", description || "");
        uploadFormData.append("base_price", base_price.toString());
        if (category_id) {
            uploadFormData.append("category_id", category_id.toString());
        }
        uploadFormData.append("is_active", is_active.toString());
        uploadFormData.append("variants", variants);

        // Append image files
        imageFiles.forEach((imgFile) => {
            uploadFormData.append("images", imgFile.file);
        });

        try {
            const response = await api.post("/products", uploadFormData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200 || response.status === 201) {
                router.push("/admin/products");
                router.refresh();
            }
        } catch (err: any) {
            console.error("Failed to create product:", err);
            const errorMessage = err.response?.data?.detail || err.message || "Failed to create product";
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newImages: ImageFile[] = Array.from(files).map((file) => ({
                file,
                preview: URL.createObjectURL(file),
            }));
            setImageFiles([...imageFiles, ...newImages]);
        }
    };

    const removeImage = (index: number) => {
        // Revoke object URL to free memory
        URL.revokeObjectURL(imageFiles[index].preview);
        setImageFiles(imageFiles.filter((_, i) => i !== index));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                    {error}
                </div>
            )}
            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input id="name" name="name" defaultValue={initialData?.name} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price ($)</Label>
                            <Input id="price" name="price" type="number" min="0" step="0.01" defaultValue={initialData?.price} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock Quantity</Label>
                            <Input id="stock" name="stock" type="number" min="0" defaultValue={initialData?.stock} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <select
                            id="category"
                            name="category"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            defaultValue={initialData?.category}
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" defaultValue={initialData?.description} className="min-h-[150px]" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Product Images</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                            Upload product images. First image will be set as primary.
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                            {imageFiles.map((imageFile, index) => (
                                <div key={index} className="relative aspect-square rounded-md border overflow-hidden group">
                                    <img src={imageFile.preview} alt={`Product ${index}`} className="h-full w-full object-cover" />
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
                                <span className="text-xs text-muted-foreground text-center px-2">Upload Image</span>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    multiple 
                                    accept="image/*" 
                                    onChange={handleImageUpload}
                                    disabled={isLoading}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Variants</Label>
                        <div className="rounded-md border p-4">
                            <p className="text-sm text-muted-foreground text-center">
                                Variant management will be added. For now, a default variant is created with the stock quantity.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : initialData ? "Update Product" : "Create Product"}
                </Button>
            </div>
        </form>
    );
}
