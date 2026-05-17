import fs from 'fs';

const eafcPath = 'd:/footapp/src/Data/EAFC26.csv';
const logosPath = 'd:/footapp/src/Data/clubs_with_logos.csv';

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

const MANUAL_MAPPING = {
  "Man Utd": "Manchester United Football Club",
  "Man City": "Manchester City Football Club",
  "Paris SG": "Paris Saint-Germain Football Club",
  "Lombardia FC": "Football Club Internazionale Milano S.p.A.",
  "Milano FC": "Associazione Calcio Milan",
  "Latium": "Società Sportiva Lazio S.p.A.",
  "Bergamo Calcio": "Atalanta Bergamasca Calcio S.p.a.",
  "FC Barcelona": "Futbol Club Barcelona",
  "Real Madrid": "Real Madrid Club de Fútbol",
  "OL Lyonnes": "Olympique Lyonnais",
  "Arsenal": "Arsenal Football Club",
  "Manchester City": "Manchester City Football Club",
  "Chelsea": "Chelsea Football Club",
  "FC Bayern München": "Fussball-Club Bayern München e. V.",
};

function normalizeClubName(name) {
  if (!name) return "";
  let n = MANUAL_MAPPING[name] || name;
  
  // Remove accents
  n = n.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  return n.toLowerCase()
    .replace(/\bfootball club\b/g, "")
    .replace(/\bfutbol club\b/g, "")
    .replace(/\bsoccer club\b/g, "")
    .replace(/\bfc\b/g, "")
    .replace(/\bcf\b/g, "")
    .replace(/\bsg\b/g, "")
    .replace(/\bud\b/g, "")
    .replace(/\buc\b/g, "")
    .replace(/\bas\b/g, "")
    .replace(/\bcd\b/g, "")
    .replace(/\bac\b/g, "")
    .replace(/\bss\b/g, "")
    .replace(/\bus\b/g, "")
    .replace(/\bsc\b/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

const eafcContent = fs.readFileSync(eafcPath, 'utf-8');
const eafclines = eafcContent.split('\n');
const eafcHeaders = parseCSVLine(eafclines[0]);
const teamIdx = eafcHeaders.indexOf('Team');
const eafcTeams = new Set(eafclines.slice(1).map(l => parseCSVLine(l)[teamIdx]).filter(Boolean));

const logoContent = fs.readFileSync(logosPath, 'utf-8');
const logolines = logoContent.split('\n');
const logoHeaders = parseCSVLine(logolines[0]);
const nameIdx = logoHeaders.indexOf('name');
const logoTeams = new Map();
logolines.slice(1).forEach(l => {
  const parts = parseCSVLine(l);
  const name = parts[nameIdx];
  if (name) {
    logoTeams.set(normalizeClubName(name), name);
  }
});

let matched = 0;
let unmatched = [];

eafcTeams.forEach(team => {
  if (logoTeams.has(normalizeClubName(team))) {
    matched++;
  } else {
    unmatched.push(team);
  }
});

console.log(`Matched: ${matched} / ${eafcTeams.size}`);
console.log(`Unmatched (first 20):`, unmatched.slice(0, 20));
