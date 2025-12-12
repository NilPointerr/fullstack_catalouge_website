/* eslint-disable @next/next/no-img-element */
import { HeroCarousel } from "@/components/features/HeroCarousel";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { name: "Women", image: "https://images.unsplash.com/photo-1525845859779-54d477ff291f?q=80&w=1000&auto=format&fit=crop" },
  { name: "Men", image: "https://images.unsplash.com/photo-1516257984-b1b4d8c9230c?q=80&w=1000&auto=format&fit=crop" },
  { name: "Kids", image: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?q=80&w=1000&auto=format&fit=crop" },
  { name: "Accessories", image: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=1000&auto=format&fit=crop" },
];

const trendingProducts = [
  { id: 1, name: "Classic White Tee", price: "$29.99", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop", category: "Men" },
  { id: 2, name: "Floral Summer Dress", price: "$59.99", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop", category: "Women" },
  { id: 3, name: "Denim Jacket", price: "$89.99", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop", category: "Unisex" },
  { id: 4, name: "Leather Handbag", price: "$129.99", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop", category: "Accessories" },
];

export default function Home() {
  return (
    <div className="space-y-16 pb-16">
      <HeroCarousel />

      {/* Categories */}
      <section className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
          <Link href="/catalog" className="text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/catalog?category=${category.name.toLowerCase()}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-muted"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url(${category.image})` }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="container">
        <h2 className="text-3xl font-bold tracking-tight mb-8">Trending Now</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((product) => (
            <div key={product.id} className="group relative">
              <div className="aspect-square overflow-hidden rounded-lg bg-muted mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.category}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold">{product.price}</span>
                <Button size="sm" variant="secondary">Add to Cart</Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="container">
        <div className="rounded-2xl bg-primary px-6 py-16 md:px-12 md:py-24 text-center text-primary-foreground">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Join the Club
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for exclusive offers, new arrivals, and fashion tips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
            />
            <Button variant="secondary">Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
