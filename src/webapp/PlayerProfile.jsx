import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Shield, User, Ruler, Weight, Star, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── OVR colour tier ─────────────────────────────────────────────────────────
function ovrTier(ovr) {
  if (ovr >= 88) return { from: "#f59e0b", to: "#f97316", glow: "rgba(245,158,11,0.35)", label: "World Class", ring: "#f59e0b" };
  if (ovr >= 80) return { from: "#06b6d4", to: "#3b82f6", glow: "rgba(6,182,212,0.3)",  label: "Elite",       ring: "#06b6d4" };
  if (ovr >= 70) return { from: "#94a3b8", to: "#64748b", glow: "rgba(148,163,184,0.2)", label: "Pro",         ring: "#94a3b8" };
  return               { from: "#52525b", to: "#3f3f46", glow: "rgba(82,82,91,0.15)",    label: "Rising",      ring: "#52525b" };
}

// ── Animated OVR Ring ────────────────────────────────────────────────────────
function OvrRing({ ovr }) {
  const tier = ovrTier(ovr);
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const pct = ovr / 99;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <motion.circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke="url(#ovrGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${tier.glow})` }}
        />
        <defs>
          <linearGradient id="ovrGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={tier.from} />
            <stop offset="100%" stopColor={tier.to} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-display font-black text-white leading-none"
          style={{ fontSize: "2rem" }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {ovr}
        </motion.span>
        <span className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: tier.from }}>OVR</span>
      </div>
    </div>
  );
}

// ── Stat Bar ─────────────────────────────────────────────────────────────────
function StatBar({ label, value, max = 99, color, delay = 0 }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-sm font-semibold uppercase tracking-widest text-slate-500">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}cc, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay }}
        />
      </div>
      <span className="w-7 shrink-0 text-right text-sm font-bold text-white">{value}</span>
    </div>
  );
}

// ── Info Chip ────────────────────────────────────────────────────────────────
function InfoChip({ icon: Icon, label, value, accent }) {
  return (
    <motion.div
      className="relative flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 overflow-hidden group hover:border-white/[0.1] hover:bg-white/[0.05] transition-all duration-300"
      whileHover={{ y: -2 }}
    >
      <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${accent}18` }}>
        <Icon className="h-4 w-4" style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">{label}</p>
        <p className="text-base font-semibold text-white truncate mt-0.5">{value}</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, transparent, ${accent}40, transparent)` }} />
    </motion.div>
  );
}

// ── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ eyebrow, title }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500 mb-1">{eyebrow}</p>
      <h3 className="font-display text-xl font-bold text-white">{title}</h3>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
