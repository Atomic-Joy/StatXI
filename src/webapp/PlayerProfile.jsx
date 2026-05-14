import { ArrowLeft, MapPin, Shield, Activity, User } from "lucide-react";

function PlayerProfile({ player, onBack }) {
  const displayPhoto = player.photo;
  const team = player.team || "Club N/A";
  const age = player.age || "Age N/A";
  const height = player.height || "N/A";
  const weight = player.weight || "N/A";
  const bio = `${player.name} is a professional footballer from ${player.nationality}, currently playing for ${team}.`;

  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="group mb-8 inline-flex items-center gap-2 rounded-full border border-dark-600 bg-dark-800/50 px-4 py-2 text-sm font-semibold text-slate-300 transition-all hover:bg-dark-700 hover:text-white backdrop-blur-md"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Search
      </button>

      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        {/* Left Column: Photo & Quick Stats */}
        <div className="flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-3xl border border-dark-600 bg-dark-800/60 p-8 shadow-2xl backdrop-blur-xl">
            {/* Ambient Background for photo */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent opacity-50" />

            <div className="relative z-10 flex flex-col items-center">
              {displayPhoto ? (
                <img
                  src={displayPhoto}
                  alt={player.name}
                  className="h-64 w-auto drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)] object-contain transition-transform hover:scale-105 duration-500"
                />
              ) : (
                <div className="flex h-64 w-full flex-col items-center justify-center gap-4 text-slate-500">
                  <Activity className="h-16 w-16 opacity-20" />
                  <p>No photo available</p>
                </div>
              )}

              <h2 className="mt-6 font-display text-3xl font-bold text-white text-center">
                {player.name}
              </h2>
              {player.longName && player.longName !== player.name && (
                <p className="mt-2 text-center text-sm text-slate-400">{player.longName}</p>
              )}

              <div className="mt-6 flex w-full flex-col gap-3">
                <div className="flex items-center gap-3 rounded-xl bg-dark-900/50 p-3">
                  <MapPin className="h-5 w-5 text-lime-400" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Nationality</p>
                    <p className="text-sm font-medium text-white">{player.nationality}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-dark-900/50 p-3">
                  <Shield className="h-5 w-5 text-cyan-400" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Current Team</p>
                    <p className="text-sm font-medium text-white">{team}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-dark-900/50 p-3">
                  <User className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Age</p>
                    <p className="text-sm font-medium text-white">{age}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Bio & Detailed Info */}
        <div className="flex flex-col gap-8">
          <div className="rounded-3xl border border-dark-600 bg-dark-800/60 p-8 shadow-2xl backdrop-blur-xl">
            <h3 className="mb-6 font-display text-2xl font-bold text-white">Biography</h3>
            <div className="prose prose-invert max-w-none text-slate-300">
              <p className="whitespace-pre-line leading-relaxed">{bio}</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-dark-600 bg-dark-800/40 p-6 backdrop-blur-md">
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">Physical Profile</h4>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-dark-600/50 pb-2">
                  <span className="text-slate-400">Height</span>
                  <span className="font-medium text-white">{height}</span>
                </div>
                <div className="flex justify-between border-b border-dark-600/50 pb-2">
                  <span className="text-slate-400">Weight</span>
                  <span className="font-medium text-white">{weight}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-dark-600 bg-dark-800/40 p-6 backdrop-blur-md">
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">Positions</h4>
              <div className="flex flex-wrap gap-2">
                {player.position.split(",").map((pos, i) => (
                  <span
                    key={i}
                    className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-sm font-medium text-cyan-300"
                  >
                    {pos.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerProfile;
