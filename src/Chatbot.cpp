#include "Chatbot.h"
#include <fstream>
#include <sstream>
#include <iostream>
#include <algorithm>
using namespace std;

void Chatbot::loadCSV(string filename) {
    ifstream file(filename);
    if (!file.is_open()) {
        cout << "Error opening file\n";
        return;
    }
    string line;
    getline(file, line); // skip header

    while (getline(file, line)) {
        if (line.empty()) continue;

        stringstream ss(line);
        string id, name, dist, metroLine;

        getline(ss, id, ',');
        getline(ss, name, ',');
        getline(ss, dist, ',');
        getline(ss, metroLine, ',');

        // Trim carriage return (important on macOS)
        if (!dist.empty() && dist.back() == '\r')
            dist.pop_back();

        // Validate before conversion
        if (id.empty() || name.empty() || dist.empty() || metroLine.empty())
            continue;

        try {
            int stationId = stoi(id);

            double distance = stod(dist);

            stations[name] = Station(stationId, name, metroLine, distance);
            lineStations[metroLine].push_back(name);
        }
        catch (const exception &e) {
            cout << "Skipping bad row: " << line << endl;
        }
    }

    file.close();
}

void Chatbot::buildGraph() {
    // Step 2a: connect consecutive stations on the same line
for (auto &entry : lineStations) {
    auto &vec = entry.second;
    sort(vec.begin(), vec.end(), [&](string a, string b){
        return stations[a].dist < stations[b].dist;
    });
    for (int i = 1; i < vec.size(); i++)
        graph.addEdge(vec[i-1], vec[i], abs(stations[vec[i-1]].dist - stations[vec[i]].dist));
}

// Step 2b: connect interchanges (stations on multiple lines)
unordered_map<string, vector<string>> lineMap;
for (auto &entry : lineStations)
    for (string s : entry.second)
        lineMap[s].push_back(entry.first);

for (auto &p : lineMap) {
    if (p.second.size() > 1) { // interchange station
        string station = p.first;
        // connect to itself (or small distance) for each line it belongs to
        for (auto &line : p.second) {
            for (auto &otherLine : p.second) {
                if (line != otherLine)
                    graph.addEdge(station, station, 0); // zero distance to switch lines
            }
        }
    }
}

}

void Chatbot::start() {
    string query;
    cout << "Rapid Route is ready! Type 'exit' to quit.\n";

    while (true) {
        getline(cin, query);

        if (query == "exit") break;

        if (query.find("route") != string::npos) {
            string src, dest;
            cout << "Enter source station: ";
            getline(cin, src);
            cout << "Enter destination station: ";
            getline(cin, dest);
            graph.shortestPath(src, dest);
        }
        else {
            cout << "I can help with route queries.\n";
        }
    }
}
