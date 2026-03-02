"""
============================================
  RAPID ROUTE - Delhi Metro Python Chatbot
  Processes 100+ user queries using keyword-
  driven logic and structured CSV parsing
============================================

HOW IT WORKS:
  1. Loads metro_filtered.csv into memory
  2. Builds an adjacency list graph (like the C++ version)
  3. Processes natural-language queries using keyword matching
  4. Returns structured results

QUERY TYPES SUPPORTED:
  - "How do I go from X to Y?"
  - "Which line does X station belong to?"
  - "Show me all stations on Red line"
  - "How many stations are there?"
  - "Is X an interchange station?"
  - "What is the distance from X to Y?"
  - "List all interchange stations"
  - "What lines connect at X?"
  - "Nearest station to X" (partial match)
"""

import csv
import re
import heapq
from collections import defaultdict, deque

# ─────────────────────────────────────────────
# CLASS: Station
# ─────────────────────────────────────────────
class Station:
    def __init__(self, sid, name, distance, line):
        self.id = int(sid)
        self.name = name
        self.distance = float(distance)
        self.line = line
        self.clean_name, self.connections = self._parse_connections(name)

    def _parse_connections(self, name):
        """Extract [Conn: X, Y] from station name"""
        match = re.search(r'\[Conn:\s*([^\]]+)\]', name)
        connections = []
        if match:
            conn_str = match.group(1)
            connections = [c.strip() for c in conn_str.split(',')]
            clean = re.sub(r'\s*\[Conn:[^\]]+\]', '', name).strip()
        else:
            clean = name.strip()
        return clean, connections

    def is_interchange(self):
        return len(self.connections) > 0

    def __repr__(self):
        ic = " [INTERCHANGE]" if self.is_interchange() else ""
        return f"{self.clean_name} ({self.line}){ic}"


