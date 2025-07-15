"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "./lib/supabase";
import ProductCard from "./ProductCard";
import SalesModal from "./SalesModal";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Product, Sale } from "./types/product";

export default function ProductsPage() {
  /* ───────────────────────── state ───────────────────────── */
  const [products, setProducts] = useState<Product[]>([]);
  const [openProductId, setOpenProductId] = useState<string | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);

  /* 🔎 company filter state  */
  const COMPANY_ALL = "All";
  const [companyFilter, setCompanyFilter] = useState<string>(COMPANY_ALL);

  /* ─────────────────────── fetch products ─────────────────── */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) console.error(error);
      setProducts(data || []);
    })();
  }, []);

  /* ─── fetch sales whenever a product is opened (lazy load) ─ */
  useEffect(() => {
    if (!openProductId) return;

    const fetchSales = async () => {
      setLoadingSales(true);
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .eq("product_id", openProductId);
      if (error) console.error(error);
      setSales((data as Sale[]) || []);
      setLoadingSales(false);
    };
    fetchSales();
  }, [openProductId]);

  /* ─────────────────────── delete product ─────────────────── */
  const handleDelete = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  /* ────────────────────── derived products ─────────────────── */
  const filteredProducts = useMemo(() => {
    if (companyFilter === COMPANY_ALL) return products;
    return products.filter(p => p.company?.toLowerCase() === companyFilter.toLowerCase());
  }, [products, companyFilter]);

  /* ─────────────────────────── ui ─────────────────────────── */
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        <Header />

        {/* page title */}
        <div className="my-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-black">Products</h2>

          {/* company filter aligned right */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: COMPANY_ALL, value: COMPANY_ALL },
              { label: "Saiwin Lights", value: "Saiwin Lights" },
              { label: "Prana Lights", value: "Prana Lights" },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setCompanyFilter(value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors
                  ${value === companyFilter ? "bg-gray-600 text-white" : "text-gray-600 hover:bg-gray-200"}
                  border-gray-600`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* products grid */}
        <section
          className="grid ml-4 gap-16 grid-cols-[repeat(auto-fill,minmax(min(100%,24rem),1fr))]"
        >
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onViewSales={setOpenProductId}
              onDelete={() => handleDelete(product.id)}
            />
          ))}
        </section>
      </main>

      {/* pop‑up sales modal OR spinner */}
      {openProductId &&
        (loadingSales ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            {/* simple tail‑wind spinner */}
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
          </div>
        ) : (
          <SalesModal
            open
            onClose={() => setOpenProductId(null)}
            sales={sales}
          />
        ))}
    </div>
  );
}
