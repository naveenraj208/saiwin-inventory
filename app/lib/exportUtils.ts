// utils/exportHelpers.ts
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable, { UserOptions } from "jspdf-autotable";

/**
 * Export an array of objects to an .xlsx file.
 * The order of columns follows Object.keys of the first row.
 */
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  fileName = "sales.xlsx"
) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
  XLSX.writeFile(workbook, fileName);
}

/**
 * Export an array of objects to a PDF table using jspdf‑autotable.
 * Automatically infers columns from the first row.
 */
export function exportToPDF<T extends Record<string, unknown>>(
  data: T[],
  fileName = "sales.pdf"
) {
  if (data.length === 0) {
    console.warn("exportToPDF called with empty data array");
    return;
  }

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" });

  const columns = Object.keys(data[0]) as (keyof T)[];
  const rows = data.map(row => columns.map(col => row[col] as string | number));

  const options: Partial<UserOptions> = {
    head: [columns as string[]],
    body: rows as (string | number)[][],
    styles: { fontSize: 8 },
    margin: { top: 40 },
  };

  autoTable(doc, options);
  doc.save(fileName);
}
