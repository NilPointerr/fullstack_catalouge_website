import { ProductForm } from "@/components/forms/ProductForm";

// Mock data fetcher
async function getProduct(id: string) {
    // In a real app, fetch from API
    return {
        id,
        name: "Premium Cotton Shirt",
        brand: "Luxe Basics",
        price: 49.99,
        stock: 100,
        category: "men",
        description: "A high-quality cotton shirt.",
        images: [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop",
        ],
    };
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const product = await getProduct(params.id);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
                <p className="text-muted-foreground">
                    Update product details.
                </p>
            </div>
            <div className="rounded-lg border bg-card p-8">
                <ProductForm initialData={product} />
            </div>
        </div>
    );
}
