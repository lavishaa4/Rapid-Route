import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// Metro data embedded (parsed from CSV)
// In production this would call the Python backend
// ─────────────────────────────────────────────
const RAW_DATA = [
  {id:1,name:"Shaheed Sthal",dist:0,line:"Red Line"},{id:2,name:"Hindon River",dist:1,line:"Red Line"},{id:3,name:"Arthala",dist:2.5,line:"Red Line"},{id:4,name:"Mohan Nagar",dist:3.2,line:"Red Line"},{id:5,name:"Shyam Park",dist:4.5,line:"Red Line"},{id:6,name:"Major Mohit Sharma",dist:5.7,line:"Red Line"},{id:7,name:"Raj Bagh",dist:6.9,line:"Red Line"},{id:8,name:"Shaheed Nagar",dist:8.2,line:"Red Line"},{id:9,name:"Dilshad Garden",dist:9.4,line:"Red Line"},{id:10,name:"Jhil Mil",dist:10.3,line:"Red Line"},{id:11,name:"Mansarovar Park",dist:11.4,line:"Red Line"},{id:12,name:"Shahdara",dist:12.5,line:"Red Line"},{id:13,name:"Welcome",dist:13.7,line:"Red Line",conn:["Pink Line"]},{id:14,name:"Seelampur",dist:14.8,line:"Red Line"},{id:15,name:"Shastri Park",dist:16.4,line:"Red Line"},{id:16,name:"Kashmere Gate",dist:18.5,line:"Red Line",conn:["Violet Line","Yellow Line"]},{id:17,name:"Tis Hazari",dist:19.7,line:"Red Line"},{id:18,name:"Pul Bangash",dist:20.6,line:"Red Line"},{id:19,name:"Pratap Nagar",dist:21.4,line:"Red Line"},{id:20,name:"Shastri Nagar",dist:23.1,line:"Red Line"},{id:21,name:"Inderlok",dist:24.3,line:"Red Line",conn:["Green Line"]},{id:22,name:"Kanhaiya Nagar",dist:25.5,line:"Red Line"},{id:23,name:"Keshav Puram",dist:26.2,line:"Red Line"},{id:24,name:"Netaji Subash Place",dist:27.4,line:"Red Line",conn:["Pink Line"]},{id:25,name:"Kohat Enclave",dist:28.6,line:"Red Line"},{id:26,name:"Pitam Pura",dist:29.6,line:"Red Line"},{id:27,name:"Rohini East",dist:30.4,line:"Red Line"},{id:28,name:"Rohini West",dist:31.7,line:"Red Line"},{id:29,name:"Rithala",dist:32.7,line:"Red Line"},
  {id:1,name:"Samaypur Badli",dist:0,line:"Yellow Line"},{id:2,name:"Rohini Sector 18-19",dist:0.8,line:"Yellow Line"},{id:3,name:"Haiderpur Badli Mor",dist:2.1,line:"Yellow Line"},{id:4,name:"Jahangirpuri",dist:3.4,line:"Yellow Line"},{id:5,name:"Adarsh Nagar",dist:4.7,line:"Yellow Line"},{id:6,name:"Azadpur",dist:6.2,line:"Yellow Line",conn:["Pink Line"]},{id:7,name:"Model Town",dist:7.6,line:"Yellow Line"},{id:8,name:"Guru Tegh Bahadur Nagar",dist:9,line:"Yellow Line"},{id:9,name:"Vishwavidyalaya",dist:9.8,line:"Yellow Line"},{id:10,name:"Vidhan Sabha",dist:10.8,line:"Yellow Line"},{id:11,name:"Civil Lines",dist:12.1,line:"Yellow Line"},{id:12,name:"Kashmere Gate",dist:13.2,line:"Yellow Line",conn:["Violet Line"]},{id:13,name:"Chandni Chowk",dist:14.3,line:"Yellow Line"},{id:14,name:"Chawri Bazar",dist:15.3,line:"Yellow Line"},{id:15,name:"New Delhi",dist:16.1,line:"Yellow Line",conn:["Orange Line"]},{id:16,name:"Rajiv Chowk",dist:17.2,line:"Yellow Line",conn:["Blue Line"]},{id:17,name:"Patel Chowk",dist:18.5,line:"Yellow Line"},{id:18,name:"Central Secretariat",dist:19.4,line:"Yellow Line",conn:["Violet Line"]},{id:19,name:"Udyog Bhawan",dist:19.7,line:"Yellow Line"},{id:20,name:"Lok Kalyan Marg",dist:21.3,line:"Yellow Line"},{id:21,name:"Jor Bagh",dist:22.5,line:"Yellow Line"},{id:22,name:"Dilli Haat INA",dist:23.8,line:"Yellow Line",conn:["Pink Line"]},{id:23,name:"AIIMS",dist:24.6,line:"Yellow Line"},{id:24,name:"Green Park",dist:25.6,line:"Yellow Line"},{id:25,name:"Hauz Khas",dist:27.4,line:"Yellow Line",conn:["Magenta Line"]},{id:26,name:"Malviya Nagar",dist:29.1,line:"Yellow Line"},{id:27,name:"Saket",dist:30,line:"Yellow Line"},{id:28,name:"Qutab Minar",dist:31.7,line:"Yellow Line"},{id:29,name:"Chhattarpur",dist:33,line:"Yellow Line"},{id:30,name:"Sultanpur",dist:34.6,line:"Yellow Line"},{id:31,name:"Ghitorni",dist:35.9,line:"Yellow Line"},{id:32,name:"Arjan Garh",dist:38.6,line:"Yellow Line"},{id:33,name:"Guru Dronacharya",dist:40.9,line:"Yellow Line"},{id:34,name:"Sikandarpur",dist:41.9,line:"Yellow Line",conn:["Rapid Metro"]},{id:35,name:"MG Road",dist:43.1,line:"Yellow Line"},{id:36,name:"IFFCO Chowk",dist:44.2,line:"Yellow Line"},{id:37,name:"Huda City Centre",dist:45.7,line:"Yellow Line"},
  {id:1,name:"Dwarka Sector 21",dist:0,line:"Blue Line",conn:["Orange Line"]},{id:9,name:"Dwarka",dist:9.1,line:"Blue Line",conn:["Gray Line"]},{id:14,name:"Janak Puri West",dist:14.7,line:"Blue Line",conn:["Magenta Line"]},{id:19,name:"Rajouri Garden",dist:19.6,line:"Blue Line",conn:["Pink Line"]},{id:22,name:"Kirti Nagar",dist:22.8,line:"Blue Line",conn:["Green Line"]},{id:29,name:"Rajiv Chowk",dist:30.1,line:"Blue Line",conn:["Yellow Line"]},{id:31,name:"Mandi House",dist:31.8,line:"Blue Line",conn:["Violet Line"]},{id:34,name:"Yamuna Bank",dist:35.2,line:"Blue Line"},{id:36,name:"Mayur Vihar Phase-1",dist:38.3,line:"Blue Line",conn:["Pink Line"]},{id:42,name:"Botanical Garden",dist:44.7,line:"Blue Line",conn:["Magenta Line"]},{id:46,name:"Noida Sector 52",dist:49.3,line:"Blue Line",conn:["Aqua Line"]},
  {id:1,name:"Janak Puri West",dist:0,line:"Magenta Line",conn:["Blue Line"]},{id:12,name:"Hauz Khas",dist:17.5,line:"Magenta Line",conn:["Yellow Line"]},{id:17,name:"Kalkaji Mandir",dist:23,line:"Magenta Line",conn:["Violet Line"]},{id:25,name:"Botanical Garden",dist:33.1,line:"Magenta Line",conn:["Blue Line"]},
  {id:1,name:"Kashmere Gate",dist:0,line:"Violet Line",conn:["Yellow Line"]},{id:6,name:"Mandi House",dist:5.8,line:"Violet Line",conn:["Blue Line"]},{id:8,name:"Central Secretariat",dist:8.5,line:"Violet Line",conn:["Yellow Line"]},{id:12,name:"Lajpat Nagar",dist:14.4,line:"Violet Line",conn:["Pink Line"]},{id:16,name:"Kalkaji Mandir",dist:18.2,line:"Violet Line",conn:["Magenta Line"]},{id:34,name:"Raja Nahar Singh",dist:43.5,line:"Violet Line"},
  {id:1,name:"Majlis Park",dist:0,line:"Pink Line"},{id:2,name:"Azadpur",dist:2.1,line:"Pink Line",conn:["Yellow Line"]},{id:4,name:"Netaji Subash Place",dist:5.1,line:"Pink Line",conn:["Red Line"]},{id:8,name:"Rajouri Garden",dist:11.3,line:"Pink Line",conn:["Blue Line"]},{id:16,name:"Dilli Haat INA",dist:24.9,line:"Pink Line",conn:["Yellow Line"]},{id:18,name:"Lajpat Nagar",dist:27.7,line:"Pink Line",conn:["Violet Line"]},{id:22,name:"Mayur Vihar Phase-1",dist:35.8,line:"Pink Line",conn:["Blue Line"]},{id:28,name:"Anand Vihar",dist:41.9,line:"Pink Line",conn:["Blue Line"]},{id:33,name:"Welcome",dist:46.8,line:"Pink Line",conn:["Red Line"]},{id:38,name:"Shiv Vihar",dist:52.6,line:"Pink Line"},
  {id:1,name:"Sector 55-56",dist:0,line:"Rapid Metro"},{id:6,name:"Sikandarpur",dist:6.6,line:"Rapid Metro",conn:["Yellow Line"]},{id:11,name:"DLF Phase 3",dist:10,line:"Rapid Metro"},
  {id:1,name:"Dwarka Sector 21",dist:0,line:"Orange Line",conn:["Blue Line"]},{id:5,name:"IGI Airport",dist:17.9,line:"Orange Line"},{id:6,name:"New Delhi-Airport Express",dist:20.8,line:"Orange Line",conn:["Yellow Line"]},
  {id:1,name:"Dwarka",dist:0,line:"Gray Line",conn:["Blue Line"]},{id:3,name:"Najafgarh",dist:3.9,line:"Gray Line"},
  {id:1,name:"Noida Sector 51",dist:0,line:"Aqua Line",conn:["Blue Line"]},{id:21,name:"Depot Greater Noida",dist:27.1,line:"Aqua Line"},
];

