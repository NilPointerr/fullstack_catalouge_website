"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSettings, bulkUpdateSettings, SiteSetting } from "@/lib/api";
import { Store, Globe, Search, Package, Shield, Mail, Save } from "lucide-react";

interface SettingsFormData {
    // Store Information
    store_name: string;
    store_logo: string;
    store_email: string;
    store_phone: string;
    store_address: string;
    
    // General Settings
    currency: string;
    currency_symbol: string;
    timezone: string;
    maintenance_mode: boolean;
    user_registration_enabled: boolean;
    
    // SEO Settings
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    social_facebook: string;
    social_instagram: string;
    social_twitter: string;
    
    // Product Settings
    low_stock_threshold: number;
    products_per_page: number;
    max_image_size_mb: number;
    allowed_image_formats: string;
    
    // Security Settings
    session_timeout_minutes: number;
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<SettingsFormData>({
        store_name: "",
        store_logo: "",
        store_email: "",
        store_phone: "",
        store_address: "",
        currency: "INR",
        currency_symbol: "₹",
        timezone: "Asia/Kolkata",
        maintenance_mode: false,
        user_registration_enabled: true,
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
        social_facebook: "",
        social_instagram: "",
        social_twitter: "",
        low_stock_threshold: 10,
        products_per_page: 24,
        max_image_size_mb: 5,
        allowed_image_formats: "jpg,jpeg,png,webp",
        session_timeout_minutes: 30,
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const settings = await getSettings();
            const settingsMap: Record<string, any> = {};
            
            settings.forEach((setting: SiteSetting) => {
                if (setting.value_type === "boolean") {
                    settingsMap[setting.key] = setting.value === "true";
                } else if (setting.value_type === "integer") {
                    settingsMap[setting.key] = setting.value ? parseInt(setting.value) : 0;
                } else {
                    settingsMap[setting.key] = setting.value || "";
                }
            });
            
            setFormData((prev) => ({ ...prev, ...settingsMap }));
        } catch (error) {
            console.error("Failed to load settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key: keyof SettingsFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            // Convert form data to settings format
            const settingsToUpdate: Record<string, any> = {};
            Object.entries(formData).forEach(([key, value]) => {
                settingsToUpdate[key] = value;
            });
            
            await bulkUpdateSettings(settingsToUpdate);
            alert("Settings saved successfully!");
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert("Failed to save settings. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your store configuration and preferences.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Store Information */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Store className="h-5 w-5" />
                                <CardTitle>Store Information</CardTitle>
                            </div>
                            <CardDescription>
                                Basic information about your store
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="store_name">Store Name</Label>
                                <Input
                                    id="store_name"
                                    value={formData.store_name}
                                    onChange={(e) => handleChange("store_name", e.target.value)}
                                    placeholder="LUXE Catalog"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="store_logo">Store Logo URL</Label>
                                <Input
                                    id="store_logo"
                                    value={formData.store_logo}
                                    onChange={(e) => handleChange("store_logo", e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="store_email">Contact Email</Label>
                                    <Input
                                        id="store_email"
                                        type="email"
                                        value={formData.store_email}
                                        onChange={(e) => handleChange("store_email", e.target.value)}
                                        placeholder="info@luxe.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="store_phone">Contact Phone</Label>
                                    <Input
                                        id="store_phone"
                                        value={formData.store_phone}
                                        onChange={(e) => handleChange("store_phone", e.target.value)}
                                        placeholder="+91 1234567890"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="store_address">Store Address</Label>
                                <Textarea
                                    id="store_address"
                                    value={formData.store_address}
                                    onChange={(e) => handleChange("store_address", e.target.value)}
                                    placeholder="123 Main Street, City, State, ZIP"
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* General Settings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                <CardTitle>General Settings</CardTitle>
                            </div>
                            <CardDescription>
                                Basic store configuration
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency Code</Label>
                                    <Input
                                        id="currency"
                                        value={formData.currency}
                                        onChange={(e) => handleChange("currency", e.target.value)}
                                        placeholder="INR"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currency_symbol">Currency Symbol</Label>
                                    <Input
                                        id="currency_symbol"
                                        value={formData.currency_symbol}
                                        onChange={(e) => handleChange("currency_symbol", e.target.value)}
                                        placeholder="₹"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <Input
                                        id="timezone"
                                        value={formData.timezone}
                                        onChange={(e) => handleChange("timezone", e.target.value)}
                                        placeholder="Asia/Kolkata"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="maintenance_mode"
                                    checked={formData.maintenance_mode}
                                    onChange={(e) => handleChange("maintenance_mode", e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label htmlFor="maintenance_mode" className="cursor-pointer">
                                    Enable Maintenance Mode
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="user_registration_enabled"
                                    checked={formData.user_registration_enabled}
                                    onChange={(e) => handleChange("user_registration_enabled", e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label htmlFor="user_registration_enabled" className="cursor-pointer">
                                    Allow New User Registration
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SEO Settings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                <CardTitle>SEO & Social Media</CardTitle>
                            </div>
                            <CardDescription>
                                Search engine optimization and social media links
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="meta_title">Meta Title</Label>
                                <Input
                                    id="meta_title"
                                    value={formData.meta_title}
                                    onChange={(e) => handleChange("meta_title", e.target.value)}
                                    placeholder="LUXE Catalog - Premium Products"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="meta_description">Meta Description</Label>
                                <Textarea
                                    id="meta_description"
                                    value={formData.meta_description}
                                    onChange={(e) => handleChange("meta_description", e.target.value)}
                                    placeholder="Browse our premium catalog of luxury products"
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="meta_keywords">Meta Keywords</Label>
                                <Input
                                    id="meta_keywords"
                                    value={formData.meta_keywords}
                                    onChange={(e) => handleChange("meta_keywords", e.target.value)}
                                    placeholder="luxury, premium, catalog"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="social_facebook">Facebook URL</Label>
                                    <Input
                                        id="social_facebook"
                                        value={formData.social_facebook}
                                        onChange={(e) => handleChange("social_facebook", e.target.value)}
                                        placeholder="https://facebook.com/yourpage"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="social_instagram">Instagram URL</Label>
                                    <Input
                                        id="social_instagram"
                                        value={formData.social_instagram}
                                        onChange={(e) => handleChange("social_instagram", e.target.value)}
                                        placeholder="https://instagram.com/yourprofile"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="social_twitter">Twitter URL</Label>
                                    <Input
                                        id="social_twitter"
                                        value={formData.social_twitter}
                                        onChange={(e) => handleChange("social_twitter", e.target.value)}
                                        placeholder="https://twitter.com/yourprofile"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Product Settings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                <CardTitle>Product Settings</CardTitle>
                            </div>
                            <CardDescription>
                                Configure product-related settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
                                    <Input
                                        id="low_stock_threshold"
                                        type="number"
                                        value={formData.low_stock_threshold}
                                        onChange={(e) => handleChange("low_stock_threshold", parseInt(e.target.value))}
                                        min="1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="products_per_page">Products Per Page</Label>
                                    <Input
                                        id="products_per_page"
                                        type="number"
                                        value={formData.products_per_page}
                                        onChange={(e) => handleChange("products_per_page", parseInt(e.target.value))}
                                        min="1"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="max_image_size_mb">Max Image Size (MB)</Label>
                                    <Input
                                        id="max_image_size_mb"
                                        type="number"
                                        value={formData.max_image_size_mb}
                                        onChange={(e) => handleChange("max_image_size_mb", parseInt(e.target.value))}
                                        min="1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="allowed_image_formats">Allowed Image Formats</Label>
                                    <Input
                                        id="allowed_image_formats"
                                        value={formData.allowed_image_formats}
                                        onChange={(e) => handleChange("allowed_image_formats", e.target.value)}
                                        placeholder="jpg,jpeg,png,webp"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Settings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                <CardTitle>Security Settings</CardTitle>
                            </div>
                            <CardDescription>
                                Security and session configuration
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="session_timeout_minutes">Session Timeout (minutes)</Label>
                                <Input
                                    id="session_timeout_minutes"
                                    type="number"
                                    value={formData.session_timeout_minutes}
                                    onChange={(e) => handleChange("session_timeout_minutes", parseInt(e.target.value))}
                                    min="5"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={saving} className="gap-2">
                            <Save className="h-4 w-4" />
                            {saving ? "Saving..." : "Save Settings"}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

