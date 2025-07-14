"use client";

import { useEffect, useState } from "react";
import {supabase} from "../lib/supabase";          // ✅ root‑alias import
import { addSale } from "./actions";
import Header from "../Header";
import Sidebar from "../Sidebar";
import clsx from "clsx";

/* ───────── Types ───────── */
interface Product {
  id: string;
  name: string;
  description: string;
  total_in_store: number;
}
type SaleType = "income" | "outgoing";

/* quick input utility */
const inputCls =
  "w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-400";

/* ───────── Component ───────── */
export default function AddCustomerPage() {
  /* state */
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);

  const [customer, setCustomer] = useState("");
  const [mob, setMob] = useState("");
  const [location, setLocation] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [saleType, setSaleType] = useState<SaleType>("income");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  /* fetch products once */
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, description, total_in_store")
        .order("name");
      setProducts(data || []);
      setLoading(false);
    })();
  }, []);

  /* helpers */
  const resetModal = () => {
    setOpen(false);
    setSelected(null);
    setCustomer("");
    setMob("");
    setLocation("");
    setColor("");
    setQty(1);
    setSaleType("income");
    setError("");
  };

  /* save */
  async function handleSave() {
    if (!selected) return;

    /* validation */
    if (!customer || !mob || !location || !color || qty < 1) {
      setError("All fields are required and quantity must be > 0.");
      return;
    }
    if (!/^[0-9]{10}$/.test(mob)) {
      setError("Mobile must be exactly 10 digits.");
      return;
    }
    if (/\d/.test(customer)) {
      setError("Customer name must not contain numbers.");
      return;
    }

    const currentStock = selected.total_in_store;
    if (saleType === "outgoing" && qty > currentStock) {
      setError(`Only ${currentStock} in stock; cannot sell ${qty}.`);
      return;
    }

    const newTotal =
      saleType === "income" ? currentStock + qty : currentStock - qty;

    setSaving(true);
    try {
      await addSale({
        product_id: selected.id,
        name: selected.name,
        customer_name: customer,
        mob,
        location,
        description: selected.description,
        color,
        quantity: qty,
        type: saleType === "income" ? "bought" : "sold",
        /* 👇 attach whoever is logged in */
        created_by: localStorage.getItem("username") ?? "",
      });

      /* update UI stock */
      setProducts((prev) =>
        prev.map((p) =>
          p.id === selected.id ? { ...p, total_in_store: newTotal } : p
        )
      );
      resetModal();
    } catch (e) {               // e is typed as unknown
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Unexpected error");
      }
    } finally {
      setSaving(false);
    }
  }

  /* ───────── Render ───────── */
  return (
    <div className="flex text-black">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-gray-100 p-6">
        <Header />

        <h1 className="text-2xl font-bold my-6">Add Customer / Billing</h1>

        {loading ? (
          <p>Loading products…</p>
        ) : (
          <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(18rem,1fr))]">
            {products.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setSelected(p);
                  setOpen(true);
                }}
                className="cursor-pointer bg-white rounded-lg border shadow-sm hover:shadow-lg transition p-4"
              >
                <h2 className="font-semibold text-lg">{p.name}</h2>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {p.description}
                </p>
                <p className="mt-2 text-sm">
                  <span className="font-medium">In Store:</span>{" "}
                  {p.total_in_store}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {open && selected && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={resetModal} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-2xl">
              <h2 className="text-xl font-bold mb-4">Bill Product</h2>

              <p className="font-medium">{selected.name}</p>
              <p className="text-gray-600 text-sm mb-4">
                {selected.description}
              </p>

              {/* Type */}
              <div className="mb-4">
                <label className="mr-4 font-medium">Type:</label>
                <label className="mr-4">
                  <input
                    type="radio"
                    checked={saleType === "income"}
                    onChange={() => setSaleType("income")}
                  />{" "}
                  Incoming
                </label>
                <label>
                  <input
                    type="radio"
                    checked={saleType === "outgoing"}
                    onChange={() => setSaleType("outgoing")}
                  />{" "}
                  Outgoing
                </label>
              </div>

              {/* Form */}
              <div className="grid gap-4 sm:grid-cols-2 mb-4">
                <input
                  className={inputCls}
                  placeholder="Customer Name"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                />
                <input
                  className={inputCls}
                  placeholder="Mobile"
                  value={mob}
                  onChange={(e) => setMob(e.target.value)}
                />
                <input
                  className={inputCls}
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <input
                  className={inputCls}
                  placeholder="Color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
                <input
                  type="number"
                  min={1}
                  className={inputCls}
                  placeholder="Quantity"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                />
              </div>

              {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

              <div className="flex justify-end gap-3">
                <button
                  onClick={resetModal}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  onClick={handleSave}
                  className={clsx(
                    "px-4 py-2 rounded text-white",
                    saving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
