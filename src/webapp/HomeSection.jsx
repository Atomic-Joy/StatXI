import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Players', href: '/players' },
  { label: 'Clubs', href: '/clubs' },
];

const STATS = [
  { value: '17,000+', label: 'Players Indexed' },
  { value: '130+', label: 'Clubs Covered' },
  { value: 'EA FC 26', label: 'Live Dataset' },
  { value: '10+', label: 'Leagues Tracked' },
];

const CARDS = [
  {
    id: 1, tag: 'Players', title: 'Search Players',
    headline: 'Find. Analyse. Compare.',
    description: `Dive deep into every player in the EA FC 26 dataset — stats, ratings, positions, ages, and performance profiles across the world's top leagues.`,
    buttonText: 'Explore Players', route: '/players',
    bgImage: '/images/search_players_bg.png',
    accentColor: 'from-cyan-500',
    pillColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    btnColor: 'bg-cyan-500 hover:bg-cyan-400 text-black',
    features: ['OVR Ratings', 'Positions', 'Nationality', 'Club & Age'],
  },
  {
    id: 2, tag: 'Clubs', title: 'Search Clubs',
    headline: 'Browse. Scout. Discover.',
    description: 'Explore every club from elite top-flight sides to rising squads — squad depth, league context, and player rosters all in one place.',
    buttonText: 'Explore Clubs', route: '/clubs',
    bgImage: '/images/search_clubs_bg.png',
    accentColor: 'from-lime-500',
    pillColor: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
    btnColor: 'bg-lime-500 hover:bg-lime-400 text-black',
    features: ['Squad Rosters', 'League Context', 'Overall Depth', 'Nation Mix'],
  },
];

