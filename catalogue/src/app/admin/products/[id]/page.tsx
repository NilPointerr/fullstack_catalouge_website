"use client";

import { ProductForm } from "@/components/forms/ProductForm";
import { getProduct, Product } from "@/lib/api";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
    const productId = parseInt(params.id as string);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            if (isNaN(productId)) {
                setError("Invalid product ID");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await getProduct(productId);
                setProduct(data);
            } catch (err: any) {
                console.error("Failed to fetch product:", err);
                setError(err.response?.data?.detail || "Failed to load product");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    if (loading) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
                    <p className="text-muted-foreground">
                        Update product details.
                    </p>
                </div>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
                    <p className="text-muted-foreground">
                        Update product details.
                    </p>
                </div>
                <div className="rounded-lg border bg-card p-8">
                    <div className="text-center space-y-4">
                        <p className="text-destructive">{error || "Product not found"}</p>
                        <Button onClick={() => router.push("/admin/products")}>
                            Back to Products
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
                <p className="text-muted-foreground">
                    Update product details.
                </p>
            </div>
            <div className="rounded-lg border bg-card p-8">
                <ProductForm productId={productId} initialData={product} />
            </div>
        </div>
    );
}
