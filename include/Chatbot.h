#ifndef CHATBOT_H
#define CHATBOT_H

#include "Graph.h"
#include "Station.h"
#include <unordered_map>
using namespace std;

class Chatbot {
private:
    Graph graph;
    unordered_map<string, Station> stations;
    unordered_map<string, vector<string>> lineStations;

public:
    void loadCSV(string filename);
    void buildGraph();
    void start();
};

#endif
