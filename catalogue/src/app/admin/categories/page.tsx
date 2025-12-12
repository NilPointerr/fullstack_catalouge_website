"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash } from "lucide-react";
import { useState } from "react";

// Mock Data
const initialCategories = [
    { id: "1", name: "Men", slug: "men", count: 120 },
    { id: "2", name: "Women", slug: "women", count: 240 },
    { id: "3", name: "Kids", slug: "kids", count: 80 },
    { id: "4", name: "Accessories", slug: "accessories", count: 45 },
];

export default function CategoriesPage() {
    const [categories, setCategories] = useState(initialCategories);
    const [isCreating, setIsCreating] = useState(false);
    const [newCategory, setNewCategory] = useState("");

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory) return;

        const category = {
            id: Math.random().toString(36).substr(2, 9),
            name: newCategory,
            slug: newCategory.toLowerCase().replace(/\s+/g, "-"),
            count: 0,
        };

        setCategories([...categories, category]);
        setNewCategory("");
        setIsCreating(false);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this category?")) {
            setCategories(categories.filter((c) => c.id !== id));
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                    <p className="text-muted-foreground">
                        Manage product categories.
                    </p>
                </div>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Category
                </Button>
            </div>

            {isCreating && (
                <div className="rounded-lg border bg-card p-6 max-w-md">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Category Name</Label>
                            <Input
                                id="name"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="e.g. Summer Collection"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Create</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="rounded-md border bg-card">
                <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Slug</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Products</th>
                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {categories.map((category) => (
                            <tr
                                key={category.id}
                                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                            >
                                <td className="p-4 align-middle font-medium">{category.name}</td>
                                <td className="p-4 align-middle text-muted-foreground">{category.slug}</td>
                                <td className="p-4 align-middle">{category.count}</td>
                                <td className="p-4 align-middle text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="icon">
                                            <Pencil className="h-4 w-4" />
                                            <span className="sr-only">Edit</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(category.id)}
                                        >
                                            <Trash className="h-4 w-4" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
