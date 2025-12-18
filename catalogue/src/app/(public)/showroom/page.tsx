/* eslint-disable @next/next/no-img-element */
"use client";

import { MapPin, Clock, Phone, Mail, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getShowrooms, Showroom, getBackendBaseURL } from "@/lib/api";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const cardHoverVariants = {
    rest: {
        scale: 1,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    },
    hover: {
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12)",
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

// Glassmorphism card component
const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    return (
        <motion.div
            className={`
                relative backdrop-blur-xl bg-gradient-to-br 
                from-white/80 dark:from-slate-deep/80 
                to-white/60 dark:to-slate-deep-light/60
                border border-white/20 dark:border-white/10
                rounded-2xl p-8
                shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]
                ${className}
            `}
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
        >
            {children}
        </motion.div>
    );
};

// Showroom card component
const ShowroomCard = ({ 
    showroom, 
    isSelected, 
    onClick 
}: { 
    showroom: Showroom; 
    isSelected: boolean; 
    onClick: () => void;
}) => {
    return (
        <motion.div
            variants={itemVariants}
            className="group cursor-pointer"
            onClick={onClick}
        >
            <motion.div
                className={`
                    relative overflow-hidden rounded-2xl
                    backdrop-blur-xl bg-gradient-to-br 
                    from-white/90 dark:from-slate-deep/90 
                    to-white/70 dark:to-slate-deep-light/70
                    border transition-all duration-300
                    ${isSelected 
                        ? "border-slate-900 dark:border-white/30 shadow-2xl scale-[1.02]" 
                        : "border-white/20 dark:border-white/10 shadow-lg hover:shadow-2xl"
                    }
                `}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="p-8 space-y-4">
                    <div className="flex items-start justify-between">
                        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {showroom.name}
                        </h3>
                        {isSelected && (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="w-6 h-6 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center"
                            >
                                <Sparkles className="w-4 h-4 text-white dark:text-slate-deep" />
                            </motion.div>
                        )}
                    </div>
                    <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                        <p className="flex items-center gap-2 font-medium">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="line-clamp-2">
                                {showroom.address}, {showroom.city}, {showroom.state} {showroom.zip_code}
                            </span>
                        </p>
                        <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            {showroom.phone}
                        </p>
                    </div>
                </div>
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-slate-900/0 to-slate-900/0 group-hover:from-slate-900/5 group-hover:to-transparent dark:group-hover:from-white/5"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                />
            </motion.div>
        </motion.div>
    );
};

