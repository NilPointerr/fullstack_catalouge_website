"use client";

import { ProductForm } from "@/components/forms/ProductForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
    const router = useRouter();
    
    return (
        <div className="space-y-8">
            {/* Back Button - Mobile */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/products")}
                className="md:hidden -ml-2"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>
            
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create Product</h1>
                <p className="text-muted-foreground">
                    Add a new product to your catalog.
                </p>
            </div>
            <div className="rounded-lg border bg-card p-8">
                <ProductForm />
            </div>
        </div>
    );
}
