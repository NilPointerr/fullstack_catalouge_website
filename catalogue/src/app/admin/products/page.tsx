"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Pencil, Trash, Image as ImageIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { searchProducts, deleteProduct, Product, getBackendBaseURL } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 12;

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await searchProducts(searchTerm, undefined, undefined, page, pageSize);
            setProducts(response.items);
            setTotalPages(response.pages);
            setTotal(response.total);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [page]);

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            if (page === 1) {
                fetchProducts();
            } else {
                setPage(1);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            setDeletingId(id);
            await deleteProduct(id);
            // Refresh the list
            await fetchProducts();
        } catch (error: any) {
            console.error("Failed to delete product:", error);
            alert(error.response?.data?.detail || "Failed to delete product");
        } finally {
            setDeletingId(null);
        }
    };

    const getProductImage = (product: Product) => {
        const primaryImage = product.images?.find(img => img.is_primary);
        const firstImage = product.images?.[0];
        const imageUrl = primaryImage?.image_url || firstImage?.image_url;
        
        if (imageUrl) {
            // If it's already a full URL, return as is
            if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                return imageUrl;
            }
            // Otherwise, prepend backend base URL
            return `${getBackendBaseURL()}${imageUrl}`;
        }
        return null;
    };

    const getTotalStock = (product: Product) => {
        return product.variants?.reduce((sum, variant) => sum + (variant.stock_quantity || 0), 0) || 0;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your product catalog. {total > 0 && `(${total} total)`}
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/products/new">
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Link>
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {/* Products List - Desktop Table View */}
            {!loading && products.length > 0 && (
                <>
                    <div className="hidden md:block rounded-md border bg-card">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Image</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Price</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Stock</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {products.map((product) => {
                                        const imageUrl = getProductImage(product);
                                        const totalStock = getTotalStock(product);
                                        return (
                                            <tr
                                                key={product.id}
                                                className="border-b transition-colors hover:bg-muted/50"
                                            >
                                                <td className="p-4 align-middle">
                                                    {imageUrl ? (
                                                        <img
                                                            src={imageUrl}
                                                            alt={product.name}
                                                            className="h-12 w-12 object-cover rounded-md"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center">
                                                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 align-middle font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{product.name}</span>
                                                        {product.description && (
                                                            <span className="text-xs text-muted-foreground line-clamp-1">
                                                                {product.description}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">${product.base_price.toFixed(2)}</td>
                                                <td className="p-4 align-middle">{totalStock}</td>
                                                <td className="p-4 align-middle">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                                                            product.is_active
                                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                                        }`}
                                                    >
                                                        {product.is_active ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={`/admin/products/${product.id}`}>
                                                                <Pencil className="h-4 w-4" />
                                                                <span className="sr-only">Edit</span>
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => handleDelete(product.id, product.name)}
                                                            disabled={deletingId === product.id}
                                                        >
                                                            {deletingId === product.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash className="h-4 w-4" />
                                                            )}
                                                            <span className="sr-only">Delete</span>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden grid gap-4">
                        {products.map((product) => {
                            const imageUrl = getProductImage(product);
                            const totalStock = getTotalStock(product);
                            return (
                                <Card key={product.id}>
                                    <CardContent className="p-4">
                                        <div className="flex gap-4">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={product.name}
                                                    className="h-20 w-20 object-cover rounded-md flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="h-20 w-20 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                                                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold truncate">{product.name}</h3>
                                                {product.description && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                        {product.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 mt-2 text-sm">
                                                    <span className="font-medium">${product.base_price.toFixed(2)}</span>
                                                    <span className="text-muted-foreground">Stock: {totalStock}</span>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                            product.is_active
                                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                                        }`}
                                                    >
                                                        {product.is_active ? "Active" : "Inactive"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <Button variant="ghost" size="sm" asChild className="flex-1">
                                                        <Link href={`/admin/products/${product.id}`}>
                                                            <Pencil className="mr-2 h-3 w-3" />
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="flex-1 text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(product.id, product.name)}
                                                        disabled={deletingId === product.id}
                                                    >
                                                        {deletingId === product.id ? (
                                                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <Trash className="mr-2 h-3 w-3" />
                                                        )}
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Empty State */}
            {!loading && products.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground text-center">
                            {searchTerm ? "No products found matching your search." : "No products yet. Create your first product!"}
                        </p>
                        {!searchTerm && (
                            <Button asChild className="mt-4">
                                <Link href="/admin/products/new">
                                    <Plus className="mr-2 h-4 w-4" /> Add Product
                                </Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
