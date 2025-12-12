/* eslint-disable @next/next/no-img-element */
import { MapPin, Clock, Phone, Mail } from "lucide-react";

export default function ShowroomPage() {
    return (
        <div className="container py-8 md:py-12 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Visit Our Showroom</h1>
                <p className="text-lg text-muted-foreground">
                    Experience our collections in person. Our stylists are here to help you find the perfect look.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {/* Info */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <MapPin className="h-5 w-5" /> Location
                        </h3>
                        <p className="text-muted-foreground ml-7">
                            123 Fashion Street<br />
                            Soho, New York<br />
                            NY 10012
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <Clock className="h-5 w-5" /> Opening Hours
                        </h3>
                        <div className="ml-7 space-y-1 text-muted-foreground">
                            <div className="flex justify-between max-w-xs">
                                <span>Mon - Fri</span>
                                <span>10:00 AM - 8:00 PM</span>
                            </div>
                            <div className="flex justify-between max-w-xs">
                                <span>Saturday</span>
                                <span>11:00 AM - 7:00 PM</span>
                            </div>
                            <div className="flex justify-between max-w-xs">
                                <span>Sunday</span>
                                <span>12:00 PM - 6:00 PM</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <Phone className="h-5 w-5" /> Contact
                        </h3>
                        <div className="ml-7 space-y-1 text-muted-foreground">
                            <p className="flex items-center gap-2">
                                <Phone className="h-4 w-4" /> +1 (555) 123-4567
                            </p>
                            <p className="flex items-center gap-2">
                                <Mail className="h-4 w-4" /> hello@luxe.com
                            </p>
                        </div>
                    </div>
                </div>

                {/* Map Placeholder */}
                <div className="aspect-square md:aspect-auto rounded-lg bg-muted flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-muted-foreground">
                        Map Embed Placeholder
                    </div>
                </div>
            </div>

            {/* Gallery */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">Inside the Store</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="aspect-[4/3] rounded-lg bg-muted overflow-hidden">
                            <img
                                src={`https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop&random=${i}`}
                                alt={`Showroom interior ${i}`}
                                className="h-full w-full object-cover transition-transform hover:scale-105 duration-500"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
