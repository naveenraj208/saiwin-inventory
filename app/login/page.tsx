"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateLogin } from "./actions";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      // 🔑 call server action – returns the username on success
      const uname = await validateLogin(username, password);

      // store for later so Add‑Customer can send created_by
      localStorage.setItem("username", uname);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-600 via-gray-800 to-gray-900 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-sm space-y-6 rounded-2xl bg-white/80 p-8 shadow-2xl backdrop-blur-sm dark:bg-gray-900/70 dark:text-gray-100"
      >
        <h1 className="text-center text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
          Welcome Back
        </h1>

        {error && (
          <p className="rounded-md border border-red-400 bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="space-y-1">
          <label htmlFor="username" className="block text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            className={inputCls}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              className={`${inputCls} pr-10`}
              type={showPwd ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              aria-label={showPwd ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-3 flex items-center focus:outline-none"
              onClick={() => setShowPwd((p) => !p)}
            >
              {showPwd ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-2 font-semibold text-white shadow-md transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:from-blue-500 dark:to-indigo-500 dark:hover:brightness-125"
        >
          Enter
        </button>
      </form>
    </div>
  );
}

/* Tailwind shortcut */
const inputCls =
  "w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500";
