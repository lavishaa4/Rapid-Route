/*
 * ============================================
 *   RAPID ROUTE - Delhi Metro Graph System
 *   C++ Solution using OOP + Graph Algorithms
 * ============================================
 *
 * CLASSES:
 *   Station   - Represents a metro station node
 *   MetroLine - Represents a metro line (edge group)
 *   MetroGraph - Main graph with BFS/Dijkstra algorithms
 *
 * ALGORITHMS USED:
 *   - BFS  : Fewest-stops route
 *   - Dijkstra : Shortest-distance route
 *   - DFS  : Connectivity check
 */

#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include <unordered_map>
#include <map>
#include <set>
#include <queue>
#include <stack>
#include <algorithm>
#include <limits>
#include <regex>

using namespace std;

// ─────────────────────────────────────────────
// CLASS: Station
// Represents a single metro station (graph node)
// ─────────────────────────────────────────────
class Station {
public:
    int id;
    string name;
    string cleanName;       // Name without connection tags
    double distanceFromStart;
    string line;
    vector<string> connections; // Lines this station connects to

    Station() {}
    Station(int id, string name, double dist, string line)
        : id(id), name(name), distanceFromStart(dist), line(line) {
        parseConnections();
    }

    // Parse [Conn: X, Y] from station name
    void parseConnections() {
        cleanName = name;
        regex connRegex("\\[Conn:\\s*([^\\]]+)\\]");
        smatch match;
        if (regex_search(name, match, connRegex)) {
            string connStr = match[1].str();
            stringstream ss(connStr);
            string token;
            while (getline(ss, token, ',')) {
                // trim spaces
                token.erase(0, token.find_first_not_of(" \t"));
                token.erase(token.find_last_not_of(" \t") + 1);
                connections.push_back(token);
            }
            // Remove connection tag from clean name
            cleanName = regex_replace(name, connRegex, "");
            cleanName.erase(cleanName.find_last_not_of(" \t") + 1);
        }
    }

    bool isInterchange() const {
        return !connections.empty();
    }

    void display() const {
        cout << "  [" << line << "] Station " << id << ": " << cleanName;
        cout << " (" << distanceFromStart << " km)";
        if (isInterchange()) {
            cout << " <-> Connects to: ";
            for (auto& c : connections) cout << c << " ";
        }
        cout << endl;
    }
};

// ─────────────────────────────────────────────
// CLASS: Edge
// Weighted graph edge between two stations
// ─────────────────────────────────────────────
struct Edge {
    string to;      // destination station key
    double weight;  // distance in km
    string line;    // which metro line
};

// ─────────────────────────────────────────────
// CLASS: MetroGraph
// Core graph with all algorithms
// ─────────────────────────────────────────────
class MetroGraph {
private:
    // Graph: stationKey -> list of edges
    unordered_map<string, vector<Edge>> adjList;
    // All stations by key (lineName_stationName)
    unordered_map<string, Station> stations;
    // Line-wise station list (ordered)
    map<string, vector<string>> lineStations;

    // Normalize station name for matching
    string normalize(const string& s) {
        string result = s;
        transform(result.begin(), result.end(), result.begin(), ::tolower);
        // remove extra spaces
        result.erase(remove(result.begin(), result.end(), '\r'), result.end());
        return result;
    }

    string stationKey(const string& line, const string& name) {
        return line + "|" + name;
    }

public:
    // ── Load CSV ──────────────────────────────
    void loadCSV(const string& filename) {
        ifstream file(filename);
        if (!file.is_open()) {
            cerr << "Error: Cannot open " << filename << endl;
            return;
        }

        string line;
        getline(file, line); // skip header

        while (getline(file, line)) {
            if (line.empty()) continue;

            // Remove quotes from CSV fields
            string processedLine;
            bool inQuotes = false;
            for (char c : line) {
                if (c == '"') inQuotes = !inQuotes;
                else if (c == ',' && inQuotes) processedLine += '|'; // temp delimiter
                else processedLine += c;
            }

            stringstream ss(processedLine);
            string idStr, name, distStr, metroLine;
            getline(ss, idStr, ',');
            getline(ss, name, ',');
            getline(ss, distStr, ',');
            getline(ss, metroLine);

            // Restore commas in names
            replace(name.begin(), name.end(), '|', ',');
            replace(metroLine.begin(), metroLine.end(), '|', ',');

            // Trim
            auto trim = [](string& s) {
                s.erase(0, s.find_first_not_of(" \t\r\n"));
                s.erase(s.find_last_not_of(" \t\r\n") + 1);
            };
            trim(idStr); trim(name); trim(distStr); trim(metroLine);

            try {
                int id = stoi(idStr);
                double dist = stod(distStr);
                Station st(id, name, dist, metroLine);
                string key = stationKey(metroLine, name);
                stations[key] = st;
                lineStations[metroLine].push_back(key);
            } catch (...) {
                // skip malformed lines
            }
        }

        buildGraph();
        cout << "✓ Loaded " << stations.size() << " stations across "
             << lineStations.size() << " lines." << endl;
    }

