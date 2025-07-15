// app/add-product/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

import { supabase } from '../lib/supabase';
import { clsx } from 'clsx';
import * as XLSX from 'xlsx';

import Header from '../Header';
import Sidebar from '../Sidebar';
type ProductRow = {
  name: string;
  product_no: string;
  description: string;
  total_in_store: number;
  company: 'saiwin lights' | 'prana lights';
};


/* ───────────── 1. Page wrapper that waits for “mounted” ──────────── */
export default function AddProductPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // ⏳ During hydration: render nothing → no mismatch possible
    return null;
  }

  // ✅ After hydration: render the real UI
  return <AddProductClient />;
}

/* ───────────── 2. Actual client component ──────────── */
function AddProductClient() {
  /* ── single‑item form state ─────────────────────────────── */
  const [name, setName]               = useState('');
  const [productNo, setProductNo]     = useState('');
  const [description, setDescription] = useState('');
  const [total, setTotal]             = useState<number | ''>('');
  const [company, setCompany]         = useState<'saiwin lights' | 'prana lights' | ''>('');
  const [error, setError]             = useState('');

  /* ── bulk upload state ──────────────────────────────────── */
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [saving, setSaving]           = useState(false);
  const fileInputRef                  = useRef<HTMLInputElement | null>(null);

  /* ── helpers ───────────────────────────────────────────── */
  const reset = () => {
    setName(''); setProductNo(''); setDescription('');
    setTotal(''); setCompany(''); setError('');
  };

  const readWorkbook = async (file: File) => {
    try {
      const wb  = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json  = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      const cleaned: ProductRow[] = json.map((r, idx) => {
        // narrow unknown → Record<string, unknown>
        const row = r as Record<string, unknown>;
  
        const parsed: ProductRow = {
          name:           String(row.name ?? '').trim(),
          product_no:     String(row.product_no ?? '').trim(),
          description:    String(row.description ?? '').trim(),
          total_in_store: Number(row.total_in_store),
          company:        String(row.company ?? '')
                           .trim()
                           .toLowerCase() as ProductRow['company'],
        };
  
        /* validate each row */
        if (
          !parsed.name ||
          !parsed.product_no ||
          !parsed.description ||
          Number.isNaN(parsed.total_in_store) ||
          parsed.total_in_store < 0 ||
          !['saiwin lights', 'prana lights'].includes(parsed.company)
        ) {
          throw new Error(`Invalid data in Excel row ${idx + 2}`);
        }
  
        return parsed;
      });
  
      setRows(cleaned);
      alert(`✔ Loaded ${cleaned.length} valid row(s). Click “Upload” to save.`);
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : 'Unknown error while reading Excel file';
  
      alert(`❌ Could not read file: ${message}`);
      setRows([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  /* ── single insert ─────────────────────────────────────── */
  const handleSave = async () => {
    setError('');
    if (!name || !productNo || !description || total === '' || !company) {
      setError('All fields are required.'); return;
    }
    if (+total < 0) { setError('Total in store cannot be negative.'); return; }

    setSaving(true);
    const { error } = await supabase.from('products').insert({
      name, product_no: productNo, description,
      total_in_store: Number(total), company
    });
    setSaving(false);

    if (error) setError(error.message);
    else { alert('✅ Product added.'); reset(); }
  };

  /* ── bulk insert ───────────────────────────────────────── */
  const handleBulkSave = async () => {
    if (rows.length === 0) { fileInputRef.current?.click(); return; }

    setSaving(true);
    const { error } = await supabase.from('products').insert(rows);
    setSaving(false);

    if (error) {
      alert(`❌ Upload failed: ${error.message}`);
      setRows([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      alert('✅ All products added!');
      setRows([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /* ── UI ───────────────────────────────────────────────── */
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        <Header />

        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-8 mt-5 text-black">
            Add New Product
          </h1>

          {/* ── single‑item form ── */}
          <div className="space-y-5 text-black">
            <Input label="Product Name" value={name}
              onChange={(e) => setName(e.target.value)} placeholder="e.g. Tracklight" />
            <Input label="Product No" value={productNo}
              onChange={(e) => setProductNo(e.target.value)} placeholder="SL‑00123" />
            <Textarea label="Description" value={description}
              onChange={(e) => setDescription(e.target.value)} placeholder="45W" />
            <Input label="Total in Store" type="number" min={0} value={total}
              onChange={(e) => setTotal(e.target.value ? Number(e.target.value) : '')}
              placeholder="0" />

            {/* Company Dropdown */}
            <label className="block">
              <span className="font-medium">Company</span>
              <select
                required
                className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-400"
                value={company}
                onChange={(e) =>
                  setCompany(e.target.value as 'saiwin lights' | 'prana lights' | '')
                }
              >
                <option value="">Select Company</option>
                <option value="saiwin lights">Saiwin Lights</option>
                <option value="prana lights">Prana Lights</option>
              </select>
            </label>

            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>

          {/* ── buttons ── */}
          <div className="mt-8 flex flex-wrap gap-3">
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

            <button
              onClick={handleBulkSave}
              disabled={saving}
              className={clsx(
                'px-5 py-2 rounded text-white bg-gradient-to-r from-emerald-600 to-emerald-800',
                saving && 'opacity-50 cursor-not-allowed'
              )}
            >
              {rows.length === 0 ? 'Add / Retry Excel' : `Upload ${rows.length} row(s)`}
            </button>

            {/* hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) readWorkbook(f);
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── tiny reusable controls ───────────────────────────── */
function Input({
  label, ...props
}: React.ComponentProps<'input'> & { label: string }) {
  return (
    <label className="block">
      <span className="font-medium">{label}</span>
      <input {...props} required
        className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-400" />
    </label>
  );
}

function Textarea({
  label, ...props
}: React.ComponentProps<'textarea'> & { label: string }) {
  return (
    <label className="block">
      <span className="font-medium">{label}</span>
      <textarea {...props} required rows={4}
        className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-400 resize-none" />
    </label>
  );
}