const LINE_COLORS = {
  "Red Line": "#e53935",
  "Yellow Line": "#f9a825",
  "Blue Line": "#1565c0",
  "Green Line": "#2e7d32",
  "Violet Line": "#6a1b9a",
  "Pink Line": "#e91e8c",
  "Magenta Line": "#ad1457",
  "Orange Line": "#e65100",
  "Gray Line": "#546e7a",
  "Aqua Line": "#00838f",
  "Rapid Metro": "#00695c",
  "Blue Line Branch": "#1976d2",
  "Green Line Branch": "#388e3c",
};

// Build adjacency graph
function buildGraph(data) {
  const stations = {};
  const lineGroups = {};
  const adj = {};

  data.forEach(st => {
    const key = `${st.line}|${st.name}`;
    stations[key] = st;
    if (!lineGroups[st.line]) lineGroups[st.line] = [];
    lineGroups[st.line].push(key);
    adj[key] = [];
  });

  // Sort each line by distance
  Object.keys(lineGroups).forEach(line => {
    lineGroups[line].sort((a, b) => stations[a].dist - stations[b].dist);
    const keys = lineGroups[line];
    for (let i = 0; i < keys.length - 1; i++) {
      const w = Math.abs(stations[keys[i+1]].dist - stations[keys[i]].dist);
      adj[keys[i]].push({ to: keys[i+1], w, line });
      adj[keys[i+1]].push({ to: keys[i], w, line });
    }
  });

  // Interchange connections
  const byName = {};
  Object.keys(stations).forEach(key => {
    const n = stations[key].name.toLowerCase();
    if (!byName[n]) byName[n] = [];
    byName[n].push(key);
  });
  Object.values(byName).forEach(keys => {
    if (keys.length > 1) {
      for (let i = 0; i < keys.length; i++)
        for (let j = i+1; j < keys.length; j++) {
          adj[keys[i]].push({ to: keys[j], w: 0.1, line: "interchange" });
          adj[keys[j]].push({ to: keys[i], w: 0.1, line: "interchange" });
        }
    }
  });

  return { stations, lineGroups, adj };
}

