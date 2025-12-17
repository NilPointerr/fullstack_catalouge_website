/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import { api, updateProduct, getCategories, Category, Product, getBackendBaseURL } from "@/lib/api";

interface ProductFormProps {
    productId?: number;
    initialData?: Product | {
        name?: string;
        brand?: string;
        price?: number;
        stock?: number;
        category?: string;
        category_id?: number;
        description?: string;
        images?: string[];
        is_active?: boolean;
    };
}

interface ImageFile {
    file: File;
    preview: string;
}

interface ExistingImage {
    id?: number;
    url: string;
    isPrimary: boolean;
    image_url?: string;
}

export function ProductForm({ productId, initialData }: ProductFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
    const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const isEditMode = !!productId;

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

    // Load existing images if editing
    useEffect(() => {
        if (isEditMode && initialData && 'images' in initialData && Array.isArray(initialData.images)) {
            const images = initialData.images.map((img: any) => {
                const imageUrl = img.image_url || img;
                const fullUrl = imageUrl?.startsWith('http') 
                    ? imageUrl 
                    : `${getBackendBaseURL()}${imageUrl}`;
                return {
                    id: img.id,
                    url: fullUrl,
                    image_url: imageUrl,
                    isPrimary: img.is_primary || false
                };
            });
            setExistingImages(images);
        }
    }, [isEditMode, initialData]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const slug = isEditMode && initialData && 'slug' in initialData && initialData.slug
            ? initialData.slug
            : name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        const description = formData.get("description") as string;
        const base_price = parseFloat(formData.get("price") as string);
        const category_id = parseInt(formData.get("category") as string) || null;
        const is_active_checkbox = formData.get("is_active");
        const is_active = isEditMode 
            ? (is_active_checkbox === "on" || is_active_checkbox === "true" || is_active_checkbox === true)
            : true; // New products are active by default

        // Prepare variants (simplified - can be enhanced later)
        const stock = parseInt(formData.get("stock") as string) || 0;
        const variants = JSON.stringify([
            {
                sku: `${slug}-default`,
                size: "M",
                color: "Default",
                stock_quantity: stock,
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

        // Append existing images to keep (for edit mode)
        if (isEditMode && existingImages.length > 0) {
            const imagesToKeep = existingImages.map(img => {
                // Use the original image_url (not the full URL with backend base)
                let originalUrl = img.image_url || img.url;
                // If it's a full URL, extract just the path part for matching
                if (originalUrl.startsWith('http')) {
                    const backendBase = getBackendBaseURL();
                    if (originalUrl.startsWith(backendBase)) {
                        originalUrl = originalUrl.replace(backendBase, '');
                    }
                }
                return {
                    image_url: originalUrl,
                    is_primary: img.isPrimary
                };
            });
            uploadFormData.append("image_urls", JSON.stringify(imagesToKeep));
        }

        // Append image files
        imageFiles.forEach((imgFile) => {
            uploadFormData.append("images", imgFile.file);
        });

        try {
            if (isEditMode && productId) {
                // Update existing product
                await updateProduct(productId, uploadFormData);
            } else {
                // Create new product
                const response = await api.post("/products", uploadFormData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                if (response.status !== 200 && response.status !== 201) {
                    throw new Error("Failed to create product");
                }
            }

            router.push("/admin/products");
            router.refresh();
        } catch (err: any) {
            console.error(`Failed to ${isEditMode ? 'update' : 'create'} product:`, err);
            const errorMessage = err.response?.data?.detail || err.message || `Failed to ${isEditMode ? 'update' : 'create'} product`;
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

    const removeExistingImage = (index: number) => {
        setExistingImages(existingImages.filter((_, i) => i !== index));
    };

    const getInitialValue = (field: string): string | number | undefined => {
        if (!initialData) return undefined;
        
        if ('id' in initialData) {
            // It's a Product object
            const product = initialData as Product;
            switch (field) {
                case 'name': return product.name;
                case 'price': return product.base_price;
                case 'description': return product.description;
                case 'category': return product.category_id?.toString();
                case 'is_active': return product.is_active;
                case 'stock': 
                    return product.variants?.reduce((sum, v) => sum + (v.stock_quantity || 0), 0) || 0;
            }
        } else {
            // It's the old format
            switch (field) {
                case 'name': return initialData.name;
                case 'price': return initialData.price;
                case 'description': return initialData.description;
                case 'category': return initialData.category || initialData.category_id?.toString();
                case 'stock': return initialData.stock;
            }
        }
        return undefined;
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
                        <Input id="name" name="name" defaultValue={getInitialValue('name') as string} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price (₹)</Label>
                            <Input id="price" name="price" type="number" min="0" step="0.01" defaultValue={getInitialValue('price') as number} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock Quantity</Label>
                            <Input id="stock" name="stock" type="number" min="0" defaultValue={getInitialValue('stock') as number} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <select
                            id="category"
                            name="category"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            defaultValue={getInitialValue('category') as string}
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
                        <Textarea id="description" name="description" defaultValue={getInitialValue('description') as string} className="min-h-[150px]" />
                    </div>

                    {isEditMode && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    defaultChecked={getInitialValue('is_active') as boolean ?? true}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">Product is active</Label>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Product Images</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                            {isEditMode ? "Add new images or keep existing ones. First image will be set as primary." : "Upload product images. First image will be set as primary."}
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                            {/* Existing images (edit mode) */}
                            {existingImages.map((img, index) => (
                                <div key={`existing-${index}`} className="relative aspect-square rounded-md border overflow-hidden group">
                                    <img src={img.url} alt={`Existing ${index}`} className="h-full w-full object-cover" />
                                    {img.isPrimary && (
                                        <span className="absolute top-1 left-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                                            Primary
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(index)}
                                        className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            {/* New uploaded images */}
                            {imageFiles.map((imageFile, index) => (
                                <div key={`new-${index}`} className="relative aspect-square rounded-md border overflow-hidden group">
                                    <img src={imageFile.preview} alt={`New ${index}`} className="h-full w-full object-cover" />
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
                    {isLoading ? "Saving..." : isEditMode ? "Update Product" : "Create Product"}
                </Button>
            </div>
        </form>
    );
}
