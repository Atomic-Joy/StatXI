import { useEffect, useMemo, useState } from "react";

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_20%,#1a5f48_0%,#051614_55%,#020a08_100%)] px-4 py-8 font-body text-chalk sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl animate-rise">
        <header className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-amberline">Player Intelligence</p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Football Player Search</h1>

          <div className="mt-4 w-full max-w-xl">
            <label htmlFor="search" className="mb-2 block text-sm text-slate-200">
              Search players by keyword
            </label>
            <input
              id="search"
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="e.g. Harry"
              className="w-full rounded-xl border border-pitch-500/50 bg-black/30 px-4 py-2.5 text-chalk placeholder:text-slate-400 outline-none transition focus:border-amberline focus:ring-2 focus:ring-amberline/30"
            />
          </div>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <h2 className="font-display text-xl">Matching Players</h2>

          {loadingDataset ? <p className="mt-3 text-slate-200">Loading players dataset...</p> : null}
          {!loadingDataset && datasetError ? <p className="mt-3 text-red-200">{datasetError}</p> : null}
          {!loadingDataset && !datasetError && !query.trim() ? (
            <p className="mt-3 text-slate-200">Type at least 3 letters to search players.</p>
          ) : null}
          {!loadingDataset && !datasetError && query.trim() && query.trim().length < 3 ? (
            <p className="mt-3 text-slate-200">Enter at least 3 letters to start searching.</p>
          ) : null}
          {!loadingDataset && !datasetError && query.trim().length >= 3 && searchResults.length === 0 ? (
            <p className="mt-3 text-red-200">No players found for this keyword.</p>
          ) : null}

          {searchResults.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedResults.map((player) => (
                <article key={player.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="font-semibold text-slate-100">{player.name}</p>
                  {player.longName && player.longName !== player.name ? (
                    <p className="mt-1 text-xs text-slate-400">{player.longName}</p>
                  ) : null}
                  <p className="mt-2 text-sm text-slate-300">{player.nationality}</p>
                  <p className="mt-1 text-xs text-slate-400">{player.position}</p>
                </article>
              ))}
            </div>
          ) : null}

          {searchResults.length > 0 ? (
            <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-300">
                Showing {(currentPage - 1) * RESULTS_PER_PAGE + 1}-
                {Math.min(currentPage * RESULTS_PER_PAGE, searchResults.length)} of {searchResults.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-300">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
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
