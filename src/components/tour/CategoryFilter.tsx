"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, Suspense } from "react";

interface Category {
  slug: string;
  label: string;
  icon: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  searchQuery: string;
}

function CategoryFilterInner({ categories, activeCategory, searchQuery }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchQuery);

  const updateFilters = useCallback(
    (newCategory?: string, newQuery?: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newCategory !== undefined) {
        if (newCategory === "tutte") {
          params.delete("categoria");
        } else {
          params.set("categoria", newCategory);
        }
      }

      if (newQuery !== undefined) {
        if (newQuery.trim() === "") {
          params.delete("q");
        } else {
          params.set("q", newQuery.trim());
        }
      }

      const queryString = params.toString();
      router.push(`/esperienze${queryString ? `?${queryString}` : ""}`);
    },
    [router, searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(undefined, search);
  };

  return (
    <div>
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-6">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-gray-light"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca esperienze..."
            className="w-full rounded-full border border-gray-200 py-3 pl-12 pr-4 text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
          />
        </div>
      </form>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => updateFilters(cat.slug)}
            className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition-all ${
              activeCategory === cat.slug
                ? "bg-gold text-white shadow-sm"
                : "bg-white text-navy border border-gray-200 hover:border-gold hover:text-gold"
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CategoryFilter(props: CategoryFilterProps) {
  return (
    <Suspense fallback={<div className="h-24" />}>
      <CategoryFilterInner {...props} />
    </Suspense>
  );
}
