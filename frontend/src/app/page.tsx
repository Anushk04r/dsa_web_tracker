import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 transition-colors">
      <div className="max-w-xl w-full space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">
          DSA Tracker with AI Mentor
        </h1>
        <p className="text-gray-600 dark:text-zinc-400">
          Track your Data Structures & Algorithms practice, visualize progress,
          and ask an AI mentor for beginner-friendly explanations and debugging
          help.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/auth/login"
            className="px-4 py-2 rounded-md bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/auth/register"
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
