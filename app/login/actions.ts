/* app/login/actions.ts */
"use server";

import { cookies } from "next/headers";
import {supabase} from "../lib/supabase";

const COOKIE = "auth-demo";

/**
 * Validate username + password.
 * On success: sets a cookie and returns the username so the client
 * can keep a readable copy (localStorage) for "created_by".
 */
export async function validateLogin(username: string, password: string) {
  // look up the user in the custom "login" table
  const { data, error } = await supabase
    .from("login")
    .select("password")
    .eq("username", username)
    .single();

  if (error || !data || data.password !== password) {
    throw new Error("Wrong username or password");
  }

  // store the auth cookie (http‑only so client JS can't change it)
  (await cookies()).set(COOKIE, username, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",          // send cookie to every route
    maxAge: 60 * 60 * 24 * 7, // one week
  });

  // return the username so the client can cache it locally
  return username;
}

/**
 * Simple logout helper — clears the cookie
 */
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}
