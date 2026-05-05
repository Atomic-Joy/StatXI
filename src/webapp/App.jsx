import { useEffect, useMemo, useState } from "react";
import { Search, User, MapPin, Activity, ChevronLeft, ChevronRight } from "lucide-react";

const CSV_URL = new URL("./players.csv", import.meta.url).href;
const RESULTS_PER_PAGE = 21;
const POSITION_FULL_FORM = {
  GK: "Goalkeeper",
  RB: "Right Back",
  RWB: "Right Wing Back",
  LB: "Left Back",
  LWB: "Left Wing Back",
  CB: "Center Back",
  RCB: "Right Center Back",
  LCB: "Left Center Back",
  CDM: "Defensive Midfielder",
  RDM: "Right Defensive Midfielder",
  LDM: "Left Defensive Midfielder",
  CM: "Central Midfielder",
  RCM: "Right Central Midfielder",
  LCM: "Left Central Midfielder",
  CAM: "Attacking Midfielder",
  RAM: "Right Attacking Midfielder",
  LAM: "Left Attacking Midfielder",
  RM: "Right Midfielder",
  LM: "Left Midfielder",
  RW: "Right Winger",
  LW: "Left Winger",
  RF: "Right Forward",
  LF: "Left Forward",
  CF: "Center Forward",
  ST: "Striker",
  RS: "Right Striker",
  LS: "Left Striker"
};

function normalizeText(value) {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatPositions(positionValue) {
  return (positionValue || "")
    .split(",")
    .map((position) => position.trim())
    .filter(Boolean)
    .map((position) => POSITION_FULL_FORM[position] || position)
    .join(", ");
}

function parseCSVLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function parsePlayersCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const nameIndex = headers.indexOf("short_name");
  const longNameIndex = headers.indexOf("long_name");
  const nationalityIndex = headers.indexOf("nationality_name");
  const positionIndex = headers.indexOf("player_positions");
  const playerIdIndex = headers.indexOf("player_id");
  const overallIndex = headers.indexOf("overall");

  return lines.slice(1).map((line, idx) => {
    const cols = parseCSVLine(line);
    return {
      id: cols[playerIdIndex] || String(idx + 1),
      name: cols[nameIndex] || "Unknown",
      longName: cols[longNameIndex] || "",
      nationality: cols[nationalityIndex] || "Nationality N/A",
      position: formatPositions(cols[positionIndex]) || "Position N/A",
      overall: Number(cols[overallIndex]) || 0
    };
  });
}