export default function ShowroomPage() {
    const router = useRouter();
    const [showrooms, setShowrooms] = useState<Showroom[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedShowroom, setSelectedShowroom] = useState<Showroom | null>(null);
    const { scrollY } = useScroll();
    const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);
    const y = useTransform(scrollY, [0, 300], [0, -50]);

    useEffect(() => {
        const fetchShowrooms = async () => {
            try {
                const data = await getShowrooms(true);
                setShowrooms(data);
                if (data.length > 0) {
                    setSelectedShowroom(data[0]);
                }
            } catch (error) {
                console.error("Failed to fetch showrooms:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchShowrooms();
    }, []);

    const formatHours = (hours: Record<string, string>) => {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        return days.map(day => {
            const dayName = day.charAt(0).toUpperCase() + day.slice(1);
            const hoursStr = hours[day] || 'Closed';
            return { day: dayName, hours: hoursStr };
        });
    };

    // Helper to get full image URL - prepend backend URL if relative path
    const getImageUrl = (imageUrl: string) => {
        if (!imageUrl || imageUrl.trim() === '') {
            return '';
        }
        const trimmedUrl = imageUrl.trim();
        // If already a full URL, return as is
        if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
            return trimmedUrl;
        }
        // Relative path - prepend backend URL
        const backendUrl = getBackendBaseURL();
        return `${backendUrl}${trimmedUrl.startsWith('/') ? trimmedUrl : '/' + trimmedUrl}`;
    };

    // Helper to validate and fix Google Maps embed URL
    const getMapUrl = (mapUrl: string | undefined): string | null => {
        if (!mapUrl || mapUrl.trim() === '') {
            return null;
        }
        let trimmedUrl = mapUrl.trim();
        
        // Fix common URL issues
        // 1. Replace http:// with https://
        if (trimmedUrl.startsWith('http://')) {
            trimmedUrl = trimmedUrl.replace(/^http:\/\//, 'https://');
        }
        
        // 2. If it starts with //, prepend https:
        if (trimmedUrl.startsWith('//')) {
            trimmedUrl = 'https:' + trimmedUrl;
        }
        
        // 3. Ensure it starts with https:// for Google Maps
        if (trimmedUrl.includes('google.com') && !trimmedUrl.startsWith('https://')) {
            trimmedUrl = 'https://' + trimmedUrl.replace(/^\/+/, '');
        }
        
        // 4. Validate it's a Google Maps URL
        if (!trimmedUrl.includes('google.com/maps')) {
            return null;
        }
        
        return trimmedUrl;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-offwhite to-white dark:from-slate-deep dark:to-slate-deep-light">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                >
                    <div className="w-16 h-16 border-4 border-slate-900/20 dark:border-white/20 border-t-slate-900 dark:border-t-white rounded-full animate-spin mx-auto" />
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Loading showrooms...</p>
                </motion.div>
            </div>
        );
    }

    if (showrooms.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-offwhite to-white dark:from-slate-deep dark:to-slate-deep-light py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="container text-center max-w-2xl mx-auto space-y-6"
                >
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Visit Our Showroom
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400">
                        No showrooms available at the moment. Please check back later.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-offwhite via-white to-offwhite-warm dark:from-slate-deep dark:via-slate-deep-light dark:to-slate-deep">
            {/* Hero Section */}
            <motion.div
                style={{ opacity, y }}
                className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden"
            >
                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent dark:via-slate-deep/50" />
                
                <div className="container relative z-10">
                    {/* Back Button - Mobile */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-8 md:hidden"
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="group -ml-2"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                            Back
                        </Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="text-center max-w-3xl mx-auto space-y-6"
                    >
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight"
                        >
                            Visit Our Showrooms
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-light leading-relaxed"
                        >
                            Experience our collections in person. Our stylists are here to help you find the perfect look.
                        </motion.p>
                    </motion.div>
                </div>
            </motion.div>

            <div className="container pb-24 space-y-16 md:space-y-24">
                {/* Showroom Selector - if multiple showrooms */}
                {showrooms.length > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="flex flex-wrap gap-3 justify-center"
                    >
                        {showrooms.map((showroom) => (
                            <motion.div
                                key={showroom.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    variant={selectedShowroom?.id === showroom.id ? "default" : "outline"}
                                    onClick={() => {
                                        setSelectedShowroom(showroom);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className={`
                                        rounded-full px-6 py-2.5 font-medium transition-all duration-300
                                        ${selectedShowroom?.id === showroom.id
                                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-deep shadow-lg"
                                            : "bg-white/80 dark:bg-slate-deep-light/80 border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-slate-deep-lighter"
                                        }
                                    `}
                                >
                                    {showroom.name}
                                </Button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Display Selected Showroom */}
                <AnimatePresence mode="wait">
                    {selectedShowroom && (
                        <motion.div
                            key={selectedShowroom.id}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -40 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                                {/* Info Section */}
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="space-y-8"
                                >
                                    <motion.div variants={itemVariants}>
                                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                                            {selectedShowroom.name}
                                        </h2>
                                        <div className="h-1 w-24 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 rounded-full" />
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <GlassCard>
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-900/10 dark:bg-white/10 flex items-center justify-center">
                                                        <MapPin className="h-6 w-6 text-slate-900 dark:text-white" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                                        Location
                                                    </h3>
                                                </div>
                                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg pl-16">
                                                    {selectedShowroom.address}<br />
                                                    {selectedShowroom.city}, {selectedShowroom.state}<br />
                                                    {selectedShowroom.zip_code}
                                                </p>
                                            </div>
                                        </GlassCard>
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <GlassCard>
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-900/10 dark:bg-white/10 flex items-center justify-center">
                                                        <Clock className="h-6 w-6 text-slate-900 dark:text-white" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                                        Opening Hours
                                                    </h3>
                                                </div>
                                                <div className="space-y-2 pl-16">
                                                    {formatHours(selectedShowroom.opening_hours).map(({ day, hours }, index) => (
                                                        <motion.div
                                                            key={day}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.8 + index * 0.05 }}
                                                            className="flex justify-between items-center py-2 border-b border-slate-200/50 dark:border-white/10 last:border-0"
                                                        >
                                                            <span className="font-medium text-slate-700 dark:text-slate-300">{day}</span>
                                                            <span className={`font-semibold ${hours === 'Closed' ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                                                                {hours}
                                                            </span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        </GlassCard>
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <GlassCard>
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-900/10 dark:bg-white/10 flex items-center justify-center">
                                                        <Phone className="h-6 w-6 text-slate-900 dark:text-white" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                                        Contact
                                                    </h3>
                                                </div>
                                                <div className="space-y-4 pl-16">
                                                    <motion.a
                                                        href={`tel:${selectedShowroom.phone}`}
                                                        whileHover={{ x: 4 }}
                                                        className="flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors group"
                                                    >
                                                        <Phone className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                                        <span className="text-lg font-medium">{selectedShowroom.phone}</span>
                                                    </motion.a>
                                                    <motion.a
                                                        href={`mailto:${selectedShowroom.email}`}
                                                        whileHover={{ x: 4 }}
                                                        className="flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors group"
                                                    >
                                                        <Mail className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                                        <span className="text-lg font-medium">{selectedShowroom.email}</span>
                                                    </motion.a>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                </motion.div>

                                {/* Map Section */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                    className="relative"
                                >
                                    <div className="sticky top-8">
                                        <GlassCard className="p-0 overflow-hidden aspect-square lg:aspect-auto lg:h-[600px]">
                                            {(() => {
                                                const validMapUrl = getMapUrl(selectedShowroom.map_url);
                                                
                                                if (validMapUrl) {
                                                    return (
                                                        <iframe
                                                            src={validMapUrl}
                                                            width="100%"
                                                            height="100%"
                                                            style={{ border: 0 }}
                                                            allowFullScreen
                                                            loading="lazy"
                                                            referrerPolicy="no-referrer-when-downgrade"
                                                            className="absolute inset-0 w-full h-full"
                                                            title="Showroom Location Map"
                                                            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                                                        />
                                                    );
                                                }
                                                
                                                // Fallback: Show placeholder with link to Google Maps
                                                const address = `${selectedShowroom.address}, ${selectedShowroom.city}, ${selectedShowroom.state} ${selectedShowroom.zip_code}`;
                                                const encodedAddress = encodeURIComponent(address);
                                                const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                                                
                                                return (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-deep-lighter dark:to-slate-deep-light flex items-center justify-center">
                                                        <div className="text-center space-y-6 p-8">
                                                            <MapPin className="h-20 w-20 mx-auto text-slate-400 dark:text-slate-600" />
                                                            <div className="space-y-2">
                                                                <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">
                                                                    Map not available
                                                                </p>
                                                                <p className="text-slate-500 dark:text-slate-500 text-sm max-w-md">
                                                                    {address}
                                                                </p>
                                                            </div>
                                                            <motion.a
                                                                href={googleMapsLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-deep rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                                                            >
                                                                <MapPin className="h-5 w-5" />
                                                                Open in Google Maps
                                                            </motion.a>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </GlassCard>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Gallery Section */}
                            {selectedShowroom.gallery_images && selectedShowroom.gallery_images.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                    className="space-y-8 mt-16"
                                >
                                    <div>
                                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                                            Inside the Store
                                        </h2>
                                        <div className="h-1 w-24 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 rounded-full" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {selectedShowroom.gallery_images.map((imageUrl, index) => {
                                            const fullImageUrl = getImageUrl(imageUrl);
                                            if (!fullImageUrl) return null;
                                            
                                            return (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 30 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                                    className="group relative aspect-[4/3] rounded-2xl overflow-hidden"
                                                >
                                                    <motion.div
                                                        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                                                    />
                                                    <img
                                                        src={fullImageUrl}
                                                        alt={`Showroom interior ${index + 1}`}
                                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        onError={(e) => {
                                                            // Fallback to placeholder if image fails to load
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = 'https://placehold.co/800x600?text=Image+Not+Available';
                                                        }}
                                                    />
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Display All Showrooms in Grid if Multiple */}
                {showrooms.length > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-12 mt-24"
                    >
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                                All Our Locations
                            </h2>
                            <p className="text-xl text-slate-600 dark:text-slate-400">
                                Explore our showrooms across the world
                            </p>
                        </div>
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {showrooms.map((showroom) => (
                                <ShowroomCard
                                    key={showroom.id}
                                    showroom={showroom}
                                    isSelected={selectedShowroom?.id === showroom.id}
                                    onClick={() => {
                                        setSelectedShowroom(showroom);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                />
                            ))}
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