function useMobile(bp = 768) {
  const [mob, setMob] = useState(() => typeof window !== 'undefined' && window.innerWidth < bp);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp - 1}px)`);
    const h = (e) => setMob(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, [bp]);
  return mob;
}

// Navbar
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark-900/90 backdrop-blur-2xl border-b border-dark-600/60 shadow-2xl shadow-black/40' : 'bg-transparent'}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-lime-500 shadow-lg shadow-cyan-500/25">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-black">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 3.5 2.5 2.5L12 10.5 9.5 8zm-6 6.5 2.5-2.5 2.5 2.5-2.5 2.5zm6 6.5-2.5-2.5 2.5-2.5 2.5 2.5zm6-6.5-2.5 2.5-2.5-2.5 2.5-2.5z" />
              </svg>
            </div>
            <span className="font-display text-xl font-bold text-white tracking-tight">
              Stat<span className="bg-gradient-to-r from-cyan-400 to-lime-400 bg-clip-text text-transparent">XI</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">{l.label}</a>
            ))}
          </div>

          <button onClick={() => setMenuOpen(o => !o)} className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-dark-600 text-slate-400 hover:text-white transition-all flex-col gap-1 p-2" aria-label="Toggle menu">
            <span className={`block w-full h-px bg-current transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-[4px]' : ''}`} />
            <span className={`block w-full h-px bg-current transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-full h-px bg-current transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-[8px]' : ''}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-dark-600/50 bg-dark-900/95 backdrop-blur-2xl overflow-hidden">
            <div className="px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(l => (
                <a key={l.label} href={l.href} className="px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">{l.label}</a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// Hero
function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center pt-36 pb-16 px-4 text-center overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-cyan-600/8 blur-[120px]" />
      <div className="pointer-events-none absolute top-20 -left-32 h-[300px] w-[300px] rounded-full bg-cyan-500/6 blur-[100px]" />
      <div className="pointer-events-none absolute top-20 -right-32 h-[300px] w-[300px] rounded-full bg-lime-500/6 blur-[100px]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/8 px-4 py-1.5 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">StatXI</span>
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
        className="font-display text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight text-white leading-[1.05]">
        The Ultimate<br />
        <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-lime-400 bg-clip-text text-transparent">Football</span>{' '}Database
      </motion.h1>

      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
        className="mt-6 max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
        StatXI gives you instant access to every player and club in the EA FC 26 dataset — search, compare, and analyse football data like never before.
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a href="/players" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-lime-500 px-7 py-3.5 text-sm font-bold uppercase tracking-widest text-black shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/50 hover:scale-105 transition-all">
          Start Exploring
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
        </a>
        <a href="https://github.com/Atomic-Joy" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-dark-600 bg-dark-800/50 px-7 py-3.5 text-sm font-semibold text-slate-300 hover:text-white hover:border-slate-600 hover:bg-dark-700/50 backdrop-blur-sm transition-all">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" /></svg>
          View on GitHub
        </a>
      </motion.div>
    </section>
  );
}

// Stats Strip
function StatsStrip() {
  return (
    <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
      className="mx-auto max-w-7xl px-4 sm:px-8 mb-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-dark-600/50 bg-dark-600/30">
        {STATS.map((s, i) => (
          <div key={i} className="relative flex flex-col items-center justify-center gap-1 bg-dark-800/60 px-6 py-6 text-center backdrop-blur-sm group hover:bg-dark-700/60 transition-colors">
            <span className="font-display text-3xl font-bold text-white">{s.value}</span>
            <span className="text-xs font-medium uppercase tracking-widest text-slate-500">{s.label}</span>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-0 group-hover:w-3/4 bg-gradient-to-r from-cyan-500 to-lime-500 transition-all duration-500" />
          </div>
        ))}
      </div>
    </motion.section>
  );
}

// Expanding Cards
function ExploreCards() {
  const [activeCard, setActiveCard] = useState(1);
  const isMobile = useMobile();

  const handleEnter = (id) => { if (!isMobile) setActiveCard(id); };
  const handleClick = (id) => { if (isMobile) setActiveCard(prev => prev === id ? null : id); };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-8 mb-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
        className="mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-1">Explore</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">Where do you start?</h2>
        </div>
        <p className="text-slate-500 text-xs sm:text-sm">{isMobile ? 'Tap a card to expand.' : 'Hover a card to expand.'}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.6 }}
        className="flex flex-col md:flex-row gap-3 md:h-[520px]">
        {CARDS.map((card) => {
          const isActive = activeCard === card.id;

          const cardStyle = isMobile
            ? {
              height: isActive ? '390px' : '110px',
              transition: 'height 0.48s cubic-bezier(0.4,0,0.2,1), border-color 0.3s ease, box-shadow 0.3s ease',
            }
            : {
              flexGrow: isActive ? 3 : 1,
              flexShrink: 1,
              flexBasis: 0,
              transition: 'flex-grow 0.5s cubic-bezier(0.4,0,0.2,1), border-color 0.3s ease, box-shadow 0.3s ease',
            };

          return (
            <div key={card.id}
              onMouseEnter={() => handleEnter(card.id)}
              onClick={() => handleClick(card.id)}
              className="relative overflow-hidden rounded-3xl cursor-pointer border"
              style={{
                ...cardStyle,
                borderColor: isActive ? 'rgba(255,255,255,0.10)' : 'rgba(39,39,42,0.5)',
                boxShadow: isActive ? '0 25px 50px -12px rgba(0,0,0,0.8)' : 'none',
              }}
            >
              {/* BG image */}
              <div className="absolute inset-0 bg-cover bg-center" style={{
                backgroundImage: `url(${card.bgImage})`,
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.65s cubic-bezier(0.4,0,0.2,1)',
                willChange: 'transform',
              }} />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20" />

              {/* Accent line */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${card.accentColor} to-transparent`}
                style={{ opacity: isActive ? 1 : 0, transition: 'opacity 0.35s ease' }} />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-5 md:p-8">

                {/* Top row */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest ${card.pillColor}`}>
                    {card.tag}
                  </span>

                  {/* Mobile chevron */}
                  <div className="md:hidden flex items-center justify-center h-7 w-7 rounded-full bg-white/10 backdrop-blur-sm flex-shrink-0"
                    style={{ transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)' }}>
                    <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Desktop feature chips */}
                  <div className="hidden md:flex flex-wrap gap-1 justify-end"
                    style={{ opacity: isActive ? 1 : 0, transform: isActive ? 'scale(1)' : 'scale(0.94)', transition: 'opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s', pointerEvents: isActive ? 'auto' : 'none' }}>
                    {card.features.map(f => (
                      <span key={f} className="inline-flex items-center rounded-md border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] font-medium text-slate-300 backdrop-blur-sm">{f}</span>
                    ))}
                  </div>
                </div>

                {/* Bottom */}
                <div className="flex flex-col">
                  <p className="hidden md:block text-xs font-medium uppercase tracking-widest text-slate-500 mb-1.5"
                    style={{ opacity: isActive ? 0 : 0.7, transition: 'opacity 0.25s ease' }}>
                    {card.tag}
                  </p>

                  <h3 className="font-display font-bold text-white leading-tight"
                    style={{
                      fontSize: isMobile ? (isActive ? '1.6rem' : '1.1rem') : (isActive ? 'clamp(1.9rem,3.2vw,2.75rem)' : '1.375rem'),
                      marginBottom: isActive ? '4px' : 0,
                      transition: 'font-size 0.45s cubic-bezier(0.4,0,0.2,1), margin-bottom 0.35s ease',
                    }}>
                    {card.title}
                  </h3>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
                        <p className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">{card.headline}</p>
                        <p className="text-slate-300 text-sm mb-4 max-w-md leading-relaxed">{card.description}</p>

                        {/* Mobile feature chips */}
                        <div className="flex md:hidden flex-wrap gap-1.5 mb-4">
                          {card.features.map(f => (
                            <span key={f} className="inline-flex items-center rounded-md border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] font-medium text-slate-300">{f}</span>
                          ))}
                        </div>

                        <motion.a href={card.route} onClick={e => e.stopPropagation()}
                          className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-widest shadow-lg transition-colors ${card.btnColor}`}
                          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                          {card.buttonText}
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                          </svg>
                        </motion.a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>
    </section>
  );
}

// Footer
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-dark-600/40 bg-dark-800/30 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-lime-500">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-black">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 3.5 2.5 2.5L12 10.5 9.5 8zm-6 6.5 2.5-2.5 2.5 2.5-2.5 2.5zm6 6.5-2.5-2.5 2.5-2.5 2.5 2.5zm6-6.5-2.5 2.5-2.5-2.5 2.5-2.5z" />
              </svg>
            </div>
            <span className="font-display text-base font-bold text-white">
              Stat<span className="bg-gradient-to-r from-cyan-400 to-lime-400 bg-clip-text text-transparent">XI</span>
            </span>
          </div>

          <p className="text-xs text-slate-500 text-center">
            © {year} StatXI. All rights reserved. Built with <span className="text-cyan-500">♥</span> for football analytics.
          </p>

          <a href="https://github.com/Atomic-Joy" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-dark-600 bg-dark-800/60 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-600 hover:bg-dark-700 transition-all group">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            Atomic-Joy
          </a>
        </div>
      </div>
    </footer>
  );
}

// Page
export default function HomeSection() {
  return (
    <div className="min-h-screen w-full bg-dark-900 overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <StatsStrip />
        <ExploreCards />
      </main>
      <Footer />
    </div>
  );
}
