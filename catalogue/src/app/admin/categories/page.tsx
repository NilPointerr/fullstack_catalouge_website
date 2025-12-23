"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash, Loader2, Check, X, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
    Category,
    createCategory,
    deleteCategory,
    getCategories,
    updateCategory,
    uploadCategoryImage,
    getBackendBaseURL,
} from "@/lib/api";

type CategoryForm = {
    name: string;
    slug: string;
    image_url: string;
};

const slugify = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

const emptyForm: CategoryForm = { name: "", slug: "", image_url: "" };

const resolveImageUrl = (url?: string) => {
    if (!url) return "";
    return url.startsWith("/") ? `${getBackendBaseURL()}${url}` : url;
};

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState<CategoryForm>(emptyForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [savingId, setSavingId] = useState<number | "new" | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const hasName = form.name.trim().length > 0;
    const derivedSlug = useMemo(() => slugify(form.slug || form.name), [form.name, form.slug]);

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setIsCreating(false);
        setSelectedFile(null);
        setUploadError(null);
    };

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await getCategories();
            setCategories(data);
            setError(null);
        } catch (err: any) {
            console.error("Failed to load categories", err);
            setError(err?.response?.data?.detail || "Unable to load categories.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasName) return;

        try {
            setSavingId("new");
            const created = await createCategory({
                name: form.name.trim(),
                slug: derivedSlug,
                is_active: true,
                image_url: form.image_url.trim() || undefined,
            });
            setCategories((prev) => [...prev, created]);
            resetForm();
        } catch (err: any) {
            console.error("Failed to create category", err);
            alert(err?.response?.data?.detail || "Failed to create category.");
        } finally {
            setSavingId(null);
        }
    };

    const startEdit = (category: Category) => {
        setEditingId(category.id);
        setIsCreating(false);
        setForm({
            name: category.name,
            slug: category.slug,
            image_url: category.image_url || "",
        });
        setSelectedFile(null);
        setUploadError(null);
    };

    const handleUpdate = async (categoryId: number) => {
        if (!hasName) return;
        try {
            setSavingId(categoryId);
            const updated = await updateCategory(categoryId, {
                name: form.name.trim(),
                slug: derivedSlug,
                image_url: form.image_url.trim() || undefined,
            });
            setCategories((prev) => prev.map((c) => (c.id === categoryId ? updated : c)));
            resetForm();
        } catch (err: any) {
            console.error("Failed to update category", err);
            alert(err?.response?.data?.detail || "Failed to update category.");
        } finally {
            setSavingId(null);
        }
    };

    const handleImageUpload = async () => {
        if (!selectedFile) return;
        try {
            setUploading(true);
            setUploadError(null);
            const { image_url } = await uploadCategoryImage(selectedFile);
            setForm((prev) => ({ ...prev, image_url }));
        } catch (err: any) {
            console.error("Failed to upload image", err);
            setUploadError(err?.response?.data?.detail || "Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    const handleImageFileSelect = async (file: File | null) => {
        setSelectedFile(file);
        if (!file) return;
        try {
            setUploading(true);
            setUploadError(null);
            const { image_url } = await uploadCategoryImage(file);
            setForm((prev) => ({ ...prev, image_url }));
        } catch (err: any) {
            console.error("Failed to upload image", err);
            setUploadError(err?.response?.data?.detail || "Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Delete category "${name}"? This cannot be undone.`)) {
            return;
        }
        try {
            setDeletingId(id);
            await deleteCategory(id);
            setCategories((prev) => prev.filter((c) => c.id !== id));
        } catch (err: any) {
            console.error("Failed to delete category", err);
            alert(err?.response?.data?.detail || "Failed to delete category.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                    <p className="text-muted-foreground">Manage product categories.</p>
                </div>
                <Button onClick={() => {
                    setIsCreating((prev) => !prev);
                    setEditingId(null);
                    setForm(emptyForm);
                }}>
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
                                value={form.name}
                                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g. Summer Collection"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                value={form.slug}
                                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                                placeholder="summer-collection"
                            />
                            <p className="text-xs text-muted-foreground">Auto-generated if left blank.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image_url">Image URL</Label>
                            <Input
                                id="image_url"
                                value={form.image_url}
                                onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))}
                                placeholder="https://example.com/category.jpg"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image_file">Upload Image</Label>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <Input
                                    id="image_file"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageFileSelect(e.target.files?.[0] || null)}
                                />
                            </div>
                            {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
                            {form.image_url && (
                                <p className="text-xs text-muted-foreground break-all">
                                    Using: {resolveImageUrl(form.image_url)}
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => resetForm()}
                                disabled={savingId === "new"}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!hasName || savingId === "new"}>
                                {savingId === "new" ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Create"
                                )}
                            </Button>
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
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Image URL</th>
                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="p-4 text-center">
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading categories...
                                    </div>
                                </td>
                            </tr>
                        ) : categories.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                    No categories found. Create your first one to get started.
                                </td>
                            </tr>
                        ) : (
                            categories.map((category) => {
                                const isEditing = editingId === category.id;
                                const isSaving = savingId === category.id;
                                const isDeleting = deletingId === category.id;

                                return (
                                    <tr
                                        key={category.id}
                                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                    >
                                        <td className="p-4 align-middle font-medium">
                                            {isEditing ? (
                                                <Input
                                                    value={form.name}
                                                    onChange={(e) =>
                                                        setForm((prev) => ({ ...prev, name: e.target.value }))
                                                    }
                                                    autoFocus
                                                />
                                            ) : (
                                                category.name
                                            )}
                                        </td>
                                        <td className="p-4 align-middle text-muted-foreground">
                                            {isEditing ? (
                                                <Input
                                                    value={form.slug}
                                                    onChange={(e) =>
                                                        setForm((prev) => ({ ...prev, slug: e.target.value }))
                                                    }
                                                />
                                            ) : (
                                                category.slug
                                            )}
                                        </td>
                                        <td className="p-4 align-middle text-muted-foreground max-w-xs">
                                            {isEditing ? (
                                                <div className="space-y-2">
                                                    <Input
                                                        value={form.image_url}
                                                        onChange={(e) =>
                                                            setForm((prev) => ({ ...prev, image_url: e.target.value }))
                                                        }
                                                        placeholder="https://..."
                                                    />
                                                    <div className="flex flex-col gap-2">
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleImageFileSelect(e.target.files?.[0] || null)}
                                                            className="text-xs"
                                                        />
                                                        {uploadError && (
                                                            <p className="text-xs text-destructive">{uploadError}</p>
                                                        )}
                                                        {uploading && (
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                                Uploading...
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : category.image_url ? (
                                                <a
                                                    href={resolveImageUrl(category.image_url)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary underline-offset-2 hover:underline break-all"
                                                >
                                                    {resolveImageUrl(category.image_url)}
                                                </a>
                                            ) : (
                                                "—"
                                            )}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleUpdate(category.id)}
                                                            disabled={!hasName || isSaving}
                                                        >
                                                            {isSaving ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Check className="h-4 w-4" />
                                                            )}
                                                            <span className="sr-only">Save</span>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => resetForm()}
                                                            disabled={isSaving}
                                                        >
                                                            <X className="h-4 w-4" />
                                                            <span className="sr-only">Cancel</span>
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => startEdit(category)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                            <span className="sr-only">Edit</span>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => handleDelete(category.id, category.name)}
                                                            disabled={isDeleting}
                                                        >
                                                            {isDeleting ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash className="h-4 w-4" />
                                                            )}
                                                            <span className="sr-only">Delete</span>
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
                {error && (
                    <div className="p-4 text-sm text-destructive border-t border-destructive/30">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