    // ── Build Graph ───────────────────────────
    void buildGraph() {
        // 1. Connect consecutive stations on same line
        for (auto& [lineName, stKeys] : lineStations) {
            for (int i = 0; i + 1 < (int)stKeys.size(); i++) {
                auto& a = stations[stKeys[i]];
                auto& b = stations[stKeys[i+1]];
                double w = abs(b.distanceFromStart - a.distanceFromStart);

                adjList[stKeys[i]].push_back({stKeys[i+1], w, lineName});
                adjList[stKeys[i+1]].push_back({stKeys[i], w, lineName});
            }
        }

        // 2. Connect interchange stations across lines
        // Build: cleanName -> list of keys that share this name
        unordered_map<string, vector<string>> byCleanName;
        for (auto& [key, st] : stations) {
            string cn = normalize(st.cleanName);
            byCleanName[cn].push_back(key);
        }

        for (auto& [cn, keys] : byCleanName) {
            if (keys.size() > 1) {
                for (int i = 0; i < (int)keys.size(); i++) {
                    for (int j = i+1; j < (int)keys.size(); j++) {
                        // interchange penalty = 0.1 km (transfer time)
                        adjList[keys[i]].push_back({keys[j], 0.1, "interchange"});
                        adjList[keys[j]].push_back({keys[i], 0.1, "interchange"});
                    }
                }
            }
        }
    }

    // ── Find station key by partial name ──────
    vector<string> findStation(const string& query) {
        string q = normalize(query);
        vector<string> results;
        for (auto& [key, st] : stations) {
            if (normalize(st.cleanName).find(q) != string::npos) {
                results.push_back(key);
            }
        }
        return results;
    }

    // ── BFS: Minimum Stops ────────────────────
    vector<string> bfsMinStops(const string& srcKey, const string& dstKey) {
        unordered_map<string, string> parent;
        queue<string> q;
        set<string> visited;

        q.push(srcKey);
        visited.insert(srcKey);
        parent[srcKey] = "";

        while (!q.empty()) {
            string cur = q.front(); q.pop();
            if (cur == dstKey) break;

            for (auto& edge : adjList[cur]) {
                if (!visited.count(edge.to)) {
                    visited.insert(edge.to);
                    parent[edge.to] = cur;
                    q.push(edge.to);
                }
            }
        }

        // Reconstruct path
        vector<string> path;
        if (!parent.count(dstKey)) return path;
        string cur = dstKey;
        while (cur != "") {
            path.push_back(cur);
            cur = parent[cur];
        }
        reverse(path.begin(), path.end());
        return path;
    }

    // ── Dijkstra: Shortest Distance ───────────
    pair<double, vector<string>> dijkstra(const string& srcKey, const string& dstKey) {
        unordered_map<string, double> dist;
        unordered_map<string, string> parent;
        priority_queue<pair<double,string>, vector<pair<double,string>>, greater<>> pq;

        for (auto& [key, _] : stations) dist[key] = numeric_limits<double>::infinity();
        dist[srcKey] = 0;
        pq.push({0, srcKey});
        parent[srcKey] = "";

        while (!pq.empty()) {
            auto [d, u] = pq.top(); pq.pop();
            if (u == dstKey) break;
            if (d > dist[u]) continue;

            for (auto& edge : adjList[u]) {
                double nd = dist[u] + edge.weight;
                if (nd < dist[edge.to]) {
                    dist[edge.to] = nd;
                    parent[edge.to] = u;
                    pq.push({nd, edge.to});
                }
            }
        }

        vector<string> path;
        if (dist[dstKey] == numeric_limits<double>::infinity()) return {-1, path};

        string cur = dstKey;
        while (cur != "") {
            path.push_back(cur);
            cur = parent[cur];
        }
        reverse(path.begin(), path.end());
        return {dist[dstKey], path};
    }

