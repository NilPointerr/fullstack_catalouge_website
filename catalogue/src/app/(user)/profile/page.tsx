"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";
import { useState } from "react";

export default function ProfilePage() {
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    // Mock form data - in real app, pre-fill from user object or fetch
    const [formData, setFormData] = useState({
        name: user?.name || "John Doe",
        email: user?.email || "user@example.com",
        phone: "+1 (555) 000-0000",
        address: "123 Main St, New York, NY 10001",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Mock update
        setTimeout(() => {
            setIsLoading(false);
            alert("Profile updated successfully!");
        }, 1000);
    };

    return (
        <div className="container max-w-2xl py-8 md:py-12">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and preferences.
                    </p>
                </div>

                <div className="rounded-lg border bg-card p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isLoading} // Usually email is not editable or requires verification
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Shipping Address</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
