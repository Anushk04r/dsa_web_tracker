"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

interface ProblemSummary {
  _id: string;
  title: string;
  difficulty: string;
  status: string;
  source?: string;
  link?: string;
  notes?: string;
}

interface ProblemMetadata {
  title: string;
  difficulty: string;
  tags: string[];
  source: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [problemUrl, setProblemUrl] = useState("");
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [problemForm, setProblemForm] = useState({
    title: "",
    link: "",
    source: "other" as "leetcode" | "gfg" | "codeforces" | "other",
    difficulty: "unknown" as "easy" | "medium" | "hard" | "unknown",
    tags: [] as string[],
    status: "unsolved" as "unsolved" | "attempted" | "solved" | "review",
  });
  const [submitting, setSubmitting] = useState(false);
  const [notesModal, setNotesModal] = useState<{ problemId: string; notes: string } | null>(null);
  const [notesText, setNotesText] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const loadProblems = async () => {
    if (!session) return;
    try {
      const res = await fetch(`${backendUrl}/problems`, {
        headers: {
          Authorization: `Bearer ${(session as any).backendToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProblems(data);
      }
    } catch (err) {
      console.error("Failed to load problems", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      loadProblems();
    }
  }, [session, status]);

  const handleFetchMetadata = async () => {
    if (!problemUrl.trim()) {
      alert("Please enter a problem URL");
      return;
    }
    setFetchingMetadata(true);
    try {
      const res = await fetch(`${backendUrl}/problems/fetch-metadata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any).backendToken}`,
        },
        body: JSON.stringify({ url: problemUrl }),
      });

      const data = await res.json();

      if (res.ok) {
        const metadata: ProblemMetadata = data;
        setProblemForm({
          ...problemForm,
          title: metadata.title,
          link: problemUrl,
          source: metadata.source as any,
          difficulty: metadata.difficulty as any,
          tags: metadata.tags,
        });
        alert(`Successfully fetched: ${metadata.title}`);
      } else {
        alert(data.message || "Failed to fetch problem details. Please fill manually.");
      }
    } catch (err: any) {
      console.error("Failed to fetch metadata", err);
      alert("Network error. Please check your connection and try again, or fill manually.");
    } finally {
      setFetchingMetadata(false);
    }
  };

  const handleSubmitProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemForm.title.trim()) {
      alert("Please enter a problem title");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${backendUrl}/problems`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any).backendToken}`,
        },
        body: JSON.stringify({
          ...problemForm,
          status: "unsolved", // Default status
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setProblemUrl("");
        setProblemForm({
          title: "",
          link: "",
          source: "other",
          difficulty: "unknown",
          tags: [],
          status: "unsolved",
        });
        await loadProblems();
      } else {
        const error = await res.json();
        alert(error.message || "Failed to add problem");
      }
    } catch (err) {
      console.error("Failed to add problem", err);
      alert("Failed to add problem");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenNotes = (problem: ProblemSummary) => {
    setNotesModal({ problemId: problem._id, notes: problem.notes || "" });
    setNotesText(problem.notes || "");
  };

  const handleSaveNotes = async () => {
    if (!notesModal) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`${backendUrl}/problems/${notesModal.problemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any).backendToken}`,
        },
        body: JSON.stringify({ notes: notesText }),
      });
      if (res.ok) {
        setNotesModal(null);
        await loadProblems();
      } else {
        alert("Failed to save notes");
      }
    } catch (err) {
      console.error("Failed to save notes", err);
      alert("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleProblemClick = (problem: ProblemSummary) => {
    if (problem.link) {
      window.open(problem.link, "_blank");
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
            You must be logged in to see the dashboard.
          </p>
        </main>
      </>
    );
  }

  const solvedCount = problems.filter((p) => p.status === "solved").length;

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-3rem)] px-4 py-6 max-w-5xl mx-auto space-y-6 transition-colors">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-zinc-50">Dashboard</h1>
            <p className="text-gray-600 dark:text-zinc-400 text-sm">
              Welcome back, {session.user?.name || session.user?.email}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors"
          >
            <span className="text-lg">+</span>
            Add Problem
          </button>
        </header>
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 p-4">
            <p className="text-xs text-gray-600 dark:text-zinc-400">Total problems</p>
            <p className="text-2xl font-semibold mt-1 text-gray-900 dark:text-zinc-50">{problems.length}</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 p-4">
            <p className="text-xs text-gray-600 dark:text-zinc-400">Solved</p>
            <p className="text-2xl font-semibold mt-1 text-green-600 dark:text-green-500">{solvedCount}</p>
          </div>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-medium text-gray-900 dark:text-zinc-50">Recent problems</h2>
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
            {loading ? (
              <p className="p-4 text-sm text-gray-600">Loading problems...</p>
            ) : problems.length === 0 ? (
              <p className="p-4 text-sm text-gray-600">
                No problems yet. Click the "+ Add Problem" button to get started.
              </p>
            ) : (
              problems.slice(0, 10).map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleProblemClick(p)}
                  >
                    <p className="font-medium text-gray-900 dark:text-zinc-100">{p.title}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 capitalize">
                      {p.difficulty} • {p.status}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenNotes(p);
                    }}
                    className="relative ml-4 px-3 py-1.5 rounded-md text-xs font-medium bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                  >
                    Notes
                    {p.notes && p.notes.trim().length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-sm border border-white dark:border-zinc-900"></span>
                      </span>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-50">Add New Problem</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitProblem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-zinc-300">
                    Problem URL (LeetCode/GeeksforGeeks)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={problemUrl}
                      onChange={(e) => setProblemUrl(e.target.value)}
                      placeholder="https://leetcode.com/problems/..."
                      className="flex-1 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-zinc-50"
                    />
                    <button
                      type="button"
                      onClick={handleFetchMetadata}
                      disabled={fetchingMetadata || !problemUrl.trim()}
                      className="rounded-lg bg-gray-100 dark:bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-zinc-300"
                    >
                      {fetchingMetadata ? "Fetching..." : "Auto-fill"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-zinc-300">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={problemForm.title}
                    onChange={(e) =>
                      setProblemForm({ ...problemForm, title: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-zinc-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-zinc-300">
                    Difficulty
                  </label>
                  <select
                    value={problemForm.difficulty}
                    onChange={(e) =>
                      setProblemForm({
                        ...problemForm,
                        difficulty: e.target.value as any,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-zinc-50"
                  >
                    <option value="unknown">Unknown</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-lg border border-gray-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Adding..." : "Add Problem"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {notesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-2xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-50">Problem Notes</h2>
                <button
                  onClick={() => setNotesModal(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
                >
                  ×
                </button>
              </div>
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                rows={8}
                placeholder="Add your notes about this problem..."
                className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-zinc-50"
              />
              <div className="flex gap-3 justify-end mt-4">
                <button
                  onClick={() => setNotesModal(null)}
                  className="rounded-lg border border-gray-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingNotes ? "Saving..." : "Save Notes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
