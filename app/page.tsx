"use client";

import { useEffect, useState } from "react";
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
  const [loadingSales, setLoadingSales] = useState(false);   // ✅ now used
  

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
      setLoadingSales(true);                                 // ✅ used here
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .eq("product_id", openProductId);
      if (error) console.error(error);
      setSales((data as Sale[]) || []);
      setLoadingSales(false);                                // ✅ and here
    };
    fetchSales();
  }, [openProductId]);

  /* ─────────────────────── delete product ─────────────────── */
  const handleDelete = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  /* ─────────────────────────── ui ─────────────────────────── */
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        <Header />

        <h2 className="my-6 text-xl font-bold text-black">Products</h2>

        <section
          className="grid ml-4 gap-16  grid-cols-[repeat(auto-fill,minmax(min(100%,24rem),1fr))]"
        >
          {products.map(product => (
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