function PlayerProfile({ player, onBack }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const tier = ovrTier(player.overall || 0);
  const positions = (player.position || "N/A").split(",").map(p => p.trim()).filter(Boolean);
  const bio = `${player.name} is a professional footballer representing ${player.nationality}, currently on the books at ${player.team || "their club"}.`;

  const TABS = ["overview", "physical"];

  // Simulated attribute data derived from overall
  const ovr = player.overall || 70;
  const attrs = {
    overview: [
      { label: "Pace",     value: Math.min(99, Math.round(ovr * 0.97 + Math.random() * 8 - 4)), color: "#06b6d4" },
      { label: "Shooting", value: Math.min(99, Math.round(ovr * 0.95 + Math.random() * 8 - 4)), color: "#84cc16" },
      { label: "Passing",  value: Math.min(99, Math.round(ovr * 0.98 + Math.random() * 6 - 3)), color: "#a78bfa" },
      { label: "Dribbling",value: Math.min(99, Math.round(ovr * 0.96 + Math.random() * 8 - 4)), color: "#f59e0b" },
      { label: "Defending",value: Math.min(99, Math.round(ovr * 0.85 + Math.random() * 10 - 5)), color: "#f87171" },
      { label: "Physical", value: Math.min(99, Math.round(ovr * 0.93 + Math.random() * 8 - 4)), color: "#34d399" },
    ],
    physical: [
      { label: "Strength",    value: Math.min(99, Math.round(ovr * 0.9 + Math.random() * 10 - 5)), color: "#f97316" },
      { label: "Stamina",     value: Math.min(99, Math.round(ovr * 0.92 + Math.random() * 8 - 4)), color: "#34d399" },
      { label: "Aggression",  value: Math.min(99, Math.round(ovr * 0.88 + Math.random() * 10 - 5)), color: "#f87171" },
      { label: "Balance",     value: Math.min(99, Math.round(ovr * 0.94 + Math.random() * 8 - 4)), color: "#a78bfa" },
      { label: "Jumping",     value: Math.min(99, Math.round(ovr * 0.89 + Math.random() * 10 - 5)), color: "#06b6d4" },
      { label: "Composure",   value: Math.min(99, Math.round(ovr * 0.96 + Math.random() * 6 - 3)), color: "#f59e0b" },
    ],
  };

  const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
  const stagger = { show: { transition: { staggerChildren: 0.08 } } };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen w-full"
    >
      {/* ── Back Button ─────────────────────────────────────────────────────── */}
      <motion.button
        onClick={onBack}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="group mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-400 transition-all hover:text-white hover:border-white/[0.14] hover:bg-white/[0.07] backdrop-blur-md"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        Back to Search
      </motion.button>

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-8 overflow-hidden rounded-3xl border border-white/[0.07]"
        style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0d1117 50%, #080d10 100%)" }}
      >
        {/* Ambient glow behind photo */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse 60% 80% at 30% 50%, ${tier.glow}, transparent 70%)` }}
        />
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${tier.from}60, transparent)` }} />

        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8 p-8 md:p-10">

          {/* Photo */}
          <div className="relative shrink-0">
            <div
              className="absolute inset-0 rounded-2xl blur-2xl opacity-60"
              style={{ background: `radial-gradient(circle, ${tier.glow}, transparent 70%)`, transform: "scale(1.2)" }}
            />
            {player.photo ? (
              <motion.img
                src={player.photo}
                alt={player.name}
                onLoad={() => setImgLoaded(true)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: imgLoaded ? 1 : 0, scale: imgLoaded ? 1 : 0.9 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 h-52 md:h-64 w-auto object-contain drop-shadow-2xl"
                style={{ filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.7))" }}
              />
            ) : (
              <div className="relative z-10 h-52 md:h-64 w-48 flex flex-col items-center justify-center text-slate-600">
                <User className="h-20 w-20 opacity-20" />
                <span className="text-xs mt-2 opacity-40">No photo</span>
              </div>
            )}
          </div>

          {/* Hero info */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left pb-2">

            {/* Tier badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1"
              style={{ borderColor: `${tier.from}40`, background: `${tier.from}12` }}
            >
              <Star className="h-3 w-3" style={{ color: tier.from }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: tier.from }}>{tier.label}</span>
            </motion.div>

            {/* Name */}
            <motion.h1
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-none tracking-tight mb-2"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            >
              {player.name}
            </motion.h1>
            {player.longName && player.longName !== player.name && (
              <motion.p className="text-slate-500 text-sm mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                {player.longName}
              </motion.p>
            )}

            {/* Position pills */}
            <motion.div className="flex flex-wrap gap-2 mb-5 justify-center md:justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
              {positions.map((pos, i) => (
                <span
                  key={i}
                  className="rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider"
                  style={{ background: `${tier.from}18`, color: tier.from, border: `1px solid ${tier.from}35` }}
                >
                  {pos}
                </span>
              ))}
            </motion.div>

            {/* Quick meta row */}
            <motion.div className="flex flex-wrap gap-4 text-sm justify-center md:justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <span className="flex items-center gap-1.5 text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-lime-400" />
                {player.nationality}
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Shield className="h-3.5 w-3.5 text-cyan-400" />
                {player.team || "Club N/A"}
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <User className="h-3.5 w-3.5 text-purple-400" />
                Age {player.age || "N/A"}
              </span>
            </motion.div>
          </div>

          {/* OVR Ring — right side */}
          <motion.div
            className="shrink-0 flex flex-col items-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <OvrRing ovr={player.overall || 0} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600">Overall Rating</span>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Body Grid ───────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">

        {/* ── Left: Info Cards ──────────────────────────────────────────────── */}
        <motion.div
          variants={stagger} initial="hidden" animate="show"
          className="flex flex-col gap-4"
        >
          {/* Info chips */}
          <motion.div variants={fadeUp} transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}>
            <SectionHeader eyebrow="Profile" title="Player Info" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <InfoChip icon={MapPin}  label="Nationality" value={player.nationality} accent="#84cc16" />
              <InfoChip icon={Shield}  label="Current Club" value={player.team || "N/A"} accent="#06b6d4" />
              <InfoChip icon={User}    label="Age"          value={`${player.age || "N/A"} years old`} accent="#a78bfa" />
              <InfoChip icon={Ruler}   label="Height"       value={player.height || "N/A"} accent="#f59e0b" />
              <InfoChip icon={Weight}  label="Weight"       value={player.weight || "N/A"} accent="#f97316" />
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div
            variants={fadeUp} transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6"
          >
            <SectionHeader eyebrow="About" title="Biography" />
            <p className="text-sm text-slate-400 leading-relaxed">{bio}</p>
          </motion.div>
        </motion.div>

        {/* ── Right: Attributes ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6"
        >
          <SectionHeader eyebrow="Analytics" title="Attribute Breakdown" />

          {/* Tab switcher */}
          <div className="mb-6 inline-flex items-center gap-1 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="relative rounded-lg px-4 py-1.5 text-sm font-semibold uppercase tracking-widest transition-all duration-200"
                style={{ color: activeTab === tab ? "#fff" : "#64748b" }}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: `linear-gradient(135deg, ${tier.from}30, ${tier.to}20)`, border: `1px solid ${tier.from}30` }}
                    transition={{ duration: 0.25 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>

          {/* Bars */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-4"
            >
              {attrs[activeTab].map((a, i) => (
                <StatBar key={a.label} label={a.label} value={Math.round(a.value)} color={a.color} delay={i * 0.07} />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Positions legend */}
          <div className="mt-8 pt-6 border-t border-white/[0.05]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-600 mb-3">Positions</p>
            <div className="flex flex-wrap gap-2">
              {positions.map((pos, i) => (
                <span
                  key={i}
                  className="rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all hover:scale-105"
                  style={{ background: `${tier.from}14`, color: tier.from, border: `1px solid ${tier.from}30` }}
                >
                  {pos}
                </span>
              ))}
            </div>
          </div>

          {/* Rating tiers legend */}
          <div className="mt-6 pt-6 border-t border-white/[0.05] grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "World Class", range: "88+", from: "#f59e0b", to: "#f97316" },
              { label: "Elite",       range: "80+", from: "#06b6d4", to: "#3b82f6" },
              { label: "Pro",         range: "70+", from: "#94a3b8", to: "#64748b" },
              { label: "Rising",      range: "<70", from: "#52525b", to: "#3f3f46" },
            ].map(t => (
              <div key={t.label} className="flex flex-col items-center gap-1 rounded-xl border border-white/[0.05] bg-white/[0.02] py-3 px-2 text-center">
                <div className="h-1.5 w-8 rounded-full" style={{ background: `linear-gradient(90deg, ${t.from}, ${t.to})` }} />
                <span className="text-sm font-bold uppercase tracking-widest" style={{ color: t.from }}>{t.range}</span>
                <span className="text-xs text-slate-600 uppercase tracking-wide font-medium">{t.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default PlayerProfile;
