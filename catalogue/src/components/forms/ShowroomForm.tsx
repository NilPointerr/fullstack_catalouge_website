"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X, Upload, CheckCircle2, XCircle } from "lucide-react";
import { api, getBackendBaseURL } from "@/lib/api";

interface ShowroomFormProps {
    showroomId?: number;
    initialData?: any;
}

const DAYS = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
];

interface ImageFile {
    file: File;
    preview: string;
}

export function ShowroomForm({ showroomId, initialData }: ShowroomFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const DEFAULT_HOURS = '10:00 AM - 8:00 PM';
    const [openingHours, setOpeningHours] = useState<Record<string, string>>({
        monday: DEFAULT_HOURS,
        tuesday: DEFAULT_HOURS,
        wednesday: DEFAULT_HOURS,
        thursday: DEFAULT_HOURS,
        friday: DEFAULT_HOURS,
        saturday: DEFAULT_HOURS,
        sunday: DEFAULT_HOURS,
    });
    const isEditMode = !!showroomId;

    useEffect(() => {
        if (initialData) {
            // If editing, use existing hours or default to empty if not set
            const existingHours = initialData.opening_hours || {};
            setOpeningHours({
                monday: existingHours.monday || '',
                tuesday: existingHours.tuesday || '',
                wednesday: existingHours.wednesday || '',
                thursday: existingHours.thursday || '',
                friday: existingHours.friday || '',
                saturday: existingHours.saturday || '',
                sunday: existingHours.sunday || '',
            });
            if (initialData.gallery_images && Array.isArray(initialData.gallery_images)) {
                setExistingImages(initialData.gallery_images);
            }
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const is_active = formData.get("is_active") === "on";

        // Create FormData for multipart upload
        const uploadFormData = new FormData();
        uploadFormData.append("name", formData.get("name") as string);
        uploadFormData.append("address", formData.get("address") as string);
        uploadFormData.append("city", formData.get("city") as string);
        uploadFormData.append("state", formData.get("state") as string);
        uploadFormData.append("zip_code", formData.get("zip_code") as string);
        uploadFormData.append("phone", formData.get("phone") as string);
        uploadFormData.append("email", formData.get("email") as string);
        uploadFormData.append("opening_hours", JSON.stringify(openingHours));
        
        if (formData.get("map_url")) {
            uploadFormData.append("map_url", formData.get("map_url") as string);
        }
        
        uploadFormData.append("is_active", is_active.toString());

        // Append existing images to keep (for edit mode)
        if (isEditMode && existingImages.length > 0) {
            uploadFormData.append("gallery_images", JSON.stringify(existingImages));
        }

        // Append image files
        imageFiles.forEach((imgFile) => {
            uploadFormData.append("images", imgFile.file);
        });

        try {
            if (isEditMode && showroomId) {
                await api.put(`/showrooms/${showroomId}`, uploadFormData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
            } else {
                await api.post("/showrooms", uploadFormData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
            }
            router.push("/admin/showrooms");
            router.refresh();
        } catch (err: any) {
            console.error("Failed to save showroom:", err);
            setError(err.response?.data?.detail || "Failed to save showroom");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newImages: ImageFile[] = Array.from(files).map((file: File) => ({
                file,
                preview: URL.createObjectURL(file),
            }));
            setImageFiles([...imageFiles, ...newImages]);
        }
    };

    const removeImage = (index: number) => {
        URL.revokeObjectURL(imageFiles[index].preview);
        setImageFiles(imageFiles.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(existingImages.filter((_, i) => i !== index));
    };

    const setAllDaysOpen = () => {
        const allOpen: Record<string, string> = {};
        DAYS.forEach(day => {
            allOpen[day.key] = DEFAULT_HOURS;
        });
        setOpeningHours(allOpen);
    };

    const setAllDaysClosed = () => {
        const allClosed: Record<string, string> = {};
        DAYS.forEach(day => {
            allClosed[day.key] = 'Closed';
        });
        setOpeningHours(allClosed);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Showroom Name *</Label>
                    <Input
                        id="name"
                        name="name"
                        required
                        defaultValue={initialData?.name || ''}
                        placeholder="e.g., LUXE Soho"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="is_active">Status</Label>
                    <div className="flex items-center space-x-2 pt-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            name="is_active"
                            defaultChecked={initialData?.is_active !== false}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="is_active" className="font-normal cursor-pointer">
                            Active
                        </Label>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                    id="address"
                    name="address"
                    required
                    defaultValue={initialData?.address || ''}
                    placeholder="123 Fashion Street"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                        id="city"
                        name="city"
                        required
                        defaultValue={initialData?.city || ''}
                        placeholder="New York"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                        id="state"
                        name="state"
                        required
                        defaultValue={initialData?.state || ''}
                        placeholder="NY"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="zip_code">ZIP Code *</Label>
                    <Input
                        id="zip_code"
                        name="zip_code"
                        required
                        defaultValue={initialData?.zip_code || ''}
                        placeholder="10012"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        defaultValue={initialData?.phone || ''}
                        placeholder="+1 (555) 123-4567"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        defaultValue={initialData?.email || ''}
                        placeholder="hello@luxe.com"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="map_url">Map URL (Google Maps Embed)</Label>
                <Input
                    id="map_url"
                    name="map_url"
                    type="url"
                    defaultValue={initialData?.map_url || ''}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                />
                <p className="text-sm text-muted-foreground">
                    Get the embed URL from Google Maps by clicking "Share" → "Embed a map"
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>Opening Hours *</Label>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={setAllDaysOpen}
                            className="flex items-center gap-2"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Set All Open
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={setAllDaysClosed}
                            className="flex items-center gap-2"
                        >
                            <XCircle className="h-4 w-4" />
                            Set All Closed
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DAYS.map((day) => {
                        const isOpen = openingHours[day.key] && openingHours[day.key] !== 'Closed' && openingHours[day.key].trim() !== '';
                        return (
                            <div key={day.key} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor={`hours_${day.key}`}>{day.label}</Label>
                                    <div className="flex gap-1">
                                        <Button
                                            type="button"
                                            variant={isOpen ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setOpeningHours({
                                                ...openingHours,
                                                [day.key]: DEFAULT_HOURS
                                            })}
                                            className="h-7 px-2 text-xs"
                                        >
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            Open
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={!isOpen ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setOpeningHours({
                                                ...openingHours,
                                                [day.key]: 'Closed'
                                            })}
                                            className="h-7 px-2 text-xs"
                                        >
                                            <XCircle className="h-3 w-3 mr-1" />
                                            Close
                                        </Button>
                                    </div>
                                </div>
                                <Input
                                    id={`hours_${day.key}`}
                                    value={openingHours[day.key] || ''}
                                    onChange={(e) => setOpeningHours({
                                        ...openingHours,
                                        [day.key]: e.target.value
                                    })}
                                    placeholder="10:00 AM - 8:00 PM"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>Gallery Images</Label>
                    <div className="flex gap-2">
                        <label htmlFor="image-upload">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="cursor-pointer"
                                asChild
                            >
                                <span>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Images
                                </span>
                            </Button>
                            <input
                                id="image-upload"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                    <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Existing Images</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {existingImages.map((imageUrl: string, index: number) => {
                                const fullUrl = imageUrl?.startsWith('http') 
                                    ? imageUrl 
                                    : `${getBackendBaseURL()}${imageUrl}`;
                                return (
                                    <div key={index} className="relative group">
                                        <img
                                            src={fullUrl}
                                            alt={`Gallery ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg border"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeExistingImage(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* New Uploaded Images */}
                {imageFiles.length > 0 && (
                    <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">New Images</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {imageFiles.map((imgFile: ImageFile, index: number) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={imgFile.preview}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeImage(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {existingImages.length === 0 && imageFiles.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        Upload images to display in the showroom gallery
                    </p>
                )}
            </div>

            <div className="flex gap-4 pt-4">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        isEditMode ? 'Update Showroom' : 'Create Showroom'
                    )}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/showrooms")}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}
