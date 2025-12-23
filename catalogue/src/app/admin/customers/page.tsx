"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Loader2, Shield, User as UserIcon, CheckCircle2, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { getAllUsers, updateUserRole, User } from "@/lib/api";

export default function CustomersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleUpdate = async (userId: number, newRole: boolean) => {
        try {
            setUpdatingId(userId);
            await updateUserRole(userId, { is_superuser: newRole });
            await fetchUsers(); // Refresh the list
        } catch (error: any) {
            alert(error.response?.data?.detail || "Failed to update user role");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleStatusUpdate = async (userId: number, isActive: boolean) => {
        try {
            setUpdatingId(userId);
            await updateUserRole(userId, { is_active: isActive });
            await fetchUsers(); // Refresh the list
        } catch (error: any) {
            alert(error.response?.data?.detail || "Failed to update user status");
        } finally {
            setUpdatingId(null);
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
                    <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage user accounts and their roles
                    </p>
                </div>
            </div>

            {users.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No users found</h3>
                        <p className="text-muted-foreground">
                            There are no users in the system yet
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((user) => (
                        <Card key={user.id} className={!user.is_active ? "opacity-60" : ""}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-semibold">
                                                {user.full_name || "No Name"}
                                            </h3>
                                            {user.is_superuser && (
                                                <Shield className="h-4 w-4 text-primary" />
                                            )}
                                        </div>
                                        {!user.is_active && (
                                            <span className="text-xs text-muted-foreground">Inactive</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                                    <p className="flex items-center gap-2">
                                        <UserIcon className="h-4 w-4 flex-shrink-0" />
                                        <span className="break-all">{user.email}</span>
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {user.is_active ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-red-500" />
                                        )}
                                        <span className={user.is_active ? "text-green-500" : "text-red-500"}>
                                            {user.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Button
                                            variant={user.is_superuser ? "default" : "outline"}
                                            className="flex-1"
                                            onClick={() => handleRoleUpdate(user.id, !user.is_superuser)}
                                            disabled={updatingId === user.id}
                                        >
                                            {updatingId === user.id ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Shield className="h-4 w-4 mr-2" />
                                            )}
                                            {user.is_superuser ? "Admin" : "Make Admin"}
                                        </Button>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={user.is_active ? "outline" : "default"}
                                            className="flex-1"
                                            onClick={() => handleStatusUpdate(user.id, !user.is_active)}
                                            disabled={updatingId === user.id}
                                        >
                                            {updatingId === user.id ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : user.is_active ? (
                                                <XCircle className="h-4 w-4 mr-2" />
                                            ) : (
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                            )}
                                            {user.is_active ? "Deactivate" : "Activate"}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}