function dijkstra(src, dst, adj) {
  const dist = {};
  const parent = {};
  const pq = [[0, src]];
  dist[src] = 0;
  parent[src] = null;

  while (pq.length) {
    pq.sort((a,b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (u === dst) break;
    if (d > (dist[u] ?? Infinity)) continue;
    (adj[u] || []).forEach(({ to, w }) => {
      const nd = d + w;
      if (nd < (dist[to] ?? Infinity)) {
        dist[to] = nd;
        parent[to] = u;
        pq.push([nd, to]);
      }
    });
  }

  if (dist[dst] === undefined) return { path: [], dist: Infinity };
  const path = [];
  let cur = dst;
  while (cur !== null) { path.push(cur); cur = parent[cur]; }
  return { path: path.reverse(), dist: dist[dst] };
}

function findStations(query, stations) {
  const q = query.toLowerCase().trim();
  return Object.keys(stations).filter(k =>
    stations[k].name.toLowerCase().includes(q)
  );
}

// ─────────────────────────────────────────────
// CHATBOT LOGIC
// ─────────────────────────────────────────────
function handleQuery(query, graph) {
  const q = query.toLowerCase().trim();
  const { stations, lineGroups, adj } = graph;

  // Greeting
  if (/^(hi|hello|hey|namaste)/.test(q)) {
    return { type: "text", text: "Namaste! 🚇 I'm your Delhi Metro guide. Ask me route, station info, or line details. Try: 'Route from Rajiv Chowk to AIIMS'" };
  }

  // Help
  if (/help|what can you/.test(q)) {
    return { type: "text", text: `I can help with:\n• Route from [A] to [B]\n• Which line is [station]?\n• Stations on [line] line\n• Is [station] an interchange?\n• How many stations/lines?` };
  }

  // Count
  if (/how many (stations|line)/.test(q)) {
    if (q.includes("line")) return { type: "text", text: `Delhi Metro has ${Object.keys(lineGroups).length} lines: ${Object.keys(lineGroups).join(", ")}` };
    const unique = new Set(Object.values(stations).map(s => s.name)).size;
    return { type: "text", text: `Delhi Metro has approximately ${unique} unique stations.` };
  }

  // Interchange list
  if (/interchange stations|list interchange/.test(q)) {
    const ics = Object.values(stations).filter(s => s.conn && s.conn.length > 0);
    const unique = {};
    ics.forEach(s => { if (!unique[s.name]) unique[s.name] = s; });
    return { type: "text", text: "🔀 Interchange Stations:\n" + Object.values(unique).map(s => `• ${s.name} (${s.line}) ↔ ${s.conn.join(", ")}`).join("\n") };
  }

  // Is X interchange?
  const icMatch = q.match(/is\s+(.+?)\s+(interchange|transfer|connected)/);
  if (icMatch) {
    const results = findStations(icMatch[1], stations);
    if (results.length === 0) return { type: "text", text: `Station '${icMatch[1]}' not found.` };
    const st = stations[results[0]];
    if (st.conn && st.conn.length > 0) return { type: "text", text: `Yes! ${st.name} is an interchange. Connects: ${st.conn.join(", ")}` };
    return { type: "text", text: `${st.name} is not an interchange station.` };
  }

  // Which line
  const lineMatch = q.match(/which line.+?(is|has)\s+(.+)/);
  if (lineMatch) {
    const results = findStations(lineMatch[2], stations);
    if (results.length === 0) return { type: "text", text: `Station not found.` };
    const st = stations[results[0]];
    return { type: "text", text: `${st.name} is on the ${st.line}.` };
  }

  // Line stations
  const lineStMatch = q.match(/(show|list|stations on|stations in)?\s*(.+?)\s+line/);
  if (lineStMatch) {
    const lineQuery = lineStMatch[2].trim();
    const matchedLine = Object.keys(lineGroups).find(l => l.toLowerCase().includes(lineQuery));
    if (matchedLine) {
      const sts = lineGroups[matchedLine].map(k => stations[k]);
      return { type: "line", line: matchedLine, stations: sts };
    }
  }

  // Route
  const routeMatch = q.match(/(?:from|route from|go from|travel from)\s+(.+?)\s+to\s+(.+?)(?:[?.])?$/);
  if (routeMatch) {
    const srcName = routeMatch[1].trim();
    const dstName = routeMatch[2].trim();
    const srcs = findStations(srcName, stations);
    const dsts = findStations(dstName, stations);
    if (srcs.length === 0) return { type: "text", text: `Source station '${srcName}' not found. Try partial name.` };
    if (dsts.length === 0) return { type: "text", text: `Destination '${dstName}' not found. Try partial name.` };

    const { path, dist: totalDist } = dijkstra(srcs[0], dsts[0], adj);
    if (path.length === 0) return { type: "text", text: "No route found between these stations." };

    const routeStations = path.map(k => stations[k]);
    return { type: "route", stations: routeStations, dist: totalDist, src: stations[srcs[0]].name, dst: stations[dsts[0]].name };
  }

  // Fallback: station search
  const results = findStations(q, stations);
  if (results.length > 0) {
    const st = stations[results[0]];
    const ic = st.conn && st.conn.length > 0 ? ` Interchange with: ${st.conn.join(", ")}` : "";
    return { type: "text", text: `Found: ${st.name} on ${st.line} (${st.dist} km from start).${ic}` };
  }

  return { type: "text", text: "I didn't understand. Try: 'Route from Rajiv Chowk to Hauz Khas' or type 'help'" };
}

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function RouteResult({ result }) {
  const { stations, dist, src, dst } = result;
  // Group by line
  const segments = [];
  let cur = null;
  stations.forEach(st => {
    if (!cur || cur.line !== st.line) {
      cur = { line: st.line, stations: [] };
      segments.push(cur);
    }
    cur.stations.push(st);
  });

  return (
    <div style={{ fontSize: 13 }}>
      <div style={{ fontWeight: 700, marginBottom: 8, color: "#333" }}>
        🚇 {src} → {dst}
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ background: "#f0f4ff", borderRadius: 6, padding: "3px 10px", color: "#3b5bdb", fontWeight: 600, fontSize: 12 }}>
          📏 {dist.toFixed(1)} km
        </span>
        <span style={{ background: "#f0f4ff", borderRadius: 6, padding: "3px 10px", color: "#3b5bdb", fontWeight: 600, fontSize: 12 }}>
          🔢 {stations.length} stops
        </span>
        <span style={{ background: "#f0f4ff", borderRadius: 6, padding: "3px 10px", color: "#3b5bdb", fontWeight: 600, fontSize: 12 }}>
          🔀 {segments.length} line{segments.length > 1 ? "s" : ""}
        </span>
      </div>
      {segments.map((seg, si) => (
        <div key={si} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <div style={{
              width: 12, height: 12, borderRadius: "50%",
              background: LINE_COLORS[seg.line] || "#888"
            }} />
            <span style={{ fontWeight: 600, fontSize: 12, color: LINE_COLORS[seg.line] || "#888" }}>{seg.line}</span>
          </div>
          <div style={{ borderLeft: `3px solid ${LINE_COLORS[seg.line] || "#ccc"}`, paddingLeft: 10 }}>
            {seg.stations.map((st, i) => (
              <div key={i} style={{
                padding: "3px 0",
                color: st.conn && st.conn.length > 0 ? "#d63031" : "#555",
                fontWeight: st.conn && st.conn.length > 0 ? 600 : 400,
                fontSize: 12,
              }}>
                {st.conn && st.conn.length > 0 ? "★ " : "• "}{st.name}
                {st.conn && st.conn.length > 0 && (
                  <span style={{ fontSize: 10, color: "#888", marginLeft: 4 }}>
                    ↔ {st.conn.join(", ")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LineResult({ result }) {
  const { line, stations } = result;
  const color = LINE_COLORS[line] || "#888";
  return (
    <div style={{ fontSize: 13 }}>
      <div style={{ fontWeight: 700, color, marginBottom: 8 }}>
        🛤️ {line} — {stations.length} stations
      </div>
      <div style={{ maxHeight: 200, overflowY: "auto" }}>
        {stations.map((st, i) => (
          <div key={i} style={{
            padding: "3px 0",
            borderBottom: "1px solid #f5f5f5",
            display: "flex", alignItems: "center", gap: 6, fontSize: 12
          }}>
            <span style={{ color: "#999", minWidth: 22 }}>{i+1}.</span>
            <span style={{ color: st.conn && st.conn.length > 0 ? "#d63031" : "#444" }}>
              {st.name}
              {st.conn && st.conn.length > 0 && <span style={{ fontSize: 10, color: "#888", marginLeft: 4 }}>★</span>}
            </span>
            <span style={{ marginLeft: "auto", fontSize: 10, color: "#aaa" }}>{st.dist}km</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatMessage({ msg }) {
  const isBot = msg.role === "bot";
  return (
    <div style={{
      display: "flex",
      justifyContent: isBot ? "flex-start" : "flex-end",
      marginBottom: 12,
    }}>
      {isBot && (
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: "linear-gradient(135deg, #4c6ef5, #748ffc)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, marginRight: 8, flexShrink: 0, alignSelf: "flex-end"
        }}>🚇</div>
      )}
      <div style={{
        maxWidth: "82%",
        background: isBot ? "#fff" : "linear-gradient(135deg, #4c6ef5, #748ffc)",
        color: isBot ? "#333" : "#fff",
        borderRadius: isBot ? "2px 12px 12px 12px" : "12px 2px 12px 12px",
        padding: "10px 14px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        fontSize: 13,
        lineHeight: 1.6,
        whiteSpace: isBot ? "pre-wrap" : "normal",
      }}>
        {msg.result ? (
          msg.result.type === "route" ? <RouteResult result={msg.result} /> :
          msg.result.type === "line" ? <LineResult result={msg.result} /> :
          <span style={{ whiteSpace: "pre-wrap" }}>{msg.result.text}</span>
        ) : msg.text}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  const [graph] = useState(() => buildGraph(RAW_DATA));
  const [messages, setMessages] = useState([
    { role: "bot", text: "Namaste! 🚇 Welcome to Rapid Route — your Delhi Metro guide.\n\nTry asking:\n• Route from Rajiv Chowk to Hauz Khas\n• Stations on Red line\n• Is Kashmere Gate an interchange?" }
  ]);
  const [input, setInput] = useState("");
  const [activeLine] = useState(null);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const send = () => {
    const q = input.trim();
    if (!q) return;
    const userMsg = { role: "user", text: q };
    const result = handleQuery(q, graph);
    const botMsg = { role: "bot", text: result.text || "", result };
    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput("");
    inputRef.current?.focus();
  };

  const quickQuery = (q) => {
    setInput(q);
    setTimeout(() => {
      const result = handleQuery(q, graph);
      setMessages(prev => [...prev,
        { role: "user", text: q },
        { role: "bot", text: result.text || "", result }
      ]);
    }, 50);
  };

  const lines = Object.keys(graph.lineGroups);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f7f8fc",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #e8eaf0",
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        height: 56,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "linear-gradient(135deg, #4c6ef5, #748ffc)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>🚇</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a2e" }}>Rapid Route</div>
          <div style={{ fontSize: 11, color: "#888" }}>Delhi Metro Navigator</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: "#aaa" }}>
          {Object.keys(graph.stations).length} stations • {lines.length} lines
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, maxHeight: "calc(100vh - 56px)", overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{
          width: 200,
          background: "#fff",
          borderRight: "1px solid #e8eaf0",
          overflowY: "auto",
          padding: "12px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}>
          <div style={{ fontSize: 10, color: "#aaa", fontWeight: 700, letterSpacing: 1, padding: "0 6px", marginBottom: 4 }}>METRO LINES</div>
          {lines.map(line => (
            <button key={line} onClick={() => quickQuery(`stations on ${line}`)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "6px 8px", borderRadius: 6,
                background: activeLine === line ? "#f0f4ff" : "transparent",
                border: "none", cursor: "pointer", textAlign: "left",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#f7f8fc"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: LINE_COLORS[line] || "#888",
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 12, color: "#444", fontWeight: 500 }}>{line.replace(" line", "").replace(" Line", "")}</span>
              <span style={{ marginLeft: "auto", fontSize: 10, color: "#bbb" }}>
                {graph.lineGroups[line].length}
              </span>
            </button>
          ))}

          <div style={{ borderTop: "1px solid #f0f0f0", marginTop: 8, paddingTop: 8 }}>
            <div style={{ fontSize: 10, color: "#aaa", fontWeight: 700, letterSpacing: 1, padding: "0 6px", marginBottom: 4 }}>QUICK ASK</div>
            {[
              ["Interchanges", "list interchange stations"],
              ["Count", "how many stations?"],
              ["Lines", "how many lines?"],
            ].map(([label, q]) => (
              <button key={label} onClick={() => quickQuery(q)}
                style={{
                  width: "100%", padding: "6px 8px", borderRadius: 6,
                  background: "transparent", border: "none", cursor: "pointer",
                  textAlign: "left", fontSize: 12, color: "#4c6ef5", fontWeight: 500,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#f0f4ff"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Messages */}
          <div ref={chatRef} style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
          }}>
            {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
          </div>

          {/* Quick suggestions */}
          <div style={{
            padding: "8px 20px 0",
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            borderTop: "1px solid #f0f0f0",
            background: "#fff",
          }}>
            {[
              "Route from Rajiv Chowk to Hauz Khas",
              "Route from AIIMS to Kashmere Gate",
              "Stations on Yellow line",
              "Is Kashmere Gate interchange?",
            ].map(q => (
              <button key={q} onClick={() => quickQuery(q)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 20,
                  border: "1px solid #e0e4f0",
                  background: "#f7f8fc",
                  color: "#555",
                  fontSize: 11,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#eef1ff"; e.currentTarget.style.borderColor = "#748ffc"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f7f8fc"; e.currentTarget.style.borderColor = "#e0e4f0"; }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{
            padding: "12px 20px",
            background: "#fff",
            display: "flex",
            gap: 8,
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask about routes, stations, or lines..."
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                border: "1.5px solid #e0e4f0",
                fontSize: 13,
                outline: "none",
                background: "#fafbff",
                color: "#333",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#748ffc"}
              onBlur={e => e.target.style.borderColor = "#e0e4f0"}
            />
            <button onClick={send}
              style={{
                padding: "10px 18px",
                background: "linear-gradient(135deg, #4c6ef5, #748ffc)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                transition: "opacity 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
