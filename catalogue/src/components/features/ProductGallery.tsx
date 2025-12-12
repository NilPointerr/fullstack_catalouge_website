/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
    images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);

    return (
        <div className="flex flex-col-reverse gap-4 md:flex-row">
            {/* Thumbnails */}
            <div className="flex gap-4 md:flex-col overflow-x-auto md:overflow-visible">
                {images.map((image, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={cn(
                            "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-muted",
                            selectedImage === index ? "ring-2 ring-primary" : "ring-transparent"
                        )}
                    >
                        <img
                            src={image}
                            alt={`Product image ${index + 1}`}
                            className="h-full w-full object-cover"
                        />
                    </button>
                ))}
            </div>

            {/* Main Image */}
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                <img
                    src={images[selectedImage]}
                    alt="Product main image"
                    className="h-full w-full object-cover"
                />
            </div>
        </div>
    );
}
