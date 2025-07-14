// components/SalesTable.tsx
"use client";

import { Sale } from "./types/product";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable, { UserOptions } from "jspdf-autotable";

/* ────────────── Excel Export ────────────── */
const exportExcel = (sales: Sale[]) => {
  const data = sales.map(sale => {
    const entries = Object.entries(sale).filter(([key]) => key !== "id");
    return Object.fromEntries(entries);
  });
   // omit ID
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sales");
  XLSX.writeFile(wb, "sales.xlsx");
};

/* ────────────── PDF Export ────────────── */
const exportPDF = (sales: Sale[]) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" });

  const options: Partial<UserOptions> = {
    head: [[
      "S.No", "Name", "Mob", "Location",
      "Description", "Color", "Qty", "Type", "Added By"
    ]],
    body: sales.map((s, idx) => [
      idx + 1,
      s.name,
      s.mob,
      s.location,
      s.description,
      s.color,
      s.quantity,
      s.type,
      s.created_by || "—",
    ]),
    styles: { fontSize: 8 },
    margin: { top: 40 },
  };

  autoTable(doc, options);
  doc.save("sales.pdf");
};

/* ────────────── SalesTable Component ────────────── */
export default function SalesTable({ sales }: { sales: Sale[] }) {
  return (
    <div className="w-full">
      {/* Export Buttons */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => exportExcel(sales)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Download .xlsx
        </button>
        <button
          onClick={() => exportPDF(sales)}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Download PDF
        </button>
      </div>

      {/* Sales Table */}
      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">S.No</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Mob</th>
              <th className="px-3 py-2 text-left">Location</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-left">Color</th>
              <th className="px-3 py-2 text-left">Qty</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Added By</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s, idx) => (
              <tr
                key={s.id}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-3 py-2">{idx + 1}</td>
                <td className="px-3 py-2">{s.name}</td>
                <td className="px-3 py-2">{s.mob}</td>
                <td className="px-3 py-2">{s.location}</td>
                <td className="px-3 py-2">{s.description}</td>
                <td className="px-3 py-2">{s.color}</td>
                <td className="px-3 py-2">{s.quantity}</td>
                <td className="px-3 py-2 font-semibold">
                  <span
                    className={
                      s.type === "sold"
                        ? "text-red-600"
                        : "text-green-600"
                    }
                  >
                    {s.type}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-800">
                  {s.created_by || "—"}
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-6 text-center text-gray-400"
                >
                  No sales data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
