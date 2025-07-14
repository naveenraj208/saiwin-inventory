// components/ProductCard.tsx
import { Product } from "./types/product";


export default function ProductCard({
  product,
  onViewSales,
  onDelete,
}: {
  product: Product;
  /** Called with the product ID when user clicks “View Sales” */
  onViewSales: (productId: string) => void;
  /** Called after user confirms deletion */
  onDelete: () => void;
}) {
  return (
    <div
      className="
        bg-white text-gray-900 border border-gray-300 rounded-xl
        w-80 lg:w-96 p-6 pr-8
        shadow-sm hover:shadow-lg hover:-translate-y-1 transition
        flex flex-col
      "
    >
      {/* Name */}
      <h3 className="text-2xl font-semibold truncate">{product.name}</h3>

      {/* Description */}
      <p className="mt-2 text-sm text-gray-700 line-clamp-4">
        {product.description}
      </p>

      {/* Stock */}
      <p className="mt-4 font-medium">
        Total in Store:{" "}
        <span className="text-blue-600 font-bold">
          {product.total_in_store}
        </span>
      </p>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => onViewSales(product.id)}
          className="
            flex-1 bg-gradient-to-r from-gray-600 to-gray-900 text-white py-2 rounded-lg
            transition hover:bg-gradient-to-r hover:from-pink-500 hover:to-blue-500
          "
        >
          View Sales
        </button>

        <button
          onClick={() => confirm('Remove this product?') && onDelete()}
          className="
            flex-1 bg-red-500 text-white py-2 rounded-lg
            hover:bg-red-600 transition
          "
        >
          Delete
        </button>
      </div>
    </div>
  );
}
