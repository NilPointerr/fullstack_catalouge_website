import { ProductForm } from "@/components/forms/ProductForm";

export default function NewProductPage() {
    return (
        <div className="space-y-8">
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
