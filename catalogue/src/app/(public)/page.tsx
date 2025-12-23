"use client";

import { HeroCarousel } from "@/components/features/HeroCarousel";
import { ProductCard } from "@/components/features/ProductCard";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Category, getCategories, getTrendingProducts, Product, getBackendBaseURL } from "@/lib/api";

const fallbackCategoryImages: Record<string, string> = {
  women: "https://images.unsplash.com/photo-1525845859779-54d477ff291f?q=80&w=1000&auto=format&fit=crop",
  men: "https://images.unsplash.com/photo-1516257984-b1b4d8c9230c?q=80&w=1000&auto=format&fit=crop",
  kids: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?q=80&w=1000&auto=format&fit=crop",
  accessories: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=1000&auto=format&fit=crop",
};

const getCategoryImage = (category: Category) => {
  const key = category.slug?.toLowerCase();
  return category.image_url || (key ? fallbackCategoryImages[key] : undefined);
};

const resolveImageUrl = (url?: string) => {
  if (!url) return "";
  return url.startsWith("/") ? `${getBackendBaseURL()}${url}` : url;
};

export default function Home() {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setCategoriesLoading(true);
        const [products, cats] = await Promise.all([
          getTrendingProducts(4),
          getCategories(),
        ]);
        setTrendingProducts(products);
        setCategories(cats.map((c) => ({ ...c, image_url: resolveImageUrl(c.image_url) })));
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
        setCategoriesLoading(false);
      }
    };

    fetchData();
  }, []);

  const scrollCategories = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 0) {
        setScrollProgress(100);
        return;
      }
      setScrollProgress(Math.min(100, (container.scrollLeft / maxScroll) * 100));
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [categoriesLoading, categories.length]);

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
        <div className="relative">
          {categories.length > 4 && (
            <>
              <button
                onClick={() => scrollCategories("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 shadow border flex items-center justify-center hover:bg-background transition-colors"
                aria-label="Scroll categories left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scrollCategories("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 shadow border flex items-center justify-center hover:bg-background transition-colors"
                aria-label="Scroll categories right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background via-background/70 to-transparent rounded-l-lg" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background via-background/70 to-transparent rounded-r-lg" />
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory"
          >
            {categoriesLoading && (
              <>
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="min-w-[220px] md:min-w-[260px] aspect-[3/4] bg-muted rounded-lg animate-pulse"
                  />
                ))}
              </>
            )}
            {!categoriesLoading && categories.length === 0 && (
              <div className="text-muted-foreground">No categories available yet.</div>
            )}
            {!categoriesLoading &&
              categories.map((category) => {
                const image = getCategoryImage(category);
                return (
                  <Link
                    key={category.id}
                    href={`/catalog?category=${category.slug}`}
                    className="group relative min-w-[220px] md:min-w-[260px] aspect-[3/4] overflow-hidden rounded-lg bg-muted flex-shrink-0 snap-start transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30"
                  >
                    {image ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                        style={{ backgroundImage: `url(${image})` }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700" />
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold capitalize">{category.name}</h3>
                    </div>
                  </Link>
                );
              })}
          </div>
          {categories.length > 4 && (
            <div className="mt-3 h-1 w-full rounded-full bg-muted/50 overflow-hidden">
              <div
                className="h-full bg-primary transition-[width] duration-300"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
          )}
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
