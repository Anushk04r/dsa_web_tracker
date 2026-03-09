"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 transition-colors">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg p-6">
        <h1 className="text-2xl font-semibold text-center text-gray-900 dark:text-zinc-50">Log in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 text-left">
            <label className="text-sm text-gray-700 dark:text-zinc-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 px-3 py-2 text-sm outline-none focus:border-green-500 text-gray-900 dark:text-zinc-50"
              required
            />
          </div>
          <div className="space-y-1 text-left">
            <label className="text-sm text-gray-700 dark:text-zinc-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 px-3 py-2 text-sm outline-none focus:border-green-500 text-gray-900 dark:text-zinc-50"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-green-500 text-white font-medium py-2 hover:bg-green-600 disabled:opacity-60 transition-colors"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>
    </main>
  );
}


