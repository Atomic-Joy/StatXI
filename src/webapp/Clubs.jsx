import { useEffect, useMemo, useState, useRef } from "react";
import { Search, MapPin, Activity, ChevronLeft, ChevronRight, ArrowLeft, Shield, Users, TrendingUp, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ClubProfile from "./ClubProfile";

const CSV_URL = new URL("../Data/EAFC26.csv", import.meta.url).href;
const LOGOS_CSV_URL = new URL("../Data/clubs_with_logos.csv", import.meta.url).href;
const CLUBS_PER_PAGE = 12;

function normalizeText(value) {
  return (value || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
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

function parseClubsFromCSV(csvText, logosCsvText) {
  // 1. Parse Logos Mapping (Direct 1:1 mapping using the 'Team' column)
  const logoMap = {};
  if (logosCsvText) {
    const logoLines = logosCsvText.split(/\r?\n/).filter(Boolean);
    if (logoLines.length > 1) {
      const logoHeaders = parseCSVLine(logoLines[0]);
      const lIdx = (col) => logoHeaders.indexOf(col);
      logoLines.slice(1).forEach(line => {
        const c = parseCSVLine(line);
        const teamName = c[lIdx("Team")];
        // Only set if not already set, to avoid redundant processing of duplicates
        if (teamName && !logoMap[teamName]) {
          logoMap[teamName] = {
            logo: c[lIdx("Logo_URL")],
            stadium: c[lIdx("stadium_name")],
            capacity: c[lIdx("stadium_seats")],
            marketValue: c[lIdx("total_market_value")],
            coach: c[lIdx("coach_name")]
          };
        }
      });
    }
  }

  // 2. Parse EAFC Clubs
  const lines = csvText.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  const idx = (col) => headers.indexOf(col);
  
  const clubMap = {};

  lines.slice(1).forEach((line) => {
    const c = parseCSVLine(line);
    const teamName = c[idx("Team")] || "Free Agents";
    const leagueName = c[idx("League")] || "N/A";
    const ovr = Number(c[idx("OVR")]) || 0;
    const playerName = c[idx("Name")] || "Unknown";

    const playerObj = {
      name: playerName,
      ovr: ovr,
      gender: c[idx("GENDER")] || "M",
      pos: c[idx("Position")] || "N/A",
      nation: c[idx("Nation")] || "N/A",
      age: Number(c[idx("Age")]) || 0
    };

    if (!clubMap[teamName]) {
      const enriched = logoMap[teamName] || {};
      
      clubMap[teamName] = {
        name: teamName,
        league: leagueName,
        players: [],
        totalOvr: 0,
        totalAge: 0,
        topPlayer: { name: "", ovr: 0 },
        logo: enriched.logo || null,
        stadium: enriched.stadium || null,
        capacity: enriched.capacity || null,
        marketValue: enriched.marketValue || null,
        coach: enriched.coach || null
      };
    }

    clubMap[teamName].players.push(playerObj);
    clubMap[teamName].totalOvr += ovr;
    clubMap[teamName].totalAge += playerObj.age;
    if (ovr > clubMap[teamName].topPlayer.ovr) {
      clubMap[teamName].topPlayer = { name: playerName, ovr: ovr };
    }
  });

  return Object.values(clubMap).map(club => ({
    ...club,
    avgOvr: Math.round(club.totalOvr / club.players.length),
    avgAge: (club.totalAge / club.players.length).toFixed(1),
    playerCount: club.players.length
  })).sort((a, b) => b.avgOvr - a.avgOvr);
}

// ── Club Card ────────────────────────────────────────────────────────────────
function ClubCard({ club, index, onClick }) {
  const avgOvr = club.avgOvr;
  const tierColor = avgOvr >= 85 ? "text-amber-400" : avgOvr >= 80 ? "text-cyan-400" : "text-slate-400";
  const glowColor = avgOvr >= 85 ? "rgba(245,158,11,0.1)" : avgOvr >= 80 ? "rgba(6,182,212,0.1)" : "rgba(148,163,184,0.05)";

  return (
    <motion.article
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 12) * 0.05 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-white/[0.12] hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-black/60"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at top right, ${glowColor}, transparent 70%)` }} />
      
      {/* Top Section */}
      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 overflow-hidden p-2">
            {club.logo ? (
              <img src={club.logo} alt={club.name} className="h-full w-full object-contain" />
            ) : (
              <Shield className={`h-6 w-6 ${tierColor}`} />
            )}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Squad Rating</p>
            <p className={`text-2xl font-black ${tierColor}`}>{avgOvr}</p>
          </div>
        </div>

        <h3 className="font-display text-xl font-bold text-white leading-tight mb-1 group-hover:text-cyan-400 transition-colors">
          {club.name}
        </h3>
        <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-6">
          <Trophy className="h-3 w-3 text-amber-500" />
          {club.league}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl bg-white/[0.04] p-3 border border-white/[0.04]">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1">Athletes</p>
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-cyan-500" />
              <span className="text-sm font-bold text-white">{club.playerCount}</span>
            </div>
          </div>
          <div className="rounded-xl bg-white/[0.04] p-3 border border-white/[0.04]">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1">Top Talent</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-lime-500" />
              <span className="text-sm font-bold text-white">{club.topPlayer.ovr}</span>
            </div>
          </div>
        </div>

        {/* View Profile Indicator */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">View Scouting Report</p>
          <div className="h-8 w-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Hover Line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${avgOvr >= 85 ? "from-amber-500 to-orange-500" : avgOvr >= 80 ? "from-cyan-500 to-blue-500" : "from-slate-500 to-slate-700"} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    </motion.article>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function Clubs() {
  const [query, setQuery] = useState("");
  const [allClubs, setAllClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClub, setSelectedClub] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef(null);

  // Global Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setQuery("");
        setIsFocused(false);
        setSelectedClub(null);
        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    async function fetchClubs() {
      try {
        setLoading(true);
        const [eafcRes, logosRes] = await Promise.all([
          fetch(CSV_URL),
          fetch(LOGOS_CSV_URL)
        ]);
        
        const eafcText = await eafcRes.text();
        const logosText = await logosRes.text();
        
        const clubs = parseClubsFromCSV(eafcText, logosText);
        setAllClubs(clubs);
      } catch (err) {
        console.error("Failed to load clubs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClubs();
  }, []);

  const filteredClubs = useMemo(() => {
    const nq = normalizeText(query);
    if (!nq) return allClubs;
    return allClubs.filter(c => 
      normalizeText(c.name).includes(nq) || 
      normalizeText(c.league).includes(nq)
    );
  }, [query, allClubs]);

  const totalPages = Math.ceil(filteredClubs.length / CLUBS_PER_PAGE);
  const paginatedClubs = filteredClubs.slice((currentPage - 1) * CLUBS_PER_PAGE, currentPage * CLUBS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [query]);

  return (
    <div className="relative min-h-screen bg-dark-900 font-body text-slate-300 overflow-x-hidden">
      {/* Ambient backgrounds */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[30%] -right-[15%] h-[700px] w-[700px] rounded-full bg-cyan-600/5 blur-[140px]" />
        <div className="absolute top-[50%] -left-[15%] h-[600px] w-[600px] rounded-full bg-amber-600/5 blur-[140px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-dark-900/80 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <a href="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-lime-500 shadow-lg shadow-cyan-500/20">
                <Shield className="h-4 w-4 text-black" />
              </div>
              <span className="font-display text-lg font-bold text-white tracking-tight">
                Stat<span className="bg-gradient-to-r from-cyan-400 to-lime-400 bg-clip-text text-transparent">XI</span>
              </span>
            </a>

            <div className="flex-1 max-w-md hidden sm:block">
              <div className={`relative flex items-center rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 transition-all ${isFocused ? 'border-cyan-500/40 ring-4 ring-cyan-500/10' : ''}`}>
                <Search className="h-4 w-4 text-slate-500 mr-2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search clubs or leagues..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a href="/players" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Players</a>
              <div className="h-4 w-px bg-white/[0.1]" />
              <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Global Index</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 sm:px-8 py-12">
        {selectedClub ? (
          <ClubProfile club={selectedClub} onBack={() => setSelectedClub(null)} />
        ) : (
          <>
            {/* Hero Section */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Club Explorer</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl sm:text-7xl font-black text-white leading-[1.1] mb-6"
          >
            Elite <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Squads</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-lg leading-relaxed"
          >
            Discover the most powerful football clubs in the world. Analyzed by average ratings, squad depth, and star power.
          </motion.p>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden mb-8">
          <div className="relative flex items-center rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-4">
            <Search className="h-5 w-5 text-slate-500 mr-3" />
            <input
              type="text"
              placeholder="Search clubs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-white outline-none"
            />
          </div>
        </div>

        {/* Loading / Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 rounded-3xl bg-white/[0.03] animate-pulse border border-white/[0.05]" />
            ))}
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Total Clubs</span>
                <span className="rounded-lg bg-white/[0.05] px-2 py-0.5 text-xs font-black text-cyan-400 border border-cyan-500/20">{filteredClubs.length}</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Ranking by Squad OVR</p>
            </div>

            {filteredClubs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedClubs.map((club, index) => (
                    <ClubCard key={club.name} club={club} index={index} onClick={() => setSelectedClub(club)} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-10 w-10 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/[0.06] transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-1 mx-4">
                      <span className="text-sm font-bold text-white">{currentPage}</span>
                      <span className="text-sm text-slate-600">/</span>
                      <span className="text-sm font-bold text-slate-500">{totalPages}</span>
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-10 w-10 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/[0.06] transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-24 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-white/[0.03] mb-6">
                  <Search className="h-8 w-8 text-slate-700" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No clubs found</h3>
                <p className="text-slate-500">We couldn't find any club matching your search.</p>
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
