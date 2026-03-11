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
  codeSolution?: string;
}

interface ProblemMetadata {
  title: string;
  difficulty: string;
  tags: string[];
  source: string;
}

function LeetCodeHeatmap({ calendarData }: { calendarData: Record<string, number> }) {
  const weeks = 54; // Increased to 54 to ensure today is always fully visible
  const daysInWeek = 7;
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - ((weeks - 1) * 7));
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const getColor = (count: number) => {
    if (!count) return "fill-gray-100 dark:fill-zinc-800";
    if (count < 2) return "fill-green-200 dark:fill-green-900";
    if (count < 4) return "fill-green-400 dark:fill-green-700";
    if (count < 6) return "fill-green-600 dark:fill-green-500";
    return "fill-green-800 dark:fill-green-300";
  };

  const monthLabels = [];
  let prevMonth = -1;

  const rects = [];
  for (let w = 0; w < weeks; w++) {
    const weekRects = [];
    const weekStartDate = new Date(startDate);
    weekStartDate.setDate(startDate.getDate() + (w * 7));

    if (weekStartDate.getMonth() !== prevMonth) {
      monthLabels.push(
        <text
          key={`month-${w}`}
          x={w * 12 + 30}
          y={10}
          className="text-[9px] fill-gray-400 dark:fill-zinc-500 font-normal"
        >
          {weekStartDate.toLocaleString('default', { month: 'short' })}
        </text>
      );
      prevMonth = weekStartDate.getMonth();
    }

    for (let d = 0; d < daysInWeek; d++) {
      const currentDate = new Date(weekStartDate);
      currentDate.setDate(weekStartDate.getDate() + d);

      // Only show up to today
      if (currentDate > today) continue;

      const utcTimestamp = Math.floor(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) / 1000);
      const count = calendarData[String(utcTimestamp)] || calendarData[utcTimestamp] || 0;

      weekRects.push(
        <rect
          key={`${w}-${d}`}
          x={w * 12 + 30}
          y={d * 12 + 20}
          width={10}
          height={10}
          rx={2}
          className={`${getColor(count)} transition-all hover:stroke-gray-400 dark:hover:stroke-gray-600`}
        >
          <title>{currentDate.toDateString()}: {count} submissions</title>
        </rect>
      );
    }
    rects.push(<g key={w}>{weekRects}</g>);
  }

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
    (i === 1 || i === 3 || i === 5) && (
      <text
        key={`day-${i}`}
        x={0}
        y={i * 12 + 28}
        className="text-[9px] fill-gray-400 dark:fill-zinc-500 font-normal"
      >
        {day}
      </text>
    )
  ));

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="overflow-x-auto custom-scrollbar w-full flex justify-center">
        <svg width={weeks * 12 + 50} height={daysInWeek * 12 + 30} className="overflow-visible">
          {monthLabels}
          {dayLabels}
          {rects}
        </svg>
      </div>
    </div>
  );
}

