#include "Station.h"
using namespace std;

Station::Station() {}

Station::Station(int i, string n, string l, double d) {
    id = i;
    name = n;
    line = l;
    dist = d;
}
