# 🚇 Rapid Route — Delhi Metro Navigator

A beginner-level project that analyzes Delhi Metro connectivity using **C++ (Graph Algorithms)**, a **Python Chatbot**, and a **React UI**.

---

## 📁 Project Structure

```
RapidRoute/
├── metro_graph.cpp       # C++ graph engine (OOP + BFS/Dijkstra/DFS)
├── metro_chatbot.py      # Python chatbot (keyword-driven query handler)
├── RapidRoute.jsx        # React frontend (interactive chat UI)
└── metro_filtered.csv    # Delhi Metro dataset (286 stations, 11 lines)
```

---

## 🧩 Components

### 1. C++ — Graph Engine (`metro_graph.cpp`)

Built using **OOP principles** and **graph algorithms** to model the Delhi Metro network.

**Classes:**
- `Station` — represents a metro station node (parses interchange connections using `std::regex`)
- `Edge` — weighted connection between two stations
- `MetroGraph` — core graph engine with all algorithms

**Algorithms:**

| Algorithm | Purpose |
|-----------|---------|
| BFS | Find route with fewest stops |
| Dijkstra | Find shortest distance route |
| DFS | Check if two stations are connected |

**Graph construction:**
- Consecutive stations on the same line are connected with edges weighted by distance (km)
- Interchange stations (e.g. Kashmere Gate, Rajiv Chowk) are connected across lines with a small transfer penalty

**How to compile and run:**
```bash
g++ -std=c++17 metro_graph.cpp -o metro_graph
./metro_graph
```
> Make sure `metro_filtered.csv` is in the same folder.

---

### 2. Python — Chatbot (`metro_chatbot.py`)

Processes **100+ user queries** using keyword-driven logic and structured CSV parsing.

**Classes:**
- `Station` — parses station data including `[Conn: X]` interchange tags
- `MetroGraph` — Python graph with BFS + Dijkstra
- `MetroChatbot` — matches user queries to intents using regex patterns

**Supported query types:**
- `Route from [A] to [B]`
- `Which line is [station] on?`
- `Show stations on Red line`
- `Is [station] an interchange?`
- `How many stations / lines?`
- `Distance from [A] to [B]`
- `List all interchange stations`

**How to run:**
```bash
python metro_chatbot.py
```
> Make sure `metro_filtered.csv` is in the same folder.

**Interactive mode** starts after the demo queries — type any question and get an instant answer.

---

### 3. React — Frontend UI (`RapidRoute.jsx`)

A clean, light-themed chat interface to interact with the metro data.

**Features:**
- Chat-style interface with bot and user message bubbles
- Left sidebar showing all metro lines (clickable)
- Route results grouped by line with color coding
- Interchange stations highlighted with ★
- Quick suggestion chips for common queries
- Dijkstra pathfinding running directly in the browser

**Metro lines supported:**

| Line | Color |
|------|-------|
| Red Line | 🔴 |
| Yellow Line | 🟡 |
| Blue Line | 🔵 |
| Green Line | 🟢 |
| Violet Line | 🟣 |
| Pink Line | 🩷 |
| Magenta Line | 🟪 |
| Orange Line | 🟠 |
| Gray Line | ⚫ |
| Aqua Line | 🩵 |
| Rapid Metro | 🟦 |

> The React component has metro data embedded directly — it does not read the CSV file at runtime. This is intentional since browsers cannot access local files without a backend.

**How to run** (inside a React project):
```bash
# Copy RapidRoute.jsx into your src/ folder
npm install
npm start
```
Or paste directly into [StackBlitz](https://stackblitz.com) or [CodeSandbox](https://codesandbox.io).

---

## 📊 Dataset — `metro_filtered.csv`

| Column | Description |
|--------|-------------|
| `Station_ID` | Sequential ID within each line |
| `Station_Name` | Station name (includes `[Conn: X]` interchange tags) |
| `Distance_km` | Cumulative distance from the first station on that line |
| `Metro_Line` | Name of the metro line |

**Coverage:** 286 station entries across 11 metro lines including Red, Yellow, Blue, Green, Violet, Pink, Magenta, Orange, Gray, Aqua, and Rapid Metro.

---

## 🔗 How the Components Connect

```
User query
    │
    ▼
React UI  ──────────────────────►  Displays route / info
    │         (JS graph, browser)
    │
    │  [In a full-stack setup]
    ▼
Python Chatbot  ────────────────►  Parses query, finds route
    │           (Flask API)
    ▼
C++ Engine  ────────────────────►  Runs BFS / Dijkstra
              (subprocess call)
```

For this beginner project, each component runs independently. The React app handles queries in-browser; the Python and C++ files run standalone from the terminal.

---

## 🛠️ Requirements

| Component | Requirement |
|-----------|------------|
| C++ | g++ with C++17 support |
| Python | Python 3.7+ (no external libraries needed) |
| React | Node.js 16+, any React 17/18 setup |

---

## 💡 Sample Queries to Try

```
Route from Rajiv Chowk to Hauz Khas
Route from AIIMS to Kashmere Gate
Stations on Red line
Is Kashmere Gate an interchange?
How many stations?
Distance from Dwarka to Noida City Center
List all interchange stations
```

---

## 👩‍💻 Built With

- **C++17** — OOP, STL, regex, graph algorithms
- **Python 3** — csv module, collections, heapq, re
- **React 18** — useState, useEffect, useRef
- **Tailwind CSS** — utility-class styling (inline styles in JSX)

---

*Beginner project — Delhi Metro route analysis using data structures and algorithms.*