function LeetCodeSolvedRing({ lcStats }: { lcStats: any }) {
  const stats = lcStats.matchedUser.submitStatsGlobal.acSubmissionNum;
  const allCounts = lcStats.allQuestionsCount;

  const getStat = (diff: string) => stats.find((s: any) => s.difficulty === diff)?.count || 0;
  const getAll = (diff: string) => allCounts.find((q: any) => q.difficulty === diff)?.count || 0;

  const easySolved = getStat("Easy");
  const mediumSolved = getStat("Medium");
  const hardSolved = getStat("Hard");
  const totalSolved = easySolved + mediumSolved + hardSolved;

  const easyTotal = getAll("Easy");
  const mediumTotal = getAll("Medium");
  const hardTotal = getAll("Hard");

  const radius = 60;
  const stroke = 8;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 py-3 px-6 w-full h-full">
      <div className="relative flex items-center justify-center shrink-0">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="text-gray-100 dark:text-zinc-800"
          />
          <circle
            stroke="#ffa116"
            fill="transparent"
            strokeWidth={stroke + 1}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset: circumference - (totalSolved / (easyTotal + mediumTotal + hardTotal || 1)) * circumference }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-gray-900 dark:text-zinc-50 leading-tight">{totalSolved}</span>
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Solved</span>
        </div>
      </div>

      <div className="flex-1 w-full space-y-1">
        {[
          { label: "Easy", solved: easySolved, total: easyTotal, color: "text-[#00b8a3]", bg: "bg-[#00b8a3]" },
          { label: "Medium", solved: mediumSolved, total: mediumTotal, color: "text-[#ffc01e]", bg: "bg-[#ffc01e]" },
          { label: "Hard", solved: hardSolved, total: hardTotal, color: "text-[#ef4743]", bg: "bg-[#ef4743]" },
        ].map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-medium">{item.label}</span>
              <div className="flex items-baseline gap-1">
                <span className="font-semibold text-gray-900 dark:text-zinc-50 sm:text-sm">{item.solved}</span>
                <span className="text-gray-500 font-normal text-[10px]">/{item.total}</span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.bg} rounded-full transition-all duration-1000`}
                style={{ width: `${(item.solved / (item.total || 1)) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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
  const [codeText, setCodeText] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [lcStats, setLcStats] = useState<any>(null);
  const [lcCalendar, setLcCalendar] = useState<any>(null);
  const [loadingLc, setLoadingLc] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
    if (status === "authenticated" && session?.user) {
      loadProblems();
      const lcUsername = (session.user as any)?.leetcodeUsername;
      if (lcUsername) {
        fetchLeetCodeData(lcUsername);
      }
    }
  }, [status, (session?.user as any)?.id, (session?.user as any)?.leetcodeUsername]);

  const fetchLeetCodeData = async (username: string) => {
    setLoadingLc(true);
    try {
      const statsRes = await fetch(`${backendUrl}/leetcode/stats/${username}`, {
        headers: { Authorization: `Bearer ${(session as any).backendToken}` },
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setLcStats(statsData);
      }

      const calRes = await fetch(`${backendUrl}/leetcode/calendar/${username}`, {
        headers: { Authorization: `Bearer ${(session as any).backendToken}` },
      });
      if (calRes.ok) {
        const calData = await calRes.json();
        setLcCalendar(calData);
      }
    } catch (err) {
      console.error("Failed to fetch LeetCode data", err);
    } finally {
      setLoadingLc(false);
    }
  };

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
    setCodeText(problem.codeSolution || "");
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
        body: JSON.stringify({ notes: notesText, codeSolution: codeText }),
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
      <main className="min-h-[calc(100vh-3rem)] px-4 py-6 max-w-6xl mx-auto space-y-0.5 transition-colors">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-zinc-50 leading-tight">Dashboard</h1>
              <p className="text-gray-500 dark:text-zinc-400 text-sm">
                Welcome back, {session.user?.name || (session.user as any)?.email?.split('@')[0]}
              </p>
            </div>
            <div className="h-10 w-[1px] bg-gray-200 dark:bg-zinc-800 hidden sm:block" />
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Local Problems</span>
              <span className="text-xl font-bold text-gray-900 dark:text-zinc-50">{problems.length}</span>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <span className="text-lg">+</span>
            Add Problem
          </button>
        </header>
        {/* Unified LeetCode Section */}
        <div className="animate-fade-in group">
          <div className="flex items-center justify-between mb-1 py-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <img src="https://leetcode.com/static/images/LeetCode_logo_rvs.png" alt="LeetCode" className="h-4 w-4 grayscale dark:invert opacity-70" />
              LeetCode Live
            </h2>
            {lcCalendar && (
              <div className="flex gap-4 text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                <span>Streak <span className="text-green-500">{lcCalendar.streak}</span></span>
                <span>Active <span className="text-green-500">{lcCalendar.totalActiveDays}</span></span>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-zinc-800 flex flex-col lg:flex-row">
            {/* Left: Stats Ring */}
            <div className="w-full lg:w-[340px] shrink-0 flex items-center bg-gray-50/30 dark:bg-zinc-900/10">
              {loadingLc ? (
                <div className="w-full h-[220px] animate-pulse flex flex-col items-center justify-center p-6 gap-4">
                  <div className="w-24 h-24 rounded-full border-4 border-gray-100 dark:border-zinc-800" />
                  <div className="w-20 h-4 bg-gray-100 dark:border-zinc-800 rounded" />
                </div>
              ) : lcStats ? (
                <LeetCodeSolvedRing lcStats={lcStats} />
              ) : (
                <div className="p-6 text-center w-full">
                  <p className="text-xs text-gray-400 italic">No LeetCode linked</p>
                </div>
              )}
            </div>

            {/* Right: Heatmap */}
            <div className="flex-1 py-3 px-6 flex flex-col justify-center min-h-[120px]">
              {loadingLc ? (
                <div className="w-full h-32 bg-gray-50/50 dark:bg-zinc-800/30 rounded-lg animate-pulse" />
              ) : lcCalendar ? (
                <div className="overflow-x-auto pb-2 custom-scrollbar">
                  <LeetCodeHeatmap calendarData={lcCalendar.submissionCalendar} />
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-xs text-gray-500">Enable LeetCode in profile to see activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <section className="space-y-4 mt-4 mb-1">
          <div className="flex flex-col mt-1 mb-2 sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-lg font-medium text-gray-900 dark:text-zinc-50">Recent problems</h2>
            <div className="relative w-full sm:w-58">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search problems..."
                className="block w-full pl-10 pr-3 py-1 border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-zinc-50 transition-all"
              />
            </div>
          </div>
          <div className="rounded-xl mt-1 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
            {loading ? (
              <p className="p-4 text-sm text-gray-600">Loading problems...</p>
            ) : problems.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
              <p className="p-4 text-sm text-gray-600">
                {searchTerm ? `No problems found matching "${searchTerm}"` : "No problems yet. Click the \"+ Add Problem\" button to get started."}
              </p>
            ) : (
              problems
                .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .slice(0, searchTerm ? undefined : 10)
                .map((p) => (
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
                        {p.difficulty}
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
                      {((p.notes && p.notes.trim().length > 0) || (p.codeSolution && p.codeSolution.trim().length > 0)) && (
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 sm:p-6">
            <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-7xl h-[85vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-black uppercase tracking-tighter text-gray-900 dark:text-zinc-50">Problem Workspace</h2>
                </div>
                <button
                  onClick={() => setNotesModal(null)}
                  className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content - Split View */}
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-zinc-200 dark:divide-zinc-800">
                {/* Left: Notes Section */}
                <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-zinc-900">
                  <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Analysis & Notes</span>
                  </div>
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Enter your analysis here..."
                    className="flex-1 w-full border-none bg-transparent p-4 text-sm focus:ring-0 text-gray-900 dark:text-zinc-200 resize-none placeholder-zinc-400 dark:placeholder-zinc-600 leading-relaxed overflow-y-auto custom-scrollbar"
                  />
                </div>

                {/* Right: Code Section */}
                <div className="flex-[2.2] flex flex-col min-h-0 bg-black">
                  <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Solution Link / Code</span>
                  </div>
                  <textarea
                    value={codeText}
                    onChange={(e) => setCodeText(e.target.value)}
                    placeholder="// Implementation details..."
                    className="flex-1 w-full bg-transparent p-6 text-xs sm:text-sm font-mono focus:ring-0 border-none text-emerald-500 dark:text-emerald-400 resize-none placeholder-zinc-700 overflow-y-auto custom-scrollbar leading-relaxed"
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-end gap-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setNotesModal(null)}
                    className="px-6 py-2 text-xs font-bold uppercase tracking-widest hover:text-red-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="bg-green-600 px-10 py-2.5 rounded-lg text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed active:bg-green-700 transition-all shadow-lg shadow-green-900/20"
                  >
                    {savingNotes ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
