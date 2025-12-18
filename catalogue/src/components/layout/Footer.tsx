import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-border/50 bg-muted/30">
            <div className="container py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold tracking-tight">LUXE</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            Premium clothing for the modern individual. Experience luxury at our showroom.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-5 text-foreground">Shop</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/catalog?category=men" className="hover:text-foreground transition-colors duration-200">Men</Link></li>
                            <li><Link href="/catalog?category=women" className="hover:text-foreground transition-colors duration-200">Women</Link></li>
                            <li><Link href="/catalog?category=kids" className="hover:text-foreground transition-colors duration-200">Kids</Link></li>
                            <li><Link href="/catalog?category=new" className="hover:text-foreground transition-colors duration-200">New Arrivals</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-5 text-foreground">Company</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-foreground transition-colors duration-200">About Us</Link></li>
                            <li><Link href="/showroom" className="hover:text-foreground transition-colors duration-200">Showroom</Link></li>
                            <li><Link href="/contact" className="hover:text-foreground transition-colors duration-200">Contact</Link></li>
                            <li><Link href="/terms" className="hover:text-foreground transition-colors duration-200">Terms & Conditions</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-5 text-foreground">Connect</h4>
                        <div className="flex gap-4 mb-6">
                            <Link href="#" className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110">
                                <Twitter className="h-5 w-5" />
                            </Link>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p>123 Fashion Street</p>
                            <p>New York, NY 10001</p>
                        </div>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} LUXE. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
