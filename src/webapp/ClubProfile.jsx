import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Shield, Users, Trophy, User, TrendingUp, Calendar, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

function ClubProfile({ club, onBack }) {
  const [currentPage, setCurrentPage] = useState(1);
  const PLAYERS_PER_PAGE = 10;

  const allPlayers = useMemo(() => [...club.players].sort((a, b) => b.ovr - a.ovr), [club.players]);
  
  const malePlayers = useMemo(() => allPlayers.filter(p => p.gender === "M"), [allPlayers]);
  const femalePlayers = useMemo(() => allPlayers.filter(p => p.gender === "F"), [allPlayers]);

  const [activeGender, setActiveGender] = useState(malePlayers.length > 0 ? "M" : "F");

  const players = activeGender === "M" ? malePlayers : femalePlayers;

  const totalPages = Math.ceil(players.length / PLAYERS_PER_PAGE);
  const paginatedPlayers = useMemo(() => {
    const start = (currentPage - 1) * PLAYERS_PER_PAGE;
    return players.slice(start, start + PLAYERS_PER_PAGE);
  }, [players, currentPage]);

  // Reset pagination when switching gender
  useEffect(() => {
    setCurrentPage(1);
  }, [activeGender]);

  const avgOvr = club.avgOvr;
  const tierColor = avgOvr >= 85 ? "text-amber-400" : avgOvr >= 80 ? "text-cyan-400" : "text-slate-400";
  const tierBg = avgOvr >= 85 ? "bg-amber-500/10" : avgOvr >= 80 ? "bg-cyan-500/10" : "bg-slate-500/10";
  const tierBorder = avgOvr >= 85 ? "border-amber-500/20" : avgOvr >= 80 ? "border-cyan-500/20" : "border-slate-500/20";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="group mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-400 transition-all hover:text-white hover:border-white/[0.14] hover:bg-white/[0.07] backdrop-blur-md"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
        Back to Clubs
      </button>

      {/* Hero Header */}
      <div className="relative mb-10 overflow-hidden rounded-[2.5rem] border border-white/[0.07] bg-[#0a0a0f] p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-10">
          <div className={`shrink-0 h-32 w-32 rounded-3xl ${tierBg} ${tierBorder} border flex items-center justify-center shadow-2xl shadow-black overflow-hidden p-4`}>
            {club.logo ? (
              <img src={club.logo} alt={club.name} className="h-full w-full object-contain" />
            ) : (
              <Shield className={`h-16 w-16 ${tierColor}`} />
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
              <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${tierBg} ${tierColor} border ${tierBorder}`}>
                {avgOvr >= 85 ? "Elite Squad" : avgOvr >= 80 ? "Pro Contender" : "Rising Club"}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1">
                <Trophy className="h-3 w-3 text-amber-500" />
                {club.league}
              </span>
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl font-black text-white mb-4 tracking-tight leading-none">
              {club.name}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-500" />
                <span className="text-sm font-bold text-white">{club.playerCount} Athletes</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-lime-500" />
                <span className="text-sm font-bold text-white">{club.avgAge} Avg Age</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-bold text-white">{avgOvr} Avg Rating</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center">
            <div className="text-[64px] font-black leading-none text-white opacity-20 select-none">
              {avgOvr}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 -mt-2">Squad Index</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        
        {/* Left Sidebar: Club Analytics */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-8">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500 mb-6">Club Analysis</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Squad Strength</span>
                  <span className="text-xs font-bold text-white">{avgOvr}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${avgOvr}%` }}
                    className={`h-full bg-gradient-to-r from-cyan-500 to-blue-500`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/[0.04]">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1">Top Talent</p>
                  <p className="text-lg font-black text-white">{players[0]?.ovr || 0}</p>
                </div>
                <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/[0.04]">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1">Squad Depth</p>
                  <p className="text-lg font-black text-white">{club.playerCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-8">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-6">Club Details</h3>
            <div className="space-y-4">
              {club.coach && (
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Head Coach</p>
                    <p className="text-sm font-bold text-white">{club.coach}</p>
                  </div>
                </div>
              )}
              {club.stadium && (
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Stadium</p>
                    <p className="text-sm font-bold text-white leading-tight">{club.stadium}</p>
                    {club.capacity && <p className="text-[10px] text-slate-500">{Number(club.capacity).toLocaleString()} Seats</p>}
                  </div>
                </div>
              )}
              {club.marketValue && (
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Market Value</p>
                    <p className="text-sm font-bold text-white">{club.marketValue}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-8">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500 mb-6">Elite Talent</h3>
            <div className="space-y-4">
              {malePlayers.length > 0 && (
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <User className="h-6 w-6 text-cyan-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Men's Star</p>
                    <p className="text-sm font-bold text-white">{malePlayers[0].name}</p>
                    <p className="text-[10px] font-bold text-cyan-400">OVR {malePlayers[0].ovr}</p>
                  </div>
                </div>
              )}
              {femalePlayers.length > 0 && (
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <User className="h-6 w-6 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Women's Star</p>
                    <p className="text-sm font-bold text-white">{femalePlayers[0].name}</p>
                    <p className="text-[10px] font-bold text-rose-400">OVR {femalePlayers[0].ovr}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Content: Squad List */}
        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
          <div className="p-8 border-b border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.01]">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Squad Roster</h3>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">Sorted by OVR</p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/[0.06]">
              {malePlayers.length > 0 && (
                <button
                  onClick={() => setActiveGender("M")}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeGender === "M" ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20" : "text-slate-500 hover:text-white"
                  }`}
                >
                  Men ({malePlayers.length})
                </button>
              )}
              {femalePlayers.length > 0 && (
                <button
                  onClick={() => setActiveGender("F")}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeGender === "F" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "text-slate-500 hover:text-white"
                  }`}
                >
                  Women ({femalePlayers.length})
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Player</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">OVR</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Position</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Nationality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {paginatedPlayers.map((player, idx) => (
                  <motion.tr 
                    key={`${player.name}-${idx}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (idx % PLAYERS_PER_PAGE) * 0.03 }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
                          <User className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                        </div>
                        <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{player.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <span className={`text-sm font-black ${player.ovr >= 85 ? "text-amber-400" : player.ovr >= 80 ? "text-cyan-400" : "text-slate-400"}`}>
                        {player.ovr}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white/[0.05] border border-white/[0.08] px-2 py-1 rounded">
                        {player.pos}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-lime-500" />
                        <span className="text-xs text-slate-400">{player.nation}</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-white disabled:opacity-30 hover:bg-white/[0.08] transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-white disabled:opacity-30 hover:bg-white/[0.08] transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ClubProfile;
