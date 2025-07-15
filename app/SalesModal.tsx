// components/SalesModal.tsx
import { Sale } from "./types/product";
import Modal from "../Modal";
import SalesTable from "./SalesTable";


export default function SalesModal({
  open,
  onClose,
  sales,
}: {
  open: boolean;
  onClose: () => void;
  sales: Sale[];
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Sales Details</h2>
        <button
          onClick={onClose}
          className="text-xl px-3 py-1 rounded hover:bg-gray-200"
        >
          ✕
        </button>
      </header>
      <SalesTable sales={sales} />
    </Modal>
  );
}
