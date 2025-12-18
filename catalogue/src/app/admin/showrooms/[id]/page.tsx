"use client";

import { ShowroomForm } from "@/components/forms/ShowroomForm";
import { getShowroom, Showroom } from "@/lib/api";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditShowroomPage() {
    const params = useParams();
    const router = useRouter();
    const showroomId = parseInt(params.id as string);
    const [showroom, setShowroom] = useState<Showroom | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchShowroom = async () => {
            if (isNaN(showroomId)) {
                setError("Invalid showroom ID");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await getShowroom(showroomId);
                setShowroom(data);
            } catch (err: any) {
                console.error("Failed to fetch showroom:", err);
                setError(err.response?.data?.detail || "Failed to load showroom");
            } finally {
                setLoading(false);
            }
        };

        fetchShowroom();
    }, [showroomId]);

    if (loading) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Showroom</h1>
                    <p className="text-muted-foreground">
                        Update showroom details.
                    </p>
                </div>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (error || !showroom) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Showroom</h1>
                    <p className="text-muted-foreground">
                        Update showroom details.
                    </p>
                </div>
                <div className="rounded-lg border bg-card p-8">
                    <div className="text-center space-y-4">
                        <p className="text-destructive">{error || "Showroom not found"}</p>
                        <Button onClick={() => router.push("/admin/showrooms")}>
                            Back to Showrooms
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Back Button - Mobile */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/showrooms")}
                className="md:hidden -ml-2"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>
            
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Showroom</h1>
                <p className="text-muted-foreground">
                    Update showroom details.
                </p>
            </div>
            <div className="rounded-lg border bg-card p-8">
                <ShowroomForm showroomId={showroomId} initialData={showroom} />
            </div>
        </div>
    );
}

