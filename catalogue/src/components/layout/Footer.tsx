import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t bg-muted/40">
            <div className="container py-10 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold">LUXE</h3>
                        <p className="text-sm text-muted-foreground">
                            Premium clothing for the modern individual. Experience luxury at our showroom.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Shop</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/catalog?category=men">Men</Link></li>
                            <li><Link href="/catalog?category=women">Women</Link></li>
                            <li><Link href="/catalog?category=kids">Kids</Link></li>
                            <li><Link href="/catalog?category=new">New Arrivals</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="/showroom">Showroom</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                            <li><Link href="/terms">Terms & Conditions</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Connect</h4>
                        <div className="flex gap-4 text-muted-foreground">
                            <Link href="#" className="hover:text-foreground"><Instagram className="h-5 w-5" /></Link>
                            <Link href="#" className="hover:text-foreground"><Facebook className="h-5 w-5" /></Link>
                            <Link href="#" className="hover:text-foreground"><Twitter className="h-5 w-5" /></Link>
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground">
                            <p>123 Fashion Street</p>
                            <p>New York, NY 10001</p>
                        </div>
                    </div>
                </div>
                <div className="mt-10 pt-8 border-t text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} LUXE. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