function App() {
  const [query, setQuery] = useState("");
  const [allPlayers, setAllPlayers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingDataset, setLoadingDataset] = useState(true);
  const [datasetError, setDatasetError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCSV() {
      try {
        setLoadingDataset(true);
        setDatasetError("");

        const response = await fetch(CSV_URL);
        if (!response.ok) {
          throw new Error(`Failed to load CSV (status ${response.status}).`);
        }

        const csvText = await response.text();
        const parsedPlayers = parsePlayersCSV(csvText);

        if (isMounted) {
          setAllPlayers(parsedPlayers);
        }
      } catch (err) {
        if (isMounted) {
          setDatasetError(err.message || "Failed to load players dataset.");
        }
      } finally {
        if (isMounted) {
          setLoadingDataset(false);
        }
      }
    }

    loadCSV();

    return () => {
      isMounted = false;
    };
  }, []);

  const searchResults = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    if (normalizedQuery.length < 3) return [];

    const queryTokens = normalizedQuery.split(" ").filter(Boolean);

    return allPlayers.filter((player) => {
      const searchableName = normalizeText(`${player.name} ${player.longName}`);
      return queryTokens.every((token) => searchableName.includes(token));
    })
      .sort((a, b) => b.overall - a.overall);
  }, [query, allPlayers]);

  const totalPages = Math.max(1, Math.ceil(searchResults.length / RESULTS_PER_PAGE));

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * RESULTS_PER_PAGE;
    const end = start + RESULTS_PER_PAGE;
    return searchResults.slice(start, end);
  }, [searchResults, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="relative min-h-screen bg-dark-900 px-4 py-12 font-body text-slate-300 sm:px-8 lg:px-12 overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Ambient Orbs */}
      <div className="pointer-events-none absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-cyan-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-[40%] -right-[10%] h-[500px] w-[500px] rounded-full bg-lime-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl animate-fade-in">
        <header className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-dark-600 bg-dark-800/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-cyan-400 backdrop-blur-md">
            <Activity className="h-4 w-4" />
            <span>StatXI</span>
          </div>
          <h1 className="mb-8 font-display text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Discover the <span className="bg-gradient-to-r from-cyan-400 to-lime-400 bg-clip-text text-transparent">Elite.</span>
          </h1>

          <div className="mx-auto mt-8 w-full max-w-2xl animate-rise">
            <div className="group relative flex items-center rounded-full border border-dark-600 bg-dark-800/80 px-6 py-4 shadow-2xl backdrop-blur-xl transition-all focus-within:border-cyan-500/50 focus-within:ring-4 focus-within:ring-cyan-500/10 hover:border-dark-600/80">
              <Search className="mr-4 h-6 w-6 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <input
                id="search"
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search players by name..."
                className="w-full bg-transparent text-lg font-medium text-white placeholder:text-slate-500 outline-none"
              />
            </div>
          </div>
        </header>

        <section className="relative z-10 animate-rise" style={{ animationDelay: "0.2s" }}>
          {loadingDataset ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
            </div>
          ) : null}
          {!loadingDataset && datasetError ? <p className="text-center text-red-400">{datasetError}</p> : null}
          {!loadingDataset && !datasetError && !query.trim() ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
              <Search className="mb-4 h-12 w-12 opacity-20" />
              <p className="text-lg">Type at least 3 letters to explore the database.</p>
            </div>
          ) : null}
          {!loadingDataset && !datasetError && query.trim() && query.trim().length < 3 ? (
            <p className="text-center text-slate-400">Keep typing to search...</p>
          ) : null}
          {!loadingDataset && !datasetError && query.trim().length >= 3 && searchResults.length === 0 ? (
            <p className="text-center text-red-400">No athletes found matching your criteria.</p>
          ) : null}

          {searchResults.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedResults.map((player, index) => (
                <article
                  key={player.id}
                  className="group relative overflow-hidden rounded-3xl border border-dark-600 bg-dark-800/60 p-6 transition-all hover:-translate-y-1 hover:border-cyan-500/30 hover:bg-dark-800 hover:shadow-2xl hover:shadow-cyan-500/5 backdrop-blur-md"
                  style={{ animationDelay: `${(index % RESULTS_PER_PAGE) * 0.05}s` }}
                >
                  {/* Background Watermark Rating */}
                  {/* <div className="absolute -right-6 -bottom-8 pointer-events-none select-none text-[140px] font-display font-bold leading-none tracking-tighter text-white/[0.03] transition-colors group-hover:text-cyan-500/[0.05]">
                    {player.overall}
                  </div> */}

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="font-display text-2xl font-bold text-white group-hover:text-cyan-50">{player.name}</h3>
                        {player.longName && player.longName !== player.name ? (
                          <p className="mt-1 text-sm text-slate-400">{player.longName}</p>
                        ) : null}
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dark-700 text-cyan-400 border border-dark-600">
                        <User className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="mt-auto pt-6">
                      <div className="mb-4 flex items-center gap-2 text-sm text-slate-300">
                        <MapPin className="h-4 w-4 text-lime-400" />
                        <span>{player.nationality}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {player.position.split(',').map((pos, i) => (
                          <span key={i} className="rounded-md border border-dark-600 bg-dark-900/50 px-2.5 py-1 text-xs font-medium text-slate-300">
                            {pos.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {searchResults.length > 0 ? (
            <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-dark-600 bg-dark-800/50 p-4 sm:flex-row backdrop-blur-md">
              <p className="text-sm font-medium text-slate-400">
                Showing <span className="text-white">{(currentPage - 1) * RESULTS_PER_PAGE + 1}</span> to{" "}
                <span className="text-white">{Math.min(currentPage * RESULTS_PER_PAGE, searchResults.length)}</span> of{" "}
                <span className="text-white">{searchResults.length}</span> athletes
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-dark-600 bg-dark-700 text-white transition-all hover:bg-dark-600 disabled:pointer-events-none disabled:opacity-30"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex h-10 items-center justify-center rounded-xl border border-dark-600 bg-dark-900/50 px-4 text-sm font-semibold text-white">
                  {currentPage} / {totalPages}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-dark-600 bg-dark-700 text-white transition-all hover:bg-dark-600 disabled:pointer-events-none disabled:opacity-30"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export default App;
