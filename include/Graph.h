#ifndef GRAPH_H
#define GRAPH_H

#include <unordered_map>
#include <vector>
#include <string>
using namespace std;

class Graph {
public:
    unordered_map<string, vector<pair<string,double>>> adj;

    void addEdge(string u, string v, double w);
    void shortestPath(string src, string dest);
};

#endif
