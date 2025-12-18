"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getShowrooms, deleteShowroom, Showroom } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ShowroomsPage() {
    const router = useRouter();
    const [showrooms, setShowrooms] = useState<Showroom[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fetchShowrooms = async () => {
        try {
            setLoading(true);
            const data = await getShowrooms(false); // Get all showrooms, including inactive
            setShowrooms(data);
        } catch (error) {
            console.error("Failed to fetch showrooms:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShowrooms();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this showroom?")) {
            return;
        }

        try {
            setDeletingId(id);
            await deleteShowroom(id);
            await fetchShowrooms();
        } catch (error: any) {
            alert(error.response?.data?.detail || "Failed to delete showroom");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="container py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Showrooms</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your showroom locations and information
                    </p>
                </div>
                <Link href="/admin/showrooms/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Showroom
                    </Button>
                </Link>
            </div>

            {showrooms.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No showrooms yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Get started by adding your first showroom location
                        </p>
                        <Link href="/admin/showrooms/new">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Showroom
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {showrooms.map((showroom) => (
                        <Card key={showroom.id} className={!showroom.is_active ? "opacity-60" : ""}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold mb-1">{showroom.name}</h3>
                                        {!showroom.is_active && (
                                            <span className="text-xs text-muted-foreground">Inactive</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                                    <p className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <span>
                                            {showroom.address}<br />
                                            {showroom.city}, {showroom.state} {showroom.zip_code}
                                        </span>
                                    </p>
                                    <p>{showroom.phone}</p>
                                    <p>{showroom.email}</p>
                                </div>

                                <div className="flex gap-2">
                                    <Link href={`/admin/showrooms/${showroom.id}`} className="flex-1">
                                        <Button variant="outline" className="w-full">
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => handleDelete(showroom.id)}
                                        disabled={deletingId === showroom.id}
                                    >
                                        {deletingId === showroom.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