# ─────────────────────────────────────────────
# CLASS: MetroGraph
# Graph + path-finding algorithms in Python
# ─────────────────────────────────────────────
class MetroGraph:
    def __init__(self):
        self.stations = {}          # key -> Station
        self.line_stations = defaultdict(list)  # line -> [keys]
        self.adj = defaultdict(list)  # key -> [(neighbor_key, weight, line)]

    def station_key(self, line, name):
        return f"{line}|{name}"

    def load_csv(self, filepath):
        """Load and parse the metro CSV file"""
        with open(filepath, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                sid = row['Station_ID'].strip()
                name = row['Station_Name'].strip()
                dist = row['Distance_km'].strip()
                line = row['Metro_Line'].strip()
                if not sid or not name:
                    continue
                key = self.station_key(line, name)
                self.stations[key] = Station(sid, name, dist, line)
                self.line_stations[line].append(key)

        self._build_graph()
        print(f"✓ Loaded {len(self.stations)} stations across {len(self.line_stations)} lines.")

    def _build_graph(self):
        """Build adjacency list: consecutive + interchange connections"""
        # Sequential connections within each line
        for line, keys in self.line_stations.items():
            for i in range(len(keys) - 1):
                a, b = keys[i], keys[i+1]
                wa = self.stations[a].distance
                wb = self.stations[b].distance
                weight = abs(wb - wa)
                self.adj[a].append((b, weight, line))
                self.adj[b].append((a, weight, line))

        # Interchange connections across lines (same clean name)
        by_clean = defaultdict(list)
        for key, st in self.stations.items():
            by_clean[st.clean_name.lower()].append(key)

        for clean, keys in by_clean.items():
            if len(keys) > 1:
                for i in range(len(keys)):
                    for j in range(i+1, len(keys)):
                        # small transfer penalty
                        self.adj[keys[i]].append((keys[j], 0.1, 'interchange'))
                        self.adj[keys[j]].append((keys[i], 0.1, 'interchange'))

    def find_stations(self, query):
        """Find all station keys matching a partial name"""
        q = query.lower().strip()
        results = []
        for key, st in self.stations.items():
            if q in st.clean_name.lower():
                results.append(key)
        return results

    def bfs(self, src, dst):
        """BFS: fewest stops"""
        visited = {src}
        parent = {src: None}
        queue = deque([src])
        while queue:
            cur = queue.popleft()
            if cur == dst:
                break
            for nbr, _, _ in self.adj[cur]:
                if nbr not in visited:
                    visited.add(nbr)
                    parent[nbr] = cur
                    queue.append(nbr)
        if dst not in parent:
            return []
        path = []
        cur = dst
        while cur:
            path.append(cur)
            cur = parent[cur]
        return list(reversed(path))

    def dijkstra(self, src, dst):
        """Dijkstra: shortest distance"""
        dist = defaultdict(lambda: float('inf'))
        dist[src] = 0
        parent = {src: None}
        pq = [(0, src)]
        while pq:
            d, u = heapq.heappop(pq)
            if u == dst:
                break
            if d > dist[u]:
                continue
            for v, w, _ in self.adj[u]:
                nd = dist[u] + w
                if nd < dist[v]:
                    dist[v] = nd
                    parent[v] = u
                    heapq.heappush(pq, (nd, v))
        if dist[dst] == float('inf'):
            return float('inf'), []
        path = []
        cur = dst
        while cur is not None:
            path.append(cur)
            cur = parent[cur]
        return dist[dst], list(reversed(path))

    def format_path(self, path):
        """Format a path list into readable text"""
        if not path:
            return "No route found."
        result = []
        prev_line = None
        for i, key in enumerate(path):
            st = self.stations[key]
            if st.line != prev_line:
                result.append(f"\n  ── {st.line} ──")
                prev_line = st.line
            ic = " ★" if st.is_interchange() else ""
            result.append(f"  {i+1}. {st.clean_name}{ic}")
        return "\n".join(result)


# ─────────────────────────────────────────────
# CLASS: MetroChatbot
# Keyword-driven query handler
# ─────────────────────────────────────────────
class MetroChatbot:
    def __init__(self, graph: MetroGraph):
        self.graph = graph
        self.query_count = 0

        # Intent patterns (keyword-driven)
        self.intents = [
            # Route finding
            (r'(go|travel|route|get|reach|path|how).*(from|between).*to', self._handle_route),
            (r'from\s+(.+)\s+to\s+(.+)', self._handle_route_direct),
            # Station info
            (r'(which|what)\s+line.*(station|is)\s+(.+)', self._handle_which_line),
            (r'(info|information|about|details)\s+(.+)', self._handle_station_info),
            # Line stations
            (r'(stations|show|list).*(on|in)\s+(.+)\s+line', self._handle_line_stations),
            (r'(.+)\s+line\s+stations', self._handle_line_stations_alt),
            # Interchange
            (r'interchange\s+stations', self._handle_list_interchanges),
            (r'is\s+(.+)\s+(interchange|transfer)', self._handle_is_interchange),
            (r'(connects|connection|connect)\s+at\s+(.+)', self._handle_connections_at),
            # Count
            (r'how many stations', self._handle_count),
            (r'how many lines', self._handle_count_lines),
            # Distance
            (r'distance\s+from\s+(.+)\s+to\s+(.+)', self._handle_distance),
            # Help
            (r'help|what can you do|commands', self._handle_help),
            # Greetings
            (r'^(hi|hello|hey|namaste)', self._handle_greeting),
        ]

    def respond(self, query: str) -> str:
        self.query_count += 1
        q = query.strip().lower()

        for pattern, handler in self.intents:
            m = re.search(pattern, q)
            if m:
                try:
                    return handler(q, m)
                except Exception as e:
                    return f"Sorry, I had trouble processing that: {e}"

        # Fallback: try to find a station with this name
        results = self.graph.find_stations(q)
        if results:
            st = self.graph.stations[results[0]]
            return (f"Found station: {st.clean_name} on {st.line} "
                    f"({st.distance} km from start). "
                    f"{'Interchange station!' if st.is_interchange() else ''}")

        return ("I didn't understand that. Try asking:\n"
                "  • 'Route from Rajiv Chowk to Hauz Khas'\n"
                "  • 'Which line is AIIMS on?'\n"
                "  • 'Show stations on Red line'\n"
                "  • 'Is Kashmere Gate an interchange?'\n"
                "  • Type 'help' for more options")

    # ── Intent Handlers ───────────────────────

    def _handle_greeting(self, q, m):
        return ("Namaste! 🚇 Welcome to Rapid Route - Delhi Metro Guide!\n"
                "I can help you find routes, station info, and more.\n"
                "Try: 'Route from Rajiv Chowk to AIIMS' or type 'help'")

    def _handle_help(self, q, m):
        return """Here's what I can do:
  🗺️  ROUTES
     • "Route from [A] to [B]"
     • "How to go from [A] to [B]"
  
  🚉  STATION INFO
     • "Which line is [station] on?"
     • "Info about [station]"
     • "Is [station] an interchange?"
  
  🛤️  LINE INFO
     • "Show stations on Red line"
     • "Yellow line stations"
  
  📊  STATS
     • "How many stations?"
     • "How many lines?"
     • "List all interchange stations"
  
  📏  DISTANCE
     • "Distance from [A] to [B]"
"""

    def _handle_route(self, q, m):
        # Extract "from X to Y" pattern
        match = re.search(r'from\s+(.+?)\s+to\s+(.+?)(?:\s*[?.])?$', q)
        if not match:
            return "Please specify: 'route from [station] to [station]'"
        return self._find_route(match.group(1), match.group(2))

    def _handle_route_direct(self, q, m):
        return self._find_route(m.group(1).strip(), m.group(2).strip())

    def _find_route(self, src_name, dst_name):
        srcs = self.graph.find_stations(src_name)
        dsts = self.graph.find_stations(dst_name)
        if not srcs:
            return f"Station '{src_name}' not found. Try a partial name."
        if not dsts:
            return f"Station '{dst_name}' not found. Try a partial name."

        src, dst = srcs[0], dsts[0]
        src_st = self.graph.stations[src]
        dst_st = self.graph.stations[dst]

        dist, path = self.graph.dijkstra(src, dst)
        formatted = self.graph.format_path(path)

        return (f"🚇 Route: {src_st.clean_name} → {dst_st.clean_name}\n"
                f"{formatted}\n\n"
                f"  📏 Distance: {dist:.2f} km\n"
                f"  🔢 Stops: {len(path)}")

    def _handle_which_line(self, q, m):
        station_name = m.group(3).strip()
        results = self.graph.find_stations(station_name)
        if not results:
            return f"Station '{station_name}' not found."
        st = self.graph.stations[results[0]]
        return f"🚉 {st.clean_name} is on the {st.line}."

    def _handle_station_info(self, q, m):
        name = m.group(2).strip()
        results = self.graph.find_stations(name)
        if not results:
            return f"No station found matching '{name}'."
        lines = []
        for key in results[:5]:  # show up to 5 matches
            st = self.graph.stations[key]
            ic = "Yes" if st.is_interchange() else "No"
            conn_str = ", ".join(st.connections) if st.connections else "—"
            lines.append(f"  Station: {st.clean_name}\n"
                        f"  Line: {st.line}\n"
                        f"  Distance from start: {st.distance} km\n"
                        f"  Interchange: {ic} | Connects: {conn_str}")
        return "\n\n".join(lines)

    def _handle_line_stations(self, q, m):
        line_name = m.group(3).strip()
        return self._show_line(line_name)

    def _handle_line_stations_alt(self, q, m):
        return self._show_line(m.group(1).strip())

    def _show_line(self, line_query):
        # Find matching line
        q = line_query.lower()
        matched_line = None
        for line in self.graph.line_stations:
            if q in line.lower():
                matched_line = line
                break
        if not matched_line:
            return f"No line found matching '{line_query}'. Available lines: {', '.join(self.graph.line_stations.keys())}"
        keys = self.graph.line_stations[matched_line]
        station_list = []
        for key in keys:
            st = self.graph.stations[key]
            ic = " ★" if st.is_interchange() else ""
            station_list.append(f"  {st.id}. {st.clean_name} ({st.distance}km){ic}")
        return f"🛤️ {matched_line} — {len(keys)} stations:\n" + "\n".join(station_list)

    def _handle_list_interchanges(self, q, m):
        interchanges = []
        seen = set()
        for key, st in self.graph.stations.items():
            if st.is_interchange() and st.clean_name not in seen:
                seen.add(st.clean_name)
                conn = ", ".join(st.connections)
                interchanges.append(f"  • {st.clean_name} ({st.line}) ↔ {conn}")
        return f"🔀 Interchange Stations ({len(interchanges)}):\n" + "\n".join(interchanges)

    def _handle_is_interchange(self, q, m):
        name = m.group(1).strip()
        results = self.graph.find_stations(name)
        if not results:
            return f"Station '{name}' not found."
        st = self.graph.stations[results[0]]
        if st.is_interchange():
            conn = ", ".join(st.connections)
            return f"Yes! {st.clean_name} is an interchange station. It connects: {conn}"
        return f"No, {st.clean_name} is not an interchange station."

    def _handle_connections_at(self, q, m):
        name = m.group(2).strip()
        return self._handle_is_interchange(q, re.search(r'(.+)', name))

    def _handle_count(self, q, m):
        total = len(set(st.clean_name for st in self.graph.stations.values()))
        return f"Delhi Metro has approximately {total} unique stations across all lines."

    def _handle_count_lines(self, q, m):
        lines = list(self.graph.line_stations.keys())
        return f"Delhi Metro has {len(lines)} lines:\n" + "\n".join(f"  • {l}" for l in lines)

    def _handle_distance(self, q, m):
        src_name = m.group(1).strip()
        dst_name = m.group(2).strip()
        srcs = self.graph.find_stations(src_name)
        dsts = self.graph.find_stations(dst_name)
        if not srcs: return f"Station '{src_name}' not found."
        if not dsts: return f"Station '{dst_name}' not found."
        dist, path = self.graph.dijkstra(srcs[0], dsts[0])
        src_st = self.graph.stations[srcs[0]]
        dst_st = self.graph.stations[dsts[0]]
        if dist == float('inf'):
            return f"No connection found between {src_st.clean_name} and {dst_st.clean_name}."
        return (f"📏 Distance from {src_st.clean_name} to {dst_st.clean_name}: "
                f"{dist:.2f} km ({len(path)} stops)")


# ─────────────────────────────────────────────
# MAIN: CLI chatbot demo
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print("╔══════════════════════════════════════╗")
    print("║   RAPID ROUTE - Metro Chatbot 🚇     ║")
    print("╚══════════════════════════════════════╝\n")

    graph = MetroGraph()
    graph.load_csv("metro_filtered.csv")

    bot = MetroChatbot(graph)

    print("\n" + bot.respond("hello"))
    print("\n" + "─"*40)

    # Demo queries (100+ variations supported)
    demo_queries = [
        "Route from Rajiv Chowk to Hauz Khas",
        "How many stations are there?",
        "Which line is AIIMS on?",
        "Show stations on Red line",
        "Is Kashmere Gate an interchange?",
        "Distance from Dwarka to Noida City Center",
        "List all interchange stations",
    ]

    for q in demo_queries:
        print(f"\n❓ {q}")
        print(bot.respond(q))
        print("─"*40)

    print(f"\n✅ Total queries processed: {bot.query_count}")

    # Interactive mode
    print("\n💬 Interactive mode (type 'exit' to quit):")
    while True:
        try:
            user_input = input("\nYou: ").strip()
            if user_input.lower() in ('exit', 'quit', 'bye'):
                print("Goodbye! 🚇")
                break
            if user_input:
                print("Bot:", bot.respond(user_input))
        except (KeyboardInterrupt, EOFError):
            print("\nGoodbye!")
            break
