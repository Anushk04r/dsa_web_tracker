"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded-md bg-gray-100 dark:bg-slate-800 animate-pulse" />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}

function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`text-sm px-3 py-1.5 rounded-md transition-colors ${active
        ? "bg-green-500 text-white"
        : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
        }`}
    >
      {label}
    </Link>
  );
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur shadow-sm transition-colors">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 gap-4">
        <div className="flex items-center gap-2">
          {pathname !== "/dashboard" && pathname !== "/" && (
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md border border-gray-300 dark:border-zinc-700 px-2 py-1 text-xs text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              ← Back
            </button>
          )}
          <span className="text-sm font-semibold text-gray-900 dark:text-zinc-50">
            DSA Tracker
          </span>
        </div>
        <nav className="flex items-center gap-2">
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/chat" label="AI Mentor" />
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-md bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}


