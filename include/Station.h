#ifndef STATION_H
#define STATION_H

#include <string>
using namespace std;

class Station {
public:
    int id;
    string name;
    string line;
    double dist;

    Station();
    Station(int i, string n, string l, double d);
};

#endif
