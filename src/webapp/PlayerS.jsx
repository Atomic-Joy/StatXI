import { useEffect, useMemo, useState, useRef } from "react";
import { Search, MapPin, Activity, ChevronLeft, ChevronRight, ArrowLeft, Zap } from "lucide-react";
import { motion } from "framer-motion";
import PlayerProfile from "./PlayerProfile";

const CSV_URL = new URL("../Data/EAFC26.csv", import.meta.url).href;
const RESULTS_PER_PAGE = 21;
const POSITION_FULL_FORM = {
  GK: "Goalkeeper", RB: "Right Back", RWB: "Right Wing Back", LB: "Left Back",
  LWB: "Left Wing Back", CB: "Center Back", RCB: "Right Center Back", LCB: "Left Center Back",
  CDM: "Defensive Midfielder", RDM: "Right Def. Mid", LDM: "Left Def. Mid",
  CM: "Central Mid", RCM: "Right Central Mid", LCM: "Left Central Mid",
  CAM: "Attacking Mid", RAM: "Right Att. Mid", LAM: "Left Att. Mid",
  RM: "Right Mid", LM: "Left Mid", RW: "Right Winger", LW: "Left Winger",
  RF: "Right Forward", LF: "Left Forward", CF: "Center Forward",
  ST: "Striker", RS: "Right Striker", LS: "Left Striker",
};

function normalizeText(value) {
  return (value || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function formatPositions(positionValue) {
  return (positionValue || "").split(",").map(p => p.trim()).filter(Boolean)
    .map(p => POSITION_FULL_FORM[p] || p).join(", ");
}

function parseCSVLine(line) {
  const values = []; let current = ""; let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]; const nextChar = line[i + 1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') { current += '"'; i += 1; }
      else { inQuotes = !inQuotes; }
      continue;
    }
    if (char === "," && !inQuotes) { values.push(current); current = ""; continue; }
    current += char;
  }
  values.push(current); return values;
}

function parsePlayersCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  const idx = (col) => headers.indexOf(col);
  return lines.slice(1).map((line, i) => {
    const c = parseCSVLine(line);
    return {
      id: c[idx("ID")] || String(i + 1),
      name: c[idx("Name")] || "Unknown",
      longName: c[idx("Name")] || "",
      nationality: c[idx("Nation")] || "N/A",
      position: formatPositions(c[idx("Position")]) || "N/A",
      overall: Number(c[idx("OVR")]) || 0,
      team: c[idx("Team")] || "N/A",
      age: c[idx("Age")] || "N/A",
      height: c[idx("Height")] ? c[idx("Height")].replace(/""/g, '"') : "N/A",
      weight: c[idx("Weight")] || "N/A",
      photo: c[idx("card")] || null,
    };
  });
}

import HomeSection from "./HomeSection";
import Clubs from "./Clubs";

// ── OVR colour tier ────────────────────────────────────────────────────────────
function ovrStyle(ovr) {
  if (ovr >= 88) return { ring: "ring-amber-400/60", badge: "from-amber-400 to-orange-400", text: "text-amber-400" };
  if (ovr >= 80) return { ring: "ring-cyan-500/50", badge: "from-cyan-400 to-blue-500", text: "text-cyan-400" };
  if (ovr >= 70) return { ring: "ring-slate-400/40", badge: "from-slate-400 to-slate-500", text: "text-slate-400" };
  return { ring: "ring-zinc-600/30", badge: "from-zinc-600 to-zinc-700", text: "text-zinc-500" };
}