    // ── DFS: Connectivity Check ───────────────
    bool isConnected(const string& srcKey, const string& dstKey) {
        set<string> visited;
        stack<string> stk;
        stk.push(srcKey);
        while (!stk.empty()) {
            string cur = stk.top(); stk.pop();
            if (cur == dstKey) return true;
            if (visited.count(cur)) continue;
            visited.insert(cur);
            for (auto& edge : adjList[cur]) stk.push(edge.to);
        }
        return false;
    }

    // ── Display Route ─────────────────────────
    void displayRoute(const vector<string>& path) {
        if (path.empty()) { cout << "  No route found!\n"; return; }
        string prevLine = "";
        for (int i = 0; i < (int)path.size(); i++) {
            auto& st = stations[path[i]];
            if (st.line != prevLine) {
                cout << "\n  ══ " << st.line << " ══\n";
                prevLine = st.line;
            }
            cout << "  " << (i+1) << ". " << st.cleanName;
            if (st.isInterchange()) cout << " ★ INTERCHANGE";
            cout << "\n";
        }
        cout << "\n  Total stops: " << path.size() << "\n";
    }

    // ── List all lines ────────────────────────
    void listLines() {
        cout << "\n📍 Delhi Metro Lines:\n";
        for (auto& [line, keys] : lineStations) {
            cout << "  • " << line << " (" << keys.size() << " stations)\n";
        }
    }

    // ── Line info ─────────────────────────────
    void showLineInfo(const string& lineName) {
        if (!lineStations.count(lineName)) {
            cout << "Line not found.\n"; return;
        }
        cout << "\n📍 " << lineName << ":\n";
        for (auto& key : lineStations[lineName]) {
            stations[key].display();
        }
    }

    // Export route as JSON for Python/React
    string routeToJSON(const vector<string>& path, double totalDist) {
        string json = "{\"route\":[";
        for (int i = 0; i < (int)path.size(); i++) {
            auto& st = stations[path[i]];
            if (i > 0) json += ",";
            json += "{\"name\":\"" + st.cleanName + "\","
                  + "\"line\":\"" + st.line + "\","
                  + "\"interchange\":" + (st.isInterchange() ? "true" : "false") + "}";
        }
        json += "],\"totalKm\":" + to_string(totalDist)
              + ",\"stops\":" + to_string(path.size()) + "}";
        return json;
    }
};

// ─────────────────────────────────────────────
// MAIN: Interactive Demo
// ─────────────────────────────────────────────
int main() {
    cout << "╔══════════════════════════════════════╗\n";
    cout << "║      RAPID ROUTE - Delhi Metro       ║\n";
    cout << "║        C++ Graph Engine              ║\n";
    cout << "╚══════════════════════════════════════╝\n\n";

    MetroGraph graph;
    graph.loadCSV("metro_filtered.csv");
    graph.listLines();

    // Demo: Find route from Rajiv Chowk to Hauz Khas
    cout << "\n🔍 Demo: Rajiv Chowk → Hauz Khas\n";
    auto srcList = graph.findStation("Rajiv Chowk");
    auto dstList = graph.findStation("Hauz Khas");

    if (!srcList.empty() && !dstList.empty()) {
        string src = srcList[0];
        string dst = dstList[0];

        cout << "\n[BFS] Minimum Stops Route:\n";
        auto bfsPath = graph.bfsMinStops(src, dst);
        graph.displayRoute(bfsPath);

        cout << "\n[Dijkstra] Shortest Distance Route:\n";
        auto [dist, dijPath] = graph.dijkstra(src, dst);
        graph.displayRoute(dijPath);
        printf("  Total distance: %.2f km\n", dist);

        cout << "\n[DFS] Connectivity: "
             << (graph.isConnected(src, dst) ? "CONNECTED ✓" : "NOT CONNECTED ✗")
             << "\n";
    }

    cout << "\n✅ C++ Engine ready. Use Python chatbot for queries.\n";
    return 0;
}
