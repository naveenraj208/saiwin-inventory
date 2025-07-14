// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Home, PlusCircle, Edit2, UserPlus } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "View Products", icon: Home },
    { href: "/add-product", label: "Add Product", icon: PlusCircle },
    { href: "/edit-product", label: "Edit Product", icon: Edit2 },
    { href: "/add-customer", label: "Add Customer", icon: UserPlus },
  ];

  return (
    <aside className="h-screen w-64 shrink-0 relative">
      {/* ─ Grey gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-600" />

      {/* ─ Frosted glass overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/20" />

      {/* ─ Content Layer */}
      <div className="relative z-10 flex flex-col text-white h-full">
        {/* Logo / Title */}
        <div className="px-8 py-6 border-b border-white/10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-black text-3xl tracking-wide">Inventory</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                pathname === href
                  ? "bg-white/15 shadow-inner"
                  : "hover:bg-white/10"
              )}
            >
              <Icon size={18} className="shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer circle */}
        <div className="p-4 border-t border-white/10">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
            N
          </div>
        </div>
      </div>
    </aside>
  );
}
