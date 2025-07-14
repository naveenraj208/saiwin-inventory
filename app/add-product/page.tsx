// app/add-product/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';  // ← adjust path if it differs
import { clsx } from 'clsx';

import Header from '../Header';              // shared header component
import Sidebar from '../Sidebar';            // shared sidebar component

// ──────────────────────────────────────────────────────────
// Add‑Product Page (with sidebar + header)
// ──────────────────────────────────────────────────────────
export default function AddProductPage() {
  // ── form state
  const [name, setName]               = useState('');
  const [productNo, setProductNo]     = useState('');
  const [description, setDescription] = useState('');
  const [total, setTotal]             = useState<number | ''>('');
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');

  // ── helpers
  const reset = () => {
    setName('');
    setProductNo('');
    setDescription('');
    setTotal('');
    setError('');
  };

  const handleSave = async () => {
    setError('');

    // basic validation (redundant but keeps code‑level guard)
    if (!name || !productNo || !description || total === '') {
      setError('All fields are required.');
      return;
    }
    if (+total < 0) {
      setError('Total in store cannot be negative.');
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('products')
      .insert({
        name,
        product_no: productNo,
        description,
        total_in_store: Number(total),
      });

    setSaving(false);

    if (error) {
      setError(error.message);
    } else {
      alert('Product added successfully!'); // replace with toast if desired
      reset();
    }
  };

  // ────────────────────────────────────────────────────────
  return (
    <div className="flex">
      {/* Sidebar (reuse the same component) */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        <Header />

        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-8 mt-5 text-black">
            Add New Product
          </h1>

          {/* Form */}
          <div className="space-y-5 text-black">
            <Input
              label="Product Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tracklight"
            />

            <Input
              label="Product No"
              value={productNo}
              onChange={(e) => setProductNo(e.target.value)}
              placeholder="SL‑00123"
            />

            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="45W"
            />

            <Input
              label="Total in Store"
              type="number"
              min={0}
              value={total}
              onChange={(e) =>
                setTotal(e.target.value ? Number(e.target.value) : '')
              }
              placeholder="0"
            />

            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>

          {/* Buttons */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className={clsx(
                'px-5 py-2 rounded text-white bg-gradient-to-r from-gray-600 to-gray-900',
                saving && 'opacity-50 cursor-not-allowed'
              )}
            >
              {saving ? 'Saving…' : 'Save Product'}
            </button>

            <button
              onClick={reset}
              disabled={saving}
              className="px-5 py-2 rounded text-white bg-gradient-to-r from-gray-600 to-gray-900"
            >
              Reset
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Reusable Input & Textarea sub‑components
// ──────────────────────────────────────────────────────────
function Input({
  label,
  ...props
}: React.ComponentProps<'input'> & { label: string }) {
  return (
    <label className="block">
      <span className="font-medium">{label}</span>
      <input
        {...props}
        required
        className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-400"
      />
    </label>
  );
}

function Textarea({
  label,
  ...props
}: React.ComponentProps<'textarea'> & { label: string }) {
  return (
    <label className="block">
      <span className="font-medium">{label}</span>
      <textarea
        {...props}
        required
        rows={4}
        className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-400 resize-none"
      />
    </label>
  );
}
