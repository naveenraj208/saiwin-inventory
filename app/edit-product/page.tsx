// app/edit-product/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { clsx } from "clsx";

import Header from "../Header";
import Sidebar from "../Sidebar";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  product_no: string;
  description: string;
  total_in_store: number;
}

// ──────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────
export default function EditProductPage() {
  // product list
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // sidebar drawer
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);

  // editable fields
  const [name, setName] = useState("");
  const [productNo, setProductNo] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ─ Fetch products once
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("products").select("*");
      setProducts(data || []);
      setLoading(false);
    })();
  }, []);

  // ─ Open sidebar with product data
  const handleOpen = (p: Product) => {
    setSelected(p);
    setName(p.name);
    setProductNo(p.product_no);
    setDescription(p.description);
    setOpen(true);
    setError("");
  };

  // ─ Close sidebar/reset
  const resetSidebar = () => {
    setOpen(false);
    setSelected(null);
    setName("");
    setProductNo("");
    setDescription("");
    setSaving(false);
    setError("");
  };

  // ─ Save edits
  const handleSave = async () => {
    if (!selected) return;
    if (!name || !productNo || !description) {
      setError("All fields are required.");
      return;
    }
    setSaving(true);

    const { error } = await supabase
      .from("products")
      .update({ name, product_no: productNo, description })
      .eq("id", selected.id);

    setSaving(false);
    if (error) {
      setError(error.message);
    } else {
      // refresh list in memory
      setProducts((prev) =>
        prev.map((p) =>
          p.id === selected.id ? { ...p, name, product_no: productNo, description } : p
        )
      );
      resetSidebar();
    }
  };

  // ─ Delete product
  const handleDelete = async () => {
    if (!selected) return;
    if (!confirm("Are you sure you want to remove this product?")) return;

    const { error } = await supabase.from("products").delete().eq("id", selected.id);
    if (error) {
      alert(error.message);
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== selected.id));
      resetSidebar();
    }
  };

  // ────────────────────────────────────────────────────────
  return (
    <div className="flex text-black">
      {/* Persistent sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 min-h-screen bg-gray-100 p-6">
        <Header />

        <h1 className="text-2xl font-bold mb-6 text-black mt-4">Edit Products</h1>

        {loading ? (
          <p>Loading products…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => (
              <div
                key={p.id}
                onClick={() => handleOpen(p)}
                className="cursor-pointer bg-white rounded-lg shadow hover:shadow-lg transition p-4 border"
              >
                <h2 className="font-semibold text-lg text-black">{p.name}</h2>
                <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
                <p className="mt-2 text-sm">
                  <span className="font-medium">Product No:</span> {p.product_no}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ───────── Sidebar Drawer ───────── */}
      <div
        className={clsx(
          "fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-xl transform transition-transform duration-300 z-40",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {selected && (
          <div className="flex flex-col h-full text-black">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold">Edit Product</h2>
              <button
                onClick={resetSidebar}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              <Input label="Product Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input
                label="Product No"
                value={productNo}
                onChange={(e) => setProductNo(e.target.value)}
              />
              <Textarea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {error && <p className="text-red-600 text-sm">{error}</p>}
            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 border-t flex justify-between">
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>

              <div className="space-x-3">
                <button
                  onClick={resetSidebar}
                  className={clsx(
                    "px-4 py-2 rounded text-white bg-gradient-to-r from-gray-600 to-gray-900"
                  )}
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  onClick={handleSave}
                  className={clsx(
                    "px-4 py-2 rounded text-white bg-gradient-to-r from-gray-600 to-gray-900",
                    saving && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay when sidebar open */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={resetSidebar}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Sub‑components
// ──────────────────────────────────────────────────────────
function Input({
  label,
  ...props
}: React.ComponentProps<"input"> & { label: string }) {
  return (
    <label className="block text-black">
      <span className="font-medium">{label}</span>
      <input
        {...props}
        className="mt-1 w-full rounded border px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring focus:border-blue-400"
      />
    </label>
  );
}

function Textarea({
  label,
  ...props
}: React.ComponentProps<"textarea"> & { label: string }) {
  return (
    <label className="block text-black">
      <span className="font-medium">{label}</span>
      <textarea
        {...props}
        rows={4}
        className="mt-1 w-full rounded border px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring focus:border-blue-400 resize-none"
      />
    </label>
  );
}
