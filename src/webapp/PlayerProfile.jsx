import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Shield, Activity, Calendar, AlertCircle } from "lucide-react";

function PlayerProfile({ player, onBack }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function fetchProfile() {
      try {
        setLoading(true);
        setError("");

        // Construct potential search queries
        let queriesToTry = [];
        if (player.longName) {
          const parts = player.longName.trim().split(/\s+/);
          if (parts.length > 1) {
            queriesToTry.push(`${parts[0]} ${parts[parts.length - 1]}`);
          }
          queriesToTry.push(player.longName);
        }
        if (player.name) {
          queriesToTry.push(player.name);
          const nameParts = player.name.split(".").map(s => s.trim()).filter(Boolean);
          if (nameParts.length > 1) {
            queriesToTry.push(nameParts[nameParts.length - 1]);
          }
        }

        queriesToTry = [...new Set(queriesToTry)];

        let foundPlayer = null;

        for (const query of queriesToTry) {
          if (!query) continue;

          const searchRes = await fetch(
            `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(query)}`
          );
          if (!searchRes.ok) continue;

          const searchData = await searchRes.json();

          if (searchData.player && searchData.player.length > 0) {
            const queryLastWord = query.split(" ").pop().toLowerCase();

            foundPlayer = searchData.player.find(
              (p) =>
                p.strSport === "Soccer" &&
                p.strPlayer.toLowerCase().includes(queryLastWord)
            );

            if (!foundPlayer) {
              foundPlayer = searchData.player.find(p => p.strSport === "Soccer");
            }

            if (foundPlayer) {
              break;
            }
          }
        }

        if (foundPlayer && foundPlayer.idPlayer) {
          const lookupRes = await fetch(
            `https://www.thesportsdb.com/api/v1/json/3/lookupplayer.php?id=${foundPlayer.idPlayer}`
          );
          if (!lookupRes.ok) throw new Error("Failed to load profile details.");
          const lookupData = await lookupRes.json();

          if (lookupData.players && lookupData.players.length > 0) {
            if (isMounted) setProfile(lookupData.players[0]);
            return;
          }
        }

        if (isMounted) setProfile(null);
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Could not fetch advanced profile data.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [player.name]);

  const displayPhoto = profile?.strCutout || profile?.strThumb || null;
  const team = profile?.strTeam || "Club N/A";
  const status = profile?.strStatus || "Status N/A";
  const dob = profile?.dateBorn || "DOB N/A";
  let bio = profile?.strDescriptionEN || "No biography available for this athlete.";
  if (bio !== "No biography available for this athlete.") {
    bio = bio.split(/\n+/)[0];
  }
  const height = profile?.strHeight || "";
  const weight = profile?.strWeight || "";

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
              {loading ? (
                <div className="flex h-64 w-full items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                </div>
              ) : displayPhoto ? (
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
                {profile?.strPlayer || player.name}
              </h2>
              {player.longName && player.longName !== player.name && (
                <p className="mt-2 text-center text-sm text-slate-400">{player.longName}</p>
              )}

              <div className="mt-6 flex w-full flex-col gap-3">
                <div className="flex items-center gap-3 rounded-xl bg-dark-900/50 p-3">
                  <MapPin className="h-5 w-5 text-lime-400" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Nationality</p>
                    <p className="text-sm font-medium text-white">{profile?.strNationality || player.nationality}</p>
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
                  <Calendar className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Date of Birth</p>
                    <p className="text-sm font-medium text-white">{dob}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fallback/Error state */}
          {!loading && (!profile || error) && (
            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 text-sm text-orange-200">
              <div className="flex items-center gap-2 mb-2 font-medium">
                <AlertCircle className="h-4 w-4" />
                Limited Data Available
              </div>
              We couldn't fetch extended profile details for this player from the database. Displaying basic local statistics.
            </div>
          )}
        </div>

        {/* Right Column: Bio & Detailed Info */}
        <div className="flex flex-col gap-8">
          <div className="rounded-3xl border border-dark-600 bg-dark-800/60 p-8 shadow-2xl backdrop-blur-xl">
            <h3 className="mb-6 font-display text-2xl font-bold text-white">Biography</h3>
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 w-full rounded bg-dark-600"></div>
                <div className="h-4 w-5/6 rounded bg-dark-600"></div>
                <div className="h-4 w-4/6 rounded bg-dark-600"></div>
                <div className="h-4 w-full rounded bg-dark-600"></div>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none text-slate-300">
                <p className="whitespace-pre-line leading-relaxed">{bio}</p>
              </div>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-dark-600 bg-dark-800/40 p-6 backdrop-blur-md">
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">Physical Profile</h4>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-dark-600/50 pb-2">
                  <span className="text-slate-400">Height</span>
                  <span className="font-medium text-white">{loading ? "..." : (height || "N/A")}</span>
                </div>
                <div className="flex justify-between border-b border-dark-600/50 pb-2">
                  <span className="text-slate-400">Weight</span>
                  <span className="font-medium text-white">{loading ? "..." : (weight || "N/A")}</span>
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
