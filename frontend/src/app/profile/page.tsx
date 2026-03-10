"use client";

import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import { useState, useEffect } from "react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function ProfilePage() {
    const { data: session, status, update } = useSession();
    const [leetcodeUsername, setLeetcodeUsername] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (session?.user) {
            setLeetcodeUsername((session.user as any).leetcodeUsername || "");
        }
    }, [session]);

    const handleSaveLeetCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) return;

        setIsSaving(true);
        setMessage(null);

        try {
            const res = await fetch(`${backendUrl}/auth/profile`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${(session as any).backendToken}`,
                },
                body: JSON.stringify({ leetcodeUsername }),
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setMessage({ type: "success", text: "Profile updated successfully!" });
                // Update local session
                await update({
                    ...session,
                    user: {
                        ...session.user,
                        leetcodeUsername: updatedUser.leetcodeUsername,
                    }
                });
            } else {
                const err = await res.json();
                setMessage({ type: "error", text: err.message || "Failed to update profile" });
            }
        } catch (err) {
            console.error("Update error", err);
            setMessage({ type: "error", text: "Network error. Please try again." });
        } finally {
            setIsSaving(false);
        }
    };

    if (status === "loading") {
        return (
            <>
                <Navbar />
                <main className="min-h-[calc(100vh-3rem)] flex items-center justify-center bg-white dark:bg-zinc-950">
                    <p className="text-gray-600 dark:text-zinc-400">Loading...</p>
                </main>
            </>
        );
    }

    if (!session) {
        return (
            <>
                <Navbar />
                <main className="min-h-[calc(100vh-3rem)] flex items-center justify-center bg-white dark:bg-zinc-950">
                    <p className="text-gray-600 dark:text-zinc-400">
                        You must be logged in to view your profile.
                    </p>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="min-h-[calc(100vh-3rem)] px-4 py-8 max-w-2xl mx-auto space-y-8 transition-colors">
                <header className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-semibold text-gray-900 dark:text-zinc-50">Profile</h1>
                        {message && (
                            <div className={`text-sm px-3 py-1 rounded-md ${message.type === "success" ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"}`}>
                                {message.text}
                            </div>
                        )}
                    </div>
                    <p className="text-gray-600 dark:text-zinc-400">
                        Manage your account settings and view your profile information.
                    </p>
                </header>

                <section className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-full bg-green-500 flex items-center justify-center text-white text-3xl font-bold uppercase">
                                {session.user?.name?.[0] || session.user?.email?.[0] || "?"}
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-50">
                                    {session.user?.name || "User"}
                                </h2>
                                <p className="text-gray-500 dark:text-zinc-400">{session.user?.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 pt-6 border-t border-gray-100 dark:border-zinc-800">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Full Name</p>
                                <p className="text-gray-900 dark:text-zinc-100">{session.user?.name || "Not provided"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Email Address</p>
                                <p className="text-gray-900 dark:text-zinc-100">{session.user?.email}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-50">Integrations</h2>
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                        <form onSubmit={handleSaveLeetCode} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="font-medium text-gray-900 dark:text-zinc-100">LeetCode Profile</p>
                                    <p className="text-sm text-gray-500 dark:text-zinc-400">Connect your LeetCode account to see your stats and progress.</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={leetcodeUsername}
                                    onChange={(e) => setLeetcodeUsername(e.target.value)}
                                    placeholder="your_leetcode_username"
                                    className="flex-1 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-zinc-50"
                                />
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 transition-colors"
                                >
                                    {isSaving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-50">Security</h2>
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-zinc-100">Password</p>
                                <p className="text-sm text-gray-500 dark:text-zinc-400">Change your account password</p>
                            </div>
                            <button
                                disabled
                                className="rounded-lg border border-gray-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-gray-500 dark:text-zinc-400 cursor-not-allowed"
                            >
                                Change
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
