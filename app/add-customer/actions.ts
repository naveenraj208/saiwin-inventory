/* app/add-customer/actions.ts */
"use server";

import { cookies } from "next/headers";
import {supabase} from "../lib/supabase";          // adjust the alias if needed

const COOKIE = "auth-demo";

export async function addSale(payload: {
  product_id: string;
  name: string;
  customer_name: string;
  mob: string;
  location: string;
  description: string;
  color: string;
  quantity: number;
  type: "bought" | "sold";
  created_by?: string;         // optional if you pass it from client
}) {
  /* ——— 1. Determine username ——— */
  const cookieUser = (await cookies()).get(COOKIE)?.value;
  const username = payload.created_by ?? cookieUser;

  if (!username) {
    throw new Error("Not authenticated (no username cookie)");
  }

  /* ——— 2. Insert sale row ——— */
  const { error: insertErr } = await supabase.from("sales").insert({
    ...payload,
    created_by: username,
  });
  if (insertErr) {
    throw new Error(`Insert failed: ${insertErr.message}`);
  }

  /* ——— 3. Update product stock ——— */
  const { error: updErr } = await supabase
    .from("products")
    .update({ total_in_store: payload.quantity })
    .eq("id", payload.product_id);

  if (updErr) {
    throw new Error(`Stock update failed: ${updErr.message}`);
  }
}
