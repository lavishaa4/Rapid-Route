#include "Graph.h"
#include <queue>
#include <iostream>
#include <algorithm>
using namespace std;

void Graph::addEdge(string u, string v, double w) {
    adj[u].push_back({v, w});
    adj[v].push_back({u, w});
}

void Graph::shortestPath(string src, string dest) {
    unordered_map<string, double> dist;
    unordered_map<string, string> parent;

    for (auto &p : adj)
        dist[p.first] = 1e9;

    priority_queue<pair<double,string>,
        vector<pair<double,string>>, greater<>> pq;

    dist[src] = 0;
    pq.push({0, src});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        for (auto &edge : adj[u]) {
            string v = edge.first;
            double w = edge.second;

            if (dist[v] > d + w) {
                dist[v] = d + w;
                parent[v] = u;
                pq.push({dist[v], v});
            }
        }
    }

    vector<string> path;
    for (string at = dest; at != ""; at = parent[at])
        path.push_back(at);

    reverse(path.begin(), path.end());

    cout << "Route:\n";
    for (auto &s : path)
        cout << s << " -> ";
    cout << "\nTotal Distance: " << dist[dest] << " km\n";
}