// ── Player Card ────────────────────────────────────────────────────────────────
function PlayerCard({ player, onClick, index }) {
  const tier = ovrStyle(player.overall);
  const positions = player.position.split(",").map(p => p.trim()).filter(Boolean);

  return (
    <article
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] cursor-pointer backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-white/[0.12] hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-black/60"
      style={{ animationDelay: `${(index % RESULTS_PER_PAGE) * 40}ms` }}
    >
      {/* Top bar — OVR + name */}
      <div className="relative px-5 pt-5 pb-4">
        {/* Watermark OVR */}
        <div className={`absolute right-4 top-2 select-none font-bold leading-none tracking-tighter text-transparent bg-gradient-to-b ${tier.badge} bg-clip-text opacity-[0.07] text-[96px] pointer-events-none`}>
          {player.overall}
        </div>

        {/* Name + OVR inline */}
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-base font-bold text-white leading-tight truncate group-hover:text-cyan-50 transition-colors">
              {player.name}
            </h3>
            <span className={`shrink-0 text-sm font-black tabular-nums ${tier.text}`}>{player.overall}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{player.team}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px mx-5 bg-white/[0.06] group-hover:bg-white/[0.1] transition-colors" />

      {/* Bottom metadata */}
      <div className="px-5 py-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-lime-500 shrink-0" />
          <span className="text-xs text-slate-400 truncate">{player.nationality}</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {positions.slice(0, 3).map((pos, i) => (
            <span key={i} className="inline-flex items-center rounded-md bg-white/[0.05] border border-white/[0.07] px-2 py-0.5 text-[10px] font-medium text-slate-400">
              {pos}
            </span>
          ))}
          {positions.length > 3 && (
            <span className="inline-flex items-center rounded-md bg-white/[0.05] border border-white/[0.07] px-2 py-0.5 text-[10px] font-medium text-slate-500">
              +{positions.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Hover accent bottom line */}
      <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r ${tier.badge} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    </article>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="h-11 w-11 rounded-xl bg-white/[0.06]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded-md bg-white/[0.06] w-3/4" />
          <div className="h-3 rounded-md bg-white/[0.04] w-1/2" />
        </div>
      </div>
      <div className="h-px bg-white/[0.04] mb-4" />
      <div className="space-y-2">
        <div className="h-3 rounded bg-white/[0.04] w-2/5" />
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded bg-white/[0.04]" />
          <div className="h-5 w-14 rounded bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
function PlayerS() {
  const [query, setQuery] = useState("");
  const [allPlayers, setAllPlayers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingDataset, setLoadingDataset] = useState(true);
  const [datasetError, setDatasetError] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef(null);
  const isSearching = query.trim().length > 0 || isFocused;

  useEffect(() => {
    if (isSearching && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearching]);

  // Global Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setQuery("");
        setIsFocused(false);
        setSelectedPlayer(null);
        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadCSV() {
      try {
        setLoadingDataset(true); setDatasetError("");
        const res = await fetch(CSV_URL);
        if (!res.ok) throw new Error(`CSV load failed (${res.status})`);
        const text = await res.text();
        if (isMounted) setAllPlayers(parsePlayersCSV(text));
      } catch (err) {
        if (isMounted) setDatasetError(err.message || "Failed to load dataset.");
      } finally {
        if (isMounted) setLoadingDataset(false);
      }
    }
    loadCSV();
    return () => { isMounted = false; };
  }, []);

  const searchResults = useMemo(() => {
    const nq = normalizeText(query);
    if (nq.length < 3) return [];
    const tokens = nq.split(" ").filter(Boolean);
    return allPlayers
      .filter(p => { const n = normalizeText(`${p.name} ${p.longName}`); return tokens.every(t => n.includes(t)); })
      .sort((a, b) => b.overall - a.overall);
  }, [query, allPlayers]);

  const totalPages = Math.max(1, Math.ceil(searchResults.length / RESULTS_PER_PAGE));

  const paginatedResults = useMemo(() => {
    const s = (currentPage - 1) * RESULTS_PER_PAGE;
    return searchResults.slice(s, s + RESULTS_PER_PAGE);
  }, [searchResults, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [query]);
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);

  const hasQuery = query.trim().length >= 3;
  const hasResults = searchResults.length > 0;

  return (
    <div className="relative min-h-screen bg-dark-900 font-body text-slate-300 overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">

      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[30%] -left-[15%] h-[700px] w-[700px] rounded-full bg-cyan-600/8 blur-[140px]" />
        <div className="absolute top-[50%] -right-[15%] h-[600px] w-[600px] rounded-full bg-lime-600/6 blur-[140px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-cyan-900/10 blur-[120px]" />
      </div>

      {/* ── Sticky top bar ── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-dark-900/80 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex h-14 items-center justify-between gap-4">

            {/* Logo / home link */}
            <a href="/" className="flex items-center gap-2 shrink-0 group">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-lime-500 shadow shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-black">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 3.5 2.5 2.5L12 10.5 9.5 8zm-6 6.5 2.5-2.5 2.5 2.5-2.5 2.5zm6 6.5-2.5-2.5 2.5-2.5 2.5 2.5zm6-6.5-2.5 2.5-2.5-2.5 2.5-2.5z" />
                </svg>
              </div>
              <span className="font-display text-base font-bold text-white tracking-tight hidden sm:block">
                Stat<span className="bg-gradient-to-r from-cyan-400 to-lime-400 bg-clip-text text-transparent">XI</span>
              </span>
            </a>

            {/* Inline search — conditionally visible */}
            <div className="flex-1 max-w-xl">
              {isSearching && (
                <motion.div layoutId="search-bar" className="w-full">
                  <div className="group relative flex items-center rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 transition-all focus-within:border-cyan-500/40 focus-within:ring-2 focus-within:ring-cyan-500/10 focus-within:bg-white/[0.06]">
                    <Search className="mr-3 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors shrink-0" />
                    <input
                      ref={searchInputRef}
                      id="search"
                      type="text"
                      value={query}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onChange={e => { setQuery(e.target.value); setCurrentPage(1); }}
                      placeholder="Search players…"
                      className="w-full bg-transparent text-sm font-medium text-white placeholder:text-slate-600 outline-none"
                    />
                    {query && (
                      <button
                        onClick={() => { setQuery(""); setIsFocused(false); }}
                        className="ml-2 h-5 w-5 rounded-full bg-white/[0.08] text-slate-500 hover:text-white hover:bg-white/[0.12] flex items-center justify-center text-xs transition-all shrink-0"
                      >✕</button>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <a href="/clubs" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Clubs</a>
              <div className="h-4 w-px bg-white/[0.1] hidden sm:block" />

              {/* Right pill: dataset indicator */}
              <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-pulse" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">EA FC 26</span>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="relative mx-auto max-w-7xl px-4 sm:px-8 py-10">

        {selectedPlayer ? (
          <PlayerProfile player={selectedPlayer} onBack={() => setSelectedPlayer(null)} />
        ) : (
          <>
            {/* ── Hero — shown only when no query ── */}
            {!hasQuery && (
              <div className="mb-16 pt-12 text-center">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/[0.07] px-4 py-1.5">
                  <Zap className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Player Database</span>
                </div>
                <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.06] mb-5">
                  Discover the{' '}
                  <span className="bg-gradient-to-r from-cyan-400 to-lime-400 bg-clip-text text-transparent">Elite.</span>
                </h1>
                <p className="text-slate-500 text-base max-w-lg mx-auto leading-relaxed mb-8">
                  Search through 17,000+ players from the EA FC 26 dataset. Type a name below to explore.
                </p>

                {/* Search bar below paragraph */}
                <div className="mx-auto w-full max-w-2xl h-[60px]">
                  {!isSearching && (
                    <motion.div layoutId="search-bar" className="w-full">
                      <div className="group relative flex items-center rounded-full border border-white/[0.08] bg-white/[0.04] px-6 py-4 shadow-2xl backdrop-blur-xl transition-all focus-within:border-cyan-500/40 focus-within:ring-2 focus-within:ring-cyan-500/10 focus-within:bg-white/[0.06]">
                        <Search className="mr-4 h-6 w-6 text-slate-500 group-focus-within:text-cyan-400 transition-colors shrink-0" />
                        <input
                          type="text"
                          value={query}
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setIsFocused(false)}
                          onChange={e => { setQuery(e.target.value); setCurrentPage(1); }}
                          placeholder="Search players…"
                          className="w-full bg-transparent text-lg font-medium text-white placeholder:text-slate-600 outline-none"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Hint chips */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  {["Kane", "Bellingham", "Haaland", "Musiala", "Salah"].map(name => (
                    <button
                      key={name}
                      onClick={() => setQuery(name)}
                      className="rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.07] hover:border-white/[0.12] transition-all"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Typing hint ── */}
            {query.trim() && query.trim().length < 3 && (
              <p className="text-center text-slate-500 py-12 text-sm">Keep typing…</p>
            )}

            {/* ── Loading state ── */}
            {loadingDataset && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} />)}
              </div>
            )}

            {/* ── Error ── */}
            {!loadingDataset && datasetError && (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 text-xl">!</div>
                <p className="text-red-400 text-sm">{datasetError}</p>
              </div>
            )}

            {/* ── No results ── */}
            {!loadingDataset && !datasetError && hasQuery && !hasResults && (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                <div className="h-14 w-14 rounded-2xl border border-white/[0.06] bg-white/[0.03] flex items-center justify-center">
                  <Search className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">No players found</p>
                  <p className="text-slate-500 text-sm">Try a different name or spelling.</p>
                </div>
              </div>
            )}

            {/* ── Results ── */}
            {!loadingDataset && hasResults && (
              <>
                {/* Results meta bar */}
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-600">Results</span>
                    <span className="rounded-md bg-white/[0.05] border border-white/[0.07] px-2 py-0.5 text-xs font-bold text-white">{searchResults.length}</span>
                  </div>
                  <span className="text-xs text-slate-600">Sorted by OVR ↓</span>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedResults.map((player, index) => (
                    <PlayerCard key={player.id} player={player} index={index} onClick={() => setSelectedPlayer(player)} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-sm">
                    <p className="text-xs text-slate-500">
                      Showing{' '}
                      <span className="text-white font-semibold">{(currentPage - 1) * RESULTS_PER_PAGE + 1}</span>
                      {' '}–{' '}
                      <span className="text-white font-semibold">{Math.min(currentPage * RESULTS_PER_PAGE, searchResults.length)}</span>
                      {' '}of{' '}
                      <span className="text-white font-semibold">{searchResults.length}</span> athletes
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-white transition-all hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      {/* Page numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let page;
                          if (totalPages <= 5) page = i + 1;
                          else if (currentPage <= 3) page = i + 1;
                          else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                          else page = currentPage - 2 + i;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`h-9 min-w-[36px] rounded-xl px-2 text-sm font-semibold transition-all border ${page === currentPage
                                ? "bg-cyan-500 border-cyan-500 text-black"
                                : "border-white/[0.07] bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]"
                                }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-white transition-all hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none"
                        aria-label="Next page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);

  useEffect(() => {
    const handler = () => setCurrentRoute(window.location.pathname);
    window.addEventListener("popstate", handler);

    // Intercept all internal link clicks to make it a true SPA
    const handleGlobalClick = (e) => {
      const anchor = e.target.closest("a");
      if (anchor && anchor.href && anchor.host === window.location.host && !anchor.target) {
        e.preventDefault();
        window.history.pushState({}, "", anchor.pathname);
        setCurrentRoute(anchor.pathname);
      }
    };
    window.addEventListener("click", handleGlobalClick);

    return () => {
      window.removeEventListener("popstate", handler);
      window.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  if (currentRoute === "/" || currentRoute === "/index.html") return <HomeSection />;
  if (currentRoute === "/players") return <PlayerS />;
  if (currentRoute === "/clubs") return <Clubs />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-900 text-white">
      <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
    </div>
  );
}

export default App;
