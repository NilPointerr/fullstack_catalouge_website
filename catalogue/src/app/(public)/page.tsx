"use client";

import { HeroCarousel } from "@/components/features/HeroCarousel";
import { ProductCard } from "@/components/features/ProductCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getTrendingProducts, Product } from "@/lib/api";

const categories = [
  { name: "Women", image: "https://images.unsplash.com/photo-1525845859779-54d477ff291f?q=80&w=1000&auto=format&fit=crop" },
  { name: "Men", image: "https://images.unsplash.com/photo-1516257984-b1b4d8c9230c?q=80&w=1000&auto=format&fit=crop" },
  { name: "Kids", image: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?q=80&w=1000&auto=format&fit=crop" },
  { name: "Accessories", image: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=1000&auto=format&fit=crop" },
];

export default function Home() {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        setIsLoading(true);
        const products = await getTrendingProducts(4);
        setTrendingProducts(products);
      } catch (error) {
        console.error("Failed to fetch trending products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingProducts();
  }, []);

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
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-muted rounded-xl mb-4" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : trendingProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No trending products available at the moment.</p>
          </div>
        )}
      </section>
    </div>
  );
}
