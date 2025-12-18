"use client";

import { ShowroomForm } from "@/components/forms/ShowroomForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewShowroomPage() {
    const router = useRouter();
    
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
                <h1 className="text-3xl font-bold tracking-tight">Create Showroom</h1>
                <p className="text-muted-foreground">
                    Add a new showroom location to your business.
                </p>
            </div>
            <div className="rounded-lg border bg-card p-8">
                <ShowroomForm />
            </div>
        </div>
    );
}

